import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { ok, err, unauthorized, serverError } from "@/lib/api";
import { requireAuth } from "@/lib/session";

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".pdf"]);
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB limit

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce Server-Side Authentication
    const auth = await requireAuth();
    if (!auth) {
      return unauthorized();
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "certificates";

    if (!file) {
      return err("No file provided in form data.", 400);
    }

    // 2. Enforce File Size Limit
    if (file.size > MAX_FILE_SIZE) {
      return err("File exceeds maximum allowed size (15MB).", 400);
    }

    // 3. Enforce MIME Type & Extension Whitelist
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return err("Invalid file type. Only PDF and image formats (PNG, JPG, WEBP) are permitted.", 400);
    }

    if (!ALLOWED_MIME_TYPES.has(file.type) && file.type !== "") {
      return err("Unsupported MIME type.", 400);
    }

    // 4. Validate Destination Directory
    const validFolders = ["certificates", "resumes", "photos"];
    const targetFolder = validFolders.includes(folder) ? folder : "certificates";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename to prevent directory traversal
    const baseClean = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const safeName = `${Date.now()}-${baseClean}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", targetFolder);
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, safeName);
    await writeFile(filePath, buffer);

    return ok({
      url: `/uploads/${targetFolder}/${safeName}`,
      filename: safeName,
      size: file.size,
      type: file.type,
    });
  } catch (e) {
    return serverError(e);
  }
}
