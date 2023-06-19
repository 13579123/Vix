// watcher 负责监视所有的响应式属性
// 在属性更新后，会自动更新视图
import Vix from "../index";
import Dep from "./dep";

interface WatcherOption {
  isLazy?: boolean // 是否懒渲染
  onChange?: Function // 改变函数
}

export default class Watcher {

  // 当前全局watcher 表示当前渲染的是哪一个watcher
  public static GLOBAL_WATCHER: Watcher = null

  // 全局id
  private static GLOBAL_ID: number = 0

  // 可能有嵌套watcher 我们用父watcher去记录上一个
  private _parent: Watcher = null
  get parent() {return this._parent}

  // 唯一id
  public readonly id: number = ++Watcher.GLOBAL_ID

  // 配置
  private readonly $option: WatcherOption = null

  // 所属的vix实例
  public readonly vix: Vix<any> = null

  // 获取哪些属性在监视它
  public readonly deps: Dep[] = []

  // 更新视图的函数
  public readonly _update: Function = null

  // 构造器
  constructor(vix: Vix<any> , update: Function , option: WatcherOption = {}) {
    this.vix = vix
    this.$option = option
    // 记录更新函数
    this._update = update
    // 立即渲染
    if (!option.isLazy)
      this.update()
  }

  // 有数据改变了
  onChange(value: any, old: any) {
    if (this.$option.onChange)
      return this.$option.onChange(value , old)
    else return this.update()
  }

  // 延迟更新
  update() {
    // 清空dep的watcher重新收集
    this.deps.forEach(d => d.watchers.splice(d.watchers.indexOf(this) , 1))
    this.deps.length = 0
    // 入栈出栈
    this._parent = Watcher.GLOBAL_WATCHER
    Watcher.GLOBAL_WATCHER = this
    const result = this._update()
    Watcher.GLOBAL_WATCHER = this.parent
    this._parent = null
    return result
  }

}
