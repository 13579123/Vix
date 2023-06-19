import Vix from "../index";

export type WatchOption = Option|string[];

// watch配置
export interface Option {
  // 处理函数
  handler: (n: any , o: any) => void ,
  // 深度检测
  deep?: boolean
}

export default function initWatch(vix: Vix<any>) {
  const watches = vix.$option.watch
  for (const key in watches) {
    // 可能是函数 字符串数组 和 option
    const watch = watches[key]
    let option: Option = {
      handler: void 0,
    }
    // 观察watch
    if (watch instanceof Array)
      vix.$watch(key , () => watch.forEach(f => vix[f]()) , option)
    else if (watch instanceof Function)
      vix.$watch(key , watch , option)
    else vix.$watch(key , watch.handler , watch)
  }
  return
}
