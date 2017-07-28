/*
*    JavaScript Autocomplete
*    Author: Vladimir Chernov
*    For KeepSolid Summer Internship 2017
*/

import { TodoItem, TodoItemDefaults } from "./todoItem.js";

export const TodoListDefaults = {
	// adding
	adding: true,
	iconText: '<span class="fa fa-plus-circle">+</span>',
	placeholder: 'New todo:',
	// title
	titleText: 'Todo List',
	titleBox: 'h5',
	titleEditable: true,
	// tools
	tools: true,
	moving: false,
	moveLeftToolText: '<span class="fa fa-chevron-circle-left">ml</span>',
	moveRightToolText: '<span class="fa fa-chevron-circle-right">mr</span>',
	removeToolText: '<span class="fa fa-trash">r</span>',
	clearToolText: '<span class="fa fa-times-circle">c</span>',
	// other
	readonly: false,
	item: {} // extends TodoItemDefaults
};

const TEMPLATE = `
<div class="todo-box">
	<h5 class="todo-title"></h5>
	<ul class="todo-list"></ul>
</div>
`;

export class TodoList {

	constructor(listParentElement, data, options) {
		this.options = Object.assign({}, TodoListDefaults, options);
		/*
		* Second assign is present because Object.assign makes this.options.item
		* just equal to options.item. Need to use Lodash instead.
		*/
		this.options.item = Object.assign({}, TodoListDefaults.item, options.item);

		if (this.options.readonly) {
			this.options.adding = false;
			this.options.tools = false;
			this.options.titleEditable = false;
			this.options.item.editable = false;
			this.options.item.removable = false;
		}

		this.data = data || [];
		this.itemsArray = []; // contains objects of TodoItem

		this.loadTemplate(listParentElement);
		this.setList(this.data);
		this.initEvents();
	}

	get title() {
		return this._title;
	}

	set title(value) {
		this._title = value;
		if (this.titleBox != document.activeElement) {
			this.titleBox.innerHTML = value;
		}

		let setTitle = new CustomEvent("todo.list.setTitle", {
			bubbles: true,
			detail: { list: this }
		});
		this.list.dispatchEvent(setTitle);
	}

	loadTemplate(listParentElement) {
		listParentElement.innerHTML = TEMPLATE;

		this.todoBox = listParentElement.querySelector('.todo-box');
		this.list = this.todoBox.querySelector('.todo-list');

		this.titleBox = listParentElement.querySelector('.todo-title');
		this.titleBox.setAttribute('contenteditable', this.options.titleEditable);
		this.title = this.options.titleText;

		this.options.tools && this.createTools();
		this.options.adding && this.createAddItem();
	}

	createTools() {
		this.tools = document.createElement('div');
		this.tools.classList.add('todo-tools');

		let inner = `
			<button class="tool clear">${this.options.clearToolText}</button>
			<button class="tool remove">${this.options.removeToolText}</button>
		`;
		this.tools.innerHTML = inner;
		this.list.parentElement.insertBefore(this.tools, this.list);

		this.clearTool = this.tools.querySelector('.tool.clear');
		this.removeTool = this.tools.querySelector('.tool.remove');

		this.options.moving && this.createMover();
	}

	createMover() {
		this.moveTool = {};

		this.mover = document.createElement('div');
		this.mover.classList.add('tool', 'mover');

		let inner = `
			<button class="tool move left">${this.options.moveLeftToolText}</button>
			<button class="tool move right">${this.options.moveRightToolText}</button>
		`;
		this.mover.innerHTML = inner;
		this.tools.insertBefore(this.mover, this.tools.querySelector('.tool.clear'));

		this.moveTool.left = this.mover.querySelector('.tool.left');
		this.moveTool.right = this.mover.querySelector('.tool.right');
	};

	createAddItem() {
		let inner = `
			<div class="todo-add--icon add">${this.options.iconText}</div>
			<div class="todo-add--text single-line">
	            <div class="placeholder">${this.options.placeholder}</div>
	            <div class="add-box" contenteditable="true"></div>
	        </div>
		`;

		this.addElement = document.createElement('div');
		this.addElement.classList.add('todo-add', 'editable');

		this.addElement.innerHTML = inner;
		this.addBox = this.addElement.querySelector('.add-box');

		this.todoBox.appendChild(this.addElement);
	}

	setList(data) {
		data = data || [];
		this.itemsArray = [];
		this.list.innerHTML = '';

		data.forEach((todo) => {
			let item = new TodoItem(todo.text, todo.complete, this.options.item);
			this.add(item);
		});
	}

	add(item) {
		this.list.appendChild(item.element);

		this.itemsArray.push(item);

		let addItem = new CustomEvent("todo.list.addItem", {
			bubbles: true,
			detail: { list: this }
		});
		this.list.dispatchEvent(addItem);
	}

	initEvents() {
		this.list.addEventListener('todo.item.remove', this.onRemoveTodo.bind(this));
		this.titleBox.addEventListener('input', this.onTitleInput.bind(this));

		if (this.options.adding) {
			this.addElement.addEventListener('click', ()=>{ this.addBox.focus(); });
			this.addBox.addEventListener('focus', this.onAddBoxFocus.bind(this));
			this.addBox.addEventListener('blur', this.onAddBoxBlur.bind(this));
			this.addBox.addEventListener('input', this.onAddTodo.bind(this));
		}
		if (this.options.tools) {
			this.clearTool.addEventListener('click', this.onListClear.bind(this));
			this.removeTool.addEventListener('click', this.onListRemove.bind(this));
		}
		if (this.options.moving) {
			this.moveTool.left.addEventListener('click', this.onListMove.bind(this, 'left'));
			this.moveTool.right.addEventListener('click', this.onListMove.bind(this, 'right'));
		}
	}

	onRemoveTodo(event) {
		let item = event.detail.item;
		let index = this.itemsArray.indexOf(item);
		this.itemsArray.splice(index, 1);
	}

	onAddBoxFocus(event) {
		this.addElement.classList.add('active');
	}

	onAddBoxBlur(event) {
		this.addElement.classList.remove('active');
	}

	onAddTodo(event) {
		event.preventDefault();

		let value = this.addBox.innerHTML;

		if (value) {
			let item = new TodoItem(value, false, this.options.item, this.list);
			this.add(item);
			this.addBox.innerHTML = '';
			this.addElement && this.addElement.classList.remove('active');
			item.textBox.focus();

			item && this.options.onAddTodo && this.options.onAddTodo.call(this, item);
		}
	}

	onTitleInput(event) {
		this.title = this.titleBox.innerHTML;
	}

	onListClear(event) {
		this.setList();

		let clear = new CustomEvent("todo.list.clear", {
			bubbles: true,
			detail: { list: this }
		});
		this.list.dispatchEvent(clear);
	}

	onListRemove(event) {
		let listRemove = new CustomEvent("todo.list.remove", {
			bubbles: true,
			detail: { list: this }
		});
		this.list.dispatchEvent(listRemove);

		this.todoBox.remove();
	}

	onListMove(direction, event) {
		let moveTodoList = new CustomEvent("todo.list.move", {
			bubbles: true,
			detail: {
				direction: direction,
				list: this
			}
		});
		this.list.dispatchEvent(moveTodoList);
	}

	placeCaretAtEnd(element) {
		let range, selection;
		range = document.createRange();
		range.selectNodeContents(element);
		range.collapse(false);
		selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	}

}
