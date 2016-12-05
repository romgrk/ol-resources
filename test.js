/*
 * test.js
 * Copyright (C) 2016 romgrk <romgrk@localhost.localdomain>
 *
 * Distributed under terms of the MIT license.
 */


function assert(expression, message) {
  if (!expression)
    throw message
}

function test(what, callback) {
  try {
    callback()
  } catch(message) {
    err(what + ': ' + message)
    return;
  }
  log(what + ': OK')
}



test('add/remove group', function() {
  var repo  = getRepository()

  repo.addGroup('new_group', ['field'])

  assert(repo.listGroups().contains('new_group'))

  repo.removeGroup('new_group')

  assert(!repo.listGroups().contains('new_group'))
})

test('rename group', function() {
  var repo  = getRepository()

  repo.addGroup('new_group', ['field'])

  repo.renameGroup('new_group', 'new_group2')

  assert(repo.listGroups().contains('new_group2'))

  repo.removeGroup('new_group2')
})

test('add/remove key', function() {
  var repo  = getRepository()

  var group = repo.addGroup('new_group', ['key1'])
  group.addKey('key2')

  assert(group.listKeys().contains('key2'))

  group.removeKey('key2')

  assert(!group.listKeys().contains('key2'))

  repo.removeGroup('new_group')
})

