document.addEventListener("DOMContentLoaded", () => {
  const ticketDetails = getJSON("ticket-details");

  // Заполняем страницу оплаты нашими данными

  const ticketInfoWrapper = document.querySelector(".ticket__info-wrapper");
  ticketInfoWrapper.innerHTML = "";

  const codeHtml = `
      <p class='ticket__info'>На фильм: <span class='ticket__details ticket__title'>${ticketDetails.filmName}</span></p>
      <p class='ticket__info'>Ряд/Место: <span class='ticket__details ticket__chairs'>${ticketDetails.strRowPlace}</span></p>
      <p class='ticket__info'>В зале: <span class='ticket__details ticket__hall'>${ticketDetails.hallNameNumber}</span></p>
      <p class='ticket__info'>Начало сеанса: <span class='ticket__details ticket__start'>${ticketDetails.seanceTime} - ${ticketDetails.seanceDay}</span></p>
      <p class='ticket__info'>Стоимость: <span class='ticket__details ticket__cost'>${ticketDetails.totalCost}</span> рублей</p>
      <button class='acceptin-button'>Получить код бронирования</button>
      <p class='ticket__hint'>После оплаты билет будет доступен в этом окне, а также придёт вам на почту. Покажите QR-код нашему контроллёру у входа в зал.</p>
      <p class='ticket__hint'>Приятного просмотра!</p>
    `;
  ticketInfoWrapper.insertAdjacentHTML("beforeEnd", codeHtml);

  // Клик по "Получить код бронирования"
  const acceptinButton = document.querySelector(".acceptin-button");
  acceptinButton?.addEventListener("click", () => {
    const hallsConfigurationObj = getJSON("pre-config-halls-paid-seats");
    const hallConfiguration = hallsConfigurationObj[ticketDetails.hallId];
    const requestBody = `event=sale_add&timestamp=${ticketDetails.seanceTimeStampInSec}&hallId=${ticketDetails.hallId}&seanceId=${ticketDetails.seanceId}&hallConfiguration=${hallConfiguration}`;

    // Формируем запрос на сервер
    sendRequest(requestBody, updateHtmlPayment, true);
    console.log(xhr.reaponse);
  });

  // acceptinButton.style.cursor = "pointer";

  function updateHtmlPayment(serverResponse) {
    window.location.href = "ticket.html";
  }
});
