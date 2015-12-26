class Reader::Query

  constructor: (@options = {}) ->

  model = (options = {}) ->
    return {
      url      : options.url      or ''
      data     : options.data     or {}
      dataType : options.dataType or ''
      async    : options.async    or true
      cache    : options.cache    or true
      headers  : options.headers  or {}
    }

  request: (options = {})->
    $.ajax
      url      : options.url
      dataType : options.dataType
      cache    : options.cache
      headers  : options.headers

  xml: (url)->
    @request model
      url: url
      dataType:'xml'

  html: (url)->
    @request model
      url: url
      dataType: 'html'
