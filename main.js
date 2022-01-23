'use strict';
//selectors
const currentHour = document.querySelector('.header__hour');

const quoteEl = document.querySelector('.today-quote__text');
const calendarBody = document.querySelector('.calendar__body');
const calendarMonthYear = document.querySelector('.calendar__month-year');
const calendarDays = document.querySelectorAll('.calendar__day');
const alertMsgModal = document.querySelector('.todo-list__alert-msg');
const alertModalEscapeBtn = document.querySelector(
  '.todo-list__alert-msg__escape'
);
const newTodoForm = document.querySelector('.new-todo__form');
const newTodoInput = document.querySelector('.new-todo__input');
const myTodoList = document.querySelector('.todos');
const addBtn = document.querySelector('.new-todo__add-btn');
const todoUlEl = document.querySelector('.todos__lists');
const locationEl = document.querySelector('.header__location');
const completedDeleteBtn = document.querySelector('.todos__completed-delete');
const monthBeforeBtn = document.querySelector('.calendar__btn--back');
const monthAfterBtn = document.querySelector('.calendar__btn--after');
const overlayEl = document.querySelector('.overlay');

/////////////////// HEADER

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
    .then((res) => {
      if (!res.ok)
        throw new Error(`Problem with getting location data (${res.status})`);
      return res.json();
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

//get today day, date, month, year and hour
const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
let now = new Date();
const today = days[now.getDay() - 1];
const date = now.getDate();
let month = now.getMonth() + 1;

let year = now.getFullYear();
const hour = now.getHours();
const minutes = `${now.getMinutes()}`.padStart(2, 0);
calendarMonthYear.textContent = `${month} / ${year}`;
currentHour.textContent = `⏰ ${hour}:${minutes}`;

//clock update function to attach setInterval -> run in init function
function upateTime() {
  const nowUpdate = new Date();
  const updateHour = nowUpdate.getHours();
  const updateMinutes = `${nowUpdate.getMinutes()}`.padStart(2, 0);
  currentHour.textContent = `⏰ ${updateHour}:${updateMinutes}`;
}

///////////////////////////////////////// QUOTE Feature

//Fetch quotes API and render 1 random quote

function loadQuotes() {
  return fetch('https://type.fit/api/quotes')
    .then((res) => {
      if (!res.ok) throw new Error(`An error occured (${res.status})`);
      return res.json();
    })
    .then(
      (data) =>
        (quoteEl.innerHTML = `${
          data[Math.trunc(Math.random() * 1643 + 1)].text
        }`)
    )
    .catch(
      (err) => (quoteEl.innerHTML = `Random quote load failed ${err.message}`)
    );
}

/////////////////////////////////////////New todo input
let todos = [];

//function to add new todo input to todos array
function addtodo(item) {
  //1. make a new todo object
  const todo = {
    id: Date.now(),
    date: selectedDate,
    month: month,
    year: year,
    name: item,
    completed: false,
  };

  // 2.  add it to todos array
  todos.push(todo);
  // 3. store it in localStorage
  addToLocalStorage(todos);
  // 4. restting new-todo input field
  newTodoInput.value = '';
  newTodoInput.focus();
}

//add to local storage function
function addToLocalStorage(todos) {
  localStorage.setItem('todos', JSON.stringify(todos));
}

//todos rendering function
function renderTodos(todos) {
  //1. clear todo list element HTML
  todoUlEl.innerHTML = '';
  //2. filter todos by selected date
  const filteredTodo = todos.filter(
    (item) =>
      item.date == selectedDate && item.month === month && item.year === year
  );
  // 3. ul, li, date creation
  filteredTodo.forEach((item) => {
    const checked = item.completed ? 'checked' : null;
    const checkedClass = item.completed ? 'checked' : '';
    const todoLiEl = document.createElement('li');
    todoLiEl.classList.add('todos__item');
    todoLiEl.setAttribute('data-key', item.id);

    //4. inner HTML
    todoLiEl.innerHTML = `
        <div class="todos__item__checkbox-container">
          <input type="checkbox" id="checkbox${item.id}" class="todos__item__checkbox" ${checked}>
          <label class="todos__item__checkbox-label" for="checkbox${item.id}">
            <span class="todos__item__checkbox-button" />
          </label>
        </div>
        <input type = "text" class="todos__item__text ${checkedClass}" readonly="readonly" value='${item.name}'>

        <div class="list_actions">
        <button class="btn todos__item__edit"><i class="fas fa-edit"></i></button>
        <button class="btn todos__item__delete"><i class="fas fa-trash-alt"></i></button>
        </div>
      `;
    // 5. insert todo list
    todoUlEl.insertAdjacentElement('beforeend', todoLiEl);
  });
  //6. add delete completed items button at the end if there is todo to render
  filteredTodo.length > 0
    ? (completedDeleteBtn.innerHTML = `<i class="fas fa-eraser"></i> Delete completed items`)
    : (completedDeleteBtn.innerHTML = '');
}

//when clicking add btn, check if there is input and add new todo
newTodoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const task = newTodoInput.value;
  //if there is no input value, show message modal
  if (task.trim().length === 0) {
    const alertMsgModal = document.querySelector('.todo-list__alert-msg');
    alertMsgModal.classList.add('alert--active');
    overlayEl.classList.add('overlay--active');
    //reset new todo input
    newTodoInput.value = '';
  } else {
    //if there is input value, add it to todos array & render todos
    addtodo(task);
    renderTodos(todos);
  }
});

//when clicking close btn of alert msg modal, remove active class from the modal element & overlay element
alertModalEscapeBtn.addEventListener('click', () => {
  alertMsgModal.classList.remove('alert--active');
  overlayEl.classList.remove('overlay--active');
});

/////////////////////////////////////////Calender
let startDate = new Date(year, month - 1, 1).getDate();
let startDay = new Date(year, month - 1, 1).getDay();
let lastDate = new Date(year, month, 0).getDate();

//calender rendering
//1. create calendar column to insert dates
const createCalendarColumn = () => {
  const calendarDateUl = document.createElement('ul');
  calendarDateUl.classList.add('calendar__dates');
  calendarBody.insertAdjacentElement('beforeend', calendarDateUl);
};
//2. create and insert empty date item before start day
const createEmptyItems = () => {
  for (let i = 0; i < startDay; i++) {
    //getDay method value starts from 0
    const calendarDateLi = document.createElement('li');
    calendarDateLi.classList.add('calendar__date');
    calendarDateLi.innerHTML = '';
    const calendarDateUl = document.querySelector('.calendar__dates');
    calendarDateUl.insertAdjacentElement('beforeend', calendarDateLi);
  }
};

//3. Create date element and insert it to the calendar (from start date to last date of month)
const createCalenderDates = () => {
  for (let i = 1; i <= lastDate; i++) {
    //start date of month = 1 = i
    if (startDay !== 7) {
      //start day: 0~6,??????????????? 일주일은 한 줄에 7칸이니까 7이상은 찍히지 않는다.
      const calendarDateLi = document.createElement('li');
      calendarDateLi.classList.add('calendar__date');
      calendarDateLi.setAttribute('data-key', `date-${i}`);
      calendarDateLi.innerHTML = `${i}`;
      calendarBody.lastElementChild.insertAdjacentElement(
        'beforeend',
        calendarDateLi
      );
      startDay += 1;
      //요일값이 하루 추가된걸 for문에 알려줌
    } else {
      //startday = 7 -> column is full
      //create new column
      createCalendarColumn();
      //create date and insert in the new column
      const calendarDateLi = document.createElement('li');
      calendarDateLi.classList.add('calendar__date');
      calendarDateLi.setAttribute('data-key', `date-${i}`);
      calendarDateLi.innerHTML = `${i}`;
      calendarBody.lastElementChild.insertAdjacentElement(
        'beforeend',
        calendarDateLi
      );

      //make startday 1 to fill the new date column
      startDay = startDay - 6;
    }
  }
};
// Calendar rendering
function renderCalendar() {
  createCalendarColumn();
  createEmptyItems();
  createCalenderDates();
}

//change to previous/next month calendar

function clearDateRows() {
  const dateRows = document.querySelectorAll('.calendar__dates');
  dateRows.forEach((row) => row.remove());
}

function updateCalendar() {
  calendarMonthYear.textContent = `${month} / ${year}`;
  startDate = new Date(year, month - 1, 1).getDate();
  startDay = new Date(year, month - 1, 1).getDay();
  lastDate = new Date(year, month, 0).getDate();
  renderCalendar();
}

//when clicking left arrow of month
monthBeforeBtn.addEventListener('click', () => {
  //1. clear all date rows
  clearDateRows();
  //2. month & year update
  //if the month is Jan
  if (month === 1) {
    //change to previous year
    year--;
    //change month to Dec
    month = 12;
    //update new dates data
    updateCalendar();
  } else {
    //if month is 2 - 12
    month--;
    updateCalendar();
  }
});

//when clicking right arrow of month
monthAfterBtn.addEventListener('click', () => {
  clearDateRows();
  //if month is Dec
  if (month === 12) {
    //change to next year
    year++;
    //set month to Jan
    month = 1;
    //update new dates data
    updateCalendar();
  } else {
    month++;
    updateCalendar();
  }
});

//calendar date selection / deselction function to attach to eventlistener

//set the initial selected date as today
let selectedDate = date;

//add selected style class to selcted date
function selectDate() {
  const selectedDateEl = document.querySelectorAll(
    `[data-key="date-${selectedDate}"]`
  );
  selectedDateEl[0].classList.add('calendar__date--selected');
}

//Remove selected class when user select another date
function deselectDate() {
  const formerDate = document.querySelector('.calendar__date--selected');
  if (formerDate) formerDate.classList.remove('calendar__date--selected');
}

// When clicking date in the calendar, add selected class

calendarBody.addEventListener('click', (e) => {
  if (e.target.classList.contains('calendar__date')) {
    //1. remove selected stype from the current makred date
    deselectDate();
    // 2. update selectedDate as clicked date
    selectedDate = e.target.innerHTML;
    // 3. give selected style to new selected date
    selectDate();
    // 4. render todos of new selected date
    renderTodos(todos);
  }
});

////////////////////////////
//////////////////////////////////////////////////////////////Todo list

//edit & delete btn function

// function to delete a todo from todos array, update localstorage and render updated list

function deleteTodo(id) {
  todos = todos.filter((item) => {
    //return todos except the list to be deleted
    return item.id != id; // using !=, because here types are different. One is number and other is string
  });
  // update filtered todos to the localStorage
  addToLocalStorage(todos);
}

function editDeleteList(e) {
  const editSaveBtn = e.target.closest('.todos__item__edit');
  const deleteBtn = e.target.closest('.todos__item__delete');
  const inputEl = e.target.parentNode.previousElementSibling;
  const eventList = e.target.parentNode.parentNode;

  if (!editSaveBtn && !deleteBtn) return;
  //if Edit/save button is clicked
  if (editSaveBtn) {
    //if it's edit button, remove input read-only attribute and change the button to save btn
    if (
      editSaveBtn.innerHTML == '<i class="fas fa-edit" aria-hidden="true"></i>'
    ) {
      editSaveBtn.innerHTML = '<i class="fas fa-save"></i>';
      inputEl.removeAttribute('readonly');
      inputEl.focus();
    } else {
      //if it's save button -> it means input is being edited
      // -> add read-only attribute to input, change the button to edit btn and store update input
      inputEl.setAttribute('readonly', 'readonly');
      e.target.innerHTML = '<i class="fas fa-edit"></i>';
      const updatedTodo = todos.find(
        (item) => item.id == eventList.getAttribute('data-key')
      );
      updatedTodo.name = inputEl.value;
      addToLocalStorage(todos);
    }
  }
  //if delete button is cliecked
  if (deleteBtn) {
    //delete event element with its ID
    deleteTodo(eventList.getAttribute('data-key'));
    // render updated todos
    renderTodos(todos);
  }
}

//function to update todo completed data
function completeTodo(id) {
  //find the checked todo by ID
  let checkedTodo = todos.find((item) => item.id == id);

  // If completed key's value is false -> true / if true -> false
  checkedTodo.completed === false
    ? (checkedTodo.completed = true)
    : (checkedTodo.completed = false);
  //store updated todos to localStorage
  addToLocalStorage(todos);
  //render updated data
  renderTodos(todos);
}
//when clicking checkbox, update checkbox style and 'completed' data
function checkTodo(e) {
  const checkboxEl = e.target.closest('.todos__item__checkbox');
  const inputEl = e.target.nextElementSibling;
  const eventList = e.target.parentNode.parentNode;
  //if checkbot is not clicked return
  if (!checkboxEl) return;
  //by clicking checkbox, add checked style & completed key value update
  inputEl.classList.toggle('checked');
  completeTodo(eventList.getAttribute('data-key'));
}

//edit & delete & checkbox btn click event when ul element is clicked

todoUlEl.addEventListener('click', (e) => {
  editDeleteList(e);
  checkTodo(e);
});

//completed todos delete button event
completedDeleteBtn.addEventListener('click', () => {
  //loop each todo and check 'complete' value -> if true, delete todo
  todos.forEach((item) => {
    if (item.completed) {
      deleteTodo(item.id);
      renderTodos(todos);
    }
  });
});

// function to read local storage to render it to todo list
function getLocalStorage() {
  const savedTodos = localStorage.getItem('todos');
  // if savedTodos exists
  if (savedTodos) {
    // converts back to array and store it in todos array
    todos = JSON.parse(savedTodos);
  }
}
const init = function () {
  getLocation();
  loadQuotes();
  renderCalendar();
  getLocalStorage();
  renderTodos(todos);
  //add selected style to today date
  selectDate();
  //every minute update time clock
  setInterval(upateTime, 10000);
};

window.addEventListener('load', () => {
  init();
});

//background change
if (hour > 19) {
  document.body.style.background =
    'linear-gradient(331deg, rgba(228,157,188,1) 0%, rgba(12,52,100,1) 79%)';
}
