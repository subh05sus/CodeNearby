"use client";
import Image from "next/image";
import React from "react";

export function Why() {
  return (
    <div className="w-full py-32 px-8 bg-black dark:bg-neutral-950 text-white swiss-noise border-t-8 border-swiss-red">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24 flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-white dark:border-neutral-800 pb-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.5em] text-swiss-red mb-4">Core Analysis</p>
            <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tightest leading-none">
              WHY<br />CODENEARBY.
            </h2>
          </div>
          <div className="mt-8 md:mt-0 max-w-sm text-right">
            <p className="text-xl font-bold uppercase tracking-widest italic opacity-60 dark:opacity-40">Objective connectivity protocols for the modern developer.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white dark:bg-neutral-800 border-4 border-white dark:border-neutral-800">
          {data.map((item, index) => (
            <div key={index} className="bg-black dark:bg-black p-8 group hover:bg-swiss-red dark:hover:bg-swiss-red transition-colors relative overflow-hidden h-[500px] flex flex-col">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-swiss-red group-hover:text-black dark:group-hover:text-white mb-4 transition-colors">Section_{index + 1}</p>
                <h3 className="text-3xl font-black uppercase tracking-tightest mb-6 leading-none text-white">{item.title}</h3>
                <p className="text-sm font-bold uppercase tracking-widest opacity-60 dark:opacity-40 group-hover:opacity-100 transition-opacity leading-relaxed italic text-white">
                  {item.description}
                </p>
              </div>

              <div className="mt-auto relative h-48 border-t-2 border-white/20 dark:border-white/10 pt-8 grayscale group-hover:grayscale-0 transition-all duration-500 overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const data = [
  {
    category: "Networking",
    title: "Find Developers Near You.",
    description: "Your next coding partner is just a geographical coordinate away. Connecting human capital across local technical spheres.",
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=3000&auto=format&fit=crop",
  },
  {
    category: "Collaboration",
    title: "Build Projects Together.",
    description: "Great projects require synchronized teams. Identify collaborators with matching technical signatures.",
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=3000&auto=format&fit=crop",
  },
  {
    category: "Feed & Discussions",
    title: "Share Knowledge Snippets.",
    description: "Asynchronous technical discourse. Exchange logic, post polls, and validate ideas within the network.",
    src: "https://images.unsplash.com/photo-1554177255-61502b352de3?q=80&w=3000&auto=format&fit=crop",
  },
  {
    category: "Messaging",
    title: "Direct Data Exchange.",
    description: "Real-time communication lines. Share resources and brainstorm concepts within a secure environment.",
    src: "https://images.unsplash.com/photo-1611511574646-3c5a5824e12b?q=80&w=3000&auto=format&fit=crop",
  },
  {
    category: "Gatherings",
    title: "Live Interaction Nodes.",
    description: "Physical and virtual synchronization events. Tech talks and coding sessions mapped to your location.",
    src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=3000&auto=format&fit=crop",
  },
  {
    category: "Hackathons",
    title: "Competitive Logic.",
    description: "High-intensity development challenges. Team formation and execution protocols for hackathon events.",
    src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=3000&auto=format&fit=crop",
  },
];
