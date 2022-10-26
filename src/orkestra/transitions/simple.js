/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import './css/simple.css';
import { Logger } from '../utils/';
var log =  Logger.getLogger('Transtiion Plugin Simple');

export function Simple (options){
    var render = function(time){
        if (options && options.background) document.body.style.background = options.background; 
        document.body.className = "ork_opacity_0"; 
        if (!time) 
            if (options && options.time) var time = options.time;
        setTimeout(()=>{
            document.body.className ="ork_opacity_1";
        },(time || 1500));
    
    }
    var plugin ={
        render:render,
        name:"Simple"
     }
     return plugin;
}
