import Vix from "../index";
import Watcher from "../observe/watcher";

export default function watch(vix: Vix<any> ,variable: string|(() => any) , callback: (n: any , o: any) => void , option?: any) {
  let getter: Function = void 0;
  if (typeof variable === "string") getter = () => vix[variable]
  else getter = variable.bind(vix)
  const watcher = new Watcher(vix , () => {
    return getter()
  } , {
    onChange: (n: any , o: any) => {
      callback.call(vix , n , o)
    }
  })
}
