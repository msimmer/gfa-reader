var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Reader.prototype.Events = (function() {
  var _bounceResize, _keyPress, _scrollChapter, _scrollToEl, _toggleNav, blockParent, blocks, blocksArr, blocksSel, colGap, columns, currSpread, defaults, delay, elemPos, frame, frameMap, frameWidth, isScrolling, maxLen, maxScroll, minScroll, navbar, offset, prevPos, scrollTimer, touch, triggeredScroll;

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
    note: 'a.fn',
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
    this.settings = $.extend({}, options, defaults);
    frame = $(this.settings.reader);
    navbar = $(this.settings.docNav);
    touch = Modernizr.touch;
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
            $(elem).css({
              'margin-bottom': 0,
              'padding-bottom': _this.parseVals(mBot, pBot)
            });
            return article.height(frame.height() * colCount);
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
    _keyPress = this._keyPress;
    _scrollChapter = this._scrollChapter;
    _toggleNav = this._toggleNav;
    _scrollToEl = this._scrollToEl;
    _bounceResize = Reader.prototype.Utils.debounce((function(_this) {
      return function() {
        _this.setColGap();
        _this.setFrameWidth();
        return _this.sizeColumns();
      };
    })(this), delay);
    $(document).on('keydown', _keyPress);
    $(document).on('click', '.doc-link', _scrollChapter);
    $(this.settings.navToggle).on('click', _toggleNav);
    $(this.settings.note).on('click', _scrollToEl);
    return $(window).on('resize', _bounceResize);
  };

  Events.prototype.destroy = function() {
    $(document).off('keydown', _keyPress);
    $(document).off('click', '.doc-link', _scrollChapter);
    $(this.settings.navToggle).off('click', _toggleNav);
    $(this.settings.note).off('click', _scrollToEl);
    return $(window).off('resize', _bounceResize);
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

  Events.prototype._scrollToEl = function(e, selector, callback) {
    var currLeft, currentSpread, dest, diff, elem, elemLeft, fast, refWidth, slow, target, targetSpread;
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
    refWidth = frameWidth + colGap;
    if (!touch) {
      elemLeft -= refWidth / 2 + (colGap + offset);
    } else {
      elemLeft -= 30;
    }
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
    this.setFrameWidth();
    this.setColGap();
    this.sizeColumns();
    return this.bind();
  };

  return Events;

})();

//# sourceMappingURL=data:application/json;base64,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QSxNQUFBLEdBQVMsQ0FBQSxDQUFFLEdBQUEsR0FBRyxDQUFDLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsSUFBWixDQUFpQixXQUFqQixDQUFELENBQUw7SUFDVCxJQUFBLEdBQU8sTUFBTSxDQUFDLElBQVAsQ0FBWSxrQkFBWjtXQUNQLElBQUMsQ0FBQSxhQUFELENBQWUsSUFBZixFQUFxQixRQUFyQjtFQUphOzttQkFNZixTQUFBLEdBQVUsU0FBQyxDQUFEO0lBQ1IsSUFBRyxDQUFBLElBQU0sQ0FBQyxDQUFDLEtBQVg7QUFDRSxjQUFPLENBQUMsQ0FBQyxLQUFUO0FBQUEsYUFDTyxFQURQO2lCQUNlLElBQUMsQ0FBQSxRQUFELENBQUE7QUFEZixhQUVPLEVBRlA7aUJBRWUsSUFBQyxDQUFBLFVBQUQsQ0FBWSxDQUFaLEVBQWUsQ0FBQyxDQUFoQjtBQUZmLGFBR08sRUFIUDtpQkFHZSxJQUFDLENBQUEsVUFBRCxDQUFZLENBQVosRUFBZSxDQUFmO0FBSGYsT0FERjs7RUFEUTs7bUJBT1YsVUFBQSxHQUFZLFNBQUMsQ0FBRDtJQUNWLElBQUMsQ0FBQSxjQUFELENBQWdCLENBQWhCO1dBQ0EsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsUUFBbkI7RUFGVTs7bUJBTVosVUFBQSxHQUFXLFNBQUE7SUFDVCxJQUFDLENBQUEsYUFBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBQTtJQUNBLElBQUMsQ0FBQSxXQUFELENBQUE7V0FDQSxJQUFDLENBQUEsSUFBRCxDQUFBO0VBSlMiLCJmaWxlIjoiZXZlbnRzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUmVhZGVyOjpFdmVudHNcblxuICBpc1Njcm9sbGluZyAgICAgPSBmYWxzZVxuICB0cmlnZ2VyZWRTY3JvbGwgPSBmYWxzZVxuICBzY3JvbGxUaW1lciAgICAgPSBudWxsXG4gIG1pblNjcm9sbCAgICAgICA9IC0xMlxuICBtYXhTY3JvbGwgICAgICAgPSAxMlxuICBvZmZzZXQgICAgICAgICAgPSAxNVxuICBlbGVtUG9zICAgICAgICAgPSBudWxsXG4gIHByZXZQb3MgICAgICAgICA9IG51bGxcbiAgY3VyclNwcmVhZCAgICAgID0gbnVsbFxuICBtYXhMZW4gICAgICAgICAgPSBudWxsXG4gIHRvdWNoICAgICAgICAgICA9IG51bGxcblxuICBjb2xHYXAgICAgICAgICAgPSBudWxsXG4gIGZyYW1lV2lkdGggICAgICA9IG51bGxcblxuICBmcmFtZSAgICAgICAgICAgPSBudWxsXG4gIG5hdmJhciAgICAgICAgICA9IG51bGxcblxuICBjb2x1bW5zICAgICAgICAgPSBbXVxuICBmcmFtZU1hcCAgICAgICAgPSBbXVxuXG4gIGRlbGF5ICAgICAgICAgICA9IDE1MFxuXG4gICMgU3RvcmUgaGFuZGxlcnMgaW4gcHJpdmF0ZSB2YXJpYWJsZXMgc28gdGhhdCB3ZSBjYW4gdW5iaW5kIHRoZW0gbGF0ZXJcbiAgI1xuICBfa2V5UHJlc3MgICAgICA9IG51bGxcbiAgX3Njcm9sbENoYXB0ZXIgPSBudWxsXG4gIF90b2dnbGVOYXYgICAgID0gbnVsbFxuICBfc2Nyb2xsVG9FbCAgICA9IG51bGxcbiAgX2JvdW5jZVJlc2l6ZSAgPSBudWxsXG5cbiAgZGVmYXVsdHMgPVxuICAgIHJlYWRlciAgICAgICAgOiAnI3JlYWRlci1mcmFtZSdcbiAgICBkb2NOYXYgICAgICAgIDogJyNkb2MtbmF2J1xuICAgIG5hdlRvZ2dsZSAgICAgOiAnW2RhdGEtbmF2PWNvbnRlbnRzXSdcbiAgICBjaEJhY2sgICAgICAgIDogJ1tkYXRhLW5hdj1jaEJhY2tdJ1xuICAgIGNoRndkICAgICAgICAgOiAnW2RhdGEtbmF2PWNoRndkXSdcbiAgICBwZ0JhY2sgICAgICAgIDogJ1tkYXRhLW5hdj1wZ0JhY2tdJ1xuICAgIHBnRndkICAgICAgICAgOiAnW2RhdGEtbmF2PXBnRndkXSdcbiAgICBub3RlICAgICAgICAgIDogJ2EuZm4nXG4gICAgc2Nyb2xsU3BlZWQgICA6IDQwMFxuICAgIGFuaW1TcGVlZEZhc3QgOiA1MDBcbiAgICBhbmltU3BlZWRTbG93IDogMTAwMFxuXG5cbiAgIyBoZWxwZXJzXG4gICNcbiAgYmxvY2tzID0gJ2FkZHJlc3MgYXJ0aWNsZSBhc2lkZSBibG9ja3F1b3RlIGNhbnZhcyBkZCBkaXYgZGwgZmllbGRzZXQgZmlnY2FwdGlvbiBmaWd1cmUgZmlnY2FwdGlvbiBmb290ZXIgZm9ybSBoMSBoMiBoMyBoNCBoNSBoNiBoZWFkZXIgaGdyb3VwIGhyIGxpIG1haW4gbmF2IG5vc2NyaXB0IG9sIG91dHB1dCBwIHByZSBzZWN0aW9uIHRhYmxlIHRmb290IHVsIHZpZGVvJ1xuICBibG9ja3NBcnIgPSBibG9ja3Muc3BsaXQoJyAnKVxuICBibG9ja3NTZWwgPSBibG9ja3NBcnIuam9pbignLCcpXG5cbiAgYmxvY2tQYXJlbnQgPSAoZWxlbSkgLT5cbiAgICBpZiBibG9ja3NBcnIuaW5kZXhPZihlbGVtWzBdLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpID4gLTFcbiAgICAgIHJldHVybiBlbGVtXG4gICAgZWxzZSBibG9ja1BhcmVudChlbGVtLnBhcmVudCgpKVxuXG4gIGNvbnN0cnVjdG9yOiAob3B0aW9ucyA9IHt9KSAtPlxuXG4gICAgQHNldHRpbmdzID0gJC5leHRlbmQoe30sIG9wdGlvbnMsIGRlZmF1bHRzKVxuICAgIGZyYW1lICAgICA9ICQoQHNldHRpbmdzLnJlYWRlcilcbiAgICBuYXZiYXIgICAgPSAkKEBzZXR0aW5ncy5kb2NOYXYpXG4gICAgdG91Y2ggICAgID0gTW9kZXJuaXpyLnRvdWNoXG5cbiAgICAjIGNvbnZlbmllbmNlIG1ldGhvZHMsIHB1YmxpY2x5IGF2YWlsYWJsZVxuICAgICNcbiAgICBAbmV4dFBhZ2UgPSAoY2FsbGJhY2spICAgICAgICAgICAtPiBAc2Nyb2xsUGFnZShudWxsLCAxLCBjYWxsYmFjaylcbiAgICBAcHJldlBhZ2UgPSAoY2FsbGJhY2spICAgICAgICAgICAtPiBAc2Nyb2xsUGFnZShudWxsLCAtMSwgY2FsbGJhY2spXG4gICAgQHNjcm9sbFRvID0gKHNlbGVjdG9yLCBjYWxsYmFjaykgLT4gQF9zY3JvbGxUb0VsKG51bGwsIHNlbGVjdG9yLCBjYWxsYmFjaylcblxuXG4gIHByZXZlbnREZWZhdWx0OihlKS0+XG4gICAgaWYgZSBhbmQgZS5vcmlnaW5hbEV2ZW50XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICBzZXRDb2xHYXA6KCktPlxuICAgICMgZGVmYXVsdCByZXR1cm5zIHB4IHZhbHVlIGRlc3BpdGUgYmVpbmcgc2V0IGluIGVtcy9yZW1zXG4gICAgY29sR2FwID0gcGFyc2VJbnQoZnJhbWUuY3NzKCdjb2x1bW4tZ2FwJyksIDEwKVxuXG4gIHNldEZyYW1lV2lkdGg6KCktPlxuICAgIGZyYW1lV2lkdGggPSBmcmFtZS53aWR0aCgpXG5cbiAgY2xvc2VzdFBvczogKG51bSwgYXJyKSAtPlxuICAgIGN1cnJQb3MgPSAwXG4gICAgY3VycklkeCA9IDBcbiAgICBkaWZmID0gTWF0aC5hYnMobnVtIC0gY3VyclBvcylcbiAgICBmb3IgaXRlbTEsIGlkeCBpbiBhcnJcbiAgICAgIGZvciBpdGVtMiwgdmFsIGluIGFycltpZHhdXG4gICAgICAgIG5ld2RpZmYgPSBNYXRoLmFicyhudW0gLSBhcnJbaWR4XVt2YWxdKVxuICAgICAgICBpZiAobmV3ZGlmZiA8IGRpZmYpXG4gICAgICAgICAgZGlmZiA9IG5ld2RpZmZcbiAgICAgICAgICBjdXJyUG9zID0gYXJyW2lkeF1bdmFsXVxuICAgICAgICAgIGN1cnJJZHggPSBpZHhcbiAgICByZXR1cm4ge2lkeDogY3VycklkeCwgcG9zOiBjdXJyUG9zfVxuXG4gIHJldHVyblRvUG9zOigpLT5cbiAgICBjbG9zZXN0ID0gQGNsb3Nlc3RQb3MoZnJhbWUuc2Nyb2xsTGVmdCgpLCBmcmFtZU1hcClcbiAgICBAcHJlcGFyZVNjcm9sbCgpXG4gICAgQGFuaW1hdGVTY3JvbGwoY2xvc2VzdC5wb3MsIG51bGwsIGNsb3Nlc3QuaWR4KVxuXG4gIG1hcENvbHVtbnM6KCktPlxuICAgIGZyYW1lTWFwID0gW11cbiAgICBtYXhMZW4gPSAwXG4gICAgc2NyZWVuVyA9IDBcbiAgICBjb2x1bW5zLm1hcCAoY29scywgaWR4KT0+XG5cbiAgICAgIHJlc3VsdCA9IFtdXG4gICAgICBtYXhMZW4gKz0gY29sc1xuXG4gICAgICBpZiBjb2xzID09IDFcbiAgICAgICAgcmVzdWx0LnB1c2goc2NyZWVuVylcbiAgICAgICAgc2NyZWVuVyArPSBmcmFtZVdpZHRoIC8gMiArIGNvbEdhcCAtIG9mZnNldCAqIDEuNSAjIFRPRE86IGFic3RyYWN0IGFuZCBzdG9yZSB0aGVzZSBjYWxjdWxhdGlvbnMgaW4gdmFyaWFibGVzXG5cbiAgICAgIGVsc2UgaWYgY29scyA+PSAyXG4gICAgICAgIHBhbmVscyA9IE1hdGguY2VpbChjb2xzLzIpXG4gICAgICAgIGZvciBpIGluIFsxLi5wYW5lbHNdXG4gICAgICAgICAgcmVzdWx0LnB1c2goc2NyZWVuVylcbiAgICAgICAgICBzY3JlZW5XICs9IGZyYW1lV2lkdGggKyBjb2xHYXBcblxuICAgICAgZnJhbWVNYXBbaWR4XSA9IHJlc3VsdFxuICAgIG1heExlbiA9IE1hdGguZmxvb3IobWF4TGVuLzIpXG5cbiAgcGFyc2VWYWxzOih2MSwgdjIpLT5cbiAgICAjIHNpbmNlIHRoZSB2YWx1ZXMgcmV0dXJuZWQgYnkgalF1ZXJ5J3MgY3NzIG1ldGhvZCBhcmUgaW4gcHgsIHdlIGNhbiBqdXN0XG4gICAgIyBhZGQgdGhlIHZhbHVlcy4gbWF5IHdhbnQgdG8gZ2V0IHRoZXNlIGluIGEgZGlmZmVyZW50IHdheSBpbiB0aGUgZnV0dXJlIHRob3VnaFxuICAgICNcbiAgICBwYXJzZUludCh2MSwgMTApICsgcGFyc2VJbnQodjIsIDEwKVxuXG4gIHNpemVDb2x1bW5zOigpLT5cbiAgICBhcnRpY2xlcyA9ICQoJ1tkYXRhLWFydGljbGVdJylcbiAgICBlbGVtUG9zID0gMFxuICAgIHByZXZQb3MgPSAwXG4gICAgY29sQ291bnQgPSAwXG4gICAgY29sdW1ucyA9IFtdXG4gICAgYXJ0aWNsZXMuZWFjaCAoaSwgYXJ0aWNsZSkgPT5cbiAgICAgIGFydGljbGUgPSAkKGFydGljbGUpXG4gICAgICBhcnRpY2xlLmFwcGVuZCgnPHNwYW4gY2xhc3M9XCJtcmtcIi8+JylcbiAgICAgIG1hcmtlciA9ICQoJy5tcmsnKVxuXG4gICAgICByZWFkZXIgPVxuICAgICAgICB3aWR0aDogZnJhbWVXaWR0aFxuICAgICAgICBsZWZ0OiBmcmFtZS5vZmZzZXQoKS5sZWZ0XG4gICAgICAgIHNjcm9sbFBvczogZnJhbWUuc2Nyb2xsTGVmdCgpXG5cbiAgICAgICMgaW5uZXIgZGltcyBvZiByZWFkZXIgZWxlbWVudCwgYWNjb3VudCBmb3IgMSBvciAyIGNvbHVtbiBmcmFtZXNcbiAgICAgIHJlYWRlck9mZnNldCA9IGlmIHRvdWNoIHRoZW4gcmVhZGVyLmxlZnQgLSAzMCBlbHNlIHJlYWRlci5sZWZ0ICogMiAjIFRPRE86IGFic3RyYWN0IGFuZCBzdG9yZSB0aGVzZSBjYWxjdWxhdGlvbnMgaW4gdmFyaWFibGVzXG5cbiAgICAgICMgc2luZ2xlIHBhZ2Ugd2lkdGgsIGluY2x1ZGluZyBpbm5lciBwYWdlIHBhZGRpbmdcbiAgICAgIHBhZ2VXaWR0aCA9IGlmIHRvdWNoIHRoZW4gcmVhZGVyLndpZHRoIGVsc2UgcmVhZGVyLndpZHRoIC8gMiArIHJlYWRlci5sZWZ0XG5cbiAgICAgICMgbWFya2VyIHJlbGF0ZXMgdG8gcHJldi4gcGFnZSdzIGJlZ2lubmluZ1xuICAgICAgcGFnZVBvcyA9IChyZWFkZXIuc2Nyb2xsUG9zICsgbWFya2VyLm9mZnNldCgpLmxlZnQpIC0gcmVhZGVyT2Zmc2V0ICsgcGFnZVdpZHRoXG5cbiAgICAgIGVsZW1Qb3MgPSBwcmV2UG9zIG9yIDBcbiAgICAgIHByZXZQb3MgPSBpZiBwYWdlUG9zIDwgMCB0aGVuIDAgZWxzZSBwYWdlUG9zXG4gICAgICBjb2xDb3VudCA9IE1hdGguY2VpbCgocHJldlBvcyAtIGVsZW1Qb3MpIC8gcGFnZVdpZHRoKVxuICAgICAgY29sdW1ucy5wdXNoKGNvbENvdW50KVxuXG4gICAgICAjIHRvcC9ib3R0b20gbWFyZ2lucyBtZXNzIHVwIG91ciBtZWFzdXJlbWVudHMgb24gYnJvd3NlcnMgdGhhdCBkb24ndFxuICAgICAgIyBzdXBwb3J0IENTUzMgY29sdW1uLWJyZWFrLCBhcyB0aGV5J3JlIG5vdCB0YWtlbiBpbnRvIGFjY291bnQgaW4gdGhlXG4gICAgICAjIGNvbHVtbiBoZWlnaHQuIHJlcGxhY2luZyB0aGVtIHdpdGggcGFkZGluZyB0byBnZXQgYW4gYWNjdXJhdGUgY291bnQuXG4gICAgICAjIGEgc3RhYmxlIHNvbHV0aW9uIG9idmlvdXNseSBuZWVkcyB0byBiZSBpbXBsZW1lbnRlZCwgYWx0aG91Z2hcbiAgICAgICMgcmV3cml0aW5nIHRoZSBzcGFjaW5nIG9uIGhlYWRlcnMgc2VlbXMgdG8gd29yayBmb3IgdGhlIHRpbWUgYmVpbmcuXG4gICAgICAjIGRvZXNuJ3QgYXBwbHkgdG8gaU9TL21vYmlsZSwgc28gd2Ugd29uJ3QgcnVuIG9uIHRoZXNlIHBsYXRmb3Jtcy5cbiAgICAgICNcbiAgICAgIGlmIHRvdWNoID09IGZhbHNlXG5cbiAgICAgICAgZWxlbXMgPSBhcnRpY2xlLmZpbmQoJ2gxLGgyLGgzLGg0LGg1LGg2JylcbiAgICAgICAgZWxlbXMuZWFjaCAoaSwgZWxlbSk9PlxuXG4gICAgICAgICAgbVRvcCA9ICQoZWxlbSkuY3NzKCdtYXJnaW4tdG9wJylcbiAgICAgICAgICBtQm90ID0gJChlbGVtKS5jc3MoJ21hcmdpbi1ib3R0b20nKVxuXG4gICAgICAgICAgcFRvcCA9ICQoZWxlbSkuY3NzKCdwYWRkaW5nLXRvcCcpXG4gICAgICAgICAgcEJvdCA9ICQoZWxlbSkuY3NzKCdwYWRkaW5nLWJvdHRvbScpXG5cbiAgICAgICAgICAkKGVsZW0pLmNzcyhcbiAgICAgICAgICAgICdtYXJnaW4tdG9wJzogMFxuICAgICAgICAgICAgJ3BhZGRpbmctdG9wJzogQHBhcnNlVmFscyhtVG9wLCBwVG9wKVxuICAgICAgICAgIClcbiAgICAgICAgICAkKGVsZW0pLmNzcyhcbiAgICAgICAgICAgICdtYXJnaW4tYm90dG9tJzogMFxuICAgICAgICAgICAgJ3BhZGRpbmctYm90dG9tJzogQHBhcnNlVmFscyhtQm90LCBwQm90KVxuICAgICAgICAgIClcblxuICAgICAgICAgIGFydGljbGUuaGVpZ2h0KGZyYW1lLmhlaWdodCgpICogY29sQ291bnQpXG5cbiAgICAgIGFydGljbGUuYXR0cignZGF0YS1vZmZzZXQtbGVmdCcsIGVsZW1Qb3MpXG5cbiAgICAgIG1hcmtlci5yZW1vdmUoKVxuXG4gICAgICBpZiBpID09IGFydGljbGVzLmxlbmd0aCAtIDFcbiAgICAgICAgQG1hcENvbHVtbnMoKVxuICAgICAgICBzZXRUaW1lb3V0ICgoKSA9PiBAcmV0dXJuVG9Qb3MoKSksIDBcblxuICBiaW5kOigpLT5cbiAgICBfa2V5UHJlc3MgICAgICA9IEBfa2V5UHJlc3NcbiAgICBfc2Nyb2xsQ2hhcHRlciA9IEBfc2Nyb2xsQ2hhcHRlclxuICAgIF90b2dnbGVOYXYgICAgID0gQF90b2dnbGVOYXZcbiAgICBfc2Nyb2xsVG9FbCAgICA9IEBfc2Nyb2xsVG9FbFxuICAgIF9ib3VuY2VSZXNpemUgID0gUmVhZGVyOjpVdGlscy5kZWJvdW5jZSAoKT0+XG4gICAgICBAc2V0Q29sR2FwKClcbiAgICAgIEBzZXRGcmFtZVdpZHRoKClcbiAgICAgIEBzaXplQ29sdW1ucygpXG4gICAgLCBkZWxheVxuXG4gICAgJChkb2N1bWVudCkub24gJ2tleWRvd24nLCBfa2V5UHJlc3NcbiAgICAkKGRvY3VtZW50KS5vbiAnY2xpY2snLCAnLmRvYy1saW5rJywgX3Njcm9sbENoYXB0ZXJcbiAgICAkKEBzZXR0aW5ncy5uYXZUb2dnbGUpLm9uICdjbGljaycsIF90b2dnbGVOYXZcbiAgICAkKEBzZXR0aW5ncy5ub3RlKS5vbiAnY2xpY2snLCBfc2Nyb2xsVG9FbFxuICAgICQod2luZG93KS5vbiAncmVzaXplJywgX2JvdW5jZVJlc2l6ZVxuXG4gIGRlc3Ryb3k6KCktPlxuICAgICQoZG9jdW1lbnQpLm9mZiAna2V5ZG93bicsIF9rZXlQcmVzc1xuICAgICQoZG9jdW1lbnQpLm9mZiAnY2xpY2snLCAnLmRvYy1saW5rJywgX3Njcm9sbENoYXB0ZXJcbiAgICAkKEBzZXR0aW5ncy5uYXZUb2dnbGUpLm9mZiAnY2xpY2snLCBfdG9nZ2xlTmF2XG4gICAgJChAc2V0dGluZ3Mubm90ZSkub2ZmICdjbGljaycsIF9zY3JvbGxUb0VsXG4gICAgJCh3aW5kb3cpLm9mZiAncmVzaXplJywgX2JvdW5jZVJlc2l6ZVxuXG4gIHByZXBhcmVTY3JvbGw6KGUpLT5cbiAgICBAcHJldmVudERlZmF1bHQoZSlcbiAgICBpZiBpc1Njcm9sbGluZyB0aGVuIGZyYW1lLnN0b3AodHJ1ZSx0cnVlKVxuICAgIGlzU2Nyb2xsaW5nID0gdHJ1ZVxuXG4gIHNjcm9sbFBhZ2U6KGUsIHBvcywgY2FsbGJhY2spLT5cbiAgICBAcHJlcGFyZVNjcm9sbChlKVxuICAgIGRpc3QgPSBmcmFtZVdpZHRoXG4gICAgY3VyckxlZnQgPSBmcmFtZS5zY3JvbGxMZWZ0KClcbiAgICBkZXN0ID0gKGRpc3QgKiBwb3MpICsgY3VyckxlZnQgKyAoY29sR2FwICogcG9zKVxuICAgIEBhbmltYXRlU2Nyb2xsKGRlc3QsIGNhbGxiYWNrKVxuXG4gIGFuaW1hdGVTY3JvbGw6KGRlc3QsIGNhbGxiYWNrKSAtPlxuICAgIEBjbG9zZU5hdigpXG4gICAgZnJhbWVcbiAgICAgIC5zdG9wKHRydWUsIHRydWUpXG4gICAgICAuYW5pbWF0ZSB7c2Nyb2xsTGVmdDogZGVzdH0sIEBzZXR0aW5ncy5zY3JvbGxTcGVlZCwgKCkgPT5cbiAgICAgICAgaXNTY3JvbGxpbmcgPSBmYWxzZVxuICAgICAgICBpZiBjYWxsYmFjayBhbmQgdHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbidcbiAgICAgICAgICBjYWxsYmFjaygpXG5cbiAgY2xvc2VOYXY6KCktPlxuICAgIG5hdmJhci5yZW1vdmVDbGFzcygnYWN0aXZlJylcblxuXG4gICMgUHJpdmF0ZSBtZXRob2RzXG4gICNcbiAgX3Njcm9sbFRvRWw6KGUsIHNlbGVjdG9yLCBjYWxsYmFjayk9PlxuICAgIEBwcmVwYXJlU2Nyb2xsKGUpXG4gICAgdGFyZ2V0ID0gbnVsbFxuICAgIGlmIHNlbGVjdG9yIGFuZCB0eXBlb2Ygc2VsZWN0b3IgPT0gJ3N0cmluZydcbiAgICAgIHRhcmdldCA9IHNlbGVjdG9yXG4gICAgZWxzZSBpZiBlPy50YXJnZXRcbiAgICAgIHRhcmdldCA9IGUudGFyZ2V0XG4gICAgZWxlbSA9ICQoJCh0YXJnZXQpLmF0dHIoJ2hyZWYnKSlcblxuICAgIGlmICFlbGVtPy5sZW5ndGhcbiAgICAgIHJldHVybiBjb25zb2xlLmVycm9yIFwiRXJyb3I6IEVsZW1lbnQgJyN7c2VsZWN0b3J9JyBkb2Vzbid0IGV4aXN0IGluIHRoZSBkb2N1bWVudC5cIlxuXG4gICAgZWxlbUxlZnQgPSBibG9ja1BhcmVudChlbGVtKS5vZmZzZXQoKS5sZWZ0XG4gICAgY3VyckxlZnQgPSBmcmFtZS5zY3JvbGxMZWZ0KClcbiAgICByZWZXaWR0aCA9IGZyYW1lV2lkdGggKyBjb2xHYXBcblxuICAgIGlmICF0b3VjaFxuICAgICAgZWxlbUxlZnQgLT0gcmVmV2lkdGgvMiArIChjb2xHYXAgKyBvZmZzZXQpXG4gICAgZWxzZVxuICAgICAgZWxlbUxlZnQgLT0gMzBcblxuICAgIHRhcmdldFNwcmVhZCA9IChlbGVtTGVmdCArIGN1cnJMZWZ0KSAvIHJlZldpZHRoXG4gICAgY3VycmVudFNwcmVhZCA9IGN1cnJMZWZ0IC8gcmVmV2lkdGhcblxuICAgIGRpZmYgPSB0YXJnZXRTcHJlYWQgLSBjdXJyZW50U3ByZWFkXG4gICAgZGVzdCA9IGN1cnJMZWZ0ICsgKGRpZmYgKiByZWZXaWR0aClcblxuICAgIGZhc3QgPSBAc2V0dGluZ3MuYW5pbVNwZWVkRmFzdFxuICAgIHNsb3cgPSBAc2V0dGluZ3MuYW5pbVNwZWVkU2xvd1xuXG4gICAgQGFuaW1hdGVTY3JvbGwgZGVzdCwgKCktPlxuICAgICAgZWxlbS5hZGRDbGFzcygnaGlnaGxpZ2h0JykuYWRkQ2xhc3MoJ2hpZ2hsaWdodC1hZGQnKVxuICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICBlbGVtLnJlbW92ZUNsYXNzKCdoaWdobGlnaHQtYWRkJylcbiAgICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICAgIGVsZW0ucmVtb3ZlQ2xhc3MoJ2hpZ2hsaWdodCcpXG4gICAgICAgICwgZmFzdFxuICAgICAgLCBzbG93XG5cbiAgX3Njcm9sbENoYXB0ZXI6KGUsIGNhbGxiYWNrKT0+XG4gICAgQHByZXBhcmVTY3JvbGwoZSlcbiAgICB0YXJnZXQgPSAkKFwiIyN7JChlLnRhcmdldCkuYXR0cignZGF0YS1saW5rJyl9XCIpXG4gICAgZGVzdCA9IHRhcmdldC5hdHRyKCdkYXRhLW9mZnNldC1sZWZ0JylcbiAgICBAYW5pbWF0ZVNjcm9sbChkZXN0LCBjYWxsYmFjaylcblxuICBfa2V5UHJlc3M6KGUpID0+XG4gICAgaWYgZSBhbmQgZS53aGljaFxuICAgICAgc3dpdGNoIGUud2hpY2hcbiAgICAgICAgd2hlbiAyNyB0aGVuIEBjbG9zZU5hdigpXG4gICAgICAgIHdoZW4gMzcgdGhlbiBAc2Nyb2xsUGFnZShlLCAtMSlcbiAgICAgICAgd2hlbiAzOSB0aGVuIEBzY3JvbGxQYWdlKGUsIDEpXG5cbiAgX3RvZ2dsZU5hdjogKGUpPT5cbiAgICBAcHJldmVudERlZmF1bHQoZSlcbiAgICBuYXZiYXIudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpXG5cbiAgIyBib290c3RyYXBcbiAgI1xuICBpbml0aWFsaXplOigpLT5cbiAgICBAc2V0RnJhbWVXaWR0aCgpXG4gICAgQHNldENvbEdhcCgpXG4gICAgQHNpemVDb2x1bW5zKClcbiAgICBAYmluZCgpXG4iXX0=
