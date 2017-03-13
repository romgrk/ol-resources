/*
 * rest_browser.js
 */


function setupBrowserTest() {
  var api = new RestAPI('ol-admin', 'secret')

  document.body.innerHTML =
    '<style>'
  + 'table { width: 100%; }'
  + 'td:first-child { background: #bbb; width: 100px; }'
  + '</style>'

  + '<table>'
  + ' <tr><td>File:    </td><td> <input dataFile   type="file"/><br/></td></tr>'
  + ' <tr><td>DM:      </td><td> <input dataMapper type="file"/><br/></td></tr>'
  + ' <tr><td>Template:</td><td> <input template   type="file"/><br/></td></tr>'
  + ' <tr><td>Job:     </td><td> <input job        type="file"/><br/></td></tr>'
  + ' <tr><td>Output:  </td><td> <input output     type="file"/><br/></td></tr>'
  + '</table>'

  + '<input run-normal     type="button" value="Step-by-step"/>'
  + '<input run-all-in-one type="button" value="All-In-One"/><br/>'

  + '<span></span><br/>'

  + '<input download-file  type="button" value="Download"/><br/>'
  + '<object width="400" height="500" type="application/pdf"></object>'

  var runNormal    = document.querySelector('[run-normal]')
  var runAll       = document.querySelector('[run-all-in-one]')
  var downloadFile = document.querySelector('[download-file]')
  var span         = document.querySelector('span')
  var object       = document.querySelector('object')

  runAll.addEventListener('click', function(ev) {
    Promise.all([
        api.files.uploadDataFile('file',               false, document.querySelector('[dataFile]').files[0])
      , api.files.uploadDataMappingConfiguration('dm', false, document.querySelector('[dataMapper]').files[0])
      , api.files.uploadDesignTemplate('template',     false, document.querySelector('[template]').files[0])
      , api.files.uploadJobCreationPreset('job',       false, document.querySelector('[job]').files[0])
      , api.files.uploadOutputCreationPreset('output', false, document.querySelector('[output]').files[0])
    ])
    .then(function(results) {
      var fileId     = results[0]
      var dmId       = results[1]
      var templateId = results[2]
      var jobId      = results[3]
      var outputId   = results[4]

      var config = {
        datamining:      { config: dmId, identifier: fileId },
        contentcreation: { config: templateId },
        jobcreation:     { config: jobId },
        outputcreation:  { config: outputId, createOnly: false }
      }
      return api.print.processAllInOne(config)
    })
    .then(function(operationId) {
      return promiseWhile(isNotDone, function(progress) {
        span.innerText = 'All-in-one... ' + progress
        return api.print.getProgressOfOperation(operationId)
      })
      .then(function() {
        span.innerText = 'All-in-one done'
        return api.print.getResultOfOperation(operationId)
      })
    })
    .then(function(data) {
      window.result = data
      object.setAttribute('data', pdfToDataURI(data))
    })
    .catch(function(msg) {
      span.innerText = 'Error: ' + JSON.stringify(msg)
    })
  })

  runNormal.addEventListener('click', function(ev) {
    Promise.all([
        api.files.uploadDataFile('file',               false, document.querySelector('[dataFile]').files[0])
      , api.files.uploadDataMappingConfiguration('dm', false, document.querySelector('[dataMapper]').files[0])
      , api.files.uploadDesignTemplate('template',     false, document.querySelector('[template]').files[0])
      , api.files.uploadJobCreationPreset('job',       false, document.querySelector('[job]').files[0])
      , api.files.uploadOutputCreationPreset('output', false, document.querySelector('[output]').files[0])
    ])
    .then(function([fileId, dmId, templateId, jobId, outputId]) {

      return api.datamining.processDataMapping(dmId, fileId)
      .then(function(operationId) {
        return promiseWhile(isNotDone, function(progress) {
          span.innerText = 'DataMapping... ' + progress
          return api.datamining.getProgressOfOperation(operationId)
        })
        .then(function() { return api.datamining.getResultOfOperation(operationId) })
      })
      .then(function(datasetId) { return api.contentcreation.processContentCreation(templateId, datasetId) })
      .then(function(operationId) {
        return promiseWhile(isNotDone, function(progress) {
          span.innerText = 'ContentCreation... ' + progress
          return api.contentcreation.getProgressOfOperation(operationId)
        })
        .then(function() { return api.contentcreation.getResultOfOperation(operationId) })
      })
      .then(function(contentsetId) { return api.jobcreation.processJobCreationJSON(jobId, { identifiers: [contentsetId] }) })
      .then(function(operationId) {
        return promiseWhile(isNotDone, function(progress) {
          span.innerText = 'JobCreation... ' + progress
          return api.jobcreation.getProgressOfOperation(operationId)
        })
        .then(function() { return api.jobcreation.getResultOfOperation(operationId) })
      })
      .then(function(jobsetId) { return api.outputcreation.processOutputCreation(outputId, jobsetId) })
      .then(function(operationId) {
        return promiseWhile(isNotDone, function(progress) {
          span.innerText = 'OutputCreation... ' + progress
          return api.outputcreation.getProgressOfOperation(operationId)
        })
        .then(function() { return api.outputcreation.getResultOfOperation(operationId) })
      })
      .then(function(data) {
        window.result = data
        object.setAttribute('data', pdfToDataURI(data))
      })
    })
    .catch(function(msg) {
      span.innerText = 'Error: ' + JSON.stringify(msg)
    })
  })

  downloadFile.addEventListener('click', function() {
    download('file.pdf', pdfToDataURI(window.result))
  })


  function promiseWhile(condition, action, value) {
    if (condition(value))
      return action(value).then(promiseWhile.bind(null, condition, action))
    return value
  }

  function isNotDone(value) {
    return value !== 'done'
  }

  function download(filename, href) {
    var element = document.createElement('a')
    element.setAttribute('href', href)
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  function pdfToDataURI(data) {
    return 'data:application/pdf,' + encodeURIComponent(data)
  }
}
