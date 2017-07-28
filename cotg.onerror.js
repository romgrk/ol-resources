/*
 * cotg.onerror.js
 *
 * This will display an error message whenever there is an error during your
 * JavaScript execution. It also display the lines that caused the error.
 */

window.onerror = function(error, filename, line, col) {
  var infos = JSON.stringify([].slice.call(arguments))

  var source = document.documentElement.innerHTML
    .split('\n')
    .slice(line - 5, line + 2)
    .join('\n');

  alert(infos + '\n\nSource: ----------------\n\n' + source)
}
