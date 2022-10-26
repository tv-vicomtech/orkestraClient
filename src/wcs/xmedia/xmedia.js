/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import { JanusClient } from '../libs/janusclient.js';
import {Logger} from '../../orkestra/utils/index.js';

const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
  display: inline-block;
  position: relative;
}
.title {
  position: absolute;
  background-color: rgb(63 63 63);
  color: rgb(205 202 202);
  letter-spacing: 0.05rem;
  left: 0;
  padding: 0.3rem 1.2rem;
  font-size: 65%;
}
#video {
  background-color: rgb(0, 0, 0);
}
@media (max-width: 750px){
  .title {
    padding: 0.2rem 0.8rem;
    font-size: 55%;
  }
}
</style>`;
const optionsDashProfileDefault = { // https://github.com/Dash-Industry-Forum/dash.js/blob/27f4eb3df338d1d54935af1375f5276c179e0334/src/core/Settings.js
  debug: {
    logLevel: 0,
    dispatchEvent: false
  },
  streaming: {
    stableBufferTime: 12,
    bufferTimeAtTopQuality: 20,  // seconds of buffer at top quality
    scheduleWhilePaused: false, // do not buffer before playing
    fastSwitchEnabled: true, // this changes qualities as soon as possible when going to a higher bitrate
    abr: {
      limitBitrateByPortal: true, // don't download more pixels than what you need to show
      initialBitrate: { video: 1500 },
      maxBitrate: { audio: -1, video: 5000 },
      minBitrate: { audio: -1, video: 900 }
    }
  }
}
export class XMedia extends HTMLElement {

  static get observedAttributes() {
    return ['input', 'type', "style", "config","nosignalimg", 'title'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'type') {
        this.type = newValue;
      } else {
        this[name] = newValue;
        if (name=="nosignalimg"){
           this.render();
        }
      }
      const mediatype = this.identifiyMedia();
      if (mediatype === "webrtc" && name === "style" && this.profile !== "low") {
        const videoElement = this.shadowRoot.querySelector('video')
        if (videoElement && videoElement.clientWidth > 300) {
          this.changeSubStream(this.input,2);
        }
        else  {
          this.changeSubStream(this.input,2);
        }
      }
      if (mediatype === "webrtc" && name === "input") {
        document.addEventListener('substreamConfigured', this.onSubstreamConfigured.bind(this));
      }
    }
  }

  get config() { return this.getAttribute('config'); }
  set config(value) {
    let old = this.getAttribute('config');
    if (old != value) {
      this.setAttribute('config', value);

    }
    let obj = JSON.parse(value);
    
    if (!window.FlexJanus && obj.janusServer ) {
      if (!window.parent.FlexJanus){
        if (obj.iframe===true){
          window.parent.FlexJanus = JanusClient(this, obj.janusServer,obj.room,obj.buffer);
          window.parent.FlexJanus.init(this);
        }
        else {
          window.FlexJanus = JanusClient(this, obj.janusServer,obj.room,obj.buffer);
          (window.FlexJanus || window.parent.FlexJanus).init(this)
        }        
      }
    
      if (obj.publisherFeed && obj.publisherFeed!="") {
        (window.FlexJanus || window.parent.FlexJanus).registerUsernameAsSubscriber(obj.publisherFeed);
      }

    }
    if (obj.showAudioInput === "true" || obj.showAudioInput === true){
       this.enableVolumeMeter();
    }
    if(obj.showBitrate=== "true"){
       setTimeout(()=>{this.querySelector('#bitrate').style.display="block";},5000);
    }
    if (typeof obj.profile!="undefined") {
      this.profile = obj.profile;
    }
    if (obj.autoplay === "false") {
      this.autoPlay(false);
    }
    if (obj.muted === "true") {
      this.muted = true;
      this.mute();
      this.render();

    }
    else if (obj.muted === "false") {
      this.muted = false;
      this.mute();
      this.render();

    }
    if (obj.me) {
      if (this.input === obj.me) {
        if (this.shadowRoot.querySelector('video')) {
          this.muted = true;
          this.mute();
          this.render();
        }
      }
    }
  }
  get input() { return this.getAttribute('input'); }
  set input(value) {

    if (this.oldInput != value) {
      this.oldInput = value;
      this.setAttribute('input', value);
      if (!value) {
        this.cleanInput()
        return;
      }
      let mediaType = this.identifiyMedia();
      if (mediaType === 'webrtc') {
        const videoElement = this.shadowRoot.querySelector('video')
        if (videoElement) {
          videoElement.srcObject = null
        }
      }
      this.render();
      if (mediaType == "webrtc" && this.janusReady) (window.FlexJanus || window.parent.FlexJanus).start(this.input, this);
      else if (mediaType == "webrtc" && this.janusReady == undefined) {
        setTimeout(() => { (window.FlexJanus || window.parent.FlexJanus).start(this.input, this); }, 5000);
      }

    }
    else if (this.shadowRoot.querySelector('video') && this.shadowRoot.querySelector('video').paused) {
      let mediaType = this.identifiyMedia();
      if (mediaType == "webrtc" && this.janusReady) (window.FlexJanus || window.parent.FlexJanus).start(this.input, this);
    }
    let obj = JSON.parse(this.getAttribute('config'));
    if (obj && obj.me) {
      if (this.input === obj.me) {
        if (this.shadowRoot.querySelector('video')) {
          this.shadowRoot.querySelector('video').muted = true;
        }
      }
    }

  }

  get type() { return this.getAttribute('type'); }
  set type(value) {
    let old = this.getAttribute('type');
    if (old != value) {
      this.setAttribute('type', value);
      this.render();
    }
  }

  get title() {
    return this.getAttribute('title')
  }
  set title(value) {
    this.setAttribute('title', value)
    this.createTitleElement(value)
  } 

  constructor() {
    super();
    this.substream = -1;
    this.oldInput = "";
    this.autoplay = true;
    this.loaded = false;
    this.log =  Logger.getLogger('X-media');

    this.attachShadow({mode: 'open'});
    document.addEventListener('JanusReady', this.janusReadyListener.bind(this));
    document.addEventListener('newStream', this.newStreamListener.bind(this));
    document.addEventListener('deletedStream', this.deletedStreamListener.bind(this));
    if (window.parent){
      window.parent.document.addEventListener('JanusReady', this.janusReadyListener.bind(this));
      window.parent.document.addEventListener('newStream', this.newStreamListener.bind(this));
      window.parent.document.addEventListener('deletedStream', this.deletedStreamListener.bind(this));
    }
    this.log.warn(this.input, "could not connect");
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
  janusReadyListener(e) {
    this.janusReady = true;
  }
  deletedStreamListener(e){
  	if (this.input === e.detail.id) {
		  if (this.shadowRoot.querySelector('video')) this.shadowRoot.querySelector('video').srcObject = null;
	  }
  }
  setOnlyAudioPoster(){
    if (this.shadowRoot.querySelector('video').srcObject!=null){
      let videoNum = this.shadowRoot.querySelector('video').srcObject.getVideoTracks().length;
      if (videoNum===0){
        this.shadowRoot.querySelector('video').poster = "https://assets.boxcast.com/latest/static/audio-only.png";
      }
    }
  }
  newStreamListener (e) {
    if (this.input === e.detail.id) {
      (window.FlexJanus || window.parent.FlexJanus).start(this.input, this);
      document.addEventListener('substreamConfigured', this.onSubstreamConfigured.bind(this));
      this.setOnlyAudioPoster();
    }
  }

  // Callback that is called when the input is simulcast and a substream is configured
  onSubstreamConfigured ({ detail }) {
    const { substream, input } = detail;
    if (this.input === input) {
      if (this.profile ==="low") {
        // If profile is low, only change substream if the substream received is not 0
        if (substream !== 0) {
          this.changeSubStream(this.input,0);
        }
      }
      else {
        // If profile is not low, only change substream if it is not the same
        const width = this.shadowRoot.querySelector('video').clientWidth;
        //const substreamToChange = width > 300 ? 2 : 1;
        const substreamToChange = 2
        if (substream !== substreamToChange) {
          this.changeSubStream(this.input, substreamToChange);
        }
      }
      document.removeEventListener('substreamConfigured', this.onSubstreamConfigured.bind(this));
    }
  }
  disconnectedCallback() {
    document.removeEventListener('JanusReady', this.janusReadyListener.bind(this));
    document.removeEventListener('newStream', this.newStreamListener.bind(this));
    document.removeEventListener('deletedStream', this.deletedStreamListener.bind(this));
    this.log.info('disconnected from the DOM');
  }
  async connectedCallback() {
    if (this.hasAttribute('input')) {
      this.render();
    }
    if (this.hasAttribute('type')) {
      this.render();
    }
    if (!this.querySelector('#bitrate'))this.shadowRoot.innerHTML+="<div id='bitrate' style='position:absolute;display:none;color:yellow;'></div>";
  }
  userCmdEvents(evt){
    this.log.info("XMEDIA CMD",evt);
    if (evt.cmd =="stream"){
      (window.FlexJanus || window.parent.FlexJanus).stop(this.input);
       this.input = evt.value;
       (window.FlexJanus || window.parent.FlexJanus).start(evt.value, this);
    }
  }
  identifiyMedia() {
    if (this.input && this.input !== "undefined") {
      let isURI = this.input.indexOf('/') != -1;
      if (!isURI) {
        return "webrtc";
      }
      else {

        let fileName = this.input.substring(this.input.lastIndexOf('/') + 1, this.input.length);
        let ext = fileName.substring(fileName.lastIndexOf('.'), this.input.length);
        if (ext === "") this.log.warn("Not extension found could not know media type");
        switch (ext.toLowerCase()) {
          case '.png': return "image";
          case '.jpg': return "image";
          case '.jpeg': return "image";
          case '.gif': return "image";
          case '.webp': return "image";
          case '.svg': return "image";
          case '.mp4': return "video";
          case '.ogv': return "video";
          case '.vp9': return "video";
          case '.vp8': return "video";
          case '.mpeg': return "video";
          case '.mpg': return "video";
          case '.mpd': return "dash";
          default: return "unknown";
        }
      }
    }
    else return undefined;
  }
  cleanInput() {
    let v = this.shadowRoot.querySelector('video')
    if (v) this.shadowRoot.removeChild(v);
    let img = this.shadowRoot.querySelector('img')
    if (img) this.shadowRoot.removeChild(img);
    let d = this.shadowRoot.querySelector('dash-video');
    if(d) this.shadowRoot.removeChild(d);
  }
  mute() {
    let v = this.shadowRoot.querySelector('video');
    if (this.shadowRoot.querySelector('dash-video')) v = this.shadowRoot.querySelector('dash-video').shadowRoot.querySelector('video');
    if (v) v.muted = this.muted;
  }
  muteVideo(){
    let v = this.shadowRoot.querySelector('video');
    if (this.shadowRoot.querySelector('dash-video')) v = this.shadowRoot.querySelector('dash-video').shadowRoot.querySelector('video');
    this.muted=true;
    if (v) v.muted = this.muted;
  }
  unmuteVideo(){
    let v = this.shadowRoot.querySelector('video');
    if (this.shadowRoot.querySelector('dash-video')) v = this.shadowRoot.querySelector('dash-video').shadowRoot.querySelector('video');
    this.muted=false;
    if (v) v.muted = this.muted;
  }
  changeLoop(val){
    let v = this.shadowRoot.querySelector('video');
    if (this.shadowRoot.querySelector('dash-video')) v = this.shadowRoot.querySelector('dash-video').shadowRoot.querySelector('video');
    v.loop = val;
  }
  autoPlay(flag) {
    this.autoplay = flag;
    let v = this.shadowRoot.querySelector('video');
    if (this.shadowRoot.querySelector('dash-video')) v = this.shadowRoot.querySelector('dash-video').shadowRoot.querySelector('video');
    if (v && flag === false) v.removeAttribute("autoplay");
  }
  load(resetVideo) {
    let mediaType = this.identifiyMedia();
    let v = this.shadowRoot.querySelector('video');
    if (this.shadowRoot.querySelector('dash-video')) v= this.shadowRoot.querySelector('dash-video').shadowRoot.querySelector('video');
    if (mediaType === "webrtc") {
      if (v) v.muted = this.muted;

    }
    else{
      if (v && (resetVideo==undefined || resetVideo)) {
        v.currentTime = 0;
        v.play();
      }
    }
    this.loaded = true;
  }
  unload(resetVideo) {
    let mediaType = this.identifiyMedia();
    let v = this.shadowRoot.querySelector('video');
    if (this.shadowRoot.querySelector('dash-video')) {
      v= this.shadowRoot.querySelector('dash-video').shadowRoot.querySelector('video');
    }
    if (mediaType === "webrtc") {
      if (v) {
        v.muted = true;
      }
    }
    else{
      if (v && (resetVideo==undefined || resetVideo)) {
        v.pause();
      }
    }
    this.loaded = false;

  }
  changeSubStream(stream,subid){
    if ((window.FlexJanus || window.parent.FlexJanus)) (window.FlexJanus || window.parent.FlexJanus).changeSubStream(stream,subid);
  }
  play(){
    let v = this.shadowRoot.querySelector('video');
    if (this.shadowRoot.querySelector('dash-video')) v= this.shadowRoot.querySelector('dash-video').shadowRoot.querySelector('video');
    if (v && this.loaded === true) v.play();
  }
  pause(){
    let v = this.shadowRoot.querySelector('video');
    if (this.shadowRoot.querySelector('dash-video')) v= this.shadowRoot.querySelector('dash-video').shadowRoot.querySelector('video');
    if (v && this.loaded === true) v.pause();
  }
  muteScene() {
    this.muted = true;
    this.mute();
  }
  unmuteScene() {
    this.muted = false;
    this.mute();
  }

  /**
   * It creates a span element that has the title of the x-media
   * @param title: string
   */
  createTitleElement(title) {
    const titleElement = this.shadowRoot.querySelector('.title')
    if (!titleElement) {
      // Create title element
      const element = Object.assign(document.createElement('span'), {
        className: 'title',
        textContent: title
      })
      this.shadowRoot.appendChild(element)
    } else{
      // Update title element
      titleElement.textContent = title
    }
  }

  /**
   * Create <video> element in x-media component
   * @param {string} source 
   */
  createVideoElement(source) {
    const v = document.createElement("video");
    v.id = "video";
    v.muted = this.muted;
    v.controls = false;
    v.autoplay = this.autoplay;
    v.loop = false;
    v.style = "width:100%;height:100%";
    if (source) {
      v.src = source;
    }
    this.shadowRoot.appendChild(v);
  }
  enableVolumeMeter(){
    if (!this.shadowRoot.querySelector('volume-meter')) {
      this.shadowRoot.innerHTML = this.shadowRoot.innerHTML + '<volume-meter width="25" height="200" color="blue" style="position:absolute;left:0;"></volume-meter>';
    }
    setTimeout(()=>{
      if(this.shadowRoot.querySelector('video'))
      this.shadowRoot.querySelector('video').showAudioInput = true;
    },2000);
  }
  disableVolumeMeter(){
    this.shadowRoot.querySelector('volume-meter').parentNode.removeChild(this.shadowRoot.querySelector('volume-meter'));
    setTimeout(()=>{
      if(this.shadowRoot.querySelector('video'))
      this.shadowRoot.querySelector('video').showAudioInput = false;
    },2000);
  }
  render() {
    let mediaType = this.identifiyMedia();
    if (mediaType && mediaType != "unknown") {
      switch (mediaType) {
        case "image": {
          if (!this.shadowRoot.querySelector('img')) {
            this.cleanInput('video');
            this.cleanInput('dash');
            let v = document.createElement("img");
            v.id = "video";
            v.src = this.input;
            v.style = "width:100%;height:100%;object-fit:contain;";
            this.shadowRoot.appendChild(v);
          }
          else{
            let i = this.shadowRoot.querySelector("img");
            i.src = this.input;
            i.style = "width:100%;height:100%;object-fit:contain;";
          }
          break;
        }
        case "video": {
          let v = this.shadowRoot.querySelector('video');
          if (!v) {
            this.cleanInput('img');
            this.cleanInput('dash');
            this.createVideoElement(this.input)
          }
          else {
            v.muted = this.muted;
            v.srcObject = null;
            v.src = this.input;
            v.autoplay = this.autoplay;
          }
          break;
        }
       case "dash": {
          let v = this.shadowRoot.querySelector('dash-video');
          if (v)  this.shadowRoot.removeChild(v);
            this.cleanInput('img');
            this.cleanInput('video');
            v = document.createElement("dash-video");
            v.id = "video";
            v.muted = this.muted;
            v.controls = false;
            v.autoplay = this.autoplay;
            v.loop = false;
	          v.setAttribute('log','false');
            v.setAttribute('options', JSON.stringify(optionsDashProfileDefault));
            v.style = "width:100%;height:100%";
            v.src = this.input;
            this.shadowRoot.appendChild(v);

          break;
        }

        case "webrtc": {
          if (!this.shadowRoot.querySelector('video')) {
            this.cleanInput('img');
            this.cleanInput('dash');
            let v = document.createElement("video");
            v.id = "video";
            v.muted = this.muted;
            if(this.nosignalimg){
              v.poster = this.nosignalimg;
            }
            else{
              v.poster = "https://f4.bcbits.com/img/a1761578860_10.jpg";
            }
            v.controls = false;
            v.autoplay = true;
            v.style = "width:100%;height:100%";
            this.shadowRoot.appendChild(v);
          }
          else {
            let v = this.shadowRoot.querySelector('video');
            if(this.nosignalimg){
              v.poster = this.nosignalimg;
            }
            else{
              v.poster = "https://f4.bcbits.com/img/a1761578860_10.jpg";
            }
          }
        }
      }
    } else {
      const v = this.shadowRoot.querySelector('video');
      if (!v) {
        this.createVideoElement()
      }
    }

  }


}


customElements.define('x-media', XMedia);
