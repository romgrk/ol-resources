/*
 * excel.js
 * Copyright (C) 2016  <@>
 *
 * Distributed under terms of the MIT license.
 */

try {
  Watch;
  function get(name) { return Watch.getVariable(name); }
  function set(name, value) { Watch.setVariable(name, value); }
  function log(msg) { Watch.log(toString(msg), 2); }
  function err(msg) { Watch.log(toString(msg), 1); }
  function exp(string) { return Watch.expandString(string); }
  function xml(string) { return Watch.expandString("xmlget('" + string + "',Value,KeepCase,No Trim)"); }
} catch (e) {
  var global = {};
  function get(name) { return global[name]; }
  function set(name, value) { global[name] = value; }
  function log(msg) { WScript.stdout.WriteLine(toString(msg)); }
  function err(msg) { WScript.stdout.WriteLine(toString(msg)); }
  function exp(string) { return string; }
}





function readExcelFile(path) {
  var xls = new ActiveXObject('Excel.Application');
  xls.workbooks.open(path);
  return xls;
}

function readRows(sheet) {
  var row = 1;
  var rows = [];
  while (true) {
    var col = 1;

    if (sheet.cells(row,1).value == undefined)
      break;

    var currentRow = [];
    while (true) {
      var currentValue = sheet.cells(row,col).value;
      if (currentValue == undefined)
        break;

      currentRow.push(currentValue)
      col++;
    }

    rows.push(currentRow)
    row++;
  }
  return rows;
}

function readExcelRows(path) {
  var x = readExcelFile(path);
  var sheet = x.activeSheet;
  var rows = readRows(sheet);
  x.quit();
  return rows;
}


var rows = readExcelRows('c:/users/gregoirr/tmp/file.xlsx')
debug(rows)



/*
 * Logging
 */



function toString(value) {
  if (typeof value == 'string') return value;
  //if (typeof value == 'object') return JSON.stringify(value)
  return ''+value
}


function debug(msg, indent) {
  var c = function (n) {
    return function (s) {
      return '\x1b[' + n + 'm' + s + '\x1b[0m';
    }
  }

  var red = c('91'), green = c('92'), yellow = c('93'), blue = c('94');

  indent = indent || '';
  if (typeof msg == 'string') {
    log(green('"' + msg + '"'));
    return;
  }
  if (msg instanceof Array) {
    for (var i = 0; i < msg.length; i++) {
      if (typeof msg[i] == 'object') {
        log(indent + yellow(i) + ':');
        debug(msg[i], indent + '  ')
      } else {
        log(indent + yellow(i) + ':' + msg[i]);
      }
    }

  } else {
    for (var i in msg) {
      if (typeof msg[i] == 'object') {
        log(indent + yellow(i) + ':');
        debug(msg[i], indent + '  ')
      } else {
        log(indent + yellow(i) + ':' + msg[i]);
      }
    }
  }
}


