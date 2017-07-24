/*
*    JavaScript TodoListBuilder
*    Author: Vladimir Chernov
*    For KeepSolid Summer Internship 2017
*/
/*jslint esversion: 6 */

import { TodoList, TodoListDefaults } from "./todoList.js";

export const TodoListBuilderDefaults = {
	enableAdding: true,
	boardClasses: '',
	todoListOuterClasses: 'todolist-outer',
	builderFormOuterClasses: 'builder-form-outer',
	builderFormClasses: 'builder-form',
	builderInputOuterClasses: 'form-control',
	builderButtonText: 'Add TodoList',
	builderPlaceholder: 'New TodoList',
	builderButtonClasses: 'btn btn-builder', // string of classes, e.g. '.my.outer>.nested'
	moveAnimation: true,
	sources: [], // array of URL strings
	todoList: { // extends todoList default options
		tools: true,
		moving: true
	}
};

export class TodoListBuilder {

	constructor(builderParentElement, options) {

		this.options = Object.assign({}, TodoListBuilderDefaults, options);
		this.options.todoList = Object.assign(
			{},
			TodoListBuilderDefaults.todoList,
			options.todoList);

		this.lists = [];
		this.data = [];

		this.loadTemplate(builderParentElement);
		this.init();
		this.initEvents();

	}

	loadTemplate(builderParentElement) {
		let template = `
		<div class="todolist-builder">
			<div class="todolist-board ${this.options.boardClasses}"></div>
		</div>
		`;
		builderParentElement.innerHTML = template;
		this.board = builderParentElement.querySelector('.todolist-board');

		this.todoListOuterTemplate = this.createOuter(this.options.todoListOuterClasses);

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
			this.data.forEach(todoList => {
				this.buildList(todoList);
			});
		}

		// build from sources if set
		if (this.options.sources.length > 0) {
			this.options.sources.forEach(source => {
				this.getSourceData(source).then((sourceData) => {
					this.data = this.data.concat(sourceData);
					// add todolists from source when response come
					sourceData.forEach(todoList => {
						this.buildList(todoList);
					});
					this.updateStorage();
				});
			});
		}

		// build empty list if no data set
		if (this.data.length === 0 && this.options.sources.length === 0) {
			this.buildList();
		}

		this.updateStorage();
	}

	parseLocal(data) {
		let parsedLists = JSON.parse(data);

		parsedLists.forEach(list => {
			let listData = {
				order: list[0],
				title: list[1],
				data: []
			};
			list[2].forEach(item => {
				let itemData = {
					order: item[0],
					text: item[1],
					complete: item[2]
				};
				listData.data.push(itemData);
			});
			this.data.push(listData);
		});
	}

	getSourceData(url) {
		return fetch(url).then(function(result){
			return result.json();
		});
	}

	buildList(todoList) {
		todoList = todoList || {};
		let newList = {};

		let outer, outerDeepest = null;

		if (this.todoListOuterTemplate) {
			outer = this.todoListOuterTemplate.cloneNode(true);
			outerDeepest = outer.querySelector('.outer-deepest') || outer;
			outerDeepest.classList.remove('outer-deepest');
			this.board.appendChild(outer);
		}

		let newListOptions = {
			titleText: todoList.title || this.options.todoList.titleText
		};
		newListOptions = Object.assign({}, this.options.todoList, newListOptions);

		newList.item = new TodoList(outerDeepest || this.board, todoList.data, newListOptions);
		newList.outer = outer || newList.item.listElement;
		// newList.order = this.lists.length; // starts from 0
		this.lists.push(newList);
	}

	isEdge(i, direction) {
		if ((i == 0 && direction == 'left') ||
			(i == this.lists.length - 1 && direction == 'right')) {
			return true;
		}
	}

	moveList(i, step, direction) {
		let list = this.lists[i];
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

		let slist = this.lists[j];

		if (j > i) {
			this.board.insertBefore(slist.outer, list.outer);
		} else {
			this.board.insertBefore(list.outer, slist.outer);
		}

		this.lists.splice(i, 1);
		this.lists.splice(j, 0, list);
	}

	swap(mainIndex, secondaryIndex) {
		if (mainIndex == secondaryIndex) return;

		if (secondaryIndex > this.lists.length - 1) secondaryIndex = 0;
		if (secondaryIndex < 0) secondaryIndex = this.lists.length - 1;

		let over = this.lists[mainIndex].outer;
		let under = this.lists[secondaryIndex].outer;

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
		this.lists.forEach((list, listIndex) => {
			list = list.item;
			let items = [];

			// 0: order, 1: title, 2: [...items]
			let listData = [listIndex, list.title, items];

			list.itemsArray.forEach((item, itemIndex) => {
				// 0: order, 1: text, 2: complete
				let itemData = [itemIndex, item.text, item.complete];
				items.push(itemData);
			});

			newData.push(listData);
		});
		newData = JSON.stringify(newData);
		localStorage.setItem('todolist', newData);
		console.log('Storage is updated...');
	}

	// Events

	initEvents() {

		if (this.builder.form) {
			this.builder.form.addEventListener('submit', this.onCreateNew.bind(this));
		}

		this.board.addEventListener('todoList.setTitle', this.onTodoListSetTitle.bind(this));
		this.board.addEventListener('todoList.addItem',  this.onTodoListAddItem.bind(this));
		this.board.addEventListener('todoList.remove', 	 this.onTodoListRemove.bind(this));
		this.board.addEventListener('todoList.clear', 	 this.onTodoListClear.bind(this));
		this.board.addEventListener('todoList.move', 	 this.onTodoListMove.bind(this));

		this.board.addEventListener('todoListItem.setStatus', this.onItemSetStatus.bind(this));
		this.board.addEventListener('todoListItem.remove', 	  this.onItemRemove.bind(this));
		this.board.addEventListener('todoListItem.edit', 	  this.onItemEdit.bind(this));

	}

	onCreateNew(event) {
		event.preventDefault();

		this.buildList({
			title: this.builder.input && this.builder.input.value
		});
		this.builder.input.value = '';

		this.updateStorage();
	}

	onTodoListClear(event) {
		// ...some actions for particular event
		this.updateStorage();
	}

	onTodoListSetTitle(event) {
		// ...some actions for particular event
		this.updateStorage();
	}

	onTodoListAddItem(event) {
		// ...some actions for particular event
		this.updateStorage();
	}

	onTodoListRemove(event) {
		for (var i = 0; i < this.lists.length; i++) {
			if (this.lists[i].item == event.detail.todoList) { break; }
		}
		this.lists[i].outer.remove();
		this.lists.splice(i, 1);

		this.updateStorage();
	}

	onTodoListMove(event) {
		let movingList = null;
		let direction = event.detail.direction;

		for (var i = 0; i < this.lists.length; i++) {
			if (this.lists[i].item == event.detail.todoList) {
				movingList = this.lists[i];
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
