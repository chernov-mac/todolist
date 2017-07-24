/*jslint esversion: 6 */
/*jslint node: true */
/*global document, alert, fetch, Autocomplete, Chips, TodoList, countriesData, todoData*/

'use strict';
import { TodoList } from "./todoList.js";
import { TodoListBuilder } from "./todoListBuilder.js";

// TODO: add JS Doc

/* TODOLIST */

var todos = document.querySelector('.presentation#todolist');

getToDoData('todo').then((data) => {
    let defaultList = new TodoList(todos.querySelector('#todolist-default'), data, {
        customAdding: document.querySelector('.custom-form'),
        onAddTodo: onAddTodo,
        tools: false
    });
    let customList = new TodoList(todos.querySelector('#todolist-custom'), data, {
        titleText: 'Summer education'
    });
    let disabledList = new TodoList(todos.querySelector('#todolist-disabled'), data, {
        readonly: true
    });
});

/* TODOLIST BUILDER */

let boardElement = document.querySelector('#todo-board');
let desk = new TodoListBuilder(boardElement, {
    boardClasses: 'row-24',
    builderFormOuterClasses: 'row-24>.col.xxs-24.md-12.lg-8.offset-md-6.offset-lg-8',
    builderFormClasses: 'custom-form',
    builderInputOuterClasses: 'form-control',
    builderButtonClasses: 'btn btn-add btn-icon blue',
    todoListOuterClasses: '.col.xxs-24.md-12.lg-8',
    builderButtonText: '<span class="text">Add</span><span class="icon"><span class="fa fa-plus"></span></span>',
    moveAnimation: false,
    todoList: {
        titleText: 'New List'
    },
    // sources: ['/data/todos.json']
});

/* FUNCTIONS */

function onAddTodo(item) {
    let btn = document.querySelector('.custom-form .btn-icon');
    btn.classList.remove('success', 'error');
    if (item) {
        btn.classList.add('success');
        console.log('Item with text \'' + item.text + '\' created successfully! Default complete status is: ' + item.complete + '\'.');
    } else {
        btn.classList.add('error');
        console.log('Cannot create item with text \'' + document.querySelector('.custom-form input').value + '\'.');
    }
    setTimeout(function () {
        btn.classList.remove('success', 'error');
    }, 2000);
}

function getToDoData(dataString, todolist) {
    return new Promise((resolve, reject) => {
        resolve(todoData);
    });
}
