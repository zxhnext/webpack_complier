let loaderUtils = require('loader-utils')

function loader(source) { // source就是源码
    // file-loader需要返回一个路径
    let filename = loaderUtils.interpolateName(this, '[hash].[ext]', {content: source})
    this.emitFile(filename, source)
    return `module.exports = "${filename}"`
} 

module.exports = loader