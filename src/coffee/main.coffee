class Reader

  constructor: (@options = {})->

    @query    = new @Query()
    @parse    = new @Parse()
    @layout   = new @Layout()
    @aspect   = new @Aspect()
    @template = new @Template()

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

    @elem   = document.getElementById('reader')
    @pagect = null


  getNavDocument: (that)->
    return (key, val, item)->
      if key == that.nav.attribute and that.nav.regexp.test(val)
        that.nav.elem = item
        that.nav.path = item.getAttribute('href')
        that.xml()

  renderPage: (that, options)->
    return (url, parentId) ->
      that.query.html("#{that.location.assets}/#{url}")
        .done (data)->
          doc = that.template.parse(data, that.location.assets)
          that.layout.render(doc, parentId)
          if not that.pagect -=1 then that.trigger('pagesloaded', {})

  xml: ()->
    curry = @renderPage(@, @options)
    @query.xml("#{@location.assets}/#{@nav.path}")
      .done (data) =>
        @ncx = @parse.nav(data)
        @navMap = @parse.mapNcx(@ncx.navMap.navPoint)
        @layout.build(@navMap, curry)

  build: (data)->
    curry = @getNavDocument(@)
    @pagect = @parse.xml(data, curry).package.spine.itemref.length

  on: (handle, callback) ->
    evt = document.createEvent('CustomEvent')
    evt.initCustomEvent(handle, true, false, {})
    @elem.addEventListener(handle, callback)

  trigger: (handle, data) ->
    @elem.dispatchEvent(new CustomEvent(handle, data))

  initialize: ->
    token = if @options.toc then 'nav' else 'ncx'
    attr = if @options.toc then 'properties' else 'id'
    @nav.regexp = new RegExp("^#{token}$", 'i')
    @nav.attribute = attr
    @query.xml(@options.packageUrl).done (data) => @build(data)

    # see /vendor/jQuery-Scoped-CSS-plugin-master/jquery.scoped.js#109
    # $(document).on 'styles:scoped', () =>
    @trigger('ready', {})


window.Reader = Reader
