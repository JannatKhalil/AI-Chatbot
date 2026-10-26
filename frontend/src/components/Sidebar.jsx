import { useState } from "react";
import { createChat, renameChat, deleteChat } from "../services/api";

// Group conversations according to their creation date
function groupChats(chats) {
  const groups = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    Older: [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const chat of chats) {
    const date = new Date(chat.created_at);

    if (Number.isNaN(date.getTime())) {
      groups.Older.push(chat);
      continue;
    }

    const chatDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    const daysAgo = Math.floor(
      (today.getTime() - chatDay.getTime()) / 86400000
    );

    if (daysAgo <= 0) {
      groups.Today.push(chat);
    } else if (daysAgo === 1) {
      groups.Yesterday.push(chat);
    } else if (daysAgo <= 7) {
      groups["Previous 7 Days"].push(chat);
    } else {
      groups.Older.push(chat);
    }
  }

  return groups;
}

function Sidebar({
  token,
  onChatCreated,
  chats = [],
  activeChatId,
  onSelectChat,
  onChatRenamed,
  onChatDeleted,
  onLogout,
}) {
  const [loading, setLoading] = useState(false);
  const [busyChatId, setBusyChatId] = useState(null);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const groupedChats = groupChats(chats);

  const handleNewChat = async () => {
    if (!token || loading) return;

    setLoading(true);
    setError("");

    try {
      const data = await createChat("New Chat", token);
      onChatCreated?.(data);
      setMobileOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = (chatId) => {
    onSelectChat?.(chatId);
    setMobileOpen(false);
  };

  const handleRename = async (chat) => {
    const newTitle = window.prompt(
      "Enter new chat name:",
      chat.title
    );

    if (newTitle === null) return;

    const title = newTitle.trim();

    if (!title || title === chat.title) return;

    setBusyChatId(chat.chat_id);
    setError("");

    try {
      await renameChat(chat.chat_id, title, token);
      onChatRenamed?.(chat.chat_id, title);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyChatId(null);
    }
  };

  const handleDelete = async (chat) => {
    const confirmed = window.confirm(
      `Delete "${chat.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setBusyChatId(chat.chat_id);
    setError("");

    try {
      await deleteChat(chat.chat_id, token);
      onChatDeleted?.(chat.chat_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyChatId(null);
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (confirmed) {
      setMobileOpen(false);
      onLogout?.();
    }
  };

  const renderChat = (chat) => (
    <div
      key={chat.chat_id}
      className={`flex items-center gap-1 px-2 py-2 rounded-xl border transition-all duration-200 ${
        activeChatId === chat.chat_id
          ? "bg-purple-200 border-purple-400 text-purple-950 shadow-sm"
          : "bg-[#FFF7ED] border-purple-200 text-purple-700 hover:bg-purple-100"
      }`}
    >
      <button
        type="button"
        onClick={() => handleSelectChat(chat.chat_id)}
        className="flex-1 min-w-0 text-left px-2 py-1"
      >
        <span className="mr-2">💬</span>
        <span className="text-sm font-medium break-words">
          {chat.title}
        </span>
      </button>

      <button
        type="button"
        title="Rename chat"
        aria-label={`Rename ${chat.title}`}
        onClick={() => handleRename(chat)}
        disabled={busyChatId !== null}
        className="p-2 rounded-lg hover:bg-purple-300 disabled:opacity-40"
      >
        ✏️
      </button>

      <button
        type="button"
        title="Delete chat"
        aria-label={`Delete ${chat.title}`}
        onClick={() => handleDelete(chat)}
        disabled={busyChatId !== null}
        className="p-2 rounded-lg hover:bg-red-100 disabled:opacity-40"
      >
        🗑️
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open chat menu"
        className="md:hidden fixed top-4 left-4 z-30 w-11 h-11 rounded-xl bg-purple-600 text-white text-2xl shadow-lg"
      >
        ☰
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-72 max-w-[85vw] h-dvh
          bg-gradient-to-b from-purple-200 via-violet-100 to-purple-100
          border-r-2 border-purple-300 p-5
          flex flex-col shadow-lg
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:h-screen md:shrink-0
        `}
      >
        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close chat menu"
          className="md:hidden absolute top-4 right-4 text-purple-800 text-2xl font-bold"
        >
          ✕
        </button>

        {/* Logo and Branding */}
        <div className="flex items-center gap-3 mb-10 pr-5 md:pr-0">
          <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-purple-500 to-violet-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
            <span className="text-2xl text-white">✦</span>
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-extrabold text-purple-950 tracking-tight">
              Jannat Chatbot
            </h1>
            <p className="text-xs text-purple-500 font-medium">
              Your Intelligent AI Companion
            </p>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          type="button"
          onClick={handleNewChat}
          disabled={loading || !token}
          className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-purple-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Chat..." : "＋ New Chat"}
        </button>

        {error && (
          <p role="alert" className="text-red-600 text-xs mt-3">
            {error}
          </p>
        )}

        {/* Conversation History */}
        <div className="mt-10 flex-1 min-h-0 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest">
              Recent Conversations
            </h3>
            <span className="text-purple-500">✧</span>
          </div>

          {chats.length === 0 ? (
            <div className="bg-[#FFF7ED] border border-purple-200 rounded-xl p-5 text-center shadow-sm">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-sm text-purple-700 font-medium">
                No conversations yet
              </p>
              <p className="text-xs text-purple-500 mt-1">
                Your chat history will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedChats).map(([groupName, group]) =>
                group.length > 0 ? (
                  <div key={groupName}>
                    <h4 className="text-xs font-bold text-purple-600 mb-3 uppercase tracking-wide">
                      {groupName}
                    </h4>

                    <div className="space-y-2">
                      {group.map(renderChat)}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-purple-300 pt-5 mt-5">
          <div className="flex items-center gap-3 bg-[#FFF7ED] rounded-xl p-3 border border-purple-200">
            <div className="w-10 h-10 rounded-full bg-purple-300 flex items-center justify-center text-purple-800 font-bold">
              J
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-900">
                Jannat AI
              </p>
              <p className="text-xs text-purple-500">
                Personal Assistant
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full mt-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-all"
          >
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;