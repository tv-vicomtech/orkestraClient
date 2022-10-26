/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import { Janus } from './janus.js';

var JanusClient = function (dom, janusServer, room, buffer) {
	var list = "";
	var server = null;
	if (window.location.protocol === 'http:') {
		server = "ws://" + (janusServer || window.location.hostname) + ":8188/janus";
	}
	else {
			server = "wss://" + (janusServer || window.location.hostname) + ":8989/janus";
	}
	var janus = null;
	var sfutest = null;
	var opaqueId = "orkestra-" + Janus.randomString(12);

	var myroom = room || 1234;	// Demo room
	var myusername = null;
	var myid = null;
	var mystream = null;
	// We use this other ID just to map our subscriptions to us
	var mypvtid = null;
	var handler;
	var _buffer = buffer;
	var feeds = [];
	var bitrateTimer = [];
	var nopublisher = false;
	var doSimulcast = (getQueryStringValue("simulcast") === "yes" || getQueryStringValue("simulcast") === "true");
	var doSimulcast2 = (getQueryStringValue("simulcast2") === "yes" || getQueryStringValue("simulcast2") === "true");
	// Initialize the library (all console debuggers enabled)
	var attachingIDs ="";
	function init() {
		if (Janus.running) return;
		Janus.init({
			debug: false, callback: function () {
				Janus.running = true;
				// Make sure the browser supports WebRTC
				if (!Janus.isWebrtcSupported()) {
					bootbox.alert("No WebRTC support... ");
					return;
				}
				// Create session

				janus = new Janus(
					{
						server: server,
						success: function () {
							// Attach to video room test plugin
							janus.attach(
								{
									plugin: "janus.plugin.videoroom",
									opaqueId: opaqueId,
									success: function (pluginHandle) {
										sfutest = pluginHandle;
										Janus.log("Plugin attached! (" + sfutest.getPlugin() + ", id=" + sfutest.getId() + ")");
										Janus.log("  -- This is a publisher/manager");
										// Prepare the username registration
									},
									error: function (error) {
										Janus.error("  -- Error attaching plugin...", error);
										bootbox.alert("Error attaching plugin... " + error);
									},
									consentDialog: function (on) {
										Janus.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
										if (on) {
											// Darken screen and show hint
											$.blockUI({
												message: '<div><img src="up_arrow.png"/></div>',
												css: {
													border: 'none',
													padding: '15px',
													backgroundColor: 'transparent',
													color: '#aaa',
													top: '10px',
													left: (navigator.mozGetUserMedia ? '-100px' : '300px')
												}
											});
										} else {
											// Restore screen
											$.unblockUI();
										}
									},
									mediaState: function (medium, on) {
										Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
									},
									webrtcState: function (on) {
										Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
										/*	$("#videolocal").parent().parent().unblock();
											if(!on)
											return;
											$('#publish').remove();
											// This controls allows us to override the global room bitrate cap
											$('#bitrate').parent().parent().removeClass('hide').show();
											$('#bitrate a').click(function() {
												var id = $(this).attr("id");
												var bitrate = parseInt(id)*1000;
												if(bitrate === 0) {
													Janus.log("Not limiting bandwidth via REMB");
												} else {
													Janus.log("Capping bandwidth to " + bitrate + " via REMB");
												}
												$('#bitrateset').html($(this).html() + '<span class="caret"></span>').parent().removeClass('open');
												sfutest.send({"message": { "request": "configure", "bitrate": bitrate }});
												return false;
											});*/
									},
									onmessage: function (msg, jsep) {
										Janus.debug(" ::: Got a message (publisher) :::");

										Janus.debug(msg);
										var event = msg["videoroom"];
										Janus.debug("Event: " + event);

										if (event != undefined && event != null) {
											if (event === "joined") {
												// Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
												//
												//
												var janusReady = new CustomEvent("JanusReady", {
													detail: {
														ready: true
													}
												});
												document.dispatchEvent(janusReady);

												myid = msg["id"];
												mypvtid = msg["private_id"];
												Janus.log("Successfully joined room " + msg["room"] + " with ID " + myid);
												// Any new feed to attach to?
												if (msg["publishers"] !== undefined && msg["publishers"] !== null) {
													janus.list = msg["publishers"];
													Janus.debug("Got a list of available publishers/feeds:");
													Janus.debug(janus.list);
													FlexJanus.feeds = janus.list;
													for (var f = 0; f < janus.list.length; f++) {
														var id = janus.list[f]["id"];
														var display = janus.list[f]["display"];
														var audio = janus.list[f]["audio_codec"];
														var video = janus.list[f]["video_codec"];
														Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
														//newRemoteFeed(id, display, audio, video);
														var newStream = new CustomEvent("newStream", {
															detail: {
																id: janus.list[f]["display"]
															}
														});
														document.dispatchEvent(newStream)
													}
												}
											} else if (event === "destroyed") {
												// The room has been destroyed
												Janus.warn("The room has been destroyed!");
											} else if (event === "event") {
												// Any new feed to attach to?
												if (msg["publishers"] !== undefined && msg["publishers"] !== null) {
													var list = msg["publishers"];
													Janus.debug("Got a list of available publishers/feeds:");
													Janus.debug(janus.list);
													for (var f = 0; f < list.length; f++) {
														janus.list.push(list[f]);
														if (typeof FlexJanus.feeds=="undefined") FlexJanus.feeds = janus.list;
														else {
															let id = list[f].id;
															let elem = FlexJanus.feeds.find((x)=>{ if (x.display == list[f].display) return true})
															if (typeof elem == "undefined"){
																FlexJanus.feeds.push(list[f]);
															}
															elem = list[f];
														}
														var newStream = new CustomEvent("newStream", {
															detail: {
																id: list[f]["display"]
															}
														});
														document.dispatchEvent(newStream)
														var r = msg["publishers"]
														//newRemoteFeed(r[0].id, r[0].display, r[0].audio, r[0].video);
													}
													
												} else if (msg["leaving"] !== undefined && msg["leaving"] !== null) {
													// One of the publishers has gone away?
													var leaving = msg["leaving"];
													Janus.log("Publisher left: " + leaving);
													var remoteFeed = null;
													for (var i = 0; i < 26; i++) {
														if (feeds[i] != null && feeds[i] != undefined && feeds[i].rfid == leaving) {
															remoteFeed = feeds[i];
															break;
														}

													}
													FlexJanus.feeds = FlexJanus.feeds.filter((el) => { return el.id !== leaving });
													var deleteStream = new CustomEvent("updateStream", { detail: { id: unpublished } });
													document.dispatchEvent(deleteStream);

													if (remoteFeed != null) {
														Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
														//	dom.querySelector('#remote'+remoteFeed.rfindex).empty().hide();
														//	dom.querySelector('#videoremote'+remoteFeed.rfindex).empty();
														feeds[remoteFeed.rfindex] = null;
														remoteFeed.detach();
													}
												} else if (msg["unpublished"] !== undefined && msg["unpublished"] !== null) {
													// One of the publishers has unpublished?
													var unpublished = msg["unpublished"];
													Janus.log("Publisher left: " + unpublished);
													if (unpublished === 'ok') {
														// That's us
														sfutest.hangup();
														return;
													}
													var remoteFeed = null;
													for (var i = 0; i < 26; i++) {
														if (feeds[i] != null && feeds[i] != undefined && feeds[i].id == unpublished) {
															remoteFeed = feeds[i];
															break;
														}
													}

													FlexJanus.feeds = FlexJanus.feeds.filter((el) => { return el.id !== unpublished })

													var deleteStream = new CustomEvent("updateStream", { detail: { id: unpublished } });
													document.dispatchEvent(deleteStream);

													if (remoteFeed != null) {
														Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
														//	dom.querySelector('#remote'+remoteFeed.rfindex).empty().hide();
														//	dom.querySelector('#videoremote'+remoteFeed.rfindex).empty();
														feeds[remoteFeed.rfindex] = null;
														remoteFeed.detach();
													}
												} else if (msg["error"] !== undefined && msg["error"] !== null) {
													if (msg["error_code"] === 426) {
														// This is a "no such room" error: give a more meaningful description
														console.warn(
															"<p>Apparently room <code>" + myroom + "</code> (the one this demo uses as a test room) " +
															"does not exist...</p><p>Do you have an updated <code>janus.plugin.videoroom.cfg</code> " +
															"configuration file? If not, make sure you copy the details of room <code>" + myroom + "</code> " +
															"from that sample in your current configuration file, then restart Janus and try again."
														);
													} else {
														console.warn(msg["error"]);
													}
												}
											}
										}
										if (jsep !== undefined && jsep !== null) {
											Janus.debug("Handling SDP as well...");
											Janus.debug(jsep);
											sfutest.handleRemoteJsep({ jsep: jsep });
											// Check if any of the media we wanted to publish has
											// been rejected (e.g., wrong or unsupported codec)
											var audio = msg["audio_codec"];
											if (mystream && mystream.getAudioTracks() && mystream.getAudioTracks().length > 0 && !audio) {
												// Audio has been rejected
												toastr.warning("Our audio stream has been rejected, viewers won't hear us");
											}
											var video = msg["video_codec"];
											if (mystream && mystream.getVideoTracks() && mystream.getVideoTracks().length > 0 && !video) {
												// Video has been rejected
												toastr.warning("Our video stream has been rejected, viewers won't see us");
												// Hide the webcam video
												$('#myvideo').hide();
												$('#videolocal').append(
													'<div class="no-video-container">' +
													'<i class="fa fa-video-camera fa-5 no-video-icon" style="height: 100%;"></i>' +
													'<span class="no-video-text" style="font-size: 16px;">Video rejected, no webcam</span>' +
													'</div>');
											}
										}
									},
									onlocalstream: function (stream) {
										Janus.debug(" ::: Got a local stream :::");


									},
									onremotestream: function (stream) {
										// The publisher stream is sendonly, we don't expect anything here

									},
									oncleanup: function () {
										Janus.log(" ::: Got a cleanup notification: we are unpublished now :::");
										mystream = null;
									}
								});
						},
						error: function (error) {
							Janus.error(error);
							console.error("Janus critical error",error);
						},
						destroyed: function () {
							console.warn("janus destroyed !!");
						}
					});
				janus.list = [];
				janus.activeHandles = [];
				setTimeout(() => { if (nopublisher === false) registerUsername() }, 4000);

			}
		});
	}
	function start(id, dom) {
		var handler = FlexJanus.feeds.find((f) => { if (f.display === id) return true; });
		if (!handler) {
			console.warn("There is not that feed", id);
		}

		else changeCamera(id, dom);
	}
	function stopCamera(id) {
		var elem = dom.querySelector('video');
		elem.src = "";
		elem.srcObject = null;

	}
	function registerUsername() {
		var register = { "request": "join", "room": myroom, "ptype": "publisher", "display": "flex" };
		let username = "orkestra";
		myusername = "orkestra";
		let inter = setInterval(() => {
			if (sfutest) {
				sfutest.send({ "message": register });
				clearInterval(inter);
			}
		}, 500);
	}
	function registerUsernameAsSubscriber(feedId) {
		nopublisher = true;
		var register = { "request": "join", "room": myroom, "ptype": "subscriber", "display": "flex", "feed": feedId };
		let username = "orkestra";
		myusername = "orkestra";
		let inter = setInterval(() => {
			if (sfutest) {
				sfutest.send({ "message": register });
				clearInterval(inter);
			}
		}, 1500);
	}

	function toggleMute() {
		var muted = sfutest.isAudioMuted();
		Janus.log((muted ? "Unmuting" : "Muting") + " local stream...");
		if (muted)
			sfutest.unmuteAudio();
		else
			sfutest.muteAudio();
		muted = sfutest.isAudioMuted();

	}
	function changeCamera(id, dom) {
		var handler = FlexJanus.feeds.find((f) => { if (f.display === id) return true; });
		newRemoteFeed(handler.id,handler.display,handler.audio,handler.video).then((_handler)=>{
			var elem = dom.querySelector('video') || dom.shadowRoot.querySelector('video');
			if (_handler) {
				if (_handler.stream){
					Janus.attachMediaStream(elem, _handler.stream);
					if (elem.showAudioInput && elem.showAudioInput === true){
						let vmc = elem.parentNode.querySelector('volume-meter');
						if (vmc) vmc.init(_handler.stream);
					}
				}
				else
					setTimeout(()=>{
						var handler = FlexJanus.feeds.find((f) => { if (f.display === id) return true; });
						Janus.attachMediaStream(elem, handler.stream);
						if (elem.showAudioInput && elem.showAudioInput === true){
							let vmc = elem.parentNode.querySelector('volume-meter');
							if (vmc) vmc.init(handler.stream);
						}
					},2000)
			}
		});
		

	}
	function changeSubStream(id, subs) {
		var handler = FlexJanus.feeds.find((f) => { if (f.rfdisplay === id) return true; });
		if (handler && 'substream' in handler && handler.substream !==subs) { 
			handler.send({ message: { request: "configure", substream: subs } });
		}
	}
	function changeBuffer(buffer){
		_buffer = buffer;
	}

	function newRemoteFeed(id, display, audio, video) {
		// A new feed has been published, create a new plugin handle and attach to it as a subscriber
		return new Promise((res, rej) => {
			var handler = FlexJanus.feeds.find((f) => { if (f.id === id) return true; });
			
			if (handler.stream) {res(handler);return;}
			if (attachingIDs.indexOf(id)!=-1) {res(handler);return;}
			var remoteFeed = null;
			attachingIDs+="_"+id;
			janus.attach(
				{
					plugin: "janus.plugin.videoroom",
					opaqueId: opaqueId,
					success: function (pluginHandle) {
						janus.activeHandles.push({ id: id, handle: pluginHandle });
						handler = pluginHandle;
						remoteFeed = pluginHandle;
						remoteFeed.simulcastStarted = false;
						Janus.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")");
						Janus.log("  -- This is a subscriber");
						// We wait for the plugin to send us an offer
						var subscribe = { "request": "join", "room": myroom, "ptype": "subscriber", "feed": id, "private_id": mypvtid, offer_data: false };
						// In case you don't want to receive audio, video or data, even if the
						// publisher is sending them, set the 'offer_audio', 'offer_video' or
						// 'offer_data' properties to false (they're true by default), e.g.:
						// 		subscribe["offer_video"] = false;
						// For example, if the publisher is VP8 and this is Safari, let's avoid video
						if (Janus.webRTCAdapter.browserDetails.browser === "safari" &&
							(video === "vp9" || (video === "vp8" && !Janus.safariVp8))) {
							if (video)
								video = video.toUpperCase()
							toastr.warning("Publisher is using " + video + ", but Safari doesn't support it: disabling video");
							subscribe["offer_video"] = false;
						}
						remoteFeed.videoCodec = video;
						remoteFeed.send({ "message": subscribe });
						let config = handler.webrtcStuff;	
						setInterval(()=>{
							if (config.pc){
								config.pc.getReceivers().forEach((t)=>{
									t.playoutDelayHint = t.jitterBufferDelayHint = _buffer || 0.15 ;
								})
							}

						},1000);
						
					},
					error: function (error) {
						Janus.error("  -- Error attaching plugin...", error);
						rej(error);
					},
					onmessage: function (msg, jsep) {
						Janus.debug(" ::: Got a message (subscriber) :::");
						Janus.debug(msg);
						var event = msg["videoroom"];
						Janus.debug("Event: " + event);
						if (msg["error"] !== undefined && msg["error"] !== null) {
							console.error(msg["error"]);
						} else if (event != undefined && event != null) {
							if (event === "attached") {
								// Subscriber created and attached
								for (var i = 0; i < 26; i++) {
									if (feeds[i] === undefined || feeds[i] === null) {
										feeds[i] = remoteFeed;
										remoteFeed.rfindex = i;
										break;
									}
								}
								remoteFeed.rfid = msg["id"];
								remoteFeed.rfdisplay = msg["display"];

								Janus.log("Successfully attached to feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") in room " + msg["room"]);
								//	$('#remote'+remoteFeed.rfindex).removeClass('hide').html(remoteFeed.rfdisplay).show();
							} else if (event === "event") {
								// Check if we got an event on a simulcast-related event from this publisher
								var substream = msg["substream"];
								if ('substream' in msg) { 
									remoteFeed.substream = substream;
									const event = new CustomEvent("substreamConfigured", { detail: { substream, input: remoteFeed.rfdisplay } });
									document.dispatchEvent(event)
								}
								var temporal = msg["temporal"];
								if ((substream !== null && substream !== undefined) || (temporal !== null && temporal !== undefined)) {
									if (!remoteFeed.simulcastStarted) {
										remoteFeed.simulcastStarted = true;
										// Add some new buttons
										//	addSimulcastButtons(0, remoteFeed.videoCodec === "vp8" || remoteFeed.videoCodec === "h264");
									}
									// We just received notice that there's been a switch, update the buttons
									//updateSimulcastButtons(0, substream, temporal);
								}
							} else {
								// What has just happened?
							}
						}
						if (jsep !== undefined && jsep !== null) {
							Janus.debug("Handling SDP as well...");
							Janus.debug(jsep);
							// Answer and attach
							remoteFeed.createAnswer(
								{
									jsep: jsep,
									// Add data:true here if you want to subscribe to datachannels as well
									// (obviously only works if the publisher offered them in the first place)
									media: { audioSend: false, videoSend: false, audioRecv: false, recvonly: true },	// We want recvonly audio/video
									success: function (jsep) {
										Janus.debug("Got SDP!");
										Janus.debug(jsep);
										var body = { "request": "start", "room": myroom };
										remoteFeed.send({ "message": body, "jsep": jsep });
										/*let bitrateTimer = setInterval(function() {
											// Display updated bitrate, if supported
											var bitrate = handler.getBitrate();
											//console.log(bitrate);
											if (dom.querySelector && dom.querySelector('#bitrate')) dom.querySelector('#bitrate').innerText=bitrate;
											// Check if the resolution changed too
										
										}, 20000);*/
									},
									error: function (error) {
										Janus.error("WebRTC error:", error);
										bootbox.alert("WebRTC error... " + JSON.stringify(error));
									}
								});
						}
					},
					webrtcState: function (on) {
						Janus.log("Janus says this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") is " + (on ? "up" : "down") + " now");
					},
					onlocalstream: function (stream) {
						// The subscriber stream is recvonly, we don't expect anything here
					},
					onremotestream: function (stream) {
						attachingIDs = attachingIDs.replace(id,"")
						if (!remoteFeed) return;

						Janus.debug("Remote feed #" + remoteFeed.rfindex);
						FlexJanus.feeds = FlexJanus.feeds.filter((x) => { return x != null })
						var exists = FlexJanus.feeds.find((x) => {
							if (remoteFeed && x && x.id == remoteFeed.rfid) return true;
						});
						if (exists)
							FlexJanus.feeds.forEach((r) => {
								if (r.id == remoteFeed.rfid) r.stream = stream;
							});
						else {

							remoteFeed.stream = stream;
							

						}
						let found = FlexJanus.feeds.find((f)=> {if (f.id ==remoteFeed.id) return true;})
						if (!found) FlexJanus.feeds.push(remoteFeed);
						res(remoteFeed)
					},
					oncleanup: function () {
						Janus.log(" ::: Got a cleanup notification (remote feed " + id + ") :::");
						let streamOff = new CustomEvent("deletedStream", {
							detail: {
								id: display
							}
						});
						document.dispatchEvent(streamOff);
						FlexJanus.feeds = FlexJanus.feeds.filter((r) => {
							if (r.rfid == id) return false;
							return true;
						});

						remoteFeed.rfindex = 0;

						if (bitrateTimer[remoteFeed.rfindex] !== null && bitrateTimer[remoteFeed.rfindex] !== null)
							clearInterval(bitrateTimer[remoteFeed.rfindex]);
						bitrateTimer[remoteFeed.rfindex] = null;
						remoteFeed.simulcastStarted = false;

					}
				});
		})
	}

	// Helper to parse query string
	function getQueryStringValue(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	return {
		changeCamera: changeCamera,
		init: init,
		stop: stopCamera,
		start: start,
		changeBuffer:changeBuffer,
		changeSubStream: changeSubStream,
		registerUsernameAsSubscriber: registerUsernameAsSubscriber,
		client: janus,
		feeds: feeds
	}
}
export { JanusClient };
