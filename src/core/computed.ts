import Vix from "../index";
import Watcher from "../observe/watcher";

export interface Computed<T> {
  get?: () => T;

  set?: (v: T) => void;
}


export default function initComputed(vix: Vix<any>) {
  const option = vix.$option
  // 变量计算属性
  for (const userDef in option.computed || {}) {
    let getter , setter
    if (typeof option.computed[userDef] === "function") {
      getter = option.computed[userDef]
      setter = () => { throw new Error("Haven't setter") }
    } else {
      getter = (<Computed<any>>option.computed[userDef]).get
      setter = (<Computed<any>>option.computed[userDef]).set || (() => { throw new Error("Haven't setter") })
    }
    // 是否脏了和缓存
    let isDirty = true , cache = null
    // 渲染watcher
    const renderWatchers: Set<Watcher> = new Set<Watcher>()
    // 该计算属性的watcher
    const watcher = new Watcher(vix , () => {
      if (!renderWatchers.has(watcher.parent) && watcher.parent)
        renderWatchers.add(watcher.parent)
      cache = getter.call(vix)
      isDirty = false
      // 收集上一层的watcher，当getter中使用的属性变化时，也会调用上层的watcher
      watcher.deps.forEach(dep => {
        renderWatchers.forEach(w => {
          if (dep.watchers.indexOf(w) === -1) {
            dep.watchers.push(w)
            w.deps.push(dep)
          }
        })
      })
      return cache
    } , {isLazy: true , onChange() {
        isDirty = true // 改变时脏值设为true
      }
    })
    // 每一个变量计算属性都有一个watcher
    Object.defineProperty(vix , userDef , {
      get: () => {
        if (!isDirty) return cache
        return watcher.update.call(watcher)
      } ,
      set: setter
    })
  }
}
