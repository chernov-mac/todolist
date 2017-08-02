'use strict';

if ('ServiceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => {
        // ok!
    }, (e) => {
        // oops!
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
