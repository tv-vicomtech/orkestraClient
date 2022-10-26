/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import log from 'loglevel';

export function Bytimeline() {
  var self = {};
  self.name = "bytimeline";
  self.data = [];
  self.time;
  var deploy = function (evt, cmp, users, options) {
    let decision = [];
    if (typeof evt.key === "undefined") evt.key = "";
    let key = evt.key.split('_');
    if (key[0] == "timeline" && key[1] != "change") {
      if (evt.type === "appAttrChange" || typeof evt.type === "undefined") {
        let data = evt.data ? evt.data.value : evt.value;
        if (data.applyTo === users.get("me").agentid || data.applyTo === "all")
          self.data = data.componentStatus;
        evt.applyTo = data.applyTo;
      }
      else
        if (key[1] === users.get("me").agentid) self.data = evt.componentStatus;
    }

    /* TODO :rewrite evt info is not clean */
   // if (self.data && typeof self.data != "string") evt.data = self.data;

    if (evt.type === "timeline_change" || evt.key.indexOf("timeline") > -1) {
      const isChangeScene = evt.time!=undefined && evt.time!=self.time;
      Array.from(cmp).forEach((c) => {
        c.unload(isChangeScene);
      });
      
      if (evt.type === "timeline_change") self.time = evt.time;
      if (evt.key.indexOf("timeline") > -1) evt.time = self.time || 0;
      let cmps = getTimeEvent(evt);
      for (let n = 0; n < cmp.length; n++) {
        let c = cmp[n];
        if (!c.style) continue;
        let index = cmps.map((x) => { return x.id }).indexOf(c.id);
       
        if (index > -1) {
          c.order = cmps[index].order;
          c.input = cmps[index].source;
          if(!isChangeScene && c.style.display=="none"){
            c.load();
          }
          else{
            c.load(isChangeScene);
          }
          if (cmps[index].mutedScene == 'true') {
            c.muteScene();
          }
          else {
            c.unmuteScene();
          }
          let fileName = cmps[index].source.substring(cmps[index].source.lastIndexOf('/') + 1, cmps[index].source.length);
          let ext = fileName.substring(fileName.lastIndexOf('.'), cmps[index].source.length);
          let videoExt = ['.mp4','.ogv','.vp9','.vp8','.mpeg','.mpg','.mpd']
          if(videoExt.indexOf(ext) != -1){
            if (cmps[index].loopVideo == 'true') {
              c.changeLoop(true);
            }
            else {
              c.changeLoop(false);
            }
          }
        }
        else
          c.unload(isChangeScene);
        decision.push({ cmp: c.id, show: index > -1 })
      }
    }
    return decision;
  }
  function getTimeEvent(evt) {
    log.debug(evt);
    let data = typeof self.data !== "string" ? self.data : [];
    if (typeof data === "undefined") data = [];
    let time = Math.round(evt.time);
    let inIntervalCmps = data.filter((d) => {
      if (d.slots[time] === 1) return true;
      return false;
    })
    if (inIntervalCmps.length > 0) {
      inIntervalCmps = inIntervalCmps.map((c) => {
        return { id: "v"+c.id, source: c.source, mutedScene: c.mutedScenes[time],order:c.order, loopVideo: c.loopVideo[time]};
      })
    }
    return inIntervalCmps;
  }
  return deploy;

}
