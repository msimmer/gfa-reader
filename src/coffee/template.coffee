class Reader::Template

  constructor: (@options = {}) ->

    token =
      start : @options.token?.start or '{{'
      end   : @options.token?.end or '}}'
      sep   : @options.token?.sep or '\\s'
      div   : @options.token?.div or '\\|'
    flags = ''
    pattern = "#{token.start}\
               #{token.sep}\
               ([^#{token.sep}]+?)\
               #{token.sep}\
               #{token.div}\
               #{token.sep}\
               ([^#{token.sep}]+?)\
               #{token.sep}\
               #{token.end}"

    @regex = new RegExp(pattern, flags)

  titleCase: (str) ->
    tmp = str.split('')
    tmp[0] = tmp[0].toUpperCase()
    tmp = tmp.join('')

  parse: (str, abspath) ->
    while (match = @regex.exec(str)) != null
      asset = match[1]
      path = "#{abspath}#{@titleCase(match[2])}/#{asset}"

      # currently only images
      #
      elem = "<img alt=\"#{asset}\" src=\"#{path}\"/>"
      str = str.replace(match[0], elem)
    return str


