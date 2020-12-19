const commandLineArgs = require('command-line-args')
const Capture = require('./lib/capture')

process.on('unhandledRejection', (error) => {
  console.log(cap.response('ng'))
  console.error(error)
  process.exit(1)
})

const optionDefinitions = [
  {
    name: 'url',
    type: String
  },
  {
    name: 'device',
    type: String,
    defaultValue: 'pc'
  },
]
const options = commandLineArgs(optionDefinitions)

const cap = new Capture(options);
(async () => {
  await cap.openBrowser()
  await cap.goto()
  await cap.save(true)
  await cap.close()
  console.log(cap.response('ok'))
})()
