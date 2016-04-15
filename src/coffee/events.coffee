class Reader::Events

  isScrolling     = false
  triggeredScroll = false
  scrollTimer     = null
  minScroll       = -12
  maxScroll       = 12
  offset          = 15 # TODO: move this to frmDims obj
  elemPos         = null
  prevPos         = null
  currSpread      = null
  maxLen          = null
  touch           = null

  colGap          = null
  frameWidth      = null

  frame           = null
  frmDims         = {}
  navbar          = null

  columns         = []
  frameMap        = []

  delay           = 150


  # Store handlers in private variables so that we can unbind them later
  #
  _keyPress      = null
  _scrollChapter = null
  _toggleNav     = null
  _scrollToEl    = null
  _bounceResize  = null

  defaults =
    reader        : '#reader-frame'
    docNav        : '#doc-nav'
    navToggle     : '[data-nav=contents]'
    chBack        : '[data-nav=chBack]'
    chFwd         : '[data-nav=chFwd]'
    pgBack        : '[data-nav=pgBack]'
    pgFwd         : '[data-nav=pgFwd]'
    btnNote       : 'a.btn-note'
    btnNoteClose  : 'a.note-close'
    scrollSpeed   : 400
    animSpeedFast : 500
    animSpeedSlow : 1000


  # helpers
  #
  blocks = 'address article aside blockquote canvas dd div dl fieldset figcaption figure figcaption footer form h1 h2 h3 h4 h5 h6 header hgroup hr li main nav noscript ol output p pre section table tfoot ul video'
  blocksArr = blocks.split(' ')
  blocksSel = blocksArr.join(',')

  blockParent = (elem) ->
    if blocksArr.indexOf(elem[0].nodeName.toLowerCase()) > -1
      return elem
    else blockParent(elem.parent())

  constructor: (options = {}) ->

    @settings   = $.extend({}, options, defaults)
    frame       = $(@settings.reader)
    navbar      = $(@settings.docNav)
    touch       = Modernizr.touch
    frmDims =
      top: frame.offset().top
      left: frame.offset().top
      gap: parseInt(frame.css('column-gap'), 10)

    # convenience methods, publicly available
    #
    @nextPage = (callback)           -> @scrollPage(null, 1, callback)
    @prevPage = (callback)           -> @scrollPage(null, -1, callback)
    @scrollTo = (selector, callback) -> @_scrollToEl(null, selector, callback)


  preventDefault:(e)->
    if e and e.originalEvent
      e.preventDefault()
      e.stopPropagation()

  resizeImages:()->
    $('img').each (i, o)=>
      @setImageSize.call($(o)[0])

  setImageSize:()->
    $this = $(@)
    readerInnerHeight = frame.height()
    if @naturalHeight > @naturalWidth
      $this.css({'max-height':'100%'})
      $this.parent('.img').css({'max-height': readerInnerHeight, 'height': readerInnerHeight})

  setColGap:()->
    # default returns px value despite being set in ems/rems
    colGap = parseInt(frame.css('column-gap'), 10)

  setFrameWidth:()->
    frameWidth = frame.width()

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
    closest = @closestPos(frame.scrollLeft(), frameMap)
    @prepareScroll()
    @animateScroll(closest.pos, null, closest.idx)

  mapColumns:()->
    frameMap = []
    maxLen = 0
    screenW = 0
    columns.map (cols, idx)=>

      result = []
      maxLen += cols

      if cols == 1
        result.push(screenW)
        screenW += frameWidth / 2 + colGap - offset * 1.5 # TODO: abstract and store these calculations in variables

      else if cols >= 2
        panels = Math.ceil(cols/2)
        for i in [1..panels]
          result.push(screenW)
          screenW += frameWidth + colGap

      frameMap[idx] = result
    maxLen = Math.floor(maxLen/2)

  parseVals:(v1, v2)->
    # since the values returned by jQuery's css method are in px, we can just
    # add the values. may want to get these in a different way in the future though
    #
    parseInt(v1, 10) + parseInt(v2, 10)

  sizeColumns:()->
    articles = $('[data-article]')
    elemPos = 0
    prevPos = 0
    colCount = 0
    columns = []
    articles.each (i, article) =>
      article = $(article)
      article.append('<span class="mrk"/>')
      marker = $('.mrk')

      reader =
        width: frameWidth
        left: frame.offset().left
        scrollPos: frame.scrollLeft()

      # inner dims of reader element, account for 1 or 2 column frames
      readerOffset = if touch then reader.left - 30 else reader.left * 2 # TODO: abstract and store these calculations in variables

      # single page width, including inner page padding
      pageWidth = if touch then reader.width else reader.width / 2 + reader.left

      # marker relates to prev. page's beginning
      pagePos = (reader.scrollPos + marker.offset().left) - readerOffset + pageWidth

      elemPos = prevPos or 0
      prevPos = if pagePos < 0 then 0 else pagePos
      colCount = Math.ceil((prevPos - elemPos) / pageWidth)
      columns.push(colCount)

      # top/bottom margins mess up our measurements on browsers that don't
      # support CSS3 column-break, as they're not taken into account in the
      # column height. replacing them with padding to get an accurate count.
      # a stable solution obviously needs to be implemented, although
      # rewriting the spacing on headers seems to work for the time being.
      # doesn't apply to iOS/mobile, so we won't run on these platforms.
      #
      if touch == false

        elems = article.find('h1,h2,h3,h4,h5,h6')
        elems.each (i, elem)=>

          mTop = $(elem).css('margin-top')
          mBot = $(elem).css('margin-bottom')

          pTop = $(elem).css('padding-top')
          pBot = $(elem).css('padding-bottom')

          $(elem).css(
            'margin-top': 0
            'padding-top': @parseVals(mTop, pTop)
          )
          $(elem).css(
            'margin-bottom': 0
            'padding-bottom': @parseVals(mBot, pBot)
          )

          # article.height(frame.height() * colCount)

      article.attr('data-offset-left', elemPos)

      marker.remove()

      if i == articles.length - 1
        @mapColumns()
        setTimeout (() => @returnToPos()), 0

  bind:()->
    _keyPress      = @_keyPress
    _scrollChapter = @_scrollChapter
    _toggleNav     = @_toggleNav
    _scrollToEl    = @_scrollToEl
    _noteClick     = @_noteClick
    _noteClose     = @_noteClose
    _bounceResize  = Reader::Utils.debounce ()=>
      @resizeImages()
      @setColGap()
      @setFrameWidth()
      @sizeColumns()
    , delay

    $(document).on 'keydown', _keyPress
    $(document).on 'click', '.doc-link', _scrollChapter
    $(@settings.navToggle).on 'click', _toggleNav
    $(@settings.btnNote).on 'click', _noteClick
    $(@settings.btnNoteClose).on 'click', _noteClose
    $(window).on 'resize', _bounceResize

  destroy:()->
    $(document).off 'keydown', _keyPress
    $(document).off 'click', '.doc-link', _scrollChapter
    if $(@settings.navToggle).length
      $(@settings.navToggle).off 'click', _toggleNav
    if $(@settings.btnNote).length
      $(@settings.btnNote).off 'click', _noteClick
    if $(@settings.btnNoteClose).length
      $(@settings.btnNoteClose).off 'click', _noteClose

    $(window).off 'resize', _bounceResize

  prepareScroll:(e)->
    @preventDefault(e)
    @hideCaptions()
    if isScrolling then frame.stop(true,true)
    isScrolling = true

  scrollPage:(e, pos, callback)->
    @prepareScroll(e)
    dist = frameWidth
    currLeft = frame.scrollLeft()
    dest = (dist * pos) + currLeft + (colGap * pos)
    @animateScroll(dest, callback)

  animateScroll:(dest, callback) ->
    @closeNav()
    frame
      .stop(true, true)
      .animate {scrollLeft: dest}, @settings.scrollSpeed, () =>
        isScrolling = false
        if callback and typeof callback == 'function'
          callback()

  closeNav:()->
    navbar.removeClass('active')

  hideCaptions:()->
    $(@settings.btnNote).each ->
      if $(@).hasClass('visible')
        $(@).triggerHandler 'click'

  toggleNote:(target, ref)->
    note = $("[data-note=\"#{ref}\"]")
    button = $(target)
    button.toggleClass('visible')
    if note.hasClass('visible')
      note.removeClass('visible').removeClass('opaque')
    else
      note.addClass('visible')
      setTimeout =>
        if touch
          note.css(
            top: 15
            right:15
            bottom:15
            left: 15
          )
        else
          cT = $(window).height() / 2 - note.height() / 2
          cL = $(window).width() / 2 - note.width() / 2
          note.css(
            top: if cT < 15 then 15 else cT
            left: if cL < 15 then 15 else cL
          )
        note.addClass('opaque')
      , 0


  # Private methods
  #
  _noteClose:(e)=>
    @preventDefault(e)
    @hideCaptions()

  _noteClick:(e)=>
    @preventDefault(e)
    target = e.target
    ref = $(target).attr('data-note-toggle')
    @toggleNote(target, ref)

  _scrollToEl:(e, selector, callback)=>
    @prepareScroll(e)
    target = null
    if selector and typeof selector == 'string'
      target = selector
    else if e?.target
      target = e.target
    elem = $($(target).attr('href'))

    if !elem?.length
      return console.error "Error: Element '#{selector}' doesn't exist in the document."

    elemLeft = blockParent(elem).offset().left
    currLeft = frame.scrollLeft()

    if !touch
      elemLeft -= frameWidth/2 + (colGap + offset)
    else
      elemLeft -= frmDims.left

    targetSpread = (elemLeft + currLeft) / frameWidth
    currentSpread = currLeft / frameWidth

    diff = targetSpread - currentSpread
    dest = currLeft + (diff * frameWidth)

    fast = @settings.animSpeedFast
    slow = @settings.animSpeedSlow

    @animateScroll dest, ()->
      elem.addClass('highlight').addClass('highlight-add')
      setTimeout ->
        elem.removeClass('highlight-add')
        setTimeout ->
          elem.removeClass('highlight')
        , fast
      , slow

  _scrollChapter:(e, callback)=>
    @prepareScroll(e)
    target = $("##{$(e.target).attr('data-link')}")
    dest = target.attr('data-offset-left')
    @animateScroll(dest, callback)

  _keyPress:(e) =>
    if e and e.which
      switch e.which
        when 27 then @closeNav()
        when 37 then @scrollPage(e, -1)
        when 39 then @scrollPage(e, 1)

  _toggleNav: (e)=>
    @preventDefault(e)
    navbar.toggleClass('active')

  # bootstrap
  #
  initialize:()->
    $('img').each (i, o)=>
      $(o)[0].onload = @setImageSize
    @resizeImages()
    @setFrameWidth()
    @setColGap()
    @sizeColumns()
    @bind()
