import { ChatList } from "@/components/chat-list";
import type React from "react";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-9rem)] -my-8">
      <div className="w-1/3 md:w-1/4 border-r border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="h-full flex flex-col">
          <h1 className="text-2xl font-bold p-4 border-b border-gray-200 dark:border-gray-800">
            Messages
          </h1>
          <div className="flex-grow overflow-y-auto">
            <ChatList />
          </div>
        </div>
      </div>
      <div className="w-2/3 md:w-3/4 flex flex-col">{children}</div>
    </div>
  );
}
