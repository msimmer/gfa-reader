var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Reader.prototype.Events = (function() {
  var _bounceResize, _keyPress, _scrollChapter, _scrollToEl, _toggleNav, blockParent, blocks, blocksArr, blocksSel, colGap, columns, currSpread, defaults, delay, elemPos, frame, frameMap, frameWidth, frmDims, isScrolling, maxLen, maxScroll, minScroll, navbar, offset, prevPos, scrollTimer, touch, triggeredScroll;

  isScrolling = false;

  triggeredScroll = false;

  scrollTimer = null;

  minScroll = -12;

  maxScroll = 12;

  offset = 15;

  elemPos = null;

  prevPos = null;

  currSpread = null;

  maxLen = null;

  touch = null;

  colGap = null;

  frameWidth = null;

  frame = null;

  frmDims = {};

  navbar = null;

  columns = [];

  frameMap = [];

  delay = 150;

  _keyPress = null;

  _scrollChapter = null;

  _toggleNav = null;

  _scrollToEl = null;

  _bounceResize = null;

  defaults = {
    reader: '#reader-frame',
    docNav: '#doc-nav',
    navToggle: '[data-nav=contents]',
    chBack: '[data-nav=chBack]',
    chFwd: '[data-nav=chFwd]',
    pgBack: '[data-nav=pgBack]',
    pgFwd: '[data-nav=pgFwd]',
    btnNote: 'a.btn-note',
    btnNoteClose: 'a.note-close',
    scrollSpeed: 400,
    animSpeedFast: 500,
    animSpeedSlow: 1000
  };

  blocks = 'address article aside blockquote canvas dd div dl fieldset figcaption figure figcaption footer form h1 h2 h3 h4 h5 h6 header hgroup hr li main nav noscript ol output p pre section table tfoot ul video';

  blocksArr = blocks.split(' ');

  blocksSel = blocksArr.join(',');

  blockParent = function(elem) {
    if (blocksArr.indexOf(elem[0].nodeName.toLowerCase()) > -1) {
      return elem;
    } else {
      return blockParent(elem.parent());
    }
  };

  function Events(options) {
    if (options == null) {
      options = {};
    }
    this._toggleNav = bind(this._toggleNav, this);
    this._keyPress = bind(this._keyPress, this);
    this._scrollChapter = bind(this._scrollChapter, this);
    this._scrollToEl = bind(this._scrollToEl, this);
    this._noteClick = bind(this._noteClick, this);
    this._noteClose = bind(this._noteClose, this);
    this.settings = $.extend({}, options, defaults);
    frame = $(this.settings.reader);
    navbar = $(this.settings.docNav);
    touch = Modernizr.touch;
    frmDims = {
      top: frame.offset().top,
      left: frame.offset().top,
      gap: parseInt(frame.css('column-gap'), 10)
    };
    this.nextPage = function(callback) {
      return this.scrollPage(null, 1, callback);
    };
    this.prevPage = function(callback) {
      return this.scrollPage(null, -1, callback);
    };
    this.scrollTo = function(selector, callback) {
      return this._scrollToEl(null, selector, callback);
    };
  }

  Events.prototype.preventDefault = function(e) {
    if (e && e.originalEvent) {
      e.preventDefault();
      return e.stopPropagation();
    }
  };

  Events.prototype.resizeImages = function() {
    return $('img').each((function(_this) {
      return function(i, o) {
        return _this.setImageSize.call($(o)[0]);
      };
    })(this));
  };

  Events.prototype.setImageSize = function() {
    var $this, readerInnerHeight;
    $this = $(this);
    readerInnerHeight = frame.height();
    if (this.naturalHeight > this.naturalWidth) {
      $this.css({
        'max-height': '100%'
      });
      return $this.parent('.img').css({
        'max-height': readerInnerHeight,
        'height': readerInnerHeight
      });
    }
  };

  Events.prototype.setColGap = function() {
    return colGap = parseInt(frame.css('column-gap'), 10);
  };

  Events.prototype.setFrameWidth = function() {
    return frameWidth = frame.width();
  };

  Events.prototype.closestPos = function(num, arr) {
    var currIdx, currPos, diff, idx, item1, item2, j, k, len, len1, newdiff, ref1, val;
    currPos = 0;
    currIdx = 0;
    diff = Math.abs(num - currPos);
    for (idx = j = 0, len = arr.length; j < len; idx = ++j) {
      item1 = arr[idx];
      ref1 = arr[idx];
      for (val = k = 0, len1 = ref1.length; k < len1; val = ++k) {
        item2 = ref1[val];
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
        var i, j, panels, ref1, result;
        result = [];
        maxLen += cols;
        if (cols === 1) {
          result.push(screenW);
          screenW += frameWidth / 2 + colGap - offset * 1.5;
        } else if (cols >= 2) {
          panels = Math.ceil(cols / 2);
          for (i = j = 1, ref1 = panels; 1 <= ref1 ? j <= ref1 : j >= ref1; i = 1 <= ref1 ? ++j : --j) {
            result.push(screenW);
            screenW += frameWidth + colGap;
          }
        }
        return frameMap[idx] = result;
      };
    })(this));
    return maxLen = Math.floor(maxLen / 2);
  };

  Events.prototype.parseVals = function(v1, v2) {
    return parseInt(v1, 10) + parseInt(v2, 10);
  };

  Events.prototype.sizeColumns = function() {
    var articles, colCount;
    articles = $('[data-article]');
    elemPos = 0;
    prevPos = 0;
    colCount = 0;
    columns = [];
    return articles.each((function(_this) {
      return function(i, article) {
        var elems, marker, pagePos, pageWidth, reader, readerOffset;
        article = $(article);
        article.append('<span class="mrk"/>');
        marker = $('.mrk');
        reader = {
          width: frameWidth,
          left: frame.offset().left,
          scrollPos: frame.scrollLeft()
        };
        readerOffset = touch ? reader.left - 30 : reader.left * 2;
        pageWidth = touch ? reader.width : reader.width / 2 + reader.left;
        pagePos = (reader.scrollPos + marker.offset().left) - readerOffset + pageWidth;
        elemPos = prevPos || 0;
        prevPos = pagePos < 0 ? 0 : pagePos;
        colCount = Math.ceil((prevPos - elemPos) / pageWidth);
        columns.push(colCount);
        if (touch === false) {
          elems = article.find('h1,h2,h3,h4,h5,h6');
          elems.each(function(i, elem) {
            var mBot, mTop, pBot, pTop;
            mTop = $(elem).css('margin-top');
            mBot = $(elem).css('margin-bottom');
            pTop = $(elem).css('padding-top');
            pBot = $(elem).css('padding-bottom');
            $(elem).css({
              'margin-top': 0,
              'padding-top': _this.parseVals(mTop, pTop)
            });
            return $(elem).css({
              'margin-bottom': 0,
              'padding-bottom': _this.parseVals(mBot, pBot)
            });
          });
        }
        article.attr('data-offset-left', elemPos);
        marker.remove();
        if (i === articles.length - 1) {
          _this.mapColumns();
          return setTimeout((function() {
            return _this.returnToPos();
          }), 0);
        }
      };
    })(this));
  };

  Events.prototype.bind = function() {
    var _noteClick, _noteClose;
    _keyPress = this._keyPress;
    _scrollChapter = this._scrollChapter;
    _toggleNav = this._toggleNav;
    _scrollToEl = this._scrollToEl;
    _noteClick = this._noteClick;
    _noteClose = this._noteClose;
    _bounceResize = Reader.prototype.Utils.debounce((function(_this) {
      return function() {
        _this.resizeImages();
        _this.setColGap();
        _this.setFrameWidth();
        return _this.sizeColumns();
      };
    })(this), delay);
    $(document).on('keydown', _keyPress);
    $(document).on('click', '.doc-link', _scrollChapter);
    $(this.settings.navToggle).on('click', _toggleNav);
    $(this.settings.btnNote).on('click', _noteClick);
    $(this.settings.btnNoteClose).on('click', _noteClose);
    return $(window).on('resize', _bounceResize);
  };

  Events.prototype.destroy = function() {
    $(document).off('keydown', _keyPress);
    $(document).off('click', '.doc-link', _scrollChapter);
    if ($(this.settings.navToggle).length) {
      $(this.settings.navToggle).off('click', _toggleNav);
    }
    if ($(this.settings.btnNote).length) {
      $(this.settings.btnNote).off('click', _noteClick);
    }
    if ($(this.settings.btnNoteClose).length) {
      $(this.settings.btnNoteClose).off('click', _noteClose);
    }
    return $(window).off('resize', _bounceResize);
  };

  Events.prototype.prepareScroll = function(e) {
    this.preventDefault(e);
    this.hideCaptions();
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

  Events.prototype.hideCaptions = function() {
    return $(this.settings.btnNote).each(function() {
      if ($(this).hasClass('visible')) {
        return $(this).triggerHandler('click');
      }
    });
  };

  Events.prototype.toggleNote = function(target, ref) {
    var button, note;
    note = $("[data-note=\"" + ref + "\"]");
    button = $(target);
    button.toggleClass('visible');
    if (note.hasClass('visible')) {
      return note.removeClass('visible').removeClass('opaque');
    } else {
      note.addClass('visible');
      return setTimeout((function(_this) {
        return function() {
          var cL, cT;
          if (touch) {
            note.css({
              top: 15,
              right: 15,
              bottom: 15,
              left: 15
            });
          } else {
            cT = $(window).height() / 2 - note.height() / 2;
            cL = $(window).width() / 2 - note.width() / 2;
            note.css({
              top: cT < 15 ? 15 : cT,
              left: cL < 15 ? 15 : cL
            });
          }
          return note.addClass('opaque');
        };
      })(this), 0);
    }
  };

  Events.prototype._noteClose = function(e) {
    this.preventDefault(e);
    return this.hideCaptions();
  };

  Events.prototype._noteClick = function(e) {
    var ref, target;
    this.preventDefault(e);
    target = e.target;
    ref = $(target).attr('data-note-toggle');
    return this.toggleNote(target, ref);
  };

  Events.prototype._scrollToEl = function(e, selector, callback) {
    var currLeft, currentSpread, dest, diff, elem, elemLeft, fast, slow, target, targetSpread;
    this.prepareScroll(e);
    target = null;
    if (selector && typeof selector === 'string') {
      target = selector;
    } else if (e != null ? e.target : void 0) {
      target = e.target;
    }
    elem = $($(target).attr('href'));
    if (!(elem != null ? elem.length : void 0)) {
      return console.error("Error: Element '" + selector + "' doesn't exist in the document.");
    }
    elemLeft = blockParent(elem).offset().left;
    currLeft = frame.scrollLeft();
    if (!touch) {
      elemLeft -= frameWidth / 2 + (colGap + offset);
    } else {
      elemLeft -= frmDims.left;
    }
    targetSpread = (elemLeft + currLeft) / frameWidth;
    currentSpread = currLeft / frameWidth;
    diff = targetSpread - currentSpread;
    dest = currLeft + (diff * frameWidth);
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

  Events.prototype._scrollChapter = function(e, callback) {
    var dest, target;
    this.prepareScroll(e);
    target = $("#" + ($(e.target).attr('data-link')));
    dest = target.attr('data-offset-left');
    return this.animateScroll(dest, callback);
  };

  Events.prototype._keyPress = function(e) {
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

  Events.prototype._toggleNav = function(e) {
    this.preventDefault(e);
    return navbar.toggleClass('active');
  };

  Events.prototype.initialize = function() {
    $('img').each((function(_this) {
      return function(i, o) {
        return $(o)[0].onload = _this.setImageSize;
      };
    })(this));
    this.resizeImages();
    this.setFrameWidth();
    this.setColGap();
    this.sizeColumns();
    return this.bind();
  };

  return Events;

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV2ZW50cy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQTs7QUFBTSxNQUFNLENBQUEsU0FBRSxDQUFBO0FBRVosTUFBQTs7RUFBQSxXQUFBLEdBQWtCOztFQUNsQixlQUFBLEdBQWtCOztFQUNsQixXQUFBLEdBQWtCOztFQUNsQixTQUFBLEdBQWtCLENBQUM7O0VBQ25CLFNBQUEsR0FBa0I7O0VBQ2xCLE1BQUEsR0FBa0I7O0VBQ2xCLE9BQUEsR0FBa0I7O0VBQ2xCLE9BQUEsR0FBa0I7O0VBQ2xCLFVBQUEsR0FBa0I7O0VBQ2xCLE1BQUEsR0FBa0I7O0VBQ2xCLEtBQUEsR0FBa0I7O0VBRWxCLE1BQUEsR0FBa0I7O0VBQ2xCLFVBQUEsR0FBa0I7O0VBRWxCLEtBQUEsR0FBa0I7O0VBQ2xCLE9BQUEsR0FBa0I7O0VBQ2xCLE1BQUEsR0FBa0I7O0VBRWxCLE9BQUEsR0FBa0I7O0VBQ2xCLFFBQUEsR0FBa0I7O0VBRWxCLEtBQUEsR0FBa0I7O0VBS2xCLFNBQUEsR0FBaUI7O0VBQ2pCLGNBQUEsR0FBaUI7O0VBQ2pCLFVBQUEsR0FBaUI7O0VBQ2pCLFdBQUEsR0FBaUI7O0VBQ2pCLGFBQUEsR0FBaUI7O0VBRWpCLFFBQUEsR0FDRTtJQUFBLE1BQUEsRUFBZ0IsZUFBaEI7SUFDQSxNQUFBLEVBQWdCLFVBRGhCO0lBRUEsU0FBQSxFQUFnQixxQkFGaEI7SUFHQSxNQUFBLEVBQWdCLG1CQUhoQjtJQUlBLEtBQUEsRUFBZ0Isa0JBSmhCO0lBS0EsTUFBQSxFQUFnQixtQkFMaEI7SUFNQSxLQUFBLEVBQWdCLGtCQU5oQjtJQU9BLE9BQUEsRUFBZ0IsWUFQaEI7SUFRQSxZQUFBLEVBQWdCLGNBUmhCO0lBU0EsV0FBQSxFQUFnQixHQVRoQjtJQVVBLGFBQUEsRUFBZ0IsR0FWaEI7SUFXQSxhQUFBLEVBQWdCLElBWGhCOzs7RUFnQkYsTUFBQSxHQUFTOztFQUNULFNBQUEsR0FBWSxNQUFNLENBQUMsS0FBUCxDQUFhLEdBQWI7O0VBQ1osU0FBQSxHQUFZLFNBQVMsQ0FBQyxJQUFWLENBQWUsR0FBZjs7RUFFWixXQUFBLEdBQWMsU0FBQyxJQUFEO0lBQ1osSUFBRyxTQUFTLENBQUMsT0FBVixDQUFrQixJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsUUFBUSxDQUFDLFdBQWpCLENBQUEsQ0FBbEIsQ0FBQSxHQUFvRCxDQUFDLENBQXhEO0FBQ0UsYUFBTyxLQURUO0tBQUEsTUFBQTthQUVLLFdBQUEsQ0FBWSxJQUFJLENBQUMsTUFBTCxDQUFBLENBQVosRUFGTDs7RUFEWTs7RUFLRCxnQkFBQyxPQUFEOztNQUFDLFVBQVU7Ozs7Ozs7O0lBRXRCLElBQUMsQ0FBQSxRQUFELEdBQWMsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxFQUFULEVBQWEsT0FBYixFQUFzQixRQUF0QjtJQUNkLEtBQUEsR0FBYyxDQUFBLENBQUUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFaO0lBQ2QsTUFBQSxHQUFjLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVo7SUFDZCxLQUFBLEdBQWMsU0FBUyxDQUFDO0lBQ3hCLE9BQUEsR0FDRTtNQUFBLEdBQUEsRUFBSyxLQUFLLENBQUMsTUFBTixDQUFBLENBQWMsQ0FBQyxHQUFwQjtNQUNBLElBQUEsRUFBTSxLQUFLLENBQUMsTUFBTixDQUFBLENBQWMsQ0FBQyxHQURyQjtNQUVBLEdBQUEsRUFBSyxRQUFBLENBQVMsS0FBSyxDQUFDLEdBQU4sQ0FBVSxZQUFWLENBQVQsRUFBa0MsRUFBbEMsQ0FGTDs7SUFNRixJQUFDLENBQUEsUUFBRCxHQUFZLFNBQUMsUUFBRDthQUF3QixJQUFDLENBQUEsVUFBRCxDQUFZLElBQVosRUFBa0IsQ0FBbEIsRUFBcUIsUUFBckI7SUFBeEI7SUFDWixJQUFDLENBQUEsUUFBRCxHQUFZLFNBQUMsUUFBRDthQUF3QixJQUFDLENBQUEsVUFBRCxDQUFZLElBQVosRUFBa0IsQ0FBQyxDQUFuQixFQUFzQixRQUF0QjtJQUF4QjtJQUNaLElBQUMsQ0FBQSxRQUFELEdBQVksU0FBQyxRQUFELEVBQVcsUUFBWDthQUF3QixJQUFDLENBQUEsV0FBRCxDQUFhLElBQWIsRUFBbUIsUUFBbkIsRUFBNkIsUUFBN0I7SUFBeEI7RUFmRDs7bUJBa0JiLGNBQUEsR0FBZSxTQUFDLENBQUQ7SUFDYixJQUFHLENBQUEsSUFBTSxDQUFDLENBQUMsYUFBWDtNQUNFLENBQUMsQ0FBQyxjQUFGLENBQUE7YUFDQSxDQUFDLENBQUMsZUFBRixDQUFBLEVBRkY7O0VBRGE7O21CQUtmLFlBQUEsR0FBYSxTQUFBO1dBQ1gsQ0FBQSxDQUFFLEtBQUYsQ0FBUSxDQUFDLElBQVQsQ0FBYyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRCxFQUFJLENBQUo7ZUFDWixLQUFDLENBQUEsWUFBWSxDQUFDLElBQWQsQ0FBbUIsQ0FBQSxDQUFFLENBQUYsQ0FBSyxDQUFBLENBQUEsQ0FBeEI7TUFEWTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZDtFQURXOzttQkFJYixZQUFBLEdBQWEsU0FBQTtBQUNYLFFBQUE7SUFBQSxLQUFBLEdBQVEsQ0FBQSxDQUFFLElBQUY7SUFDUixpQkFBQSxHQUFvQixLQUFLLENBQUMsTUFBTixDQUFBO0lBQ3BCLElBQUcsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBQyxDQUFBLFlBQXJCO01BQ0UsS0FBSyxDQUFDLEdBQU4sQ0FBVTtRQUFDLFlBQUEsRUFBYSxNQUFkO09BQVY7YUFDQSxLQUFLLENBQUMsTUFBTixDQUFhLE1BQWIsQ0FBb0IsQ0FBQyxHQUFyQixDQUF5QjtRQUFDLFlBQUEsRUFBYyxpQkFBZjtRQUFrQyxRQUFBLEVBQVUsaUJBQTVDO09BQXpCLEVBRkY7O0VBSFc7O21CQU9iLFNBQUEsR0FBVSxTQUFBO1dBRVIsTUFBQSxHQUFTLFFBQUEsQ0FBUyxLQUFLLENBQUMsR0FBTixDQUFVLFlBQVYsQ0FBVCxFQUFrQyxFQUFsQztFQUZEOzttQkFJVixhQUFBLEdBQWMsU0FBQTtXQUNaLFVBQUEsR0FBYSxLQUFLLENBQUMsS0FBTixDQUFBO0VBREQ7O21CQUdkLFVBQUEsR0FBWSxTQUFDLEdBQUQsRUFBTSxHQUFOO0FBQ1YsUUFBQTtJQUFBLE9BQUEsR0FBVTtJQUNWLE9BQUEsR0FBVTtJQUNWLElBQUEsR0FBTyxJQUFJLENBQUMsR0FBTCxDQUFTLEdBQUEsR0FBTSxPQUFmO0FBQ1AsU0FBQSxpREFBQTs7QUFDRTtBQUFBLFdBQUEsb0RBQUE7O1FBQ0UsT0FBQSxHQUFVLElBQUksQ0FBQyxHQUFMLENBQVMsR0FBQSxHQUFNLEdBQUksQ0FBQSxHQUFBLENBQUssQ0FBQSxHQUFBLENBQXhCO1FBQ1YsSUFBSSxPQUFBLEdBQVUsSUFBZDtVQUNFLElBQUEsR0FBTztVQUNQLE9BQUEsR0FBVSxHQUFJLENBQUEsR0FBQSxDQUFLLENBQUEsR0FBQTtVQUNuQixPQUFBLEdBQVUsSUFIWjs7QUFGRjtBQURGO0FBT0EsV0FBTztNQUFDLEdBQUEsRUFBSyxPQUFOO01BQWUsR0FBQSxFQUFLLE9BQXBCOztFQVhHOzttQkFhWixXQUFBLEdBQVksU0FBQTtBQUNWLFFBQUE7SUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFVBQUQsQ0FBWSxLQUFLLENBQUMsVUFBTixDQUFBLENBQVosRUFBZ0MsUUFBaEM7SUFDVixJQUFDLENBQUEsYUFBRCxDQUFBO1dBQ0EsSUFBQyxDQUFBLGFBQUQsQ0FBZSxPQUFPLENBQUMsR0FBdkIsRUFBNEIsSUFBNUIsRUFBa0MsT0FBTyxDQUFDLEdBQTFDO0VBSFU7O21CQUtaLFVBQUEsR0FBVyxTQUFBO0FBQ1QsUUFBQTtJQUFBLFFBQUEsR0FBVztJQUNYLE1BQUEsR0FBUztJQUNULE9BQUEsR0FBVTtJQUNWLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLElBQUQsRUFBTyxHQUFQO0FBRVYsWUFBQTtRQUFBLE1BQUEsR0FBUztRQUNULE1BQUEsSUFBVTtRQUVWLElBQUcsSUFBQSxLQUFRLENBQVg7VUFDRSxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQVo7VUFDQSxPQUFBLElBQVcsVUFBQSxHQUFhLENBQWIsR0FBaUIsTUFBakIsR0FBMEIsTUFBQSxHQUFTLElBRmhEO1NBQUEsTUFJSyxJQUFHLElBQUEsSUFBUSxDQUFYO1VBQ0gsTUFBQSxHQUFTLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBQSxHQUFLLENBQWY7QUFDVCxlQUFTLHNGQUFUO1lBQ0UsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFaO1lBQ0EsT0FBQSxJQUFXLFVBQUEsR0FBYTtBQUYxQixXQUZHOztlQU1MLFFBQVMsQ0FBQSxHQUFBLENBQVQsR0FBZ0I7TUFmTjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWjtXQWdCQSxNQUFBLEdBQVMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFBLEdBQU8sQ0FBbEI7RUFwQkE7O21CQXNCWCxTQUFBLEdBQVUsU0FBQyxFQUFELEVBQUssRUFBTDtXQUlSLFFBQUEsQ0FBUyxFQUFULEVBQWEsRUFBYixDQUFBLEdBQW1CLFFBQUEsQ0FBUyxFQUFULEVBQWEsRUFBYjtFQUpYOzttQkFNVixXQUFBLEdBQVksU0FBQTtBQUNWLFFBQUE7SUFBQSxRQUFBLEdBQVcsQ0FBQSxDQUFFLGdCQUFGO0lBQ1gsT0FBQSxHQUFVO0lBQ1YsT0FBQSxHQUFVO0lBQ1YsUUFBQSxHQUFXO0lBQ1gsT0FBQSxHQUFVO1dBQ1YsUUFBUSxDQUFDLElBQVQsQ0FBYyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRCxFQUFJLE9BQUo7QUFDWixZQUFBO1FBQUEsT0FBQSxHQUFVLENBQUEsQ0FBRSxPQUFGO1FBQ1YsT0FBTyxDQUFDLE1BQVIsQ0FBZSxxQkFBZjtRQUNBLE1BQUEsR0FBUyxDQUFBLENBQUUsTUFBRjtRQUVULE1BQUEsR0FDRTtVQUFBLEtBQUEsRUFBTyxVQUFQO1VBQ0EsSUFBQSxFQUFNLEtBQUssQ0FBQyxNQUFOLENBQUEsQ0FBYyxDQUFDLElBRHJCO1VBRUEsU0FBQSxFQUFXLEtBQUssQ0FBQyxVQUFOLENBQUEsQ0FGWDs7UUFLRixZQUFBLEdBQWtCLEtBQUgsR0FBYyxNQUFNLENBQUMsSUFBUCxHQUFjLEVBQTVCLEdBQW9DLE1BQU0sQ0FBQyxJQUFQLEdBQWM7UUFHakUsU0FBQSxHQUFlLEtBQUgsR0FBYyxNQUFNLENBQUMsS0FBckIsR0FBZ0MsTUFBTSxDQUFDLEtBQVAsR0FBZSxDQUFmLEdBQW1CLE1BQU0sQ0FBQztRQUd0RSxPQUFBLEdBQVUsQ0FBQyxNQUFNLENBQUMsU0FBUCxHQUFtQixNQUFNLENBQUMsTUFBUCxDQUFBLENBQWUsQ0FBQyxJQUFwQyxDQUFBLEdBQTRDLFlBQTVDLEdBQTJEO1FBRXJFLE9BQUEsR0FBVSxPQUFBLElBQVc7UUFDckIsT0FBQSxHQUFhLE9BQUEsR0FBVSxDQUFiLEdBQW9CLENBQXBCLEdBQTJCO1FBQ3JDLFFBQUEsR0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsT0FBQSxHQUFVLE9BQVgsQ0FBQSxHQUFzQixTQUFoQztRQUNYLE9BQU8sQ0FBQyxJQUFSLENBQWEsUUFBYjtRQVNBLElBQUcsS0FBQSxLQUFTLEtBQVo7VUFFRSxLQUFBLEdBQVEsT0FBTyxDQUFDLElBQVIsQ0FBYSxtQkFBYjtVQUNSLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBQyxDQUFELEVBQUksSUFBSjtBQUVULGdCQUFBO1lBQUEsSUFBQSxHQUFPLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxHQUFSLENBQVksWUFBWjtZQUNQLElBQUEsR0FBTyxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsR0FBUixDQUFZLGVBQVo7WUFFUCxJQUFBLEdBQU8sQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLEdBQVIsQ0FBWSxhQUFaO1lBQ1AsSUFBQSxHQUFPLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxHQUFSLENBQVksZ0JBQVo7WUFFUCxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsR0FBUixDQUNFO2NBQUEsWUFBQSxFQUFjLENBQWQ7Y0FDQSxhQUFBLEVBQWUsS0FBQyxDQUFBLFNBQUQsQ0FBVyxJQUFYLEVBQWlCLElBQWpCLENBRGY7YUFERjttQkFJQSxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsR0FBUixDQUNFO2NBQUEsZUFBQSxFQUFpQixDQUFqQjtjQUNBLGdCQUFBLEVBQWtCLEtBQUMsQ0FBQSxTQUFELENBQVcsSUFBWCxFQUFpQixJQUFqQixDQURsQjthQURGO1VBWlMsQ0FBWCxFQUhGOztRQXNCQSxPQUFPLENBQUMsSUFBUixDQUFhLGtCQUFiLEVBQWlDLE9BQWpDO1FBRUEsTUFBTSxDQUFDLE1BQVAsQ0FBQTtRQUVBLElBQUcsQ0FBQSxLQUFLLFFBQVEsQ0FBQyxNQUFULEdBQWtCLENBQTFCO1VBQ0UsS0FBQyxDQUFBLFVBQUQsQ0FBQTtpQkFDQSxVQUFBLENBQVcsQ0FBQyxTQUFBO21CQUFNLEtBQUMsQ0FBQSxXQUFELENBQUE7VUFBTixDQUFELENBQVgsRUFBbUMsQ0FBbkMsRUFGRjs7TUF6RFk7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWQ7RUFOVTs7bUJBbUVaLElBQUEsR0FBSyxTQUFBO0FBQ0gsUUFBQTtJQUFBLFNBQUEsR0FBaUIsSUFBQyxDQUFBO0lBQ2xCLGNBQUEsR0FBaUIsSUFBQyxDQUFBO0lBQ2xCLFVBQUEsR0FBaUIsSUFBQyxDQUFBO0lBQ2xCLFdBQUEsR0FBaUIsSUFBQyxDQUFBO0lBQ2xCLFVBQUEsR0FBaUIsSUFBQyxDQUFBO0lBQ2xCLFVBQUEsR0FBaUIsSUFBQyxDQUFBO0lBQ2xCLGFBQUEsR0FBaUIsTUFBTSxDQUFBLFNBQUUsQ0FBQSxLQUFLLENBQUMsUUFBZCxDQUF1QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7UUFDdEMsS0FBQyxDQUFBLFlBQUQsQ0FBQTtRQUNBLEtBQUMsQ0FBQSxTQUFELENBQUE7UUFDQSxLQUFDLENBQUEsYUFBRCxDQUFBO2VBQ0EsS0FBQyxDQUFBLFdBQUQsQ0FBQTtNQUpzQztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkIsRUFLZixLQUxlO0lBT2pCLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxFQUFaLENBQWUsU0FBZixFQUEwQixTQUExQjtJQUNBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxFQUFaLENBQWUsT0FBZixFQUF3QixXQUF4QixFQUFxQyxjQUFyQztJQUNBLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVosQ0FBc0IsQ0FBQyxFQUF2QixDQUEwQixPQUExQixFQUFtQyxVQUFuQztJQUNBLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVosQ0FBb0IsQ0FBQyxFQUFyQixDQUF3QixPQUF4QixFQUFpQyxVQUFqQztJQUNBLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVosQ0FBeUIsQ0FBQyxFQUExQixDQUE2QixPQUE3QixFQUFzQyxVQUF0QztXQUNBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxFQUFWLENBQWEsUUFBYixFQUF1QixhQUF2QjtFQW5CRzs7bUJBcUJMLE9BQUEsR0FBUSxTQUFBO0lBQ04sQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEdBQVosQ0FBZ0IsU0FBaEIsRUFBMkIsU0FBM0I7SUFDQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsR0FBWixDQUFnQixPQUFoQixFQUF5QixXQUF6QixFQUFzQyxjQUF0QztJQUNBLElBQUcsQ0FBQSxDQUFFLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBWixDQUFzQixDQUFDLE1BQTFCO01BQ0UsQ0FBQSxDQUFFLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBWixDQUFzQixDQUFDLEdBQXZCLENBQTJCLE9BQTNCLEVBQW9DLFVBQXBDLEVBREY7O0lBRUEsSUFBRyxDQUFBLENBQUUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFaLENBQW9CLENBQUMsTUFBeEI7TUFDRSxDQUFBLENBQUUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFaLENBQW9CLENBQUMsR0FBckIsQ0FBeUIsT0FBekIsRUFBa0MsVUFBbEMsRUFERjs7SUFFQSxJQUFHLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVosQ0FBeUIsQ0FBQyxNQUE3QjtNQUNFLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVosQ0FBeUIsQ0FBQyxHQUExQixDQUE4QixPQUE5QixFQUF1QyxVQUF2QyxFQURGOztXQUdBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxHQUFWLENBQWMsUUFBZCxFQUF3QixhQUF4QjtFQVZNOzttQkFZUixhQUFBLEdBQWMsU0FBQyxDQUFEO0lBQ1osSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsQ0FBaEI7SUFDQSxJQUFDLENBQUEsWUFBRCxDQUFBO0lBQ0EsSUFBRyxXQUFIO01BQW9CLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxFQUFnQixJQUFoQixFQUFwQjs7V0FDQSxXQUFBLEdBQWM7RUFKRjs7bUJBTWQsVUFBQSxHQUFXLFNBQUMsQ0FBRCxFQUFJLEdBQUosRUFBUyxRQUFUO0FBQ1QsUUFBQTtJQUFBLElBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZjtJQUNBLElBQUEsR0FBTztJQUNQLFFBQUEsR0FBVyxLQUFLLENBQUMsVUFBTixDQUFBO0lBQ1gsSUFBQSxHQUFPLENBQUMsSUFBQSxHQUFPLEdBQVIsQ0FBQSxHQUFlLFFBQWYsR0FBMEIsQ0FBQyxNQUFBLEdBQVMsR0FBVjtXQUNqQyxJQUFDLENBQUEsYUFBRCxDQUFlLElBQWYsRUFBcUIsUUFBckI7RUFMUzs7bUJBT1gsYUFBQSxHQUFjLFNBQUMsSUFBRCxFQUFPLFFBQVA7SUFDWixJQUFDLENBQUEsUUFBRCxDQUFBO1dBQ0EsS0FDRSxDQUFDLElBREgsQ0FDUSxJQURSLEVBQ2MsSUFEZCxDQUVFLENBQUMsT0FGSCxDQUVXO01BQUMsVUFBQSxFQUFZLElBQWI7S0FGWCxFQUUrQixJQUFDLENBQUEsUUFBUSxDQUFDLFdBRnpDLEVBRXNELENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQTtRQUNsRCxXQUFBLEdBQWM7UUFDZCxJQUFHLFFBQUEsSUFBYSxPQUFPLFFBQVAsS0FBbUIsVUFBbkM7aUJBQ0UsUUFBQSxDQUFBLEVBREY7O01BRmtEO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZ0RDtFQUZZOzttQkFTZCxRQUFBLEdBQVMsU0FBQTtXQUNQLE1BQU0sQ0FBQyxXQUFQLENBQW1CLFFBQW5CO0VBRE87O21CQUdULFlBQUEsR0FBYSxTQUFBO1dBQ1gsQ0FBQSxDQUFFLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBWixDQUFvQixDQUFDLElBQXJCLENBQTBCLFNBQUE7TUFDeEIsSUFBRyxDQUFBLENBQUUsSUFBRixDQUFJLENBQUMsUUFBTCxDQUFjLFNBQWQsQ0FBSDtlQUNFLENBQUEsQ0FBRSxJQUFGLENBQUksQ0FBQyxjQUFMLENBQW9CLE9BQXBCLEVBREY7O0lBRHdCLENBQTFCO0VBRFc7O21CQUtiLFVBQUEsR0FBVyxTQUFDLE1BQUQsRUFBUyxHQUFUO0FBQ1QsUUFBQTtJQUFBLElBQUEsR0FBTyxDQUFBLENBQUUsZUFBQSxHQUFnQixHQUFoQixHQUFvQixLQUF0QjtJQUNQLE1BQUEsR0FBUyxDQUFBLENBQUUsTUFBRjtJQUNULE1BQU0sQ0FBQyxXQUFQLENBQW1CLFNBQW5CO0lBQ0EsSUFBRyxJQUFJLENBQUMsUUFBTCxDQUFjLFNBQWQsQ0FBSDthQUNFLElBQUksQ0FBQyxXQUFMLENBQWlCLFNBQWpCLENBQTJCLENBQUMsV0FBNUIsQ0FBd0MsUUFBeEMsRUFERjtLQUFBLE1BQUE7TUFHRSxJQUFJLENBQUMsUUFBTCxDQUFjLFNBQWQ7YUFDQSxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ1QsY0FBQTtVQUFBLElBQUcsS0FBSDtZQUNFLElBQUksQ0FBQyxHQUFMLENBQ0U7Y0FBQSxHQUFBLEVBQUssRUFBTDtjQUNBLEtBQUEsRUFBTSxFQUROO2NBRUEsTUFBQSxFQUFPLEVBRlA7Y0FHQSxJQUFBLEVBQU0sRUFITjthQURGLEVBREY7V0FBQSxNQUFBO1lBUUUsRUFBQSxHQUFLLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxNQUFWLENBQUEsQ0FBQSxHQUFxQixDQUFyQixHQUF5QixJQUFJLENBQUMsTUFBTCxDQUFBLENBQUEsR0FBZ0I7WUFDOUMsRUFBQSxHQUFLLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxLQUFWLENBQUEsQ0FBQSxHQUFvQixDQUFwQixHQUF3QixJQUFJLENBQUMsS0FBTCxDQUFBLENBQUEsR0FBZTtZQUM1QyxJQUFJLENBQUMsR0FBTCxDQUNFO2NBQUEsR0FBQSxFQUFRLEVBQUEsR0FBSyxFQUFSLEdBQWdCLEVBQWhCLEdBQXdCLEVBQTdCO2NBQ0EsSUFBQSxFQUFTLEVBQUEsR0FBSyxFQUFSLEdBQWdCLEVBQWhCLEdBQXdCLEVBRDlCO2FBREYsRUFWRjs7aUJBY0EsSUFBSSxDQUFDLFFBQUwsQ0FBYyxRQUFkO1FBZlM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsRUFnQkUsQ0FoQkYsRUFKRjs7RUFKUzs7bUJBNkJYLFVBQUEsR0FBVyxTQUFDLENBQUQ7SUFDVCxJQUFDLENBQUEsY0FBRCxDQUFnQixDQUFoQjtXQUNBLElBQUMsQ0FBQSxZQUFELENBQUE7RUFGUzs7bUJBSVgsVUFBQSxHQUFXLFNBQUMsQ0FBRDtBQUNULFFBQUE7SUFBQSxJQUFDLENBQUEsY0FBRCxDQUFnQixDQUFoQjtJQUNBLE1BQUEsR0FBUyxDQUFDLENBQUM7SUFDWCxHQUFBLEdBQU0sQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLElBQVYsQ0FBZSxrQkFBZjtXQUNOLElBQUMsQ0FBQSxVQUFELENBQVksTUFBWixFQUFvQixHQUFwQjtFQUpTOzttQkFNWCxXQUFBLEdBQVksU0FBQyxDQUFELEVBQUksUUFBSixFQUFjLFFBQWQ7QUFDVixRQUFBO0lBQUEsSUFBQyxDQUFBLGFBQUQsQ0FBZSxDQUFmO0lBQ0EsTUFBQSxHQUFTO0lBQ1QsSUFBRyxRQUFBLElBQWEsT0FBTyxRQUFQLEtBQW1CLFFBQW5DO01BQ0UsTUFBQSxHQUFTLFNBRFg7S0FBQSxNQUVLLGdCQUFHLENBQUMsQ0FBRSxlQUFOO01BQ0gsTUFBQSxHQUFTLENBQUMsQ0FBQyxPQURSOztJQUVMLElBQUEsR0FBTyxDQUFBLENBQUUsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLElBQVYsQ0FBZSxNQUFmLENBQUY7SUFFUCxJQUFHLGlCQUFDLElBQUksQ0FBRSxnQkFBVjtBQUNFLGFBQU8sT0FBTyxDQUFDLEtBQVIsQ0FBYyxrQkFBQSxHQUFtQixRQUFuQixHQUE0QixrQ0FBMUMsRUFEVDs7SUFHQSxRQUFBLEdBQVcsV0FBQSxDQUFZLElBQVosQ0FBaUIsQ0FBQyxNQUFsQixDQUFBLENBQTBCLENBQUM7SUFDdEMsUUFBQSxHQUFXLEtBQUssQ0FBQyxVQUFOLENBQUE7SUFFWCxJQUFHLENBQUMsS0FBSjtNQUNFLFFBQUEsSUFBWSxVQUFBLEdBQVcsQ0FBWCxHQUFlLENBQUMsTUFBQSxHQUFTLE1BQVYsRUFEN0I7S0FBQSxNQUFBO01BR0UsUUFBQSxJQUFZLE9BQU8sQ0FBQyxLQUh0Qjs7SUFLQSxZQUFBLEdBQWUsQ0FBQyxRQUFBLEdBQVcsUUFBWixDQUFBLEdBQXdCO0lBQ3ZDLGFBQUEsR0FBZ0IsUUFBQSxHQUFXO0lBRTNCLElBQUEsR0FBTyxZQUFBLEdBQWU7SUFDdEIsSUFBQSxHQUFPLFFBQUEsR0FBVyxDQUFDLElBQUEsR0FBTyxVQUFSO0lBRWxCLElBQUEsR0FBTyxJQUFDLENBQUEsUUFBUSxDQUFDO0lBQ2pCLElBQUEsR0FBTyxJQUFDLENBQUEsUUFBUSxDQUFDO1dBRWpCLElBQUMsQ0FBQSxhQUFELENBQWUsSUFBZixFQUFxQixTQUFBO01BQ25CLElBQUksQ0FBQyxRQUFMLENBQWMsV0FBZCxDQUEwQixDQUFDLFFBQTNCLENBQW9DLGVBQXBDO2FBQ0EsVUFBQSxDQUFXLFNBQUE7UUFDVCxJQUFJLENBQUMsV0FBTCxDQUFpQixlQUFqQjtlQUNBLFVBQUEsQ0FBVyxTQUFBO2lCQUNULElBQUksQ0FBQyxXQUFMLENBQWlCLFdBQWpCO1FBRFMsQ0FBWCxFQUVFLElBRkY7TUFGUyxDQUFYLEVBS0UsSUFMRjtJQUZtQixDQUFyQjtFQTdCVTs7bUJBc0NaLGNBQUEsR0FBZSxTQUFDLENBQUQsRUFBSSxRQUFKO0FBQ2IsUUFBQTtJQUFBLElBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZjtJQUNBLE1BQUEsR0FBUyxDQUFBLENBQUUsR0FBQSxHQUFHLENBQUMsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxJQUFaLENBQWlCLFdBQWpCLENBQUQsQ0FBTDtJQUNULElBQUEsR0FBTyxNQUFNLENBQUMsSUFBUCxDQUFZLGtCQUFaO1dBQ1AsSUFBQyxDQUFBLGFBQUQsQ0FBZSxJQUFmLEVBQXFCLFFBQXJCO0VBSmE7O21CQU1mLFNBQUEsR0FBVSxTQUFDLENBQUQ7SUFDUixJQUFHLENBQUEsSUFBTSxDQUFDLENBQUMsS0FBWDtBQUNFLGNBQU8sQ0FBQyxDQUFDLEtBQVQ7QUFBQSxhQUNPLEVBRFA7aUJBQ2UsSUFBQyxDQUFBLFFBQUQsQ0FBQTtBQURmLGFBRU8sRUFGUDtpQkFFZSxJQUFDLENBQUEsVUFBRCxDQUFZLENBQVosRUFBZSxDQUFDLENBQWhCO0FBRmYsYUFHTyxFQUhQO2lCQUdlLElBQUMsQ0FBQSxVQUFELENBQVksQ0FBWixFQUFlLENBQWY7QUFIZixPQURGOztFQURROzttQkFPVixVQUFBLEdBQVksU0FBQyxDQUFEO0lBQ1YsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsQ0FBaEI7V0FDQSxNQUFNLENBQUMsV0FBUCxDQUFtQixRQUFuQjtFQUZVOzttQkFNWixVQUFBLEdBQVcsU0FBQTtJQUNULENBQUEsQ0FBRSxLQUFGLENBQVEsQ0FBQyxJQUFULENBQWMsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQsRUFBSSxDQUFKO2VBQ1osQ0FBQSxDQUFFLENBQUYsQ0FBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQVIsR0FBaUIsS0FBQyxDQUFBO01BRE47SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWQ7SUFFQSxJQUFDLENBQUEsWUFBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLGFBQUQsQ0FBQTtJQUNBLElBQUMsQ0FBQSxTQUFELENBQUE7SUFDQSxJQUFDLENBQUEsV0FBRCxDQUFBO1dBQ0EsSUFBQyxDQUFBLElBQUQsQ0FBQTtFQVBTIiwiZmlsZSI6ImV2ZW50cy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFJlYWRlcjo6RXZlbnRzXG5cbiAgaXNTY3JvbGxpbmcgICAgID0gZmFsc2VcbiAgdHJpZ2dlcmVkU2Nyb2xsID0gZmFsc2VcbiAgc2Nyb2xsVGltZXIgICAgID0gbnVsbFxuICBtaW5TY3JvbGwgICAgICAgPSAtMTJcbiAgbWF4U2Nyb2xsICAgICAgID0gMTJcbiAgb2Zmc2V0ICAgICAgICAgID0gMTUgIyBUT0RPOiBtb3ZlIHRoaXMgdG8gZnJtRGltcyBvYmpcbiAgZWxlbVBvcyAgICAgICAgID0gbnVsbFxuICBwcmV2UG9zICAgICAgICAgPSBudWxsXG4gIGN1cnJTcHJlYWQgICAgICA9IG51bGxcbiAgbWF4TGVuICAgICAgICAgID0gbnVsbFxuICB0b3VjaCAgICAgICAgICAgPSBudWxsXG5cbiAgY29sR2FwICAgICAgICAgID0gbnVsbFxuICBmcmFtZVdpZHRoICAgICAgPSBudWxsXG5cbiAgZnJhbWUgICAgICAgICAgID0gbnVsbFxuICBmcm1EaW1zICAgICAgICAgPSB7fVxuICBuYXZiYXIgICAgICAgICAgPSBudWxsXG5cbiAgY29sdW1ucyAgICAgICAgID0gW11cbiAgZnJhbWVNYXAgICAgICAgID0gW11cblxuICBkZWxheSAgICAgICAgICAgPSAxNTBcblxuXG4gICMgU3RvcmUgaGFuZGxlcnMgaW4gcHJpdmF0ZSB2YXJpYWJsZXMgc28gdGhhdCB3ZSBjYW4gdW5iaW5kIHRoZW0gbGF0ZXJcbiAgI1xuICBfa2V5UHJlc3MgICAgICA9IG51bGxcbiAgX3Njcm9sbENoYXB0ZXIgPSBudWxsXG4gIF90b2dnbGVOYXYgICAgID0gbnVsbFxuICBfc2Nyb2xsVG9FbCAgICA9IG51bGxcbiAgX2JvdW5jZVJlc2l6ZSAgPSBudWxsXG5cbiAgZGVmYXVsdHMgPVxuICAgIHJlYWRlciAgICAgICAgOiAnI3JlYWRlci1mcmFtZSdcbiAgICBkb2NOYXYgICAgICAgIDogJyNkb2MtbmF2J1xuICAgIG5hdlRvZ2dsZSAgICAgOiAnW2RhdGEtbmF2PWNvbnRlbnRzXSdcbiAgICBjaEJhY2sgICAgICAgIDogJ1tkYXRhLW5hdj1jaEJhY2tdJ1xuICAgIGNoRndkICAgICAgICAgOiAnW2RhdGEtbmF2PWNoRndkXSdcbiAgICBwZ0JhY2sgICAgICAgIDogJ1tkYXRhLW5hdj1wZ0JhY2tdJ1xuICAgIHBnRndkICAgICAgICAgOiAnW2RhdGEtbmF2PXBnRndkXSdcbiAgICBidG5Ob3RlICAgICAgIDogJ2EuYnRuLW5vdGUnXG4gICAgYnRuTm90ZUNsb3NlICA6ICdhLm5vdGUtY2xvc2UnXG4gICAgc2Nyb2xsU3BlZWQgICA6IDQwMFxuICAgIGFuaW1TcGVlZEZhc3QgOiA1MDBcbiAgICBhbmltU3BlZWRTbG93IDogMTAwMFxuXG5cbiAgIyBoZWxwZXJzXG4gICNcbiAgYmxvY2tzID0gJ2FkZHJlc3MgYXJ0aWNsZSBhc2lkZSBibG9ja3F1b3RlIGNhbnZhcyBkZCBkaXYgZGwgZmllbGRzZXQgZmlnY2FwdGlvbiBmaWd1cmUgZmlnY2FwdGlvbiBmb290ZXIgZm9ybSBoMSBoMiBoMyBoNCBoNSBoNiBoZWFkZXIgaGdyb3VwIGhyIGxpIG1haW4gbmF2IG5vc2NyaXB0IG9sIG91dHB1dCBwIHByZSBzZWN0aW9uIHRhYmxlIHRmb290IHVsIHZpZGVvJ1xuICBibG9ja3NBcnIgPSBibG9ja3Muc3BsaXQoJyAnKVxuICBibG9ja3NTZWwgPSBibG9ja3NBcnIuam9pbignLCcpXG5cbiAgYmxvY2tQYXJlbnQgPSAoZWxlbSkgLT5cbiAgICBpZiBibG9ja3NBcnIuaW5kZXhPZihlbGVtWzBdLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpID4gLTFcbiAgICAgIHJldHVybiBlbGVtXG4gICAgZWxzZSBibG9ja1BhcmVudChlbGVtLnBhcmVudCgpKVxuXG4gIGNvbnN0cnVjdG9yOiAob3B0aW9ucyA9IHt9KSAtPlxuXG4gICAgQHNldHRpbmdzICAgPSAkLmV4dGVuZCh7fSwgb3B0aW9ucywgZGVmYXVsdHMpXG4gICAgZnJhbWUgICAgICAgPSAkKEBzZXR0aW5ncy5yZWFkZXIpXG4gICAgbmF2YmFyICAgICAgPSAkKEBzZXR0aW5ncy5kb2NOYXYpXG4gICAgdG91Y2ggICAgICAgPSBNb2Rlcm5penIudG91Y2hcbiAgICBmcm1EaW1zID1cbiAgICAgIHRvcDogZnJhbWUub2Zmc2V0KCkudG9wXG4gICAgICBsZWZ0OiBmcmFtZS5vZmZzZXQoKS50b3BcbiAgICAgIGdhcDogcGFyc2VJbnQoZnJhbWUuY3NzKCdjb2x1bW4tZ2FwJyksIDEwKVxuXG4gICAgIyBjb252ZW5pZW5jZSBtZXRob2RzLCBwdWJsaWNseSBhdmFpbGFibGVcbiAgICAjXG4gICAgQG5leHRQYWdlID0gKGNhbGxiYWNrKSAgICAgICAgICAgLT4gQHNjcm9sbFBhZ2UobnVsbCwgMSwgY2FsbGJhY2spXG4gICAgQHByZXZQYWdlID0gKGNhbGxiYWNrKSAgICAgICAgICAgLT4gQHNjcm9sbFBhZ2UobnVsbCwgLTEsIGNhbGxiYWNrKVxuICAgIEBzY3JvbGxUbyA9IChzZWxlY3RvciwgY2FsbGJhY2spIC0+IEBfc2Nyb2xsVG9FbChudWxsLCBzZWxlY3RvciwgY2FsbGJhY2spXG5cblxuICBwcmV2ZW50RGVmYXVsdDooZSktPlxuICAgIGlmIGUgYW5kIGUub3JpZ2luYWxFdmVudFxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgcmVzaXplSW1hZ2VzOigpLT5cbiAgICAkKCdpbWcnKS5lYWNoIChpLCBvKT0+XG4gICAgICBAc2V0SW1hZ2VTaXplLmNhbGwoJChvKVswXSlcblxuICBzZXRJbWFnZVNpemU6KCktPlxuICAgICR0aGlzID0gJChAKVxuICAgIHJlYWRlcklubmVySGVpZ2h0ID0gZnJhbWUuaGVpZ2h0KClcbiAgICBpZiBAbmF0dXJhbEhlaWdodCA+IEBuYXR1cmFsV2lkdGhcbiAgICAgICR0aGlzLmNzcyh7J21heC1oZWlnaHQnOicxMDAlJ30pXG4gICAgICAkdGhpcy5wYXJlbnQoJy5pbWcnKS5jc3MoeydtYXgtaGVpZ2h0JzogcmVhZGVySW5uZXJIZWlnaHQsICdoZWlnaHQnOiByZWFkZXJJbm5lckhlaWdodH0pXG5cbiAgc2V0Q29sR2FwOigpLT5cbiAgICAjIGRlZmF1bHQgcmV0dXJucyBweCB2YWx1ZSBkZXNwaXRlIGJlaW5nIHNldCBpbiBlbXMvcmVtc1xuICAgIGNvbEdhcCA9IHBhcnNlSW50KGZyYW1lLmNzcygnY29sdW1uLWdhcCcpLCAxMClcblxuICBzZXRGcmFtZVdpZHRoOigpLT5cbiAgICBmcmFtZVdpZHRoID0gZnJhbWUud2lkdGgoKVxuXG4gIGNsb3Nlc3RQb3M6IChudW0sIGFycikgLT5cbiAgICBjdXJyUG9zID0gMFxuICAgIGN1cnJJZHggPSAwXG4gICAgZGlmZiA9IE1hdGguYWJzKG51bSAtIGN1cnJQb3MpXG4gICAgZm9yIGl0ZW0xLCBpZHggaW4gYXJyXG4gICAgICBmb3IgaXRlbTIsIHZhbCBpbiBhcnJbaWR4XVxuICAgICAgICBuZXdkaWZmID0gTWF0aC5hYnMobnVtIC0gYXJyW2lkeF1bdmFsXSlcbiAgICAgICAgaWYgKG5ld2RpZmYgPCBkaWZmKVxuICAgICAgICAgIGRpZmYgPSBuZXdkaWZmXG4gICAgICAgICAgY3VyclBvcyA9IGFycltpZHhdW3ZhbF1cbiAgICAgICAgICBjdXJySWR4ID0gaWR4XG4gICAgcmV0dXJuIHtpZHg6IGN1cnJJZHgsIHBvczogY3VyclBvc31cblxuICByZXR1cm5Ub1BvczooKS0+XG4gICAgY2xvc2VzdCA9IEBjbG9zZXN0UG9zKGZyYW1lLnNjcm9sbExlZnQoKSwgZnJhbWVNYXApXG4gICAgQHByZXBhcmVTY3JvbGwoKVxuICAgIEBhbmltYXRlU2Nyb2xsKGNsb3Nlc3QucG9zLCBudWxsLCBjbG9zZXN0LmlkeClcblxuICBtYXBDb2x1bW5zOigpLT5cbiAgICBmcmFtZU1hcCA9IFtdXG4gICAgbWF4TGVuID0gMFxuICAgIHNjcmVlblcgPSAwXG4gICAgY29sdW1ucy5tYXAgKGNvbHMsIGlkeCk9PlxuXG4gICAgICByZXN1bHQgPSBbXVxuICAgICAgbWF4TGVuICs9IGNvbHNcblxuICAgICAgaWYgY29scyA9PSAxXG4gICAgICAgIHJlc3VsdC5wdXNoKHNjcmVlblcpXG4gICAgICAgIHNjcmVlblcgKz0gZnJhbWVXaWR0aCAvIDIgKyBjb2xHYXAgLSBvZmZzZXQgKiAxLjUgIyBUT0RPOiBhYnN0cmFjdCBhbmQgc3RvcmUgdGhlc2UgY2FsY3VsYXRpb25zIGluIHZhcmlhYmxlc1xuXG4gICAgICBlbHNlIGlmIGNvbHMgPj0gMlxuICAgICAgICBwYW5lbHMgPSBNYXRoLmNlaWwoY29scy8yKVxuICAgICAgICBmb3IgaSBpbiBbMS4ucGFuZWxzXVxuICAgICAgICAgIHJlc3VsdC5wdXNoKHNjcmVlblcpXG4gICAgICAgICAgc2NyZWVuVyArPSBmcmFtZVdpZHRoICsgY29sR2FwXG5cbiAgICAgIGZyYW1lTWFwW2lkeF0gPSByZXN1bHRcbiAgICBtYXhMZW4gPSBNYXRoLmZsb29yKG1heExlbi8yKVxuXG4gIHBhcnNlVmFsczoodjEsIHYyKS0+XG4gICAgIyBzaW5jZSB0aGUgdmFsdWVzIHJldHVybmVkIGJ5IGpRdWVyeSdzIGNzcyBtZXRob2QgYXJlIGluIHB4LCB3ZSBjYW4ganVzdFxuICAgICMgYWRkIHRoZSB2YWx1ZXMuIG1heSB3YW50IHRvIGdldCB0aGVzZSBpbiBhIGRpZmZlcmVudCB3YXkgaW4gdGhlIGZ1dHVyZSB0aG91Z2hcbiAgICAjXG4gICAgcGFyc2VJbnQodjEsIDEwKSArIHBhcnNlSW50KHYyLCAxMClcblxuICBzaXplQ29sdW1uczooKS0+XG4gICAgYXJ0aWNsZXMgPSAkKCdbZGF0YS1hcnRpY2xlXScpXG4gICAgZWxlbVBvcyA9IDBcbiAgICBwcmV2UG9zID0gMFxuICAgIGNvbENvdW50ID0gMFxuICAgIGNvbHVtbnMgPSBbXVxuICAgIGFydGljbGVzLmVhY2ggKGksIGFydGljbGUpID0+XG4gICAgICBhcnRpY2xlID0gJChhcnRpY2xlKVxuICAgICAgYXJ0aWNsZS5hcHBlbmQoJzxzcGFuIGNsYXNzPVwibXJrXCIvPicpXG4gICAgICBtYXJrZXIgPSAkKCcubXJrJylcblxuICAgICAgcmVhZGVyID1cbiAgICAgICAgd2lkdGg6IGZyYW1lV2lkdGhcbiAgICAgICAgbGVmdDogZnJhbWUub2Zmc2V0KCkubGVmdFxuICAgICAgICBzY3JvbGxQb3M6IGZyYW1lLnNjcm9sbExlZnQoKVxuXG4gICAgICAjIGlubmVyIGRpbXMgb2YgcmVhZGVyIGVsZW1lbnQsIGFjY291bnQgZm9yIDEgb3IgMiBjb2x1bW4gZnJhbWVzXG4gICAgICByZWFkZXJPZmZzZXQgPSBpZiB0b3VjaCB0aGVuIHJlYWRlci5sZWZ0IC0gMzAgZWxzZSByZWFkZXIubGVmdCAqIDIgIyBUT0RPOiBhYnN0cmFjdCBhbmQgc3RvcmUgdGhlc2UgY2FsY3VsYXRpb25zIGluIHZhcmlhYmxlc1xuXG4gICAgICAjIHNpbmdsZSBwYWdlIHdpZHRoLCBpbmNsdWRpbmcgaW5uZXIgcGFnZSBwYWRkaW5nXG4gICAgICBwYWdlV2lkdGggPSBpZiB0b3VjaCB0aGVuIHJlYWRlci53aWR0aCBlbHNlIHJlYWRlci53aWR0aCAvIDIgKyByZWFkZXIubGVmdFxuXG4gICAgICAjIG1hcmtlciByZWxhdGVzIHRvIHByZXYuIHBhZ2UncyBiZWdpbm5pbmdcbiAgICAgIHBhZ2VQb3MgPSAocmVhZGVyLnNjcm9sbFBvcyArIG1hcmtlci5vZmZzZXQoKS5sZWZ0KSAtIHJlYWRlck9mZnNldCArIHBhZ2VXaWR0aFxuXG4gICAgICBlbGVtUG9zID0gcHJldlBvcyBvciAwXG4gICAgICBwcmV2UG9zID0gaWYgcGFnZVBvcyA8IDAgdGhlbiAwIGVsc2UgcGFnZVBvc1xuICAgICAgY29sQ291bnQgPSBNYXRoLmNlaWwoKHByZXZQb3MgLSBlbGVtUG9zKSAvIHBhZ2VXaWR0aClcbiAgICAgIGNvbHVtbnMucHVzaChjb2xDb3VudClcblxuICAgICAgIyB0b3AvYm90dG9tIG1hcmdpbnMgbWVzcyB1cCBvdXIgbWVhc3VyZW1lbnRzIG9uIGJyb3dzZXJzIHRoYXQgZG9uJ3RcbiAgICAgICMgc3VwcG9ydCBDU1MzIGNvbHVtbi1icmVhaywgYXMgdGhleSdyZSBub3QgdGFrZW4gaW50byBhY2NvdW50IGluIHRoZVxuICAgICAgIyBjb2x1bW4gaGVpZ2h0LiByZXBsYWNpbmcgdGhlbSB3aXRoIHBhZGRpbmcgdG8gZ2V0IGFuIGFjY3VyYXRlIGNvdW50LlxuICAgICAgIyBhIHN0YWJsZSBzb2x1dGlvbiBvYnZpb3VzbHkgbmVlZHMgdG8gYmUgaW1wbGVtZW50ZWQsIGFsdGhvdWdoXG4gICAgICAjIHJld3JpdGluZyB0aGUgc3BhY2luZyBvbiBoZWFkZXJzIHNlZW1zIHRvIHdvcmsgZm9yIHRoZSB0aW1lIGJlaW5nLlxuICAgICAgIyBkb2Vzbid0IGFwcGx5IHRvIGlPUy9tb2JpbGUsIHNvIHdlIHdvbid0IHJ1biBvbiB0aGVzZSBwbGF0Zm9ybXMuXG4gICAgICAjXG4gICAgICBpZiB0b3VjaCA9PSBmYWxzZVxuXG4gICAgICAgIGVsZW1zID0gYXJ0aWNsZS5maW5kKCdoMSxoMixoMyxoNCxoNSxoNicpXG4gICAgICAgIGVsZW1zLmVhY2ggKGksIGVsZW0pPT5cblxuICAgICAgICAgIG1Ub3AgPSAkKGVsZW0pLmNzcygnbWFyZ2luLXRvcCcpXG4gICAgICAgICAgbUJvdCA9ICQoZWxlbSkuY3NzKCdtYXJnaW4tYm90dG9tJylcblxuICAgICAgICAgIHBUb3AgPSAkKGVsZW0pLmNzcygncGFkZGluZy10b3AnKVxuICAgICAgICAgIHBCb3QgPSAkKGVsZW0pLmNzcygncGFkZGluZy1ib3R0b20nKVxuXG4gICAgICAgICAgJChlbGVtKS5jc3MoXG4gICAgICAgICAgICAnbWFyZ2luLXRvcCc6IDBcbiAgICAgICAgICAgICdwYWRkaW5nLXRvcCc6IEBwYXJzZVZhbHMobVRvcCwgcFRvcClcbiAgICAgICAgICApXG4gICAgICAgICAgJChlbGVtKS5jc3MoXG4gICAgICAgICAgICAnbWFyZ2luLWJvdHRvbSc6IDBcbiAgICAgICAgICAgICdwYWRkaW5nLWJvdHRvbSc6IEBwYXJzZVZhbHMobUJvdCwgcEJvdClcbiAgICAgICAgICApXG5cbiAgICAgICAgICAjIGFydGljbGUuaGVpZ2h0KGZyYW1lLmhlaWdodCgpICogY29sQ291bnQpXG5cbiAgICAgIGFydGljbGUuYXR0cignZGF0YS1vZmZzZXQtbGVmdCcsIGVsZW1Qb3MpXG5cbiAgICAgIG1hcmtlci5yZW1vdmUoKVxuXG4gICAgICBpZiBpID09IGFydGljbGVzLmxlbmd0aCAtIDFcbiAgICAgICAgQG1hcENvbHVtbnMoKVxuICAgICAgICBzZXRUaW1lb3V0ICgoKSA9PiBAcmV0dXJuVG9Qb3MoKSksIDBcblxuICBiaW5kOigpLT5cbiAgICBfa2V5UHJlc3MgICAgICA9IEBfa2V5UHJlc3NcbiAgICBfc2Nyb2xsQ2hhcHRlciA9IEBfc2Nyb2xsQ2hhcHRlclxuICAgIF90b2dnbGVOYXYgICAgID0gQF90b2dnbGVOYXZcbiAgICBfc2Nyb2xsVG9FbCAgICA9IEBfc2Nyb2xsVG9FbFxuICAgIF9ub3RlQ2xpY2sgICAgID0gQF9ub3RlQ2xpY2tcbiAgICBfbm90ZUNsb3NlICAgICA9IEBfbm90ZUNsb3NlXG4gICAgX2JvdW5jZVJlc2l6ZSAgPSBSZWFkZXI6OlV0aWxzLmRlYm91bmNlICgpPT5cbiAgICAgIEByZXNpemVJbWFnZXMoKVxuICAgICAgQHNldENvbEdhcCgpXG4gICAgICBAc2V0RnJhbWVXaWR0aCgpXG4gICAgICBAc2l6ZUNvbHVtbnMoKVxuICAgICwgZGVsYXlcblxuICAgICQoZG9jdW1lbnQpLm9uICdrZXlkb3duJywgX2tleVByZXNzXG4gICAgJChkb2N1bWVudCkub24gJ2NsaWNrJywgJy5kb2MtbGluaycsIF9zY3JvbGxDaGFwdGVyXG4gICAgJChAc2V0dGluZ3MubmF2VG9nZ2xlKS5vbiAnY2xpY2snLCBfdG9nZ2xlTmF2XG4gICAgJChAc2V0dGluZ3MuYnRuTm90ZSkub24gJ2NsaWNrJywgX25vdGVDbGlja1xuICAgICQoQHNldHRpbmdzLmJ0bk5vdGVDbG9zZSkub24gJ2NsaWNrJywgX25vdGVDbG9zZVxuICAgICQod2luZG93KS5vbiAncmVzaXplJywgX2JvdW5jZVJlc2l6ZVxuXG4gIGRlc3Ryb3k6KCktPlxuICAgICQoZG9jdW1lbnQpLm9mZiAna2V5ZG93bicsIF9rZXlQcmVzc1xuICAgICQoZG9jdW1lbnQpLm9mZiAnY2xpY2snLCAnLmRvYy1saW5rJywgX3Njcm9sbENoYXB0ZXJcbiAgICBpZiAkKEBzZXR0aW5ncy5uYXZUb2dnbGUpLmxlbmd0aFxuICAgICAgJChAc2V0dGluZ3MubmF2VG9nZ2xlKS5vZmYgJ2NsaWNrJywgX3RvZ2dsZU5hdlxuICAgIGlmICQoQHNldHRpbmdzLmJ0bk5vdGUpLmxlbmd0aFxuICAgICAgJChAc2V0dGluZ3MuYnRuTm90ZSkub2ZmICdjbGljaycsIF9ub3RlQ2xpY2tcbiAgICBpZiAkKEBzZXR0aW5ncy5idG5Ob3RlQ2xvc2UpLmxlbmd0aFxuICAgICAgJChAc2V0dGluZ3MuYnRuTm90ZUNsb3NlKS5vZmYgJ2NsaWNrJywgX25vdGVDbG9zZVxuXG4gICAgJCh3aW5kb3cpLm9mZiAncmVzaXplJywgX2JvdW5jZVJlc2l6ZVxuXG4gIHByZXBhcmVTY3JvbGw6KGUpLT5cbiAgICBAcHJldmVudERlZmF1bHQoZSlcbiAgICBAaGlkZUNhcHRpb25zKClcbiAgICBpZiBpc1Njcm9sbGluZyB0aGVuIGZyYW1lLnN0b3AodHJ1ZSx0cnVlKVxuICAgIGlzU2Nyb2xsaW5nID0gdHJ1ZVxuXG4gIHNjcm9sbFBhZ2U6KGUsIHBvcywgY2FsbGJhY2spLT5cbiAgICBAcHJlcGFyZVNjcm9sbChlKVxuICAgIGRpc3QgPSBmcmFtZVdpZHRoXG4gICAgY3VyckxlZnQgPSBmcmFtZS5zY3JvbGxMZWZ0KClcbiAgICBkZXN0ID0gKGRpc3QgKiBwb3MpICsgY3VyckxlZnQgKyAoY29sR2FwICogcG9zKVxuICAgIEBhbmltYXRlU2Nyb2xsKGRlc3QsIGNhbGxiYWNrKVxuXG4gIGFuaW1hdGVTY3JvbGw6KGRlc3QsIGNhbGxiYWNrKSAtPlxuICAgIEBjbG9zZU5hdigpXG4gICAgZnJhbWVcbiAgICAgIC5zdG9wKHRydWUsIHRydWUpXG4gICAgICAuYW5pbWF0ZSB7c2Nyb2xsTGVmdDogZGVzdH0sIEBzZXR0aW5ncy5zY3JvbGxTcGVlZCwgKCkgPT5cbiAgICAgICAgaXNTY3JvbGxpbmcgPSBmYWxzZVxuICAgICAgICBpZiBjYWxsYmFjayBhbmQgdHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbidcbiAgICAgICAgICBjYWxsYmFjaygpXG5cbiAgY2xvc2VOYXY6KCktPlxuICAgIG5hdmJhci5yZW1vdmVDbGFzcygnYWN0aXZlJylcblxuICBoaWRlQ2FwdGlvbnM6KCktPlxuICAgICQoQHNldHRpbmdzLmJ0bk5vdGUpLmVhY2ggLT5cbiAgICAgIGlmICQoQCkuaGFzQ2xhc3MoJ3Zpc2libGUnKVxuICAgICAgICAkKEApLnRyaWdnZXJIYW5kbGVyICdjbGljaydcblxuICB0b2dnbGVOb3RlOih0YXJnZXQsIHJlZiktPlxuICAgIG5vdGUgPSAkKFwiW2RhdGEtbm90ZT1cXFwiI3tyZWZ9XFxcIl1cIilcbiAgICBidXR0b24gPSAkKHRhcmdldClcbiAgICBidXR0b24udG9nZ2xlQ2xhc3MoJ3Zpc2libGUnKVxuICAgIGlmIG5vdGUuaGFzQ2xhc3MoJ3Zpc2libGUnKVxuICAgICAgbm90ZS5yZW1vdmVDbGFzcygndmlzaWJsZScpLnJlbW92ZUNsYXNzKCdvcGFxdWUnKVxuICAgIGVsc2VcbiAgICAgIG5vdGUuYWRkQ2xhc3MoJ3Zpc2libGUnKVxuICAgICAgc2V0VGltZW91dCA9PlxuICAgICAgICBpZiB0b3VjaFxuICAgICAgICAgIG5vdGUuY3NzKFxuICAgICAgICAgICAgdG9wOiAxNVxuICAgICAgICAgICAgcmlnaHQ6MTVcbiAgICAgICAgICAgIGJvdHRvbToxNVxuICAgICAgICAgICAgbGVmdDogMTVcbiAgICAgICAgICApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjVCA9ICQod2luZG93KS5oZWlnaHQoKSAvIDIgLSBub3RlLmhlaWdodCgpIC8gMlxuICAgICAgICAgIGNMID0gJCh3aW5kb3cpLndpZHRoKCkgLyAyIC0gbm90ZS53aWR0aCgpIC8gMlxuICAgICAgICAgIG5vdGUuY3NzKFxuICAgICAgICAgICAgdG9wOiBpZiBjVCA8IDE1IHRoZW4gMTUgZWxzZSBjVFxuICAgICAgICAgICAgbGVmdDogaWYgY0wgPCAxNSB0aGVuIDE1IGVsc2UgY0xcbiAgICAgICAgICApXG4gICAgICAgIG5vdGUuYWRkQ2xhc3MoJ29wYXF1ZScpXG4gICAgICAsIDBcblxuXG4gICMgUHJpdmF0ZSBtZXRob2RzXG4gICNcbiAgX25vdGVDbG9zZTooZSk9PlxuICAgIEBwcmV2ZW50RGVmYXVsdChlKVxuICAgIEBoaWRlQ2FwdGlvbnMoKVxuXG4gIF9ub3RlQ2xpY2s6KGUpPT5cbiAgICBAcHJldmVudERlZmF1bHQoZSlcbiAgICB0YXJnZXQgPSBlLnRhcmdldFxuICAgIHJlZiA9ICQodGFyZ2V0KS5hdHRyKCdkYXRhLW5vdGUtdG9nZ2xlJylcbiAgICBAdG9nZ2xlTm90ZSh0YXJnZXQsIHJlZilcblxuICBfc2Nyb2xsVG9FbDooZSwgc2VsZWN0b3IsIGNhbGxiYWNrKT0+XG4gICAgQHByZXBhcmVTY3JvbGwoZSlcbiAgICB0YXJnZXQgPSBudWxsXG4gICAgaWYgc2VsZWN0b3IgYW5kIHR5cGVvZiBzZWxlY3RvciA9PSAnc3RyaW5nJ1xuICAgICAgdGFyZ2V0ID0gc2VsZWN0b3JcbiAgICBlbHNlIGlmIGU/LnRhcmdldFxuICAgICAgdGFyZ2V0ID0gZS50YXJnZXRcbiAgICBlbGVtID0gJCgkKHRhcmdldCkuYXR0cignaHJlZicpKVxuXG4gICAgaWYgIWVsZW0/Lmxlbmd0aFxuICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IgXCJFcnJvcjogRWxlbWVudCAnI3tzZWxlY3Rvcn0nIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIGRvY3VtZW50LlwiXG5cbiAgICBlbGVtTGVmdCA9IGJsb2NrUGFyZW50KGVsZW0pLm9mZnNldCgpLmxlZnRcbiAgICBjdXJyTGVmdCA9IGZyYW1lLnNjcm9sbExlZnQoKVxuXG4gICAgaWYgIXRvdWNoXG4gICAgICBlbGVtTGVmdCAtPSBmcmFtZVdpZHRoLzIgKyAoY29sR2FwICsgb2Zmc2V0KVxuICAgIGVsc2VcbiAgICAgIGVsZW1MZWZ0IC09IGZybURpbXMubGVmdFxuXG4gICAgdGFyZ2V0U3ByZWFkID0gKGVsZW1MZWZ0ICsgY3VyckxlZnQpIC8gZnJhbWVXaWR0aFxuICAgIGN1cnJlbnRTcHJlYWQgPSBjdXJyTGVmdCAvIGZyYW1lV2lkdGhcblxuICAgIGRpZmYgPSB0YXJnZXRTcHJlYWQgLSBjdXJyZW50U3ByZWFkXG4gICAgZGVzdCA9IGN1cnJMZWZ0ICsgKGRpZmYgKiBmcmFtZVdpZHRoKVxuXG4gICAgZmFzdCA9IEBzZXR0aW5ncy5hbmltU3BlZWRGYXN0XG4gICAgc2xvdyA9IEBzZXR0aW5ncy5hbmltU3BlZWRTbG93XG5cbiAgICBAYW5pbWF0ZVNjcm9sbCBkZXN0LCAoKS0+XG4gICAgICBlbGVtLmFkZENsYXNzKCdoaWdobGlnaHQnKS5hZGRDbGFzcygnaGlnaGxpZ2h0LWFkZCcpXG4gICAgICBzZXRUaW1lb3V0IC0+XG4gICAgICAgIGVsZW0ucmVtb3ZlQ2xhc3MoJ2hpZ2hsaWdodC1hZGQnKVxuICAgICAgICBzZXRUaW1lb3V0IC0+XG4gICAgICAgICAgZWxlbS5yZW1vdmVDbGFzcygnaGlnaGxpZ2h0JylcbiAgICAgICAgLCBmYXN0XG4gICAgICAsIHNsb3dcblxuICBfc2Nyb2xsQ2hhcHRlcjooZSwgY2FsbGJhY2spPT5cbiAgICBAcHJlcGFyZVNjcm9sbChlKVxuICAgIHRhcmdldCA9ICQoXCIjI3skKGUudGFyZ2V0KS5hdHRyKCdkYXRhLWxpbmsnKX1cIilcbiAgICBkZXN0ID0gdGFyZ2V0LmF0dHIoJ2RhdGEtb2Zmc2V0LWxlZnQnKVxuICAgIEBhbmltYXRlU2Nyb2xsKGRlc3QsIGNhbGxiYWNrKVxuXG4gIF9rZXlQcmVzczooZSkgPT5cbiAgICBpZiBlIGFuZCBlLndoaWNoXG4gICAgICBzd2l0Y2ggZS53aGljaFxuICAgICAgICB3aGVuIDI3IHRoZW4gQGNsb3NlTmF2KClcbiAgICAgICAgd2hlbiAzNyB0aGVuIEBzY3JvbGxQYWdlKGUsIC0xKVxuICAgICAgICB3aGVuIDM5IHRoZW4gQHNjcm9sbFBhZ2UoZSwgMSlcblxuICBfdG9nZ2xlTmF2OiAoZSk9PlxuICAgIEBwcmV2ZW50RGVmYXVsdChlKVxuICAgIG5hdmJhci50b2dnbGVDbGFzcygnYWN0aXZlJylcblxuICAjIGJvb3RzdHJhcFxuICAjXG4gIGluaXRpYWxpemU6KCktPlxuICAgICQoJ2ltZycpLmVhY2ggKGksIG8pPT5cbiAgICAgICQobylbMF0ub25sb2FkID0gQHNldEltYWdlU2l6ZVxuICAgIEByZXNpemVJbWFnZXMoKVxuICAgIEBzZXRGcmFtZVdpZHRoKClcbiAgICBAc2V0Q29sR2FwKClcbiAgICBAc2l6ZUNvbHVtbnMoKVxuICAgIEBiaW5kKClcbiJdfQ==
