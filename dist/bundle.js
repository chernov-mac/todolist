/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__js_todoListBuilder_js__ = __webpack_require__(3);


const grid = __webpack_require__(1);
const style = __webpack_require__(2);


// TODO: add JS Doc

let boardElement = document.querySelector('#todo-board');
let desk = new __WEBPACK_IMPORTED_MODULE_0__js_todoListBuilder_js__["a" /* TodoBuilder */](boardElement, {
    boardClasses: 'row-24',
    builderFormOuterClasses: 'row-24>.col.xxs-24.md-12.lg-8.offset-md-6.offset-lg-8',
    builderFormClasses: 'custom-form',
    builderInputOuterClasses: 'form-control',
    builderButtonClasses: 'btn btn-add btn-icon blue',
    listOuterClasses: '.col.xxs-24.md-12.lg-8',
    builderButtonText: '<span class="text">Add</span><span class="icon"><span class="fa fa-plus">+</span></span>',
    list: {
        titleText: 'New List'
    }
});


/***/ }),
/* 1 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 2 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__todoList_js__ = __webpack_require__(4);
/*
*    JavaScript TodoBuilder
*    Author: Vladimir Chernov
*    For KeepSolid Summer Internship 2017
*/



const TodoBuilderDefaults = {
	enableAdding: true,
	boardClasses: '',
	listOuterClasses: 'todo-box-outer',
	builderFormOuterClasses: 'builder-form-outer',
	builderFormClasses: 'builder-form',
	builderInputOuterClasses: 'form-control',
	builderButtonText: 'Add',
	builderPlaceholder: 'New Todo List',
	builderButtonClasses: 'btn btn-builder', // string of classes, e.g. '.my.outer>.nested'
	moveAnimation: true,
	list: { // extends TodoListDefaults
		tools: true,
		moving: true
	}
};
/* unused harmony export TodoBuilderDefaults */


class TodoBuilder {

	constructor(builderParentElement, options) {

		this.options = Object.assign({}, TodoBuilderDefaults, options);
		this.options.list = Object.assign({}, TodoBuilderDefaults.list, options.list);

		this.listsArray = [];
		this.data = [];

		this.loadTemplate(builderParentElement);
		this.init();
		this.initEvents();

	}

	loadTemplate(builderParentElement) {
		let template = `
		<div class="todo-builder">
			<div class="todo-board ${this.options.boardClasses}"></div>
		</div>
		`;
		builderParentElement.innerHTML = template;
		this.board = builderParentElement.querySelector('.todo-board');

		this.listOuterTemplate = this.createOuter(this.options.listOuterClasses);

		this.options.enableAdding && this.createBuilderForm();
	}

	createBuilderForm() {
		this.builder = {};

		this.builder.form = document.createElement('form');
		this.builder.form.className = this.options.builderFormClasses;

		this.builder.input = document.createElement('input');
		this.builder.input.type = 'text';
		this.builder.input.placeholder = this.options.builderPlaceholder;

		this.builder.button = document.createElement('button');
		this.builder.button.type = 'submit';
		this.builder.button.className = this.options.builderButtonClasses;
		this.builder.button.innerHTML = this.options.builderButtonText;

		let builderOuter = this.createOuter(this.options.builderFormOuterClasses) || this.builder.form;
		let builderOuterDeepest = builderOuter.querySelector('.outer-deepest') || builderOuter;

		let inputOuter = this.createOuter(this.options.builderInputOuterClasses) || this.builder.input;
		let inputOuterDeepest = inputOuter.querySelector('.outer-deepest') || inputOuter;

		if (builderOuter != this.builder.form) {
			builderOuterDeepest.appendChild(this.builder.form);
		}
		if (builderOuter != this.builder.form) {
			inputOuterDeepest.appendChild(this.builder.input);
		}

		builderOuterDeepest.classList.remove('outer-deepest');
		inputOuterDeepest.classList.remove('outer-deepest');

		this.builder.form.appendChild(inputOuter);
		this.builder.form.appendChild(this.builder.button);
		this.board.parentElement.insertBefore(builderOuter, this.board);
	}

	createOuter(outerClassesString) {
		if (!outerClassesString) return;

		let outerElementsArray = outerClassesString.split('>'),
			last = outerElementsArray.length - 1,
			i = 0,
			str = '';

		outerElementsArray.forEach(outerElementsClasses => {
			if (i == last) {
				outerElementsClasses += '.outer-deepest';
			}

			str += '<div class="';
			let elementClassArray = outerElementsClasses.split('.');

			elementClassArray.forEach(className => {
				str += className + ' ';
			});

			str += '">';
			i++;
		});
		outerElementsArray.forEach(() => {
			str += '</div>';
		});

		let temp = document.createElement('div');
		temp.innerHTML = str;
		let outer = temp.childNodes[0];

		return outer;
	}

	init() {
		let data = localStorage.todolist;
		data && this.parseLocal(data);

		// build from local if exists
		if (this.data.length > 0) {
			this.data.forEach(listData => {
				this.build(listData);
			});
		}

		// build empty list if no data set
		if (this.data.length === 0 && this.options.sources.length === 0) {
			this.build();
		}

		this.updateStorage();
	}

	parseLocal(data) {
		let parsedLists = JSON.parse(data);

		parsedLists.forEach(list => {
			let listData = {
				title: list[0],
				itemsArray: []
			};
			list[1].forEach(item => {
				let itemData = {
					text: item[0],
					complete: item[1]
				};
				listData.itemsArray.push(itemData);
			});
			this.data.push(listData);
		});
	}

	build(listData) {
		listData = listData || {};

		let outer, outerDeepest = null;

		if (this.options.listOuterClasses) {
			outer = this.listOuterTemplate.cloneNode(true);
			outerDeepest = outer.querySelector('.outer-deepest') || outer;
			outerDeepest.classList.remove('outer-deepest');
			this.board.appendChild(outer);
		}

		let list = new __WEBPACK_IMPORTED_MODULE_0__todoList_js__["a" /* TodoList */](outerDeepest || this.board, listData.itemsArray, this.options.list);

		if (listData.title) { list.title = listData.title; }
		list.outer = outer;

		this.listsArray.push(list);
	}

	isEdge(i, direction) {
		if ((i == 0 && direction == 'left') ||
			(i == this.listsArray.length - 1 && direction == 'right')) {
			return true;
		}
	}

	moveList(i, step, direction) {
		let list = this.listsArray[i];
		let j = 0;

		switch(direction) {
			case 'left':
				j = i - step;
				break;
			case 'right':
				j = i + step;
				break;
			default: return;
		}

		let slist = this.listsArray[j];

		if (j > i) {
			this.board.insertBefore(slist.outer, list.outer);
		} else {
			this.board.insertBefore(list.outer, slist.outer);
		}

		this.listsArray.splice(i, 1);
		this.listsArray.splice(j, 0, list);
	}

	swap(mainIndex, secondaryIndex) {
		if (mainIndex == secondaryIndex) return;

		if (secondaryIndex > this.listsArray.length - 1) secondaryIndex = 0;
		if (secondaryIndex < 0) secondaryIndex = this.listsArray.length - 1;

		let over = this.listsArray[mainIndex].outer;
		let under = this.listsArray[secondaryIndex].outer;

		// create clones
		over.clone = over.cloneNode(true);
		under.clone = under.cloneNode(true);

		over.clone.addEventListener('transitionend', this.onSwapped.bind(this, over, under));

		// set original positions and sizes
		this.board.classList.add('scene');
		over.clone.classList.add('clone');
		under.clone.classList.add('clone');
		over.clone.style.top = over.offsetTop + 'px';
		over.clone.style.left = over.offsetLeft + 'px';
		over.clone.style.width = over.offsetWidth + 'px';
		over.clone.style.height = over.offsetHeight + 'px';

		under.clone.style.top = under.offsetTop + 'px';
		under.clone.style.left = under.offsetLeft + 'px';
		under.clone.style.width = under.offsetWidth + 'px';
		under.clone.style.height = under.offsetHeight + 'px';

		// hide originals
		over.style.visibility = 'hidden';
		under.style.visibility = 'hidden';

		// show clones
		this.board.appendChild(over.clone);
		this.board.appendChild(under.clone);

		// make others know they are starting animation
		over.clone.classList.add('animate', 'over');
		under.clone.classList.add('animate', 'under');

		// move clones
		over.clone.style.top = under.offsetTop + 'px';
		over.clone.style.left = under.offsetLeft + 'px';
		under.clone.style.top = over.offsetTop + 'px';
		under.clone.style.left = over.offsetLeft + 'px';

		let direction = mainIndex - secondaryIndex > 0 ? 'left' : 'right';

		this.moveList(mainIndex, Math.abs(mainIndex - secondaryIndex), direction);
	}

	updateStorage() {
		let newData = [];
		// [...[list.title, ...[item.text, item.complete]]]
		this.listsArray.forEach(list => {
			let items = [];

			// 0: title, 1: [...items]
			let listData = [list.title, items];

			list.itemsArray.forEach(item => {
				// 0: text, 1: complete
				let itemData = [item.text, item.complete];
				items.push(itemData);
			});

			newData.push(listData);
		});
		newData = JSON.stringify(newData);

		localStorage.setItem('todolist', newData);
		console.log('Storage is updated.');
	}

	// Events

	initEvents() {

		if (this.builder.form) {
			this.builder.form.addEventListener('submit', this.onCreateNew.bind(this));
		}

		this.board.addEventListener('todo.list.setTitle', this.onListSetTitle.bind(this));
		this.board.addEventListener('todo.list.addItem',  this.onListAddItem.bind(this));
		this.board.addEventListener('todo.list.remove',	  this.onListRemove.bind(this));
		this.board.addEventListener('todo.list.clear', 	  this.onListClear.bind(this));
		this.board.addEventListener('todo.list.move', 	  this.onListMove.bind(this));

		this.board.addEventListener('todo.item.setStatus', this.onItemSetStatus.bind(this));
		this.board.addEventListener('todo.item.remove',    this.onItemRemove.bind(this));
		this.board.addEventListener('todo.item.edit', 	   this.onItemEdit.bind(this));

	}

	onCreateNew(event) {
		event.preventDefault();

		this.build({
			title: this.builder.input && this.builder.input.value
		});
		this.builder.input.value = '';

		this.updateStorage();
	}

	onListClear(event) {
		// ...some actions for particular event
		this.updateStorage();
	}

	onListSetTitle(event) {
		// ...some actions for particular event
		this.updateStorage();
	}

	onListAddItem(event) {
		// ...some actions for particular event
		this.updateStorage();
	}

	onListRemove(event) {
		for (var i = 0; i < this.listsArray.length; i++) {
			if (this.listsArray[i] == event.detail.list) { break; }
		}
		this.listsArray[i].outer.remove();
		this.listsArray.splice(i, 1);

		this.updateStorage();
	}

	onListMove(event) {
		let movingList = null;
		let direction = event.detail.direction;

		for (var i = 0; i < this.listsArray.length; i++) {
			if (this.listsArray[i] == event.detail.list) {
				movingList = this.listsArray[i];
				break;
			}
		}

		if (this.isEdge(i, direction)) return;

		if (this.options.moveAnimation) {
			switch(direction) {
				case 'left':
					this.swap(i, i - 1);
					break;
				case 'right':
					this.swap(i, i + 1);
					break;
				default: break;
			}
		} else {
			this.moveList(i, 1, direction);
		}

		this.updateStorage();
	}

	onItemRemove(event) {
		// ...some actions for particular event
		this.updateStorage();
	}

	onItemEdit(event) {
		// ...some actions for particular event
		this.updateStorage();
	}

	onItemSetStatus(event) {
		// ...some actions for particular event
		this.updateStorage();
	}

	onSwapped(over, under) {
		over.style.visibility = 'visible';
		under.style.visibility = 'visible';

		over.clone.remove();
		under.clone.remove();

		this.board.classList.remove('scene');
	}

}
/* harmony export (immutable) */ __webpack_exports__["a"] = TodoBuilder;



/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__todoItem_js__ = __webpack_require__(5);
/*
*    JavaScript Autocomplete
*    Author: Vladimir Chernov
*    For KeepSolid Summer Internship 2017
*/



const TodoListDefaults = {
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
/* unused harmony export TodoListDefaults */


const TEMPLATE = `
<div class="todo-box">
	<h5 class="todo-title"></h5>
	<ul class="todo-list"></ul>
</div>
`;

class TodoList {

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
			let item = new __WEBPACK_IMPORTED_MODULE_0__todoItem_js__["a" /* TodoItem */](todo.text, todo.complete, this.options.item);
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
			let item = new __WEBPACK_IMPORTED_MODULE_0__todoItem_js__["a" /* TodoItem */](value, false, this.options.item, this.list);
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
/* harmony export (immutable) */ __webpack_exports__["a"] = TodoList;



/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/*
*    JavaScript Autocomplete
*    Author: Vladimir Chernov
*    For KeepSolid Summer Internship 2017
*/

const TodoItemDefaults = {
	editable: true,
	removable: true,
	singleLine: true,
	removeBtnText: '<span class="fa fa-times-circle">&times;</span>'
};
/* unused harmony export TodoItemDefaults */


class TodoItem {

	constructor(text, complete, options) {

		this.options = Object.assign({}, TodoItemDefaults, options);

		this.createElem(); // this.element
		this.initHandlers();

		this.text = text;
		this.complete = complete;
	}

	get text() {
		return this._text;
	}

	set text(value) {
		this._text = value;
		if (this.textBox != document.activeElement) {
			this.textBox.innerHTML = value;
		}

		var itemEdit = new CustomEvent("todo.item.edit", {
			bubbles: true,
			detail: { item: this }
		});
		this.element.dispatchEvent(itemEdit);
	}

	get complete() {
		return this._complete;
	}

	set complete(value) {
		this._complete = value;

		if (value) {
			this.element.classList.add('complete');
			this.checkbox.checked = true;
		} else {
			this.element.classList.remove('complete');
			this.checkbox.checked = false;
		}

		var itemSetStatus = new CustomEvent("todo.item.setStatus", {
			bubbles: true,
			detail: { item: this }
		});
		this.element.dispatchEvent(itemSetStatus);
	}

	createElem() {
		this.element = document.createElement('li');
		this.element.classList.add('todo-item');

		let inner = `
			<label class="todo-item--complete">
				<input type="checkbox" tabindex="-1">
			</label>
			<div class="todo-item--text" contenteditable="${this.options.editable}"></div>
		`;
		this.element.innerHTML = inner;

		this.checkboxLabel = this.element.querySelector('.todo-item--complete');
		this.checkbox = this.element.querySelector('.todo-item--complete input');
		this.textBox = this.element.querySelector('.todo-item--text');

		this.options.editable && this.element.classList.add('editable');
		this.options.singleLine && this.element.classList.add('single-line');

		this.options.removable && this.createRemoveBtn();
	}

	createRemoveBtn() {
		this.removeBtn = document.createElement('button');
		this.removeBtn.classList.add('todo-item--icon', 'remove');
		this.removeBtn.innerHTML = this.options.removeBtnText;
		this.element.appendChild(this.removeBtn);
	}

	initHandlers() {
		this.checkbox.addEventListener('click', this.toggleComplete.bind(this));

		if (this.options.editable) {
			this.textBox.addEventListener('focus', this.onTextBoxFocus.bind(this));
			this.textBox.addEventListener('input', this.onTextBoxInput.bind(this));
			this.textBox.addEventListener('blur', this.onTextBoxBlur.bind(this));
		}

		if (this.options.removable) {
			this.removeBtn.addEventListener('click', this.onRemove.bind(this));
		}
	}

	toggleComplete(event) {
		this.complete = !this.complete;
	}

	onRemove(event) {
		var itemRemove = new CustomEvent("todo.item.remove", {
			bubbles: true,
			detail: { item: this }
		});
		this.element.dispatchEvent(itemRemove);

		this.element.remove();
	}

	onTextBoxFocus(event) {
		this.element.classList.add('active');
		this.placeCaretAtEnd(this.textBox);
	}

	onTextBoxBlur(event) {
		if (this.textBox.innerHTML == '') {
			this.onRemove();
			return;
		}

		this.element.classList.remove('active');
	}

	onTextBoxInput(event) {
		this.text = this.textBox.innerHTML;
	}

	updateTextValue() {
		if (this.textBox.innerHTML && !this.isActualText()) {
			this.text = this.textBox.innerHTML;
		} else {
			this.textBox.innerHTML = this.text;
		}
	}

	isActualText() {
		return this.text == this.textBox.innerHTML ? true : false;
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
/* harmony export (immutable) */ __webpack_exports__["a"] = TodoItem;



/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map