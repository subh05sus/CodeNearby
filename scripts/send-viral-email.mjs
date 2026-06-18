/**
 * Viral Engagement Email Campaign — CodeNearby
 *
 * Sends provocation-first emails to scored users to pull them back to CodeNearby.
 * Three categories: rage (call-out), reverse (reverse psychology), fakeout (bait-and-reveal).
 * No corporate language. No motivation. No newsletters.
 * Each user gets a deterministic variant. Tracks sends via `viralEmailSentAt`.
 *
 * Usage:
 *   node --env-file=.env scripts/send-viral-email.mjs                          # dry-run
 *   node --env-file=.env scripts/send-viral-email.mjs --send                   # live
 *   node --env-file=.env scripts/send-viral-email.mjs --send --batch=50
 *   node --env-file=.env scripts/send-viral-email.mjs --send --category=fakeout
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
      subject: "You joined CodeNearby. Then what?",
      preheader: "Great signup. Mysterious follow-through.",
      lines: ["You signed up.", "That was it.", "No visits. No activity. Nothing.", "The signup was the whole thing apparently."],
      ctaText: "Come back →",
      tone: "aggressive",
    },
    {
      id: "r02",
      subject: "Your account is running on nostalgia.",
      preheader: "The nostalgia of signing up once.",
      lines: ["Nothing new.", "Nothing changed.", "Still running on the energy from signup day.", "That energy has expired."],
      ctaText: "Check what's new →",
      tone: "funny",
    },
    {
      id: "r03",
      subject: "You ghosted a developer community. Again.",
      preheader: "The pattern is clear.",
      lines: ["Signed up.", "Looked around once.", "Disappeared.", "It's a whole thing with you."],
      ctaText: "Break the pattern →",
      tone: "aggressive",
    },
    {
      id: "r04",
      subject: "We've seen unsubscribed users with more presence.",
      preheader: "Low bar. You're below it.",
      lines: ["People who left have more footprint than you.", "Because they at least did something before leaving.", "You just... never came back."],
      ctaText: "Come back and do something →",
      tone: "aggressive",
    },
    {
      id: "r05",
      subject: "CodeNearby has changed. You wouldn't know.",
      preheader: "You haven't been here.",
      lines: ["New features.", "More developers.", "Better feed.", "You missed all of it.", "That's fixable."],
      ctaText: "See what changed →",
      tone: "fomo",
    },
    {
      id: "r06",
      subject: "The developers you should know are on here. You aren't.",
      preheader: "Technically you are. You just never show up.",
      lines: ["Your profile exists.", "You don't.", "There's a difference between having an account and actually being here."],
      ctaText: "Actually show up →",
      tone: "aggressive",
    },
    {
      id: "r07",
      subject: "Your network isn't building itself.",
      preheader: "Radical concept.",
      lines: ["Networks require presence.", "Presence requires showing up.", "Showing up requires opening the app.", "We can help with the last one."],
      ctaText: "Open CodeNearby →",
      tone: "dm",
    },
    {
      id: "r08",
      subject: "You installed the habit. Then uninstalled it.",
      preheader: "Impressive efficiency.",
      lines: ["Most people take weeks to quit a new platform.", "You did it in one visit.", "That's almost impressive."],
      ctaText: "Try again →",
      tone: "funny",
    },
    {
      id: "r09",
      subject: "There are developers 3km from you. You don't know any of them.",
      preheader: "CodeNearby exists for this reason specifically.",
      lines: ["Three kilometres away.", "Building things.", "Looking for people.", "You're not looking."],
      ctaText: "Start looking →",
      tone: "fomo",
    },
    {
      id: "r10",
      subject: "Your developer network has a ghost problem. The ghost is you.",
      preheader: "Spooky.",
      lines: ["You joined.", "You haunted the signup page.", "Then vanished.", "Classic developer ghost arc."],
      ctaText: "Become real →",
      tone: "absurd",
    },
    {
      id: "r11",
      subject: "Okay but why did you sign up?",
      preheader: "Genuinely asking.",
      lines: ["You clearly had a reason.", "Something brought you here.", "That reason still exists.", "Come back to it."],
      ctaText: "Remind yourself →",
      tone: "dm",
    },
    {
      id: "r12",
      subject: "Other developers are making connections you're missing.",
      preheader: "Not hypothetically.",
      lines: ["Real developers.", "Real connections.", "Happening on CodeNearby right now.", "You're reading an email instead."],
      ctaText: "Stop reading. Start connecting. →",
      tone: "aggressive",
    },
    {
      id: "r13",
      subject: "Your city's dev scene is growing. You're not in it.",
      preheader: "Technically you are. Practically you aren't.",
      lines: ["Developers in your city are finding each other.", "Building things together.", "You joined the platform for this.", "Then stopped using it."],
      ctaText: "Get back in it →",
      tone: "fomo",
    },
    {
      id: "r14",
      subject: "You're one visit away from something useful.",
      preheader: "Probably. Maybe. Open and find out.",
      lines: ["One visit.", "Could be a new connection.", "A collaboration opportunity.", "Or just a scroll.", "Still better than this email."],
      ctaText: "Take the visit →",
      tone: "dm",
    },
    {
      id: "r15",
      subject: "The longer you wait, the more you've missed.",
      preheader: "Simple math.",
      lines: ["Every day: new developers.", "New posts.", "New connections forming.", "The gap grows the longer you're away."],
      ctaText: "Stop the gap from growing →",
      tone: "fomo",
    },
    {
      id: "r16",
      subject: "You know about CodeNearby. Most developers don't.",
      preheader: "That advantage is currently doing nothing for you.",
      lines: ["You have early access to something most developers haven't discovered.", "You're not using it.", "That's an unusual choice."],
      ctaText: "Use the advantage →",
      tone: "dm",
    },
    {
      id: "r17",
      subject: "Be honest. When did you last open CodeNearby?",
      preheader: "The silence is the answer.",
      lines: ["Don't count.", "It'll be embarrassing.", "Just open it instead."],
      ctaText: "Open it now →",
      tone: "aggressive",
    },
    {
      id: "r18",
      subject: "Your developer social life is running at 0%.",
      preheader: "Battery icon: empty.",
      lines: ["Zero connections made this month.", "Zero posts.", "Zero visits.", "Zero is a number you can change."],
      ctaText: "Charge it →",
      tone: "funny",
    },
    {
      id: "r19",
      subject: "CodeNearby keeps growing. Your presence in it doesn't.",
      preheader: "The gap is widening.",
      lines: ["Platform growing.", "Developer count growing.", "Activity growing.", "Your profile: static since day one."],
      ctaText: "Grow with it →",
      tone: "fomo",
    },
    {
      id: "r20",
      subject: "You're the developer every platform has. Joined. Never came back.",
      preheader: "You can be different.",
      lines: ["Signed up. Forgotten.", "It's the default.", "The non-default is coming back.", "Be non-default."],
      ctaText: "Be the exception →",
      tone: "dm",
    },
    {
      id: "r21",
      subject: "Your phone has apps you haven't opened in months.",
      preheader: "CodeNearby is becoming one of them.",
      lines: ["You know the apps.", "Good intentions.", "Never opened.", "Don't let CodeNearby join that graveyard."],
      ctaText: "Open it →",
      tone: "funny",
    },
    {
      id: "r22",
      subject: "Developers nearby are actively using what you signed up for.",
      preheader: "And it's working for them.",
      lines: ["They signed up.", "They came back.", "They found people.", "You signed up.", "That's where your story ends currently."],
      ctaText: "Continue your story →",
      tone: "fomo",
    },
    {
      id: "r23",
      subject: "This is your reminder that you have an account.",
      preheader: "You do. You just forgot.",
      lines: ["You signed up.", "It's still there.", "Your profile.", "Your account.", "Waiting.", "Come back to it."],
      ctaText: "I remember now →",
      tone: "notification",
    },
    {
      id: "r24",
      subject: "Your developer connections: 0. Your coffee tabs: more.",
      preheader: "Interesting budget.",
      lines: ["Different kinds of investments.", "Coffee: many.", "Developer network: none.", "One of these compounds over time."],
      ctaText: "Invest in the right one →",
      tone: "funny",
    },
    {
      id: "r25",
      subject: "Some developer in your city is looking for exactly you.",
      preheader: "They won't find you. You're not here.",
      lines: ["Skills you have.", "Experience you carry.", "A developer nearby needs it.", "They're searching CodeNearby.", "You're not there."],
      ctaText: "Be findable →",
      tone: "fomo",
    },
  ],

  // ── B: REVERSE PSYCHOLOGY ───────────────────────────────────────────────────
  reverse: [
    {
      id: "rv01",
      subject: "Don't come back to CodeNearby.",
      preheader: "It's fine. We're managing without you.",
      lines: ["Other developers are handling it.", "The community is growing without you.", "Don't worry about it.", "Stay wherever you are."],
      ctaText: "Fine, I'll check →",
      tone: "reverse",
    },
    {
      id: "rv02",
      subject: "Keep ignoring this platform.",
      preheader: "It's a valid choice. Weird, but valid.",
      lines: ["You've been consistent.", "Haven't been back in a while.", "The consistency is impressive.", "Keep going."],
      ctaText: "Actually, let me look →",
      tone: "reverse",
    },
    {
      id: "rv03",
      subject: "Developers near you don't need to meet you.",
      preheader: "Probably. Hard to know.",
      lines: ["They're finding other people.", "Building their networks.", "Missing out on whoever you are.", "But they're managing."],
      ctaText: "Let them meet me →",
      tone: "reverse",
    },
    {
      id: "rv04",
      subject: "Stay on LinkedIn. It's better here.",
      preheader: "For thought leaders. Not builders.",
      lines: ["Congratulating people on work anniversaries.", "Collecting connections who never speak.", "Feeling productive.", "Don't switch to a platform where things actually happen."],
      ctaText: "Switch →",
      tone: "funny",
    },
    {
      id: "rv05",
      subject: "We recommend you don't open CodeNearby today.",
      preheader: "You'll see things. Meet people. Something might happen.",
      lines: ["Too much risk.", "You might find a collaborator.", "Or a cofounder.", "Or someone who builds what you've been thinking about.", "Dangerous."],
      ctaText: "Risk it →",
      tone: "absurd",
    },
    {
      id: "rv06",
      subject: "The developer community is not for everyone.",
      preheader: "Only for people who show up.",
      lines: ["It requires occasional visits.", "Some scrolling.", "Maybe a message.", "Not everyone has time for that.", "(You do.)"],
      ctaText: "Show up →",
      tone: "reverse",
    },
    {
      id: "rv07",
      subject: "We've been doing fine without your activity.",
      preheader: "Genuinely. Just thought you should know.",
      lines: ["The platform is growing.", "New developers every week.", "Activity up.", "Just, you know.", "You're not part of it.", "But that's fine."],
      ctaText: "Become part of it →",
      tone: "reverse",
    },
    {
      id: "rv08",
      subject: "Don't tell a developer friend about CodeNearby.",
      preheader: "We have enough people. (We don't.)",
      lines: ["We're almost at capacity.", "(We're not.)", "Please don't share this with anyone.", "(Please do.)", "The community is fine as it is.", "(It would be better with your people in it.)"],
      ctaText: "Share it anyway →",
      tone: "absurd",
    },
    {
      id: "rv09",
      subject: "CodeNearby is definitely not the platform you've been looking for.",
      preheader: "Developers finding each other locally? Niche.",
      lines: ["Real developer collaboration? Niche.", "People who actually ship?", "Very niche.", "Not for you probably.", "Unless it is."],
      ctaText: "Check if it's for me →",
      tone: "reverse",
    },
    {
      id: "rv10",
      subject: "Your developer isolation is working perfectly.",
      preheader: "Why fix what isn't broken.",
      lines: ["No connections.", "No collaborators.", "No community.", "Perfectly contained.", "No need to change anything."],
      ctaText: "Change it →",
      tone: "sarcastic",
    },
    {
      id: "rv11",
      subject: "Continue scrolling other platforms.",
      preheader: "Where developers don't actually build things.",
      lines: ["Scroll.", "React to posts.", "Consume content.", "Feel busy.", "Don't come here.", "Where developers do actual things."],
      ctaText: "Do actual things →",
      tone: "reverse",
    },
    {
      id: "rv12",
      subject: "You don't need developer connections.",
      preheader: "You'll figure everything out alone.",
      lines: ["Solo developer.", "No collaboration.", "No shared knowledge.", "Building everything from scratch alone.", "Sustainable."],
      ctaText: "Okay maybe I need them →",
      tone: "reverse",
    },
    {
      id: "rv13",
      subject: "Please don't come back. The servers can't handle it.",
      preheader: "We will absolutely handle it.",
      lines: ["Our infrastructure is incredibly fragile.", "(It isn't.)", "One more active user and everything crashes.", "(It won't.)", "Stay away for our sake.", "(Come back.)"],
      ctaText: "I'll take the risk →",
      tone: "absurd",
    },
    {
      id: "rv14",
      subject: "We strongly advise against opening CodeNearby right now.",
      preheader: "Too much going on. Overwhelming.",
      lines: ["New developers.", "New discussions.", "New projects getting traction.", "It's a lot.", "You should probably avoid it.", "(Open it.)"],
      ctaText: "Open it →",
      tone: "absurd",
    },
    {
      id: "rv15",
      subject: "The developers you'd connect with are probably busy anyway.",
      preheader: "Not worth trying.",
      lines: ["They have things going on.", "Probably.", "Might not have time for new connections.", "Or they might.", "Hard to know without checking."],
      ctaText: "Check →",
      tone: "reverse",
    },
    {
      id: "rv16",
      subject: "Keep CodeNearby as that thing you'll get to eventually.",
      preheader: "The eventually pile is very full.",
      lines: ["Alongside:", "That side project.", "That book.", "That workout routine.", "It'll keep."],
      ctaText: "Move it to now →",
      tone: "funny",
    },
    {
      id: "rv17",
      subject: "Recommend staying away from developer communities.",
      preheader: "You might learn something.",
      lines: ["You might find someone building what you need.", "Might get feedback that changes your direction.", "Might find a collaborator.", "Better to avoid the risk."],
      ctaText: "Take the risk →",
      tone: "reverse",
    },
    {
      id: "rv18",
      subject: "You're probably not missing anything.",
      preheader: "Probably.",
      lines: ["Developers connecting locally: probably nothing useful.", "Projects getting collaborators: probably overrated.", "New conversations: probably not interesting.", "Probably."],
      ctaText: "Check what you're probably missing →",
      tone: "reverse",
    },
    {
      id: "rv19",
      subject: "The CodeNearby community will survive without you.",
      preheader: "But it'd be better with you.",
      lines: ["It's a functioning community.", "Active developers.", "Real discussions.", "It works without you.", "It'd be different with you."],
      ctaText: "Make it different →",
      tone: "reverse",
    },
    {
      id: "rv20",
      subject: "Don't share CodeNearby with that developer friend you were thinking of.",
      preheader: "That friend you thought of just now.",
      lines: ["You thought of someone.", "While reading this.", "A developer friend.", "Don't send it to them.", "(Send it to them.)"],
      ctaText: "Share with them →",
      tone: "funny",
    },
  ],

  // ── C: FAKE-OUT ─────────────────────────────────────────────────────────────
  fakeout: [
    {
      id: "fo01",
      subject: "Congratulations. You got the job.",
      preheader: "Read the next line.",
      lines: ["Not yet.", "But someone on CodeNearby is looking for exactly your skills.", "Funny how that works."],
      ctaText: "See who →",
      tone: "fakeout",
    },
    {
      id: "fo02",
      subject: "Your application has been approved.",
      preheader: "Application: Being a developer who uses CodeNearby.",
      lines: ["Application type: Active CodeNearby member.", "Status: Approved.", "Next step: Actually open it."],
      ctaText: "Complete the application →",
      tone: "notification",
    },
    {
      id: "fo03",
      subject: "Your startup just got funded.",
      preheader: "Alternate universe. But still.",
      lines: ["Wrong universe.", "In this one, the path still runs through meeting the right people.", "Some of them are on CodeNearby."],
      ctaText: "Find the right people →",
      tone: "absurd",
    },
    {
      id: "fo04",
      subject: "You've been shortlisted.",
      preheader: "For being the developer who finally comes back.",
      lines: ["Shortlisted.", "For one of those rare developers who shows up consistently.", "The criteria: open CodeNearby.", "Today."],
      ctaText: "Make the shortlist →",
      tone: "fakeout",
    },
    {
      id: "fo05",
      subject: "Your cofounder has been found.",
      preheader: "Probably not. Possibly yes.",
      lines: ["We can't confirm.", "We don't know your cofounder.", "But developers who find cofounders usually find them somewhere.", "CodeNearby is a somewhere."],
      ctaText: "Go to that somewhere →",
      tone: "fakeout",
    },
    {
      id: "fo06",
      subject: "Interview scheduled. 10:00am.",
      preheader: "Not actually. But you opened it.",
      lines: ["Not a real interview.", "But you opened this email.", "Which means you're awake and looking at things.", "Open CodeNearby next."],
      ctaText: "Open CodeNearby →",
      tone: "funny",
    },
    {
      id: "fo07",
      subject: "RE: Your side project",
      preheader: "Not a real reply. But it got your attention.",
      lines: ["Not a real reply.", "But you opened it.", "Which means your side project is on your mind.", "The CodeNearby feed is a good place for that energy."],
      ctaText: "Take that energy to the feed →",
      tone: "dm",
    },
    {
      id: "fo08",
      subject: "Someone on CodeNearby mentioned you.",
      preheader: "Not yet. But if you showed up more often—",
      lines: ["Not a real notification.", "But the idea that someone might mention your work?", "That only happens if they've seen it.", "Seen it on the feed.", "Your feed presence is currently: zero."],
      ctaText: "Change that →",
      tone: "fakeout",
    },
    {
      id: "fo09",
      subject: "Your project just hit the front page.",
      preheader: "Of an imaginary tech blog. You need a real audience first.",
      lines: ["Imaginary front page.", "Real platform.", "Real developers who'd actually look.", "On CodeNearby.", "Post. Get eyes on it."],
      ctaText: "Get real eyes on it →",
      tone: "absurd",
    },
    {
      id: "fo10",
      subject: "New message: Hey, I saw your project—",
      preheader: "This is not a real message. Yet.",
      lines: ["Not a real message.", "But this is exactly how collaborations start on CodeNearby.", "Someone sees your work.", "They reach out.", "Step one: be seeable."],
      ctaText: "Become seeable →",
      tone: "dm",
    },
    {
      id: "fo11",
      subject: "Invitation to join the founding developer community.",
      preheader: "You already joined. The question is whether you show up.",
      lines: ["You're already in.", "The invitation was accepted when you signed up.", "The question is whether you use what you signed up for."],
      ctaText: "Use it →",
      tone: "fakeout",
    },
    {
      id: "fo12",
      subject: "Your deployment is live.",
      preheader: "The announcement isn't.",
      lines: ["Deployed: yes.", "People who know: you.", "Tell more people.", "CodeNearby is a good place to start."],
      ctaText: "Tell people →",
      tone: "notification",
    },
    {
      id: "fo13",
      subject: "Error: Connection request pending.",
      preheader: "A hypothetical one from a developer who found you on CodeNearby.",
      lines: ["Hypothetical request:", "From: Developer nearby.", "To: You.", "Status: Pending your presence on the feed.", "Resolution: Show up."],
      ctaText: "Show up →",
      tone: "notification",
    },
    {
      id: "fo14",
      subject: "You've been accepted.",
      preheader: "To the version of CodeNearby where you actually use it.",
      lines: ["Accepted.", "To the tier of developers who are actually there.", "Not just registered.", "Actually present.", "Open it to confirm."],
      ctaText: "Confirm →",
      tone: "fakeout",
    },
    {
      id: "fo15",
      subject: "Breaking: Developer in your area ships interesting project.",
      preheader: "It might be you. Unclear. You haven't shown up in a while.",
      lines: ["Identity: unclear.", "Posted it on CodeNearby.", "Got eyes on it.", "We'd like to report on your project next.", "For that we need you here."],
      ctaText: "Get reported on →",
      tone: "fakeout",
    },
    {
      id: "fo16",
      subject: "Your profile views are up.",
      preheader: "In an alternate scenario where you'd been active.",
      lines: ["Alternate scenario:", "You posted on CodeNearby last week.", "Developers saw it.", "Clicked your profile.", "Views went up.", "This scenario is available to you."],
      ctaText: "Enter this scenario →",
      tone: "absurd",
    },
    {
      id: "fo17",
      subject: "Notification: New activity from you.",
      preheader: "This is a simulation.",
      lines: ["Simulated notification.", "Activity: You opened CodeNearby.", "Reaction: People noticed.", "Follow-up: Something happened.", "Make the simulation real."],
      ctaText: "Make it real →",
      tone: "notification",
    },
    {
      id: "fo18",
      subject: "Your open source project just got a contributor.",
      preheader: "In the timeline where you told people about it.",
      lines: ["Different timeline.", "You told people about your project.", "One of them contributed.", "Contributors come after visibility.", "Visibility comes after posting."],
      ctaText: "Start the chain →",
      tone: "absurd",
    },
    {
      id: "fo19",
      subject: "System: You have 1 opportunity waiting.",
      preheader: "It requires you to open CodeNearby.",
      lines: ["Opportunity type: Unspecified.", "Location: CodeNearby.", "Expiry: Unclear.", "Action: Open and find out.", "Risk: Low.", "Reward: Unknown."],
      ctaText: "Claim it →",
      tone: "notification",
    },
    {
      id: "fo20",
      subject: "Your hiring profile has been viewed 47 times.",
      preheader: "This is not your hiring profile. But the feed works the same way.",
      lines: ["Not a hiring profile.", "But on CodeNearby:", "Developers see your posts.", "They see what you build.", "They reach out.", "47 is a hypothetical.", "Start with 1."],
      ctaText: "Get the first view →",
      tone: "fakeout",
    },
    {
      id: "fo21",
      subject: "We found your next collaborator.",
      preheader: "You need to show up to meet them.",
      lines: ["They're on CodeNearby.", "They build adjacent things.", "They're looking.", "You're not there.", "One of you needs to change that.", "It's you."],
      ctaText: "Meet them →",
      tone: "fakeout",
    },
    {
      id: "fo22",
      subject: "Your GitHub README has been read.",
      preheader: "By us. While writing this email. It's good. Tell people.",
      lines: ["We read it.", "You built something.", "The README even explains it clearly.", "Nobody knows.", "CodeNearby is how you fix that."],
      ctaText: "Tell people →",
      tone: "funny",
    },
    {
      id: "fo23",
      subject: "Final notice: Your developer potential is expiring.",
      preheader: "Not really. But urgency is a good motivator.",
      lines: ["Not a real expiry.", "But untapped potential does have a shelf life.", "Not because it expires.", "Because someone else acts on theirs first."],
      ctaText: "Act on yours →",
      tone: "fakeout",
    },
    {
      id: "fo24",
      subject: "Achievement unlocked: Joined a developer community and never returned.",
      preheader: "100% of players achieve this. You can be different.",
      lines: ["Achievement unlocked 🏆", "Signed up. Never came back.", "100% of inactive users have this achievement.", "You don't have to keep it."],
      ctaText: "Lose the achievement →",
      tone: "funny",
    },
    {
      id: "fo25",
      subject: "You have 3 developer connections waiting.",
      preheader: "Theoretically. Based on who's near you and what you build.",
      lines: ["Theoretical number.", "Based on: your location, your skills, who's on CodeNearby.", "Actual number: depends on whether you show up.", "Start the process."],
      ctaText: "Start →",
      tone: "fakeout",
    },
    {
      id: "fo26",
      subject: "RE: That thing you were building",
      preheader: "Did you finish it? Tell us.",
      lines: ["We don't know what it was.", "You never told us.", "But you were building something when you signed up.", "We're curious.", "So are other developers on CodeNearby."],
      ctaText: "Tell us →",
      tone: "dm",
    },
    {
      id: "fo27",
      subject: "Your invite has been accepted.",
      preheader: "Your invite to yourself. To come back to CodeNearby.",
      lines: ["You invited yourself.", "When you signed up.", "The invite has now been accepted.", "By this email.", "Action: Open CodeNearby and follow through."],
      ctaText: "Follow through →",
      tone: "absurd",
    },
    {
      id: "fo28",
      subject: "Matched: Developer nearby, same stack.",
      preheader: "Not Tinder. But the result could be similar.",
      lines: ["Not Tinder.", "But: developer nearby.", "Same stack.", "Looking for people to build with.", "You have an account.", "They don't know you exist."],
      ctaText: "Exist to them →",
      tone: "funny",
    },
    {
      id: "fo29",
      subject: "Your build passed all checks.",
      preheader: "The visibility check failed.",
      lines: ["Code: compiling.", "Tests: passing.", "Visibility: 0.", "One check remaining.", "Open CodeNearby."],
      ctaText: "Pass the final check →",
      tone: "notification",
    },
    {
      id: "fo30",
      subject: "Someone nearby is about to build what you're building.",
      preheader: "Hypothetically. But not impossibly.",
      lines: ["Different developer.", "Same idea.", "Same city.", "On CodeNearby.", "You could be collaborating.", "Or competing.", "Your call."],
      ctaText: "Find out which →",
      tone: "fomo",
    },
  ],
};

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

// ── Scoring ───────────────────────────────────────────────────────────────────

async function scoreUsers(db) {
  const scoreMap = new Map();
  const bump = (id, pts) => scoreMap.set(id.toString(), (scoreMap.get(id.toString()) || 0) + pts);

  const postAuthors    = await db.collection("posts").distinct("userId");
  postAuthors.forEach((id) => bump(id, 5));

  const commenters = await db.collection("posts")
    .aggregate([{ $unwind: "$comments" }, { $group: { _id: "$comments.userId" } }])
    .toArray();
  commenters.forEach((r) => r._id && bump(r._id, 3));

  const msgSenders = await db.collection("messages").distinct("senderId").catch(() => []);
  msgSenders.forEach((id) => bump(id, 4));

  const frSenders   = await db.collection("friendRequests").distinct("senderId");
  frSenders.forEach((id) => bump(id, 2));

  const frReceivers = await db.collection("friendRequests").distinct("receiverId").catch(() => []);
  frReceivers.forEach((id) => bump(id, 2));

  const votedPosts = await db.collection("posts")
    .find({ userVotes: { $exists: true } }).project({ userVotes: 1 }).toArray();
  votedPosts.flatMap((p) => Object.keys(p.userVotes || {})).forEach((id) => bump(id, 1));

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const newUsers = await db.collection("users")
    .distinct("_id", { _id: { $gte: ObjectId.createFromTime(Math.floor(thirtyDaysAgo.getTime() / 1000)) } });
  newUsers.forEach((id) => bump(id, 1));

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentLogins = await db.collection("sessions")
    .distinct("userId", { updatedAt: { $gte: sevenDaysAgo } }).catch(() => []);
  recentLogins.forEach((id) => bump(id, 3));

  return scoreMap;
}

async function getCommunityStats(db) {
  const [totalUsers, newThisWeek] = await Promise.all([
    db.collection("users").countDocuments({ email: { $exists: true } }),
    db.collection("users").countDocuments({
      _id: { $gte: ObjectId.createFromTime(Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000)) },
    }),
  ]);
  return { totalUsers, newThisWeek };
}

// ── HTML builder ──────────────────────────────────────────────────────────────

function buildHtml(name, email, variant, stats, trackingId) {
  const trackedCta = `${APP_URL}?ref=viral-email&vid=${variant.id}&tid=${trackingId}`;
  const trackPixel = `${APP_URL}/api/email/track?id=${trackingId}&event=open`;

  const toneStyles = {
    aggressive:   { border: "#EF4444", tag: "NOTICE",        tagColor: "#EF4444" },
    funny:        { border: "#F59E0B", tag: "HEADS UP",      tagColor: "#F59E0B" },
    sarcastic:    { border: "#8B5CF6", tag: "OBSERVATION",   tagColor: "#8B5CF6" },
    absurd:       { border: "#06B6D4", tag: "IMPORTANT",     tagColor: "#06B6D4" },
    notification: { border: "#10B981", tag: "SYSTEM",        tagColor: "#10B981" },
    dm:           { border: "#6366F1", tag: "DIRECT",        tagColor: "#6366F1" },
    fomo:         { border: "#FF5C1A", tag: "UPDATE",        tagColor: "#FF5C1A" },
    reverse:      { border: "#71717a", tag: "ADVICE",        tagColor: "#71717a" },
    fakeout:      { border: "#FF5C1A", tag: "NOTIFICATION",  tagColor: "#FF5C1A" },
  };
  const style = toneStyles[variant.tone] || toneStyles.fakeout;

  const bodyLines = variant.lines
    .map((line) => `<p style="font-size:16px;color:#d4d4d8;line-height:1.65;margin:0 0 10px;">${line}</p>`)
    .join("");

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
      <table width="500" cellpadding="0" cellspacing="0" style="max-width:500px;width:100%;background:#0d0d0d;border-radius:16px;border:1px solid #1f1f1f;border-top:3px solid ${style.border};padding:32px 28px;">

        <!-- Logo -->
        <tr><td style="padding-bottom:22px;border-bottom:1px solid #1a1a1a;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td>
              <img src="${APP_URL}/logo.png" alt="CodeNearby" width="26" height="26" style="border-radius:6px;vertical-align:middle;margin-right:8px;" />
              <span style="font-size:13px;font-weight:700;color:#fafafa;vertical-align:middle;">CodeNearby</span>
            </td>
            <td style="text-align:right;">
              <span style="font-size:10px;font-weight:700;color:${style.tagColor};letter-spacing:1.5px;text-transform:uppercase;">${style.tag}</span>
            </td>
          </tr></table>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:26px 0 22px;">
          ${bodyLines}
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding-bottom:22px;">
          <a href="${trackedCta}" style="display:block;background:${style.border};color:#ffffff;font-size:14px;font-weight:700;padding:13px 20px;border-radius:9px;text-decoration:none;text-align:center;">${variant.ctaText}</a>
        </td></tr>

        <!-- Subtle stats -->
        <tr><td style="background:#111111;border:1px solid #1a1a1a;border-radius:8px;padding:12px 0;text-align:center;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="text-align:center;padding:0 16px;">
              <p style="font-size:16px;font-weight:800;color:#fafafa;margin:0 0 2px;">${stats.totalUsers?.toLocaleString() ?? "—"}+</p>
              <p style="font-size:10px;color:#52525b;margin:0;text-transform:uppercase;letter-spacing:0.4px;">developers joined</p>
            </td>
            <td style="width:1px;background:#1a1a1a;"></td>
            <td style="text-align:center;padding:0 16px;">
              <p style="font-size:16px;font-weight:800;color:#fafafa;margin:0 0 2px;">${stats.newThisWeek ?? "—"}</p>
              <p style="font-size:10px;color:#52525b;margin:0;text-transform:uppercase;letter-spacing:0.4px;">joined this week</p>
            </td>
          </tr></table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="text-align:center;padding-top:18px;margin-top:18px;border-top:1px solid #1a1a1a;">
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
  console.log(`\n=== CodeNearby Viral Campaign ===`);
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"} | Batch: ${BATCH_SIZE}${FORCE_CATEGORY ? ` | Category: ${FORCE_CATEGORY}` : ""}\n`);

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();

  console.log("Scoring users...");
  const scoreMap = await scoreUsers(db);
  const stats    = await getCommunityStats(db);
  console.log(`  Scored: ${scoreMap.size} users | Community: ${stats.totalUsers} total | ${stats.newThisWeek} new this week\n`);

  const objectIds = [...scoreMap.keys()].map((id) => {
    try { return new ObjectId(id); } catch { return null; }
  }).filter(Boolean);

  const baseFilter = {
    email: { $exists: true, $ne: "" },
    viralEmailSentAt: { $exists: false },
    emailUnsubscribed: { $ne: true },
  };

  const query = objectIds.length > 0
    ? { _id: { $in: objectIds }, ...baseFilter }
    : baseFilter;

  const rawUsers = await db.collection("users")
    .find(query).limit(BATCH_SIZE * 3).project({ _id: 1, email: 1, name: 1 }).toArray();

  const priorityUsers = await db.collection("users")
    .find({ email: { $in: PRIORITY_EMAILS }, viralEmailSentAt: { $exists: false }, emailUnsubscribed: { $ne: true } })
    .project({ _id: 1, email: 1, name: 1 })
    .toArray();

  const priorityEmailSet = new Set(priorityUsers.map((u) => u.email));
  rawUsers.sort((a, b) => (scoreMap.get(b._id.toString()) || 0) - (scoreMap.get(a._id.toString()) || 0));
  const activityUsers = rawUsers.filter((u) => !priorityEmailSet.has(u.email));
  const batch = [...priorityUsers, ...activityUsers.slice(0, BATCH_SIZE - priorityUsers.length)];

  console.log(`Priority: ${priorityUsers.length} | Pool: ${activityUsers.length} | Sending: ${batch.length}\n`);

  if (batch.length === 0) {
    console.log("Nothing to do — all scored users already received this campaign.");
    await client.close();
    return;
  }

  const tally = { rage: 0, reverse: 0, fakeout: 0 };
  let sent = 0;
  let errors = 0;

  for (const user of batch) {
    const variant = pickVariant(user._id.toString());
    tally[variant.category] = (tally[variant.category] || 0) + 1;

    const trackingId = `ve-${user._id}-${variant.id}-${Date.now()}`;

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
        { $set: { viralEmailSentAt: new Date(), viralEmailVariantId: variant.id, viralEmailCategory: variant.category } }
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
    count > 0 && console.log(`  ${cat.padEnd(10)} ${count}x (${CAMPAIGNS[cat].length} variants)`)
  );
  if (DRY_RUN) console.log(`\nRun with --send to actually deliver emails.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
