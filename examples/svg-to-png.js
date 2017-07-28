/*
 * svg-to-png.js
 *
 * Convert SVG data to a PNG data URI
 * Demo: https://jsfiddle.net/romgrk/pvuvLh0a/
 */

function svgToPNG(svg, cb) {
  var img = document.createElement('img')
  var canvas = document.createElement('canvas')

  img.onload = function() {
    canvas.width = img.width
    canvas.height = img.height
    canvas.getContext('2d').drawImage(img, 0, 0)
    cb(canvas.toDataURL('image/png', 1))
  }

  img.src = 'data:image/svg+xml,' +
    svg.replace(/xmlns=["'].*?["']/, '')
       .replace(/<svg(.*?)>/, '<svg $1 xmlns="http://www.w3.org/2000/svg">')
}
