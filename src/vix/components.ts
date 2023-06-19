import Vix from "../index";

export default function initComponents(vix: Vix<any>) {
  Object.keys(vix.$option.components).forEach(component => {
    vix.$components.set(
      component.toLowerCase() ,
      Vix.extend(vix.$option.components[component])
    )
  })
}
