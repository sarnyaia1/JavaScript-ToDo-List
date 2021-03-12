var inputField = document.getElementById('todo-input');
var addButton = document.getElementsByClassName('add-button')[0];
var noTodosDiv = document.getElementById('no-todos');

// inputField.addEventListener('keyup', function(event) {
	// if (event.target.value.length < 3) {
		// addButton.disabled = true;
	// } else {
		// addButton.removeAttribute('disabled');
	// }
// });

class TodoController {
	constructor() {
		this.currentId = 0;
		this.todos = [];
		
		//this.createTodo("");
		//this.createTodo("Test 123");
		//this.createTodo("Andf dsga dsakmgkmk");
	}

	createTodo(title) {
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
			this.todos.push(new Todo(title, newTodoId)); //todo osztály példányosítás
		
			this.#updateTodos();
		}
	}
	
	toggleDone(id) {
		this.todos.forEach(todo => {
			if (todo.id == id) {
				todo.done = !todo.done;
			}
		});
		
		this.#updateTodos();
	}
	
	todoDelete(id) {
		this.todos.forEach((todo, index) => {
			if (todo.id == id) {
				this.todos.splice(index, 1);
			}
		});
		
		this.#updateTodos();
	}
	
	todoTitleUpdate(id, title) { // editálás utáni enter 
		this.todos.forEach(todo => {
			if (todo.id ==id) {
				todo.title = title;
				this.toggleEditing(id);
			}
		});
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
		
		if (!this.todos.length) {			
			noTodosDiv.style.display = 'block';
		} else {
			noTodosDiv.style.display = 'none';
						
			this.todos.forEach(todo => {
				var todoHTML = `
					<div class="todo ${todo.done ? 'todo-container-done' : ''}">
						${todo.editing 
							? getTodoInput(todo)
							: getTodoTitle(todo)
						}
					</div>
				`;

				div.innerHTML += todoHTML; // létrehozott todo hozzáadása
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
					<i class="${todo.done ? 'fas fa-minus-circle' : 'fas fa-check'}" onclick="toggleDone(${todo.id})" ></i>
					<i class="fas fa-trash-alt" onclick="todoDelete(${todo.id})"></i>
				</div>
			`;
		}
	}
}
class Todo {
	constructor(title, id) {
		this.id = id;
		this.title = title;
		this.done = false;
		this.editing = false;
	}
}
var todoController = new TodoController(); // todo controller példányosítás

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

function todoTitleUpdate(event, id, newTitle) {
	if (event.key == 'Enter') {
		todoController.todoTitleUpdate(id, newTitle);
	}
}