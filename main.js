'use strict';
//selectors
const currentDate = document.querySelector('.navbar__date');
const currentHour = document.querySelector('.navbar__hour');

const newTodoForm = document.querySelector('.home__newtodo-form');
const newTodoInput = document.querySelector('.new-todo__textbox');
const myTodoList = document.querySelector('#my-todo-list');
const addBtn = document.querySelector('.new-todo__add');
const datepicker = document.querySelector('.new-todo__date');
const ulEl = document.querySelector('.lists');
const locationEl = document.querySelector('.navbar__location');

//get today date & hour
const now = new Date();
const day = `${now.getDate()}`.padStart(2, 0);
const month = `${now.getMonth() + 1}`.padStart(2, 0);

const year = now.getFullYear();
const hour = now.getHours();
const minutes = `${now.getMinutes()}`.padStart(2, 0);
currentDate.textContent = `${day}/${month}/${year}`;
currentHour.textContent = `${hour}:${minutes}`;

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
        throw new Error(`Something went wrong(${response.status})`);
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
  const quoteEl = document.querySelector('.home__today-quote');
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

//addtodo function to add new todo to todos array
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
