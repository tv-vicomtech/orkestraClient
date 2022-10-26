/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import log from 'loglevel';
export function Explicit() {
  var self = {};
  self.name = "explicit";
  self.data = [];
  self.time;
  var deploy = function (evt, cmp, users, options) {
    const reload = options ? !!options.reload : true
    let decision = [];
    log.debug(options);
    let context = getNearContext(evt,users,options);
    log.debug("RULE",context);
    if (context){
      context.then.forEach((c)=>{
        if (c.show) {
          reload && document.querySelector("#"+c.comp).load();
        }
        else  {
          reload && document.querySelector("#"+c.comp).unload();
        }
        if (users.get("me").agentid === c.agentid)
        decision.push({ cmp: c.comp, show: c.show })
      })
    }
    else { // whether is not context show all hide
      Array.from(cmp).forEach((c)=>{
        decision.push({ cmp: c.id, show: false })
      })
    }

    return decision;
  }
  function getNearContext(evt,users,options){
    log.debug(evt,options,users);
    if (!users) return undefined;
    if (!options.contexts) {
      log.warn ("NO explicit found, add config file to app.use");
      return;
    }
    let myContext = options.contexts.find((x)=> {if (x.session==options.channel) return true});
    let conditionsEquality = [];
    let usersMaps = Array.from(users).map((usr)=>{
      return usr[1].agentid;
    })
    let rule = myContext.rules.find((r)=>{
      usersMaps.sort();
      r.condition.sort();
      if (usersMaps.length === r.condition.length && usersMaps.every((value, index) => value === r.condition[index])){
        return true;
      }

    });
    return rule || undefined;
  }
  return deploy;

}
