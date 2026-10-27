const API_URL = "https://ai-chatbot-712o-khaki.vercel.app";

// ===============================
// LOGIN
// ===============================
export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  return data;
}

// ===============================
// CREATE CHAT
// ===============================
export async function createChat(title, token) {
  const response = await fetch(`${API_URL}/api/chats/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to create chat");
  }

  return data;
}

// ===============================
// GET USER CHATS
// ===============================
export async function getUserChats(userId, token) {
  const response = await fetch(`${API_URL}/api/chats/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load chats");
  }

  return data;
}

// ===============================
// GET CHAT MESSAGES
// ===============================
export async function getChatMessages(chatId, token) {
  const response = await fetch(`${API_URL}/api/chats/${chatId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load messages");
  }

  return data;
}

// ===============================
// SAVE CHAT MESSAGE
// ===============================
export async function saveChatMessage(chatId, role, content, token) {
  const response = await fetch(`${API_URL}/api/chats/${chatId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role, content }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to save message");
  }

  return data;
}

// ===============================
// GET AI RESPONSE FROM GROQ
// ===============================
export async function getAIResponse(chatId, message, token) {
  const response = await fetch(`${API_URL}/api/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "AI response failed"
    );
  }

  return data.reply ?? data.response ?? data.answer ?? "";
}
// ===============================
// RENAME CHAT
// ===============================
export async function renameChat(chatId, title, token) {
  const response = await fetch(`${API_URL}/api/chats/${chatId}/rename`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to rename chat");
  }

  return data;
}

// ===============================
// DELETE CHAT
// ===============================
export async function deleteChat(chatId, token) {
  const response = await fetch(`${API_URL}/api/chats/${chatId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Failed to delete chat");
  }

  return true;
}

// ===============================
// REGISTER NEW USER
// ===============================
export async function registerUser(
  name,
  email,
  password,
  confirmPassword
) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
      confirm_password: confirmPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      typeof data.detail === "string"
        ? data.detail
        : "Registration failed. Please check your details.";

    throw new Error(errorMessage);
  }

  return data;
}