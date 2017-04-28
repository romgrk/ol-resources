/*
 * find_email.js
 */


log(execCommand('powershell -Command "([adsisearcher]\\"(samaccountname=gregoirr)\\").FindOne().Properties.mail"'))

function execCommand(cmd, cwd) {
  var shell = new ActiveXObject('WScript.Shell')
  if (cwd)
    shell.currentDirectory = cwd
  var handle = shell.exec(cmd)
  return handle.stdOut.readAll()
}
