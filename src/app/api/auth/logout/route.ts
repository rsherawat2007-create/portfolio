import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

export async function POST() {
  try {
    await deleteSession();
    return NextResponse.json({
      success: true,
      message: "Session terminated successfully.",
    });
  } catch (error) {
    console.error("[Logout Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to terminate session.",
      },
      { status: 500 }
    );
  }
}
