/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
var assert = require('assert');
import { Subject,Observable } from 'rxjs';
import {Orkestra} from '../src/orkestra/orkestra';
import {TextData,KeyPress} from '../src/orkestra/instruments/';
import {Byname} from '../src/orkestra/rules/byname';
import {Divided} from '../src/orkestra/ui/plugins/divided';

describe('Orkestra', function() {
  var app = "";
  var app = new Orkestra({url:'https://dev.flexcontrol.net/',channel:'test',master:true})
  describe('New App Instance', function() {

    it('should return Orkestra instance', function() {
      assert.equal( app instanceof Orkestra,true);
    });
    it('should return user Observable', function() {
       assert.equal( app.userObservable  instanceof Observable,true);
    });
    it('should register data module', function(done) {
      app.readyObservable.subscribe(()=>{
       app.data('textShare',TextData,[{}]);
       var keys = app.me().keys();
       assert.notEqual( keys.indexOf('textShare'),-1);
       done();
    });
    })
  });
  describe('User Interface', function() {
    it('should register new deploy module', function() {
        app.use(Byname);
        assert.equal(app.rules.length,1);
    })
    it('should register new layout module', function() {
        app.ui(Divided);
        assert.equal(app.ui().layouts.length,1);
    })

  });
  describe('User control', function() {

    it('should be connected to aplicationContext', function(done) {
          app.readyObservable.subscribe((x)=>{
            assert.equal(app.appCtx.ready(),true);
            done();
        });
      });
    it('should be at least one user', function(done) {
        app.readyObservable.subscribe((x)=>{
          assert.equal(JSON.parse(app.getUsers()).me.name,'me');
          done();
      });
    })


  });
});
