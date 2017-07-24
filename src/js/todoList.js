/*
*    JavaScript Autocomplete
*    Author: Vladimir Chernov
*    For KeepSolid Summer Internship 2017
*/
/*jslint esversion: 6 */

import { TodoListItem, TodoListItemDefaults } from "./todoListItem.js";

export const TodoListDefaults = {
	// adding
	enableAdding: true,
	customAdding: null, // DOM Element form
	iconText: '<span class="fa fa-plus-circle"></span>',
	placeholder: 'New todo:',
	// title
	titleText: null,
	titleElement: 'h5',
	titleEditable: true,
	// tools
	tools: true,
	moving: false,
	moveLeftToolText: '<span class="fa fa-chevron-circle-left"></span>',
	moveRightToolText: '<span class="fa fa-chevron-circle-right"></span>',
	removeToolText: '<span class="fa fa-trash"></span>',
	clearToolText: '<span class="fa fa-times-circle"></span>',
	// other
	readonly: false,
	listItem: {} // extends todoListItem default options
};

const TEMPLATE = `
<div class="todolist">
	<div class="todolist--list"></div>
</div>
`;

export class TodoList {

	constructor(listParentElement, data, options) {
		this.options = Object.assign({}, TodoListDefaults, options);
		this.options.listItem = Object.assign({}, options.listItem);

		if (this.options.readonly) {
			this.options.enableAdding = false;
			this.options.tools = false;
			this.options.listItem.editable = false;
			this.options.listItem.removable = false;
		}

		this.data = data || [];
		this.itemsArray = []; // contains objects of TodoListItem

		this.loadTemplate(listParentElement);
		this.setList(this.data);
		this.initHandlers();
	}

	get title() {
		return this._title;
	}

	set title(value) {
		this._title = value;
		this.titleElement.innerHTML = value;

		let setTitle = new CustomEvent("todoList.setTitle", {
			bubbles: true,
			detail: { todoList: this }
		});
		this.listElement.dispatchEvent(setTitle);
	}

	loadTemplate(listParentElement) {
		listParentElement.innerHTML = TEMPLATE;
		this.listElement = listParentElement.querySelector('.todolist--list');

		this.options.titleText && this.createTitle();
		this.options.tools && this.createTools();
		this.options.enableAdding && this.setAddingForm();
	}

	createTitle() {
		this.titleElement = document.createElement(this.options.titleElement);
		this.titleElement.classList.add('todolist--title');
		this.titleElement.setAttribute('contenteditable', this.options.titleEditable);
		this.listElement.parentElement.insertBefore(this.titleElement, this.listElement);
		this.title = this.options.titleText;
	}

	createTools() {
		this.tools = document.createElement('div');
		this.tools.classList.add('todolist--tools');

		let inner = `
			<div class="tool clear">${this.options.clearToolText}</div>
			<div class="tool remove">${this.options.removeToolText}</div>
		`;
		this.tools.innerHTML = inner;
		this.listElement.parentElement.insertBefore(this.tools, this.listElement);

		this.clearTool = this.tools.querySelector('.tool.clear');
		this.removeTool = this.tools.querySelector('.tool.remove');

		this.clearTool.addEventListener('click', this.clearList.bind(this));
		this.removeTool.addEventListener('click', this.removeList.bind(this));

		this.options.moving && this.createMoving();
	}

	createMoving() {
		this.moveTool = {};

		this.mover = document.createElement('div');
		this.mover.classList.add('tool', 'mover');

		let inner = `
			<div class="tool move left">${this.options.moveLeftToolText}</div>
			<div class="tool move right">${this.options.moveRightToolText}</div>
		`;
		this.mover.innerHTML = inner;
		this.tools.insertBefore(this.mover, this.tools.querySelector('.tool.clear'));

		this.moveTool.left = this.mover.querySelector('.tool.left');
		this.moveTool.right = this.mover.querySelector('.tool.right');

		this.moveTool.left.addEventListener('click', this.onMoveList.bind(this, 'left'));
		this.moveTool.right.addEventListener('click', this.onMoveList.bind(this, 'right'));
	};

	setAddingForm() {
		if (this.options.customAdding) {
			// set from options if is set
			this.addForm = this.options.customAdding;
			this.addInput = this.addForm.querySelector('input');
			this.addForm.addEventListener('submit', this.onAddTodo.bind(this));
		} else {
			this.createAddingItem();
			this.addBox.addEventListener('focus', this.onAddBoxFocus.bind(this));
			this.addBox.addEventListener('input', this.onAddTodo.bind(this));
		}
	}

	createAddingItem() {
		let inner = `
		<div class="todolist-item--add-icon">${this.options.iconText}</div>
		<div class="todolist-item--text single-line">
            <div class="placeholder">${this.options.placeholder}</div>
            <div class="adding-box" contenteditable="true"></div>
        </div>`;

		this.addElem = document.createElement('li');
		this.addElem.classList.add('todolist-item', 'add-item', 'editable');
		this.listElement.appendChild(this.addElem);

		this.addElem.innerHTML = inner;
		this.addBox = this.addElem.querySelector('.adding-box');
	}

	setList(data) {
		data = data || [];
		this.itemsArray = [];
		this.listElement.innerHTML = '';
		this.addElem && this.listElement.appendChild(this.addElem);
		data.forEach((todo) => {
			let item = new TodoListItem(todo.text, todo.complete, this.options.listItem);
			this.add(item);
		});
	}

	add(item) {
		if (this.addElem) {
			this.listElement.insertBefore(item.elem, this.addElem);
		} else {
			this.listElement.appendChild(item.elem);
		}

		this.itemsArray.push(item);

		let addItem = new CustomEvent("todoList.addItem", {
			bubbles: true,
			detail: { todoList: this }
		});
		this.listElement.dispatchEvent(addItem);
	}

	initHandlers() {
		this.listElement.addEventListener('todoListItem.remove', this.onRemoveTodo.bind(this));
		document.addEventListener('click', this.onBlur.bind(this));
	}

	onRemoveTodo(event) {
		let item = event.detail.item;
		let index = this.itemsArray.indexOf(item);
		this.itemsArray.splice(index, 1);
	}

	onAddBoxFocus(event) {
		this.addElem.classList.add('active');
	}

	onBlur(event) {
		if (this.addElem) {
			if (event.target == this.addBox || event.target.closest('.add-item') == this.addElem) {
				this.addBox.focus();
			} else {
				this.addElem.classList.remove('active');
			}
		}
		if (this.title && this.options.titleEditable && event.target != this.titleElement && this.title != this.titleElement.innerHTML) {
			this.title = this.titleElement.innerHTML;
		}
	}

	onAddTodo(event) {
		event.preventDefault();

		let value = this.getInputValue(),
			item = null;

		if (value) {
			item = new TodoListItem(value, false, this.options.listItem, this.listElement);
			this.add(item);
			this.clearInput();
			this.addElem && this.addElem.classList.remove('active');
			item.textBox.focus();
		}

		this.options.onAddTodo && this.options.onAddTodo.call(this, item);
	}

	clearList() {
		this.setList();

		let clear = new CustomEvent("todoList.clear", {
			bubbles: true,
			detail: { todoList: this }
		});
		this.listElement.dispatchEvent(clear);
	}

	removeList() {
		let todoListRemove = new CustomEvent("todoList.remove", {
			bubbles: true,
			detail: { todoList: this }
		});
		this.listElement.dispatchEvent(todoListRemove);

		this.listElement.remove();
		this.titleElement.remove();
		this.tools.remove();
	}

	onMoveList(direction) {
		let moveTodoList = new CustomEvent("todoList.move", {
			bubbles: true,
			detail: {
				direction: direction,
				todoList: this
			}
		});
		this.listElement.dispatchEvent(moveTodoList);
	}

	getInputValue() {
		if (this.options.customAdding) {
			return this.addInput.value;
		} else {
			return this.addBox.innerHTML;
		}
	}

	clearInput() {
		if (this.options.customAdding) {
			this.addInput.value = '';
		} else {
			this.addBox.innerHTML = '';
		}
	}

}
