
let fs = require('fs');
let path = require('path')
let babylon = require('babylon')
let t = require('@babel/types')
let ejs = require('ejs')
let { SyncHook } = require('tapable')
let traverse = require('@babel/traverse').default // es6模块需要default一下
let generator = require('@babel/generator').default
// babylon 把源码转换为ast
// @babel/traverse 遍历节点
// @babel/types 替换节点
// @babel/generator 生成结果
class Compiler {
    constructor(config) {
        // entry output
        this.config = config
        // 保存入口文件路径
        this.entryId // './src/index.js'
        // 保存所有的模块依赖
        this.modules = {}
        this.entry = config.entry // 入口路径
        // 工作路径
        this.root = process.cwd()
        // 生命周期
        this.hooks = {
            entryOption: new SyncHook(),
            compile: new SyncHook(),
            afterCompile: new SyncHook(),
            afterPlugins: new SyncHook(),
            run: new SyncHook(),
            emit: new SyncHook(),
            done: new SyncHook()
        }
        // 如果传递了plugins参数
        let plugins = this.config.plugins
        if(Array.isArray(plugins)) {
            plugins.forEach( plugin => {
                plugin.apply(this)
            })
        }
        this.hooks.afterPlugins.call()
    }
    getSource(modulePath) {
        let content = fs.readFileSync(modulePath, 'utf8')
        if(this.config.module.rules){
            let rules = this.config.module.rules
            // // 拿到每个规则来处理
            for(let i = 0; i < rules.length; i++) {
                let rule = rules[i]
                let {test, use} = rule
                let len = use.length - 1
                if(test.test(modulePath)) { // 这个模块需要loader来转化
                    // 获取对应的loader函数
                    function normalLoader() {
                        let loader = require(use[len--])
                        content = loader(content)
                        // 递归调用loader,实现转化功能
                        if(len >= 0) {
                            normalLoader()
                        }
                    }
                    normalLoader()
                }
            }
        }
        return content
    }
    // 解析源码 AST解析语法树 打开https://astexplorer.net/对照语法树查看
    parse(source, parentPath) { // source源码, parentPath路径
        let ast = babylon.parse(source)
        let dependencies = [] // 存放依赖模块数组
        traverse(ast, {
            CallExpression(p) {
                let node = p.node // 获取对应节点
                if(node.callee.name === 'require') {
                    node.callee.name = '_webpack_require__'
                    let moduleName = node.arguments[0].value // 取到的就是模块的引用名字
                    moduleName = moduleName + (path.extname(moduleName) ? '' : '.js')
                    moduleName = './' + path.join(parentPath, moduleName)
                    dependencies.push(moduleName) // 放到依赖数组中
                    node.arguments = [t.stringLiteral(moduleName)]
                }
            }
        })
        let sourceCode = generator(ast).code
        return { sourceCode, dependencies }
    }
    // 构建模块
    buildModule(modulePath, isEntry) {
        // 拿到模块内容
        let source = this.getSource(modulePath)
        // 模块id modulePath - this.root
        let moduleName = './' + path.relative(this.root, modulePath)
        if(isEntry) { // 如果是主入口
            this.entryId = moduleName // 保存入口名
        }
        // 解析需要把source源码进行改造，并返回一个依赖列表
        let {sourceCode, dependencies} = this.parse(source, path.dirname(moduleName)) // path.dirname(moduleName) 获取父路径 ./src
        // 把相对路径和模块中的内容对应起来
        this.modules[moduleName] = sourceCode

        dependencies.forEach(dep => { // 副模块加载
            this.buildModule(path.join(this.root, dep), false)
        })
    }
    emitFile() { // 发射文件
        // 用数据渲染模版文件
        // 拿到输出目录
        let main = path.join(this.config.output.path, this.config.output.filename)
        // 模版路径
        let templateStr = this.getSource(path.join(__dirname, 'main.ejs'))
        let code = ejs.render(templateStr, {entryId: this.entryId, modules: this.modules})
        this.assets = {}
        // 资源中路径对应的代码
        this.assets[main] = code;
        // 写到main文件中
        fs.writeFileSync(main, this.assets[main])
    }
    run() {
        this.hooks.run.call()
        this.hooks.compile.call()
        // 执行， 并且创建模块依赖关系
        this.buildModule(path.resolve(this.root, this.entry), true) // true代表是否是主模块
        this.hooks.afterCompile.call()
        // 发射一个文件 打包后的文件
        this.emitFile()
        this.hooks.emit.call()
        this.hooks.done.call()
    }
}

module.exports = Compiler