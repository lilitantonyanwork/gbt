 // ---------------------------------------------------------
// Глобальные переменные и элементы
// ---------------------------------------------------------
// const container = document.getElementById("output");
const form = document.getElementById("chat-form");

// Блоки для разных моделей
const blockGPT     = document.getElementById('block_GPT');
const blockGPT_text     = document.getElementById('block_GPT_text');
const blockZadach  = document.getElementById('block_zadach');
const blockZadach_text  = document.getElementById('block_zadach_text');
const blockSoch    = document.getElementById('block_soch');
const blockSoch_text    = document.getElementById('block_soch_text');
const blockKonsp   = document.getElementById('block_konsp');
const blockKonsp_text   = document.getElementById('block_konsp_text');

// Поля ввода GPT
const userInputGPT = document.getElementById('user-input-gpt');

// Поля ввода для solve-task
const taskTextInput = document.getElementById('task-text');
const taskFileInput = document.getElementById('task-file');

// Поля ввода для generate-essay
const essayTopicInput  = document.getElementById('essay-topic');
const essayStyleInput  = document.getElementById('essay-style');
const essayVolumeInput = document.getElementById('essay-volume');

// Поля ввода для generate-summary
const summaryTextInput = document.getElementById('summary-text');
const summaryFileInput = document.getElementById('summary-file');



/// Написать конспект 
const fileLoadedIcon   = document.getElementById('file-loaded-icon');
const FILESCREPKAKONSPECT = document.getElementById('attach-icon-summary');
const FILETEXT = document.getElementById('summary-text');
let kospect_file = false
// загрузка иконки 
const attachIcon       = document.getElementById('attach-icon');
// Событие выбора файла
summaryFileInput.addEventListener('change', (event) => {
  const files = event.target.files;
  if (files && files.length > 0) {
    // Если хотя бы один файл выбран:
    // 1) Показать вторую иконку
    fileLoadedIcon.style.display = 'flex';
    FILETEXT.style.paddingBottom = '89px';
    // FILESCREPKAKONSPECT.style.display = 'none'
    kospect_file = true
    // 2) Опционально меняем скрепку или оставляем как есть
    // attachIcon.src = 'img/Button_screpka_active.svg';
  } else {
    // Если пользователь отменил выбор (или убрал все файлы):
    fileLoadedIcon.style.display = 'none';
    // attachIcon.src = 'img/Button_screpka.svg';
  }
});

let task_file = false
///////второй раз  для задачи
// Переменные для блока "Решить задачу"
const fileLoadedIconTask = document.getElementById('file-loaded-icon_task');
const FILESCREPKATASK = document.getElementById('attach-icon-task');

// Событие выбора файла (для задачи)
taskFileInput.addEventListener('change', (event) => {
  const files = event.target.files;

  if (files && files.length > 0) {
    // Если хотя бы один файл выбран, показываем иконку «файл загружен»
    fileLoadedIconTask.style.display = 'flex';
    taskTextInput.style.paddingBottom = '89px';
    // FILESCREPKATASK.style.display = 'none'
    task_file = true
  } else {
    // Если пользователь отменил выбор
    fileLoadedIconTask.style.display = 'none';
  }
});

// Кнопки переключения
const btnGPT       = document.getElementById('btnGPT');
const btnSolveTask = document.getElementById('btnSolveTask');
const btnEssay     = document.getElementById('btnEssay');
const btnSummary   = document.getElementById('btnSummary');

// Текущая выбранная модель (по умолчанию GPT)
let currentModel = 'solve-task';  // ['chatbot','solve-task','generate-essay','generate-summary']

// ---------------------------------------------------------
// Функции для работы с sessionId
// ---------------------------------------------------------
function getOrCreateUniqueId() {
  const storageKey = "uniqueId";
  // Проверяем, есть ли значение в localStorage
  let uniqueId = localStorage.getItem(storageKey);
  if (uniqueId) {
    return uniqueId;
  }
  
  // Если значения нет, генерируем новый ID:
  uniqueId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  
  // Сохраняем новый ID в localStorage и возвращаем его
  localStorage.setItem(storageKey, uniqueId);
  return uniqueId;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};path=/;expires=${expires.toUTCString()}`;
}

function getSessionId() {
  let sessionId = getCookie("nauka-session-id");
  if (!sessionId) {
    sessionId = getOrCreateUniqueId();
    setCookie("nauka-session-id", sessionId, 365);
  }
  return sessionId;
}

const sessionId = getSessionId();

// ---------------------------------------------------------
// Функция вспомогательная: читаем файл/изображение в base64
// ---------------------------------------------------------
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);   // data:...base64,...
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
/// точки мигание 
function showTypingIndicator(type) {
  const container = document.getElementById(type);
    // Создаём div, который покажет процесс «печатает…»
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('assistant-message', 'typing-indicator');
    // Можно добавить и иконку ассистента, если хотите 
    // (аналогично тому, как в renderResponse добавляем img).
    
    // Текст «Печатает ответ» + три мигающие точки
    typingDiv.innerHTML = `
      Печатает ответ
      <span class="dots">
        <span class="dot1">.</span>
        <span class="dot2">.</span>
        <span class="dot3">.</span>
      </span>
    `;
    
    container.appendChild(typingDiv);
    return typingDiv; // вернём элемент, чтобы потом его удалить
  }
// ---------------------------------------------------------
// Отправка в GPT для всех (/api/v1/generation/chatbot)
// ---------------------------------------------------------
async function sendChatBotMessage(message) {
    const gpt = "gpt"
    const container = document.getElementById(gpt);
    const url = 'https://gpt.nauka.club/api/v1/generation/chatbot';
  
    const headers = {
      'accept': 'application/json',
      'nauka-session-id': sessionId,
      'Content-Type': 'application/json'
    };
  
    const body = JSON.stringify({ message: message });
  
    // 1. Перед отправкой запроса показываем "Печатает ответ..."
    // blockGPT_text.style.display = 'none';
    const typingIndicator = showTypingIndicator(gpt);
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      // 2. Как только получили ответ — убираем индикатор
      container.removeChild(typingIndicator);
      
      const data = await response.json();
      renderResponse(data, gpt);
      console.log('Response from chatbot:', data);
      return data;
    } catch (error) {
      console.error('Error:', error);
  
      // 2. Если ошибка — тоже убираем индикатор, чтобы не висел
      container.removeChild(typingIndicator);
  
      showErrorInChat(error.message, gpt);
    }
  }

// ---------------------------------------------------------
// Отправка в solve-task (/api/v1/generation/solve-task)
//  { image: base64, text: textValue }
// ---------------------------------------------------------
async function sendSolveTask(imageBase64, textValue) {
  const solvetask = "solvetask"
  const container = document.getElementById(solvetask);
  const url = 'https://gpt.nauka.club/api/v1/generation/solve-task';
  
  const headers = {
    'accept': 'application/json',
    'nauka-session-id': sessionId,
    'Content-Type': 'application/json'
  };

  const body = JSON.stringify({
    image: imageBase64, // data:image/jpeg;base64,... 
    text: textValue
  });

  blockZadach_text.style.display = 'none';
  const typingIndicator = showTypingIndicator(solvetask);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
     // 2. Как только получили ответ — убираем индикатор
     container.removeChild(typingIndicator);

    const data = await response.json();
    
    renderResponse(data, solvetask);
    console.log('Response from solve-task:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
     //  убираем индикатор
     container.removeChild(typingIndicator);
    showErrorInChat(error.message, solvetask);
  }
}

// ---------------------------------------------------------
// Отправка в generate-essay (/api/v1/generation/generate-essay)
//  { topic, style, volume }
// ---------------------------------------------------------
async function sendEssayRequest(topicValue) {
  const generateessay = "generateessay"
  const container = document.getElementById(generateessay);
  
  const url = 'https://gpt.nauka.club/api/v1/generation/generate-essay';
  
  const headers = {
    'accept': 'application/json',
    'nauka-session-id': sessionId,
    'Content-Type': 'application/json'
  };

  const body = JSON.stringify({
    topic: topicValue
    // style: styleValue,
    // volume: Number(volumeValue) || 500   // по умолчанию 500, если пусто
  });

  blockSoch_text.style.display = 'none';
  const typingIndicator = showTypingIndicator(generateessay);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

     //  убираем индикатор
     container.removeChild(typingIndicator);
    const data = await response.json();
    
    renderResponse(data, generateessay);
    console.log('Response from generate-essay:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
     //  убираем индикатор
     container.removeChild(typingIndicator);
    showErrorInChat(error.message, generateessay);
  }
}

// ---------------------------------------------------------
// Отправка в generate-summary (/api/v1/generation/generate-summary)
//  { text, file }
// ---------------------------------------------------------
async function sendSummaryRequest(summaryText, fileBase64) {
  const generatesummary = "generatesummary"
  const container = document.getElementById(generatesummary);
  const url = 'https://gpt.nauka.club/api/v1/generation/generate-summary';
  
  const headers = {
    'accept': 'application/json',
    'nauka-session-id': sessionId,
    'Content-Type': 'application/json'
  };

  const body = JSON.stringify({
    text: summaryText,
    file: fileBase64 // data:application/...;base64,...
  });

  blockKonsp_text.style.display = 'none';
  const typingIndicator = showTypingIndicator(generatesummary);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
     //  убираем индикатор
     container.removeChild(typingIndicator);
    const data = await response.json();
    
    renderResponse(data, generatesummary);
    console.log('Response from generate-summary:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
     //  убираем индикатор
     container.removeChild(typingIndicator);
    showErrorInChat(error.message, generatesummary);
  }
}

// ---------------------------------------------------------
// Универсальная функция: вывести ошибку в чат
// ---------------------------------------------------------
function showErrorInChat(errorMessage, type) {
  const container = document.getElementById(type);
  const errorDiv = document.createElement('div');
  errorDiv.classList.add('assistant-message', 'error');
  errorDiv.textContent = 'Ошибка при запросе: Превышено количество запросов. Подождите минуту и попробуйте снова.'; //+ errorMessage;
  container.appendChild(errorDiv);
}

// ---------------------------------------------------------
// Функция рендера ответа ассистента (общая для всех моделей)
// ---------------------------------------------------------
function renderResponse(response, typetext) {
    const container = document.getElementById(typetext);
    if (response.status === 'success' && response.data?.answer) {
      const rawAnswer = response.data.answer;
  
      // Родительский div для ответа
      const assistantMessageDiv = document.createElement('div');
      assistantMessageDiv.classList.add('assistant-message');
  
      // Иконка ассистента
      const assistantImg = document.createElement('img');
      assistantImg.src = 'img/new/ava.png';
      assistantImg.alt = 'Assistant Avatar';
      assistantImg.classList.add('assistant-message-img');
  
      // Контейнер для текста/формул
      const textDiv = document.createElement('div');
      textDiv.classList.add(typetext);
  
      try {
        // Рендер KaTeX, если в ответе есть формулы
        katex.render(rawAnswer, textDiv, {
          throwOnError: false,
          displayMode: true,
        });
      } catch (error) {
        console.error('Ошибка рендера формулы:', error);
        // Если произошла ошибка в KaTeX — выведем просто текст
        textDiv.textContent = rawAnswer;
      }
  
      // Собираем структуру «иконка слева, текст справа»
      assistantMessageDiv.appendChild(assistantImg);
      assistantMessageDiv.appendChild(textDiv);
  
      // Добавляем сообщение ассистента в чат
      container.appendChild(assistantMessageDiv);
  
    } else {
      // Если пришла ошибка от API
      const errorDiv = document.createElement('div');
      errorDiv.classList.add('assistant-message', 'error');
  
      // На всякий случай, если .message нет, подстрахуемся
      errorDiv.textContent = 'Ошибка API: ' + (response.message || 'неизвестная ошибка');
      console.log("Ошибка API:", response.message, response.data )
      container.appendChild(errorDiv);
    }
  }

// ---------------------------------------------------------
// Функция "добавить сообщение пользователя" в чат
// ---------------------------------------------------------
function addUserMessageToChat(message, type) {
    const container = document.getElementById(type);
    // Создаём родительский div для сообщения
    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('user-message');


    // Иконка пользователя
    const imgUserMessage = document.createElement('img');
    imgUserMessage.src = 'img/new/user_otvet.png';
    imgUserMessage.alt = 'User Avatar';
    imgUserMessage.classList.add('user-message-img');

    const userName = document.createElement('div');
    userName.classList.add('user-name');
     userName.textContent = 'Пользователь';

    const userDate = document.createElement('span');
    userDate.classList.add('user-date');

  const now = new Date();
  const hours = now.getHours();   // 0-23
  const minutes = now.getMinutes(); // 0-59
  const seconds = now.getSeconds(); // 0-59
  userDate.textContent = `${hours}:${minutes}`;
  
    // Текст сообщения (обернём в span, чтобы было удобнее стилизовать)
    const textSpan = document.createElement('span');
    textSpan.textContent = message;
  
    // Добавляем иконку и сам текст внутрь userMessageDiv


    userMessageDiv.appendChild(userName);
    userMessageDiv.appendChild(textSpan);
  userName.appendChild(userDate);
    userMessageDiv.appendChild(imgUserMessage);
    // Помещаем всё это в общий контейнер
    container.appendChild(userMessageDiv);
  document.querySelector("div.osn_block_chat").classList.add("start");

  }

// ---------------------------------------------------------
// Обработка отправки формы (submit)
//   - смотрим, какая модель выбрана (currentModel)
//   - в зависимости от модели собираем данные, отправляем
// ---------------------------------------------------------
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (task_file){
    FILESCREPKATASK.style.display = "inline-block"
    fileLoadedIconTask.style.display = "none"
  }
  if (kospect_file){
    FILESCREPKAKONSPECT.style.display = "inline-block"
    fileLoadedIcon.style.display = "none"
  }
  // 1. Определяем, какая модель сейчас активна
  if (currentModel === 'chatbot') {
    const message = userInputGPT.value.trim();
    if (message) {
      addUserMessageToChat(message, "gpt");
      userInputGPT.value = '';
      // Отправка в GPT
      sendChatBotMessage(message);
    }
  }
  // решить задачу 
  else if (currentModel === 'solve-task') {
    const textValue = taskTextInput.value.trim();
    const file = taskFileInput.files[0]; // файл изображения

    // Выводим сообщение пользователя
    addUserMessageToChat(textValue || '(Задача без текста)', "solvetask");

    // Если есть файл, конвертируем в base64
    let imageBase64 = '';
    if (file) {
      try {
        imageBase64 = await fileToBase64(file); 
      } catch (err) {
        console.error('Ошибка при чтении файла:', err);
      }
    }
    // Отправляем запрос
    sendSolveTask(imageBase64, textValue);

    // Очищаем поля
    taskTextInput.value = '';
    taskFileInput.value = '';
  }
  else if (currentModel === 'generate-essay') {
    const topicValue  = essayTopicInput.value.trim();
    // const styleValue  = essayStyleInput.value.trim();
    // const volumeValue = essayVolumeInput.value.trim();

    // const userMsg = `Тема: ${topicValue}\nСтиль: ${styleValue}\nОбъём: ${volumeValue}`;
    const userMsg = `Тема: ${topicValue}`;
    addUserMessageToChat(userMsg, "generateessay");

    // Отправка
    sendEssayRequest(topicValue);

    // Очистка
    essayTopicInput.value  = '';
    essayStyleInput.value  = '';
    essayVolumeInput.value = '';
  }
  // написать конспект
  else if (currentModel === 'generate-summary') {
    const summaryText = summaryTextInput.value.trim();
    const file = summaryFileInput.files[0]; // любой документ
    
    addUserMessageToChat(summaryText || '(Текст для конспекта не указан)', "generatesummary");

    let fileBase64 = '';
    if (file) {
      try {
        fileBase64 = await fileToBase64(file);
      } catch (err) {
        console.error('Ошибка при чтении файла:', err);
      }
    }

    sendSummaryRequest(summaryText, fileBase64);

    // Очистка
    summaryTextInput.value = '';
    summaryFileInput.value = '';
  }
});

// ---------------------------------------------------------
// Логика переключения режимов (кнопки)
//   - При клике: скрываем/показываем нужный блок,
//     ставим currentModel = нужное значение
// ---------------------------------------------------------
const container1 = document.getElementById("gpt")
const container2 = document.getElementById("solvetask")
const container3 = document.getElementById("generateessay")
const container4 = document.getElementById("generatesummary")
function hideAllBlocks() {
  container1.style.display = 'none';
  container2.style.display = 'none';
  container3.style.display = 'none';
  container4.style.display = 'none';
  blockGPT.style.display     = 'none';
  // blockGPT_text.style.display     = 'none';
  blockZadach.style.display  = 'none';
  blockZadach_text.style.display  = 'none';
  blockSoch.style.display    = 'none';
  blockSoch_text.style.display    = 'none';
  blockKonsp.style.display   = 'none';
  blockKonsp_text.style.display   = 'none';
  
  btnGPT.classList.remove('active');
  btnSolveTask.classList.remove('active');
  btnEssay.classList.remove('active');
  btnSummary.classList.remove('active');
  document.querySelector("div.osn_block_chat").classList.remove("start");

}

// GPT для всех
btnGPT.addEventListener('click', () => {
  hideAllBlocks();
  container1.style.display = 'block';
  blockGPT.style.display = 'block';
  // blockGPT_text.style.display = 'none';
  btnGPT.classList.add('active');
  currentModel = 'chatbot';
  // document.querySelector("div.osn_block_chat").classList.add("start");

});

// Решить задачу
btnSolveTask.addEventListener('click', () => {
  hideAllBlocks();
  container2.style.display = 'block';
  console.log('asdasdasdasdjasjdadj')
  console.log("blockZadach", blockZadach)
  blockZadach.style.display = 'block';
  blockZadach_text.style.display = 'none';
  btnSolveTask.classList.add('active');
  currentModel = 'solve-task';
  // document.querySelector("div.osn_block_chat").classList.add("start");
});

// Написать сочинение
btnEssay.addEventListener('click', () => {
  hideAllBlocks();
  container3.style.display = 'block';
  blockSoch.style.display = 'block';
  blockSoch_text.style.display = 'none';
  btnEssay.classList.add('active');
  currentModel = 'generate-essay';
  // document.querySelector("div.osn_block_chat").classList.add("start");

});

// Написать конспект
btnSummary.addEventListener('click', () => {
  hideAllBlocks();
  container4.style.display = 'block';
  blockKonsp.style.display = 'block';
  blockKonsp_text.style.display = 'none';
  btnSummary.classList.add('active');
  currentModel = 'generate-summary';
  // document.querySelector("div.osn_block_chat").classList.add("start");

});

// мигание текста 
const text = "Привет! Я ваш умный помощник Эйнштейн GPT! Сначала выбери задачу, которую хочешь решить - нажав на кнопку под чатом. Затем введи свой вопрос и прикрепи файлы при необходимости и получи ответ!";
const text_mob = "1.Сначала выбери задачу, которую хочешь решить - нажав на кнопку под чатом. \n 2.Затем введи свой вопрос и прикрепи файлы при необходимости. \n 3. Получай ответы!";
const typingElement = document.getElementById("typing-text");
const speed = 30; // Интервал между буквами в миллисекундах (0.5 секунды)

function typeWriter() {
    let i = 0;
  let currentText = "";
    const interval = setInterval(() => {

      if (window.innerWidth <= 768) {

        if (i < text_mob.length) {
          currentText += text_mob[i];
          // typingElement.innerHTML = currentText.replace(/\n/g, "<br>")
          typingElement.innerHTML += text_mob[i]; // Добавляем по одной букве
          i++;
        } else {
          clearInterval(interval); // Останавливаем интервал, когда текст напечатан
          typingElement.classList.add("blink"); // Добавляем мигающий курсор
        }
      } else{

        if (i < text.length) {
            typingElement.textContent += text[i]; // Добавляем по одной букве
            i++;
        } else {
            clearInterval(interval); // Останавливаем интервал, когда текст напечатан
            typingElement.classList.add("blink"); // Добавляем мигающий курсор
        }

      }
    }, speed);
}

// Запускаем анимацию
typeWriter();

 function updatePlaceholder() {

   const textarea1 = document.getElementById("user-input-gpt");
   const textarea2 = document.getElementById("summary-text");
   const textarea3 = document.getElementById("essay-topic");
   const textarea4 = document.getElementById("task-text");
   const btn1 = document.getElementById("btnSolveTask");
   const btn2 = document.getElementById("btnEssay");
   const btn3 = document.getElementById("btnSummary");
   const btn4 = document.getElementById("btnGPT");

   if (window.innerWidth <= 768) { // Adjust breakpoint as needed
     textarea1.placeholder = "Что такое законы Ньютона?";
     textarea2.placeholder = "Напиши рассказ про летние каникулы";
     textarea3.placeholder = "Сделай краткий пересказ книги “Война и мир”";
     textarea4.placeholder = "Реши уравнение 3x + 2 = 5";
     document.querySelector("#btnSolveTask div").textContent = "Задачи";
     document.querySelector("#btnEssay div").textContent = "Сочинение";
     document.querySelector("#btnSummary div").textContent = "Конспект";
     document.querySelector("#btnGPT div").textContent = "ChatGPT";
     document.querySelector(".text_monitor").textContent = "Искусственный интеллект для обучения";
   } else {
     textarea1.placeholder = "Например: что такое законы Ньютона?";
     textarea2.placeholder = "Например: напиши рассказ про летние каникулы";
     textarea3.placeholder = "Например: сделай краткий пересказ книги “Война и мир”\n";
     textarea4.placeholder = "Например: реши уравнение 3x + 2 = 5";
     document.querySelector("#btnSolveTask div").textContent = "Решить задачу";
     document.querySelector("#btnEssay div").textContent = "Написать сочинение";
     document.querySelector("#btnSummary div").textContent = "Написать конспект";
     document.querySelector("#btnGPT div").textContent = "Для любых вопросов";
     document.querySelector(".text_monitor").textContent = "Искусственный интеллект для обучения: помощь в освоении знаний легко и увлекательно";
   }
 }

 // Run on page load
 updatePlaceholder();

 // Update when the window resizes
 window.addEventListener("resize", updatePlaceholder);



// Для теста вызовите функцию с вашим сообщением
// sendChatBotMessage('Привет, ты умеешь говорить?');

// Вызов функции рендера
// renderResponse(exampleResponse);