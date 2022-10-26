/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
class ObjectSync {
  constructor(){
    this.currentTime=0.0;
    this.playbackRate=1.0;
    this.paused=true;
    this.offset=0;
  }

  pause (){
    // TODO pause
    console.log("TODO");
  }
  play (){
    // TODO play
    console.log("TODO");
  }
  seekTo (time){
    // TODO play
    console.log("TODO");
  }
  setPlaybackRate(rate){
    this.playbackRate = rate;
  }
  incPlayBacRate(){
    this.playbackRate+=0.3;
  }
  decPlayBacRate(){
    this.playbackRate-=0.3;
  }
}
export {ObjectSync}
