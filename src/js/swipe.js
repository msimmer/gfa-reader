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
    if (_hammerCtrl) {
      return _hammerCtrl.destroy();
    }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN3aXBlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBOztBQUFNLE1BQU0sQ0FBQSxTQUFFLENBQUE7QUFFWixNQUFBOztFQUFBLEtBQUEsR0FBVTs7RUFDVixPQUFBLEdBQVU7O0VBQ1YsTUFBQSxHQUFVOztFQUVWLFFBQUEsR0FDRTtJQUFBLE1BQUEsRUFBUSxlQUFSO0lBQ0EsWUFBQSxFQUFjLEVBRGQ7OztFQUdGLFdBQUEsR0FBYzs7RUFFRCxlQUFDLE9BQUQ7SUFBQyxJQUFDLENBQUEsNEJBQUQsVUFBVzs7SUFDdkIsSUFBQyxDQUFBLFFBQUQsR0FBWSxDQUFDLENBQUMsTUFBRixDQUFTLEVBQVQsRUFBYSxRQUFiLEVBQXVCLElBQUMsQ0FBQSxPQUF4QjtJQUNaLEtBQUEsR0FBUSxDQUFBLENBQUUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFaO0lBQ1IsT0FBQSxHQUFVLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQWpCLENBQXVCLENBQXZCO0VBSEM7O2tCQUtiLElBQUEsR0FBSyxTQUFBLEdBQUE7O2tCQUlMLE9BQUEsR0FBUSxTQUFBO0lBQ04sSUFBeUIsV0FBekI7YUFBQSxXQUFXLENBQUMsT0FBWixDQUFBLEVBQUE7O0VBRE07O2tCQUdSLFNBQUEsR0FBVSxTQUFBO1dBQUssTUFBTSxDQUFBLFNBQUUsQ0FBQSxPQUFSLENBQWdCLFVBQWhCO0VBQUw7O2tCQUNWLFVBQUEsR0FBVyxTQUFBO1dBQUssTUFBTSxDQUFBLFNBQUUsQ0FBQSxPQUFSLENBQWdCLFVBQWhCO0VBQUw7O2tCQUVYLEtBQUEsR0FBTSxTQUFBO0lBQ0osV0FBQSxHQUFrQixJQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWUsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsT0FBeEIsQ0FBZixFQUNoQjtNQUFBLFdBQUEsRUFBWTtRQUNWO1VBQUMsTUFBTSxDQUFDLEtBQVIsRUFBZTtZQUFFLFNBQUEsRUFBVyxNQUFNLENBQUMsYUFBcEI7V0FBZjtTQURVO09BQVo7S0FEZ0I7V0FNbEIsV0FBVyxDQUFDLEVBQVosQ0FBZSxPQUFmLEVBQXdCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxDQUFEO1FBQ3RCLElBQUcsQ0FBQyxDQUFDLE1BQUYsR0FBVyxDQUFkO2lCQUFxQixLQUFDLENBQUEsU0FBRCxDQUFBLEVBQXJCO1NBQUEsTUFDSyxJQUFHLENBQUMsQ0FBQyxNQUFGLEdBQVcsQ0FBZDtpQkFBcUIsS0FBQyxDQUFBLFVBQUQsQ0FBQSxFQUFyQjs7TUFGaUI7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCO0VBUEk7O2tCQVdOLFVBQUEsR0FBVyxTQUFBO0lBQ1QsSUFBQyxDQUFBLElBQUQsQ0FBQTtXQUNBLElBQUMsQ0FBQSxLQUFELENBQUE7RUFGUyIsImZpbGUiOiJzd2lwZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFJlYWRlcjo6U3dpcGVcblxuICBmcmFtZSAgID0gbnVsbFxuICBmcmFtZUlkID0gbnVsbFxuICBoYW1tZXIgID0gbnVsbFxuXG4gIGRlZmF1bHRzID1cbiAgICByZWFkZXI6ICcjcmVhZGVyLWZyYW1lJ1xuICAgIHRvdWNoT3B0aW9uczoge31cblxuICBfaGFtbWVyQ3RybCA9IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKEBvcHRpb25zID0ge30pLT5cbiAgICBAc2V0dGluZ3MgPSAkLmV4dGVuZCh7fSwgZGVmYXVsdHMsIEBvcHRpb25zKVxuICAgIGZyYW1lID0gJChAc2V0dGluZ3MucmVhZGVyKVxuICAgIGZyYW1lSWQgPSBAc2V0dGluZ3MucmVhZGVyLnNsaWNlKDEpXG5cbiAgYmluZDooKS0+XG4gICAgIyBpZiAnb250b3VjaHN0YXJ0JyBvZiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcbiAgICAjICAgZG9jdW1lbnQuYm9keS5vbnRvdWNoc3RhcnQgPSAoZSktPiByZXR1cm5cblxuICBkZXN0cm95OigpLT5cbiAgICBfaGFtbWVyQ3RybC5kZXN0cm95KCkgaWYgX2hhbW1lckN0cmxcblxuICBzd2lwZUxlZnQ6KCktPiBSZWFkZXI6OnRyaWdnZXIoJ25leHRQYWdlJylcbiAgc3dpcGVSaWdodDooKS0+IFJlYWRlcjo6dHJpZ2dlcigncHJldlBhZ2UnKVxuXG4gIHNldHVwOigpLT5cbiAgICBfaGFtbWVyQ3RybCA9IG5ldyBIYW1tZXIuTWFuYWdlcihkb2N1bWVudC5nZXRFbGVtZW50QnlJZChmcmFtZUlkKSxcbiAgICAgIHJlY29nbml6ZXJzOltcbiAgICAgICAgW0hhbW1lci5Td2lwZSwgeyBkaXJlY3Rpb246IEhhbW1lci5ESVJFQ1RJT05fQUxMIH1dXG4gICAgICBdXG4gICAgKVxuXG4gICAgX2hhbW1lckN0cmwub24gJ3N3aXBlJywgKGUpPT5cbiAgICAgIGlmIGUuZGVsdGFYIDwgMCB0aGVuIEBzd2lwZUxlZnQoKVxuICAgICAgZWxzZSBpZiBlLmRlbHRhWCA+IDAgdGhlbiBAc3dpcGVSaWdodCgpXG5cbiAgaW5pdGlhbGl6ZTooKT0+XG4gICAgQGJpbmQoKVxuICAgIEBzZXR1cCgpXG4iXX0=
