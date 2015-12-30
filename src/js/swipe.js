var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Reader.prototype.Swipe = (function() {
  var _addEventListener, _addPrefix, _addWheelListener, _removeEventListener, _removePrefix, _removeWheelListener, _support, defaults, frame, readerId;

  defaults = {
    reader: '#reader-frame'
  };

  frame = null;

  readerId = null;

  _support = void 0;

  _addPrefix = '';

  _removePrefix = '';

  _addEventListener = void 0;

  _addWheelListener = void 0;

  _removeEventListener = void 0;

  _removeWheelListener = void 0;

  function Swipe(options) {
    this.options = options != null ? options : {};
    this.destroy = bind(this.destroy, this);
    this.settings = $.extend({}, this.options, defaults);
    readerId = this.settings.reader.slice(1);
    _support = 'onwheel' in document.createElement('div') ? 'wheel' : document.onmousewheel !== void 0 ? 'mousewheel' : 'DOMMouseScroll';
    frame = $(this.settings.reader);
  }

  Swipe.prototype.bind = function() {
    var _doScroll;
    this.doScroll = Reader.prototype.Utils.debounce((function(_this) {
      return function(e) {
        if (e.deltaX >= 1) {
          return Reader.prototype.trigger('nextPage', {});
        } else if (e.deltaX <= -1) {
          return Reader.prototype.trigger('prevPage', {});
        }
      };
    })(this), 50, true);
    _doScroll = (function(_this) {
      return function(e) {
        e.preventDefault();
        return _this.doScroll(e);
      };
    })(this);
    return this.addWheelListener(document.getElementById(readerId), _doScroll, false);
  };

  Swipe.prototype.doScroll = function() {};

  Swipe.prototype.addWheelListener = function() {};

  Swipe.prototype.removeWheelListener = function() {};

  Swipe.prototype.destroy = function() {
    return this.removeWheelListener(document.getElementById(readerId), _doScroll);
  };

  Swipe.prototype.compatRemove = function(_this) {
    if (window.removeEventListener) {
      _removeEventListener = 'removeEventListener';
    } else {
      _removeEventListener = 'detachEvent';
      _removePrefix = 'on';
    }
    _this.removeWheelListener = function(elem, callback) {
      _removeWheelListener(elem, _support, callback);
      if (_support === 'DOMMouseScroll') {
        return _removeWheelListener(elem, 'MozMousePixelScroll', callback);
      }
    };
    return _removeWheelListener = function(elem, eventName, callback) {
      return elem[_removeEventListener](_removePrefix + eventName, callback);
    };
  };

  Swipe.prototype.compatAdd = function(_this) {
    if (window.addEventListener) {
      _addEventListener = 'addEventListener';
    } else {
      _addEventListener = 'attachEvent';
      _addPrefix = 'on';
    }
    _this.addWheelListener = function(elem, callback, useCapture) {
      _addWheelListener(elem, _support, callback, useCapture);
      if (_support === 'DOMMouseScroll') {
        return _addWheelListener(elem, 'MozMousePixelScroll', callback, useCapture);
      }
    };
    return _addWheelListener = function(elem, eventName, callback, useCapture) {
      return elem[_addEventListener](_addPrefix + eventName, (_support === 'wheel' ? callback : function(originalEvent) {
        var event;
        !originalEvent && (originalEvent = window.event);
        event = {
          originalEvent: originalEvent,
          target: originalEvent.target || originalEvent.srcElement,
          type: 'wheel',
          deltaMode: originalEvent.type === 'MozMousePixelScroll' ? 0 : 1,
          deltaX: 0,
          deltaZ: 0,
          preventDefault: (function() {
            if (originalEvent.preventDefault) {
              originalEvent.preventDefault();
            } else {
              originalEvent.returnValue = false;
            }
          })
        };
        if (_support === 'mousewheel') {
          event.deltaY = -1 / 40 * originalEvent.wheelDelta;
          originalEvent.wheelDeltaX && (event.deltaX = -1 / 40 * originalEvent.wheelDeltaX);
        } else {
          event.deltaY = originalEvent.detail;
        }
        return callback(event);
      }), useCapture || false);
    };
  };

  Swipe.prototype.initialize = function() {
    this.compatAdd(this);
    this.compatRemove(this);
    return this.bind();
  };

  return Swipe;

})();

//# sourceMappingURL=data:application/json;base64,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RUFBZ0IsQ0FBQyxTQUFBO1lBQ2YsSUFBRyxhQUFhLENBQUMsY0FBakI7Y0FBcUMsYUFBYSxDQUFDLGNBQWQsQ0FBQSxFQUFyQzthQUFBLE1BQUE7Y0FBMEUsYUFBYSxDQUFDLFdBQWQsR0FBNEIsTUFBdEc7O1VBRGUsQ0FBRCxDQU5oQjs7UUFVRixJQUFHLFFBQUEsS0FBWSxZQUFmO1VBQ0UsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUFDLENBQUQsR0FBSyxFQUFMLEdBQVUsYUFBYSxDQUFDO1VBQ3ZDLGFBQWEsQ0FBQyxXQUFkLElBQThCLENBQUMsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUFDLENBQUQsR0FBSyxFQUFMLEdBQVUsYUFBYSxDQUFDLFdBQXhDLEVBRmhDO1NBQUEsTUFBQTtVQUlFLEtBQUssQ0FBQyxNQUFOLEdBQWUsYUFBYSxDQUFDLE9BSi9COztlQUtBLFFBQUEsQ0FBUyxLQUFUO01BbEJ5RixDQUEzQyxDQUFoRCxFQW1CRyxVQUFBLElBQWMsS0FuQmpCO0lBRGtCO0VBYlo7O2tCQW1DVixVQUFBLEdBQVcsU0FBQTtJQUNULElBQUMsQ0FBQSxTQUFELENBQVcsSUFBWDtJQUNBLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBZDtXQUNBLElBQUMsQ0FBQSxJQUFELENBQUE7RUFIUyIsImZpbGUiOiJzd2lwZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFJlYWRlcjo6U3dpcGVcblxuICBkZWZhdWx0cyA9XG4gICAgcmVhZGVyIDogJyNyZWFkZXItZnJhbWUnXG5cbiAgZnJhbWUgICAgICAgICAgICAgICAgPSBudWxsXG4gIHJlYWRlcklkICAgICAgICAgICAgID0gbnVsbFxuXG4gIF9zdXBwb3J0ICAgICAgICAgICAgID0gdW5kZWZpbmVkXG4gIF9hZGRQcmVmaXggICAgICAgICAgID0gJydcbiAgX3JlbW92ZVByZWZpeCAgICAgICAgPSAnJ1xuICBfYWRkRXZlbnRMaXN0ZW5lciAgICA9IHVuZGVmaW5lZFxuICBfYWRkV2hlZWxMaXN0ZW5lciAgICA9IHVuZGVmaW5lZFxuICBfcmVtb3ZlRXZlbnRMaXN0ZW5lciA9IHVuZGVmaW5lZFxuICBfcmVtb3ZlV2hlZWxMaXN0ZW5lciA9IHVuZGVmaW5lZFxuXG4gIGNvbnN0cnVjdG9yOihAb3B0aW9ucyA9IHt9KSAtPlxuICAgIEBzZXR0aW5ncyA9ICQuZXh0ZW5kKHt9LCBAb3B0aW9ucywgZGVmYXVsdHMpXG4gICAgcmVhZGVySWQgPSBAc2V0dGluZ3MucmVhZGVyLnNsaWNlKDEpXG4gICAgX3N1cHBvcnQgPSBpZiAnb253aGVlbCcgb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykgdGhlbiAnd2hlZWwnIGVsc2UgaWYgZG9jdW1lbnQub25tb3VzZXdoZWVsICE9IHVuZGVmaW5lZCB0aGVuICdtb3VzZXdoZWVsJyBlbHNlICdET01Nb3VzZVNjcm9sbCdcbiAgICBmcmFtZSA9ICQoQHNldHRpbmdzLnJlYWRlcilcblxuICBiaW5kOigpLT5cbiAgICBAZG9TY3JvbGwgPSBSZWFkZXI6OlV0aWxzLmRlYm91bmNlIChlKSA9PlxuICAgICAgaWYgZS5kZWx0YVggPj0gMVxuICAgICAgICBSZWFkZXI6OnRyaWdnZXIoJ25leHRQYWdlJywge30pXG4gICAgICBlbHNlIGlmIGUuZGVsdGFYIDw9IC0xXG4gICAgICAgIFJlYWRlcjo6dHJpZ2dlcigncHJldlBhZ2UnLCB7fSlcbiAgICAsIDUwLCB0cnVlXG5cbiAgICBfZG9TY3JvbGwgPSAoZSk9PlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBAZG9TY3JvbGwoZSlcblxuICAgIEBhZGRXaGVlbExpc3RlbmVyKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHJlYWRlcklkKSwgX2RvU2Nyb2xsLCBmYWxzZSlcblxuICBkb1Njcm9sbDogKCkgLT5cbiAgYWRkV2hlZWxMaXN0ZW5lcjooKS0+XG4gIHJlbW92ZVdoZWVsTGlzdGVuZXI6KCktPlxuXG4gIGRlc3Ryb3k6KCkgPT5cbiAgICBAcmVtb3ZlV2hlZWxMaXN0ZW5lcihkb2N1bWVudC5nZXRFbGVtZW50QnlJZChyZWFkZXJJZCksIF9kb1Njcm9sbClcblxuICBjb21wYXRSZW1vdmU6KF90aGlzKS0+XG4gICAgaWYgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXJcbiAgICAgIF9yZW1vdmVFdmVudExpc3RlbmVyID0gJ3JlbW92ZUV2ZW50TGlzdGVuZXInXG4gICAgZWxzZVxuICAgICAgX3JlbW92ZUV2ZW50TGlzdGVuZXIgPSAnZGV0YWNoRXZlbnQnXG4gICAgICBfcmVtb3ZlUHJlZml4ID0gJ29uJ1xuXG4gICAgX3RoaXMucmVtb3ZlV2hlZWxMaXN0ZW5lciA9IChlbGVtLCBjYWxsYmFjaykgLT5cbiAgICAgIF9yZW1vdmVXaGVlbExpc3RlbmVyIGVsZW0sIF9zdXBwb3J0LCBjYWxsYmFja1xuICAgICAgaWYgX3N1cHBvcnQgPT0gJ0RPTU1vdXNlU2Nyb2xsJ1xuICAgICAgICBfcmVtb3ZlV2hlZWxMaXN0ZW5lciBlbGVtLCAnTW96TW91c2VQaXhlbFNjcm9sbCcsIGNhbGxiYWNrXG5cbiAgICBfcmVtb3ZlV2hlZWxMaXN0ZW5lciA9IChlbGVtLCBldmVudE5hbWUsIGNhbGxiYWNrKSAtPlxuICAgICAgZWxlbVtfcmVtb3ZlRXZlbnRMaXN0ZW5lcl0oX3JlbW92ZVByZWZpeCArIGV2ZW50TmFtZSwgY2FsbGJhY2spXG5cblxuICAjIHNoaW0gZm9yIGF0dGFjaGluZyBldmVudHMgdG8gYHdoZWVsYCBnaXZlbiBicm93c2VyIGluY29tcGF0aWJpbGl0aWVzLFxuICAjIHRha2VuIGZyb20gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvRXZlbnRzL3doZWVsXG4gICNcbiAgY29tcGF0QWRkOihfdGhpcyktPlxuXG4gICAgaWYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICAgIF9hZGRFdmVudExpc3RlbmVyID0gJ2FkZEV2ZW50TGlzdGVuZXInXG4gICAgZWxzZVxuICAgICAgX2FkZEV2ZW50TGlzdGVuZXIgPSAnYXR0YWNoRXZlbnQnXG4gICAgICBfYWRkUHJlZml4ID0gJ29uJ1xuXG4gICAgX3RoaXMuYWRkV2hlZWxMaXN0ZW5lciA9IChlbGVtLCBjYWxsYmFjaywgdXNlQ2FwdHVyZSkgLT5cbiAgICAgIF9hZGRXaGVlbExpc3RlbmVyIGVsZW0sIF9zdXBwb3J0LCBjYWxsYmFjaywgdXNlQ2FwdHVyZVxuICAgICAgaWYgX3N1cHBvcnQgPT0gJ0RPTU1vdXNlU2Nyb2xsJ1xuICAgICAgICBfYWRkV2hlZWxMaXN0ZW5lciBlbGVtLCAnTW96TW91c2VQaXhlbFNjcm9sbCcsIGNhbGxiYWNrLCB1c2VDYXB0dXJlXG5cbiAgICBfYWRkV2hlZWxMaXN0ZW5lciA9IChlbGVtLCBldmVudE5hbWUsIGNhbGxiYWNrLCB1c2VDYXB0dXJlKSAtPlxuICAgICAgZWxlbVtfYWRkRXZlbnRMaXN0ZW5lcl0oX2FkZFByZWZpeCArIGV2ZW50TmFtZSwgKGlmIF9zdXBwb3J0ID09ICd3aGVlbCcgdGhlbiBjYWxsYmFjayBlbHNlIChvcmlnaW5hbEV2ZW50KS0+XG4gICAgICAgICFvcmlnaW5hbEV2ZW50IGFuZCAob3JpZ2luYWxFdmVudCA9IHdpbmRvdy5ldmVudClcbiAgICAgICAgZXZlbnQgPVxuICAgICAgICAgIG9yaWdpbmFsRXZlbnQ6IG9yaWdpbmFsRXZlbnRcbiAgICAgICAgICB0YXJnZXQ6IG9yaWdpbmFsRXZlbnQudGFyZ2V0IG9yIG9yaWdpbmFsRXZlbnQuc3JjRWxlbWVudFxuICAgICAgICAgIHR5cGU6ICd3aGVlbCdcbiAgICAgICAgICBkZWx0YU1vZGU6IGlmIG9yaWdpbmFsRXZlbnQudHlwZSA9PSAnTW96TW91c2VQaXhlbFNjcm9sbCcgdGhlbiAwIGVsc2UgMVxuICAgICAgICAgIGRlbHRhWDogMFxuICAgICAgICAgIGRlbHRhWjogMFxuICAgICAgICAgIHByZXZlbnREZWZhdWx0OiAoLT5cbiAgICAgICAgICAgIGlmIG9yaWdpbmFsRXZlbnQucHJldmVudERlZmF1bHQgdGhlbiBvcmlnaW5hbEV2ZW50LnByZXZlbnREZWZhdWx0KCkgZWxzZSAob3JpZ2luYWxFdmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgKVxuICAgICAgICBpZiBfc3VwcG9ydCA9PSAnbW91c2V3aGVlbCdcbiAgICAgICAgICBldmVudC5kZWx0YVkgPSAtMSAvIDQwICogb3JpZ2luYWxFdmVudC53aGVlbERlbHRhXG4gICAgICAgICAgb3JpZ2luYWxFdmVudC53aGVlbERlbHRhWCBhbmQgKGV2ZW50LmRlbHRhWCA9IC0xIC8gNDAgKiBvcmlnaW5hbEV2ZW50LndoZWVsRGVsdGFYKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZXZlbnQuZGVsdGFZID0gb3JpZ2luYWxFdmVudC5kZXRhaWxcbiAgICAgICAgY2FsbGJhY2sgZXZlbnRcbiAgICAgICksIHVzZUNhcHR1cmUgb3IgZmFsc2UpXG5cbiAgaW5pdGlhbGl6ZTooKS0+XG4gICAgQGNvbXBhdEFkZChAKVxuICAgIEBjb21wYXRSZW1vdmUoQClcbiAgICBAYmluZCgpXG4iXX0=
