var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Reader.prototype.Swipe = (function() {
  var _hammerCtrl, defaults, frame, frameId, hammer;

  frame = null;

  frameId = null;

  hammer = null;

  defaults = {
    reader: '#reader-frame',
    touchOptions: {}
  };

  _hammerCtrl = null;

  function Swipe(options) {
    this.options = options != null ? options : {};
    this.initialize = bind(this.initialize, this);
    this.settings = $.extend({}, defaults, this.options);
    frame = $(this.settings.reader);
    frameId = this.settings.reader.slice(1);
  }

  Swipe.prototype.bind = function() {};

  Swipe.prototype.destroy = function() {
    return _hammerCtrl.destroy();
  };

  Swipe.prototype.swipeLeft = function() {
    return Reader.prototype.trigger('nextPage');
  };

  Swipe.prototype.swipeRight = function() {
    return Reader.prototype.trigger('prevPage');
  };

  Swipe.prototype.setup = function() {
    _hammerCtrl = new Hammer.Manager(document.getElementById(frameId), {
      recognizers: [
        [
          Hammer.Swipe, {
            direction: Hammer.DIRECTION_ALL
          }
        ]
      ]
    });
    return _hammerCtrl.on('swipe', (function(_this) {
      return function(e) {
        if (e.deltaX < 0) {
          return _this.swipeLeft();
        } else if (e.deltaX > 0) {
          return _this.swipeRight();
        }
      };
    })(this));
  };

  Swipe.prototype.initialize = function() {
    this.bind();
    return this.setup();
  };

  return Swipe;

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN3aXBlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBOztBQUFNLE1BQU0sQ0FBQSxTQUFFLENBQUE7QUFFWixNQUFBOztFQUFBLEtBQUEsR0FBVTs7RUFDVixPQUFBLEdBQVU7O0VBQ1YsTUFBQSxHQUFVOztFQUVWLFFBQUEsR0FDRTtJQUFBLE1BQUEsRUFBUSxlQUFSO0lBQ0EsWUFBQSxFQUFjLEVBRGQ7OztFQUdGLFdBQUEsR0FBYzs7RUFFRCxlQUFDLE9BQUQ7SUFBQyxJQUFDLENBQUEsNEJBQUQsVUFBVzs7SUFDdkIsSUFBQyxDQUFBLFFBQUQsR0FBWSxDQUFDLENBQUMsTUFBRixDQUFTLEVBQVQsRUFBYSxRQUFiLEVBQXVCLElBQUMsQ0FBQSxPQUF4QjtJQUNaLEtBQUEsR0FBUSxDQUFBLENBQUUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFaO0lBQ1IsT0FBQSxHQUFVLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQWpCLENBQXVCLENBQXZCO0VBSEM7O2tCQUtiLElBQUEsR0FBSyxTQUFBLEdBQUE7O2tCQUlMLE9BQUEsR0FBUSxTQUFBO1dBR04sV0FBVyxDQUFDLE9BQVosQ0FBQTtFQUhNOztrQkFLUixTQUFBLEdBQVUsU0FBQTtXQUFLLE1BQU0sQ0FBQSxTQUFFLENBQUEsT0FBUixDQUFnQixVQUFoQjtFQUFMOztrQkFDVixVQUFBLEdBQVcsU0FBQTtXQUFLLE1BQU0sQ0FBQSxTQUFFLENBQUEsT0FBUixDQUFnQixVQUFoQjtFQUFMOztrQkFFWCxLQUFBLEdBQU0sU0FBQTtJQUNKLFdBQUEsR0FBa0IsSUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLFFBQVEsQ0FBQyxjQUFULENBQXdCLE9BQXhCLENBQWYsRUFDaEI7TUFBQSxXQUFBLEVBQVk7UUFDVjtVQUFDLE1BQU0sQ0FBQyxLQUFSLEVBQWU7WUFBRSxTQUFBLEVBQVcsTUFBTSxDQUFDLGFBQXBCO1dBQWY7U0FEVTtPQUFaO0tBRGdCO1dBTWxCLFdBQVcsQ0FBQyxFQUFaLENBQWUsT0FBZixFQUF3QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtRQUN0QixJQUFHLENBQUMsQ0FBQyxNQUFGLEdBQVcsQ0FBZDtpQkFBcUIsS0FBQyxDQUFBLFNBQUQsQ0FBQSxFQUFyQjtTQUFBLE1BQ0ssSUFBRyxDQUFDLENBQUMsTUFBRixHQUFXLENBQWQ7aUJBQXFCLEtBQUMsQ0FBQSxVQUFELENBQUEsRUFBckI7O01BRmlCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QjtFQVBJOztrQkFXTixVQUFBLEdBQVcsU0FBQTtJQUNULElBQUMsQ0FBQSxJQUFELENBQUE7V0FDQSxJQUFDLENBQUEsS0FBRCxDQUFBO0VBRlMiLCJmaWxlIjoic3dpcGUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBSZWFkZXI6OlN3aXBlXG5cbiAgZnJhbWUgICA9IG51bGxcbiAgZnJhbWVJZCA9IG51bGxcbiAgaGFtbWVyICA9IG51bGxcblxuICBkZWZhdWx0cyA9XG4gICAgcmVhZGVyOiAnI3JlYWRlci1mcmFtZSdcbiAgICB0b3VjaE9wdGlvbnM6IHt9XG5cbiAgX2hhbW1lckN0cmwgPSBudWxsXG5cbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucyA9IHt9KS0+XG4gICAgQHNldHRpbmdzID0gJC5leHRlbmQoe30sIGRlZmF1bHRzLCBAb3B0aW9ucylcbiAgICBmcmFtZSA9ICQoQHNldHRpbmdzLnJlYWRlcilcbiAgICBmcmFtZUlkID0gQHNldHRpbmdzLnJlYWRlci5zbGljZSgxKVxuXG4gIGJpbmQ6KCktPlxuICAgICMgaWYgJ29udG91Y2hzdGFydCcgb2YgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG4gICAgIyAgIGRvY3VtZW50LmJvZHkub250b3VjaHN0YXJ0ID0gKGUpLT4gcmV0dXJuXG5cbiAgZGVzdHJveTooKS0+XG4gICAgIyBpZiAnb250b3VjaHN0YXJ0JyBvZiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcbiAgICAjICAgZG9jdW1lbnQuYm9keS5vbnRvdWNoc3RhcnQgPSBudWxsXG4gICAgX2hhbW1lckN0cmwuZGVzdHJveSgpXG5cbiAgc3dpcGVMZWZ0OigpLT4gUmVhZGVyOjp0cmlnZ2VyKCduZXh0UGFnZScpXG4gIHN3aXBlUmlnaHQ6KCktPiBSZWFkZXI6OnRyaWdnZXIoJ3ByZXZQYWdlJylcblxuICBzZXR1cDooKS0+XG4gICAgX2hhbW1lckN0cmwgPSBuZXcgSGFtbWVyLk1hbmFnZXIoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZnJhbWVJZCksXG4gICAgICByZWNvZ25pemVyczpbXG4gICAgICAgIFtIYW1tZXIuU3dpcGUsIHsgZGlyZWN0aW9uOiBIYW1tZXIuRElSRUNUSU9OX0FMTCB9XVxuICAgICAgXVxuICAgIClcblxuICAgIF9oYW1tZXJDdHJsLm9uICdzd2lwZScsIChlKT0+XG4gICAgICBpZiBlLmRlbHRhWCA8IDAgdGhlbiBAc3dpcGVMZWZ0KClcbiAgICAgIGVsc2UgaWYgZS5kZWx0YVggPiAwIHRoZW4gQHN3aXBlUmlnaHQoKVxuXG4gIGluaXRpYWxpemU6KCk9PlxuICAgIEBiaW5kKClcbiAgICBAc2V0dXAoKVxuIl19
