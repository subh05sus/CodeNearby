/**
 * Feed Activity Campaign — CodeNearby
 *
 * Sends high-provocation, personality-driven emails to users who have never
 * posted on the feed (or haven't posted recently). Three categories:
 *   rage    — challenge, call-out, ego activation
 *   reverse — reverse psychology ("don't post")
 *   fakeout — fake promise that immediately reveals itself
 *
 * Each user gets a deterministic variant. Sends tracked via `feedNudgeEmailSentAt`.
 *
 * Usage:
 *   node --env-file=.env scripts/send-post-nudge-email.mjs                    # dry-run
 *   node --env-file=.env scripts/send-post-nudge-email.mjs --send             # live
 *   node --env-file=.env scripts/send-post-nudge-email.mjs --send --batch=50
 *   node --env-file=.env scripts/send-post-nudge-email.mjs --send --category=fakeout
 *   node --env-file=.env scripts/send-post-nudge-email.mjs --send --target=never-posted
 *   node --env-file=.env scripts/send-post-nudge-email.mjs --send --target=inactive
 */

import { MongoClient, ObjectId } from "mongodb";
import { Resend } from "resend";

const MONGODB_URI = process.env.MONGODB_URI;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "CodeNearby <hello@codenearby.space>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://codenearby.space";
const DRY_RUN = !process.argv.includes("--send");
const batchArg = process.argv.find((a) => a.startsWith("--batch="));
const BATCH_SIZE = batchArg ? parseInt(batchArg.split("=")[1], 10) : 100;
const categoryArg = process.argv.find((a) => a.startsWith("--category="));
const FORCE_CATEGORY = categoryArg ? categoryArg.split("=")[1].toLowerCase() : null;
// --target=never-posted  → users with zero posts (default)
// --target=inactive      → users who posted but not in last 30 days
const targetArg = process.argv.find((a) => a.startsWith("--target="));
const TARGET_MODE = targetArg ? targetArg.split("=")[1] : "never-posted";

const PRIORITY_EMAILS = [
  "heysubinoy@gmail.com",
  "debnathrohit97@gmail.com",
  "deependragaur555@gmail.com",
  "sayanghosh1887@gmail.com",
];

if (!MONGODB_URI) { console.error("ERROR: MONGODB_URI not set"); process.exit(1); }
if (!RESEND_API_KEY && !DRY_RUN) { console.error("ERROR: RESEND_API_KEY not set"); process.exit(1); }

const resend = new Resend(RESEND_API_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN VARIANTS
// ─────────────────────────────────────────────────────────────────────────────

const CAMPAIGNS = {

  // ── A: RAGE BAIT ────────────────────────────────────────────────────────────
  rage: [
    {
      id: "r01",
      subject: "You joined. Then disappeared.",
      preheader: "The feed noticed.",
      lines: ["You joined CodeNearby.", "Then nothing.", "The feed doesn't wait."],
      tone: "aggressive",
    },
    {
      id: "r02",
      subject: "Your profile contributes absolutely nothing.",
      preheader: "Just sitting there. Being decorative.",
      lines: ["Your profile exists.", "That's about it.", "One post would change that instantly."],
      tone: "aggressive",
    },
    {
      id: "r03",
      subject: "At this point your account is decorative.",
      preheader: "Lovely avatar though.",
      lines: ["Nice profile picture.", "Zero posts.", "Strong lurker energy."],
      tone: "funny",
    },
    {
      id: "r04",
      subject: `Still "working on something"?`,
      preheader: "The quotes are doing a lot of work.",
      lines: ["You've been building something for a while now.", "Nobody has seen it.", "That's one way to ship."],
      tone: "aggressive",
    },
    {
      id: "r05",
      subject: "Your GitHub has commits. Your profile doesn't.",
      preheader: "Interesting choice.",
      lines: ["You're clearly building.", "The feed has no evidence of this.", "Fix the imbalance."],
      tone: "dm",
    },
    {
      id: "r06",
      subject: "The feed forgot you existed.",
      preheader: "It didn't actually. But it will.",
      lines: ["Feeds have memory.", "Yours is fading.", "Post before it's gone completely."],
      tone: "aggressive",
    },
    {
      id: "r07",
      subject: "We've seen abandoned repos with more activity.",
      preheader: "Low bar. You're below it.",
      lines: ["An unmaintained project from 2019.", "More feed presence than you.", "Think about that."],
      tone: "funny",
    },
    {
      id: "r08",
      subject: "Your side project has gone missing.",
      preheader: "We're filing a report.",
      lines: ["It was last seen in your head.", "Nobody has heard from it since.", "The feed is the only witness protection it needs."],
      tone: "absurd",
    },
    {
      id: "r09",
      subject: "Are you building or just consuming content?",
      preheader: "Be honest.",
      lines: ["There's a difference.", "One of them shows up in the feed.", "The other one doesn't."],
      tone: "dm",
    },
    {
      id: "r10",
      subject: "Your profile is running on archival mode.",
      preheader: "Like a museum exhibit. Static.",
      lines: ["Nothing new.", "Nothing posted.", "Nothing changed.", "It's giving time capsule."],
      tone: "funny",
    },
    {
      id: "r11",
      subject: "You have projects. Nobody knows.",
      preheader: "Whose fault is that?",
      lines: ["You built something.", "It lives in your head, your laptop, maybe a private repo.", "Nobody can find what you never shared."],
      tone: "aggressive",
    },
    {
      id: "r12",
      subject: "The feed has enough lurkers already.",
      preheader: "You could be different.",
      lines: ["Most people read and scroll.", "A few actually post.", "Guess which ones get noticed."],
      tone: "dm",
    },
    {
      id: "r13",
      subject: "You keep saying you're building.",
      preheader: "The evidence is surprisingly limited.",
      lines: ["We believe you.", "The feed doesn't.", "Post once. Make it believe."],
      tone: "aggressive",
    },
    {
      id: "r14",
      subject: "Other developers are finding opportunities. You're reading emails.",
      preheader: "This one included.",
      lines: ["Right now, on CodeNearby.", "Someone posted their project.", "Someone else saw it and reached out.", "You're reading this email."],
      tone: "fomo",
    },
    {
      id: "r15",
      subject: "Your developer profile is a cold case.",
      preheader: "Last activity: unknown.",
      lines: ["No recent posts.", "No activity trail.", "Investigators are baffled."],
      tone: "absurd",
    },
    {
      id: "r16",
      subject: "Zero posts. Respect for the commitment.",
      preheader: "To absolutely nothing.",
      lines: ["It takes discipline to join a developer community.", "Never post.", "Not once.", "Impressive, honestly."],
      tone: "sarcastic",
    },
    {
      id: "r17",
      subject: "Your project deserves to be invisible, right?",
      preheader: "That's what you're saying by not posting.",
      lines: ["Your work is invisible.", "Not because it isn't good.", "Because you never shared it."],
      tone: "aggressive",
    },
    {
      id: "r18",
      subject: "Developers nearby are getting noticed.",
      preheader: "The feed is a short-term memory. You've been erased.",
      lines: ["Not by magic.", "By posting.", "It's frustratingly simple."],
      tone: "dm",
    },
    {
      id: "r19",
      subject: "The feed isn't dead. You're just not posting.",
      preheader: "There's a difference.",
      lines: ["Active posts every day.", "Real developers.", "Real projects.", "Yours isn't there."],
      tone: "aggressive",
    },
    {
      id: "r20",
      subject: "Your account has the energy of an unread README.",
      preheader: "All setup. Zero content.",
      lines: ["Profile: complete.", "Stack: listed.", "Posts: none.", "Classic README developer."],
      tone: "funny",
    },
    {
      id: "r21",
      subject: "How long until someone else builds what you're building?",
      preheader: "They'll post it first.",
      lines: ["Your idea isn't secret forever.", "Someone else has it too.", "The one who ships and posts wins."],
      tone: "aggressive",
    },
    {
      id: "r22",
      subject: "Your expertise is hidden. On purpose, apparently.",
      preheader: "Strange strategy.",
      lines: ["You know things other developers want to know.", "The feed is right there.", "The audience is waiting.", "You are... not posting."],
      tone: "dm",
    },
    {
      id: "r23",
      subject: "This is your third month with zero posts.",
      preheader: "Consistency is a skill.",
      lines: ["Consistently not posting.", "Also a skill.", "A weird one."],
      tone: "sarcastic",
    },
    {
      id: "r24",
      subject: "We're starting to think you don't actually code.",
      preheader: "Prove us wrong.",
      lines: ["No projects.", "No posts.", "No proof.", "The feed is a simple way to change all three."],
      tone: "aggressive",
    },
    {
      id: "r25",
      subject: "Your network can't find you.",
      preheader: "You're invisible by choice.",
      lines: ["Developers nearby are searching the feed.", "For people like you.", "You don't show up.", "Fix that."],
      tone: "dm",
    },
    {
      id: "r26",
      subject: "Reminder: invisible developers don't get collaborators.",
      preheader: "Just a fact.",
      lines: ["Nobody can reach out about work they've never seen.", "The feed solves this.", "One post at a time."],
      tone: "notification",
    },
    {
      id: "r27",
      subject: "You have skills. The algorithm doesn't know that.",
      preheader: "It only knows what you post.",
      lines: ["Algorithms surface what exists.", "Your posts don't exist.", "Neither do you, algorithmically speaking."],
      tone: "funny",
    },
    {
      id: "r28",
      subject: "A developer posted their side project last week.",
      preheader: "Got three collaboration requests. You: zero posts.",
      lines: ["They posted.", "People saw.", "Something happened.", "You posted nothing.", "Nothing happened."],
      tone: "fomo",
    },
    {
      id: "r29",
      subject: "Your project has no witnesses.",
      preheader: "Post. Create evidence.",
      lines: ["It exists on your machine.", "Nowhere else.", "The feed is the witness."],
      tone: "absurd",
    },
    {
      id: "r30",
      subject: "You could be the most interesting developer in your city.",
      preheader: "Hard to tell from zero posts.",
      lines: ["Maybe you are.", "Nobody knows.", "One post would start changing that."],
      tone: "dm",
    },
    {
      id: "r31",
      subject: "Not posting is a choice. A weird one.",
      preheader: "But respected, we guess.",
      lines: ["You chose silence.", "The feed chose to forget you.", "Both parties are satisfied apparently."],
      tone: "sarcastic",
    },
    {
      id: "r32",
      subject: "Still lurking?",
      preheader: "We can see you.",
      lines: ["You're reading posts.", "You're not making them.", "Lurk/post ratio is off."],
      tone: "dm",
    },
    {
      id: "r33",
      subject: "You signed up. That was the easy part.",
      preheader: "The hard part is apparently posting once.",
      lines: ["Filled in your profile.", "Added your stack.", "Opened the feed once.", "Never posted.", "Fascinating journey."],
      tone: "sarcastic",
    },
    {
      id: "r34",
      subject: "System alert: No feed activity detected.",
      preheader: "— CodeNearby Activity Monitor",
      lines: ["User: You", "Posts in last 30 days: 0", "Action required: Post something.", "Severity: Embarrassing."],
      tone: "notification",
    },
    {
      id: "r35",
      subject: "Feed activity: 0. LinkedIn activity: probably 12.",
      preheader: "Interesting priorities.",
      lines: ["One platform has developers who actually ship.", "One platform has thought leaders.", "You know which one you're not posting on."],
      tone: "funny",
    },
    {
      id: "r36",
      subject: "Your ideas are rotting in your head.",
      preheader: "The feed is the exit.",
      lines: ["Every idea you never share dies quietly.", "The feed is a low-stakes way to stop that.", "Post it. Let it breathe."],
      tone: "aggressive",
    },
    {
      id: "r37",
      subject: "Anonymous developer. By choice.",
      preheader: "Very mysterious. Very pointless.",
      lines: ["Nobody knows your name on the feed.", "Not because you're private.", "Because you never posted."],
      tone: "sarcastic",
    },
    {
      id: "r38",
      subject: "You build things. You just refuse to let anyone know.",
      preheader: "Interesting strategy.",
      lines: ["Classic developer move.", "Build in silence.", "Stay in silence.", "Wonder why nothing happens."],
      tone: "dm",
    },
    {
      id: "r39",
      subject: "The feed is a conversation you're not in.",
      preheader: "By choice, apparently.",
      lines: ["People are talking.", "About what they're building.", "You're not in the room.", "The door is open."],
      tone: "aggressive",
    },
    {
      id: "r40",
      subject: "Post once. We'll leave you alone.",
      preheader: "Probably.",
      lines: ["One post.", "That's all.", "Then you're a person on the feed instead of a ghost.", "Deal?"],
      tone: "funny",
    },
  ],

  // ── B: REVERSE PSYCHOLOGY ───────────────────────────────────────────────────
  reverse: [
    {
      id: "rv01",
      subject: "Don't post.",
      preheader: "Seriously. Keep it to yourself.",
      lines: ["Your project is probably not ready.", "The feed is fine without it.", "Stay invisible a little longer."],
      tone: "reverse",
    },
    {
      id: "rv02",
      subject: "Keep your work hidden.",
      preheader: "Nobody needs to see it.",
      lines: ["Keep it in drafts.", "Keep it on localhost.", "Keep it secret.", "The feed will survive without your input."],
      tone: "reverse",
    },
    {
      id: "rv03",
      subject: "Stay invisible.",
      preheader: "It's working great so far.",
      lines: ["Zero posts.", "Zero presence.", "Absolutely no one bothering you.", "You've perfected the invisible developer strategy."],
      tone: "reverse",
    },
    {
      id: "rv04",
      subject: "Continue lurking.",
      preheader: "You're very good at it.",
      lines: ["You've been watching the feed for a while.", "Never engaging.", "Never posting.", "You've found your niche."],
      tone: "reverse",
    },
    {
      id: "rv05",
      subject: "Let everyone else get noticed.",
      preheader: "More spotlight for them.",
      lines: ["Other developers will post.", "Get seen.", "Find collaborators.", "You'll watch from the side.", "Perfect plan."],
      tone: "reverse",
    },
    {
      id: "rv06",
      subject: "Don't share your project. Someone might find it useful.",
      preheader: "Terrifying.",
      lines: ["Imagine someone seeing your work.", "Finding it helpful.", "Reaching out.", "Horrible.", "Don't risk it."],
      tone: "absurd",
    },
    {
      id: "rv07",
      subject: "Whatever you do, don't post.",
      preheader: "The feed has enough interesting people already.",
      lines: ["We've hit capacity.", "No room for another developer.", "Especially not one building something good.", "Stay away."],
      tone: "absurd",
    },
    {
      id: "rv08",
      subject: "Keep everything private. Then wonder why nobody knows what you're working on.",
      preheader: "Solid strategy.",
      lines: ["Build in secret.", "Ship in secret.", "Stay in secret.", "Wonder in secret.", "Flawless."],
      tone: "sarcastic",
    },
    {
      id: "rv09",
      subject: "Please don't post on CodeNearby.",
      preheader: "We can't handle more activity.",
      lines: ["The servers are already stressed.", "By all the other developers posting.", "If you add your project too—", "We simply cannot."],
      tone: "absurd",
    },
    {
      id: "rv10",
      subject: "Your project isn't ready.",
      preheader: "It'll never be ready. That's the point.",
      lines: ["Keep polishing.", "Keep tweaking.", "Keep it to yourself.", "Perfect is right around the corner.", "(It isn't.)"],
      tone: "reverse",
    },
    {
      id: "rv11",
      subject: "Your ideas are better off staying in your head.",
      preheader: "Safe and sound. Unseen.",
      lines: ["Safer in there.", "Nobody can criticize what they've never seen.", "Nobody can build on it either.", "Safety first."],
      tone: "reverse",
    },
    {
      id: "rv12",
      subject: "The feed doesn't need you.",
      preheader: "It's managing.",
      lines: ["Other developers are carrying it.", "It's fine.", "It could use you though.", "But you probably shouldn't."],
      tone: "reverse",
    },
    {
      id: "rv13",
      subject: "You're probably not interesting enough to post.",
      preheader: "Hard to know without trying.",
      lines: ["What if nobody cares?", "What if nobody responds?", "What if everyone just scrolls past?", "What if none of that matters?"],
      tone: "reverse",
    },
    {
      id: "rv14",
      subject: "Keep your opinions to yourself.",
      preheader: "Or don't. Up to you.",
      lines: ["Nobody asked what you think.", "About the tools you use.", "The problems you've solved.", "Your approach.", "Although.", "Maybe they would, if you posted."],
      tone: "reverse",
    },
    {
      id: "rv15",
      subject: "Your silence on the feed is a personality.",
      preheader: "Own it.",
      lines: ["Not everyone posts.", "Some people just lurk.", "It's a valid choice.", "Just not a visible one."],
      tone: "sarcastic",
    },
    {
      id: "rv16",
      subject: "Your project is probably too niche anyway.",
      preheader: "Nobody would understand it.",
      lines: ["Probably.", "Although niche problems usually mean niche fans.", "The kind who actually reach out.", "But sure. Too niche."],
      tone: "reverse",
    },
    {
      id: "rv17",
      subject: "Building something. Telling nobody. Genius.",
      preheader: "Big stealth startup energy.",
      lines: ["Operating in total secrecy.", "No posts.", "No updates.", "No visibility.", "Truly the stealthiest startup in existence."],
      tone: "sarcastic",
    },
    {
      id: "rv18",
      subject: "You shouldn't post this weekend.",
      preheader: "You have better things to do.",
      lines: ["Like not posting.", "Which you've been very consistent about.", "Why break the streak now?"],
      tone: "reverse",
    },
    {
      id: "rv19",
      subject: "We're telling you not to post. Definitely don't.",
      preheader: "We mean it.",
      lines: ["Do not open the feed.", "Do not click create post.", "Do not share what you're working on.", "We're absolutely serious."],
      tone: "funny",
    },
    {
      id: "rv20",
      subject: "Protect your ideas. Keep them off the internet.",
      preheader: "Someone might steal them otherwise.",
      lines: ["Sharing = vulnerability.", "Vulnerability = growth.", "Growth = bad apparently.", "Keep protecting those ideas."],
      tone: "absurd",
    },
    {
      id: "rv21",
      subject: "Your draft folder is the safest place for your ideas.",
      preheader: "Nobody can reach you there.",
      lines: ["Drafts don't get feedback.", "Drafts don't get traction.", "Drafts don't get you noticed.", "But they're very safe."],
      tone: "reverse",
    },
    {
      id: "rv22",
      subject: "We recommend staying quiet.",
      preheader: "Less risk. Less reward. Perfect balance.",
      lines: ["No posts.", "No exposure.", "No opportunities.", "But also no rejection.", "Risk-adjusted mediocrity achieved."],
      tone: "sarcastic",
    },
    {
      id: "rv23",
      subject: "Your work-in-progress should stay in progress. Forever.",
      preheader: "Never ship. Never post.",
      lines: ["Why finish?", "Why share?", "The WIP state is comfortable.", "Cozy even.", "Stay there."],
      tone: "reverse",
    },
    {
      id: "rv24",
      subject: "The world is probably not ready for what you're building.",
      preheader: "Or maybe it is. Hard to know without posting.",
      lines: ["Potentially too advanced.", "Possibly too interesting.", "Definitely too unposted.", "Keep it that way."],
      tone: "funny",
    },
    {
      id: "rv25",
      subject: "Don't post. The feed is already too good.",
      preheader: "Adding your project would just make it better. Rude.",
      lines: ["We have enough quality content.", "Adding yours would just raise the bar.", "Unfair to others.", "Stand down."],
      tone: "absurd",
    },
    {
      id: "rv26",
      subject: "Definitely don't post that project you've been sitting on.",
      preheader: "It'll just get attention.",
      lines: ["Attention leads to feedback.", "Feedback leads to improvement.", "Improvement leads to collaboration.", "Terrible chain of events.", "Avoid."],
      tone: "absurd",
    },
    {
      id: "rv27",
      subject: "Lurking is underrated.",
      preheader: "Keep doing it.",
      lines: ["You see everything.", "Nobody sees you.", "The perfect developer.", "Completely invisible.", "Perfectly forgettable."],
      tone: "reverse",
    },
    {
      id: "rv28",
      subject: "No need to post. Everything is fine.",
      preheader: "Your career is fine. Your visibility is fine. All fine.",
      lines: ["Totally fine.", "Everything is under control.", "The invisible developer strategy is working great.", "Definitely."],
      tone: "sarcastic",
    },
    {
      id: "rv29",
      subject: "Keep the mystery alive.",
      preheader: "Who are you? What do you build? Nobody knows.",
      lines: ["Enigmatic developer.", "Unknown output.", "Zero posts.", "Very on-brand."],
      tone: "funny",
    },
    {
      id: "rv30",
      subject: "Don't ruin your streak of not posting.",
      preheader: "It's impressive at this point.",
      lines: ["Days without a post:", "Many.", "We'd hate to see you break it."],
      tone: "reverse",
    },
  ],

  // ── C: FAKE-OUT ─────────────────────────────────────────────────────────────
  fakeout: [
    {
      id: "fo01",
      subject: "Congratulations. You got the job.",
      preheader: "Read before you celebrate.",
      lines: ["Not yet.", "But nobody can hire work they've never seen.", "Post what you're building."],
      tone: "fakeout",
    },
    {
      id: "fo02",
      subject: "Your application has been approved.",
      preheader: "For posting something on CodeNearby.",
      lines: ["Application: Posting on CodeNearby.", "Status: Approved.", "Action required: Actually do it."],
      tone: "notification",
    },
    {
      id: "fo03",
      subject: "Breaking: Your project went viral.",
      preheader: "Wait—",
      lines: ["Impossible.", "You haven't posted it yet.", "Fix that first."],
      tone: "fakeout",
    },
    {
      id: "fo04",
      subject: "Your startup just got funded.",
      preheader: "Not really. But it could.",
      lines: ["Okay, not really.", "But your project still needs a post.", "Investors can't fund what they can't find."],
      tone: "fakeout",
    },
    {
      id: "fo05",
      subject: "Your cofounder has arrived.",
      preheader: "Probably not. Check anyway.",
      lines: ["Probably not.", "Hard to find one when nobody knows what you're building.", "Post. See what happens."],
      tone: "fakeout",
    },
    {
      id: "fo06",
      subject: "We found your next opportunity.",
      preheader: "It's behind the Create Post button.",
      lines: ["It's hidden behind the Create Post button.", "On CodeNearby.", "You've walked past it several times."],
      tone: "fakeout",
    },
    {
      id: "fo07",
      subject: "Someone wants to work with you.",
      preheader: "Maybe.",
      lines: ["Maybe.", "We'll never know if your work stays invisible.", "Post. Find out."],
      tone: "fakeout",
    },
    {
      id: "fo08",
      subject: "Interview scheduled.",
      preheader: "First tell us what you're building.",
      lines: ["Step 1: Tell us what you're building.", "Step 2: Post it on CodeNearby.", "Step 3: We'll talk."],
      tone: "notification",
    },
    {
      id: "fo09",
      subject: "You've been selected.",
      preheader: "To make your first post.",
      lines: ["Selected.", "For what?", "For being a developer who hasn't posted yet.", "The selection process was not competitive."],
      tone: "fakeout",
    },
    {
      id: "fo10",
      subject: "New message from a developer near you.",
      preheader: "This is not that message.",
      lines: ["This is not that message.", "But if you post on the feed, it could lead to one.", "Start there."],
      tone: "dm",
    },
    {
      id: "fo11",
      subject: "Your pull request has been merged.",
      preheader: "Into this email. By mistake.",
      lines: ["Wrong window.", "But while you're here:", "The feed wants a post from you."],
      tone: "absurd",
    },
    {
      id: "fo12",
      subject: "Your build passed.",
      preheader: "The post hasn't been written yet.",
      lines: ["Build: ✓", "Tests: ✓", "Post about it: ✗", "One step remaining."],
      tone: "notification",
    },
    {
      id: "fo13",
      subject: "CodeNearby just recommended you to 47 developers.",
      preheader: "They searched. Found nothing.",
      lines: ["They searched the feed.", "Found nothing from you.", "Because you haven't posted.", "Missed connection."],
      tone: "fakeout",
    },
    {
      id: "fo14",
      subject: "Your side project just got 100 stars.",
      preheader: "In an alternate timeline.",
      lines: ["In the timeline where you posted it.", "This one is still available to you.", "Post. Branch the timeline."],
      tone: "absurd",
    },
    {
      id: "fo15",
      subject: "Your project just got featured.",
      preheader: "Just kidding. Post it first.",
      lines: ["Just kidding.", "We can't feature something we can't see.", "Post it. Then we'll talk."],
      tone: "fakeout",
    },
    {
      id: "fo16",
      subject: "A developer nearby added you.",
      preheader: "Not yet. But they looked.",
      lines: ["Not yet.", "They searched.", "Checked the feed.", "Found no posts from you.", "Moved on."],
      tone: "fakeout",
    },
    {
      id: "fo17",
      subject: "RE: Collaboration request",
      preheader: "This isn't one. But it could be.",
      lines: ["Not a real request.", "But developers on CodeNearby do send these.", "To people they find in the feed.", "You're not in the feed."],
      tone: "dm",
    },
    {
      id: "fo18",
      subject: "Your project is trending.",
      preheader: "On your local machine.",
      lines: ["Trending.", "On your laptop.", "Nowhere else.", "Post it. Expand the trend."],
      tone: "funny",
    },
    {
      id: "fo19",
      subject: "You have 1 unread opportunity.",
      preheader: "It's this email.",
      lines: ["The opportunity:", "Post on CodeNearby.", "See who responds.", "Read: 0.", "Acted on: 0.", "For now."],
      tone: "notification",
    },
    {
      id: "fo20",
      subject: "Action required: Your application to exist on the feed.",
      preheader: "Still pending. Since you joined.",
      lines: ["Status: Pending", "Required action: Create a post.", "Deadline: Before someone else takes your spot."],
      tone: "notification",
    },
    {
      id: "fo21",
      subject: "Your offer letter is ready.",
      preheader: "Not from a company. From the feed.",
      lines: ["From: CodeNearby Feed", "To: You", "Offer: Visibility, connections, maybe a collaborator.", "Condition: Post at least once."],
      tone: "fakeout",
    },
    {
      id: "fo22",
      subject: "Someone just bookmarked your post.",
      preheader: "This is a simulation. Post to make it real.",
      lines: ["Simulated.", "In the real version, you have a post.", "Someone finds it.", "Saves it.", "Reaches out.", "Post to enter the real version."],
      tone: "absurd",
    },
    {
      id: "fo23",
      subject: "You've unlocked a new achievement.",
      preheader: "Zero posts. For an extended period.",
      lines: ["Achievement unlocked:", "Ghost Developer 👻", "Consistent non-presence.", "Criteria: Zero posts.", "Reward: Nothing."],
      tone: "funny",
    },
    {
      id: "fo24",
      subject: "Your deploy succeeded.",
      preheader: "The post didn't.",
      lines: ["Deploy: succeeded.", "Post about it: pending.", "Pending since: you joined.", "Unblock it."],
      tone: "notification",
    },
    {
      id: "fo25",
      subject: "Invitation: Join the CodeNearby feed.",
      preheader: "You already joined. You just never showed up.",
      lines: ["You accepted the invitation.", "Created an account.", "Filled in your details.", "Then never posted.", "The feed is still waiting for the RSVP."],
      tone: "fakeout",
    },
    {
      id: "fo26",
      subject: "Error 404: Your feed posts not found.",
      preheader: "We looked. Thoroughly.",
      lines: ["GET /feed/posts?user=you", "404: Not Found", "Resolution: POST /feed/create", "One request. Fixes everything."],
      tone: "notification",
    },
    {
      id: "fo27",
      subject: "Your code review has been approved.",
      preheader: "By nobody. Because it wasn't posted.",
      lines: ["Reviewed by: nobody.", "Because it was never shared.", "The feed is a low-stakes code review.", "Post. Get actual eyes on it."],
      tone: "fakeout",
    },
    {
      id: "fo28",
      subject: "You've been mentioned in a post.",
      preheader: "Not yet. But post and that changes.",
      lines: ["Not yet.", "You can't be mentioned if you're not known.", "Known = posted.", "Post = known.", "Known = mentioned."],
      tone: "fakeout",
    },
    {
      id: "fo29",
      subject: "Your weekly digest is ready.",
      preheader: "It's empty. You didn't post.",
      lines: ["Digest:", "Posts this week: 0", "Engagement: 0", "Visibility: 0", "To improve this digest, post something."],
      tone: "notification",
    },
    {
      id: "fo30",
      subject: "You matched with a developer.",
      preheader: "This isn't Tinder. But the feed works similarly.",
      lines: ["Not Tinder.", "But there's a developer near you who builds similar things.", "They're on the feed.", "You are not.", "No match possible."],
      tone: "funny",
    },
    {
      id: "fo31",
      subject: "Your repo just hit 1k stars.",
      preheader: "In a parallel universe where you posted about it.",
      lines: ["Parallel universe.", "You posted your project.", "People found it.", "Stars happened.", "This universe is still available."],
      tone: "absurd",
    },
    {
      id: "fo32",
      subject: "You have a new follower.",
      preheader: "A hypothetical one.",
      lines: ["Hypothetical.", "Based on a feed post you haven't made yet.", "Make the post.", "The followers follow."],
      tone: "fakeout",
    },
    {
      id: "fo33",
      subject: "Your project just got featured on the front page.",
      preheader: "Of an imaginary newsletter.",
      lines: ["Imaginary newsletter.", "Imaginary feature.", "Real project.", "Real feed.", "Post it."],
      tone: "absurd",
    },
    {
      id: "fo34",
      subject: "Important update: Your post is live.",
      preheader: "Create it first.",
      lines: ["Update: your post is live!", "Wait—", "You need to create it first.", "Then it'll be live.", "Then this email makes sense."],
      tone: "funny",
    },
    {
      id: "fo35",
      subject: "You've been promoted.",
      preheader: "To developer who actually posts.",
      lines: ["Promotion:", "From: developer who joined CodeNearby.", "To: developer who posts on CodeNearby.", "Effective: When you create a post."],
      tone: "fakeout",
    },
    {
      id: "fo36",
      subject: "Your beta access has been granted.",
      preheader: "To the version of CodeNearby where people know who you are.",
      lines: ["Access granted.", "To the timeline where you post.", "The feed knows you.", "Developers find you.", "Use the access."],
      tone: "absurd",
    },
    {
      id: "fo37",
      subject: "We reviewed your work.",
      preheader: "There wasn't any. On the feed.",
      lines: ["Reviewed.", "Found: zero posts.", "Conclusion: nothing to review.", "Fix the source of the problem."],
      tone: "notification",
    },
    {
      id: "fo38",
      subject: "Breaking news: A developer is building something interesting.",
      preheader: "It might be you. We can't tell. You haven't posted.",
      lines: ["Breaking.", "Developer building something potentially interesting.", "Identity: unknown.", "Reason: hasn't posted yet.", "That developer might be you."],
      tone: "fakeout",
    },
    {
      id: "fo39",
      subject: "Your project shipped.",
      preheader: "Now tell someone.",
      lines: ["You shipped.", "Good.", "Now the feed.", "Shipping without posting is a tree falling in a forest.", "Post."],
      tone: "dm",
    },
    {
      id: "fo40",
      subject: "You just got hired.",
      preheader: "Not today. But the path runs through the feed.",
      lines: ["Not today.", "But: developer posts on feed.", "Someone notices the work.", "Reaches out.", "Something happens.", "Start the chain."],
      tone: "fakeout",
    },
  ],
};

// Flat list
const ALL_VARIANTS = Object.entries(CAMPAIGNS).flatMap(([category, variants]) =>
  variants.map((v) => ({ ...v, category }))
);

function pickVariant(userId) {
  const hash = userId.toString().split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  if (FORCE_CATEGORY && CAMPAIGNS[FORCE_CATEGORY]) {
    const pool = CAMPAIGNS[FORCE_CATEGORY];
    return { ...pool[hash % pool.length], category: FORCE_CATEGORY };
  }
  return ALL_VARIANTS[hash % ALL_VARIANTS.length];
}

// ── Target user selection ─────────────────────────────────────────────────────

async function getTargetUserIds(db) {
  if (TARGET_MODE === "inactive") {
    // Posted before, but not in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentPosters = await db.collection("posts").distinct("userId", {
      createdAt: { $gte: thirtyDaysAgo },
    }).catch(() => []);
    const everPosted = await db.collection("posts").distinct("userId");
    const recentSet = new Set(recentPosters.map((id) => id.toString()));
    const inactive = everPosted.filter((id) => !recentSet.has(id.toString()));
    console.log(`  Target: inactive posters (posted before, not in 30d) — ${inactive.length}`);
    return new Set(inactive.map((id) => id.toString()));
  }

  // Default: never posted
  const everPosted = await db.collection("posts").distinct("userId");
  const postedSet = new Set(everPosted.map((id) => id.toString()));
  console.log(`  Users who ever posted: ${postedSet.size} (excluded from never-posted target)`);
  return { excludeSet: postedSet };
}

// ── Community stats ───────────────────────────────────────────────────────────

async function getFeedStats(db) {
  const [totalPosts, postsToday, activePosters] = await Promise.all([
    db.collection("posts").countDocuments().catch(() => null),
    db.collection("posts").countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }).catch(() => null),
    db.collection("posts").distinct("userId", {
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }).then((r) => r.length).catch(() => null),
  ]);
  return { totalPosts, postsToday, activePosters };
}

// ── HTML builder ──────────────────────────────────────────────────────────────

function buildHtml(name, email, variant, stats, trackingId) {
  const trackedCta = `${APP_URL}/feed?ref=post-nudge&vid=${variant.id}&tid=${trackingId}&action=create`;
  const trackPixel = `${APP_URL}/api/email/track?id=${trackingId}&event=open`;

  // Tone → visual style
  const toneStyles = {
    aggressive:    { border: "#EF4444", tag: "NOTICE",           tagColor: "#EF4444" },
    funny:         { border: "#F59E0B", tag: "HEADS UP",         tagColor: "#F59E0B" },
    sarcastic:     { border: "#8B5CF6", tag: "OBSERVATION",      tagColor: "#8B5CF6" },
    absurd:        { border: "#06B6D4", tag: "IMPORTANT",        tagColor: "#06B6D4" },
    notification:  { border: "#10B981", tag: "SYSTEM",           tagColor: "#10B981" },
    dm:            { border: "#6366F1", tag: "DIRECT MESSAGE",   tagColor: "#6366F1" },
    fomo:          { border: "#FF5C1A", tag: "UPDATE",           tagColor: "#FF5C1A" },
    reverse:       { border: "#71717a", tag: "RECOMMENDATION",   tagColor: "#71717a" },
    fakeout:       { border: "#FF5C1A", tag: "NOTIFICATION",     tagColor: "#FF5C1A" },
  };
  const style = toneStyles[variant.tone] || toneStyles.fakeout;

  // Very short emails — just the punchy lines
  const bodyLines = variant.lines
    .map((line) => `<p style="font-size:16px;color:#d4d4d8;line-height:1.6;margin:0 0 10px;">${line}</p>`)
    .join("");

  // Feed stats bar
  const feedStatItems = [
    stats.postsToday   != null ? [`${stats.postsToday}`, "posts today"] : null,
    stats.activePosters != null ? [`${stats.activePosters}`, "active this week"] : null,
    stats.totalPosts   != null ? [`${stats.totalPosts}+`, "total posts"] : null,
  ]
    .filter(Boolean)
    .map(
      ([val, label]) => `
    <td style="text-align:center;padding:0 14px;">
      <p style="font-size:18px;font-weight:800;color:#fafafa;margin:0 0 2px;">${val}</p>
      <p style="font-size:10px;color:#52525b;margin:0;text-transform:uppercase;letter-spacing:0.5px;">${label}</p>
    </td>`
    )
    .join('<td style="width:1px;background:#1a1a1a;"></td>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${variant.subject}</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${variant.preheader}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#0d0d0d;border-radius:16px;border:1px solid #1f1f1f;border-top:3px solid ${style.border};padding:36px 32px;">

        <!-- Logo -->
        <tr><td style="padding-bottom:24px;border-bottom:1px solid #1a1a1a;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <img src="${APP_URL}/logo.png" alt="CodeNearby" width="28" height="28" style="border-radius:6px;vertical-align:middle;margin-right:8px;" />
                <span style="font-size:14px;font-weight:700;color:#fafafa;vertical-align:middle;">CodeNearby</span>
              </td>
              <td style="text-align:right;">
                <span style="font-size:10px;font-weight:700;color:${style.tagColor};letter-spacing:1.5px;text-transform:uppercase;">${style.tag}</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Main content — short and punchy -->
        <tr><td style="padding:28px 0 24px;">
          ${bodyLines}
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding-bottom:24px;">
          <a href="${trackedCta}" style="display:block;background:${style.border};color:#ffffff;font-size:15px;font-weight:700;padding:14px 24px;border-radius:10px;text-decoration:none;text-align:center;letter-spacing:0.2px;">Post on the feed →</a>
        </td></tr>

        <!-- Feed activity stats -->
        ${feedStatItems ? `
        <tr><td style="background:#111111;border:1px solid #1a1a1a;border-radius:10px;padding:14px 0;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>${feedStatItems}</tr></table>
        </td></tr>` : ""}

        <!-- Footer -->
        <tr><td style="text-align:center;padding-top:20px;margin-top:20px;border-top:1px solid #1a1a1a;">
          <p style="font-size:11px;color:#3f3f46;line-height:1.7;margin:0;">
            CodeNearby &middot;
            <a href="${APP_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#52525b;">Unsubscribe</a>
            &middot;
            <a href="${APP_URL}" style="color:#52525b;">codenearby.space</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>

  <img src="${trackPixel}" width="1" height="1" style="display:none;" alt="" />
</body>
</html>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n=== CodeNearby Feed Activity Campaign ===`);
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"} | Batch: ${BATCH_SIZE} | Target: ${TARGET_MODE}${FORCE_CATEGORY ? ` | Category: ${FORCE_CATEGORY}` : ""}\n`);

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();

  console.log("Building target list...");
  const targetResult = await getTargetUserIds(db);

  const stats = await getFeedStats(db);
  console.log(`  Feed stats: ${stats.postsToday ?? "?"} posts today | ${stats.activePosters ?? "?"} active this week\n`);

  // Build mongo query depending on target mode
  let userQuery;
  if (TARGET_MODE === "inactive") {
    const ids = [...targetResult].map((id) => { try { return new ObjectId(id); } catch { return null; } }).filter(Boolean);
    userQuery = {
      _id: { $in: ids },
      email: { $exists: true, $ne: "" },
      feedNudgeEmailSentAt: { $exists: false },
      emailUnsubscribed: { $ne: true },
    };
  } else {
    // never-posted: exclude everyone who posted
    const excludeIds = [...targetResult.excludeSet].map((id) => { try { return new ObjectId(id); } catch { return null; } }).filter(Boolean);
    userQuery = {
      _id: { $nin: excludeIds },
      email: { $exists: true, $ne: "" },
      feedNudgeEmailSentAt: { $exists: false },
      emailUnsubscribed: { $ne: true },
    };
  }

  const rawUsers = await db
    .collection("users")
    .find(userQuery)
    .sort({ _id: -1 })
    .limit(BATCH_SIZE * 3)
    .project({ _id: 1, email: 1, name: 1 })
    .toArray();

  // Priority users
  const priorityUsers = await db
    .collection("users")
    .find({
      email: { $in: PRIORITY_EMAILS },
      feedNudgeEmailSentAt: { $exists: false },
      emailUnsubscribed: { $ne: true },
    })
    .project({ _id: 1, email: 1, name: 1 })
    .toArray();

  const priorityEmailSet = new Set(priorityUsers.map((u) => u.email));
  const activityUsers = rawUsers.filter((u) => !priorityEmailSet.has(u.email));
  const batch = [...priorityUsers, ...activityUsers.slice(0, BATCH_SIZE - priorityUsers.length)];

  console.log(`Priority: ${priorityUsers.length} | Pool: ${activityUsers.length} | Sending: ${batch.length}\n`);

  if (batch.length === 0) {
    console.log("Nothing to do — all target users already received this campaign.");
    await client.close();
    return;
  }

  const tally = { rage: 0, reverse: 0, fakeout: 0 };
  let sent = 0;
  let errors = 0;

  for (const user of batch) {
    const variant = pickVariant(user._id.toString());
    tally[variant.category] = (tally[variant.category] || 0) + 1;

    const trackingId = `fn-${user._id}-${variant.id}-${Date.now()}`;

    if (DRY_RUN) {
      console.log(`[DRY] ${user.email.padEnd(42)} [${variant.category.padEnd(7)}/${variant.id}] "${variant.subject}"`);
      sent++;
      continue;
    }

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: user.email,
        subject: variant.subject,
        html: buildHtml(user.name, user.email, variant, stats, trackingId),
      });

      await db.collection("users").updateOne(
        { _id: user._id },
        {
          $set: {
            feedNudgeEmailSentAt: new Date(),
            feedNudgeVariantId: variant.id,
            feedNudgeCategory: variant.category,
          },
        }
      );

      sent++;
      console.log(`✓ [${variant.category}/${variant.id}] ${user.email}`);
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      errors++;
      console.error(`✗ ${user.email} — ${err.message}`);
    }
  }

  await client.close();

  console.log(`\n=== Done ===`);
  console.log(`Sent: ${sent} | Errors: ${errors}`);
  console.log(`\nCategory breakdown:`);
  Object.entries(tally).forEach(([cat, count]) =>
    count > 0 && console.log(`  ${cat.padEnd(10)} ${count}x`)
  );
  console.log(`\nTotal variants available: rage=${CAMPAIGNS.rage.length} reverse=${CAMPAIGNS.reverse.length} fakeout=${CAMPAIGNS.fakeout.length}`);
  if (DRY_RUN) console.log(`\nRun with --send to actually deliver emails.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
