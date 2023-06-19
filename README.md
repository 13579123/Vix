# Vix
仿照vue写的库，主要用于熟悉vue的语法和原理，用法与vue类似。
## 目录结构
```text
-src // 根级源码目录
|___ index.ts // 到处文件
|___ vnode // 虚拟dom相关操作
    |___ patch.ts // diff算法操作和相关虚拟节点对比操作
    |___ virtualNode.ts // 虚拟节点的定义
|___ vix // vix 相关初始化操作
    |___ components.ts // 初始话vix接收到的component
    |___ init.ts // vix 初始话
    |___ mount.ts // 挂载操作
    |___ watch.ts // 初始化接受到的watch
|___ util // 一些功能函数
    |___ component.ts // 注册全局组件
    |___ extend.ts // 创建Vix的子类
    |___ isOrdinaryTag.ts // 判断是否是原始标签
    |___ nextTick.ts // 异步操作
    |___ mixedOption.ts // 混合option
|___ observe // 数据劫持相关
    |___ dep.ts // 依赖收集模块
    |___ observe.ts // 数据监视
    |___ watcher.ts // 观察者
|___ core // 核心功能
    |___ computed.ts // 计算属性
    |___ watch.ts // 监视属性
    |___ mixin.ts // 全局混入
|___ compiler // 编译模块
    |___ compilerToAst.ts // 将模板转换为AST语法树
    |___ compilerToJS.ts // 将ast语法树转换为js语法
    |___ compilerToRender.ts // 将模板转换为render函数
```
