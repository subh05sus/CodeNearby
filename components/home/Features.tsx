"use client";

import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  MessageCircle,
  Github,
  Globe,
  MessagesSquareIcon,
  Bot,
} from "lucide-react";

function Features() {
  return (
    <section className="mb-24 cursor-default">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
          Features
        </p>
        <h2 className="text-3xl md:text-5xl font-heading tracking-tight">
          Everything you need to connect
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hero card — spans 2 cols */}
        <motion.div
          whileHover={{ scale: 1.005 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="md:col-span-2 group relative bg-card border border-border hover:border-primary/30 rounded-2xl p-8 transition-colors duration-300 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full -translate-y-1/2 translate-x-1/3 bg-primary/5 group-hover:bg-primary/8 transition-colors duration-500" />
          <Users className="w-10 h-10 text-primary mb-5 relative z-10" />
          <h3 className="text-2xl font-heading mb-3 relative z-10">
            Discover Developers
          </h3>
          <p className="text-muted-foreground leading-relaxed max-w-md relative z-10 text-sm">
            Find developers nearby by location, skills, and interests. Your next
            coding partner, co-founder, or mentor is closer than you think.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 relative z-10">
            {["React", "Python", "TypeScript", "Rust", "Go", "Solidity"].map(
              (tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2.5 py-1 rounded-full border font-medium text-primary"
                  style={{
                    borderColor: "hsl(24 95% 53% / 0.3)",
                    background: "hsl(24 95% 53% / 0.07)",
                  }}
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </motion.div>

        <SmallCard
          icon={Bot}
          title="AI-Connect"
          description="Natural conversations to find GitHub developers by skill, location, or vibe."
        />

        <SmallCard
          icon={Github}
          title="GitHub Integration"
          description="Sync your profile, showcase projects, find devs with matching coding interests."
        />

        <SmallCard
          icon={MessageSquare}
          title="Discussions"
          description="Debug together, share ideas, and grow with your local developer community."
        />

        <SmallCard
          icon={Globe}
          title="Global Community"
          description="Connect globally, collaborate locally. Build your network without borders."
        />

        {/* Second wide card — now cleanly starts row 3 */}
        <motion.div
          whileHover={{ scale: 1.005 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="md:col-span-2 group bg-card border border-border hover:border-primary/30 rounded-2xl p-8 transition-colors duration-300"
        >
          <div className="flex items-start gap-8">
            <div className="flex-1">
              <MessagesSquareIcon className="w-10 h-10 text-primary mb-5" />
              <h3 className="text-xl font-heading mb-3">Virtual Gatherings</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Join online meetups, pair programming sessions, and code reviews
                with developers in your timezone.
              </p>
            </div>
            <div className="hidden md:flex flex-col gap-3 mt-1 flex-shrink-0">
              {["Pair coding", "Code review", "Hackathon", "Study group"].map(
                (item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </motion.div>

        <SmallCard
          icon={MessageCircle}
          title="Direct Messaging"
          description="Chat one-on-one. Share GitHub links, code snippets, and ideas in real time."
        />
      </div>
    </section>
  );
}

function SmallCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="group bg-card border border-border hover:border-primary/30 rounded-2xl p-6 transition-colors duration-300"
    >
      <Icon className="w-8 h-8 text-primary mb-4 transition-transform duration-300 group-hover:scale-110" />
      <h3 className="text-lg font-heading mb-2 group-hover:text-primary transition-colors duration-200">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

export default Features;
