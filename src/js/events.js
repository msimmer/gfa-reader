Reader.prototype.Events = (function() {
  var blockElems, blockParent, colGap, columns, currSpread, defaults, elemPos, frame, frameMap, frameWidth, isScrolling, maxLen, maxScroll, minScroll, navbar, offset, prevPos, triggeredScroll;

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
    note: 'a.fn',
    scrollSpeed: 400,
    animSpeedFast: 500,
    animSpeedSlow: 1000
  };

  blockElems = ['address', 'article', 'aside', 'blockquote', 'canvas', 'dd', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'figcaption', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'li', 'main', 'nav', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table', 'tfoot', 'ul', 'video'];

  blockParent = function(elem) {
    if (blockElems.indexOf(elem[0].nodeName.toLowerCase()) > -1) {
      return elem;
    } else {
      return blockParent(elem.parent());
    }
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
    this.scrollTo = function(selector, callback) {
      return this.scrollToEl(null, selector, callback);
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
    $(this.settings.pgBack).on('click', (function(_this) {
      return function(e) {
        return _this.scrollPage(e, -1);
      };
    })(this));
    return $(this.settings.note).on('click', (function(_this) {
      return function(e) {
        return _this.scrollToEl(e, $(e.currentTarget).attr('href'));
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

  Events.prototype.scrollToEl = function(e, selector, callback) {
    var currLeft, currentSpread, dest, diff, elem, elemLeft, fast, refWidth, slow, targetSpread;
    this.prepareScroll(e);
    elem = $(selector);
    if (!elem.length) {
      return console.error("Error: Element '" + selector + "' doesn't exist in the document.");
    }
    elemLeft = blockParent(elem).offset().left;
    currLeft = frame.scrollLeft();
    refWidth = frameWidth + colGap;
    elemLeft -= refWidth / 2 + colGap + offset;
    targetSpread = (elemLeft + currLeft) / refWidth;
    currentSpread = currLeft / refWidth;
    diff = targetSpread - currentSpread;
    dest = currLeft + (diff * refWidth);
    fast = this.settings.animSpeedFast;
    slow = this.settings.animSpeedSlow;
    return this.animateScroll(dest, function() {
      elem.addClass('highlight').addClass('highlight-add');
      return setTimeout(function() {
        elem.removeClass('highlight-add');
        return setTimeout(function() {
          return elem.removeClass('highlight');
        }, fast);
      }, slow);
    });
  };

  Events.prototype.scrollPage = function(e, pos, callback) {
    var currLeft, dest, dist;
    this.prepareScroll(e);
    dist = frameWidth;
    currLeft = frame.scrollLeft();
    dest = (dist * pos) + currLeft + (colGap * pos);
    return this.animateScroll(dest, callback);
  };

  Events.prototype.scrollChapter = function(e, callback) {
    var dest, target;
    this.prepareScroll(e);
    target = $("#" + ($(e.target).attr('data-link')));
    dest = target.attr('data-offset-left');
    return this.animateScroll(dest, callback);
  };

  Events.prototype.animateScroll = function(dest, callback) {
    this.closeNav();
    return frame.stop(true, true).animate({
      scrollLeft: dest
    }, this.settings.scrollSpeed, (function(_this) {
      return function() {
        isScrolling = false;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV2ZW50cy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQU0sTUFBTSxDQUFBLFNBQUUsQ0FBQTtBQUVaLE1BQUE7O0VBQUEsV0FBQSxHQUFrQjs7RUFDbEIsZUFBQSxHQUFrQjs7RUFDbEIsU0FBQSxHQUFrQixDQUFDOztFQUNuQixTQUFBLEdBQWtCOztFQUNsQixNQUFBLEdBQWtCOztFQUNsQixPQUFBLEdBQWtCOztFQUNsQixPQUFBLEdBQWtCOztFQUNsQixVQUFBLEdBQWtCOztFQUNsQixNQUFBLEdBQWtCOztFQUVsQixNQUFBLEdBQWtCOztFQUNsQixVQUFBLEdBQWtCOztFQUVsQixLQUFBLEdBQWtCOztFQUNsQixNQUFBLEdBQWtCOztFQUVsQixPQUFBLEdBQWtCOztFQUNsQixRQUFBLEdBQWtCOztFQUVsQixRQUFBLEdBQ0U7SUFBQSxNQUFBLEVBQWdCLGVBQWhCO0lBQ0EsTUFBQSxFQUFnQixVQURoQjtJQUVBLFNBQUEsRUFBZ0IscUJBRmhCO0lBR0EsTUFBQSxFQUFnQixtQkFIaEI7SUFJQSxLQUFBLEVBQWdCLGtCQUpoQjtJQUtBLE1BQUEsRUFBZ0IsbUJBTGhCO0lBTUEsS0FBQSxFQUFnQixrQkFOaEI7SUFPQSxJQUFBLEVBQWdCLE1BUGhCO0lBUUEsV0FBQSxFQUFnQixHQVJoQjtJQVNBLGFBQUEsRUFBZ0IsR0FUaEI7SUFVQSxhQUFBLEVBQWdCLElBVmhCOzs7RUFjRixVQUFBLEdBQWEsQ0FBQyxTQUFELEVBQVcsU0FBWCxFQUFxQixPQUFyQixFQUE2QixZQUE3QixFQUEwQyxRQUExQyxFQUFtRCxJQUFuRCxFQUF3RCxLQUF4RCxFQUE4RCxJQUE5RCxFQUFtRSxVQUFuRSxFQUE4RSxZQUE5RSxFQUEyRixRQUEzRixFQUFvRyxZQUFwRyxFQUFpSCxRQUFqSCxFQUEwSCxNQUExSCxFQUFpSSxJQUFqSSxFQUFzSSxJQUF0SSxFQUEySSxJQUEzSSxFQUFnSixJQUFoSixFQUFxSixJQUFySixFQUEwSixJQUExSixFQUErSixRQUEvSixFQUF3SyxRQUF4SyxFQUFpTCxJQUFqTCxFQUFzTCxJQUF0TCxFQUEyTCxNQUEzTCxFQUFrTSxLQUFsTSxFQUF3TSxVQUF4TSxFQUFtTixJQUFuTixFQUF3TixRQUF4TixFQUFpTyxHQUFqTyxFQUFxTyxLQUFyTyxFQUEyTyxTQUEzTyxFQUFxUCxPQUFyUCxFQUE2UCxPQUE3UCxFQUFxUSxJQUFyUSxFQUEwUSxPQUExUTs7RUFDYixXQUFBLEdBQWMsU0FBQyxJQUFEO0lBQ1osSUFBRyxVQUFVLENBQUMsT0FBWCxDQUFtQixJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsUUFBUSxDQUFDLFdBQWpCLENBQUEsQ0FBbkIsQ0FBQSxHQUFxRCxDQUFDLENBQXpEO0FBQ0UsYUFBTyxLQURUO0tBQUEsTUFBQTthQUVLLFdBQUEsQ0FBWSxJQUFJLENBQUMsTUFBTCxDQUFBLENBQVosRUFGTDs7RUFEWTs7RUFLRCxnQkFBQyxPQUFEOztNQUFDLFVBQVU7O0lBRXRCLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBQyxDQUFDLE1BQUYsQ0FBUyxFQUFULEVBQWEsT0FBYixFQUFzQixRQUF0QjtJQUNaLEtBQUEsR0FBWSxDQUFBLENBQUUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFaO0lBQ1osTUFBQSxHQUFZLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVo7SUFJWixJQUFDLENBQUEsUUFBRCxHQUFZLFNBQUMsUUFBRDthQUF3QixJQUFDLENBQUEsVUFBRCxDQUFZLElBQVosRUFBa0IsQ0FBbEIsRUFBcUIsUUFBckI7SUFBeEI7SUFDWixJQUFDLENBQUEsUUFBRCxHQUFZLFNBQUMsUUFBRDthQUF3QixJQUFDLENBQUEsVUFBRCxDQUFZLElBQVosRUFBa0IsQ0FBQyxDQUFuQixFQUFzQixRQUF0QjtJQUF4QjtJQUNaLElBQUMsQ0FBQSxRQUFELEdBQVksU0FBQyxRQUFELEVBQVcsUUFBWDthQUF3QixJQUFDLENBQUEsVUFBRCxDQUFZLElBQVosRUFBa0IsUUFBbEIsRUFBNEIsUUFBNUI7SUFBeEI7RUFWRDs7bUJBYWIsY0FBQSxHQUFlLFNBQUMsQ0FBRDtJQUNiLElBQUcsQ0FBQSxJQUFNLENBQUMsQ0FBQyxhQUFYO01BQ0UsQ0FBQyxDQUFDLGNBQUYsQ0FBQTthQUNBLENBQUMsQ0FBQyxlQUFGLENBQUEsRUFGRjs7RUFEYTs7bUJBS2YsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxTQUFiO0FBQ1IsUUFBQTtJQUFBLE9BQUEsR0FBVTtXQUNWLFNBQUE7QUFDRSxVQUFBO01BQUEsT0FBQSxHQUFVO01BQ1YsSUFBQSxHQUFPO01BQ1AsS0FBQSxHQUFRLFNBQUE7UUFDTixPQUFBLEdBQVU7UUFDVixJQUFHLENBQUMsU0FBSjtpQkFDRSxJQUFJLENBQUMsS0FBTCxDQUFXLE9BQVgsRUFBb0IsSUFBcEIsRUFERjs7TUFGTTtNQUlSLE9BQUEsR0FBVSxTQUFBLElBQWMsQ0FBQztNQUN6QixZQUFBLENBQWEsT0FBYjtNQUNBLE9BQUEsR0FBVSxVQUFBLENBQVcsS0FBWCxFQUFrQixJQUFsQjtNQUNWLElBQUcsT0FBSDtlQUNFLElBQUksQ0FBQyxLQUFMLENBQVcsT0FBWCxFQUFvQixJQUFwQixFQURGOztJQVZGO0VBRlE7O21CQWVWLFNBQUEsR0FBVSxTQUFBO1dBRVIsTUFBQSxHQUFTLFFBQUEsQ0FBUyxLQUFLLENBQUMsR0FBTixDQUFVLFlBQVYsQ0FBVCxFQUFrQyxFQUFsQztFQUZEOzttQkFJVixhQUFBLEdBQWMsU0FBQTtXQUNaLFVBQUEsR0FBYSxLQUFLLENBQUMsS0FBTixDQUFBO0VBREQ7O21CQUdkLFVBQUEsR0FBWSxTQUFDLEdBQUQsRUFBTSxHQUFOO0FBQ1YsUUFBQTtJQUFBLE9BQUEsR0FBVTtJQUNWLE9BQUEsR0FBVTtJQUNWLElBQUEsR0FBTyxJQUFJLENBQUMsR0FBTCxDQUFTLEdBQUEsR0FBTSxPQUFmO0FBQ1AsU0FBQSxpREFBQTs7QUFDRTtBQUFBLFdBQUEsbURBQUE7O1FBQ0UsT0FBQSxHQUFVLElBQUksQ0FBQyxHQUFMLENBQVMsR0FBQSxHQUFNLEdBQUksQ0FBQSxHQUFBLENBQUssQ0FBQSxHQUFBLENBQXhCO1FBQ1YsSUFBSSxPQUFBLEdBQVUsSUFBZDtVQUNFLElBQUEsR0FBTztVQUNQLE9BQUEsR0FBVSxHQUFJLENBQUEsR0FBQSxDQUFLLENBQUEsR0FBQTtVQUNuQixPQUFBLEdBQVUsSUFIWjs7QUFGRjtBQURGO0FBT0EsV0FBTztNQUFDLEdBQUEsRUFBSyxPQUFOO01BQWUsR0FBQSxFQUFLLE9BQXBCOztFQVhHOzttQkFhWixXQUFBLEdBQVksU0FBQTtBQUNWLFFBQUE7SUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFVBQUQsQ0FBWSxLQUFLLENBQUMsVUFBTixDQUFBLENBQVosRUFBZ0MsUUFBaEM7SUFDVixJQUFDLENBQUEsYUFBRCxDQUFBO1dBQ0EsSUFBQyxDQUFBLGFBQUQsQ0FBZSxPQUFPLENBQUMsR0FBdkIsRUFBNEIsSUFBNUIsRUFBa0MsT0FBTyxDQUFDLEdBQTFDO0VBSFU7O21CQUtaLFVBQUEsR0FBVyxTQUFBO0FBQ1QsUUFBQTtJQUFBLFFBQUEsR0FBVztJQUNYLE1BQUEsR0FBUztJQUNULE9BQUEsR0FBVTtJQUNWLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLElBQUQsRUFBTyxHQUFQO0FBRVYsWUFBQTtRQUFBLE1BQUEsR0FBUztRQUNULE1BQUEsSUFBVTtRQUVWLElBQUcsSUFBQSxLQUFRLENBQVg7VUFDRSxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQVo7VUFDQSxPQUFBLElBQVcsVUFBQSxHQUFhLENBQWIsR0FBaUIsTUFBakIsR0FBMEIsTUFBQSxHQUFTLElBRmhEO1NBQUEsTUFJSyxJQUFHLElBQUEsSUFBUSxDQUFYO1VBQ0gsTUFBQSxHQUFTLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBQSxHQUFLLENBQWY7QUFDVCxlQUFTLGlGQUFUO1lBQ0UsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFaO1lBQ0EsT0FBQSxJQUFXLFVBQUEsR0FBYTtBQUYxQixXQUZHOztlQU1MLFFBQVMsQ0FBQSxHQUFBLENBQVQsR0FBZ0I7TUFmTjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWjtXQWdCQSxNQUFBLEdBQVMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFBLEdBQU8sQ0FBbEI7RUFwQkE7O21CQXNCWCxhQUFBLEdBQWMsU0FBQTtBQUNaLFFBQUE7SUFBQSxRQUFBLEdBQVcsQ0FBQSxDQUFFLGdCQUFGO0lBQ1gsT0FBQSxHQUFVO0lBQ1YsT0FBQSxHQUFVO0lBQ1YsT0FBQSxHQUFVO1dBQ1YsUUFBUSxDQUFDLElBQVQsQ0FBYyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRCxFQUFJLEVBQUo7QUFDWixZQUFBO1FBQUEsRUFBQSxHQUFLLENBQUEsQ0FBRSxFQUFGO1FBQ0wsRUFBRSxDQUFDLE1BQUgsQ0FBVSxxQkFBVjtRQUNBLE1BQUEsR0FBUyxDQUFBLENBQUUsTUFBRjtRQUVULE1BQUEsR0FDRTtVQUFBLEtBQUEsRUFBTyxVQUFQO1VBQ0EsSUFBQSxFQUFNLEtBQUssQ0FBQyxNQUFOLENBQUEsQ0FBYyxDQUFDLElBRHJCO1VBRUEsU0FBQSxFQUFXLEtBQUssQ0FBQyxVQUFOLENBQUEsQ0FGWDs7UUFLRixZQUFBLEdBQWUsTUFBTSxDQUFDLElBQVAsR0FBYztRQUU3QixTQUFBLEdBQVksTUFBTSxDQUFDLEtBQVAsR0FBZSxDQUFmLEdBQW1CLE1BQU0sQ0FBQztRQUV0QyxPQUFBLEdBQVUsQ0FBQyxNQUFNLENBQUMsU0FBUCxHQUFtQixNQUFNLENBQUMsTUFBUCxDQUFBLENBQWUsQ0FBQyxJQUFwQyxDQUFBLEdBQTRDLFlBQTVDLEdBQTJEO1FBRXJFLE9BQUEsR0FBVSxPQUFBLElBQVc7UUFDckIsT0FBQSxHQUFhLE9BQUEsR0FBVSxDQUFiLEdBQW9CLENBQXBCLEdBQTJCO1FBRXJDLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBSSxDQUFDLElBQUwsQ0FBVSxDQUFDLE9BQUEsR0FBVSxPQUFYLENBQUEsR0FBc0IsU0FBaEMsQ0FBYjtRQUVBLEVBQUUsQ0FBQyxJQUFILENBQVEsa0JBQVIsRUFBNEIsT0FBNUI7UUFDQSxNQUFNLENBQUMsTUFBUCxDQUFBO1FBRUEsSUFBRyxDQUFBLEtBQUssUUFBUSxDQUFDLE1BQVQsR0FBa0IsQ0FBMUI7VUFDRSxLQUFDLENBQUEsVUFBRCxDQUFBO2lCQUNBLFVBQUEsQ0FBVyxTQUFBO21CQUNULEtBQUMsQ0FBQSxXQUFELENBQUE7VUFEUyxDQUFYLEVBRUUsQ0FGRixFQUZGOztNQXpCWTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZDtFQUxZOzttQkFvQ2QsU0FBQSxHQUFVLFNBQUE7SUFDUixDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsRUFBWixDQUFlLFNBQWYsRUFBMEIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQ7ZUFBa0IsS0FBQyxDQUFBLFFBQUQsQ0FBVSxDQUFWO01BQWxCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQjtJQUNBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxFQUFaLENBQWUsT0FBZixFQUF3QixXQUF4QixFQUFxQyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFPLEtBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZjtNQUFQO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQztJQUNBLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVosQ0FBc0IsQ0FBQyxFQUF2QixDQUEwQixPQUExQixFQUFtQyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFTLEtBQUMsQ0FBQSxTQUFELENBQVcsQ0FBWDtNQUFUO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQztJQUNBLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBUSxDQUFDLEtBQVosQ0FBa0IsQ0FBQyxFQUFuQixDQUFzQixPQUF0QixFQUErQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFhLEtBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZixFQUFrQixDQUFsQjtNQUFiO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQjtJQUNBLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVosQ0FBbUIsQ0FBQyxFQUFwQixDQUF1QixPQUF2QixFQUFnQyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFZLEtBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZixFQUFrQixDQUFDLENBQW5CO01BQVo7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhDO0lBQ0EsQ0FBQSxDQUFFLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBWixDQUFrQixDQUFDLEVBQW5CLENBQXNCLE9BQXRCLEVBQStCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxDQUFEO2VBQWEsS0FBQyxDQUFBLFVBQUQsQ0FBWSxDQUFaLEVBQWUsQ0FBZjtNQUFiO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQjtJQUNBLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVosQ0FBbUIsQ0FBQyxFQUFwQixDQUF1QixPQUF2QixFQUFnQyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFZLEtBQUMsQ0FBQSxVQUFELENBQVksQ0FBWixFQUFlLENBQUMsQ0FBaEI7TUFBWjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEM7V0FDQSxDQUFBLENBQUUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFaLENBQWlCLENBQUMsRUFBbEIsQ0FBcUIsT0FBckIsRUFBOEIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQ7ZUFBYyxLQUFDLENBQUEsVUFBRCxDQUFZLENBQVosRUFBZSxDQUFBLENBQUUsQ0FBQyxDQUFDLGFBQUosQ0FBa0IsQ0FBQyxJQUFuQixDQUF3QixNQUF4QixDQUFmO01BQWQ7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCO0VBUlE7O21CQVVWLGFBQUEsR0FBYyxTQUFDLENBQUQ7SUFDWixJQUFDLENBQUEsY0FBRCxDQUFnQixDQUFoQjtJQUNBLElBQUcsV0FBSDtNQUFvQixLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsRUFBZ0IsSUFBaEIsRUFBcEI7O1dBQ0EsV0FBQSxHQUFjO0VBSEY7O21CQUtkLFVBQUEsR0FBVyxTQUFDLENBQUQsRUFBSSxRQUFKLEVBQWMsUUFBZDtBQUNULFFBQUE7SUFBQSxJQUFDLENBQUEsYUFBRCxDQUFlLENBQWY7SUFDQSxJQUFBLEdBQU8sQ0FBQSxDQUFFLFFBQUY7SUFDUCxJQUFHLENBQUMsSUFBSSxDQUFDLE1BQVQ7QUFDRSxhQUFPLE9BQU8sQ0FBQyxLQUFSLENBQWMsa0JBQUEsR0FBbUIsUUFBbkIsR0FBNEIsa0NBQTFDLEVBRFQ7O0lBR0EsUUFBQSxHQUFXLFdBQUEsQ0FBWSxJQUFaLENBQWlCLENBQUMsTUFBbEIsQ0FBQSxDQUEwQixDQUFDO0lBQ3RDLFFBQUEsR0FBVyxLQUFLLENBQUMsVUFBTixDQUFBO0lBQ1gsUUFBQSxHQUFXLFVBQUEsR0FBYTtJQUV4QixRQUFBLElBQVksUUFBQSxHQUFTLENBQVQsR0FBYSxNQUFiLEdBQXNCO0lBRWxDLFlBQUEsR0FBZSxDQUFDLFFBQUEsR0FBVyxRQUFaLENBQUEsR0FBd0I7SUFDdkMsYUFBQSxHQUFnQixRQUFBLEdBQVc7SUFFM0IsSUFBQSxHQUFPLFlBQUEsR0FBZTtJQUN0QixJQUFBLEdBQU8sUUFBQSxHQUFXLENBQUMsSUFBQSxHQUFPLFFBQVI7SUFFbEIsSUFBQSxHQUFPLElBQUMsQ0FBQSxRQUFRLENBQUM7SUFDakIsSUFBQSxHQUFPLElBQUMsQ0FBQSxRQUFRLENBQUM7V0FFakIsSUFBQyxDQUFBLGFBQUQsQ0FBZSxJQUFmLEVBQXFCLFNBQUE7TUFDbkIsSUFBSSxDQUFDLFFBQUwsQ0FBYyxXQUFkLENBQTBCLENBQUMsUUFBM0IsQ0FBb0MsZUFBcEM7YUFDQSxVQUFBLENBQVcsU0FBQTtRQUNULElBQUksQ0FBQyxXQUFMLENBQWlCLGVBQWpCO2VBQ0EsVUFBQSxDQUFXLFNBQUE7aUJBQ1QsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsV0FBakI7UUFEUyxDQUFYLEVBRUUsSUFGRjtNQUZTLENBQVgsRUFLRSxJQUxGO0lBRm1CLENBQXJCO0VBckJTOzttQkE4QlgsVUFBQSxHQUFXLFNBQUMsQ0FBRCxFQUFJLEdBQUosRUFBUyxRQUFUO0FBQ1QsUUFBQTtJQUFBLElBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZjtJQUNBLElBQUEsR0FBTztJQUNQLFFBQUEsR0FBVyxLQUFLLENBQUMsVUFBTixDQUFBO0lBQ1gsSUFBQSxHQUFPLENBQUMsSUFBQSxHQUFPLEdBQVIsQ0FBQSxHQUFlLFFBQWYsR0FBMEIsQ0FBQyxNQUFBLEdBQVMsR0FBVjtXQUNqQyxJQUFDLENBQUEsYUFBRCxDQUFlLElBQWYsRUFBcUIsUUFBckI7RUFMUzs7bUJBT1gsYUFBQSxHQUFjLFNBQUMsQ0FBRCxFQUFJLFFBQUo7QUFDWixRQUFBO0lBQUEsSUFBQyxDQUFBLGFBQUQsQ0FBZSxDQUFmO0lBQ0EsTUFBQSxHQUFTLENBQUEsQ0FBRSxHQUFBLEdBQUcsQ0FBQyxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLElBQVosQ0FBaUIsV0FBakIsQ0FBRCxDQUFMO0lBQ1QsSUFBQSxHQUFPLE1BQU0sQ0FBQyxJQUFQLENBQVksa0JBQVo7V0FDUCxJQUFDLENBQUEsYUFBRCxDQUFlLElBQWYsRUFBcUIsUUFBckI7RUFKWTs7bUJBTWQsYUFBQSxHQUFjLFNBQUMsSUFBRCxFQUFPLFFBQVA7SUFDWixJQUFDLENBQUEsUUFBRCxDQUFBO1dBQ0EsS0FDRSxDQUFDLElBREgsQ0FDUSxJQURSLEVBQ2MsSUFEZCxDQUVFLENBQUMsT0FGSCxDQUVXO01BQUMsVUFBQSxFQUFZLElBQWI7S0FGWCxFQUUrQixJQUFDLENBQUEsUUFBUSxDQUFDLFdBRnpDLEVBRXNELENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQTtRQUNsRCxXQUFBLEdBQWM7UUFDZCxJQUFHLFFBQUEsSUFBYSxPQUFPLFFBQVAsS0FBbUIsVUFBbkM7aUJBQ0UsUUFBQSxDQUFBLEVBREY7O01BRmtEO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZ0RDtFQUZZOzttQkFTZCxRQUFBLEdBQVMsU0FBQTtXQUNQLE1BQU0sQ0FBQyxXQUFQLENBQW1CLFFBQW5CO0VBRE87O21CQUdULFFBQUEsR0FBUyxTQUFDLENBQUQ7SUFDUCxJQUFHLENBQUEsSUFBTSxDQUFDLENBQUMsS0FBWDtBQUNFLGNBQU8sQ0FBQyxDQUFDLEtBQVQ7QUFBQSxhQUNPLEVBRFA7aUJBQ2UsSUFBQyxDQUFBLFFBQUQsQ0FBQTtBQURmLGFBRU8sRUFGUDtpQkFFZSxJQUFDLENBQUEsVUFBRCxDQUFZLENBQVosRUFBZSxDQUFDLENBQWhCO0FBRmYsYUFHTyxFQUhQO2lCQUdlLElBQUMsQ0FBQSxVQUFELENBQVksQ0FBWixFQUFlLENBQWY7QUFIZixPQURGOztFQURPOzttQkFPVCxTQUFBLEdBQVcsU0FBQyxDQUFEO0lBQ1QsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsQ0FBaEI7V0FDQSxNQUFNLENBQUMsV0FBUCxDQUFtQixRQUFuQjtFQUZTOzttQkFJWCxVQUFBLEdBQVcsU0FBQTtJQUNULElBQUMsQ0FBQSxhQUFELENBQUE7SUFDQSxJQUFDLENBQUEsU0FBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLGFBQUQsQ0FBQTtXQUNBLElBQUMsQ0FBQSxTQUFELENBQUE7RUFKUyIsImZpbGUiOiJldmVudHMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBSZWFkZXI6OkV2ZW50c1xuXG4gIGlzU2Nyb2xsaW5nICAgICA9IGZhbHNlXG4gIHRyaWdnZXJlZFNjcm9sbCA9IGZhbHNlXG4gIG1pblNjcm9sbCAgICAgICA9IC0xMlxuICBtYXhTY3JvbGwgICAgICAgPSAxMlxuICBvZmZzZXQgICAgICAgICAgPSAxNVxuICBlbGVtUG9zICAgICAgICAgPSBudWxsXG4gIHByZXZQb3MgICAgICAgICA9IG51bGxcbiAgY3VyclNwcmVhZCAgICAgID0gbnVsbFxuICBtYXhMZW4gICAgICAgICAgPSBudWxsXG5cbiAgY29sR2FwICAgICAgICAgID0gbnVsbFxuICBmcmFtZVdpZHRoICAgICAgPSBudWxsXG5cbiAgZnJhbWUgICAgICAgICAgID0gbnVsbFxuICBuYXZiYXIgICAgICAgICAgPSBudWxsXG5cbiAgY29sdW1ucyAgICAgICAgID0gW11cbiAgZnJhbWVNYXAgICAgICAgID0gW11cblxuICBkZWZhdWx0cyA9XG4gICAgcmVhZGVyICAgICAgICA6ICcjcmVhZGVyLWZyYW1lJ1xuICAgIGRvY05hdiAgICAgICAgOiAnI2RvYy1uYXYnXG4gICAgbmF2VG9nZ2xlICAgICA6ICdbZGF0YS1uYXY9Y29udGVudHNdJ1xuICAgIGNoQmFjayAgICAgICAgOiAnW2RhdGEtbmF2PWNoQmFja10nXG4gICAgY2hGd2QgICAgICAgICA6ICdbZGF0YS1uYXY9Y2hGd2RdJ1xuICAgIHBnQmFjayAgICAgICAgOiAnW2RhdGEtbmF2PXBnQmFja10nXG4gICAgcGdGd2QgICAgICAgICA6ICdbZGF0YS1uYXY9cGdGd2RdJ1xuICAgIG5vdGUgICAgICAgICAgOiAnYS5mbidcbiAgICBzY3JvbGxTcGVlZCAgIDogNDAwXG4gICAgYW5pbVNwZWVkRmFzdCA6IDUwMFxuICAgIGFuaW1TcGVlZFNsb3cgOiAxMDAwXG5cbiAgIyBoZWxwZXJzXG4gICNcbiAgYmxvY2tFbGVtcyA9IFsnYWRkcmVzcycsJ2FydGljbGUnLCdhc2lkZScsJ2Jsb2NrcXVvdGUnLCdjYW52YXMnLCdkZCcsJ2RpdicsJ2RsJywnZmllbGRzZXQnLCdmaWdjYXB0aW9uJywnZmlndXJlJywnZmlnY2FwdGlvbicsJ2Zvb3RlcicsJ2Zvcm0nLCdoMScsJ2gyJywnaDMnLCdoNCcsJ2g1JywnaDYnLCdoZWFkZXInLCdoZ3JvdXAnLCdocicsJ2xpJywnbWFpbicsJ25hdicsJ25vc2NyaXB0Jywnb2wnLCdvdXRwdXQnLCdwJywncHJlJywnc2VjdGlvbicsJ3RhYmxlJywndGZvb3QnLCd1bCcsJ3ZpZGVvJ11cbiAgYmxvY2tQYXJlbnQgPSAoZWxlbSkgLT5cbiAgICBpZiBibG9ja0VsZW1zLmluZGV4T2YoZWxlbVswXS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpKSA+IC0xXG4gICAgICByZXR1cm4gZWxlbVxuICAgIGVsc2UgYmxvY2tQYXJlbnQoZWxlbS5wYXJlbnQoKSlcblxuICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMgPSB7fSkgLT5cblxuICAgIEBzZXR0aW5ncyA9ICQuZXh0ZW5kKHt9LCBvcHRpb25zLCBkZWZhdWx0cylcbiAgICBmcmFtZSAgICAgPSAkKEBzZXR0aW5ncy5yZWFkZXIpXG4gICAgbmF2YmFyICAgID0gJChAc2V0dGluZ3MuZG9jTmF2KVxuXG4gICAgIyBjb252ZW5pZW5jZSBtZXRob2RzLCBwdWJsaWNseSBhdmFpbGFibGVcbiAgICAjXG4gICAgQG5leHRQYWdlID0gKGNhbGxiYWNrKSAgICAgICAgICAgLT4gQHNjcm9sbFBhZ2UobnVsbCwgMSwgY2FsbGJhY2spXG4gICAgQHByZXZQYWdlID0gKGNhbGxiYWNrKSAgICAgICAgICAgLT4gQHNjcm9sbFBhZ2UobnVsbCwgLTEsIGNhbGxiYWNrKVxuICAgIEBzY3JvbGxUbyA9IChzZWxlY3RvciwgY2FsbGJhY2spIC0+IEBzY3JvbGxUb0VsKG51bGwsIHNlbGVjdG9yLCBjYWxsYmFjaylcblxuXG4gIHByZXZlbnREZWZhdWx0OihlKS0+XG4gICAgaWYgZSBhbmQgZS5vcmlnaW5hbEV2ZW50XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICBkZWJvdW5jZTogKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkgLT5cbiAgICB0aW1lb3V0ID0gdW5kZWZpbmVkXG4gICAgLT5cbiAgICAgIGNvbnRleHQgPSB0aGlzXG4gICAgICBhcmdzID0gYXJndW1lbnRzXG4gICAgICBsYXRlciA9IC0+XG4gICAgICAgIHRpbWVvdXQgPSBudWxsXG4gICAgICAgIGlmICFpbW1lZGlhdGVcbiAgICAgICAgICBmdW5jLmFwcGx5IGNvbnRleHQsIGFyZ3NcbiAgICAgIGNhbGxOb3cgPSBpbW1lZGlhdGUgYW5kICF0aW1lb3V0XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dClcbiAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KVxuICAgICAgaWYgY2FsbE5vd1xuICAgICAgICBmdW5jLmFwcGx5IGNvbnRleHQsIGFyZ3NcblxuICBzZXRDb2xHYXA6KCktPlxuICAgICMgZGVmYXVsdCByZXR1cm5zIDQ1cHgsIGFsdGhvdWdoIGl0J3Mgc2V0IGluIGVtc1xuICAgIGNvbEdhcCA9IHBhcnNlSW50KGZyYW1lLmNzcygnY29sdW1uLWdhcCcpLCAxMClcblxuICBzZXRGcmFtZVdpZHRoOigpLT5cbiAgICBmcmFtZVdpZHRoID0gZnJhbWUud2lkdGgoKVxuXG4gIGNsb3Nlc3RQb3M6IChudW0sIGFycikgLT5cbiAgICBjdXJyUG9zID0gMFxuICAgIGN1cnJJZHggPSAwXG4gICAgZGlmZiA9IE1hdGguYWJzKG51bSAtIGN1cnJQb3MpXG4gICAgZm9yIGl0ZW0xLCBpZHggaW4gYXJyXG4gICAgICBmb3IgaXRlbTIsIHZhbCBpbiBhcnJbaWR4XVxuICAgICAgICBuZXdkaWZmID0gTWF0aC5hYnMobnVtIC0gYXJyW2lkeF1bdmFsXSlcbiAgICAgICAgaWYgKG5ld2RpZmYgPCBkaWZmKVxuICAgICAgICAgIGRpZmYgPSBuZXdkaWZmXG4gICAgICAgICAgY3VyclBvcyA9IGFycltpZHhdW3ZhbF1cbiAgICAgICAgICBjdXJySWR4ID0gaWR4XG4gICAgcmV0dXJuIHtpZHg6IGN1cnJJZHgsIHBvczogY3VyclBvc31cblxuICByZXR1cm5Ub1BvczooKS0+XG4gICAgY2xvc2VzdCA9IEBjbG9zZXN0UG9zKGZyYW1lLnNjcm9sbExlZnQoKSwgZnJhbWVNYXApXG4gICAgQHByZXBhcmVTY3JvbGwoKVxuICAgIEBhbmltYXRlU2Nyb2xsKGNsb3Nlc3QucG9zLCBudWxsLCBjbG9zZXN0LmlkeClcblxuICBtYXBDb2x1bW5zOigpLT4gIyBUT0RPOiBzZXQgdXAgZGlzdGFuY2VzIGZvciBtb2JpbGVcbiAgICBmcmFtZU1hcCA9IFtdXG4gICAgbWF4TGVuID0gMFxuICAgIHNjcmVlblcgPSAwXG4gICAgY29sdW1ucy5tYXAgKGNvbHMsIGlkeCk9PlxuXG4gICAgICByZXN1bHQgPSBbXVxuICAgICAgbWF4TGVuICs9IGNvbHNcblxuICAgICAgaWYgY29scyA9PSAxXG4gICAgICAgIHJlc3VsdC5wdXNoKHNjcmVlblcpXG4gICAgICAgIHNjcmVlblcgKz0gZnJhbWVXaWR0aCAvIDIgKyBjb2xHYXAgLSBvZmZzZXQgKiAxLjVcblxuICAgICAgZWxzZSBpZiBjb2xzID49IDJcbiAgICAgICAgcGFuZWxzID0gTWF0aC5jZWlsKGNvbHMvMilcbiAgICAgICAgZm9yIGkgaW4gWzEuLnBhbmVsc11cbiAgICAgICAgICByZXN1bHQucHVzaChzY3JlZW5XKVxuICAgICAgICAgIHNjcmVlblcgKz0gZnJhbWVXaWR0aCArIGNvbEdhcFxuXG4gICAgICBmcmFtZU1hcFtpZHhdID0gcmVzdWx0XG4gICAgbWF4TGVuID0gTWF0aC5mbG9vcihtYXhMZW4vMilcblxuICBzZXRBcnRpY2xlUG9zOigpLT5cbiAgICBhcnRpY2xlcyA9ICQoJ1tkYXRhLWFydGljbGVdJylcbiAgICBlbGVtUG9zID0gMFxuICAgIHByZXZQb3MgPSAwXG4gICAgY29sdW1ucyA9IFtdXG4gICAgYXJ0aWNsZXMuZWFjaCAoaSwgZWwpID0+XG4gICAgICBlbCA9ICQoZWwpXG4gICAgICBlbC5hcHBlbmQoJzxzcGFuIGNsYXNzPVwibXJrXCIvPicpXG4gICAgICBtYXJrZXIgPSAkKCcubXJrJylcblxuICAgICAgcmVhZGVyID1cbiAgICAgICAgd2lkdGg6IGZyYW1lV2lkdGhcbiAgICAgICAgbGVmdDogZnJhbWUub2Zmc2V0KCkubGVmdFxuICAgICAgICBzY3JvbGxQb3M6IGZyYW1lLnNjcm9sbExlZnQoKVxuXG4gICAgICAjIGlubmVyIGRpbXMgb2YgcmVhZGVyIGVsZW1lbnRcbiAgICAgIHJlYWRlck9mZnNldCA9IHJlYWRlci5sZWZ0ICogMlxuICAgICAgIyBzaW5nbGUgcGFnZSB3aWR0aCwgaW5jbHVkaW5nIGlubmVyIHBhZ2UgcGFkZGluZ1xuICAgICAgcGFnZVdpZHRoID0gcmVhZGVyLndpZHRoIC8gMiArIHJlYWRlci5sZWZ0XG4gICAgICAjIG1hcmtlciByZWxhdGVzIHRvIHByZXYuIHBhZ2UncyBiZWdpbm5pbmdcbiAgICAgIHBhZ2VQb3MgPSAocmVhZGVyLnNjcm9sbFBvcyArIG1hcmtlci5vZmZzZXQoKS5sZWZ0KSAtIHJlYWRlck9mZnNldCArIHBhZ2VXaWR0aFxuXG4gICAgICBlbGVtUG9zID0gcHJldlBvcyBvciAwXG4gICAgICBwcmV2UG9zID0gaWYgcGFnZVBvcyA8IDAgdGhlbiAwIGVsc2UgcGFnZVBvc1xuXG4gICAgICBjb2x1bW5zLnB1c2goTWF0aC5jZWlsKChwcmV2UG9zIC0gZWxlbVBvcykgLyBwYWdlV2lkdGgpKVxuXG4gICAgICBlbC5hdHRyKCdkYXRhLW9mZnNldC1sZWZ0JywgZWxlbVBvcylcbiAgICAgIG1hcmtlci5yZW1vdmUoKVxuXG4gICAgICBpZiBpID09IGFydGljbGVzLmxlbmd0aCAtIDFcbiAgICAgICAgQG1hcENvbHVtbnMoKVxuICAgICAgICBzZXRUaW1lb3V0ID0+XG4gICAgICAgICAgQHJldHVyblRvUG9zKClcbiAgICAgICAgLCAwXG5cbiAgYmluZEVsZW1zOigpLT5cbiAgICAkKGRvY3VtZW50KS5vbiAna2V5ZG93bicsIChlKSAgICAgICAgICAgID0+IEBrZXlQcmVzcyhlKVxuICAgICQoZG9jdW1lbnQpLm9uICdjbGljaycsICcuZG9jLWxpbmsnLCAoZSkgPT4gQHNjcm9sbENoYXB0ZXIoZSlcbiAgICAkKEBzZXR0aW5ncy5uYXZUb2dnbGUpLm9uICdjbGljaycsIChlKSAgID0+IEB0b2dnbGVOYXYoZSlcbiAgICAkKEBzZXR0aW5ncy5jaEZ3ZCkub24gJ2NsaWNrJywgKGUpICAgICAgID0+IEBzY3JvbGxDaGFwdGVyKGUsIDEpXG4gICAgJChAc2V0dGluZ3MuY2hCYWNrKS5vbiAnY2xpY2snLCAoZSkgICAgICA9PiBAc2Nyb2xsQ2hhcHRlcihlLCAtMSlcbiAgICAkKEBzZXR0aW5ncy5wZ0Z3ZCkub24gJ2NsaWNrJywgKGUpICAgICAgID0+IEBzY3JvbGxQYWdlKGUsIDEpXG4gICAgJChAc2V0dGluZ3MucGdCYWNrKS5vbiAnY2xpY2snLCAoZSkgICAgICA9PiBAc2Nyb2xsUGFnZShlLCAtMSlcbiAgICAkKEBzZXR0aW5ncy5ub3RlKS5vbiAnY2xpY2snLCAoZSkgICAgICAgID0+IEBzY3JvbGxUb0VsKGUsICQoZS5jdXJyZW50VGFyZ2V0KS5hdHRyKCdocmVmJykpXG5cbiAgcHJlcGFyZVNjcm9sbDooZSktPlxuICAgIEBwcmV2ZW50RGVmYXVsdChlKVxuICAgIGlmIGlzU2Nyb2xsaW5nIHRoZW4gZnJhbWUuc3RvcCh0cnVlLHRydWUpXG4gICAgaXNTY3JvbGxpbmcgPSB0cnVlXG5cbiAgc2Nyb2xsVG9FbDooZSwgc2VsZWN0b3IsIGNhbGxiYWNrKS0+XG4gICAgQHByZXBhcmVTY3JvbGwoZSlcbiAgICBlbGVtID0gJChzZWxlY3RvcilcbiAgICBpZiAhZWxlbS5sZW5ndGhcbiAgICAgIHJldHVybiBjb25zb2xlLmVycm9yIFwiRXJyb3I6IEVsZW1lbnQgJyN7c2VsZWN0b3J9JyBkb2Vzbid0IGV4aXN0IGluIHRoZSBkb2N1bWVudC5cIlxuXG4gICAgZWxlbUxlZnQgPSBibG9ja1BhcmVudChlbGVtKS5vZmZzZXQoKS5sZWZ0XG4gICAgY3VyckxlZnQgPSBmcmFtZS5zY3JvbGxMZWZ0KClcbiAgICByZWZXaWR0aCA9IGZyYW1lV2lkdGggKyBjb2xHYXBcblxuICAgIGVsZW1MZWZ0IC09IHJlZldpZHRoLzIgKyBjb2xHYXAgKyBvZmZzZXRcblxuICAgIHRhcmdldFNwcmVhZCA9IChlbGVtTGVmdCArIGN1cnJMZWZ0KSAvIHJlZldpZHRoXG4gICAgY3VycmVudFNwcmVhZCA9IGN1cnJMZWZ0IC8gcmVmV2lkdGhcblxuICAgIGRpZmYgPSB0YXJnZXRTcHJlYWQgLSBjdXJyZW50U3ByZWFkXG4gICAgZGVzdCA9IGN1cnJMZWZ0ICsgKGRpZmYgKiByZWZXaWR0aClcblxuICAgIGZhc3QgPSBAc2V0dGluZ3MuYW5pbVNwZWVkRmFzdFxuICAgIHNsb3cgPSBAc2V0dGluZ3MuYW5pbVNwZWVkU2xvd1xuXG4gICAgQGFuaW1hdGVTY3JvbGwgZGVzdCwgKCktPlxuICAgICAgZWxlbS5hZGRDbGFzcygnaGlnaGxpZ2h0JykuYWRkQ2xhc3MoJ2hpZ2hsaWdodC1hZGQnKVxuICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICBlbGVtLnJlbW92ZUNsYXNzKCdoaWdobGlnaHQtYWRkJylcbiAgICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICAgIGVsZW0ucmVtb3ZlQ2xhc3MoJ2hpZ2hsaWdodCcpXG4gICAgICAgICwgZmFzdFxuICAgICAgLCBzbG93XG5cbiAgc2Nyb2xsUGFnZTooZSwgcG9zLCBjYWxsYmFjayktPlxuICAgIEBwcmVwYXJlU2Nyb2xsKGUpXG4gICAgZGlzdCA9IGZyYW1lV2lkdGhcbiAgICBjdXJyTGVmdCA9IGZyYW1lLnNjcm9sbExlZnQoKVxuICAgIGRlc3QgPSAoZGlzdCAqIHBvcykgKyBjdXJyTGVmdCArIChjb2xHYXAgKiBwb3MpXG4gICAgQGFuaW1hdGVTY3JvbGwoZGVzdCwgY2FsbGJhY2spXG5cbiAgc2Nyb2xsQ2hhcHRlcjooZSwgY2FsbGJhY2spLT5cbiAgICBAcHJlcGFyZVNjcm9sbChlKVxuICAgIHRhcmdldCA9ICQoXCIjI3skKGUudGFyZ2V0KS5hdHRyKCdkYXRhLWxpbmsnKX1cIilcbiAgICBkZXN0ID0gdGFyZ2V0LmF0dHIoJ2RhdGEtb2Zmc2V0LWxlZnQnKVxuICAgIEBhbmltYXRlU2Nyb2xsKGRlc3QsIGNhbGxiYWNrKVxuXG4gIGFuaW1hdGVTY3JvbGw6KGRlc3QsIGNhbGxiYWNrKSAtPlxuICAgIEBjbG9zZU5hdigpXG4gICAgZnJhbWVcbiAgICAgIC5zdG9wKHRydWUsIHRydWUpXG4gICAgICAuYW5pbWF0ZSB7c2Nyb2xsTGVmdDogZGVzdH0sIEBzZXR0aW5ncy5zY3JvbGxTcGVlZCwgKCkgPT5cbiAgICAgICAgaXNTY3JvbGxpbmcgPSBmYWxzZVxuICAgICAgICBpZiBjYWxsYmFjayBhbmQgdHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbidcbiAgICAgICAgICBjYWxsYmFjaygpXG5cbiAgY2xvc2VOYXY6KCktPlxuICAgIG5hdmJhci5yZW1vdmVDbGFzcygnYWN0aXZlJylcblxuICBrZXlQcmVzczooZSkgLT5cbiAgICBpZiBlIGFuZCBlLndoaWNoXG4gICAgICBzd2l0Y2ggZS53aGljaFxuICAgICAgICB3aGVuIDI3IHRoZW4gQGNsb3NlTmF2KClcbiAgICAgICAgd2hlbiAzNyB0aGVuIEBzY3JvbGxQYWdlKGUsIC0xKVxuICAgICAgICB3aGVuIDM5IHRoZW4gQHNjcm9sbFBhZ2UoZSwgMSlcblxuICB0b2dnbGVOYXY6IChlKS0+XG4gICAgQHByZXZlbnREZWZhdWx0KGUpXG4gICAgbmF2YmFyLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxuXG4gIGluaXRpYWxpemU6KCktPlxuICAgIEBzZXRGcmFtZVdpZHRoKClcbiAgICBAc2V0Q29sR2FwKClcbiAgICBAc2V0QXJ0aWNsZVBvcygpXG4gICAgQGJpbmRFbGVtcygpXG4iXX0=
