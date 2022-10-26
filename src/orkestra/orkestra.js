/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import { Observable, Subject } from 'rxjs';
import { ApplicationContext } from './applicationcontext';
import { MappingService } from './mappingservice';
import { DeviceProfile, MasterSlaveProfile, UserProfile, UserData, ComponentsStatus,Message } from './instruments/';
import { Motion } from './motion/motion'
import { User } from './user';
import { UI } from './ui/UI';
import { QRCode, URI, Hash, Obj, Logger } from './utils/';


var log ;

export const EVENT = {
  AGENT_CHANGE: 'agent_change',
  AGENT_LEFT: 'agent_left',
  AGENT_JOIN: 'agent_join',
  CAP_CHANGE: 'capability_change',
  TIMELINE_EVENT: 'timeline_change'
}

class Orkestra {

  constructor(options) {
    this.options = options;
    if (options.debug && options.debug !== false) {
     
      log = Logger.getLogger('Orkestra');
      Logger.setLogLevel(log.levels.TRACE,'Orkestra');
      if (options.debug=="all") this.addDebugger();
    }
    else {
      log = Logger.getLogger('Orkestra');
      Logger.setLogLevel(log.levels.SILENT,'Orkestra');
      
    }
    this.userObserver = new Subject();
    this.userPrivObserver = new Subject();
    this.timeObserver = new Subject();
    this.appObserver = new Subject();
    this.readyObserver = new Subject();
    this.readyPrivObserver = new Subject();
    this.userPrivObservable = new Observable((observer) => { this.userPrivObserver.subscribe(observer); });
    this.userObservable = new Observable((observer) => { this.userObserver.subscribe(observer); });
    this.appObservable = new Observable((observer) => { this.appObserver.subscribe(observer) });
    this.timerObservable = new Observable((observer) => { this.timeObserver.subscribe(observer); });
    this.readyObservable = new Observable((observer) => { this.readyObserver = observer });
    this.readyPrivObservable = new Observable((observer) => { this.readyPrivObserver = observer });
    this.serviceObservable = new Observable((observer) => { this.serviceObserver = observer });
    options.agentid = options.agentid ? options.agentid : Hash.genRanHex(8);
    this.master = options.master;
    this.users = new Map();
    this.users_priv = new Map();
    this.appCtx = null;
    this.ruleEngineEnabled = false;
    this.privateChannel = options.privateChannel;
    this.appData = new Object();
    this._ui = UI(this);
    this.rulesEnabled = false;
    this.eventLogs = [];
    this.eventLogs2 = [];
    this.servicesSubs = [];
    this.transitionsCbs = [];
    // Whether if private channel enable not listen for global user context changes
    if (this.privateChannel === true) {
      let agentid = options.agentid || -1;
      let user = new User(agentid, "me", options.profile || "slave", {});
      this.users_priv.set(user.name, user);
    }
    if (options.agentid == "debugger") {
      this.rulesEnabled = false;
      this.debugger = {}
      this.debugger.agentid = "debugger";

    }
    else
      if (this.master === true) {
        let agentid = options.agentid || -1;
        let admin = new User(agentid, "me", options.profile || "master", {});
        this.users.set(admin.name, admin);
      }
      else {
        if (this.master === undefined) {
          let agentid = options.agentid || -1;
          let user = new User(agentid, "me", options.profile || "broadcast", {});
          this.users.set(user.name, user);
        }
        else {
          let agentid = options.agentid || -1;
          let user = new User(agentid, "me", options.profile || "slave", {});
          this.users.set(user.name, user);

        }
      }

    let mappServ;

    if (options.url) {
      this.mappServ = MappingService(options.url, { maxTimeout: 8000 });
      this.privMappServ = MappingService(options.url, { maxTimeout: 8000 });
    }
    else
      this.mappServ = MappingService({ maxTimeout: 8000 });
    this.setPublicConnection(options);
    if (this.privateChannel === true)
      this.setPrivateConnection(options);
   

  }
  onReady(){
    return this.readyObservable;
  }
  setPublicConnection(options) {
    if (options.channel ==="") return;
    this.mappServ.getGroupMapping(options.channel).then((channel) => {
      this.appCtx = ApplicationContext(channel.group, { autoPresence: true, autoClean: true, agentid: options.agentid });
      log.info("SharedState URL", channel.group);
      log.info("Public connection init", new Date());
      this.appCtx.onready.subscribe((e) => {

        log.info("Public connection ready", new Date());
        this.timerObservable.subscribe(evt => {
          this.rules && this.rules.forEach((r, i) => {
            if (!r.options.listenEvent || r.options.listenEvent.indexOf("timeline") != -1) {
              if (this.transitionsCbs.length>0){
                let trans= this.transitionsCbs.find((x)=>{if(x.enable===true) return true;})
                if (trans) trans.plugin.render();
                setTimeout(()=>{
                  let event_ = { type: EVENT.TIMELINE_EVENT, time: evt.target.currentTime, data: r.options.data };
                  this.resolveConflict([{ priority: 0, decision: r.cb(event_, this._ui.components, this.users, this.options) }]);
                  this._ui.uiRender(evt, "timeupdate");
                },500)  
              }
              else{
                  let event_ = { type: EVENT.TIMELINE_EVENT, time: evt.target.currentTime, data: r.options.data };
                  this.resolveConflict([{ priority: 0, decision: r.cb(event_, this._ui.components, this.users, this.options) }]);
                  this._ui.uiRender(evt, "timeupdate");
              }
            
            }
          });

        })
        this.userObservable.subscribe(evt => {
          let d = [];
          if ( this.isRuleEngineEnable() && this.getMyAgentId() == evt.data.agentid)  return;
          if (evt.data.key == "componentsStatus" && this.getMyAgentId() != evt.data.agentid) return;
          this.rules && this.rules.forEach((r, i) => {
            d.push({ priority: i, decision: r.cb(evt, this._ui.components,this.getUsersForRules(this.users), Obj.combine(this.options,r.options))});
          });
          if (evt.data.key == "componentsStatus"  && (evt.data.value.from == this.getMyAgentId())) this.resolveConflictLocally(d);
          else if (!evt.data.value || evt.data.value.from != "me") this.resolveConflict(d);
          this._ui.uiRender(evt, "userCtx");
        });
        this.appObservable.subscribe(evt => {
          var d = [];
          if (this.users.get("me")) {
            this.rules && this.rules.forEach((r, i) => {
              d.push({ priority: i, decision: r.cb(evt, this._ui.components, this.getUsersForRules(this.users), Obj.combine(this.options,r.options)) });
            });
            this.resolveConflict(d);
            this._ui.uiRender(evt, "appCtx");
          }
        });
        this.appCtx.on('agentchange', (chg) => {
          this.onAgentChange(chg);
        });
        setTimeout(() => {
          this.appCtx.me.load(ComponentsStatus(this));
          this.appCtx.me.load(UserProfile(this));
          this.appCtx.me.load(MasterSlaveProfile(this));
          this.appCtx.me.load(UserData(this));
          this.appCtx.me.load(Message(this));
          this.appCtx.me.load(DeviceProfile(options.url));

          setTimeout(() => {this.readyObserver.next({ status: 'ready' });},1000);
        }, 0);

        this.appCtx.keys().forEach((key) => {
          if (typeof options.listenAll == "undefined" || options.listenAll === true)
            this.appCtx.on(key, this.onAppAttrChange.bind(this));
            log.info("KEYS",key)
        });
        this.appCtx.keys().forEach(key => {
          if (typeof options.listenAll == "undefined" || options.listenAll === true) {
            this.appData[key] = this.appCtx.getItem(key);
            this.appObserver.next({ key: key, value: this.appData[key] })
          }
        })

        this.appCtx.on('default', this.onNewAppAttr.bind(this))
      });

    })
  }
  setPrivateConnection(options) {
    this.privGroup = URI.getUrlVar('group');
    if (!this.privGroup) {
      this.privGroup = URI.createToken();
    }
    this.privMappServ.getGroupMapping(options.channel + "_" + this.privGroup).then((channel) => {
      this.appCtxPriv = ApplicationContext(channel.group, { autoPresence: true, autoClean: true });
      console.info("SharedState URL", channel.group);
      console.info("Services connection init", new Date());
      this.appCtxPriv.onready.subscribe((ev) => {

        console.info("Private connection ready", new Date());

        this.userPrivObservable.subscribe(evt => {
          var d = [];
          this.rules && this.rules.forEach((r, i) => {
            d.push({ priority: i, decision: r.cb(evt, this._ui.components, this.users_priv, this.options) });
          });
          this.resolveConflict(d);
          this._ui.uiRender(evt, "userCtx");
        });
        //  this.readyPrivObserver.next({status:'ready'});

        this.appCtxPriv.on('agentchange', (chg) => {
          this.onAgentPrivChange(chg);
        });
        setTimeout(() => {
          this.appCtxPriv.me.load(DeviceProfile(options.url));
          this.appCtxPriv.me.load(MasterSlaveProfile(this));
          this.appCtxPriv.me.load(UserProfile(this))
        }, 500);




      });

    })
  }
  useServiceHub(name){
    return new Promise((resolve, reject) =>{
    this.serviceHubName = name;
    if (this.appCtxServices && this.appCtxServices.ready) {
       resolve();
       return;
    }
    this.privMappServ.getGroupMapping("services_" + name).then((channel) => {
      if (this.appCtxServices && this.appCtxServices.ready) {resolve();return;};
      this.appCtxServices = ApplicationContext(channel.group, { autoPresence: true, autoClean: true });
      console.info("SharedState Service URL", channel.group);
      console.info("Services connection init", new Date());
      this.appCtxServices.onready.subscribe((ev) => {
        let serviceHub = this.appCtxServices.getItem(this.serviceHubName) || undefined;
        if (typeof serviceHub==="undefined") this.appCtxServices.setItem(this.serviceHubName,[]);
        this.appCtxServices.on(this.serviceHubName, this.onServiceHubChange.bind(this));
        setTimeout(()=>{this.onServiceHubChange({value:serviceHub,data:serviceHub});},1000);
        resolve();
        /** clear cache**/
        setInterval(()=>{
           if (this.users.size==1) {
            let serviceHub1 = this.appCtxServices.getItem(this.serviceHubName);
            let tnp = serviceHub.filter(s=>{
               if (s.indexOf(this.users.get("me").agentid)==-1) return true;
            })
            if (tnp.length>0) {
              serviceHub = serviceHub.filter(s=>{
                if (s.indexOf(this.users.get("me").agentid)!=-1) return true;
              })  
              this.appCtxServices.setItem(this.serviceHubName,serviceHub)
            }
            log.debug("serviceHub",serviceHub1)
           }
        },25000)
        });

      })
    })
  }
  onServiceHubChange(evt){
    log.debug("Service change",evt);
     evt.value.forEach((k)=>{
        if (this.servicesSubs.map(x=>{return x.name}).indexOf(k)!=-1) this.appCtxServices.on(k,this.onServiceChange.bind(this));
    });
    setTimeout(()=>{this.serviceObserver.next({event:"update",data:evt});},2500);
  }
  onServiceChange(evt){
    log.debug("data change",evt);
    this.servicesSubs.forEach((subs)=>{
        if (subs.name === evt.key){
          if (evt.value.io==subs.io) subs.cb(evt);
        }
    });

  }
  subscribeToService(name,cb,io){
    let exists = this.servicesSubs.find(x=>{
        if (x.name == name && io == x.io) return true;
    })
    if (!exists) this.servicesSubs.push({name:name,cb:cb,io:io});
   
  }
  publishService(name){
    let service = name;
    let services = this.appCtxServices.getItem(this.serviceHubName) || [];
    if (services.indexOf(name) === -1) services.push(name);
    this.appCtxServices.setItem(this.serviceHubName,services);
  }
  unPublishService(name){
    let services = this.appCtxServices.getItem(this.serviceHubName) || [];
    services = services.filter((n)=>{
       return n !== name;
    });
    this.appCtxServices.setItem(this.serviceHubName,services);
  }
  cleanServiceHub(name){
    return this.appCtxServices.setItem(this.serviceHubName,[]);
  }
  sendServiceData(serviceName,data){
    this.appCtxServices.setItem(serviceName,data);
  }
  getServices(name){
    return this.appCtxServices.getItem(this.serviceHubName) || [];
  }
  getAgentKeys(key) {
    return this.users.get(key);
  }
  onAgentChange(chg) {

    if (!this.userObserver) {
      console.warn("There is not subscribed to receive agent change");
      return -1;
    }
    if (chg.agentid == "debugger") return;
    if (chg.agentContext) {
      if (!this.existsAgent(chg.agentid)) {

        if (this.appCtx.getAgents().self.agentid === chg.agentid) {
          let user = this.users.get("me");
          user.agentid = chg.agentid;
          user.context = chg.agentContext;
        }
        else {
          this.users.set(chg.agentid, new User(chg.agentid, chg.agentid, '', {}));
          let user = this.users.get(chg.agentid);
          user.context = chg.agentContext;
        }
        this.userObserver.next({ evt: EVENT.AGENT_JOIN, type: "agentChange", data: chg });
        this.eventLogs[chg.agentContext.agentid] = [];
      }

      if (chg.diff.keys.length > 0) {
        chg.diff.keys.forEach((key) => {
          if (this.eventLogs[chg.agentContext.agentid].indexOf(key) == -1) {
            this.enableInstrument([key], chg.agentContext, chg, this.master);
            this.userObserver.next({ evt: EVENT.AGENT_CHANGE, type: "agentChange", data: chg });
            this.eventLogs[chg.agentContext.agentid].push(key);
          }

        })
      }


    }
    else {
      this.users.delete(chg.agentid);
      this.userObserver.next({ evt: EVENT.AGENT_LEFT, data: chg })

    }

  }
  onAgentPrivChange(chg) {
    log.debug("Priv agent change", chg);
    if (!this.userPrivObserver) {
      console.warn("There is not subscribed to receive agent change");
      return -1;
    }
    if (chg.agentid == "debugger") return;
    if (chg.agentContext) {
      if (!this.existsAgent(chg.agentid, true)) {

        if (this.appCtxPriv.getAgents().self.agentid === chg.agentid) {
          let user = this.users_priv.get("me");
          user.agentid = chg.agentid;
          user.context = chg.agentContext;
        }
        else {
          this.users_priv.set(chg.agentid, new User(chg.agentid, chg.agentid, '', {}));
          let user = this.users_priv.get(chg.agentid);
          user.context = chg.agentContext;
        }
        this.userPrivObserver.next({ evt: EVENT.AGENT_JOIN, type: "agentChange", data: chg });

      }

      if (chg.diff.keys.length > 0) {


        this.enablePrivInstrument(chg.diff.keys, chg.agentContext, chg, this.master);
        this.userPrivObserver.next({ evt: EVENT.AGENT_CHANGE, type: "agentChange", data: chg });

      }


    }
    else {
      this.users_priv.delete(chg.agentid);
      this.userPrivObserver.next({ evt: EVENT.AGENT_LEFT, data: chg })

    }

  }
  onAppAttrChange(chg) {
    if (!this.appObserver) {
      log.warn("There is not subscribed to receive agent change");
      return -1;
    }
    this.appData[chg.key] = chg.value;
    this.appObserver.next({ type: "appAttrChange", key: chg.key, data: chg });
  }
  onNewAppAttr(chg) {
    if (this.appCtx.keys().indexOf(chg.key) === -1) this.subscribe(chg.key);
    this.onAppAttrChange(chg)
  }
  use(rule, options) {
    this.ruleEngineEnabled = true;
    this.rules = this.rules || [];
    this.rules.push({ name: rule.name, cb: rule(this), options: options });
  }
  ui(cb,options) {
    if (cb)
      this._ui.subscribe(cb,options);
    else return this._ui;
  }
  transitions(plugin){
    this.transitionsCbs.push({plugin:plugin,enable:true});
    return plugin;
  }
  removeTransition(name){
    this.transitionsCbs = this.transitionsCbs.filter((pg)=>{
       if (pg.plugin.name !== name) return true;
       return false;
    })
  }
  disableTransitions(){
      this.transitionsCbs.forEach((tr)=>{
          tr.enable = false;
      })
  }
  enableTransition(name){
    this.transitionsCbs.forEach((tr)=>{
      if (tr.plugin.name ==name )tr.enable = true;
  })
  }
  disableTransition(name){
    this.transitionsCbs.forEach((tr)=>{
      if (tr.plugin.name ==name )tr.enable = false;
  })
  }
  updateComponentStatus(agentid,comp,value){
      let cpmStatus = this.getUserContextData(agentid,'componentsStatus');
      if (cpmStatus && cpmStatus.componentsStatus.length>0){
          let cmp = cpmStatus.componentsStatus.find((x)=>{
                if (x.cmp == comp) return true;
          })
          if (cmp){
             if (typeof cmp.usrCmd =="undefined") cmp.usrCmd = [];
             let cmds = cmp.usrCmd.map((c=>{
                return c.cmd;
             }));
             if (cmds.indexOf(value.cmd)!=-1)
                  cmp.usrCmd = cmp.usrCmd.filter((c)=>{
                      if (c.cmd == value.cmd) return false;
                  })
             cmp.usrCmd.push(value);
            if (agentid === this.getMyAgentId()) agentid = "me";
             cpmStatus.from = this.getMyAgentId();
             this.users.get(agentid).context.setItem("componentsStatus",cpmStatus);
          }
      }
  }
  updateUserData(user, key, value) {
    let data = this.getUserContextData(user, "userData") == "undefined"? {}:this.getUserContextData(user, "userData");
    if (data && typeof value != "string" && typeof value != "boolean")
      for (let d in value) {
        data[d] = value[d];
      }
    else if (typeof value === "string" || typeof value == "boolean") {
      data[key] = value;
    }
    else data = value;
    if (user == this.getMyAgentId() && this.getMyAgentId()!=="debugger") this.users.get('me').context.setItem("userData", data);

    else this.users.get(user).context.setItem("userData", data);
  }

  setUserContextData(user, key, value) {
    let data = this.getUserContextData(user, key);
    if (typeof data !=="undefined" && data!=="undefined" && typeof(data)!="string")
      for (let d in value) {
        data[d] = value[d];
      }
    else data = value;
    if (user == this.getMyAgentId() && this.getMyAgentId()!=="debugger") this.users.get('me').context.setItem(key, data);
    else this.users.get(user).context.setItem(key, data);
  }
  getUserContextData(user, key) {
    if (user == this.getMyAgentId() &&this.getMyAgentId()!=="debugger") return this.users.get('me').context.getItem(key);

    else
      return this.users.get(user).context.getItem(key) || {};
  }

  getUsers() {
    return JSON.stringify(Array.from(this.users.entries()));
  }
  getUsersForRules(){
      let userMap = new Map();
      for (const [key, value] of this.users.entries()) {
        if (this.users.get(key).profile!="controller") userMap.set(key,value);
      }
      return userMap;
  }
  getPrivateUsers() {
    return JSON.stringify(Array.from(this.users_priv.entries()));
  }
  getAppData() {
    return JSON.stringify(this.appData);
  }
  getUsersByProfile() {
    //this.appCtx.getAgents().self.agentid
  }
  data(name, script, args) {
    var x = setInterval(() => {
      if (this.appCtx && this.appCtx.me) {
        clearInterval(x);
        this.appCtx.me.load(script(args[0]));
      }
    }, 5)



  }
  isInteracive(agentid){
    if (this.getMyAgentId()==="debugger") return false;
    else if (this.getMyAgentId()== agentid)
          if (this.isRuleEngineEnable()) return false;
          else return true;

  }
  isRuleEngineEnable(){
    return this.rulesEnabled;
  }
  existsAgent(agid, priv) {
    if (this.getMyAgentId()== "debugger" || this.rulesEnabled===false){
        return this.users.get(agid) !== undefined;
    }
    else {
        if (priv && priv == true) return (this.users_priv.get(agid) !== undefined || (this.appCtxPriv.me.agentid === this.users_priv.get('me').agentid));
        else {
          return (this.users.get(agid) !== undefined || (this.appCtx.me.agentid === this.users.get('me').agentid));

        }
    }
  }
  setAppAttribute(key, value) {
    if (this.appCtx.keys().indexOf(key) === -1) this.subscribe(key);
    if (typeof value === "object") value.timestamp = new Date().getTime();
    this.appCtx.setItem(key, value);
  }
  getAppAttribute(key) {
    return this.appCtx.getItem(key);
  }
  subscribe(key) {
    this.appCtx.on(key, this.onAppAttrChange.bind(this))
  }
  resolveConflict(deploys) {
    var maxPriority = 0, result = null;

    for (var i = 0; i < deploys.length; i++) {
      if (deploys[i].priority >= maxPriority) {
        maxPriority = deploys[i].priority;
        if (result === null)
          result = deploys[i].decision;
        else {
          result.forEach( (c) => {
            deploys[i].decision.forEach((c2) =>{
              if (c.cmp === c2.cmp) {
                c.show = c2.show;
                if (typeof c2.usrCmd !="undefined"){
                   c.usrCmd = c2.usrCmd;
                }
              }
            })
          });
        }
      }
    }
    if (result) {
      result.forEach((c) => {
        if (c.show === true) document.getElementById(c.cmp).style.display = "block";
        else document.getElementById(c.cmp).style.display = "none";
      });
      if (this.users.get("me") && this.users.get("me").context) this.setUserContextData(this.users.get("me").agentid, "componentsStatus", {componentsStatus:result,from:this.users.get("me").agentid});
    }
  }
  resolveConflictLocally(deploys) {
    var maxPriority = 0, result = null;

    for (var i = 0; i < deploys.length; i++) {
      if (deploys[i].priority >= maxPriority) {
        maxPriority = deploys[i].priority;
        if (result === null)
          result = deploys[i].decision;
        else {
          result.forEach( (c) => {
            deploys[i].decision.forEach((c2) =>{
              if (c.cmp === c2.cmp) {
                c.show = c2.show;
                if (typeof c2.usrCmd !="undefined"){
                   c.usrCmd = c2.usrCmd;
                }
              }
            })
          });
        }
      }
    }
    if (result) {
      result.forEach((c) => {
        if (c.show === true) document.getElementById(c.cmp).style.display = "block";
        else document.getElementById(c.cmp).style.display = "none";
      });
      if (this.users.get("me") && this.users.get("me").context) this.setUserContextData(this.users.get("me").agentid, "componentsStatus", {componentsStatus:result,from:"me"});
    }
  }
  getUserObservable() { return this.userObservable };
  me() {
    return this.appCtx.me;
  }
  getMyAgentId() {
    if (this.debugger) return "debugger";
    else return this.users.get('me').agentid;
  }
  enableInstrument(cap, context, chg, master) {
    cap.forEach((_cap) => {
      context.on(_cap, (k, v) => {
        if (context.agentid == this.appCtx.getAgents().self.agentid) {
          let user = this.users.get('me');
          user[k] = v;
          log.debug("me", user);
          this.userObserver.next({ evt: EVENT.CAP_CHANGE, data: { "agentid": context.agentid, "key": k, "value": v } })

        }
      })
    });
    if (master === true || master === undefined) {
      cap.forEach((_cap) => {
        context.on(_cap, (k, v) => {

          let user = '';

          if (context.agentid == this.appCtx.getAgents().self.agentid)
            user = this.users.get('me');
          else
            user = this.users.get(context.agentid);
          user.capacities[k] = v;
          if (k === "userProfile" && v !== "supported") user.profile = v;
          if (k === "userData" && v !== "supported") {
            if (context.agentid == this.appCtx.getAgents().self.agentid)
              user = this.users.get('me');
            else
              user = this.users.get(context.agentid);
            user[k] = v;

          }
          this.userObserver.next({ evt: EVENT.CAP_CHANGE, data: { "agentid": context.agentid, "key": k, "value": v } })
        });
      })
    }
    else {
      let ind = cap.indexOf("masterSlave");
      if (ind !== -1) {
        let user = '';
        context.on(cap[ind], (k, v) => {
          if (context.agentid == this.appCtx.getAgents().self.agentid)
            user = this.users.get('me');
          else
            user = this.users.get(context.agentid);
          user.capacities[k] = v;
          this.userObserver.next({ evt: EVENT.CAP_CHANGE, data: { "key": k, "value": v } })
          if (k === "masterSlave" && v === true) {

            context.keys().forEach((_cap) => {
              context.on(_cap, (k, v) => {
                let user = '';

                if (context.agentid == this.appCtx.getAgents().self.agentid)
                  user = this.users.get('me');
                else
                  user = this.users.get(context.agentid);
                user.capacities[k] = v;
                this.userObserver.next({ evt: EVENT.CAP_CHANGE, data: { "agentid": context.agentid, "key": k, "value": v } });
              })
            })
          }
          if (k === "userProfile" && v !== "supported") {
            if (context.agentid == this.appCtx.getAgents().self.agentid)
              user = this.users.get('me');
            else
              user = this.users.get(context.agentid);
            user.profile = v;

          }
          if (k === "userData" && v !== "supported") {
            if (context.agentid == this.appCtx.getAgents().self.agentid)
              user = this.users.get('me');
            else
              user = this.users.get(context.agentid);
            user[k] = v;

          }


        });
      }
    }
  }
  enablePrivInstrument(cap, context, chg, master) {
    cap.forEach((_cap) => {
      context.on(_cap, (k, v) => {
        let user = '';

        if (context.agentid == this.appCtxPriv.getAgents().self.agentid)
          user = this.users_priv.get('me');
        else
          user = this.users_priv.get(context.agentid);
        user.capacities[k] = v;
        this.userPrivObserver.next({ evt: EVENT.CAP_CHANGE, data: { "agentid": context.agentid, "key": k, "value": v } })
      });
    })


  }
  syncObjects(obj, channel, server) {
    let motion = new Motion(server || this.options.url, channel);
    motion.start();
    let ctrl = motion.addObject(obj, 0);
    return ctrl;
  }

  enableSequencer(obj, channel, server) {
    let motion = new Motion(server || this.options.url, channel);
    motion.start();
    let ctrl = motion.addObject(obj, 0);
    let promise = new Promise((resolve, reject) => {
      let timer =
      setTimeout(() => {
        reject("timeout enable sequencer");
      }, 8000);
      motion.addEventListener('motionReady', (evt) => {
        resolve("ready");
        clearInterval(timer);
        log.debug("MOTION SOCKET READY");
        evt.target = {currentTime:evt.value};
        this.timeObserver.next(evt);
        ctrl.addEventListener('timeupdate', (e) => {
          this.timeObserver.next(e);
        })
      })

    })
    this.sequencer = ctrl;
    ctrl.ready = promise;
    return ctrl;
  }
  getSequencer(){
    return this.sequencer;
  }
  enableQRcode(el) {
    let server = this.options.url.slice(0, -1);
    URI.shortURL(server, location.protocol + "//" + location.host + "/?master=" + this.master + "&group=" + this.privGroup).then((_url) => {
      log.debug("SHORTURL", _url.response);
      let cont = document.createElement('div');
      document.querySelector(el).appendChild(cont);
      new QRCode(cont, {
        text: _url.response,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
      let anchor = document.createElement('a');
      anchor.href = _url.response;
      anchor.innerHTML = _url.response;
      cont.appendChild(anchor);
    })
  }
  addDebugger(session) {
    let iframe = document.querySelector("#debugger");
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.src = "/test/context/monitor.html?agent=debugger&session=" + (session || this.options.channel);
      iframe.style = "position:absolute;top:75%;left:1%;z-index:9999;width:100%;height:30%;background:white";
      document.addEventListener("DOMContentLoaded",()=>document.body.appendChild(iframe));
    }
  }
}


export { Orkestra };
