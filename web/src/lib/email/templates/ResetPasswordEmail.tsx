import * as React from "react";

export function ResetPasswordEmail({
  name,
  resetUrl,
}: { name?: string | null; resetUrl: string }) {
  return (
    <div style={{ fontFamily: "ui-sans-serif, system-ui", lineHeight: 1.5 }}>
      <h2>Reset your password</h2>
      <p>Hi {name ?? "there"},</p>
      <p>We received a request to reset your password.</p>
      <p>
        <a href={resetUrl}>Click here to reset it</a>
      </p>
      <p>If you didnt request this, you can ignore this email.</p>
    </div>
  );
}
