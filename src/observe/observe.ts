import Dep from "./dep";

const HASE_OBSERVER_OBJECT: WeakMap<any , any> = new WeakMap()

export const OBJECT_DEP_SYMBOL = Symbol()

function observeReactiveProperty(data: any) {
  for (const key in data) {
    let value: any = observe(data[key])
    const dep = new Dep(data , key)
    // 深度监视所有数组或者挂载dep到对象身上
    const dependDepth = (dt: any) => {
      if (typeof dt !== "object") return
      dt[OBJECT_DEP_SYMBOL] = dep // 将dep挂载到对象本身
      if (dt instanceof Array)
        for (const dtElement of dt) dependDepth(dtElement)
    }
    Object.defineProperty(data , key , {
      get(): any {
        dependDepth(value)
        dep.depend() // 获取当前watcher
        return value
      } ,
      set(v: any) {
        if(value === v) return
        let old = value
        value = observe(v)
        dep.notify(value , old) // 通知更新
      }
    })
  }
}

function observeReactiveArray(data: any[]) {
  [
    "push" ,
    "splice" ,
    "pop" ,
    "shift" ,
    "unshift" ,
    "sort" ,
    "revers"
  ].forEach(funName => {
    const ordinary: Function = Array.prototype[funName]
    data[funName] = function (...arg: any[]) {
      if (funName === "push" || funName === "unshift")
        arg = arg.map(item => observe(item))
      else if (funName === "splice")
        arg = [arg[0] , arg[1] , observe(arg[2])]
      // 通知数组更新
      if(data[OBJECT_DEP_SYMBOL]) data[OBJECT_DEP_SYMBOL].notify()
      return ordinary.call(this , ...arg)
    }
  })
  for (let i = 0; i < data.length; i++) data[i] = observe(data[i])
}

function observeToReactive<T extends Object> (data: T) {
  if (data instanceof Array) observeReactiveArray(data)
  else observeReactiveProperty(data)
}

export default function observe<T> (data: T): T {
  if (
    typeof data !== "object"
    ||
    data === null
    ||
    HASE_OBSERVER_OBJECT.has(data)
  ) return data
  observeToReactive(data)
  return data
}
