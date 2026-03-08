import { ChatList } from "@/components/chat-list";
import type React from "react";
import SwissSection from "@/components/swiss/SwissSection";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-6rem)] -mx-4 -my-8 overflow-hidden">
      <div className="w-full md:w-1/3 lg:w-1/4 border-b-8 md:border-b-0 md:border-r-8 border-swiss-black bg-swiss-white flex flex-col h-full shadow-[8px_0_0_0_rgba(0,0,0,0.05)]">
        <div className="p-8 border-b-8 border-swiss-black bg-swiss-black">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic text-swiss-white">
            COMMUNICATIONS
          </h1>
        </div>
        <div className="flex-grow overflow-y-auto scrollbar-hide">
          <ChatList />
        </div>
      </div>
      <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col bg-swiss-muted/10 relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        {children}
      </div>
    </div>
  );
}
