// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { resend } from "./resend";

// type SendArgs =
//   | { to: string; subject: string; html: string; text?: string }
//   | { to: string; subject: string; react: React.ReactElement; text?: string };

// export async function sendEmail(args: SendArgs) {
//   const { to, subject, ...content } = args as any;
//   const { data, error } = await resend.emails.send({
//     from: process.env.EMAIL_FROM!,
//     to,
//     subject,
//     ...content, // html|react
//   });
//   if (error) throw new Error(error.message);
//   return data;
// }
