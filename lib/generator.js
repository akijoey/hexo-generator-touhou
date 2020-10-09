const fs = require('fs')
const path = require('path')

const ejs = require('ejs')

function generator(locals) {
  const json = path.resolve(__dirname, 'data.json')
  const data = JSON.parse(fs.readFileSync(json))
  const { baseURL } = data
  // generate touhou page
  const touhou = path.join(__dirname, 'templates/touhou.ejs')
  const pages = data.touhou.reduce((arr, item) => {
    ejs.renderFile(touhou, { baseURL, item }, (err, res) => {
      if (err) {
        console.error(err)
      } else {
        arr.push({
          path: `touhou/${item.id}/index.html`,
          data: {
            title: item.title,
            cover: `${baseURL}th${item.id}/index.png`,
            content: res
          },
          layout: ['page']
        })
      }
    })
    return arr
  }, [])
  // generate index page
  const index = path.join(__dirname, 'templates/index.ejs')
  ejs.renderFile(index, data, (err, res) => {
    if (err) {
      console.error(err)
    } else {
      pages.push({
        path: 'touhou/index.html',
        data: {
          title: 'touhou',
          content: res
        },
        layout: ['page']
      })
    }
  })
  return pages
}

module.exports = generator
