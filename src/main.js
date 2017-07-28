'use strict';

const grid = require('./css/grid.min.css');
const style = require('./less/style.less');
import { TodoBuilder } from "./js/todoListBuilder.js";

// TODO: add JS Doc

let boardElement = document.querySelector('#todo-board');
let desk = new TodoBuilder(boardElement, {
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
