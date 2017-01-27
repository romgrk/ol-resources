/*
 * rest.js
 */



function setupWorkflowTest() {
  var paths = {
      dataFile:   'c:/users/gregoirr/dev/docs/quote.json'
    , dataMapper: 'c:/users/gregoirr/dev/docs/quote_json.OL-datamapper'
  }

  var api = new RestAPI('ol-admin', 'secret')

  //var contentSets  = api.contentsets.getAllContentSetEntities()
  //log(contentSets)

  //var contentSet   = api.contentsets.getContentItemsforContentSet(contentSets[0])
  //log(contentSet)

  //var pages        = api.contentsets.getPageDetailsforContentSet(contentSets[0])
  //log(pages)

  //var dataSets     = api.datasets.getAllDataSetEntities()
  //log(dataSets)

  //var dataRecords  = api.datasets.getDataRecordsforDataSet(dataSets[0])
  //log(dataRecords)

  //var ack          = api.files.handshake()
  //log(ack)

  //var fileId       = api.files.uploadDataFile('file', false, readFile(paths.dataFile))
  //log(fileId)

  //var configId     = api.files.uploadDataMapping('dm', false, readFile(paths.dataMapper))
  //log(configId)

  //var operationId  = api.datamining.processDataMapping(configId, fileId)
  //log(operationId)

  //for (var i = 0; i < 5; i++) {
  //var progress   = api.datamining.getProgressOfOperation(operationId)
  //log(progress)
  //sleep(100)
  //}

  //var res          = api.datamining.getResultOfOperation(operationId)
  //log(res)

  //var allInOne     = api.print.processAllInOne({ [> config <] })
  //log(allInOne)
}

function setupBrowserTest() {
  var api = new RestAPI('ol-admin', 'secret')

  document.body.innerHTML = '<form><input type="file"/><input type="submit" value="Send"/></form><span></span>'

  var form = document.querySelector('form')

  form.addEventListener('submit', function(ev) {
    ev.preventDefault()

    var fileId = api.files.uploadDataFile('file', false, document.querySelector('[type=file]').files[0])

    document.querySelector('span').innerText = fileId
  })
}


function RestAPI(username, password) {
  var base = 'http://localhost:9340'

  var token = fetch({
    method:  'POST',
    url:     base + '/rest/serverengine/authentication/login',
    headers: { Authorization: 'Basic ' + base64(username + ':' + password) }
  })

  function request(url, method, data, options) {
    options = options || {}
    return fetch(assign({
      method:  method,
      url:     base + '/rest/serverengine' + url,
      data:    data
    }, options, { headers: assign(
      { auth_token: token, 'Content-Type': 'application/json' },
      options.headers
    )}))
  }

  function POST(url, data, options) { return request(url, 'POST', data, options) }
  function GET(url, data, options)  { return request(url, 'GET', data, options) }
  function PUT(url, data, options)  { return request(url, 'PUT', data, options) }

  this.contentsets = {
    getAllContentSetEntities: function () {
      return GET('/entity/contentsets')
    },

    getContentItemsforContentSet: function (contentSetId) {
      return GET('/entity/contentsets/' + contentSetId)
    },

    getPageDetailsforContentSet: function (contentSetId, detail) {
      return GET('/entity/contentsets/' + contentSetId + '/pages', { detail: detail || false })
    },

    deleteContentSetEntity: function (contentSetId) {
      return POST('/entity/contentsets/' + contentSetId + '/delete')
    },

    getContentSetProperties: function (contentSetId) {
      return GET('/entity/contentsets/' + contentSetId + '/properties')
    },

    updateContentSetProperties: function (contentSetId, properties) {
      return PUT('/entity/contentsets/' + contentSetId + '/properties', properties)
    },

    serviceVersion: function () {
      return GET('/entity/contentsets/version')
    }
  }

  this.contentitems = {
    serviceHandshake: function () {
      return GET('/entity/contentitems')
    },

    getDataRecordforContentItem: function (id) {
      return GET('/entity/contentitems/' + id + '/datarecord')
    },

    getContentItemProperties: function (id) {
      return GET('/entity/contentitems/' + id + '/properties')
    },

    updateContentItemProperties: function (id, properties) {
      return PUT('/entity/contentitems/' + id + '/properties', properties)
    },

    updateMultipleContentItemProperties: function (items) {
      return PUT('/entity/contentitems/properties', items)
    },

    serviceVersion: function () {
      return GET('/entity/contentitems/version')
    }
  }

  this.datasets = {
    getAllDataSetEntities: function () {
      return GET('/entity/datasets')
    },

    getDataRecordsforDataSet: function (dataSetId) {
      return GET('/entity/datasets/' + dataSetId)
    },

    deleteDataSetEntity: function (dataSetId) {
      return POST('/entity/datasets/' + dataSetId + '/delete')
    },

    getDataSetProperties: function (dataSetId) {
      return GET('/entity/datasets/' + dataSetId + '/properties')
    },

    updateDataSetProperties: function (dataSetId, properties) {
      return PUT('/entity/datasets/' + dataSetId + '/properties', properties)
    },

    serviceVersion: function () {
      return GET('/entity/datasets/version')
    }
  }

  this.datarecords = {
    serviceHandshake: function () {
      return GET('/entity/datarecords')
    },

    getDataRecordValues: function (id, recursive) {
      return GET('/entity/datarecords/' + id + '/values', { recursive: recursive || false })
    },

    updateDataRecordValues: function (id, values) {
      return PUT('/entity/datarecords/' + id + '/values', values)
    },

    getDataRecordProperties: function (id) {
      return GET('/entity/datarecords/' + id + '/properties')
    },

    updateDataRecordProperties: function (i, propertiesd) {
      return PUT('/entity/datarecords/' + id + '/properties', properties)
    },

    updateMultipleDataRecordValues: function (records) {
      return PUT('/entity/datarecords', records)
    },

    updateMultipleDataRecordProperties: function (records) {
      return PUT('/entity/datarecords/properties', records)
    },

    serviceVersion: function () {
      return GET('/entity/datarecords/version')
    }
  }

  this.files = {
    handshake: function() {
      return GET('/filestore')
    },

    upload: function(fileId, content) {
      return POST('/filestore/file/' + fileId, content, { headers: { 'Content-Type': 'application/octet-stream' } })
    },

    uploadDir: function(fileId, content) {
      return POST('/filestore/dir/' + fileId, content, { headers: { 'Content-Type': 'application/octet-stream' } })
    },

    download: function(fileId) {
      return GET('/filestore/file/' + fileId)
    },

    remove: function(fileId) {
      return GET('/filestore/delete/' + fileId)
    },

    uploadDataMapping: function(filename, persistent, content) {
      var q = queryString({ filename: filename, persistent: persistent || false })
      return POST('/filestore/DataMiningConfig?' + q, content, { headers: { 'Content-Type': 'application/octet-stream' } })
    },

    uploadJobPreset: function(filename, persistent, content) {
      var q = queryString({ filename: filename, persistent: persistent || false })
      return POST('/filestore/JobCreationConfig?' + q, content, { headers: { 'Content-Type': 'application/octet-stream' } })
    },

    uploadDataFile: function(filename, persistent, content) {
      var q = queryString({ filename: filename, persistent: persistent || false })
      return POST('/filestore/DataFile?' + q, content, { headers: { 'Content-Type': 'application/octet-stream' } })
    },

    uploadTemplate: function(filename, persistent, content) {
      var q = queryString({ filename: filename, persistent: persistent || false })
      return POST('/filestore/template?' + q, content, { headers: { 'Content-Type': 'application/octet-stream' } })
    },

    uploadOutputPreset: function(filename, persistent, content) {
      var q = queryString({ filename: filename, persistent: persistent || false })
      return POST('/filestore/OutputCreationConfig' + q, content, { headers: { 'Content-Type': 'application/octet-stream' } })
    },

    version: function() {
      return GET('/filestore/version')
    }
  }

  this.contentcreation = {
    serviceHandshake: function () {
      return GET('/workflow/contentcreation')
    },

    processContentCreation: function (templateId, dataSetId) {
      return POST('/workflow/contentcreation/' + templateId + '/' + dataSetId)
    },

    processContentCreationByDataRecord: function (templateId, identifiers) {
      return POST('/workflow/contentcreation/' + templateId, identifiers)
    },

    getProgressOfOperation: function (operationId) {
      return GET('/workflow/contentcreation/getProgress/' + operationId)
    },

    getResultOfOperation: function (operationId) {
      return POST('/workflow/contentcreation/getResult/' + operationId)
    },

    cancelOperation: function (operationId) {
      return POST('/workflow/contentcreation/cancel/' + operationId)
    },

    serviceVersion: function () {
      return GET('/workflow/contentcreation/version')
    }
  }

  this.datamining = {
    serviceHandshake: function () {
      return GET('/workflow/datamining')
    },

    processDataMapping: function (configId, dataFileId) {
      return POST('/workflow/datamining/' + configId + '/' + dataFileId)
    },

    processDataMappingJSON: function (configId, identifiers) {
      return POST('/workflow/datamining/' + configId, identifiers)
    },

    processDataMappingPDFVTtoDataSet: function (dataFileId) {
      return POST('/workflow/datamining/pdfvtds/' + dataFileId)
    },

    processDataMappingPDFVTtoContentSet: function (dataFileId) {
      return POST('/workflow/datamining/pdfvtcs/' + dataFileId)
    },

    getProgressOfOperation: function (operationId) {
      return GET('/workflow/datamining/getProgress/' + operationId)
    },

    getResultOfOperation: function (operationId) {
      return POST('/workflow/datamining/getResult/' + operationId)
    },

    cancelOperation: function (operationId) {
      return POST('/workflow/datamining/cancel/' + operationId)
    },

    serviceVersion: function () {
      return GET('/workflow/datamining/version')
    }
  }

  this.html = {
    serviceHandshake: function () {
      return GET('/workflow/contentcreation/html')
    },

    processContentCreation: function (templateId, dataRecordId) {
      return GET('/workflow/contentcreation/html/' + templateId + '/' + dataRecordId)
    },

    processContentCreationJSON: function (templateId, dataRecordId) {
      return POST('/workflow/contentcreation/html/' + templateId + '/' + dataRecordId)
    },

    getTemplateResource: function (templateId, relPath) {
      return GET('/workflow/contentcreation/html/' + templateId + '/' + relPath)
    },

    serviceVersion: function () {
      return GET('/workflow/contentcreation/html/version')
    }
  }

  this.email = {
    serviceHandshake: function () {
      return GET('/workflow/contentcreation/email')
    },

    processContentCreation: function (templateId, identifiers) {
      return POST('/workflow/contentcreation/email/' + templateId, identifiers)
    },

    getProgressofOperation: function (operationId) {
      return GET('/workflow/contentcreation/email/getProgress/' + operationId)
    },

    getResultofOperation: function (operationId) {
      return POST('/workflow/contentcreation/email/getResult/' + operationId)
    },

    cancelanOperation: function (operationId) {
      return POST('/workflow/contentcreation/email/cancel/' + operationId)
    },

    serviceVersion: function () {
      return GET('/workflow/contentcreation/email/version')
    }
  }

  this.jobcreation = {
    serviceHandshake: function () {
      return GET('/workflow/jobcreation')
    },

    processJobCreation: function (configId) {
      return POST('/workflow/jobcreation/' + configId)
    },

    processJobCreationJSON: function (configId, identifiers) {
      return POST('/workflow/jobcreation/' + configId, identifiers)
    },

    processJobCreationJSONJobSetStructure: function (jobset) {
      return POST('/workflow/jobcreation', jobset)
    },

    getProgressofOperation: function (operationId) {
      return GET('/workflow/jobcreation/getProgress/' + operationId)
    },

    getResultofOperation: function (operationId) {
      return POST('/workflow/jobcreation/getResult/' + operationId)
    },

    cancelOperation: function (operationId) {
      return POST('/workflow/jobcreation/cancel/' + operationId)
    },

    serviceVersion: function () {
      return GET('/workflow/jobcreation/version')
    }
  }

  this.jobs = {
    serviceHandshake: function () {
      return GET('/entity/jobs')
    },

    getContentItemsforJob: function (jobId) {
      return GET('/entity/jobs/' + jobId + '/contents')
    },

    getJobProperties: function (jobId) {
      return GET('/entity/jobs/' + jobId + '/properties')
    },

    updateJobProperties: function (jobId, properties) {
      return PUT('/entity/jobs/' + jobId + '/properties', properties)
    },

    updateMultipleJobProperties: function (properties) {
      return PUT('/entity/jobs/properties', properties)
    },

    serviceVersion: function () {
      return GET('/entity/jobs/version')
    }
  }

  this.jobsets = {
    getAllJobSetEntities: function () {
      return GET('/entity/jobsets')
    },

    getJobsforJobSet: function (jobSetId) {
      return GET('/entity/jobsets/' + jobSetId)
    },

    deleteJobSetEntity: function (jobSetId) {
      return POST('/entity/jobsets/' + jobSetId + '/delete')
    },

    getJobSetProperties: function (jobSetId) {
      return GET('/entity/jobsets/' + jobSetId + '/properties')
    },

    updateJobSetProperties: function (jobSetId, properties) {
      return PUT('/entity/jobsets/' + jobSetId + '/properties', properties)
    },

    serviceVersion: function () {
      return GET('/entity/jobsets/version')
    }
  }

  this.outputcreation = {
    serviceHandshake: function () {
      return GET('/workflow/outputcreation')
    },

    processOutputCreation: function (configId, jobSetId) {
      return POST('/workflow/outputcreation/' + configId + '/' + jobSetId)
    },

    processOutputCreationJSON: function (configId, identifiers) {
      return POST('/workflow/outputcreation/' + configId, identifiers)
    },

    processOutputCreationByJob: function (configId, identifiers) {
      return POST('/workflow/outputcreation/' + configId + '/jobs', identifiers)
    },

    getProgressOfOperation: function (operationId) {
      return GET('/workflow/outputcreation/getProgress/' + operationId)
    },

    getResultOfOperation: function (operationId) {
      return POST('/workflow/outputcreation/getResult/' + operationId)
    },

    getResultOfOperationAsText: function (operationId) {
      return POST('/workflow/outputcreation/getResultTxt/' + operationId)
    },

    cancelOperation: function () {
      return POST('/workflow/outputcreation/cancel/' + operationId)
    },

    serviceVersion: function () {
      return GET('/workflow/outputcreation/version')
    }
  }

  this.print = {
    serviceHandshake: function () {
      return GET('/workflow/print')
    },

    processAllInOne: function (configuration) {
      return POST('/workflow/print/submit', configuration)
    },

    getProgressofOperation: function (operationId) {
      return GET('/workflow/print/getProgress/' + operationId)
    },

    getResultofOperation: function (operationId) {
      return POST('/workflow/print/getResult/' + operationId)
    },

    getResultofOperationAsText: function (operationId) {
      return POST('/workflow/print/getResultTxt/' + operationId)
    },

    cancelanOperation: function (operationId) {
      return POST('/workflow/print/cancel/' + operationId)
    },

    serviceVersion: function () {
      return GET('/workflow/print/version')
    }
  }
}

// Merge objects
function assign(target) {
  'use strict';
  var args = Array.prototype.slice.call(arguments, 1)
  for (var i = 0; i < args.length; i++) {
    var source = args[i]
    if (typeof source == 'object') {
      for (var key in source)
        target[key] = source[key]
    }
  }
  return target
}

// Make an HTTP request
function fetch(options) {
  var xhr
  try {
    xhr = new ActiveXObject('MSXML2.ServerXMLHTTP')
  } catch(e) {
    try { xhr = new XMLHttpRequest() } catch(e) { }
  }

  var url    = options.url
  var method = options.method || 'GET'
  var isJSON = false

  if (options.data && method === 'GET')
    url += '?' + queryString(options.data)

  xhr.open(method, url, false)

  err(method + ' ' + url)

  if (options.headers) {
    for (var name in options.headers) {
      var value = options.headers[name]

      log({name:name,value:value})

      if (name === 'Content-Type' && value === 'application/json')
        isJSON = true

      xhr.setRequestHeader(name, value)
    }
  }

  if (isJSON && method === 'POST') {
    xhr.send(JSON.stringify(options.data))
  }
  else if (options.data && method === 'POST') {
    xhr.send(options.data)
  }
  else {
    xhr.send()
  }

  var operationId = xhr.getResponseHeader('operationId')

  if (xhr.status >= 300)
    return { error: true, status: xhr.status, text: xhr.statusText, response: xhr.responseText }

  if (xhr.getResponseHeader('Content-Type') === 'application/json')
    return JSON.parse(xhr.responseText)

  if (xhr.responseText === '' && operationId)
    return operationId

  return xhr.responseText
}

// Return base64 encoded text
function base64(binary) {
  try { return window.btoa(binary) } catch(err) {}
  var xml = new ActiveXObject("MSXml2.DOMDocument")
  var element = xml.createElement("Base64Data")
  element.dataType = "bin.base64"
  element.nodeTypedValue = typeof(binary) == 'string' ? stringToBinary(binary) : binary
  return element.text
}

// Return the string as a binary type
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

// Encode as application/x-www-form-urlencoded (see HTML specs)
function queryString(params) {
  var parts = []
  for (var key in params) {
    parts.push(key + '=' + encodeURIComponent(params[key]))
  }
  return parts.join('&')
}

// Read file content
function readFile(path){
  var fs = new ActiveXObject("Scripting.FileSystemObject");
  var file = fs.OpenTextFile(path, 1, true);
  var res = file.ReadAll();
  file.Close();
  return res;
}

// Sleep for @ms milliseconds
function sleep(ms) {
  var start = +new Date
  while (+new Date - start < ms);
}



/*
 * Utilities
 */

function get(name) { return Watch.getVariable(name); }
function set(name, value) { Watch.setVariable(name, value); }
function log(msg) { try { Watch.log(toString(msg), 2); } catch (e) { try { WScript.stdout.WriteLine(toString(msg)) } catch (e) { console.log(msg) } } }
function err(msg) { try { Watch.log(toString(msg), 1); } catch (e) { try { WScript.stdout.WriteLine(toString(msg)) } catch (e) { console.log(msg) } } }
function exp(string) { return Watch.expandString(string); }
function xml(string) { return Watch.expandString("xmlget('/request[1]/values[1]/" + string + "[1]',Value,KeepCase,No Trim)"); }
function toString(value) {
  if (typeof value == 'string') return value;
  if (typeof value == 'object') return JSON.stringify(value)
  return ''+value
}



/*
 * Array
 */

function extendArray() {
  Array.from = function(array) {
    try {
      return Array.prototype.slice.call(array, 0)
    } catch(e) {
      return map(array, function(v) { return v })
    }
  }

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

