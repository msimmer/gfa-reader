class Reader::Utils

  # https://davidwalsh.name/javascript-debounce-function
  @debounce: (func, wait, immediate) ->
    timeout = undefined
    ->
      context = this
      args = arguments
      later = ->
        timeout = null
        if !immediate
          func.apply context, args
      callNow = immediate and !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if callNow
        func.apply context, args
