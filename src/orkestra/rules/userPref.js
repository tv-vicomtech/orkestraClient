/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import log from 'loglevel';

export function UserPref() {
    var self = {};
    self.name = "userpref";
    self.data = [];
    self.time;
    var deploy = function (evt, cmp, users, options) {
      const reload = options ? !!options.reload : true
      let decision = [];
      if (evt.data && evt.data.key==="componentsStatus"){
        log.debug("COMPONENTSSTATUS",evt);
        let cmps = evt.data.value;
        if (cmps!="undefined")
         cmps.componentsStatus.forEach((c)=>{
           if (typeof c.usrCmd !=="undefined"){
            let cmdShow = c.usrCmd.find((x)=>{
              if (x.cmd =="show") {
                reload && document.querySelector("#"+c.cmp).load();
                return true;
              }
            });
            if (cmdShow) decision.push({ cmp: c.cmp, show: cmdShow.value, usrCmd:c.usrCmd})
           }
        })
      }
      else {
        if (users.get("me").capacities.componentsStatus && users.get("me").capacities.componentsStatus.componentsStatus){
         log.debug("COMPONENTSSTATUS",users.get("me").capacities.componentsStatus.componentsStatus,evt);
          let cmps = users.get("me").capacities.componentsStatus;
          if (cmps!="undefined")
           cmps.componentsStatus.forEach((c)=>{
             if (typeof c.usrCmd !=="undefined"){
              let cmdShow = c.usrCmd.find((x)=>{
                  if (x.cmd =="show") {
                    reload && document.querySelector("#"+c.cmp).load();
                    return true;
                  }
                });
              if (cmdShow) decision.push({ cmp: c.cmp, show: cmdShow.value, usrCmd:c.usrCmd})
             }
          })
        }
      }
      log.debug(decision);
      return decision;
    }

    return deploy;

  }
