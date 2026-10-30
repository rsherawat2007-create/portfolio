import { NextResponse } from "next/server";

export type ApiResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

export function ok<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data });
}

export function err(
  message: string,
  status = 400,
  details?: unknown
): NextResponse<ApiResponse<never>> {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

export function unauthorized(): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    { success: false, error: "Unauthorized. Please sign in." },
    { status: 401 }
  );
}

export function notFound(entity = "Record"): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    { success: false, error: `${entity} not found.` },
    { status: 404 }
  );
}

export function serverError(e: unknown): NextResponse<ApiResponse<never>> {
  console.error("[API Error]", e);
  return NextResponse.json(
    { success: false, error: "An unexpected error occurred." },
    { status: 500 }
  );
}
