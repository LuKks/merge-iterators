# merge-iterators

Merge iterators into one

```
npm i merge-iterators
```

## Usage

```js
const mergeIterators = require('merge-iterators')

const it = mergeIterators([
  (async function * () { yield 1 })(),
  (function * () { yield 2 })(),
  (async function * () { yield 3 })(),
  (function * () { yield 4 })()
])

for await (const value of it) {
  console.log(value) // 2, 4, 1, 3
}
```

## License

MIT
