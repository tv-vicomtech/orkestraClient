/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
export function ByMandatory (){
  var self = {};
  self.name ="bymandatory";
  var deploy = function (evt,cmp,users,options){
      let decision = [];
    //  cmp[0].style.display="none";
      for (let n in cmp){
        let c = cmp[n];
        if (!c.style) return;
        if ('master' === users.get('me').profile && c.nodeName==="USER-TABLE") c.style.display = 'block';
        else if ( c.nodeName==="APP-TABLE") c.style.display = 'block';
              else c.style.display = 'none';
        decision.push({cmp:c.id,show:c.style.display=="block"})
        }
        return decision;
  }
  return deploy;

}
