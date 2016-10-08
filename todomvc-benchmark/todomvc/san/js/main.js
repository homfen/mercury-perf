/**
 * @file main.js
 * @author homfen(homfen@outlook.com)
 */

/* globals Utils */
/* globals ALL_TODOS */
/* globals ACTIVE_TODOS */
/* globals COMPLETED_TODOS */
/* globals Input */
/* globals TodoItem */
/* globals TodoFooter */
/* globals Router */
/* globals san */

(function (window) {
    'use strict';

    window.ALL_TODOS = 'all';
    window.ACTIVE_TODOS = 'active';
    window.COMPLETED_TODOS = 'completed';

    var ENTER_KEY = 13;
    var ESCAPE_KEY = 27;

    var TodoApp = san.defineComponent({
        initData: function () {
            var todos = Utils.store('san-todos');
            return {
                todos: todos,
                shownTodos: todos,
                nowShowing: ALL_TODOS,
                editing: null
            };
        },

        attached: function () {
            var that = this;
            var router = Router({
                '/': function () {
                    that.data.set('nowShowing', ALL_TODOS)
                    that.setData();
                },
                '/active': function () {
                    that.data.set('nowShowing', ACTIVE_TODOS),
                    that.setData();
                },
                '/completed': function () {
                    that.data.set('nowShowing', COMPLETED_TODOS)
                    that.setData();
                }
            });
            router.init();
            this.ref('newField').el.focus();
        },

        handleNewTodoKeyUp: function (event) {
            if (event.which !== ENTER_KEY) {
                return;
            }

            var newTodo;
            var newField = this.ref('newField').el;
            var val = newField.value.trim();
            newField.value = '';

            if (val) {
                newTodo = {
                    id: Utils.uuid(),
                    title: val,
                    completed: false
                };
                this.data.set('todos', this.data.get('todos').concat([newTodo]));
                this.setData();
            }

            return false;
        },

        toggleAll: function (event) {
            var checked = !(event.target.className.indexOf('checked') > -1);

            // Note: it's usually better to use immutable data structures since they're easier to
            // reason about and React works very well with them. That's why we use map() and filter()
            // everywhere instead of mutating the array or todo items themselves.
            var newTodos = this.data.get('todos').map(function (todo) {
                return Utils.extend({}, todo, {completed: checked});
            });

            this.data.set('todos', newTodos);
            this.setData();
        },

        toggle: function (todoToToggle) {
            var newTodos = this.data.get('todos').map(function (todo) {
                return todo !== todoToToggle ? todo : Utils.extend({}, todo, {completed: !todo.completed});
            });

            this.data.set('todos', newTodos);
            this.setData();
        },

        destroy: function (todo) {
            var newTodos = this.data.get('todos').filter(function (candidate) {
                return candidate.id !== todo.id;
            });

            this.data.set('todos', newTodos);
            this.setData();
        },

        edit: function (todo, callback) {
            this.data.set('editing', todo.id);
            this.data.set('editText', todo.title);
            callback && callback.call(this);
        },

        save: function (todoToSave, text) {
            var newTodos = this.data.get('todos').map(function (todo) {
                return todo !== todoToSave ? todo : Utils.extend({}, todo, {title: text});
            });

            this.data.set('todos', newTodos);
            this.data.set('editing', null);
        },

        cancel: function () {
            this.data.set('editing', null);
        },

        clearCompleted: function () {
            var newTodos = this.data.get('todos').filter(function (todo) {
                return !todo.completed;
            });

            this.data.set('todos', newTodos);
            this.setData();
        },

        updated: function () {
            Utils.store('san-todos', this.data.get('todos'));
            console.log('updated: ', this.data.data);
        },

        components: {
            'ui-todoitem': TodoItem,
            'ui-input': Input
        },

        setData: function () {
            var nowShowing = this.data.get('nowShowing');
            var todos = this.data.get('todos');
            Utils.store('san-todos', todos);
            var shownTodos = todos.filter(function (todo) {
                switch (nowShowing) {
                    case ACTIVE_TODOS:
                        return !todo.completed;
                    case COMPLETED_TODOS:
                        return todo.completed;
                    default:
                        return true;
                }
            }, this);

            var activeTodoCount = todos.reduce(function (accum, todo) {
                return todo.completed ? accum : accum + 1;
            }, 0);

            var completedCount = todos.length - activeTodoCount;

            this.data.set('shownTodos', shownTodos);
            this.data.set('activeTodoCount', activeTodoCount);
            this.data.set('completedCount', completedCount);
        },

        handleSubmit: function (currentTodo) {
            var val = this.data.get('editText').trim();
            var todos = this.data.get('todos');
            if (val !== currentTodo.title) {
                if (val) {
                    todos = todos.map(function (todo) {
                        return todo !== currentTodo ? todo : Utils.extend({}, todo, {title: val});
                    });
                }
                else {
                    todos = todos.filter(function (candidate) {
                        return candidate.id !== currentTodo.id;
                    });
                }
                this.data.set('todos', todos);
                this.setData();
            }
            this.data.set('editing', null);
            return false;
        },

        handleEdit: function (todo) {
            this.edit(todo);
        },

        handleKeyUp: function (event, todo) {
            if (event.keyCode === ESCAPE_KEY) {
                this.data.set('editText', this.props.todo.title);
                this.cancel();
            }
            else if (event.keyCode === ENTER_KEY) {
                this.handleSubmit(todo);
            }
            else {
                this.data.set('editText', event.target.value);
            }
        },

        template: ''
            + '<div>'
            +     '<header id="header">'
            +         '<h1>todos</h1>'
            +         '<ui-input san-ref="newField" id="new-todo" placeholder="What needs to be done?" on-keyup="handleNewTodoKeyUp($event)"></ui-input>'
            +     '</header>'
            +     '<section id="main">'
            +         '<i id="toggle-all" on-click="toggleAll($event)" class="{{activeTodoCount === 0 | yesOrNoToBe(\'checked\', \'\')}}"></i>'
            +         '<ul id="todo-list" style="line-height: 0;">'
            +             '<li san-for="todo, index in shownTodos" class="{{todo.completed | yesOrNoToBe(\'completed \', \'\')}}'
            +             '{{editing === todo.id | yesOrNoToBe(\'editing \', \'\')}}">'
            +                 '<div class="view" id="{{todo.id}}">'
            +                     '<i class="toggle {{todo.completed | yesOrNoToBe(\'checked\', \'\')}}" on-click="toggle(todo)"></i>'
            +                     '<label on-dblclick="handleEdit(todo)">{{todo.title}}</label>'
            +                     '<button class="destroy" on-click="destroy(todo)"></button>'
            +                 '</div>'
            +                 '<input class="edit" type="text" value="{{ todo.title }}" on-blur="handleSubmit(todo)" on-keyup="handleKeyUp($event, todo)">'
            +             '</li>'
            +         '</ul>'
            +     '</section>'
            +     '<footer id="footer">'
            +         '<span id="todo-count">'
            +             '<strong>{{todos.length}}</strong> {{activeTodoCount}} left'
            +         '</span>'
            +         '<ul id="filters">'
            +             '<li>'
            +                 '<a href="#/" className="showall">All</a>'
            +             '</li>&nbsp;'
            +             '<li>'
            +                 '<a href="#/active" className="showactive">Active</a>'
            +             '</li>&nbsp;'
            +             '<li>'
            +                 '<a href="#/completed" className="showcompleted">Completed</a>'
            +             '</li>'
            +         '</ul>'
            +         '<button san-if="completedCount" class="clear-completed" on-click="clearCompleted">Clear completed ({{completedCount}})</button>'
            +     '</footer>'
            + '</div>'
    });

    var todoApp = new TodoApp();
    todoApp.attach(document.getElementById('todoapp'))

})(window);
