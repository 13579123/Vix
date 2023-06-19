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

export interface VixOption<T> {
  data?: T | (()=>T) ,
  el?: string|HTMLElement ,
  template?: string ,
  render?: RenderFunction ,
  watch?: {[key: string]: WatchOption|((n: any,o: any) => void)},
  computed?: {[key: string]: Computed<any>|(() => any)} ,
  components: {[key: string]: VixOption<any>} ,

  beforeCreate?: Function,
  created?: Function,
  mounted?: Function,
  beforeDestroy?: Function
}

export default class Vix<T> {

  // 全局组件
  public static components: Map<string, new (...arg: any) => Vix<any>> = new Map

  // 异步函数
  public static nextTick: (call: any) => void = nextTick

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

  public readonly $option: VixOption<T> = null

  // 自己的组件
  public readonly $components: Map<string, new (...arg: any) => Vix<any>> = new Map

  constructor(option: VixOption<T>) {
    this.$option = option
    init(this)
  }

  public $mount(el?: string|HTMLElement) {
    mount(this , el)
  }

  public $update(v_node: VirtualNode) {
    return patch(this.$el , v_node)
  }

  public $watch(variable: string|(() => any) , callback: (n: any , o: any) => void , option?: any) {
    watch(this , variable , callback , option)
  }
}
