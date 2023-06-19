// 异步任务适配
let asyncFunction: (call: any) => void
if (requestAnimationFrame) asyncFunction = (call) => {requestAnimationFrame(call)}
else if (Promise) asyncFunction = (call) => {Promise.resolve().then(() => call())}
else asyncFunction = setTimeout

let IS_WAITING = false
let WORK_QUEUE: Function[] = []

// 下一个异步任务
export default function nextTick(call: Function) {
  if (IS_WAITING) {
    return WORK_QUEUE.push(call)
  }
  IS_WAITING = true
  WORK_QUEUE.push(call)
  asyncFunction(() => {
    WORK_QUEUE.forEach(c => c())
    IS_WAITING = false
    WORK_QUEUE = []
  })
}
