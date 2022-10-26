/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import './css/tabs.css';

export function Tabs() {

    var render = function (ev, cmp) {
    
        var changeTab = function(evt){
            console.log(evt);
            visible.forEach((c)=>{
                c.className="tabcontentNone";
               
            })
            let ind = evt.currentTarget.id.split('_')[1];
            document.querySelector("#"+evt.currentTarget.data).className="tabcontentDisplay";
            let tablinks = document.getElementsByClassName("tablinks");
            for (let i = 0; i < tablinks.length; i++) {
              tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            evt.currentTarget.className +=" active";
           
        }
        var createTabs = function (cmps) {
            let div = document.createElement('div');
            visible.forEach((c)=>{
                c.className="tabcontentNone";

            })
            div.className = "tab";
            cmps.forEach((c,i)=>{
                let but = document.createElement('button');
                but.className="tablinks";
                but.innerHTML = c.nodeName;
                but.data = c.id;
                but.addEventListener("click",changeTab.bind(this));
                div.appendChild(but);
            })

             document.body.prepend(div);
           
        }
       
        var visible = Array.from(cmp).filter((x, i, len) => {

            return x.style.display != "none"
        });

        if (!document.querySelector(".tablinks")) createTabs(visible);


    }

    var unload = function (cmps){
        Array.from(cmps).forEach((c)=>{
          c.style ="";
          c.className ="";
    
       })
       if (document.querySelector(".tab")) document.body.removeChild(document.querySelector(".tab"));

      }
      var plugin = {
         render:render,
         unload:unload
      }
      return plugin;

}
