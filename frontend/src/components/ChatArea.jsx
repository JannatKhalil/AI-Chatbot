import { useState, useRef, useEffect } from "react";
import {
getChatMessages,
saveChatMessage,
getAIResponse,
renameChat,
createChat,
} from "../services/api";

function ChatArea({
activeChatId,
token,
onChatRenamed,
onEnsureChat,
}) {
const [message, setMessage] = useState("");
const [messages, setMessages] = useState([]);
const [loading, setLoading] = useState(false);
const [sending, setSending] = useState(false);
const [creatingChat, setCreatingChat] = useState(false);
const [error, setError] = useState("");

const messagesEndRef = useRef(null);
const inputRef = useRef(null);
const activeChatRef = useRef(activeChatId);

activeChatRef.current = activeChatId;

// Restore a suggestion after a new chat is created
useEffect(() => {
const pendingPrompt = sessionStorage.getItem("jannat_pending_prompt");

if (pendingPrompt) {
  sessionStorage.removeItem("jannat_pending_prompt");
  setMessage(pendingPrompt);
  inputRef.current?.focus();
}

}, []);

// Load messages when the selected chat changes
useEffect(() => {
let cancelled = false;

async function loadMessages() {
  if (!activeChatId || !token) {
    setMessages([]);
    setError("");
    setLoading(false);
    return;
  }

  setLoading(true);
  setError("");
  setMessages([]);

  try {
    const data = await getChatMessages(activeChatId, token);

    if (!cancelled) {
      setMessages(
        (data.messages || []).map((msg) => ({
          ...msg,
          id: msg.id || crypto.randomUUID(),
        }))
      );
    }
  } catch {
    if (!cancelled) {
      setError("Couldn't load messages. Please try again.");
    }
  } finally {
    if (!cancelled) setLoading(false);
  }
}

loadMessages();

return () => {
  cancelled = true;
};

}, [activeChatId, token]);

// Focus the input when a chat is ready
useEffect(() => {
if (activeChatId && !loading) {
inputRef.current?.focus();
}
}, [activeChatId, loading]);

// Scroll messages, not the whole page
useEffect(() => {
messagesEndRef.current?.scrollIntoView({
behavior: "smooth",
block: "end",
});
}, [messages, sending]);

const handleSend = async (e) => {
e.preventDefault();

const text = message.trim();

if (
  !text ||
  !activeChatId ||
  !token ||
  sending ||
  loading ||
  creatingChat
) {
  return;
}

const chatId = activeChatId;
const isFirstMessage = messages.length === 0;

setSending(true);
setError("");
setMessage("");

const userMessage = {
  id: crypto.randomUUID(),
  role: "user",
  content: text,
};

try {
  await saveChatMessage(chatId, "user", text, token);

  if (activeChatRef.current === chatId) {
    setMessages((prev) => [...prev, userMessage]);
  }

  if (isFirstMessage) {
    const title =
      text.length > 40 ? `${text.slice(0, 40)}...` : text;

    try {
      await renameChat(chatId, title, token);
      onChatRenamed?.(chatId, title);
    } catch (err) {
      console.error("Chat rename failed:", err);
    }
  }

  const response = await getAIResponse(chatId, text, token);

  const reply =
    typeof response === "string"
      ? response
      : response?.response ??
        response?.message ??
        response?.answer ??
        "";

  if (!reply) {
    throw new Error("The AI returned an empty response.");
  }

  await saveChatMessage(chatId, "assistant", reply, token);

  if (activeChatRef.current === chatId) {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
      },
    ]);
  }
} catch (err) {
  setError(
    err.message || "Something went wrong. Please try again."
  );
} finally {
  setSending(false);

  if (activeChatRef.current === chatId) {
    inputRef.current?.focus();
  }
}

};

const handleKeyDown = (e) => {
if (
e.key === "Enter" &&
!e.shiftKey &&
!e.nativeEvent.isComposing
) {
e.preventDefault();
handleSend(e);
}
};

const suggestions = [
{
icon: "✿",
title: "Ask anything",
description: "Get answers to your questions",
prompt: "Help me understand a topic step by step.",
color: "bg-[#F5E5EB]",
},
{
icon: "✧",
title: "Learn something",
description: "Explore a new topic",
prompt: "Teach me something interesting today.",
color: "bg-[#E8DFF3]",
},
{
icon: "♡",
title: "Write & create",
description: "Bring your ideas to life",
prompt: "Help me brainstorm creative ideas.",
color: "bg-[#F4E8D8]",
},
{
icon: "❀",
title: "Explore ideas",
description: "Think through something new",
prompt: "Let's explore a new topic and discover interesting ideas.",
color: "bg-[#E2EADF]",
},
];

// Fill the composer, creating a chat first if necessary
const handleSuggestionClick = async (prompt) => {
if (loading || sending || creatingChat || !token) return;

if (activeChatId) {
  setMessage(prompt);
  inputRef.current?.focus();
  return;
}

if (!onEnsureChat) {
  setError("Couldn't create a chat. Please start a new chat.");
  return;
}

setCreatingChat(true);
setError("");

try {
  const data = await createChat("New Chat", token);

  if (!data?.chat_id) {
    throw new Error("Chat creation returned no chat ID.");
  }

  // Save the prompt before activating the new chat.
  // App.jsx changes the ChatArea key when the chat ID changes.
  sessionStorage.setItem("jannat_pending_prompt", prompt);
  onEnsureChat(data);
} catch (err) {
  sessionStorage.removeItem("jannat_pending_prompt");
  setError(err.message || "Couldn't create a new chat. Please try again.");
} finally {
  setCreatingChat(false);
}

};

return (
<main className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#F3E5CF] text-[#432D3C]">
<header className="flex shrink-0 items-center justify-between border-b border-[#E5D3BC] bg-[#FFF4E2] px-4 py-3 sm:px-8 sm:py-4">
<div className="flex items-center gap-3">
<div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[#D8C4E8] bg-[#EEE4F5]">
<img
           src="/jannat-logo.png"
           alt="Jannat"
           className="block h-full w-full rounded-full object-cover object-center"
         />
</div>

      <div>
        <h1 className="text-lg font-bold tracking-tight">
          General Chatbot
        </h1>
        <p className="text-xs text-[#897486]">
          Your Intelligent AI Companion
        </p>
      </div>
    </div>

    <div className="hidden items-center gap-2 rounded-full border border-[#E2D5E8] bg-[#F0E8F5] px-3 py-2 text-xs font-medium text-[#725477] sm:flex">
      <span className="h-2 w-2 rounded-full bg-[#8DAD8A]" />
      AI Assistant
    </div>
  </header>

  <section className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-[#F3E5CF] px-4 py-5 sm:px-8 sm:py-6">
    {messages.length === 0 && !loading ? (
      <div className="m-auto w-full max-w-3xl py-4 sm:py-8">
        <div className="mb-5 flex justify-center">
          <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-[#D8C4E8] bg-[#EEE4F5] p-1 shadow-sm">
            <img
              src="/jannat-logo.png"
              alt="Jannat"
              className="h-full w-full rounded-full object-cover object-center"
            />
          </div>
        </div>

        <div className="mb-3 text-center text-sm font-semibold tracking-wide text-[#936D91]">
          A LITTLE SPACE FOR BIG IDEAS
        </div>

        <h2 className="text-center text-2xl font-bold leading-tight sm:text-4xl">
          Assalam-o-Alaikum!
          <span className="mt-2 block text-[#81577E]">
            I'm Jannat <span className="text-[#D88BA9]">♡</span>
          </span>
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-7 text-[#806E7D] sm:text-base">
          I'm your intelligent AI companion. Ask me anything.
          I'm here to help you learn, create, and explore new ideas.
        </p>

        <div className="mt-7 grid grid-cols-1 gap-3 sm:mt-9 sm:grid-cols-2">
          {suggestions.map((item) => (
            <button
              type="button"
              key={item.title}
              onClick={() => handleSuggestionClick(item.prompt)}
              disabled={loading || sending || creatingChat}
              className={`${item.color} rounded-2xl border border-white/70 p-4 text-left transition duration-200 hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#B79BC8] disabled:cursor-wait disabled:opacity-70 sm:p-5`}
            >
              <span className="text-2xl text-[#81577E]">
                {item.icon}
              </span>

              <h3 className="mt-3 font-semibold text-[#543B50]">
                {item.title}
              </h3>

              <p className="mt-1 text-sm text-[#806E7D]">
                {creatingChat ? "Preparing your chat..." : item.description}
              </p>
            </button>
          ))}
        </div>

        {!activeChatId && (
          <p className="mt-6 text-center text-xs text-[#9B8998]">
            {creatingChat
              ? "Creating your chat ♡"
              : "Choose a card to get started ♡"}
          </p>
        )}
      </div>
    ) : (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        {loading && (
          <p className="text-center text-sm text-[#8B7488]">
            Loading your conversation...
          </p>
        )}

        {messages.map((msg) => {
          const isUser =
            msg.role === "user" || msg.role === "human";

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="mt-1 h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#DDCAE8] bg-[#EEE4F5]">
                  <img
                    src="/jannat-logo.png"
                    alt="Jannat"
                    className="h-full w-full rounded-full object-cover object-center"
                  />
                </div>
              )}

              <div
                className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm sm:max-w-[80%] ${
                  isUser
                    ? "rounded-tr-sm bg-[#81577E] text-white"
                    : "rounded-tl-sm border border-[#E9D8C5] bg-[#FFF8ED] text-[#493747]"
                }`}
              >
                {msg.content ?? msg.message ?? ""}
              </div>

              {isUser && (
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E7D8ED] text-sm font-bold text-[#694B70]">
                  J
                </div>
              )}
            </div>
          );
        })}

        {sending && (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#DDCAE8] bg-[#EEE4F5]">
              <img
                src="/jannat-logo.png"
                alt="Jannat"
                className="h-full w-full rounded-full object-cover object-center"
              />
            </div>

            <div className="rounded-2xl rounded-tl-sm border border-[#E9D8C5] bg-[#FFF8ED] px-4 py-3 text-sm text-[#8B7488]">
              Thinking<span className="animate-pulse"> ...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    )}
  </section>

  {error && (
    <div className="shrink-0 bg-[#F3E5CF] px-4 pb-2 sm:px-8">
      <p className="mx-auto max-w-3xl rounded-xl border border-[#E7B9C8] bg-[#F9E8ED] px-4 py-3 text-sm text-[#873D59]">
        {error}
      </p>
    </div>
  )}

  <footer className="z-10 shrink-0 border-t border-[#E5D3BC] bg-[#FFF4E2] px-3 pb-2 pt-3 sm:px-8 sm:pb-3 sm:pt-4">
    <form
      onSubmit={handleSend}
      className="mx-auto flex w-full max-w-3xl items-end gap-3 rounded-2xl border border-[#E0D0E4] bg-[#FFFCF7] p-2 shadow-sm focus-within:border-[#B79BC8] focus-within:ring-2 focus-within:ring-[#E8DDF2]"
    >
      <textarea
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          activeChatId
            ? "Message your AI companion..."
            : "Choose a welcome card to begin..."
        }
        disabled={!activeChatId || sending || loading || creatingChat}
        rows={1}
        className="max-h-32 min-h-11 flex-1 resize-y bg-transparent px-3 py-3 text-sm text-[#432D3C] outline-none placeholder:text-[#A394A2] disabled:cursor-not-allowed"
      />

      <button
        type="submit"
        disabled={
          !message.trim() ||
          !activeChatId ||
          sending ||
          loading ||
          creatingChat
        }
        aria-label="Send message"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#81577E] text-lg text-white shadow-sm transition hover:bg-[#694568] disabled:cursor-not-allowed disabled:opacity-40"
      >
        ↑
      </button>
    </form>

    <p className="mt-2 text-center text-[10px] tracking-wide text-[#8F7B89] sm:mt-3 sm:text-[11px]">
      General Chatbot · Good ideas bloom here ♡
    </p>
  </footer>
</main>

);
}

export default ChatArea;