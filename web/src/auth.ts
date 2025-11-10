import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./app/(backend)/services/db";

import { customSession } from "better-auth/plugins";
import { getUserRole } from "@/backend/services/auth";
import { expo } from "@better-auth/expo";
// import { sendEmail } from "./lib/email";
import { ResetPasswordEmail } from "./templates/ResetPasswordEmail";
 
export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    database: prismaAdapter(prisma, {
        provider: "mongodb",
    }),
    emailAndPassword: {  
      enabled: true,
      // sendResetPassword: async ({ user, url /*, token*/ }, ) => {
        // // url already includes the reset token; just email it.
        // await sendEmail({
          // to: user.email,
          // subject: "Reset your password",
          // react: ResetPasswordEmail({ name: user.name, resetUrl: url }),
        // });
      // },
      // // optional: runs after a successful reset
      // onPasswordReset: async ({ user }) => {
        // console.log("Password reset for:", user.email);
      // },
    },
    user: {
        deleteUser: { 
            enabled: true
        },
        changeEmail: {
            enabled: true,
            // sendChangeEmailVerification: async ({ user, newEmail, url, token }, request) => {
            //     await sendEmail({
            //         to: user.email, // verification email must be sent to the current user email to approve the change
            //         subject: 'Approve email change',
            //         text: `Click the link to approve the change: ${url}`
            //     })
            // }
        }
    },
    // socialProviders: { 
    //     google: { 
    //        clientId: process.env.GOOGLE_ID as string, 
    //        clientSecret: process.env.GOOGLE_SECRET as string, 
    //     }, 
    // }, 
    plugins: [
        expo(),
        customSession(async ({ user, session }) => {
            const role = await getUserRole(session.userId);
            return {
                role,
                user,
                session
            };
        }),
        nextCookies(),
    ],
    trustedOrigins: [
        "noctiluz://",
        "noctiluz://*",
    ]
});