import {HTMLAst, HTMLAstToken} from "./compilerToAst";

function compiler(token: HTMLAstToken): string {
  // 文本节点直接解析后返回
  if (token.tag === "text") {
    const modelReg = /\{\{(.*?)\}\}/g
    let value: string = token.textValue
    if (modelReg.test(value)) {
      let match: RegExpExecArray;
      modelReg.lastIndex = 0;
      let tokens: string[] = []
      let lastIndex = 0
      while (match = modelReg.exec(token.textValue)) {
        if (match.index > lastIndex) {
          tokens.push(JSON.stringify(value.slice(lastIndex, match.index))) // 切割普通字符串
          // console.log(value.slice(lastIndex , match.index))
        }
        tokens.push(`_g_value(vix.${match[1].trim()})`)
        lastIndex = match.index + match[0].length
      }
      tokens.push(JSON.stringify(value.slice(lastIndex)))
      value = tokens.join("+")
    } else value = JSON.stringify(value)
    return `
     _c_text(${value})
    `.replace(/\n| /g , "")
  }
  let attribute: any = null
  Object.keys(token.attribute).forEach(k => {
    if (attribute === null) attribute = {}
    // 如果是样式
    if (k === "style") {
      attribute[k] = {}
      token.attribute[k].split(";").forEach(kv => {
        if (!kv) return
        const [key, value] = kv.split(":")
        attribute[k][key.trim()] = value.trim();
      })
    }
    // 普通属性
    else attribute[k] = token.attribute[k]
  })
  return `
    _c_node(
    ${JSON.stringify(token.tag)} ,
    ${JSON.stringify(attribute)} 
    ${token.children.length === 0 ? "" : ("," + token.children.map(c => compiler(c)).join(','))}
    )
  `.replace(/\n| /g , "")
}

// 生成js
export function compilerToJS(ast: HTMLAst): string {
  return compiler(ast.rootToken)
}
