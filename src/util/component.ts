import Vix, {VixOption} from "../index";

export default function component<T>(id: string , option: VixOption<T>) {
  Vix.components.set(id.toLowerCase() ,Vix.extend(option))
}
