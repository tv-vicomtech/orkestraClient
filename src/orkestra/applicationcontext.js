/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import AgentContext from './agentcontext';
import Sharedstate from './sharedstate.es6';
import { Observable, Subject } from 'rxjs';
import { Logger } from './utils/';
    // The Application context is based on a shared state object
    var ApplicationContext = function (url, options) {
        var readyObserver = new Subject();
        var readyObservable = new Observable((observer) => { readyObserver = observer });
        var log =  Logger.getLogger('ApplicationContext');

        function clone(obj) {
            if (null == obj || "object" != typeof obj) return obj;
            var copy = obj.constructor();
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
            }
            return copy;
        }
        if (!AgentContext) {
            throw "Missing flexcontrol agentContext, please load the correct js files"
        }
        var _the_self = AgentContext();

        options = options || {};
        var self = {};
        var _agents = {}; // We have a separate agent mapping of agent Context
        if (Sharedstate === undefined) {
            throw "Missing flexcontrol shared state, please include the correct js files";
        }

        var remoteAgentContext = function (__agentid) {
            var self = {};
            var _handlers = {
                "agentchange": []
            };
            self.agentid = __agentid;
            var _last_capabilities = [];

            _sharedstate.on("change", (e) =>  {
                if (e.key.indexOf("__val__" + self.agentid) == 0) {
                    // Updated values for my stuff
                    if (_handlers[e.key] && _handlers[e.key].length > 0) {
                        for (var i = 0; i < _handlers[e.key].length; i++) {
                            try {
                                _handlers[e.key][i].call(self.publicAPI, e);
                            } catch (err) {
                                log.error("Error in callback: " + what);
                            }
                        }
                    }
                }
            });

            var keys = function () {
                var meta = _sharedstate.getItem("__meta__" + self.agentid);
                if (!meta) return [];
                if(typeof(meta)=="string") meta=JSON.parse(meta);
                return meta.keys;
            };

            var capabilities = function () {
                var meta = _sharedstate.getItem("__meta__" + self.agentid);
                if (!meta) return [];
                return meta.capabilities;
            }

            var on = function (what, handler) {
                if (what == "agentchange") {
                    _handlers["agentchange"].push(handler);
                    return;
                }

                if (keys().indexOf(what) == -1) {
                    throw "Unknown parameter " + what;
                }
                var subscriptions = _sharedstate.getItem("__metasub__" + _sharedstate.agentid) || [];
                var item = self.agentid + "_" + what;

                if (subscriptions.indexOf(item) == -1) {
                    subscriptions.push(item);
                    _sharedstate.setItem("__metasub__" + _sharedstate.agentid, subscriptions);
                }
                // Remember the handler
                if (_handlers[what] === undefined) {
                    _handlers[what] = [];
                }
                _handlers[what].push(handler);

                // check if we have a value already
                var value = _sharedstate.getItem('__val__' + item);
                if (value) {
                    handler.call(self.publicAPI, what, value);
                }
            };

            var off = function (what, handler) {
                if (what == "agentchange") {
                    _handlers[what].splice(_handlers[what].indexOf(handler), 1);
                    return;
                }
                if (keys().indexOf(what) == -1) {
                    throw "Unknown parameter " + what;
                }
                var subscriptions = clone(_sharedstate.getItem("__metasub__" + _sharedstate.agentid));
                var item = self.agentid + "_" + what;

                if (subscriptions.indexOf(item) > -1) {
                    subscriptions.splice(subscriptions.indexOf(item), 1);
                    _sharedstate.setItem("__metasub__" + _sharedstate.agentid, subscriptions);
                } else {
                    throw "Not subscribed to " + what;
                }
                // TODO: Clean up _handlers[what]
                if (!_handlers[what]) {
                    log.warn("*** Warning: Missing handler for " + what);
                    return;

                }
                _handlers[what].splice(_handlers[what].indexOf(item), 1);
            };

            var update_meta = function (meta) {
                var diff = {
                    "added": {},
                    "altered": {},
                    "removed": []
                };
                for (var capability in _last_capabilities) {
                    if (meta.capabilities[capability] === undefined) {
                        diff.removed.push(capability);
                    }
                }
                for (var capability in meta.capabilities) {
                    if (_last_capabilities[capability] === undefined) {
                        diff.added[capability] = meta.capabilities[capability];
                    } else if (_last_capabilities[capability] != meta.capabilities[capability]) {
                        diff.altered[capability] = meta.capabilities[capability];
                    }
                }
                _last_capabilities = meta.capabilities;

                for (var i = 0; i < _handlers["agentchange"].length; i++) {
                    try {
                        _handlers["agentchange"][i].call(self.publicAPI, {
                            diff: diff
                        });
                    } catch (err) {
                        log.error("Error in meta-update", err);
                    }
                }
            }

            var update_value = function (_aid, _key, _value) {
                if (_handlers[_key] === undefined) {
                    return;
                }
                for (var i = 0; i < _handlers[_key].length; i++) {
                    try {
                        _handlers[_key][i].call(self.publicAPI, _key, _value);
                    } catch (err) {
                        log.error("Error in update: ", err);
                    }
                }
            };

            var setItem = function (key, value) {
                _sharedstate.setItem("__val__" + self.agentid + "_" + key, value);
            }
            var getItem = function (key) {
                return _sharedstate.getItem("__val__" + self.agentid + "_" + key);
            }
            self.update_value = update_value;
            self.handlers = _handlers;
            self.update_meta = update_meta;

            let publicAPI = {};
            publicAPI.agentid = self.agentid;
            publicAPI.keys = keys;
            publicAPI.on = on;
            publicAPI.off = off;
            publicAPI.setItem = setItem;
            publicAPI.getItem = getItem;
            publicAPI.capabilities = capabilities;


            self.publicAPI = publicAPI;

            return self;
        }


        // Handle updates
        var _sub_param2agent = [] // Remote subscriptions, parameter -> [agentid, ...]
        var _sub_agent2param = {}; // Remote agent -> [parameter, ...]
        var _sub_param2handler = {};
        var _currentAgentState = {}; // For diffs
        var _last_capabilities = {}; // For annouce diffs
        var _globalVars = {}; // For the global variables

        var _update_subscriptions = function (_aid2, _subs) {
            if (getAgent(_aid2) == undefined) {
                log.warn("Subscription update for unknown node", _aid2);
                setTimeout(()=>{
                  if (getAgent(_aid2) !== undefined){
                  _update_subscriptions(_aid2, _subs)
                  _subs = _subs || _sharedstate.getItem("__metasub__" + _aid2);
                  if (!_subs) {
                      return;
                  }
                  var handlers = getAgent(_aid2).handlers;
                  var thesubs = _sub_agent2param[_aid2] || [];
                  for (var i = 0; i < _subs.length; i++) {
                      var target_agent = _subs[i].substr(0, _subs[i].indexOf("_"));
                      var target_param = _subs[i].substr(_subs[i].indexOf("_") + 1);
                      if (target_agent === _sharedstate.agentid) {
                          // See if this agent already subscribes to my parameter, otherwise add it
                          if (thesubs.indexOf(target_param) > -1) {
                              // Aready subscribed to this one
                              continue;
                          }
                          if (_sub_param2agent[target_param] === undefined) {
                              _sub_param2agent[target_param] = [];
                          }
                          _sub_param2agent[target_param].push(_aid2);
                          if (!_sub_param2handler[target_param] || _sub_param2handler[target_param].length == 0) {
                              _sub_param2handler[target_param] = function (e) {
                                  _sharedstate.setItem("__val__" + _sharedstate.agentid + "_" + e.key, e.value);
                              }
                          }
                          _the_self.on(target_param, _sub_param2handler[target_param]);
                      }
                  }
                  // see if there was an unsubscribe
                  for (var i = 0; i < thesubs.length; i++) {
                      if (_sub_param2agent.indexOf(thesubs[i]) == -1) {
                          var target_agent = thesubs[i].substr(0, thesubs[i].indexOf("_"));
                          var target_param = thesubs[i].substr(thesubs[i].indexOf("_") + 1);
                          if (target_agent != _sharedstate.agentid) {
                              continue;
                          }
                          if (_sub_param2agent[target_param] != undefined) {
                              _sub_param2agent[target_param].splice(_sub_param2agent[target_param].indexOf(thesubs[i]), 1);
                              if (_sub_param2agent[target_param].length == 0) {
                                  // Only unsub if no more agents listen to this
                                  // TO CHECK IT: OFF  WITHOUT REASON
                                  //_the_self.off(target_param, _sub_param2handler[target_param]);
                              }
                          } else {
                              log.warn(" *** Warning, unsub but don't have handler");
                          }
                          // TODO: Clean up if nobody uses it any more
                          // if _sub_param2agent[target_param].length == 0
                      }
                  }
                  _sub_agent2param[_aid2] = _subs;
                }

                },0);
                return;
            }
            _subs = _subs || _sharedstate.getItem("__metasub__" + _aid2);
            if (!_subs) {
                return;
            }
            var handlers = getAgent(_aid2).handlers;
            var thesubs = _sub_agent2param[_aid2] || [];
            for (var i = 0; i < _subs.length; i++) {
                var target_agent = _subs[i].substr(0, _subs[i].indexOf("_"));
                var target_param = _subs[i].substr(_subs[i].indexOf("_") + 1);
                if (target_agent === _sharedstate.agentid) {
                    // See if this agent already subscribes to my parameter, otherwise add it
                    if (thesubs.indexOf(target_param) > -1) {
                        // Aready subscribed to this one
                        continue;
                    }
                    if (_sub_param2agent[target_param] === undefined) {
                        _sub_param2agent[target_param] = [];
                    }
                    _sub_param2agent[target_param].push(_aid2);
                    if (!_sub_param2handler[target_param] || _sub_param2handler[target_param].length == 0) {
                        _sub_param2handler[target_param] = function (e) {
                            _sharedstate.setItem("__val__" + _sharedstate.agentid + "_" + e.key, e.value);
                        }
                    }
                    _the_self.on(target_param, _sub_param2handler[target_param]);
                }
            }
            // see if there was an unsubscribe
            for (var i = 0; i < thesubs.length; i++) {
                if (_sub_param2agent.indexOf(thesubs[i]) == -1) {
                    var target_agent = thesubs[i].substr(0, thesubs[i].indexOf("_"));
                    var target_param = thesubs[i].substr(thesubs[i].indexOf("_") + 1);
                    if (target_agent != _sharedstate.agentid) {
                        continue;
                    }
                    if (_sub_param2agent[target_param] != undefined) {
                        _sub_param2agent[target_param].splice(_sub_param2agent[target_param].indexOf(thesubs[i]), 1);
                        if (_sub_param2agent[target_param].length == 0) {
                            // Only unsub if no more agents listen to this
                            // TO CHECK IT: OFF  WITHOUT REASON
                            //_the_self.off(target_param, _sub_param2handler[target_param]);
                        }
                    } else {
                        log.warn(" *** Warning, unsub but don't have handler");
                    }
                    // TODO: Clean up if nobody uses it any more
                    // if _sub_param2agent[target_param].length == 0
                }
            }
            _sub_agent2param[_aid2] = _subs;
        }

        var _update_value = function (_aid, _key, _val) {
            var ra = getAgent(_aid);
            if (ra) {
                ra.update_value(_aid, _key, _val);
            }
        }

        var _cbs = [];
        var _globalCbs = [];
        var on = function (what, handler) {
            if (what == "agentchange") {
                _cbs.push(handler);
            } else {
                if (!_globalCbs[what]) {
                    _globalCbs[what] = [];
                }
                _globalCbs[what].push(handler);
            }

        }

        var off = function (what, handler) {
            if (what == "agentchange") {
                if (_cbs.indexOf(handler) == -1) {
                    throw "Handler not registered";
                }
                _cbs.splice(_cbs.indexOf(handler), 1);
            } else {
                if (_globalCbs[what].indexOf(handler) == -1) {
                    throw "Handler not registered";
                }
                _globalCbs[what].splice(_globalCbs[what].indexOf(handler), 1);
            }

        }


        var _doCallbacks = function (what, e) {
            if (what == "agentchange") {
                if (!e.agentContext) {
                    delete _currentAgentState[e.agentid];
                    log.info(_currentAgentState);
                } else if (_currentAgentState[e.agentid] == undefined) {
                    _currentAgentState[e.agentid] = {
                        capabilities: {},
                        keys: []
                    };
                }

                // Create diff
                e.diff = {
                    capabilities: {},
                    keys: []
                };
                if (e.agentContext) {

                    var cs = e.agentContext.capabilities();
                    for (var c in cs) {
                        if (cs.hasOwnProperty(c)) {
                            if (!_currentAgentState[e.agentid].capabilities) {
                                _currentAgentState[e.agentid].capabilities = {};
                            }
                            if (_currentAgentState[e.agentid].capabilities[c] != cs[c]) {
                                e.diff.capabilities[c] = cs[c];
                            }
                        }
                    }
                    // Also check keys
                    var keys = e.agentContext.keys()
                    for (var i = 0; i < keys.length; i++) {
                        if (_currentAgentState[e.agentid].keys.indexOf(keys[i]) == -1) {
                            e.diff.keys.push(keys[i]);
                        }
                    }

                    _currentAgentState[e.agentid] = {
                        capabilities: cs,
                        keys: keys
                    };

                }
                for (var i = 0; i < _cbs.length; i++) {
                    try {
                        _cbs[i].call(self, e);
                    } catch (err) {
                        log.error("Error in agentchange callback: ", err);
                        log.error("cb:", _cbs[i]);
                    }
                }
            } else {
                for (var i = 0, len = _globalCbs[what].length; i < len; i++) {
                    try {
                        _globalCbs[what][i].call(self, e);
                    } catch (err) {
                        log.error("Error in agentchange callback: ", err);
                        log.error("cb:", _globalCbs[what][i]);
                    }
                }
            }

        };

        options.autoPresence = true;

        var __ready = false;
        var _sharedstate = Sharedstate(url, options)
            .on("readystatechange", function (s) {
                if (s === _sharedstate.STATE.OPEN) {
                    readyObserver.next("ready");
                    __ready = true;
		    // Register
                    let meta = {
                        keys: _the_self.keys(),
                        capabilities: _the_self.capabilities()
                    };

                    _sharedstate.setItem("__meta__" + _sharedstate.agentid, meta);
                    _sharedstate.setItem("__metasub__" + _sharedstate.agentid, []);
                    _sharedstate.setPresence("online");

                    // Also check for new parameters being added
                    // ABosl - moved here to only test if _sharedstate == open
                    _the_self.on("keychange", function (e) {
                        // Update my meta description too
                        var meta = {
                            keys: _the_self.keys(),
                            capabilities: _the_self.capabilities()
                        };
                        _sharedstate.setItem("__meta__" + _sharedstate.agentid, meta);
                    });

                    _sharedstate.on("presence", function (event) {

                        var _agentid = event.key;
                        var _state = event.value;
                        if (event.value == "offline") {
                            if (_agents.hasOwnProperty(_agentid)) {
                                // Clean up this node

                                _agents[_agentid] = null;
                                delete _agents[_agentid];
                                _doCallbacks("agentchange", {
                                    agentid: _agentid,
                                    agentContext: null
                                });

                            }
                            // TODO: Also clean up other state that should be removed?
                            /*
                            if (options.autoremove == true) {
                              this.removeItem("__meta__" + _agentid)
                              this.removeItem("__metasub__" + _agentid)
                              this.delAgent(_agentid);
                            }
                            */

                        } else {
                            if (event.value == "online") {
                                if (!_agents[_agentid]) {
                                    _agents[_agentid] = remoteAgentContext(_agentid);
                                }

                                var diff = {
                                    "added": {},
                                    "altered": {},
                                    "removed": []
                                };
                                var new_capabilities = _agents[_agentid].publicAPI.capabilities();
                                if (_last_capabilities[_agentid] != undefined) {
                                    for (var capability in _last_capabilities[_agentid]) {
                                        log.debug(capability);
                                        if (new_capabilities[capability] === undefined) {
                                            diff.removed.push(capability);
                                        }
                                    }
                                } else {
                                    _last_capabilities[_agentid] = [];
                                }

                                for (var capability in new_capabilities) {
                                    if (_last_capabilities[_agentid][capability] === undefined) {
                                        diff.added[capability] = new_capabilities[capability];
                                    } else if (_last_capabilities[_agentid][capability] != new_capabilities[capability]) {
                                        diff.altered[capability] = new_capabilities[capability];
                                    }
                                }

                                _last_capabilities[_agentid] = new_capabilities;
                                let inter = setInterval(()=>{
                                    if (getAgent(_agentid) != undefined){
                                         clearInterval(inter);
                                        _update_subscriptions(_agentid);
                                        _doCallbacks("agentchange", {
                                            agentid: _agentid,
                                            agentContext: _agents[_agentid].publicAPI,
                                            diff: diff
                                        });
                                    }



                            },15);
                            }

                        }
                        //_agents[_agentid].
                    })
                }
            })
            .on("change", function (e) {
                if (e.key.indexOf("__meta__") > -1) {
                    var _agentid = e.key.substr(8);
                    var a = _agents[_agentid];
                    if (a) {
                        a.update_meta(e.value);
                        _doCallbacks("agentchange", {
                            agentid: _agentid,
                            agentContext: _agents[_agentid].publicAPI
                        });
                    } else {
                        if (options.autoremove == true) {
                            _sharedstate.removeItem("__meta__" + _agentid);
                            _sharedstate.removeItem("__metasub__" + _agentid);
                        }
                    }
                } else if (e.key.indexOf("__metasub__") > -1) {
                    let _agentid = e.key.substr(11);

                      let inter2 = setInterval(()=>{
                        if (getAgent(_agentid)!=undefined){
                            clearInterval(inter2);
                            _update_subscriptions(_agentid, e.value);
                        }
                    },15)





                } else if (e.key.indexOf("__val__") > -1) {
                    var x = e.key.substr(7).split("_");
                    x.splice(x.length-1);
                    let _agentid = x.join("_");
                    x = e.key.substr(7).split("_");
                    var _key = x.splice(x.length-1)[0];
                    _update_value(_agentid, _key, e.value);

		} else if (e.key.indexOf('__global__') > -1) {
                    log.debug('globalVar', e.key, e.value);
                    var _what = e.key.substr(10);
                    if (_globalCbs[_what]) {
                        _doCallbacks(_what, {
                            key: _what,
                            value: e.value
                        });
                    } else {
                        const [newAppAttrCallback] = _globalCbs['default']
                        newAppAttrCallback.call(self, {
                            key: _what,
                            value: e.value
                        });
                    }
                } else {
                    log.warb("Unknown Change:" + JSON.stringify(e));
                }
            });




        var getAgent = function (aid) {
            return _agents[aid];
        }

        var getAgents = function () {
            if (_agents[_sharedstate.agentid] == undefined) {
                _agents[_sharedstate.agentid] = remoteAgentContext(_sharedstate.agentid);
            }
            var agents = {
                self: _agents[_sharedstate.agentid].publicAPI
            };
            for (var a in _agents) {
                if (a == _sharedstate.agentid) continue;
                if (_agents[_sharedstate.agentid]) {
                    agents[a] = _agents[a].publicAPI;
                }
            }
            return agents;
        }
        var _ready = function (){

          return  __ready;
        }
        var addAgent = function(agent) {
          // TODO: Check argument!
          if (_agents[agent.agentid] != undefined) {
            throw new Error("Already have agent '" + agent.agentid + "'");
          }
          _agents[agent.agentid] = agent;
          _doCallbacks("agentchange", {
            agentid: agent.agentid,
            agentContext: agent,
            diff: {"added":agent.capabilities()}
          });
        };

        var removeAgent = function(agent) {
          if (_agents[agent.agentid] != agent) {
            throw new Error("Failed to remove agent '" + agent.agentid + "'");
          }
          delete _agents[agent.agentid];
          _doCallbacks("agentchange", {
              agentid: agent.agentid,
              agentContext: null
          });
        };


        var setItem = function (key, value) {
            if (typeof key !="undefined" && typeof value!="undefined") {
                _sharedstate.setItem('__global__' + key, value);
            }
        };

        var getKeys = function () {
            var allKeys = _sharedstate.keys();
            var globalVars = [];
            for (var i = 0, len = allKeys.length; i < len; i++) {
                if (allKeys[i].indexOf('__global__') > -1) {
                    globalVars.push(allKeys[i].substr(10));
                }
            }
            return globalVars;
        };

        var getItem = function (key) {
            return _sharedstate.getItem('__global__' + key);
        };

        // API
        self.getAgents = getAgents;
        self.on = on;
        self.off = off;
        self.me = _the_self;
        self.ready = _ready;
        //API for Global Variables
        self.setItem = setItem;
        self.getItem = getItem;
        self.keys = getKeys;
        self.onready = readyObservable;
        // API for locally discovered agents - should only be used for node discovery frameworks
        self.addAgent = addAgent
        self.removeAgent = removeAgent;
        return self;
    }

export {ApplicationContext};
