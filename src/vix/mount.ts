
// 挂载我们的vix的模板
import Vix from "../index";
import compilerToRender from "../compiler/compilerToRender";
import Watcher from "../observe/watcher";
import {patch} from "../vnode/patch";
import VirtualNode from "../vnode/virtualNode";

export function mount<T>(vix: Vix<T> , el?: string|HTMLElement) {
  // 没有render的情况下去使用el或者template
  if (!vix.$option.render) {
    let template: string = "";
    // 优先使用 el 属性作为template
    if (vix.$option.el) {
      // 将el转换为HTMLElement
      if (typeof vix.$option.el === "string")
        vix.$el =
          <HTMLElement>document.querySelector(vix.$option.el)
      // 兼容outerHTML 因为它可能不兼容火狐
      if (vix.$el.outerHTML) template = vix.$el.outerHTML
      else {
        const div = document.createElement("div")
        const clone = vix.$el.cloneNode(true)
        div.appendChild(clone)
        template = div.innerHTML
        div.removeChild(clone)
      }
    }
    // 使用 template 作为模板
    else if (vix.$option.template)
      template = vix.$option.template
    // 三个都没有的情况下，报错
    else { throw new Error("Can not find render , template or el")}
    // 编译template
    vix.$render = compilerToRender(template)
  } else vix.$render = vix.$option.render
  let virtualNode: VirtualNode;
  // 创建watcher 并且渲染一次
  new Watcher(vix , () => {
    virtualNode = vix.$render()
    // 已经有被渲染过了
    if (vix.$virtualNode) vix.$el = <HTMLElement>patch(vix.$virtualNode , virtualNode)
    // 初次渲染 挂载到el上面
    else if (el)
      vix.$el = <HTMLElement>patch(
        <HTMLElement>(typeof el === 'string' ? document.querySelector(el) : el) ,
        virtualNode
      )
    vix.$virtualNode = virtualNode
  })
  return virtualNode
}
