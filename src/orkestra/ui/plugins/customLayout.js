/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import './css/custom.css';
import { Logger } from '../../utils/';
var log =  Logger.getLogger('UI Plugin Custom Layout');

export function CustomLayout (){

  var render = function(ev,cmp){
     var setClasses = function(parameters,_cmp,N){
         document.querySelector('orkestra-ui').className="grid";
         log.info("parameters=>",parameters);
         let cmp_p = parameters.find((x)=>{ if (x.id == _cmp.id) return true})   
         if (cmp_p){
             _cmp.style.top = cmp_p.top;
             _cmp.style.left = cmp_p.left;
             _cmp.style.width = cmp_p.width;
             _cmp.style.height = cmp_p.height;
             _cmp.style.zIndex = cmp_p.zindex;
             _cmp.style.position = "absolute";
         }
     }
     var visible = Array.from(cmp).filter( (x,i,len) =>
       {

         return x.style.display!="none"
       });
        visible.forEach((cmp,o,len)=>{
            setClasses(JSON.parse(localStorage.getItem("parameters")),cmp,len.length);
        });


  }
  var unload = function (cmps){
     Array.from(cmps).forEach((c)=>{
      c.style ="";
      c.className ="";
   })

  }
  var plugin ={
     render:render,
     unload:unload
  }
  return plugin;

}
