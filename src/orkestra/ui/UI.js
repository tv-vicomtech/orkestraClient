/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import {Obj,Logger} from '../utils/';

var log =  Logger.getLogger('UI');

function UI (app) {
  var self = {};
  if (typeof document !== 'undefined')
  self.components = document.querySelector('orkestra-ui')?document.querySelector('orkestra-ui').children:[];
  else self.components =[];
  self.callbacks = [];
  self.old = [];
  self.uiRender = function (evt,eventType){
      switch (eventType){
            case "appCtx":{
              if (evt.key.indexOf("layout")!=-1){
                log.info("changing layout");
                if (evt.value){
                    if (evt.value.applyTo && (evt.value.applyTo=="all" || evt.value.applyTo==app.getMyAgentId())){
                    if (evt.value.status ==="off") self.useLayout(self.callbacks[0].name,evt)
                    else self.useLayout(evt.value.layout,evt);
                  }
                }
                 else if(evt.data) {
                  if (evt.data.value.applyTo && (evt.data.value.applyTo=="all" || evt.data.value.applyTo==app.getMyAgentId()))
                   {
                    if (evt.data.value.status ==="off") self.useLayout(self.callbacks[0].name,evt)
                    else self.useLayout(evt.data.value.layout,evt);
                  }
                 }
              }
              else{
                self.useLayout(self.activeLayout,evt);
              }
              break;
            }
            case "userCtx":{
              // runLayout(evt);
               if (evt.data.key && evt.data.value!=="undefined" && evt.data.key ==="userData"){
                   if ("layout" in evt.data.value && evt.data.agentid === app.getMyAgentId()){
                     if (evt.data.value.layout.indexOf("FullScreen")!=-1){
                        let cmp = evt.data.value.layout.split('_')[1];
                        evt.cmp = cmp;
                        let type = evt.data.value.layout.split('_')[2];
                        let tnpLayout = self.callbacks[0].name;
                        if (type==="off") tnpLayout = self.callbacks[0].name;
                        else  tnpLayout = "FullScreen";
                        self.useLayout(tnpLayout,evt)
                     }
                     else  self.useLayout(evt.data.value.layout,evt)

                 }
               }
               if (evt.data.key && evt.data.key ==="componentsStatus"){
                  if (evt.data.agentid === app.getMyAgentId() && evt.data.from !==app.getMyAgentId()){
                       var diff = Obj.getObjectDiff(evt.data.value,self.old);
                       log.debug(diff);
                        self.old = evt.data.value;
                       if (typeof diff !="undefined" && Object.keys(diff).length ==1 && diff.componentsStatus){
                         let usrCmdCmps = Object.entries(diff.componentsStatus).filter((obj)=>{
                                if ("usrCmd" in obj[1]) return true;
                                return false;
                         });
                         if (usrCmdCmps.length==0) return;
                          let compentIdx = usrCmdCmps[0][0];
                          let cmdIdx = Object.keys(diff.componentsStatus[compentIdx].usrCmd)[0];
                          log.debug("CHANGE",evt.data.value.componentsStatus[compentIdx].usrCmd[cmdIdx]);
                          let diff2 = evt.data.value.componentsStatus[compentIdx].usrCmd[cmdIdx];
                          if( !diff2) return;
                          let comp = document.querySelector("#"+diff2.cmp);
                          if (comp && comp.userCmdEvents){
                            comp.userCmdEvents ({cmd:diff2.cmd,value:diff2.value});
                          }
                          else
                           console.warn("Webcomponent does not implements userCmdEvents function");
                       }
                       /* first time the diff is all object */
                       if (typeof diff !="undefined" && Object.keys(diff).length >1 && diff.componentsStatus){
                          if (Array.isArray(diff.componentsStatus)===false) diff.componentsStatus = [diff.componentsStatus];
                          let cmp = diff.componentsStatus.find((x)=>{
                                if (x.usrCmd) return true;
                          })
                          if (!cmp) return;
                          let diff2 = cmp.usrCmd[0]
                          if( !diff2) return;
                          let comp = document.querySelector("#"+diff2.cmp);
                          if (comp && comp.userCmdEvents){
                            comp.userCmdEvents ({cmd:diff2.cmd,value:diff2.value});
                          }
                          else
                           console.warn("Webcomponent does not implements userCmdEvents function");
                       }
                    // self.old = evt.data.value;
                  }
               }
               runLayout(evt);
              break;
            }
            case "timeupdate":
            case "timeline":{
               
                runLayout(evt);


            break;
            }
      }
  }

  var runLayout = function (chg){
    // clean style before
    unloadOldLayout();
    if (typeof self.activeLayout ==="object"){
	    let time = app.sequencer.currentTime;
      let layoutname = self.activeLayout[time];
      //let order = self.activeLayout[time];
	    let _layout = self.callbacks.find((layout)=>{ return layout.name === layoutname});
    	    _layout.callback(chg,self.components,app,_layout.options)
    }
    else
	    if (self.activeLayout){
	      let _layout = self.callbacks.find((layout)=>{ return layout.name === self.activeLayout});
	      if (_layout) _layout.callback(chg,self.components,app,_layout.options)
	    }
	    else
	    	self.callbacks.forEach((cb)=>{
		      cb.callback(chg,self.components,app,cb.options);
    		    })
  }
  var unloadOldLayout = function(){
      if (self.oldLayout === self.activeLayout && typeof self.activeLayout!=="object") return;
      let status = [];
      // get status of display, a plugin code may changed it, to ensure status.
      Array.from(self.components).forEach((c)=>{
        let state = c.style.display;
        status.push({component:c,status:state});
     })
    if (typeof self.oldLayout ==="object"){
	    let time = app.sequencer.currentTime;
	    let layoutname = self.oldLayout[time];
	    let _layout = self.callbacks.find((layout)=>{ return layout.name === layoutname});
          _layout.unload(self.components);
          status.forEach((x)=>{
              x.component.style.display = x.status;
          })
    }
    else
	    if (self.oldLayout){
	      let _layout = self.callbacks.find((layout)=>{ return layout.name === self.oldLayout});
	      if (_layout) {
          _layout.unload(self.components);
          status.forEach((x)=>{
            x.component.style.display = x.status;
        })
        }
	    }
	    else {
	    	self.callbacks.forEach((cb)=>{
		      cb.unload(self.components);
          })
        status.forEach((x)=>{
            x.component.style.display = x.status;
        })
      }
  }
  self.subscribe = function (plugin,options){
    let _plugin = plugin();
    self.callbacks.push({name:plugin.name,callback:_plugin.render,unload:_plugin.unload,options:options});
    log.info("registring UI",plugin.name);
  }
  self.unsubscribe = function (plugin){
    // TODO
    log.info("unregistring UI",plugin.name);
  }
  self.useLayout = function (name,evt){
     self.oldLayout = self.activeLayout;
     self.activeLayout = name;
     runLayout(evt);
  }
  self.getUsingLayout = function(){
    return self.activeLayout;
  }
  return {
    "subscribe":self.subscribe,
    "components":self.components,
    "layouts":self.callbacks,
    "useLayout":self.useLayout,
    "uiRender":self.uiRender,
    "getUsingLayout":self.getUsingLayout


  }
}

export {UI}
