class Reader::Events

  constructor: (@options = {}) ->

    # these should be fed in on init
    @defaults =
      reader    : '#reader-frame'
      docNav    : '#doc-nav'
      navToggle : '[data-nav=contents]'
      chBack    : '[data-nav=chBack]'
      chFwd     : '[data-nav=chFwd]'
      pgBack    : '[data-nav=pgBack]'
      pgFwd     : '[data-nav=pgFwd]'
      speed     : 400

    @isScrolling     = false
    @triggeredScroll = false
    @minScroll       = -12
    @maxScroll       = 12
    @offset          = 15
    @clickEvt        = if 'ontouchstart' of document.documentElement then 'touchend' else 'click'
    @elemPos         = null
    @prevPos         = null
    @currSpread      = null
    @maxLen          = null

    @columns         = []
    @frameMap        = []

    @settings        = $.extend({}, @options, @defaults)

    @frame           = $(@settings.reader)
    @navbar          = $(@settings.docNav)

  preventDefault:(e)->
    if e and e.originalEvent
      e.preventDefault()
      e.stopPropagation()

  debounce: (func, wait, immediate) ->
    timeout = undefined
    ->
      context = this
      args = arguments
      later = ->
        timeout = null
        if !immediate
          func.apply context, args
      callNow = immediate and !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if callNow
        func.apply context, args

  setColGap:()->
    @colGap = parseInt(@frame.css('column-gap'), 10)

  setFrameWidth:()->
    @frameWidth = @frame.width()

  closestPos: (num, arr) ->
    currPos = 0
    currIdx = 0
    diff = Math.abs(num - currPos)
    for item1, idx in arr
      for item2, val in arr[idx]
        newdiff = Math.abs(num - arr[idx][val])
        if (newdiff < diff)
          diff = newdiff
          currPos = arr[idx][val]
          currIdx = idx
    return {idx: currIdx, pos: currPos}

  returnToPos:()->
    closest = @closestPos(@frame.scrollLeft(), @frameMap)
    @prepareScroll()
    @animateScroll(closest.pos, null, closest.idx)

  mapColumns:()->
    @frameMap = []
    @maxLen = 0
    screenW = 0
    @columns.map (cols, idx)=>

      result = []
      @maxLen += cols

      if cols == 1
        result.push(screenW)
        screenW += @frameWidth / 2 + @colGap - @offset * 1.5

      else if cols >= 2
        panels = Math.ceil(cols/2)
        for i in [1..panels]
          result.push(screenW)
          screenW += @frameWidth + @colGap

      @frameMap[idx] = result
    @maxLen = Math.floor(@maxLen/2)

  setArticlePos:()->
    articles = $('[data-article]')
    @elemPos = 0
    @prevPos = 0
    @columns = []
    articles.each (i, el) =>
      el = $(el)
      el.append('<span class="mrk"/>')
      marker = $('.mrk')

      reader =
        width: @frameWidth
        left: @frame.offset().left
        scrollPos: @frame.scrollLeft()

      # inner dims of reader element
      readerOffset = reader.left * 2
      # single page width, including inner page padding
      pageWidth = reader.width / 2 + reader.left
      # marker relates to prev. page's beginning
      pagePos = (reader.scrollPos + marker.offset().left) - readerOffset + pageWidth

      @elemPos = @prevPos or 0
      @prevPos = if pagePos < 0 then 0 else pagePos

      @columns.push(Math.ceil((@prevPos - @elemPos) / pageWidth))

      el.attr('data-offset-left', @elemPos)
      marker.remove()

      if i == articles.length - 1 then @mapColumns()

  bindElems:()->
    $(document).on 'keydown', (e)              => @keyPress(e)
    $(document).on @clickEvt, '.doc-link', (e) => @scrollChapter(e)
    $(@settings.navToggle).on @clickEvt, (e)   => @toggleNav(e)
    $(@settings.chFwd).on @clickEvt, (e)       => @scrollChapter(e, 1)
    $(@settings.chBack).on @clickEvt, (e)      => @scrollChapter(e, -1)
    $(@settings.pgFwd).on @clickEvt, (e)       => @scrollPage(e, 1)
    $(@settings.pgBack).on @clickEvt, (e)      => @scrollPage(e, -1)

  prepareScroll:(e)->
    @preventDefault(e)
    if @isScrolling then @frame.stop(true,true)
    @isScrolling = true

  scrollPage:(e, pos, callback)->
    @prepareScroll(e)
    dist = @frameWidth
    currLeft = @frame.scrollLeft()
    dest =  (dist * pos) + currLeft + (@colGap * pos)
    @animateScroll(dest, callback, pos)

  scrollChapter:(e, callback)->
    @prepareScroll(e)
    target = $("##{$(e.target).attr('data-link')}")
    dest = target.attr('data-offset-left')
    @animateScroll(dest, callback)

  animateScroll:(dest, callback, pos) ->
    @closeNav()
    @frame
      .stop(true, true)
      .animate {scrollLeft: dest}, () =>
        @isScrolling = false
        idx = parseInt("#{@currSpread + pos}", 10)
        @currSpread = if idx < 0 then 0 else if idx > @maxLen then @maxLen else idx
        if callback and typeof callback == 'function' then callback()

  closeNav:()->
    @navbar.removeClass('active')

  keyPress:(e) ->
    if e and e.which
      switch e.which
        when 27 then @closeNav()
        when 37 then @scrollPage(e, -1)
        when 39 then @scrollPage(e, 1)

  toggleNav: (e)->
    @preventDefault(e)
    @navbar.toggleClass('active')
