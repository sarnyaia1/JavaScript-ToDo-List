const inputField = document.getElementById('todo-input');
const searchField = document.getElementById('search');  // Keresés mező Ármin
const inputRange = document.getElementById('input-range');   								
const addButton = document.getElementsByClassName('add-button')[0];
const noTodosDiv = document.getElementById('no-todos');	
const eventDescription = document.getElementById('today-event');
const todoTime = document.getElementById('input-date');
const eventUrgency = document.getElementById('event-urgency');							//Feladat megadása után resetelje a fontossági mércét és dátumot is
const dateControl = document.querySelector('input[type="datetime-local"]'); // a dátum megadásához használt input mező
const currentDateObject = new Date();
// console.log(currentDateObject.toISOString());
currentDateObject.setHours(currentDateObject.getHours() + 2);
dateControl.value = currentDateObject.toISOString().substr(0, 16);

document.getElementById('search-todos').style.display = 'none' // Alapra ne jelenjen meg a keresés eredmény blokk - Ármin

// a naptár létrehozása a calendar id-jú div-ben
var calendar = new Calendar({
    id: '#calendar',
    calendarSize: 'large',
    startWeekday: 1,
    weekdayDisplayType: 'long-lower',
    dateChanged: dateSelectedOnCalendar
});																		


/*addButton.addEventListener('click', () => {									//Azt is be kellene állítani, hogy újat hozzon létre, ne egyet írjon felül
    if(inputRange.value < 26) {												// = > ez mondjuk elég komplex, mert nem tudom hogy kapcsolni az aktuális naphoz (talán td elemre click event és létrehozás..)
        eventUrgency.innerHTML = "Ráérős"; 	
    } else if(inputRange.value > 25 && inputRange.value < 51)	{
        eventUrgency.innerHTML = "Nem sürgős";
    } else if(inputRange.value > 50 && inputRange.value < 76)	{
        eventUrgency.innerHTML = "Fontos";
    } else if(inputRange.value > 75)	{
        eventUrgency.innerHTML = "Azonnali";
    }
});*/


// Aktuális dátum megjelenítése naptáron
let today = new Date();
// document.getElementById('today').innerHTML = today.toDateString();

class TodoController {
    constructor() {
        this.currentId = 0;
        this.todos = [];
        
        var allTodos = JSON.parse(localStorage.getItem('todos')) || [];

        allTodos.forEach(todo => {
            this.createTodo(todo.title, new Date(todo.date), todo.done);
        });

        this.#updateTodos();
    }

    createTodo(title, date, done = false) {
        var exist = false;

        this.todos.forEach(todo => {
            if(todo.title.toLowerCase() == title.toLowerCase()) {
                alert('Már létezik!');
                exist = true;
            }
        });
        
        if (!exist) {
            this.currentId += 1;
            var newTodoId = this.currentId;
            var todoDate = date || new Date(dateControl.valueAsNumber).toISOString();
            var newTodo = new Todo(title, todoDate, newTodoId, done);
            this.todos.push(newTodo); //todo osztály példányosítás
            addTodoToCalendar(newTodo);

            this.#updateTodos();
            this.#saveTodos();
        }
    }
    
    todoMoveUp(id) {
        var todoIndex;
        this.todos.forEach((todo, index) => {
            if(todo.id == id) {
                todoIndex = index;
            }
        });
        if(todoIndex != 0) {
                var tmp = this.todos[todoIndex];
                this.todos[todoIndex] = this.todos[todoIndex-1];
                this.todos[todoIndex-1] = tmp;

            this.#updateTodos();
            this.#saveTodos();
        }    
        
    }

    todoMoveDown(id) {
        var todoIndex;
        this.todos.forEach((todo, index) => {
            if(todo.id ==id) {
                todoIndex = index;

            }
        });
        if(todoIndex != this.todos.length-1) {
        var tmp = this.todos[todoIndex];
                this.todos[todoIndex] = this.todos[todoIndex+1];
                this.todos[todoIndex+1] = tmp;

            this.#updateTodos();
            this.#saveTodos();
        }    
    }
    toggleDone(id) {
        this.todos.forEach(todo => {
            if (todo.id == id) {
                todo.done = !todo.done;
            }
        });
        
        this.#updateTodos();
        this.#saveTodos();
    }
    
    todoDelete(id) {
        this.todos.forEach((todo, index) => {
            if (todo.id == id) {
                this.todos.splice(index, 1);
            }
        });
        this.#updateTodos();
        this.#saveTodos();
    }
    
    todoTitleUpdate(id, title) { // editálás utáni enter 
        this.todos.forEach(todo => {
            if (todo.id ==id) {
                todo.title = title;
                this.toggleEditing(id);
            }
        });

        this.#updateTodos();
        this.#saveTodos();
        
    }
    
    toggleEditing(id) {
        this.todos.forEach (todo => {
            if (todo.id == id) {
                if (todo.done == true) {
                    return;
                }
                todo.editing = !todo.editing; // boolean érték, edit/nem edit
            }
        });

        this.#updateTodos();
    }
    
    removeEditingMode() {
        this.todos.forEach (todo => {
            if (todo.editing) {
                todo.editing = false;
            }
        });
        
        this.#updateTodos();
    }
    
    #updateTodos() {
        var div = document.getElementById('todos');
        div.innerHTML = '';
        
        // Megnézni, hogy vannak-e csak mára érvényes todok
        if (!this.#getTodosFromToday().length) {			
            noTodosDiv.style.display = 'block';
            showTodoList(this.#getTodosFromToday())  // Minden módosításnál meghívom a megjelenítés végző függvényt - Ármin
        } else {
            noTodosDiv.style.display = 'none';

            div.innerHTML += `
                <h3 class="today-todo-title">A mai tennivalóid</h3>
            `

            // végigmenni az összes mára érvényes todon
            this.#getTodosFromToday().forEach(todo => {
                if (isToday(new Date(todo.date))) { // ha a todo dátuma és a mai dátum megegyezik akkor mutatjuk

                showTodoList(this.#getTodosFromToday()) // Á
                    var todoHTML = `    
                        <div class="todo ${todo.done ? 'todo-container-done' : ''}">
                            ${todo.editing 
                                ? getTodoInput(todo)
                                : getTodoTitle(todo)
                            }
                        </div>
                    `;

                    div.innerHTML += todoHTML; // létrehozott todo hozzáadása
                }
            });
        }
        
        function getTodoInput(todo) {
            return `<input class="todo-edit" type="text" autofocus value="${todo.title}" onkeyup="todoTitleUpdate(event, ${todo.id}, event.target.value)">`;
        }
        
        function getTodoTitle(todo) {
            return `
                <span class="dot"></span>
                <div class="list-item-title" onclick="toggleEditing(${todo.id})">
                    <span class="${todo.done ? 'todo-done' : ''}" >${todo.title}</span>
                </div>
                <div class="list-item-buttons">
                    <i class="fas fa-arrow-up" onclick="todoMoveUp(${todo.id})"></i>
                    <i class="fas fa-arrow-down" onclick="todoMoveDown(${todo.id})"></i>
                    <i class="${todo.done ? 'fas fa-minus-circle' : 'fas fa-check'}" onclick="toggleDone(${todo.id})" ></i>
                    <i class="fas fa-trash-alt" onclick="todoDelete(${todo.id})"></i>
                </div>
            `;
        }
    }
    #saveTodos() {
        setTimeout(() => {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        }, 0);
    }

    #getTodosFromToday() {
        // Ki filterezni az összes todo közül csak azokat,
        return this.todos.filter(todo => {
            // amiknek a megadott dátuma ma van
            return isToday(new Date(todo.date));
        });
    }
}
class Todo {
    constructor(title, date, id, done) {
        this.id = id;
        this.title = title;
        this.done = typeof done != 'undefiend' ? done : false;
        this.editing = false;
        this.date = date;
    }
}
var todoController = new TodoController(); // todo controller példányosítás

// Keresést végző függvény - Ármin
function search() {
    document.getElementById('search-result').innerHTML = '';

    let search = searchField.value;

    if (search === '') {
        document.getElementById('search-todos').style.display = 'none'
    } else {
        document.getElementById('search-todos').style.display = 'block'
    }

    const res = [];
    todoController.todos.filter(todo => {
        if (todo.title.includes(search)) {
            res.push(todo.title)    
        }
    })
    if (res.length === 0) {
        document.getElementById('search-todos').style.display = 'none'
    }

    res.forEach(searchResult => {
        document.getElementById('search-result').innerHTML += `<p>${searchResult}<p>`
    })
    }
function create(title) {
    var title = inputField.value;

    if (title.length > 2) {
        todoController.createTodo(title);
        resetInputField();
    } else {
        alert('Legalább 3 karaktert írj be!');	
    }
}

function resetInputField() {
    inputField.value = '';
}

function toggleDone(id) {
    todoController.toggleDone(id);
}

function todoDelete(id) {
    todoController.todoDelete(id);
}

function toggleEditing(id) {
    todoController.toggleEditing(id);
}

function todoMoveUp(id) {
    todoController.todoMoveUp(id)
}

function todoMoveDown(id) {
    todoController.todoMoveDown(id)
}

function todoTitleUpdate(event, id, newTitle) {
    if (event.key == 'Enter') {
        todoController.todoTitleUpdate(id, newTitle);
    }
}

function getDateAsString(dateObject) {
    var year = dateObject.getUTCFullYear(); // lekérni a date objectől az aktuális évet
    var month = dateObject.getUTCMonth() + 1; // lekérni a date objectől az aktuális hónapot
    var day = dateObject.getUTCDate(); // lekérni a date objectől az aktuális napot

    // Ponttal elválasztva visszaadni az évet, hónapot és napot
    return year + "." + month + "." + day;
    
}

function isToday(dateObject) {
    // megnézni, hogy a mai dátum stringként megegyezik a megadott dátum objektummal stringként
    return getDateAsString(new Date()) === getDateAsString(dateObject);
}

/*

    A naptár kezeléséhez tartozó dolgok (függvények)

*/

function addTodoToCalendar(todo) {
    calendar.addEventsData([
        {
            start: todo.date, // a todo dátumjának a kezdete, megegyezik az end-del
            end: todo.date, // a todo dátumjának a vége, megegyezik a start-tal
            todo: todo // elmentjük az adott todot az adott naphoz
        }
    ]);
}

// Megjeleníti a napra vonatkozó feladatokat - Ármin
// Törlés esetén ez elemet kitörli, viszont csak f5 után tünik el ténylegesen az esemény a naptárből.
function showTodoList(eventsOnCurrentDate) {
    document.getElementById('calendar-todos').innerHTML = '';

    if (eventsOnCurrentDate.length === 0) {
        document.getElementById('calendar-todos').innerHTML +=  `<p>Nincs feladat</p>`;    
    }
    eventsOnCurrentDate.forEach(event => {
        document.getElementById('calendar-todos').innerHTML +=  `<p>${event.title} <i class="fas fa-trash-alt" onclick="todoDelete(${event.id})"></i></p>`;    
    });
}

// Napváltásnál frissit a megjelenítendő feladatokat. - Ármin
function dateSelectedOnCalendar(currentDate, eventsOnCurrentDate) {
    const todos = [];
    eventsOnCurrentDate.forEach(event => {
        todos.push(event.todo);
    })

    showTodoList(todos);
}