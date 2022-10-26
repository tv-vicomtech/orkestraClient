/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import {svg} from '../icons/config.js';
import {VolumeMeter} from '../libs/volume-meter-wc';
let tmp =`
    <div id="videoWrap" style="height:100%;">
    <volume-meter width="25" height="200" color="blue" style="position:absolute;left:0;"></volume-meter>
    <video id='myvideo' muted style='position: relative;top: 0;left: 0;width:100%;height:100%;' autoplay>
    </video>

    <span id="configIcon" style="position: absolute;top: 0%;left: 0%;width:80px;height:80px;cursor:hand;visibility:visible;blakground:black;z-index:9999">`+svg+`</span>
    </div>
    <web-dialog center>
     <form id='change_dev_form' class="form-inline" >

  						              <div class="form-group" style="margin-right: 20px;">
                                   <h2> Media Choose:</h2>
                                   <div>
                                   <label for="audio-device" i18n>Audio device (input):</label>

                                   <select id="audio-device" class="form-control"  ></select>
                                    </div>
                                    <div>
  							                   <label for="video-device" i18n>Video device (input):</label>
                                   <select id="video-device" class="form-control"></select>
                                   </div>

  						              </div>

  					        
   <div id="configPanel" >
   <h2> Advanced:</h2>
   <h2>Resolution: 
    <select id="res"> 
    <option value="UHD"> 4K (3840x2160)</option>
    <option value="FHD"> FHD (1920x1080)</option>
    <option value="UXGA"> UXGA (1600x1200)</option>
    <option value="HD" selected> HD (1280x720)</option>
    <option value="SVGA"> SVGA (800x600)</option>
    <option value="VGA"> VGA (640x480)</option>
    <option value="VGAHD"> VGAHD (960x720)</option>
    <option value="VGAHD-P"> VGAHD Portrait (720x960)</option>
    <option value="VGAFHD"> VGAFHD (1440x1080)</option>
    <option value="VGAFHD-P"> VGAFHD Portrait (1080x1440)</option>
    <option value="360p"> 360p (640x360)</option>
    <option value="QVGA"> QVGA (320x240)</option></select>
    </h2>
			EchoCancelation:<input type="checkbox"	id="echo" checked style="margin-right:20px">
			NoiseSupression:<input type="checkbox"	id="noise" checked style="margin-right:20px">
      GainControl:<input type="checkbox"	id="gain" checked style="margin-right:20px">
      Video:<input type="checkbox"	id="videoc" checked style="margin-right:20px">
      Audio:<input type="checkbox"	id="audioc" checked style="margin-right:20px">
      Simulcast:<input type="checkbox"	id="simulcast" checked style="margin-right:20px">
      Portrait:<input type="checkbox"	id="portrait" style="margin-right:20px">
      <h2>Bitrate:</h2> <input type="number" id="bitrate" value=0 style="margin-right:20px"><span>kb/s</span>
      <h2>Micro Volume (force):</h2> <input type="range" id="volIncrease" value=1 min=1 max=5 style="margin-right:20px">
      <h2>Audio Delay:</h2> <input type="number" id="delay" value=0 style="margin-right:20px"><span>s</span>
      <h2>Audio Type: <select id="audiotype"> <option value=""> None</option><option value="music" selected> Music</option><option value="speech"> Speech</option><option value="speech-recognition"> Speech Recognotion</option></select></h2>
      </form>
      <span style="float:right"><span id="saveB" class="btn btn-primary"> Save </span>
      <span id="closeB" class="btn btn-primary"> Close </span></span>
      <div>
      </web-dialog>`;
  let tmpl = document.createElement('template');
  tmpl.innerHTML = tmp;
  export {tmpl};
      
