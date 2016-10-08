/**
 * @file todoItem.js
 * @author homfen(homfen@outlook.com)
 */

var ESCAPE_KEY = 27;
var ENTER_KEY = 13;

var TodoItem = san.defineComponent({
    handleSubmit: function () {
        var val = this.data.get('editText').trim();
        if (val) {
            this.data.get('save')(val);
            this.data.set('editText', val);
        }
        else {
            this.data.get('destroy')();
        }
        return false;
    },

    handleEdit: function () {
        // react optimizes renders by batching them. This means you can't call
        // parent's `onEdit` (which in this case triggeres a re-render), and
        // immediately manipulate the DOM as if the rendering's over. Put it as a
        // callback. Refer to app.js' `edit` method
        this.data.get('edit')(function () {
            var node = this.ref('editField');
            node.focus();
            node.setSelectionRange(node.value.length, node.value.length);
        }.bind(this));
        this.data.set('editText', this.data.get('todo').title);
    },

    handleKeyDown: function (event) {
        if (event.keyCode === ESCAPE_KEY) {
            this.data.set('editText', this.props.todo.title);
            this.data.get('cancel')();
        }
        else if (event.keyCode === ENTER_KEY) {
            this.handleSubmit();
        }
    },

    handleChange: function (event) {
        this.data.set('editText', event.target.value);
    },

    initData: function () {
        return {editText: ''};
    },

    onToggle: function () {
        this.data.get('onToggle')();
    },

    onDestroy: function () {
        this.data.get('onDestroy')();
    },

    components: {
        'ui-input': Input
    },

    template: ''
        + '<li class="{{todo.completed | yesOrNoToBe(\'completed \', \'\')}}'
        + '{{editing | yesOrNoToBe(\'editing \', \'\')}}">'
        +     '<div class="view">'
        +         '<ui-input class="toggle" type="checkbox" checked="{{todo.completed}}" on-change="onToggle"></ui-input>'
        +         '<label on-double-click="handleEdit">{{todo.title}}</label>'
        +         '<button class="destory" on-click="onDestroy"></button>'
        +     '</div>'
        +     '<input san-ref="editField" class="edit" value={{editText}} on-blur="handleSubmit" on-change="handleChange" on-keydown="handleKeyDown">'
        + '</li>'
});
