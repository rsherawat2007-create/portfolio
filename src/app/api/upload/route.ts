import { NextRequest } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { ok, err, serverError } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "certificates";

    if (!file) {
      return err("No file provided in form data.", 400);
    }

    // Validate mime type
    const validFolders = ["certificates", "resumes", "photos"];
    const targetFolder = validFolders.includes(folder) ? folder : "certificates";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", targetFolder);
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
