import { render } from "@react-email/render";
import resend from "./client";
import React from "react";

interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const html = await render(react);

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "CodeNearby <hello@codenearby.space>",
    to,
    subject,
    html,
  });
}
