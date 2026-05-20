export default function MessagesPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 text-center h-full">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: "hsl(24 95% 53% / 0.08)",
          border: "1px solid hsl(24 95% 53% / 0.20)",
        }}
      >
        <svg
          className="w-7 h-7 text-primary/60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <div>
        <h2 className="font-heading text-lg mb-1">Your messages</h2>
        <p className="text-sm text-muted-foreground">
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    </div>
  );
}
