var initialized = false

var get_random_color = function() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16)
}

var setup = function() {
  var all_elements = document.querySelectorAll('*'),
    l = all_elements.length,
    el

  for (var i = 0; i < l; i++) {
    el = all_elements[i]
    el.style.transition = 'color 1s, background-color 1s'
  }
}

var randomize_colors = function() {
  if (!initialized) {
    setup()
    initialized = true
  }

  var all_elements = document.querySelectorAll('*'),
    l = all_elements.length,
    el

  for (var i = 0; i < l; i++) {
    if (Math.round(Math.random())) {
      el = all_elements[i]
      el.style.color = get_random_color()
      el.style.backgroundColor = get_random_color()
    }
  }
}

if (/velo/.test(document.location.search)) {
  setInterval(randomize_colors, 1000)
}

module.exports = randomize_colors
