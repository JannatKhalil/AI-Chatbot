

import { useState } from "react";
import { createChat, renameChat, deleteChat } from "../services/api";

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

    if (daysAgo <= 0) groups.Today.push(chat);
    else if (daysAgo === 1) groups.Yesterday.push(chat);
    else if (daysAgo <= 7) groups["Previous 7 Days"].push(chat);
    else groups.Older.push(chat);
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
    const newTitle = window.prompt("Enter new chat name:", chat.title);
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
    if (!window.confirm(`Delete "${chat.title}"? This cannot be undone.`)) {
      return;
    }

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
    if (window.confirm("Are you sure you want to logout?")) {
      setMobileOpen(false);
      onLogout?.();
    }
  };

  const renderChat = (chat) => (
    <div
      key={chat.chat_id}
      className={`group flex items-center gap-1 rounded-xl border p-1 transition ${
        activeChatId === chat.chat_id
          ? "border-[#B99ACF] bg-[#D0B8E5] text-[#572E51]"
          : "border-transparent text-[#66566B] hover:border-[#C8AFE0] hover:bg-[#D7C3EB]"
      }`}
    >
      <button
        type="button"
        onClick={() => handleSelectChat(chat.chat_id)}
        className="min-w-0 flex-1 px-2 py-2 text-left"
      >
        <span className="mr-2 text-xs text-[#946A9B]">●</span>
        <span className="break-words text-sm font-medium">
          {chat.title}
        </span>
      </button>

      <button
        type="button"
        title="Rename chat"
        aria-label={`Rename ${chat.title}`}
        onClick={() => handleRename(chat)}
        disabled={busyChatId !== null}
        className="rounded-lg px-2 py-2 text-xs text-[#76566F] hover:bg-[#CDB4E0] disabled:opacity-40"
      >
        Edit
      </button>

      <button
        type="button"
        title="Delete chat"
        aria-label={`Delete ${chat.title}`}
        onClick={() => handleDelete(chat)}
        disabled={busyChatId !== null}
        className="rounded-lg px-2 py-2 text-xs text-[#914C5B] hover:bg-[#F0D5DE] disabled:opacity-40"
      >
        Del
      </button>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open chat menu"
        className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-xl border border-[#C8AFE0] bg-[#E6D5F3] text-xl text-[#702D45] shadow-sm md:hidden"
      >
        ☰
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#33202D]/35 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-72 max-w-[85vw] flex-col border-r border-[#C6A9DC] bg-[#DCC8EF] p-5 shadow-sm transition-transform duration-300 md:relative md:h-screen md:shrink-0 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close chat menu"
          className="absolute right-4 top-4 text-xl text-[#702D45] md:hidden"
        >
          ×
        </button>

        {/* Logo and heading */}
        <div className="mb-8 flex items-center gap-3 pr-5 md:pr-0">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[#B99ACF] bg-[#FBF7F0] shadow-sm">
            <img
              src="/jannat-logo.png"
              alt="Jannat logo"
              className="block h-full w-full rounded-full object-cover object-center"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight text-[#49283F]">
              General Chatbot
            </h1>
            <p className="mt-1 text-xs leading-5 text-[#725875]">
              Your Intelligent AI Companion
            </p>
          </div>
        </div>

        {/* New Chat */}
        <button
          type="button"
          onClick={handleNewChat}
          disabled={loading || !token}
          className="flex w-full items-center gap-3 rounded-xl bg-[#702D45] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#592237] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-xl leading-none">＋</span>
          {loading ? "Creating chat..." : "New Chat"}
        </button>

        {error && (
          <p role="alert" className="mt-3 break-words text-xs text-[#A02F43]">
            {error}
          </p>
        )}

        {/* Chat History */}
        <div className="mt-8 min-h-0 flex-1 overflow-y-auto">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#755580]">
            Chat History
          </h3>

          {chats.length === 0 ? (
            <div className="rounded-xl border border-[#CBB3DF] bg-[#E9DDF4] p-4">
              <p className="text-sm font-medium text-[#5D405B]">
                No conversations yet
              </p>
              <p className="mt-1 text-xs leading-5 text-[#806E88]">
                Your chat history will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(groupedChats).map(([groupName, group]) =>
                group.length > 0 ? (
                  <div key={groupName}>
                    <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#866C8B]">
                      {groupName}
                    </h4>
                    <div className="space-y-1">{group.map(renderChat)}</div>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>

        {/* Bottom decoration */}
        <div className="mt-4 border-t border-[#C5A7D8] pt-4">
          <div className="mb-4 rounded-2xl border border-[#CBB3DF] bg-[#E9DDF4] px-3 py-4 text-center">
            <div className="mb-2 flex justify-center gap-3 text-2xl">
              <span>🦋</span>
              <span>🦋</span>
            </div>

            <p className="text-sm font-semibold text-[#702D45]">
              Good ideas bloom here.
            </p>
            <p className="mt-1 text-xs text-[#806E88]">
              A little space for big ideas
            </p>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-3 rounded-xl border border-[#CBB3DF] bg-[#E9DDF4] p-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[#B99ACF] bg-[#FBF7F0]">
              <img
                src="/jannat-logo.png"
                alt="Jannat logo"
                className="block h-full w-full rounded-full object-cover object-center"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#49283F]">
                Jannat AI
              </p>
              <p className="mt-1 text-xs text-[#806E88]">
                Personal Assistant
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 w-full rounded-xl border border-[#E0C0CC] bg-[#F8E9ED] py-3 text-sm font-semibold text-[#873C50] transition hover:bg-[#F1D9E1]"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
