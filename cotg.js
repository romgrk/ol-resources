/*
 * cotg.js
 */

var options = {
    storeID:          'oltest'
  , password:         ''
  , title:            'File'
  , file:             readFile('c:/users/gregoirr/tmp/index.html')
  , author:           'romgrk'
  , description:      'description'
  , category:         'none'
  , recipient:        'gregoirer@ca.objectiflune.com'
  , expiration:       '2017-12-01'
  , autodownload:     true
  , bookshelfTime:    0
  , beta:             false
}

var res = send_document(options)

debug('DocumentID is ' + res.message)


/**
 Sends document content to the COTG Server.
 @param options.beta {boolean} : Whether to use Nu-Book's development/beta server. Default False.
 @param options.storeID {string} : The Store ID (aka Repository ID or COTG Store ID) where the document is sent.
 @param options.password {string} : The Respository's password for the above ID.
 @param options.file {string url} : The document content
 @param options.title {string} : The document title, appearing in the repository, library and at the top of the document.
 @param options.author {string} : The author of the document, appearing in the document's details.
 @param options.description {string} : The description of the document, appearing in the document's details.
 @param options.category {string} : The category of the document, used to sort documents in the repository and library.
 @param options.recipient {string email} : The email of the recipient, should match a user registered on the Repository.
 @param options.autodownload {boolean} : Whether the document will automatically download to the user's device in the Library, and notify the user. Default False
 @param options.bookshelfTime {integer} : How many days the document stays on the device after download.
 @param options.expiration {string yyyy-mm-dd} : The expiration for the document on the repository. Will expire at 11:59 PM on the indicated date.

 @returns {object} a JSON structure containing 2 values.
 @returns .ok {boolean} : true or false
 @returns .message {string} : if .ok is true, contains the documentID; otherwise, an error message
 */
function send_document(options) {
  var url = options.beta ? 'https://svc-beta-us.tureonth.com/WS/depot.ws' : 'https://svc-us.tureonth.com/WS/depot.ws'

  var data = {
      StoreID:           options.storeID
    , Password:          options.password
    , FileToPublish:     { type: 'text/html', value: options.file }
    , FileType:          'HTML'
    , Title:             options.title
    , Author:            options.author
    , Description:       options.description
    , 'Apollo-Categ':    options.category
    , 'Apollo-Dest':     options.recipient
    , Autodownload:      options.autodownload ? 'yes' : 'no'
    , Expiration:        options.expiration
  //, BookshelfLifetime: options.bookshelfTime || 0
  }

  var req = httpPOST(url, data, 'multipart/form-data')

  return parseCOTGResponse(req, '//ApolloUploadResult', 'DocumentID')
}


/**
 Sends document URL to the COTG Server
 @param options.beta {boolean} : Whether to use Nu-Book's development/beta server. Default False.
 @param options.storeID {string} : The Store ID (aka Repository ID or COTG Store ID) where the document is sent.
 @param options.password {string} : The Respository's password for the above ID.
 @param options.fileURL {string url} : The URL the document will be downloaded from (what the COTG App requests).
 @param options.title {string} : The document title, appearing in the repository, library and at the top of the document.
 @param options.author {string} : The author of the document, appearing in the document's details.
 @param options.description {string} : The description of the document, appearing in the document's details.
 @param options.category {string} : The category of the document, used to sort documents in the repository and library.
 @param options.recipient {string email} : The email of the recipient, should match a user registered on the Repository.
 @param options.autodownload {boolean} : Whether the document will automatically download to the user's device in the Library, and notify the user. Default False
 @param options.bookshelfTime {integer} : How many days the document stays on the device after download.
 @param options.expiration {string yyyy-mm-dd} : The expiration for the document on the repository. Will expire at 11:59 PM on the indicated date.

 @returns {object} a JSON structure containing 2 values.
 @returns .ok {boolean} : true or false
 @returns .message {string} : if .ok is true, contains the documentID; otherwise, an error message
 */
function send_document_url(options) {
  var url  = options.beta ?  'https://svc-beta-us.tureonth.com/WS/depot.ws' : 'https://svc-us.tureonth.com/WS/depot.ws'

  var data = {
      StoreID:          options.storeID
    , Password:         options.password
    , FileToPublishURL: options.fileURL
    , FileType:         'HTML'
    , Title:            options.title
    , Author:           options.author
    , Description:      options.description
    , 'Apollo-Categ':   options.category
    , 'Apollo-Dest':    options.recipient
    , Autodownload:     options.autodownload ? 'yes' : 'no'
    , Expiration:       options.expiration
  }

  var req = httpPOST(url, data)

  return parseCOTGResponse(req, '//ApolloUploadResult', 'DocumentID')
}


/**
 * Deletes document from the COTG Server
 @param options.beta {boolean} : Whether to use Nu-Book's development/beta server. Default False.
 @param options.storeID {string} : The Store ID (aka Repository ID or COTG Store ID) from where the document is deleted.
 @param options.password {string} : The Respository's password for the above ID.
 @param options.documentID {string} : The ID of the document on the COTG Server. Obtained from the send_document_metadata() function or through the COTG Tracking database (mdb)

 @returns {object} a JSON structure containing 2 values.
 @returns .ok {boolean} : "true" if the document was deleted succesfully. "false" if an error occured.
 @returns .message {string} : If @response is true, contains a confirmation message. If @response is false, contains an error message.

 Usage:

  var options = {
      beta:       false
    , storeID:    '20010101'
    , password:   'FAEKPWWD'
    , documentID: '3245gik234'
  }

  var res = delete_document(options)

 */
function delete_document(options) {
  var url  = options.beta ?  'https://svc-beta-us.tureonth.com/WS/depot.ws' : 'https://svc-us.tureonth.com/WS/depot.ws'

  var data = {
      StoreID:       options.storeID
    , Password:      options.password
    , DocIDToDelete: options.documentID
  }

  var req = httpPOST(url, data)

  return parseCOTGResponse(req, '//ApolloDeleteResult')
}


/**
 * Change user password
 @param options.beta {boolean} : Whether to use Nu-Book's development/beta server. Default False.
 @param options.storeID {string} : The Store ID (aka Repository ID or COTG Store ID) where the user is located.
 @param options.userID {string} : The UserID of which to change the password.
 @param options.oldPassword {string} : The user's previous password. Required.
 @param options.newPassword {string} : The new password for the user. Required.

 @returns {object} a JSON structure containing 2 values.
 @returns .ok {boolean} : "true" if the document was deleted succesfully. "false" if an error occured.
 @returns .message {string} : If @response is true, contains a confirmation message. If @response is false, contains an error message.

 Usage:

  var options = {
      beta:        false
    , storeID:     '20010101'
    , userID:      '3245gik234'
    , oldPassword: 'FAKEPWD'
    , newPassword: 'NEWFAKEPWD'
  }

  var res = change_password(options)

 */
function change_password(beta, StoreID, UserID, OldPassword, NewPassword) {
  var url  = options.beta ?  'https://svc-beta-us.tureonth.com/WS/depot.ws' : 'https://svc-us.tureonth.com/WS/depot.ws'

  var data = {
      StoreID:     options.storeID
    , UserID:      options.userID
    , OldPassword: options.oldPassword
    , NewPassword: options.newPassword
  }

  var req = httpPOST(url, data)

  return parseCOTGResponse(req, '//ApolloRequestResult')
}


// Parses COTG server response
function parseCOTGResponse(text, node, okNode) {
  var xmlDoc = new ActiveXObject("msxml2.DOMDocument.6.0")
  xmlDoc.async = false
  xmlDoc.loadXML(text)

  if (xmlDoc.parseError.errorCode != 0)
    return { ok: false, message: 'Error parsing COTG Server response: ' + xmlDoc.parseError + ', details: ' + xmlDoc.parseError.srcText, source: text }

  var result = xmlDoc.selectSingleNode(node)

  if (result.getAttribute('Status') == 'Error')
    return { ok: false, message: result.xml }

  return { ok: true, message: okNode != undefined ? result.selectSingleNode(okNode).text : '' }
}

// Send a post request to @url
function httpPOST(url, data, enctype) {
  var http = new ActiveXObject('WinHttp.WinHttpRequest.5.1')
  http.open('POST', url, false)

  var post_data

  if (enctype === 'multipart/form-data') {
    var boundary = '----WebKitFormBoundaryZXabbarlMHZu1A6L'

    http.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary)
    post_data = encodeMultipartFormData(boundary, data)
  } else {
    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    post_data = queryString(data)
  }

  //log(post_data)
  http.send(post_data)

  if (http.status != 200)
    throw new Error('Couldn\'t connect to: ' + url + '; ' + http.status + ' ' + http.statusText)

  return http.responseText
}

// Encode data as multipart/form-data (see HTML specs)
function encodeMultipartFormData(boundary, data) {
  var parts = []

  for (var key in data) {
    var field = data[key]
    if (typeof field === 'string')
      parts.push(encodeMultipartPart(key, field))
    else
      parts.push(encodeMultipartPart(key, field.value, field.type))
  }

  return (
      '--' + boundary + '\r\n'
    + parts.join('--' + boundary + '\r\n')
    + '--' + boundary + '--'
  )
}

// Encode part of a multipart form
function encodeMultipartPart(name, value, type) {
  return (
      'Content-Disposition: form-data; name="' + name + '"'
          + (type === undefined ? '' : '; filename="' + name +'.html"') + '\r\n'
    + (type === undefined ? '' : 'Content-Type: ' + type + '\r\n')
    + '\r\n'
    + value + '\r\n'
  )
}

// Encode as application/x-www-form-urlencoded (see HTML specs)
function queryString(params) {
  var parts = []
  for (var key in params) {
    parts.push(key + '=' + encodeURIComponent(params[key]))
  }
  return parts.join('&')
}


// Read file (sync)
function readFile(path){
  var fs = new ActiveXObject("Scripting.FileSystemObject")
  var file = fs.OpenTextFile(path, 1, true)
  var res = file.ReadAll()
  file.Close()
  return res
}




/*
 * Logging
 */

function log(msg) { try { Watch.log(toString(msg), 2) } catch(e) { WScript.stdout.WriteLine(''+msg) } }
function err(msg) { try { Watch.log(toString(msg), 1) } catch(e) { WScript.stdout.WriteLine(''+msg) } }
function toString(value) { return JSON.stringify(value) }
function debug(msg, indent) {
  try { Watch; log(msg); return; } catch(e) {}
  var c = function (n) {
    return function (s) { return '\x1b[' + n + 'm' + s + '\x1b[0m'; }
  }
  var red = c('91'), green = c('92'), yellow = c('93'), blue = c('94');
  indent = indent || '';
  if (typeof msg == 'number')
    return log(yellow(msg))
  if (typeof msg == 'boolean')
    return log(yellow(msg))
  if (typeof msg == 'string')
    return log(green('"' + msg + '"'));
  for (var i in msg) {
    if (typeof msg[i] == 'object') {
      log(indent + yellow(i) + ':');
      debug(msg[i], indent + '  ')
    } else {
      log(indent + yellow(i) + ':' + msg[i]);
    }
  }
}
