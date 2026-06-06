/**
 * Broadcast: "Spread the word" offer-letter email to engaged users.
 *
 * Scores all users by activity (posts, comments, votes, friend requests,
 * recent registration) and sends to the top 100 who haven't received it yet.
 * Subject line is randomised across 4 variants per user.
 * Tracks sends via `spreadEmailSentAt` to prevent duplicates.
 *
 * Usage:
 *   node --env-file=.env scripts/send-spread-email.mjs           # dry-run
 *   node --env-file=.env scripts/send-spread-email.mjs --send    # live send
 */

import { MongoClient } from "mongodb";
import { Resend } from "resend";

const MONGODB_URI = process.env.MONGODB_URI;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "CodeNearby <hello@codenearby.space>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://codenearby.space";
const DRY_RUN = !process.argv.includes("--send");
const BATCH_SIZE = 100;

// Always included — guaranteed slots regardless of activity score
const PRIORITY_EMAILS = [
  "heysubinoy@gmail.com",
  "debnathrohit97@gmail.com",
  "deependragaur555@gmail.com",
  "sayanghosh1887@gmail.com",
];

if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI not set in .env");
  process.exit(1);
}
if (!RESEND_API_KEY && !DRY_RUN) {
  console.error("ERROR: RESEND_API_KEY not set in .env");
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

// ── Subject variants ──────────────────────────────────────────────────────────

const VARIANTS = [
  {
    subject: "Your offer letter is ready",
    preheader: "We've been watching your activity. You've been selected.",
    heroLine: "Your offer letter is ready.",
    heroSub: "We've been watching your activity. You've been selected.",
    positionLabel: "Selected Candidate",
  },
  {
    subject: "Congratulations. You've been shortlisted.",
    preheader: "Out of all our active users, you made the cut. Here's what we need from you.",
    heroLine: "You've been shortlisted.",
    heroSub: "Out of all our active users, you made the cut.",
    positionLabel: "Shortlisted Candidate",
  },
  {
    subject: "RE: Interview Feedback — Final Round",
    preheader: "Good news. You passed. Your only task: tell one developer friend about CodeNearby.",
    heroLine: "RE: Interview Feedback — Final Round",
    heroSub: "Good news. You passed. Your only task: tell one developer friend about CodeNearby.",
    positionLabel: "Final Round Qualifier",
  },
  {
    subject: "Your joining date has been confirmed",
    preheader: "You joined. Now bring someone with you.",
    heroLine: "Your joining date has been confirmed.",
    heroSub: "You joined. Now bring someone with you.",
    positionLabel: "Active Member",
  },
];

function pickVariant(userId) {
  // deterministic-ish but effectively random across 100 different users
  const hash = userId.toString().split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return VARIANTS[hash % VARIANTS.length];
}

// ── HTML builder ──────────────────────────────────────────────────────────────

function buildHtml(name, email, variant) {
  const firstName = name?.split(" ")[0] || "there";
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${variant.subject}</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Preheader: shows in notification/inbox preview, hidden in email body -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${variant.preheader}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#0d0d0d;border-radius:16px;border:1px solid #1f1f1f;padding:40px 36px;">

        <!-- Logo header -->
        <tr><td style="text-align:center;padding-bottom:28px;border-bottom:1px solid #1f1f1f;">
          <img src="${APP_URL}/logo.png" alt="CodeNearby" width="48" height="48" style="border-radius:12px;display:block;margin:0 auto 8px;" />
          <p style="margin:0;font-size:18px;font-weight:700;color:#fafafa;letter-spacing:-0.3px;">CodeNearby</p>
          <p style="margin:2px 0 0;font-size:12px;color:#71717a;">Human Resources Department</p>
        </td></tr>

        <tr><td style="padding-top:28px;">

          <!-- Document header strip -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,92,26,0.06);border:1px solid rgba(255,92,26,0.2);border-radius:12px;margin-bottom:28px;">
            <tr><td style="padding:22px 24px;">
              <p style="font-size:11px;font-weight:600;color:#FF5C1A;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;">Confidential · For Addressee Only</p>
              <p style="font-size:22px;font-weight:800;color:#fafafa;margin:0 0 4px;letter-spacing:-0.5px;">${variant.heroLine}</p>
              <p style="font-size:14px;color:#a1a1aa;margin:0;line-height:1.5;">${variant.heroSub}</p>
            </td></tr>
          </table>

          <!-- Offer letter body -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:12px;border:1px solid #1f1f1f;margin-bottom:24px;">
            <tr><td style="padding:24px 28px;">

              <!-- Date + ref -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="font-size:12px;color:#71717a;">Date: ${today}</td>
                  <td style="font-size:12px;color:#71717a;text-align:right;">Ref: CN/HR/AMBASSADOR</td>
                </tr>
              </table>

              <p style="font-size:15px;color:#fafafa;margin:0 0 4px;font-weight:600;">Dear ${firstName},</p>

              <p style="font-size:14px;color:#a1a1aa;line-height:1.7;margin:12px 0 20px;">
                We are delighted to extend this offer of appointment to you for the position of
                <strong style="color:#FF5C1A;">CodeNearby Ambassador</strong>.
                Based on your recent activity, you have demonstrated exactly the kind of energy
                we look for.
              </p>

              <!-- Terms table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2a2a2a;border-radius:10px;overflow:hidden;margin-bottom:20px;">
                <tr style="background:#1a1a1a;">
                  <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;width:40%;">Field</td>
                  <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Details</td>
                </tr>
                ${[
                  ["Position", "CodeNearby Ambassador"],
                  ["Reporting To", "That one dev friend who doesn't know about this yet"],
                  ["Compensation", "The eternal flex of being the person who introduced them to something cool"],
                  ["Notice Period", "None. This is a vibe, not a contract."],
                  ["Start Date", "Immediately"],
                  ["Status", variant.positionLabel],
                ].map(([field, val], i) => `
                <tr style="border-top:1px solid #2a2a2a;${i % 2 === 0 ? "" : "background:#161616;"}">
                  <td style="padding:11px 16px;font-size:13px;color:#71717a;vertical-align:top;">${field}</td>
                  <td style="padding:11px 16px;font-size:13px;color:#d4d4d8;line-height:1.5;">${val}</td>
                </tr>`).join("")}
              </table>

              <!-- Responsibilities -->
              <p style="font-size:13px;font-weight:600;color:#FF5C1A;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.5px;">Key Responsibilities</p>
              ${[
                "Tell one developer friend that CodeNearby exists",
                "Drop the link in your dev group chat (yes, that one)",
                "Share on X / LinkedIn if the mood strikes",
              ].map((text) => `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
                <tr>
                  <td width="16" style="font-size:13px;color:#FF5C1A;vertical-align:top;padding-top:2px;">—</td>
                  <td style="font-size:14px;color:#a1a1aa;line-height:1.5;">${text}</td>
                </tr>
              </table>`).join("")}

              <p style="font-size:13px;color:#52525b;margin:20px 0 0;line-height:1.6;border-top:1px solid #1f1f1f;padding-top:16px;">
                We hope you love CodeNearby as much as we love building it. Word of mouth
                from people like you is how we grow — no ad budget, no billboards, just
                developers telling developers.
              </p>

            </td></tr>
          </table>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            <tr><td align="center">
              <a href="${APP_URL}?ref=spread-email" style="display:inline-block;background:#FF5C1A;color:#ffffff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.1px;">Accept Offer &amp; Share CodeNearby →</a>
            </td></tr>
          </table>

          <p style="font-size:13px;color:#52525b;text-align:center;margin:0;">
            Or copy: <span style="color:#a1a1aa;">${APP_URL}</span>
          </p>

          <!-- Signature -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;padding-top:20px;border-top:1px solid #1f1f1f;">
            <tr>
              <td>
                <p style="font-size:13px;color:#a1a1aa;margin:0 0 2px;">Warm regards,</p>
                <p style="font-size:14px;font-weight:600;color:#fafafa;margin:0 0 2px;">Subhadip Saha</p>
                <p style="font-size:12px;color:#52525b;margin:0;">Founder, CodeNearby · codenearby.space</p>
              </td>
              <td style="text-align:right;vertical-align:bottom;">
                <p style="font-size:11px;color:#3f3f46;margin:0;font-style:italic;">Digitally authorised</p>
                <p style="font-size:18px;font-weight:800;color:#FF5C1A;margin:0;font-style:italic;">CN</p>
              </td>
            </tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td style="text-align:center;padding-top:20px;margin-top:28px;border-top:1px solid #1f1f1f;">
          <p style="font-size:12px;color:#3f3f46;line-height:1.6;margin:0;">
            You're receiving this because you have an active CodeNearby account. &middot;
            <a href="${APP_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#52525b;">Unsubscribe</a>
            &middot;
            <a href="${APP_URL}" style="color:#52525b;">codenearby.space</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Activity detection ────────────────────────────────────────────────────────

async function getEngagedUserIds(db) {
  const { ObjectId } = await import("mongodb");

  // Signal 1: authored any post
  const postAuthors = await db.collection("posts").distinct("userId");
  const postAuthorIds = new Set(postAuthors.map((id) => id.toString()));

  // Signal 2: commented on any post (embedded in posts)
  const commenters = await db
    .collection("posts")
    .aggregate([
      { $unwind: "$comments" },
      { $group: { _id: "$comments.userId" } },
    ])
    .toArray();
  const commenterIds = new Set(commenters.map((r) => r._id?.toString()).filter(Boolean));

  // Signal 3: sent any friend request
  const requestSenders = await db.collection("friendRequests").distinct("senderId");
  const friendRequestIds = new Set(requestSenders.map((id) => id.toString()));

  // Signal 4: voted on any post (userVotes object keys = userId strings)
  const votedPosts = await db
    .collection("posts")
    .find({ userVotes: { $exists: true } })
    .project({ userVotes: 1 })
    .toArray();
  const voterIds = new Set(votedPosts.flatMap((p) => Object.keys(p.userVotes || {})));

  // Signal 5: registered in the last 30 days (new users most likely to share)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentOid = ObjectId.createFromTime(Math.floor(thirtyDaysAgo.getTime() / 1000));
  const newUsers = await db.collection("users").distinct("_id", { _id: { $gte: recentOid } });
  const newUserIds = new Set(newUsers.map((id) => id.toString()));

  const union = new Set([
    ...postAuthorIds,
    ...commenterIds,
    ...friendRequestIds,
    ...voterIds,
    ...newUserIds,
  ]);

  console.log(`  Post authors:      ${postAuthorIds.size}`);
  console.log(`  Commenters:        ${commenterIds.size}`);
  console.log(`  Friend requesters: ${friendRequestIds.size}`);
  console.log(`  Voters:            ${voterIds.size}`);
  console.log(`  New (30d):         ${newUserIds.size}`);
  console.log(`  Union:             ${union.size} unique users`);

  // Score: more signals = higher priority
  const scoreMap = new Map();
  const bump = (id, pts) => scoreMap.set(id, (scoreMap.get(id) || 0) + pts);
  for (const id of postAuthorIds)    bump(id, 4);
  for (const id of commenterIds)     bump(id, 3);
  for (const id of friendRequestIds) bump(id, 3);
  for (const id of voterIds)         bump(id, 2);
  for (const id of newUserIds)       bump(id, 1);

  return { union, scoreMap };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n=== CodeNearby Spread-the-Word Broadcast ===`);
  console.log(`Mode: ${DRY_RUN ? "DRY RUN (no emails sent)" : "LIVE"} | Limit ${BATCH_SIZE}\n`);

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();

  const { ObjectId } = await import("mongodb");
  const { union, scoreMap } = await getEngagedUserIds(db);

  const objectIds = [...union].map((id) => {
    try { return new ObjectId(id); } catch { return null; }
  }).filter(Boolean);

  // If no activity-based users found at all, fall back to all users with email
  const baseFilter = { email: { $exists: true, $ne: null, $ne: "" }, spreadEmailSentAt: { $exists: false }, emailUnsubscribed: { $ne: true } };
  const query = objectIds.length > 0
    ? { _id: { $in: objectIds }, ...baseFilter }
    : baseFilter;

  if (objectIds.length === 0) {
    console.log("\nNo activity signals found — falling back to all users with email.\n");
  }

  const users = await db
    .collection("users")
    .find(query)
    .sort({ _id: -1 })
    .limit(BATCH_SIZE * 3)
    .project({ _id: 1, email: 1, name: 1 })
    .toArray();

  // Fetch priority users (guaranteed slots, skip if already sent or unsubscribed)
  const priorityUsers = await db
    .collection("users")
    .find({
      email: { $in: PRIORITY_EMAILS },
      spreadEmailSentAt: { $exists: false },
      emailUnsubscribed: { $ne: true },
    })
    .project({ _id: 1, email: 1, name: 1 })
    .toArray();

  const priorityEmailSet = new Set(priorityUsers.map((u) => u.email));

  // Sort activity users by score, exclude priority emails (already handled), take top (BATCH_SIZE - priority slots)
  users.sort((a, b) => (scoreMap.get(b._id.toString()) || 0) - (scoreMap.get(a._id.toString()) || 0));
  const activityUsers = users.filter((u) => !priorityEmailSet.has(u.email));
  const batch = [...priorityUsers, ...activityUsers.slice(0, BATCH_SIZE - priorityUsers.length)];

  console.log(`\nPriority: ${priorityUsers.length} | Activity pool: ${activityUsers.length} | Sending: ${batch.length}\n`);

  if (users.length === 0) {
    console.log("Nothing to do — no active users without spreadEmailSentAt.");
    await client.close();
    return;
  }

  // Tally variant distribution for the log
  const tally = { 0: 0, 1: 0, 2: 0, 3: 0 };

  let sent = 0;
  let errors = 0;

  for (const user of batch) {
    const variant = pickVariant(user._id.toString());
    const variantIdx = VARIANTS.indexOf(variant);
    tally[variantIdx]++;

    if (DRY_RUN) {
      console.log(`[DRY] ${user.email.padEnd(40)} subject: "${variant.subject}"`);
      sent++;
      continue;
    }

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: user.email,
        subject: variant.subject,
        html: buildHtml(user.name, user.email, variant),
      });

      await db
        .collection("users")
        .updateOne({ _id: user._id }, { $set: { spreadEmailSentAt: new Date() } });

      sent++;
      console.log(`✓ [v${variantIdx + 1}] ${user.email}`);

      await new Promise((r) => setTimeout(r, 500)); // 2 req/sec
    } catch (err) {
      errors++;
      console.error(`✗ ${user.email} — ${err.message}`);
    }
  }

  await client.close();

  console.log(`\n=== Done ===`);
  console.log(`Sent: ${sent} | Errors: ${errors}`);
  console.log(`\nVariant breakdown:`);
  VARIANTS.forEach((v, i) => console.log(`  v${i + 1} (${tally[i]}x): ${v.subject}`));
  if (DRY_RUN) console.log(`\nRun with --send to actually deliver emails.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
