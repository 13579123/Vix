// 依赖收集器
import Watcher from "./watcher";
import Vix from "../index";

export default class Dep {

  private static GLOBAL_ID: number = 0

  public readonly id: number = ++Dep.GLOBAL_ID

  public watchers: Watcher[] = []

  public readonly data: any = null

  public readonly key: string = null

  constructor(data: any , key: string) {
    this.data = data
    this.key = key
  }

  depend() {
    // 添加当前watcher
    if (Watcher.GLOBAL_WATCHER && this.watchers.indexOf(Watcher.GLOBAL_WATCHER) === -1) {
      this.watchers.push(Watcher.GLOBAL_WATCHER)
      Watcher.GLOBAL_WATCHER.deps.push(this)
    }
  }

  notify(value: any, old: any) {
    // 通知watcher更新 我们先深拷贝，因为之后在清空dep和watcher时会影响到这里的循环
    [...this.watchers].forEach(c => c.onChange(value , old))
  }
}
