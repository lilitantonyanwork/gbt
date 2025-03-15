<?php
// Убедимся, что скрипт был вызван методом POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Кому отправляем
    $to = "lyubomik@yandex.ru";
    // Тема письма
    $subject = "Сообщение об ошибке";

    // Забираем текст сообщения; защита от XSS через htmlspecialchars
    $userMessage = isset($_POST["message"])
        ? htmlspecialchars($_POST["message"], ENT_QUOTES, 'UTF-8')
        : '';

    // Готовим заголовки
    $boundary = md5(time()); // уникальная метка для разделения частей письма
    $headers  = "MIME-Version: 1.0\r\n";
    // Укажите здесь реальный адрес отправителя или откуда будет идти письмо
    $headers .= "From: info@nauka.club\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"".$boundary."\"\r\n";

    // Начинаем формировать тело письма
    // Первая часть: текст
    $body  = "--$boundary\r\n";
    $body .= "Content-Type: text/plain; charset=utf-8\r\n";
    $body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $body .= $userMessage."\r\n\r\n";

    // Если пользователь прикрепил файл
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $fileName    = $_FILES['file']['name'];
        $fileTmpPath = $_FILES['file']['tmp_name'];

        // Читаем содержимое файла и кодируем base64
        $fileData    = file_get_contents($fileTmpPath);
        $fileDataB64 = chunk_split(base64_encode($fileData));

        $body .= "--$boundary\r\n";
        // Можно поменять Content-Type на реальный mime-тип, но application/octet-stream работает универсально
        $body .= "Content-Type: application/octet-stream; name=\"".$fileName."\"\r\n";
        $body .= "Content-Transfer-Encoding: base64\r\n";
        $body .= "Content-Disposition: attachment; filename=\"".$fileName."\"\r\n\r\n";
        $body .= $fileDataB64."\r\n\r\n";
    }

    // Закрываем boundary
    $body .= "--$boundary--";

    // Пытаемся отправить письмо
    if (mail($to, $subject, $body, $headers)) {
        echo "Ваше сообщение успешно отправлено!";
    } else {
        echo "К сожалению, возникла ошибка при отправке сообщения.";
    }
} else {
    echo "Некорректный метод запроса.";
}
