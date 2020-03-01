if window.MutationObserver
  observer = new MutationObserver((mutations) ->
    mutations.forEach((mutation) ->
      if mutation.type is 'childList' and mutation.addedNodes
        for node in mutation.addedNodes when node.parentNode
          # Remove TA div in body if exist
          if node.tagName and node.tagName.toLowerCase() is 'div' and node.className is 'ad-root'
            node.parentNode.removeChild(node)
            console.warn('deleted TA in body')
    )
  )
  observer.observe(document.body, {childList: true})
