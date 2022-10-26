/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import { reject } from 'underscore';
import {Janus} from './janus.js';

var JanusPublish = function (dom,janusServer,room){
	var server = null;
	var list = "";
	var options = {audio:true,audio:true,simulcast:true,bitrate:0,echoC:true,noiseS:true,gainC:true};
	if (window.location.protocol === 'http:') {
		server = "ws://" + (janusServer || window.location.hostname) + ":8188/janus";
	}
	else {
			server = "wss://" + (janusServer || window.location.hostname) + ":8989/janus";
	}
	var audioDeviceId = null;
	var videoDeviceId = null;
	window.noiseS = true;
	window.gainC = true;
	window.echoC= true;
	var janus = null;
	var sfutest = null;
	var opaqueId = "orkestra-"+Janus.randomString(12);

	var myroom = room || 1234;	// Demo room
	var myid = null;
	var mystream = null;
	var canvas;
	var video;
	var _stream;
	// We use this other ID just to map our subscriptions to us
	var mypvtid = null;
	var firstTime = true;
	var feeds = [];
	var bitrateTimer = [];
	var doSimulcast = (getQueryStringValue("simulcast") === "yes" || getQueryStringValue("simulcast") === "true");
	var doSimulcast2 = (getQueryStringValue("simulcast2") === "yes" || getQueryStringValue("simulcast2") === "true");

	// Initialize the library (all console debuggers enabled)
	function init (aid,_options){
		if (_options) options = _options;
		Janus.init({debug: false, callback: function() {
			// Make sure the browser supports WebRTC
			if(!Janus.isWebrtcSupported()) {
				bootbox.alert("No WebRTC support... ");
				return;
			}
			// Create session

			janus = new Janus(
				{
					server: server,
					success: function() {
						// Attach to video room test plugin
						janus.attach(
							{
								plugin: "janus.plugin.videoroom",
								opaqueId: opaqueId,
								success: function(pluginHandle) {
									sfutest = pluginHandle;
									Janus.log("Plugin attached! (" + sfutest.getPlugin() + ", id=" + sfutest.getId() + ")");
									Janus.log("  -- This is a publisher/manager");
									// Prepare the username registration
									var janusReady =new CustomEvent("JanusPublishReady", {
										detail: {
											ready: true
										}
									});
									document.dispatchEvent(janusReady);
								},
								error: function(error) {
									Janus.error("  -- Error attaching plugin...", error);
									bootbox.alert("Error attaching plugin... " + error);
								},
								consentDialog: function(on) {
					
								},
					     		mediaState: function(medium, on) {
										Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
								 },
								webrtcState: function(on) {
										Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");

								},
								onmessage: function(msg, jsep) {
										Janus.debug(" ::: Got a message (publisher) :::");

										Janus.debug(msg);
										var event = msg["videoroom"];
										Janus.debug("Event: " + event);
										if(event != undefined && event != null) {
											if(event === "joined") {
												// Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
												myid = msg["id"];
												mypvtid = msg["private_id"];
												Janus.log("Successfully joined room " + msg["room"] + " with ID " + myid);
												//publishOwnFeed(true);
												// Any new feed to attach to?
												if(msg["publishers"] !== undefined && msg["publishers"] !== null) {
													janus.list = msg["publishers"];
													Janus.debug("Got a list of available publishers/feeds:");
													Janus.debug(janus.list);
													for(var f in janus.list) {
														var id = janus.list[f]["id"];
														var display = janus.list[f]["display"];
														var audio = janus.list[f]["audio_codec"];
														var video = janus.list[f]["video_codec"];
														Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
														//		newRemoteFeed(id, display, audio, video);
													}
												}
											} else if(event === "destroyed") {
												// The room has been destroyed
												Janus.warn("The room has been destroyed!");
												bootbox.alert("The room has been destroyed", function() {
													window.location.reload();
												});
											} else if(event === "event") {
												// Any new feed to attach to?
												if(msg["publishers"] !== undefined && msg["publishers"] !== null) {
													janus.list = msg["publishers"];
													Janus.debug("Got a list of available publishers/feeds:");
													Janus.debug(janus.list);
													for(var f in janus.list) {
														var id = janus.list[f]["id"];
														var display = janus.list[f]["display"];
														var audio = janus.list[f]["audio_codec"];
														var video = janus.list[f]["video_codec"];
														Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
														//		newRemoteFeed(id, display, audio, video);
													}
												} else if(msg["leaving"] !== undefined && msg["leaving"] !== null) {
													// One of the publishers has gone away?
													var leaving = msg["leaving"];
													Janus.log("Publisher left: " + leaving);
													var remoteFeed = null;
													for(var i=1; i<6; i++) {
														if(feeds[i] != null && feeds[i] != undefined && feeds[i].rfid == leaving) {
															remoteFeed = feeds[i];
															break;
														}
													}
													if(remoteFeed != null) {
														Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
														dom.querySelector('#remote'+remoteFeed.rfindex).empty().hide();
														dom.querySelector('#videoremote'+remoteFeed.rfindex).empty();
														feeds[remoteFeed.rfindex] = null;
														remoteFeed.detach();
													}
												} else if(msg["unpublished"] !== undefined && msg["unpublished"] !== null) {
													// One of the publishers has unpublished?
													var unpublished = msg["unpublished"];
													Janus.log("Publisher left: " + unpublished);
													if(unpublished === 'ok') {
														// That's us
														sfutest.hangup();
														return;
													}
													/*
													var remoteFeed = null;
													for(var i=1; i<6; i++) {
														if(feeds[i] != null && feeds[i] != undefined && feeds[i].rfid == unpublished) {
															remoteFeed = feeds[i];
															break;
														}
													}*/
													if(remoteFeed != null) {
														Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
													//	dom.querySelector('#remote'+remoteFeed.rfindex).empty().hide();
													//	dom.querySelector('#videoremote'+remoteFeed.rfindex).empty();
														feeds[remoteFeed.rfindex] = null;
														remoteFeed.detach();
													}
												} else if(msg["error"] !== undefined && msg["error"] !== null) {
													console.error(msg);
												}
											}
										}
										if(jsep !== undefined && jsep !== null) {
											Janus.debug("Handling SDP as well...");
											Janus.debug(jsep);
											sfutest.handleRemoteJsep({jsep: jsep});
											// Check if any of the media we wanted to publish has
											// been rejected (e.g., wrong or unsupported codec)
											var audio = msg["audio_codec"];
											if(mystream && mystream.getAudioTracks() && mystream.getAudioTracks().length > 0 && !audio) {
												// Audio has been rejected
												toastr.warning("Our audio stream has been rejected, viewers won't hear us");
											}
											var video = msg["video_codec"];
											if(mystream && mystream.getVideoTracks() && mystream.getVideoTracks().length > 0 && !video) {
													console.warn("video not permited");
												}
											}
										},
										onlocalstream: function(stream) {
											Janus.debug(" ::: Got a local stream :::");
											mystream = stream;
											Janus.debug(stream);
											janus.list.push(stream);
											if (!window.portrait || window.portrait === false) Janus.attachMediaStream(dom.querySelector('#myvideo'), stream);
											if (window.showAudioInput && window.showAudioInput === true){
												let vmc = document.querySelector('webrtc-publisher').shadowRoot.querySelector('volume-meter');
												if (vmc) vmc.init(stream);
											}
										},
										onremotestream: function(stream) {
											// The publisher stream is sendonly, we don't expect anything here
										},
										oncleanup: function() {
											Janus.log(" ::: Got a cleanup notification: we are unpublished now :::");
											if (mystream) {
												mystream.getTracks().forEach(track => {
													track.stop();
												  });
												mystream = null;
											}
										}
									});
								},
								error: function(error) {
									Janus.error(error);
									
								},
								destroyed: function() {}
							});
							janus.list = [];
							setTimeout(()=>{registerUsername(aid);},1000);
						}});

	}
	function start(id){
		var feed_ = janus.list.find((f)=>{if(f.display===id) return true;});
		newRemoteFeed(feed_.id,feed_.display,feed_.audio,feed_.video);
	}
	function stop(id){
		var unpublish = { "request": "unpublish" };
	    if (sfutest) 
			try{
				sfutest.send({"message": unpublish});
			}
			catch(e){
				console.warn("Not publisher");
			}
		
	}
	function destroy(){		
		sfutest.hangup();		
        janus.destroy();
	}

	function registerUsername(aid) {
		const register = { "request": "join", "room": myroom, "ptype": "publisher", "display": aid };
		const idx = setInterval(()=>{
			if (sfutest){
				clearInterval(idx);
				sfutest.send({"message": register});
				if (!window.portrait || window.portrait === false) {
					publishOwnFeed({ useAudio: true });
				}
				else {
					if (document.querySelector('webrtc-publisher')){
						const wrp = document.querySelector('webrtc-publisher');
						canvasCapture(wrp.flags.audioinput,wrp.flags.videoinput);
					}
					else { 
						canvasCapture();
					}
				}
				sfutest.unmuteAudio();
			}
		},50);
   }




function toggleMute() {
	var muted = sfutest.isAudioMuted();
	Janus.log((muted ? "Unmuting" : "Muting") + " local stream...");
	if(muted)
	sfutest.unmuteAudio();
	else
	sfutest.muteAudio();
	muted = sfutest.isAudioMuted();

}
function changeCamera (id){
	var feed_ = janus.list.find((f)=>{if(f.display===id) return true;});
	if (handler!="") handler.detach();
	newRemoteFeed(feed_.id,feed_.display,feed_.audio,feed_.video);

}
var handler = "";
function changeDev(){
	if(firstTime) {
		firstTime = false;
		restartCapture();
		return;
	}
	restartCapture();
}
function canvasCapture(audioDeviceId, videoDeviceId) {
	cleanPreprocess()
	const wcp = document.querySelector('webrtc-publisher');
	let videoCfg;
	if (window.res) {
		const size = Janus.getSizeFromRes(window.res);
		videoCfg = {
			width: {
				ideal: size.width
			},
			height: {
				ideal: size.height
			},
			deviceId: {
				exact: videoDeviceId
			}
		}
	} else {
		videoCfg = {
			width: {
				ideal: 1280
			},
			height: {
				ideal: 720
			}
		}
	}
	navigator.mediaDevices.getUserMedia({
		audio: {
			deviceId: {
				exact: audioDeviceId
			}
		},
		video: videoCfg
	}).then((stream) => {
		// We have our video
		_stream = stream;
		video = wcp.shadowRoot.querySelector('video');
		video.srcObject = stream;
		video.muted = "muted";
		video.autoplay = true;
		video.removeEventListener('play', playHandler);
		video.addEventListener('play', playHandler);
		video.style.position = "absolute";
		video.style.opacity = 0;
		video.style.top = "0px";
		video.style.visibility="hidden";
		video.style.cssFloat = "left";
		canvas = wcp.shadowRoot.querySelector('#canvasforRotate');
		if (canvas) {
			canvas.parentNode.removeChild(canvas);
		}
		canvas = document.createElement('canvas');
		canvas.style.position = "absolute";		
		canvas.style.height = "80%";
		canvas.style.left = "25%";
		canvas.style.top = "0px";		
		canvas.id = "canvasforRotate";
		wcp.shadowRoot.appendChild(canvas);

		function loop() {
			const context = canvas.getContext('2d');
			context.drawImage(video, 0, 0, canvas.width, canvas.height);
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.save();
			context.translate(canvas.width, 0);
			context.rotate(90 * Math.PI / 180);
			context.drawImage(video, -video.width / 2, -video.height / 2);
			context.restore();
			switch (canvas.width) {
				case 1920: 
					canvas.style.zoom = 0.2;
					break;
				case 720: 
					canvas.style.zoom = 0.4;
					break;
				case 480:
				case 360:
				default:
					canvas.style.zoom = 0.8;
					break;
			}
		};
		clearInterval(window.drawLoop)
		window.drawLoop = setInterval(loop, 1000 / 24); // 24 fps
	}).catch(e => {
		alert("Not supported format");
		console.error(e);
	})
}
function playHandler(e){
	canvas.width = video.videoHeight;
	canvas.height = video.videoWidth;
	var canvasStream = canvas.captureStream();
	canvasStream.addTrack(_stream.getAudioTracks()[0]);
	var body = {
		audio: true,
		video: true
	};
	sfutest.send({
		message: body
	});
	sfutest.createOffer({
		// Add data:true here if you want to publish datachannels as well
		//media: { audioRecv: false, videoRecv: false, audioSend: _audio, videoSend: _video },	// Publishers are sendonly
		stream: canvasStream,
		media: {
			replaceAudio: true, // This is only needed in case of a renegotiation
			replaceVideo: true, // This is only needed in case of a renegotiation
		},
		// If you want to test simulcasting (Chrome and Firefox only), then
		// pass a ?simulcast=true when opening this demo page: it will turn
		// the following 'simulcast' property to pass to janus.js to true
		simulcast: false,
		simulcast2: false,
		success: function (jsep) {
			console.log("Got publisher SDP!");
			Janus.debug(jsep);
			var publish = {};
			publish = {
				"request": "configure",
				"audio": true,
				"video": true
			};
			publish["videocodec"] = "h264";
			// You can force a specific codec to use when publishing by using the
			// audiocodec and videocodec properties, for instance:
			// 		publish["audiocodec"] = "opus"
			// to force Opus as the audio codec to use, or:
			// 		publish["videocodec"] = "vp9"
			// to force VP9 as the videocodec to use. In both case, though, forcing
			// a codec will only work if: (1) the codec is actually in the SDP (and
			// so the browser supports it), and (2) the codec is in the list of
			// allowed codecs in a room. With respect to the point (2) above,
			// refer to the text in janus.plugin.videoroom.cfg for more details
			sfutest.send({
				"message": publish,
				"jsep": jsep
			});
		},
		error: function (error) {
			console.error("WebRTC error:", error);
		}
	});

}
function cleanPreprocess () {
	clearInterval(window.drawLoop);
	let wcp = document.querySelector('webrtc-publisher');
	let video = wcp.shadowRoot.querySelector('video');
	video.removeEventListener('play',playHandler);
	video.style.visibility="visible";
	video.style.position = "relative";
	video.style.opacity=1.0;
	if (wcp.shadowRoot.querySelector('#canvasforRotate')) wcp.shadowRoot.querySelector('#canvasforRotate').parentNode.removeChild(wcp.shadowRoot.querySelector('#canvasforRotate'));

}
function restartCapture(audioDeviceId,videoDeviceId,constrain) {
	// Negotiate WebRTC
	var body = constrain;
	console.log("Sending message (" + JSON.stringify(body) + ")");
	sfutest.send({"message": body});
	console.log("Trying a createOffer too (audio/video sendrecv)");

	sfutest.createOffer(
		{
			// We provide a specific device ID for both audio and video
			media: {
				audio: {
					deviceId: {
						exact: audioDeviceId
					}
				},
				replaceAudio: true,	// This is only needed in case of a renegotiation
				video: {
					deviceId: {
						exact: videoDeviceId
					}
				},
				replaceVideo: true,	// This is only needed in case of a renegotiation
				data: false	// Let's negotiate data channels as well
			},
			// If you want to test simulcasting (Chrome and Firefox only), then
			// pass a ?simulcast=true when opening this demo page: it will turn
			// the following 'simulcast' property to pass to janus.js to true
			simulcast: doSimulcast,
			success: function(jsep) {
				console.log("Got SDP!");
				console.log(jsep);
				sfutest.send({"message": body, "jsep": jsep});
			},
			error: function(error) {
				console.error("WebRTC error:", error);
				
			}
		});

}



 async function listDevices(callback){
				
                return new Promise((resolve,reject)=>{
				let constrain = { audio: true, video: true };
		               
                        navigator.mediaDevices.enumerateDevices().then((devices)=> {

                                resolve(devices);
                                // Get rid of the now useless stream
                                try {
                                        // var tracks = stream.getTracks();
                                        // for(var i in tracks) {
                                        //         var mst = tracks[i];
                                        //         if(mst !== null && mst !== undefined)
                                        //                 mst.stop();
                                        // }
                                } catch(e) {
									reject(e);
                                }
                        });

						
        });
}

function publishOwnFeed({ useAudio }) {
		cleanPreprocess();
		console.log("OPTIONS",options);
		let vmedia = {};
		let amedia = {};
		var _video = options.video;
		var _audio = options.audio;
		var _audioDeviceId = options.audioinput;
		var _videoDeviceId = options.videoinput;
		window.videoDeviceId = options.videoinput;
		if (_video === false){
			vmedia = false;
		}
		else {
			if (typeof _videoDeviceId =="undefined") vmedia = true;
			else vmedia ={
				deviceId: {
					exact: _videoDeviceId || "default"
				},
				advanced: [{height: {min: 480}}, {width: {min: 640}}]
			}
		}
		if (_audio === false){
			amedia = false;
		}
		else {
			amedia = {
				deviceId: {
					exact: _audioDeviceId
				}
			}
		}
		doSimulcast=options.simulcast;
		sfutest.createOffer(
			{
				// Add data:true here if you want to publish datachannels as well
				//media: { audioRecv: false, videoRecv: false, audioSend: _audio, videoSend: _video },	// Publishers are sendonly
				media: {
					video:vmedia,
					replaceAudio: true,	// This is only needed in case of a renegotiation
					audio:amedia,
					replaceVideo: true,	// This is only needed in case of a renegotiation
					data: false	// Let's negotiate data channels as well
				},
				// If you want to test simulcasting (Chrome and Firefox only), then
				// pass a ?simulcast=true when opening this demo page: it will turn
				// the following 'simulcast' property to pass to janus.js to true
				simulcast: doSimulcast,
				simulcast2: doSimulcast2,
				success: function(jsep) {
					Janus.debug("Got publisher SDP!");
					Janus.debug(jsep);
					let message = { 
						"request": "configure", 
						"audio": useAudio, 
						"video": options.video,
						"videocodec": "h264" 
					};
					if (options.bitrate != 0) {
						message = Object.assign(message, { bitrate: options.bitrate })
					}
					if (!!options.filename) {
						message = Object.assign(message, { filename: options.filename })
					}
					// You can force a specific codec to use when publishing by using the
					// audiocodec and videocodec properties, for instance:
					// 		publish["audiocodec"] = "opus"
					// to force Opus as the audio codec to use, or:
					// 		publish["videocodec"] = "vp9"
					// to force VP9 as the videocodec to use. In both case, though, forcing
					// a codec will only work if: (1) the codec is actually in the SDP (and
					// so the browser supports it), and (2) the codec is in the list of
					// allowed codecs in a room. With respect to the point (2) above,
					// refer to the text in janus.plugin.videoroom.cfg for more details
					sfutest.send({"message": message, "jsep": jsep});
				},
				error: function(error) {
					Janus.error("WebRTC error:", error);
					if (useAudio) {
							publishOwnFeed({ useAudio: false });
					} else {
						console.warn("WebRTC error... " + JSON.stringify(error));
						
					}
				}
			});

	}
// Helper to parse query string
function getQueryStringValue(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}



	return {
		changeCamera:changeCamera,
		init:init,
		stop:stop,
		destroy,
		start:start,
		restartCapture:restartCapture,
		changeDev:changeDev,
		listDevices:listDevices,
		rotateVideo: canvasCapture
	}

}
export {JanusPublish};

