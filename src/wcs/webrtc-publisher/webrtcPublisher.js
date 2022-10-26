/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import { JanusPublish } from '../libs/januspublish.js'
import {openDialog} from "web-dialog";
import {tmpl} from './webrtr-publisher.template.js'
import {buttonClass} from '../css/webrtc.js';
import {Obj,Logger} from '../../orkestra/utils/index.js';
import { Observable, Subject } from 'rxjs';
import { VolumeMeter } from '../libs/volume-meter-wc.js';
export class WCWebrtcPublisher extends HTMLElement {
  static get observedAttributes () {
    return ['config','input','options',"style","settings"];
  }
  
  attributeChangedCallback (name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this[name] = newValue;
    }
  }
 
  constructor () {
    super();
    this.playerEventObserver = new Subject();
    this.attachShadow({mode: 'open'}).appendChild(tmpl.content.cloneNode(true));;
    this.shadowRoot.innerHTML+="<style>"+buttonClass+"</style>";
    this.log =  Logger.getLogger('Webrtc-publisher');
    this.playerEventObservable = new Observable((observer) => { this.playerEventObserver.subscribe(observer); });
    this.shadowRoot.querySelector('form').addEventListener('change',this.configChange.bind(this));
    this.shadowRoot.querySelector('#saveB').addEventListener('click',this.save.bind(this),true);
    this.shadowRoot.querySelector('#closeB').addEventListener('click',()=>{this.shadowRoot.querySelector('web-dialog').open =false;document.exitFullscreen()});
    this.showConfListener = this.showConfig.bind(this);
    this.showIconListener = this.showIcon.bind(this);
    this.shadowRoot.querySelector('#configIcon').addEventListener('click',this.showConfListener);
    this.shadowRoot.querySelector('#configIcon').addEventListener('touchend',this.showConfListener);
    this.shadowRoot.querySelector('#videoWrap').addEventListener('mouseover',this.showIconListener);
    this.shadowRoot.querySelector('#videoWrap').addEventListener('touchend',this.showIconListener);
  } 

  showIcon (){
    this.shadowRoot.querySelector('#configIcon').style.visibility="visible";
    if (showIconTimer) clearTimeout(showIconTimer);
    var showIconTimer = setTimeout(()=>{this.shadowRoot.querySelector('#configIcon').style.visibility="hidden";},3000)
  }

  get style() { return this.getAttribute('style'); }
  set style(value) {
    let old = this.getAttribute('style');
    if (typeof value!="undefined") {
      this.setAttribute('style', value);
      setTimeout(()=>{this.shadowRoot.querySelector('video').style.cssText+=value;},1000);
    }
  }

  get config () { return this.getAttribute('config'); }
  set config (value) {
    this.setAttribute('config', value);
    if (value!="") {
      let configJson = JSON.parse(value);
      this.PublishJanus  = JanusPublish(this.shadowRoot,configJson.janusServer,configJson.room);
    }
    this.render();
  }

  get settings () { return this.getAttribute('settings'); }
  set settings (value) {
    this.setAttribute('settings', value);
    if(this.settings=='false')
    {
      this.shadowRoot.querySelector('#configIcon').style.visibility="hidden";
      this.shadowRoot.querySelector('#configIcon').removeEventListener('click',this.showConfListener);
      this.shadowRoot.querySelector('#configIcon').removeEventListener('touchend',this.showConfListener);
      this.shadowRoot.querySelector('#videoWrap').removeEventListener('mouseover',this.showIconListener);
      this.shadowRoot.querySelector('#videoWrap').removeEventListener('touchend',this.showIconListener);

    } 
  }

  get options () { return this.getAttribute('options'); }
  set options (value) {
    this.setAttribute('options', value);
    setTimeout(()=>{this.setConfig();},500);
  }
  async connectedCallback () {
     this.__initialized = true;
  }
 async listMedia(){
   let devices = await this.PublishJanus.listDevices();
   return devices;
 }
 playEventSubscriber(){
  return this.playerEventObservable;
 }
 publish(options){
      if (this.flags && this.flags.portrait === true && this.shadowRoot.querySelector('canvas')){
        this.shadowRoot.querySelector('canvas').removeEventListener('mouseover',this.showIconListener);
        this.shadowRoot.querySelector('canvas').removeEventListener('touchend',this.showIconListener);
        this.shadowRoot.querySelector('canvas').addEventListener('mouseover',this.showIconListener);
        this.shadowRoot.querySelector('canvas').addEventListener('touchend',this.showIconListener);
     }
     this.log.info("click publish");
     this.unpublish();
     if(options instanceof MouseEvent)
            this.PublishJanus.init(this.input,this.flags);
     else this.PublishJanus.init(this.input,options || this.flags);
     if (this.flags && this.flags.video == false) this.setOnlyAudioPoster(true);
     else this.setOnlyAudioPoster(false);
     this.playerEventObserver.next({type:"play",value:"true"});
 }
 unpublish(){
   this.PublishJanus.stop();
   this.shadowRoot.querySelector('video').srcObject= null;
   this.playerEventObserver.next({type:"pause",value:"true"});
 }
 destroy(){
   this.PublishJanus.stop();
   this.PublishJanus.destroy();
   this.shadowRoot.querySelector('video').srcObject= null;

 }
 setConfig(){
   this.log.info(this.options);
   let conf = {};
   try {
     conf = JSON.parse(this.options);
     this.flags = conf;
   }
   catch(ex){
     this.log.warn(ex);
   }
   if (typeof conf.portrait!=="undefined") this.shadowRoot.querySelector('#portrait').checked = conf.portrait || false;
   if (typeof conf.res!=="undefined") this.shadowRoot.querySelector('#res').value = conf.res || "HD";
   if (typeof conf.audio!=="undefined") this.shadowRoot.querySelector('#audioc').checked = conf.audio;
   if (typeof conf.video!=="undefined") this.shadowRoot.querySelector('#videoc').checked = conf.video;
   if (typeof conf.bitrate!=="undefined") this.shadowRoot.querySelector('#bitrate').value = conf.bitrate;
   if (typeof conf.noiseS!=="undefined") this.shadowRoot.querySelector('#noise').checked = conf.noiseS;
   if (typeof conf.echoC!=="undefined") this.shadowRoot.querySelector('#echo').checked = conf.echoC;
   if (typeof conf.gainC!=="undefined") this.shadowRoot.querySelector('#gain').checked = conf.gainC;
   if (typeof conf.gainC!=="undefined") this.shadowRoot.querySelector('#delay').value = conf.delay || 0;
   if (typeof conf.volIncrease!=="undefined") this.shadowRoot.querySelector('#volIncrease').value = conf.volIncrease || 0;
   if (typeof conf.simulcast!=="undefined") this.shadowRoot.querySelector('#simulcast').checked = conf.simulcast;
   window.echoC = this.shadowRoot.querySelector('#echo').checked;
   window.noiseS = this.shadowRoot.querySelector('#noise').checked;
   window.gainC = this.shadowRoot.querySelector('#gain').checked;
   window.volIncrease = parseInt(this.shadowRoot.querySelector('#volIncrease').value) || 0;
   window.audioType = this.shadowRoot.querySelector('#audiotype').value || "";
   if (typeof conf.showAudioInput!=="undefined") window.showAudioInput = conf.showAudioInput;


 }
 async showConfig(){
  this.requestFullscreen();
  let audioValue;
  let audioText ; 
  let videoValue ;
  let videoText ;
   let medias = await this.listMedia();
   this.shadowRoot.querySelector('web-dialog').open =true;
   let audios = this.shadowRoot.querySelector('#audio-device');
   let videos = this.shadowRoot.querySelector('#video-device');
  if (audios && videos && audios.children.length>0){
     audioValue = audios.options[audios.selectedIndex].value;
     audioText = audios.options[audios.selectedIndex].text;
     videoValue = videos.options[videos.selectedIndex].value;
     videoText = videos.options[videos.selectedIndex].text;
  }
   audios.innerHTML ="";
   videos.innerHTML ="";
   medias.forEach((m)=>{
     let option = document.createElement('option');
     option.value = m.deviceId;
     option.innerHTML = m.label || m.deviceId;
     if (m.kind === "audioinput"){
        if (m.deviceId == audioValue) option.selected = true;
        audios.appendChild(option)
     }
     else if (m.kind==="videoinput"){
        if (m.deviceId == videoValue) option.selected = true;
        videos.appendChild(option);
     }
   })
 }
  configChange(ev){
    this.flags.portrait = window.portrait = this.shadowRoot.querySelector('#portrait').checked;
    this.flags.res = window.res = this.shadowRoot.querySelector('#res').value;
    this.flags.audioinput = this.shadowRoot.querySelector('#audio-device').value;
    this.flags.videoinput = this.shadowRoot.querySelector('#video-device').value;
    this.flags.video = this.shadowRoot.querySelector('#videoc').checked;
    const useAudio = this.shadowRoot.querySelector('#audioc').checked;
    if (useAudio && !this.flags.audioinput) {
      console.warn('Disabled audio since there is not audio input selected')
    }
    this.flags.audio = !!this.flags.audioinput ? useAudio : false;
    // If audio is disable, we have to disable showAudioInput
    if (window.showAudioInput && !this.flags.audio) {
      window.showAudioInput = false
    }
    this.flags.echoC = window.echoC = this.shadowRoot.querySelector('#echo').checked;
    this.flags.noiseS = window.noiseS = this.shadowRoot.querySelector('#noise').checked;
    this.flags.gainC = window.gainC = this.shadowRoot.querySelector('#gain').checked;
    this.flags.delay = window.delay = this.shadowRoot.querySelector('#delay').value;
    this.flags.volIncrease = window.volIncrease = parseInt(this.shadowRoot.querySelector('#volIncrease').value);
    this.flags.audioType = window.audioType = this.shadowRoot.querySelector('#audiotype').value;
    this.flags.simulcast = this.shadowRoot.querySelector('#simulcast').checked;
    this.flags.bitrate = parseInt(this.shadowRoot.querySelector('#bitrate').value)*1024;
    this.log.info(this.flags);
    if (ev && ev.srcElement.id === "audio-device"){
      if (this.flags.portrait === true){
        this.PublishJanus.rotateVideo(this.flags.audioinput,this.flags.videoinput);
        this.shadowRoot.querySelector('canvas').removeEventListener('mouseover',this.showIconListener);
        this.shadowRoot.querySelector('canvas').removeEventListener('touchend',this.showIconListener);
        this.shadowRoot.querySelector('canvas').addEventListener('mouseover',this.showIconListener);
        this.shadowRoot.querySelector('canvas').addEventListener('touchend',this.showIconListener);
      }
      else this.PublishJanus.restartCapture(this.flags.audioinput,this.flags.videoinput,{video:this.flags.video,audio:this.flags.audio, portrait:this.flags.portrait});
      if (this.flags.video == false) this.setOnlyAudioPoster(true);
      else this.setOnlyAudioPoster(false);
    }
    else if (ev && ev.srcElement.id === "video-device"){
      if (this.flags.portrait === true){
        this.PublishJanus.rotateVideo(this.flags.audioinput,this.flags.videoinput);
      }
      else this.PublishJanus.restartCapture(this.flags.audioinput,this.flags.videoinput,{video:this.flags.video,audio:this.flags.audio, portrait:this.flags.portrait});
      if (this.flags.video == false) this.setOnlyAudioPoster(true);
      else this.setOnlyAudioPoster(false);

    }
  
  }
  setOnlyAudioPoster(flag){
    if (flag===true){
      this.shadowRoot.querySelector('video').poster = "https://assets.boxcast.com/latest/static/audio-only.png";
    }
    else 
    this.shadowRoot.querySelector('video').poster = "";
  }
   userCmdEvents(evt){
    if (evt.cmd =="stream"){
       FlexJanus.stop(this.input);
       this.input = evt.value;
       FlexJanus.start(evt.value, this);
       if (this.flags.video == false) this.setOnlyAudioPoster(true);
       else this.setOnlyAudioPoster(false);
    }
  }
  setOrkestraInstance(app){
    this.app = app;
    this.app.useServiceHub(app.options.channel+"_mediaServs").then (()=>{
    
       this.app.publishService('adaptiveStream_'+this.app.getMyAgentId());
       setTimeout(()=> { 
       let data= {
          io: "out",
          portrait:false,
          res:"HD",
          bitrate:0,
          volume:1,
          volIncrease:1,
          noiseS:true,
          echoC:false,
          gainC:false,
          simulcast:false,
          viewport:this.shadowRoot.querySelector('video').clientWidth+"x"+this.shadowRoot.querySelector('video').clientHeight,
          audio:true,
          video:true,
          status:1,
          timestamp:new Date().getTime()
        }
     this.sendAdaptativeStreamInfo(data)},3000);
     this.app.subscribeToService('adaptiveStream_'+this.app.getMyAgentId(),this.adaptativeStreamChange.bind(this),"in");

   }).catch(e=>{
     this.log.error(e);
   });
   
  }
  sendAdaptativeStreamInfo(data){
    this.app.sendServiceData('adaptiveStream_'+this.app.getMyAgentId(),data,"out");
  }
  adaptativeStreamChange(evt){
    this.log.info(evt);
    if (typeof evt.value.data.bitrate !="undefined"){
       let diff = Obj.getObjectDiff(evt.value.data,this.flags);
       this.log.info("diff",diff);
       this.flags.portrait = window.portrait = evt.value.data.portrait;
       this.flags.res = window.res = evt.value.data.res;
       this.flags.bitrate = evt.value.data.bitrate;
       this.flags.video = evt.value.data.video;
       this.flags.audio = evt.value.data.audio;
       this.flags.echoC = window.echoC = evt.value.data.echoC;
       this.flags.gainC = window.gainC = evt.value.data.gainC;
       this.flags.noiseS = window.noiseS = evt.value.data.noiseS;
       this.flags.simulcat = evt.value.data.simulcast;
       this.flags.delay = window.delay = evt.value.data.delay || 0;
       this.flags.volIncrease = window.volIncrease = parseInt(evt.value.data.volIncrease) || 1;
       this.flags.audioType = window.audioType = evt.value.data.audioType || "";
       this.publish(this.flags);
       if (this.flags.video == false) this.setOnlyAudioPoster(true);
       else this.setOnlyAudioPoster(false);
    } 
  }
  save(){
     
    this.configChange();
    if (this.flags.portrait === true){
      this.unpublish();
      this.PublishJanus.init(this.input,this.flags);
      if (this.flags.video == false) this.setOnlyAudioPoster(true);
      else this.setOnlyAudioPoster(false);
      this.playerEventObserver.next({type:"play",value:"true"});
      setTimeout(()=>{
        setTimeout(()=>{
          this.shadowRoot.querySelector('canvas').removeEventListener('mouseover',this.showIconListener);
          this.shadowRoot.querySelector('canvas').removeEventListener('touchend',this.showIconListener);
          this.shadowRoot.querySelector('canvas').addEventListener('mouseover',this.showIconListener);
          this.shadowRoot.querySelector('canvas').addEventListener('touchend',this.showIconListener);
        },1000);
      },1500);
    }
    else {
      this.publish(this.flags);
      this.playerEventObserver.next({type:"play",value:"true"});
    }
   }

  render () {
    if (this.config === "undefined") return; 
 

  }

}

customElements.define('webrtc-publisher', WCWebrtcPublisher);
