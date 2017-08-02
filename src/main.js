'use strict';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./js/sw.js').then(function (reg) {
        console.log('Registration succeeded. Scope is ' + reg.scope);
    }).catch(function (error) {
        console.log('Registration failed with ' + error);
    });
}

const grid = require('./css/grid.min.css');
const style = require('./less/style.less');
import { TodoBuilder } from "./js/todoListBuilder.js";

// TODO: add JSDoc

let boardElement = document.querySelector('#todo-board');
let desk = new TodoBuilder(boardElement, {
    boardClasses: 'row-24',
    listOuterClasses: '.col.xxs-24.md-12.lg-8',
    list: {
        titleText: 'New List'
    }
});
