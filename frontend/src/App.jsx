import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import Login from "./components/Login";
import { getUserChats } from "./services/api";

function App() {
  // RESTORE LOGIN AFTER REFRESH
  const [auth, setAuth] = useState(() => {
    try {
      const savedAuth = sessionStorage.getItem("jannat_auth");
      return savedAuth ? JSON.parse(savedAuth) : null;
    } catch {
      return null;
    }
  });

  const [activeChatId, setActiveChatId] = useState(null);
  const [chats, setChats] = useState([]);

  const token = auth?.access_token;
  const userId = auth?.user?.id;

  // SAVE LOGIN SESSION
  useEffect(() => {
    if (auth) {
      sessionStorage.setItem("jannat_auth", JSON.stringify(auth));
    } else {
      sessionStorage.removeItem("jannat_auth");
    }
  }, [auth]);

  // LOAD USER'S CHATS
  useEffect(() => {
    if (!token || !userId) return;

    let cancelled = false;

    const loadChats = async () => {
      try {
        const data = await getUserChats(userId, token);

        if (!cancelled) {
          setChats(data.chats);
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
      }
    };

    loadChats();

    return () => {
      cancelled = true;
    };
  }, [token, userId]);

  // LOGIN
  const handleLogin = (data) => {
    setChats([]);
    setActiveChatId(null);
    setAuth(data);
  };

  // LOGOUT
  const handleLogout = () => {
    setAuth(null);
    setActiveChatId(null);
    setChats([]);
    sessionStorage.removeItem("jannat_auth");
  };

  // CREATE CHAT
  const handleChatCreated = (data) => {
    setActiveChatId(data.chat_id);

    setChats((prev) => [
      {
        chat_id: data.chat_id,
        title: data.title,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // RENAME CHAT / AUTOMATIC TITLE
  const handleChatRenamed = (chatId, newTitle) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.chat_id === chatId
          ? { ...chat, title: newTitle }
          : chat
      )
    );
  };

  // DELETE CHAT
  const handleChatDeleted = (chatId) => {
    setChats((prev) =>
      prev.filter((chat) => chat.chat_id !== chatId)
    );

    setActiveChatId((currentId) =>
      currentId === chatId ? null : currentId
    );
  };

  // LOGIN PAGE
  if (!auth) {
    return <Login onLogin={handleLogin} />;
  }

  // CHATBOT
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar
        token={token}
        chats={chats}
        activeChatId={activeChatId}
        onChatCreated={handleChatCreated}
        onSelectChat={setActiveChatId}
        onChatRenamed={handleChatRenamed}
        onChatDeleted={handleChatDeleted}
        onLogout={handleLogout}
      />

      <ChatArea
        key={activeChatId ?? "empty"}
        activeChatId={activeChatId}
        token={token}
        onChatRenamed={handleChatRenamed}
      />
    </div>
  );
}

export default App;