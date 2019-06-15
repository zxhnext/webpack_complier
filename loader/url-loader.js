let loaderUtils = require('loader-utils')
let mime = require('mime') // 拿到文件后缀
function loader(source) { // source就是源码
    let { limit } = loaderUtils.getOptions(this)
    if(limit && limit > source.length) {
        return `module.exports = "data:${mime.getType(this.resourcePath)};base64,${source.toString('base64')}"`
    } else {
        return require('./file-loader').call(this, source)
    }
    
} 
loader.raw = true
module.exports = loader