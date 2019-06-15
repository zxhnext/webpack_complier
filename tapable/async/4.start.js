let { AsyncSeriesHook } = require('tapable');
// 异步钩子，并行
class Lesson {
    constructor() {
        this.hooks = {
            arch: new AsyncSeriesHook(['name'])
        }
    }
    tap() { // 注册监听函数
        this.hooks.arch.tapPromise('node', function(name) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    console.log('node', name)
                    resolve()
                }, 1000)
            })
        })
        this.hooks.arch.tapPromise('react', function(name) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    console.log('react', name)
                    resolve()
                }, 1000)
            })
        })
    }
    start() { // 使函数执行
        this.hooks.arch.promise('zxh').then(function() {
            console.log('end')
        })
    }
}

let l = new Lesson()
l.tap() // 注册这两个事件
l.start() // 启动钩子

// AsyncParallelBailHook 带保险的异步并发钩子，发现错误时暂停