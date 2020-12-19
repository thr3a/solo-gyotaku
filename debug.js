const fs = require('fs').promises
async function fileExists(filepath) {
  try {
    return !!(await fs.lstat(filepath))
  } catch (e) {
    return false
  }
}

fileExists('/etc/passwd')
  .then(res => console.log(res))


// (async () => {
//   const result = await fs.access('/etc/passwd', require('fs').constants.F_OK)
//   console.log(result)
//   if (result) {
//     console.log('The path exists.')
//   } else {
//     console.log('The path not exists.')
//   }
// })()

