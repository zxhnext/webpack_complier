let path = require('path')
class P{
    apply(compiler) {
        compiler.hooks.emit.tap('emit', function() {
            console.log('emit')
        })
    }
}

class P1{
    apply(compiler) {
        compiler.hooks.afterPlugins.tap('emit', function() {
            console.log('afterPlugins')
        })
    }
}

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: [
                    path.resolve(__dirname, 'loader', 'style-loader.js'),
                    path.resolve(__dirname, 'loader', 'less-loader.js')
                ]
            },{
                test: /\.js$/,
                use: path.resolve(__dirname, 'loader', 'loader1.js')
            }
        ]
    },
    plugins: [
        new P(),
        new P1()
    ]
}