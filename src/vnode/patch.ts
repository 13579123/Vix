import VirtualNode from "./virtualNode";

function isSameVirtualNode(oldN: VirtualNode , newN: VirtualNode): boolean {
  return oldN.key === newN.key && oldN.tag.toLowerCase() === newN.tag.toLowerCase()
}

// diff算法对比子节点
function diffPatchChildren(el: Node, oldChildren: VirtualNode[], newChildren: VirtualNode[]) {
  let
    newIndex = 0 , oldIndex = 0 ,
    newEndIndex = newChildren.length - 1 ,
    oldEndIndex = oldChildren.length - 1 ;
  // 是否已经存在
  const hasOldNodeSet: Set<VirtualNode> = new Set

  // 是否还有没有对比的
  while (newIndex <= newEndIndex && oldIndex <= oldEndIndex) {
    // 乱序对比
    let newNode: Node = null;
    for (const oldNode of oldChildren) {
      if (hasOldNodeSet.has(oldNode) || !isSameVirtualNode(oldNode , newChildren[newIndex]))
        continue;
      hasOldNodeSet.add(oldNode)
      newNode = diffPatch(oldNode , newChildren[newIndex])
      break
    }
    // 如果没有老节点则创建新的
    if (!newNode) newNode = newChildren[newIndex].createElement()
    if (newChildren[newIndex - 1]) {
      // 如果该节点不在正确的位置 插入到上一个的下一个 否则位置不变
      // @ts-ignore
      if ([...el.childNodes].indexOf(newChildren[newIndex].reallyNode) !== newIndex)
        el.insertBefore(newNode, newChildren[newIndex - 1].reallyNode.nextSibling || null)
    } else if (el.childNodes.length) {
      // @ts-ignore
      if (newIndex !== 0)
        el.insertBefore(newNode, el.firstChild)
    } else el.appendChild(newNode)
    newIndex++
  }

  // 删除多余的节点
  while (oldIndex <= oldEndIndex) {
    if (!hasOldNodeSet.has(oldChildren[oldIndex])) {
      // 组件需要调用生命周期
      if (oldChildren[oldIndex].componentSub) {
        const beforeDestroy = oldChildren[oldIndex].vix.$option.beforeDestroy
        if (beforeDestroy) {
          if (beforeDestroy instanceof Array)
            beforeDestroy.forEach(c => c.call(oldChildren[oldIndex].vix))
          else beforeDestroy.call(oldChildren[oldIndex].vix)
        }
      }
      el.removeChild(oldChildren[oldIndex].reallyNode)
    }
    oldIndex++
  }
  // 添加新增节点
  while (newIndex <= newEndIndex) {
    const newNode = newChildren[newIndex].createElement()
    if (newChildren[newIndex - 1]) {
      el.insertBefore(newNode , newChildren[newIndex - 1].reallyNode.nextSibling)
    } else if (el.firstChild)
      el.insertBefore(newNode , el.firstChild)
    else el.appendChild(newNode)
    newIndex++
  }
}

// diff算法对比并替换双方的节点
function diffPatch(oldNode: VirtualNode , newNode: VirtualNode): Node {
  // 不是相同的节点直接替换
  if (!isSameVirtualNode(oldNode , newNode)) {
    const el = newNode.createElement()
    oldNode.reallyNode.parentNode.replaceChild(el , oldNode.reallyNode)
    return el
  }
  // 复用节点元素
  const el: HTMLElement =
    (<HTMLElement>newNode.reallyNode) = (<HTMLElement>oldNode.reallyNode)
  // 可能是文本 我们需要比较文本内容
  if (oldNode.tag === "text") {
    if (oldNode.textValue !== newNode.textValue)
      oldNode.reallyNode.textContent = newNode.textValue
  }
  // 属性比较
  for (const key in newNode.attribute) {
    // 如果是样式
    if (key === "style") {
      for (const styleKey in newNode.attribute[key]) {
        el.style[styleKey] = newNode.attribute[key][styleKey]
      }
    } else el.setAttribute(key , newNode.attribute[key])
  }
  // 删除老属性
  for (const key in oldNode.attribute) {
    // 如果是样式
    if (key === "style") {
      for (const styleKey in oldNode.attribute[key]) {
        if (!newNode.attribute[key][styleKey])
          el.style[styleKey] = ""
      }
    } else if (!newNode.attribute[key]) el.removeAttribute(key)
  }

  // 子节点比较 分为 新旧都有子节点 新加节点 删除老节点
  if (oldNode.children.length > 0 && newNode.children.length > 0)
    // 比较子节点的diff算法
    diffPatchChildren(el , oldNode.children , newNode.children)
  else if (newNode.children.length > 0) // 老节点不存在子节点 新节点存在子节点
    // 添加所有节点
    newNode.children.forEach(c => el.appendChild(c.createElement()))
  else if (oldNode.children.length > 0) {// 老节点存在子节点 新节点不存在子节点
    // 删除所有节点
    if (oldNode.componentSub) { // 说明是组件
      if (oldNode.vix.$option.beforeDestroy) {
        if (oldNode.vix.$option.beforeDestroy instanceof Array)
          oldNode.vix.$option.beforeDestroy.forEach(c => c.call(oldNode.vix))
        else oldNode.vix.$option.beforeDestroy.call(oldNode.vix)
      }
    }
    oldNode.children.forEach(c => oldNode.reallyNode.removeChild(c.reallyNode))
  }

  return el
}

export function patch(oldNode: VirtualNode|HTMLElement , newNode: VirtualNode) {
  // 如果没有原来的虚拟节点，则直接使用新节点
  if (oldNode instanceof HTMLElement) {
    const el = newNode.createElement()
    oldNode.parentNode.replaceChild(el , oldNode)
    return el
  } else if (oldNode instanceof VirtualNode)
    // diff 比较
    return diffPatch(oldNode, newNode)
}
