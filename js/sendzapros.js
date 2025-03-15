// 1. Решение задач по фото и тексту
async function solveTask({ image = null, text = null }) {
  try {
    const response = await fetch(
      "https://gpt.nauka.club/api/v1/generation/solve-task",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, text }),
      }
    );
    const data = await response.json();
    console.log("Solve Task Response:", data);
  } catch (error) {
    console.error("Solve Task Error:", error);
  }
}

// 2. Генерация сочинений
async function generateEssay({ topic, style = null, volume = 500 }) {
  try {
    const response = await fetch(
      "https://gpt.nauka.club/api/v1/generation/generate-essay",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, style, volume }),
      }
    );
    const data = await response.json();
    console.log("Generate Essay Response:", data);
  } catch (error) {
    console.error("Generate Essay Error:", error);
  }
}

// 3. Генерация конспектов
async function generateSummary({ text = null, file = null }) {
  try {
    const response = await fetch(
      "https://gpt.nauka.club/api/v1/generation/generate-summary",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, file }),
      }
    );
    const data = await response.json();
    console.log("Generate Summary Response:", data);
  } catch (error) {
    console.error("Generate Summary Error:", error);
  }
}

// 4. Чат-бот
async function chatbot({ message }) {
  try {
    const response = await fetch(
      "https://gpt.nauka.club/api/v1/generation/chatbot",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      }
    );
    const data = await response.json();
    console.log("Chatbot Response:", data);
  } catch (error) {
    console.error("Chatbot Error:", error);
  }
}

// 5. Генерация изображений
async function generateImage({ description }) {
  try {
    const response = await fetch(
      "https://gpt.nauka.club/api/v1/generation/generate-image",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      }
    );
    const data = await response.json();
    console.log("Generate Image Response:", data);
  } catch (error) {
    console.error("Generate Image Error:", error);
  }
}

// Примеры вызова функций
// (async () => {
//   // 1. Решение задач по фото и тексту
//   await solveTask({ text: "Решите задачу: x + 2 = 4" });

//   // 2. Генерация сочинений
//   await generateEssay({
//     topic: "Космические исследования",
//     style: "научный",
//     volume: 1000,
//   });

//   // 3. Генерация конспектов
//   await generateSummary({
//     text: "Краткое содержание длинного текста о космосе.",
//   });

//   // 4. Чат-бот
//   await chatbot({ message: "Привет! Как тебя зовут?" });

//   // 5. Генерация изображений
//   await generateImage({ description: "Солнечная система в стиле минимализма" });
// })();
