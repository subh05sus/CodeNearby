/**
 * One-time broadcast: "CodeNearby 2.0" email to all users.
 *
 * Usage:
 *   node --env-file=.env scripts/send-new-look-email.mjs                      # dry-run day 1 (1–100)
 *   node --env-file=.env scripts/send-new-look-email.mjs --send               # send day 1 (1–100)
 *   node --env-file=.env scripts/send-new-look-email.mjs --send --day=2       # send day 2 (101–200)
 *   node --env-file=.env scripts/send-new-look-email.mjs --day=3              # dry-run day 3 (201–300)
 *
 * Resend free tier = 100 emails/day. Run with --day=N each day.
 * Rate-limited to 2 sends/sec to stay within Resend limits.
 */

import { MongoClient } from "mongodb";
import { Resend } from "resend";

const MONGODB_URI = process.env.MONGODB_URI;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "CodeNearby <hello@codenearby.space>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://codenearby.space";
const DRY_RUN = !process.argv.includes("--send");
const dayArg = process.argv.find((a) => a.startsWith("--day="));
const DAY = dayArg ? parseInt(dayArg.split("=")[1], 10) : 1;
const BATCH_SIZE = 100;
const SKIP = (DAY - 1) * BATCH_SIZE;

if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI not set in .env");
  process.exit(1);
}
if (!RESEND_API_KEY && !DRY_RUN) {
  console.error("ERROR: RESEND_API_KEY not set in .env");
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

function buildHtml(name) {
  const firstName = name?.split(" ")[0] || "there";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>CodeNearby 2.0 is here</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#0d0d0d;border-radius:16px;border:1px solid #1f1f1f;padding:40px 36px;">

      <!-- Header -->
      <tr><td style="text-align:center;padding-bottom:28px;border-bottom:1px solid #1f1f1f;margin-bottom:28px;">
        <img src="${APP_URL}/logo.png" alt="CodeNearby" width="52" height="52" style="border-radius:12px;display:block;margin:0 auto 8px;" />
        <p style="margin:0;font-size:20px;font-weight:700;color:#fafafa;letter-spacing:-0.3px;">CodeNearby</p>
        <p style="margin:2px 0 0;font-size:13px;color:#a1a1aa;">Connect with developers nearby</p>
      </td></tr>

      <tr><td style="padding-top:28px;">

        <!-- Hero banner -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,92,26,0.08);border:1px solid rgba(255,92,26,0.25);border-radius:14px;margin-bottom:24px;">
          <tr><td style="padding:28px 24px;text-align:center;">
            <p style="font-size:40px;margin:0 0 8px;line-height:1;">✨</p>
            <p style="font-size:22px;font-weight:800;color:#fafafa;margin:0 0 6px;letter-spacing:-0.5px;">CodeNearby 2.0 is here</p>
            <p style="font-size:14px;color:#a1a1aa;margin:0;">A fresh new look, and a lot more under the hood.</p>
          </td></tr>
        </table>

        <p style="font-size:22px;font-weight:700;color:#fafafa;margin:0 0 12px;letter-spacing:-0.3px;">Hey ${firstName}, we&apos;ve been busy 👋</p>
        <p style="font-size:15px;color:#a1a1aa;line-height:1.6;margin:0 0 24px;">
          We&apos;ve redesigned CodeNearby from the ground up — cleaner UI, smoother interactions, and new features to make connecting with developers near you even better.
        </p>

        <!-- Features -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;border-radius:12px;border:1px solid #1f1f1f;margin-bottom:28px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-size:13px;font-weight:600;color:#FF5C1A;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.5px;">What&apos;s new in 2.0</p>
            ${[
              ["✨", "Redesigned UI", "Refreshed visuals with better contrast, smoother animations, and consistent components"],
              ["📬", "Email notifications", "Stay in the loop — get notified on connection requests, comments, and milestones"],
              ["🏆", "Post milestones", "Celebrate when your posts hit 1, 10, 50, or 100 upvotes"],
              ["📅", "Gathering updates", "Hosts get notified when someone joins their gathering"],
            ].map(([icon, title, desc]) => `
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
              <tr>
                <td width="32" style="font-size:20px;vertical-align:top;padding-top:1px;">${icon}</td>
                <td>
                  <p style="font-size:14px;font-weight:600;color:#fafafa;margin:0 0 2px;">${title}</p>
                  <p style="font-size:13px;color:#a1a1aa;margin:0;line-height:1.5;">${desc}</p>
                </td>
              </tr>
            </table>`).join("")}
          </td></tr>
        </table>

        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr><td align="center">
            <a href="${APP_URL}" style="display:inline-block;background:#FF5C1A;color:#ffffff;font-size:15px;font-weight:600;padding:13px 28px;border-radius:10px;text-decoration:none;letter-spacing:0.1px;">Check Out the New Look →</a>
          </td></tr>
        </table>

        <p style="font-size:13px;color:#a1a1aa;line-height:1.6;margin:0;">
          Your profile, friends, and posts are all still there — just sign in with GitHub to continue.
        </p>

      </td></tr>

      <!-- Footer -->
      <tr><td style="text-align:center;padding-top:20px;margin-top:28px;border-top:1px solid #1f1f1f;">
        <p style="font-size:12px;color:#a1a1aa;line-height:1.6;margin:0;">
          You&apos;re receiving this because you have a CodeNearby account.
          <a href="${APP_URL}/settings/notifications" style="color:#a1a1aa;">Unsubscribe</a>
          &middot;
          <a href="${APP_URL}" style="color:#a1a1aa;">codenearby.space</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

async function main() {
  console.log(`\n=== CodeNearby 2.0 Broadcast ===`);
  console.log(`Mode: ${DRY_RUN ? "DRY RUN (no emails sent)" : "LIVE"} | Day ${DAY} | Users ${SKIP + 1}–${SKIP + BATCH_SIZE}\n`);

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();

  const users = await db
    .collection("users")
    .find({
      email: { $exists: true, $ne: null, $ne: "" },
    })
    .project({ _id: 1, email: 1, name: 1, newLookEmailSentAt: 1 })
    .skip(SKIP)
    .limit(BATCH_SIZE)
    .toArray();

  const total = await db.collection("users").countDocuments({ email: { $exists: true, $ne: null, $ne: "" } });
  const totalDays = Math.ceil(total / BATCH_SIZE);
  console.log(`Total users: ${total} | Total days needed: ${totalDays} | This batch: ${users.length} users\n`);

  if (users.length === 0) {
    console.log("Nothing to do.");
    await client.close();
    return;
  }

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of users) {
    if (!user.email || user.newLookEmailSentAt) { skipped++; continue; }

    if (DRY_RUN) {
      console.log(`[DRY] Would send to: ${user.email} (${user.name || "no name"})`);
      sent++;
      continue;
    }

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: user.email,
        subject: "CodeNearby just got a whole new look ✨",
        html: buildHtml(user.name),
      });

      await db
        .collection("users")
        .updateOne({ _id: user._id }, { $set: { newLookEmailSentAt: new Date() } });

      sent++;
      console.log(`✓ ${user.email}`);

      // 2 req/sec rate limit — wait 500ms between sends
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      errors++;
      console.error(`✗ ${user.email} — ${err.message}`);
    }
  }

  await client.close();

  console.log(`\n=== Done ===`);
  console.log(`Sent: ${sent} | Skipped: ${skipped} | Errors: ${errors}`);
  if (DRY_RUN) {
    console.log(`\nRun with --send to actually deliver emails.`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
