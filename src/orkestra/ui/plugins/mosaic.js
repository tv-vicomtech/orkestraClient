/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
export function Mosaic (){

  var self = {};
  self.name = "mosaic";
  var render = function(ev,cmp,app){
     var container = document.createElement('div');
     container.class="mosaic";
     var currentTime = app.sequencer ? app.sequencer.currentTime:-1;
     var setClasses = function(_cmp,N,ind){
        document.querySelector('orkestra-ui').className="container";
         //REVIEW
         //document.querySelector('orkestra-ui').style.width='100%';
         //document.querySelector('orkestra-ui').style.height='100%';
         //document.querySelector('orkestra-ui').style.position='absolute';
         document.querySelector('body').style.overflow='hidden';
         if(N==1){
           _cmp.style.width='99%';
           _cmp.style.height='99%';
           _cmp.style.left='0%';
           _cmp.style.top='0%';
           _cmp.style.position='absolute';
           _cmp.style.backgroundColor='black';
           _cmp.style.transition='width 1s, height 1s';
           //_cmp.style.transitionProperty= 'display, border-radius';
           //_cmp.style.transitionDuration= '5s 3s';
           //_cmp.style.borderRadius= '25px';
         }
         else if(N<=5){
           if(ind==0){
             _cmp.style.width='99%';
             _cmp.style.height='69%';
             _cmp.style.left='0%';
             _cmp.style.top='30%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';

           }
           else{
             _cmp.style.width=((100-N+1)/(N-1))+'%';
             _cmp.style.height='29%';
             _cmp.style.left= ((ind-1)*((100)/(N-1)))+'%';
             _cmp.style.top='0%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';

           }
         }
         else if(N>5){
           if(ind==0){
             _cmp.style.width='49%';
             _cmp.style.height='49%';
             _cmp.style.left='25%';
             _cmp.style.top='25%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';
           }
           else if(ind==1){
             _cmp.style.width='49%';
             _cmp.style.height='24%';
             _cmp.style.left='0%';
             _cmp.style.top='0%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';
           }
           else if(ind==2){
             _cmp.style.width='49%';
             _cmp.style.height='24%';
             _cmp.style.left='50%';
             _cmp.style.top='0%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';
           }
           else if(ind==3){
             _cmp.style.width='49%';
             _cmp.style.height='24%';
             _cmp.style.left='0%';
             _cmp.style.top='75%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';
           }
           else if(ind==4){
             _cmp.style.width='49%';
             _cmp.style.height='24%';
             _cmp.style.left='50%';
             _cmp.style.top='75%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';
           }
           else if(ind==5){
             _cmp.style.width='24%';
             _cmp.style.height='24%';
             _cmp.style.left='0%';
             _cmp.style.top='25%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';
           }
           else if(ind==6){
             _cmp.style.width='24%';
             _cmp.style.height='24%';
             _cmp.style.left='0%';
             _cmp.style.top='50%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';
           }
           else if(ind==7){
             _cmp.style.width='24%';
             _cmp.style.height='24%';
             _cmp.style.left='75%';
             _cmp.style.top='25%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';
           }
           else if(ind==8){
             _cmp.style.width='24%';
             _cmp.style.height='24%';
             _cmp.style.left='75%';
             _cmp.style.top='50%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';
           }
         }
         /*if (N===9 || N==6){
           _cmp.className = "item69";
         }
         else if (N==4 || N==2 || N===3){
           _cmp.className = "item24";
         }
         else if (N==1){
            _cmp.className = "item21";
         }*/


     }
     var visible = Array.from(cmp).filter( (x,i,len) =>
       {
        if (typeof x.order==="undefined") x.style.order = 0;
         return x.style.display!="none"
       });
       if (typeof cmp[0].order!=="undefined")
          // sort by parameter.
          visible = visible.sort((a,b)=>{
              if (a.order[currentTime] < b.order[currentTime]) return -1;
              else if (a.order[currentTime] > b.order[currentTime]) return 1;
              else return 0;
          })
        visible.forEach((cmp,o,len)=>{
            if (typeof cmp.order!=="undefined") cmp.style.order = cmp.order[currentTime];
            setClasses(cmp,len.length,o);
        });
  }
  var unload = function (cmps){
    Array.from(cmps).forEach((c)=>{
      c.style ="";
      c.className ="";
   })
  }
  var plugin ={
     render:render,
     unload:unload
  }
  return plugin;
}
   
