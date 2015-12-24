class App::Layout

  constructor: (options = {}) ->
    @pos = 0
    @frame = null

  parent: () ->
    return $("<article />").attr('data-article':@pos)

  child: (attrs) ->
    return $("<section />").attr(attrs).text("#{@pos} : #{attrs['data-label']}")

  add: (elem, parent)->
    parent.append(elem)
    return elem

  build: (data, callback, parent)->
    for item, index in data
      @pos+=1
      attrs =
        id:item.id
        'data-label':item.navLabel
        'data-src':item.src

      if !parent then @frame = $('main')

      frame = @add(@parent(), @frame)
      @add(@child(attrs), frame)

      # callback gets and renders loading html pages, dropping them into the
      # appropriate dom elements
      #
      callback(item.src, item.id)

      if item.navPoint?.length
        @frame = frame
        @build(item.navPoint, callback, @frame)

  render: (doc, id) ->
    $("##{id}").append(doc)

