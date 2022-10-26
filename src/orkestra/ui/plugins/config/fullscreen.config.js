/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
const Config = {
     componentId:"video3",
      cols: 2,
     rows: 2,
     agents: [
         {
             agentid: "sala1tv1",
             screensize: { width: 868, height: 442 },
             row: 0,
             col: 0,
             offsetx:0,
             offsety:0,
         },
         {
             agentid: "sala1tv2",
             screensize: { width: 868, height: 442 },
             row: 0,
             col: 1,
             offsetx:100,
             offsety:0,
         },
         {
             agentid: "sala1tv3",
             screensize: { width: 868, height: 442 },
             row: 1,
             col: 0,
             offsetx:0,
             offsety:-20,
         },
         {
             agentid: "sala1tv4",
             screensize: { width: 868, height: 442 },
             row: 1,
             col: 1,
             offsetx:100,
             offsety:-20,
         },
         {
             agentid: "sala2tv1",
             screensize: { width: 868, height: 442 },
             row: 0,
             col: 0,
             offsetx:0,
             offsety:0,
         },
         {
             agentid: "sala2tv2",
             screensize: { width: 868, height: 442 },
             row: 0,
             col: 1,
             offsetx:100,
             offsety:0,
         },
         {
             agentid: "sala2tv3",
             screensize: { width: 868, height: 442 },
             row: 1,
             col: 0,
             offsetx:0,
             offsety:-20,
         },
         {
             agentid: "sala2tv4",
             screensize: { width: 868, height: 442 },
             row: 1,
             col: 1,
             offsetx:100,
             offsety:-20,
         },

     ]
 }

export {Config}
