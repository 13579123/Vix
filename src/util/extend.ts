import Vix, {VixOption} from "../index";

export default function extend<T>(options: VixOption<T>): new (...a: any) => Vix<T> {
  class Sub extends Vix<T> {

    static get option() { return options }

    constructor() {
      super(options);
    }

  }
  return Sub
}
