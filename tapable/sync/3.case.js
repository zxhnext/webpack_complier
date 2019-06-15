class SyncWaterfallHook { // 获取上一个函数返回值，然后执行下一个
    constructor(args) { // args => ['name']
        this.tasks = []
    }
    tap(name, task) {
        this.tasks.push(task)
    }
    call(...args) {
        let [first, ...others] = this.tasks;
        let ret = first(...args)
        others.reduce((a, b) => {
            return b(a)
        }, ret) 
    }
}

let hook = new SyncWaterfallHook(['name'])

hook.tap('react', function(name) {
    console.log('react', name)
    return 'react success'
})
hook.tap('node', function(data) {
    console.log('node', data)
    return 'node success'
})
hook.tap('webpack', function(data) {
    console.log('webpack', data)
})
hook.call('zxh')