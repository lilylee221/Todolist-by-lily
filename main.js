'use strict';
//selectors
const currentDate = document.querySelector('.navbar__date');
const currentHour = document.querySelector('.navbar__hour');

const quoteEl = document.querySelector('.home__today-quote');
const calendarBody = document.getElementById('calendar__body');
const calendarMonthYear = document.querySelector('.calendar__month-year');
const calendarDays = document.querySelectorAll('.calendar__day');
const newTodoForm = document.querySelector('.home__newtodo-form');
const newTodoInput = document.querySelector('.new-todo__textbox');
const myTodoList = document.querySelector('#my-todo-list');
const addBtn = document.querySelector('.new-todo__add');
const datepicker = document.querySelector('.new-todo__date');
const ulEl = document.querySelector('.lists');
const locationEl = document.querySelector('.navbar__location');

//get today day, date, year and hours

const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
let now = new Date();
const today = days[now.getDay() - 1];
const date = now.getDate();
let month = now.getMonth();

let year = now.getFullYear();
const hour = now.getHours();
const minutes = `${now.getMinutes()}`.padStart(2, 0);
calendarMonthYear.textContent = `${month + 1} / ${year}`;
currentDate.textContent = `${date}/${month + 1} /${year}`;
currentHour.textContent = `${hour}:${minutes}`;

let startDate = new Date(year, month, 1).getDate();
let startDay = new Date(year, month, 1).getDay();
let lastDate = new Date(year, month + 1, 0).getDate();

// Calendar rendering function

function renderCalendar() {
  const calendarDateUl = document.createElement('ul');
  calendarDateUl.classList.add('calendar__dates');
  calendarBody.insertAdjacentElement('beforeend', calendarDateUl);

  for (let i = 0; i < startDay; i++) {
    //first_day에 해당하는 요일까지 열을 만든다.
    //요일은 0부터 시작하기 때문에 i값도 0에서 시작한다.
    const calendarDateLi = document.createElement('li');
    calendarDateLi.classList.add('calendar__date');
    calendarDateLi.innerHTML = '';
    calendarDateUl.insertAdjacentElement('beforeend', calendarDateLi);
  }
  for (let i = 1; i <= lastDate; i++) {
    // 달력은 1일부터 시작하므로 i=1
    if (startDay != 7) {
      //first_day는 0~6이다. 일주일은 한 줄에 7칸이니까 7이상은 찍히지 않는다.
      const calendarDateLi = document.createElement('li');
      calendarDateLi.classList.add('calendar__date');
      calendarDateLi.setAttribute('data-key', `date-${i}`);
      calendarDateLi.innerHTML = `${i}`;
      // calendarDateUl.insertAdjacentElement('beforeend', calendarDateLi);
      calendarBody.lastElementChild.insertAdjacentElement(
        'beforeend',
        calendarDateLi
      );
      startDay += 1;
      //요일값이 하루 추가된걸 for문에 알려줌
    } else {
      const calendarDateUl = document.createElement('ul');
      calendarDateUl.classList.add('calendar__dates');
      calendarBody.insertAdjacentElement('beforeend', calendarDateUl);

      //행을 하나 추가
      const calendarDateLi = document.createElement('li');
      calendarDateLi.classList.add('calendar__date');
      calendarDateLi.setAttribute('data-key', `date-${i}`);
      calendarDateLi.innerHTML = `${i}`;
      calendarBody.lastElementChild.insertAdjacentElement(
        'beforeend',
        calendarDateLi
      );

      //세줄은 위와 같음
      startDay = startDay - 6;
      //6을 빼는 이유는 매번 7에서 else문으로 넘어오고, if문이 6번만 하면 되기때문이다.
      //7을 빼버리면 0부터 시작해서 if문이 7번 실행되고 else로 넘어오므로 -6을한다.
    }
  }
}

//calendar date selection / deselction function to attach to eventlistener

let selectedDate = date;

////add class to selcted date
function selectDate() {
  const selectedDateEl = document.querySelectorAll(
    `[data-key="date-${selectedDate}"]`
  );
  selectedDateEl[0].classList.add('calendar__date--selected');
}

////Remove class from former date
function deselectDate() {
  const formerDate = document.querySelector('.calendar__date--selected');
  formerDate.classList.remove('calendar__date--selected');
}

////////////////////////////
//////////////////////////////////////////////////////////////functions

// Geolocation

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, () =>
      alert('error occured')
    );
  }
}
//Geolocation success -> get lat, lng -> get city and country with Geocode API
function success(position) {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;

  getCityCountry(lat, lng);
}

//Get city & country with lat, lng

function getCityCountry(lat, lng) {
  fetch(`https://geocode.xyz/${lat},${lng}?json=1`)
    .then((response) => {
      if (!response.ok)
        throw new Error(
          `Problem with getting location data (${response.status})`
        );
      return response.json();
    })
    .then((data) =>
      locationEl.insertAdjacentText(
        'beforeend',
        `📍 ${data.city}, ${data.country}`
      )
    )
    .catch((err) =>
      locationEl.insertAdjacentText(
        'beforeend',
        `An error occured ${err.message}`
      )
    );
}

//load quotes json and display

function loadQuotes() {
  return fetch('https://type.fit/api/quotes')
    .then((response) => response.json())
    .then(
      (data) =>
        (quoteEl.innerHTML = `${
          data[Math.trunc(Math.random() * 1643 + 1)].text
        }`)
    );
}

function upateTime() {
  const nowUpdate = new Date();
  const updateHour = nowUpdate.getHours();
  const updateMinutes = `${nowUpdate.getMinutes()}`.padStart(2, 0);
  currentHour.textContent = `${updateHour}:${updateMinutes}`;
}

// //addtodo function to add new todo to todos array
let todos = [];
function addtodo(item) {
  //make a new todo object
  const todo = {
    id: Date.now(),
    date: newSelectedDate,
    name: item,
    completed: false,
  };

  // then add it to todos array
  todos.push(todo);
  console.log(todos);
  addToLocalStorage(todos); // then store it in localStorage
  newTodoInput.value = datepicker.value = newSelectedDate = ''; // restting new-todo form
  newTodoInput.focus();
}

//add to local storagge
function addToLocalStorage(todos) {
  localStorage.setItem('todos', JSON.stringify(todos));
  renderTodos(todos);
}

// rendering function to make new todo list
function renderTodos(todos) {
  ulEl.innerHTML = '';
  // ul, li, date creation
  todos.forEach((item) => {
    const checked = item.completed ? 'checked' : null;
    const liEl = document.createElement('li');
    liEl.classList.add('todo__list');
    liEl.setAttribute('data-key', item.id);

    //input creation
    liEl.innerHTML = `
        <div class="dateinfo">${item.date}</div>
        <input type="checkbox" class="checkbox" ${checked} >
        <input type = "text" class="list__text" readonly="readonly" value=${item.name}>

        <div class="list_actions">
        <button class="btn list__edit"><i class="fas fa-edit"></i></button>
        <button class="btn list__delete"><i class="fas fa-trash-alt"></i></button>
        </div>
      `;

    ulEl.append(liEl);
  });
}

// function to read local storage
function getLocalStorage() {
  const savedTodos = localStorage.getItem('todos');
  // if savedTodos exists
  if (savedTodos) {
    // converts back to array and store it in todos array
    todos = JSON.parse(savedTodos);
    renderTodos(todos);
  }
}
const init = function () {
  getLocation();
  loadQuotes();
  getLocalStorage();
  renderCalendar();
  selectDate();
};

//edit & delete btn function
function editDeleteList(e) {
  const editBtn = e.target.closest('.list__edit');
  const deleteBtn = e.target.closest('.list__delete');
  const inputEl = e.target.parentNode.previousElementSibling;

  if (!editBtn && !deleteBtn) return;

  if (editBtn) {
    if (editBtn.innerHTML == '<i class="fas fa-edit" aria-hidden="true"></i>') {
      e.target.innerHTML = '<i class="fas fa-save"></i>';

      inputEl.removeAttribute('readonly');
      inputEl.focus();
    } else {
      inputEl.setAttribute('readonly', 'readonly');
      e.target.innerHTML = '<i class="fas fa-edit"></i>';
    }
  }
  if (deleteBtn) {
    const eventList = e.target.parentNode.parentNode;
    deleteTodo(eventList.getAttribute('data-key'));
    //   // deleteTodo();
  }
}
//////////////////////////////////////////////////////////////////////////////////

window.addEventListener('load', () => {
  init();
});
//Set time interval
setInterval(upateTime, 1000);

// Update newSelectedDate value.
let newSelectedDate;
datepicker.addEventListener('change', function () {
  newSelectedDate = this.value;
});

// When clicking date in the calendar, add selected class

calendarBody.addEventListener('click', (e) => {
  deselectDate();
  selectedDate = e.target.innerHTML;
  selectDate();
});

//when clicking add btn, check if there is input and add new todo
newTodoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const task = newTodoInput.value;
  if (!task) {
    alert('Please input a new todo task');
  } else {
    addtodo(task);
  }
});

//edit & delete btn event

ulEl.addEventListener('click', (e) => editDeleteList(e));

// deletes a todo from todos array, then updates localstorage and renders updated list to screen

function deleteTodo(id) {
  todos = todos.filter((item) => {
    // use != not !==, because here types are different. One is number and other is string
    return item.id != id;
  });
  // update the localStorage
  addToLocalStorage(todos);
}

//editbtn & deletebtn function

// toggle the value to completed and not completed

//complete calendar design and function

//filter button to sort by dates

//make all, active, completed, delete completed function
