/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import './css/custom.css';
import { Logger } from '../../utils/';
var log =  Logger.getLogger('UI Plugin Divided');

export function Divided (){

  var render = function(ev,cmp,app){
    var currentTime = app.sequencer ? app.sequencer.currentTime:-1;
     var setClasses = function(_cmp,N){
         document.querySelector('orkestra-ui').className="container";
         log.info("N=>",N);
         if (N>6){
           _cmp.className = "item79";
         }
         else if (N==5 || N==6){
          _cmp.className = "item456";
         }
         else if (N==3 || N==4){
          _cmp.className = "item34";
         }
         else if (N==2){
           _cmp.className = "item24";
         }
        
         else if (N==1){
            _cmp.className = "item21";
         }

     }
     var visible = Array.from(cmp).filter( (x,i,len) =>
       {

         return x.style.display!="none"
       });
       
        visible.forEach((cmp,o,len)=>{
            if (typeof cmp.order==="undefined") cmp.style.order = 0;
            else cmp.style.order = cmp.order[currentTime];
            setClasses(cmp,len.length);
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
