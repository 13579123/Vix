import Vix from "../index";

// 虚拟节点
export default class VirtualNode {

  public readonly tag: string = ""

  public  key: string = ""

  public  parent: VirtualNode = null

  public readonly componentSub: new (...arg: any) => Vix<any> = null // 如果存在说明是组件

  public reallyNode: Node = null // 对应真实DOM

  public readonly vix: Vix<any> = null // 对应的实例

  public readonly attribute: {[key: string]: string|any} = {} // 属性

  public readonly children: VirtualNode[] = [] // 子节点

  public  textValue: string = "" // 文本值

  constructor(vix: Vix<any> , tag: string , attr: any , children: VirtualNode[] , componentSub = null) {
    this.tag = tag
    this.vix = vix
    this.componentSub = componentSub
    if (attr)
      Object.keys(attr).forEach(k => {
        if (k === "key") this.key = attr[k]
        this.attribute[k] = attr[k]
      })
    children.forEach(c => {
      c.parent = this
      this.children.push(c)
    })
  }

  // 创建真实节点
  public createElement(): Node {
    // 普通节点
    if (this.componentSub === null) {
      // 递归创建子节点
      if (this.tag !== "text") {
        this.reallyNode = document.createElement(this.tag)
        // 设置属性
        Object.keys(this.attribute).forEach(k => {
          if (this.reallyNode instanceof HTMLElement) {
            if (k !== "style") this.reallyNode.setAttribute(k , this.attribute[k])
            else {
              for (const k in this.attribute['style'])
                this.reallyNode.style[k] = this.attribute['style'][k]
            }
          }
        })
        // 递归创建子节点
        this.children.forEach(c => this.reallyNode.appendChild(c.createElement()))
      }
      else this.reallyNode = document.createTextNode(this.textValue)
      return this.reallyNode
    }
    // 组件节点
    const sub = new this.componentSub()
    sub.$mount()
    sub.$virtualNode = this
    this.reallyNode = sub.$render().createElement()
    return this.reallyNode
  }

}
