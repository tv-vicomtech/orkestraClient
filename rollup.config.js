/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import css from "rollup-plugin-css-only";
export default [
  {
    input: "src/main.js",
    output: { 
      file: "dist/orkestra.cjs.js",
      format: "cjs",
      name: "OrkestraAPI"
    },
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      css({ output: "./dist/bundle.css" })
    ]
  },
  {
    input: "src/main.js",
    output: {
      file: "./dist/orkestra.umd.js",
      format: "umd",
      name: "OrkestraAPI",
    },
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      css({ output: "./dist/bundle.css" }),
    ],
  }
];
