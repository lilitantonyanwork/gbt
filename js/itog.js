/****************************************************
 * 1. Работа с SessionID и базовая функция sendRequest
 ****************************************************/

/**
 * Функция для генерации уникального идентификатора (UUID).
 */
function generateUniqueId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  
  /**
   * Получение куки
   */
  function getCookie(name) {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? match[2] : null;
  }
  
  /**
   * Установка куки
   */
  function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};path=/;expires=${expires.toUTCString()}`;
  }
  
  /**
   * Получение или создание nauka-session-id.
   */
  function getSessionId() {
    let sessionId = getCookie("nauka-session-id");
    if (!sessionId) {
      sessionId = generateUniqueId();
      setCookie("nauka-session-id", sessionId, 365); // Сохранение на год
    }
    return sessionId;
  }
  
  /**
   * Универсальная функция для отправки запросов.
   * @param {string} url - адрес эндпоинта
   * @param {string} method - метод запроса (POST, GET, PUT, DELETE и т.п.)
   * @param {object} body - тело запроса (по умолчанию {})
   */
  async function sendRequest(url, method, body = {}) {
    const sessionId = getSessionId(); // Получаем (или создаём) sessionId
    console.log("sessionId:", sessionId);
  
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "nauka-session-id": sessionId,
        },
        body: JSON.stringify(body),
      });
  
      // Дополнительно: проверка статуса ответа
      // if (!response.ok) {
      //   throw new Error(`Ошибка сети. Код: ${response.status}`);
      // }
  
      const data = await response.json();
      console.log("Response:", data);
      return data;
    } catch (error) {
      console.error("Request Error:", error);
      throw error;
    }
  }
  
  /****************************************************
   * 2. Вспомогательная функция для чтения файлов (base64)
   ****************************************************/
  
  /**
   * Читает файл (из input type="file") и возвращает base64-строку
   * @param {File} file
   * @returns {Promise<string>} base64-строка (с приставкой data:[mime];base64,)
   */
  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // reader.result уже содержит "data:[mime];base64,XXX..."
        resolve(reader.result);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
  
  /****************************************************
   * 3. Универсальная функция handleGenerationRequest
   ****************************************************/
  
  /**
   * Отправляет запрос в зависимости от выбранного типа задачи/генерации.
   * @param {string} type - тип задачи (solve-task, generate-essay, generate-summary, chatbot, generate-image)
   * @param {object} formData - объект с полями, необходимыми для конкретного типа
   * @returns {Promise<object>} - результат выполнения запроса (данные от сервера)
   */
  async function handleGenerationRequest(type, formData) {
    // Базовый URL для API; замените на свой, если нужно
    const BASE_URL = "https://gpt.nauka.club/api/v1/generation";
  
    let url = "";
    let body = {};
  
    switch (type) {
      case "solve-task":
        url = `${BASE_URL}/solve-task`;
        // formData.file (File) -> image (base64)
        // formData.text (string)
        if (formData.file) {
          body.image = await readFileAsBase64(formData.file);
        }
        if (formData.text) {
          body.text = formData.text;
        }
        break;
  
      case "generate-essay":
        url = `${BASE_URL}/generate-essay`;
        // formData.topic (string) — обязательно
        // formData.style (string), formData.volume (number) — опционально
        body.topic = formData.topic;
        if (formData.style) {
          body.style = formData.style;
        }
        if (formData.volume) {
          body.volume = formData.volume;
        }
        break;
  
      case "generate-summary":
        url = `${BASE_URL}/generate-summary`;
        // formData.text (string)
        // formData.file (File) -> base64
        if (formData.file) {
          body.file = await readFileAsBase64(formData.file);
        }
        if (formData.text) {
          body.text = formData.text;
        }
        break;
  
      case "chatbot":
        url = `${BASE_URL}/chatbot`;
        // formData.message (string) — обязательно
        body.message = formData.message;
        break;
  
      case "generate-image":
        url = `${BASE_URL}/generate-image`;
        // formData.description (string) — обязательно
        body.description = formData.description;
        break;
  
      default:
        throw new Error("Неизвестный тип запроса: " + type);
    }
  
    // Выполняем запрос
    const response = await sendRequest(url, "POST", body);
    return response;
  }
  
  /****************************************************
   * 4. Функция рендеринга ответа (пример с LaTeX/katex)
   ****************************************************/
  
  function renderResponse(response) {
    // Получаем div для вывода (например, <div id="output"></div>)
    const container = document.getElementById("output");
    container.innerHTML = ""; // Очищаем перед новым ответом
  
    if (!response) {
      container.textContent = "Нет ответа от сервера.";
      return;
    }
  
    // Предположим, что наш успешный ответ имеет структуру
    // { status: "success", data: {...}, message: "..." }
    // И если есть data.answer — это может быть LaTeX-код
    if (response.status === "success") {
      const rawAnswer = response?.data?.answer;
  
      if (rawAnswer) {
        // Пробуем отрендерить LaTeX
        // Убедитесь, что KaTeX (katex.js и katex.css) подключены на странице
        try {
          // katex.render(rawAnswer, element, options)
          // throwOnError: false => игнорировать ошибки синтаксиса LaTeX
          katex.render(rawAnswer, container, {
            throwOnError: false,
            displayMode: true,
          });
        } catch (error) {
          console.error("Ошибка рендера формулы:", error);
          // Если не удалось отрендерить, выведем как текст
          container.textContent = rawAnswer;
        }
      } else {
        // Если в data нет поля answer, выведем всё, что есть
        container.textContent = JSON.stringify(response.data, null, 2);
      }
    } else {
      // Если статус не success — значит, это может быть ошибка
      // У некоторых эндпоинтов ошибка приходит в формате { error: "...", ... }
      // Можно уточнить логику, здесь сделаем что-то общее
      const errorMsg = response?.error || response?.message || JSON.stringify(response);
      container.textContent = "Ошибка: " + errorMsg;
    }
  }
  
  /****************************************************
   * 5. Примеры вызова: solve-task, generate-essay и т.д.
   ****************************************************/
  
  // Пример: решить задачу
  async function onSolveTaskClick() {
    // Допустим, есть <input type="file" id="taskFile">
    // и <textarea id="taskText"></textarea> для текста задачи
    const fileInput = document.getElementById("taskFile");
    const textInput = document.getElementById("taskText");
  
    // Сформируем formData
    const formData = {
      text: textInput.value.trim() || null,
      file: fileInput.files[0] || null,
    };
  
    try {
      const response = await handleGenerationRequest("solve-task", formData);
      renderResponse(response);
    } catch (error) {
      console.error("Error solving task:", error);
    }
  }
  
  // Пример: сгенерировать сочинение
  async function onGenerateEssayClick() {
    // <input type="text" id="topic">
    // <input type="text" id="style">
    // <input type="number" id="volume">
    const topic = document.getElementById("topic").value.trim();
    const style = document.getElementById("style").value.trim();
    const volumeValue = document.getElementById("volume").value;
  
    // Преобразуем volumeValue в число (если нужно)
    const volume = volumeValue ? Number(volumeValue) : undefined;
  
    const formData = {
      topic,
      style,
      volume,
    };
  
    try {
      const response = await handleGenerationRequest("generate-essay", formData);
      renderResponse(response);
    } catch (error) {
      console.error("Error generating essay:", error);
    }
  }
  
  // Пример: сгенерировать конспект
  async function onGenerateSummaryClick() {
    // <input type="file" id="summaryFile">
    // <textarea id="summaryText"></textarea>
    const fileInput = document.getElementById("summaryFile");
    const textInput = document.getElementById("summaryText");
  
    const formData = {
      text: textInput.value.trim() || null,
      file: fileInput.files[0] || null,
    };
  
    try {
      const response = await handleGenerationRequest("generate-summary", formData);
      renderResponse(response);
    } catch (error) {
      console.error("Error generating summary:", error);
    }
  }
  
  // Пример: чат-бот
  async function onChatbotSendClick() {
    // <input type="text" id="chatMessage">
    const message = "ПРИВЕТ, как твои дела?" // document.getElementById("chatMessage").value.trim();
  
    const formData = {
      message,
    };
  
    try {
      const response = await handleGenerationRequest("chatbot", formData);
      renderResponse(response);
    } catch (error) {
      console.error("Error in chatbot request:", error);
    }
  }
  
  // Пример: сгенерировать изображение
  async function onGenerateImageClick() {
    // <input type="text" id="imageDescription">
    const description = document.getElementById("imageDescription").value.trim();
  
    const formData = {
      description,
    };
  
    try {
      const response = await handleGenerationRequest("generate-image", formData);
      renderResponse(response);
    } catch (error) {
      console.error("Error generating image:", error);
    }
  }
  