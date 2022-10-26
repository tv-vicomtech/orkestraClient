/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import CustomVideoElement from "custom-video-element";
import './dash-3.2.2.all.min.js'

class DASHVideoElement extends CustomVideoElement {
  constructor() {
    super();
  }

  get src() {
    // Use the attribute value as the source of truth.
    // No need to store it in two places.
    // This avoids needing a to read the attribute initially and update the src.
    return this.getAttribute("src");
  }

  set src(val) {
    // If being set by attributeChangedCallback,
    // dont' cause an infinite loop
    if (val !== this.src) {
      this.setAttribute("src", val);
    }
    if (this.dashPlayer) {
      let opt = this.getAttribute("options");
      opt = JSON.parse(opt);
      this.dashPlayer.updateSettings(opt);
    }
  }
  get options() {
    // Use the attribute value as the source of truth.
    // No need to store it in two places.
    // This avoids needing a to read the attribute initially and update the src.
    return this.getAttribute("options");
  }

  set options(val) {
    // If being set by attributeChangedCallback,
    // dont' cause an infinite loop
    if (val !== this.options) {
      this.setAttribute("options", val);
      if (this.dashPlayer) {
        let opt = val;
        opt = JSON.parse(opt);
        this.dashPlayer.updateSettings(opt);
      }
    }
  }

  get autoplay() {
    return this.getAttribute("autoplay");
  }
  set autoplay(val) {
    if (val !== this.autoplay) {
      this.setAttribute("autoplay", val);
    }
  }
  get log() {
    return this._log;
  }
  set log(val) {
    this._log = val;
  }
  updateOptions() {
    if (this.dashPlayer) {
      let opt = this.getAttribute("options");
      opt = JSON.parse(opt);
      this.dashPlayer.updateSettings(opt);
    }
  }
  load() {
    this.dashPlayer = window.dashjs.MediaPlayer().create();
    this.dashPlayer.initialize(
      this.nativeEl,
      this.src,
      this.getAttribute("autoplay") == "true"
    );
    let opt = this.getAttribute("options");
    opt = JSON.parse(opt);
    this.dashPlayer.updateSettings(opt);
  }
  renderHTML() {
    let div = document.createElement("div");
    div.style = "position:absolute;top:15px;left:15px;color:red";
    div.innerHTML = `
      <span id="bufferLevel"></span>
      <span id="framerate"></span>
      <span id="reportedBitrate"></span>
      `;
    this.shadowRoot.appendChild(div);
  }
  initDebug() {
    if (!this.logIntervalId) {
      this.renderHTML();
      this.logIntervalId = setInterval(() => {
        if (this.dashPlayer && this.dashPlayer.getActiveStream()) {
          var streamInfo = this.dashPlayer
            .getActiveStream()
            .getStreamInfo();
          var dashMetrics = this.dashPlayer.getDashMetrics();
          var dashAdapter = this.dashPlayer.getDashAdapter();

          if (dashMetrics && streamInfo) {
            const periodIdx = streamInfo.index;
            var repSwitch = dashMetrics.getCurrentRepresentationSwitch(
              "video",
              true
            );
            var bufferLevel = dashMetrics.getCurrentBufferLevel(
              "video",
              true
            );
            var bitrate = repSwitch
              ? Math.round(
                  dashAdapter.getBandwidthForRepresentation(
                    repSwitch.to,
                    periodIdx
                  ) / 1000
                )
              : NaN;
            var adaptation = dashAdapter.getAdaptationForType(
              periodIdx,
              "video",
              streamInfo
            );
            var frameRate = adaptation.Representation_asArray.find(
              function (rep) {
                return rep.id === repSwitch.to;
              }
            ).frameRate;
            this.shadowRoot.querySelector("#bufferLevel").innerText =
              bufferLevel + " secs";
            this.shadowRoot.querySelector("#framerate").innerText =
              frameRate + " fps";
            this.shadowRoot.querySelector("#reportedBitrate").innerText =
              bitrate + " Kbps";
          }
        }
      }, 1000);
    }
  }

  connectedCallback() {
    this.load()
    if (this._log && this._log === "true") {
      this.initDebug()
    }
  }

  disconnectedCallback() {
    this.logIntervalId && clearInterval(this.logIntervalId)
  }
}

if (!window.customElements.get("dash-video")) {
  window.customElements.define("dash-video", DASHVideoElement);
  window.DASHVideoElement = DASHVideoElement;
}

export { DASHVideoElement };
