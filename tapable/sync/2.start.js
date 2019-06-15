let { SyncBailHook } = require('tapable'); // 可以暂停到某一步

class Lesson {
    constructor() {
        this.hooks = {
            arch: new SyncBailHook(['name'])
        }
    }
    tap() { // 注册监听函数
        this.hooks.arch.tap('node', function(name) {
            console.log('node', name)
            return 'stop' // 这里有返回时，不会再向下一步执行
        })
        this.hooks.arch.tap('react', function(name) {
            console.log('react', name)
        })
    }
    start() { // 使函数执行
        this.hooks.arch.call('zxh')
    }
}

let l = new Lesson()
l.tap() // 注册这两个事件
l.start() // 启动钩子