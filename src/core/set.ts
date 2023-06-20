import Vix from "../index";
import observe, {OBJECT_DEP_SYMBOL} from "../observe/observe";
import Dep from "../observe/dep";

// 添加数据到vix实例上
// obj 是要添加的目标对象
// key 是添加的键
// data 是添加的数据
export default function set(vix: Vix<any> , obj: any , key: string , data: any) {
  data = observe(data)
  obj[key] = data
  Object.defineProperty(obj , key , {
    get() { return data } ,
    set(v: any) {
      if (data === v) return
      const old = observe(data);
      data = v;
      (obj[OBJECT_DEP_SYMBOL] as Dep).notify(data , old)
    }
  });
  (obj[OBJECT_DEP_SYMBOL] as Dep).notify(obj , obj)
}
