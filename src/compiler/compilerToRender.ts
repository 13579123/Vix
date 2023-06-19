// 返回一个render ， render返回一个虚拟dom
import {HTMLAst} from "./compilerToAst";
import compilerToAst from "./compilerToAst";
import VirtualNode from "../vnode/virtualNode";
import Vix from "../index";
import {compilerToJS} from "./compilerToJS";
import isOrdinaryTag from "../util/isOrdinaryTag";

export type RenderFunction = () => VirtualNode

export default function compilerToRender(template: string): RenderFunction {
  // 获取 ast 语法树
  const ast: HTMLAst = compilerToAst(template)
  // 编译为js
  const code: string = compilerToJS(ast)
  // console.log(code)
  // 转换为function
  const func = new Function(`with(arguments[0]) {
    return ${code}
  }`)
  // 生成render
  return function () {
    const vix: Vix<any> = this
    return func.call(this , {
      vix ,
      _g_value: (value: any) => {
        if (typeof value === "object") return JSON.stringify(value)
        return value
      } ,
      _c_node: (tag: string , attr: any , ...child: VirtualNode[]) => {
        // 如果是一般标签
        if (isOrdinaryTag(tag))
          return new VirtualNode(vix , tag , attr , child)
        // 如果是组件 则先找自己的 再找全局的
        else {
          let Sub: new (...arg: any) => Vix<any> = null;
          if (
            (Sub = vix.$components.get(tag.toLowerCase()))
            ||
            (Sub = Vix.components.get(tag.toLowerCase()))
          ) return new VirtualNode(vix , tag , attr , child , Sub)
          else throw new Error(`Vix Error: Can't find component <${tag} /> are you sure has register it?`)
        }
      } ,
      _c_text: (value: any) => {
        const vn = new VirtualNode(vix , "text" , null , [])
        vn.textValue = value
        return vn
      }
    })
  }
}
