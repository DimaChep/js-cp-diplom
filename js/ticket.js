"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const ticketDetails = getJSON("ticket-details");
  const ticketInfoWrapper = document.querySelector(".ticket__info-wrapper");
  ticketInfoWrapper.innerHTML = "";

  const codeHtml = `
    <p class="ticket__info">На фильм: <span class="ticket__details ticket__title">${ticketDetails.filmName}</span></p>
    <p class="ticket__info">Ряд/Место: <span class="ticket__details ticket__chairs">${ticketDetails.strRowPlace}</span></p>
    <p class="ticket__info">В зале: <span class="ticket__details ticket__hall">${ticketDetails.hallNameNumber}</span></p>
    <p class="ticket__info">Начало сеанса: <span class="ticket__details ticket__start">${ticketDetails.seanceTime} - ${ticketDetails.seanceDay}</span></p>
    <div id="qrcode" class="ticket__info-qr"></div>
    <p class="ticket__hint">Покажите QR-код нашему контроллеру для подтверждения бронирования.</p>
    <p class="ticket__hint">Приятного просмотра!</p>
   `;

  ticketInfoWrapper.insertAdjacentHTML("beforeEnd", codeHtml);

  // QR-код

  const qrText = `
    Фильм: ${ticketDetails.filmName}
    Зал: ${ticketDetails.hallNameNumber}
    Ряд/место: ${ticketDetails.strRowPlace}
    Дата: ${ticketDetails.seanceDay}
    Начало сеанса: ${ticketDetails.seanceTime}

    Билет действителен строго на свой сеанс
    `;

  const qrcode = QRCreator(qrText, {
    mode: 4,
    eccl: 0,
    version: -1,
    mask: -1,
    image: "png",
    modsize: 3,
    margin: 3,
  });

  const content = function (qrcode) {
    return qrcode.error
      ? `недопустимые исходные данные ${qrcode.error}`
      : qrcode.result;
  };

  document.getElementById("qrcode").append(content(qrcode));
});
