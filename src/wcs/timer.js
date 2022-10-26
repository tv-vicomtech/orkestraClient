/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import "./css/apptable.css";
export class WCTimer extends HTMLElement {
  static get observedAttributes () {
    return ['datos'];
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (!this.__initialized) { return; }
    if (oldValue !== newValue) {
      if (name === 'no-headers') {
        this.noHeaders = newValue;
      } else {
        this[name] = newValue;
      }
    }
  }

  get datos () { return this.getAttribute('datos'); }
  set datos (value) {
    this.setAttribute('datos', value);
    this.render();
  }

  get value () { return this.__data; }
  set value (value) {
    this.setValue(value);
  }


  constructor () {
    super();

  }

  async connectedCallback () {
   

    this.__initialized = true;
  }




  setValue (value) {
    this.__data = parse(value);
    this.render();
  }

 

  render () {
    if (this.datos === "undefined") return;
    if (!this.__table)  this.__table = document.createElement('table');
    const div = document.createElement('h2');
    div.innerHTML = "TIMER DATA";
    div.id ="app_div"
    this.__headers = ["Key","Value"];
    this.__table.innerHTML="";
    if (this.__headers) {
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');
      this.__headers.forEach(header => {
        const th = document.createElement('th');
        th.innerText = header;
        tr.appendChild(th);
      });
      thead.append(tr);
      this.__table.appendChild(thead);
    }

    const tbody = document.createElement('tbody');
    var d = JSON.parse(this.datos);
    Object.keys(d).forEach(row => {
      const tr = document.createElement('tr');

        const td = document.createElement('td');
        td.innerText = row;
        tr.appendChild(td);
        const td1 = document.createElement('td');
        td1.innerText = JSON.stringify(d[row]);
        tr.appendChild(td1);

      tbody.appendChild(tr);
    });
    this.__table.id = "table";
    this.__table.appendChild(tbody);




    if (!this.querySelector("#app_div")) this.appendChild(div);
    if (!this.querySelector("#table")) this.appendChild(this.__table);

  }
}

customElements.define('app-timer', WCTimer);
