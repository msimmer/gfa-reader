class Reader

  proxy    = null
  pagect   = null
  memStore =
    html:{}
    body:{}

  constructor: (@options = {})->

    # create an element to attach event listeners to.  only needs to stay in
    # memory, so not attaching it to the DOM
    #
    proxy = document.createElement('div')
    proxy.id = "_#{Date.now()}";

    @utils    = new @Utils()
    @query    = new @Query()
    @parse    = new @Parse()
    @layout   = new @Layout()
    @template = new @Template()
    @events   = new @Events()
    @swipe    = new @Swipe()

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
    @ncx      = null
    @html     = []
    @metadata = []

    @navElem  = document.getElementById('reader-nav')
    @mainElem = document.getElementById('reader-frame')


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
          if not pagect -=1 then that.trigger('pagesloaded', {})

  xml: ()->
    curry = @renderPage(@)
    @query.xml("#{@location.assets}/#{@nav.path}")
      .done (data) =>
        @ncx = @parse.nav(data)
        @navMap = @parse.mapNcx(@ncx.navMap.navPoint)
        @layout.build(@navMap, curry, @mainElem.id)

  build: (data)->
    curry = @getNavDocument(@)
    pagect = @parse.xml(data, curry).package.spine.itemref.length

  on: (method, callback) ->
    evt = document.createEvent('CustomEvent')
    evt.initCustomEvent(method, true, false, {})
    proxy.addEventListener(method, callback)

  trigger: (method, data) ->
    proxy.dispatchEvent(new CustomEvent(method, data))

  setup:()->
    # Store existing html/body attributes and apply reader attributes
    #
    memStore.html.overflow = $('html').css('overflow')
    memStore.body.overflow = $('body').css('overflow')
    $('html').addClass('reader')
    $('html,body').css({overflow:'hidden'})

  destroy:()=>
    # Reset previous attributes on html/body, and remove proxy element
    #
    $('html').css({overflow:memStore.html.overflow}).removeClass('reader')
    $('body').css({overflow:memStore.body.overflow})
    @events.destroy()
    proxy = undefined

  initialize: =>
    token = if @options.toc then 'nav' else 'ncx'
    attr = if @options.toc then 'properties' else 'id'
    @nav.regexp = new RegExp("^#{token}$", 'i')
    @nav.attribute = attr
    @setup()
    @query.xml(@options.packageUrl).done (data) => @build(data)

    layoutcomplete = false
    observer = new MutationObserver((mutations) =>
      mutations.forEach (mutationRecord) =>
        if !layoutcomplete
          layoutcomplete = true
          @trigger('layoutcomplete', {})
    )

    observer.observe document.body,
      childList: true
      attributes: true
      attributeFilter: ['style']

    # Public event listeners
    #
    @on 'pagesloaded', =>
      console.log 'Reader pagesloaded'
      window.scopedPolyFill(document)

    @on 'layoutcomplete', =>
      console.log 'Reader layoutcomplete'
      @events.initialize()
      setTimeout (() => @trigger('ready', {}) ), 0


    @on 'nextPage', => @events.nextPage()
    @on 'prevPage', => @events.prevPage()

    @on 'ready', =>
      console.log 'Reader ready'
      $(@mainElem).addClass('ready')

      # init scrolling
      #
      @swipe.initialize()

      # some DOM manipulation for link behaviour
      #
      $('a').each (i, el)=>
        $this = $(el)
        if $this.attr('href').match(/^#/)
          return
        else if $this.attr('href').match(/^(?:\/|window.location.host)/)
          $this.on 'click', => @destroy()
        else
          $this.attr('target', '_blank')

    @on 'destroy', =>
      @destroy()

    # Important to destroy our proxy element, as it will continue to have
    # handlers attached unless it's removed
    #
    window.onunload = window.onpopstate = () => @destroy()


window.Reader = Reader
