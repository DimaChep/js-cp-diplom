"use strict";

// выполняем функции после постройки DOM
document.addEventListener("DOMContentLoaded", () => {
  updNavCalendar();
  sendRequest();
});

// Функция обновляет даты и подставляет дни недели

function updNavCalendar() {
  let currentTimestamp;

  if (Date.now) {
    currentTimestamp = Date.now();
  } else if (!Date.now) {
    Date.now = function now() {
      currentTimestamp = new Date().getTime();
    };
  }

  const currentDay = new Date(currentTimestamp);
  let navDay = currentDay;
  const htmlNavDay = document.querySelectorAll(".page-nav__day"); // поиск элемента по селектору

  htmlNavDay.forEach((element, index) => {
    element.dataset.timeStampDay = navDay.setHours(0, 0, 0, 0); // получаем начало дня в виде timestamp

    let weekDay = navDay.getDay(); // получаем день недели в формате (0...6)
    const days_mas = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

    const htmlNavWeekDay = element.querySelector(".page-nav__day-week");
    const htmlNavNumberDay = element.querySelector(".page-nav__day-number");

    htmlNavWeekDay.textContent = days_mas[weekDay]; // используем weekDay в качестве индекса, чтобы получить нужный день недели
    htmlNavNumberDay.textContent = navDay.getDate();

    if (weekDay === 0 || weekDay === 6) {
      element.classList.add("page-nav__day_weekend");
    } else {
      element.classList.remove("page-nav__day_weekend");
    }

    element.classList.remove("page-nav__day_chosen");

    if (index === 0) {
      element.classList.add("page-nav__day_chosen");
    }

    navDay.setDate(navDay.getDate() + 1);
  });
}

// Отправляем заапрос на сервер -  функция (тело запроса, функция callback)
sendRequest("event=update", updateHtml);
// Обрабатываем ответ сервера c помощью функции callback (строим html разметку):
function updateHtml(serverResponse) {
  const response = JSON.parse(serverResponse);

  const arrayFilms = response.films.result;
  const arrayHalls = response.halls.result.filter(
    (item) => item.hall_open !== "0"
  );
  const arraySeances = response.seances.result;

  // объект конфига залов для localStorage
  const configHalls = {};

  // Заполняем страницу по полученным данным

  // timestamp активного дня в навигации сохраняем в дата атрибуте, html
  const chosenDayTimeStamp = document.querySelector("nav .page-nav__day_chosen")
    .dataset.timeStampDay;
  const nowTimeStamp = Date.now();

  // Блок с фильмами
  const mainSectionPage = document.querySelector("main");
  mainSectionPage.innerHTML = "";

  arrayFilms.forEach((elementFilm) => {
    const codeHtml = `
       <section class='movie'>
         <div class='movie__info'>
           <div class='movie__poster'>
             <img class='movie__poster-image' alt='${
               elementFilm.film_name
             } постер' src='${elementFilm.film_poster}'>
           </div>
           <div class='movie__description'>
             <h2 class='movie__title'>${elementFilm.film_name}</h2>
             <p class='movie__synopsis'>${elementFilm.film_description}</p>
             <p class='movie__data'>
               <span class='movie__data-duration'>${
                 elementFilm.film_duration
               } ${sklonenie(Number(elementFilm.film_duration), [
      "минута",
      "минуты",
      "минут",
    ])},</span>
               <span class='movie__data-origin'>${
                 elementFilm.film_origin
               }</span>
             </p>
           </div>
         </div>
       </section>
     `;
    mainSectionPage.insertAdjacentHTML("beforeEnd", codeHtml);

    // Блок с залами
    const movieSectionPage =
      mainSectionPage?.querySelector(".movie:last-child");

    arrayHalls.forEach((elementHall) => {
      configHalls[elementHall.hall_id] = elementHall.hall_config;

      const arraySeancesForFilmAndHall = arraySeances.filter(
        (seance, index, array) => {
          return (
            seance.seance_filmid === elementFilm.film_id &&
            seance.seance_hallid === elementHall.hall_id
          );
        }
      );

      // залы приходят с сервера в виде Зал1. Разделяем.
      const hallNameText = `${elementHall.hall_name.substring(
        0,
        3
      )} ${elementHall.hall_name.substring(3)}`;

      if (arraySeancesForFilmAndHall.length) {
        const codeHtml = `
           <div class='movie-seances__hall'>
             <h3 class='movie-seances__hall-title'>${hallNameText}</h3>
             <ul class='movie-seances__list'>
             </ul>
           </div>
         `;
        movieSectionPage.insertAdjacentHTML("beforeEnd", codeHtml);

        // Блок сеансы
        const movieSeancesList = movieSectionPage?.querySelector(
          ".movie-seances__hall:last-child > .movie-seances__list"
        );

        arraySeancesForFilmAndHall.forEach((elementSeance) => {
          const seanceTimeStamp =
            +chosenDayTimeStamp + +elementSeance.seance_start * 60 * 1000;

          // Если сеанс уже прошел, то блокируем переход в hall.html

          if (nowTimeStamp > seanceTimeStamp) {
            const codeHtml = `
             <li class='movie-seances__time-block'><a class='movie-seances__time acceptin-button-disabled' href='hall.html' data-film-id=${elementFilm.film_id} data-film-name='${elementFilm.film_name}' data-hall-id=${elementHall.hall_id} data-hall-name='${hallNameText}' data-price-vip=${elementHall.hall_price_vip} data-price-standart=${elementHall.hall_price_standart} data-seance-id=${elementSeance.seance_id} data-seance-time=${elementSeance.seance_time} data-seance-start=${elementSeance.seance_start} data-seance-time-stamp=${seanceTimeStamp}>${elementSeance.seance_time}</a></li>
           `;
            movieSeancesList.insertAdjacentHTML("beforeEnd", codeHtml);
          } else {
            const codeHtml = `
                    <li class='movie-seances__time-block'><a class='movie-seances__time' href='hall.html' data-film-id=${elementFilm.film_id} data-film-name='${elementFilm.film_name}' data-hall-id=${elementHall.hall_id} data-hall-name='${hallNameText}' data-price-vip=${elementHall.hall_price_vip} data-price-standart=${elementHall.hall_price_standart} data-seance-id=${elementSeance.seance_id} data-seance-time=${elementSeance.seance_time} data-seance-start=${elementSeance.seance_start} data-seance-time-stamp=${seanceTimeStamp}>${elementSeance.seance_time}</a></li>
           `;
            movieSeancesList.insertAdjacentHTML("beforeEnd", codeHtml);
          }
        });
      }
    });
  });

  // Сохраним данные залов в localStorage
  setJSON("config-halls", configHalls);

  Clicks();
}

// Поведение при клике в шапке на установленной дате
function onDayClick(event) {
  const htmlNavDay = document.querySelectorAll(".page-nav__day");
  htmlNavDay.forEach((element) => {
    element.classList.remove("page-nav__day_chosen");
  });

  event.currentTarget.classList.add("page-nav__day_chosen");

  sendRequest("event=update", updateHtml);
}

// Cклонение окончаний в словах на javascript:
function sklonenie(number, titles) {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[
    number % 100 > 4 && number % 100 < 20
      ? 2
      : cases[number % 10 < 5 ? number % 10 : 5]
  ];
}

// Поведение при клике по сеансу
function onSeanceClick(event) {
  const choseSeanceData = this.dataset;

  setJSON("data-chosen-seance", choseSeanceData);
}

function Clicks() {
  // Клик по дате
  const htmlNavDay = document.querySelectorAll(".page-nav__day");
  htmlNavDay.forEach((element) => {
    element.addEventListener("click", onDayClick);
  });

  // Клик по сеансу
  const movieSeancesStartTime = document.querySelectorAll(
    ".movie-seances__time"
  );
  movieSeancesStartTime.forEach((element) => {
    element.addEventListener("click", onSeanceClick);
  });
}
