class Reader::Swipe

  defaults =
    reader : '#reader-frame'

  frame                = null
  readerId             = null

  _support             = undefined
  _addPrefix           = ''
  _removePrefix        = ''
  _addEventListener    = undefined
  _addWheelListener    = undefined
  _removeEventListener = undefined
  _removeWheelListener = undefined

  constructor:(@options = {}) ->
    @settings = $.extend({}, @options, defaults)
    readerId = @settings.reader.slice(1)
    _support = if 'onwheel' of document.createElement('div') then 'wheel' else if document.onmousewheel != undefined then 'mousewheel' else 'DOMMouseScroll'
    frame = $(@settings.reader)

  bind:()->
    @doScroll = Reader::Utils.debounce (e) =>
      if e.deltaX >= 1
        Reader::trigger('nextPage', {})
      else if e.deltaX <= -1
        Reader::trigger('prevPage', {})
    , 50, true

    _doScroll = (e)=>
      e.preventDefault()
      @doScroll(e)

    @addWheelListener(document.getElementById(readerId), _doScroll, false)

  doScroll: () ->
  addWheelListener:()->
  removeWheelListener:()->

  destroy:() =>
    @removeWheelListener(document.getElementById(readerId), _doScroll)

  compatRemove:(_this)->
    if window.removeEventListener
      _removeEventListener = 'removeEventListener'
    else
      _removeEventListener = 'detachEvent'
      _removePrefix = 'on'

    _this.removeWheelListener = (elem, callback) ->
      _removeWheelListener elem, _support, callback
      if _support == 'DOMMouseScroll'
        _removeWheelListener elem, 'MozMousePixelScroll', callback

    _removeWheelListener = (elem, eventName, callback) ->
      elem[_removeEventListener](_removePrefix + eventName, callback)


  # shim for attaching events to `wheel` given browser incompatibilities,
  # taken from https://developer.mozilla.org/en-US/docs/Web/Events/wheel
  #
  compatAdd:(_this)->

    if window.addEventListener
      _addEventListener = 'addEventListener'
    else
      _addEventListener = 'attachEvent'
      _addPrefix = 'on'

    _this.addWheelListener = (elem, callback, useCapture) ->
      _addWheelListener elem, _support, callback, useCapture
      if _support == 'DOMMouseScroll'
        _addWheelListener elem, 'MozMousePixelScroll', callback, useCapture

    _addWheelListener = (elem, eventName, callback, useCapture) ->
      elem[_addEventListener](_addPrefix + eventName, (if _support == 'wheel' then callback else (originalEvent)->
        !originalEvent and (originalEvent = window.event)
        event =
          originalEvent: originalEvent
          target: originalEvent.target or originalEvent.srcElement
          type: 'wheel'
          deltaMode: if originalEvent.type == 'MozMousePixelScroll' then 0 else 1
          deltaX: 0
          deltaZ: 0
          preventDefault: (->
            if originalEvent.preventDefault then originalEvent.preventDefault() else (originalEvent.returnValue = false)
            return
          )
        if _support == 'mousewheel'
          event.deltaY = -1 / 40 * originalEvent.wheelDelta
          originalEvent.wheelDeltaX and (event.deltaX = -1 / 40 * originalEvent.wheelDeltaX)
        else
          event.deltaY = originalEvent.detail
        callback event
      ), useCapture or false)

  initialize:()->
    @compatAdd(@)
    @compatRemove(@)
    @bind()
