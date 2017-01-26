/*
 * cotg.js
 */

var options = {
    storeID:          'oltest'
  , password:         'qpalzm'
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

debug(res)


/**
 Sends document metadata to the COTG Server.
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
 @param options.timezoneModifier {string} : The timezone different from UTC. For example, +08 or -05.
 */
function send_document(options) {
  //var url = 'http://localhost:8080/submit'
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

  return httpPOST(url, data, 'multipart/form-data')
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
  var fs = new ActiveXObject("Scripting.FileSystemObject");
  var file = fs.OpenTextFile(path, 1, true);
  var res = file.ReadAll();
  file.Close();
  return res;
}



function send_document_metadata(options) {
  /*
   * DESCRIPTION
   * Sends document metadata to the COTG Server. v1 does not support sending document DATA, only metadata (url download)
   * @param beta {boolean} : Whether to use Nu-Book's development/beta server. Default False.
   * @param StoreID {string} : The Store ID (aka Repository ID or COTG Store ID) where the document is sent.
   * @param Password {string} : The Respository's password for the above ID.
   * @param FileURL {string url} : The URL the document will be downloaded from (what the COTG App requests).
   * @param Title {string} : The document title, appearing in the repository, library and at the top of the document.
   * @param Author {string} : The author of the document, appearing in the document's details.
   * @param Description {string} : The description of the document, appearing in the document's details.
   * @param Category {string} : The category of the document, used to sort documents in the repository and library.
   * @param Recipient {string email} : The email of the recipient, should match a user registered on the Repository.
   * @param autodownload {boolean} : Whether the document will automatically download to the user's device in the Library, and notify the user. Default False
   * @param bookshelfTime {integer} : How many days the document stays on the device after download.
   * @param Expiration {string yyyy-mm-dd} : The expiration for the document on the repository. Will expire at 11:59 PM on the indicated date.
   * @param TimezoneModifier {string} : The timezone different from UTC. For example, +08 or -05.

   * RETURN VALUES
   * Returns a JSON structure containing 2 values.
   * @response {boolean} : "true" if the document was sent succesfully. "false" if an error occured.
   * @message {string} : If @response is true, contains the Document ID. If @response is false, contains an error message.

   * EXAMPLE USAGE:

   response = create_document(false, '20010101', 'FAEKPWWD', 'http://example.com/?uuid=34lkjerjwkjhfasiuy', 'My Title', 'John Doe', 'This is a document', 'custom', 'user@example.com', '2017-01-01', "+05", true, 2);
   if(!response.response) {
     Watch.Log("Error occured: " + response.message,1);
   } else {
     documentID = response.message;
     // store in database or something.
   }
   *********************/

  var url  = options.beta ? 'https://svc-beta-us.tureonth.com/WS/depot.ws' : 'https://svc-us.tureonth.com/WS/depot.ws'
  var data = {
    StoreID:          options.storeID,
    Password:         options.password,
    FileToPublishURL: options.fileURL,
    FileType:         'HTML',
    Title:            options.title,
    Author:           options.author,
    Description:      options.description,
    'Apollo-Categ':   options.category,
    'Apollo-Dest':    options.recipient,
    Autodownload:     options.autodownload ? 'yes' : 'no',
    Expiration:       options.expiration
  }

  var response;
  try {
    response = httpPOST(url, data)
  } catch (err) {
    return {response:false, message:"WinHTTP returned error: '" + (err.number & 0xFFFF).toString() + "' with description: '" + err.description +"'"};
  }

  // Load the response in the XML API
  var xmlDoc = new ActiveXObject("msxml2.DOMDocument.6.0");
  xmlDoc.async = false;
  xmlDoc.loadXML(response);

  if (xmlDoc.parseError.errorCode != 0)
    return {response:false, message:"There was an error parsing the response from the COTG Server: " + xmlDoc.parseError + ", details: " + xmlDoc.parseError.srcText};

  // Get the response code from the appropriate node.
  var response_node = xmlDoc.selectSingleNode("//ApolloUploadResult");

  if(response_node.getAttribute("Status") == "Error")
    return {response:false, message:"Could no upload document: " + response_node.text};

  return {response:true, message: response_node.selectSingleNode("DocumentID").text};
}

function delete_document(beta, StoreID, Password, DocumentID) {
  /*
   * DESCRIPTION
   * Requests the deletion of a document on the COTG Server.

   * PARAMETERS
   * @beta {boolean} : Whether to use Nu-Book's development/beta server. Default False.
   * @StoreID {string} : The Store ID (aka Repository ID or COTG Store ID) from where the document is deleted.
   * @Password {string} : The Respository's password for the above ID.
   * @DocumentID {string} : The ID of the document on the COTG Server. Obtained from the send_document_metadata() function or through the COTG Tracking database (mdb)

   * RETURN VALUES
   * Returns a JSON structure containing 2 values.
   * @response {boolean} : "true" if the document was deleted succesfully. "false" if an error occured.
   * @message {string} : If @response is true, contains a confirmation message. If @response is false, contains an error message.

   * EXAMPLE USAGE:

    var response = delete_document(false, '20010101', 'FAEKPWWD', '3245gik234');
    Watch.Log(response['message'], 2);
   */

  beta = typeof beta !== 'undefined' ? beta : false;

  // Initialize the reponse object
  var res = {response:false, message:"Something went wrong, this function did not properly set the response!"};

  var post_data = 'StoreID='+StoreID+
    '&Password='+Password+
    '&DocIDToDelete='+DocumentID;
  Watch.Log(post_data, 2);


  // Grab the XML response.
  try {
    var http = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
    if(beta) {
      http.open('POST', "https://svc-beta-us.tureonth.com/WS/depot.ws", false);
    } else {
      http.open('POST', "https://svc-us.tureonth.com/WS/depot.ws", false);
    }
    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    http.send(post_data);
  }
  catch (objError) {
    Watch.Log("WinHTTP returned error: '" + (objError.number & 0xFFFF).toString() + "' with description: '" + objError.description +"'",1);
  }

  response = http.responseText;
  Watch.Log(response, 2);

  // Load the response in the XML API
  var xmlDoc = new ActiveXObject("msxml2.DOMDocument.6.0");
  xmlDoc.async = false;
  xmlDoc.loadXML(response);
  if (xmlDoc.parseError.errorCode != 0) {
    res = {response:false, message:"There was an error parsing the response from the COTG Server: " + xmlDoc.parseError + ", details: " + xmlDoc.parseError.srcText};
  } else {
    // Get the response code from the appropriate node.
    response_node = xmlDoc.selectSingleNode("//ApolloDeleteResult");
    Watch.Log(response_node.xml,2);
    response_status = response_node.getAttribute("Status");
    if(response_status == "Error") {
      res = {response:false, message:"Could not delete the document: " + response_node.text};
    } else {
      res = {response:true, message:"The document was deleted correctly."};
    }
  }
  return res;
}

function change_password(beta, StoreID, UserID, OldPassword, NewPassword) {
  /*
   * DESCRIPTION
   * Requests a user password change on the COTG Server

   * PARAMETERS
   * @beta {boolean} : Whether to use Nu-Book's development/beta server. Default False.
   * @StoreID {string} : The Store ID (aka Repository ID or COTG Store ID) where the user is located.
   * @UserID {string} : The UserID of which to change the password.
   * @OldPassword {string} : The user's previous password. Required.
   * @NewPassword {string} : The new password for the user. Required.

   * RETURN VALUES
   * Returns a JSON structure containing 2 values.
   * @response {boolean} : "true" if the password was changed succesfully. "false" if an error occured.
   * @message {string} : If @response is true, contains a confirmation message. If @response is false, contains an error message.

   * EXAMPLE USAGE:

    var response = change_password(false, '20010101', 'FAEKPWWD', '3245gik234', '5345lkj345');
    Watch.Log(response['message'], 2);
   */

  beta = typeof beta !== 'undefined' ? beta : false;
  // Initialize the reponse object
  var res = {response:false, message:"Something went wrong, this function did not properly set the response!"};

  var post_data = 'StoreID='+StoreID+
    '&UserID='+UserID+
    '&OldPassword='+OldPassword+
    '&NewPassword='+NewPassword;
  Watch.Log(post_data, 2);

  // Grab the XML response.
  // NOTE: slice(3) is used because the response starts with a line return + 3 weird characters (ï»¿)
  try {
    var http = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
    if(beta) {
      http.open('POST', "https://svc-beta-us.tureonth.com/WS/DepotCreation.ws", false);
    } else {
      http.open('POST', "https://svc-us.tureonth.com/WS/DepotCreation.ws", false);
    }
    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    http.send(post_data);
  } catch (objError) {
    Watch.Log("WinHTTP returned error: '" + (objError.number & 0xFFFF).toString() + "' with description: '" + objError.description +"'",1);
  }

  response = http.responseText;
  Watch.Log(response, 2);

  // Load the response in the XML API
  var xmlDoc = new ActiveXObject("msxml2.DOMDocument.6.0");
  xmlDoc.async = false;
  xmlDoc.loadXML(response);
  if (xmlDoc.parseError.errorCode != 0) {
    res = {response:false, message:"There was an error parsing a Change Password request to the Apollo Server: " + xmlDoc.parseError + ", details: " + xmlDoc.parseError.srcText};
  } else {
    // Get the response code from the appropriate node.
    response_node = xmlDoc.selectSingleNode("//ApolloRequestResult");
    Watch.Log(response_node.xml,2);
    response_status = response_node.getAttribute("Status");
    if(response_status == "Error") {
      res = {response:false, message:"A password change request to the Apollo server failed. The response was: " + response_node.text};
    } else {
      res = {response:true, message:"The password was changed successfully on the server."};
    }
  }
  return res;
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
  if (typeof msg == 'number') {
    log(yellow(msg))
    return
  }
  if (typeof msg == 'boolean') {
    log(yellow(msg))
    return
  }
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
function log(msg) { WScript.stdout.WriteLine(toString(msg)); }
function toString(value) {
  return ''+value
}
