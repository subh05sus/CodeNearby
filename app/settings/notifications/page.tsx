import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Notification Settings | CodeNearby",
};

export default function NotificationSettingsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full space-y-6">

        <div className="space-y-1">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Settings / Notifications
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Unsubscribe from emails
          </h1>
        </div>

        <div className="rounded-xl border border-dashed p-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Ah yes. The unsubscribe button. A cornerstone of modern email etiquette.
            A fundamental human right. A feature so basic that literally every email
            platform has had it since 1997.
          </p>
          <p>
            We don&apos;t have it yet.
          </p>
          <p>
            But here&apos;s the good news — CodeNearby is <span className="text-foreground font-medium">open source</span>.
            Which means you, yes you, the person who just clicked unsubscribe,
            have the rare and exclusive opportunity to build the very feature
            you&apos;re trying to use right now.
          </p>
          <p>
            Think of it as paying it forward. Future you will be grateful.
            Future strangers will be grateful. The entire mailing list will
            be grateful.
          </p>
          <p className="text-foreground/50 italic text-xs">
            (We sent you an email specifically asking you to help grow this community.
            The irony of you wanting to unsubscribe is not lost on us.)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="https://github.com/subh05sus/CodeNearby"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-4 py-2 text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Build the unsubscribe feature
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-xs font-medium hover:bg-muted transition-colors"
          >
            Take me back, I changed my mind
          </Link>
        </div>

        <p className="text-xs text-muted-foreground/50">
          Alternatively, reply to the email and tell us to remove you. We&apos;re humans. We&apos;ll do it.
        </p>

      </div>
    </div>
  );
}
