import { MessageSquareOff } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-12 text-center bg-white dark:bg-black transition-colors duration-300">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-swiss-red translate-x-4 translate-y-4" />
        <div className="relative bg-black dark:bg-white p-8 border-8 border-black dark:border-white transition-colors">
          <MessageSquareOff className="h-24 w-24 text-white dark:text-black italic" />
        </div>
      </div>

      <h2 className="text-6xl font-black uppercase tracking-tighter italic mb-4 text-black dark:text-white">
        SELECT_CHANNEL
      </h2>
      <p className="text-xl font-bold uppercase tracking-tight max-w-md opacity-60 text-black dark:text-white">
        INITIALIZE_COMMUNICATION_BY_SELECTING_AN_ACTIVE_NODE_FROM_THE_REGISTRY_ON_THE_LEFT.
      </p>

      <div className="mt-16 pt-8 border-t-8 border-black dark:border-white w-full max-w-xs opacity-20 transition-colors">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-black dark:text-white">
          SECURE_TERMINAL_V2.0
        </p>
      </div>
    </div>
  );
}
