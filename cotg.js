/*
 * cotg.js
 */


function httpGET(url, data) {
  var http = new ActiveXObject("WinHttp.WinHttpRequest.5.1"); http.open('GET', url, false);
  http.send();
  return http.responseText;
}

function httpPOST(url, data) {
  var http = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
  http.open('POST', url, false);
  http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  http.send(data);
  return http.responseText;
}

function queryString(params) {
  var parts = []
  for (var key in params) {
    parts.push(key + '=' + encodeURIComponent(params[key]))
  }
  return parts.join('&')
}

function send_document_metadata(StoreID, Password, FileURL, Title, Author, Description, Category, Recipient, Expiration, TimezoneModifier, autodownload, bookshelfTime, beta) {
  /*
   * DESCRIPTION
   * Sends document metadata to the COTG Server. v1 does not support sending document DATA, only metadata (url download)

   * PARAMETERS
   * @beta {boolean} : Whether to use Nu-Book's development/beta server. Default False.
   * @StoreID {string} : The Store ID (aka Repository ID or COTG Store ID) where the document is sent.
   * @Password {string} : The Respository's password for the above ID.
   * @FileURL {string url} : The URL the document will be downloaded from (what the COTG App requests).
   * @Title {string} : The document title, appearing in the repository, library and at the top of the document.
   * @Author {string} : The author of the document, appearing in the document's details.
   * @Description {string} : The description of the document, appearing in the document's details.
   * @Category {string} : The category of the document, used to sort documents in the repository and library.
   * @Recipient {string email} : The email of the recipient, should match a user registered on the Repository.
   * @autodownload {boolean} : Whether the document will automatically download to the user's device in the Library, and notify the user. Default False
   * @bookshelfTime {integer} : How many days the document stays on the device after download.
   * @Expiration {string yyyy-mm-dd} : The expiration for the document on the repository. Will expire at 11:59 PM on the indicated date.
   * @TimezoneModifier {string} : The timezone different from UTC. For example, +08 or -05.

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

  autodownload  = autodownload ? 'on' : 'off';
  bookshelfTime = bookshelfTime || 0;

  var post_data = queryString({
    StoreID:          StoreID,
    Password:         Password,
    FileToPublishURL: FileURL,
    FileType:         'HTML',
    Title:            Title,
    Author:           Author,
    Description:      Description,
    'Apollo-Categ':   Category,
    'Apollo-Dest':    Recipient,
    Autodownload:     autodownload,
    Expiration:       Expiration
  })

  Watch.Log(post_data, 2);

  if (beta)
    url = "https://svc-beta-us.tureonth.com/WS/depot.ws"
  else
    url = "https://svc-us.tureonth.com/WS/depot.ws"


  var response;
  try {
    response = httpPOST(url, post_data)
  } catch (err) {
    return {response:false, message:"WinHTTP returned error: '" + (err.number & 0xFFFF).toString() + "' with description: '" + err.description +"'"};
  }

  Watch.Log(response, 2);

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
