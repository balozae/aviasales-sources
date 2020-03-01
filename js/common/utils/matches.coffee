if (window.Element and !Element.prototype.matches)
  fallback = (selector) ->
    matches = (@parentNode || document).querySelectorAll(selector)
    for element in matches when element == this
      return true
    false
  proto = Element.prototype
  proto.matches = proto.matchesSelector or
    proto.webkitMatchesSelector or
    proto.mozMatchesSelector or
    proto.oMatchesSelector or
    fallback
