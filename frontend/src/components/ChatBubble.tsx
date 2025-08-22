export default function ChatBubble({ role, content }: { role: "user"|"assistant", content: string }) {
    const isUser = role === "user";
    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
        <div className={`${isUser ? "bg-neutral-900 text-white" : "bg-neutral-100"} max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap`}>
          {content}
        </div>
      </div>
    );
  }
  