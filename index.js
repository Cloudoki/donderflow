#!/usr/bin/env node

if (process.version.match(/v(\d+)\./)[1] < 12) {
  console.error('Node v12 or greater is required.')
} else {
  const [,, ...args] = process.argv

  require('./lib/main')(args)
    .catch((error) => {
      console.log(error)
      process.exit(1)
    })
}
