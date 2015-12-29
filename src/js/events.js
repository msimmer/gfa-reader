Reader.prototype.Events = (function() {
  var colGap, columns, currSpread, defaults, elemPos, frame, frameMap, frameWidth, isScrolling, maxLen, maxScroll, minScroll, navbar, offset, prevPos, triggeredScroll;

  isScrolling = false;

  triggeredScroll = false;

  minScroll = -12;

  maxScroll = 12;

  offset = 15;

  elemPos = null;

  prevPos = null;

  currSpread = null;

  maxLen = null;

  colGap = null;

  frameWidth = null;

  frame = null;

  navbar = null;

  columns = [];

  frameMap = [];

  defaults = {
    reader: '#reader-frame',
    docNav: '#doc-nav',
    navToggle: '[data-nav=contents]',
    chBack: '[data-nav=chBack]',
    chFwd: '[data-nav=chFwd]',
    pgBack: '[data-nav=pgBack]',
    pgFwd: '[data-nav=pgFwd]',
    speed: 400
  };

  function Events(options) {
    if (options == null) {
      options = {};
    }
    this.settings = $.extend({}, options, defaults);
    frame = $(this.settings.reader);
    navbar = $(this.settings.docNav);
    this.nextPage = function(callback) {
      return this.scrollPage(null, 1, callback);
    };
    this.prevPage = function(callback) {
      return this.scrollPage(null, -1, callback);
    };
  }

  Events.prototype.preventDefault = function(e) {
    if (e && e.originalEvent) {
      e.preventDefault();
      return e.stopPropagation();
    }
  };

  Events.prototype.debounce = function(func, wait, immediate) {
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

  Events.prototype.setColGap = function() {
    return colGap = parseInt(frame.css('column-gap'), 10);
  };

  Events.prototype.setFrameWidth = function() {
    return frameWidth = frame.width();
  };

  Events.prototype.closestPos = function(num, arr) {
    var currIdx, currPos, diff, idx, item1, item2, j, k, len, len1, newdiff, ref, val;
    currPos = 0;
    currIdx = 0;
    diff = Math.abs(num - currPos);
    for (idx = j = 0, len = arr.length; j < len; idx = ++j) {
      item1 = arr[idx];
      ref = arr[idx];
      for (val = k = 0, len1 = ref.length; k < len1; val = ++k) {
        item2 = ref[val];
        newdiff = Math.abs(num - arr[idx][val]);
        if (newdiff < diff) {
          diff = newdiff;
          currPos = arr[idx][val];
          currIdx = idx;
        }
      }
    }
    return {
      idx: currIdx,
      pos: currPos
    };
  };

  Events.prototype.returnToPos = function() {
    var closest;
    closest = this.closestPos(frame.scrollLeft(), frameMap);
    this.prepareScroll();
    return this.animateScroll(closest.pos, null, closest.idx);
  };

  Events.prototype.mapColumns = function() {
    var screenW;
    frameMap = [];
    maxLen = 0;
    screenW = 0;
    columns.map((function(_this) {
      return function(cols, idx) {
        var i, j, panels, ref, result;
        result = [];
        maxLen += cols;
        if (cols === 1) {
          result.push(screenW);
          screenW += frameWidth / 2 + colGap - offset * 1.5;
        } else if (cols >= 2) {
          panels = Math.ceil(cols / 2);
          for (i = j = 1, ref = panels; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
            result.push(screenW);
            screenW += frameWidth + colGap;
          }
        }
        return frameMap[idx] = result;
      };
    })(this));
    return maxLen = Math.floor(maxLen / 2);
  };

  Events.prototype.setArticlePos = function() {
    var articles;
    articles = $('[data-article]');
    elemPos = 0;
    prevPos = 0;
    columns = [];
    return articles.each((function(_this) {
      return function(i, el) {
        var marker, pagePos, pageWidth, reader, readerOffset;
        el = $(el);
        el.append('<span class="mrk"/>');
        marker = $('.mrk');
        reader = {
          width: frameWidth,
          left: frame.offset().left,
          scrollPos: frame.scrollLeft()
        };
        readerOffset = reader.left * 2;
        pageWidth = reader.width / 2 + reader.left;
        pagePos = (reader.scrollPos + marker.offset().left) - readerOffset + pageWidth;
        elemPos = prevPos || 0;
        prevPos = pagePos < 0 ? 0 : pagePos;
        columns.push(Math.ceil((prevPos - elemPos) / pageWidth));
        el.attr('data-offset-left', elemPos);
        marker.remove();
        if (i === articles.length - 1) {
          _this.mapColumns();
          return setTimeout(function() {
            return _this.returnToPos();
          }, 0);
        }
      };
    })(this));
  };

  Events.prototype.bindElems = function() {
    $(document).on('keydown', (function(_this) {
      return function(e) {
        return _this.keyPress(e);
      };
    })(this));
    $(document).on('click', '.doc-link', (function(_this) {
      return function(e) {
        return _this.scrollChapter(e);
      };
    })(this));
    $(this.settings.navToggle).on('click', (function(_this) {
      return function(e) {
        return _this.toggleNav(e);
      };
    })(this));
    $(this.settings.chFwd).on('click', (function(_this) {
      return function(e) {
        return _this.scrollChapter(e, 1);
      };
    })(this));
    $(this.settings.chBack).on('click', (function(_this) {
      return function(e) {
        return _this.scrollChapter(e, -1);
      };
    })(this));
    $(this.settings.pgFwd).on('click', (function(_this) {
      return function(e) {
        return _this.scrollPage(e, 1);
      };
    })(this));
    return $(this.settings.pgBack).on('click', (function(_this) {
      return function(e) {
        return _this.scrollPage(e, -1);
      };
    })(this));
  };

  Events.prototype.prepareScroll = function(e) {
    this.preventDefault(e);
    if (isScrolling) {
      frame.stop(true, true);
    }
    return isScrolling = true;
  };

  Events.prototype.scrollPage = function(e, pos, callback) {
    var currLeft, dest, dist;
    this.prepareScroll(e);
    dist = frameWidth;
    currLeft = frame.scrollLeft();
    dest = (dist * pos) + currLeft + (colGap * pos);
    return this.animateScroll(dest, callback, pos);
  };

  Events.prototype.scrollChapter = function(e, callback) {
    var dest, target;
    this.prepareScroll(e);
    target = $("#" + ($(e.target).attr('data-link')));
    dest = target.attr('data-offset-left');
    return this.animateScroll(dest, callback);
  };

  Events.prototype.animateScroll = function(dest, callback, pos) {
    this.closeNav();
    return frame.stop(true, true).animate({
      scrollLeft: dest
    }, (function(_this) {
      return function() {
        var idx;
        isScrolling = false;
        idx = parseInt("" + (currSpread + pos), 10);
        currSpread = idx < 0 ? 0 : idx > maxLen ? maxLen : idx;
        if (callback && typeof callback === 'function') {
          return callback();
        }
      };
    })(this));
  };

  Events.prototype.closeNav = function() {
    return navbar.removeClass('active');
  };

  Events.prototype.keyPress = function(e) {
    if (e && e.which) {
      switch (e.which) {
        case 27:
          return this.closeNav();
        case 37:
          return this.scrollPage(e, -1);
        case 39:
          return this.scrollPage(e, 1);
      }
    }
  };

  Events.prototype.toggleNav = function(e) {
    this.preventDefault(e);
    return navbar.toggleClass('active');
  };

  Events.prototype.initialize = function() {
    this.setFrameWidth();
    this.setColGap();
    this.setArticlePos();
    return this.bindElems();
  };

  return Events;

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV2ZW50cy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQU0sTUFBTSxDQUFBLFNBQUUsQ0FBQTtBQUVaLE1BQUE7O0VBQUEsV0FBQSxHQUFrQjs7RUFDbEIsZUFBQSxHQUFrQjs7RUFDbEIsU0FBQSxHQUFrQixDQUFDOztFQUNuQixTQUFBLEdBQWtCOztFQUNsQixNQUFBLEdBQWtCOztFQUNsQixPQUFBLEdBQWtCOztFQUNsQixPQUFBLEdBQWtCOztFQUNsQixVQUFBLEdBQWtCOztFQUNsQixNQUFBLEdBQWtCOztFQUVsQixNQUFBLEdBQWtCOztFQUNsQixVQUFBLEdBQWtCOztFQUVsQixLQUFBLEdBQWtCOztFQUNsQixNQUFBLEdBQWtCOztFQUVsQixPQUFBLEdBQWtCOztFQUNsQixRQUFBLEdBQWtCOztFQUVsQixRQUFBLEdBQ0U7SUFBQSxNQUFBLEVBQVksZUFBWjtJQUNBLE1BQUEsRUFBWSxVQURaO0lBRUEsU0FBQSxFQUFZLHFCQUZaO0lBR0EsTUFBQSxFQUFZLG1CQUhaO0lBSUEsS0FBQSxFQUFZLGtCQUpaO0lBS0EsTUFBQSxFQUFZLG1CQUxaO0lBTUEsS0FBQSxFQUFZLGtCQU5aO0lBT0EsS0FBQSxFQUFZLEdBUFo7OztFQVNXLGdCQUFDLE9BQUQ7O01BQUMsVUFBVTs7SUFFdEIsSUFBQyxDQUFBLFFBQUQsR0FBWSxDQUFDLENBQUMsTUFBRixDQUFTLEVBQVQsRUFBYSxPQUFiLEVBQXNCLFFBQXRCO0lBQ1osS0FBQSxHQUFZLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVo7SUFDWixNQUFBLEdBQVksQ0FBQSxDQUFFLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBWjtJQUlaLElBQUMsQ0FBQSxRQUFELEdBQVksU0FBQyxRQUFEO2FBQWMsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFaLEVBQWtCLENBQWxCLEVBQXFCLFFBQXJCO0lBQWQ7SUFDWixJQUFDLENBQUEsUUFBRCxHQUFZLFNBQUMsUUFBRDthQUFjLElBQUMsQ0FBQSxVQUFELENBQVksSUFBWixFQUFrQixDQUFDLENBQW5CLEVBQXNCLFFBQXRCO0lBQWQ7RUFURDs7bUJBWWIsY0FBQSxHQUFlLFNBQUMsQ0FBRDtJQUNiLElBQUcsQ0FBQSxJQUFNLENBQUMsQ0FBQyxhQUFYO01BQ0UsQ0FBQyxDQUFDLGNBQUYsQ0FBQTthQUNBLENBQUMsQ0FBQyxlQUFGLENBQUEsRUFGRjs7RUFEYTs7bUJBS2YsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxTQUFiO0FBQ1IsUUFBQTtJQUFBLE9BQUEsR0FBVTtXQUNWLFNBQUE7QUFDRSxVQUFBO01BQUEsT0FBQSxHQUFVO01BQ1YsSUFBQSxHQUFPO01BQ1AsS0FBQSxHQUFRLFNBQUE7UUFDTixPQUFBLEdBQVU7UUFDVixJQUFHLENBQUMsU0FBSjtpQkFDRSxJQUFJLENBQUMsS0FBTCxDQUFXLE9BQVgsRUFBb0IsSUFBcEIsRUFERjs7TUFGTTtNQUlSLE9BQUEsR0FBVSxTQUFBLElBQWMsQ0FBQztNQUN6QixZQUFBLENBQWEsT0FBYjtNQUNBLE9BQUEsR0FBVSxVQUFBLENBQVcsS0FBWCxFQUFrQixJQUFsQjtNQUNWLElBQUcsT0FBSDtlQUNFLElBQUksQ0FBQyxLQUFMLENBQVcsT0FBWCxFQUFvQixJQUFwQixFQURGOztJQVZGO0VBRlE7O21CQWVWLFNBQUEsR0FBVSxTQUFBO1dBQ1IsTUFBQSxHQUFTLFFBQUEsQ0FBUyxLQUFLLENBQUMsR0FBTixDQUFVLFlBQVYsQ0FBVCxFQUFrQyxFQUFsQztFQUREOzttQkFHVixhQUFBLEdBQWMsU0FBQTtXQUNaLFVBQUEsR0FBYSxLQUFLLENBQUMsS0FBTixDQUFBO0VBREQ7O21CQUdkLFVBQUEsR0FBWSxTQUFDLEdBQUQsRUFBTSxHQUFOO0FBQ1YsUUFBQTtJQUFBLE9BQUEsR0FBVTtJQUNWLE9BQUEsR0FBVTtJQUNWLElBQUEsR0FBTyxJQUFJLENBQUMsR0FBTCxDQUFTLEdBQUEsR0FBTSxPQUFmO0FBQ1AsU0FBQSxpREFBQTs7QUFDRTtBQUFBLFdBQUEsbURBQUE7O1FBQ0UsT0FBQSxHQUFVLElBQUksQ0FBQyxHQUFMLENBQVMsR0FBQSxHQUFNLEdBQUksQ0FBQSxHQUFBLENBQUssQ0FBQSxHQUFBLENBQXhCO1FBQ1YsSUFBSSxPQUFBLEdBQVUsSUFBZDtVQUNFLElBQUEsR0FBTztVQUNQLE9BQUEsR0FBVSxHQUFJLENBQUEsR0FBQSxDQUFLLENBQUEsR0FBQTtVQUNuQixPQUFBLEdBQVUsSUFIWjs7QUFGRjtBQURGO0FBT0EsV0FBTztNQUFDLEdBQUEsRUFBSyxPQUFOO01BQWUsR0FBQSxFQUFLLE9BQXBCOztFQVhHOzttQkFhWixXQUFBLEdBQVksU0FBQTtBQUNWLFFBQUE7SUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFVBQUQsQ0FBWSxLQUFLLENBQUMsVUFBTixDQUFBLENBQVosRUFBZ0MsUUFBaEM7SUFDVixJQUFDLENBQUEsYUFBRCxDQUFBO1dBQ0EsSUFBQyxDQUFBLGFBQUQsQ0FBZSxPQUFPLENBQUMsR0FBdkIsRUFBNEIsSUFBNUIsRUFBa0MsT0FBTyxDQUFDLEdBQTFDO0VBSFU7O21CQUtaLFVBQUEsR0FBVyxTQUFBO0FBQ1QsUUFBQTtJQUFBLFFBQUEsR0FBVztJQUNYLE1BQUEsR0FBUztJQUNULE9BQUEsR0FBVTtJQUNWLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLElBQUQsRUFBTyxHQUFQO0FBRVYsWUFBQTtRQUFBLE1BQUEsR0FBUztRQUNULE1BQUEsSUFBVTtRQUVWLElBQUcsSUFBQSxLQUFRLENBQVg7VUFDRSxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQVo7VUFDQSxPQUFBLElBQVcsVUFBQSxHQUFhLENBQWIsR0FBaUIsTUFBakIsR0FBMEIsTUFBQSxHQUFTLElBRmhEO1NBQUEsTUFJSyxJQUFHLElBQUEsSUFBUSxDQUFYO1VBQ0gsTUFBQSxHQUFTLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBQSxHQUFLLENBQWY7QUFDVCxlQUFTLGlGQUFUO1lBQ0UsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFaO1lBQ0EsT0FBQSxJQUFXLFVBQUEsR0FBYTtBQUYxQixXQUZHOztlQU1MLFFBQVMsQ0FBQSxHQUFBLENBQVQsR0FBZ0I7TUFmTjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWjtXQWdCQSxNQUFBLEdBQVMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFBLEdBQU8sQ0FBbEI7RUFwQkE7O21CQXNCWCxhQUFBLEdBQWMsU0FBQTtBQUNaLFFBQUE7SUFBQSxRQUFBLEdBQVcsQ0FBQSxDQUFFLGdCQUFGO0lBQ1gsT0FBQSxHQUFVO0lBQ1YsT0FBQSxHQUFVO0lBQ1YsT0FBQSxHQUFVO1dBQ1YsUUFBUSxDQUFDLElBQVQsQ0FBYyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRCxFQUFJLEVBQUo7QUFDWixZQUFBO1FBQUEsRUFBQSxHQUFLLENBQUEsQ0FBRSxFQUFGO1FBQ0wsRUFBRSxDQUFDLE1BQUgsQ0FBVSxxQkFBVjtRQUNBLE1BQUEsR0FBUyxDQUFBLENBQUUsTUFBRjtRQUVULE1BQUEsR0FDRTtVQUFBLEtBQUEsRUFBTyxVQUFQO1VBQ0EsSUFBQSxFQUFNLEtBQUssQ0FBQyxNQUFOLENBQUEsQ0FBYyxDQUFDLElBRHJCO1VBRUEsU0FBQSxFQUFXLEtBQUssQ0FBQyxVQUFOLENBQUEsQ0FGWDs7UUFLRixZQUFBLEdBQWUsTUFBTSxDQUFDLElBQVAsR0FBYztRQUU3QixTQUFBLEdBQVksTUFBTSxDQUFDLEtBQVAsR0FBZSxDQUFmLEdBQW1CLE1BQU0sQ0FBQztRQUV0QyxPQUFBLEdBQVUsQ0FBQyxNQUFNLENBQUMsU0FBUCxHQUFtQixNQUFNLENBQUMsTUFBUCxDQUFBLENBQWUsQ0FBQyxJQUFwQyxDQUFBLEdBQTRDLFlBQTVDLEdBQTJEO1FBRXJFLE9BQUEsR0FBVSxPQUFBLElBQVc7UUFDckIsT0FBQSxHQUFhLE9BQUEsR0FBVSxDQUFiLEdBQW9CLENBQXBCLEdBQTJCO1FBRXJDLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBSSxDQUFDLElBQUwsQ0FBVSxDQUFDLE9BQUEsR0FBVSxPQUFYLENBQUEsR0FBc0IsU0FBaEMsQ0FBYjtRQUVBLEVBQUUsQ0FBQyxJQUFILENBQVEsa0JBQVIsRUFBNEIsT0FBNUI7UUFDQSxNQUFNLENBQUMsTUFBUCxDQUFBO1FBRUEsSUFBRyxDQUFBLEtBQUssUUFBUSxDQUFDLE1BQVQsR0FBa0IsQ0FBMUI7VUFDRSxLQUFDLENBQUEsVUFBRCxDQUFBO2lCQUNBLFVBQUEsQ0FBVyxTQUFBO21CQUNULEtBQUMsQ0FBQSxXQUFELENBQUE7VUFEUyxDQUFYLEVBRUUsQ0FGRixFQUZGOztNQXpCWTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZDtFQUxZOzttQkFvQ2QsU0FBQSxHQUFVLFNBQUE7SUFDUixDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsRUFBWixDQUFlLFNBQWYsRUFBMEIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQ7ZUFBa0IsS0FBQyxDQUFBLFFBQUQsQ0FBVSxDQUFWO01BQWxCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQjtJQUNBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxFQUFaLENBQWUsT0FBZixFQUF3QixXQUF4QixFQUFxQyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFPLEtBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZjtNQUFQO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQztJQUNBLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVosQ0FBc0IsQ0FBQyxFQUF2QixDQUEwQixPQUExQixFQUFtQyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFTLEtBQUMsQ0FBQSxTQUFELENBQVcsQ0FBWDtNQUFUO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQztJQUNBLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBUSxDQUFDLEtBQVosQ0FBa0IsQ0FBQyxFQUFuQixDQUFzQixPQUF0QixFQUErQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFhLEtBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZixFQUFrQixDQUFsQjtNQUFiO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQjtJQUNBLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVosQ0FBbUIsQ0FBQyxFQUFwQixDQUF1QixPQUF2QixFQUFnQyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFZLEtBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZixFQUFrQixDQUFDLENBQW5CO01BQVo7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhDO0lBQ0EsQ0FBQSxDQUFFLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBWixDQUFrQixDQUFDLEVBQW5CLENBQXNCLE9BQXRCLEVBQStCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxDQUFEO2VBQWEsS0FBQyxDQUFBLFVBQUQsQ0FBWSxDQUFaLEVBQWUsQ0FBZjtNQUFiO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQjtXQUNBLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVosQ0FBbUIsQ0FBQyxFQUFwQixDQUF1QixPQUF2QixFQUFnQyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFZLEtBQUMsQ0FBQSxVQUFELENBQVksQ0FBWixFQUFlLENBQUMsQ0FBaEI7TUFBWjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEM7RUFQUTs7bUJBU1YsYUFBQSxHQUFjLFNBQUMsQ0FBRDtJQUNaLElBQUMsQ0FBQSxjQUFELENBQWdCLENBQWhCO0lBQ0EsSUFBRyxXQUFIO01BQW9CLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxFQUFnQixJQUFoQixFQUFwQjs7V0FDQSxXQUFBLEdBQWM7RUFIRjs7bUJBS2QsVUFBQSxHQUFXLFNBQUMsQ0FBRCxFQUFJLEdBQUosRUFBUyxRQUFUO0FBQ1QsUUFBQTtJQUFBLElBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZjtJQUNBLElBQUEsR0FBTztJQUNQLFFBQUEsR0FBVyxLQUFLLENBQUMsVUFBTixDQUFBO0lBQ1gsSUFBQSxHQUFRLENBQUMsSUFBQSxHQUFPLEdBQVIsQ0FBQSxHQUFlLFFBQWYsR0FBMEIsQ0FBQyxNQUFBLEdBQVMsR0FBVjtXQUNsQyxJQUFDLENBQUEsYUFBRCxDQUFlLElBQWYsRUFBcUIsUUFBckIsRUFBK0IsR0FBL0I7RUFMUzs7bUJBT1gsYUFBQSxHQUFjLFNBQUMsQ0FBRCxFQUFJLFFBQUo7QUFDWixRQUFBO0lBQUEsSUFBQyxDQUFBLGFBQUQsQ0FBZSxDQUFmO0lBQ0EsTUFBQSxHQUFTLENBQUEsQ0FBRSxHQUFBLEdBQUcsQ0FBQyxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLElBQVosQ0FBaUIsV0FBakIsQ0FBRCxDQUFMO0lBQ1QsSUFBQSxHQUFPLE1BQU0sQ0FBQyxJQUFQLENBQVksa0JBQVo7V0FDUCxJQUFDLENBQUEsYUFBRCxDQUFlLElBQWYsRUFBcUIsUUFBckI7RUFKWTs7bUJBTWQsYUFBQSxHQUFjLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsR0FBakI7SUFDWixJQUFDLENBQUEsUUFBRCxDQUFBO1dBQ0EsS0FDRSxDQUFDLElBREgsQ0FDUSxJQURSLEVBQ2MsSUFEZCxDQUVFLENBQUMsT0FGSCxDQUVXO01BQUMsVUFBQSxFQUFZLElBQWI7S0FGWCxFQUUrQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7QUFDM0IsWUFBQTtRQUFBLFdBQUEsR0FBYztRQUNkLEdBQUEsR0FBTSxRQUFBLENBQVMsRUFBQSxHQUFFLENBQUMsVUFBQSxHQUFhLEdBQWQsQ0FBWCxFQUFnQyxFQUFoQztRQUNOLFVBQUEsR0FBZ0IsR0FBQSxHQUFNLENBQVQsR0FBZ0IsQ0FBaEIsR0FBMEIsR0FBQSxHQUFNLE1BQVQsR0FBcUIsTUFBckIsR0FBaUM7UUFDckUsSUFBRyxRQUFBLElBQWEsT0FBTyxRQUFQLEtBQW1CLFVBQW5DO2lCQUFtRCxRQUFBLENBQUEsRUFBbkQ7O01BSjJCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUYvQjtFQUZZOzttQkFVZCxRQUFBLEdBQVMsU0FBQTtXQUNQLE1BQU0sQ0FBQyxXQUFQLENBQW1CLFFBQW5CO0VBRE87O21CQUdULFFBQUEsR0FBUyxTQUFDLENBQUQ7SUFDUCxJQUFHLENBQUEsSUFBTSxDQUFDLENBQUMsS0FBWDtBQUNFLGNBQU8sQ0FBQyxDQUFDLEtBQVQ7QUFBQSxhQUNPLEVBRFA7aUJBQ2UsSUFBQyxDQUFBLFFBQUQsQ0FBQTtBQURmLGFBRU8sRUFGUDtpQkFFZSxJQUFDLENBQUEsVUFBRCxDQUFZLENBQVosRUFBZSxDQUFDLENBQWhCO0FBRmYsYUFHTyxFQUhQO2lCQUdlLElBQUMsQ0FBQSxVQUFELENBQVksQ0FBWixFQUFlLENBQWY7QUFIZixPQURGOztFQURPOzttQkFPVCxTQUFBLEdBQVcsU0FBQyxDQUFEO0lBQ1QsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsQ0FBaEI7V0FDQSxNQUFNLENBQUMsV0FBUCxDQUFtQixRQUFuQjtFQUZTOzttQkFJWCxVQUFBLEdBQVcsU0FBQTtJQUNULElBQUMsQ0FBQSxhQUFELENBQUE7SUFDQSxJQUFDLENBQUEsU0FBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLGFBQUQsQ0FBQTtXQUNBLElBQUMsQ0FBQSxTQUFELENBQUE7RUFKUyIsImZpbGUiOiJldmVudHMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBSZWFkZXI6OkV2ZW50c1xuXG4gIGlzU2Nyb2xsaW5nICAgICA9IGZhbHNlXG4gIHRyaWdnZXJlZFNjcm9sbCA9IGZhbHNlXG4gIG1pblNjcm9sbCAgICAgICA9IC0xMlxuICBtYXhTY3JvbGwgICAgICAgPSAxMlxuICBvZmZzZXQgICAgICAgICAgPSAxNVxuICBlbGVtUG9zICAgICAgICAgPSBudWxsXG4gIHByZXZQb3MgICAgICAgICA9IG51bGxcbiAgY3VyclNwcmVhZCAgICAgID0gbnVsbFxuICBtYXhMZW4gICAgICAgICAgPSBudWxsXG5cbiAgY29sR2FwICAgICAgICAgID0gbnVsbFxuICBmcmFtZVdpZHRoICAgICAgPSBudWxsXG5cbiAgZnJhbWUgICAgICAgICAgID0gbnVsbFxuICBuYXZiYXIgICAgICAgICAgPSBudWxsXG5cbiAgY29sdW1ucyAgICAgICAgID0gW11cbiAgZnJhbWVNYXAgICAgICAgID0gW11cblxuICBkZWZhdWx0cyA9XG4gICAgcmVhZGVyICAgIDogJyNyZWFkZXItZnJhbWUnXG4gICAgZG9jTmF2ICAgIDogJyNkb2MtbmF2J1xuICAgIG5hdlRvZ2dsZSA6ICdbZGF0YS1uYXY9Y29udGVudHNdJ1xuICAgIGNoQmFjayAgICA6ICdbZGF0YS1uYXY9Y2hCYWNrXSdcbiAgICBjaEZ3ZCAgICAgOiAnW2RhdGEtbmF2PWNoRndkXSdcbiAgICBwZ0JhY2sgICAgOiAnW2RhdGEtbmF2PXBnQmFja10nXG4gICAgcGdGd2QgICAgIDogJ1tkYXRhLW5hdj1wZ0Z3ZF0nXG4gICAgc3BlZWQgICAgIDogNDAwXG5cbiAgY29uc3RydWN0b3I6IChvcHRpb25zID0ge30pIC0+XG5cbiAgICBAc2V0dGluZ3MgPSAkLmV4dGVuZCh7fSwgb3B0aW9ucywgZGVmYXVsdHMpXG4gICAgZnJhbWUgICAgID0gJChAc2V0dGluZ3MucmVhZGVyKVxuICAgIG5hdmJhciAgICA9ICQoQHNldHRpbmdzLmRvY05hdilcblxuICAgICMgY29udmVuaWVuY2UgbWV0aG9kc1xuICAgICNcbiAgICBAbmV4dFBhZ2UgPSAoY2FsbGJhY2spIC0+IEBzY3JvbGxQYWdlKG51bGwsIDEsIGNhbGxiYWNrKVxuICAgIEBwcmV2UGFnZSA9IChjYWxsYmFjaykgLT4gQHNjcm9sbFBhZ2UobnVsbCwgLTEsIGNhbGxiYWNrKVxuXG5cbiAgcHJldmVudERlZmF1bHQ6KGUpLT5cbiAgICBpZiBlIGFuZCBlLm9yaWdpbmFsRXZlbnRcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gIGRlYm91bmNlOiAoZnVuYywgd2FpdCwgaW1tZWRpYXRlKSAtPlxuICAgIHRpbWVvdXQgPSB1bmRlZmluZWRcbiAgICAtPlxuICAgICAgY29udGV4dCA9IHRoaXNcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHNcbiAgICAgIGxhdGVyID0gLT5cbiAgICAgICAgdGltZW91dCA9IG51bGxcbiAgICAgICAgaWYgIWltbWVkaWF0ZVxuICAgICAgICAgIGZ1bmMuYXBwbHkgY29udGV4dCwgYXJnc1xuICAgICAgY2FsbE5vdyA9IGltbWVkaWF0ZSBhbmQgIXRpbWVvdXRcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KVxuICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpXG4gICAgICBpZiBjYWxsTm93XG4gICAgICAgIGZ1bmMuYXBwbHkgY29udGV4dCwgYXJnc1xuXG4gIHNldENvbEdhcDooKS0+XG4gICAgY29sR2FwID0gcGFyc2VJbnQoZnJhbWUuY3NzKCdjb2x1bW4tZ2FwJyksIDEwKVxuXG4gIHNldEZyYW1lV2lkdGg6KCktPlxuICAgIGZyYW1lV2lkdGggPSBmcmFtZS53aWR0aCgpXG5cbiAgY2xvc2VzdFBvczogKG51bSwgYXJyKSAtPlxuICAgIGN1cnJQb3MgPSAwXG4gICAgY3VycklkeCA9IDBcbiAgICBkaWZmID0gTWF0aC5hYnMobnVtIC0gY3VyclBvcylcbiAgICBmb3IgaXRlbTEsIGlkeCBpbiBhcnJcbiAgICAgIGZvciBpdGVtMiwgdmFsIGluIGFycltpZHhdXG4gICAgICAgIG5ld2RpZmYgPSBNYXRoLmFicyhudW0gLSBhcnJbaWR4XVt2YWxdKVxuICAgICAgICBpZiAobmV3ZGlmZiA8IGRpZmYpXG4gICAgICAgICAgZGlmZiA9IG5ld2RpZmZcbiAgICAgICAgICBjdXJyUG9zID0gYXJyW2lkeF1bdmFsXVxuICAgICAgICAgIGN1cnJJZHggPSBpZHhcbiAgICByZXR1cm4ge2lkeDogY3VycklkeCwgcG9zOiBjdXJyUG9zfVxuXG4gIHJldHVyblRvUG9zOigpLT5cbiAgICBjbG9zZXN0ID0gQGNsb3Nlc3RQb3MoZnJhbWUuc2Nyb2xsTGVmdCgpLCBmcmFtZU1hcClcbiAgICBAcHJlcGFyZVNjcm9sbCgpXG4gICAgQGFuaW1hdGVTY3JvbGwoY2xvc2VzdC5wb3MsIG51bGwsIGNsb3Nlc3QuaWR4KVxuXG4gIG1hcENvbHVtbnM6KCktPiAjIFRPRE86IHNldCB1cCBkaXN0YW5jZXMgZm9yIG1vYmlsZVxuICAgIGZyYW1lTWFwID0gW11cbiAgICBtYXhMZW4gPSAwXG4gICAgc2NyZWVuVyA9IDBcbiAgICBjb2x1bW5zLm1hcCAoY29scywgaWR4KT0+XG5cbiAgICAgIHJlc3VsdCA9IFtdXG4gICAgICBtYXhMZW4gKz0gY29sc1xuXG4gICAgICBpZiBjb2xzID09IDFcbiAgICAgICAgcmVzdWx0LnB1c2goc2NyZWVuVylcbiAgICAgICAgc2NyZWVuVyArPSBmcmFtZVdpZHRoIC8gMiArIGNvbEdhcCAtIG9mZnNldCAqIDEuNVxuXG4gICAgICBlbHNlIGlmIGNvbHMgPj0gMlxuICAgICAgICBwYW5lbHMgPSBNYXRoLmNlaWwoY29scy8yKVxuICAgICAgICBmb3IgaSBpbiBbMS4ucGFuZWxzXVxuICAgICAgICAgIHJlc3VsdC5wdXNoKHNjcmVlblcpXG4gICAgICAgICAgc2NyZWVuVyArPSBmcmFtZVdpZHRoICsgY29sR2FwXG5cbiAgICAgIGZyYW1lTWFwW2lkeF0gPSByZXN1bHRcbiAgICBtYXhMZW4gPSBNYXRoLmZsb29yKG1heExlbi8yKVxuXG4gIHNldEFydGljbGVQb3M6KCktPlxuICAgIGFydGljbGVzID0gJCgnW2RhdGEtYXJ0aWNsZV0nKVxuICAgIGVsZW1Qb3MgPSAwXG4gICAgcHJldlBvcyA9IDBcbiAgICBjb2x1bW5zID0gW11cbiAgICBhcnRpY2xlcy5lYWNoIChpLCBlbCkgPT5cbiAgICAgIGVsID0gJChlbClcbiAgICAgIGVsLmFwcGVuZCgnPHNwYW4gY2xhc3M9XCJtcmtcIi8+JylcbiAgICAgIG1hcmtlciA9ICQoJy5tcmsnKVxuXG4gICAgICByZWFkZXIgPVxuICAgICAgICB3aWR0aDogZnJhbWVXaWR0aFxuICAgICAgICBsZWZ0OiBmcmFtZS5vZmZzZXQoKS5sZWZ0XG4gICAgICAgIHNjcm9sbFBvczogZnJhbWUuc2Nyb2xsTGVmdCgpXG5cbiAgICAgICMgaW5uZXIgZGltcyBvZiByZWFkZXIgZWxlbWVudFxuICAgICAgcmVhZGVyT2Zmc2V0ID0gcmVhZGVyLmxlZnQgKiAyXG4gICAgICAjIHNpbmdsZSBwYWdlIHdpZHRoLCBpbmNsdWRpbmcgaW5uZXIgcGFnZSBwYWRkaW5nXG4gICAgICBwYWdlV2lkdGggPSByZWFkZXIud2lkdGggLyAyICsgcmVhZGVyLmxlZnRcbiAgICAgICMgbWFya2VyIHJlbGF0ZXMgdG8gcHJldi4gcGFnZSdzIGJlZ2lubmluZ1xuICAgICAgcGFnZVBvcyA9IChyZWFkZXIuc2Nyb2xsUG9zICsgbWFya2VyLm9mZnNldCgpLmxlZnQpIC0gcmVhZGVyT2Zmc2V0ICsgcGFnZVdpZHRoXG5cbiAgICAgIGVsZW1Qb3MgPSBwcmV2UG9zIG9yIDBcbiAgICAgIHByZXZQb3MgPSBpZiBwYWdlUG9zIDwgMCB0aGVuIDAgZWxzZSBwYWdlUG9zXG5cbiAgICAgIGNvbHVtbnMucHVzaChNYXRoLmNlaWwoKHByZXZQb3MgLSBlbGVtUG9zKSAvIHBhZ2VXaWR0aCkpXG5cbiAgICAgIGVsLmF0dHIoJ2RhdGEtb2Zmc2V0LWxlZnQnLCBlbGVtUG9zKVxuICAgICAgbWFya2VyLnJlbW92ZSgpXG5cbiAgICAgIGlmIGkgPT0gYXJ0aWNsZXMubGVuZ3RoIC0gMVxuICAgICAgICBAbWFwQ29sdW1ucygpXG4gICAgICAgIHNldFRpbWVvdXQgPT5cbiAgICAgICAgICBAcmV0dXJuVG9Qb3MoKVxuICAgICAgICAsIDBcblxuICBiaW5kRWxlbXM6KCktPlxuICAgICQoZG9jdW1lbnQpLm9uICdrZXlkb3duJywgKGUpICAgICAgICAgICAgPT4gQGtleVByZXNzKGUpXG4gICAgJChkb2N1bWVudCkub24gJ2NsaWNrJywgJy5kb2MtbGluaycsIChlKSA9PiBAc2Nyb2xsQ2hhcHRlcihlKVxuICAgICQoQHNldHRpbmdzLm5hdlRvZ2dsZSkub24gJ2NsaWNrJywgKGUpICAgPT4gQHRvZ2dsZU5hdihlKVxuICAgICQoQHNldHRpbmdzLmNoRndkKS5vbiAnY2xpY2snLCAoZSkgICAgICAgPT4gQHNjcm9sbENoYXB0ZXIoZSwgMSlcbiAgICAkKEBzZXR0aW5ncy5jaEJhY2spLm9uICdjbGljaycsIChlKSAgICAgID0+IEBzY3JvbGxDaGFwdGVyKGUsIC0xKVxuICAgICQoQHNldHRpbmdzLnBnRndkKS5vbiAnY2xpY2snLCAoZSkgICAgICAgPT4gQHNjcm9sbFBhZ2UoZSwgMSlcbiAgICAkKEBzZXR0aW5ncy5wZ0JhY2spLm9uICdjbGljaycsIChlKSAgICAgID0+IEBzY3JvbGxQYWdlKGUsIC0xKVxuXG4gIHByZXBhcmVTY3JvbGw6KGUpLT5cbiAgICBAcHJldmVudERlZmF1bHQoZSlcbiAgICBpZiBpc1Njcm9sbGluZyB0aGVuIGZyYW1lLnN0b3AodHJ1ZSx0cnVlKVxuICAgIGlzU2Nyb2xsaW5nID0gdHJ1ZVxuXG4gIHNjcm9sbFBhZ2U6KGUsIHBvcywgY2FsbGJhY2spLT5cbiAgICBAcHJlcGFyZVNjcm9sbChlKVxuICAgIGRpc3QgPSBmcmFtZVdpZHRoXG4gICAgY3VyckxlZnQgPSBmcmFtZS5zY3JvbGxMZWZ0KClcbiAgICBkZXN0ID0gIChkaXN0ICogcG9zKSArIGN1cnJMZWZ0ICsgKGNvbEdhcCAqIHBvcylcbiAgICBAYW5pbWF0ZVNjcm9sbChkZXN0LCBjYWxsYmFjaywgcG9zKVxuXG4gIHNjcm9sbENoYXB0ZXI6KGUsIGNhbGxiYWNrKS0+XG4gICAgQHByZXBhcmVTY3JvbGwoZSlcbiAgICB0YXJnZXQgPSAkKFwiIyN7JChlLnRhcmdldCkuYXR0cignZGF0YS1saW5rJyl9XCIpXG4gICAgZGVzdCA9IHRhcmdldC5hdHRyKCdkYXRhLW9mZnNldC1sZWZ0JylcbiAgICBAYW5pbWF0ZVNjcm9sbChkZXN0LCBjYWxsYmFjaylcblxuICBhbmltYXRlU2Nyb2xsOihkZXN0LCBjYWxsYmFjaywgcG9zKSAtPlxuICAgIEBjbG9zZU5hdigpXG4gICAgZnJhbWVcbiAgICAgIC5zdG9wKHRydWUsIHRydWUpXG4gICAgICAuYW5pbWF0ZSB7c2Nyb2xsTGVmdDogZGVzdH0sICgpID0+XG4gICAgICAgIGlzU2Nyb2xsaW5nID0gZmFsc2VcbiAgICAgICAgaWR4ID0gcGFyc2VJbnQoXCIje2N1cnJTcHJlYWQgKyBwb3N9XCIsIDEwKVxuICAgICAgICBjdXJyU3ByZWFkID0gaWYgaWR4IDwgMCB0aGVuIDAgZWxzZSBpZiBpZHggPiBtYXhMZW4gdGhlbiBtYXhMZW4gZWxzZSBpZHhcbiAgICAgICAgaWYgY2FsbGJhY2sgYW5kIHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nIHRoZW4gY2FsbGJhY2soKVxuXG4gIGNsb3NlTmF2OigpLT5cbiAgICBuYXZiYXIucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG5cbiAga2V5UHJlc3M6KGUpIC0+XG4gICAgaWYgZSBhbmQgZS53aGljaFxuICAgICAgc3dpdGNoIGUud2hpY2hcbiAgICAgICAgd2hlbiAyNyB0aGVuIEBjbG9zZU5hdigpXG4gICAgICAgIHdoZW4gMzcgdGhlbiBAc2Nyb2xsUGFnZShlLCAtMSlcbiAgICAgICAgd2hlbiAzOSB0aGVuIEBzY3JvbGxQYWdlKGUsIDEpXG5cbiAgdG9nZ2xlTmF2OiAoZSktPlxuICAgIEBwcmV2ZW50RGVmYXVsdChlKVxuICAgIG5hdmJhci50b2dnbGVDbGFzcygnYWN0aXZlJylcblxuICBpbml0aWFsaXplOigpLT5cbiAgICBAc2V0RnJhbWVXaWR0aCgpXG4gICAgQHNldENvbEdhcCgpXG4gICAgQHNldEFydGljbGVQb3MoKVxuICAgIEBiaW5kRWxlbXMoKVxuIl19
