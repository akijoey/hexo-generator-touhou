const fs = require('fs')
const path = require('path')

const ejs = require('ejs')

function generator(locals) {
  const json = path.resolve(__dirname, 'data/index.json')
  const data = JSON.parse(fs.readFileSync(json))
  // generate touhou page
  const touhou = path.join(__dirname, 'templates/touhou.ejs')
  const pages = data.touhou.reduce((arr, item) => {
    ejs.renderFile(touhou, {
      touhou: item
    }, (err, res) => {
      if (err) {
        console.error(err)
      } else {
        const { id } = item
        arr.push({
          path: `touhou/${id}/index.html`,
          data: {
            title: item.title,
            content: res
          },
          layout: ['page']
        })
        const types = ['js', 'data', 'wasm']
        types.forEach(type => {
          const file = path.join(__dirname, `data/th${id}/th${id}.${type}`)
          arr.push({
            path: `touhou/${id}/th${id}.${type}`,
            data: () => fs.createReadStream(file)
          })
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
