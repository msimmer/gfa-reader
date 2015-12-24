class App::Query

  model = (options = {}) ->
    return {
      url      : options.url      || ''
      data     : options.data     || {}
      dataType : options.dataType || ''
      async    : options.async    || true
      cache    : options.cache    || true
      headers  : options.headers  || {}
    }

  constructor: (options = {}) ->

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
