import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please sign in to access this resource.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: auth.id,
        email: auth.email,
      },
    });
  } catch (error) {
    console.error("[Auth Check Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify authentication status.",
      },
      { status: 500 }
    );
  }
}
