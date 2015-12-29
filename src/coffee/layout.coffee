class Reader::Layout

  constructor: (@options = {}) ->
    @pos = 0
    @frame = null

  parent: (elem, attrs) ->
    return $("<#{elem} />").attr(attrs)

  child: (elem, attrs, props) ->
    $elem = $("<#{elem} />").attr(attrs)
    if props
      for key, val of props
        if typeof key == 'function'
          callback = key
        else if typeof $.fn[key] == 'function'
          callback = $.fn[key]
        callback.call($elem, val)
    return $elem

  add: (elem, parent)->
    parent.append(elem)
    return elem

  build: (data, callback, parentId, navId)->
    for item, index in data
      @pos+=1
      parentAttrs =
        id:item.id
        'data-article':@pos
      childAttrs =
        'data-label':item.navLabel
        'data-src':item.src

      @frame = $("##{parentId}")
      frame = @add(@parent('article', parentAttrs), @frame)
      @add(@child('section', childAttrs), frame)

      @nav = $("#doc-nav ol")
      nav = @add(@parent('li', {}), @nav)
      @add(@child('a', {
          'href':'#'
          'class':'doc-link'
          'data-link': item.id
        }, {
          'text':item.navLabel
        }), nav)

      # callback gets and renders loading html pages, dropping them into the
      # appropriate dom elements
      #
      callback(item.src, item.id)

      if item.navPoint?.length
        @frame = frame
        @nav = nav
        @build(item.navPoint, callback, @frame, navId)

    return item

  render: (doc, id) ->
    $("##{id}").append(doc)

