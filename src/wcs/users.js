/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import "./css/usertable.css";
export class WCUserTable extends HTMLElement {
  static get observedAttributes () {
    return ['users'];
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

  get users () { return this.getAttribute('users'); }
  set users (value) {
    this.setAttribute('users', value);
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
    this.__data = JSON.parse(value);
    this.render();
  }



  render () {
    if (this.users === "undefined") return;
    if (!this.__table)  {
      this.__table = document.createElement('table');
      this.__table.id ="userTable";
    }
    const div = document.createElement('h2');
    div.innerHTML = "USERS DATA";
    div.id ="user_div";
    this.__headers = ["Id","Name","Profile","Capacity","Context","UserData"]
    this.__table.innerHTML = "";
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
    JSON.parse(this.users).forEach(row => {
      const tr = document.createElement('tr');
      for (let n in row[1])
       {
        
        const td = document.createElement('td');
     
        if (n=="capacities" || n=="userData" || n=="context") td.innerHTML = "<div>"+JSON.stringify(row[1][n])+"</div>";
        else td.innerText = row[1][n];
        tr.appendChild(td);
 
      }
      tbody.appendChild(tr);
    });
    this.__table.appendChild(tbody);

  //  this.removeChild(document.querySelector("#table"));
    //this.__table = table;

  //  console.log("HERE",this.querySelector("#user_div"));
    if (!this.querySelector("#user_div")) this.appendChild(div);
    if (!this.querySelector("#table")) this.appendChild(this.__table);



  }
}

customElements.define('user-table', WCUserTable);
