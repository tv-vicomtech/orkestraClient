/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
export function DeviceProfile(url){

      let deviceProfile = {
       init:function(){
         this.setCapability("deviceProfile", "supported");
       },
       on:function(){
         if (url) url +="checkDevice?agent="+navigator.userAgent;
         else url = "https://"+window.location.host+"/checkDevice?agent="+navigator.userAgent
         fetch(url).then((e)=>{
             e.json().then((data)=>{
               this.setItem('deviceProfile', data.deviceType);

             })

         });
       },
       off:function(){

       }
     }
   return {"deviceProfile":deviceProfile};
}
export function TextData(element){

      let text = {
       init:function(){
          this.setCapability("textShare", "supported");

       },
       on:function(){
          element.addEventListener('change',(txt)=>{
                this.setItem('textShare', element.value);
          })
          //this.setCapability("deviceProfile", "supported");
       },
       off:function(){
         element.removeEventListener('change',(txt)=>{
               this.setItem('textShare', element.value);
         })
       }
     }
   return {"textShare":text};
}
export function MasterSlaveProfile(me){

      let ms = {
       init:function(){
          this.setCapability("masterSlave", "supported");
        //  this.setItem('masterSlave', me.master || true);
       },
       on:function(){
          // element.addEventListener('change',(txt)=>{
          //       this.setItem('textShare', element.value);
          // })
          this.setItem('masterSlave', (me.master === undefined || me.master === true)?true:false);

       },
       off:function(){

       }
     }
   return {"masterSlave":ms};
}
export function UserProfile(me){

      let up = {
       init:function(){
          this.setCapability("userProfile", "supported");
        //  this.setItem('masterSlave', me.master || true);
       },
       on:function(){
          // element.addEventListener('change',(txt)=>{
          //       this.setItem('textShare', element.value);
          // })
          this.setItem('userProfile', me.options.profile || '');

       },
       off:function(){

       }
     }
   return {"userProfile":up};
}
export function UserData(url){

      let userData = {
       init:function(){
         this.setCapability("userData", "supported");


       },
       on:function(){
         setTimeout(()=>{
         let data = this.getItem('userData') !="undefined" ? this.getItem('userData'): {};
         this.setItem('userData',data);
        },0)
       },
       off:function(){

       }
     }
   return {"userData":userData};
}

export function KeyPress(){

      let ms = {
       init:function(){
          this.setCapability("keyPress", "supported");
          //this.setItem('keyPress', "");
       },
       on:function(){
          // element.addEventListener('change',(txt)=>{
          //       this.setItem('textShare', element.value);
          // })
          document.addEventListener('keypress',(txt)=>{
                this.setItem('keyPress', txt.key);
          })

       },
       off:function(){
         document.removeEventListener('keypress',(txt)=>{
               this.setItem('keyPress', txt.key);
       })
     }
   }
   return {"keyPress":ms};
}
export function ComponentsStatus(me){

  let ms = {
   init:function(){
      this.setCapability("componentsStatus", "supported");
    },
   on:function(){
    let compStatus = this.getItem("componentsStatus");
    if (compStatus.length === 0)
    this.setItem('componentsStatus', []);

   },
   off:function(){

   }
 }
return {"componentsStatus":ms};
}
export function Message(msg){

  let m = {
   init:function(){
      this.setCapability("message", "supported");
      this.setItem('message', msg || 'undefined');
   },
   on:function(){

      this.setItem('message', msg || 'undefined');

   },
   off:function(){

   }
 }
 return {"message":m};
}
