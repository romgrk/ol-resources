# activex.js


## Functions

<dl>
<dt><a href="#getMetaDocuments">getMetaDocuments()</a> ⇒ <code>Array</code></dt>
<dd></dd>
<dt><a href="#sendEmail">sendEmail(options)</a></dt>
<dd><p>Sends an email.</p>
</dd>
</dl>

<a name="getMetaDocuments"></a>

## getMetaDocuments() ⇒ <code>Array</code>
**Kind**: global function
**Returns**: <code>Array</code> - an array of metadata objects.
**Example**
```js
var docs = getMetaDocuments()
docs[0].MyMetadataField = 'some value'
// This saves any modification made to the JS object properties
docs.save()

// Attributes are exposed under .__attributes__
log(docs[0].__attributes__)

// And the native metadata object is exposed under .__node__
var invoiceDate = docs[0].__node__.FieldByName('_vger_fld_InvoiceDate')
```
<a name="sendEmail"></a>

## sendEmail(options)
Sends an email.

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | message options |

**Example**
```js
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
```
