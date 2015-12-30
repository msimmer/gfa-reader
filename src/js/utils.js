Reader.prototype.Utils = (function() {
  function Utils() {}

  Utils.debounce = function(func, wait, immediate) {
    var timeout;
    timeout = void 0;
    return function() {
      var args, callNow, context, later;
      context = this;
      args = arguments;
      later = function() {
        timeout = null;
        if (!immediate) {
          return func.apply(context, args);
        }
      };
      callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        return func.apply(context, args);
      }
    };
  };

  return Utils;

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBTSxNQUFNLENBQUEsU0FBRSxDQUFBOzs7RUFHWixLQUFDLENBQUEsUUFBRCxHQUFXLFNBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxTQUFiO0FBQ1QsUUFBQTtJQUFBLE9BQUEsR0FBVTtXQUNWLFNBQUE7QUFDRSxVQUFBO01BQUEsT0FBQSxHQUFVO01BQ1YsSUFBQSxHQUFPO01BQ1AsS0FBQSxHQUFRLFNBQUE7UUFDTixPQUFBLEdBQVU7UUFDVixJQUFHLENBQUMsU0FBSjtpQkFDRSxJQUFJLENBQUMsS0FBTCxDQUFXLE9BQVgsRUFBb0IsSUFBcEIsRUFERjs7TUFGTTtNQUlSLE9BQUEsR0FBVSxTQUFBLElBQWMsQ0FBQztNQUN6QixZQUFBLENBQWEsT0FBYjtNQUNBLE9BQUEsR0FBVSxVQUFBLENBQVcsS0FBWCxFQUFrQixJQUFsQjtNQUNWLElBQUcsT0FBSDtlQUNFLElBQUksQ0FBQyxLQUFMLENBQVcsT0FBWCxFQUFvQixJQUFwQixFQURGOztJQVZGO0VBRlMiLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBSZWFkZXI6OlV0aWxzXG5cbiAgIyBodHRwczovL2Rhdmlkd2Fsc2gubmFtZS9qYXZhc2NyaXB0LWRlYm91bmNlLWZ1bmN0aW9uXG4gIEBkZWJvdW5jZTogKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkgLT5cbiAgICB0aW1lb3V0ID0gdW5kZWZpbmVkXG4gICAgLT5cbiAgICAgIGNvbnRleHQgPSB0aGlzXG4gICAgICBhcmdzID0gYXJndW1lbnRzXG4gICAgICBsYXRlciA9IC0+XG4gICAgICAgIHRpbWVvdXQgPSBudWxsXG4gICAgICAgIGlmICFpbW1lZGlhdGVcbiAgICAgICAgICBmdW5jLmFwcGx5IGNvbnRleHQsIGFyZ3NcbiAgICAgIGNhbGxOb3cgPSBpbW1lZGlhdGUgYW5kICF0aW1lb3V0XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dClcbiAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KVxuICAgICAgaWYgY2FsbE5vd1xuICAgICAgICBmdW5jLmFwcGx5IGNvbnRleHQsIGFyZ3NcbiJdfQ==
