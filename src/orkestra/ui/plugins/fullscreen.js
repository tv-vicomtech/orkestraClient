/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import { Logger } from '../../utils/';
export function FullScreen (){
  var log =  Logger.getLogger('UI Plugin Fullscreen');
  var self = {};
  self.name = "FullScreen";
  var render = function(ev,cmp,app,options){
       let layout = app.getAppAttribute("layout");
       log.debug("Rendering")
       if (ev && ev.type=="appAttrChange" || layout.status == "on") { // Session oriented fullscreen
        let Config = options;
        let applyToComp = Config.componentId;
        applyToComp = layout.cmp;
        if (ev && ev.data.value.cmp) applyToComp = ev.data.value.cmp;
        let comp =  Array.from(cmp).find((x)=>{
            return x.id == applyToComp;
        })
        Array.from(cmp).forEach((x)=>{
            if (x.id != applyToComp) x.style.display="none";
        })

        let props = Config.agents.find((ag)=>{
            return ag.agentid == app.getMyAgentId()
        });
        if (!props) log.debug("Not agent's properties found");
        comp.style="position:absolute;z-index:999";
        comp.style.width = props.screensize.width*Config.cols;
        comp.style.height = props.screensize.height*Config.rows;
        comp.style.left = -((props.col * props.screensize.width)+props.offsetx);
        comp.style.top = -((props.row * props.screensize.height)+props.offsety);
        document.body.style="overflow:hidden";
      }
      else if (ev.data && ev.data.key=="userData" && ev.data.value) { // Agent oriented fullscreen
        if (ev.data && ev.data.agentid=== app.getMyAgentId()){
        let Config = options;
        let applyToComp = Config.componentId;
        if (ev && ev.cmp) applyToComp = ev.cmp;
        let comp =  Array.from(cmp).find((x)=>{
            return x.id == applyToComp;
        })
        Array.from(cmp).find((x)=>{
            if (x.id != applyToComp) x.style.display="none";
        })
        comp.style="position:absolute;z-index:999";
        comp.style.width = "100%";
        comp.style.height = "100%";
        comp.style.left = "0px";
        comp.style.top = "0px";
        document.body.style="overflow:hidden";
      }
    }
  }
  var unload = function (cmps){
    log.debug("Unloading")
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
