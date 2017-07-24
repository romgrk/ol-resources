/*
 * jscript.js
 * Copyright (C) 2016 romgrk <romgrk@localhost.localdomain>
 *
 * Distributed under terms of the MIT license.
 */
'use strict';


/*
 * Helpers
 */

function get(name) { return typeof name === 'number' ? Watch.getJobInfo(name) : Watch.getVariable(name) }
function set(name, value) { typeof name === 'number' ? Watch.setJobInfo(name, value) : Watch.setVariable(name, value) }
function log(msg) { try { Watch.log(toString(msg), 2) } catch(e) { WScript.stdout.WriteLine(toString(msg)) } }
function err(msg) { try { Watch.log(toString(msg), 1) } catch(e) { WScript.stdout.WriteLine(toString(msg)) } }
function exp(string) { return Watch.expandString(string); }
function xml(string) { return Watch.expandString("xmlget('/request[1]/values[1]/" + string + "[1]',Value,KeepCase,No Trim)"); }
function toString(value) { try { return JSON.stringify(value) } catch(e) { return ''+value } }

function format() {
  var as = arguments
  return as[0].replace(/\{ *(\w+) *\}/g,
    function(m, i) { return as[i] })
}


/*
 * Array: see ./array.js
 */


/*
 * Object
 */

function assign(target) {
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

function stringToBinary(text, charSet) {
  var stream = new ActiveXObject('ADODB.Stream')
  stream.type = 2 // adTypeText
  stream.charSet = charSet || 'us-ascii'
  stream.open()
  stream.writeText(text)
  stream.position = 0
  stream.type = 1 // adTypeBinary
  stream.position = 0
  return stream.read()
}



/*
 * File utilities
 */

function readFile(path){
  var fs = new ActiveXObject("Scripting.FileSystemObject")
  var file = fs.OpenTextFile(path, 1, true)
  var res = file.ReadAll()
  file.Close()
  return res
}

function writeFile(path, content){
  var fs = new ActiveXObject('Scripting.FileSystemObject')
  var file = fs.OpenTextFile(path, 2, true)
  file.Write(content)
  file.Close()
}

function writeFileWithEncoding(path, content, encoding) {
  var stream = new ActiveXObject('ADODB.Stream')
  stream.type = 2 // adTypeText
  stream.charSet = encoding || 'utf-8'
  stream.open()
  stream.writeText(content)
  stream.saveToFile(path, 2) // adSaveCreateOverwrite
  stream.close()
}

function readBinaryFile(path) {
  var binStream = new ActiveXObject('ADODB.Stream')
  binStream.Type = 1 //adTypeBinary
  binStream.open()
  binStream.loadFromFile(path)
  return binStream.read()
}

function writeBinaryFile(path, content) {
  var outputStream = new ActiveXObject('ADODB.Stream')
  outputStream.Type = 1
  outputStream.Open()
  outputStream.Write(content)
  outputStream.SaveToFile(path, 2)
  outputStream.Close()
}

function writeBinaryTextToFile(path, content) {
  var outStreamW = new ActiveXObject('ADODB.Stream')
  outStreamW.Type = 2
  // Charset: the default value seems to be `UTF-16` (BOM `0xFFFE` for text files)
  outStreamW.Charset = 'UTF-8'; // important, see `cdoCharset Module Constants`
  outStreamW.Open()
  outStreamW.WriteText(content)
  outStreamW.Position = 0

  var outStreamA = new ActiveXObject('ADODB.Stream')
  outStreamA.Type = 2
  outStreamA.Charset = 'windows-1252'; // important, see `cdoCharset Module Constants`
  outStreamA.Open()

  outStreamW.CopyTo(outStreamA);      // convert encoding

  outStreamA.SaveToFile(path, 2)

  outStreamW.Close()
  outStreamA.Close()
}

function appendFile(path, content){
  var fs   = new ActiveXObject('Scripting.FileSystemObject')
  var file = fs.OpenTextFile(path, 8, true)
  file.Write(content)
  file.Close()
}

function deleteFile(path){
  var fs = new ActiveXObject('Scripting.FileSystemObject')
  if (fs.fileExists(path))
    fs.deleteFile(path)
}

function moveFile(source, destination){
  var fs = new ActiveXObject('Scripting.FileSystemObject')
  fs.moveFile(source, destination)
}

function copyFile(source, destination, overwrite){
  var fs = new ActiveXObject('Scripting.FileSystemObject')
  fs.copyFile(source, destination, overwrite)
}

function listFolders(path) {
  var fs   = new ActiveXObject("Scripting.FileSystemObject")
  var fc   = new Enumerator(fs.GetFolder(path).SubFolders)
  var list = []
  for (; !fc.atEnd(); fc.moveNext()) {
    list.push(fc.item())
  }
  return list
}

function listFiles(path) {
  var fs   = new ActiveXObject("Scripting.FileSystemObject")
  var fc   = new Enumerator(fs.GetFolder(path).files)
  var list = []
  for (; !fc.atEnd(); fc.moveNext()) {
    list.push(fc.item())
  }
  return list
}

function fileStartsWith(file, s) {
  return file.Name.indexOf(s) == 0
}

function fileContains(file, s) {
  return file.Name.indexOf(s) != -1
}

function fileExists(path) {
  var fs = new ActiveXObject("Scripting.FileSystemObject")
  return fs.FileExists(path)
}

function folderExists(path) {
  var fs = new ActiveXObject("Scripting.FileSystemObject")
  return fs.FileExists(path)
}

function createFolder (path) {
  var fs = new ActiveXObject("Scripting.FileSystemObject")
  if (!fs.FolderExists(path)) {
    var current = path
    var foldersToCreate = []

    while (!fs.FolderExists(current)) {
      foldersToCreate.push(current)
      current = fs.getParentFolderName(current)
    }

    while (foldersToCreate.length) {
      fs.createFolder(foldersToCreate.pop())
    }
  }
}


function join() {
  return Array.prototype.slice.call(arguments, 0).join('\\')
}

function sanitizeFilename(filename) {
  return filename.replace(/\/|\\|:|\?|\*|"|\||<|>/g, '-')
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
  var xml = new ActiveXObject("MSXml2.DOMDocument")
  var element = xml.createElement("Base64Data")
  element.dataType = "bin.base64"
  element.text = text
  return element.nodeTypedValue
}

// returns base64 encoded text
function btoa(binary) {
  var xml = new ActiveXObject("MSXml2.DOMDocument")
  var element = xml.createElement("Base64Data")
  element.dataType = "bin.base64"
  element.nodeTypedValue = binary
  return element.text
}

// decodes & writes base64 encoded text to file
function writeDecodedBase64(text, to) {
  var xml = new ActiveXObject("MSXml2.DOMDocument")
  var element = xml.createElement("Base64Data")
  element.dataType = "bin.base64"
  element.text = text

  var outputStream = new ActiveXObject("ADODB.Stream")
  outputStream.type = 1
  outputStream.open()
  outputStream.write(element.nodeTypedValue)
  outputStream.saveToFile(to, 2)
}



/*
 * MetaData API
 */

/**
 * @returns {Array} an array of metadata objects.
 * @example
 *
 *  var docs = getMetaDocuments()
 *
 *  docs[0].MyMetadataField = 'some value'
 *
 *  // This saves any modification made to the JS object properties
 *  docs.save()
 *
 *  // This saves the metadata as XML
 *  docs.saveAsXML('c:/users/gregoirr/tmp/out.xml')
 *
 *  // Attributes are exposed under .__attributes__
 *  // And the native metadata object is exposed under .__node__
 *  var myMetadataField = docs[0].__node__.FieldByName('_vger_fld_MyMetadataField')
 */
function getMetaDocuments(filename) {
  var meta = new ActiveXObject('MetadataLib.MetaFile')
  meta.loadFromFile(filename || Watch.GetMetadataFilename())

  var records = []
  records.__meta__ = meta

  for (var i = 0; i < meta.Job().Group(0).Count; i++) {
    var doc = meta.Job().Group(0).Item(i);
    var record = { __node__: doc, __attributes__: {} }

    for (var j = 0; j< doc.Fields.Count; j++) {
      var key   = doc.Fields.Name(j).replace(/_vger_fld_|_vger_record/, '')
      var value = doc.Fields.Item(j)
      record[key] = value
    }

    for (var j = 0; j< doc.Attributes.Count; j++) {
      var key   = doc.Attributes.Name(j)
      var value = doc.Attributes.Item(j)
      record.__attributes__[key] = value
    }

    records.push(record)
  }

  records.save = function() {
    for (var i = 0; i < records.length; i++) {
      var record = records[i]
      for (var key in record) {
        if (key.indexOf('__') !== 0 && key !== '_id') {
          var value = record[key]
          record.__node__.fields.add('_vger_fld_' + key, value)
        }
      }
    }
    meta.saveToFile(Watch.getMetadataFilename())
  }

  records.saveAsXML = function(path) {
    meta.Export(path, 0) // efXml21 = 0
  }

  return records
}




/*
 * Network
 */

/** Sends an email.
 * @param options {Object} message options
 * @example

  var message = {
    server:         'smtp.office365.com',
    port:           25, // Don't include the port if you are targeting office365
    username:       'docrequest@lordco.com',
    password:       'secret',
    usessl:         true, // Set to true if you are targeting office365
    headers:        { 'X-Custom': 'value' }
    from:           'docrequest@lordco.com',
    to:             'gregoirer@ca.objectiflune.com',
    isHighPriority: true,
    attachments:    ['c:/absolute/path/to/filename.txt'],
    subject:        'Statement',
    body:           '<b>Yo</b><br>This is a new statement'
  }

  sendEmail(message);
*/
function sendEmail(options) {
  // Setup configuration
  var schema = 'http://schemas.microsoft.com/cdo/configuration/';

  var config = new ActiveXObject('CDO.Configuration');
  config.Fields.Item(schema + 'sendusing') = options.sendUsing || 2;
  config.Fields.Item(schema + 'smtpserver') = options.server;
  if (options.port != undefined)
    config.Fields.Item(schema + 'smtpserverport') = options.port;
  if (options.usessl != undefined)
    config.Fields.Item(schema + 'smtpusessl') = options.usessl;
  if (options.username && options.password) {
    config.Fields.Item(schema + 'smtpauthenticate') = 1
    config.Fields.Item(schema + 'sendusername') = options.username;
    config.Fields.Item(schema + 'sendpassword') = options.password;
  }
  config.Fields.Update();

  // Setup message
  var message = new ActiveXObject("CDO.Message");
  message.Configuration = config;
  message.From          = options.from;
  message.To            = options.to;
  message.Subject       = options.subject;
  message.HTMLBody      = options.body;

  if (options.isHighPriority) {
    /* 0 = Low, 1 = Normal, 2 = High */
    message.Fields.Item('urn:schemas:mailheader:X-MSMail-Priority') = 'High'
    message.Fields.Item('urn:schemas:mailheader:X-Priority') = 2
    message.Fields.Item('urn:schemas:httpmail:importance') = 2
  }

  if (options.headers) {
    for (var key in options.headers) {
      var value = options.headers[key];
      message.Fields('urn:schemas:mailheader:' + key) = value;
    }
  }

  if (options.attachments) {
    for (var k in options.attachments) {
      var attachment = options.attachments[k];
      message.AddAttachment(attachment);
    }
  }

  message.Fields.Update();
  message.Send();
}


// Make an HTTP request
function fetch(options, callback) {
  var xhr = new ActiveXObject('MSXML2.ServerXMLHTTP')

  var url     = options.url
  var method  = options.method || 'GET'
  var isAsync = options.async || callback != undefined || false
  var isJSON  = false

  if (options.data && method === 'GET')
    url += '?' + queryString(options.data)

  xhr.open(method, url, isAsync)

  if (options.headers) {
    for (var name in options.headers) {
      var value = options.headers[name]
      if (name === 'Content-Type' && value === 'application/json')
        isJSON = true
      xhr.setRequestHeader(name, value)
    }
  }

  function send() {
    if (isJSON && method === 'POST' && typeof options.data == 'object')
      xhr.send(JSON.stringify(options.data))
    else if (options.data && method === 'POST')
      xhr.send(options.data)
    else
      xhr.send()
  }

  function getResult() {
    if (xhr.status >= 300)
      return { error: true, status: xhr.status, text: xhr.statusText, response: xhr.responseText }
    if (xhr.getResponseHeader('Content-Type') === 'application/json')
      return JSON.parse(xhr.responseText)
    return xhr.responseText
  }

  if (isAsync) {
    xhr.onload  = function () { callback(getResult()) }
    xhr.onerror = function () { callback(getResult()) }
    send()
  } else {
    send()
    return getResult()
  }
}

// Encode as application/x-www-form-urlencoded (see HTML specs)
function queryString(params) {
  var parts = []
  for (var key in params) {
    parts.push(key + '=' + encodeURIComponent(params[key]))
  }
  return parts.join('&')
}

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




/*
 * SQL
 */

function sqlQuery(query, connectionString) {
  var adOpenDynamic = 2;
  var adLockOptimistic = 3;
  var rs = new ActiveXObject('ADODB.Recordset');
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
  var rs = new ActiveXObject('ADODB.Recordset');
  rs.open(query, connectionString, adOpenForwardOnly, adLockReadOnly, adCmdText);
}

function escapeSql(val) {
  return "'" + val.replace(/'/g, "''") + "'";
}

function interpolate(query, record) {
  return query.replace(/\{ *(\w+)(?: *, *(\w+))?\ *}/g, function(m, key, type) {
    if (record[key] == null)
      return 'NULL'
    switch (type) {
      case 'string': return escapeSql(record[key])
      case 'number': return parseNumber(record[key])
      //case 'date':   return 'CONVERT(datetime, ' + escapeSql(record[key]) + ', 1)'
      default:       return record[key]
    }
  })
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
 * Shell
 */

function runCommand(cmd) {
  var shell = new ActiveXObject('WScript.Shell')
  return shell.run('%COMSPEC% /c ' + cmd, 0, true)
}

function execCommand(cmd, cwd) {
  var shell = new ActiveXObject('WScript.Shell')
  if (cwd)
    shell.currentDirectory = cwd
  log(shell.currentDirectory)
  var handle = shell.exec(cmd)
  return handle.stdOut.readAll()
}

function sleep(seconds) {
  new ActiveXObject('WScript.Shell')
    .run('%COMSPEC% /c ping -n ' + (seconds + 1) + ' 127.0.0.1>nul', 0, true)
}



/*
 * Functional
 */

function not(fn) {
  return function() {
    return !fn.apply(null, [].slice.call(arguments))
  }
}




/*
 * Logging (in cscript.exe mode)
 */

function escapeChars(value) {
  return value.replace(/\n|\t|\r/g, function(c){ return { '\r': '\\r', '\n': '\\n', '\t': '\\t' }[c] })
}
function fmt(msg, indent) {
  indent = indent || '';
  var c = function (n) { return function (s) { return '\x1b[' + n + 'm' + s + '\x1b[0m' } }
  var red = c('91'), green = c('92'), yellow = c('93'), blue = c('94'), grey = c('90'), brown = c('38;5;94');
  if (typeof msg == 'number')  return yellow(msg)
  if (typeof msg == 'boolean') return yellow(msg)
  if (typeof msg == 'string')  return green('"' + escapeChars(msg) + '"')
  if (msg === null)      return red('null')
  if (msg === undefined) return red('undefined')
  if (msg.constructor == Array) {
    var res = ''
    for (var i = 0; i < msg.length; i++)
      res += indent + ' ' + fmt(msg[i], indent + '  ') + ',\n'
    res = '[' + res.substring(1)
    res = res.substring(0, res.length - 2)
    res += '] ' + grey('(' + msg.length + ')')
    return res
  } else {
    var res = grey('{ ')
    for (var i in msg) {
      res += brown(i) + ': ' + fmt(msg[i]) + ', '
    }
    res = res.substring(0, res.length - 2)
    res += grey(' }')
    return res
  }
}

function debug(msg, indent) {
  indent = indent || '';
  if (typeof msg == 'number'
    || typeof msg == 'boolean'
    || typeof msg == 'string'
    || msg === undefined
    || msg === null )  return log(fmt(msg))

  if (msg.constructor == Array) {
    log(fmt(msg))
  } else {
    for (var i in msg) {
      if (typeof msg[i] == 'object' && msg != null) {
        log(indent + i + ':');
        debug(msg[i], indent + '  ')
      } else {
        log(indent + i + ':' + fmt(msg[i]))
      }
    }
  }
}
