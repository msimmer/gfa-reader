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
      type = match[2]

      console.log type
      dir = if type == 'audio' or type == 'video' then 'misc' else type
      path = "#{abspath}#{@titleCase(dir)}/#{asset}"
      elem = null

      if type == 'images'
        elem = "<img alt=\"#{asset}\" src=\"#{path}\"/>"
      else if type == 'audio'
        elem = "<audio src=\"#{path}\" controls=\"controls\" preload=\"none\"></audio>"

      str = str.replace(match[0], elem)

    return str
