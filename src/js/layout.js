Reader.prototype.Layout = (function() {
  function Layout(options) {
    this.options = options != null ? options : {};
    this.pos = 0;
    this.frame = null;
  }

  Layout.prototype.parent = function() {
    return $("<article />").attr({
      'data-article': this.pos
    });
  };

  Layout.prototype.child = function(attrs) {
    return $("<section />").attr(attrs);
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
        this.frame = $('#reader');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxheW91dC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQU0sTUFBTSxDQUFBLFNBQUUsQ0FBQTtFQUVDLGdCQUFDLE9BQUQ7SUFBQyxJQUFDLENBQUEsNEJBQUQsVUFBVztJQUN2QixJQUFDLENBQUEsR0FBRCxHQUFPO0lBQ1AsSUFBQyxDQUFBLEtBQUQsR0FBUztFQUZFOzttQkFJYixNQUFBLEdBQVEsU0FBQTtBQUNOLFdBQU8sQ0FBQSxDQUFFLGFBQUYsQ0FBZ0IsQ0FBQyxJQUFqQixDQUFzQjtNQUFBLGNBQUEsRUFBZSxJQUFDLENBQUEsR0FBaEI7S0FBdEI7RUFERDs7bUJBR1IsS0FBQSxHQUFPLFNBQUMsS0FBRDtBQUNMLFdBQU8sQ0FBQSxDQUFFLGFBQUYsQ0FBZ0IsQ0FBQyxJQUFqQixDQUFzQixLQUF0QjtFQURGOzttQkFHUCxHQUFBLEdBQUssU0FBQyxJQUFELEVBQU8sTUFBUDtJQUNILE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBZDtBQUNBLFdBQU87RUFGSjs7bUJBSUwsS0FBQSxHQUFPLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsTUFBakI7QUFDTCxRQUFBO0FBQUE7U0FBQSxzREFBQTs7TUFDRSxJQUFDLENBQUEsR0FBRCxJQUFNO01BQ04sS0FBQSxHQUNFO1FBQUEsRUFBQSxFQUFHLElBQUksQ0FBQyxFQUFSO1FBQ0EsWUFBQSxFQUFhLElBQUksQ0FBQyxRQURsQjtRQUVBLFVBQUEsRUFBVyxJQUFJLENBQUMsR0FGaEI7O01BSUYsSUFBRyxDQUFDLE1BQUo7UUFBZ0IsSUFBQyxDQUFBLEtBQUQsR0FBUyxDQUFBLENBQUUsU0FBRixFQUF6Qjs7TUFFQSxLQUFBLEdBQVEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxJQUFDLENBQUEsTUFBRCxDQUFBLENBQUwsRUFBZ0IsSUFBQyxDQUFBLEtBQWpCO01BQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxJQUFDLENBQUEsS0FBRCxDQUFPLEtBQVAsQ0FBTCxFQUFvQixLQUFwQjtNQUtBLFFBQUEsQ0FBUyxJQUFJLENBQUMsR0FBZCxFQUFtQixJQUFJLENBQUMsRUFBeEI7TUFFQSx1Q0FBZ0IsQ0FBRSxlQUFsQjtRQUNFLElBQUMsQ0FBQSxLQUFELEdBQVM7cUJBQ1QsSUFBQyxDQUFBLEtBQUQsQ0FBTyxJQUFJLENBQUMsUUFBWixFQUFzQixRQUF0QixFQUFnQyxJQUFDLENBQUEsS0FBakMsR0FGRjtPQUFBLE1BQUE7NkJBQUE7O0FBakJGOztFQURLOzttQkFzQlAsTUFBQSxHQUFRLFNBQUMsR0FBRCxFQUFNLEVBQU47V0FDTixDQUFBLENBQUUsR0FBQSxHQUFJLEVBQU4sQ0FBVyxDQUFDLE1BQVosQ0FBbUIsR0FBbkI7RUFETSIsImZpbGUiOiJsYXlvdXQuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBSZWFkZXI6OkxheW91dFxuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMgPSB7fSkgLT5cbiAgICBAcG9zID0gMFxuICAgIEBmcmFtZSA9IG51bGxcblxuICBwYXJlbnQ6ICgpIC0+XG4gICAgcmV0dXJuICQoXCI8YXJ0aWNsZSAvPlwiKS5hdHRyKCdkYXRhLWFydGljbGUnOkBwb3MpXG5cbiAgY2hpbGQ6IChhdHRycykgLT5cbiAgICByZXR1cm4gJChcIjxzZWN0aW9uIC8+XCIpLmF0dHIoYXR0cnMpXG5cbiAgYWRkOiAoZWxlbSwgcGFyZW50KS0+XG4gICAgcGFyZW50LmFwcGVuZChlbGVtKVxuICAgIHJldHVybiBlbGVtXG5cbiAgYnVpbGQ6IChkYXRhLCBjYWxsYmFjaywgcGFyZW50KS0+XG4gICAgZm9yIGl0ZW0sIGluZGV4IGluIGRhdGFcbiAgICAgIEBwb3MrPTFcbiAgICAgIGF0dHJzID1cbiAgICAgICAgaWQ6aXRlbS5pZFxuICAgICAgICAnZGF0YS1sYWJlbCc6aXRlbS5uYXZMYWJlbFxuICAgICAgICAnZGF0YS1zcmMnOml0ZW0uc3JjXG5cbiAgICAgIGlmICFwYXJlbnQgdGhlbiBAZnJhbWUgPSAkKCcjcmVhZGVyJylcblxuICAgICAgZnJhbWUgPSBAYWRkKEBwYXJlbnQoKSwgQGZyYW1lKVxuICAgICAgQGFkZChAY2hpbGQoYXR0cnMpLCBmcmFtZSlcblxuICAgICAgIyBjYWxsYmFjayBnZXRzIGFuZCByZW5kZXJzIGxvYWRpbmcgaHRtbCBwYWdlcywgZHJvcHBpbmcgdGhlbSBpbnRvIHRoZVxuICAgICAgIyBhcHByb3ByaWF0ZSBkb20gZWxlbWVudHNcbiAgICAgICNcbiAgICAgIGNhbGxiYWNrKGl0ZW0uc3JjLCBpdGVtLmlkKVxuXG4gICAgICBpZiBpdGVtLm5hdlBvaW50Py5sZW5ndGhcbiAgICAgICAgQGZyYW1lID0gZnJhbWVcbiAgICAgICAgQGJ1aWxkKGl0ZW0ubmF2UG9pbnQsIGNhbGxiYWNrLCBAZnJhbWUpXG5cbiAgcmVuZGVyOiAoZG9jLCBpZCkgLT5cbiAgICAkKFwiIyN7aWR9XCIpLmFwcGVuZChkb2MpXG5cbiJdfQ==
