import Vix, {VixOption} from "../index";
import {VIX_GLOBAL_MIXIN} from "../core/mixin";

// 深拷贝一个对象
function cloneObject<T extends Object>(obj: T): T {
  // 记录对象引用的set防止循环引用
  const objectSet: Set<any> = new Set<any>()

  function selfClone<T extends Object> (obj: T): T {
    if (typeof obj !== "object" || obj === null || objectSet.has(obj)) return obj;
    const result: T = {} as any;
    Object.keys(obj).forEach(key => {
      // 普通数据
      if (typeof obj[key] !== 'object') {
        result[key] = obj[key]
        return
      }
      // 数组
      if (Array.isArray(obj[key])) {
        objectSet.add(obj[key])
        result[key] = []
        for (const item of obj[key]) result[key].push(selfClone(item))
        return
      }
      // 对象
      objectSet.add(obj[key])
      result[key] = selfClone(obj[key])
    })
    return result
  }

  return selfClone(obj)
}

// 合并对象，会改变源对象
function mixedObject<T extends Object>(main: T , m: T): T {
  if (typeof main !== 'object' || typeof m !== 'object') return main
  if (!m) return main
  Object.keys(m).forEach(key => {
    if (main[key] === void 0) main[key] = m[key]
    else if (main[key] instanceof Array) {
      if (m[key] instanceof Array)
        main[key].push(...m[key])
      else if (m[key]) main[key].push(m[key])
    }
    else if (typeof main[key] === 'object')
      main[key] = mixedObject(main[key] , m[key])
  })
  return main
}

// 会优先使用组件的option
export default function mixedOption<T>(
  globalOption: VixOption<T> ,
  componentOption: VixOption<T>
): VixOption<T> {
  let resultOption: VixOption<T> = cloneObject(componentOption)
  resultOption = mixedObject(resultOption , globalOption)
  // 生命周期混入
  const life = ["beforeCreate" , "created" , "beforeDestroy" , "mounted"]
  life.forEach(lifeKey => {
    let lifeCall = []
    if (componentOption[lifeKey] instanceof Array)
      lifeCall.push(...componentOption[lifeKey])
    else if (componentOption[lifeKey])
      lifeCall.push(componentOption[lifeKey])
    if (globalOption[lifeKey] instanceof Array)
      lifeCall.push(...globalOption[lifeKey])
    else if (globalOption[lifeKey])
      lifeCall.push(globalOption[lifeKey])
    resultOption[lifeKey] = lifeCall
  })
  return resultOption

}
