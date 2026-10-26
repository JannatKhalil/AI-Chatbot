import { useState, useRef, useEffect } from "react";
import {
  getChatMessages,
  saveChatMessage,
  getAIResponse,
  renameChat,
} from "../services/api";

function ChatArea({ activeChatId, token, onChatRenamed }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const activeChatRef = useRef(activeChatId);

  activeChatRef.current = activeChatId;

  // LOAD SAVED MESSAGES
  useEffect(() => {
    if (!activeChatId || !token) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    const loadMessages = async () => {
      setLoading(true);
      setError("");
      setMessages([]);

      try {
        const data = await getChatMessages(activeChatId, token);

        if (!cancelled) {
          setMessages(
            data.messages.map((msg) => ({
              ...msg,
              id: crypto.randomUUID(),
            }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [activeChatId, token]);

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  // SEND MESSAGE
  const handleSend = async (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (
      !trimmedMessage ||
      !activeChatId ||
      !token ||
      sending ||
      loading
    ) {
      return;
    }

    const chatId = activeChatId;
    const isFirstMessage = messages.length === 0;

    setSending(true);
    setError("");

    try {
      // STEP 1: SAVE USER MESSAGE
      await saveChatMessage(
        chatId,
        "user",
        trimmedMessage,
        token
      );

      // STEP 2: AUTOMATIC CHAT TITLE
      if (isFirstMessage) {
        const title =
          trimmedMessage.length > 40
            ? trimmedMessage.slice(0, 40).trimEnd() + "..."
            : trimmedMessage;

        try {
          await renameChat(chatId, title, token);
          onChatRenamed?.(chatId, title);
        } catch (renameError) {
          console.error(
            "Automatic title failed:",
            renameError
          );
        }
      }

      // STEP 3: DISPLAY USER MESSAGE
      if (activeChatRef.current === chatId) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: crypto.randomUUID(),
            role: "user",
            content: trimmedMessage,
          },
        ]);
      }

      setMessage("");

      // STEP 4: GET AI REPLY
      const aiReply = await getAIResponse(
        trimmedMessage,
        token
      );

      // STEP 5: SAVE AI REPLY
      await saveChatMessage(
        chatId,
        "assistant",
        aiReply,
        token
      );

      // STEP 6: DISPLAY AI REPLY
      if (activeChatRef.current === chatId) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: aiReply,
          },
        ]);
      }
    } catch (err) {
      if (activeChatRef.current === chatId) {
        setError(err.message);
      }
    } finally {
      setSending(false);
    }
  };

  // ENTER TO SEND, SHIFT + ENTER FOR NEW LINE
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();

      if (message.trim() && !sending && !loading) {
        e.currentTarget.form.requestSubmit();
      }
    }
  };

  return (
    <main className="flex-1 min-w-0 flex flex-col h-dvh overflow-hidden bg-gradient-to-br from-purple-50 via-violet-100 to-purple-100 text-purple-950">

      {/* HEADER */}
      <header className="shrink-0 pl-16 pr-4 py-3 md:px-8 md:py-5 border-b border-purple-200 bg-[#FAF3EB] backdrop-blur-md flex items-center justify-between shadow-sm">

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 bg-gradient-to-br from-purple-500 to-violet-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md shadow-purple-200">
            <span className="text-white text-xl sm:text-2xl">✦</span>
          </div>

          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-purple-950">
              Jannat AI
            </h1>

            <p className="text-[10px] sm:text-xs text-purple-500 truncate">
              Your intelligent assistant
            </p>
          </div>
        </div>

        <span className="hidden sm:flex items-center gap-2 bg-purple-100 text-purple-600 text-xs font-medium px-4 py-2 rounded-full border border-purple-200">
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          Chat Interface
        </span>
      </header>

      {/* CHAT MESSAGES */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-6 py-5 sm:py-8">

        {loading ? (
          <div className="h-full flex items-center justify-center text-purple-600">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (

          /* WELCOME SCREEN */
          <div className="min-h-full flex flex-col items-center justify-center text-center py-6">

            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-400 via-violet-500 to-purple-700 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl shadow-purple-200 mb-5 sm:mb-7">
              <span className="text-3xl sm:text-5xl text-white">✦</span>
            </div>

            <div className="inline-flex items-center gap-2 bg-[#FFF7ED] border border-purple-200 rounded-full px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-semibold text-purple-600 mb-4 sm:mb-5 shadow-sm">
              ✨ YOUR PERSONAL AI ASSISTANT
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-purple-950 mb-4">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-purple-500 to-violet-700 bg-clip-text text-transparent">
                Jannat AI
              </span>
            </h2>

            <p className="text-purple-600 text-sm sm:text-base max-w-lg leading-relaxed px-2">
              Your space to explore ideas, ask questions, and discover
              something new. What would you like to talk about today?
            </p>

            {/* FEATURE CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-10 w-full max-w-2xl">

              <div className="bg-[#FFF7ED] border border-purple-200 rounded-2xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">💡</div>
                <h3 className="font-bold text-purple-900 text-sm">
                  Explore Ideas
                </h3>
                <p className="text-xs text-purple-500 mt-1 sm:mt-2">
                  Discover new perspectives
                </p>
              </div>

              <div className="bg-[#FFF7ED] border border-purple-200 rounded-2xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📚</div>
                <h3 className="font-bold text-purple-900 text-sm">
                  Learn Anything
                </h3>
                <p className="text-xs text-purple-500 mt-1 sm:mt-2">
                  Make learning easier
                </p>
              </div>

              <div className="bg-[#FFF7ED] border border-purple-200 rounded-2xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">✨</div>
                <h3 className="font-bold text-purple-900 text-sm">
                  Get Inspired
                </h3>
                <p className="text-xs text-purple-500 mt-1 sm:mt-2">
                  Turn thoughts into ideas
                </p>
              </div>

            </div>
          </div>

        ) : (

          /* CONVERSATION */
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex min-w-0 ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 sm:w-9 sm:h-9 mr-2 sm:mr-3 shrink-0 bg-gradient-to-br from-purple-500 to-violet-700 rounded-xl flex items-center justify-center text-white">
                    ✦
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[80%] min-w-0 px-3 sm:px-5 py-3 sm:py-4 rounded-2xl whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm sm:text-base shadow-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-br-sm"
                      : "bg-[#FFF7ED] border border-purple-200 text-purple-950 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* AI THINKING INDICATOR */}
            {sending && (
              <div className="flex justify-start items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-9 sm:h-9 shrink-0 bg-gradient-to-br from-purple-500 to-violet-700 rounded-xl flex items-center justify-center text-white">
                  ✦
                </div>

                <div className="bg-[#FFF7ED] border border-purple-200 text-purple-600 px-3 sm:px-5 py-3 sm:py-4 rounded-2xl rounded-bl-sm shadow-sm animate-pulse text-sm sm:text-base">
                  Jannat AI is thinking... ✨
                </div>
              </div>
            )}

            <div ref={messagesEndRef}></div>
          </div>
        )}

      </div>

      {/* MESSAGE INPUT */}
      <div className="shrink-0 px-3 sm:px-5 py-3 sm:py-5 bg-[#FAF3EB] backdrop-blur-md border-t border-purple-200">

        {error && (
          <p role="alert" className="text-center text-red-600 text-sm mb-3">
            {error}
          </p>
        )}

        <form
          onSubmit={handleSend}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-end gap-2 sm:gap-3 bg-[#FFFBF5] border border-purple-300 rounded-2xl p-2 shadow-lg shadow-purple-100 focus-within:ring-2 focus-within:ring-purple-300 transition-all">

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                activeChatId
                  ? "Ask Jannat AI anything..."
                  : "Click + New Chat to start..."
              }
              rows={2}
              maxLength={2000}
              disabled={!activeChatId || loading || sending}
              className="flex-1 min-w-0 bg-transparent text-purple-950 placeholder-purple-400 px-2 sm:px-4 py-2 sm:py-3 outline-none resize-none text-sm sm:text-base disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={
                !message.trim() ||
                !activeChatId ||
                loading ||
                sending
              }
              className="shrink-0 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold shadow-md transition-all text-sm sm:text-base"
            >
              {sending ? (
                <span className="sm:hidden">•••</span>
              ) : (
                <span className="sm:hidden">➤</span>
              )}

              <span className="hidden sm:inline">
                {sending ? "Thinking..." : "Send ➤"}
              </span>
            </button>

          </div>
        </form>

        <p className="hidden sm:block text-center text-xs text-purple-500 mt-3">
          Jannat AI ✦ Your intelligent conversation space
        </p>

      </div>

    </main>
  );
}

export default ChatArea;