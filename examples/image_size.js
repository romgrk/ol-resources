/*
 * image_size.js
 */


var path = 'c:/users/gregoirr/tmp/top.png'

var im = new ActiveXObject('WIA.ImageFile')

im.loadFile(path)

WScript.Echo(im.width + ' x ' + im.height)
