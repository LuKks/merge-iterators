module.exports = async function * mergeIterators (iterators) {
  const active = iterators.map(mapIterators)

  try {
    while (active.length) {
      const next = active.map(mapNext)
      const { index, entry, result } = await Promise.race(next)

      if (result.done) {
        active.splice(index, 1)
        continue
      }

      yield result.value

      entry.next = null
    }
  } finally {
    for (const entry of active) {
      if (entry.it.return) await entry.it.return()
    }
  }
}

function mapIterators (it) {
  if (!it.next) throw new Error('Must be an interator')

  return { it, next: null }
}

function mapNext (entry, index) {
  if (entry.next === null) {
    try {
      entry.next = entry.it.next()
    } catch (err) {
      return Promise.reject(err)
    }
  }

  if (entry.next.then) {
    return entry.next.then(result => ({ index, entry, result }))
  } else {
    return { index, entry, result: entry.next }
  }
}
