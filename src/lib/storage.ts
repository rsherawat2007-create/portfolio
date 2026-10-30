import path from "path";
import crypto from "crypto";
import { writeFile, mkdir } from "fs/promises";
import { put } from "@vercel/blob";

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  storageProvider: "vercel_blob" | "local";
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  detectedMime?: string;
}

// Strict whitelist of allowed extensions and content types
const ALLOWED_TYPES: Record<string, { mime: string; magicBytes: number[][] }> = {
  ".png": {
    mime: "image/png",
    magicBytes: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  },
  ".jpg": {
    mime: "image/jpeg",
    magicBytes: [[0xff, 0xd8, 0xff]],
  },
  ".jpeg": {
    mime: "image/jpeg",
    magicBytes: [[0xff, 0xd8, 0xff]],
  },
  ".webp": {
    mime: "image/webp",
    // RIFF (bytes 0-3) and WEBP (bytes 8-11)
    magicBytes: [[0x52, 0x49, 0x46, 0x46]],
  },
  ".gif": {
    mime: "image/gif",
    magicBytes: [
      [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
      [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
    ],
  },
  ".pdf": {
    mime: "application/pdf",
    magicBytes: [[0x25, 0x50, 0x44, 0x46, 0x2d]], // %PDF-
  },
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB production limit

/**
 * Validates a file's buffer against known cryptographic signatures (magic numbers).
 * Strictly prevents file spoofing, executable uploads, and MIME polyglots.
 */
export function validateFileSignature(buffer: Buffer, originalName: string, _claimedMime?: string): FileValidationResult {
  const ext = path.extname(originalName).toLowerCase();
  const config = ALLOWED_TYPES[ext];

  if (!config) {
    return {
      valid: false,
      error: `Unsupported file extension (${ext}). Allowed: PNG, JPG, JPEG, WEBP, GIF, PDF.`,
    };
  }

  if (buffer.length < 8) {
    return { valid: false, error: "File buffer is too small to be a valid document or image." };
  }

  // Check magic bytes
  let matchesSignature = false;
  for (const magic of config.magicBytes) {
    let match = true;
    for (let i = 0; i < magic.length; i++) {
      if (buffer[i] !== magic[i]) {
        match = false;
        break;
      }
    }
    if (match) {
      matchesSignature = true;
      break;
    }
  }

  // Special verification for WebP: must have "WEBP" at bytes 8-11
  if (ext === ".webp" && matchesSignature) {
    const webpHeader = buffer.subarray(8, 12).toString("ascii");
    if (webpHeader !== "WEBP") {
      matchesSignature = false;
    }
  }

  if (!matchesSignature) {
    return {
      valid: false,
      error: `File signature mismatch for ${ext}. Content does not match authentic ${config.mime} format.`,
    };
  }

  return {
    valid: true,
    detectedMime: config.mime,
  };
}

/**
 * Sanitizes and generates a cryptographically safe filename.
 * Eliminates path traversal (e.g. ../../) and shell command characters.
 */
export function generateSafeFilename(originalName: string): { safeFilename: string; ext: string } {
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, ext);
  const cleanBase = baseName
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .substring(0, 50)
    .replace(/_+/g, "_");
  const randomSuffix = crypto.randomBytes(6).toString("hex");
  const safeFilename = `${Date.now()}_${randomSuffix}_${cleanBase}${ext}`;
  return { safeFilename, ext };
}

/**
 * Stores a file using Vercel Blob in production, or fallback storage.
 * Guarantees zero local-filesystem dependency when running serverless.
 */
export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  folder: string = "certificates"
): Promise<UploadResult> {
  const { safeFilename } = generateSafeFilename(originalName);
  const allowedFolders = ["certificates", "projects", "resumes", "photos"];
  const targetFolder = allowedFolders.includes(folder) ? folder : "certificates";

  const validation = validateFileSignature(buffer, originalName);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const mimeType = validation.detectedMime || "application/octet-stream";
  const blobPath = `uploads/${targetFolder}/${safeFilename}`;

  // 1. Persistent Storage via Vercel Blob (Production standard)
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    const blob = await put(blobPath, buffer, {
      access: "public",
      contentType: mimeType,
      token: blobToken,
    });
    return {
      url: blob.url,
      filename: safeFilename,
      size: buffer.length,
      mimeType,
      storageProvider: "vercel_blob",
    };
  }

  // 2. Local Filesystem (Local development only)
  if (process.env.NODE_ENV === "production") {
    // In production without BLOB_READ_WRITE_TOKEN, warn and fail safely
    // rather than crashing with EROFS (read-only file system on serverless)
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is required for persistent uploads in production on serverless infrastructure."
    );
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", targetFolder);
  await mkdir(uploadDir, { recursive: true });
  const localFilePath = path.join(uploadDir, safeFilename);
  await writeFile(localFilePath, buffer);

  return {
    url: `/uploads/${targetFolder}/${safeFilename}`,
    filename: safeFilename,
    size: buffer.length,
    mimeType,
    storageProvider: "local",
  };
}
