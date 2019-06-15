class AsyncSeriesHook {
    constructor(args) {
        this.tasks = []
    }
    tapPromise(name, task) {
        this.tasks.push(task)
    }
    promise(...args) {
        let [first, ...others] = this.tasks
        return others.reduce((p,n) => {
            return p.then(() => n(...args))
        }, first(...args))
    }
}

let hook = new AsyncSeriesHook(['name'])

hook.tapPromise('react', function(name) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('react', name)
            resolve()
        }, 1000)
    })
})
hook.tapPromise('node', function(name) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('node', name)
            resolve()
        }, 1000)
    })
})
hook.promise('zxh').then(function() {
    console.log('end')
})