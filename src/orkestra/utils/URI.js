/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
var URI = {
  getUrlVar : function (name){
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
    });
    return vars[name];
  },
  createToken:function(){
    var rand = function() {
      return Math.random().toString(36).substr(2); // remove `0.`
    };

    var token = function() {
      return rand() + rand(); // to make it longer
    };
    return token();
  },
  shortURL:function(server,url){
    var p1= new Promise((resolve,reject)=>{
           fetch(server+'/api/shorten',{
              method: 'POST', // or 'PUT'
              body: JSON.stringify({url:url}),
              headers:{
                'Content-Type': 'application/json'
              }
             })
              .then((data)=>{
                  data.json().then((_data)=>{
                  console.log('Shorten:'+_data.shortUrl);
                  resolve(JSON.parse('{"response":"'+_data.shortUrl+'"}'));
                  })
            });

      });
    return p1;
  }


}

export {URI};
