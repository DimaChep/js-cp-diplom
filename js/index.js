// Запускаем функцию navDays() после отрисовки страницы
document.addEventListener("DOMContentLoaded", () => {
  navDays();
});

function navDays() {
  let days = Array.from(document.getElementsByClassName("page-nav__day")); // устанавливаем дату в список выше
  let date = new Date();
  date.setDate(date.getDate() - 1);

  days.forEach((element) => {
    // даты на следующие дни
    date.setDate(date.getDate() + 1);
    element.children[1].textContent = date.getDate();
    switch (Number(date.getDay())) {
      case 1: {
        element.children[0].textContent = "Пн";
        break;
      }
      case 2: {
        element.children[0].textContent = "Вт";
        break;
      }
      case 3: {
        element.children[0].textContent = "Ср";
        break;
      }
      case 4: {
        element.children[0].textContent = "Чт";
        break;
      }
      case 5: {
        element.children[0].textContent = "Пт";
        break;
      }
      case 6: {
        element.children[0].textContent = "Сб";
        element.classList.add("page-nav__day_weekend");
        break;
      }
      case 0: {
        element.children[0].textContent = "Вс";
        element.classList.add("page-nav__day_weekend");
        break;
      }
      default:
        break;
    }
  });
  let navDay = document.getElementsByClassName("page-nav")[0];
  navDay
    .getElementsByClassName("page-nav__day_chosen")[0]
    .classList.toggle("page-nav__day_chosen"); // выключаем выбранный день по умолчанию
  navDay.children[0].classList.toggle("page-nav__day_chosen"); // делаем активным сегодняшний день

  let pageNavDays = Array.from(
    document.getElementsByClassName("page-nav__day")
  ); // смена текущей даты
  pageNavDays.forEach((e, index) => {
    e.onclick = function () {
      document
        .getElementsByClassName("page-nav__day_chosen")[0]
        .classList.toggle("page-nav__day_chosen"); // выключаем текущий
      e.classList.toggle("page-nav__day_chosen"); // ставим выбранный
      selectDay.setDate(currentDate.getDate() + index);
      setFilms(JSON.parse(localStorage.getItem("info")), selectDay); // обновляем всю информацию под выбранную дату
    };
  });
}

let currentDate = new Date(); // текущая дата
let selectDay = new Date(); // выбранный день

function startSetInfo() {
  if (!localStorage.length) {
    // если Веб-хранилище пустое , отправляем запрос на сервер
    sendRequest("event=update", (info) => {
      localStorage.setItem("info", info); // сохраняем информацию с сервера
      localStorage.setItem("date", new Date()); // и дату сохранения файлов
      setFilms(JSON.parse(info), selectDay); // устанавливаем фильмы
    });
  } else {
    let date = new Date(localStorage.getItem("date")); // получаем дату сохранения файлов
    if (currentDate.getDate() === date.getDate()) {
      // если дата сегодняшняя , то получаем информацию из локальных файлов
      let info = JSON.parse(localStorage.getItem("info")); // распарсиваем данные и устанавливаем фильмы
      setFilms(info, selectDay);
    } else {
      // делаем новый запрос на сервер (файлы устарели)
      sendRequest("event=update", (info) => {
        localStorage.setItem("info", info); // сохраняем информацию с сервера
        localStorage.setItem("date", new Date()); // и дату сохранения файлов
        setFilms(JSON.parse(info), selectDay); // устанавливаем фильмы
      });
    }
  }
}

function setFilms(info, date) {
  // принимает информацию с сервера либо из Веб-хранилища (localStorage), где date - конкретный и последующие дни, является Date.
  let moviesSection = Array.from(document.getElementsByClassName("movie")); // получаем все секции с фильмами
  let movieSection = moviesSection[0].cloneNode(true); // создаём копию 1 секции
  let seanceHall = Array.from(
    movieSection.getElementsByClassName("movie-seances__hall")
  )[0].cloneNode(true); // копируем блок сеанса
  moviesSection.forEach((element) => {
    element.remove();
  }); // Удаляем все блоки
  Array.from(
    movieSection.getElementsByClassName("movie-seances__hall")
  ).forEach((e) => {
    e.remove();
  }); // удаляем информацию о сеансах
  let main = Array.from(document.getElementsByTagName("main"))[0]; // получаем элемент main  в котором лежат секции с фильмами

  let filmsHalls = {}; // объект , ключ - ид фильма, по ключу массив сеансов .
  info.seances.result.forEach((e) => {
    filmsHalls[e.seance_filmid]
      ? filmsHalls[e.seance_filmid].push(e)
      : (filmsHalls[e.seance_filmid] = [e]);
  });

  let openHalls = {}; // содержит открытые залы. Где ключ - название зала (зал1....зал(N))
  info.halls.result.forEach((e) => {
    // ищем открытые залы
    if (e.hall_open === "1") {
      openHalls[e.hall_id] = e;
    }
  });

  info.films.result.forEach((element) => {
    //добавляем новые секции (с новой инф.)
    let newMovieSection = movieSection.cloneNode(true);
    let curretnFilmHalls = {};
    Array.from(
      newMovieSection.getElementsByClassName("movie__poster-image")
    )[0].src = element.film_poster;
    Array.from(
      newMovieSection.getElementsByClassName("movie__title")
    )[0].textContent = element.film_name;
    Array.from(
      newMovieSection.getElementsByClassName("movie__data-duration")
    )[0].textContent =
      element.film_duration +
      " " +
      sklonenie(Number(element.film_duration), ["минута", "минуты", "минут"]);
    Array.from(
      newMovieSection.getElementsByClassName("movie__data-origin")
    )[0].textContent = element.film_origin;
    Array.from(
      newMovieSection.getElementsByClassName("movie__synopsis")
    )[0].textContent = element.film_description;

    filmsHalls[element.film_id].forEach((e) => {
      // зал и время для конкретного фильма
      if (openHalls[e.seance_hallid]) {
        let hall = openHalls[e.seance_hallid];
        if (curretnFilmHalls[hall.hall_name]) {
          curretnFilmHalls[hall.hall_name].push(e.seance_time);
        } else {
          curretnFilmHalls[hall.hall_name] = [e.seance_time];
        }
      }
    }); // теперь в curretnFilmHalls ключ - номер зала, значение - массив с датами сеансов в этом зале.
    //{Зал1: ['10:10', '17:20'], Зал3: ['16:00'],...} по объекту на каждый фильм

    let sortedHalls = {}; // сортируем залы по порядку
    Object.keys(curretnFilmHalls)
      .sort()
      .forEach((key) => {
        sortedHalls[key] = curretnFilmHalls[key];
      });

    Object.keys(sortedHalls).forEach((key) => {
      // перебираем все залы и выводим информацию
      let hall = seanceHall.cloneNode(true);
      let ul = hall.getElementsByTagName("ul")[0];
      let li = ul.getElementsByTagName("li")[0].cloneNode(true);
      ul.innerHTML = "";

      hall.getElementsByTagName("h3")[0].textContent =
        key.substring(0, 3) + " " + key.substring(3); // добавляем пробел (Зал1 => Зал 1)

      sortedHalls[key].forEach((time) => {
        // перебираем время конкретного фильма в конкретном зале
        let currHall = Object.values(openHalls).find(
          (hall) => hall.hall_name === key
        ); // возвращаем текущий зал
        let currSeance = filmsHalls[element.film_id].find((seance) => {
          return seance.seance_time === time;
        }); // получаем текущий сеанс по заданому времени
        let newTime = li.cloneNode(true);
        let refHall = newTime.children[0]; // тег <а></a>

        refHall.classList.remove("acceptin-button-disabled"); //удаляем класс отключенной кнопки
        refHall.textContent = time; // Устанавливаем всю необходимую информацию в атрибуты <а></a>
        refHall.setAttribute("data-film-id", element.film_id); // id фильма
        refHall.setAttribute("data-film-name", element.film_name); // название фильма
        refHall.setAttribute(
          "data-hall-name",
          key.substring(0, 3) + " " + key.substring(3)
        ); // Название зала
        refHall.setAttribute("data-hall-id", currHall.hall_id); // id зала
        refHall.setAttribute("data-price-vip", currHall.hall_price_vip); // цена за VIP место
        refHall.setAttribute(
          "data-price-standart",
          currHall.hall_price_standart
        ); // цена за обычное место
        refHall.setAttribute("data-seance-id", currSeance.seance_id); // id текущего сеанса (сеанс за который будет отвечать конкретный <а></a>)
        refHall.setAttribute("data-seance-time", currSeance.seance_time); //время сеанса
        refHall.setAttribute("data-seance-start", currSeance.seance_start); //Время начала сеанса
        refHall.setAttribute(
          "data-seance-timestamp",
          toSecond(currSeance.seance_time, date)
        ); //timestamp

        if (selectDay.getDate() === currentDate.getDate()) {
          // выключаем сеансы, которые уже прошли
          let timeSeance = Number(
            refHall.getAttribute("data-seance-timestamp")
          ); // время сеанса в секундах
          let currentTime = Math.floor(currentDate.getTime() / 1000); // текущее время в секундах
          if (timeSeance < currentTime) {
            refHall.classList.add("acceptin-button-disabled");
          }
        }

        let requestBody = `event=get_hallConfig&timestamp=${refHall.getAttribute(
          "data-seance-timestamp"
        )}&hallId=${refHall.getAttribute(
          "data-hall-id"
        )}&seanceId=${refHall.getAttribute("data-seance-id")}`;

        refHall.onclick = function () {
          sendRequest(requestBody, (hallInfo) => {
            sessionStorage.setItem("hallInfo", hallInfo);
            // sessionStorage.setItem("hall_config", currHall.hall_config); // если hallInfo = null, сохраняем конфиг зала

            for (let i = 0; i < refHall.attributes.length; i++) {
              const attribute = refHall.attributes[i];
              sessionStorage.setItem(attribute.name, attribute.value); // сохраняем все атрибуты тега <a></a>, чтобы передать их на след. страницу
            }
            window.location.href = "hall.html"; // устанавливаем ссылку на страницу
          });
          return false;
        };
        ul.appendChild(newTime); //добавляем новый тег <li></li>
      });
      newMovieSection.appendChild(hall); //добавлям новый зал в секцию с залами для фильма
    });
    main.appendChild(newMovieSection); //добавляем блок с конкретным фильмом
  });
}

function toSecond(time, date) {
  let [hours, minutes] = time.split(":");
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  return Math.floor(date.getTime() / 1000); // округляем в меньшую сторону
}

// Склонение окончаний в словах Javascript:
function sklonenie(number, titles) {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[
    number % 100 > 4 && number % 100 < 20
      ? 2
      : cases[number % 10 < 5 ? number % 10 : 5]
  ];
}

startSetInfo();

setInterval(() => {
  // каждую секунду проверяем сеанс и обновляем текущее время
  currentDate = new Date();
  let acceptinButton = Array.from(
    document.getElementsByClassName("movie-seances__time")
  );
  acceptinButton.forEach((e) => {
    if (selectDay.getDate() === currentDate.getDate()) {
      // выключаем сеансы, которые уже прошли
      let timeSeance = Number(e.getAttribute("data-seance-timestamp")); // время сеанса в секундах
      let currentTime = Math.floor(currentDate.getTime() / 1000); // текущее время в секундах
      if (timeSeance < currentTime) {
        e.classList.add("acceptin-button-disabled");
      } else {
        e.classList.remove("acceptin-button-disabled"); //удаляем класс отключенной кнопки
      }
    }
  });
}, 1000);
