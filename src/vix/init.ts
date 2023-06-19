import Vix from "../index";
import observe from "../observe/observe";
import compilerToRender from "../compiler/compilerToRender";
import Watcher from "../observe/watcher";
import initComputed from "../core/computed";
import initWatch from "../core/watch";
import {mount} from "./mount";
import initComponents from "./components";
import {VIX_GLOBAL_MIXIN} from "../core/mixin";

// 初始化data
function initData<T>(vix: Vix<T>) {
  vix.$data =
      vix.$option.data instanceof Function ?
      vix.$option.data.call(vix) : vix.$option.data
  // 对vix.data做监视
  vix.$data = observe(vix.$data)
  // 对data做一个从vix出发的代理
  for (const key in vix.$data)
    Object.defineProperty(vix , key , {
      get(): any {return vix.$data[key]} ,
      set(v: any) { vix.$data[key] = v }
    })
}

/**
 * 初始化Vix函数
 * 创建 挂载 都在这里执行
 * */
export default function init<T> (vix: Vix<T>) {
  // 初始化数据
  if (vix.$option.data) initData(vix)
  if (vix.$option.beforeCreate) {
    if (vix.$option.beforeCreate instanceof Array)
      vix.$option.beforeCreate.forEach(c => c.call(vix))
    else vix.$option.beforeCreate.call(vix)
  }
  // 初始话计算属性
  if (vix.$option.computed) initComputed(vix)
  // 初始化监视属性
  if (vix.$option.watch) initWatch(vix)
  // 如果有组件
  if (vix.$option.components) initComponents(vix)
  if (vix.$option.created) {
    if (vix.$option.created instanceof Array)
      vix.$option.created.forEach(c => c.call(vix))
    else vix.$option.created.call(vix)
  }
  // 挂载
  if (vix.$option.el) mount(vix , vix.$option.el || void 0)
  if (vix.$option.mounted) {
    if (vix.$option.mounted instanceof Array)
      vix.$option.mounted.forEach(c => c.call(vix))
    else vix.$option.mounted.call(vix)
  }
}
