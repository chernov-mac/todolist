/*
*    JavaScript Autocomplete
*    Author: Vladimir Chernov
*    For KeepSolid Summer Internship 2017
*/

export const TodoItemDefaults = {
	editable: true,
	removable: true,
	singleLine: true,
	removeBtnText: '<span class="fa fa-times-circle">&times;</span>'
};

export class TodoItem {

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
