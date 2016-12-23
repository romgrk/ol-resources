/*
 * jscript.js
 * Copyright (C) 2016 romgrk <romgrk@localhost.localdomain>
 *
 * Distributed under terms of the MIT license.
 */
'use strict';

try {
Watch;
function get(name) { return Watch.getVariable(name); }
function set(name, value) { Watch.setVariable(name, value); }
function log(msg) { Watch.log(toString(msg), 2); }
function err(msg) { Watch.log(toString(msg), 1); }
function exp(string) { return Watch.expandString(string); }
function xml(string) { return Watch.expandString("xmlget('" + string + "',Value,KeepCase,No Trim)"); }
function toString(value) {
  if (typeof value == 'string') return value;
  if (typeof value == 'object') return JSON.stringify(value)
  return ''+value
}
} catch (e) {
  var global = {};
  function get(name) { return global[name]; }
  function set(name, value) { global[name] = value; }
  function log(msg) { WScript.stdout.WriteLine(toString(msg)); }
  function err(msg) { WScript.stdout.WriteLine(toString(msg)); }
  function exp(string) { return string; }
  function toString(value) {
    return ''+value
  }
}



/*
 * Array
 */

function forEach(array, callback) {
  for (var i = 0; i < array.length; i++)
    callback(array[i], i, array);
}

function map(array, callback) {
  var newArray = []
  for (var i = 0; i < array.length; i++)
    newArray[i] = callback(array[i], i, array)
  return newArray;
}

function reduce(array, callback, accumulator) {
  var i       = accumulator != undefined ? 0 : 1
  accumulator = accumulator != undefined ? accumulator : array[0]
  for (; i < array.length; i++)
    accumulator = callback(accumulator, array[i])
  return accumulator;
}

function filter(array, predicate) {
  var newArray = []
  for (var i =0; i < array.length; i++) {
    if (predicate(array[i], i, array))
      newArray.push(array[i])
  }
  return newArray;
}

function some(array, predicate) {
  for (var i = 0; i < array.length; i++) {
    if (predicate(array[i], i, array))
      return true
  }
  return false
}

function every(array, predicate) {
  for (var i = 0; i < array.length; i++) {
    if (!predicate(array[i], i, array))
      return false
  }
  return true
}

function contains(array, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === value)
      return true
  }
  return false
}

function last(array) {
  return array[array.length - 1]
}

function flatten(array) {
  return reduce(array, function(acc, cur){ return acc.concat(cur); }, [])
}

function zip(a, b) {
  return map(a, function(e, i) { return [e, b[i]] })
}

function append(array, other) {
  Array.prototype.push.apply(array, other)
  return array
}

function prepend(array, other) {
  Array.prototype.unshift.apply(array, other)
  return array
}

function extendArray() {
  Array.from = function(array) {
    try {
      return Array.prototype.slice.call(array, 0)
    } catch(e) {
      return map(array, function(v) { return v })
    }
  }

  var functions = {
    map: map,
    reduce: reduce,
    filter: filter,
    forEach: forEach,
    some: some,
    every: every,
    flatten: flatten,
    contains: contains,
    append: append,
    prepend: prepend,
    last: last
  }
  for (var n in functions) {
    (function(name, fn) {
      Array.prototype[name] = function() {
        var args = Array.prototype.slice.call(arguments, 0)
        args.unshift(this)
        return fn.apply(this, args)
      }
    }(n, functions[n]))
  }
}



/*
 * Object
 */

function assign(target) {
  'use strict';
  var args = Array.prototype.slice.call(arguments, 1)
  for (var i = 0; i < args.length; i++) {
    var source = args[i]
    for (var key in source) {
      target[key] = source[key]
    }
  }
  return target
}

function keys(object) {
  var keys = []
  for (var key in object)
    keys.push(key)
  return keys
}

function values(object) {
  var values = []
  for (var key in object)
    values.push(object[key])
  return values
}

function entries(object) {
  var entries = []
  for (var key in object)
    entries.push([key, object[key]])
  return entries
}



/*
 * Binary
 */

function binaryToString(binary) {
  var rs = new ActiveXObject("ADODB.Recordset");
  rs.fields.append("mBinary", 201, 1024, 0x80); // adLongVarChar
  rs.open();
  rs.addNew();
  rs("mBinary").appendChunk(binary);
  rs.update();
  return rs("mBinary").value;
}



/*
 * File utilities
 */

function readFile(path){
  var fs = new ActiveXObject("Scripting.FileSystemObject");
  var file = fs.OpenTextFile(path, 1, true);
  var res = file.ReadAll();
  file.Close();
  return res;
}

function writeFile(path, content){
  var fs = new ActiveXObject('Scripting.FileSystemObject');
  var file = fs.OpenTextFile(path, 2, true);
  file.Write(content);
  file.Close();
}

function readBinaryFile(path) {
  var binStream = new ActiveXObject("ADODB.Stream")
  binStream.Type = 1; //adTypeBinary
  binStream.open()
  binStream.loadFromFile(path)
  return binStream.read();
}

function writeBinaryFile(path, content) {
  var outputStream = new ActiveXObject("ADODB.Stream");
  outputStream.Type = 1;
  outputStream.Open();
  outputStream.Write(content);
  outputStream.SaveToFile(path, 2);
  outputStream.Close();
}

function writeBinaryTextToFile(path, content) {
  var outStreamW = new ActiveXObject("ADODB.Stream");
  outStreamW.Type = 2;
  // Charset: the default value seems to be `UTF-16` (BOM `0xFFFE` for text files)
  outStreamW.Charset = "UTF-8"; // important, see `cdoCharset Module Constants`
  outStreamW.Open();
  outStreamW.WriteText(content);
  outStreamW.Position = 0;

  var outStreamA = new ActiveXObject("ADODB.Stream");
  outStreamA.Type = 2;
  outStreamA.Charset = "windows-1252"; // important, see `cdoCharset Module Constants`
  outStreamA.Open();

  outStreamW.CopyTo(outStreamA);      // convert encoding

  outStreamA.SaveToFile(path, 2);

  outStreamW.Close();
  outStreamA.Close();
}

function appendFile(path, content){
  var fs   = new ActiveXObject('Scripting.FileSystemObject');
  var file = fs.OpenTextFile(path, 8, true);
  file.Write(content);
  file.Close();
}

function deleteFile(path, force){
  var fs = new ActiveXObject('Scripting.FileSystemObject');
  fs.deleteFile(path)
}

function listFolders(path) {
  var fs   = new ActiveXObject("Scripting.FileSystemObject");
  var fc   = new Enumerator(fs.GetFolder(path).SubFolders);
  var list = [];
  for (; !fc.atEnd(); fc.moveNext()) {
    list.push(fc.item());
  }
  return list;
}

function listFiles(path) {
  var fs   = new ActiveXObject("Scripting.FileSystemObject");
  var fc   = new Enumerator(fs.GetFolder(path).files);
  var list = [];
  for (; !fc.atEnd(); fc.moveNext()) {
    list.push(fc.item());
  }
  return list;
}

function fileStartsWith(file, s) {
  return file.Name.indexOf(s) == 0;
}

function fileContains(file, s) {
  return file.Name.indexOf(s) != -1;
}

function createFolder (path) {
  var fs = new ActiveXObject("Scripting.FileSystemObject");
  if (!fs.FolderExists(path)) {
    var current = path;
    var foldersToCreate = [];

    while (!fs.FolderExists(current)) {
      foldersToCreate.push(current)
      current = fs.getParentFolderName(current)
    }

    while (foldersToCreate.length) {
      fs.createFolder(foldersToCreate.pop())
    }
  }
}



/*
 * XML
 */

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<':  return '&lt;';
      case '>':  return '&gt;';
      case '&':  return '&amp;';
      case '\'': return '&apos;';
      case '"':  return '&quot;';
    }
  });
}

function unescapeXml(safe) {
  return safe.replace(/&(lt|gt|quot|apos|amp);/g, function (c) {
    switch (c) {
      case '&lt;':   return '<';
      case '&gt;':   return '>';
      case '&amp;':  return '&';
      case '&apos;': return '\'';
      case '&quot;': return '"';
    }
  })
}



/*
 * Base64
 */

// returns decoded base64 binary data
function atob(text) {
  var xml = new ActiveXObject("MSXml2.DOMDocument");
  var element = xml.createElement("Base64Data");
  element.dataType = "bin.base64";
  element.text = text;
  return element.nodeTypedValue;
}

// returns base64 encoded text
function btoa(binary) {
  var xml = new ActiveXObject("MSXml2.DOMDocument");
  var element = xml.createElement("Base64Data");
  element.dataType = "bin.base64";
  element.nodeTypedValue = binary;
  return element.text;
}

// decodes & writes base64 encoded text to file
function writeDecodedBase64(text, to) {
  var xml = new ActiveXObject("MSXml2.DOMDocument");
  var element = xml.createElement("Base64Data");
  element.dataType = "bin.base64";
  element.text = text;

  var outputStream = new ActiveXObject("ADODB.Stream");
  outputStream.Type = 1;
  outputStream.Open();
  outputStream.Write(element.nodeTypedValue);
  outputStream.SaveToFile(to, 2);
}



/*
 * MetaData API
 */
/*

  var meta   = loadMeta();
  var group  = meta.job().group(0);
  var doc    = group.document(0);

  var object = metanodeToJS(doc);

  log(object)
  log(metalistToJS(group))

  saveMetaAsXML(meta, 'C:/Users/gregoirr/Desktop/meta.xml')

*/

function metalistToJS(list) {
  var array = [];
  for (var i = 0; i < list.count; i++) {
    array.push(list.item(i))
  }
  return array;
}

function metacollectionToJS(collection) {
  var object = {};
  for (var i = 0; i < collection.count; i++) {
    var key   = collection.name(i)
    var value = collection.item(i)
    object[key] = value
  }
  return object;
}

function metanodeToJS(node) {
  var object = {
    __node__: node
  };

  var fields     = node.fields;
  var attributes = node.attributes;

  for (var i = 0; i < fields.count; i++) {
    var key   = fields.name(i).replace(/_vger_fld_|_vger_record/, '')
    var value = fields.item(i)
    object[key] = value
  }

  for (var i = 0; i < attributes.count; i++) {
    var key   = '_' + attributes.name(i)
    var value = attributes.item(i)
    object[key] = value
  }

  return object;
}


function loadMeta() {
  var meta = new ActiveXObject('MetadataLib.MetaFile');
  meta.loadFromFile(Watch.getMetadataFilename());
  return meta;
}

function saveMeta(meta) {
  meta.saveToFile(Watch.getMetadataFilename());
}

function saveMetaAsXML(meta, path) {
  meta.Export(path, 0); // efXml21 = 0
}



/*
 * Network
 */

function httpGET(url, data) {
  var http = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
  http.open('GET', url, false);
  http.send(data);
  return http;
}

function httpPOST(url, data) {
  var http = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
  http.open('POST', url, false);
  http.send(data);
  return http;
}


/** Sends an email.
 * Usage:

  var message = {
    server:   'smtp.office365.com',
    port:     25,
    username: 'docrequest@lordco.com',
    password: 'secret',
    usessl:   true,
    headers:  { 'X-Custom': 'value' }
    from:     'docrequest@lordco.com',
    to:       'gregoirer@ca.objectiflune.com',
    attachments: ['filename.txt'],
    subject:  'Statement',
    body:     '<b>Yo</b><br>This is a new statement'
  }

  sendEmail(message);
*/
function sendEmail(options) {
  // Setup configuration
  var schema = "http://schemas.microsoft.com/cdo/configuration/";

  var config = new ActiveXObject("CDO.Configuration");
  config.Fields.Item(schema + "sendusing") = options.sendUsing || 2;
  config.Fields.Item(schema + "smtpserver") = options.server;
  if (options.port != undefined)
    config.Fields.Item(schema + "smtpserverport") = options.port;
  if (options.usessl != undefined)
    config.Fields.Item(schema + "smtpusessl") = options.usessl;
  if (options.username && options.password) {
    config.Fields.Item(schema + "smtpauthenticate") = 1
    config.Fields.Item(schema + "sendusername") = options.username;
    config.Fields.Item(schema + "sendpassword") = options.password;
  }
  config.Fields.Update();

  // Setup message
  var message = new ActiveXObject("CDO.Message");
  message.Configuration = config;
  message.From          = options.from;
  message.To            = options.to;
  message.Subject       = options.subject;
  message.HTMLBody      = options.body;

  if (options.headers) {
    for (var key in options.headers) {
      var value = options.headers[key];
      message.Fields("urn:schemas:mailheader:" + key) = value;
    }
    message.Fields.Update();
  }

  if (options.attachments) {
    for (var k in options.attachments) {
      var attachment = options.attachments[k];
      message.AddAttachment(attachment);
    }
  }

  message.Send();
}



/*
 * SQL
 */

function sqlQuery(query, connectionString) {
  var adOpenDynamic = 2;
  var adLockOptimistic = 3;
  var rs = new ActiveXObject("ADODB.Recordset");
  rs.open(query, connectionString, adOpenDynamic, adLockOptimistic);

  var res = [];
  while (!rs.eof) {
    var record = {};

    for (var i = 0; i < rs.fields.count; ++i) {
      var key   = rs.fields(i).name;
      var value = rs.fields(i).value;
      record[key] = value;
    }

    res.push(record);
    rs.MoveNext();
  }

  rs.close();

  return res;
}

function sqlExecute(query, connectionString) {
  var adOpenForwardOnly = 0;
  var adLockReadOnly = 1;
  var adCmdText = 1;
  var rs = new ActiveXObject("ADODB.Recordset");
  rs.open(query, connectionString, adOpenForwardOnly, adLockReadOnly, adCmdText);
}

function escapeSql(val) {
  return "'" + val.replace(/'/g, "''") + "'";
}



/*
 * String
 */


function rightpad(str, len, ch) {
  str = str.toString()

  if (!ch && ch !== 0)
    ch = ' ';

  while (str.length < len) {
    str = str + ch
  }

  if (str.length > len)
    str = str.slice(0, len)

  return str;
}

function leftpad(str, len, ch) {
  str = str.toString()

  if (!ch && ch !== 0)
    ch = ' ';

  while (str.length < len) {
    str = ch + str
  }

  if (str.length > len)
    str = str.slice(0, len)

  return str;
}

function trim(string) {
  return string.replace(/^\s+|\s+$/g, '')
}



/*
 * Logging
 */


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
  for (var i in msg) {
    if (typeof msg[i] == 'object') {
      log(indent + yellow(i) + ':');
      debug(msg[i], indent + '  ')
    } else {
      log(indent + yellow(i) + ':' + msg[i]);
    }
  }
}


