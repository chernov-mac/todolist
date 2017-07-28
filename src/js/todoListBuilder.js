/*
*    JavaScript TodoBuilder
*    Author: Vladimir Chernov
*    For KeepSolid Summer Internship 2017
*/

import { TodoList, TodoListDefaults } from "./todoList.js";

export const TodoBuilderDefaults = {
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

export class TodoBuilder {

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

		let list = new TodoList(outerDeepest || this.board, listData.itemsArray, this.options.list);

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
