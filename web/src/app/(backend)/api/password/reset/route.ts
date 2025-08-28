import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    const res = await auth.api.resetPassword({
      body: { token, newPassword },
    });
    
    return NextResponse.json(res);
  } catch {
    return NextResponse.json({ error: "Reset failed" }, { status: 400 });
  }
}
