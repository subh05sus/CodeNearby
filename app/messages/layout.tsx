import { ChatList } from "@/components/chat-list";
import type React from "react";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-[calc(100dvh-8rem)] -my-8 overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-80 lg:w-72 flex-shrink-0 border-b md:border-b-0 md:border-r border-border flex flex-col md:h-full h-[40vh]">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border flex-shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "hsl(24 95% 53% / 0.12)" }}
          >
            <svg
              className="w-3.5 h-3.5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h1 className="font-heading text-base">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ChatList />
        </div>
      </div>
      {/* Chat area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
