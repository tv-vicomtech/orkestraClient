/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
// <volume-meter width="500" height="25" color="red"></volume-meter>	
export class VolumeMeter extends HTMLElement {


    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        //this.shadowRoot.innerHTML+="<style>"+buttonClass+"</style>";
        this.audioContext = null;
        this.meter = undefined;
        this.canvasContext = null;
        this.rafID = null;
    }
    get color (){
        return this.getAttribute('color');
    }
    set color (c){
        this.setAttribute('color',c)
    }
    get width(){
        return  parseInt(this.getAttribute("width"));
    }
    set width(x){
        if (this.shadowRoot.querySelector("canvas")) {
                    
            this.shadowRoot.querySelector("canvas").width = this.width;
            
        }
        this.setAttribute("width", parseInt(x));
    }
    get height(){
        return  parseInt(this.getAttribute("height"));
    }
    set height(x){
        if (this.shadowRoot.querySelector("canvas")) {
                    
            this.shadowRoot.querySelector("canvas").height = this.height;
            
        }
        this.setAttribute("height", parseInt(x));
    }
    async connectedCallback() {
         this.color = this.color || "green";
    }
    init(stream) {
        // grab our canvas
        if (!this.shadowRoot.querySelector("canvas")) {
            let canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            this.shadowRoot.appendChild(canvas);
        }
        this.canvasContext = this.shadowRoot.querySelector("canvas").getContext("2d");
        // monkeypatch Web Audio
        window.AudioContext = window.AudioContext || window.webkitAudioContext;

        // grab an audio context
        this.audioContext = new AudioContext();
        // monkeypatch getUserMedia
        let mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
        // Create a new volume meter and connect it.
        this.meter = this.createAudioMeter(this.audioContext);
        mediaStreamSource.connect(this.meter);
        this.render();
       
    }
    hide (){
        this.canvasContext.clearRect(0, 0, this.width, this.height);
        this.meter = undefined;
    }
    render(time) {
        if (!this.meter) return;
        // clear the background
        this.canvasContext.clearRect(0, 0, this.width, this.height);

        // check if we're currently clipping
        if (this.meter.checkClipping())
            this.canvasContext.fillStyle = "red";
        else
            this.canvasContext.fillStyle = this.color;

        // draw a bar based on the current volume
        this.canvasContext.fillRect(0, 0, this.width,this.meter.volume * this.height * 1.4);

        // set up the next visual callback
        this.rafID = window.requestAnimationFrame(this.render.bind(this));
    }

    createAudioMeter(audioContext, clipLevel, averaging, clipLag) {
        this.processor = this.audioContext.createScriptProcessor(512);
        this.processor.addEventListener('audioprocess', this.volumeAudioProcess.bind(this));
        this.processor.clipping = false;
        this.processor.lastClip = 0;
        this.processor.volume = 0;
        this.processor.clipLevel = clipLevel || 0.98;
        this.processor.averaging = averaging || 0.95;
        this.processor.clipLag = clipLag || 750;

        // this will have no effect, since we don't copy the input to the output,
        // but works around a current Chrome bug.
        this.processor.connect(this.audioContext.destination);

        this.processor.checkClipping =()=> {
                if (!this.processor.clipping)
                    return false;
                if ((this.processor.lastClip + this.processor.clipLag) < window.performance.now())
                    this.processor.clipping = false;
                return this.processor.clipping;
            };

        this.processor.shutdown =
            function () {
                this.disconnect();
                this.onaudioprocess = null;
            };

        return this.processor;
    }

    volumeAudioProcess(event) {
        var buf = event.inputBuffer.getChannelData(0);
        var bufLength = buf.length;
        var sum = 0;
        var x;

        // Do a root-mean-square on the samples: sum up the squares...
        for (var i = 0; i < bufLength; i++) {
            x = buf[i];
            if (Math.abs(x) >= this.processor.clipLevel) {
                this.processor.clipping = true;
                this.processor.lastClip = window.performance.now();
            }
            sum += x * x;
        }

        // ... then take the square root of the sum.
        var rms = Math.sqrt(sum / bufLength);

        // Now smooth this out with the averaging factor applied
        // to the previous sample - take the max here because we
        // want "fast attack, slow release."
        this.processor.volume = Math.max(rms, this.processor.volume * this.processor.averaging);
    }
}
customElements.define('volume-meter', VolumeMeter);
