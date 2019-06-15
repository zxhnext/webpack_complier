class AsyncSeriesHook {
    constructor(args) { // args => ['name']
        this.tasks = []
    }
    tapAsync(name, task) {
        this.tasks.push(task)
    }
    callAsync(...args) {
        let finalCallback = args.pop()
        let index = 0
        let next = () => {
            if(this.tasks.length === index) return finalCallback()
            let task = this.tasks[index++]
            task(...args, next)
        }
        next()
    }
}

let hook = new AsyncSeriesHook(['name'])

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