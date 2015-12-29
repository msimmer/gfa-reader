class Reader::Parse

  trim = (val)->
    val.replace(/^[#@]/, '')

  constructor: (options = {}) ->

  xml: (data, callback) =>
    obj = {}
    if data.nodeType == 1
      # element
      # do attributes
      if data.attributes.length > 0
        obj['attributes'] = {}
        j = 0
        while j < data.attributes.length
          attribute = data.attributes.item(j)
          nodeName = trim(attribute.nodeName)
          obj['attributes'][nodeName] = attribute.nodeValue
          if callback and typeof callback == 'function'
            callback(nodeName, attribute.nodeValue, data)
          j++
    else if data.nodeType == 3
      # text
      obj = data.nodeValue
    # do children
    if data.hasChildNodes()
      i = 0
      while i < data.childNodes.length
        item = data.childNodes.item(i)
        nodeName = trim(item.nodeName)
        if typeof obj[nodeName] == 'undefined'
          obj[nodeName] = @xml(item, callback)
        else
          if typeof obj[nodeName].push == 'undefined'
            old = obj[nodeName]
            obj[nodeName] = []
            obj[nodeName].push old
          obj[nodeName].push @xml(item, callback)
        i++
    obj

  nav: (resp)->
    res = data = @xml(resp).ncx
    if data.length > 1
      for item in data
        if /http:\/\/www\.daisy\.org\/z3986\/2005\/ncx\/?/.test(item.attributes?.xmlns)
          res = item
          break
    return res

  mapNcx: (arr)=>
    map = []
    for item in arr
      obj =
        id: item.attributes.id
        playOrder: item.attributes.playOrder

        # TODO clean whitespace, reduce array
        navLabel: item.navLabel.text[1].text
        src: item.content.attributes.src
      if item.navPoint?.length
        obj.navPoint = @mapNcx(item.navPoint)
      map.push obj
    return map





