App.prototype.Layout = (function() {
  function Layout(options) {
    if (options == null) {
      options = {};
    }
    this.pos = 0;
    this.frame = null;
  }

  Layout.prototype.parent = function() {
    return $("<article />").attr({
      'data-article': this.pos
    });
  };

  Layout.prototype.child = function(attrs) {
    return $("<section />").attr(attrs).text(this.pos + " : " + attrs['data-label']);
  };

  Layout.prototype.add = function(elem, parent) {
    parent.append(elem);
    return elem;
  };

  Layout.prototype.build = function(data, callback, parent) {
    var attrs, frame, i, index, item, len, ref, results;
    results = [];
    for (index = i = 0, len = data.length; i < len; index = ++i) {
      item = data[index];
      this.pos += 1;
      attrs = {
        id: item.id,
        'data-label': item.navLabel,
        'data-src': item.src
      };
      if (!parent) {
        this.frame = $('main');
      }
      frame = this.add(this.parent(), this.frame);
      this.add(this.child(attrs), frame);
      callback(item.src, item.id);
      if ((ref = item.navPoint) != null ? ref.length : void 0) {
        this.frame = frame;
        results.push(this.build(item.navPoint, callback, this.frame));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Layout.prototype.render = function(doc, id) {
    return $("#" + id).append(doc);
  };

  return Layout;

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxheW91dC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQU0sR0FBRyxDQUFBLFNBQUUsQ0FBQTtFQUVJLGdCQUFDLE9BQUQ7O01BQUMsVUFBVTs7SUFDdEIsSUFBQyxDQUFBLEdBQUQsR0FBTztJQUNQLElBQUMsQ0FBQSxLQUFELEdBQVM7RUFGRTs7bUJBSWIsTUFBQSxHQUFRLFNBQUE7QUFDTixXQUFPLENBQUEsQ0FBRSxhQUFGLENBQWdCLENBQUMsSUFBakIsQ0FBc0I7TUFBQSxjQUFBLEVBQWUsSUFBQyxDQUFBLEdBQWhCO0tBQXRCO0VBREQ7O21CQUdSLEtBQUEsR0FBTyxTQUFDLEtBQUQ7QUFDTCxXQUFPLENBQUEsQ0FBRSxhQUFGLENBQWdCLENBQUMsSUFBakIsQ0FBc0IsS0FBdEIsQ0FBNEIsQ0FBQyxJQUE3QixDQUFxQyxJQUFDLENBQUEsR0FBRixHQUFNLEtBQU4sR0FBVyxLQUFNLENBQUEsWUFBQSxDQUFyRDtFQURGOzttQkFHUCxHQUFBLEdBQUssU0FBQyxJQUFELEVBQU8sTUFBUDtJQUNILE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBZDtBQUNBLFdBQU87RUFGSjs7bUJBSUwsS0FBQSxHQUFPLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsTUFBakI7QUFDTCxRQUFBO0FBQUE7U0FBQSxzREFBQTs7TUFDRSxJQUFDLENBQUEsR0FBRCxJQUFNO01BQ04sS0FBQSxHQUNFO1FBQUEsRUFBQSxFQUFHLElBQUksQ0FBQyxFQUFSO1FBQ0EsWUFBQSxFQUFhLElBQUksQ0FBQyxRQURsQjtRQUVBLFVBQUEsRUFBVyxJQUFJLENBQUMsR0FGaEI7O01BSUYsSUFBRyxDQUFDLE1BQUo7UUFBZ0IsSUFBQyxDQUFBLEtBQUQsR0FBUyxDQUFBLENBQUUsTUFBRixFQUF6Qjs7TUFFQSxLQUFBLEdBQVEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxJQUFDLENBQUEsTUFBRCxDQUFBLENBQUwsRUFBZ0IsSUFBQyxDQUFBLEtBQWpCO01BQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxJQUFDLENBQUEsS0FBRCxDQUFPLEtBQVAsQ0FBTCxFQUFvQixLQUFwQjtNQUtBLFFBQUEsQ0FBUyxJQUFJLENBQUMsR0FBZCxFQUFtQixJQUFJLENBQUMsRUFBeEI7TUFFQSx1Q0FBZ0IsQ0FBRSxlQUFsQjtRQUNFLElBQUMsQ0FBQSxLQUFELEdBQVM7cUJBQ1QsSUFBQyxDQUFBLEtBQUQsQ0FBTyxJQUFJLENBQUMsUUFBWixFQUFzQixRQUF0QixFQUFnQyxJQUFDLENBQUEsS0FBakMsR0FGRjtPQUFBLE1BQUE7NkJBQUE7O0FBakJGOztFQURLOzttQkFzQlAsTUFBQSxHQUFRLFNBQUMsR0FBRCxFQUFNLEVBQU47V0FDTixDQUFBLENBQUUsR0FBQSxHQUFJLEVBQU4sQ0FBVyxDQUFDLE1BQVosQ0FBbUIsR0FBbkI7RUFETSIsImZpbGUiOiJsYXlvdXQuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBcHA6OkxheW91dFxuXG4gIGNvbnN0cnVjdG9yOiAob3B0aW9ucyA9IHt9KSAtPlxuICAgIEBwb3MgPSAwXG4gICAgQGZyYW1lID0gbnVsbFxuXG4gIHBhcmVudDogKCkgLT5cbiAgICByZXR1cm4gJChcIjxhcnRpY2xlIC8+XCIpLmF0dHIoJ2RhdGEtYXJ0aWNsZSc6QHBvcylcblxuICBjaGlsZDogKGF0dHJzKSAtPlxuICAgIHJldHVybiAkKFwiPHNlY3Rpb24gLz5cIikuYXR0cihhdHRycykudGV4dChcIiN7QHBvc30gOiAje2F0dHJzWydkYXRhLWxhYmVsJ119XCIpXG5cbiAgYWRkOiAoZWxlbSwgcGFyZW50KS0+XG4gICAgcGFyZW50LmFwcGVuZChlbGVtKVxuICAgIHJldHVybiBlbGVtXG5cbiAgYnVpbGQ6IChkYXRhLCBjYWxsYmFjaywgcGFyZW50KS0+XG4gICAgZm9yIGl0ZW0sIGluZGV4IGluIGRhdGFcbiAgICAgIEBwb3MrPTFcbiAgICAgIGF0dHJzID1cbiAgICAgICAgaWQ6aXRlbS5pZFxuICAgICAgICAnZGF0YS1sYWJlbCc6aXRlbS5uYXZMYWJlbFxuICAgICAgICAnZGF0YS1zcmMnOml0ZW0uc3JjXG5cbiAgICAgIGlmICFwYXJlbnQgdGhlbiBAZnJhbWUgPSAkKCdtYWluJylcblxuICAgICAgZnJhbWUgPSBAYWRkKEBwYXJlbnQoKSwgQGZyYW1lKVxuICAgICAgQGFkZChAY2hpbGQoYXR0cnMpLCBmcmFtZSlcblxuICAgICAgIyBjYWxsYmFjayBnZXRzIGFuZCByZW5kZXJzIGxvYWRpbmcgaHRtbCBwYWdlcywgZHJvcHBpbmcgdGhlbSBpbnRvIHRoZVxuICAgICAgIyBhcHByb3ByaWF0ZSBkb20gZWxlbWVudHNcbiAgICAgICNcbiAgICAgIGNhbGxiYWNrKGl0ZW0uc3JjLCBpdGVtLmlkKVxuXG4gICAgICBpZiBpdGVtLm5hdlBvaW50Py5sZW5ndGhcbiAgICAgICAgQGZyYW1lID0gZnJhbWVcbiAgICAgICAgQGJ1aWxkKGl0ZW0ubmF2UG9pbnQsIGNhbGxiYWNrLCBAZnJhbWUpXG5cbiAgcmVuZGVyOiAoZG9jLCBpZCkgLT5cbiAgICAkKFwiIyN7aWR9XCIpLmFwcGVuZChkb2MpXG5cbiJdfQ==
