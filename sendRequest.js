"use strict";

function sendRequest(requestBody, func) {
  let url = "https://jscp-diplom.netoserver.ru/"; // URL сервера Нетологии
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onload = () => {
    if (xhr.status !== 200) {
      alert(`Ошибка: ${xhr.status} ${xhr.statusText}`);
      return;
    }
    func(xhr.response); // func будет обрабатывать ответ сервера
  };

  xhr.onerror = function () {
    alert("Ошибка сети");
  };

  xhr.send(requestBody);
}

// JSON.stringify - преобразует объекты в JSON строку.
// JSON.parse  - преобразует JSON строку обратно в объекты.

//  сохраним пару ключ/значение в localStorage
function setItem(key, value) {
  try {
    return window.localStorage.setItem(key, value);
  } catch (e) {
    console.log(e);
  }
}

//  Получить данные по ключу key
function getItem(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    console.log(e);
  }
}

// Преобразовать value в JSON и сохранить в localStorage по ключу key
function setJSON(key, value) {
  try {
    const json = JSON.stringify(value);

    setItem(key, json);
  } catch (e) {
    console.error(e);
  }
}

// Получить данные и преобразовать из JSON в объект из localStorage по ключу key
function getJSON(key) {
  try {
    const json = getItem(key);

    return JSON.parse(json);
  } catch (e) {
    console.error(e);
  }
}
