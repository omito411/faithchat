export type Msg = { role: "user"|"assistant"; content: string };

export async function* streamChat(
  backendUrl: string,
  messages: Msg[]
) {
  const res = await fetch(`${backendUrl}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const frames = buf.split("\n\n");
    buf = frames.pop() || "";
    for (const f of frames) {
      if (!f.startsWith("data:")) continue;
      const payload = f.slice(5);
      if (payload === "[DONE]") return;
      if (payload.startsWith("__ERROR__")) throw new Error(payload.replace("__ERROR__ ", ""));
      yield payload;
    }
  }
}
