/**
 * @file todoItem.js
 * @author homfen(homfen@outlook.com)
 */
var Input = san.defineComponent({
    attached: function () {
        console.log(this.data);
    },
    template: ''
        + '<input san-if="checked" id="{{id}}" class="{{class}}" type="{{type}}" placeholder="{{placeholder}}" value="{{value}}" checked />'
        + '<input san-else id="{{id}}" class="{{class}}" type="{{type}}" placeholder="{{placeholder}}" value="{{value}}" />'
});
