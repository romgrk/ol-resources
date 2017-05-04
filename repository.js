/*
 * repository.js
 */
'use strict';


/*
 * Example:
 * (see function getRepository() below)
 */


var repo  = getRepository()
var users = repo.addGroup('users', ['firstName', 'lastName', 'email'])

log(repo.listGroups()) // => ['users']
log(users.listKeys())  // => ['firstName', 'lastName', 'email']

users.insert({
  firstName: 'Mike',
  lastName: 'Obel',
  email: 'mike.obel@example.com'
})

users.insert({
  firstName: 'John',
  lastName: 'O\'Connor',
  email: 'johnc@example.com'
})

users.insert({
  firstName: 'Sybela',
  lastName: 'Mena',
  email: 'm.syb@example.com'
})


var mike = users.find({firstName: 'Mike'})
    mike.email = 'new.email@example.com'

users.update(mike)

log(users.find({firstName: 'Mike'})) 
// => {"ID":"1","firstName":"Mike","lastName":"Obel","email":"new.email@example.com"}


var john = users.find({lastName: "O'Connor"})
users.remove(john)

log(users.findAll())
/* => [ {"ID":"1","firstName":"Mike","lastName":"Obel","email":"new.email@example.com"},
        {"ID":"3","firstName":"Sybela","lastName":"Mena","email":"m.syb@example.com"} ] */

repo.renameGroup('users', 'persons')
repo.removeGroup('persons')

log(repo.listGroups()) // => []



/*
 * Repository API
 */

function getRepository() {
  var repo = new ActiveXObject('RepositoryLib.WorkflowRepository');

  function queryString(description) {
    if (description == undefined)
      return '';
    var conditions = []
    for (var key in description) {
      var value = description[key]
      conditions.push(key + " = '" + value.replace(/'/g, "''") + "'")
    }
    return conditions.join(' AND ')
  }


  function Repository() {
    this._groups = []
  }

  Repository.prototype.addGroup = function(name, keys) {
    repo.AddGroup(name, JSON.stringify(keys))
    return this.getGroup(name);
  }

  Repository.prototype.removeGroup = function(group) {
    if (typeof group == 'string')
      repo.RemoveGroup(group)
    else
      repo.RemoveGroup(group.name)
  }

  Repository.prototype.renameGroup = function(name, newName) {
    repo.RenameGroup(name, newName)
    if (this._groups[name] != undefined) {
      var group = this._groups[name]
      delete this._groups[name]
      group.name = newName
      this._groups[newName] = group
    }
  }

  Repository.prototype.listGroups = function() {
    return JSON.parse(repo.ListGroups())
  }

  Repository.prototype.getGroup = function(name) {
    if (this._groups[name] == undefined)
      this._groups[name] = new Group(name)
    return this._groups[name]
  }

  Repository.prototype.clear = function() {
    repo.ClearAllData()
  }


  function Group(name) {
    this.name = name
    this._updateKeys()
  }

  Group.prototype._updateKeys = function(description) {
    this._keys = this.listKeys()
    this._keysString = JSON.stringify(['ID'].concat(this._keys))
  }

  Group.prototype.listKeys = function() {
    var keys = []
    var keysDescription = JSON.parse(repo.ListKeys(this.name))
    for (var name in keysDescription) {
      if (keysDescription[name] != 'meta')
        keys.push(name)
    }
    return keys
  }

  Group.prototype.addKey = function(key) {
    repo.AddKey(this.name, key)
    this._updateKeys()
  }

  Group.prototype.removeKey = function(key) {
    repo.RemoveKey(this.name, key)
    this._updateKeys()
  }

  Group.prototype.find = function(description) {
    return this.findAll(description)[0]
  }

  Group.prototype.findAll = function(description) {
    var rawSets = repo.GetKeySets(this.name, this._keysString, queryString(description));
    return JSON.parse(rawSets)
  }

  Group.prototype.query = function(where) {
    var rawSets = repo.GetKeySets(this.name, this._keysString, where);
    return JSON.parse(rawSets)
  }

  Group.prototype.insert = function(keySet) {
    if (keySet.constructor == Array)
      repo.AddKeySets(this.name, JSON.stringify(keySet))
    else
      repo.AddKeySets(this.name, JSON.stringify([keySet]))
  }

  Group.prototype.update = function(keySet) {
    var id = keySet.ID;
    for (var i = 0; i < this._keys.length; i++) {
      var key   = this._keys[i]
      var value = keySet[key]
      repo.SetValueByID(this.name, key, value, id)
    }
  }

  Group.prototype.remove = function(description) {
    if (typeof description == 'number')
      repo.RemoveKeySetByID(this.name, description)
    else if (description.ID)
      repo.RemoveKeySetByID(this.name, description.ID)
    else
      repo.RemoveKeySets(this.name, queryString(description))
  }

  Group.prototype.clear = function() {
    repo.ClearGroupData(this.name)
  }


  return new Repository()
}


function get(name) { return Watch.getVariable(name); }
function set(name, value) { Watch.setVariable(name, value); }
function log(msg) { try { Watch.log(toString(msg), 2) } catch(e) { WScript.stdout.WriteLine(toString(msg)) } }
function err(msg) { try { Watch.log(toString(msg), 1) } catch(e) { WScript.stdout.WriteLine(toString(msg)) } }
function exp(string) { return Watch.expandString(string); }
function xml(string) { return Watch.expandString("xmlget('/request[1]/values[1]/" + string + "[1]',Value,KeepCase,No Trim)"); }
function toString(value) { try { return JSON.stringify(value) } catch(e) { return ''+value } }



