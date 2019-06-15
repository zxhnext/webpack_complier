class AsyncParallelHook { // 同步钩子
    constructor(args) { // args => ['name']
        this.tasks = []
    }
    tapAsync(name, task) {
        this.tasks.push(task)
    }
    callAsync(...args) {
        let finalCallback = args.pop() // 拿出最终的callback函数
        let index = 0
        let done = () => { // Promise.all
            index++
            if(index == this.tasks.length) {
                finalCallback()
            }
        }
        this.tasks.forEach(task => {
            task(...args, done)
        })
    }
}

let hook = new AsyncParallelHook(['name'])

hook.tapAsync('react', function(name,cb) {
    setTimeout(() => {
        console.log('react', name)
        cb()
    }, 1000);
})
hook.tapAsync('node', function(name,cb) {
    setTimeout(() => {
        console.log('node', name)
        cb()
    }, 1000)
})
hook.callAsync('zxh', function() {
    console.log('end')
})