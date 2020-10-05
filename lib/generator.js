const fs = require('fs')
const path = require('path')

const ejs = require('ejs')

function generator(locals) {
  const json = path.resolve(__dirname, 'data/index.json')
  const data = JSON.parse(fs.readFileSync(json))
  // generate touhou page
  const touhou = path.join(__dirname, 'templates/touhou.ejs')
  const pages = data.touhou.reduce((arr, item, index) => {
    ejs.renderFile(touhou, {
      touhou: item
    }, (err, res) => {
      if (err) {
        console.error(err)
      } else {
        const id = index + 1
        arr.concat({
          path: `touhou/${id}/index.html`,
          content: res,
          layout: ['page']
        })
      }
    })
  }, [])
  // generate index page
  const index = path.join(__dirname, 'templates/index.ejs')
  ejs.renderFile(index, data, (err, res) => {
    if (err) {
      console.error(err)
    } else {
      pages.push({
        path: 'touhou/index.html',
        content: res,
        layout: ['page']
      })
    }
  })
  return pages
}

module.exports = generator
