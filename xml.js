/*
 * xml.js
 */


/*
 * XML
 */

function loadXML(filename) {
  var xmlDoc = new ActiveXObject("Msxml2.DOMDocument.6.0")
  xmlDoc.async = false
  xmlDoc.load(filename)
  if (xmlDoc.parseError.errorCode != 0) {
    throw new Error("XML error: " + xmlDoc.parseError.reason)
  }
  return xmlDoc
}

function createDOM() {
  var dom = new ActiveXObject("Msxml2.DOMDocument.6.0")
  dom.async = false
  dom.validateOnParse = false
  dom.resolveExternals = false
  return dom
}

function createElement(tagName, value) {
  var element = DOM.createElement(tagName)
  if (value != undefined && typeof value !== 'object')
    element.text = ''+value
  if (value != undefined && value.constructor == Array)
    appendChildren(element, value)
  return element
}

function createElements(description) {
  var elements = []
  for (var key in description) {
    var value = description[key]
    var element = createElement(key, value)
    elements.push(element)
  }
  return elements
}

function appendChildren(element, children) {
  children.forEach(function(child){ element.appendChild(child) })
  return element
}

function extractNodes(dom, selectors) {
  return dom == undefined ? [] : (selectors
    .map(function(s) { return dom.selectNodes(s) })
    .map(Array.from)
    .flatten()
    .map(function(e){ return e.cloneNode(true) }))
}

function extractNode(dom, selector) {
  return dom.selectSingleNode(selector)
}

function extractNodeValue(dom, selector) {
  var node = dom.selectSingleNode(selector)
  if (node) {
    return node.text
  } else {
    err('Couldnt find node "' + selector + '"')
    return ''
  } 
}

function addAttribute(element, name, value) {
  var attribute = DOM.createAttribute(name);
  attribute.value = value
  element.setAttributeNode(attribute);
  return element
}

function cloneNodes(dom, selectors) {
  return extractNodes(dom, selectors).map(function(e){ return e.cloneNode(true) })
}
