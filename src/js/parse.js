var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

App.prototype.Parse = (function() {
  var trim;

  trim = function(val) {
    return val.replace(/^[#@]/, '');
  };

  function Parse(options) {
    if (options == null) {
      options = {};
    }
    this.mapNcx = bind(this.mapNcx, this);
    this.xml = bind(this.xml, this);
  }

  Parse.prototype.xml = function(data, callback) {
    var attribute, i, item, j, nodeName, obj, old;
    obj = {};
    if (data.nodeType === 1) {
      if (data.attributes.length > 0) {
        obj['attributes'] = {};
        j = 0;
        while (j < data.attributes.length) {
          attribute = data.attributes.item(j);
          nodeName = trim(attribute.nodeName);
          obj['attributes'][nodeName] = attribute.nodeValue;
          if (callback && typeof callback === 'function') {
            callback(nodeName, attribute.nodeValue, data);
          }
          j++;
        }
      }
    } else if (data.nodeType === 3) {
      obj = data.nodeValue;
    }
    if (data.hasChildNodes()) {
      i = 0;
      while (i < data.childNodes.length) {
        item = data.childNodes.item(i);
        nodeName = trim(item.nodeName);
        if (typeof obj[nodeName] === 'undefined') {
          obj[nodeName] = this.xml(item, callback);
        } else {
          if (typeof obj[nodeName].push === 'undefined') {
            old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(this.xml(item, callback));
        }
        i++;
      }
    }
    return obj;
  };

  Parse.prototype.nav = function(resp) {
    var data, item, k, len, ref, res;
    res = data = this.xml(resp).ncx;
    if (data.length > 1) {
      for (k = 0, len = data.length; k < len; k++) {
        item = data[k];
        if (/http:\/\/www\.daisy\.org\/z3986\/2005\/ncx\/?/.test((ref = item.attributes) != null ? ref.xmlns : void 0)) {
          res = item;
          break;
        }
      }
    }
    return res;
  };

  Parse.prototype.mapNcx = function(arr) {
    var item, k, len, map, obj, ref;
    map = [];
    for (k = 0, len = arr.length; k < len; k++) {
      item = arr[k];
      obj = {
        id: item.attributes.id,
        playOrder: item.attributes.playOrder,
        navLabel: item.navLabel.text[1].text,
        src: item.content.attributes.src
      };
      if ((ref = item.navPoint) != null ? ref.length : void 0) {
        obj.navPoint = this.mapNcx(item.navPoint);
      }
      map.push(obj);
    }
    return map;
  };

  return Parse;

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBOztBQUFNLEdBQUcsQ0FBQSxTQUFFLENBQUE7QUFFVCxNQUFBOztFQUFBLElBQUEsR0FBTyxTQUFDLEdBQUQ7V0FDTCxHQUFHLENBQUMsT0FBSixDQUFZLE9BQVosRUFBcUIsRUFBckI7RUFESzs7RUFHTSxlQUFDLE9BQUQ7O01BQUMsVUFBVTs7OztFQUFYOztrQkFFYixHQUFBLEdBQUssU0FBQyxJQUFELEVBQU8sUUFBUDtBQUNILFFBQUE7SUFBQSxHQUFBLEdBQU07SUFDTixJQUFHLElBQUksQ0FBQyxRQUFMLEtBQWlCLENBQXBCO01BR0UsSUFBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQWhCLEdBQXlCLENBQTVCO1FBQ0UsR0FBSSxDQUFBLFlBQUEsQ0FBSixHQUFvQjtRQUNwQixDQUFBLEdBQUk7QUFDSixlQUFNLENBQUEsR0FBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQTFCO1VBQ0UsU0FBQSxHQUFZLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBaEIsQ0FBcUIsQ0FBckI7VUFDWixRQUFBLEdBQVcsSUFBQSxDQUFLLFNBQVMsQ0FBQyxRQUFmO1VBQ1gsR0FBSSxDQUFBLFlBQUEsQ0FBYyxDQUFBLFFBQUEsQ0FBbEIsR0FBOEIsU0FBUyxDQUFDO1VBQ3hDLElBQUcsUUFBQSxJQUFhLE9BQU8sUUFBUCxLQUFtQixVQUFuQztZQUNFLFFBQUEsQ0FBUyxRQUFULEVBQW1CLFNBQVMsQ0FBQyxTQUE3QixFQUF3QyxJQUF4QyxFQURGOztVQUVBLENBQUE7UUFORixDQUhGO09BSEY7S0FBQSxNQWFLLElBQUcsSUFBSSxDQUFDLFFBQUwsS0FBaUIsQ0FBcEI7TUFFSCxHQUFBLEdBQU0sSUFBSSxDQUFDLFVBRlI7O0lBSUwsSUFBRyxJQUFJLENBQUMsYUFBTCxDQUFBLENBQUg7TUFDRSxDQUFBLEdBQUk7QUFDSixhQUFNLENBQUEsR0FBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQTFCO1FBQ0UsSUFBQSxHQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBaEIsQ0FBcUIsQ0FBckI7UUFDUCxRQUFBLEdBQVcsSUFBQSxDQUFLLElBQUksQ0FBQyxRQUFWO1FBQ1gsSUFBRyxPQUFPLEdBQUksQ0FBQSxRQUFBLENBQVgsS0FBd0IsV0FBM0I7VUFDRSxHQUFJLENBQUEsUUFBQSxDQUFKLEdBQWdCLElBQUMsQ0FBQSxHQUFELENBQUssSUFBTCxFQUFXLFFBQVgsRUFEbEI7U0FBQSxNQUFBO1VBR0UsSUFBRyxPQUFPLEdBQUksQ0FBQSxRQUFBLENBQVMsQ0FBQyxJQUFyQixLQUE2QixXQUFoQztZQUNFLEdBQUEsR0FBTSxHQUFJLENBQUEsUUFBQTtZQUNWLEdBQUksQ0FBQSxRQUFBLENBQUosR0FBZ0I7WUFDaEIsR0FBSSxDQUFBLFFBQUEsQ0FBUyxDQUFDLElBQWQsQ0FBbUIsR0FBbkIsRUFIRjs7VUFJQSxHQUFJLENBQUEsUUFBQSxDQUFTLENBQUMsSUFBZCxDQUFtQixJQUFDLENBQUEsR0FBRCxDQUFLLElBQUwsRUFBVyxRQUFYLENBQW5CLEVBUEY7O1FBUUEsQ0FBQTtNQVhGLENBRkY7O1dBY0E7RUFqQ0c7O2tCQW1DTCxHQUFBLEdBQUssU0FBQyxJQUFEO0FBQ0gsUUFBQTtJQUFBLEdBQUEsR0FBTSxJQUFBLEdBQU8sSUFBQyxDQUFBLEdBQUQsQ0FBSyxJQUFMLENBQVUsQ0FBQztJQUN4QixJQUFHLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBakI7QUFDRSxXQUFBLHNDQUFBOztRQUNFLElBQUcsK0NBQStDLENBQUMsSUFBaEQsc0NBQW9FLENBQUUsY0FBdEUsQ0FBSDtVQUNFLEdBQUEsR0FBTTtBQUNOLGdCQUZGOztBQURGLE9BREY7O0FBS0EsV0FBTztFQVBKOztrQkFTTCxNQUFBLEdBQVEsU0FBQyxHQUFEO0FBQ04sUUFBQTtJQUFBLEdBQUEsR0FBTTtBQUNOLFNBQUEscUNBQUE7O01BQ0UsR0FBQSxHQUNFO1FBQUEsRUFBQSxFQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBcEI7UUFDQSxTQUFBLEVBQVcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUQzQjtRQUlBLFFBQUEsRUFBVSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUpoQztRQUtBLEdBQUEsRUFBSyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUw3Qjs7TUFNRix1Q0FBZ0IsQ0FBRSxlQUFsQjtRQUNFLEdBQUcsQ0FBQyxRQUFKLEdBQWUsSUFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFJLENBQUMsUUFBYixFQURqQjs7TUFFQSxHQUFHLENBQUMsSUFBSixDQUFTLEdBQVQ7QUFWRjtBQVdBLFdBQU87RUFiRCIsImZpbGUiOiJwYXJzZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEFwcDo6UGFyc2VcblxuICB0cmltID0gKHZhbCktPlxuICAgIHZhbC5yZXBsYWNlKC9eWyNAXS8sICcnKVxuXG4gIGNvbnN0cnVjdG9yOiAob3B0aW9ucyA9IHt9KSAtPlxuXG4gIHhtbDogKGRhdGEsIGNhbGxiYWNrKSA9PlxuICAgIG9iaiA9IHt9XG4gICAgaWYgZGF0YS5ub2RlVHlwZSA9PSAxXG4gICAgICAjIGVsZW1lbnRcbiAgICAgICMgZG8gYXR0cmlidXRlc1xuICAgICAgaWYgZGF0YS5hdHRyaWJ1dGVzLmxlbmd0aCA+IDBcbiAgICAgICAgb2JqWydhdHRyaWJ1dGVzJ10gPSB7fVxuICAgICAgICBqID0gMFxuICAgICAgICB3aGlsZSBqIDwgZGF0YS5hdHRyaWJ1dGVzLmxlbmd0aFxuICAgICAgICAgIGF0dHJpYnV0ZSA9IGRhdGEuYXR0cmlidXRlcy5pdGVtKGopXG4gICAgICAgICAgbm9kZU5hbWUgPSB0cmltKGF0dHJpYnV0ZS5ub2RlTmFtZSlcbiAgICAgICAgICBvYmpbJ2F0dHJpYnV0ZXMnXVtub2RlTmFtZV0gPSBhdHRyaWJ1dGUubm9kZVZhbHVlXG4gICAgICAgICAgaWYgY2FsbGJhY2sgYW5kIHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICBjYWxsYmFjayhub2RlTmFtZSwgYXR0cmlidXRlLm5vZGVWYWx1ZSwgZGF0YSlcbiAgICAgICAgICBqKytcbiAgICBlbHNlIGlmIGRhdGEubm9kZVR5cGUgPT0gM1xuICAgICAgIyB0ZXh0XG4gICAgICBvYmogPSBkYXRhLm5vZGVWYWx1ZVxuICAgICMgZG8gY2hpbGRyZW5cbiAgICBpZiBkYXRhLmhhc0NoaWxkTm9kZXMoKVxuICAgICAgaSA9IDBcbiAgICAgIHdoaWxlIGkgPCBkYXRhLmNoaWxkTm9kZXMubGVuZ3RoXG4gICAgICAgIGl0ZW0gPSBkYXRhLmNoaWxkTm9kZXMuaXRlbShpKVxuICAgICAgICBub2RlTmFtZSA9IHRyaW0oaXRlbS5ub2RlTmFtZSlcbiAgICAgICAgaWYgdHlwZW9mIG9ialtub2RlTmFtZV0gPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgICBvYmpbbm9kZU5hbWVdID0gQHhtbChpdGVtLCBjYWxsYmFjaylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGlmIHR5cGVvZiBvYmpbbm9kZU5hbWVdLnB1c2ggPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgIG9sZCA9IG9ialtub2RlTmFtZV1cbiAgICAgICAgICAgIG9ialtub2RlTmFtZV0gPSBbXVxuICAgICAgICAgICAgb2JqW25vZGVOYW1lXS5wdXNoIG9sZFxuICAgICAgICAgIG9ialtub2RlTmFtZV0ucHVzaCBAeG1sKGl0ZW0sIGNhbGxiYWNrKVxuICAgICAgICBpKytcbiAgICBvYmpcblxuICBuYXY6IChyZXNwKS0+XG4gICAgcmVzID0gZGF0YSA9IEB4bWwocmVzcCkubmN4XG4gICAgaWYgZGF0YS5sZW5ndGggPiAxXG4gICAgICBmb3IgaXRlbSBpbiBkYXRhXG4gICAgICAgIGlmIC9odHRwOlxcL1xcL3d3d1xcLmRhaXN5XFwub3JnXFwvejM5ODZcXC8yMDA1XFwvbmN4XFwvPy8udGVzdChpdGVtLmF0dHJpYnV0ZXM/LnhtbG5zKVxuICAgICAgICAgIHJlcyA9IGl0ZW1cbiAgICAgICAgICBicmVha1xuICAgIHJldHVybiByZXNcblxuICBtYXBOY3g6IChhcnIpPT5cbiAgICBtYXAgPSBbXVxuICAgIGZvciBpdGVtIGluIGFyclxuICAgICAgb2JqID1cbiAgICAgICAgaWQ6IGl0ZW0uYXR0cmlidXRlcy5pZFxuICAgICAgICBwbGF5T3JkZXI6IGl0ZW0uYXR0cmlidXRlcy5wbGF5T3JkZXJcblxuICAgICAgICAjIFRPRE8gY2xlYW4gd2hpdGVzcGFjZSwgcmVkdWNlIGFycmF5XG4gICAgICAgIG5hdkxhYmVsOiBpdGVtLm5hdkxhYmVsLnRleHRbMV0udGV4dFxuICAgICAgICBzcmM6IGl0ZW0uY29udGVudC5hdHRyaWJ1dGVzLnNyY1xuICAgICAgaWYgaXRlbS5uYXZQb2ludD8ubGVuZ3RoXG4gICAgICAgIG9iai5uYXZQb2ludCA9IEBtYXBOY3goaXRlbS5uYXZQb2ludClcbiAgICAgIG1hcC5wdXNoIG9ialxuICAgIHJldHVybiBtYXBcblxuXG5cblxuXG4iXX0=
