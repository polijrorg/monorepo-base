import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // your betterAuth export
import { blockForbiddenRequests, validBody } from "@/utils";
import { AllowedRoutes } from "@/types";

const allowedRoles: AllowedRoutes = {
  POST: ['SUPER_ADMIN', 'ADMIN', 'USER'],
}
export async function POST(req: NextRequest) {
  try {
    const forbidden = await blockForbiddenRequests(req, allowedRoles.POST);
    if (forbidden) {
      return forbidden;
    }

    const { email } = await validBody(req);

    const redirectTo = `${process.env.BETTER_AUTH_URL}/api/password/reset`;

    // Triggers sendResetPassword() above if the user exists
    await auth.api.requestPasswordReset({
      body: { email, redirectTo },
    });

    // Don't reveal if email is registered
    return NextResponse.json({ ok: true });
  } catch {
    // Still hide existence of the email
    return NextResponse.json({ ok: true });
  }
}
