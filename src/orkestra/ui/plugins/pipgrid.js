/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
//import './css/custom.css';
import "./css/pipgrid.css";

export function PipGrid() {
  const render = function (ev, cmp, app) {
    document.querySelector("orkestra-ui").className = "containerpipgrid";
    const currentTime = app.sequencer ? app.sequencer.currentTime : -1;

    const setClasses = function (_cmp, N, cn) {
      // Set component Background
      if (_cmp.shadowRoot) {
        const video = _cmp.shadowRoot.querySelector("video");
        if (video) {
          video.style.background = "black";
        }
      }

      if (N == 1) {
        _cmp.className = "fullmain";
      } else {
        if (cn == 0) {
          _cmp.className = "main";
          _cmp.style.height= '100%'
        } else {
          _cmp.className = "secondary";
          _cmp.style.height = "calc(100% / " + (N - 1) + ")";
          _cmp.style.top = ((cn - 1) * 100) / (N - 1) + "%";
        }
      }
    };
    var visible = Array.from(cmp).filter((x, i, len) => {
      return x.style.display != "none";
    });

    visible.forEach((cmp, o, len) => {
      if (typeof cmp.order === "undefined") cmp.style.order = 0;
      else cmp.style.order = cmp.order[currentTime];
      setClasses(cmp, len.length, o);
    });
  };
  var unload = function (cmps) {
    Array.from(cmps).forEach((c) => {
      c.style = "";
      c.className = "";
    });
  };
  var plugin = {
    render: render,
    unload: unload,
  };
  return plugin;
}
