class Reader

  constructor: (@options = {})->

    @query    = new @Query()
    @parse    = new @Parse()
    @layout   = new @Layout()
    @aspect   = new @Aspect()
    @template = new @Template()
    @events   = new @Events()

    @package =
      attributes: null
      guide     : null
      manifest  : null
      metadata  : null
      spine     : null
      text      : null

    @location =
      assets : @options.assets or ''
      url    : "#{window.location.origin}".replace(/\/$/, '')

    @nav =
      elem      : null
      regexp    : null
      path      : null
      attribute : null

    @navMap   = null
    @navUrl   = null
    @ncx      = null
    @navRe    = null
    @html     = []
    @metadata = []

    @navElem  = document.getElementById('reader-nav')
    @mainElem = document.getElementById('reader-frame')
    @pagect   = null
    @pagect   = null
    @delay    = 150


  getNavDocument: (that)->
    return (key, val, item)->
      if key == that.nav.attribute and that.nav.regexp.test(val)
        that.nav.elem = item
        that.nav.path = item.getAttribute('href')
        that.xml()

  renderPage: (that)->
    return (url, parentId, navId) ->
      that.query.html("#{that.location.assets}/#{url}")
        .done (data)->
          doc = that.template.parse(data, that.location.assets)
          that.layout.render(doc, parentId, '#doc-nav')
          if not that.pagect -=1 then that.trigger('pagesloaded', {})

  xml: ()->
    curry = @renderPage(@)
    @query.xml("#{@location.assets}/#{@nav.path}")
      .done (data) =>
        @ncx = @parse.nav(data)
        @navMap = @parse.mapNcx(@ncx.navMap.navPoint)
        @layout.build(@navMap, curry, @mainElem.id)

  build: (data)->
    curry = @getNavDocument(@)
    @pagect = @parse.xml(data, curry).package.spine.itemref.length

  on: (handle, callback) ->
    evt = document.createEvent('CustomEvent')
    evt.initCustomEvent(handle, true, false, {})
    @mainElem.addEventListener(handle, callback)

  trigger: (handle, data) ->
    @mainElem.dispatchEvent(new CustomEvent(handle, data))

  initialize: ->
    token = if @options.toc then 'nav' else 'ncx'
    attr = if @options.toc then 'properties' else 'id'
    @nav.regexp = new RegExp("^#{token}$", 'i')
    @nav.attribute = attr
    @query.xml(@options.packageUrl).done (data) => @build(data)

    layoutcomplete = false
    observer = new MutationObserver((mutations) =>
      mutations.forEach (mutationRecord) =>
        if !layoutcomplete
          layoutcomplete = true
          @trigger('layoutcomplete', {})
        return
      return
    )
    target = document.body
    observer.observe target,
      childList: true
      attributes: true
      attributeFilter: [ 'style' ]

    @on 'pagesloaded', =>
      console.log 'Reader pagesloaded'

    @on 'layoutcomplete', =>
      console.log 'Reader layoutcomplete'
      @events.frameWidth = @events.setFrameWidth()
      @events.colGap = @events.setColGap()
      @events.setArticlePos()
      @events.bindElems()

      setTimeout => @trigger('ready', {})

    @on 'ready', =>
      console.log 'Reader ready'
      $(@mainElem).css({opacity:1})

    bounceResize = @events.debounce ()=>
      @events.setColGap()
      @events.setFrameWidth()
      @events.setArticlePos()
    , @delay

    bounceReturnToPos = @events.debounce ()=>
      # this should be called by `setArticlePos()` instead of settimeout
      @events.returnToPos()
    , @delay * 2

    $(window).on 'resize', bounceReturnToPos
    $(window).on 'resize', bounceResize


window.Reader = Reader
