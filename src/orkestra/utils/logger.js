/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
import log from 'loglevel';


var Logger = {
    default:{
        template: '[%t] %l:',
        levelFormatter: function (level) {
          return level.toUpperCase();
        },
        nameFormatter: function (name) {
          return name || 'root';
        },
        timestampFormatter: function (date) {
          return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
        },
        format: undefined
      },
    getLogger : function (name){
        let _log = log.getLogger(name);
        _log.setLevel(log.getLevel());
        return _log;
    },
    setLogLevel:function(level,name){
        log.setLevel(level);
        log.getLogger(name).setLevel(level);
    }
  
  }
  
  export {Logger};
  