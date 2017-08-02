/*
*    JavaScript Autocomplete
*    Author: Vladimir Chernov
*    For KeepSolid Summer Internship 2017
*/

import { TodoItem, TodoItemDefaults } from "./todoItem.js";

export const TodoListDefaults = {
	previewMaxCount: 3,
	// adding
	addIconText: '<i class="material-icons">add_circle</i>',
	placeholder: 'New todo:',
	// title
	titleText: 'Title',
	// tools
	removeToolText: 'Remove',
	clearToolText: 'Clear',
	// other
	readonly: false,
	item: {} // extends TodoItemDefaults
};

const INNER_TEMPLATE_PREVIEW = `
<div class="overflow-wrapper">
	<div class="todo-header">
		<h5 class="todo-title"></h5>
	</div>
	<div class="todo-body">
		<ul class="todo-list"></ul>
	</div>
	<div class="todo-footer">
		<div class="actions">
			<button class="btn btn-flat action clear"></button>
			<button class="btn btn-flat text-red action remove"></button>
		</div>
	</div>
</div>
`;

const INNER_TEMPLATE_DIALOG = `
<div class="overflow-wrapper">
	<div class="todo-header">
		<h5 class="todo-title" contenteditable="true"></h5>
	</div>
	<div class="todo-body">
		<ul class="todo-list">
			<li class="todo-item add editable">
				<div class="todo-item--icon add"></div>
				<div class="todo-item--text">
					<div class="placeholder"></div>
					<div class="add-box" contenteditable="true"></div>
				</div>
			</li>
		</ul>
	</div>
	<div class="todo-footer">
		<div class="actions">
			<button class="btn btn-flat action clear"></button>
			<button class="btn btn-flat text-red action remove"></button>
		</div>
	</div>
</div>
`;

export class TodoList {

	constructor(parentElement, data, options) {
		this.options = Object.assign({}, TodoListDefaults, options);
		/*
		* Second assign is present because Object.assign makes this.options.item
		* just equal to options.item. Need to use Lodash instead.
		*/
		this.options.item = Object.assign({}, TodoListDefaults.item, options.item);

		if (this.options.readonly) {
			this.options.item.editable = false;
			this.options.item.removable = false;
		}

		this.data = data || [];
		this.itemsArray = []; // contains objects of TodoItem

		this.loadTemplate(parentElement);
		this.setList(this.data);
		this.initEvents();
	}

	get title() {
		return this._title;
	}

	set title(value) {
		this._title = value;
		if (this.titleElement != document.activeElement) {
			this.titleElement.innerHTML = value;
		}

		let setTitle = new CustomEvent("todo.list.setTitle", {
			bubbles: true,
			detail: { list: this }
		});
		this.box.dispatchEvent(setTitle);
	}

	get active() {
		return this._active;
	}

	set active(value) {
		// if (!value) {
		// 	let date = new Date();
		// 	date = Date.parse(date);
		// 	console.log('active set false transitionend: ' + date);
		// }
		
		this._active = value;
	}

	loadTemplate(parentElement) {
		this.box = document.createElement('div');
		this.box.classList.add('todobox');
		this.box.innerHTML = INNER_TEMPLATE_DIALOG;

		// set links to box control elements
		this.boxBody      = this.box.querySelector('.todo-body');
		this.list         = this.box.querySelector('.todo-list');
		this.titleElement = this.box.querySelector('.todo-title');
		this.clearTool    = this.box.querySelector('.todo-footer .actions .clear');
		this.removeTool   = this.box.querySelector('.todo-footer .actions .remove');
		this.addItem      = this.box.querySelector('.todo-item.add');
		this.addInput     = this.addItem.querySelector('.add-box');

		// set text
		this.title = this.options.titleText;

		this.clearTool.innerHTML = this.options.clearToolText;
		this.removeTool.innerHTML = this.options.removeToolText;
		this.addItem.querySelector('.placeholder').innerHTML = this.options.placeholder;
		this.addItem.querySelector('.todo-item--icon').innerHTML = this.options.addIconText;

		// load generated boxes
		this.parent = parentElement;
		this.parent.innerHTML = '';
		this.parent.appendChild(this.box);

		this.active = false;
	}

	setList(data) {
		data = data || [];
		this.itemsArray = [];
		this.list.innerHTML = '';
		this.list.appendChild(this.addItem);

		data.forEach((todo) => {
			let item = new TodoItem(todo.text, todo.complete, this.options.item);
			this.add(item);
		});
		this.hideOutOfMaxItems();
	}

	add(item) {
		if (this.itemsArray.length == this.options.previewMaxCount) {
			this.createItemMore();
		}

		this.itemsArray.push(item);
		this.list.insertBefore(item.element, this.addItem);

		if (this.active) {
			this.fixBoxBodyHeight();
		} else {
			this.hideOutOfMaxItems();
		}

		let addItem = new CustomEvent("todo.list.addItem", {
			bubbles: true,
			detail: { list: this }
		});
		this.box.dispatchEvent(addItem);
	}

	createItemMore() {
		let moreLine = document.createElement('div');
		moreLine.classList.add('todo-item', 'more');
		moreLine.innerHTML = '<div class="todo-item--text">...</div>';

		this.boxBody.appendChild(moreLine);
	}

	showDialog() {
		this.createDialog();
		this.placeDialogOverBox(this.box);

		// this moves .todobox from it's parent to .dialog
		this.dialog.appendChild(this.box);

		// load clone into parent to save size
		this.clone = this.box.cloneNode(true);
		this.parent.appendChild(this.clone);

		let pos = {
			top: window.pageYOffset + document.documentElement.clientHeight / 2 + 'px',
			left: '50%'
		}
		let size = {
			width: '600px',
			height: 'auto',
			bodyHeight: this.list.offsetHeight + 'px'
		}

		this.showHiddenItems();
		this.animateDialog('show', pos, size);

		this.active = true;
	}

	hideDialog() {
		this.dialog.addEventListener('transitionend', this.destroyDialog.bind(this));
		this.hideOutOfMaxItems();
		this.placeDialogOverBox(this.clone);
	}

	createDialog() {
		this.dialog = document.createElement('div');
		this.dialog.classList.add('dialog');
		this.dialog.innerHTML = '';
		document.body.appendChild(this.dialog);
	}

	placeDialogOverBox(target) {
		let targetPos = target.getBoundingClientRect();
		let targetCenter = {
			top: (targetPos.top + pageYOffset) + target.offsetHeight / 2 + 'px',
			left: (targetPos.left + pageXOffset) + target.offsetWidth / 2 + 'px'
		}

		let size = {
			width: target.offsetWidth + 'px',
			height: 'auto'
		}

		let action = target == this.box ? 'show' : 'hide';
		this.animateDialog(action, targetCenter, size);
	}

	animateDialog(action, pos, size) {
		this.dialog.classList.remove('show', 'hide');
		this.dialog.classList.add('animate', action);

		this.dialog.style.top = pos.top;
		this.dialog.style.left = pos.left;
		this.dialog.style.width = size.width;
		this.dialog.style.height = size.height;


		if (window.innerWidth < 600) {
			this.dialog.style.width = '100%';
		}
	}

	showHiddenItems() {
		var hiddenItems = this.list.querySelectorAll('.todo-item.hidden');
		for (let i = 0; i < hiddenItems.length; i++) {
			hiddenItems[i].classList.remove('hidden');
		}
		this.fixBoxBodyHeight();
	}

	hideOutOfMaxItems() {
		if (this.itemsArray.length > this.options.previewMaxCount) {
			this.itemsArray.forEach((item, i) => {
				if (i >= this.options.previewMaxCount) {
					item.element.classList.add('hidden');
				}
			});
			this.addItem.classList.add('hidden');
		}
		this.fixBoxBodyHeight();
	}

	fixBoxBodyHeight() {
		let height = this.list.offsetHeight;
		if (this.itemsArray.length > this.options.previewMaxCount) {
			height = 0;
			this.itemsArray.forEach((item, i) => {
				if (!item.element.classList.contains('hidden')) {
					height += item.element.offsetHeight;
				}
			});
			height += this.boxBody.querySelector('.more').offsetHeight;
		}
		this.boxBody.style.height = height + 'px';
		this.boxBody.style.maxHeight = window.innerHeight - 300 + 'px';

		return height;
	}

	destroyDialog(event) {
		// 0.375 -- the longest time in CSS transitions animation
		if (event.srcElement == this.dialog && event.elapsedTime == 0.375) {
			this.dialog.removeEventListener('transitionend', this.destroyDialog.bind(this));

			this.clone.remove();
			this.parent.appendChild(this.box);
			this.dialog.remove();
			this.active = false;
		}
	}

	isDialog(elem) {
		if (elem.closest('.dialog') && elem.closest('.dialog').contains(this.dialog)) {
			return true;
		}
		if (elem.closest('.todo-item--icon.remove')) {
			return true;
		}
		return false;
	}

	// Events

	initEvents() {

		this.box.addEventListener('click', this.onPreviewBoxClick.bind(this));
		document.body.addEventListener('click', this.onDocumentClick.bind(this));
		window.addEventListener('resize', this.onWindowResize.bind(this));

		this.list.addEventListener('todo.item.remove', this.onRemoveTodo.bind(this));
		this.list.addEventListener('todo.item.removed', this.onRemovedTodo.bind(this));
		this.titleElement.addEventListener('input', this.onTitleInput.bind(this));

		this.addItem.addEventListener('click', () => { this.addInput.focus(); });
		this.addInput.addEventListener('focus', this.onAddBoxFocus.bind(this));
		this.addInput.addEventListener('blur', this.onAddBoxBlur.bind(this));
		this.addInput.addEventListener('input', this.onAddTodo.bind(this));
		this.clearTool.addEventListener('click', this.onListClear.bind(this));
		this.removeTool.addEventListener('click', this.onListRemove.bind(this));

		this.clearTool.addEventListener('click', this.onListClear.bind(this));
		this.removeTool.addEventListener('click', this.onListRemove.bind(this));
	}

	onPreviewBoxClick(event) {
		if (!this.active &&
			event.target != this.clearTool &&
			event.target != this.removeTool &&
			!event.target.closest('.todo-item--complete')) {
			this.showDialog();
		}
	}

	onDocumentClick(event) {
		if (this.active && !this.isDialog(event.target)) {
			this.hideDialog();
		}
	}

	onWindowResize(event) {
		if (this.active) {
			let pos = {
				top: window.pageYOffset + document.documentElement.clientHeight / 2 + 'px',
				left: '50%'
			}
			let size = {
				width: '600px',
				height: 'auto',
				bodyHeight: this.list.offsetHeight + 'px'
			}
			this.animateDialog('show', pos, size);
			this.fixBoxBodyHeight();
		}
	}

	onRemoveTodo(event) {
		let item = event.detail.item;
		let index = this.itemsArray.indexOf(item);
		this.itemsArray.splice(index, 1);

		if (this.itemsArray.length == this.options.previewMaxCount) {
			this.boxBody.querySelector('.more').remove();
		}
	}

	onRemovedTodo(event) {
		this.fixBoxBodyHeight();
	}

	onAddBoxFocus(event) {
		this.addItem.classList.add('active');
	}

	onAddBoxBlur(event) {
		this.addItem.classList.remove('active');
	}

	onAddTodo(event) {
		let value = this.addInput.innerHTML;

		if (value) {
			let item = new TodoItem(value, false, this.options.item);
			this.add(item);

			this.addInput.innerHTML = '';
			this.addItem.classList.remove('active');
			item.textBox.focus();

			item && this.options.onAddTodo && this.options.onAddTodo.call(this, item);
		}
	}

	onTitleInput(event) {
		this.title = this.titleElement.innerHTML;
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

		this.box.remove();
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
