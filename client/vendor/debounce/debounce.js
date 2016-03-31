// https://remysharp.com/2010/07/21/throttling-function-calls [2016-03-30]
this.debounce = function debounce(fn, delay) {
  var timer = null;
  return function () {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}