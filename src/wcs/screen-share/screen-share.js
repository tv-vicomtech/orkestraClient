/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import { JanusScreenShare } from '../libs/janusScreenShare.js'
import {openDialog} from "web-dialog";
import {svg} from '../icons/config.js';
import {buttonClass} from '../css/webrtc.js';

export class WCScreenShare extends HTMLElement {
  static get observedAttributes () {
    return ['config','input','options',"style"];
  }
  
  attributeChangedCallback (name, oldValue, newValue) {
    if (oldValue !== newValue) {
      
        this[name] = newValue;
      
    }
  }
 
  constructor () {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML+="<style>"+buttonClass+"</style>";
   
  } 
  get style() { return this.getAttribute('style'); }
  set style(value) {
    let old = this.getAttribute('style');
    if (typeof value!="undefined") {
      this.setAttribute('style', value);
      setTimeout(()=>{this.shadowRoot.querySelector('#myvideo').style.cssText+=value;},1000);
    }
  }

  get config () { return this.getAttribute('config'); }
  set config (value) {
    this.setAttribute('config', value);
    if (value!="") {
      let configJson = JSON.parse(value);
      this.JanusScreenShare  = JanusScreenShare(this.shadowRoot,configJson.janusServer,configJson.room);
    }
    this.render();
  }
  get options () { return this.getAttribute('options'); }
  set options (value) {
    this.setAttribute('options', value);
    setTimeout(()=>{this.setConfig();},500);
  }
  async connectedCallback () {
     this.__initialized = true;
  }

 publish(options){
   //  this.unpublish();
     if(options instanceof MouseEvent)
            this.JanusScreenShare.init(this.input,this.flags);
     else this.JanusScreenShare.init(this.input,options || this.flags);
 }
 unpublish(){
   this.JanusScreenShare.stop();
 }
 setConfig(){
   let conf = {};
   try {
     conf = JSON.parse(this.options);
     this.flags = conf;
   }
   catch(ex){
     console.log(ex);
   }
  
   if (typeof conf.bitrate!=="undefined") this.shadowRoot.querySelector('#bitrate').value = conf.bitrate;
   if (typeof conf.simulcast!=="undefined") this.shadowRoot.querySelector('#simulcast').checked = conf.simulcast;

 }
 async showConfig(){
 
 }
  configChange(ev){

    this.flags.simulcast = this.shadowRoot.querySelector('#simulcast').checked;
    this.flags.bitrate = parseInt(this.shadowRoot.querySelector('#bitrate').value);
   
  }
  render () {
    if (this.config === "undefined") return; 
    if (this.shadowRoot.querySelector('#videoWrap')) return;
    this.shadowRoot.innerHTML+=`
    <div style="display:none; position: fixed;" id="videoWrap"><video id='myvideo' muted style='position: relative;top: 0;left: 0;' controls autoplay></video>
    <span id="configIcon" style="position: absolute;top: 15px;left: 88%;width:40px;height:40px;cursor:hand;visibility:hidden">`+svg+`</span></div>
    <web-dialog center>
     <form id='change_dev_form' class="form-inline" >
 					        
   <div id="configPanel" >
   <h2> Advanced:</h2>
		
      Simulcast:<input type="checkbox"	id="simulcast" checked style="margin-right:20px">
      <h2>Bitrate:</h2> <input type="number" id="bitrate" value=0 style="margin-right:20px">
      </form>
      <span style="float:right"><span id="saveB" class="btn btn-primary"> Save </span>
      <span id="closeB" class="btn btn-primary"> Close </span></span>
      <div>
      </web-dialog>
     `;
    this.shadowRoot.querySelector('form').addEventListener('change',this.configChange.bind(this));
    this.shadowRoot.querySelector('#saveB').addEventListener('click',this.publish.bind(this));
    this.shadowRoot.querySelector('#closeB').addEventListener('click',()=>this.shadowRoot.querySelector('web-dialog').open =false);
    this.shadowRoot.querySelector('#configIcon').addEventListener('click',this.showConfig.bind(this));
    this.shadowRoot.querySelector('#videoWrap').addEventListener('mouseover',()=>{
      this.shadowRoot.querySelector('#configIcon').style.visibility="visible";
      if (showIconTimer) clearTimeout(showIconTimer);
      var showIconTimer = setTimeout(()=>{this.shadowRoot.querySelector('#configIcon').style.visibility="hidden";},3000)
    });

  }
}

customElements.define('screen-share', WCScreenShare);
