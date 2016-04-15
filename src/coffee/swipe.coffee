class Reader::Swipe

  frame   = null
  frameId = null
  hammer  = null

  defaults =
    reader: '#reader-frame'
    touchOptions: {}

  _hammerCtrl = null

  constructor: (@options = {})->
    @settings = $.extend({}, defaults, @options)
    frame = $(@settings.reader)
    frameId = @settings.reader.slice(1)

  bind:()->
    # if 'ontouchstart' of document.documentElement
    #   document.body.ontouchstart = (e)-> return

  destroy:()->
    _hammerCtrl.destroy() if _hammerCtrl

  swipeLeft:()-> Reader::trigger('nextPage')
  swipeRight:()-> Reader::trigger('prevPage')

  setup:()->
    _hammerCtrl = new Hammer.Manager(document.getElementById(frameId),
      recognizers:[
        [Hammer.Swipe, { direction: Hammer.DIRECTION_ALL }]
      ]
    )

    _hammerCtrl.on 'swipe', (e)=>
      if e.deltaX < 0 then @swipeLeft()
      else if e.deltaX > 0 then @swipeRight()

  initialize:()=>
    @bind()
    @setup()
