/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
const Config ={
   contexts :[{
       session:"test11",
       rules:[{
               condition:["device1"],
               then:[
                   {comp:"video1",show:true,agentid:"device1"},
                   {comp:"video2",show:true,agentid:"device1"},
                   {comp:"video3",show:true,agentid:"device1"},
                   {comp:"video4",show:true,agentid:"device1"}
               ]
           },
           {
               condition:["device1","device2"],
               then:[
                   {comp:"video1",show:true,agentid:"device1"},
                   {comp:"video2",show:false,agentid:"device1"},
                   {comp:"video3",show:false,agentid:"device1"},
                   {comp:"video4",show:false,agentid:"device1"},
                   {comp:"video1",show:false,agentid:"device2"},
                   {comp:"video2",show:true,agentid:"device2"},
                   {comp:"video3",show:true,agentid:"device2"},
                   {comp:"video4",show:true,agentid:"device2"}

               ]
           }



       ]

     },
     {
         session:"sala2",
         rules:[{
                 condition:["sala2tv1"],
                 then:[
                     {comp:"video1",show:true,agentid:"sala2tv1"},
                     {comp:"video2",show:true,agentid:"sala2tv1"},
                     {comp:"video3",show:true,agentid:"sala2tv1"},
                     {comp:"video4",show:true,agentid:"sala2tv1"}
                 ]
             },
             {
                 condition:["sala2tv1","sala2tv2"],
                 then:[
                     {comp:"video1",show:true,agentid:"sala2tv1"},
                     {comp:"video2",show:false,agentid:"sala2tv1"},
                     {comp:"video3",show:false,agentid:"sala2tv1"},
                     {comp:"video4",show:false,agentid:"sala2tv1"},
                     {comp:"video1",show:false,agentid:"sala2tv2"},
                     {comp:"video2",show:true,agentid:"sala2tv2"},
                     {comp:"video3",show:true,agentid:"sala2tv2"},
                     {comp:"video4",show:true,agentid:"sala2tv2"}

                 ]
             },


         ]

         }
     ]
}
export {Config};
