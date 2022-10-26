/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
/**
 * @file A timing provider factory exposes provisioning methods for managing
 * timing provider objects.
 *
 * This is an abstract implementation of a timing provider factory meant for
 * demo purpose. Timing provider implementations may follow the same interface
 * although that is by no means compulsory.
 */

// Ensure "define" is defined in node.js in the absence of require.js
// See: https://github.com/jrburke/amdefine


  import {AbstractTimingProvider} from './AbstractTimingProvider';


  /**
   * Creates a timing object on the online timing service and returns a
   * timing provider object associated with it.
   *
   * If the timing object to create has an ID that refers to an existing oject
   * on the online timing service, that object is used (and not re-created).
   *
   * @function
   * @static
   * @param {TimingObject} timingobject The timing object to create or retrieve
   *  from the online timing service.
   * @returns {Promise} The promise to get a timing provider object associated
   *   with an online timing object that matches the requested one.
   */
  TimingProviderFactory.create = function (timingobject) {
    return new Promise(function (resolve, reject) {
      var provider = new AbstractTimingProvider(timingobject);
      resolve(provider);
    });
  };


  /**
   * Deletes the online representation of the timing object on the online timing
   * service.
   *
   * @function
   * @static
   * @param {String} id The ID of the timing object to delete
   * @returns
   */
  TimingProviderFactory.delete = function (id) {
    return new Promise(function (resolve, reject) {
      resolve();
    });
  };
export {TimingProviderFactory};
