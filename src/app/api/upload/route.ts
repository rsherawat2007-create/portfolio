import { NextRequest } from "next/server";
import { ok, err, unauthorized, serverError } from "@/lib/api";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadFile, MAX_FILE_SIZE } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce Server-Side Authentication
    const session = await requireAuth();
    if (!session) {
      return unauthorized();
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "certificates";
    const projectId = (formData.get("projectId") as string) || undefined;
    const certificateId = (formData.get("certificateId") as string) || undefined;

    if (!file) {
      return err("No file provided in form data.", 400);
    }

    // 2. Enforce File Size Limit
    if (file.size > MAX_FILE_SIZE) {
      return err(`File exceeds maximum allowed size (${MAX_FILE_SIZE / (1024 * 1024)}MB).`, 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Upload to Persistent Storage (Vercel Blob in prod, local in dev)
    const uploadResult = await uploadFile(buffer, file.name, folder);

    // 4. Persist Record to Prisma FileAttachment
    let fileRecord;
    try {
      fileRecord = await prisma.fileAttachment.create({
        data: {
          userId: session.id,
          filename: uploadResult.filename,
          originalName: file.name,
          mimeType: uploadResult.mimeType,
          size: uploadResult.size,
          storagePath: uploadResult.url,
          projectId: projectId || null,
          certificateId: certificateId || null,
        },
      });
    } catch {
      // If relationship IDs are invalid or table not migrated yet, continue without failure
      fileRecord = null;
    }

    return ok({
      url: uploadResult.url,
      filename: uploadResult.filename,
      size: uploadResult.size,
      mimeType: uploadResult.mimeType,
      storageProvider: uploadResult.storageProvider,
      id: fileRecord?.id || null,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "File upload failed";
    if (message.includes("signature mismatch") || message.includes("Unsupported file extension")) {
      return err(message, 400);
    }
    return serverError(e);
  }
}
