/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
class OrkestraModel{

    URL = "";

    model; webcam; labelContainer; maxPredictions;
    cbs = [];
    subscribe(cb){
    
	    this.cbs.push(cb);
    
    }
    constructor(url){
     this.URL = url;
    }
    // Load the image model and setup the webcam
    async init() {
        const modelURL = this.URL + "model.json";
        const metadataURL = this.URL + "metadata.json";

        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // or files from your local hard drive
        // Note: the pose library adds "tmImage" object to your window (window.tmImage)
        this.model = await tmImage.load(modelURL, metadataURL);
        this.maxPredictions = this.model.getTotalClasses();

        // Convenience function to setup a webcam
        const flip = true; // whether to flip the webcam
        this.webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
        await this.webcam.setup(); // request access to the webcam
        await this.webcam.play();
	document.getElementById("webcam-container").appendChild(this.webcam.canvas);
        window.requestAnimationFrame(this.loop.bind(this));

    }

    async loop() {
        this.webcam.update(); // update sthe webcam frame
        await this.predict();
        window.requestAnimationFrame(this.loop.bind(this));
    }

    // run the webcam image through the image model
    async predict() {
        // predict can take in an image, video or canvas html element
        const prediction = await this.model.predict(this.webcam.canvas);
	this.cbs.forEach(cb=>{
		let probs = prediction.map(p=>{return p.probability});
		let max =  probs.reduce(function(a, b) {
   			return Math.max(a, b);
		});

		if (max > 0.8) cb(prediction);
	})
    }
}

