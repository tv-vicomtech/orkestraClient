/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import './css/custom.css';
import { Logger } from '../../utils/';
import {Obj} from '../../utils/';
var log =  Logger.getLogger('UI Plugin Edit Layout');

export function EditLayout (){

  var render = function(ev,cmp){
    document.querySelector('orkestra-ui').className="grid";
     var changeZindex = function (type,id){
        switch (type){
              case "back":
                console.log("back",id);
              break;
              case "front":
                console.log("front",id);
              break;
        }
     }
     var setClasses = function(_cmp,N){
         
         _cmp.className +=_cmp.className.indexOf('resizable')==-1?"resizable":"";
         _cmp.style.width = "400px";
         _cmp.style.height = "auto";
         _cmp.style.position = "absolute";
         _cmp.style.top = Math.floor(Math.random() * 500) + 100+"px";
         _cmp.style.left = Math.floor(Math.random() * 1000) + 1+"px";
         _cmp.style.zIndex = 9999;
     }
     var visible = Array.from(cmp).filter( (x,i,len) =>
       {
         if (!x.shadowRoot.querySelector('#'+x.id+"header")){
             x.shadowRoot.innerHTML+= "<div id='"+x.id+"header' style='width:100%;height:25px;background:red;position:absolute;top:0px;'> Move <span style='padding-left:68%;cursor:pointer;' id="+x.id+"_backzindex> Back</span><span style='cursor:pointer;' id="+x.id+"_frontzindex>/Front</span></div>";
             x.shadowRoot.querySelector('#'+x.id+'_backzindex').addEventListener('click',(e)=>{
                  console.log(e);
                  let el = e.path[0].id;
                  let elid = el.split('_')[0];
                  document.querySelector("#"+elid).style.zIndex -=1; 
             })
             x.shadowRoot.querySelector('#'+x.id+'_frontzindex').addEventListener('click',(e)=>{
                console.log(e);
                let el = e.path[0].id;
                  let elid = el.split('_')[0];
                  document.querySelector("#"+elid).style.zIndex +=1; 

            })
         }
         Obj.dragElement(x);         
         return x.style.display!="none"
       });
        visible.forEach((cmp,o,len)=>{
            setClasses(cmp,len.length);
        });

     let saveParams = document.createElement('button');
     saveParams.innerHTML="Save";
     saveParams.id ="saveparams";
     saveParams.addEventListener('click',(e)=>{
        let parameters =[]; 
        Array.from(cmp).forEach((c)=>{
            let params = {};
            params.width = (parseInt(c.style.width)*100)/document.body.clientWidth+"%";
            params.height = (parseInt(c.style.height)*100)/document.body.clientHeight+"%";
            params.top =(parseInt( c.style.top || 0)*100)/document.body.clientHeight+"%";
            params.left = (parseInt( c.style.left || 0)*100)/document.body.clientWidth+"%";
            params.zindex = c.style.zIndex;
            params.id = c.id;
            parameters.push(params);
         })
         console.log(parameters);
         localStorage.setItem('parameters', JSON.stringify(parameters));
    });   
     if (!document.querySelector('#saveparams'))
         document.body.appendChild(saveParams);
  }
  var unload = function (cmps){
     Array.from(cmps).forEach((c)=>{
      let header  = c.shadowRoot.querySelector("#"+c.id+"header");
      if (header) c.shadowRoot.removeChild(header);
    
      c.style ="";
      c.className ="";
   })
   if (document.querySelector('#saveparams'))document.body.removeChild(document.querySelector('#saveparams'));
  }
  var plugin ={
     render:render,
     unload:unload
  }
  return plugin;

}
