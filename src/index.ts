import init from "./vix/init";
import compilerToRender, {RenderFunction} from "./compiler/compilerToRender";
import VirtualNode from "./vnode/virtualNode";
import nextTick from "./util/nextTick";
import {Computed} from "./core/computed";
import {WatchOption} from "./core/watch";
import {mount} from "./vix/mount";
import watch from "./vix/watch";
import {patch} from "./vnode/patch";
import extend from "./util/extend";
import component from "./util/component";
import mixin, {VIX_GLOBAL_MIXIN} from "./core/mixin";
import mixedOption from "./util/mixedOption";
import set from "./core/set";

export interface VixOption<T> {
  data?: T | (()=>T) ,
  el?: string|HTMLElement ,
  template?: string ,
  render?: RenderFunction ,
  mixin?: VixOption<any>[] ,
  watch?: {[key: string]: WatchOption|((n: any,o: any) => void)},
  computed?: {[key: string]: Computed<any>|(() => any)} ,
  components: {[key: string]: VixOption<any>} ,

  beforeCreate?: Function|Function[],
  created?: Function|Function[],
  mounted?: Function|Function[],
  beforeDestroy?: Function|Function[]
}

export default class Vix<T> {

  // 全局组件
  public static components: Map<string, new (...arg: any) => Vix<any>> = new Map

  // 异步函数
  public static nextTick: (call: any) => void = nextTick

  // 全局混入
  public static mixin (option: VixOption<any>) {
    return mixin(option)
  }

  // 创建子类
  public static extend<T>(options: VixOption<T>) {
    return extend(options)
  }

  // 创建子组件
  public static component<T>(id: string , option: VixOption<T>) {
    return component(id , option)
  }

  // 代理后的用户数据
  public $data: T = null

  public $el: HTMLElement = null

  public $virtualNode: VirtualNode = null // 当前虚拟dom

  public $nextTick: (call: any) => void = nextTick

  public $render: RenderFunction

  public $option: VixOption<T> = null

  // 自己的组件
  public readonly $components: Map<string, new (...arg: any) => Vix<any>> = new Map

  constructor(option: VixOption<T>) {
    // 混合所有的option
    this.$option = option
    if (option.mixin)
      option.mixin.forEach(mix => this.$option = mixedOption(mix , this.$option))
    VIX_GLOBAL_MIXIN.forEach(mix => this.$option = mixedOption(mix , this.$option))
    init(this)
  }

  public $set(obj: any , key: string , data: any) {
    return set(this , obj , key , data)
  }

  public $mount(el?: string|HTMLElement) {
    return mount(this , el)
  }

  public $update(v_node: VirtualNode) {
    return patch(this.$el , v_node)
  }

  public $watch(variable: string|(() => any) , callback: (n: any , o: any) => void , option?: any) {
    watch(this , variable , callback , option)
  }
}
