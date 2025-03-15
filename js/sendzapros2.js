// Функция для генерации уникального идентификатора (UUID)
function generateUniqueId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Функция для работы с куками
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};path=/;expires=${expires.toUTCString()}`;
}

// Получение или создание nauka-session-id
function getSessionId() {
  let sessionId = getCookie("nauka-session-id");
  if (!sessionId) {
    sessionId = generateUniqueId();
    setCookie("nauka-session-id", sessionId, 365); // Сохранение на год
  }
  return sessionId;
}

// Общая функция для отправки запросов
async function sendRequest(url, method, body = {}) {
  const sessionId = getSessionId(); // Получаем session ID
  console.log("sessionId", sessionId);
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "nauka-session-id": sessionId, // Добавляем в заголовки
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    console.log("Response:", data);
    return data;
  } catch (error) {
    console.error("Request Error:", error);
    throw error;
  }
}
