/*
 * rest_workflow.js
 */

var paths = {
    dataFile:     'c:/users/gregoirr/dev/docs/quote.json'
  , dataMapper:   'c:/users/gregoirr/dev/docs/quote_json.OL-datamapper'
  , template:     'c:/users/gregoirr/dev/docs/quote_pdf.OL-template'
  , jobPreset:    'c:/users/gregoirr/dev/docs/generic.ol-jobpreset'
  , outputPreset: 'c:/users/gregoirr/dev/docs/PDF.ol-outputpreset'
}


var api          = new RestAPI('ol-admin', 'secret')

var ack          = api.files.serviceHandshake()
log(ack)

var fileId       = api.files.uploadDataFile('file', false, readFile(paths.dataFile))
log(fileId)

var dmId         = api.files.uploadDataMappingConfiguration('dm', false, readFile(paths.dataMapper))
log(dmId)

var templateId   = api.files.uploadDesignTemplate('template', false, readFile(paths.template))
log(templateId)

var jobId        = api.files.uploadJobCreationPreset('job', false, readFile(paths.jobPreset))
log(jobId)

var outputId     = api.files.uploadOutputCreationPreset('output', false, readFile(paths.outputPreset))
log(outputId)

var config = {
  datamining:      { config: dmId, identifier: fileId },
  contentcreation: { config: templateId },
  jobcreation:     { config: jobId },
  outputcreation:  { config: outputId, createOnly: false }
}

var operationId  = api.print.processAllInOne(config)
log(operationId)

var progress
while (progress !== 'done') {
  progress       = api.print.getProgressOfOperation(operationId)
  log(progress)
  sleep(100)
}

var res          = api.print.getResultOfOperationAsText(operationId)
log(res)




/*
 * Utilities
 */

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

