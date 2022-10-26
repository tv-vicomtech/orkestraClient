/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import { Janus } from './janus.js';

var JanusScreenShare = function (dom, janusServer, room) {
    let server = null
    if (window.location.protocol === 'http:') {
	    server = "ws://" + (janusServer || window.location.hostname) + ":8188/janus";
	}
	else {
			server = "wss://" + (janusServer || window.location.hostname) + ":8989/janus";
	}
    var janus = null;
    var screentest = null;
    var opaqueId = "screensharing-" + Janus.randomString(12);

    var myusername = null;
    var myid = null;

    var capture = null;
    var role = null;
    var room = room || 1234;
    var source = null;

    var spinner = null;


    // Just an helper to generate random usernames
    function randomString(len, charSet) {
        charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var randomString = '';
        for (var i = 0; i < len; i++) {
            var randomPoz = Math.floor(Math.random() * charSet.length);
            randomString += charSet.substring(randomPoz, randomPoz + 1);
        }
        return randomString;
    }


    function init(aid, _options) {
        // Initialize the library (all console debuggers enabled)
        const { debug } = _options
        Janus.init({
            debug: debug, callback: function () {
                // Use a button to start the demo
             
                    // Make sure the browser supports WebRTC
                    if (!Janus.isWebrtcSupported()) {
                        alert("No WebRTC support... ");
                        return;
                    }
                    // Create session
                    janus = new Janus(
                        {
                            server: server,
                            success: function () {
                                // Attach to VideoRoom plugin
                                janus.attach(
                                    {
                                        plugin: "janus.plugin.videoroom",
                                        opaqueId: opaqueId,
                                        success: function (pluginHandle) {
                                           
                                            screentest = pluginHandle;
                                            debug && console.log("Plugin attached! (" + screentest.getPlugin() + ", id=" + screentest.getId() + ")");
                                        },
                                        error: function (error) {
                                            Janus.error("  -- Error attaching plugin...", error);
                                            bootbox.alert("Error attaching plugin... " + error);
                                        },
                                        consentDialog: function (on) {
                                        },
                                        iceState: function (state) {
                                            Janus.log("ICE state changed to " + state);
                                        },
                                        mediaState: function (medium, on) {
                                            Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
                                        },
                                        webrtcState: function (on) {
                                            Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");

                                        },
                                        onmessage: function (msg, jsep) {
                                            Janus.debug(" ::: Got a message (publisher) :::", msg);
                                            var event = msg["videoroom"];
                                            Janus.debug("Event: " + event);
                                            if (event) {
                                                if (event === "joined") {
                                                    myid = msg["id"];
                                                    Janus.log("Successfully joined room " + msg["room"] + " with ID " + myid);
                                                    if(role === "publisher") {
                                                        // This is our session, publish our stream
                                                        Janus.debug("Negotiating WebRTC stream for our screen (capture " + capture + ")");
                                                        screentest.createOffer(
                                                            {
                                                                media: { video: "screen", audioSend: false, videoRecv: false,audioRecv:false,recvonly:false},	// Screen sharing Publishers are sendonly
                                                                success: function(jsep) {
                                                                    Janus.debug("Got publisher SDP!");
                                                                    Janus.debug(jsep);
                                                                    let message = { 
                                                                        "request": "configure", 
                                                                        "audio": false, 
                                                                        "video": true,
                                                                        "bitrate":_options.bitrate
                                                                    };
                                                                    if (!!_options.filename) {
                                                                        message = Object.assign(message, { filename: _options.filename })
                                                                    }
                                                                    screentest.send({"message": message, "jsep": jsep});
                                                                },
                                                                error: function(error) {
                                                                    Janus.error("WebRTC error:", error);
                                                                    bootbox.alert("WebRTC error... " + JSON.stringify(error));
                                                                }
                                                            });
                                                    }
                                            else {
                                                        // We're just watching a session, any feed to attach to?

                                                    }
                                                } else if (event === "event") {
                                                    // Any feed to attach to?
                                                    if (role === "listener" && msg["publishers"]) {

                                                    } else if (msg["leaving"]) {
                                                        // One of the publishers has gone away?
                                                        var leaving = msg["leaving"];

                                                    } else if (msg["error"]) {
                                                        console.warn(msg["error"]);
                                                    }
                                                }
                                            }
                                            if(jsep) {
                                                Janus.debug("Handling SDP as well...", jsep);
                                                screentest.handleRemoteJsep({ jsep: jsep });
                                            }

                                        },
                                        onlocalstream: function (stream) {

                                        },
                                        onremotestream: function (stream) {
                                            // The publisher stream is sendonly, we don't expect anything here
                                        },
                                        oncleanup: function () {
                                            debug && console.log(" ::: Got a cleanup notification :::");
                                        }
                                    });
                            },
                            error: function (error) {
                                console.error(error);

                            },
                            destroyed: function () {}
                        });
                        setTimeout(()=>{shareScreen(aid);},1000);
                
            }
        });
    }





    function shareScreen(aid) {
        // Create a new room
        let desc = "screen sharing";
        role = "publisher";
        let register = { "request": "join", "room": room, "ptype": "publisher", "display":aid };
        let username = "flex-control";
        let myusername = "flex-control";
        screentest.send({"message": register});
    }
    function stop(){
       screentest.hangup();
       janus.destroy()
    }
    

    return {
        init: init,
        stop: stop,
        start: shareScreen
    }


}
export {JanusScreenShare};