const test = require('brittle')
const mergeIterators = require('./index.js')

test('sync', async function (t) {
  const it = mergeIterators([
    (function * () { yield 1; yield 2 })(),
    (function * () { yield 3; yield 4 })()
  ])

  t.alike(await collect(it), [1, 2, 3, 4])
})

test('async', async function (t) {
  const it = mergeIterators([
    (async function * () { yield 1; yield 2 })(),
    (async function * () { yield 3; yield 4 })()
  ])

  t.alike(await collect(it), [1, 3, 2, 4])
})

test('break', async function (t) {
  t.plan(2)

  const iterator = {
    next: function () {
      return { value: 1, done: false }
    },
    return: function () {
      t.pass('return')
      return { value: undefined, done: true }
    }
  }

  const it = mergeIterators([iterator])

  for await (const value of it) { // eslint-disable-line no-unreachable-loop
    t.is(value, 1)
    break
  }
})

test('delay', async function (t) {
  const it = mergeIterators([
    (async function * () { yield 1; await sleep(300); yield 2 })(),
    (async function * () { yield 3; await sleep(100); yield 4 })()
  ])

  t.alike(await collect(it), [1, 3, 4, 2])
})

test('async and sync', async function (t) {
  const it = mergeIterators([
    (async function * () { yield 1 })(),
    (function * () { yield 2 })(),
    (async function * () { yield 3 })(),
    (function * () { yield 4 })()
  ])

  t.alike(await collect(it), [2, 4, 1, 3])
})

test('errors (sync/sync)', async function (t) {
  t.plan(3)

  const iterator1 = {
    next: function () {
      throw new Error('A')
    },
    return: function () {
      t.pass('return')
      return { value: undefined, done: true }
    }
  }

  const iterator2 = {
    next: function () {
      throw new Error('B')
    },
    return: function () {
      t.pass('return')
      return { value: undefined, done: true }
    }
  }

  const it = mergeIterators([iterator1, iterator2])

  try {
    await collect(it)
    t.fail()
  } catch (err) {
    t.is(err.message, 'A')
  }
})

test('errors (async/sync)', async function (t) {
  t.plan(3)

  const iterator1 = {
    next: async function () {
      throw new Error('A')
    },
    return: function () {
      t.pass('return')
      return { value: undefined, done: true }
    }
  }

  const iterator2 = {
    next: function () {
      throw new Error('B')
    },
    return: function () {
      t.pass('return')
      return { value: undefined, done: true }
    }
  }

  const it = mergeIterators([iterator1, iterator2])

  try {
    await collect(it)
    t.fail()
  } catch (err) {
    t.is(err.message, 'B')
  }
})

test('errors (sync/async)', async function (t) {
  t.plan(3)

  const iterator1 = {
    next: function () {
      throw new Error('A')
    },
    return: function () {
      t.pass('return')
      return { value: undefined, done: true }
    }
  }

  const iterator2 = {
    next: async function () {
      throw new Error('B')
    },
    return: function () {
      t.pass('return')
      return { value: undefined, done: true }
    }
  }

  const it = mergeIterators([iterator1, iterator2])

  try {
    await collect(it)
    t.fail()
  } catch (err) {
    t.is(err.message, 'A')
  }
})

test('errors (async/async)', async function (t) {
  t.plan(3)

  const iterator1 = {
    next: async function () {
      throw new Error('A')
    },
    return: function () {
      t.pass('return')
      return { value: undefined, done: true }
    }
  }

  const iterator2 = {
    next: async function () {
      throw new Error('B')
    },
    return: function () {
      t.pass('return')
      return { value: undefined, done: true }
    }
  }

  const it = mergeIterators([iterator1, iterator2])

  try {
    await collect(it)
    t.fail()
  } catch (err) {
    t.is(err.message, 'A')
  }
})

async function collect (it) {
  const values = []

  for await (const value of it) {
    values.push(value)
  }

  return values
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
