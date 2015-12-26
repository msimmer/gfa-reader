var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Reader.prototype.Parse = (function() {
  var trim;

  function Parse(options) {
    this.options = options != null ? options : {};
    this.mapNcx = bind(this.mapNcx, this);
    this.xml = bind(this.xml, this);
  }

  trim = function(val) {
    return val.replace(/^[#@]/, '');
  };

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

//# sourceMappingURL=data:application/json;base64,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QVUsQ0FBQyxFQUFwQjtRQUNBLFNBQUEsRUFBVyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBRDNCO1FBSUEsUUFBQSxFQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBSmhDO1FBS0EsR0FBQSxFQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBTDdCOztNQU1GLHVDQUFnQixDQUFFLGVBQWxCO1FBQ0UsR0FBRyxDQUFDLFFBQUosR0FBZSxJQUFDLENBQUEsTUFBRCxDQUFRLElBQUksQ0FBQyxRQUFiLEVBRGpCOztNQUVBLEdBQUcsQ0FBQyxJQUFKLENBQVMsR0FBVDtBQVZGO0FBV0EsV0FBTztFQWJEIiwiZmlsZSI6InBhcnNlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUmVhZGVyOjpQYXJzZVxuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMgPSB7fSkgLT5cblxuICB0cmltID0gKHZhbCktPlxuICAgIHZhbC5yZXBsYWNlKC9eWyNAXS8sICcnKVxuXG4gIHhtbDogKGRhdGEsIGNhbGxiYWNrKSA9PlxuICAgIG9iaiA9IHt9XG4gICAgaWYgZGF0YS5ub2RlVHlwZSA9PSAxXG4gICAgICAjIGVsZW1lbnRcbiAgICAgICMgZG8gYXR0cmlidXRlc1xuICAgICAgaWYgZGF0YS5hdHRyaWJ1dGVzLmxlbmd0aCA+IDBcbiAgICAgICAgb2JqWydhdHRyaWJ1dGVzJ10gPSB7fVxuICAgICAgICBqID0gMFxuICAgICAgICB3aGlsZSBqIDwgZGF0YS5hdHRyaWJ1dGVzLmxlbmd0aFxuICAgICAgICAgIGF0dHJpYnV0ZSA9IGRhdGEuYXR0cmlidXRlcy5pdGVtKGopXG4gICAgICAgICAgbm9kZU5hbWUgPSB0cmltKGF0dHJpYnV0ZS5ub2RlTmFtZSlcbiAgICAgICAgICBvYmpbJ2F0dHJpYnV0ZXMnXVtub2RlTmFtZV0gPSBhdHRyaWJ1dGUubm9kZVZhbHVlXG4gICAgICAgICAgaWYgY2FsbGJhY2sgYW5kIHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICBjYWxsYmFjayhub2RlTmFtZSwgYXR0cmlidXRlLm5vZGVWYWx1ZSwgZGF0YSlcbiAgICAgICAgICBqKytcbiAgICBlbHNlIGlmIGRhdGEubm9kZVR5cGUgPT0gM1xuICAgICAgIyB0ZXh0XG4gICAgICBvYmogPSBkYXRhLm5vZGVWYWx1ZVxuICAgICMgZG8gY2hpbGRyZW5cbiAgICBpZiBkYXRhLmhhc0NoaWxkTm9kZXMoKVxuICAgICAgaSA9IDBcbiAgICAgIHdoaWxlIGkgPCBkYXRhLmNoaWxkTm9kZXMubGVuZ3RoXG4gICAgICAgIGl0ZW0gPSBkYXRhLmNoaWxkTm9kZXMuaXRlbShpKVxuICAgICAgICBub2RlTmFtZSA9IHRyaW0oaXRlbS5ub2RlTmFtZSlcbiAgICAgICAgaWYgdHlwZW9mIG9ialtub2RlTmFtZV0gPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgICBvYmpbbm9kZU5hbWVdID0gQHhtbChpdGVtLCBjYWxsYmFjaylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGlmIHR5cGVvZiBvYmpbbm9kZU5hbWVdLnB1c2ggPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgIG9sZCA9IG9ialtub2RlTmFtZV1cbiAgICAgICAgICAgIG9ialtub2RlTmFtZV0gPSBbXVxuICAgICAgICAgICAgb2JqW25vZGVOYW1lXS5wdXNoIG9sZFxuICAgICAgICAgIG9ialtub2RlTmFtZV0ucHVzaCBAeG1sKGl0ZW0sIGNhbGxiYWNrKVxuICAgICAgICBpKytcbiAgICBvYmpcblxuICBuYXY6IChyZXNwKS0+XG4gICAgcmVzID0gZGF0YSA9IEB4bWwocmVzcCkubmN4XG4gICAgaWYgZGF0YS5sZW5ndGggPiAxXG4gICAgICBmb3IgaXRlbSBpbiBkYXRhXG4gICAgICAgIGlmIC9odHRwOlxcL1xcL3d3d1xcLmRhaXN5XFwub3JnXFwvejM5ODZcXC8yMDA1XFwvbmN4XFwvPy8udGVzdChpdGVtLmF0dHJpYnV0ZXM/LnhtbG5zKVxuICAgICAgICAgIHJlcyA9IGl0ZW1cbiAgICAgICAgICBicmVha1xuICAgIHJldHVybiByZXNcblxuICBtYXBOY3g6IChhcnIpPT5cbiAgICBtYXAgPSBbXVxuICAgIGZvciBpdGVtIGluIGFyclxuICAgICAgb2JqID1cbiAgICAgICAgaWQ6IGl0ZW0uYXR0cmlidXRlcy5pZFxuICAgICAgICBwbGF5T3JkZXI6IGl0ZW0uYXR0cmlidXRlcy5wbGF5T3JkZXJcblxuICAgICAgICAjIFRPRE8gY2xlYW4gd2hpdGVzcGFjZSwgcmVkdWNlIGFycmF5XG4gICAgICAgIG5hdkxhYmVsOiBpdGVtLm5hdkxhYmVsLnRleHRbMV0udGV4dFxuICAgICAgICBzcmM6IGl0ZW0uY29udGVudC5hdHRyaWJ1dGVzLnNyY1xuICAgICAgaWYgaXRlbS5uYXZQb2ludD8ubGVuZ3RoXG4gICAgICAgIG9iai5uYXZQb2ludCA9IEBtYXBOY3goaXRlbS5uYXZQb2ludClcbiAgICAgIG1hcC5wdXNoIG9ialxuICAgIHJldHVybiBtYXBcblxuXG5cblxuXG4iXX0=
