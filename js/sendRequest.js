function sendRequest(requestBody, func) {
  let url = "https://jscp-diplom.netoserver.ru/"; // URL сервера Нетологии
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onload = () => {
    if (xhr.status !== 200) {
      alert(`Ошибка: ${xhr.status} ${xhr.statusText}`);
    } else if (xhr.status === 200) {
      func(xhr.response); // func будет обрабатывать ответ сервера
    }
  };

  xhr.onerror = function () {
    alert("Ошибка сети");
  };

  xhr.send(requestBody);
}
