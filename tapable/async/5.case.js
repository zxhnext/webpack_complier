class AsyncSeriesWaterfallHook {
    constructor(args) { // args => ['name']
        this.tasks = []
    }
    tapAsync(name, task) {
        this.tasks.push(task)
    }
    callAsync(...args) {
        let finalCallback = args.pop()
        let index = 0
        let next = (err, data) => {
            let task = this.tasks[index]
            if(!task) return finalCallback()
            if(index === 0) { // 如果是第一个
                task(...args, next)
            } else {
                task(data, next)
            }
            index++
        }
        next()
    }
}

let hook = new AsyncSeriesWaterfallHook(['name'])

hook.tapAsync('react', function(name,cb) {
    setTimeout(() => {
        console.log('react', name)
        cb(null, 'result')
    }, 1000);
})
hook.tapAsync('node', function(data,cb) {
    setTimeout(() => {
        console.log('node', data)
        cb(null)
    }, 1000)
})
hook.callAsync('zxh', function() {
    console.log('end')
})