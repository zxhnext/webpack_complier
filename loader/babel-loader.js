let babel = require('@babel/core')
let loaderUtils = require('loader-utils')
function loader(source) {
    console.log(object.keys(this))
    let options = loaderUtils.getOptions(this)
    let cb = this.async()
    babel.transform(source, {
        ...options,
        sourceMap: true
    }, function(err, result) {
        cb(err, result.code, result.map)
    })
}
module.exports = loader