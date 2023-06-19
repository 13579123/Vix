import babel from "rollup-plugin-babel"
import path from "path";
import ts from "rollup-plugin-typescript2"

export default {
  input: path.join(__dirname , "src" , "index.ts") ,
  output: {
    file: path.join(__dirname , "dist" , "Vix.js") ,
    name: "Vix" ,
    format: "umd" ,
    sourcemap: true
  } ,
  plugins: [
    ts({
    }),
    babel({
      exclude: "node_modules/**"
    })
  ]
}
