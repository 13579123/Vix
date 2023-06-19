import {VixOption} from "../index";

// 全局混入
export const VIX_GLOBAL_MIXIN: Set<VixOption<any>> = new Set

// 全局混入
export default function mixin(vixOption: VixOption<any>) {
  VIX_GLOBAL_MIXIN.add(vixOption)
}
