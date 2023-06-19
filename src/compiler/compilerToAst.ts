// ast 树节点
export class HTMLAstToken {
  readonly tag: string // 标签名

  private _parent: HTMLAstToken = null // 父节点
  get parent(): HTMLAstToken {return this._parent}
  set parent(t) {
    if (t === null)
      this._parent?.removeChild(this)
    else if (t) t.appendChild(this)
  }

  public textValue: any = "" // value 属性 只有tag为text时有值

  readonly children: HTMLAstToken[] = [] // 子节点
  readonly attribute: {[key: string]: string} = {} // 标签属性
  constructor(tag: string) { this.tag = tag }
  // 添加子节点
  public appendChild(token: HTMLAstToken) {
    this.children.push(token)
    token._parent = this
  }
  // 移除节点
  public removeChild(token: HTMLAstToken) {
    if (token.parent !== this) return
    this.children.splice(this.children.indexOf(token) , 1)
    token._parent = null
  }
}

// ast 类
export class HTMLAst {
  // 根节点
  rootToken: HTMLAstToken = null
}

// 所有自结束标签
const SELF_END_TAG = [
  "br" , "hr" , "img" , "link" , "base" , "area" , "input" , "source"
]

// 获取合法位置最小值
function getMinIndex(...index: number[]): number {
  index = index.filter(i => i !== -1)
  return Math.min(...index)
}

// template转换为ast
export default function compilerToAst(template: string): HTMLAst {
  // tag 栈
  const tagStack: HTMLAstToken[] = []
  const ast = new HTMLAst()
  template = template.trim()
  // 我们每次获取一个astToken就删除对应的标签，直到template变成空
  while (template) {
    // 表示是一个标签
    if (template[0] === "<") {
      template = template.slice(1 , template.length).trim() // 去掉 < 字符
      // 获取第一个标签名称的结束位置 可能是 <div > 可能是 <div>
      const tagEndIndex = getMinIndex(
        template.indexOf(" ") ,
        template.indexOf(">") ,
      )
      const tagName = template.slice(0 , tagEndIndex) // 标签名
      template = template.slice(tagEndIndex , template.length).trim() // 删除标签名
      // 如果是以 / 开头 说明是某个结束标签 直接出栈即可
      if(tagName[0] === "/") {
        // 如果和栈顶标签名称不一样
        if (tagName.slice(1 , tagName.length) !== tagStack[tagStack.length - 1].tag)
          throw new Error("Vix ERROR: The HTML has an error invalid tag end: <" + tagName + ">")
        tagStack.pop()
      }
      // 如果是开头的标签，则生成对应的树节点以及获取属性
      else {
        const astToken = new HTMLAstToken(tagName) // ast 标签 token
        if(ast.rootToken === null) ast.rootToken = astToken // 赋值root
        if(tagStack.length > 0) astToken.parent = tagStack[tagStack.length - 1]
        tagStack.push(astToken) // 入栈
        // 属性获取
        while (template[0] !== '/' && template[0] !== '>') {
          // 拿到属性名结尾的位置 可能是 id ="123" id="123"
          const attrNameEndIndex = getMinIndex(
            template.indexOf(" ") ,
            template.indexOf("=")
          )
          const attrName = template.slice(0 , attrNameEndIndex) // 拿到属性名
          template = template.slice(attrNameEndIndex , template.length) // 去掉属性名
          astToken.attribute[attrName] = "" // 默认属性为空
          // 说明设置了值
          if (template[0] === "=") {
            // value 结束的位置
            let valueEndIndex = 1;
            const startWith = template[1] // 是否以 ' 或者 " 开头
            while(true) {
              valueEndIndex++
              // 再次碰到表示结尾
              if (startWith === "'" || startWith === "\"") {
                if (template[valueEndIndex] === startWith) {
                  valueEndIndex++ // 跳出再次++包含后面的冒号
                  break
                }
              }
              // 否则碰到 空格 斜杠 三角 表示结尾
              else if (
                template[valueEndIndex] === " " ||
                template[valueEndIndex] === "/" ||
                template[valueEndIndex] === ">"
              ) break
            } // 直到找到value值结束为止
            let value = template.slice(1 , valueEndIndex) // 获取value
            if(value[0]==="\"" || value[0]==="\'")
              value = value.slice(1 , value.length-1)
            astToken.attribute[attrName] = value
            // 删除 value
            template = template.slice(valueEndIndex , template.length).trim()
          }
        }
        // 自结束标签
        if (
          template[0] === '/'
          ||
          tagName[tagName.length - 1] === '/'
          ||
          SELF_END_TAG.indexOf(tagName) !== -1
        ) tagStack.pop() // 出栈
      }
      // 删除标签尾部 >
      template = template.slice(template.indexOf(">") + 1 , template.length).trim()
    }
    // 表示是文本
    else {
      const astToken = new HTMLAstToken("text")
      if(tagStack.length > 0) astToken.parent = tagStack[tagStack.length - 1]
      astToken.textValue = template.slice(0 , template.indexOf("<")).trim();
      template = template.slice(template.indexOf("<") , template.length)
    }
  }
  // 如果栈没有清空 说明有标签没有闭合
  if (tagStack.length > 0) {
    throw new Error("Vix ERROR: The HTML template has a not close tag : <" +
      tagStack[tagStack.length - 1].tag
      +
      " "
      +
      Object.keys(tagStack[tagStack.length - 1].attribute).map(k => {
        return k + "=" + tagStack[tagStack.length - 1].attribute[k]
      }).join(" ")
      + ">"
    )
  }
  // 返回ast
  return ast
}
