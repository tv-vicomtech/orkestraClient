# Orkestra Library 
[API](https://github.com/tv-vicomtech/Orkestralib#api) | [Synchronization](https://github.com/tv-vicomtech/Orkestralib#synchronization-motion) | [Adaptation](https://github.com/tv-vicomtech/Orkestralib#user-interface-deployment-and-layout) | [Extra Tools](https://github.com/tv-vicomtech/Orkestralib/blob/develop/README.md#extra-tools) | [Examples](https://github.com/tv-vicomtech/Orkestralib#examples) | [Testing](https://github.com/tv-vicomtech/Orkestralib/tree/develop/test) | [SandBox](https://github.com/tv-vicomtech/Orkestralib/blob/develop/README.md#codesandbox)

It is a library to support multi-device applications, its main function is to facilitate the development of this type of applications. To do this, it abstracts the communication complexities that arise when trying to develop multi-device applications, helping the developer to focus on the application that they want to develop.

Orkestra is made up of different mechanisms that facilitate modular development; under coupling, plugin based system, modular injection and basic support for complex functions like component management, distribution and layout functions.

User interface support is optional, this service is offered as one more layer to facilitate development, but its greatest virtue is abstracting the complexity of synchronized multi-device application communications.

It is compatible with numerous frameworks such as Angular, React, es6 and vanilla, and can cooperate from different frameworks

## Install

```bash
npm i 
```


## Build && Run

```bash
npm start
```
## Use
### StandAlone (Shows test pages)

https://localhost:8080 (depends of port available)
### As dependency

```typescript
import {Orkestra,Utils,UserTable,AppTable,KeyPress} from 'orkestraLib';
```

## API

Create a new app:


```js
var app = new Orkestra(options);

```
* Options
    * url: server url (optional, default use hosting url)
    * channel: channel (room) to connect to (if empty is not connected to application context)
    * agentid: set user agentid (optional)
    * profile: define profile(optional)
    * master: true/false (is master or not, master receive all notifications)
    * Debug: true/false/'all' (false, not console not sharedPanel. true -> console log, 'all' console and sharedPanel enabled)

Get changes from connected devices:
```js
app.userObservable.subscribe(change=>{
      console.log(change);
});

```
* change
    * type: 'agent_change','agent_left','agent_join','capability_change'
    * data: agentid, capabilities, diff (diff of data)

Keep the device variable updated (in this case user_table is a webcomponent, its content is updated):
```js
app.userObservable.subscribe(change=>{
      user_table.users = app.getUsers();
});
```


Get application context changes:

* change
    * key
    * value

```js
app.appObservable.subscribe(x => {
  console.log("application attribute change",x);
  app_table.datos = app.getAppData();
});
```
Get connected devices / users:

```js
 app.getUsers();
```
Get variables from application context:
```js
 app.getAppData();
```

### Define new shared user / device data

Orkestra offers a way to share new content from users
connected, for this you must follow a specific scheme. We must add,
an interface that controls user data:

```js
/* data(nombre_del_dato_compartido,intefaz_de_datos,[argumentos]) */
app.data('textShare',TextData,[document.querySelector('input')]);
```

Example of an interface that shares the data of an input that is shared as 'textShare' in each of the users / devices:

```js
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
```
Test -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/instruments/agentContext.html

### Change user data

Get

```js
// app(use_id,parametro,valor)
updateUserData(user,textShare,"kaixo")

```
**In order to change the value it must exist as data.**

### Obtain and define application data

Get

```js
app.getAppAttribute('muted');
```

Set

```js
app.setAppAttribute('muted',false);
```
## Synchronization (Motion)

Orkestra offers the possibility of synchronizing events on a centralized time server. Synchronized objects can be multimedia or not. Multimedia objects do not support synchronization adjustment but the maximum lag between devices is ~ 60ms. If the object to be synchronized is of medium type, a synchronization of ~ 15ms can be achieved.

```js
var timerController = app.enableSequencer(objectSync,channel,?server);
```
* ObjectSync
    * Video/Audio Elements
    * ObjectSync objects
 * Channel
 * Server(optional)
* Returns
    * MediaController: play,pause,seek.
```typescript
// import ObjectSync if there is not multimedia object to sync
import {ObjectSync} from './orkestra/motion/motion'
...
var objectSync = new ObjectSync();
var timerController = app.enableSequencer(objectSync,channel,?server);
// event of time update
app.timerObservable.subscribe(timeObject => {
});
```
Sync multimedia source (those using same channel will be sync):
```typescript

...
app.synObjects(htmlVideo,channelTOSync, ?server)
```
Test -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/motion/multimediaSync.html

Test2 -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/motion/objectSync.html

## User interface (Deployment and layout)

Orkestra as an extra proposes how to develop a layer of
makes decisions on how to distribute content over different
devices / users and how to render them on each of the devices.

To do this, it proposes a plugin system based on the form of expresjs,
which is based on injecting modules, and reacting to different types of events.

Add functionality for decision making:

```js
import {Byname} from './orkestra/rules/byname';
app.use(Byname);
```
Example of the decision-making module:

```js

export function Byname (){
  var self = {};
  self.name ="byname";
  var deploy = function (evt,cmp){
      console.log("deploy rule",evt);
      cmp.ForEach((c)=>{
        if (c.name === evt.profile) c.style.visible = true;
        else c.style.visible = false;
      })
  }
  return deploy;

}
```
Add rendering functionality (layout);

```js
import {Divided} from './orkestra/ui/plugins/divided';
app.ui(Divided)
/* define one to use (optional)*/
app.ui().useLayout('Divided');
```
Example of the rendering module:

```js
export function Divided (){

  var self = {};
  self.name = "divided";
  var render = function(ev,cmp){
     console.log("Plugin ",self.name,ev,cmp);
     var container = document.createElement('div');
     container.class="divided";
     cmp.forEach((c)=>{
         container.appendChild(c);
     })
  }
  ver unload = function(cmps){
  
  }
  var api = { 
               render:render,
               unload:unload
               }
  return api;

}
```

As there can be more than one module for each one, by default the priority is established in the order that they have been registered, it would be necessary to see if it is necessary to add a parameter that defines the priority.

### Available UI layouts:
- Mosaic
- Divided 
- Tabs

In order for the library to be able to read the components, for now you have to encapsulate the components within a component called: ui-orkestra, like this:

```html

<orkestra-ui>
 <user-table [user]='user'></user-table>
<user-table [datos]='data'></user-table>
</orkestra-ui>
```
Test -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/ui/layout.html
## ComponentsStatus

An application based on orkestraLib is composed among other things by the state of the components, which are webcomponents. To facilitate interaction with the components, orkestraLib offers certain functionalities that allow you to easily interact with the components and update their status.

```
componentsStatus[
    {comp:"video1", show:true/false, userCmd:[{
                                                 show:true,
                                                 stream:"cam1",
                                                 layout:"Mosaic"
                                              }],
    {comp:"video1", show:true/false, userCmd:[{
                                                 show:false,
                                                 stream:"cam3",
                                                 layout:"Fullscreen"
                                              }]
        ...
]
```
HowTo Get ComponentsStatus info

```js

app.getUser('me').componentsStatus

```
Send info to especific webcomponent of agent:

```js

app.updateComponentStatus(agentid,cmpId,{cmd:"stream",cmp:cmpId,value:"valor"})

```

The info be received by component function called usrCmdEvents, so this function
should be implemented on component you want to receive info:

```js
 // Component logic (x-media component example)
 ...
  userCmdEvents(evt){
    console.log("XMEDIA CMD",evt);
    if (evt.cmd =="stream"){
       FlexJanus.stop(this.input);
       this.input = evt.value;
       FlexJanus.start(evt.value, this);
    }
  }
  ....
  ```
Show cmd is consumed internally so there is not need to treated at component level,
to show or hide component on agentid:

```js
// hide
app.updateComponentStatus(usr[1].agentid,c.cmp,{cmd:"show",cmp:c.cmp,value:false})
// show
app.updateComponentStatus(usr[1].agentid,c.cmp,{cmd:"show",cmp:c.cmp,value:true})
```
Test -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/compDeploy/explicit.html

### Changing agent Layout

For change layout:

```
// NOte, the layout Mosaic must be registered by app.ui()
app.updateUserData(usr[1].agentid,"layout","Mosaic");

```
Get user layout:

```js
app.getUsers.get("me").layout

```

### Layout Fullscreen

Fullscreen can be device based fullscreen or all devices based fullscreen.

Set device based fullscreen, one component take all space of the device:

```js
  app.updateUserData(usr[1].agentid,"layout","FullScreen_"+c.cmp+"_on");
  app.updateUserData(usr[1].agentid,"layout","FullScreen_"+c.cmp+"_off");

```
Set session based fullscreen, one component take all space of the devices:

```js
  app.setAppAttribute("layout",{applyTo:"all",layout:"FullScreen",cmp:c.cmp,status:"on"});
```
Test -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/ui/fullscreen.iframe.html
## Extra Tools

OrkestraLib aims to simplify multi-user interactions, therefore offers some tools that could be helpful for
realtime multi-user application like: own rules for timing based applications, several ui layouts rules (divided, mosaic), multimedia webcomponent compatible with webrtc (janus-gateway), webcomponents to visualize connected users etc.

### Logger

In order to maintain logs organize, orkestraLib allows to logging differents way, orkestra core logs could be shown passing to orkestra instance:

* debug: true/all/false : true if you want see logs related at console level, all if you want to see logs at console and session panel, false if you don't want logs.

```js
let options = {
                url:"",
                debug:true
 }
let app = new Orkestra(options);

```

#### Loggin Level

```js
log.trace(msg)
log.debug(msg)
log.info(msg)
log.warn(msg)
log.error(msg)
```

```js

import {Logger} from 'orkestraLib';
log.getLogger("main");
Logger.setLogLevel(log.levels.TRACE,'main');
```
#### Grouped logs

```js
import {Logger} from 'orkestraLib;
let mainlog = log.getLogger("main");
let netlog = log.getLogger('net');
/*...*/
mainlog.warn("no defined");
netlog.info("bitrate x");
```


### byTimeline Rule

This rule aims to display on each user those components that timeline structure has define. The main idea is to define a timeline (json format) that
define which components must be represented on each of the users. There is a example of the timeline.json that expects:

```json
{
  "applyTo":"all",
  "componentStatus":[
      {
         "id":0, //componentID
         "intervals":[{
               "init":0,
                "end":5
         }],
         "slots":[1,1,1,1,1,0,0,0]
         "mutedScene":[1,1,1,1,1,0,0,0]
      }
  ]
 }
```
Test -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/compDeploy/splitcomponents.html
### Divided layout 

This layout ensure that all components are rendered with same space and aspect. It capable to divide the represented page
on similar sections, it's adapt the space taking on account the number of components must be render it.

Test -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/ui/layout.html
### Mosaic Layout

This layout represent selected component as more relevant, it takes more space than others, those are rendered around the most
relevant component.

Test -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/ui/layout.html
### Tabs Layout

This layout represent the existing webcomponents in tab format.

Test -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/ui/layout.html

### Transitions
OrkestraLib's supports now transitions between events. For now, there is one transition implemented named Simple, it can be used this manner:
```js

/* Import transtion script from orkestraLib core */
import { Simple } from 'orkestraLib';
/* Enable transition called simple */
app.transitions(Simple({background:"red",time:1500}));
/* For disable all transitions */
app.disableTransitions();
/* for enable one transition */
app.enableTransition("Simple");
/* remove existing plugin */
app.removeTransition(name);
```

### X-media webcomponent

This web component allows rendering a different media source such as: video, sound, images, gifs, mpeg-dash and webrtc streams in a simple way. Examples:

```html
<!-- video example -->
<x-media input="http://my.example/video.mp4"></x-media>
<!-- audio example -->
<x-media input="http://my.example/sound.mp4"></x-media>
<!-- image example -->
<x-media input="http://my.example/me.gif"></x-media>
<!-- webrtc example -->
<x-media input="myPeer" config='{"janusServer":"cloud.flexcontrol.net","muted":"true","profile":"low"}'></x-media>
<!-- mpeg-dash example -->
<x-media input="https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd"></x-media>
```
Test -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/xmedia/index.html
### MPEG-DASH webcomponent

This webcomponent allows to render a diferent media source based on mpeg-dash. It's already parte of x-media components, but it could be used this way:

```html
    <dash-video id="video5" controls src="https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd" options='{"stableBuffer":20,"bufferAtTopQuality":20,"maxBitrate":5000,"minBitrate":-1,"limitByPortal":true}'></dash-video>

```
Test -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/xmedia/dash.html
### User-table webcomponent

This webcomponents aims to show the user connected and each of the parameters shared. Use case:

```html
<user-table id="myusers"></user-table>

```
```js
const user_table = document.querySelectorAll('user-table')[0];

app.userObservable.subscribe(z=>{
      user_table.users = app.getUsers();

});
```
Test -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/context/monitor.html
### App-table webcomponent

This webcomponents aims to show the parameters shared on application. Use case:

```html
<app-table id="myapp"></app-table>

```
```js
const app_table = document.querySelectorAll('app-table')[0];

app.appObservable.subscribe(z=>{
    app_table.datos = app.getAppData();

});
```
Test -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/context/monitor.html
### Webrtc-publisher components

In order to publish webrtc flows orkestraLib's offers a highly customosize webcomponents, which allows to publish different streams as audio-video, audio only, video only, multicast, different bitrates, choose source of video and audio, customize stream filters.

```html
<webrtc-publisher input="peerID" config='{"janusServer":"cloud.flexcontrol.net","room":1234}' options='{"audio":true,"video":true,"simulcast":false,"bitrate":0,"noiseS":true...}'>
  </webrtc-publisher>
```

* Options
    * audio: enable/disable audio
    * video: enable/disable video
    * simulcast: enable/disable multicast
    * bitrate: set bitrate to transmit (bytes)
    * noiseS: enable/disable noisseSupression
    * echoC: enable/disable echo cancellation
    * gainC: enable/disable gain control

#### Functions

```js 
/* publish defined at webcomponent options, or overwrite it */
publish(options)
```
```js 
/* unpublish peerId */
unpublish()

```
```js 
/* Get enabled media sources; return promise with list of devices */
listMedia()

```
Simple example:

```html
<webrtc-publisher input="peerID" config='{"janusServer":"cloud.flexcontrol.net","room":1234}' options='{"audio":true,"video":true,"simulcast":false,"bitrate":0,"noiseS":true...}'>
  </webrtc-publisher>
<script>
document.querySelector('webrtc-publisher').publish();
</script>
```
Test component -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/janus/wctest.html

Test publisher -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/janus/publish.html

Test client -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/janus/client.html
### Webrtc screen share component

In order to publish webrtc flows orkestraLib's offers a highly customosize webcomponents, which allows to publish
different streams as screen-shaare,audio-video, audio only, video only, multicast, different bitrates, choose source of video and audio,
customize stream filters.

```html
<screen-share input="test" config='{"janusServer":"cloud.flexcontrol.net","room":1234}' options='{"bitrate":1000000,"simulcast":true}'>
</screen-share>
```

* Options
    * simulcast: enable/disable multicast
    * bitrate: set bitrate to transmit (bytes)

#### Functions

```js 
/* publish defined at webcomponent options, or overwrite it */
publish(options)
```
```js 
/* unpublish peerId */
unpublish()

```
Test -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/janus/screen-shareTest.html

### WebRtc services

OrkestraLib offers a realtime multimedia consume through a webrtc protocol. It's implements JanusGateway solution that allow to manage webrtc connection effective and transparently for users. Therefore orkestraLib allow to publish and consume this type of service through own webcomponents, such as x-media.

#### Publishing own stream

Constructor:
```js

/* Input: video HTML, janusServiceUrl * /
/* Output JanusPublish instance */

JanusPublish(videoEl,janusGatewayURL);

```
API:

```js
/* publish function */
/* Input: peerID (name used to publish the stream) */
PublishJanus.init(id);

/* unpublish function */
/* Input: peerID (name used to publish the stream) */
PublishJanus.stop(id);

/* change device function */
/* Input: None */
PublishJanus.changeDev();

```
Example:

```js

import {JanusPublish} from 'orkestraLib';
app.readyObservable.subscribe(x => {
    PublishJanus  = JanusPublish(document.querySelector('#me_video'),"cloud.flexcontrol.net");
    
});
function publish(id){

  PublishJanus.init(id);
}
function unpublish(id){

  PublishJanus.stop(id);

}
function changeDev(){
  this.PublishJanus.changeDev();

}
```
```html
<button id="b_publish" onclick="publish('actorIni")> Participate</button>
<button id="u_publish" onclick="unpublish('actorIni")> Participate</button>
```
Test -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/janus/publish.html
#### Consume a stream

```html
<!-- Input: input -> peerId of stream to connect -->
 <x-media id="0"  input="peerId" config='{"janusServer":"cloud.flexcontrol.net","muted":"false"}'></x-media>

Test -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/janus/client.html

```
Manage streams on your own way:

```js
import {JanusClient} from './janusclient';

/* Input: context of video source, janusServiceUrl * /
/* Output JanusClient instance */
window.janusClient  = JanusClient(this,obj.janusServer);
/* will start listing for events from webrtc channel */
janusClient.init(this);

/* Start consuming stream */

janusClient.start(peerId,context of video source);


/* 

/* Listen for existing streams */

document.addEventListener('JanusReady',this.janusReadyListener.bind(this));

/* Listen for changes on streams (added, removed etc..)
document.addEventListener('newStream',this.newStreamListener.bind(this));

```
#### Service Hub

Through orkestraLib you can publish services and consume their resources. For this, the following functionalities are available:

Listen to service Hub:

```js

ork.useServiceHub(nameOFHub).then (()=>{
   ...
});
```
Get services already published on the hub:

```js
ork.useServiceHub(nameOFHub).then (()=>{
   console.log(ork.getServices());
});
```
Publish new services on the hub:

```js
ork.useServiceHub(nameOFHub).then (()=>{
    ork.publishService('faceDetection');
});
```
Listen from event IN/OUT to your service:

```js
ork.useServiceHub(nameOFHub).then (()=>{
   ork.subscribeToService('faceDetection',handleFunction,"IN_OR_OUT")
});
```
Send event as OUTPUT to your service:

```js
ork.useServiceHub(nameOFHub).then (()=>{
    let data = {"io": "out","facePose":[1,2,34]}
    ork.sendServiceData('faceDetection',JSON.stringify(data));
});
```
Test  publish -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/services/publish.html

Test  consume -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/services/consume.html
## Examples

Example of angular using webcomponents [Code] (https://gitlab.vicomtech.es/mesh_sdk/orkestra-angular):
```ts
import { Component } from '@angular/core';
import {Orkestra,Utils,UserTable,AppTable,KeyPress} from 'orkestra';
import {TextData} from 'orkestra';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent  {
    orkestra: any;
    users:any;
    appData:any;
    app: any;
    constructor(){
       console.log("MASTER",Utils.getUrlVar('master') === 'true');
       this.app = new Orkestra({url:'https://cloud.flexcontrol.net/',channel:'traction1',profile:'admin',master:Utils.getUrlVar('master') === 'true'});
       this.app.userObservable.subscribe(z=>{
          this.users= this.app.getUsers();

       });

       this.app.readyObservable.subscribe(x => {

         this.app.loadNewScript('textShare',TextData,[document.querySelector('input')]);
         this.app.loadNewScript('keyPress',KeyPress,[0]);
         this.app.setAppAttribute('loadSound',{volumen:1,speed:0.21})
       });
       this.app.appObservable.subscribe(x => {
         console.log("application attribute change",x);
           this.appData = this.app.getAppData();
       });

    }
}
```

```html
  <router-outlet></router-outlet>
  <orkestra-ui>
      <user-table [users]="users"></user-table>
      <app-table [datos]="appData"></app-table>
      <input type="text">
  </orkestra-ui>
```



Example Es6 [code] (https://gitlab.vicomtech.es/mesh_sdk/orkestra-vanilla/blob/master/src/app.js):
```js
import {Orkestra,Utils,TextData} from 'orkestra'
const user_table = document.querySelector('user-table');
const app_table = document.querySelector('app-table');

var app = new Orkestra({url:"https://cloud.flexcontrol.net/",channel:'traction1',profile:'admin',master:Utils.getUrlVar('master') === 'true'});
app.userObservable.subscribe(z=>{
    user_table.users = app.getUsers();

});

app.readyObservable.subscribe(x => {
  app.setAppAttribute('loadSound',{volumen:1,speed:0.21})
});
app.appObservable.subscribe(x => {
  console.log("application attribute change",x);
  app_table.datos = app.getAppData();
});
```

Example vanilla [code] (https://gitlab.vicomtech.es/mesh_sdk/orkestra-vanilla/blob/master/src/app.vanilla.js) you have to add script to index:

```js

const user_table = document.querySelector('user-table');
const app_table = document.querySelector('app-table');

var app = new OrkestraAPI.Orkestra({url:"https://cloud.flexcontrol.net/",channel:'traction1',profile:'admin',master:OrkestraAPI.Utils.getUrlVar('master') === 'true'});
app.userObservable.subscribe(z=>{
    user_table.users = app.getUsers();

});

app.readyObservable.subscribe(x => {
  app.setAppAttribute('loadSound',{volumen:1,speed:0.21})
});
app.appObservable.subscribe(x => {
  console.log("application attribute change",x);
  app_table.datos = app.getAppData();
});

```
Example user interface and deployment (es6) [code](https://gitlab.vicomtech.es/mesh_sdk/orkestra/blob/ui_engine/src/app.js):

```js
import {Orkestra,Utils} from './orkestra/orkestra';
import {WCUserTable} from './wcs/users';
import {WCAppTable} from './wcs/app';
import {TextData,KeyPress} from './orkestra/instruments/';
import {Divided} from './orkestra/ui/plugins/divided';
import {Byname} from './orkestra/rules/byname';
const user_table = document.querySelector('user-table');
const app_table = document.querySelector('app-table');
var app = new Orkestra({url:'https://cloud.flexcontrol.net/',channel:'traction1',profile:'admin',master:Utils.getUrlVar('master') === 'true'});

app.use(Byname());
app.ui(Divided());

app.data('textShare',TextData,[document.querySelector('input')]);

app.userObservable.subscribe(z=>{
      user_table.users = app.getUsers();
});

app.readyObservable.subscribe(x => {
  app.setAppAttribute('loadSound',{volumen:1,speed:0.21});
});
app.appObservable.subscribe(x => {
  console.log("application attribute change",x);
  app_table.datos = app.getAppData();
});
```
### CodeSandBox
Open on two different tabs to see how works:
* Chat: https://codesandbox.io/embed/recursing-newton-yhiht?fontsize=14&hidenavigation=1&theme=dark
* Share Moving rectangle: https://codepen.io/itamayo/pen/bGeORQe?editors=1010

### More Examples

Examples -> https://github.com/tv-vicomtech/Orkestralib/blob/develop/test/example/index.html

or

https://localhost:8080/test/example/

## License

[LGPL](https://github.com/tv-vicomtech/Orkestralib/blob/develop/LICENSE.LGPL)
