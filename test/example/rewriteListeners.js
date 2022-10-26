/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
(function()
{
    let target = EventTarget.prototype;
    let functionName = 'addEventListener';
    let func = target[functionName];

    let symbolHidden = Symbol('hidden');

    function hidden(instance)
    {
        if(instance[symbolHidden] === undefined)
        {
            let area = {};
            instance[symbolHidden] = area;
            return area;
        }

        return instance[symbolHidden];
    }

    function listenersFrom(instance)
    {
        let area = hidden(instance);
        if(!area.listeners) { area.listeners = []; }
        return area.listeners;
    }

    target[functionName] = function(type, listener)
    {
        let listeners = listenersFrom(this);

        listeners.push({ type, listener });

        func.apply(this, [type, listener]);
    };

    target['removeEventListeners'] = function(targetType)
    {
        let self = this;

        let listeners = listenersFrom(this);
        let removed = [];

        listeners.forEach(item =>
        {
            let type = item.type;
            let listener = item.listener;

            if(type == targetType)
            {
                self.removeEventListener(type, listener);
            }
        });
    };
})();
