'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

function isFunction$2(value) {
    return typeof value === 'function';
}

function createErrorClass(createImpl) {
    var _super = function (instance) {
        Error.call(instance);
        instance.stack = new Error().stack;
    };
    var ctorFunc = createImpl(_super);
    ctorFunc.prototype = Object.create(Error.prototype);
    ctorFunc.prototype.constructor = ctorFunc;
    return ctorFunc;
}

var UnsubscriptionError = createErrorClass(function (_super) {
    return function UnsubscriptionErrorImpl(errors) {
        _super(this);
        this.message = errors
            ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ')
            : '';
        this.name = 'UnsubscriptionError';
        this.errors = errors;
    };
});

function arrRemove(arr, item) {
    if (arr) {
        var index = arr.indexOf(item);
        0 <= index && arr.splice(index, 1);
    }
}

var Subscription = (function () {
    function Subscription(initialTeardown) {
        this.initialTeardown = initialTeardown;
        this.closed = false;
        this._parentage = null;
        this._finalizers = null;
    }
    Subscription.prototype.unsubscribe = function () {
        var e_1, _a, e_2, _b;
        var errors;
        if (!this.closed) {
            this.closed = true;
            var _parentage = this._parentage;
            if (_parentage) {
                this._parentage = null;
                if (Array.isArray(_parentage)) {
                    try {
                        for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
                            var parent_1 = _parentage_1_1.value;
                            parent_1.remove(this);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return)) _a.call(_parentage_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                else {
                    _parentage.remove(this);
                }
            }
            var initialFinalizer = this.initialTeardown;
            if (isFunction$2(initialFinalizer)) {
                try {
                    initialFinalizer();
                }
                catch (e) {
                    errors = e instanceof UnsubscriptionError ? e.errors : [e];
                }
            }
            var _finalizers = this._finalizers;
            if (_finalizers) {
                this._finalizers = null;
                try {
                    for (var _finalizers_1 = __values(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
                        var finalizer = _finalizers_1_1.value;
                        try {
                            execFinalizer(finalizer);
                        }
                        catch (err) {
                            errors = errors !== null && errors !== void 0 ? errors : [];
                            if (err instanceof UnsubscriptionError) {
                                errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
                            }
                            else {
                                errors.push(err);
                            }
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return)) _b.call(_finalizers_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            if (errors) {
                throw new UnsubscriptionError(errors);
            }
        }
    };
    Subscription.prototype.add = function (teardown) {
        var _a;
        if (teardown && teardown !== this) {
            if (this.closed) {
                execFinalizer(teardown);
            }
            else {
                if (teardown instanceof Subscription) {
                    if (teardown.closed || teardown._hasParent(this)) {
                        return;
                    }
                    teardown._addParent(this);
                }
                (this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
            }
        }
    };
    Subscription.prototype._hasParent = function (parent) {
        var _parentage = this._parentage;
        return _parentage === parent || (Array.isArray(_parentage) && _parentage.includes(parent));
    };
    Subscription.prototype._addParent = function (parent) {
        var _parentage = this._parentage;
        this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
    };
    Subscription.prototype._removeParent = function (parent) {
        var _parentage = this._parentage;
        if (_parentage === parent) {
            this._parentage = null;
        }
        else if (Array.isArray(_parentage)) {
            arrRemove(_parentage, parent);
        }
    };
    Subscription.prototype.remove = function (teardown) {
        var _finalizers = this._finalizers;
        _finalizers && arrRemove(_finalizers, teardown);
        if (teardown instanceof Subscription) {
            teardown._removeParent(this);
        }
    };
    Subscription.EMPTY = (function () {
        var empty = new Subscription();
        empty.closed = true;
        return empty;
    })();
    return Subscription;
}());
var EMPTY_SUBSCRIPTION = Subscription.EMPTY;
function isSubscription(value) {
    return (value instanceof Subscription ||
        (value && 'closed' in value && isFunction$2(value.remove) && isFunction$2(value.add) && isFunction$2(value.unsubscribe)));
}
function execFinalizer(finalizer) {
    if (isFunction$2(finalizer)) {
        finalizer();
    }
    else {
        finalizer.unsubscribe();
    }
}

var config = {
    onUnhandledError: null,
    onStoppedNotification: null,
    Promise: undefined,
    useDeprecatedSynchronousErrorHandling: false,
    useDeprecatedNextContext: false,
};

var timeoutProvider = {
    setTimeout: function (handler, timeout) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var delegate = timeoutProvider.delegate;
        if (delegate === null || delegate === void 0 ? void 0 : delegate.setTimeout) {
            return delegate.setTimeout.apply(delegate, __spreadArray([handler, timeout], __read(args)));
        }
        return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
    },
    clearTimeout: function (handle) {
        var delegate = timeoutProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearTimeout) || clearTimeout)(handle);
    },
    delegate: undefined,
};

function reportUnhandledError(err) {
    timeoutProvider.setTimeout(function () {
        {
            throw err;
        }
    });
}

function noop$1() { }

var context = null;
function errorContext(cb) {
    if (config.useDeprecatedSynchronousErrorHandling) {
        var isRoot = !context;
        if (isRoot) {
            context = { errorThrown: false, error: null };
        }
        cb();
        if (isRoot) {
            var _a = context, errorThrown = _a.errorThrown, error = _a.error;
            context = null;
            if (errorThrown) {
                throw error;
            }
        }
    }
    else {
        cb();
    }
}

var Subscriber = (function (_super) {
    __extends(Subscriber, _super);
    function Subscriber(destination) {
        var _this = _super.call(this) || this;
        _this.isStopped = false;
        if (destination) {
            _this.destination = destination;
            if (isSubscription(destination)) {
                destination.add(_this);
            }
        }
        else {
            _this.destination = EMPTY_OBSERVER;
        }
        return _this;
    }
    Subscriber.create = function (next, error, complete) {
        return new SafeSubscriber(next, error, complete);
    };
    Subscriber.prototype.next = function (value) {
        if (this.isStopped) ;
        else {
            this._next(value);
        }
    };
    Subscriber.prototype.error = function (err) {
        if (this.isStopped) ;
        else {
            this.isStopped = true;
            this._error(err);
        }
    };
    Subscriber.prototype.complete = function () {
        if (this.isStopped) ;
        else {
            this.isStopped = true;
            this._complete();
        }
    };
    Subscriber.prototype.unsubscribe = function () {
        if (!this.closed) {
            this.isStopped = true;
            _super.prototype.unsubscribe.call(this);
            this.destination = null;
        }
    };
    Subscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    Subscriber.prototype._error = function (err) {
        try {
            this.destination.error(err);
        }
        finally {
            this.unsubscribe();
        }
    };
    Subscriber.prototype._complete = function () {
        try {
            this.destination.complete();
        }
        finally {
            this.unsubscribe();
        }
    };
    return Subscriber;
}(Subscription));
var _bind = Function.prototype.bind;
function bind$1(fn, thisArg) {
    return _bind.call(fn, thisArg);
}
var ConsumerObserver = (function () {
    function ConsumerObserver(partialObserver) {
        this.partialObserver = partialObserver;
    }
    ConsumerObserver.prototype.next = function (value) {
        var partialObserver = this.partialObserver;
        if (partialObserver.next) {
            try {
                partialObserver.next(value);
            }
            catch (error) {
                handleUnhandledError(error);
            }
        }
    };
    ConsumerObserver.prototype.error = function (err) {
        var partialObserver = this.partialObserver;
        if (partialObserver.error) {
            try {
                partialObserver.error(err);
            }
            catch (error) {
                handleUnhandledError(error);
            }
        }
        else {
            handleUnhandledError(err);
        }
    };
    ConsumerObserver.prototype.complete = function () {
        var partialObserver = this.partialObserver;
        if (partialObserver.complete) {
            try {
                partialObserver.complete();
            }
            catch (error) {
                handleUnhandledError(error);
            }
        }
    };
    return ConsumerObserver;
}());
var SafeSubscriber = (function (_super) {
    __extends(SafeSubscriber, _super);
    function SafeSubscriber(observerOrNext, error, complete) {
        var _this = _super.call(this) || this;
        var partialObserver;
        if (isFunction$2(observerOrNext) || !observerOrNext) {
            partialObserver = {
                next: (observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : undefined),
                error: error !== null && error !== void 0 ? error : undefined,
                complete: complete !== null && complete !== void 0 ? complete : undefined,
            };
        }
        else {
            var context_1;
            if (_this && config.useDeprecatedNextContext) {
                context_1 = Object.create(observerOrNext);
                context_1.unsubscribe = function () { return _this.unsubscribe(); };
                partialObserver = {
                    next: observerOrNext.next && bind$1(observerOrNext.next, context_1),
                    error: observerOrNext.error && bind$1(observerOrNext.error, context_1),
                    complete: observerOrNext.complete && bind$1(observerOrNext.complete, context_1),
                };
            }
            else {
                partialObserver = observerOrNext;
            }
        }
        _this.destination = new ConsumerObserver(partialObserver);
        return _this;
    }
    return SafeSubscriber;
}(Subscriber));
function handleUnhandledError(error) {
    {
        reportUnhandledError(error);
    }
}
function defaultErrorHandler(err) {
    throw err;
}
var EMPTY_OBSERVER = {
    closed: true,
    next: noop$1,
    error: defaultErrorHandler,
    complete: noop$1,
};

var observable = (function () { return (typeof Symbol === 'function' && Symbol.observable) || '@@observable'; })();

function identity$1(x) {
    return x;
}

function pipeFromArray(fns) {
    if (fns.length === 0) {
        return identity$1;
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return function piped(input) {
        return fns.reduce(function (prev, fn) { return fn(prev); }, input);
    };
}

var Observable = (function () {
    function Observable(subscribe) {
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    Observable.prototype.lift = function (operator) {
        var observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
        var _this = this;
        var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
        errorContext(function () {
            var _a = _this, operator = _a.operator, source = _a.source;
            subscriber.add(operator
                ?
                    operator.call(subscriber, source)
                : source
                    ?
                        _this._subscribe(subscriber)
                    :
                        _this._trySubscribe(subscriber));
        });
        return subscriber;
    };
    Observable.prototype._trySubscribe = function (sink) {
        try {
            return this._subscribe(sink);
        }
        catch (err) {
            sink.error(err);
        }
    };
    Observable.prototype.forEach = function (next, promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var subscriber = new SafeSubscriber({
                next: function (value) {
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        subscriber.unsubscribe();
                    }
                },
                error: reject,
                complete: resolve,
            });
            _this.subscribe(subscriber);
        });
    };
    Observable.prototype._subscribe = function (subscriber) {
        var _a;
        return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
    };
    Observable.prototype[observable] = function () {
        return this;
    };
    Observable.prototype.pipe = function () {
        var operations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operations[_i] = arguments[_i];
        }
        return pipeFromArray(operations)(this);
    };
    Observable.prototype.toPromise = function (promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var value;
            _this.subscribe(function (x) { return (value = x); }, function (err) { return reject(err); }, function () { return resolve(value); });
        });
    };
    Observable.create = function (subscribe) {
        return new Observable(subscribe);
    };
    return Observable;
}());
function getPromiseCtor(promiseCtor) {
    var _a;
    return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
}
function isObserver(value) {
    return value && isFunction$2(value.next) && isFunction$2(value.error) && isFunction$2(value.complete);
}
function isSubscriber(value) {
    return (value && value instanceof Subscriber) || (isObserver(value) && isSubscription(value));
}

var ObjectUnsubscribedError = createErrorClass(function (_super) {
    return function ObjectUnsubscribedErrorImpl() {
        _super(this);
        this.name = 'ObjectUnsubscribedError';
        this.message = 'object unsubscribed';
    };
});

var Subject = (function (_super) {
    __extends(Subject, _super);
    function Subject() {
        var _this = _super.call(this) || this;
        _this.closed = false;
        _this.currentObservers = null;
        _this.observers = [];
        _this.isStopped = false;
        _this.hasError = false;
        _this.thrownError = null;
        return _this;
    }
    Subject.prototype.lift = function (operator) {
        var subject = new AnonymousSubject(this, this);
        subject.operator = operator;
        return subject;
    };
    Subject.prototype._throwIfClosed = function () {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
    };
    Subject.prototype.next = function (value) {
        var _this = this;
        errorContext(function () {
            var e_1, _a;
            _this._throwIfClosed();
            if (!_this.isStopped) {
                if (!_this.currentObservers) {
                    _this.currentObservers = Array.from(_this.observers);
                }
                try {
                    for (var _b = __values(_this.currentObservers), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var observer = _c.value;
                        observer.next(value);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        });
    };
    Subject.prototype.error = function (err) {
        var _this = this;
        errorContext(function () {
            _this._throwIfClosed();
            if (!_this.isStopped) {
                _this.hasError = _this.isStopped = true;
                _this.thrownError = err;
                var observers = _this.observers;
                while (observers.length) {
                    observers.shift().error(err);
                }
            }
        });
    };
    Subject.prototype.complete = function () {
        var _this = this;
        errorContext(function () {
            _this._throwIfClosed();
            if (!_this.isStopped) {
                _this.isStopped = true;
                var observers = _this.observers;
                while (observers.length) {
                    observers.shift().complete();
                }
            }
        });
    };
    Subject.prototype.unsubscribe = function () {
        this.isStopped = this.closed = true;
        this.observers = this.currentObservers = null;
    };
    Object.defineProperty(Subject.prototype, "observed", {
        get: function () {
            var _a;
            return ((_a = this.observers) === null || _a === void 0 ? void 0 : _a.length) > 0;
        },
        enumerable: false,
        configurable: true
    });
    Subject.prototype._trySubscribe = function (subscriber) {
        this._throwIfClosed();
        return _super.prototype._trySubscribe.call(this, subscriber);
    };
    Subject.prototype._subscribe = function (subscriber) {
        this._throwIfClosed();
        this._checkFinalizedStatuses(subscriber);
        return this._innerSubscribe(subscriber);
    };
    Subject.prototype._innerSubscribe = function (subscriber) {
        var _this = this;
        var _a = this, hasError = _a.hasError, isStopped = _a.isStopped, observers = _a.observers;
        if (hasError || isStopped) {
            return EMPTY_SUBSCRIPTION;
        }
        this.currentObservers = null;
        observers.push(subscriber);
        return new Subscription(function () {
            _this.currentObservers = null;
            arrRemove(observers, subscriber);
        });
    };
    Subject.prototype._checkFinalizedStatuses = function (subscriber) {
        var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, isStopped = _a.isStopped;
        if (hasError) {
            subscriber.error(thrownError);
        }
        else if (isStopped) {
            subscriber.complete();
        }
    };
    Subject.prototype.asObservable = function () {
        var observable = new Observable();
        observable.source = this;
        return observable;
    };
    Subject.create = function (destination, source) {
        return new AnonymousSubject(destination, source);
    };
    return Subject;
}(Observable));
var AnonymousSubject = (function (_super) {
    __extends(AnonymousSubject, _super);
    function AnonymousSubject(destination, source) {
        var _this = _super.call(this) || this;
        _this.destination = destination;
        _this.source = source;
        return _this;
    }
    AnonymousSubject.prototype.next = function (value) {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.call(_a, value);
    };
    AnonymousSubject.prototype.error = function (err) {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.call(_a, err);
    };
    AnonymousSubject.prototype.complete = function () {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.complete) === null || _b === void 0 ? void 0 : _b.call(_a);
    };
    AnonymousSubject.prototype._subscribe = function (subscriber) {
        var _a, _b;
        return (_b = (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber)) !== null && _b !== void 0 ? _b : EMPTY_SUBSCRIPTION;
    };
    return AnonymousSubject;
}(Subject));

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
var URI = {
  getUrlVar : function (name){
    var vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
    });
    return vars[name];
  },
  createToken:function(){
    var rand = function() {
      return Math.random().toString(36).substr(2); // remove `0.`
    };

    var token = function() {
      return rand() + rand(); // to make it longer
    };
    return token();
  },
  shortURL:function(server,url){
    var p1= new Promise((resolve,reject)=>{
           fetch(server+'/api/shorten',{
              method: 'POST', // or 'PUT'
              body: JSON.stringify({url:url}),
              headers:{
                'Content-Type': 'application/json'
              }
             })
              .then((data)=>{
                  data.json().then((_data)=>{
                  console.log('Shorten:'+_data.shortUrl);
                  resolve(JSON.parse('{"response":"'+_data.shortUrl+'"}'));
                  });
            });

      });
    return p1;
  }


};

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
/**
 * @fileoverview
 * - Using the 'QRCode for Javascript library'
 * - Fixed dataset of 'QRCode for Javascript library' for support full-spec.
 * - this library has no dependencies.
 *
 * @author davidshimjs
 * @see <a href="http://www.d-project.com/" target="_blank">http://www.d-project.com/</a>
 * @see <a href="http://jeromeetienne.github.com/jquery-qrcode/" target="_blank">http://jeromeetienne.github.com/jquery-qrcode/</a>
 */
exports.QRCode = void 0;

(function () {
	//---------------------------------------------------------------------
	// QRCode for JavaScript
	//
	// Copyright (c) 2009 Kazuhiko Arase
	//
	// URL: http://www.d-project.com/
	//
	// Licensed under the MIT license:
	//   http://www.opensource.org/licenses/mit-license.php
	//
	// The word "QR Code" is registered trademark of
	// DENSO WAVE INCORPORATED
	//   http://www.denso-wave.com/qrcode/faqpatent-e.html
	//
	//---------------------------------------------------------------------
	function QR8bitByte(data) {
		this.mode = QRMode.MODE_8BIT_BYTE;
		this.data = data;
		this.parsedData = [];

		// Added to support UTF-8 Characters
		for (var i = 0, l = this.data.length; i < l; i++) {
			var byteArray = [];
			var code = this.data.charCodeAt(i);

			if (code > 0x10000) {
				byteArray[0] = 0xF0 | ((code & 0x1C0000) >>> 18);
				byteArray[1] = 0x80 | ((code & 0x3F000) >>> 12);
				byteArray[2] = 0x80 | ((code & 0xFC0) >>> 6);
				byteArray[3] = 0x80 | (code & 0x3F);
			} else if (code > 0x800) {
				byteArray[0] = 0xE0 | ((code & 0xF000) >>> 12);
				byteArray[1] = 0x80 | ((code & 0xFC0) >>> 6);
				byteArray[2] = 0x80 | (code & 0x3F);
			} else if (code > 0x80) {
				byteArray[0] = 0xC0 | ((code & 0x7C0) >>> 6);
				byteArray[1] = 0x80 | (code & 0x3F);
			} else {
				byteArray[0] = code;
			}

			this.parsedData.push(byteArray);
		}

		this.parsedData = Array.prototype.concat.apply([], this.parsedData);

		if (this.parsedData.length != this.data.length) {
			this.parsedData.unshift(191);
			this.parsedData.unshift(187);
			this.parsedData.unshift(239);
		}
	}

	QR8bitByte.prototype = {
		getLength: function (buffer) {
			return this.parsedData.length;
		},
		write: function (buffer) {
			for (var i = 0, l = this.parsedData.length; i < l; i++) {
				buffer.put(this.parsedData[i], 8);
			}
		}
	};

	function QRCodeModel(typeNumber, errorCorrectLevel) {
		this.typeNumber = typeNumber;
		this.errorCorrectLevel = errorCorrectLevel;
		this.modules = null;
		this.moduleCount = 0;
		this.dataCache = null;
		this.dataList = [];
	}

	QRCodeModel.prototype={addData:function(data){var newData=new QR8bitByte(data);this.dataList.push(newData);this.dataCache=null;},isDark:function(row,col){if(row<0||this.moduleCount<=row||col<0||this.moduleCount<=col){throw new Error(row+","+col);}
	return this.modules[row][col];},getModuleCount:function(){return this.moduleCount;},make:function(){this.makeImpl(false,this.getBestMaskPattern());},makeImpl:function(test,maskPattern){this.moduleCount=this.typeNumber*4+17;this.modules=new Array(this.moduleCount);for(var row=0;row<this.moduleCount;row++){this.modules[row]=new Array(this.moduleCount);for(var col=0;col<this.moduleCount;col++){this.modules[row][col]=null;}}
	this.setupPositionProbePattern(0,0);this.setupPositionProbePattern(this.moduleCount-7,0);this.setupPositionProbePattern(0,this.moduleCount-7);this.setupPositionAdjustPattern();this.setupTimingPattern();this.setupTypeInfo(test,maskPattern);if(this.typeNumber>=7){this.setupTypeNumber(test);}
	if(this.dataCache==null){this.dataCache=QRCodeModel.createData(this.typeNumber,this.errorCorrectLevel,this.dataList);}
	this.mapData(this.dataCache,maskPattern);},setupPositionProbePattern:function(row,col){for(var r=-1;r<=7;r++){if(row+r<=-1||this.moduleCount<=row+r)continue;for(var c=-1;c<=7;c++){if(col+c<=-1||this.moduleCount<=col+c)continue;if((0<=r&&r<=6&&(c==0||c==6))||(0<=c&&c<=6&&(r==0||r==6))||(2<=r&&r<=4&&2<=c&&c<=4)){this.modules[row+r][col+c]=true;}else {this.modules[row+r][col+c]=false;}}}},getBestMaskPattern:function(){var minLostPoint=0;var pattern=0;for(var i=0;i<8;i++){this.makeImpl(true,i);var lostPoint=QRUtil.getLostPoint(this);if(i==0||minLostPoint>lostPoint){minLostPoint=lostPoint;pattern=i;}}
	return pattern;},createMovieClip:function(target_mc,instance_name,depth){var qr_mc=target_mc.createEmptyMovieClip(instance_name,depth);var cs=1;this.make();for(var row=0;row<this.modules.length;row++){var y=row*cs;for(var col=0;col<this.modules[row].length;col++){var x=col*cs;var dark=this.modules[row][col];if(dark){qr_mc.beginFill(0,100);qr_mc.moveTo(x,y);qr_mc.lineTo(x+cs,y);qr_mc.lineTo(x+cs,y+cs);qr_mc.lineTo(x,y+cs);qr_mc.endFill();}}}
	return qr_mc;},setupTimingPattern:function(){for(var r=8;r<this.moduleCount-8;r++){if(this.modules[r][6]!=null){continue;}
	this.modules[r][6]=(r%2==0);}
	for(var c=8;c<this.moduleCount-8;c++){if(this.modules[6][c]!=null){continue;}
	this.modules[6][c]=(c%2==0);}},setupPositionAdjustPattern:function(){var pos=QRUtil.getPatternPosition(this.typeNumber);for(var i=0;i<pos.length;i++){for(var j=0;j<pos.length;j++){var row=pos[i];var col=pos[j];if(this.modules[row][col]!=null){continue;}
	for(var r=-2;r<=2;r++){for(var c=-2;c<=2;c++){if(r==-2||r==2||c==-2||c==2||(r==0&&c==0)){this.modules[row+r][col+c]=true;}else {this.modules[row+r][col+c]=false;}}}}}},setupTypeNumber:function(test){var bits=QRUtil.getBCHTypeNumber(this.typeNumber);for(var i=0;i<18;i++){var mod=(!test&&((bits>>i)&1)==1);this.modules[Math.floor(i/3)][i%3+this.moduleCount-8-3]=mod;}
	for(var i=0;i<18;i++){var mod=(!test&&((bits>>i)&1)==1);this.modules[i%3+this.moduleCount-8-3][Math.floor(i/3)]=mod;}},setupTypeInfo:function(test,maskPattern){var data=(this.errorCorrectLevel<<3)|maskPattern;var bits=QRUtil.getBCHTypeInfo(data);for(var i=0;i<15;i++){var mod=(!test&&((bits>>i)&1)==1);if(i<6){this.modules[i][8]=mod;}else if(i<8){this.modules[i+1][8]=mod;}else {this.modules[this.moduleCount-15+i][8]=mod;}}
	for(var i=0;i<15;i++){var mod=(!test&&((bits>>i)&1)==1);if(i<8){this.modules[8][this.moduleCount-i-1]=mod;}else if(i<9){this.modules[8][15-i-1+1]=mod;}else {this.modules[8][15-i-1]=mod;}}
	this.modules[this.moduleCount-8][8]=(!test);},mapData:function(data,maskPattern){var inc=-1;var row=this.moduleCount-1;var bitIndex=7;var byteIndex=0;for(var col=this.moduleCount-1;col>0;col-=2){if(col==6)col--;while(true){for(var c=0;c<2;c++){if(this.modules[row][col-c]==null){var dark=false;if(byteIndex<data.length){dark=(((data[byteIndex]>>>bitIndex)&1)==1);}
	var mask=QRUtil.getMask(maskPattern,row,col-c);if(mask){dark=!dark;}
	this.modules[row][col-c]=dark;bitIndex--;if(bitIndex==-1){byteIndex++;bitIndex=7;}}}
	row+=inc;if(row<0||this.moduleCount<=row){row-=inc;inc=-inc;break;}}}}};QRCodeModel.PAD0=0xEC;QRCodeModel.PAD1=0x11;QRCodeModel.createData=function(typeNumber,errorCorrectLevel,dataList){var rsBlocks=QRRSBlock.getRSBlocks(typeNumber,errorCorrectLevel);var buffer=new QRBitBuffer();for(var i=0;i<dataList.length;i++){var data=dataList[i];buffer.put(data.mode,4);buffer.put(data.getLength(),QRUtil.getLengthInBits(data.mode,typeNumber));data.write(buffer);}
	var totalDataCount=0;for(var i=0;i<rsBlocks.length;i++){totalDataCount+=rsBlocks[i].dataCount;}
	if(buffer.getLengthInBits()>totalDataCount*8){throw new Error("code length overflow. ("
	+buffer.getLengthInBits()
	+">"
	+totalDataCount*8
	+")");}
	if(buffer.getLengthInBits()+4<=totalDataCount*8){buffer.put(0,4);}
	while(buffer.getLengthInBits()%8!=0){buffer.putBit(false);}
	while(true){if(buffer.getLengthInBits()>=totalDataCount*8){break;}
	buffer.put(QRCodeModel.PAD0,8);if(buffer.getLengthInBits()>=totalDataCount*8){break;}
	buffer.put(QRCodeModel.PAD1,8);}
	return QRCodeModel.createBytes(buffer,rsBlocks);};QRCodeModel.createBytes=function(buffer,rsBlocks){var offset=0;var maxDcCount=0;var maxEcCount=0;var dcdata=new Array(rsBlocks.length);var ecdata=new Array(rsBlocks.length);for(var r=0;r<rsBlocks.length;r++){var dcCount=rsBlocks[r].dataCount;var ecCount=rsBlocks[r].totalCount-dcCount;maxDcCount=Math.max(maxDcCount,dcCount);maxEcCount=Math.max(maxEcCount,ecCount);dcdata[r]=new Array(dcCount);for(var i=0;i<dcdata[r].length;i++){dcdata[r][i]=0xff&buffer.buffer[i+offset];}
	offset+=dcCount;var rsPoly=QRUtil.getErrorCorrectPolynomial(ecCount);var rawPoly=new QRPolynomial(dcdata[r],rsPoly.getLength()-1);var modPoly=rawPoly.mod(rsPoly);ecdata[r]=new Array(rsPoly.getLength()-1);for(var i=0;i<ecdata[r].length;i++){var modIndex=i+modPoly.getLength()-ecdata[r].length;ecdata[r][i]=(modIndex>=0)?modPoly.get(modIndex):0;}}
	var totalCodeCount=0;for(var i=0;i<rsBlocks.length;i++){totalCodeCount+=rsBlocks[i].totalCount;}
	var data=new Array(totalCodeCount);var index=0;for(var i=0;i<maxDcCount;i++){for(var r=0;r<rsBlocks.length;r++){if(i<dcdata[r].length){data[index++]=dcdata[r][i];}}}
	for(var i=0;i<maxEcCount;i++){for(var r=0;r<rsBlocks.length;r++){if(i<ecdata[r].length){data[index++]=ecdata[r][i];}}}
	return data;};var QRMode={MODE_NUMBER:1<<0,MODE_ALPHA_NUM:1<<1,MODE_8BIT_BYTE:1<<2,MODE_KANJI:1<<3};var QRErrorCorrectLevel={L:1,M:0,Q:3,H:2};var QRMaskPattern={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};var QRUtil={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:(1<<10)|(1<<8)|(1<<5)|(1<<4)|(1<<2)|(1<<1)|(1<<0),G18:(1<<12)|(1<<11)|(1<<10)|(1<<9)|(1<<8)|(1<<5)|(1<<2)|(1<<0),G15_MASK:(1<<14)|(1<<12)|(1<<10)|(1<<4)|(1<<1),getBCHTypeInfo:function(data){var d=data<<10;while(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G15)>=0){d^=(QRUtil.G15<<(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G15)));}
	return ((data<<10)|d)^QRUtil.G15_MASK;},getBCHTypeNumber:function(data){var d=data<<12;while(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G18)>=0){d^=(QRUtil.G18<<(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G18)));}
	return (data<<12)|d;},getBCHDigit:function(data){var digit=0;while(data!=0){digit++;data>>>=1;}
	return digit;},getPatternPosition:function(typeNumber){return QRUtil.PATTERN_POSITION_TABLE[typeNumber-1];},getMask:function(maskPattern,i,j){switch(maskPattern){case QRMaskPattern.PATTERN000:return (i+j)%2==0;case QRMaskPattern.PATTERN001:return i%2==0;case QRMaskPattern.PATTERN010:return j%3==0;case QRMaskPattern.PATTERN011:return (i+j)%3==0;case QRMaskPattern.PATTERN100:return (Math.floor(i/2)+Math.floor(j/3))%2==0;case QRMaskPattern.PATTERN101:return (i*j)%2+(i*j)%3==0;case QRMaskPattern.PATTERN110:return ((i*j)%2+(i*j)%3)%2==0;case QRMaskPattern.PATTERN111:return ((i*j)%3+(i+j)%2)%2==0;default:throw new Error("bad maskPattern:"+maskPattern);}},getErrorCorrectPolynomial:function(errorCorrectLength){var a=new QRPolynomial([1],0);for(var i=0;i<errorCorrectLength;i++){a=a.multiply(new QRPolynomial([1,QRMath.gexp(i)],0));}
	return a;},getLengthInBits:function(mode,type){if(1<=type&&type<10){switch(mode){case QRMode.MODE_NUMBER:return 10;case QRMode.MODE_ALPHA_NUM:return 9;case QRMode.MODE_8BIT_BYTE:return 8;case QRMode.MODE_KANJI:return 8;default:throw new Error("mode:"+mode);}}else if(type<27){switch(mode){case QRMode.MODE_NUMBER:return 12;case QRMode.MODE_ALPHA_NUM:return 11;case QRMode.MODE_8BIT_BYTE:return 16;case QRMode.MODE_KANJI:return 10;default:throw new Error("mode:"+mode);}}else if(type<41){switch(mode){case QRMode.MODE_NUMBER:return 14;case QRMode.MODE_ALPHA_NUM:return 13;case QRMode.MODE_8BIT_BYTE:return 16;case QRMode.MODE_KANJI:return 12;default:throw new Error("mode:"+mode);}}else {throw new Error("type:"+type);}},getLostPoint:function(qrCode){var moduleCount=qrCode.getModuleCount();var lostPoint=0;for(var row=0;row<moduleCount;row++){for(var col=0;col<moduleCount;col++){var sameCount=0;var dark=qrCode.isDark(row,col);for(var r=-1;r<=1;r++){if(row+r<0||moduleCount<=row+r){continue;}
	for(var c=-1;c<=1;c++){if(col+c<0||moduleCount<=col+c){continue;}
	if(r==0&&c==0){continue;}
	if(dark==qrCode.isDark(row+r,col+c)){sameCount++;}}}
	if(sameCount>5){lostPoint+=(3+sameCount-5);}}}
	for(var row=0;row<moduleCount-1;row++){for(var col=0;col<moduleCount-1;col++){var count=0;if(qrCode.isDark(row,col))count++;if(qrCode.isDark(row+1,col))count++;if(qrCode.isDark(row,col+1))count++;if(qrCode.isDark(row+1,col+1))count++;if(count==0||count==4){lostPoint+=3;}}}
	for(var row=0;row<moduleCount;row++){for(var col=0;col<moduleCount-6;col++){if(qrCode.isDark(row,col)&&!qrCode.isDark(row,col+1)&&qrCode.isDark(row,col+2)&&qrCode.isDark(row,col+3)&&qrCode.isDark(row,col+4)&&!qrCode.isDark(row,col+5)&&qrCode.isDark(row,col+6)){lostPoint+=40;}}}
	for(var col=0;col<moduleCount;col++){for(var row=0;row<moduleCount-6;row++){if(qrCode.isDark(row,col)&&!qrCode.isDark(row+1,col)&&qrCode.isDark(row+2,col)&&qrCode.isDark(row+3,col)&&qrCode.isDark(row+4,col)&&!qrCode.isDark(row+5,col)&&qrCode.isDark(row+6,col)){lostPoint+=40;}}}
	var darkCount=0;for(var col=0;col<moduleCount;col++){for(var row=0;row<moduleCount;row++){if(qrCode.isDark(row,col)){darkCount++;}}}
	var ratio=Math.abs(100*darkCount/moduleCount/moduleCount-50)/5;lostPoint+=ratio*10;return lostPoint;}};var QRMath={glog:function(n){if(n<1){throw new Error("glog("+n+")");}
	return QRMath.LOG_TABLE[n];},gexp:function(n){while(n<0){n+=255;}
	while(n>=256){n-=255;}
	return QRMath.EXP_TABLE[n];},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)};for(var i=0;i<8;i++){QRMath.EXP_TABLE[i]=1<<i;}
	for(var i=8;i<256;i++){QRMath.EXP_TABLE[i]=QRMath.EXP_TABLE[i-4]^QRMath.EXP_TABLE[i-5]^QRMath.EXP_TABLE[i-6]^QRMath.EXP_TABLE[i-8];}
	for(var i=0;i<255;i++){QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]]=i;}
	function QRPolynomial(num,shift){if(num.length==undefined){throw new Error(num.length+"/"+shift);}
	var offset=0;while(offset<num.length&&num[offset]==0){offset++;}
	this.num=new Array(num.length-offset+shift);for(var i=0;i<num.length-offset;i++){this.num[i]=num[i+offset];}}
	QRPolynomial.prototype={get:function(index){return this.num[index];},getLength:function(){return this.num.length;},multiply:function(e){var num=new Array(this.getLength()+e.getLength()-1);for(var i=0;i<this.getLength();i++){for(var j=0;j<e.getLength();j++){num[i+j]^=QRMath.gexp(QRMath.glog(this.get(i))+QRMath.glog(e.get(j)));}}
	return new QRPolynomial(num,0);},mod:function(e){if(this.getLength()-e.getLength()<0){return this;}
	var ratio=QRMath.glog(this.get(0))-QRMath.glog(e.get(0));var num=new Array(this.getLength());for(var i=0;i<this.getLength();i++){num[i]=this.get(i);}
	for(var i=0;i<e.getLength();i++){num[i]^=QRMath.gexp(QRMath.glog(e.get(i))+ratio);}
	return new QRPolynomial(num,0).mod(e);}};function QRRSBlock(totalCount,dataCount){this.totalCount=totalCount;this.dataCount=dataCount;}
	QRRSBlock.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]];QRRSBlock.getRSBlocks=function(typeNumber,errorCorrectLevel){var rsBlock=QRRSBlock.getRsBlockTable(typeNumber,errorCorrectLevel);if(rsBlock==undefined){throw new Error("bad rs block @ typeNumber:"+typeNumber+"/errorCorrectLevel:"+errorCorrectLevel);}
	var length=rsBlock.length/3;var list=[];for(var i=0;i<length;i++){var count=rsBlock[i*3+0];var totalCount=rsBlock[i*3+1];var dataCount=rsBlock[i*3+2];for(var j=0;j<count;j++){list.push(new QRRSBlock(totalCount,dataCount));}}
	return list;};QRRSBlock.getRsBlockTable=function(typeNumber,errorCorrectLevel){switch(errorCorrectLevel){case QRErrorCorrectLevel.L:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+0];case QRErrorCorrectLevel.M:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+1];case QRErrorCorrectLevel.Q:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+2];case QRErrorCorrectLevel.H:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+3];default:return undefined;}};function QRBitBuffer(){this.buffer=[];this.length=0;}
	QRBitBuffer.prototype={get:function(index){var bufIndex=Math.floor(index/8);return ((this.buffer[bufIndex]>>>(7-index%8))&1)==1;},put:function(num,length){for(var i=0;i<length;i++){this.putBit(((num>>>(length-i-1))&1)==1);}},getLengthInBits:function(){return this.length;},putBit:function(bit){var bufIndex=Math.floor(this.length/8);if(this.buffer.length<=bufIndex){this.buffer.push(0);}
	if(bit){this.buffer[bufIndex]|=(0x80>>>(this.length%8));}
	this.length++;}};var QRCodeLimitLength=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]];

	function _isSupportCanvas() {
		return typeof CanvasRenderingContext2D != "undefined";
	}

	// android 2.x doesn't support Data-URI spec
	function _getAndroid() {
		var android = false;
		var sAgent = navigator.userAgent;

		if (/android/i.test(sAgent)) { // android
			android = true;
			var aMat = sAgent.toString().match(/android ([0-9]\.[0-9])/i);

			if (aMat && aMat[1]) {
				android = parseFloat(aMat[1]);
			}
		}

		return android;
	}

	var svgDrawer = (function() {

		var Drawing = function (el, htOption) {
			this._el = el;
			this._htOption = htOption;
		};

		Drawing.prototype.draw = function (oQRCode) {
			var _htOption = this._htOption;
			var _el = this._el;
			var nCount = oQRCode.getModuleCount();
			Math.floor(_htOption.width / nCount);
			Math.floor(_htOption.height / nCount);

			this.clear();

			function makeSVG(tag, attrs) {
				var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
				for (var k in attrs)
					if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
				return el;
			}

			var svg = makeSVG("svg" , {'viewBox': '0 0 ' + String(nCount) + " " + String(nCount), 'width': '100%', 'height': '100%', 'fill': _htOption.colorLight});
			svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
			_el.appendChild(svg);

			svg.appendChild(makeSVG("rect", {"fill": _htOption.colorLight, "width": "100%", "height": "100%"}));
			svg.appendChild(makeSVG("rect", {"fill": _htOption.colorDark, "width": "1", "height": "1", "id": "template"}));

			for (var row = 0; row < nCount; row++) {
				for (var col = 0; col < nCount; col++) {
					if (oQRCode.isDark(row, col)) {
						var child = makeSVG("use", {"x": String(col), "y": String(row)});
						child.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#template");
						svg.appendChild(child);
					}
				}
			}
		};
		Drawing.prototype.clear = function () {
			while (this._el.hasChildNodes())
				this._el.removeChild(this._el.lastChild);
		};
		return Drawing;
	})();

	var useSVG = document.documentElement.tagName.toLowerCase() === "svg";

	// Drawing in DOM by using Table tag
	var Drawing = useSVG ? svgDrawer : !_isSupportCanvas() ? (function () {
		var Drawing = function (el, htOption) {
			this._el = el;
			this._htOption = htOption;
		};

		/**
		 * Draw the QRCode
		 *
		 * @param {QRCode} oQRCode
		 */
		Drawing.prototype.draw = function (oQRCode) {
            var _htOption = this._htOption;
            var _el = this._el;
			var nCount = oQRCode.getModuleCount();
			var nWidth = Math.floor(_htOption.width / nCount);
			var nHeight = Math.floor(_htOption.height / nCount);
			var aHTML = ['<table style="border:0;border-collapse:collapse;">'];

			for (var row = 0; row < nCount; row++) {
				aHTML.push('<tr>');

				for (var col = 0; col < nCount; col++) {
					aHTML.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:' + nWidth + 'px;height:' + nHeight + 'px;background-color:' + (oQRCode.isDark(row, col) ? _htOption.colorDark : _htOption.colorLight) + ';"></td>');
				}

				aHTML.push('</tr>');
			}

			aHTML.push('</table>');
			_el.innerHTML = aHTML.join('');

			// Fix the margin values as real size.
			var elTable = _el.childNodes[0];
			var nLeftMarginTable = (_htOption.width - elTable.offsetWidth) / 2;
			var nTopMarginTable = (_htOption.height - elTable.offsetHeight) / 2;

			if (nLeftMarginTable > 0 && nTopMarginTable > 0) {
				elTable.style.margin = nTopMarginTable + "px " + nLeftMarginTable + "px";
			}
		};

		/**
		 * Clear the QRCode
		 */
		Drawing.prototype.clear = function () {
			this._el.innerHTML = '';
		};

		return Drawing;
	})() : (function () { // Drawing in Canvas
		function _onMakeImage() {
			this._elImage.src = this._elCanvas.toDataURL("image/png");
			this._elImage.style.display = "block";
			this._elCanvas.style.display = "none";
		}


		/**
		 * Check whether the user's browser supports Data URI or not
		 *
		 * @private
		 * @param {Function} fSuccess Occurs if it supports Data URI
		 * @param {Function} fFail Occurs if it doesn't support Data URI
		 */
		function _safeSetDataURI(fSuccess, fFail) {
            var self = this;
            self._fFail = fFail;
            self._fSuccess = fSuccess;

            // Check it just once
            if (self._bSupportDataURI === null) {
                var el = document.createElement("img");
                var fOnError = function() {
                    self._bSupportDataURI = false;

                    if (self._fFail) {
                        self._fFail.call(self);
                    }
                };
                var fOnSuccess = function() {
                    self._bSupportDataURI = true;

                    if (self._fSuccess) {
                        self._fSuccess.call(self);
                    }
                };

                el.onabort = fOnError;
                el.onerror = fOnError;
                el.onload = fOnSuccess;
                el.src = "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="; // the Image contains 1px data.
                return;
            } else if (self._bSupportDataURI === true && self._fSuccess) {
                self._fSuccess.call(self);
            } else if (self._bSupportDataURI === false && self._fFail) {
                self._fFail.call(self);
            }
		}
		/**
		 * Drawing QRCode by using canvas
		 *
		 * @constructor
		 * @param {HTMLElement} el
		 * @param {Object} htOption QRCode Options
		 */
		var Drawing = function (el, htOption) {
    		this._bIsPainted = false;
    		this._android = _getAndroid();

			this._htOption = htOption;
			this._elCanvas = document.createElement("canvas");
			this._elCanvas.width = htOption.width;
			this._elCanvas.height = htOption.height;
			el.appendChild(this._elCanvas);
			this._el = el;
			this._oContext = this._elCanvas.getContext("2d");
			this._bIsPainted = false;
			this._elImage = document.createElement("img");
			this._elImage.alt = "Scan me!";
			this._elImage.style.display = "none";
			this._el.appendChild(this._elImage);
			this._bSupportDataURI = null;
		};

		/**
		 * Draw the QRCode
		 *
		 * @param {QRCode} oQRCode
		 */
		Drawing.prototype.draw = function (oQRCode) {
            var _elImage = this._elImage;
            var _oContext = this._oContext;
            var _htOption = this._htOption;

			var nCount = oQRCode.getModuleCount();
			var nWidth = _htOption.width / nCount;
			var nHeight = _htOption.height / nCount;
			var nRoundedWidth = Math.round(nWidth);
			var nRoundedHeight = Math.round(nHeight);

			_elImage.style.display = "none";
			this.clear();

			for (var row = 0; row < nCount; row++) {
				for (var col = 0; col < nCount; col++) {
					var bIsDark = oQRCode.isDark(row, col);
					var nLeft = col * nWidth;
					var nTop = row * nHeight;
					_oContext.strokeStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
					_oContext.lineWidth = 1;
					_oContext.fillStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
					_oContext.fillRect(nLeft, nTop, nWidth, nHeight);

					// 안티 앨리어싱 방지 처리
					_oContext.strokeRect(
						Math.floor(nLeft) + 0.5,
						Math.floor(nTop) + 0.5,
						nRoundedWidth,
						nRoundedHeight
					);

					_oContext.strokeRect(
						Math.ceil(nLeft) - 0.5,
						Math.ceil(nTop) - 0.5,
						nRoundedWidth,
						nRoundedHeight
					);
				}
			}

			this._bIsPainted = true;
		};

		/**
		 * Make the image from Canvas if the browser supports Data URI.
		 */
		Drawing.prototype.makeImage = function () {
			if (this._bIsPainted) {
				_safeSetDataURI.call(this, _onMakeImage);
			}
		};

		/**
		 * Return whether the QRCode is painted or not
		 *
		 * @return {Boolean}
		 */
		Drawing.prototype.isPainted = function () {
			return this._bIsPainted;
		};

		/**
		 * Clear the QRCode
		 */
		Drawing.prototype.clear = function () {
			this._oContext.clearRect(0, 0, this._elCanvas.width, this._elCanvas.height);
			this._bIsPainted = false;
		};

		/**
		 * @private
		 * @param {Number} nNumber
		 */
		Drawing.prototype.round = function (nNumber) {
			if (!nNumber) {
				return nNumber;
			}

			return Math.floor(nNumber * 1000) / 1000;
		};

		return Drawing;
	})();

	/**
	 * Get the type by string length
	 *
	 * @private
	 * @param {String} sText
	 * @param {Number} nCorrectLevel
	 * @return {Number} type
	 */
	function _getTypeNumber(sText, nCorrectLevel) {
		var nType = 1;
		var length = _getUTF8Length(sText);

		for (var i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
			var nLimit = 0;

			switch (nCorrectLevel) {
				case QRErrorCorrectLevel.L :
					nLimit = QRCodeLimitLength[i][0];
					break;
				case QRErrorCorrectLevel.M :
					nLimit = QRCodeLimitLength[i][1];
					break;
				case QRErrorCorrectLevel.Q :
					nLimit = QRCodeLimitLength[i][2];
					break;
				case QRErrorCorrectLevel.H :
					nLimit = QRCodeLimitLength[i][3];
					break;
			}

			if (length <= nLimit) {
				break;
			} else {
				nType++;
			}
		}

		if (nType > QRCodeLimitLength.length) {
			throw new Error("Too long data");
		}

		return nType;
	}

	function _getUTF8Length(sText) {
		var replacedText = encodeURI(sText).toString().replace(/\%[0-9a-fA-F]{2}/g, 'a');
		return replacedText.length + (replacedText.length != sText ? 3 : 0);
	}

	/**
	 * @class QRCode
	 * @constructor
	 * @example
	 * new QRCode(document.getElementById("test"), "http://jindo.dev.naver.com/collie");
	 *
	 * @example
	 * var oQRCode = new QRCode("test", {
	 *    text : "http://naver.com",
	 *    width : 128,
	 *    height : 128
	 * });
	 *
	 * oQRCode.clear(); // Clear the QRCode.
	 * oQRCode.makeCode("http://map.naver.com"); // Re-create the QRCode.
	 *
	 * @param {HTMLElement|String} el target element or 'id' attribute of element.
	 * @param {Object|String} vOption
	 * @param {String} vOption.text QRCode link data
	 * @param {Number} [vOption.width=256]
	 * @param {Number} [vOption.height=256]
	 * @param {String} [vOption.colorDark="#000000"]
	 * @param {String} [vOption.colorLight="#ffffff"]
	 * @param {QRCode.CorrectLevel} [vOption.correctLevel=QRCode.CorrectLevel.H] [L|M|Q|H]
	 */
	exports.QRCode = function (el, vOption) {
		this._htOption = {
			width : 256,
			height : 256,
			typeNumber : 4,
			colorDark : "#000000",
			colorLight : "#ffffff",
			correctLevel : QRErrorCorrectLevel.H
		};

		if (typeof vOption === 'string') {
			vOption	= {
				text : vOption
			};
		}

		// Overwrites options
		if (vOption) {
			for (var i in vOption) {
				this._htOption[i] = vOption[i];
			}
		}

		if (typeof el == "string") {
			el = document.querySelector(el);
		}

		if (this._htOption.useSVG) {
			Drawing = svgDrawer;
		}

		this._android = _getAndroid();
		this._el = el;
		this._oQRCode = null;
		this._oDrawing = new Drawing(this._el, this._htOption);

		if (this._htOption.text) {
			this.makeCode(this._htOption.text);
		}
	};

	/**
	 * Make the QRCode
	 *
	 * @param {String} sText link data
	 */
	exports.QRCode.prototype.makeCode = function (sText) {
		this._oQRCode = new QRCodeModel(_getTypeNumber(sText, this._htOption.correctLevel), this._htOption.correctLevel);
		this._oQRCode.addData(sText);
		this._oQRCode.make();
		this._el.title = sText;
		this._oDrawing.draw(this._oQRCode);
		this.makeImage();
	};

	/**
	 * Make the Image from Canvas element
	 * - It occurs automatically
	 * - Android below 3 doesn't support Data-URI spec.
	 *
	 * @private
	 */
	exports.QRCode.prototype.makeImage = function () {
		if (typeof this._oDrawing.makeImage == "function" && (!this._android || this._android >= 3)) {
			this._oDrawing.makeImage();
		}
	};

	/**
	 * Clear the QRCode
	 */
	exports.QRCode.prototype.clear = function () {
		this._oDrawing.clear();
	};

	/**
	 * @name QRCode.CorrectLevel
	 */
	exports.QRCode.CorrectLevel = QRErrorCorrectLevel;
})();

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
var Hash ={

   genRanHex:function(size)
    {
        return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    } 

};

// Current version.
var VERSION = '1.13.6';

// Establish the root object, `window` (`self`) in the browser, `global`
// on the server, or `this` in some virtual machines. We use `self`
// instead of `window` for `WebWorker` support.
var root = (typeof self == 'object' && self.self === self && self) ||
          (typeof global == 'object' && global.global === global && global) ||
          Function('return this')() ||
          {};

// Save bytes in the minified (but not gzipped) version:
var ArrayProto = Array.prototype, ObjProto = Object.prototype;
var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

// Create quick reference variables for speed access to core prototypes.
var push = ArrayProto.push,
    slice = ArrayProto.slice,
    toString$2 = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty;

// Modern feature detection.
var supportsArrayBuffer = typeof ArrayBuffer !== 'undefined',
    supportsDataView = typeof DataView !== 'undefined';

// All **ECMAScript 5+** native function implementations that we hope to use
// are declared here.
var nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeCreate = Object.create,
    nativeIsView = supportsArrayBuffer && ArrayBuffer.isView;

// Create references to these builtin functions because we override them.
var _isNaN = isNaN,
    _isFinite = isFinite;

// Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
  'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

// The largest integer that can be represented exactly.
var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

// Some functions take a variable number of arguments, or a few expected
// arguments at the beginning and then a variable number of values to operate
// on. This helper accumulates all remaining arguments past the function’s
// argument length (or an explicit `startIndex`), into an array that becomes
// the last argument. Similar to ES6’s "rest parameter".
function restArguments(func, startIndex) {
  startIndex = startIndex == null ? func.length - 1 : +startIndex;
  return function() {
    var length = Math.max(arguments.length - startIndex, 0),
        rest = Array(length),
        index = 0;
    for (; index < length; index++) {
      rest[index] = arguments[index + startIndex];
    }
    switch (startIndex) {
      case 0: return func.call(this, rest);
      case 1: return func.call(this, arguments[0], rest);
      case 2: return func.call(this, arguments[0], arguments[1], rest);
    }
    var args = Array(startIndex + 1);
    for (index = 0; index < startIndex; index++) {
      args[index] = arguments[index];
    }
    args[startIndex] = rest;
    return func.apply(this, args);
  };
}

// Is a given variable an object?
function isObject$1(obj) {
  var type = typeof obj;
  return type === 'function' || (type === 'object' && !!obj);
}

// Is a given value equal to null?
function isNull(obj) {
  return obj === null;
}

// Is a given variable undefined?
function isUndefined(obj) {
  return obj === void 0;
}

// Is a given value a boolean?
function isBoolean(obj) {
  return obj === true || obj === false || toString$2.call(obj) === '[object Boolean]';
}

// Is a given value a DOM element?
function isElement(obj) {
  return !!(obj && obj.nodeType === 1);
}

// Internal function for creating a `toString`-based type tester.
function tagTester(name) {
  var tag = '[object ' + name + ']';
  return function(obj) {
    return toString$2.call(obj) === tag;
  };
}

var isString = tagTester('String');

var isNumber = tagTester('Number');

var isDate = tagTester('Date');

var isRegExp = tagTester('RegExp');

var isError = tagTester('Error');

var isSymbol = tagTester('Symbol');

var isArrayBuffer = tagTester('ArrayBuffer');

var isFunction = tagTester('Function');

// Optimize `isFunction` if appropriate. Work around some `typeof` bugs in old
// v8, IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
var nodelist = root.document && root.document.childNodes;
if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
  isFunction = function(obj) {
    return typeof obj == 'function' || false;
  };
}

var isFunction$1 = isFunction;

var hasObjectTag = tagTester('Object');

// In IE 10 - Edge 13, `DataView` has string tag `'[object Object]'`.
// In IE 11, the most common among them, this problem also applies to
// `Map`, `WeakMap` and `Set`.
var hasStringTagBug = (
      supportsDataView && hasObjectTag(new DataView(new ArrayBuffer(8)))
    ),
    isIE11 = (typeof Map !== 'undefined' && hasObjectTag(new Map));

var isDataView = tagTester('DataView');

// In IE 10 - Edge 13, we need a different heuristic
// to determine whether an object is a `DataView`.
function ie10IsDataView(obj) {
  return obj != null && isFunction$1(obj.getInt8) && isArrayBuffer(obj.buffer);
}

var isDataView$1 = (hasStringTagBug ? ie10IsDataView : isDataView);

// Is a given value an array?
// Delegates to ECMA5's native `Array.isArray`.
var isArray = nativeIsArray || tagTester('Array');

// Internal function to check whether `key` is an own property name of `obj`.
function has$1(obj, key) {
  return obj != null && hasOwnProperty.call(obj, key);
}

var isArguments = tagTester('Arguments');

// Define a fallback version of the method in browsers (ahem, IE < 9), where
// there isn't any inspectable "Arguments" type.
(function() {
  if (!isArguments(arguments)) {
    isArguments = function(obj) {
      return has$1(obj, 'callee');
    };
  }
}());

var isArguments$1 = isArguments;

// Is a given object a finite number?
function isFinite$1(obj) {
  return !isSymbol(obj) && _isFinite(obj) && !isNaN(parseFloat(obj));
}

// Is the given value `NaN`?
function isNaN$1(obj) {
  return isNumber(obj) && _isNaN(obj);
}

// Predicate-generating function. Often useful outside of Underscore.
function constant(value) {
  return function() {
    return value;
  };
}

// Common internal logic for `isArrayLike` and `isBufferLike`.
function createSizePropertyCheck(getSizeProperty) {
  return function(collection) {
    var sizeProperty = getSizeProperty(collection);
    return typeof sizeProperty == 'number' && sizeProperty >= 0 && sizeProperty <= MAX_ARRAY_INDEX;
  }
}

// Internal helper to generate a function to obtain property `key` from `obj`.
function shallowProperty(key) {
  return function(obj) {
    return obj == null ? void 0 : obj[key];
  };
}

// Internal helper to obtain the `byteLength` property of an object.
var getByteLength = shallowProperty('byteLength');

// Internal helper to determine whether we should spend extensive checks against
// `ArrayBuffer` et al.
var isBufferLike = createSizePropertyCheck(getByteLength);

// Is a given value a typed array?
var typedArrayPattern = /\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/;
function isTypedArray(obj) {
  // `ArrayBuffer.isView` is the most future-proof, so use it when available.
  // Otherwise, fall back on the above regular expression.
  return nativeIsView ? (nativeIsView(obj) && !isDataView$1(obj)) :
                isBufferLike(obj) && typedArrayPattern.test(toString$2.call(obj));
}

var isTypedArray$1 = supportsArrayBuffer ? isTypedArray : constant(false);

// Internal helper to obtain the `length` property of an object.
var getLength = shallowProperty('length');

// Internal helper to create a simple lookup structure.
// `collectNonEnumProps` used to depend on `_.contains`, but this led to
// circular imports. `emulatedSet` is a one-off solution that only works for
// arrays of strings.
function emulatedSet(keys) {
  var hash = {};
  for (var l = keys.length, i = 0; i < l; ++i) hash[keys[i]] = true;
  return {
    contains: function(key) { return hash[key] === true; },
    push: function(key) {
      hash[key] = true;
      return keys.push(key);
    }
  };
}

// Internal helper. Checks `keys` for the presence of keys in IE < 9 that won't
// be iterated by `for key in ...` and thus missed. Extends `keys` in place if
// needed.
function collectNonEnumProps(obj, keys) {
  keys = emulatedSet(keys);
  var nonEnumIdx = nonEnumerableProps.length;
  var constructor = obj.constructor;
  var proto = (isFunction$1(constructor) && constructor.prototype) || ObjProto;

  // Constructor is a special case.
  var prop = 'constructor';
  if (has$1(obj, prop) && !keys.contains(prop)) keys.push(prop);

  while (nonEnumIdx--) {
    prop = nonEnumerableProps[nonEnumIdx];
    if (prop in obj && obj[prop] !== proto[prop] && !keys.contains(prop)) {
      keys.push(prop);
    }
  }
}

// Retrieve the names of an object's own properties.
// Delegates to **ECMAScript 5**'s native `Object.keys`.
function keys(obj) {
  if (!isObject$1(obj)) return [];
  if (nativeKeys) return nativeKeys(obj);
  var keys = [];
  for (var key in obj) if (has$1(obj, key)) keys.push(key);
  // Ahem, IE < 9.
  if (hasEnumBug) collectNonEnumProps(obj, keys);
  return keys;
}

// Is a given array, string, or object empty?
// An "empty" object has no enumerable own-properties.
function isEmpty(obj) {
  if (obj == null) return true;
  // Skip the more expensive `toString`-based type checks if `obj` has no
  // `.length`.
  var length = getLength(obj);
  if (typeof length == 'number' && (
    isArray(obj) || isString(obj) || isArguments$1(obj)
  )) return length === 0;
  return getLength(keys(obj)) === 0;
}

// Returns whether an object has a given set of `key:value` pairs.
function isMatch(object, attrs) {
  var _keys = keys(attrs), length = _keys.length;
  if (object == null) return !length;
  var obj = Object(object);
  for (var i = 0; i < length; i++) {
    var key = _keys[i];
    if (attrs[key] !== obj[key] || !(key in obj)) return false;
  }
  return true;
}

// If Underscore is called as a function, it returns a wrapped object that can
// be used OO-style. This wrapper holds altered versions of all functions added
// through `_.mixin`. Wrapped objects may be chained.
function _$1(obj) {
  if (obj instanceof _$1) return obj;
  if (!(this instanceof _$1)) return new _$1(obj);
  this._wrapped = obj;
}

_$1.VERSION = VERSION;

// Extracts the result from a wrapped and chained object.
_$1.prototype.value = function() {
  return this._wrapped;
};

// Provide unwrapping proxies for some methods used in engine operations
// such as arithmetic and JSON stringification.
_$1.prototype.valueOf = _$1.prototype.toJSON = _$1.prototype.value;

_$1.prototype.toString = function() {
  return String(this._wrapped);
};

// Internal function to wrap or shallow-copy an ArrayBuffer,
// typed array or DataView to a new view, reusing the buffer.
function toBufferView(bufferSource) {
  return new Uint8Array(
    bufferSource.buffer || bufferSource,
    bufferSource.byteOffset || 0,
    getByteLength(bufferSource)
  );
}

// We use this string twice, so give it a name for minification.
var tagDataView = '[object DataView]';

// Internal recursive comparison function for `_.isEqual`.
function eq(a, b, aStack, bStack) {
  // Identical objects are equal. `0 === -0`, but they aren't identical.
  // See the [Harmony `egal` proposal](https://wiki.ecmascript.org/doku.php?id=harmony:egal).
  if (a === b) return a !== 0 || 1 / a === 1 / b;
  // `null` or `undefined` only equal to itself (strict comparison).
  if (a == null || b == null) return false;
  // `NaN`s are equivalent, but non-reflexive.
  if (a !== a) return b !== b;
  // Exhaust primitive checks
  var type = typeof a;
  if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
  return deepEq(a, b, aStack, bStack);
}

// Internal recursive comparison function for `_.isEqual`.
function deepEq(a, b, aStack, bStack) {
  // Unwrap any wrapped objects.
  if (a instanceof _$1) a = a._wrapped;
  if (b instanceof _$1) b = b._wrapped;
  // Compare `[[Class]]` names.
  var className = toString$2.call(a);
  if (className !== toString$2.call(b)) return false;
  // Work around a bug in IE 10 - Edge 13.
  if (hasStringTagBug && className == '[object Object]' && isDataView$1(a)) {
    if (!isDataView$1(b)) return false;
    className = tagDataView;
  }
  switch (className) {
    // These types are compared by value.
    case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
    case '[object String]':
      // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
      // equivalent to `new String("5")`.
      return '' + a === '' + b;
    case '[object Number]':
      // `NaN`s are equivalent, but non-reflexive.
      // Object(NaN) is equivalent to NaN.
      if (+a !== +a) return +b !== +b;
      // An `egal` comparison is performed for other numeric values.
      return +a === 0 ? 1 / +a === 1 / b : +a === +b;
    case '[object Date]':
    case '[object Boolean]':
      // Coerce dates and booleans to numeric primitive values. Dates are compared by their
      // millisecond representations. Note that invalid dates with millisecond representations
      // of `NaN` are not equivalent.
      return +a === +b;
    case '[object Symbol]':
      return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
    case '[object ArrayBuffer]':
    case tagDataView:
      // Coerce to typed array so we can fall through.
      return deepEq(toBufferView(a), toBufferView(b), aStack, bStack);
  }

  var areArrays = className === '[object Array]';
  if (!areArrays && isTypedArray$1(a)) {
      var byteLength = getByteLength(a);
      if (byteLength !== getByteLength(b)) return false;
      if (a.buffer === b.buffer && a.byteOffset === b.byteOffset) return true;
      areArrays = true;
  }
  if (!areArrays) {
    if (typeof a != 'object' || typeof b != 'object') return false;

    // Objects with different constructors are not equivalent, but `Object`s or `Array`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(isFunction$1(aCtor) && aCtor instanceof aCtor &&
                             isFunction$1(bCtor) && bCtor instanceof bCtor)
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
  }
  // Assume equality for cyclic structures. The algorithm for detecting cyclic
  // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

  // Initializing stack of traversed objects.
  // It's done here since we only need them for objects and arrays comparison.
  aStack = aStack || [];
  bStack = bStack || [];
  var length = aStack.length;
  while (length--) {
    // Linear search. Performance is inversely proportional to the number of
    // unique nested structures.
    if (aStack[length] === a) return bStack[length] === b;
  }

  // Add the first object to the stack of traversed objects.
  aStack.push(a);
  bStack.push(b);

  // Recursively compare objects and arrays.
  if (areArrays) {
    // Compare array lengths to determine if a deep comparison is necessary.
    length = a.length;
    if (length !== b.length) return false;
    // Deep compare the contents, ignoring non-numeric properties.
    while (length--) {
      if (!eq(a[length], b[length], aStack, bStack)) return false;
    }
  } else {
    // Deep compare objects.
    var _keys = keys(a), key;
    length = _keys.length;
    // Ensure that both objects contain the same number of properties before comparing deep equality.
    if (keys(b).length !== length) return false;
    while (length--) {
      // Deep compare each member
      key = _keys[length];
      if (!(has$1(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
    }
  }
  // Remove the first object from the stack of traversed objects.
  aStack.pop();
  bStack.pop();
  return true;
}

// Perform a deep comparison to check if two objects are equal.
function isEqual(a, b) {
  return eq(a, b);
}

// Retrieve all the enumerable property names of an object.
function allKeys(obj) {
  if (!isObject$1(obj)) return [];
  var keys = [];
  for (var key in obj) keys.push(key);
  // Ahem, IE < 9.
  if (hasEnumBug) collectNonEnumProps(obj, keys);
  return keys;
}

// Since the regular `Object.prototype.toString` type tests don't work for
// some types in IE 11, we use a fingerprinting heuristic instead, based
// on the methods. It's not great, but it's the best we got.
// The fingerprint method lists are defined below.
function ie11fingerprint(methods) {
  var length = getLength(methods);
  return function(obj) {
    if (obj == null) return false;
    // `Map`, `WeakMap` and `Set` have no enumerable keys.
    var keys = allKeys(obj);
    if (getLength(keys)) return false;
    for (var i = 0; i < length; i++) {
      if (!isFunction$1(obj[methods[i]])) return false;
    }
    // If we are testing against `WeakMap`, we need to ensure that
    // `obj` doesn't have a `forEach` method in order to distinguish
    // it from a regular `Map`.
    return methods !== weakMapMethods || !isFunction$1(obj[forEachName]);
  };
}

// In the interest of compact minification, we write
// each string in the fingerprints only once.
var forEachName = 'forEach',
    hasName = 'has',
    commonInit = ['clear', 'delete'],
    mapTail = ['get', hasName, 'set'];

// `Map`, `WeakMap` and `Set` each have slightly different
// combinations of the above sublists.
var mapMethods = commonInit.concat(forEachName, mapTail),
    weakMapMethods = commonInit.concat(mapTail),
    setMethods = ['add'].concat(commonInit, forEachName, hasName);

var isMap = isIE11 ? ie11fingerprint(mapMethods) : tagTester('Map');

var isWeakMap = isIE11 ? ie11fingerprint(weakMapMethods) : tagTester('WeakMap');

var isSet = isIE11 ? ie11fingerprint(setMethods) : tagTester('Set');

var isWeakSet = tagTester('WeakSet');

// Retrieve the values of an object's properties.
function values(obj) {
  var _keys = keys(obj);
  var length = _keys.length;
  var values = Array(length);
  for (var i = 0; i < length; i++) {
    values[i] = obj[_keys[i]];
  }
  return values;
}

// Convert an object into a list of `[key, value]` pairs.
// The opposite of `_.object` with one argument.
function pairs(obj) {
  var _keys = keys(obj);
  var length = _keys.length;
  var pairs = Array(length);
  for (var i = 0; i < length; i++) {
    pairs[i] = [_keys[i], obj[_keys[i]]];
  }
  return pairs;
}

// Invert the keys and values of an object. The values must be serializable.
function invert(obj) {
  var result = {};
  var _keys = keys(obj);
  for (var i = 0, length = _keys.length; i < length; i++) {
    result[obj[_keys[i]]] = _keys[i];
  }
  return result;
}

// Return a sorted list of the function names available on the object.
function functions(obj) {
  var names = [];
  for (var key in obj) {
    if (isFunction$1(obj[key])) names.push(key);
  }
  return names.sort();
}

// An internal function for creating assigner functions.
function createAssigner(keysFunc, defaults) {
  return function(obj) {
    var length = arguments.length;
    if (defaults) obj = Object(obj);
    if (length < 2 || obj == null) return obj;
    for (var index = 1; index < length; index++) {
      var source = arguments[index],
          keys = keysFunc(source),
          l = keys.length;
      for (var i = 0; i < l; i++) {
        var key = keys[i];
        if (!defaults || obj[key] === void 0) obj[key] = source[key];
      }
    }
    return obj;
  };
}

// Extend a given object with all the properties in passed-in object(s).
var extend = createAssigner(allKeys);

// Assigns a given object with all the own properties in the passed-in
// object(s).
// (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
var extendOwn = createAssigner(keys);

// Fill in a given object with default properties.
var defaults = createAssigner(allKeys, true);

// Create a naked function reference for surrogate-prototype-swapping.
function ctor() {
  return function(){};
}

// An internal function for creating a new object that inherits from another.
function baseCreate(prototype) {
  if (!isObject$1(prototype)) return {};
  if (nativeCreate) return nativeCreate(prototype);
  var Ctor = ctor();
  Ctor.prototype = prototype;
  var result = new Ctor;
  Ctor.prototype = null;
  return result;
}

// Creates an object that inherits from the given prototype object.
// If additional properties are provided then they will be added to the
// created object.
function create(prototype, props) {
  var result = baseCreate(prototype);
  if (props) extendOwn(result, props);
  return result;
}

// Create a (shallow-cloned) duplicate of an object.
function clone(obj) {
  if (!isObject$1(obj)) return obj;
  return isArray(obj) ? obj.slice() : extend({}, obj);
}

// Invokes `interceptor` with the `obj` and then returns `obj`.
// The primary purpose of this method is to "tap into" a method chain, in
// order to perform operations on intermediate results within the chain.
function tap(obj, interceptor) {
  interceptor(obj);
  return obj;
}

// Normalize a (deep) property `path` to array.
// Like `_.iteratee`, this function can be customized.
function toPath$1(path) {
  return isArray(path) ? path : [path];
}
_$1.toPath = toPath$1;

// Internal wrapper for `_.toPath` to enable minification.
// Similar to `cb` for `_.iteratee`.
function toPath(path) {
  return _$1.toPath(path);
}

// Internal function to obtain a nested property in `obj` along `path`.
function deepGet(obj, path) {
  var length = path.length;
  for (var i = 0; i < length; i++) {
    if (obj == null) return void 0;
    obj = obj[path[i]];
  }
  return length ? obj : void 0;
}

// Get the value of the (deep) property on `path` from `object`.
// If any property in `path` does not exist or if the value is
// `undefined`, return `defaultValue` instead.
// The `path` is normalized through `_.toPath`.
function get(object, path, defaultValue) {
  var value = deepGet(object, toPath(path));
  return isUndefined(value) ? defaultValue : value;
}

// Shortcut function for checking if an object has a given property directly on
// itself (in other words, not on a prototype). Unlike the internal `has`
// function, this public version can also traverse nested properties.
function has(obj, path) {
  path = toPath(path);
  var length = path.length;
  for (var i = 0; i < length; i++) {
    var key = path[i];
    if (!has$1(obj, key)) return false;
    obj = obj[key];
  }
  return !!length;
}

// Keep the identity function around for default iteratees.
function identity(value) {
  return value;
}

// Returns a predicate for checking whether an object has a given set of
// `key:value` pairs.
function matcher(attrs) {
  attrs = extendOwn({}, attrs);
  return function(obj) {
    return isMatch(obj, attrs);
  };
}

// Creates a function that, when passed an object, will traverse that object’s
// properties down the given `path`, specified as an array of keys or indices.
function property(path) {
  path = toPath(path);
  return function(obj) {
    return deepGet(obj, path);
  };
}

// Internal function that returns an efficient (for current engines) version
// of the passed-in callback, to be repeatedly applied in other Underscore
// functions.
function optimizeCb(func, context, argCount) {
  if (context === void 0) return func;
  switch (argCount == null ? 3 : argCount) {
    case 1: return function(value) {
      return func.call(context, value);
    };
    // The 2-argument case is omitted because we’re not using it.
    case 3: return function(value, index, collection) {
      return func.call(context, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(context, accumulator, value, index, collection);
    };
  }
  return function() {
    return func.apply(context, arguments);
  };
}

// An internal function to generate callbacks that can be applied to each
// element in a collection, returning the desired result — either `_.identity`,
// an arbitrary callback, a property matcher, or a property accessor.
function baseIteratee(value, context, argCount) {
  if (value == null) return identity;
  if (isFunction$1(value)) return optimizeCb(value, context, argCount);
  if (isObject$1(value) && !isArray(value)) return matcher(value);
  return property(value);
}

// External wrapper for our callback generator. Users may customize
// `_.iteratee` if they want additional predicate/iteratee shorthand styles.
// This abstraction hides the internal-only `argCount` argument.
function iteratee(value, context) {
  return baseIteratee(value, context, Infinity);
}
_$1.iteratee = iteratee;

// The function we call internally to generate a callback. It invokes
// `_.iteratee` if overridden, otherwise `baseIteratee`.
function cb(value, context, argCount) {
  if (_$1.iteratee !== iteratee) return _$1.iteratee(value, context);
  return baseIteratee(value, context, argCount);
}

// Returns the results of applying the `iteratee` to each element of `obj`.
// In contrast to `_.map` it returns an object.
function mapObject(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  var _keys = keys(obj),
      length = _keys.length,
      results = {};
  for (var index = 0; index < length; index++) {
    var currentKey = _keys[index];
    results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
  }
  return results;
}

// Predicate-generating function. Often useful outside of Underscore.
function noop(){}

// Generates a function for a given object that returns a given property.
function propertyOf(obj) {
  if (obj == null) return noop;
  return function(path) {
    return get(obj, path);
  };
}

// Run a function **n** times.
function times(n, iteratee, context) {
  var accum = Array(Math.max(0, n));
  iteratee = optimizeCb(iteratee, context, 1);
  for (var i = 0; i < n; i++) accum[i] = iteratee(i);
  return accum;
}

// Return a random integer between `min` and `max` (inclusive).
function random(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  return min + Math.floor(Math.random() * (max - min + 1));
}

// A (possibly faster) way to get the current timestamp as an integer.
var now = Date.now || function() {
  return new Date().getTime();
};

// Internal helper to generate functions for escaping and unescaping strings
// to/from HTML interpolation.
function createEscaper(map) {
  var escaper = function(match) {
    return map[match];
  };
  // Regexes for identifying a key that needs to be escaped.
  var source = '(?:' + keys(map).join('|') + ')';
  var testRegexp = RegExp(source);
  var replaceRegexp = RegExp(source, 'g');
  return function(string) {
    string = string == null ? '' : '' + string;
    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
  };
}

// Internal list of HTML entities for escaping.
var escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
};

// Function for escaping strings to HTML interpolation.
var escape$1 = createEscaper(escapeMap);

// Internal list of HTML entities for unescaping.
var unescapeMap = invert(escapeMap);

// Function for unescaping strings from HTML interpolation.
var unescape = createEscaper(unescapeMap);

// By default, Underscore uses ERB-style template delimiters. Change the
// following template settings to use alternative delimiters.
var templateSettings = _$1.templateSettings = {
  evaluate: /<%([\s\S]+?)%>/g,
  interpolate: /<%=([\s\S]+?)%>/g,
  escape: /<%-([\s\S]+?)%>/g
};

// When customizing `_.templateSettings`, if you don't want to define an
// interpolation, evaluation or escaping regex, we need one that is
// guaranteed not to match.
var noMatch = /(.)^/;

// Certain characters need to be escaped so that they can be put into a
// string literal.
var escapes = {
  "'": "'",
  '\\': '\\',
  '\r': 'r',
  '\n': 'n',
  '\u2028': 'u2028',
  '\u2029': 'u2029'
};

var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

function escapeChar(match) {
  return '\\' + escapes[match];
}

// In order to prevent third-party code injection through
// `_.templateSettings.variable`, we test it against the following regular
// expression. It is intentionally a bit more liberal than just matching valid
// identifiers, but still prevents possible loopholes through defaults or
// destructuring assignment.
var bareIdentifier = /^\s*(\w|\$)+\s*$/;

// JavaScript micro-templating, similar to John Resig's implementation.
// Underscore templating handles arbitrary delimiters, preserves whitespace,
// and correctly escapes quotes within interpolated code.
// NB: `oldSettings` only exists for backwards compatibility.
function template$4(text, settings, oldSettings) {
  if (!settings && oldSettings) settings = oldSettings;
  settings = defaults({}, settings, _$1.templateSettings);

  // Combine delimiters into one regular expression via alternation.
  var matcher = RegExp([
    (settings.escape || noMatch).source,
    (settings.interpolate || noMatch).source,
    (settings.evaluate || noMatch).source
  ].join('|') + '|$', 'g');

  // Compile the template source, escaping string literals appropriately.
  var index = 0;
  var source = "__p+='";
  text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
    source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
    index = offset + match.length;

    if (escape) {
      source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
    } else if (interpolate) {
      source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
    } else if (evaluate) {
      source += "';\n" + evaluate + "\n__p+='";
    }

    // Adobe VMs need the match returned to produce the correct offset.
    return match;
  });
  source += "';\n";

  var argument = settings.variable;
  if (argument) {
    // Insure against third-party code injection. (CVE-2021-23358)
    if (!bareIdentifier.test(argument)) throw new Error(
      'variable is not a bare identifier: ' + argument
    );
  } else {
    // If a variable is not specified, place data values in local scope.
    source = 'with(obj||{}){\n' + source + '}\n';
    argument = 'obj';
  }

  source = "var __t,__p='',__j=Array.prototype.join," +
    "print=function(){__p+=__j.call(arguments,'');};\n" +
    source + 'return __p;\n';

  var render;
  try {
    render = new Function(argument, '_', source);
  } catch (e) {
    e.source = source;
    throw e;
  }

  var template = function(data) {
    return render.call(this, data, _$1);
  };

  // Provide the compiled source as a convenience for precompilation.
  template.source = 'function(' + argument + '){\n' + source + '}';

  return template;
}

// Traverses the children of `obj` along `path`. If a child is a function, it
// is invoked with its parent as context. Returns the value of the final
// child, or `fallback` if any child is undefined.
function result(obj, path, fallback) {
  path = toPath(path);
  var length = path.length;
  if (!length) {
    return isFunction$1(fallback) ? fallback.call(obj) : fallback;
  }
  for (var i = 0; i < length; i++) {
    var prop = obj == null ? void 0 : obj[path[i]];
    if (prop === void 0) {
      prop = fallback;
      i = length; // Ensure we don't continue iterating.
    }
    obj = isFunction$1(prop) ? prop.call(obj) : prop;
  }
  return obj;
}

// Generate a unique integer id (unique within the entire client session).
// Useful for temporary DOM ids.
var idCounter = 0;
function uniqueId(prefix) {
  var id = ++idCounter + '';
  return prefix ? prefix + id : id;
}

// Start chaining a wrapped Underscore object.
function chain(obj) {
  var instance = _$1(obj);
  instance._chain = true;
  return instance;
}

// Internal function to execute `sourceFunc` bound to `context` with optional
// `args`. Determines whether to execute a function as a constructor or as a
// normal function.
function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
  if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
  var self = baseCreate(sourceFunc.prototype);
  var result = sourceFunc.apply(self, args);
  if (isObject$1(result)) return result;
  return self;
}

// Partially apply a function by creating a version that has had some of its
// arguments pre-filled, without changing its dynamic `this` context. `_` acts
// as a placeholder by default, allowing any combination of arguments to be
// pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
var partial = restArguments(function(func, boundArgs) {
  var placeholder = partial.placeholder;
  var bound = function() {
    var position = 0, length = boundArgs.length;
    var args = Array(length);
    for (var i = 0; i < length; i++) {
      args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
    }
    while (position < arguments.length) args.push(arguments[position++]);
    return executeBound(func, bound, this, this, args);
  };
  return bound;
});

partial.placeholder = _$1;

// Create a function bound to a given object (assigning `this`, and arguments,
// optionally).
var bind = restArguments(function(func, context, args) {
  if (!isFunction$1(func)) throw new TypeError('Bind must be called on a function');
  var bound = restArguments(function(callArgs) {
    return executeBound(func, bound, context, this, args.concat(callArgs));
  });
  return bound;
});

// Internal helper for collection methods to determine whether a collection
// should be iterated as an array or as an object.
// Related: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
// Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
var isArrayLike = createSizePropertyCheck(getLength);

// Internal implementation of a recursive `flatten` function.
function flatten$1(input, depth, strict, output) {
  output = output || [];
  if (!depth && depth !== 0) {
    depth = Infinity;
  } else if (depth <= 0) {
    return output.concat(input);
  }
  var idx = output.length;
  for (var i = 0, length = getLength(input); i < length; i++) {
    var value = input[i];
    if (isArrayLike(value) && (isArray(value) || isArguments$1(value))) {
      // Flatten current level of array or arguments object.
      if (depth > 1) {
        flatten$1(value, depth - 1, strict, output);
        idx = output.length;
      } else {
        var j = 0, len = value.length;
        while (j < len) output[idx++] = value[j++];
      }
    } else if (!strict) {
      output[idx++] = value;
    }
  }
  return output;
}

// Bind a number of an object's methods to that object. Remaining arguments
// are the method names to be bound. Useful for ensuring that all callbacks
// defined on an object belong to it.
var bindAll = restArguments(function(obj, keys) {
  keys = flatten$1(keys, false, false);
  var index = keys.length;
  if (index < 1) throw new Error('bindAll must be passed function names');
  while (index--) {
    var key = keys[index];
    obj[key] = bind(obj[key], obj);
  }
  return obj;
});

// Memoize an expensive function by storing its results.
function memoize(func, hasher) {
  var memoize = function(key) {
    var cache = memoize.cache;
    var address = '' + (hasher ? hasher.apply(this, arguments) : key);
    if (!has$1(cache, address)) cache[address] = func.apply(this, arguments);
    return cache[address];
  };
  memoize.cache = {};
  return memoize;
}

// Delays a function for the given number of milliseconds, and then calls
// it with the arguments supplied.
var delay = restArguments(function(func, wait, args) {
  return setTimeout(function() {
    return func.apply(null, args);
  }, wait);
});

// Defers a function, scheduling it to run after the current call stack has
// cleared.
var defer = partial(delay, _$1, 1);

// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
function throttle(func, wait, options) {
  var timeout, context, args, result;
  var previous = 0;
  if (!options) options = {};

  var later = function() {
    previous = options.leading === false ? 0 : now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  var throttled = function() {
    var _now = now();
    if (!previous && options.leading === false) previous = _now;
    var remaining = wait - (_now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = _now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };

  throttled.cancel = function() {
    clearTimeout(timeout);
    previous = 0;
    timeout = context = args = null;
  };

  return throttled;
}

// When a sequence of calls of the returned function ends, the argument
// function is triggered. The end of a sequence is defined by the `wait`
// parameter. If `immediate` is passed, the argument function will be
// triggered at the beginning of the sequence instead of at the end.
function debounce$1(func, wait, immediate) {
  var timeout, previous, args, result, context;

  var later = function() {
    var passed = now() - previous;
    if (wait > passed) {
      timeout = setTimeout(later, wait - passed);
    } else {
      timeout = null;
      if (!immediate) result = func.apply(context, args);
      // This check is needed because `func` can recursively invoke `debounced`.
      if (!timeout) args = context = null;
    }
  };

  var debounced = restArguments(function(_args) {
    context = this;
    args = _args;
    previous = now();
    if (!timeout) {
      timeout = setTimeout(later, wait);
      if (immediate) result = func.apply(context, args);
    }
    return result;
  });

  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = args = context = null;
  };

  return debounced;
}

// Returns the first function passed as an argument to the second,
// allowing you to adjust arguments, run code before and after, and
// conditionally execute the original function.
function wrap(func, wrapper) {
  return partial(wrapper, func);
}

// Returns a negated version of the passed-in predicate.
function negate(predicate) {
  return function() {
    return !predicate.apply(this, arguments);
  };
}

// Returns a function that is the composition of a list of functions, each
// consuming the return value of the function that follows.
function compose() {
  var args = arguments;
  var start = args.length - 1;
  return function() {
    var i = start;
    var result = args[start].apply(this, arguments);
    while (i--) result = args[i].call(this, result);
    return result;
  };
}

// Returns a function that will only be executed on and after the Nth call.
function after(times, func) {
  return function() {
    if (--times < 1) {
      return func.apply(this, arguments);
    }
  };
}

// Returns a function that will only be executed up to (but not including) the
// Nth call.
function before(times, func) {
  var memo;
  return function() {
    if (--times > 0) {
      memo = func.apply(this, arguments);
    }
    if (times <= 1) func = null;
    return memo;
  };
}

// Returns a function that will be executed at most one time, no matter how
// often you call it. Useful for lazy initialization.
var once = partial(before, 2);

// Returns the first key on an object that passes a truth test.
function findKey(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = keys(obj), key;
  for (var i = 0, length = _keys.length; i < length; i++) {
    key = _keys[i];
    if (predicate(obj[key], key, obj)) return key;
  }
}

// Internal function to generate `_.findIndex` and `_.findLastIndex`.
function createPredicateIndexFinder(dir) {
  return function(array, predicate, context) {
    predicate = cb(predicate, context);
    var length = getLength(array);
    var index = dir > 0 ? 0 : length - 1;
    for (; index >= 0 && index < length; index += dir) {
      if (predicate(array[index], index, array)) return index;
    }
    return -1;
  };
}

// Returns the first index on an array-like that passes a truth test.
var findIndex = createPredicateIndexFinder(1);

// Returns the last index on an array-like that passes a truth test.
var findLastIndex = createPredicateIndexFinder(-1);

// Use a comparator function to figure out the smallest index at which
// an object should be inserted so as to maintain order. Uses binary search.
function sortedIndex(array, obj, iteratee, context) {
  iteratee = cb(iteratee, context, 1);
  var value = iteratee(obj);
  var low = 0, high = getLength(array);
  while (low < high) {
    var mid = Math.floor((low + high) / 2);
    if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
  }
  return low;
}

// Internal function to generate the `_.indexOf` and `_.lastIndexOf` functions.
function createIndexFinder(dir, predicateFind, sortedIndex) {
  return function(array, item, idx) {
    var i = 0, length = getLength(array);
    if (typeof idx == 'number') {
      if (dir > 0) {
        i = idx >= 0 ? idx : Math.max(idx + length, i);
      } else {
        length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
      }
    } else if (sortedIndex && idx && length) {
      idx = sortedIndex(array, item);
      return array[idx] === item ? idx : -1;
    }
    if (item !== item) {
      idx = predicateFind(slice.call(array, i, length), isNaN$1);
      return idx >= 0 ? idx + i : -1;
    }
    for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
      if (array[idx] === item) return idx;
    }
    return -1;
  };
}

// Return the position of the first occurrence of an item in an array,
// or -1 if the item is not included in the array.
// If the array is large and already in sort order, pass `true`
// for **isSorted** to use binary search.
var indexOf = createIndexFinder(1, findIndex, sortedIndex);

// Return the position of the last occurrence of an item in an array,
// or -1 if the item is not included in the array.
var lastIndexOf = createIndexFinder(-1, findLastIndex);

// Return the first value which passes a truth test.
function find(obj, predicate, context) {
  var keyFinder = isArrayLike(obj) ? findIndex : findKey;
  var key = keyFinder(obj, predicate, context);
  if (key !== void 0 && key !== -1) return obj[key];
}

// Convenience version of a common use case of `_.find`: getting the first
// object containing specific `key:value` pairs.
function findWhere(obj, attrs) {
  return find(obj, matcher(attrs));
}

// The cornerstone for collection functions, an `each`
// implementation, aka `forEach`.
// Handles raw objects in addition to array-likes. Treats all
// sparse array-likes as if they were dense.
function each(obj, iteratee, context) {
  iteratee = optimizeCb(iteratee, context);
  var i, length;
  if (isArrayLike(obj)) {
    for (i = 0, length = obj.length; i < length; i++) {
      iteratee(obj[i], i, obj);
    }
  } else {
    var _keys = keys(obj);
    for (i = 0, length = _keys.length; i < length; i++) {
      iteratee(obj[_keys[i]], _keys[i], obj);
    }
  }
  return obj;
}

// Return the results of applying the iteratee to each element.
function map$1(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length,
      results = Array(length);
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    results[index] = iteratee(obj[currentKey], currentKey, obj);
  }
  return results;
}

// Internal helper to create a reducing function, iterating left or right.
function createReduce(dir) {
  // Wrap code that reassigns argument variables in a separate function than
  // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
  var reducer = function(obj, iteratee, memo, initial) {
    var _keys = !isArrayLike(obj) && keys(obj),
        length = (_keys || obj).length,
        index = dir > 0 ? 0 : length - 1;
    if (!initial) {
      memo = obj[_keys ? _keys[index] : index];
      index += dir;
    }
    for (; index >= 0 && index < length; index += dir) {
      var currentKey = _keys ? _keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  return function(obj, iteratee, memo, context) {
    var initial = arguments.length >= 3;
    return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
  };
}

// **Reduce** builds up a single result from a list of values, aka `inject`,
// or `foldl`.
var reduce = createReduce(1);

// The right-associative version of reduce, also known as `foldr`.
var reduceRight = createReduce(-1);

// Return all the elements that pass a truth test.
function filter(obj, predicate, context) {
  var results = [];
  predicate = cb(predicate, context);
  each(obj, function(value, index, list) {
    if (predicate(value, index, list)) results.push(value);
  });
  return results;
}

// Return all the elements for which a truth test fails.
function reject(obj, predicate, context) {
  return filter(obj, negate(cb(predicate)), context);
}

// Determine whether all of the elements pass a truth test.
function every(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length;
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    if (!predicate(obj[currentKey], currentKey, obj)) return false;
  }
  return true;
}

// Determine if at least one element in the object passes a truth test.
function some(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length;
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    if (predicate(obj[currentKey], currentKey, obj)) return true;
  }
  return false;
}

// Determine if the array or object contains a given item (using `===`).
function contains(obj, item, fromIndex, guard) {
  if (!isArrayLike(obj)) obj = values(obj);
  if (typeof fromIndex != 'number' || guard) fromIndex = 0;
  return indexOf(obj, item, fromIndex) >= 0;
}

// Invoke a method (with arguments) on every item in a collection.
var invoke = restArguments(function(obj, path, args) {
  var contextPath, func;
  if (isFunction$1(path)) {
    func = path;
  } else {
    path = toPath(path);
    contextPath = path.slice(0, -1);
    path = path[path.length - 1];
  }
  return map$1(obj, function(context) {
    var method = func;
    if (!method) {
      if (contextPath && contextPath.length) {
        context = deepGet(context, contextPath);
      }
      if (context == null) return void 0;
      method = context[path];
    }
    return method == null ? method : method.apply(context, args);
  });
});

// Convenience version of a common use case of `_.map`: fetching a property.
function pluck(obj, key) {
  return map$1(obj, property(key));
}

// Convenience version of a common use case of `_.filter`: selecting only
// objects containing specific `key:value` pairs.
function where(obj, attrs) {
  return filter(obj, matcher(attrs));
}

// Return the maximum element (or element-based computation).
function max(obj, iteratee, context) {
  var result = -Infinity, lastComputed = -Infinity,
      value, computed;
  if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null)) {
    obj = isArrayLike(obj) ? obj : values(obj);
    for (var i = 0, length = obj.length; i < length; i++) {
      value = obj[i];
      if (value != null && value > result) {
        result = value;
      }
    }
  } else {
    iteratee = cb(iteratee, context);
    each(obj, function(v, index, list) {
      computed = iteratee(v, index, list);
      if (computed > lastComputed || (computed === -Infinity && result === -Infinity)) {
        result = v;
        lastComputed = computed;
      }
    });
  }
  return result;
}

// Return the minimum element (or element-based computation).
function min(obj, iteratee, context) {
  var result = Infinity, lastComputed = Infinity,
      value, computed;
  if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null)) {
    obj = isArrayLike(obj) ? obj : values(obj);
    for (var i = 0, length = obj.length; i < length; i++) {
      value = obj[i];
      if (value != null && value < result) {
        result = value;
      }
    }
  } else {
    iteratee = cb(iteratee, context);
    each(obj, function(v, index, list) {
      computed = iteratee(v, index, list);
      if (computed < lastComputed || (computed === Infinity && result === Infinity)) {
        result = v;
        lastComputed = computed;
      }
    });
  }
  return result;
}

// Safely create a real, live array from anything iterable.
var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
function toArray(obj) {
  if (!obj) return [];
  if (isArray(obj)) return slice.call(obj);
  if (isString(obj)) {
    // Keep surrogate pair characters together.
    return obj.match(reStrSymbol);
  }
  if (isArrayLike(obj)) return map$1(obj, identity);
  return values(obj);
}

// Sample **n** random values from a collection using the modern version of the
// [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
// If **n** is not specified, returns a single random element.
// The internal `guard` argument allows it to work with `_.map`.
function sample(obj, n, guard) {
  if (n == null || guard) {
    if (!isArrayLike(obj)) obj = values(obj);
    return obj[random(obj.length - 1)];
  }
  var sample = toArray(obj);
  var length = getLength(sample);
  n = Math.max(Math.min(n, length), 0);
  var last = length - 1;
  for (var index = 0; index < n; index++) {
    var rand = random(index, last);
    var temp = sample[index];
    sample[index] = sample[rand];
    sample[rand] = temp;
  }
  return sample.slice(0, n);
}

// Shuffle a collection.
function shuffle(obj) {
  return sample(obj, Infinity);
}

// Sort the object's values by a criterion produced by an iteratee.
function sortBy(obj, iteratee, context) {
  var index = 0;
  iteratee = cb(iteratee, context);
  return pluck(map$1(obj, function(value, key, list) {
    return {
      value: value,
      index: index++,
      criteria: iteratee(value, key, list)
    };
  }).sort(function(left, right) {
    var a = left.criteria;
    var b = right.criteria;
    if (a !== b) {
      if (a > b || a === void 0) return 1;
      if (a < b || b === void 0) return -1;
    }
    return left.index - right.index;
  }), 'value');
}

// An internal function used for aggregate "group by" operations.
function group(behavior, partition) {
  return function(obj, iteratee, context) {
    var result = partition ? [[], []] : {};
    iteratee = cb(iteratee, context);
    each(obj, function(value, index) {
      var key = iteratee(value, index, obj);
      behavior(result, value, key);
    });
    return result;
  };
}

// Groups the object's values by a criterion. Pass either a string attribute
// to group by, or a function that returns the criterion.
var groupBy = group(function(result, value, key) {
  if (has$1(result, key)) result[key].push(value); else result[key] = [value];
});

// Indexes the object's values by a criterion, similar to `_.groupBy`, but for
// when you know that your index values will be unique.
var indexBy = group(function(result, value, key) {
  result[key] = value;
});

// Counts instances of an object that group by a certain criterion. Pass
// either a string attribute to count by, or a function that returns the
// criterion.
var countBy = group(function(result, value, key) {
  if (has$1(result, key)) result[key]++; else result[key] = 1;
});

// Split a collection into two arrays: one whose elements all pass the given
// truth test, and one whose elements all do not pass the truth test.
var partition = group(function(result, value, pass) {
  result[pass ? 0 : 1].push(value);
}, true);

// Return the number of elements in a collection.
function size(obj) {
  if (obj == null) return 0;
  return isArrayLike(obj) ? obj.length : keys(obj).length;
}

// Internal `_.pick` helper function to determine whether `key` is an enumerable
// property name of `obj`.
function keyInObj(value, key, obj) {
  return key in obj;
}

// Return a copy of the object only containing the allowed properties.
var pick$1 = restArguments(function(obj, keys) {
  var result = {}, iteratee = keys[0];
  if (obj == null) return result;
  if (isFunction$1(iteratee)) {
    if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
    keys = allKeys(obj);
  } else {
    iteratee = keyInObj;
    keys = flatten$1(keys, false, false);
    obj = Object(obj);
  }
  for (var i = 0, length = keys.length; i < length; i++) {
    var key = keys[i];
    var value = obj[key];
    if (iteratee(value, key, obj)) result[key] = value;
  }
  return result;
});

// Return a copy of the object without the disallowed properties.
var omit = restArguments(function(obj, keys) {
  var iteratee = keys[0], context;
  if (isFunction$1(iteratee)) {
    iteratee = negate(iteratee);
    if (keys.length > 1) context = keys[1];
  } else {
    keys = map$1(flatten$1(keys, false, false), String);
    iteratee = function(value, key) {
      return !contains(keys, key);
    };
  }
  return pick$1(obj, iteratee, context);
});

// Returns everything but the last entry of the array. Especially useful on
// the arguments object. Passing **n** will return all the values in
// the array, excluding the last N.
function initial(array, n, guard) {
  return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
}

// Get the first element of an array. Passing **n** will return the first N
// values in the array. The **guard** check allows it to work with `_.map`.
function first(array, n, guard) {
  if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
  if (n == null || guard) return array[0];
  return initial(array, array.length - n);
}

// Returns everything but the first entry of the `array`. Especially useful on
// the `arguments` object. Passing an **n** will return the rest N values in the
// `array`.
function rest(array, n, guard) {
  return slice.call(array, n == null || guard ? 1 : n);
}

// Get the last element of an array. Passing **n** will return the last N
// values in the array.
function last(array, n, guard) {
  if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
  if (n == null || guard) return array[array.length - 1];
  return rest(array, Math.max(0, array.length - n));
}

// Trim out all falsy values from an array.
function compact(array) {
  return filter(array, Boolean);
}

// Flatten out an array, either recursively (by default), or up to `depth`.
// Passing `true` or `false` as `depth` means `1` or `Infinity`, respectively.
function flatten(array, depth) {
  return flatten$1(array, depth, false);
}

// Take the difference between one array and a number of other arrays.
// Only the elements present in just the first array will remain.
var difference = restArguments(function(array, rest) {
  rest = flatten$1(rest, true, true);
  return filter(array, function(value){
    return !contains(rest, value);
  });
});

// Return a version of the array that does not contain the specified value(s).
var without = restArguments(function(array, otherArrays) {
  return difference(array, otherArrays);
});

// Produce a duplicate-free version of the array. If the array has already
// been sorted, you have the option of using a faster algorithm.
// The faster algorithm will not work with an iteratee if the iteratee
// is not a one-to-one function, so providing an iteratee will disable
// the faster algorithm.
function uniq(array, isSorted, iteratee, context) {
  if (!isBoolean(isSorted)) {
    context = iteratee;
    iteratee = isSorted;
    isSorted = false;
  }
  if (iteratee != null) iteratee = cb(iteratee, context);
  var result = [];
  var seen = [];
  for (var i = 0, length = getLength(array); i < length; i++) {
    var value = array[i],
        computed = iteratee ? iteratee(value, i, array) : value;
    if (isSorted && !iteratee) {
      if (!i || seen !== computed) result.push(value);
      seen = computed;
    } else if (iteratee) {
      if (!contains(seen, computed)) {
        seen.push(computed);
        result.push(value);
      }
    } else if (!contains(result, value)) {
      result.push(value);
    }
  }
  return result;
}

// Produce an array that contains the union: each distinct element from all of
// the passed-in arrays.
var union = restArguments(function(arrays) {
  return uniq(flatten$1(arrays, true, true));
});

// Produce an array that contains every item shared between all the
// passed-in arrays.
function intersection(array) {
  var result = [];
  var argsLength = arguments.length;
  for (var i = 0, length = getLength(array); i < length; i++) {
    var item = array[i];
    if (contains(result, item)) continue;
    var j;
    for (j = 1; j < argsLength; j++) {
      if (!contains(arguments[j], item)) break;
    }
    if (j === argsLength) result.push(item);
  }
  return result;
}

// Complement of zip. Unzip accepts an array of arrays and groups
// each array's elements on shared indices.
function unzip(array) {
  var length = (array && max(array, getLength).length) || 0;
  var result = Array(length);

  for (var index = 0; index < length; index++) {
    result[index] = pluck(array, index);
  }
  return result;
}

// Zip together multiple lists into a single array -- elements that share
// an index go together.
var zip = restArguments(unzip);

// Converts lists into objects. Pass either a single array of `[key, value]`
// pairs, or two parallel arrays of the same length -- one of keys, and one of
// the corresponding values. Passing by pairs is the reverse of `_.pairs`.
function object(list, values) {
  var result = {};
  for (var i = 0, length = getLength(list); i < length; i++) {
    if (values) {
      result[list[i]] = values[i];
    } else {
      result[list[i][0]] = list[i][1];
    }
  }
  return result;
}

// Generate an integer Array containing an arithmetic progression. A port of
// the native Python `range()` function. See
// [the Python documentation](https://docs.python.org/library/functions.html#range).
function range(start, stop, step) {
  if (stop == null) {
    stop = start || 0;
    start = 0;
  }
  if (!step) {
    step = stop < start ? -1 : 1;
  }

  var length = Math.max(Math.ceil((stop - start) / step), 0);
  var range = Array(length);

  for (var idx = 0; idx < length; idx++, start += step) {
    range[idx] = start;
  }

  return range;
}

// Chunk a single array into multiple arrays, each containing `count` or fewer
// items.
function chunk(array, count) {
  if (count == null || count < 1) return [];
  var result = [];
  var i = 0, length = array.length;
  while (i < length) {
    result.push(slice.call(array, i, i += count));
  }
  return result;
}

// Helper function to continue chaining intermediate results.
function chainResult(instance, obj) {
  return instance._chain ? _$1(obj).chain() : obj;
}

// Add your own custom functions to the Underscore object.
function mixin$1(obj) {
  each(functions(obj), function(name) {
    var func = _$1[name] = obj[name];
    _$1.prototype[name] = function() {
      var args = [this._wrapped];
      push.apply(args, arguments);
      return chainResult(this, func.apply(_$1, args));
    };
  });
  return _$1;
}

// Add all mutator `Array` functions to the wrapper.
each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
  var method = ArrayProto[name];
  _$1.prototype[name] = function() {
    var obj = this._wrapped;
    if (obj != null) {
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) {
        delete obj[0];
      }
    }
    return chainResult(this, obj);
  };
});

// Add all accessor `Array` functions to the wrapper.
each(['concat', 'join', 'slice'], function(name) {
  var method = ArrayProto[name];
  _$1.prototype[name] = function() {
    var obj = this._wrapped;
    if (obj != null) obj = method.apply(obj, arguments);
    return chainResult(this, obj);
  };
});

// Named Exports

var allExports = /*#__PURE__*/Object.freeze({
    __proto__: null,
    VERSION: VERSION,
    restArguments: restArguments,
    isObject: isObject$1,
    isNull: isNull,
    isUndefined: isUndefined,
    isBoolean: isBoolean,
    isElement: isElement,
    isString: isString,
    isNumber: isNumber,
    isDate: isDate,
    isRegExp: isRegExp,
    isError: isError,
    isSymbol: isSymbol,
    isArrayBuffer: isArrayBuffer,
    isDataView: isDataView$1,
    isArray: isArray,
    isFunction: isFunction$1,
    isArguments: isArguments$1,
    isFinite: isFinite$1,
    isNaN: isNaN$1,
    isTypedArray: isTypedArray$1,
    isEmpty: isEmpty,
    isMatch: isMatch,
    isEqual: isEqual,
    isMap: isMap,
    isWeakMap: isWeakMap,
    isSet: isSet,
    isWeakSet: isWeakSet,
    keys: keys,
    allKeys: allKeys,
    values: values,
    pairs: pairs,
    invert: invert,
    functions: functions,
    methods: functions,
    extend: extend,
    extendOwn: extendOwn,
    assign: extendOwn,
    defaults: defaults,
    create: create,
    clone: clone,
    tap: tap,
    get: get,
    has: has,
    mapObject: mapObject,
    identity: identity,
    constant: constant,
    noop: noop,
    toPath: toPath$1,
    property: property,
    propertyOf: propertyOf,
    matcher: matcher,
    matches: matcher,
    times: times,
    random: random,
    now: now,
    escape: escape$1,
    unescape: unescape,
    templateSettings: templateSettings,
    template: template$4,
    result: result,
    uniqueId: uniqueId,
    chain: chain,
    iteratee: iteratee,
    partial: partial,
    bind: bind,
    bindAll: bindAll,
    memoize: memoize,
    delay: delay,
    defer: defer,
    throttle: throttle,
    debounce: debounce$1,
    wrap: wrap,
    negate: negate,
    compose: compose,
    after: after,
    before: before,
    once: once,
    findKey: findKey,
    findIndex: findIndex,
    findLastIndex: findLastIndex,
    sortedIndex: sortedIndex,
    indexOf: indexOf,
    lastIndexOf: lastIndexOf,
    find: find,
    detect: find,
    findWhere: findWhere,
    each: each,
    forEach: each,
    map: map$1,
    collect: map$1,
    reduce: reduce,
    foldl: reduce,
    inject: reduce,
    reduceRight: reduceRight,
    foldr: reduceRight,
    filter: filter,
    select: filter,
    reject: reject,
    every: every,
    all: every,
    some: some,
    any: some,
    contains: contains,
    includes: contains,
    include: contains,
    invoke: invoke,
    pluck: pluck,
    where: where,
    max: max,
    min: min,
    shuffle: shuffle,
    sample: sample,
    sortBy: sortBy,
    groupBy: groupBy,
    indexBy: indexBy,
    countBy: countBy,
    partition: partition,
    toArray: toArray,
    size: size,
    pick: pick$1,
    omit: omit,
    first: first,
    head: first,
    take: first,
    initial: initial,
    last: last,
    rest: rest,
    tail: rest,
    drop: rest,
    compact: compact,
    flatten: flatten,
    without: without,
    uniq: uniq,
    unique: uniq,
    union: union,
    intersection: intersection,
    difference: difference,
    unzip: unzip,
    transpose: unzip,
    zip: zip,
    object: object,
    range: range,
    chunk: chunk,
    mixin: mixin$1,
    'default': _$1
});

// Default Export

// Add all of the Underscore functions to the wrapper object.
var _ = mixin$1(allExports);
// Legacy Node.js API.
_._ = _;

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
var Obj = {
    getObjectDiff : function (object,base){
        const changes = (object, base) => (
            pick$1(
              mapObject(object, (value, key) => (
                (!isEqual(value, base[key])) ?
                  ((isObject$1(value) && isObject$1(base[key])) ? changes(value, base[key]) : value) :
                  null
              )),
              (value) => (value !== null)
            )
          );
          return changes(object, base);
        
    },
    combine: function(obj1,obj2){
        return Object.assign(obj1, obj2);
    },
    dragElement:function (elmnt) {
      var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      if (elmnt.shadowRoot.querySelector('#'+elmnt.id+"header")) {
        /* if present, the header is where you move the DIV from:*/
        elmnt.shadowRoot.querySelector('#'+elmnt.id+"header").onmousedown = dragMouseDown;
      } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
      }
    
      function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
      }
    
      function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      }
    
      function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
      }
    }

};

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var loglevel = createCommonjsModule(function (module) {
/*! loglevel - v1.7.1 - https://github.com/pimterry/loglevel - (c) 2020 Tim Perry - licensed MIT */
(function (root, definition) {
    if (module.exports) {
        module.exports = definition();
    } else {
        root.log = definition();
    }
}(commonjsGlobal, function () {

    // Slightly dubious tricks to cut down minimized file size
    var noop = function() {};
    var undefinedType = "undefined";
    var isIE = (typeof window !== undefinedType) && (typeof window.navigator !== undefinedType) && (
        /Trident\/|MSIE /.test(window.navigator.userAgent)
    );

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

    // Cross-browser bind equivalent that works at least back to IE6
    function bindMethod(obj, methodName,prefix) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') {
            return method.bind(obj, `[${methodName.toUpperCase()}]`, prefix);
        } else {
            try {
                return Function.prototype.bind.call(method, obj);
            } catch (e) {
                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                return function() {
                    return Function.prototype.apply.apply(method, [obj, arguments]);
                };
            }
        }
    }

    // Trace() doesn't print the message in IE, so for that case we need to wrap it
    function traceForIE() {
        if (console.log) {
            if (console.log.apply) {
                console.log.apply(console, arguments);
            } else {
                // In old IE, native console methods themselves don't have apply().
                Function.prototype.apply.apply(console.log, [console, arguments]);
            }
        }
        if (console.trace) console.trace();
    }

    // Build the best logging method possible for this env
    // Wherever possible we want to bind, not wrap, to preserve stack traces
    function realMethod(methodName,prefix) {
        if (methodName === 'debug') {
            methodName = 'log';
        }

        if (typeof console === undefinedType) {
            return false; // No method possible, for now - fixed later by enableLoggingWhenConsoleArrives
        } else if (methodName === 'trace' && isIE) {
            return traceForIE;
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName, prefix);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

    // These private functions always need `this` to be set properly

    function replaceLoggingMethods(level, prefix) {
        /*jshint validthis:true */
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            this[methodName] = (i < level) ?
                noop :
                this.methodFactory(methodName, level, prefix);
        }

        // Define log.log as an alias for log.debug
        this.log = this.debug;
    }

    // In old IE versions, the console isn't present until you first open it.
    // We build realMethod() replacements here that regenerate logging methods
    function enableLoggingWhenConsoleArrives(methodName, level, prefix) {
        return function () {
            if (typeof console !== undefinedType) {
                replaceLoggingMethods.call(this, level, prefix);
                this[methodName].apply(this, arguments);
            }
        };
    }

    // By default, we use closely bound real methods wherever possible, and
    // otherwise we wait for a console to appear, and then try again.
    function defaultMethodFactory(methodName, level, prefix) {
        /*jshint validthis:true */
        return realMethod(methodName, prefix) ||
               enableLoggingWhenConsoleArrives.apply(this, arguments);
    }

    function Logger(name, defaultLevel, factory) {
      var self = this;
      var currentLevel;

      var storageKey = "loglevel";
      if (typeof name === "string") {
        storageKey += ":" + name;
      } else if (typeof name === "symbol") {
        storageKey = undefined;
      }

      function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

          if (typeof window === undefinedType || !storageKey) return;

          // Use localStorage if available
          try {
              window.localStorage[storageKey] = levelName;
              return;
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=" + levelName + ";";
          } catch (ignore) {}
      }

      function getPersistedLevel() {
          var storedLevel;

          if (typeof window === undefinedType || !storageKey) return;

          try {
              storedLevel = window.localStorage[storageKey];
          } catch (ignore) {}

          // Fallback to cookies if local storage gives us nothing
          if (typeof storedLevel === undefinedType) {
              try {
                  var cookie = window.document.cookie;
                  var location = cookie.indexOf(
                      encodeURIComponent(storageKey) + "=");
                  if (location !== -1) {
                      storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
                  }
              } catch (ignore) {}
          }

          // If the stored level is not valid, treat it as if nothing was stored.
          if (self.levels[storedLevel] === undefined) {
              storedLevel = undefined;
          }

          return storedLevel;
      }

      /*
       *
       * Public logger API - see https://github.com/pimterry/loglevel for details
       *
       */

      self.name = name;

      self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
          "ERROR": 4, "SILENT": 5};

      self.methodFactory = factory || defaultMethodFactory;

      self.getLevel = function () {
          return currentLevel;
      };
      self.setPrefix = function(prefix) {
	   self.prefix = prefix;
	   if (typeof self.prefix === "function")
		   replaceLoggingMethods.call(self, self.level, self.prefix() || name.toUpperCase() || "");
	   else 
                  replaceLoggingMethods.call(self, self.level, self.prefix || name.toUpperCase() || "");
           if (typeof console === undefinedType && level < self.levels.SILENT) {
                  return "No console available for logging";
           }
      };
      self.setLevel = function (level, persist) {
          if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
              level = self.levels[level.toUpperCase()];
          }
          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
              currentLevel = level;
              if (persist !== false) {  // defaults to true
                  persistLevelIfPossible(level);
              }
	      
              replaceLoggingMethods.call(self, level,  (name || "").toUpperCase());
              if (typeof console === undefinedType && level < self.levels.SILENT) {
                  return "No console available for logging";
              }
          } else {
              throw "log.setLevel() called with invalid level: " + level;
          }
      };

      self.setDefaultLevel = function (level) {
          if (!getPersistedLevel()) {
              self.setLevel(level, false);
          }
      };

      self.enableAll = function(persist) {
          self.setLevel(self.levels.TRACE, persist);
      };

      self.disableAll = function(persist) {
          self.setLevel(self.levels.SILENT, persist);
      };

      // Initialize with the right level
      var initialLevel = getPersistedLevel();
      if (initialLevel == null) {
          initialLevel = defaultLevel == null ? "WARN" : defaultLevel;
      }
      self.setLevel(initialLevel, false);
    }

    /*
     *
     * Top-level API
     *
     */

    var defaultLogger = new Logger();

    var _loggersByName = {};
    defaultLogger.getLogger = function getLogger(name) {
        if ((typeof name !== "symbol" && typeof name !== "string") || name === "") {
          throw new TypeError("You must supply a name when creating a logger.");
        }

        var logger = _loggersByName[name];
        if (!logger) {
          logger = _loggersByName[name] = new Logger(
            name, defaultLogger.getLevel(), defaultLogger.methodFactory);
        }
        return logger;
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType &&
               window.log === defaultLogger) {
            window.log = _log;
        }

        return defaultLogger;
    };

    defaultLogger.getLoggers = function getLoggers() {
        return _loggersByName;
    };

    // ES6 default export, for compatibility
    defaultLogger['default'] = defaultLogger;

    return defaultLogger;
}));
});

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */


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
        let _log = loglevel.getLogger(name);
        _log.setLevel(loglevel.getLevel());
        return _log;
    },
    setLogLevel:function(level,name){
        loglevel.setLevel(level);
        loglevel.getLogger(name).setLevel(level);
    }
  
  };

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */

    var AgentContext = function () {
        var self = {};
        var log =  Logger.getLogger('AgentContext');

        var _contextItems = {}; // Map key to {currentValue:null, callbacks:[], on:func, off:func}
        var _change_callbacks = [];
        var _capabilities = {};

        var _agent_update_handlers = [];

        var _agent_change_cb = function () {
            for (var i = 0; i < _agent_update_handlers.length; i++) {
                try {
                    _agent_update_handlers[i].call(self);
                } catch (err) {
                    log.error("Error in meta-update", err);
                }
            }
        };
        var setCapability = function (what, state) {
            _capabilities[what] = state;
            _agent_change_cb();
            _doCallbacks.call(self, "keychange", what);
        };

        var _addContextElements = function (instrumentMap) {
            for (var k in instrumentMap) {

                if (!instrumentMap.hasOwnProperty(k)) {
                    continue;
                }
                _contextItems[k] = {
                    currentValue: instrumentMap[k].val || "undefined",
                    callbacks: [],
                    on: instrumentMap[k].on,
                    off: instrumentMap[k].off
                };

                if (instrumentMap[k].init) {
                    instrumentMap[k].init.call(self);
                }else {
                    _doCallbacks.call(self, "keychange", k);
                }
            }            _agent_change_cb();
            return self;
        };

        var keys = function () {
            var res = [];
            for (let k in _contextItems) {
                res.push(k);
            }
            return res;
        };

        // callbacks
        var _doCallbacks = function (what, e, handler) {
            if (what === "keychange") {
                for (var i = 0; i < _change_callbacks.length; i++) {
                    try {
                        _change_callbacks[i].call(self, e);
                    } catch (err) {
                        log.error("Error in keychange handler:" + e);
                    }
                }
                return;
            }
            if (!_contextItems.hasOwnProperty(what)) throw "Unsupported event " + what;
            var h;
            for (var i = 0; i < _contextItems[what].callbacks.length; i++) {
                h = _contextItems[what].callbacks[i];
                if (handler === undefined) {
                    // all handlers to be invoked, except those with pending immeditate
                    if (h._immediate_pending) {
                        continue;
                    }
                } else {
                    // only given handler to be called
                    if (h === handler) handler._immediate_pending = false;
                    else {
                        continue;
                    }
                }
                try {
                    h.call(self, e);
                } catch (e) {
                    log.error("Error in " + what + ": " + h + ": " + e);
                }
            }
        };

        // unregister callback
        var off = function (what, handler) {
            if (what === "keychange") {
                _change_callbacks.splice(_change_callbacks.indexOf(handler), e);
                return;
            }
            if (what === "agentchange") {
                if (_agent_update_handlers.indexOf(handler) == -1) {
                    throw "Callback not registered";
                }
                _agent_update_handlers.splice(agent_update_handlers.indexOf(handler), 1);
                return;
            }
            if (!_contextItems.hasOwnProperty(what)) throw "Unknown parameter " + what;
            if (_contextItems[what].callbacks !== undefined) {
                var index = _contextItems[what].callbacks.indexOf(handler);
                if (index > -1) {
                    _contextItems[what].callbacks.splice(index, 1);
                }

                if (_contextItems[what].callbacks.length === 0 &&
                    _contextItems[what].off) {
                    log.debug("Turning " + what + " off");
                    _contextItems[what].off.call(self);
                }
            }
            return self;
        };

        var on = function (what, handler, agentid) {
            if (what === "keychange") {
                _change_callbacks.push(handler);
                handler.call(keys());
                return;
            }
            if (what === "agentchange") {
                log.info("*** Registered agentchange");
                _agent_update_handlers.push(handler);
                try {
                    handler.call(self);
                } catch (err) {
                    console.log("Error in agentchange handler", err);
                }
                return;
            }
            if (!handler || typeof handler !== "function") throw "Illegal handler";
            if (!_contextItems.hasOwnProperty(what)) { 
                console.warn("Unsupported event " + what);
                return
            }
            var index = _contextItems[what].callbacks.indexOf(handler);
            if (index === -1) {
                if (_contextItems[what].callbacks == 0) {
                    // Turn on?
                    if (self.requestHandler.call(self, what, agentid || "self") === true) {
                        if (_contextItems[what].on) {
                            log.info("Turning " + what + " on");
                            _contextItems[what].on.call(self);
                        }
                    }
                }
                // register handler
                _contextItems[what].callbacks.push(handler);
                // flag handler
                handler._immediate_pending = true;
                // do immediate callback
                //setTimeout(function () {
                    _doCallbacks(what, {
                        key: what,
                        value: _contextItems[what].currentValue
                    }, handler);
                //}, 15);
            }
            return self;
        };


        var setItem = function (what, value) {
            if (!_contextItems.hasOwnProperty(what)) {
                i = [];
                i[what] = {
                    val: value
                };
                _addContextElements(i);
            }

            _contextItems[what].currentValue = value;

            // Do callbacks on it
            _doCallbacks(what, {
                key: what,
                value: value
            });
            return self;
        };


        var getItem = function (what) {
            if (!_contextItems.hasOwnProperty(what)) {
                throw "Unknown item " + what;
            }
            return _contextItems[what].currentValue;
        };

        self.loadContextElements = _addContextElements;
        self.load = _addContextElements;
        self.keys = keys;
        self.on = on;
        self.off = off;
        self.setCapability = setCapability;
        self.getCapability = function(what) {
            return _capabilities[what];
        };
        self.capabilities = function () {
            return _capabilities
        };

        self.setItem = setItem;
        self.getItem = getItem;

        self.requestHandler = function (what, agentid) {
            log.info("Allowing " + what + " by " + agentid);
            return true
        };
        return self;
    };

const PACKET_TYPES = Object.create(null); // no Map = no polyfill
PACKET_TYPES["open"] = "0";
PACKET_TYPES["close"] = "1";
PACKET_TYPES["ping"] = "2";
PACKET_TYPES["pong"] = "3";
PACKET_TYPES["message"] = "4";
PACKET_TYPES["upgrade"] = "5";
PACKET_TYPES["noop"] = "6";
const PACKET_TYPES_REVERSE = Object.create(null);
Object.keys(PACKET_TYPES).forEach(key => {
    PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
});
const ERROR_PACKET = { type: "error", data: "parser error" };

const withNativeBlob$1 = typeof Blob === "function" ||
    (typeof Blob !== "undefined" &&
        Object.prototype.toString.call(Blob) === "[object BlobConstructor]");
const withNativeArrayBuffer$2 = typeof ArrayBuffer === "function";
// ArrayBuffer.isView method is not defined in IE10
const isView$1 = obj => {
    return typeof ArrayBuffer.isView === "function"
        ? ArrayBuffer.isView(obj)
        : obj && obj.buffer instanceof ArrayBuffer;
};
const encodePacket = ({ type, data }, supportsBinary, callback) => {
    if (withNativeBlob$1 && data instanceof Blob) {
        if (supportsBinary) {
            return callback(data);
        }
        else {
            return encodeBlobAsBase64(data, callback);
        }
    }
    else if (withNativeArrayBuffer$2 &&
        (data instanceof ArrayBuffer || isView$1(data))) {
        if (supportsBinary) {
            return callback(data);
        }
        else {
            return encodeBlobAsBase64(new Blob([data]), callback);
        }
    }
    // plain string
    return callback(PACKET_TYPES[type] + (data || ""));
};
const encodeBlobAsBase64 = (data, callback) => {
    const fileReader = new FileReader();
    fileReader.onload = function () {
        const content = fileReader.result.split(",")[1];
        callback("b" + content);
    };
    return fileReader.readAsDataURL(data);
};

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
// Use a lookup table to find the index.
const lookup$1 = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
for (let i = 0; i < chars.length; i++) {
    lookup$1[chars.charCodeAt(i)] = i;
}
const decode$1 = (base64) => {
    let bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
    if (base64[base64.length - 1] === '=') {
        bufferLength--;
        if (base64[base64.length - 2] === '=') {
            bufferLength--;
        }
    }
    const arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
    for (i = 0; i < len; i += 4) {
        encoded1 = lookup$1[base64.charCodeAt(i)];
        encoded2 = lookup$1[base64.charCodeAt(i + 1)];
        encoded3 = lookup$1[base64.charCodeAt(i + 2)];
        encoded4 = lookup$1[base64.charCodeAt(i + 3)];
        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
    return arraybuffer;
};

const withNativeArrayBuffer$1 = typeof ArrayBuffer === "function";
const decodePacket = (encodedPacket, binaryType) => {
    if (typeof encodedPacket !== "string") {
        return {
            type: "message",
            data: mapBinary(encodedPacket, binaryType)
        };
    }
    const type = encodedPacket.charAt(0);
    if (type === "b") {
        return {
            type: "message",
            data: decodeBase64Packet(encodedPacket.substring(1), binaryType)
        };
    }
    const packetType = PACKET_TYPES_REVERSE[type];
    if (!packetType) {
        return ERROR_PACKET;
    }
    return encodedPacket.length > 1
        ? {
            type: PACKET_TYPES_REVERSE[type],
            data: encodedPacket.substring(1)
        }
        : {
            type: PACKET_TYPES_REVERSE[type]
        };
};
const decodeBase64Packet = (data, binaryType) => {
    if (withNativeArrayBuffer$1) {
        const decoded = decode$1(data);
        return mapBinary(decoded, binaryType);
    }
    else {
        return { base64: true, data }; // fallback for old browsers
    }
};
const mapBinary = (data, binaryType) => {
    switch (binaryType) {
        case "blob":
            return data instanceof ArrayBuffer ? new Blob([data]) : data;
        case "arraybuffer":
        default:
            return data; // assuming the data is already an ArrayBuffer
    }
};

const SEPARATOR = String.fromCharCode(30); // see https://en.wikipedia.org/wiki/Delimiter#ASCII_delimited_text
const encodePayload = (packets, callback) => {
    // some packets may be added to the array while encoding, so the initial length must be saved
    const length = packets.length;
    const encodedPackets = new Array(length);
    let count = 0;
    packets.forEach((packet, i) => {
        // force base64 encoding for binary packets
        encodePacket(packet, false, encodedPacket => {
            encodedPackets[i] = encodedPacket;
            if (++count === length) {
                callback(encodedPackets.join(SEPARATOR));
            }
        });
    });
};
const decodePayload = (encodedPayload, binaryType) => {
    const encodedPackets = encodedPayload.split(SEPARATOR);
    const packets = [];
    for (let i = 0; i < encodedPackets.length; i++) {
        const decodedPacket = decodePacket(encodedPackets[i], binaryType);
        packets.push(decodedPacket);
        if (decodedPacket.type === "error") {
            break;
        }
    }
    return packets;
};
const protocol$1 = 4;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
}

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }

  // Remove event specific arrays for event types that no
  // one is subscribed for to avoid memory leak.
  if (callbacks.length === 0) {
    delete this._callbacks['$' + event];
  }

  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};

  var args = new Array(arguments.length - 1)
    , callbacks = this._callbacks['$' + event];

  for (var i = 1; i < arguments.length; i++) {
    args[i - 1] = arguments[i];
  }

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

// alias used for reserved events (protected method)
Emitter.prototype.emitReserved = Emitter.prototype.emit;

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

const globalThisShim = (() => {
    if (typeof self !== "undefined") {
        return self;
    }
    else if (typeof window !== "undefined") {
        return window;
    }
    else {
        return Function("return this")();
    }
})();

function pick(obj, ...attr) {
    return attr.reduce((acc, k) => {
        if (obj.hasOwnProperty(k)) {
            acc[k] = obj[k];
        }
        return acc;
    }, {});
}
// Keep a reference to the real timeout functions so they can be used when overridden
const NATIVE_SET_TIMEOUT = setTimeout;
const NATIVE_CLEAR_TIMEOUT = clearTimeout;
function installTimerFunctions(obj, opts) {
    if (opts.useNativeTimers) {
        obj.setTimeoutFn = NATIVE_SET_TIMEOUT.bind(globalThisShim);
        obj.clearTimeoutFn = NATIVE_CLEAR_TIMEOUT.bind(globalThisShim);
    }
    else {
        obj.setTimeoutFn = setTimeout.bind(globalThisShim);
        obj.clearTimeoutFn = clearTimeout.bind(globalThisShim);
    }
}
// base64 encoded buffers are about 33% bigger (https://en.wikipedia.org/wiki/Base64)
const BASE64_OVERHEAD = 1.33;
// we could also have used `new Blob([obj]).size`, but it isn't supported in IE9
function byteLength(obj) {
    if (typeof obj === "string") {
        return utf8Length(obj);
    }
    // arraybuffer or blob
    return Math.ceil((obj.byteLength || obj.size) * BASE64_OVERHEAD);
}
function utf8Length(str) {
    let c = 0, length = 0;
    for (let i = 0, l = str.length; i < l; i++) {
        c = str.charCodeAt(i);
        if (c < 0x80) {
            length += 1;
        }
        else if (c < 0x800) {
            length += 2;
        }
        else if (c < 0xd800 || c >= 0xe000) {
            length += 3;
        }
        else {
            i++;
            length += 4;
        }
    }
    return length;
}

class TransportError extends Error {
    constructor(reason, description, context) {
        super(reason);
        this.description = description;
        this.context = context;
        this.type = "TransportError";
    }
}
class Transport extends Emitter {
    /**
     * Transport abstract constructor.
     *
     * @param {Object} options.
     * @api private
     */
    constructor(opts) {
        super();
        this.writable = false;
        installTimerFunctions(this, opts);
        this.opts = opts;
        this.query = opts.query;
        this.readyState = "";
        this.socket = opts.socket;
    }
    /**
     * Emits an error.
     *
     * @param {String} reason
     * @param description
     * @param context - the error context
     * @return {Transport} for chaining
     * @api protected
     */
    onError(reason, description, context) {
        super.emitReserved("error", new TransportError(reason, description, context));
        return this;
    }
    /**
     * Opens the transport.
     *
     * @api public
     */
    open() {
        if ("closed" === this.readyState || "" === this.readyState) {
            this.readyState = "opening";
            this.doOpen();
        }
        return this;
    }
    /**
     * Closes the transport.
     *
     * @api public
     */
    close() {
        if ("opening" === this.readyState || "open" === this.readyState) {
            this.doClose();
            this.onClose();
        }
        return this;
    }
    /**
     * Sends multiple packets.
     *
     * @param {Array} packets
     * @api public
     */
    send(packets) {
        if ("open" === this.readyState) {
            this.write(packets);
        }
    }
    /**
     * Called upon open
     *
     * @api protected
     */
    onOpen() {
        this.readyState = "open";
        this.writable = true;
        super.emitReserved("open");
    }
    /**
     * Called with data.
     *
     * @param {String} data
     * @api protected
     */
    onData(data) {
        const packet = decodePacket(data, this.socket.binaryType);
        this.onPacket(packet);
    }
    /**
     * Called with a decoded packet.
     *
     * @api protected
     */
    onPacket(packet) {
        super.emitReserved("packet", packet);
    }
    /**
     * Called upon close.
     *
     * @api protected
     */
    onClose(details) {
        this.readyState = "closed";
        super.emitReserved("close", details);
    }
}

// imported from https://github.com/unshiftio/yeast
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split(''), length = 64, map = {};
let seed = 0, i$1 = 0, prev;
/**
 * Return a string representing the specified number.
 *
 * @param {Number} num The number to convert.
 * @returns {String} The string representation of the number.
 * @api public
 */
function encode$1(num) {
    let encoded = '';
    do {
        encoded = alphabet[num % length] + encoded;
        num = Math.floor(num / length);
    } while (num > 0);
    return encoded;
}
/**
 * Yeast: A tiny growing id generator.
 *
 * @returns {String} A unique id.
 * @api public
 */
function yeast() {
    const now = encode$1(+new Date());
    if (now !== prev)
        return seed = 0, prev = now;
    return now + '.' + encode$1(seed++);
}
//
// Map each character to its index.
//
for (; i$1 < length; i$1++)
    map[alphabet[i$1]] = i$1;

// imported from https://github.com/galkn/querystring
/**
 * Compiles a querystring
 * Returns string representation of the object
 *
 * @param {Object}
 * @api private
 */
function encode(obj) {
    let str = '';
    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            if (str.length)
                str += '&';
            str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
        }
    }
    return str;
}
/**
 * Parses a simple querystring into an object
 *
 * @param {String} qs
 * @api private
 */
function decode(qs) {
    let qry = {};
    let pairs = qs.split('&');
    for (let i = 0, l = pairs.length; i < l; i++) {
        let pair = pairs[i].split('=');
        qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return qry;
}

// imported from https://github.com/component/has-cors
let value = false;
try {
    value = typeof XMLHttpRequest !== 'undefined' &&
        'withCredentials' in new XMLHttpRequest();
}
catch (err) {
    // if XMLHttp support is disabled in IE then it will throw
    // when trying to create
}
const hasCORS = value;

// browser shim for xmlhttprequest module
function XHR(opts) {
    const xdomain = opts.xdomain;
    // XMLHttpRequest can be disabled on IE
    try {
        if ("undefined" !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
            return new XMLHttpRequest();
        }
    }
    catch (e) { }
    if (!xdomain) {
        try {
            return new globalThisShim[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
        }
        catch (e) { }
    }
}

function empty() { }
const hasXHR2 = (function () {
    const xhr = new XHR({
        xdomain: false
    });
    return null != xhr.responseType;
})();
class Polling extends Transport {
    /**
     * XHR Polling constructor.
     *
     * @param {Object} opts
     * @api public
     */
    constructor(opts) {
        super(opts);
        this.polling = false;
        if (typeof location !== "undefined") {
            const isSSL = "https:" === location.protocol;
            let port = location.port;
            // some user agents have empty `location.port`
            if (!port) {
                port = isSSL ? "443" : "80";
            }
            this.xd =
                (typeof location !== "undefined" &&
                    opts.hostname !== location.hostname) ||
                    port !== opts.port;
            this.xs = opts.secure !== isSSL;
        }
        /**
         * XHR supports binary
         */
        const forceBase64 = opts && opts.forceBase64;
        this.supportsBinary = hasXHR2 && !forceBase64;
    }
    /**
     * Transport name.
     */
    get name() {
        return "polling";
    }
    /**
     * Opens the socket (triggers polling). We write a PING message to determine
     * when the transport is open.
     *
     * @api private
     */
    doOpen() {
        this.poll();
    }
    /**
     * Pauses polling.
     *
     * @param {Function} callback upon buffers are flushed and transport is paused
     * @api private
     */
    pause(onPause) {
        this.readyState = "pausing";
        const pause = () => {
            this.readyState = "paused";
            onPause();
        };
        if (this.polling || !this.writable) {
            let total = 0;
            if (this.polling) {
                total++;
                this.once("pollComplete", function () {
                    --total || pause();
                });
            }
            if (!this.writable) {
                total++;
                this.once("drain", function () {
                    --total || pause();
                });
            }
        }
        else {
            pause();
        }
    }
    /**
     * Starts polling cycle.
     *
     * @api public
     */
    poll() {
        this.polling = true;
        this.doPoll();
        this.emitReserved("poll");
    }
    /**
     * Overloads onData to detect payloads.
     *
     * @api private
     */
    onData(data) {
        const callback = packet => {
            // if its the first message we consider the transport open
            if ("opening" === this.readyState && packet.type === "open") {
                this.onOpen();
            }
            // if its a close packet, we close the ongoing requests
            if ("close" === packet.type) {
                this.onClose({ description: "transport closed by the server" });
                return false;
            }
            // otherwise bypass onData and handle the message
            this.onPacket(packet);
        };
        // decode payload
        decodePayload(data, this.socket.binaryType).forEach(callback);
        // if an event did not trigger closing
        if ("closed" !== this.readyState) {
            // if we got data we're not polling
            this.polling = false;
            this.emitReserved("pollComplete");
            if ("open" === this.readyState) {
                this.poll();
            }
        }
    }
    /**
     * For polling, send a close packet.
     *
     * @api private
     */
    doClose() {
        const close = () => {
            this.write([{ type: "close" }]);
        };
        if ("open" === this.readyState) {
            close();
        }
        else {
            // in case we're trying to close while
            // handshaking is in progress (GH-164)
            this.once("open", close);
        }
    }
    /**
     * Writes a packets payload.
     *
     * @param {Array} data packets
     * @param {Function} drain callback
     * @api private
     */
    write(packets) {
        this.writable = false;
        encodePayload(packets, data => {
            this.doWrite(data, () => {
                this.writable = true;
                this.emitReserved("drain");
            });
        });
    }
    /**
     * Generates uri for connection.
     *
     * @api private
     */
    uri() {
        let query = this.query || {};
        const schema = this.opts.secure ? "https" : "http";
        let port = "";
        // cache busting is forced
        if (false !== this.opts.timestampRequests) {
            query[this.opts.timestampParam] = yeast();
        }
        if (!this.supportsBinary && !query.sid) {
            query.b64 = 1;
        }
        // avoid port if default for schema
        if (this.opts.port &&
            (("https" === schema && Number(this.opts.port) !== 443) ||
                ("http" === schema && Number(this.opts.port) !== 80))) {
            port = ":" + this.opts.port;
        }
        const encodedQuery = encode(query);
        const ipv6 = this.opts.hostname.indexOf(":") !== -1;
        return (schema +
            "://" +
            (ipv6 ? "[" + this.opts.hostname + "]" : this.opts.hostname) +
            port +
            this.opts.path +
            (encodedQuery.length ? "?" + encodedQuery : ""));
    }
    /**
     * Creates a request.
     *
     * @param {String} method
     * @api private
     */
    request(opts = {}) {
        Object.assign(opts, { xd: this.xd, xs: this.xs }, this.opts);
        return new Request(this.uri(), opts);
    }
    /**
     * Sends data.
     *
     * @param {String} data to send.
     * @param {Function} called upon flush.
     * @api private
     */
    doWrite(data, fn) {
        const req = this.request({
            method: "POST",
            data: data
        });
        req.on("success", fn);
        req.on("error", (xhrStatus, context) => {
            this.onError("xhr post error", xhrStatus, context);
        });
    }
    /**
     * Starts a poll cycle.
     *
     * @api private
     */
    doPoll() {
        const req = this.request();
        req.on("data", this.onData.bind(this));
        req.on("error", (xhrStatus, context) => {
            this.onError("xhr poll error", xhrStatus, context);
        });
        this.pollXhr = req;
    }
}
class Request extends Emitter {
    /**
     * Request constructor
     *
     * @param {Object} options
     * @api public
     */
    constructor(uri, opts) {
        super();
        installTimerFunctions(this, opts);
        this.opts = opts;
        this.method = opts.method || "GET";
        this.uri = uri;
        this.async = false !== opts.async;
        this.data = undefined !== opts.data ? opts.data : null;
        this.create();
    }
    /**
     * Creates the XHR object and sends the request.
     *
     * @api private
     */
    create() {
        const opts = pick(this.opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
        opts.xdomain = !!this.opts.xd;
        opts.xscheme = !!this.opts.xs;
        const xhr = (this.xhr = new XHR(opts));
        try {
            xhr.open(this.method, this.uri, this.async);
            try {
                if (this.opts.extraHeaders) {
                    xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
                    for (let i in this.opts.extraHeaders) {
                        if (this.opts.extraHeaders.hasOwnProperty(i)) {
                            xhr.setRequestHeader(i, this.opts.extraHeaders[i]);
                        }
                    }
                }
            }
            catch (e) { }
            if ("POST" === this.method) {
                try {
                    xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
                }
                catch (e) { }
            }
            try {
                xhr.setRequestHeader("Accept", "*/*");
            }
            catch (e) { }
            // ie6 check
            if ("withCredentials" in xhr) {
                xhr.withCredentials = this.opts.withCredentials;
            }
            if (this.opts.requestTimeout) {
                xhr.timeout = this.opts.requestTimeout;
            }
            xhr.onreadystatechange = () => {
                if (4 !== xhr.readyState)
                    return;
                if (200 === xhr.status || 1223 === xhr.status) {
                    this.onLoad();
                }
                else {
                    // make sure the `error` event handler that's user-set
                    // does not throw in the same tick and gets caught here
                    this.setTimeoutFn(() => {
                        this.onError(typeof xhr.status === "number" ? xhr.status : 0);
                    }, 0);
                }
            };
            xhr.send(this.data);
        }
        catch (e) {
            // Need to defer since .create() is called directly from the constructor
            // and thus the 'error' event can only be only bound *after* this exception
            // occurs.  Therefore, also, we cannot throw here at all.
            this.setTimeoutFn(() => {
                this.onError(e);
            }, 0);
            return;
        }
        if (typeof document !== "undefined") {
            this.index = Request.requestsCount++;
            Request.requests[this.index] = this;
        }
    }
    /**
     * Called upon error.
     *
     * @api private
     */
    onError(err) {
        this.emitReserved("error", err, this.xhr);
        this.cleanup(true);
    }
    /**
     * Cleans up house.
     *
     * @api private
     */
    cleanup(fromError) {
        if ("undefined" === typeof this.xhr || null === this.xhr) {
            return;
        }
        this.xhr.onreadystatechange = empty;
        if (fromError) {
            try {
                this.xhr.abort();
            }
            catch (e) { }
        }
        if (typeof document !== "undefined") {
            delete Request.requests[this.index];
        }
        this.xhr = null;
    }
    /**
     * Called upon load.
     *
     * @api private
     */
    onLoad() {
        const data = this.xhr.responseText;
        if (data !== null) {
            this.emitReserved("data", data);
            this.emitReserved("success");
            this.cleanup();
        }
    }
    /**
     * Aborts the request.
     *
     * @api public
     */
    abort() {
        this.cleanup();
    }
}
Request.requestsCount = 0;
Request.requests = {};
/**
 * Aborts pending requests when unloading the window. This is needed to prevent
 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
 * emitted.
 */
if (typeof document !== "undefined") {
    // @ts-ignore
    if (typeof attachEvent === "function") {
        // @ts-ignore
        attachEvent("onunload", unloadHandler);
    }
    else if (typeof addEventListener === "function") {
        const terminationEvent = "onpagehide" in globalThisShim ? "pagehide" : "unload";
        addEventListener(terminationEvent, unloadHandler, false);
    }
}
function unloadHandler() {
    for (let i in Request.requests) {
        if (Request.requests.hasOwnProperty(i)) {
            Request.requests[i].abort();
        }
    }
}

const nextTick = (() => {
    const isPromiseAvailable = typeof Promise === "function" && typeof Promise.resolve === "function";
    if (isPromiseAvailable) {
        return cb => Promise.resolve().then(cb);
    }
    else {
        return (cb, setTimeoutFn) => setTimeoutFn(cb, 0);
    }
})();
const WebSocket$1 = globalThisShim.WebSocket || globalThisShim.MozWebSocket;
const usingBrowserWebSocket = true;
const defaultBinaryType = "arraybuffer";

// detect ReactNative environment
const isReactNative = typeof navigator !== "undefined" &&
    typeof navigator.product === "string" &&
    navigator.product.toLowerCase() === "reactnative";
class WS extends Transport {
    /**
     * WebSocket transport constructor.
     *
     * @api {Object} connection options
     * @api public
     */
    constructor(opts) {
        super(opts);
        this.supportsBinary = !opts.forceBase64;
    }
    /**
     * Transport name.
     *
     * @api public
     */
    get name() {
        return "websocket";
    }
    /**
     * Opens socket.
     *
     * @api private
     */
    doOpen() {
        if (!this.check()) {
            // let probe timeout
            return;
        }
        const uri = this.uri();
        const protocols = this.opts.protocols;
        // React Native only supports the 'headers' option, and will print a warning if anything else is passed
        const opts = isReactNative
            ? {}
            : pick(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
        if (this.opts.extraHeaders) {
            opts.headers = this.opts.extraHeaders;
        }
        try {
            this.ws =
                usingBrowserWebSocket && !isReactNative
                    ? protocols
                        ? new WebSocket$1(uri, protocols)
                        : new WebSocket$1(uri)
                    : new WebSocket$1(uri, protocols, opts);
        }
        catch (err) {
            return this.emitReserved("error", err);
        }
        this.ws.binaryType = this.socket.binaryType || defaultBinaryType;
        this.addEventListeners();
    }
    /**
     * Adds event listeners to the socket
     *
     * @api private
     */
    addEventListeners() {
        this.ws.onopen = () => {
            if (this.opts.autoUnref) {
                this.ws._socket.unref();
            }
            this.onOpen();
        };
        this.ws.onclose = closeEvent => this.onClose({
            description: "websocket connection closed",
            context: closeEvent
        });
        this.ws.onmessage = ev => this.onData(ev.data);
        this.ws.onerror = e => this.onError("websocket error", e);
    }
    /**
     * Writes data to socket.
     *
     * @param {Array} array of packets.
     * @api private
     */
    write(packets) {
        this.writable = false;
        // encodePacket efficient as it uses WS framing
        // no need for encodePayload
        for (let i = 0; i < packets.length; i++) {
            const packet = packets[i];
            const lastPacket = i === packets.length - 1;
            encodePacket(packet, this.supportsBinary, data => {
                // always create a new object (GH-437)
                const opts = {};
                // Sometimes the websocket has already been closed but the browser didn't
                // have a chance of informing us about it yet, in that case send will
                // throw an error
                try {
                    if (usingBrowserWebSocket) {
                        // TypeError is thrown when passing the second argument on Safari
                        this.ws.send(data);
                    }
                }
                catch (e) {
                }
                if (lastPacket) {
                    // fake drain
                    // defer to next tick to allow Socket to clear writeBuffer
                    nextTick(() => {
                        this.writable = true;
                        this.emitReserved("drain");
                    }, this.setTimeoutFn);
                }
            });
        }
    }
    /**
     * Closes socket.
     *
     * @api private
     */
    doClose() {
        if (typeof this.ws !== "undefined") {
            this.ws.close();
            this.ws = null;
        }
    }
    /**
     * Generates uri for connection.
     *
     * @api private
     */
    uri() {
        let query = this.query || {};
        const schema = this.opts.secure ? "wss" : "ws";
        let port = "";
        // avoid port if default for schema
        if (this.opts.port &&
            (("wss" === schema && Number(this.opts.port) !== 443) ||
                ("ws" === schema && Number(this.opts.port) !== 80))) {
            port = ":" + this.opts.port;
        }
        // append timestamp to URI
        if (this.opts.timestampRequests) {
            query[this.opts.timestampParam] = yeast();
        }
        // communicate binary support capabilities
        if (!this.supportsBinary) {
            query.b64 = 1;
        }
        const encodedQuery = encode(query);
        const ipv6 = this.opts.hostname.indexOf(":") !== -1;
        return (schema +
            "://" +
            (ipv6 ? "[" + this.opts.hostname + "]" : this.opts.hostname) +
            port +
            this.opts.path +
            (encodedQuery.length ? "?" + encodedQuery : ""));
    }
    /**
     * Feature detection for WebSocket.
     *
     * @return {Boolean} whether this transport is available.
     * @api public
     */
    check() {
        return !!WebSocket$1;
    }
}

const transports = {
    websocket: WS,
    polling: Polling
};

// imported from https://github.com/galkn/parseuri
/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */
const re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
const parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];
function parse$1(str) {
    const src = str, b = str.indexOf('['), e = str.indexOf(']');
    if (b != -1 && e != -1) {
        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
    }
    let m = re.exec(str || ''), uri = {}, i = 14;
    while (i--) {
        uri[parts[i]] = m[i] || '';
    }
    if (b != -1 && e != -1) {
        uri.source = src;
        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
        uri.ipv6uri = true;
    }
    uri.pathNames = pathNames(uri, uri['path']);
    uri.queryKey = queryKey(uri, uri['query']);
    return uri;
}
function pathNames(obj, path) {
    const regx = /\/{2,9}/g, names = path.replace(regx, "/").split("/");
    if (path.substr(0, 1) == '/' || path.length === 0) {
        names.splice(0, 1);
    }
    if (path.substr(path.length - 1, 1) == '/') {
        names.splice(names.length - 1, 1);
    }
    return names;
}
function queryKey(uri, query) {
    const data = {};
    query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
        if ($1) {
            data[$1] = $2;
        }
    });
    return data;
}

class Socket$1 extends Emitter {
    /**
     * Socket constructor.
     *
     * @param {String|Object} uri or options
     * @param {Object} opts - options
     * @api public
     */
    constructor(uri, opts = {}) {
        super();
        if (uri && "object" === typeof uri) {
            opts = uri;
            uri = null;
        }
        if (uri) {
            uri = parse$1(uri);
            opts.hostname = uri.host;
            opts.secure = uri.protocol === "https" || uri.protocol === "wss";
            opts.port = uri.port;
            if (uri.query)
                opts.query = uri.query;
        }
        else if (opts.host) {
            opts.hostname = parse$1(opts.host).host;
        }
        installTimerFunctions(this, opts);
        this.secure =
            null != opts.secure
                ? opts.secure
                : typeof location !== "undefined" && "https:" === location.protocol;
        if (opts.hostname && !opts.port) {
            // if no port is specified manually, use the protocol default
            opts.port = this.secure ? "443" : "80";
        }
        this.hostname =
            opts.hostname ||
                (typeof location !== "undefined" ? location.hostname : "localhost");
        this.port =
            opts.port ||
                (typeof location !== "undefined" && location.port
                    ? location.port
                    : this.secure
                        ? "443"
                        : "80");
        this.transports = opts.transports || ["polling", "websocket"];
        this.readyState = "";
        this.writeBuffer = [];
        this.prevBufferLen = 0;
        this.opts = Object.assign({
            path: "/engine.io",
            agent: false,
            withCredentials: false,
            upgrade: true,
            timestampParam: "t",
            rememberUpgrade: false,
            rejectUnauthorized: true,
            perMessageDeflate: {
                threshold: 1024
            },
            transportOptions: {},
            closeOnBeforeunload: true
        }, opts);
        this.opts.path = this.opts.path.replace(/\/$/, "") + "/";
        if (typeof this.opts.query === "string") {
            this.opts.query = decode(this.opts.query);
        }
        // set on handshake
        this.id = null;
        this.upgrades = null;
        this.pingInterval = null;
        this.pingTimeout = null;
        // set on heartbeat
        this.pingTimeoutTimer = null;
        if (typeof addEventListener === "function") {
            if (this.opts.closeOnBeforeunload) {
                // Firefox closes the connection when the "beforeunload" event is emitted but not Chrome. This event listener
                // ensures every browser behaves the same (no "disconnect" event at the Socket.IO level when the page is
                // closed/reloaded)
                addEventListener("beforeunload", () => {
                    if (this.transport) {
                        // silently close the transport
                        this.transport.removeAllListeners();
                        this.transport.close();
                    }
                }, false);
            }
            if (this.hostname !== "localhost") {
                this.offlineEventListener = () => {
                    this.onClose("transport close", {
                        description: "network connection lost"
                    });
                };
                addEventListener("offline", this.offlineEventListener, false);
            }
        }
        this.open();
    }
    /**
     * Creates transport of the given type.
     *
     * @param {String} transport name
     * @return {Transport}
     * @api private
     */
    createTransport(name) {
        const query = Object.assign({}, this.opts.query);
        // append engine.io protocol identifier
        query.EIO = protocol$1;
        // transport name
        query.transport = name;
        // session id if we already have one
        if (this.id)
            query.sid = this.id;
        const opts = Object.assign({}, this.opts.transportOptions[name], this.opts, {
            query,
            socket: this,
            hostname: this.hostname,
            secure: this.secure,
            port: this.port
        });
        return new transports[name](opts);
    }
    /**
     * Initializes transport to use and starts probe.
     *
     * @api private
     */
    open() {
        let transport;
        if (this.opts.rememberUpgrade &&
            Socket$1.priorWebsocketSuccess &&
            this.transports.indexOf("websocket") !== -1) {
            transport = "websocket";
        }
        else if (0 === this.transports.length) {
            // Emit error on next tick so it can be listened to
            this.setTimeoutFn(() => {
                this.emitReserved("error", "No transports available");
            }, 0);
            return;
        }
        else {
            transport = this.transports[0];
        }
        this.readyState = "opening";
        // Retry with the next transport if the transport is disabled (jsonp: false)
        try {
            transport = this.createTransport(transport);
        }
        catch (e) {
            this.transports.shift();
            this.open();
            return;
        }
        transport.open();
        this.setTransport(transport);
    }
    /**
     * Sets the current transport. Disables the existing one (if any).
     *
     * @api private
     */
    setTransport(transport) {
        if (this.transport) {
            this.transport.removeAllListeners();
        }
        // set up transport
        this.transport = transport;
        // set up transport listeners
        transport
            .on("drain", this.onDrain.bind(this))
            .on("packet", this.onPacket.bind(this))
            .on("error", this.onError.bind(this))
            .on("close", reason => this.onClose("transport close", reason));
    }
    /**
     * Probes a transport.
     *
     * @param {String} transport name
     * @api private
     */
    probe(name) {
        let transport = this.createTransport(name);
        let failed = false;
        Socket$1.priorWebsocketSuccess = false;
        const onTransportOpen = () => {
            if (failed)
                return;
            transport.send([{ type: "ping", data: "probe" }]);
            transport.once("packet", msg => {
                if (failed)
                    return;
                if ("pong" === msg.type && "probe" === msg.data) {
                    this.upgrading = true;
                    this.emitReserved("upgrading", transport);
                    if (!transport)
                        return;
                    Socket$1.priorWebsocketSuccess = "websocket" === transport.name;
                    this.transport.pause(() => {
                        if (failed)
                            return;
                        if ("closed" === this.readyState)
                            return;
                        cleanup();
                        this.setTransport(transport);
                        transport.send([{ type: "upgrade" }]);
                        this.emitReserved("upgrade", transport);
                        transport = null;
                        this.upgrading = false;
                        this.flush();
                    });
                }
                else {
                    const err = new Error("probe error");
                    // @ts-ignore
                    err.transport = transport.name;
                    this.emitReserved("upgradeError", err);
                }
            });
        };
        function freezeTransport() {
            if (failed)
                return;
            // Any callback called by transport should be ignored since now
            failed = true;
            cleanup();
            transport.close();
            transport = null;
        }
        // Handle any error that happens while probing
        const onerror = err => {
            const error = new Error("probe error: " + err);
            // @ts-ignore
            error.transport = transport.name;
            freezeTransport();
            this.emitReserved("upgradeError", error);
        };
        function onTransportClose() {
            onerror("transport closed");
        }
        // When the socket is closed while we're probing
        function onclose() {
            onerror("socket closed");
        }
        // When the socket is upgraded while we're probing
        function onupgrade(to) {
            if (transport && to.name !== transport.name) {
                freezeTransport();
            }
        }
        // Remove all listeners on the transport and on self
        const cleanup = () => {
            transport.removeListener("open", onTransportOpen);
            transport.removeListener("error", onerror);
            transport.removeListener("close", onTransportClose);
            this.off("close", onclose);
            this.off("upgrading", onupgrade);
        };
        transport.once("open", onTransportOpen);
        transport.once("error", onerror);
        transport.once("close", onTransportClose);
        this.once("close", onclose);
        this.once("upgrading", onupgrade);
        transport.open();
    }
    /**
     * Called when connection is deemed open.
     *
     * @api private
     */
    onOpen() {
        this.readyState = "open";
        Socket$1.priorWebsocketSuccess = "websocket" === this.transport.name;
        this.emitReserved("open");
        this.flush();
        // we check for `readyState` in case an `open`
        // listener already closed the socket
        if ("open" === this.readyState &&
            this.opts.upgrade &&
            this.transport.pause) {
            let i = 0;
            const l = this.upgrades.length;
            for (; i < l; i++) {
                this.probe(this.upgrades[i]);
            }
        }
    }
    /**
     * Handles a packet.
     *
     * @api private
     */
    onPacket(packet) {
        if ("opening" === this.readyState ||
            "open" === this.readyState ||
            "closing" === this.readyState) {
            this.emitReserved("packet", packet);
            // Socket is live - any packet counts
            this.emitReserved("heartbeat");
            switch (packet.type) {
                case "open":
                    this.onHandshake(JSON.parse(packet.data));
                    break;
                case "ping":
                    this.resetPingTimeout();
                    this.sendPacket("pong");
                    this.emitReserved("ping");
                    this.emitReserved("pong");
                    break;
                case "error":
                    const err = new Error("server error");
                    // @ts-ignore
                    err.code = packet.data;
                    this.onError(err);
                    break;
                case "message":
                    this.emitReserved("data", packet.data);
                    this.emitReserved("message", packet.data);
                    break;
            }
        }
    }
    /**
     * Called upon handshake completion.
     *
     * @param {Object} data - handshake obj
     * @api private
     */
    onHandshake(data) {
        this.emitReserved("handshake", data);
        this.id = data.sid;
        this.transport.query.sid = data.sid;
        this.upgrades = this.filterUpgrades(data.upgrades);
        this.pingInterval = data.pingInterval;
        this.pingTimeout = data.pingTimeout;
        this.maxPayload = data.maxPayload;
        this.onOpen();
        // In case open handler closes socket
        if ("closed" === this.readyState)
            return;
        this.resetPingTimeout();
    }
    /**
     * Sets and resets ping timeout timer based on server pings.
     *
     * @api private
     */
    resetPingTimeout() {
        this.clearTimeoutFn(this.pingTimeoutTimer);
        this.pingTimeoutTimer = this.setTimeoutFn(() => {
            this.onClose("ping timeout");
        }, this.pingInterval + this.pingTimeout);
        if (this.opts.autoUnref) {
            this.pingTimeoutTimer.unref();
        }
    }
    /**
     * Called on `drain` event
     *
     * @api private
     */
    onDrain() {
        this.writeBuffer.splice(0, this.prevBufferLen);
        // setting prevBufferLen = 0 is very important
        // for example, when upgrading, upgrade packet is sent over,
        // and a nonzero prevBufferLen could cause problems on `drain`
        this.prevBufferLen = 0;
        if (0 === this.writeBuffer.length) {
            this.emitReserved("drain");
        }
        else {
            this.flush();
        }
    }
    /**
     * Flush write buffers.
     *
     * @api private
     */
    flush() {
        if ("closed" !== this.readyState &&
            this.transport.writable &&
            !this.upgrading &&
            this.writeBuffer.length) {
            const packets = this.getWritablePackets();
            this.transport.send(packets);
            // keep track of current length of writeBuffer
            // splice writeBuffer and callbackBuffer on `drain`
            this.prevBufferLen = packets.length;
            this.emitReserved("flush");
        }
    }
    /**
     * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
     * long-polling)
     *
     * @private
     */
    getWritablePackets() {
        const shouldCheckPayloadSize = this.maxPayload &&
            this.transport.name === "polling" &&
            this.writeBuffer.length > 1;
        if (!shouldCheckPayloadSize) {
            return this.writeBuffer;
        }
        let payloadSize = 1; // first packet type
        for (let i = 0; i < this.writeBuffer.length; i++) {
            const data = this.writeBuffer[i].data;
            if (data) {
                payloadSize += byteLength(data);
            }
            if (i > 0 && payloadSize > this.maxPayload) {
                return this.writeBuffer.slice(0, i);
            }
            payloadSize += 2; // separator + packet type
        }
        return this.writeBuffer;
    }
    /**
     * Sends a message.
     *
     * @param {String} message.
     * @param {Function} callback function.
     * @param {Object} options.
     * @return {Socket} for chaining.
     * @api public
     */
    write(msg, options, fn) {
        this.sendPacket("message", msg, options, fn);
        return this;
    }
    send(msg, options, fn) {
        this.sendPacket("message", msg, options, fn);
        return this;
    }
    /**
     * Sends a packet.
     *
     * @param {String} packet type.
     * @param {String} data.
     * @param {Object} options.
     * @param {Function} callback function.
     * @api private
     */
    sendPacket(type, data, options, fn) {
        if ("function" === typeof data) {
            fn = data;
            data = undefined;
        }
        if ("function" === typeof options) {
            fn = options;
            options = null;
        }
        if ("closing" === this.readyState || "closed" === this.readyState) {
            return;
        }
        options = options || {};
        options.compress = false !== options.compress;
        const packet = {
            type: type,
            data: data,
            options: options
        };
        this.emitReserved("packetCreate", packet);
        this.writeBuffer.push(packet);
        if (fn)
            this.once("flush", fn);
        this.flush();
    }
    /**
     * Closes the connection.
     *
     * @api public
     */
    close() {
        const close = () => {
            this.onClose("forced close");
            this.transport.close();
        };
        const cleanupAndClose = () => {
            this.off("upgrade", cleanupAndClose);
            this.off("upgradeError", cleanupAndClose);
            close();
        };
        const waitForUpgrade = () => {
            // wait for upgrade to finish since we can't send packets while pausing a transport
            this.once("upgrade", cleanupAndClose);
            this.once("upgradeError", cleanupAndClose);
        };
        if ("opening" === this.readyState || "open" === this.readyState) {
            this.readyState = "closing";
            if (this.writeBuffer.length) {
                this.once("drain", () => {
                    if (this.upgrading) {
                        waitForUpgrade();
                    }
                    else {
                        close();
                    }
                });
            }
            else if (this.upgrading) {
                waitForUpgrade();
            }
            else {
                close();
            }
        }
        return this;
    }
    /**
     * Called upon transport error
     *
     * @api private
     */
    onError(err) {
        Socket$1.priorWebsocketSuccess = false;
        this.emitReserved("error", err);
        this.onClose("transport error", err);
    }
    /**
     * Called upon transport close.
     *
     * @api private
     */
    onClose(reason, description) {
        if ("opening" === this.readyState ||
            "open" === this.readyState ||
            "closing" === this.readyState) {
            // clear timers
            this.clearTimeoutFn(this.pingTimeoutTimer);
            // stop event from firing again for transport
            this.transport.removeAllListeners("close");
            // ensure transport won't stay open
            this.transport.close();
            // ignore further transport communication
            this.transport.removeAllListeners();
            if (typeof removeEventListener === "function") {
                removeEventListener("offline", this.offlineEventListener, false);
            }
            // set ready state
            this.readyState = "closed";
            // clear session id
            this.id = null;
            // emit close event
            this.emitReserved("close", reason, description);
            // clean buffers after, so users can still
            // grab the buffers on `close` event
            this.writeBuffer = [];
            this.prevBufferLen = 0;
        }
    }
    /**
     * Filters upgrades, returning only those matching client transports.
     *
     * @param {Array} server upgrades
     * @api private
     *
     */
    filterUpgrades(upgrades) {
        const filteredUpgrades = [];
        let i = 0;
        const j = upgrades.length;
        for (; i < j; i++) {
            if (~this.transports.indexOf(upgrades[i]))
                filteredUpgrades.push(upgrades[i]);
        }
        return filteredUpgrades;
    }
}
Socket$1.protocol = protocol$1;

/**
 * URL parser.
 *
 * @param uri - url
 * @param path - the request path of the connection
 * @param loc - An object meant to mimic window.location.
 *        Defaults to window.location.
 * @public
 */
function url(uri, path = "", loc) {
    let obj = uri;
    // default to window.location
    loc = loc || (typeof location !== "undefined" && location);
    if (null == uri)
        uri = loc.protocol + "//" + loc.host;
    // relative path support
    if (typeof uri === "string") {
        if ("/" === uri.charAt(0)) {
            if ("/" === uri.charAt(1)) {
                uri = loc.protocol + uri;
            }
            else {
                uri = loc.host + uri;
            }
        }
        if (!/^(https?|wss?):\/\//.test(uri)) {
            if ("undefined" !== typeof loc) {
                uri = loc.protocol + "//" + uri;
            }
            else {
                uri = "https://" + uri;
            }
        }
        // parse
        obj = parse$1(uri);
    }
    // make sure we treat `localhost:80` and `localhost` equally
    if (!obj.port) {
        if (/^(http|ws)$/.test(obj.protocol)) {
            obj.port = "80";
        }
        else if (/^(http|ws)s$/.test(obj.protocol)) {
            obj.port = "443";
        }
    }
    obj.path = obj.path || "/";
    const ipv6 = obj.host.indexOf(":") !== -1;
    const host = ipv6 ? "[" + obj.host + "]" : obj.host;
    // define unique id
    obj.id = obj.protocol + "://" + host + ":" + obj.port + path;
    // define href
    obj.href =
        obj.protocol +
            "://" +
            host +
            (loc && loc.port === obj.port ? "" : ":" + obj.port);
    return obj;
}

const withNativeArrayBuffer = typeof ArrayBuffer === "function";
const isView = (obj) => {
    return typeof ArrayBuffer.isView === "function"
        ? ArrayBuffer.isView(obj)
        : obj.buffer instanceof ArrayBuffer;
};
const toString$1 = Object.prototype.toString;
const withNativeBlob = typeof Blob === "function" ||
    (typeof Blob !== "undefined" &&
        toString$1.call(Blob) === "[object BlobConstructor]");
const withNativeFile = typeof File === "function" ||
    (typeof File !== "undefined" &&
        toString$1.call(File) === "[object FileConstructor]");
/**
 * Returns true if obj is a Buffer, an ArrayBuffer, a Blob or a File.
 *
 * @private
 */
function isBinary(obj) {
    return ((withNativeArrayBuffer && (obj instanceof ArrayBuffer || isView(obj))) ||
        (withNativeBlob && obj instanceof Blob) ||
        (withNativeFile && obj instanceof File));
}
function hasBinary(obj, toJSON) {
    if (!obj || typeof obj !== "object") {
        return false;
    }
    if (Array.isArray(obj)) {
        for (let i = 0, l = obj.length; i < l; i++) {
            if (hasBinary(obj[i])) {
                return true;
            }
        }
        return false;
    }
    if (isBinary(obj)) {
        return true;
    }
    if (obj.toJSON &&
        typeof obj.toJSON === "function" &&
        arguments.length === 1) {
        return hasBinary(obj.toJSON(), true);
    }
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
            return true;
        }
    }
    return false;
}

/**
 * Replaces every Buffer | ArrayBuffer | Blob | File in packet with a numbered placeholder.
 *
 * @param {Object} packet - socket.io event packet
 * @return {Object} with deconstructed packet and list of buffers
 * @public
 */
function deconstructPacket(packet) {
    const buffers = [];
    const packetData = packet.data;
    const pack = packet;
    pack.data = _deconstructPacket(packetData, buffers);
    pack.attachments = buffers.length; // number of binary 'attachments'
    return { packet: pack, buffers: buffers };
}
function _deconstructPacket(data, buffers) {
    if (!data)
        return data;
    if (isBinary(data)) {
        const placeholder = { _placeholder: true, num: buffers.length };
        buffers.push(data);
        return placeholder;
    }
    else if (Array.isArray(data)) {
        const newData = new Array(data.length);
        for (let i = 0; i < data.length; i++) {
            newData[i] = _deconstructPacket(data[i], buffers);
        }
        return newData;
    }
    else if (typeof data === "object" && !(data instanceof Date)) {
        const newData = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                newData[key] = _deconstructPacket(data[key], buffers);
            }
        }
        return newData;
    }
    return data;
}
/**
 * Reconstructs a binary packet from its placeholder packet and buffers
 *
 * @param {Object} packet - event packet with placeholders
 * @param {Array} buffers - binary buffers to put in placeholder positions
 * @return {Object} reconstructed packet
 * @public
 */
function reconstructPacket(packet, buffers) {
    packet.data = _reconstructPacket(packet.data, buffers);
    packet.attachments = undefined; // no longer useful
    return packet;
}
function _reconstructPacket(data, buffers) {
    if (!data)
        return data;
    if (data && data._placeholder === true) {
        const isIndexValid = typeof data.num === "number" &&
            data.num >= 0 &&
            data.num < buffers.length;
        if (isIndexValid) {
            return buffers[data.num]; // appropriate buffer (should be natural order anyway)
        }
        else {
            throw new Error("illegal attachments");
        }
    }
    else if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
            data[i] = _reconstructPacket(data[i], buffers);
        }
    }
    else if (typeof data === "object") {
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                data[key] = _reconstructPacket(data[key], buffers);
            }
        }
    }
    return data;
}

/**
 * Protocol version.
 *
 * @public
 */
const protocol = 5;
var PacketType;
(function (PacketType) {
    PacketType[PacketType["CONNECT"] = 0] = "CONNECT";
    PacketType[PacketType["DISCONNECT"] = 1] = "DISCONNECT";
    PacketType[PacketType["EVENT"] = 2] = "EVENT";
    PacketType[PacketType["ACK"] = 3] = "ACK";
    PacketType[PacketType["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
    PacketType[PacketType["BINARY_EVENT"] = 5] = "BINARY_EVENT";
    PacketType[PacketType["BINARY_ACK"] = 6] = "BINARY_ACK";
})(PacketType || (PacketType = {}));
/**
 * A socket.io Encoder instance
 */
class Encoder {
    /**
     * Encoder constructor
     *
     * @param {function} replacer - custom replacer to pass down to JSON.parse
     */
    constructor(replacer) {
        this.replacer = replacer;
    }
    /**
     * Encode a packet as a single string if non-binary, or as a
     * buffer sequence, depending on packet type.
     *
     * @param {Object} obj - packet object
     */
    encode(obj) {
        if (obj.type === PacketType.EVENT || obj.type === PacketType.ACK) {
            if (hasBinary(obj)) {
                obj.type =
                    obj.type === PacketType.EVENT
                        ? PacketType.BINARY_EVENT
                        : PacketType.BINARY_ACK;
                return this.encodeAsBinary(obj);
            }
        }
        return [this.encodeAsString(obj)];
    }
    /**
     * Encode packet as string.
     */
    encodeAsString(obj) {
        // first is type
        let str = "" + obj.type;
        // attachments if we have them
        if (obj.type === PacketType.BINARY_EVENT ||
            obj.type === PacketType.BINARY_ACK) {
            str += obj.attachments + "-";
        }
        // if we have a namespace other than `/`
        // we append it followed by a comma `,`
        if (obj.nsp && "/" !== obj.nsp) {
            str += obj.nsp + ",";
        }
        // immediately followed by the id
        if (null != obj.id) {
            str += obj.id;
        }
        // json data
        if (null != obj.data) {
            str += JSON.stringify(obj.data, this.replacer);
        }
        return str;
    }
    /**
     * Encode packet as 'buffer sequence' by removing blobs, and
     * deconstructing packet into object with placeholders and
     * a list of buffers.
     */
    encodeAsBinary(obj) {
        const deconstruction = deconstructPacket(obj);
        const pack = this.encodeAsString(deconstruction.packet);
        const buffers = deconstruction.buffers;
        buffers.unshift(pack); // add packet info to beginning of data list
        return buffers; // write all the buffers
    }
}
/**
 * A socket.io Decoder instance
 *
 * @return {Object} decoder
 */
class Decoder extends Emitter {
    /**
     * Decoder constructor
     *
     * @param {function} reviver - custom reviver to pass down to JSON.stringify
     */
    constructor(reviver) {
        super();
        this.reviver = reviver;
    }
    /**
     * Decodes an encoded packet string into packet JSON.
     *
     * @param {String} obj - encoded packet
     */
    add(obj) {
        let packet;
        if (typeof obj === "string") {
            if (this.reconstructor) {
                throw new Error("got plaintext data when reconstructing a packet");
            }
            packet = this.decodeString(obj);
            if (packet.type === PacketType.BINARY_EVENT ||
                packet.type === PacketType.BINARY_ACK) {
                // binary packet's json
                this.reconstructor = new BinaryReconstructor(packet);
                // no attachments, labeled binary but no binary data to follow
                if (packet.attachments === 0) {
                    super.emitReserved("decoded", packet);
                }
            }
            else {
                // non-binary full packet
                super.emitReserved("decoded", packet);
            }
        }
        else if (isBinary(obj) || obj.base64) {
            // raw binary data
            if (!this.reconstructor) {
                throw new Error("got binary data when not reconstructing a packet");
            }
            else {
                packet = this.reconstructor.takeBinaryData(obj);
                if (packet) {
                    // received final buffer
                    this.reconstructor = null;
                    super.emitReserved("decoded", packet);
                }
            }
        }
        else {
            throw new Error("Unknown type: " + obj);
        }
    }
    /**
     * Decode a packet String (JSON data)
     *
     * @param {String} str
     * @return {Object} packet
     */
    decodeString(str) {
        let i = 0;
        // look up type
        const p = {
            type: Number(str.charAt(0)),
        };
        if (PacketType[p.type] === undefined) {
            throw new Error("unknown packet type " + p.type);
        }
        // look up attachments if type binary
        if (p.type === PacketType.BINARY_EVENT ||
            p.type === PacketType.BINARY_ACK) {
            const start = i + 1;
            while (str.charAt(++i) !== "-" && i != str.length) { }
            const buf = str.substring(start, i);
            if (buf != Number(buf) || str.charAt(i) !== "-") {
                throw new Error("Illegal attachments");
            }
            p.attachments = Number(buf);
        }
        // look up namespace (if any)
        if ("/" === str.charAt(i + 1)) {
            const start = i + 1;
            while (++i) {
                const c = str.charAt(i);
                if ("," === c)
                    break;
                if (i === str.length)
                    break;
            }
            p.nsp = str.substring(start, i);
        }
        else {
            p.nsp = "/";
        }
        // look up id
        const next = str.charAt(i + 1);
        if ("" !== next && Number(next) == next) {
            const start = i + 1;
            while (++i) {
                const c = str.charAt(i);
                if (null == c || Number(c) != c) {
                    --i;
                    break;
                }
                if (i === str.length)
                    break;
            }
            p.id = Number(str.substring(start, i + 1));
        }
        // look up json data
        if (str.charAt(++i)) {
            const payload = this.tryParse(str.substr(i));
            if (Decoder.isPayloadValid(p.type, payload)) {
                p.data = payload;
            }
            else {
                throw new Error("invalid payload");
            }
        }
        return p;
    }
    tryParse(str) {
        try {
            return JSON.parse(str, this.reviver);
        }
        catch (e) {
            return false;
        }
    }
    static isPayloadValid(type, payload) {
        switch (type) {
            case PacketType.CONNECT:
                return typeof payload === "object";
            case PacketType.DISCONNECT:
                return payload === undefined;
            case PacketType.CONNECT_ERROR:
                return typeof payload === "string" || typeof payload === "object";
            case PacketType.EVENT:
            case PacketType.BINARY_EVENT:
                return Array.isArray(payload) && payload.length > 0;
            case PacketType.ACK:
            case PacketType.BINARY_ACK:
                return Array.isArray(payload);
        }
    }
    /**
     * Deallocates a parser's resources
     */
    destroy() {
        if (this.reconstructor) {
            this.reconstructor.finishedReconstruction();
        }
    }
}
/**
 * A manager of a binary event's 'buffer sequence'. Should
 * be constructed whenever a packet of type BINARY_EVENT is
 * decoded.
 *
 * @param {Object} packet
 * @return {BinaryReconstructor} initialized reconstructor
 */
class BinaryReconstructor {
    constructor(packet) {
        this.packet = packet;
        this.buffers = [];
        this.reconPack = packet;
    }
    /**
     * Method to be called when binary data received from connection
     * after a BINARY_EVENT packet.
     *
     * @param {Buffer | ArrayBuffer} binData - the raw binary data received
     * @return {null | Object} returns null if more binary data is expected or
     *   a reconstructed packet object if all buffers have been received.
     */
    takeBinaryData(binData) {
        this.buffers.push(binData);
        if (this.buffers.length === this.reconPack.attachments) {
            // done with buffer list
            const packet = reconstructPacket(this.reconPack, this.buffers);
            this.finishedReconstruction();
            return packet;
        }
        return null;
    }
    /**
     * Cleans up binary packet reconstruction variables.
     */
    finishedReconstruction() {
        this.reconPack = null;
        this.buffers = [];
    }
}

var parser = /*#__PURE__*/Object.freeze({
    __proto__: null,
    protocol: protocol,
    get PacketType () { return PacketType; },
    Encoder: Encoder,
    Decoder: Decoder
});

function on(obj, ev, fn) {
    obj.on(ev, fn);
    return function subDestroy() {
        obj.off(ev, fn);
    };
}

/**
 * Internal events.
 * These events can't be emitted by the user.
 */
const RESERVED_EVENTS = Object.freeze({
    connect: 1,
    connect_error: 1,
    disconnect: 1,
    disconnecting: 1,
    // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
    newListener: 1,
    removeListener: 1,
});
class Socket extends Emitter {
    /**
     * `Socket` constructor.
     *
     * @public
     */
    constructor(io, nsp, opts) {
        super();
        this.connected = false;
        this.receiveBuffer = [];
        this.sendBuffer = [];
        this.ids = 0;
        this.acks = {};
        this.flags = {};
        this.io = io;
        this.nsp = nsp;
        if (opts && opts.auth) {
            this.auth = opts.auth;
        }
        if (this.io._autoConnect)
            this.open();
    }
    /**
     * Whether the socket is currently disconnected
     */
    get disconnected() {
        return !this.connected;
    }
    /**
     * Subscribe to open, close and packet events
     *
     * @private
     */
    subEvents() {
        if (this.subs)
            return;
        const io = this.io;
        this.subs = [
            on(io, "open", this.onopen.bind(this)),
            on(io, "packet", this.onpacket.bind(this)),
            on(io, "error", this.onerror.bind(this)),
            on(io, "close", this.onclose.bind(this)),
        ];
    }
    /**
     * Whether the Socket will try to reconnect when its Manager connects or reconnects
     */
    get active() {
        return !!this.subs;
    }
    /**
     * "Opens" the socket.
     *
     * @public
     */
    connect() {
        if (this.connected)
            return this;
        this.subEvents();
        if (!this.io["_reconnecting"])
            this.io.open(); // ensure open
        if ("open" === this.io._readyState)
            this.onopen();
        return this;
    }
    /**
     * Alias for connect()
     */
    open() {
        return this.connect();
    }
    /**
     * Sends a `message` event.
     *
     * @return self
     * @public
     */
    send(...args) {
        args.unshift("message");
        this.emit.apply(this, args);
        return this;
    }
    /**
     * Override `emit`.
     * If the event is in `events`, it's emitted normally.
     *
     * @return self
     * @public
     */
    emit(ev, ...args) {
        if (RESERVED_EVENTS.hasOwnProperty(ev)) {
            throw new Error('"' + ev.toString() + '" is a reserved event name');
        }
        args.unshift(ev);
        const packet = {
            type: PacketType.EVENT,
            data: args,
        };
        packet.options = {};
        packet.options.compress = this.flags.compress !== false;
        // event ack callback
        if ("function" === typeof args[args.length - 1]) {
            const id = this.ids++;
            const ack = args.pop();
            this._registerAckCallback(id, ack);
            packet.id = id;
        }
        const isTransportWritable = this.io.engine &&
            this.io.engine.transport &&
            this.io.engine.transport.writable;
        const discardPacket = this.flags.volatile && (!isTransportWritable || !this.connected);
        if (discardPacket) ;
        else if (this.connected) {
            this.notifyOutgoingListeners(packet);
            this.packet(packet);
        }
        else {
            this.sendBuffer.push(packet);
        }
        this.flags = {};
        return this;
    }
    /**
     * @private
     */
    _registerAckCallback(id, ack) {
        const timeout = this.flags.timeout;
        if (timeout === undefined) {
            this.acks[id] = ack;
            return;
        }
        // @ts-ignore
        const timer = this.io.setTimeoutFn(() => {
            delete this.acks[id];
            for (let i = 0; i < this.sendBuffer.length; i++) {
                if (this.sendBuffer[i].id === id) {
                    this.sendBuffer.splice(i, 1);
                }
            }
            ack.call(this, new Error("operation has timed out"));
        }, timeout);
        this.acks[id] = (...args) => {
            // @ts-ignore
            this.io.clearTimeoutFn(timer);
            ack.apply(this, [null, ...args]);
        };
    }
    /**
     * Sends a packet.
     *
     * @param packet
     * @private
     */
    packet(packet) {
        packet.nsp = this.nsp;
        this.io._packet(packet);
    }
    /**
     * Called upon engine `open`.
     *
     * @private
     */
    onopen() {
        if (typeof this.auth == "function") {
            this.auth((data) => {
                this.packet({ type: PacketType.CONNECT, data });
            });
        }
        else {
            this.packet({ type: PacketType.CONNECT, data: this.auth });
        }
    }
    /**
     * Called upon engine or manager `error`.
     *
     * @param err
     * @private
     */
    onerror(err) {
        if (!this.connected) {
            this.emitReserved("connect_error", err);
        }
    }
    /**
     * Called upon engine `close`.
     *
     * @param reason
     * @param description
     * @private
     */
    onclose(reason, description) {
        this.connected = false;
        delete this.id;
        this.emitReserved("disconnect", reason, description);
    }
    /**
     * Called with socket packet.
     *
     * @param packet
     * @private
     */
    onpacket(packet) {
        const sameNamespace = packet.nsp === this.nsp;
        if (!sameNamespace)
            return;
        switch (packet.type) {
            case PacketType.CONNECT:
                if (packet.data && packet.data.sid) {
                    const id = packet.data.sid;
                    this.onconnect(id);
                }
                else {
                    this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
                }
                break;
            case PacketType.EVENT:
            case PacketType.BINARY_EVENT:
                this.onevent(packet);
                break;
            case PacketType.ACK:
            case PacketType.BINARY_ACK:
                this.onack(packet);
                break;
            case PacketType.DISCONNECT:
                this.ondisconnect();
                break;
            case PacketType.CONNECT_ERROR:
                this.destroy();
                const err = new Error(packet.data.message);
                // @ts-ignore
                err.data = packet.data.data;
                this.emitReserved("connect_error", err);
                break;
        }
    }
    /**
     * Called upon a server event.
     *
     * @param packet
     * @private
     */
    onevent(packet) {
        const args = packet.data || [];
        if (null != packet.id) {
            args.push(this.ack(packet.id));
        }
        if (this.connected) {
            this.emitEvent(args);
        }
        else {
            this.receiveBuffer.push(Object.freeze(args));
        }
    }
    emitEvent(args) {
        if (this._anyListeners && this._anyListeners.length) {
            const listeners = this._anyListeners.slice();
            for (const listener of listeners) {
                listener.apply(this, args);
            }
        }
        super.emit.apply(this, args);
    }
    /**
     * Produces an ack callback to emit with an event.
     *
     * @private
     */
    ack(id) {
        const self = this;
        let sent = false;
        return function (...args) {
            // prevent double callbacks
            if (sent)
                return;
            sent = true;
            self.packet({
                type: PacketType.ACK,
                id: id,
                data: args,
            });
        };
    }
    /**
     * Called upon a server acknowlegement.
     *
     * @param packet
     * @private
     */
    onack(packet) {
        const ack = this.acks[packet.id];
        if ("function" === typeof ack) {
            ack.apply(this, packet.data);
            delete this.acks[packet.id];
        }
    }
    /**
     * Called upon server connect.
     *
     * @private
     */
    onconnect(id) {
        this.id = id;
        this.connected = true;
        this.emitBuffered();
        this.emitReserved("connect");
    }
    /**
     * Emit buffered events (received and emitted).
     *
     * @private
     */
    emitBuffered() {
        this.receiveBuffer.forEach((args) => this.emitEvent(args));
        this.receiveBuffer = [];
        this.sendBuffer.forEach((packet) => {
            this.notifyOutgoingListeners(packet);
            this.packet(packet);
        });
        this.sendBuffer = [];
    }
    /**
     * Called upon server disconnect.
     *
     * @private
     */
    ondisconnect() {
        this.destroy();
        this.onclose("io server disconnect");
    }
    /**
     * Called upon forced client/server side disconnections,
     * this method ensures the manager stops tracking us and
     * that reconnections don't get triggered for this.
     *
     * @private
     */
    destroy() {
        if (this.subs) {
            // clean subscriptions to avoid reconnections
            this.subs.forEach((subDestroy) => subDestroy());
            this.subs = undefined;
        }
        this.io["_destroy"](this);
    }
    /**
     * Disconnects the socket manually.
     *
     * @return self
     * @public
     */
    disconnect() {
        if (this.connected) {
            this.packet({ type: PacketType.DISCONNECT });
        }
        // remove socket from pool
        this.destroy();
        if (this.connected) {
            // fire events
            this.onclose("io client disconnect");
        }
        return this;
    }
    /**
     * Alias for disconnect()
     *
     * @return self
     * @public
     */
    close() {
        return this.disconnect();
    }
    /**
     * Sets the compress flag.
     *
     * @param compress - if `true`, compresses the sending data
     * @return self
     * @public
     */
    compress(compress) {
        this.flags.compress = compress;
        return this;
    }
    /**
     * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
     * ready to send messages.
     *
     * @returns self
     * @public
     */
    get volatile() {
        this.flags.volatile = true;
        return this;
    }
    /**
     * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
     * given number of milliseconds have elapsed without an acknowledgement from the server:
     *
     * ```
     * socket.timeout(5000).emit("my-event", (err) => {
     *   if (err) {
     *     // the server did not acknowledge the event in the given delay
     *   }
     * });
     * ```
     *
     * @returns self
     * @public
     */
    timeout(timeout) {
        this.flags.timeout = timeout;
        return this;
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback.
     *
     * @param listener
     * @public
     */
    onAny(listener) {
        this._anyListeners = this._anyListeners || [];
        this._anyListeners.push(listener);
        return this;
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback. The listener is added to the beginning of the listeners array.
     *
     * @param listener
     * @public
     */
    prependAny(listener) {
        this._anyListeners = this._anyListeners || [];
        this._anyListeners.unshift(listener);
        return this;
    }
    /**
     * Removes the listener that will be fired when any event is emitted.
     *
     * @param listener
     * @public
     */
    offAny(listener) {
        if (!this._anyListeners) {
            return this;
        }
        if (listener) {
            const listeners = this._anyListeners;
            for (let i = 0; i < listeners.length; i++) {
                if (listener === listeners[i]) {
                    listeners.splice(i, 1);
                    return this;
                }
            }
        }
        else {
            this._anyListeners = [];
        }
        return this;
    }
    /**
     * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
     * e.g. to remove listeners.
     *
     * @public
     */
    listenersAny() {
        return this._anyListeners || [];
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback.
     *
     * @param listener
     *
     * <pre><code>
     *
     * socket.onAnyOutgoing((event, ...args) => {
     *   console.log(event);
     * });
     *
     * </pre></code>
     *
     * @public
     */
    onAnyOutgoing(listener) {
        this._anyOutgoingListeners = this._anyOutgoingListeners || [];
        this._anyOutgoingListeners.push(listener);
        return this;
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback. The listener is added to the beginning of the listeners array.
     *
     * @param listener
     *
     * <pre><code>
     *
     * socket.prependAnyOutgoing((event, ...args) => {
     *   console.log(event);
     * });
     *
     * </pre></code>
     *
     * @public
     */
    prependAnyOutgoing(listener) {
        this._anyOutgoingListeners = this._anyOutgoingListeners || [];
        this._anyOutgoingListeners.unshift(listener);
        return this;
    }
    /**
     * Removes the listener that will be fired when any event is emitted.
     *
     * @param listener
     *
     * <pre><code>
     *
     * const handler = (event, ...args) => {
     *   console.log(event);
     * }
     *
     * socket.onAnyOutgoing(handler);
     *
     * // then later
     * socket.offAnyOutgoing(handler);
     *
     * </pre></code>
     *
     * @public
     */
    offAnyOutgoing(listener) {
        if (!this._anyOutgoingListeners) {
            return this;
        }
        if (listener) {
            const listeners = this._anyOutgoingListeners;
            for (let i = 0; i < listeners.length; i++) {
                if (listener === listeners[i]) {
                    listeners.splice(i, 1);
                    return this;
                }
            }
        }
        else {
            this._anyOutgoingListeners = [];
        }
        return this;
    }
    /**
     * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
     * e.g. to remove listeners.
     *
     * @public
     */
    listenersAnyOutgoing() {
        return this._anyOutgoingListeners || [];
    }
    /**
     * Notify the listeners for each packet sent
     *
     * @param packet
     *
     * @private
     */
    notifyOutgoingListeners(packet) {
        if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
            const listeners = this._anyOutgoingListeners.slice();
            for (const listener of listeners) {
                listener.apply(this, packet.data);
            }
        }
    }
}

/**
 * Initialize backoff timer with `opts`.
 *
 * - `min` initial timeout in milliseconds [100]
 * - `max` max timeout [10000]
 * - `jitter` [0]
 * - `factor` [2]
 *
 * @param {Object} opts
 * @api public
 */
function Backoff(opts) {
    opts = opts || {};
    this.ms = opts.min || 100;
    this.max = opts.max || 10000;
    this.factor = opts.factor || 2;
    this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
    this.attempts = 0;
}
/**
 * Return the backoff duration.
 *
 * @return {Number}
 * @api public
 */
Backoff.prototype.duration = function () {
    var ms = this.ms * Math.pow(this.factor, this.attempts++);
    if (this.jitter) {
        var rand = Math.random();
        var deviation = Math.floor(rand * this.jitter * ms);
        ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
    }
    return Math.min(ms, this.max) | 0;
};
/**
 * Reset the number of attempts.
 *
 * @api public
 */
Backoff.prototype.reset = function () {
    this.attempts = 0;
};
/**
 * Set the minimum duration
 *
 * @api public
 */
Backoff.prototype.setMin = function (min) {
    this.ms = min;
};
/**
 * Set the maximum duration
 *
 * @api public
 */
Backoff.prototype.setMax = function (max) {
    this.max = max;
};
/**
 * Set the jitter
 *
 * @api public
 */
Backoff.prototype.setJitter = function (jitter) {
    this.jitter = jitter;
};

class Manager extends Emitter {
    constructor(uri, opts) {
        var _a;
        super();
        this.nsps = {};
        this.subs = [];
        if (uri && "object" === typeof uri) {
            opts = uri;
            uri = undefined;
        }
        opts = opts || {};
        opts.path = opts.path || "/socket.io";
        this.opts = opts;
        installTimerFunctions(this, opts);
        this.reconnection(opts.reconnection !== false);
        this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
        this.reconnectionDelay(opts.reconnectionDelay || 1000);
        this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
        this.randomizationFactor((_a = opts.randomizationFactor) !== null && _a !== void 0 ? _a : 0.5);
        this.backoff = new Backoff({
            min: this.reconnectionDelay(),
            max: this.reconnectionDelayMax(),
            jitter: this.randomizationFactor(),
        });
        this.timeout(null == opts.timeout ? 20000 : opts.timeout);
        this._readyState = "closed";
        this.uri = uri;
        const _parser = opts.parser || parser;
        this.encoder = new _parser.Encoder();
        this.decoder = new _parser.Decoder();
        this._autoConnect = opts.autoConnect !== false;
        if (this._autoConnect)
            this.open();
    }
    reconnection(v) {
        if (!arguments.length)
            return this._reconnection;
        this._reconnection = !!v;
        return this;
    }
    reconnectionAttempts(v) {
        if (v === undefined)
            return this._reconnectionAttempts;
        this._reconnectionAttempts = v;
        return this;
    }
    reconnectionDelay(v) {
        var _a;
        if (v === undefined)
            return this._reconnectionDelay;
        this._reconnectionDelay = v;
        (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMin(v);
        return this;
    }
    randomizationFactor(v) {
        var _a;
        if (v === undefined)
            return this._randomizationFactor;
        this._randomizationFactor = v;
        (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setJitter(v);
        return this;
    }
    reconnectionDelayMax(v) {
        var _a;
        if (v === undefined)
            return this._reconnectionDelayMax;
        this._reconnectionDelayMax = v;
        (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMax(v);
        return this;
    }
    timeout(v) {
        if (!arguments.length)
            return this._timeout;
        this._timeout = v;
        return this;
    }
    /**
     * Starts trying to reconnect if reconnection is enabled and we have not
     * started reconnecting yet
     *
     * @private
     */
    maybeReconnectOnOpen() {
        // Only try to reconnect if it's the first time we're connecting
        if (!this._reconnecting &&
            this._reconnection &&
            this.backoff.attempts === 0) {
            // keeps reconnection from firing twice for the same reconnection loop
            this.reconnect();
        }
    }
    /**
     * Sets the current transport `socket`.
     *
     * @param {Function} fn - optional, callback
     * @return self
     * @public
     */
    open(fn) {
        if (~this._readyState.indexOf("open"))
            return this;
        this.engine = new Socket$1(this.uri, this.opts);
        const socket = this.engine;
        const self = this;
        this._readyState = "opening";
        this.skipReconnect = false;
        // emit `open`
        const openSubDestroy = on(socket, "open", function () {
            self.onopen();
            fn && fn();
        });
        // emit `error`
        const errorSub = on(socket, "error", (err) => {
            self.cleanup();
            self._readyState = "closed";
            this.emitReserved("error", err);
            if (fn) {
                fn(err);
            }
            else {
                // Only do this if there is no fn to handle the error
                self.maybeReconnectOnOpen();
            }
        });
        if (false !== this._timeout) {
            const timeout = this._timeout;
            if (timeout === 0) {
                openSubDestroy(); // prevents a race condition with the 'open' event
            }
            // set timer
            const timer = this.setTimeoutFn(() => {
                openSubDestroy();
                socket.close();
                // @ts-ignore
                socket.emit("error", new Error("timeout"));
            }, timeout);
            if (this.opts.autoUnref) {
                timer.unref();
            }
            this.subs.push(function subDestroy() {
                clearTimeout(timer);
            });
        }
        this.subs.push(openSubDestroy);
        this.subs.push(errorSub);
        return this;
    }
    /**
     * Alias for open()
     *
     * @return self
     * @public
     */
    connect(fn) {
        return this.open(fn);
    }
    /**
     * Called upon transport open.
     *
     * @private
     */
    onopen() {
        // clear old subs
        this.cleanup();
        // mark as open
        this._readyState = "open";
        this.emitReserved("open");
        // add new subs
        const socket = this.engine;
        this.subs.push(on(socket, "ping", this.onping.bind(this)), on(socket, "data", this.ondata.bind(this)), on(socket, "error", this.onerror.bind(this)), on(socket, "close", this.onclose.bind(this)), on(this.decoder, "decoded", this.ondecoded.bind(this)));
    }
    /**
     * Called upon a ping.
     *
     * @private
     */
    onping() {
        this.emitReserved("ping");
    }
    /**
     * Called with data.
     *
     * @private
     */
    ondata(data) {
        try {
            this.decoder.add(data);
        }
        catch (e) {
            this.onclose("parse error");
        }
    }
    /**
     * Called when parser fully decodes a packet.
     *
     * @private
     */
    ondecoded(packet) {
        this.emitReserved("packet", packet);
    }
    /**
     * Called upon socket error.
     *
     * @private
     */
    onerror(err) {
        this.emitReserved("error", err);
    }
    /**
     * Creates a new socket for the given `nsp`.
     *
     * @return {Socket}
     * @public
     */
    socket(nsp, opts) {
        let socket = this.nsps[nsp];
        if (!socket) {
            socket = new Socket(this, nsp, opts);
            this.nsps[nsp] = socket;
        }
        return socket;
    }
    /**
     * Called upon a socket close.
     *
     * @param socket
     * @private
     */
    _destroy(socket) {
        const nsps = Object.keys(this.nsps);
        for (const nsp of nsps) {
            const socket = this.nsps[nsp];
            if (socket.active) {
                return;
            }
        }
        this._close();
    }
    /**
     * Writes a packet.
     *
     * @param packet
     * @private
     */
    _packet(packet) {
        const encodedPackets = this.encoder.encode(packet);
        for (let i = 0; i < encodedPackets.length; i++) {
            this.engine.write(encodedPackets[i], packet.options);
        }
    }
    /**
     * Clean up transport subscriptions and packet buffer.
     *
     * @private
     */
    cleanup() {
        this.subs.forEach((subDestroy) => subDestroy());
        this.subs.length = 0;
        this.decoder.destroy();
    }
    /**
     * Close the current socket.
     *
     * @private
     */
    _close() {
        this.skipReconnect = true;
        this._reconnecting = false;
        this.onclose("forced close");
        if (this.engine)
            this.engine.close();
    }
    /**
     * Alias for close()
     *
     * @private
     */
    disconnect() {
        return this._close();
    }
    /**
     * Called upon engine close.
     *
     * @private
     */
    onclose(reason, description) {
        this.cleanup();
        this.backoff.reset();
        this._readyState = "closed";
        this.emitReserved("close", reason, description);
        if (this._reconnection && !this.skipReconnect) {
            this.reconnect();
        }
    }
    /**
     * Attempt a reconnection.
     *
     * @private
     */
    reconnect() {
        if (this._reconnecting || this.skipReconnect)
            return this;
        const self = this;
        if (this.backoff.attempts >= this._reconnectionAttempts) {
            this.backoff.reset();
            this.emitReserved("reconnect_failed");
            this._reconnecting = false;
        }
        else {
            const delay = this.backoff.duration();
            this._reconnecting = true;
            const timer = this.setTimeoutFn(() => {
                if (self.skipReconnect)
                    return;
                this.emitReserved("reconnect_attempt", self.backoff.attempts);
                // check again for the case socket closed in above events
                if (self.skipReconnect)
                    return;
                self.open((err) => {
                    if (err) {
                        self._reconnecting = false;
                        self.reconnect();
                        this.emitReserved("reconnect_error", err);
                    }
                    else {
                        self.onreconnect();
                    }
                });
            }, delay);
            if (this.opts.autoUnref) {
                timer.unref();
            }
            this.subs.push(function subDestroy() {
                clearTimeout(timer);
            });
        }
    }
    /**
     * Called upon successful reconnect.
     *
     * @private
     */
    onreconnect() {
        const attempt = this.backoff.attempts;
        this._reconnecting = false;
        this.backoff.reset();
        this.emitReserved("reconnect", attempt);
    }
}

/**
 * Managers cache.
 */
const cache = {};
function lookup(uri, opts) {
    if (typeof uri === "object") {
        opts = uri;
        uri = undefined;
    }
    opts = opts || {};
    const parsed = url(uri, opts.path || "/socket.io");
    const source = parsed.source;
    const id = parsed.id;
    const path = parsed.path;
    const sameNamespace = cache[id] && path in cache[id]["nsps"];
    const newConnection = opts.forceNew ||
        opts["force new connection"] ||
        false === opts.multiplex ||
        sameNamespace;
    let io;
    if (newConnection) {
        io = new Manager(source, opts);
    }
    else {
        if (!cache[id]) {
            cache[id] = new Manager(source, opts);
        }
        io = cache[id];
    }
    if (parsed.query && !opts.query) {
        opts.query = parsed.queryKey;
    }
    return io.socket(parsed.path, opts);
}
// so that "lookup" can be used both as a function (e.g. `io(...)`) and as a
// namespace (e.g. `io.connect(...)`), for backward compatibility
Object.assign(lookup, {
    Manager,
    Socket,
    io: lookup,
    connect: lookup,
});

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */

    /**
     * @class SharedState
     * @classdesc JavaScript Library for the flexcontrol SharedState
     * @param {string} url URL for the WS connection. if(!url) it tryes to connect to the server wich hosts the socket.io.js
     * @param {string} token the connection token
     * @param {Object} options
     * @param {boolean} [options.reconnection] if the Client should try to reconnect,Default = true
     * @param {boolean} [options.agentid] the AgentID to use, Default = random()
     * @param {boolean} [options.getOnInit] get all Keys from the Server on init(), Default = true
     * @param {boolean} [options.logStateInterval] logs the sharedState every 5sec to the console, Default = false
     * @param {boolean} [options.logToConsole] if things should get logged to console, Default = false
     * @param {boolean} [options.autoPresence] set presence to "online" on connect, Default = true
     * @returns {Object} SharedState
     * @author Andreas Bosl <bosl@irt.de>
     * @copyright 2014 Institut für Rundfunktechnik GmbH, All rights reserved.
     *
     */
    var SharedState = function (url, options) {
        var _connection = null;
        var log =  Logger.getLogger('SharedState');

        var self = {};

        // READY STATE for Shared State
        var STATE = Object.freeze({
            CONNECTING: "connecting",
            OPEN: "open",
            CLOSED: "closed"
        });

        // Event Handlers
        var _callbacks = {
            'change': [],
            'remove': [],
            'readystatechange': [],
            'presence': []
        };

        var _sharedStates = {};

        var _presence = {};
        var _request = false;

        var _stateChanges = {};


        var _log = function (text, datagram) {
            if (options.logToConsole === true) {
                log.info(text, datagram);
            }
        };

        var _error = function (text, datagram) {
            if (options.logToConsole === true) {
                log.error(text, datagram);
            }
        };

        /* <!-- defaults */
        options = options || {};
        if (options instanceof String) {
            options = {};
        }
        if (options.reconnection !== false) {
            options.reconnection = true;
        }
        if (!options.agentid) {
            log.warn('SHAREDSTATE - agentID undefined, generating one for this session');
            options.agentid = (Math.random() * 999999999).toFixed(0);
        }
        if (options.getOnInit !== false) {
            options.getOnInit = true;
        }

        if (options.autoPresence !== false) {
            options.autoPresence = true;
        }
        if (options.autoClean !== true) {
            options.autoClean = false;
        }
        options.forceNew = true;
        options.multiplex = false;

        url = url || {};
        /* defaults --> */



        if (options.logStateInterval === true) {
            setInterval(function () {
                _log('SharedSate(' + url + '):', _sharedStates);
            }, 5000);
        }


        /* <!-- internal functions */
        var _init = function () {

	     options.transport = [ "websocket","polling"];
            _connection = lookup(url, options);
            _connection.on('connect', onConnect);
            _connection.on('disconnect', onDisconnect);

            _connection.on('joined', onJoined);
            _connection.on('status', onStatus);
            _connection.on('changeState', onChangeState);
            _connection.on('initState', onInitState);

            _connection.on('ssError', onError);
            readystate.set('connecting');


            if (_connection.connected === true) {
                onConnect();
            }

        };

        var onError = function (data) {
            _error('SharedState-error', data);
        };

        var onConnect = function () {
            if (_connection.connected === true) {
                readystate.set('connecting');
                var datagram = {
                    agentID: options.agentid
                };
                if (options.userId) {
                    datagram.userId = options.userId;
                }
                _sendDatagram('join', datagram);
            }
        };

        /*
			Internal method for invoking callback handlers

			Handler is only supplied if on one specific callback is to used.
			This is helpful for supporting "immediate events", i.e. events given directly
			after handler is registered - on("change", handler);

			If handler is not supplied, this means that all callbacks are to be fired.
			This function is also sensitive to whether an "immediate event" has already been fired
			or not. See callback registration below.
        */
        var _do_callbacks = function (what, e, handler) {
            if (!_callbacks.hasOwnProperty(what)) throw "Unsupported event " + what;
            var h;
            for (let i = 0; i < _callbacks[what].length; i++) {
                h = _callbacks[what][i];
                if (handler === undefined) {
                    // all handlers to be invoked, except those with pending immeditate
                    if (h._immediate_pending) {
                        continue;
                    }
                } else {
                    // only given handler to be called
                    if (h === handler) handler._immediate_pending = false;
                    else {
                        continue;
                    }
                }
                try {
                    if (h._ctx) {
                        h.call(h._ctx, e);
                    } else {
                        h.call(self, e);
                    }
                } catch (e) {
                    log.error("Error in " + what + ": " + h + ": " + e);
                }
            }
        };
        /* internal functions --> */


        /* <!-- incoming socket functions */
        var onStatus = function (datagram) {
            _log('SHAREDSTATE - got "status"', datagram);
            for (var i = 0; i < datagram.presence.length; i++) {
                if (datagram.presence[i].key && (JSON.stringify(_presence[datagram.presence[i].key]) != JSON.stringify(datagram.presence[i].value || !_presence[datagram.presence[i].key]))) {
                    var presence = {
                        key: datagram.presence[i].key,
                        value: datagram.presence[i].value || undefined
                    };
                    _presence[datagram.presence[i].key] = datagram.presence[i].value;
                    _do_callbacks('presence', presence);
                } else {
                    _log('SHAREDSTATE - reveived "presence" already saved or something wrong', datagram.presence[i]);
                }

            }
        };

        var onDisconnect = function () {
            readystate.set('connecting');
            _log('SHAREDSTATE - got "disconnected"');
        };


        var onChangeState = function (datagram) {
            _log('SHAREDSTATE - got "changeState"', datagram);

            datagram = datagram || {};


            for (var i = 0; i < datagram.length; i++) {
                if (datagram[i].type == 'set') {
                    if (datagram[i].key && JSON.stringify(_sharedStates[datagram[i].key]) != JSON.stringify(datagram[i].value)) {
                        var state = {
                            key: datagram[i].key,
                            value: datagram[i].value,
                            type: 'add'
                        };
                        if (_sharedStates[datagram[i].key]) {
                            state.type = 'update';
                        }
                        _sharedStates[datagram[i].key] = datagram[i].value;
                        _do_callbacks('change', state);

                    } else {
                        _log('SHAREDSTATE - reveived "set" already saved or something wrong', datagram[i]);
                    }
                } else if (datagram[i].type == 'remove') {
                    if (datagram[i].key && _sharedStates[datagram[i].key]) {
                        var state = {
                            key: datagram[i].key,
                            value: _sharedStates[datagram[i].key],
                            type: 'delete'
                        };
                        delete _sharedStates[datagram[i].key];
                        _do_callbacks('remove', state);
                    }

                }

            }
        };

        var onJoined = function (datagram) {
            _log('SHAREDSTATE - got "joined"', datagram);
            if (datagram.agentID == options.agentid) {
                if (options.getOnInit === true) {
                    var datagram = [];
                    _sendDatagram('getInitState', datagram);
                } else {
                    readystate.set('open');
                    if (options.autoPresence === true) {
                        setPresence("online");
                    }
                }


            }
            if (options.autoClean) {

                setInterval(function () {
                    // Autoclean - check for meta keys without online nodes
                    for (var key in _sharedStates) {
                        if (_sharedStates.hasOwnProperty(key)) {
                            if (key.indexOf("__meta__") == 0) {
                                var agentid = key.substr(8);
                                if (!_presence[agentid]) {
                                    _autoClean(agentid);
                                }

                            }
                        }
                    }
                }, 5000);
            }
        };



        var onInitState = function (datagram) {
            _log('INITSTATE', datagram);

            for (var i = 0, len = datagram.length; i < len; i++) {
                if (datagram[i].type == 'set') {
                    if (datagram[i].key && datagram[i].value && JSON.stringify(_sharedStates[datagram[i].key]) != JSON.stringify(datagram[i].value)) {
                        var state = {
                            key: datagram[i].key,
                            value: datagram[i].value,
                            type: 'add'
                        };
                        _sharedStates[datagram[i].key] = datagram[i].value;
                        _do_callbacks('change', state);
                    }
                }
            }
            readystate.set('open');
            if (options.autoPresence === true) {
                setPresence("online");
            }

        };


        var _autoClean = function (agentid) {
            if (!options.autoClean) {
                return;
            }
            _log("*** Cleaning agent ", agentid);
                // Go through the dataset and remove anything left from this node
            for (var key in _sharedStates) {
                if (_sharedStates.hasOwnProperty(key)) {
                    if (key.indexOf("__") == 0 && key.indexOf("__" + agentid) > -1) {
                        self.removeItem(key);
                    }
                }
            }
        };


        /* incoming socket functions --> */



        /* <!-- outgoing socket functions */
        var _sendDatagram = function (type, datagram) {
            _log('SHAREDSTATE - sending', datagram);
            _connection.emit(type, datagram);
        };
        /* outgoing socket functions --> */


        /* <!-- API functions */
        /**
         * sets a key in the sharedState
         * @method setItem
         * @param {string} key the key to set
         * @param {Object} value the value to set
         * @param {string} [options] tbd
         * @returns {Object} SharedState
         * @memberof SharedState
         */
        var setItem = function (key, value, options) {
            if (_request) {
                var state = {
                    type: 'set',
                    key: key,
                    value: value
                };

                _stateChanges[key] = state;
            } else {
                if (readystate.get() === STATE.OPEN) {
                    if (key) {
                        var datagram = [
                            {
                                type: 'set',
                                key: key,
                                value: value
                                }
                            ];
                        _sendDatagram('changeState', datagram);
                    } else {
                        throw 'SHAREDSTATE - params with error - key:' + key + 'value:' + value;
                    }
                } else {
                    throw 'SHAREDSTATE - setItem not possible - connection status:' + readystate.get();
                }
            }


            return self;
        };

        /**
         * removes a key from the sharedState
         * @method removeItem
         * @param {string} key the key to remove
         * @param {string} [options] tbd
         * @returns {Object} SharedState
         * @memberof SharedState
         */
        var removeItem = function (key, options) {
            if (_request) {
                var state = {
                    type: 'remove',
                    key: key
                };
                _stateChanges[key] = state;
            } else {
                if (readystate.get() == STATE.OPEN) {
                    if (_sharedStates[key]) {
                        var datagram = [
                            {
                                type: 'remove',
                                key: key
                                }
                            ];
                        _sendDatagram('changeState', datagram);
                    } else {
                        throw 'SHAREDSTATE - key with error - key:' + key;
                    }
                } else {
                    throw 'SHAREDSTATE - removeItem not possible - connection status:' + readystate.get();
                }
            }
            return self;
        };

        /**
         * starts the request builder
         * @method request
         * @returns {Object} SharedState
         * @memberof SharedState
         */
        var request = function () {
            _request = true;
            return self;
        };

        /**
         * stops the request builder and sends all changes
         * @method send
         * @returns {Object} SharedState
         * @memberof SharedState
         */
        var send = function () {
            if (readystate.get() == STATE.OPEN) {
                _request = false;
                if (Object.keys(_stateChanges).length > 0) {
                    var datagram = [];
                    var keys = Object.keys(_stateChanges);
                    for (var i = 0; i < keys.length; i++) {
                        datagram.push(_stateChanges[keys[i]]);
                    }
                    _sendDatagram('changeState', datagram);

                    _stateChanges = {};
                }
            } else {
                throw 'SHAREDSTATE - send not possible - connection status:' + readystate.get();
            }
            return self;
        };

        /**
         * returns a value of the given key
         * @method getItem
         * @param {string} key the key to remove
         * @param {string} [options] tbd
         * @returns {Object} data
         * @returns {Object} data.key the value of the key
         * @returns {Object} data.newValue the value of the key
         * @memberof SharedState
         */
        var getItem = function (key, options) {

            if (key === undefined || key === null) {
                var datagram = [];
                _sendDatagram('getState', datagram);
                return;
            } else {
                key = key + '';
                if (_sharedStates[key]) {
                    return JSON.parse(JSON.stringify(_sharedStates[key]));
                }
            }
            return;
        };

        /**
         * returns an Array of keys
         * @method keys
         * @returns {Array} keys
         * @memberof SharedState
         */
        var keys = function () {

            return Object.keys(_sharedStates);

        };


        /*
			READYSTATE

			encapsulate protected property _readystate by wrapping
			getter and setter logic around it.
			Closure ensures that all state transfers must go through set function.
			Possibility to implement verification on all attempted state transferes
			Event

  		*/
        var readystate = function () {
            var _readystate = STATE["CONNECTING"];
            // accessors
            return {
                set: function (new_state) {
                    // check new state value
                    let found = false;
                    for (let key in STATE) {
                        if (!STATE.hasOwnProperty(key)) continue;
                        if (STATE[key] === new_state) found = true;
                    }
                    if (!found) throw "Illegal state value " + new_state;
                    // check state transition
                    if (_readystate === STATE["CLOSED"]) return; // never leave final state
                    // perform state transition
                    if (new_state !== _readystate) {
                        _readystate = new_state;
                        // trigger events
                        _do_callbacks("readystatechange", new_state);
                    }
                },
                get: function () {
                    return _readystate;
                }
            };
        }();

        /**
         * registers a function on event, function gets called immediatly
         * @method on
         * @param {string} what change || presence || readystatechange
         * @param {function} handler the function to call on event
         * @returns {Object} SharedState
         * @memberof SharedState
         */
        /*
		    register callback

			The complexity of this method arise from the fact that we are to give
			an "immediate callback" to the given handler.

			In addition, I do not want to do so directly within the on() method.

			As a programmer I would like to ensure that initialisation of an object
			is completed BEFORE the object needs to process any callbacks from the
			external world. This can be problematic if the object depends on events
			from multiple other objects. For example, the internal initialisation code
			needs to register handlers on external objects a and b.

			a.on("event", internal_handler_a);
			b.on("event", internal_handler_b);

			However, if object a gives an callback immediately within on, this callback
			will be processed BEFORE we have completed initialisation, i.e., any code
			subsequent to a.on).

			It is quite possible to make this be correct still, but I find nested handler
			invocation complicated to think about, and I prefer to avoid the problem.
			Therefore I like instead to make life easier by delaying "immediate callbacks"
			using

			setTimeout(_do_callbacks("event", e, handler), 0);

			This however introduces two new problems. First, if you do :

			o.on("event", handler);
			o.off("event", handler);

			you will get the "immediate callback" after off(), which is not what you
			expect. This is avoided by checking that the given handler is indeed still
			registered when executing _do_callbacks(). Alternatively one could cancel the
			timeout within off().

			Second, with the handler included in _callbacks[what] it is possible to receive
			event callbacks before the delayed "immediate callback" is actually invoked.
			This breaks the expectation the the "immediate callback" is the first callback.
			This problem is avoided by flagging the callback handler with ".immediate_pending"
			and dropping notifications that arrive before the "immediate_callback has executed".
			Note however that the effect of this dropped notification is not lost. The effects
			are taken into account when we calculate the "initial state" to be reported by the
			"immediate callback". Crucially, we do this not in the on() method, but when the
			delayed "immediate callback" actually is processed.
	    */

        var on = function (what, handler, ctx) {
            if (!handler || typeof handler !== "function") throw "Illegal handler";
            if (!_callbacks.hasOwnProperty(what)) throw "Unsupported event " + what;
            if (ctx) {
                handler._ctx = ctx;
            }
            var index = _callbacks[what].indexOf(handler);
            if (index === -1) {
                // register handler
                _callbacks[what].push(handler);
                // flag handler
                handler._immediate_pending = true;
                // do immediate callback
                setTimeout(function () {
                    switch (what) {
                    case 'change':
                        var keys = Object.keys(_sharedStates);
                        if (keys.length === 0) {
                            handler._immediate_pending = false;
                        } else {
                            for (var i = 0, len = keys.length; i < len; i++) {
                                var state = {
                                    key: keys[i],
                                    value: _sharedStates[keys[i]],
                                    type: 'update'
                                };
                                _do_callbacks('change', state, handler);
                            }
                        }
                        break;
                    case 'presence':
                        var keys = Object.keys(_presence);
                        if (keys.length === 0) {
                            handler._immediate_pending = false;
                        } else {
                            for (var i = 0, len = keys.length; i < len; i++) {
                                var presence = {
                                    key: keys[i],
                                    value: _presence[keys[i]]
                                };
                                _do_callbacks('presence', presence, handler);
                            }
                        }
                        break;
                    case 'remove':
                        handler._immediate_pending = false;
                        break;
                    case 'readystatechange':
                        _do_callbacks("readystatechange", readystate.get(), handler);
                        break;
                    }
                }, 100);
            }
            return self;
        };

        /**
         * deregisters a function on event
         * @method off
         * @param {string} what change || presence || readystatechange
         * @param {function} handler the function to call on event
         * @returns {Object} SharedState
         * @memberof SharedState
         */
        // unregister callback
        var off = function (what, handler) {
            if (_callbacks[what] !== undefined) {
                var index = _callbacks[what].indexOf(handler);
                if (index > -1) {
                    _callbacks[what].splice(index, 1);
                }
            }
            return self;
        };


        /**
         * sets the presence of the client ('connected' and 'disconnected' automatically set by server)
         * @method setPresence
         * @param {string} state the string to set the presence to
         * @returns {Object} SharedState
         * @memberof SharedState
         */
        var setPresence = function (state) {
            if (readystate.get() == STATE.OPEN) {
                if (state) {
                    var datagram = {
                        agentID: options.agentid,
                        presence: state
                    };
                    _sendDatagram('changePresence', datagram);

                } else {
                    throw 'SHAREDSTATE - params with error - state:' + state;
                }
            } else {
                throw 'SHAREDSTATE - send not possible - connection status:' + readystate.get();
            }
            return self;
        };
        /* API functions --> */


        /* <!-- public */
        self.__defineGetter__("readyState", readystate.get);
        self.__defineGetter__("STATE", function () {
            return STATE;
        });
        self.__defineGetter__("agentid", function () {
            return options.agentid;
        });

        self.setItem = setItem;
        self.removeItem = removeItem;

        self.request = request;
        self.send = send;

        self.getItem = getItem;

        self.keys = keys;
        self.on = on;
        self.off = off;
        self.setPresence = setPresence;
        /* public --> */

        _init();

        return self;
    };

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
    // The Application context is based on a shared state object
    var ApplicationContext = function (url, options) {
        var readyObserver = new Subject();
        var readyObservable = new Observable((observer) => { readyObserver = observer; });
        var log =  Logger.getLogger('ApplicationContext');

        function clone(obj) {
            if (null == obj || "object" != typeof obj) return obj;
            var copy = obj.constructor();
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
            }
            return copy;
        }
        if (!AgentContext) {
            throw "Missing flexcontrol agentContext, please load the correct js files"
        }
        var _the_self = AgentContext();

        options = options || {};
        var self = {};
        var _agents = {}; // We have a separate agent mapping of agent Context
        if (SharedState === undefined) {
            throw "Missing flexcontrol shared state, please include the correct js files";
        }

        var remoteAgentContext = function (__agentid) {
            var self = {};
            var _handlers = {
                "agentchange": []
            };
            self.agentid = __agentid;
            var _last_capabilities = [];

            _sharedstate.on("change", (e) =>  {
                if (e.key.indexOf("__val__" + self.agentid) == 0) {
                    // Updated values for my stuff
                    if (_handlers[e.key] && _handlers[e.key].length > 0) {
                        for (var i = 0; i < _handlers[e.key].length; i++) {
                            try {
                                _handlers[e.key][i].call(self.publicAPI, e);
                            } catch (err) {
                                log.error("Error in callback: " + what);
                            }
                        }
                    }
                }
            });

            var keys = function () {
                var meta = _sharedstate.getItem("__meta__" + self.agentid);
                if (!meta) return [];
                if(typeof(meta)=="string") meta=JSON.parse(meta);
                return meta.keys;
            };

            var capabilities = function () {
                var meta = _sharedstate.getItem("__meta__" + self.agentid);
                if (!meta) return [];
                return meta.capabilities;
            };

            var on = function (what, handler) {
                if (what == "agentchange") {
                    _handlers["agentchange"].push(handler);
                    return;
                }

                if (keys().indexOf(what) == -1) {
                    throw "Unknown parameter " + what;
                }
                var subscriptions = _sharedstate.getItem("__metasub__" + _sharedstate.agentid) || [];
                var item = self.agentid + "_" + what;

                if (subscriptions.indexOf(item) == -1) {
                    subscriptions.push(item);
                    _sharedstate.setItem("__metasub__" + _sharedstate.agentid, subscriptions);
                }
                // Remember the handler
                if (_handlers[what] === undefined) {
                    _handlers[what] = [];
                }
                _handlers[what].push(handler);

                // check if we have a value already
                var value = _sharedstate.getItem('__val__' + item);
                if (value) {
                    handler.call(self.publicAPI, what, value);
                }
            };

            var off = function (what, handler) {
                if (what == "agentchange") {
                    _handlers[what].splice(_handlers[what].indexOf(handler), 1);
                    return;
                }
                if (keys().indexOf(what) == -1) {
                    throw "Unknown parameter " + what;
                }
                var subscriptions = clone(_sharedstate.getItem("__metasub__" + _sharedstate.agentid));
                var item = self.agentid + "_" + what;

                if (subscriptions.indexOf(item) > -1) {
                    subscriptions.splice(subscriptions.indexOf(item), 1);
                    _sharedstate.setItem("__metasub__" + _sharedstate.agentid, subscriptions);
                } else {
                    throw "Not subscribed to " + what;
                }
                // TODO: Clean up _handlers[what]
                if (!_handlers[what]) {
                    log.warn("*** Warning: Missing handler for " + what);
                    return;

                }
                _handlers[what].splice(_handlers[what].indexOf(item), 1);
            };

            var update_meta = function (meta) {
                var diff = {
                    "added": {},
                    "altered": {},
                    "removed": []
                };
                for (var capability in _last_capabilities) {
                    if (meta.capabilities[capability] === undefined) {
                        diff.removed.push(capability);
                    }
                }
                for (var capability in meta.capabilities) {
                    if (_last_capabilities[capability] === undefined) {
                        diff.added[capability] = meta.capabilities[capability];
                    } else if (_last_capabilities[capability] != meta.capabilities[capability]) {
                        diff.altered[capability] = meta.capabilities[capability];
                    }
                }
                _last_capabilities = meta.capabilities;

                for (var i = 0; i < _handlers["agentchange"].length; i++) {
                    try {
                        _handlers["agentchange"][i].call(self.publicAPI, {
                            diff: diff
                        });
                    } catch (err) {
                        log.error("Error in meta-update", err);
                    }
                }
            };

            var update_value = function (_aid, _key, _value) {
                if (_handlers[_key] === undefined) {
                    return;
                }
                for (var i = 0; i < _handlers[_key].length; i++) {
                    try {
                        _handlers[_key][i].call(self.publicAPI, _key, _value);
                    } catch (err) {
                        log.error("Error in update: ", err);
                    }
                }
            };

            var setItem = function (key, value) {
                _sharedstate.setItem("__val__" + self.agentid + "_" + key, value);
            };
            var getItem = function (key) {
                return _sharedstate.getItem("__val__" + self.agentid + "_" + key);
            };
            self.update_value = update_value;
            self.handlers = _handlers;
            self.update_meta = update_meta;

            let publicAPI = {};
            publicAPI.agentid = self.agentid;
            publicAPI.keys = keys;
            publicAPI.on = on;
            publicAPI.off = off;
            publicAPI.setItem = setItem;
            publicAPI.getItem = getItem;
            publicAPI.capabilities = capabilities;


            self.publicAPI = publicAPI;

            return self;
        };


        // Handle updates
        var _sub_param2agent = []; // Remote subscriptions, parameter -> [agentid, ...]
        var _sub_agent2param = {}; // Remote agent -> [parameter, ...]
        var _sub_param2handler = {};
        var _currentAgentState = {}; // For diffs
        var _last_capabilities = {}; // For annouce diffs

        var _update_subscriptions = function (_aid2, _subs) {
            if (getAgent(_aid2) == undefined) {
                log.warn("Subscription update for unknown node", _aid2);
                setTimeout(()=>{
                  if (getAgent(_aid2) !== undefined){
                  _update_subscriptions(_aid2, _subs);
                  _subs = _subs || _sharedstate.getItem("__metasub__" + _aid2);
                  if (!_subs) {
                      return;
                  }
                  getAgent(_aid2).handlers;
                  var thesubs = _sub_agent2param[_aid2] || [];
                  for (var i = 0; i < _subs.length; i++) {
                      var target_agent = _subs[i].substr(0, _subs[i].indexOf("_"));
                      var target_param = _subs[i].substr(_subs[i].indexOf("_") + 1);
                      if (target_agent === _sharedstate.agentid) {
                          // See if this agent already subscribes to my parameter, otherwise add it
                          if (thesubs.indexOf(target_param) > -1) {
                              // Aready subscribed to this one
                              continue;
                          }
                          if (_sub_param2agent[target_param] === undefined) {
                              _sub_param2agent[target_param] = [];
                          }
                          _sub_param2agent[target_param].push(_aid2);
                          if (!_sub_param2handler[target_param] || _sub_param2handler[target_param].length == 0) {
                              _sub_param2handler[target_param] = function (e) {
                                  _sharedstate.setItem("__val__" + _sharedstate.agentid + "_" + e.key, e.value);
                              };
                          }
                          _the_self.on(target_param, _sub_param2handler[target_param]);
                      }
                  }
                  // see if there was an unsubscribe
                  for (var i = 0; i < thesubs.length; i++) {
                      if (_sub_param2agent.indexOf(thesubs[i]) == -1) {
                          var target_agent = thesubs[i].substr(0, thesubs[i].indexOf("_"));
                          var target_param = thesubs[i].substr(thesubs[i].indexOf("_") + 1);
                          if (target_agent != _sharedstate.agentid) {
                              continue;
                          }
                          if (_sub_param2agent[target_param] != undefined) {
                              _sub_param2agent[target_param].splice(_sub_param2agent[target_param].indexOf(thesubs[i]), 1);
                              if (_sub_param2agent[target_param].length == 0) ;
                          } else {
                              log.warn(" *** Warning, unsub but don't have handler");
                          }
                          // TODO: Clean up if nobody uses it any more
                          // if _sub_param2agent[target_param].length == 0
                      }
                  }
                  _sub_agent2param[_aid2] = _subs;
                }

                },0);
                return;
            }
            _subs = _subs || _sharedstate.getItem("__metasub__" + _aid2);
            if (!_subs) {
                return;
            }
            getAgent(_aid2).handlers;
            var thesubs = _sub_agent2param[_aid2] || [];
            for (var i = 0; i < _subs.length; i++) {
                var target_agent = _subs[i].substr(0, _subs[i].indexOf("_"));
                var target_param = _subs[i].substr(_subs[i].indexOf("_") + 1);
                if (target_agent === _sharedstate.agentid) {
                    // See if this agent already subscribes to my parameter, otherwise add it
                    if (thesubs.indexOf(target_param) > -1) {
                        // Aready subscribed to this one
                        continue;
                    }
                    if (_sub_param2agent[target_param] === undefined) {
                        _sub_param2agent[target_param] = [];
                    }
                    _sub_param2agent[target_param].push(_aid2);
                    if (!_sub_param2handler[target_param] || _sub_param2handler[target_param].length == 0) {
                        _sub_param2handler[target_param] = function (e) {
                            _sharedstate.setItem("__val__" + _sharedstate.agentid + "_" + e.key, e.value);
                        };
                    }
                    _the_self.on(target_param, _sub_param2handler[target_param]);
                }
            }
            // see if there was an unsubscribe
            for (var i = 0; i < thesubs.length; i++) {
                if (_sub_param2agent.indexOf(thesubs[i]) == -1) {
                    var target_agent = thesubs[i].substr(0, thesubs[i].indexOf("_"));
                    var target_param = thesubs[i].substr(thesubs[i].indexOf("_") + 1);
                    if (target_agent != _sharedstate.agentid) {
                        continue;
                    }
                    if (_sub_param2agent[target_param] != undefined) {
                        _sub_param2agent[target_param].splice(_sub_param2agent[target_param].indexOf(thesubs[i]), 1);
                        if (_sub_param2agent[target_param].length == 0) ;
                    } else {
                        log.warn(" *** Warning, unsub but don't have handler");
                    }
                    // TODO: Clean up if nobody uses it any more
                    // if _sub_param2agent[target_param].length == 0
                }
            }
            _sub_agent2param[_aid2] = _subs;
        };

        var _update_value = function (_aid, _key, _val) {
            var ra = getAgent(_aid);
            if (ra) {
                ra.update_value(_aid, _key, _val);
            }
        };

        var _cbs = [];
        var _globalCbs = [];
        var on = function (what, handler) {
            if (what == "agentchange") {
                _cbs.push(handler);
            } else {
                if (!_globalCbs[what]) {
                    _globalCbs[what] = [];
                }
                _globalCbs[what].push(handler);
            }

        };

        var off = function (what, handler) {
            if (what == "agentchange") {
                if (_cbs.indexOf(handler) == -1) {
                    throw "Handler not registered";
                }
                _cbs.splice(_cbs.indexOf(handler), 1);
            } else {
                if (_globalCbs[what].indexOf(handler) == -1) {
                    throw "Handler not registered";
                }
                _globalCbs[what].splice(_globalCbs[what].indexOf(handler), 1);
            }

        };


        var _doCallbacks = function (what, e) {
            if (what == "agentchange") {
                if (!e.agentContext) {
                    delete _currentAgentState[e.agentid];
                    log.info(_currentAgentState);
                } else if (_currentAgentState[e.agentid] == undefined) {
                    _currentAgentState[e.agentid] = {
                        capabilities: {},
                        keys: []
                    };
                }

                // Create diff
                e.diff = {
                    capabilities: {},
                    keys: []
                };
                if (e.agentContext) {

                    var cs = e.agentContext.capabilities();
                    for (var c in cs) {
                        if (cs.hasOwnProperty(c)) {
                            if (!_currentAgentState[e.agentid].capabilities) {
                                _currentAgentState[e.agentid].capabilities = {};
                            }
                            if (_currentAgentState[e.agentid].capabilities[c] != cs[c]) {
                                e.diff.capabilities[c] = cs[c];
                            }
                        }
                    }
                    // Also check keys
                    var keys = e.agentContext.keys();
                    for (var i = 0; i < keys.length; i++) {
                        if (_currentAgentState[e.agentid].keys.indexOf(keys[i]) == -1) {
                            e.diff.keys.push(keys[i]);
                        }
                    }

                    _currentAgentState[e.agentid] = {
                        capabilities: cs,
                        keys: keys
                    };

                }
                for (var i = 0; i < _cbs.length; i++) {
                    try {
                        _cbs[i].call(self, e);
                    } catch (err) {
                        log.error("Error in agentchange callback: ", err);
                        log.error("cb:", _cbs[i]);
                    }
                }
            } else {
                for (var i = 0, len = _globalCbs[what].length; i < len; i++) {
                    try {
                        _globalCbs[what][i].call(self, e);
                    } catch (err) {
                        log.error("Error in agentchange callback: ", err);
                        log.error("cb:", _globalCbs[what][i]);
                    }
                }
            }

        };

        options.autoPresence = true;

        var __ready = false;
        var _sharedstate = SharedState(url, options)
            .on("readystatechange", function (s) {
                if (s === _sharedstate.STATE.OPEN) {
                    readyObserver.next("ready");
                    __ready = true;
		    // Register
                    let meta = {
                        keys: _the_self.keys(),
                        capabilities: _the_self.capabilities()
                    };

                    _sharedstate.setItem("__meta__" + _sharedstate.agentid, meta);
                    _sharedstate.setItem("__metasub__" + _sharedstate.agentid, []);
                    _sharedstate.setPresence("online");

                    // Also check for new parameters being added
                    // ABosl - moved here to only test if _sharedstate == open
                    _the_self.on("keychange", function (e) {
                        // Update my meta description too
                        var meta = {
                            keys: _the_self.keys(),
                            capabilities: _the_self.capabilities()
                        };
                        _sharedstate.setItem("__meta__" + _sharedstate.agentid, meta);
                    });

                    _sharedstate.on("presence", function (event) {

                        var _agentid = event.key;
                        event.value;
                        if (event.value == "offline") {
                            if (_agents.hasOwnProperty(_agentid)) {
                                // Clean up this node

                                _agents[_agentid] = null;
                                delete _agents[_agentid];
                                _doCallbacks("agentchange", {
                                    agentid: _agentid,
                                    agentContext: null
                                });

                            }
                            // TODO: Also clean up other state that should be removed?
                            /*
                            if (options.autoremove == true) {
                              this.removeItem("__meta__" + _agentid)
                              this.removeItem("__metasub__" + _agentid)
                              this.delAgent(_agentid);
                            }
                            */

                        } else {
                            if (event.value == "online") {
                                if (!_agents[_agentid]) {
                                    _agents[_agentid] = remoteAgentContext(_agentid);
                                }

                                var diff = {
                                    "added": {},
                                    "altered": {},
                                    "removed": []
                                };
                                var new_capabilities = _agents[_agentid].publicAPI.capabilities();
                                if (_last_capabilities[_agentid] != undefined) {
                                    for (var capability in _last_capabilities[_agentid]) {
                                        log.debug(capability);
                                        if (new_capabilities[capability] === undefined) {
                                            diff.removed.push(capability);
                                        }
                                    }
                                } else {
                                    _last_capabilities[_agentid] = [];
                                }

                                for (var capability in new_capabilities) {
                                    if (_last_capabilities[_agentid][capability] === undefined) {
                                        diff.added[capability] = new_capabilities[capability];
                                    } else if (_last_capabilities[_agentid][capability] != new_capabilities[capability]) {
                                        diff.altered[capability] = new_capabilities[capability];
                                    }
                                }

                                _last_capabilities[_agentid] = new_capabilities;
                                let inter = setInterval(()=>{
                                    if (getAgent(_agentid) != undefined){
                                         clearInterval(inter);
                                        _update_subscriptions(_agentid);
                                        _doCallbacks("agentchange", {
                                            agentid: _agentid,
                                            agentContext: _agents[_agentid].publicAPI,
                                            diff: diff
                                        });
                                    }



                            },15);
                            }

                        }
                        //_agents[_agentid].
                    });
                }
            })
            .on("change", function (e) {
                if (e.key.indexOf("__meta__") > -1) {
                    var _agentid = e.key.substr(8);
                    var a = _agents[_agentid];
                    if (a) {
                        a.update_meta(e.value);
                        _doCallbacks("agentchange", {
                            agentid: _agentid,
                            agentContext: _agents[_agentid].publicAPI
                        });
                    } else {
                        if (options.autoremove == true) {
                            _sharedstate.removeItem("__meta__" + _agentid);
                            _sharedstate.removeItem("__metasub__" + _agentid);
                        }
                    }
                } else if (e.key.indexOf("__metasub__") > -1) {
                    let _agentid = e.key.substr(11);

                      let inter2 = setInterval(()=>{
                        if (getAgent(_agentid)!=undefined){
                            clearInterval(inter2);
                            _update_subscriptions(_agentid, e.value);
                        }
                    },15);





                } else if (e.key.indexOf("__val__") > -1) {
                    var x = e.key.substr(7).split("_");
                    x.splice(x.length-1);
                    let _agentid = x.join("_");
                    x = e.key.substr(7).split("_");
                    var _key = x.splice(x.length-1)[0];
                    _update_value(_agentid, _key, e.value);

		} else if (e.key.indexOf('__global__') > -1) {
                    log.debug('globalVar', e.key, e.value);
                    var _what = e.key.substr(10);
                    if (_globalCbs[_what]) {
                        _doCallbacks(_what, {
                            key: _what,
                            value: e.value
                        });
                    } else {
                        const [newAppAttrCallback] = _globalCbs['default'];
                        newAppAttrCallback.call(self, {
                            key: _what,
                            value: e.value
                        });
                    }
                } else {
                    log.warb("Unknown Change:" + JSON.stringify(e));
                }
            });




        var getAgent = function (aid) {
            return _agents[aid];
        };

        var getAgents = function () {
            if (_agents[_sharedstate.agentid] == undefined) {
                _agents[_sharedstate.agentid] = remoteAgentContext(_sharedstate.agentid);
            }
            var agents = {
                self: _agents[_sharedstate.agentid].publicAPI
            };
            for (var a in _agents) {
                if (a == _sharedstate.agentid) continue;
                if (_agents[_sharedstate.agentid]) {
                    agents[a] = _agents[a].publicAPI;
                }
            }
            return agents;
        };
        var _ready = function (){

          return  __ready;
        };
        var addAgent = function(agent) {
          // TODO: Check argument!
          if (_agents[agent.agentid] != undefined) {
            throw new Error("Already have agent '" + agent.agentid + "'");
          }
          _agents[agent.agentid] = agent;
          _doCallbacks("agentchange", {
            agentid: agent.agentid,
            agentContext: agent,
            diff: {"added":agent.capabilities()}
          });
        };

        var removeAgent = function(agent) {
          if (_agents[agent.agentid] != agent) {
            throw new Error("Failed to remove agent '" + agent.agentid + "'");
          }
          delete _agents[agent.agentid];
          _doCallbacks("agentchange", {
              agentid: agent.agentid,
              agentContext: null
          });
        };


        var setItem = function (key, value) {
            if (typeof key !="undefined" && typeof value!="undefined") {
                _sharedstate.setItem('__global__' + key, value);
            }
        };

        var getKeys = function () {
            var allKeys = _sharedstate.keys();
            var globalVars = [];
            for (var i = 0, len = allKeys.length; i < len; i++) {
                if (allKeys[i].indexOf('__global__') > -1) {
                    globalVars.push(allKeys[i].substr(10));
                }
            }
            return globalVars;
        };

        var getItem = function (key) {
            return _sharedstate.getItem('__global__' + key);
        };

        // API
        self.getAgents = getAgents;
        self.on = on;
        self.off = off;
        self.me = _the_self;
        self.ready = _ready;
        //API for Global Variables
        self.setItem = setItem;
        self.getItem = getItem;
        self.keys = getKeys;
        self.onready = readyObservable;
        // API for locally discovered agents - should only be used for node discovery frameworks
        self.addAgent = addAgent;
        self.removeAgent = removeAgent;
        return self;
    };

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */

    /**
     *
     */
    var MappingService = function (url, options) {
        var log =  Logger.getLogger('MappingService');

        var _connection = null;
        var self = {};

        // READY STATE for Shared State
        var STATE = Object.freeze({
            CONNECTING: "connecting",
            OPEN: "open",
            CLOSED: "closed"
        });

        if (typeof url === 'object') {
            var options = url;
            url = {};
        
        }

        // Event Handlers
        var _callbacks = {
            'readystatechange': []
        };
        /* <!-- defaults */
        if (!options) {
            var options = {};
        }

        if (!options.maxTimeout){
            options.maxTimeout = 2000;
        }

        options.forceNew = true;
        options.multiplex = false;
	    options.transport =["websocket","polling"];
        var connectURL = url || {};
        /* defaults --> */

        var waitingUserPromises = [];
        var waitingGroupPromises = [];

        /* <!-- internal functions */
        var _init = function () {

            _connection = lookup(connectURL, options);
            _connection.on('connect', onConnect);
            readystate.set('connecting');
            _connection.on('mapping', onMapping);
            if (_connection.connected === true) {
                onConnect();
            }

        };

        var onConnect = function () {
            readystate.set('open');
        };

        var onMapping = function (response) {
            var host = url;

            if (typeof url === 'object' || !url) {
                var host = window.location.protocol + '//' + window.location.host + '/';
            }

            if (!response.group) {
                var result = {};
                if (response.user) {
                    result.user = host + response.user;
                }
                if (response.app) {
                    result.app = host + response.app;
                }
                if (response.userApp) {
                    result.userApp = host + response.userApp;
                }


                if (waitingUserPromises.length > 0) {
                    promise = waitingUserPromises.pop();
                    promise(result);
                }
            } else {
                var result = {
                    group: host + response.group
                };
                if (waitingGroupPromises.length > 0) {
                    let promise = waitingGroupPromises.pop();
                    promise(result);
                }
            }
        };

        /*
			Internal method for invoking callback handlers

			Handler is only supplied if on one specific callback is to used.
			This is helpful for supporting "immediate events", i.e. events given directly
			after handler is registered - on("change", handler);

			If handler is not supplied, this means that all callbacks are to be fired.
			This function is also sensitive to whether an "immediate event" has already been fired
			or not. See callback registration below.
        */
        var _do_callbacks = function (what, e, handler) {
            if (!_callbacks.hasOwnProperty(what)) throw "Unsupported event " + what;
            var h;
            for (let i = 0; i < _callbacks[what].length; i++) {
                h = _callbacks[what][i];
                if (handler === undefined) {
                    // all handlers to be invoked, except those with pending immeditate
                    if (h._immediate_pending) {
                        continue;
                    }
                } else {
                    // only given handler to be called
                    if (h === handler) handler._immediate_pending = false;
                    else {
                        continue;
                    }
                }
                try {
                    h.call(self, e);
                } catch (e) {
                    _error("Error in " + what + ": " + h + ": " + e);
                }
            }
        };

        /*
			READYSTATE

			encapsulate protected property _readystate by wrapping
			getter and setter logic around it.
			Closure ensures that all state transfers must go through set function.
			Possibility to implement verification on all attempted state transferes
			Event

  		*/
        var readystate = function () {
            var _readystate = STATE["CONNECTING"];
            // accessors
            return {
                set: function (new_state) {
                    // check new state value
                    let found = false;
                    for (let key in STATE) {
                        if (!STATE.hasOwnProperty(key)) continue;
                        if (STATE[key] === new_state) found = true;
                    }
                    if (!found) throw "Illegal state value " + new_state;
                    // check state transition
                    if (_readystate === STATE["CLOSED"]) return; // never leave final state
                    // perform state transition
                    if (new_state !== _readystate) {
                        _readystate = new_state;
                        // trigger events
                        _do_callbacks("readystatechange", new_state);
                    }
                },
                get: function () {
                    return _readystate;
                }
            };
        }();

        var getUserMapping = function (appId, scopeList) {
            if (appId && Array.isArray(scopeList)) {
                var request = {
                    appId: appId
                };
                for (var i = 0, len = scopeList.length; i < len; i++) {
                    if (scopeList[i] === 'user') {
                        request.user = true;
                    }
                    if (scopeList[i] === 'app') {
                        request.app = true;
                    }
                    if (scopeList[i] === 'userApp') {
                        request.userApp = true;
                    }
                }
                if (options.userId) {
                    request.userId = options.userId;
                }
                _connection.emit('getMapping', request);
            } else {
                throw 'appId or scopeList undefined';
            }
            return new Promise(function (fulfill, reject) {
                waitingUserPromises.push(function (data) {
                    fulfill(data);
                });
                setTimeout(function () {
                    reject({
                        error: 'timeout-mappinservice'
                    });
                }, options.maxTimeout);
            });
        };

        var getGroupMapping = function (groupId) {
            if (groupId) {
                var request = {
                    groupId: groupId
                };
                _connection.emit('getMapping', request);
            } else {
                throw 'groupId undefined';
            }
            return new Promise(function (fulfill, reject) {
                waitingGroupPromises.push(function (data) {
                    fulfill(data);
                });
                log.info("set timeout",options.maxTimeout);
                setTimeout(function () {
                    reject({
                        error: 'timeout-mappinservice2'
                    });
                }, options.maxTimeout);
            });
        };

        /**
         * registers a function on event, function gets called immediatly
         * @method on
         * @param {string} what change || presence || readystatechange
         * @param {function} handler the function to call on event
         * @returns {Object} SharedState
         * @memberof SharedState
         */
        /*
		    register callback

			The complexity of this method arise from the fact that we are to give
			an "immediate callback" to the given handler.

			In addition, I do not want to do so directly within the on() method.

			As a programmer I would like to ensure that initialisation of an object
			is completed BEFORE the object needs to process any callbacks from the
			external world. This can be problematic if the object depends on events
			from multiple other objects. For example, the internal initialisation code
			needs to register handlers on external objects a and b.

			a.on("event", internal_handler_a);
			b.on("event", internal_handler_b);

			However, if object a gives an callback immediately within on, this callback
			will be processed BEFORE we have completed initialisation, i.e., any code
			subsequent to a.on).

			It is quite possible to make this be correct still, but I find nested handler
			invocation complicated to think about, and I prefer to avoid the problem.
			Therefore I like instead to make life easier by delaying "immediate callbacks"
			using

			setTimeout(_do_callbacks("event", e, handler), 0);

			This however introduces two new problems. First, if you do :

			o.on("event", handler);
			o.off("event", handler);

			you will get the "immediate callback" after off(), which is not what you
			expect. This is avoided by checking that the given handler is indeed still
			registered when executing _do_callbacks(). Alternatively one could cancel the
			timeout within off().

			Second, with the handler included in _callbacks[what] it is possible to receive
			event callbacks before the delayed "immediate callback" is actually invoked.
			This breaks the expectation the the "immediate callback" is the first callback.
			This problem is avoided by flagging the callback handler with ".immediate_pending"
			and dropping notifications that arrive before the "immediate_callback has executed".
			Note however that the effect of this dropped notification is not lost. The effects
			are taken into account when we calculate the "initial state" to be reported by the
			"immediate callback". Crucially, we do this not in the on() method, but when the
			delayed "immediate callback" actually is processed.
	    */

        var on = function (what, handler) {
            if (!handler || typeof handler !== "function") throw "Illegal handler";
            if (!_callbacks.hasOwnProperty(what)) throw "Unsupported event " + what;
            var index = _callbacks[what].indexOf(handler);
            if (index === -1) {
                // register handler
                _callbacks[what].push(handler);
                // flag handler
                handler._immediate_pending = true;
                // do immediate callback
                setTimeout(function () {
                    switch (what) {
                    case 'readystatechange':
                        _do_callbacks("readystatechange", readystate.get(), handler);
                        break;
                    }
                }, 0);
            }
            return self;
        };

        /**
         * deregisters a function on event
         * @method off
         * @param {string} what change || presence || readystatechange
         * @param {function} handler the function to call on event
         * @returns {Object} SharedState
         * @memberof SharedState
         */
        // unregister callback
        var off = function (what, handler) {
            if (_callbacks[what] !== undefined) {
                var index = _callbacks[what].indexOf(handler);
                if (index > -1) {
                    _callbacks[what].splice(index, 1);
                }
            }
            return self;
        };

        /* API functions --> */


        /* <!-- public */
        self.__defineGetter__("readyState", readystate.get);
        self.__defineGetter__("STATE", function () {
            return STATE;
        });


        self.getUserMapping = getUserMapping;
        self.getGroupMapping = getGroupMapping;

        self.on = on;
        self.off = off;

        /* public --> */

        _init();

        return self;
    };

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
function DeviceProfile(url){

      let deviceProfile = {
       init:function(){
         this.setCapability("deviceProfile", "supported");
       },
       on:function(){
         if (url) url +="checkDevice?agent="+navigator.userAgent;
         else url = "https://"+window.location.host+"/checkDevice?agent="+navigator.userAgent;
         fetch(url).then((e)=>{
             e.json().then((data)=>{
               this.setItem('deviceProfile', data.deviceType);

             });

         });
       },
       off:function(){

       }
     };
   return {"deviceProfile":deviceProfile};
}
function TextData(element){

      let text = {
       init:function(){
          this.setCapability("textShare", "supported");

       },
       on:function(){
          element.addEventListener('change',(txt)=>{
                this.setItem('textShare', element.value);
          });
          //this.setCapability("deviceProfile", "supported");
       },
       off:function(){
         element.removeEventListener('change',(txt)=>{
               this.setItem('textShare', element.value);
         });
       }
     };
   return {"textShare":text};
}
function MasterSlaveProfile(me){

      let ms = {
       init:function(){
          this.setCapability("masterSlave", "supported");
        //  this.setItem('masterSlave', me.master || true);
       },
       on:function(){
          // element.addEventListener('change',(txt)=>{
          //       this.setItem('textShare', element.value);
          // })
          this.setItem('masterSlave', (me.master === undefined || me.master === true)?true:false);

       },
       off:function(){

       }
     };
   return {"masterSlave":ms};
}
function UserProfile(me){

      let up = {
       init:function(){
          this.setCapability("userProfile", "supported");
        //  this.setItem('masterSlave', me.master || true);
       },
       on:function(){
          // element.addEventListener('change',(txt)=>{
          //       this.setItem('textShare', element.value);
          // })
          this.setItem('userProfile', me.options.profile || '');

       },
       off:function(){

       }
     };
   return {"userProfile":up};
}
function UserData(url){

      let userData = {
       init:function(){
         this.setCapability("userData", "supported");


       },
       on:function(){
         setTimeout(()=>{
         let data = this.getItem('userData') !="undefined" ? this.getItem('userData'): {};
         this.setItem('userData',data);
        },0);
       },
       off:function(){

       }
     };
   return {"userData":userData};
}

function KeyPress(){

      let ms = {
       init:function(){
          this.setCapability("keyPress", "supported");
          //this.setItem('keyPress', "");
       },
       on:function(){
          // element.addEventListener('change',(txt)=>{
          //       this.setItem('textShare', element.value);
          // })
          document.addEventListener('keypress',(txt)=>{
                this.setItem('keyPress', txt.key);
          });

       },
       off:function(){
         document.removeEventListener('keypress',(txt)=>{
               this.setItem('keyPress', txt.key);
       });
     }
   };
   return {"keyPress":ms};
}
function ComponentsStatus(me){

  let ms = {
   init:function(){
      this.setCapability("componentsStatus", "supported");
    },
   on:function(){
    let compStatus = this.getItem("componentsStatus");
    if (compStatus.length === 0)
    this.setItem('componentsStatus', []);

   },
   off:function(){

   }
 };
return {"componentsStatus":ms};
}
function Message(msg){

  let m = {
   init:function(){
      this.setCapability("message", "supported");
      this.setItem('message', msg || 'undefined');
   },
   on:function(){

      this.setItem('message', msg || 'undefined');

   },
   off:function(){

   }
 };
 return {"message":m};
}

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
/*! (C) WebReflection - Mit Style License */
var EventTarget$1=function(){function o(e,t,i){n.value=i,r(e,t,n),n.value=null;}function u(e,t,n){var r;s.call(e,t)?r=e[t]:o(e,t,r=[]),i.call(r,n)<0&&r.push(n);}function a(e,t,n){var r,i,o;if(s.call(e,t)){n.target=e,r=e[t].slice(0);for(o=0;o<r.length;o++)i=r[o],typeof i=="function"?i.call(e,n):typeof i.handleEvent=="function"&&i.handleEvent(n);}}function f(e,t,n){var r,o;s.call(e,t)&&(r=e[t],o=i.call(r,n),-1<o&&(r.splice(o,1),r.length||delete e[t]));}var e="@@",t={},n={configurable:!0,value:null},r=Object.defineProperty||function(t,n,r){t[n]=r.value;},i=[].indexOf||function(t){var n=this.length;while(n--&&this[n]!==t);return n},s=t.hasOwnProperty;return o(t,"addEventListener",function(n,r){u(this,e+n,r);}),o(t,"dispatchEvent",function(n){a(this,e+n.type,n);}),o(t,"removeEventListener",function(n,r){f(this,e+n,r);}),t};

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
/**
 * @file A State Vector is an object that describes uni-dimensional
 * motion in real time.
 *
 * The motion is described by four real numbers [p, v, a, t] representing
 * the position (p), velocity (v), and acceleration (a) at time (t).
 *
 * The time (t) is expressed in seconds. The position unit is entirely up to
 * the application. The velocity is in position units per second, and the
 * acceleration in position units per second squared.
 */

// Ensure "define" is defined in node.js in the absence of require.js
// See: https://github.com/jrburke/amdefine

/* Default constructor for a state vector
   *
   * @class
   * @param {Object} vector The initial motion vector
   * @param {Number} vector.position The initial position (0.0 if null)
   * @param {Number} vector.velocity The initial velocity (0.0 if null)
   * @param {Number} vector.acceleration The initial acceleration (0.0 if null)
   * @param {Number} vector.timestamp The initial time in seconds (now if null)
   */
  var StateVector = function (vector) {
    vector = vector || {};

    /**
     * The position of the motion along its axis.
     *
     * The position unit may be anything.
     */
    this.position = vector.position || 0.0;

    /**
     * The velocity of the motion in position units per second.
     */
    this.velocity = vector.velocity || 0.0;

    /**
     * The acceleration of the motion in position units per second squared.
     */
    this.acceleration = vector.acceleration || 0.0;

    /**
     * The local time in milliseconds when the position, velocity and
     * acceleration are evaluated.
     */
    this.timestamp = vector.timestamp || (Date.now() / 1000.0);


  };


  /**
   * Computes the position along the uni-dimensional axis at the given time
   *
   * @function
   * @param {Number} timestamp The reference time in seconds
   */
  StateVector.prototype.computePosition = function (timestamp) {
    var elapsed = timestamp - this.timestamp;
    var result = this.position +
      this.velocity * elapsed +
      0.5 * this.acceleration * elapsed * elapsed;

    return result;
  };


  /**
   * Computes the velocity along the uni-dimensional axis at the given time
   *
   * @function
   * @param {Number} timestamp The reference time in seconds
   */
  StateVector.prototype.computeVelocity = function (timestamp) {
    var elapsed = timestamp - this.timestamp;
    var result = this.velocity +
      this.acceleration * elapsed;
    return result;
  };


  /**
   * Computes the acceleration along the uni-dimensional axis at the given time
   *
   * Note that this function merely exists for symmetry with computePosition and
   * computeAcceleration. In practice, this function merely returns the vector's
   * acceleration which is unaffected by time.
   *
   * @function
   * @param {Number} timestamp The reference time in seconds
   */
  StateVector.prototype.computeAcceleration = function (timestamp) {
    return this.acceleration;
  };


  /**
   * Compares this vector with the specified vector for order. Returns a
   * negative integer, zero, or a positive integer as this vector is less than,
   * equal to, or greater than the specified object.
   *
   * Note that the notions of "less than" or "greater than" do not necessarily
   * mean much when comparing motions. In practice, the specified vector is
   * evaluated at the timestamp of this vector. Position is compared first.
   * If equal, velocity is compared next. If equal, acceleration is compared.
   *
   * TODO: the function probably returns differences in cases where it should
   * not because of the limited precision of floating numbers. Fix that.
   *
   * @function
   * @param {StateVector} vector The vector to compare
   * @returns {Integer} The comparison result
   */
  StateVector.prototype.compareTo = function (vector) {
    var timestamp = this.timestamp;
    var value = 0.0;

    value = vector.computePosition(timestamp);
    if (this.position < value) {
      return -1;
    }
    else if (this.position > value) {
      return 1;
    }

    value = vector.computeVelocity(timestamp);
    if (this.velocity < value) {
      return -1;
    }
    else if (this.velocity > value) {
      return 1;
    }

    value = vector.computeAcceleration(timestamp);
    if (this.acceleration < value) {
      return -1;
    }
    else if (this.acceleration > value) {
      return 1;
    }

    return 0;
  };


  /**
   * Overrides toString to return a meaningful string serialization of the
   * object for logging
   *
   * @function
   * @returns {String} A human-readable serialization of the vector
   */
  StateVector.prototype.toString = function () {
    return '(position=' + this.position +
      ', velocity=' + this.velocity +
      ', acceleration=' + this.acceleration +
      ', timestamp=' + this.timestamp + ')';
  };

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
/**
 * @file A few useful utility functions
 */

var Utils = {
   toString : Object.prototype.toString,

  /**
   * Returns true when parameter is null
   *
   * @function
   * @param {*} obj Object to check
   * @returns {Boolean} true if object is null, false otherwise
   */
  isNull : function (obj) {
    return obj === null;
  },


  /**
   * Returns true when parameter is a number
   *
   * @function
   * @param {*} obj Object to check
   * @returns {Boolean} true if object is a number, false otherwise
   */
  isNumber : function (obj) {
    return toString.call(obj) === '[object Number]';
  },


  /**
   * Serialize object as a JSON string
   *
   * @function
   * @param {Object} obj The object to serialize as JSON string
   * @return {String} The serialized JSON string
   */
   stringify : function (obj) {
    return JSON.stringify(obj, null, 2);
  },
  getHostName:function(url){
    var a = document.createElement('a');
    a.href = "http://" + url;
    return a.hostname;
  }


  // Expose helper functions to the outer world

};

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */

  /**
   * Creates an interval
   *
   * @class
   * @param {Object} range The range
   * @param {Number} range.low Lower bound of the interval
   * @param {Number} range.high Higher bound of the interval
   * @param {Boolean} range.lowInclude Whether to include the lower bound
   * @param {Boolean} range.highInclude Whether to include the higher bound
   */
  var Interval = function (range) {
    range = range || {};

    this.low = range.low;
    this.lowInclude = range.lowInclude;
    this.high = range.high;
    this.highInclude = range.highInclude;

    // Ensure low <= high
    if (Utils.isNumber(this.low) &&
        Utils.isNumber(this.high) &&
        (this.low > this.high)) {
      range.low = this.high;
      range.lowInclude = this.highInclude;
      this.high = this.low;
      this.highInclude = this.lowInclude;
      this.low = range.low;
      this.lowInclude = range.lowInclude;
    }


  };


  /**
   * Returns true if interval covers the given value.
   *
   * @function
   * @param {Number} value Value to check
   * @returns {Boolean} true if interval covers the value
   */
  Interval.prototype.covers = function (value) {
    return (!this.low ||
        (this.low < value) ||
        ((this.low === value) && this.lowInclude)) &&
      (!this.high ||
        (this.high > value) ||
        ((this.high === value) && this.highInclude));
  };


  /**
   * Returns true if low is equal to high
   *
   * @function
   * @returns true if low is equal to high
   */
  Interval.prototype.isSingular = function () {
    return this.low === this.high;
  };

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */


  /**
   * Creates a timing provider
   *
   * @class
   * @param {StateVector} vector The initial motion vector
   * @param {Interval} range The initial range if one is to be defined
   */
  var AbstractTimingProvider = function (vector, range) {
    this.range = new Interval(range);

    var currentVector = new StateVector(vector);
    var readyState = 'connecting';
    var self = this;
    Object.defineProperties(this, {
      readyState: {
        get: function () {
          return readyState;
        },
        set: function (state) {
          if (state !== readyState) {
            readyState = state;

            setTimeout(function () {
              // Dispatch the event on next loop to give code that wants to
              // listen to the initial change to "open" time to attach an event
              // listener (local timing provider objects typically set the
              // readyState property to "open" directly within the constructor)
              self.dispatchEvent({
                type: 'readystatechange',
                value: state
              });
            }, 0);
          }
        }
      },
      vector: {
        get: function () {
          return currentVector;
        },
        set: function (vector) {
          var previousVector = currentVector;
          currentVector = vector;
          if (previousVector.compareTo(currentVector) === 0) ;
          else {

            self.dispatchEvent({
              type: 'change',
              value: currentVector
            });
          }
        }
      }
    });

  };


  // Timing providers implement EventTarget
  AbstractTimingProvider.prototype.addEventListener = EventTarget$1().addEventListener;
  AbstractTimingProvider.prototype.removeEventListener = EventTarget$1().removeEventListener;
  AbstractTimingProvider.prototype.dispatchEvent = EventTarget$1().dispatchEvent;


  /**
   * Returns a new StateVector that represents the motion's position,
   * velocity and acceleration at the current local time.
   *
   * @function
   * @returns {StateVector} A new StateVector object that represents
   *   the motion's position, velocity and acceleration at the current local
   *   time.
   */
  AbstractTimingProvider.prototype.query = function () {
    var timestamp = Date.now() / 1000.0;
    var currentVector = new StateVector({
      position: this.vector.computePosition(timestamp),
      velocity: this.vector.computeVelocity(timestamp),
      acceleration: this.vector.computeAcceleration(timestamp),
      timestamp: timestamp
    });

    return currentVector;
  };


  /**
   * Sends an update command to the online timing service.
   *
   * @function
   * @param {Object} vector The new motion vector
   * @param {Number} vector.position The new motion position.
   *   If null, the position at the current time is used.
   * @param {Number} vector.velocity The new velocity.
   *   If null, the velocity at the current time is used.
   * @param {Number} vector.acceleration The new acceleration.
   *   If null, the acceleration at the current time is used.
   * @returns {Promise} The promise to get an updated StateVector that
   *   represents the updated motion on the server once the update command
   *   has been processed by the server.
   *   The promise is rejected if the connection with the online timing service
   *   is not possible for some reason (no connection, timing object on the
   *   server was deleted, timeout, permission issue).
   */
  AbstractTimingProvider.prototype.update = function (vector) {
    vector = new StateVector(vector || {});

    return new Promise(function (resolve, reject) {
      var err = new Error('Abstract "update" method called');

      reject(err);
    });
  };


  /**
   * Closes the timing provider object, releasing any resource that the
   * object might use.
   *
   * Note that a closed timing provider object cannot be re-used.
   *
   * @function
   */
  AbstractTimingProvider.prototype.close = function () {
    if ((this.readyState === 'closing') ||
        (this.readyState === 'closed')) {
      return;
    }
    this.readyState = 'closing';
    this.readyState = 'closed';
  };

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */


  /**
   * Creates a timing provider
   *
   * @class
   */
  var LocalTimingProvider = function (vector, range) {
    AbstractTimingProvider.call(this, vector, range);
    this.readyState = 'open';

  };
  LocalTimingProvider.prototype = new AbstractTimingProvider();


  /**
   * Sends an update command to the online timing service.
   *
   * @function
   * @param {Object} vector The new motion vector
   * @param {Number} vector.position The new motion position.
   *   If null, the position at the current time is used.
   * @param {Number} vector.velocity The new velocity.
   *   If null, the velocity at the current time is used.
   * @param {Number} vector.acceleration The new acceleration.
   *   If null, the acceleration at the current time is used.
   * @returns {Promise} The promise to get an updated StateVector that
   *   represents the updated motion on the server once the update command
   *   has been processed by the server.
   *   The promise is rejected if the connection with the online timing service
   *   is not possible for some reason (no connection, timing object on the
   *   server was deleted, timeout, permission issue).
   */
  LocalTimingProvider.prototype.update = function (vector) {
    vector = vector || {};

    var timestamp = Date.now() / 1000.0;
    var newVector = {
      position: (Utils.isNull(vector.position) ?
        this.vector.computePosition(timestamp) :
        vector.position),
      velocity: (Utils.isNull(vector.velocity) ?
        this.vector.computeVelocity(timestamp) :
        vector.velocity),
      acceleration: (Utils.isNull(vector.acceleration) ?
        this.vector.computeAcceleration(timestamp) :
        vector.acceleration),
      timestamp: timestamp
    };
    this.vector = new StateVector(newVector);


    return new Promise(function (resolve, reject) {

      resolve(newVector);
    });
  };

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */


  /**
   * Constructor of the timing object
   *
   * @class
   * @param {StateVector} vector The initial motion vector
   * @param {Interval} range The initial range if one is to be defined
   */
  var TimingObject = function (vector, range) {
    var self = this;

    /**
     * Helper methods to start/stop dispatching time update events
     * (only triggered when the object is moving)
     *
     * Note that setInterval is bound to the event loop and thus
     * the precision of the timing update depends on the overall
     * event loop "congestion".
     *
     * TODO: note that the object cannot be garbage collected as long as
     * "timeupdate" events are being dispatched. Not sure that there is
     * much we can do here.
     *
     * TODO: the code triggers the first event after 200ms. Should it rather
     * trigger the first event right away?
     */
    var timeupdateInterval = null;
    var startDispatchingTimeUpdateEvents = function () {
      var frequency = 10;
      if (timeupdateInterval) { return; }

      timeupdateInterval = setInterval(function () {

        self.dispatchEvent({
          type: 'timeupdate'
        });
      }, Math.round(1000 / frequency));
    };
    var stopDispatchingTimeUpdateEvents = function () {
      if (!timeupdateInterval) { return; }
      clearInterval(timeupdateInterval);
      timeupdateInterval = null;
    };


    /**
     * All "change" events received from the timing provider will be
     * propagated on this object
     */
    var changeListener = function (evt) {
      var vector = evt.value || {
        velocity: 0.0,
        acceleration: 0.0
      };
      if ((vector.velocity !== 0.0) || (vector.acceleration !== 0.0)) {
        startDispatchingTimeUpdateEvents();
      }
      else {
        stopDispatchingTimeUpdateEvents();
      }
      self.dispatchEvent(evt);
    };
    var readystatechangeListener = function (evt) {
      if (evt.value === 'closed') {
        stopDispatchingTimeUpdateEvents();
      }
      self.dispatchEvent(evt);
    };


    /**
     * Determine whether the timing object is managed locally or through
     * a third-party timing provider
     */
    var master = true;


    /**
     * Timing provider object associated with this timing object,
     * along with a couple of internal helper functions to associate/dissociate
     * this timing object with a timing provider object.
     */
    var timingProvider = null;

    var associateWithTimingProvider = function (provider) {
      var previousProvider = timingProvider;
      dissociateFromTimingProvider(previousProvider);

      timingProvider = provider;
      provider.addEventListener('change', changeListener);
      provider.addEventListener('readystatechange', readystatechangeListener);
      if (previousProvider && (provider.readyState === 'open')) {
        if (previousProvider.vector.compareTo(provider.vector) !== 0) {
          changeListener({
            type: 'change',
            value: provider.query()
          });
        }
      }
    };

    var dissociateFromTimingProvider = function (provider) {
      if (provider) {
        provider.removeEventListener('change', changeListener);
        provider.removeEventListener('readystatechange', readystatechangeListener);
      }
    };


    /**
     * Returns a new StateVector that represents the motion's position,
     * velocity and acceleration at the current local time.
     *
     * @function
     * @returns {StateVector} A new StateVector object that represents
     *   the motion's position, velocity and acceleration at the current local
     *   time.
     */
    this.query = function () {
      var vector = timingProvider.query();
      return vector;
    };


    /**
     * Updates the internal motion.
     *
     * If the timing object is attached to the local clock, the update operation
     * happens synchronously. If not, the update operation is asynchronous as
     * the method then relays the command to the online timing service
     * associated with this timing object.
     *
     * The "change" event is triggered when the update operation has completed.
     *
     * @function
     * @param {Number} position The new motion position. If null, the position
     *  at the current time is used.
     * @param {Number} velocity The new velocity. If null, the velocity at the
     *  current time is used.
     * @param {Number} acceleration The new acceleration. If null, the
     *  acceleration at the current time is used.
     */
    this.update = function (position, velocity, acceleration) {
      return timingProvider.update({
        position: position,
        velocity: velocity,
        acceleration: acceleration
      });
    };


    /**
     * Returns true when the object is moving, in other words when velocity
     * or acceleration is different from 0.0, else False
     *
     * @function
     */
    this.isMoving = function () {

      var vector = timingProvider.query();
      var result = (vector.velocity !== 0.0) || (vector.acceleration !== 0.0);

      return result;
    };


    /**
     * Define the "srcObject" and "readyState" properties
     */
    Object.defineProperties(this, {
      /**
       * The readyState attribute returns the ready state of the underlying
       * timing provider object
       */
      readyState: {
        get: function () {
          return timingProvider.readyState;
        }
      },

      /**
       * On getting, "srcObject" returns a pointer to the current timing
       * provider instance associated with the timing object, or null if
       * the timing object is managed locally.
       *
       * On setting, "srcObject" associates the timing object with the given
       * timing provider instance. If null, the timing object goes back to
       * being locally managed.
       */
      srcObject: {
        get: function () {
          // Do not return anything if the timing object is managed locally
          if (master) {
            return null;
          }
          else {
            return timingProvider;
          }
        },
        set: function (provider) {
          var previousProvider = timingProvider;
          if (provider) {
            // The caller wants to associate the timing object with a
            // third-party timing provider.
            // (this may trigger a "change" event if vector exposed by
            // the timing provider is different from the one we used
            // to have)
            master = false;
            associateWithTimingProvider(provider);

          }
          else {
            // The caller wants to remove the association with a third-party
            // timing provider. The object gets back to being locally managed
            if (master) ;
            else {
              // Associate with a new local timing provider
              // (this should not trigger a "change" event since
              // vector does not change internally)
              master = true;
              provider = new LocalTimingProvider(
                previousProvider.query(),
                previousProvider.range
              );
              associateWithTimingProvider(provider);

            }
          }
        }
      },


      /**
       * Returns the position evaluated at the time when the attribute is read
       */
      currentPosition: {
        get: function () {
          return timingProvider.query().position;
        }
      },

      /**
       * Returns the velocity evaluated at the time when the attribute is read
       */
      currentVelocity: {
        get: function () {
          return timingProvider.query().velocity;
        }
      },

      /**
       * Returns the acceleration evaluated at the time when the attribute is
       * read.
       */
      currentAcceleration: {
        get: function () {
          return timingProvider.query().acceleration;
        }
      }
    });

    // TODO: implement "range"
    // TODO: implement "vector", "previousVector" properties (is that needed?)
    // TODO: implement on... event properties

    // Newly created timing object instances are associated with a local timing
    // provider to start with. Set the "srcObject" property to change that
    // behavior afterwards.
    associateWithTimingProvider(new LocalTimingProvider(vector, range));

  };


  // TimingObject implements EventTarget
  TimingObject.prototype.addEventListener = EventTarget$1().addEventListener;
  TimingObject.prototype.removeEventListener = EventTarget$1().removeEventListener;
  TimingObject.prototype.dispatchEvent = EventTarget$1().dispatchEvent;

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */

  /**
   * Default constructor for a synchronized clock
   *
   * @class
   * @param {Number} initialSkew The initial clock skew
   * @param {Number} initialDelta The initial static delta
   */
  var AbstractSyncClock = function (initialSkew, initialDelta) {
    var self = this;

    /**
     * The current estimation of the skew with the reference clock, in ms
     */
    var skew = initialSkew || 0.0;

    /**
     * Some agreed fixed delta delay, in ms.
     */
    var delta = initialDelta || 0.0;

    /**
     * The ready state of the synchronized clock
     */
    var readyState = 'connecting';

    /**
     * Define the "readyState", "skew" and "delta" properties. Note that
     * setting these properties may trigger "readystatechange" and "change"
     * events.
     */
    Object.defineProperties(this, {
      readyState: {
        get: function () {
          return readyState;
        },
        set: function (state) {
          if (state !== readyState) {
            readyState = state;

            // Dispatch the event on next loop to give code that wants to
            // listen to the initial change to "open" time to attach an event
            // listener (locally synchronized clocks typically set the
            // readyState property to "open" directly within the constructor)
            setTimeout(function () {
              self.dispatchEvent({
                type: 'readystatechange',
                value: state
              });
            }, 0);
          }
        }
      },
      delta: {
        get: function () {
          return delta;
        },
        set: function (value) {
          var previousDelta = delta;
          delta = value;
          if (previousDelta === delta) ;
          else {

            self.dispatchEvent({
              type: 'change'
            });
          }
        }
      },
      skew: {
        get: function () {
          return skew;
        },
        set: function (value) {
          var previousSkew = skew;
          skew = value;
          if (readyState !== 'open') ;
          else if (previousSkew === skew) ;
          else {

            self.dispatchEvent({
              type: 'change'
            });
          }
        }
      }
    });
  };


  // Synchronized clocks implement EventTarget
  AbstractSyncClock.prototype.addEventListener = EventTarget$1().addEventListener;
  AbstractSyncClock.prototype.removeEventListener = EventTarget$1().removeEventListener;
  AbstractSyncClock.prototype.dispatchEvent = EventTarget$1().dispatchEvent;


  /**
   * Returns the time at the reference clock that corresponds to the local
   * time provided (both in milliseconds since 1 January 1970 00:00:00 UTC)
   *
   * @function
   * @param {Number} localTime The local time in milliseconds
   * @returns {Number} The corresponding time on the reference clock
   */
  AbstractSyncClock.prototype.getTime = function (localTime) {
    return localTime + this.skew - this.delta;
  };


  /**
   * Returns the number of milliseconds elapsed since
   * 1 January 1970 00:00:00 UTC on the reference clock
   *
   * @function
   * @returns {Number} The current timestamp
   */
  AbstractSyncClock.prototype.now = function () {
    return this.getTime(Date.now());
  };

  /**
   * Stops synchronization with the reference clock.
   *
   * In derived classes, this should typically be used to stop background
   * synchronization mechanisms.
   *
   * @function
   */
  AbstractSyncClock.prototype.close = function () {
    if ((this.readyState === 'closing') ||
        (this.readyState === 'closed')) {
      return;
    }
    this.readyState = 'closing';
    this.readyState = 'closed';
  };

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
  var OPEN$1 = 1;
  var CLOSED$1 = 3;

  // Number of exchanges to make with the server to compute the first skew
  var initialAttempts = 10;

  // Interval between two exchanges during initialization (in ms)
  var initialInterval = 10;

  // Maximum number of attempts before giving up
  var maxAttempts = 10;

  // Interval between two attempts when the clock is open (in ms)
  var attemptInterval = 500;

  // Interval between two synchronization batches (in ms)
  var batchInterval = 10000;

  // Minimum roundtrip threshold (in ms)
  var minRoundtripThreshold = 5;


  /**
   * Creates a Socket synchronization clock
   *
   * @class
   * @param {String} url The URL of the remote timing object for which we
   *   want to synchronize the clock (only used to check permissions)
   * @param {WebSocket} socket A Web socket to use as communication channel.
   */
  var SocketSyncClock = function (url, socket) {
    // Initialize the base class with default data
    AbstractSyncClock.call(this);

    var self = this;


    /**
     * The Web Socket that will be used to exchange sync information with
     * the online server
     */
    this.socket = socket;


    /**
     * Minimum round trip detected so far (in ms)
     */
    var roundtripMin = 1000;


    /**
     * Current round trip threshold above which the "sync"
     * request is considered to be a failure (in ms)
     *
     * NB: this threshold must always be higher than the minimum round trip
     */
    var roundtripThreshold = 1000;


    /**
     * Number of "sync" attempts in the current batch so far.
     * The clock will attempt up to maxAttempts attempts in a row
     * each time it wants to synchronize
     */
    var attempts = 0;


    /**
     * Valid responses received from the server for the current batch
     */
    var initialSyncMessages = [];


    /**
     * ID of the attempt response we are currently waiting for
     */
    var attemptId = null;


    /**
     * The attempt timeout
     */
    var attemptTimeout = null;


    /**
     * Timeout to detect when the server fails to respond in time
     */
    var timeoutTimeout = null;


    if (socket.readyState === OPEN$1) {

      sendSyncRequest();
    }
    else if (socket.readyState === CLOSED$1) {

      this.readyState = 'closed';
    }

    var errorHandler = function (err) {

      // TODO: properly deal with network errors
      return true;
    };

    var openHandler = function () {

      sendSyncRequest();
      return true;
    };

    var closeHandler = function () {

      self.close();
      return true;
    };

    var messageHandler = function (evt) {
      var msg = null;
      var received = Date.now();
      var skew = 0;

      if (typeof evt.data !== 'string') {

        return true;
      }

      try {
        msg = JSON.parse(evt.data) || {};
      }
      catch (err) {

        return true;
      }

      if (msg.type !== 'sync') {

        return true;
      }

      if (!msg.client || !msg.server ||
          !Utils.isNumber(msg.client.sent) ||
          !Utils.isNumber(msg.server.received) ||
          !Utils.isNumber(msg.server.sent)) {

        return true;
      }

      if (msg.id !== attemptId) {

        return true;
      }

      // Message is for us
      attempts += 1;

      // Compute round trip duration
      var roundtripDuration = received - msg.client.sent;

      // Check round trip duration
      if ((self.readyState !== 'connecting') &&
          (roundtripDuration > roundtripThreshold)) {

        return false;
      }

      if (timeoutTimeout) {
        // Cancel the timeout set to detect server timeouts.
        clearTimeout(timeoutTimeout);
        timeoutTimeout = null;
      }
      else {
        // A timeout already occurred
        // (should have normally be trapped by the check on round trip
        // duration, but timeout scheduling and the event loop are not
        // an exact science)

        return false;
      }

      // During initialization, simply store the response,
      // we'll process things afterwards
      if (self.readyState === 'connecting') {

        initialSyncMessages.push({
          received: received,
          roundtrip: roundtripDuration,
          msg: msg
        });
        if (attempts >= initialAttempts) {
          initialize();
          scheduleNextBatch();
        }
        else {
          scheduleNextAttempt();
        }
        return false;
      }

      // Adjust the minimum round trip and threshold if needed
      if (roundtripDuration < roundtripMin) {
        roundtripThreshold = Math.ceil(
          roundtripThreshold * (roundtripDuration / roundtripMin));
        if (roundtripThreshold < minRoundtripThreshold) {
          roundtripThreshold = minRoundtripThreshold;
        }
        roundtripMin = roundtripDuration;
      }


      // Sync message can be directly applied
      skew = ((msg.server.sent + msg.server.received) -
          (msg.client.sent + received)) / 2.0;
      if (Math.abs(skew - self.skew) < 1) {
        skew = self.skew;
      }
      else {
        skew = Math.round(skew);
      }

      // Save the new skew
      // (this triggers a "change" event if value changed)
      self.skew = skew;

      // No need to schedule another attempt,
      // let's simply schedule the next sync batch of attempts
      scheduleNextBatch();

      return false;
    };

    // NB: calling "addEventListener" does not work in a Node.js environment
    // because the WebSockets library used only supports basic "onXXX"
    // constructs. The code below works around that limitation but note that
    // only works provided the clock is associated with the socket *after* the
    // timing provider object!
    var previousErrorHandler = this.socket.onerror;
    var previousOpenHandler = this.socket.onopen;
    var previousCloseHandler = this.socket.onclose;
    var previousMessageHandler = this.socket.onmessage;
    if (this.socket.addEventListener) {
      this.socket.addEventListener('error', errorHandler);
      this.socket.addEventListener('open', openHandler);
      this.socket.addEventListener('close', closeHandler);
      this.socket.addEventListener('message', messageHandler);
    }
    else {
      this.socket.onerror = function (evt) {
        if (previousErrorHandler) {
          previousErrorHandler(evt);
        }
      };
      this.socket.onopen = function (evt) {
        openHandler();
        if (previousOpenHandler) {
          previousOpenHandler(evt);
        }
      };
      this.socket.onclose = function (evt) {
        closeHandler();
        if (previousCloseHandler) {
          previousCloseHandler(evt);
        }
      };
      this.socket.onmessage = function (evt) {
        var propagate = messageHandler(evt);
        if (propagate && previousMessageHandler) {
          previousMessageHandler(evt);
        }
      };
    }


    /**
     * Helper function to send a "sync" request to the socket server
     */
    var sendSyncRequest = function () {

      attemptId = url + '#' + Date.now();
      self.socket.send(Utils.stringify({
        type: 'sync',
        id: attemptId,
        client: {
          sent: Date.now()
        }
      }));
      attemptTimeout = null;

      timeoutTimeout = setTimeout(function () {
        attempts += 1;
        timeoutTimeout = null;

        if (attempts >= maxAttempts) {
          if (self.readyState === 'connecting') {
            initialize();
          }
          else {
            roundtripThreshold = Math.ceil(roundtripThreshold * 1.20);

          }
          scheduleNextBatch();
        }
        else {
          scheduleNextAttempt();
        }
      }, roundtripThreshold);
    };


    /**
     * Helper function to schedule the next sync attempt
     *
     * @function
     */
    var scheduleNextAttempt = function () {
      var interval = (self.readyState === 'connecting') ?
        initialInterval :
        attemptInterval;
      if (timeoutTimeout) {
        clearTimeout(timeoutTimeout);
        timeoutTimeout = null;
      }
      if (attemptTimeout) {
        clearTimeout(attemptTimeout);
        attemptTimeout = null;
      }
      attemptTimeout = setTimeout(sendSyncRequest, interval);
    };


    /**
     * Helper function to schedule the next batch of sync attempts
     *
     * @function
     */
    var scheduleNextBatch = function () {
      if (timeoutTimeout) {
        clearTimeout(timeoutTimeout);
        timeoutTimeout = null;
      }
      if (attemptTimeout) {
        clearTimeout(attemptTimeout);
        attemptTimeout = null;
      }
      attempts = 0;
      attemptTimeout = setTimeout(sendSyncRequest, batchInterval);
    };


    /**
     * Helper function that computes the initial skew based on the
     * sync messages received so far and adjust the roundtrip threshold
     * accordingly.
     *
     * The function also sets the clock's ready state to "open".
     *
     * @function
     */
    var initialize = function () {
      var msg = null;
      var skew = null;
      var received = 0;
      var pos = 0;



      // Sort messages received according to round trip
      initialSyncMessages.sort(function (a, b) {
        return a.roundtrip - b.roundtrip;
      });

      // Use the first message to compute the initial skew
      if (initialSyncMessages.length > 0) {
        msg = initialSyncMessages[0].msg;
        received = initialSyncMessages[0].received;
        roundtripMin = initialSyncMessages[0].roundtrip;

        if (Utils.isNumber(msg.delta)) {
          self.delta = msg.delta;
        }

        skew = ((msg.server.sent + msg.server.received) -
            (msg.client.sent + received)) / 2.0;
        if (Math.abs(skew - self.skew) < 1) {
          skew = self.skew;
        }
        else {
          skew = Math.round(skew);
        }
        self.skew = skew;
      }

      // Adjust the threshold to preserve at least half of the sync messages
      // that should have been received.
      pos = Math.ceil(initialAttempts / 2) - 1;
      if (pos >= initialSyncMessages.length) {
        pos = initialSyncMessages.length - 1;
      }
      if (pos >= 0) {
        roundtripThreshold = initialSyncMessages[pos].roundtrip;
      }

      // Ensure the threshold is not too low compared to the
      // known minimum roundtrip duration
      if (roundtripThreshold < roundtripMin * 1.30) {
        roundtripThreshold = Math.ceil(roundtripMin * 1.30);
      }
      if (roundtripThreshold < minRoundtripThreshold) {
        roundtripThreshold = minRoundtripThreshold;
      }

      // Clock is ready

      self.readyState = 'open';
      initialSyncMessages = [];
    };


    /**
     * Method that stops the background synchronization
     */
    this.stopSync = function () {
      if (attemptTimeout) {
        clearTimeout(attemptTimeout);
        attemptTimeout = null;
      }
      if (timeoutTimeout) {
        clearTimeout(timeoutTimeout);
        timeoutTimeout = null;
      }
    };


  };
  SocketSyncClock.prototype = new AbstractSyncClock();


  /**
   * Stops synchronizing the clock with the reference clock
   *
   * Note that a closed synchronized clock object cannot be re-used.
   *
   * @function
   */
  SocketSyncClock.prototype.close = function () {
    if ((this.readyState === 'closing') ||
        (this.readyState === 'closed')) {
      return;
    }
    this.readyState = 'closing';
    this.stopSync();
    this.socket = null;
    this.readyState = 'closed';
  };

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */


  var W3CWebSocket = null;

  W3CWebSocket = window.WebSocket;
  var OPEN = 1;
  var CLOSED = 3;


  /**
   * Creates a timing provider
   *
   * @class
   * @param {String} url The Web socket URL of the remote timing object
   * @param {WebSocket} socket An opened Web socket to use as communication
   *   channel. The parameter is optional, the object will create the
   *   communication channel if not given.
   * @param {AbstractSyncClock} clock A clock to use for synchronization with
   *   the online server clock. If not given, a clock that uses the underlying
   *   WebSocket will be created and used.
   */
  var SocketTimingProvider = function (url, socket, clock) {
    var self = this;

    /**
     * The URL of the online object, it is used as
     * identifier in exchanges with the backend server
     */
    this.url = url;

    /**
     * The current vector as returned by the server.
     *
     * Updating the property through the setter automatically updates
     * the exposed vector as well, converting the server timestamp into
     * a local timestamp based on the underlying synchronized clock's readings
     */
    var serverVector = null;
    Object.defineProperty(this, 'serverVector', {
      get: function () {
        return serverVector;
      },
      set: function (vector) {
        var now = Date.now();
        serverVector = vector;
        self.vector = new StateVector({
          position: vector.position,
          velocity: vector.velocity,
          acceleration: vector.acceleration,
          timestamp: vector.timestamp + (now - self.clock.getTime(now)) / 1000.0
        });
      }
    });

    /**
     * List of "change" events already received from the server but
     * whose estimated timestamps lie in the future
     */
    var pendingChanges = [];

    /**
     * The ID of the timeout used to trigger the first of the remaining
     * pending change events to process
     */
    var pendingTimeoutId = null;

    /**
     * Helper function that schedules the propagation of the next pending
     * change. Note that the function calls itself as long as there are
     * pending changes to schedule.
     *
     * The function should be called whenever the synchronized clock reports
     * changes on its skew evaluation, since that affects the time at which
     * pending changes need to be executed.
     */
    var scheduleNextPendingChange = function () {
      stopSchedulingPendingChanges();
      if (pendingChanges.length === 0) {
        return;
      }

      var now = Date.now();
      var vector = pendingChanges[0];
      var localTimestamp = (vector.timestamp * 1000.0) +
        now - self.clock.getTime(now);

      var applyNextPendingChange = function () {
        // Since we cannot control when this function runs precisely,
        // note we may have to skip over the first few changes. We'll
        // only trigger the change that is closest to now

        var now = Date.now();
        var vector = pendingChanges.shift();
        var nextVector = null;
        var localTimestamp = 0.0;
        while (pendingChanges.length > 0) {
          nextVector = pendingChanges[0];
          localTimestamp = nextVector.timestamp * 1000.0 +
            now - self.clock.getTime(now);
          if (localTimestamp > now) {
            break;
          }
          vector = pendingChanges.shift();
        }

        self.serverVector = vector;
        scheduleNextPendingChange();
      };

      if (localTimestamp > now) {
        pendingTimeoutId = setTimeout(
          applyNextPendingChange,
          localTimestamp - now);
      }
      else {
        applyNextPendingChange();
      }
    };


    /**
     * Helper function that stops the pending changes scheduler
     *
     * @function
     */
    var stopSchedulingPendingChanges = function () {

      if (pendingTimeoutId) {
        clearTimeout(pendingTimeoutId);
        pendingTimeoutId = null;
      }
    };


    /**
     * Helper function that processes the "info" message from the
     * socket server when the clock is ready.
     *
     * @function
     */
    var processInfoWhenPossible = function (msg) {
      // This should really just happen during initialization
      if (self.readyState !== 'connecting') {

        return;
      }

      // If clock is not yet ready, schedule processing for when it is
      // (note that this function should only really be called once but
      // not a big deal if we receive more than one info message from the
      // server)
      if (self.clock.readyState !== 'open') {
        self.clock.addEventListener('readystatechange', function () {
          if (self.clock.readyState === 'open') {
            processInfoWhenPossible(msg);
          }
        });
        return;
      }

      if (self.clock.delta) {
        // The info will be applied right away, but if the server imposes
        // some delta to all clients (to improve synchronization), it
        // should be applied to the timestamp received.
        msg.vector.timestamp -= (self.clock.delta / 1000.0);
      }
      self.serverVector = new StateVector(msg.vector);

      // TODO: set the range as well when feature is implemented

      // The timing provider object should now be fully operational
      self.readyState = 'open';
    };


    // Initialize the base class with default data
    AbstractTimingProvider.call(this);

    // Connect to the Web socket
    if (socket) {
      this.socket = socket;
      this.socketProvided = true;
    }
    else {
      this.socket = new W3CWebSocket(url, 'echo-protocol');
      this.socketProvided = false;
    }

    this.socket.onerror = function (err) {
      console.log("error",err);
      // TODO: implement a connection recovery mechanism
    };

    this.socket.onopen = function () {
	     console.warn("socket open");
      self.socket.send(Utils.stringify({
        type: 'info',
        id: url
      }));
    };

    this.socket.onclose = function() {
     console.warn("socket closed");
      self.close();
    };
    window.onbeforeunload = function() {
      self.onclose = function () {}; // disable onclose handler first
      self.close();
    };

    this.socket.onmessage = function (evt) {
      var msg = null;
      var vector = null;
      var now = Date.now();
      var localTimestamp = 0;

      if (typeof evt.data === 'string') {
        try {
          msg = JSON.parse(evt.data) || {};
        }
        catch (err) {

          return;
        }

        if (msg.id !== url) {

          return;
        }

        switch (msg.type) {
        case 'info':
          // Info received from the socket server but note that the clock may
          // not yet be synchronized with that of the server, let's wait for
          // that.

          processInfoWhenPossible(msg);
          break;

        case 'change':
          if (self.readyState !== 'open') {

            return;
          }

          // TODO: not sure what to do when the server sends an update with
          // a timestamp that lies in the past of the current vector we have,
          // ignoring for now
          if (msg.vector.timestamp < self.serverVector.timestamp) {

            return;
          }

          // Create a new Media state vector from the one received
          vector = new StateVector(msg.vector);

          // Determine whether the change event is to be applied now or to be
          // queued up for later
          localTimestamp = vector.timestamp * 1000.0 +
              now - self.clock.getTime(now);
          if (localTimestamp < now) {

            self.serverVector = vector;
          }
          else {

            pendingChanges.push(vector);
            pendingChanges.sort(function (a, b) {
              return a.timestamp - b.timestamp;
            });
            scheduleNextPendingChange();
          }
          break;
        }
      }
    };

    // Create the clock
    if (clock) {
      this.clock = clock;
    }
    else {
      this.clock = new SocketSyncClock(url, this.socket);
      this.clock.addEventListener('change', function () {
        if (self.readyState !== 'open') {
          return;
        }

        scheduleNextPendingChange();
      });
    }




    // Check the initial state of the socket connection
    if (this.socket.readyState === OPEN) {

      this.socket.send(Utils.stringify({
        type: 'info',
        id: url
      }));
    }
    else if (this.socket.readyState === CLOSED) {

      self.close();
    }

  };
  SocketTimingProvider.prototype = new AbstractTimingProvider();


  /**
   * Sends an update command to the online timing service.
   *
   * @function
   * @param {Object} vector The new motion vector
   * @param {Number} vector.position The new motion position.
   *   If null, the position at the current time is used.
   * @param {Number} vector.velocity The new velocity.
   *   If null, the velocity at the current time is used.
   * @param {Number} vector.acceleration The new acceleration.
   *   If null, the acceleration at the current time is used.
   * @returns {Promise} The promise to get an updated StateVector that
   *   represents the updated motion on the server once the update command
   *   has been processed by the server.
   *   The promise is rejected if the connection with the online timing service
   *   is not possible for some reason (no connection, timing object on the
   *   server was deleted, timeout, permission issue).
   */
  SocketTimingProvider.prototype.update = function (vector) {
    vector = vector || {};


    if (this.readyState !== 'open') {
      return new Promise(function (resolve, reject) {

        reject(new Error('Underlying socket was closed'));
      });
    }
    this.socket.send(Utils.stringify({
      type: 'update',
      id: this.url,
      vector: vector
    }));

    return new Promise(function (resolve, reject) {
      // TODO: To be able to resolve the promise, we would need to know
      // when the server has received and processed the request. This
      // requires an ack that does not yet exist. Also, should the promise
      // only be resolved when the update is actually done (which may take
      // place after some time and may actually not take place at all?)
      resolve();
    });
  };


  /**
   * Closes the timing provider object, releasing any resource that the
   * object might use.
   *
   * Note that a closed timing provider object cannot be re-used.
   *
   * @function
   */
  SocketTimingProvider.prototype.close = function () {
    if ((this.readyState === 'closing') ||
        (this.readyState === 'closed')) {
      return;
    }
    this.readyState = 'closing';
    this.clock.close();
    if (!this.socketProvided && (this.socket.readyState !== CLOSED)) {
      this.socket.close();
    }
    this.socket = null;
    this.readyState = 'closed';
  };

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */


  /**
   * Constructor of a timing media controller
   *
   * @class
   * @param {TimingObject} timing The timing object attached to the controller
   * @param {Object} options controller settings
   */
  var TimingMediaController = function (timing, options) {
    var self = this;
    options = options || {};

    if (!timing || (!timing instanceof TimingObject)) {
      throw new Error('No timing object provided');
    }

    /**
     * The timing media controller's internal settings
     */
    var settings = {
      // Media elements are considered in sync with the timing object if the
      // difference between the position they report and the position of the
      // timing object is below that threshold (in seconds).
      minDiff: options.minDiff || 0.040,

      // Maximum delay for catching up (in seconds).
      // If the code cannot meet the maxDelay constraint,
      // it will have the media element directly seek to the right position.
      maxDelay: options.maxDelay || 0.8,

      // Amortization period (in seconds).
      // The amortization period is used when adjustments are made to
      // the playback rate of the video.
      amortPeriod: options.amortPeriod || 1.0
    };


    /**
     * The list of Media elements controlled by this timing media controller.
     *
     * For each media element, the controller maintains a state vector
     * representation of the element's position and velocity, a drift rate
     * to adjust the playback rate, whether we asked the media element to
     * seek or not, and whether there is an amortization period running for
     * the element
     *
     * {
     *   vector: {},
     *   driftRate: 0.0,
     *   seeked: false,
     *   amortization: false,
     *   element: {}
     * }
     */
    var controlledElements = [];


    /**
     * The timing object's state vector last time we checked it.
     * This variable is used in particular at the end of the amortization
     * period to compute the media element's drift rate
     */
    var timingVector = null;


    /**
     * Pointer to the amortization period timeout.
     * The controller uses only one amortization period for all media elements
     * under control.
     */
    var amortTimeout = null;


    Object.defineProperties(this, {
      /**
       * Report the state of the underlying timing object
       *
       * TODO: should that also take into account the state of the controlled
       * elements? Hard to find a proper definition though
       */
      readyState: {
        get: function () {
          return timingProvider.readyState;
        }
      },


      /**
       * The currentTime attribute returns the position that all controlled
       * media elements should be at, in other words the position of the
       * timing media controller when this method is called.
       *
       * On setting, the timing object's state vector is updated with the
       * provided value, which will (asynchronously) affect all controlled
       * media elements.
       *
       * Note that getting "currentTime" right after setting it may not return
       * the value that was just set.
       */
      currentTime: {
        get: function () {
          return timing.currentPosition;
        },
        set: function (value) {
          timing.update(value, null);
        }
      },


      /**
       * The current playback rate of the controller (controlled media elements
       * may have a slightly different playback rate since the role of the
       * controller is precisely to adjust their playback rate to ensure they
       * keep up with the controller's position.
       *
       * On setting, the timing object's state vector is updated with the
       * provided value, which will (asynchronously) affect all controlled
       * media elements.
       *
       * Note that getting "playbackRate" right after setting it may not return
       * the value that was just set.
       */
      playbackRate: {
        get: function () {
          return timing.currentVelocity;
        },
        set: function (value) {
          timing.update(null, value);
        }
      }
    });


    /**
     * Start playing the controlled elements
     *
     * @function
     */
    this.play = function () {
      timing.update(null, 1.0,null);
    };


    /**
     * Pause playback
     *
     * @function
     */
    this.pause = function () {
      timing.update(null, 0.0,null);

    };
    this.reset = function (vel) {
      timing.update(0.0,vel,null);
    };
    this.seek = function (time,vel) {
      timing.update(time, vel,null);
    };
    this.incPlayBacRate = function (){
      this.playbackRate+=0.3;
    };
    this.decPlayBacRate = function(){
      this.playbackRate-=0.3;
    };
    /**
     * Add a media element to the list of elements controlled by this
     * controller
     *
     * @function
     * @param {MediaElement} element The media element to associate with the
     *  controller.
     */
    this.addMediaElement = function (element,offset) {
      var found = false;
    if (element) {

      console.log("OFFSET",offset/1000);
      element._offset = offset/1000;
      controlledElements.forEach(function (wrappedEl) {
        if (wrappedEl.element === element) {

          found = true;
        }
      });
      if (found) {
        return;
      }
      controlledElements.push({
        element: element,
        vector: null,
        driftRate: 0.0,
        seeked: false,
        amortization: false
      });
      }
    };
    this.removeMediaElement = function (element) {
      controlledElements = controlledElements.filter(function (wrappedEl) {
        if (wrappedEl.element === element) {
            return false;
        }
        else return true;
      });


    };

    /**
     * Helper function that cancels a running amortization period
     */
    var cancelAmortizationPeriod = function () {
      if (!amortTimeout) {
        return;
      }
      clearTimeout(amortTimeout);
      amortTimeout = null;
      controlledElements.forEach(function (wrappedEl) {
        wrappedEl.amortization = false;
        wrappedEl.seeked = false;
      });
    };


    /**
     * Helper function to stop the playback adjustment once the amortization
     * period is over.
     */
    var stopAmortizationPeriod = function () {
      var now = Date.now() / 1000.0;
      amortTimeout = null;

      controlledElements.forEach(function (wrappedEl) {
        // Nothing to do if element was not part of amortization period
        if (!wrappedEl.amortization) {
          return;
        }
        wrappedEl.amortization = false;

        // Don't adjust playback rate and drift rate if video was seeked
        // or if element was not part of that amortization period.
        if (wrappedEl.seeked) {

          wrappedEl.seeked = false;
          return;
        }

        // Compute the difference between the position the video should be and
        // the position it is reported to be at.
        wrappedEl.vector.computePosition(now) - wrappedEl.element.currentTime;

        // Compute the new video drift rate
        wrappedEl.driftRate = 0.002;

        // Switch back to the current vector's velocity,
        // adjusted with the newly computed drift rate
        wrappedEl.vector.velocity = timingVector.velocity + wrappedEl.driftRate;
        wrappedEl.element.playbackRate = wrappedEl.vector.velocity;


      });
    };



    /**
     * React to timing object's changes, harnessing the controlled
     * elements to align them with the timing object's position and velocity
     */
    var onTimingChange = function () {
      cancelAmortizationPeriod();
      controlElements();
    };


    /**
     * Ensure media elements are aligned with the current timing object's
     * state vector
     */
    var controlElements = function () {
      // Do not adjust anything during an amortization period
      if (amortTimeout) {
        return;
      }

      // Get new readings from Timing object
      timingVector = timing.query();

      controlledElements.forEach(controlElement);

      var amortNeeded = false;
      controlledElements.forEach(function (wrappedEl) {
        if (wrappedEl.amortization) {
          amortNeeded = true;
        }
      });

      if (amortNeeded) {

        amortTimeout = setTimeout(stopAmortizationPeriod, settings.amortPeriod * 1000);
      }

      // Queue a task to fire a simple event named "timeupdate"
      setTimeout(function () {
        self.dispatchEvent({
          type: 'timeupdate'
        }, 0);
      });
    };


    /**
     * Ensure the given media element (wrapped in info structure) is aligned
     * with the current timing object's state vector
     */
    var controlElement = function (wrappedEl) {
      var element = wrappedEl.element;
      var diff = 0.0;
      var futurePos = 0.0;
    //  console.log("driftRate",wrappedEl.driftRate);

      if ((timingVector.velocity === 0.0) &&
          (timingVector.acceleration === 0.0)) {
        //logger.info('stop element and seek to right position');
        element.pause();
        element.currentTime=timingVector.position;
        wrappedEl.vector = new StateVector(timingVector);
      }
      else if (element.paused ) {
      //  logger.info('play video');
        wrappedEl.vector = new StateVector({
          position: timingVector.position,
          velocity: timingVector.velocity + wrappedEl.driftRate,
          acceleration: 0.0,
          timestamp: timingVector.timestamp
        });

        wrappedEl.seeked = true;
        wrappedEl.amortization = true;
        element.currentTime = wrappedEl.vector.position-element._offset;
        element.playbackRate = wrappedEl.vector.velocity;
        element.play();


      }
      else {
        var vel = wrappedEl.vector ? wrappedEl.vector.velocity: 0.95;
        wrappedEl.vector = new StateVector({
          position: element.currentTime,
          velocity:vel,
        });
        diff = timingVector.position - wrappedEl.vector.position - element._offset;
      //  console.log("diff",diff,"vel",wrappedEl.vector.velocity,"timing vel",timingVector.velocity,"offset",element._offset);
        if (Math.abs(diff) < settings.minDiff) ;
        else if (Math.abs(diff) > settings.maxDelay) {
          console.log("DIFF",diff);
          wrappedEl.vector.position = timingVector.position;
          wrappedEl.vector.velocity = timingVector.velocity + wrappedEl.driftRate;
          wrappedEl.seeked = true;
          wrappedEl.amortization = false;
          element.currentTime = wrappedEl.vector.position-element._offset;
          element.playbackRate = wrappedEl.vector.velocity;
        }
        else {
          futurePos = timingVector.computePosition(
            timingVector.timestamp + settings.amortPeriod);
          wrappedEl.vector.velocity =
            wrappedEl.driftRate +
            (futurePos - wrappedEl.vector.position) / settings.amortPeriod;
          wrappedEl.amortization = false;
          element.playbackRate=wrappedEl.vector.velocity;
        //  logger.info('new playbackrate={}', wrappedEl.vector.velocity);
        }
      }

    };


    /**********************************************************************
    Listen to the timing object
    **********************************************************************/

    timing.addEventListener('timeupdate', controlElements);
    timing.addEventListener('change', onTimingChange);


    timing.addEventListener('readystatechange', function (evt) {
      self.dispatchEvent(evt);
    });



  };


  // TimingMediaController implements EventTarget
  TimingMediaController.prototype.addEventListener = EventTarget$1().addEventListener;
  TimingMediaController.prototype.removeEventListener = EventTarget$1().removeEventListener;
  TimingMediaController.prototype.dispatchEvent = EventTarget$1().dispatchEvent;

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
class ObjectSync {
  constructor(){
    this.currentTime=0.0;
    this.playbackRate=1.0;
    this.paused=true;
    this.offset=0;
  }

  pause (){
    // TODO pause
    console.log("TODO");
  }
  play (){
    // TODO play
    console.log("TODO");
  }
  seekTo (time){
    // TODO play
    console.log("TODO");
  }
  setPlaybackRate(rate){
    this.playbackRate = rate;
  }
  incPlayBacRate(){
    this.playbackRate+=0.3;
  }
  decPlayBacRate(){
    this.playbackRate-=0.3;
  }
}

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */

    var Motion = function(url,channel){
      var controller = undefined;
      var timing = undefined;
      /**********************************************************************
      Create the timing object associated with the online timing service
      **********************************************************************/
      var start = function (){
        let domain = Utils.getHostName(url);
        var timingProvider = new SocketTimingProvider('wss://'+domain+':8080/'+(channel || 'test'));

	  timing = new TimingObject();
          timing.srcObject = timingProvider;
          controller = new TimingMediaController(timing);

        };
        var addMedia = function(media,offset){
          controller.addMediaElement(media,offset);
          controller.addEventListener('readystatechange', function (evt) {

            if (evt.value === 'open') {
              API.dispatchEvent({type:'motionReady',value:evt.target.currentTime});
            }
          });

          return controller;
        };
        var removeMedia = function(media){
          controller.removeMediaElement(media);
        };
        /**********************************************************************
        Enable commands when timing object is connected
        **********************************************************************/
        var getController = function (){
          return controller;
        };
        var getTiming = function (){
          return timing;
        };

         var API = {
          addObject:addMedia,
          removeObject:removeMedia,
          getController:getController,
          start:start,
          ready:false,
          timing:getTiming,
          live:false,
          ObjectSync:ObjectSync,
          initTime:0
        };


        API.removeEventListener = EventTarget$1().removeEventListener;
        API.addEventListener = EventTarget$1().addEventListener;
        API.dispatchEvent = EventTarget$1().dispatchEvent;
        return API;
      };

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
class User {

  constructor(agentid,name="",profile,capacities){
     this.agentid = agentid;
     this.name = name;
     this.profile = profile;
     this.capacities = capacities;
  }


}

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */

var log$4 =  Logger.getLogger('UI');

function UI (app) {
  var self = {};
  if (typeof document !== 'undefined')
  self.components = document.querySelector('orkestra-ui')?document.querySelector('orkestra-ui').children:[];
  else self.components =[];
  self.callbacks = [];
  self.old = [];
  self.uiRender = function (evt,eventType){
      switch (eventType){
            case "appCtx":{
              if (evt.key.indexOf("layout")!=-1){
                log$4.info("changing layout");
                if (evt.value){
                    if (evt.value.applyTo && (evt.value.applyTo=="all" || evt.value.applyTo==app.getMyAgentId())){
                    if (evt.value.status ==="off") self.useLayout(self.callbacks[0].name,evt);
                    else self.useLayout(evt.value.layout,evt);
                  }
                }
                 else if(evt.data) {
                  if (evt.data.value.applyTo && (evt.data.value.applyTo=="all" || evt.data.value.applyTo==app.getMyAgentId()))
                   {
                    if (evt.data.value.status ==="off") self.useLayout(self.callbacks[0].name,evt);
                    else self.useLayout(evt.data.value.layout,evt);
                  }
                 }
              }
              else {
                self.useLayout(self.activeLayout,evt);
              }
              break;
            }
            case "userCtx":{
              // runLayout(evt);
               if (evt.data.key && evt.data.value!=="undefined" && evt.data.key ==="userData"){
                   if ("layout" in evt.data.value && evt.data.agentid === app.getMyAgentId()){
                     if (evt.data.value.layout.indexOf("FullScreen")!=-1){
                        let cmp = evt.data.value.layout.split('_')[1];
                        evt.cmp = cmp;
                        let type = evt.data.value.layout.split('_')[2];
                        let tnpLayout = self.callbacks[0].name;
                        if (type==="off") tnpLayout = self.callbacks[0].name;
                        else  tnpLayout = "FullScreen";
                        self.useLayout(tnpLayout,evt);
                     }
                     else  self.useLayout(evt.data.value.layout,evt);

                 }
               }
               if (evt.data.key && evt.data.key ==="componentsStatus"){
                  if (evt.data.agentid === app.getMyAgentId() && evt.data.from !==app.getMyAgentId()){
                       var diff = Obj.getObjectDiff(evt.data.value,self.old);
                       log$4.debug(diff);
                        self.old = evt.data.value;
                       if (typeof diff !="undefined" && Object.keys(diff).length ==1 && diff.componentsStatus){
                         let usrCmdCmps = Object.entries(diff.componentsStatus).filter((obj)=>{
                                if ("usrCmd" in obj[1]) return true;
                                return false;
                         });
                         if (usrCmdCmps.length==0) return;
                          let compentIdx = usrCmdCmps[0][0];
                          let cmdIdx = Object.keys(diff.componentsStatus[compentIdx].usrCmd)[0];
                          log$4.debug("CHANGE",evt.data.value.componentsStatus[compentIdx].usrCmd[cmdIdx]);
                          let diff2 = evt.data.value.componentsStatus[compentIdx].usrCmd[cmdIdx];
                          if( !diff2) return;
                          let comp = document.querySelector("#"+diff2.cmp);
                          if (comp && comp.userCmdEvents){
                            comp.userCmdEvents ({cmd:diff2.cmd,value:diff2.value});
                          }
                          else
                           console.warn("Webcomponent does not implements userCmdEvents function");
                       }
                       /* first time the diff is all object */
                       if (typeof diff !="undefined" && Object.keys(diff).length >1 && diff.componentsStatus){
                          if (Array.isArray(diff.componentsStatus)===false) diff.componentsStatus = [diff.componentsStatus];
                          let cmp = diff.componentsStatus.find((x)=>{
                                if (x.usrCmd) return true;
                          });
                          if (!cmp) return;
                          let diff2 = cmp.usrCmd[0];
                          if( !diff2) return;
                          let comp = document.querySelector("#"+diff2.cmp);
                          if (comp && comp.userCmdEvents){
                            comp.userCmdEvents ({cmd:diff2.cmd,value:diff2.value});
                          }
                          else
                           console.warn("Webcomponent does not implements userCmdEvents function");
                       }
                    // self.old = evt.data.value;
                  }
               }
               runLayout(evt);
              break;
            }
            case "timeupdate":
            case "timeline":{
               
                runLayout(evt);


            break;
            }
      }
  };

  var runLayout = function (chg){
    // clean style before
    unloadOldLayout();
    if (typeof self.activeLayout ==="object"){
	    let time = app.sequencer.currentTime;
      let layoutname = self.activeLayout[time];
      //let order = self.activeLayout[time];
	    let _layout = self.callbacks.find((layout)=>{ return layout.name === layoutname});
    	    _layout.callback(chg,self.components,app,_layout.options);
    }
    else
	    if (self.activeLayout){
	      let _layout = self.callbacks.find((layout)=>{ return layout.name === self.activeLayout});
	      if (_layout) _layout.callback(chg,self.components,app,_layout.options);
	    }
	    else
	    	self.callbacks.forEach((cb)=>{
		      cb.callback(chg,self.components,app,cb.options);
    		    });
  };
  var unloadOldLayout = function(){
      if (self.oldLayout === self.activeLayout && typeof self.activeLayout!=="object") return;
      let status = [];
      // get status of display, a plugin code may changed it, to ensure status.
      Array.from(self.components).forEach((c)=>{
        let state = c.style.display;
        status.push({component:c,status:state});
     });
    if (typeof self.oldLayout ==="object"){
	    let time = app.sequencer.currentTime;
	    let layoutname = self.oldLayout[time];
	    let _layout = self.callbacks.find((layout)=>{ return layout.name === layoutname});
          _layout.unload(self.components);
          status.forEach((x)=>{
              x.component.style.display = x.status;
          });
    }
    else
	    if (self.oldLayout){
	      let _layout = self.callbacks.find((layout)=>{ return layout.name === self.oldLayout});
	      if (_layout) {
          _layout.unload(self.components);
          status.forEach((x)=>{
            x.component.style.display = x.status;
        });
        }
	    }
	    else {
	    	self.callbacks.forEach((cb)=>{
		      cb.unload(self.components);
          });
        status.forEach((x)=>{
            x.component.style.display = x.status;
        });
      }
  };
  self.subscribe = function (plugin,options){
    let _plugin = plugin();
    self.callbacks.push({name:plugin.name,callback:_plugin.render,unload:_plugin.unload,options:options});
    log$4.info("registring UI",plugin.name);
  };
  self.unsubscribe = function (plugin){
    // TODO
    log$4.info("unregistring UI",plugin.name);
  };
  self.useLayout = function (name,evt){
     self.oldLayout = self.activeLayout;
     self.activeLayout = name;
     runLayout(evt);
  };
  self.getUsingLayout = function(){
    return self.activeLayout;
  };
  return {
    "subscribe":self.subscribe,
    "components":self.components,
    "layouts":self.callbacks,
    "useLayout":self.useLayout,
    "uiRender":self.uiRender,
    "getUsingLayout":self.getUsingLayout


  }
}

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */


var log$3 ;

const EVENT = {
  AGENT_CHANGE: 'agent_change',
  AGENT_LEFT: 'agent_left',
  AGENT_JOIN: 'agent_join',
  CAP_CHANGE: 'capability_change',
  TIMELINE_EVENT: 'timeline_change'
};

class Orkestra {

  constructor(options) {
    this.options = options;
    if (options.debug && options.debug !== false) {
     
      log$3 = Logger.getLogger('Orkestra');
      Logger.setLogLevel(log$3.levels.TRACE,'Orkestra');
      if (options.debug=="all") this.addDebugger();
    }
    else {
      log$3 = Logger.getLogger('Orkestra');
      Logger.setLogLevel(log$3.levels.SILENT,'Orkestra');
      
    }
    this.userObserver = new Subject();
    this.userPrivObserver = new Subject();
    this.timeObserver = new Subject();
    this.appObserver = new Subject();
    this.readyObserver = new Subject();
    this.readyPrivObserver = new Subject();
    this.userPrivObservable = new Observable((observer) => { this.userPrivObserver.subscribe(observer); });
    this.userObservable = new Observable((observer) => { this.userObserver.subscribe(observer); });
    this.appObservable = new Observable((observer) => { this.appObserver.subscribe(observer); });
    this.timerObservable = new Observable((observer) => { this.timeObserver.subscribe(observer); });
    this.readyObservable = new Observable((observer) => { this.readyObserver = observer; });
    this.readyPrivObservable = new Observable((observer) => { this.readyPrivObserver = observer; });
    this.serviceObservable = new Observable((observer) => { this.serviceObserver = observer; });
    options.agentid = options.agentid ? options.agentid : Hash.genRanHex(8);
    this.master = options.master;
    this.users = new Map();
    this.users_priv = new Map();
    this.appCtx = null;
    this.ruleEngineEnabled = false;
    this.privateChannel = options.privateChannel;
    this.appData = new Object();
    this._ui = UI(this);
    this.rulesEnabled = false;
    this.eventLogs = [];
    this.eventLogs2 = [];
    this.servicesSubs = [];
    this.transitionsCbs = [];
    // Whether if private channel enable not listen for global user context changes
    if (this.privateChannel === true) {
      let agentid = options.agentid || -1;
      let user = new User(agentid, "me", options.profile || "slave", {});
      this.users_priv.set(user.name, user);
    }
    if (options.agentid == "debugger") {
      this.rulesEnabled = false;
      this.debugger = {};
      this.debugger.agentid = "debugger";

    }
    else
      if (this.master === true) {
        let agentid = options.agentid || -1;
        let admin = new User(agentid, "me", options.profile || "master", {});
        this.users.set(admin.name, admin);
      }
      else {
        if (this.master === undefined) {
          let agentid = options.agentid || -1;
          let user = new User(agentid, "me", options.profile || "broadcast", {});
          this.users.set(user.name, user);
        }
        else {
          let agentid = options.agentid || -1;
          let user = new User(agentid, "me", options.profile || "slave", {});
          this.users.set(user.name, user);

        }
      }

    if (options.url) {
      this.mappServ = MappingService(options.url, { maxTimeout: 8000 });
      this.privMappServ = MappingService(options.url, { maxTimeout: 8000 });
    }
    else
      this.mappServ = MappingService({ maxTimeout: 8000 });
    this.setPublicConnection(options);
    if (this.privateChannel === true)
      this.setPrivateConnection(options);
   

  }
  onReady(){
    return this.readyObservable;
  }
  setPublicConnection(options) {
    if (options.channel ==="") return;
    this.mappServ.getGroupMapping(options.channel).then((channel) => {
      this.appCtx = ApplicationContext(channel.group, { autoPresence: true, autoClean: true, agentid: options.agentid });
      log$3.info("SharedState URL", channel.group);
      log$3.info("Public connection init", new Date());
      this.appCtx.onready.subscribe((e) => {

        log$3.info("Public connection ready", new Date());
        this.timerObservable.subscribe(evt => {
          this.rules && this.rules.forEach((r, i) => {
            if (!r.options.listenEvent || r.options.listenEvent.indexOf("timeline") != -1) {
              if (this.transitionsCbs.length>0){
                let trans= this.transitionsCbs.find((x)=>{if(x.enable===true) return true;});
                if (trans) trans.plugin.render();
                setTimeout(()=>{
                  let event_ = { type: EVENT.TIMELINE_EVENT, time: evt.target.currentTime, data: r.options.data };
                  this.resolveConflict([{ priority: 0, decision: r.cb(event_, this._ui.components, this.users, this.options) }]);
                  this._ui.uiRender(evt, "timeupdate");
                },500);  
              }
              else {
                  let event_ = { type: EVENT.TIMELINE_EVENT, time: evt.target.currentTime, data: r.options.data };
                  this.resolveConflict([{ priority: 0, decision: r.cb(event_, this._ui.components, this.users, this.options) }]);
                  this._ui.uiRender(evt, "timeupdate");
              }
            
            }
          });

        });
        this.userObservable.subscribe(evt => {
          let d = [];
          if ( this.isRuleEngineEnable() && this.getMyAgentId() == evt.data.agentid)  return;
          if (evt.data.key == "componentsStatus" && this.getMyAgentId() != evt.data.agentid) return;
          this.rules && this.rules.forEach((r, i) => {
            d.push({ priority: i, decision: r.cb(evt, this._ui.components,this.getUsersForRules(this.users), Obj.combine(this.options,r.options))});
          });
          if (evt.data.key == "componentsStatus"  && (evt.data.value.from == this.getMyAgentId())) this.resolveConflictLocally(d);
          else if (!evt.data.value || evt.data.value.from != "me") this.resolveConflict(d);
          this._ui.uiRender(evt, "userCtx");
        });
        this.appObservable.subscribe(evt => {
          var d = [];
          if (this.users.get("me")) {
            this.rules && this.rules.forEach((r, i) => {
              d.push({ priority: i, decision: r.cb(evt, this._ui.components, this.getUsersForRules(this.users), Obj.combine(this.options,r.options)) });
            });
            this.resolveConflict(d);
            this._ui.uiRender(evt, "appCtx");
          }
        });
        this.appCtx.on('agentchange', (chg) => {
          this.onAgentChange(chg);
        });
        setTimeout(() => {
          this.appCtx.me.load(ComponentsStatus());
          this.appCtx.me.load(UserProfile(this));
          this.appCtx.me.load(MasterSlaveProfile(this));
          this.appCtx.me.load(UserData());
          this.appCtx.me.load(Message(this));
          this.appCtx.me.load(DeviceProfile(options.url));

          setTimeout(() => {this.readyObserver.next({ status: 'ready' });},1000);
        }, 0);

        this.appCtx.keys().forEach((key) => {
          if (typeof options.listenAll == "undefined" || options.listenAll === true)
            this.appCtx.on(key, this.onAppAttrChange.bind(this));
            log$3.info("KEYS",key);
        });
        this.appCtx.keys().forEach(key => {
          if (typeof options.listenAll == "undefined" || options.listenAll === true) {
            this.appData[key] = this.appCtx.getItem(key);
            this.appObserver.next({ key: key, value: this.appData[key] });
          }
        });

        this.appCtx.on('default', this.onNewAppAttr.bind(this));
      });

    });
  }
  setPrivateConnection(options) {
    this.privGroup = URI.getUrlVar('group');
    if (!this.privGroup) {
      this.privGroup = URI.createToken();
    }
    this.privMappServ.getGroupMapping(options.channel + "_" + this.privGroup).then((channel) => {
      this.appCtxPriv = ApplicationContext(channel.group, { autoPresence: true, autoClean: true });
      console.info("SharedState URL", channel.group);
      console.info("Services connection init", new Date());
      this.appCtxPriv.onready.subscribe((ev) => {

        console.info("Private connection ready", new Date());

        this.userPrivObservable.subscribe(evt => {
          var d = [];
          this.rules && this.rules.forEach((r, i) => {
            d.push({ priority: i, decision: r.cb(evt, this._ui.components, this.users_priv, this.options) });
          });
          this.resolveConflict(d);
          this._ui.uiRender(evt, "userCtx");
        });
        //  this.readyPrivObserver.next({status:'ready'});

        this.appCtxPriv.on('agentchange', (chg) => {
          this.onAgentPrivChange(chg);
        });
        setTimeout(() => {
          this.appCtxPriv.me.load(DeviceProfile(options.url));
          this.appCtxPriv.me.load(MasterSlaveProfile(this));
          this.appCtxPriv.me.load(UserProfile(this));
        }, 500);




      });

    });
  }
  useServiceHub(name){
    return new Promise((resolve, reject) =>{
    this.serviceHubName = name;
    if (this.appCtxServices && this.appCtxServices.ready) {
       resolve();
       return;
    }
    this.privMappServ.getGroupMapping("services_" + name).then((channel) => {
      if (this.appCtxServices && this.appCtxServices.ready) {resolve();return;}      this.appCtxServices = ApplicationContext(channel.group, { autoPresence: true, autoClean: true });
      console.info("SharedState Service URL", channel.group);
      console.info("Services connection init", new Date());
      this.appCtxServices.onready.subscribe((ev) => {
        let serviceHub = this.appCtxServices.getItem(this.serviceHubName) || undefined;
        if (typeof serviceHub==="undefined") this.appCtxServices.setItem(this.serviceHubName,[]);
        this.appCtxServices.on(this.serviceHubName, this.onServiceHubChange.bind(this));
        setTimeout(()=>{this.onServiceHubChange({value:serviceHub,data:serviceHub});},1000);
        resolve();
        /** clear cache**/
        setInterval(()=>{
           if (this.users.size==1) {
            let serviceHub1 = this.appCtxServices.getItem(this.serviceHubName);
            let tnp = serviceHub.filter(s=>{
               if (s.indexOf(this.users.get("me").agentid)==-1) return true;
            });
            if (tnp.length>0) {
              serviceHub = serviceHub.filter(s=>{
                if (s.indexOf(this.users.get("me").agentid)!=-1) return true;
              });  
              this.appCtxServices.setItem(this.serviceHubName,serviceHub);
            }
            log$3.debug("serviceHub",serviceHub1);
           }
        },25000);
        });

      });
    })
  }
  onServiceHubChange(evt){
    log$3.debug("Service change",evt);
     evt.value.forEach((k)=>{
        if (this.servicesSubs.map(x=>{return x.name}).indexOf(k)!=-1) this.appCtxServices.on(k,this.onServiceChange.bind(this));
    });
    setTimeout(()=>{this.serviceObserver.next({event:"update",data:evt});},2500);
  }
  onServiceChange(evt){
    log$3.debug("data change",evt);
    this.servicesSubs.forEach((subs)=>{
        if (subs.name === evt.key){
          if (evt.value.io==subs.io) subs.cb(evt);
        }
    });

  }
  subscribeToService(name,cb,io){
    let exists = this.servicesSubs.find(x=>{
        if (x.name == name && io == x.io) return true;
    });
    if (!exists) this.servicesSubs.push({name:name,cb:cb,io:io});
   
  }
  publishService(name){
    let services = this.appCtxServices.getItem(this.serviceHubName) || [];
    if (services.indexOf(name) === -1) services.push(name);
    this.appCtxServices.setItem(this.serviceHubName,services);
  }
  unPublishService(name){
    let services = this.appCtxServices.getItem(this.serviceHubName) || [];
    services = services.filter((n)=>{
       return n !== name;
    });
    this.appCtxServices.setItem(this.serviceHubName,services);
  }
  cleanServiceHub(name){
    return this.appCtxServices.setItem(this.serviceHubName,[]);
  }
  sendServiceData(serviceName,data){
    this.appCtxServices.setItem(serviceName,data);
  }
  getServices(name){
    return this.appCtxServices.getItem(this.serviceHubName) || [];
  }
  getAgentKeys(key) {
    return this.users.get(key);
  }
  onAgentChange(chg) {

    if (!this.userObserver) {
      console.warn("There is not subscribed to receive agent change");
      return -1;
    }
    if (chg.agentid == "debugger") return;
    if (chg.agentContext) {
      if (!this.existsAgent(chg.agentid)) {

        if (this.appCtx.getAgents().self.agentid === chg.agentid) {
          let user = this.users.get("me");
          user.agentid = chg.agentid;
          user.context = chg.agentContext;
        }
        else {
          this.users.set(chg.agentid, new User(chg.agentid, chg.agentid, '', {}));
          let user = this.users.get(chg.agentid);
          user.context = chg.agentContext;
        }
        this.userObserver.next({ evt: EVENT.AGENT_JOIN, type: "agentChange", data: chg });
        this.eventLogs[chg.agentContext.agentid] = [];
      }

      if (chg.diff.keys.length > 0) {
        chg.diff.keys.forEach((key) => {
          if (this.eventLogs[chg.agentContext.agentid].indexOf(key) == -1) {
            this.enableInstrument([key], chg.agentContext, chg, this.master);
            this.userObserver.next({ evt: EVENT.AGENT_CHANGE, type: "agentChange", data: chg });
            this.eventLogs[chg.agentContext.agentid].push(key);
          }

        });
      }


    }
    else {
      this.users.delete(chg.agentid);
      this.userObserver.next({ evt: EVENT.AGENT_LEFT, data: chg });

    }

  }
  onAgentPrivChange(chg) {
    log$3.debug("Priv agent change", chg);
    if (!this.userPrivObserver) {
      console.warn("There is not subscribed to receive agent change");
      return -1;
    }
    if (chg.agentid == "debugger") return;
    if (chg.agentContext) {
      if (!this.existsAgent(chg.agentid, true)) {

        if (this.appCtxPriv.getAgents().self.agentid === chg.agentid) {
          let user = this.users_priv.get("me");
          user.agentid = chg.agentid;
          user.context = chg.agentContext;
        }
        else {
          this.users_priv.set(chg.agentid, new User(chg.agentid, chg.agentid, '', {}));
          let user = this.users_priv.get(chg.agentid);
          user.context = chg.agentContext;
        }
        this.userPrivObserver.next({ evt: EVENT.AGENT_JOIN, type: "agentChange", data: chg });

      }

      if (chg.diff.keys.length > 0) {


        this.enablePrivInstrument(chg.diff.keys, chg.agentContext, chg, this.master);
        this.userPrivObserver.next({ evt: EVENT.AGENT_CHANGE, type: "agentChange", data: chg });

      }


    }
    else {
      this.users_priv.delete(chg.agentid);
      this.userPrivObserver.next({ evt: EVENT.AGENT_LEFT, data: chg });

    }

  }
  onAppAttrChange(chg) {
    if (!this.appObserver) {
      log$3.warn("There is not subscribed to receive agent change");
      return -1;
    }
    this.appData[chg.key] = chg.value;
    this.appObserver.next({ type: "appAttrChange", key: chg.key, data: chg });
  }
  onNewAppAttr(chg) {
    if (this.appCtx.keys().indexOf(chg.key) === -1) this.subscribe(chg.key);
    this.onAppAttrChange(chg);
  }
  use(rule, options) {
    this.ruleEngineEnabled = true;
    this.rules = this.rules || [];
    this.rules.push({ name: rule.name, cb: rule(this), options: options });
  }
  ui(cb,options) {
    if (cb)
      this._ui.subscribe(cb,options);
    else return this._ui;
  }
  transitions(plugin){
    this.transitionsCbs.push({plugin:plugin,enable:true});
    return plugin;
  }
  removeTransition(name){
    this.transitionsCbs = this.transitionsCbs.filter((pg)=>{
       if (pg.plugin.name !== name) return true;
       return false;
    });
  }
  disableTransitions(){
      this.transitionsCbs.forEach((tr)=>{
          tr.enable = false;
      });
  }
  enableTransition(name){
    this.transitionsCbs.forEach((tr)=>{
      if (tr.plugin.name ==name )tr.enable = true;
  });
  }
  disableTransition(name){
    this.transitionsCbs.forEach((tr)=>{
      if (tr.plugin.name ==name )tr.enable = false;
  });
  }
  updateComponentStatus(agentid,comp,value){
      let cpmStatus = this.getUserContextData(agentid,'componentsStatus');
      if (cpmStatus && cpmStatus.componentsStatus.length>0){
          let cmp = cpmStatus.componentsStatus.find((x)=>{
                if (x.cmp == comp) return true;
          });
          if (cmp){
             if (typeof cmp.usrCmd =="undefined") cmp.usrCmd = [];
             let cmds = cmp.usrCmd.map((c=>{
                return c.cmd;
             }));
             if (cmds.indexOf(value.cmd)!=-1)
                  cmp.usrCmd = cmp.usrCmd.filter((c)=>{
                      if (c.cmd == value.cmd) return false;
                  });
             cmp.usrCmd.push(value);
            if (agentid === this.getMyAgentId()) agentid = "me";
             cpmStatus.from = this.getMyAgentId();
             this.users.get(agentid).context.setItem("componentsStatus",cpmStatus);
          }
      }
  }
  updateUserData(user, key, value) {
    let data = this.getUserContextData(user, "userData") == "undefined"? {}:this.getUserContextData(user, "userData");
    if (data && typeof value != "string" && typeof value != "boolean")
      for (let d in value) {
        data[d] = value[d];
      }
    else if (typeof value === "string" || typeof value == "boolean") {
      data[key] = value;
    }
    else data = value;
    if (user == this.getMyAgentId() && this.getMyAgentId()!=="debugger") this.users.get('me').context.setItem("userData", data);

    else this.users.get(user).context.setItem("userData", data);
  }

  setUserContextData(user, key, value) {
    let data = this.getUserContextData(user, key);
    if (typeof data !=="undefined" && data!=="undefined" && typeof(data)!="string")
      for (let d in value) {
        data[d] = value[d];
      }
    else data = value;
    if (user == this.getMyAgentId() && this.getMyAgentId()!=="debugger") this.users.get('me').context.setItem(key, data);
    else this.users.get(user).context.setItem(key, data);
  }
  getUserContextData(user, key) {
    if (user == this.getMyAgentId() &&this.getMyAgentId()!=="debugger") return this.users.get('me').context.getItem(key);

    else
      return this.users.get(user).context.getItem(key) || {};
  }

  getUsers() {
    return JSON.stringify(Array.from(this.users.entries()));
  }
  getUsersForRules(){
      let userMap = new Map();
      for (const [key, value] of this.users.entries()) {
        if (this.users.get(key).profile!="controller") userMap.set(key,value);
      }
      return userMap;
  }
  getPrivateUsers() {
    return JSON.stringify(Array.from(this.users_priv.entries()));
  }
  getAppData() {
    return JSON.stringify(this.appData);
  }
  getUsersByProfile() {
    //this.appCtx.getAgents().self.agentid
  }
  data(name, script, args) {
    var x = setInterval(() => {
      if (this.appCtx && this.appCtx.me) {
        clearInterval(x);
        this.appCtx.me.load(script(args[0]));
      }
    }, 5);



  }
  isInteracive(agentid){
    if (this.getMyAgentId()==="debugger") return false;
    else if (this.getMyAgentId()== agentid)
          if (this.isRuleEngineEnable()) return false;
          else return true;

  }
  isRuleEngineEnable(){
    return this.rulesEnabled;
  }
  existsAgent(agid, priv) {
    if (this.getMyAgentId()== "debugger" || this.rulesEnabled===false){
        return this.users.get(agid) !== undefined;
    }
    else {
        if (priv && priv == true) return (this.users_priv.get(agid) !== undefined || (this.appCtxPriv.me.agentid === this.users_priv.get('me').agentid));
        else {
          return (this.users.get(agid) !== undefined || (this.appCtx.me.agentid === this.users.get('me').agentid));

        }
    }
  }
  setAppAttribute(key, value) {
    if (this.appCtx.keys().indexOf(key) === -1) this.subscribe(key);
    if (typeof value === "object") value.timestamp = new Date().getTime();
    this.appCtx.setItem(key, value);
  }
  getAppAttribute(key) {
    return this.appCtx.getItem(key);
  }
  subscribe(key) {
    this.appCtx.on(key, this.onAppAttrChange.bind(this));
  }
  resolveConflict(deploys) {
    var maxPriority = 0, result = null;

    for (var i = 0; i < deploys.length; i++) {
      if (deploys[i].priority >= maxPriority) {
        maxPriority = deploys[i].priority;
        if (result === null)
          result = deploys[i].decision;
        else {
          result.forEach( (c) => {
            deploys[i].decision.forEach((c2) =>{
              if (c.cmp === c2.cmp) {
                c.show = c2.show;
                if (typeof c2.usrCmd !="undefined"){
                   c.usrCmd = c2.usrCmd;
                }
              }
            });
          });
        }
      }
    }
    if (result) {
      result.forEach((c) => {
        if (c.show === true) document.getElementById(c.cmp).style.display = "block";
        else document.getElementById(c.cmp).style.display = "none";
      });
      if (this.users.get("me") && this.users.get("me").context) this.setUserContextData(this.users.get("me").agentid, "componentsStatus", {componentsStatus:result,from:this.users.get("me").agentid});
    }
  }
  resolveConflictLocally(deploys) {
    var maxPriority = 0, result = null;

    for (var i = 0; i < deploys.length; i++) {
      if (deploys[i].priority >= maxPriority) {
        maxPriority = deploys[i].priority;
        if (result === null)
          result = deploys[i].decision;
        else {
          result.forEach( (c) => {
            deploys[i].decision.forEach((c2) =>{
              if (c.cmp === c2.cmp) {
                c.show = c2.show;
                if (typeof c2.usrCmd !="undefined"){
                   c.usrCmd = c2.usrCmd;
                }
              }
            });
          });
        }
      }
    }
    if (result) {
      result.forEach((c) => {
        if (c.show === true) document.getElementById(c.cmp).style.display = "block";
        else document.getElementById(c.cmp).style.display = "none";
      });
      if (this.users.get("me") && this.users.get("me").context) this.setUserContextData(this.users.get("me").agentid, "componentsStatus", {componentsStatus:result,from:"me"});
    }
  }
  getUserObservable() { return this.userObservable };
  me() {
    return this.appCtx.me;
  }
  getMyAgentId() {
    if (this.debugger) return "debugger";
    else return this.users.get('me').agentid;
  }
  enableInstrument(cap, context, chg, master) {
    cap.forEach((_cap) => {
      context.on(_cap, (k, v) => {
        if (context.agentid == this.appCtx.getAgents().self.agentid) {
          let user = this.users.get('me');
          user[k] = v;
          log$3.debug("me", user);
          this.userObserver.next({ evt: EVENT.CAP_CHANGE, data: { "agentid": context.agentid, "key": k, "value": v } });

        }
      });
    });
    if (master === true || master === undefined) {
      cap.forEach((_cap) => {
        context.on(_cap, (k, v) => {

          let user = '';

          if (context.agentid == this.appCtx.getAgents().self.agentid)
            user = this.users.get('me');
          else
            user = this.users.get(context.agentid);
          user.capacities[k] = v;
          if (k === "userProfile" && v !== "supported") user.profile = v;
          if (k === "userData" && v !== "supported") {
            if (context.agentid == this.appCtx.getAgents().self.agentid)
              user = this.users.get('me');
            else
              user = this.users.get(context.agentid);
            user[k] = v;

          }
          this.userObserver.next({ evt: EVENT.CAP_CHANGE, data: { "agentid": context.agentid, "key": k, "value": v } });
        });
      });
    }
    else {
      let ind = cap.indexOf("masterSlave");
      if (ind !== -1) {
        let user = '';
        context.on(cap[ind], (k, v) => {
          if (context.agentid == this.appCtx.getAgents().self.agentid)
            user = this.users.get('me');
          else
            user = this.users.get(context.agentid);
          user.capacities[k] = v;
          this.userObserver.next({ evt: EVENT.CAP_CHANGE, data: { "key": k, "value": v } });
          if (k === "masterSlave" && v === true) {

            context.keys().forEach((_cap) => {
              context.on(_cap, (k, v) => {
                let user = '';

                if (context.agentid == this.appCtx.getAgents().self.agentid)
                  user = this.users.get('me');
                else
                  user = this.users.get(context.agentid);
                user.capacities[k] = v;
                this.userObserver.next({ evt: EVENT.CAP_CHANGE, data: { "agentid": context.agentid, "key": k, "value": v } });
              });
            });
          }
          if (k === "userProfile" && v !== "supported") {
            if (context.agentid == this.appCtx.getAgents().self.agentid)
              user = this.users.get('me');
            else
              user = this.users.get(context.agentid);
            user.profile = v;

          }
          if (k === "userData" && v !== "supported") {
            if (context.agentid == this.appCtx.getAgents().self.agentid)
              user = this.users.get('me');
            else
              user = this.users.get(context.agentid);
            user[k] = v;

          }


        });
      }
    }
  }
  enablePrivInstrument(cap, context, chg, master) {
    cap.forEach((_cap) => {
      context.on(_cap, (k, v) => {
        let user = '';

        if (context.agentid == this.appCtxPriv.getAgents().self.agentid)
          user = this.users_priv.get('me');
        else
          user = this.users_priv.get(context.agentid);
        user.capacities[k] = v;
        this.userPrivObserver.next({ evt: EVENT.CAP_CHANGE, data: { "agentid": context.agentid, "key": k, "value": v } });
      });
    });


  }
  syncObjects(obj, channel, server) {
    let motion = new Motion(server || this.options.url, channel);
    motion.start();
    let ctrl = motion.addObject(obj, 0);
    return ctrl;
  }

  enableSequencer(obj, channel, server) {
    let motion = new Motion(server || this.options.url, channel);
    motion.start();
    let ctrl = motion.addObject(obj, 0);
    let promise = new Promise((resolve, reject) => {
      let timer =
      setTimeout(() => {
        reject("timeout enable sequencer");
      }, 8000);
      motion.addEventListener('motionReady', (evt) => {
        resolve("ready");
        clearInterval(timer);
        log$3.debug("MOTION SOCKET READY");
        evt.target = {currentTime:evt.value};
        this.timeObserver.next(evt);
        ctrl.addEventListener('timeupdate', (e) => {
          this.timeObserver.next(e);
        });
      });

    });
    this.sequencer = ctrl;
    ctrl.ready = promise;
    return ctrl;
  }
  getSequencer(){
    return this.sequencer;
  }
  enableQRcode(el) {
    let server = this.options.url.slice(0, -1);
    URI.shortURL(server, location.protocol + "//" + location.host + "/?master=" + this.master + "&group=" + this.privGroup).then((_url) => {
      log$3.debug("SHORTURL", _url.response);
      let cont = document.createElement('div');
      document.querySelector(el).appendChild(cont);
      new exports.QRCode(cont, {
        text: _url.response,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: exports.QRCode.CorrectLevel.H
      });
      let anchor = document.createElement('a');
      anchor.href = _url.response;
      anchor.innerHTML = _url.response;
      cont.appendChild(anchor);
    });
  }
  addDebugger(session) {
    let iframe = document.querySelector("#debugger");
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.src = "/test/context/monitor.html?agent=debugger&session=" + (session || this.options.channel);
      iframe.style = "position:absolute;top:75%;left:1%;z-index:9999;width:100%;height:30%;background:white";
      document.addEventListener("DOMContentLoaded",()=>document.body.appendChild(iframe));
    }
  }
}

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
class WCUserTable extends HTMLElement {
  static get observedAttributes () {
    return ['users'];
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (!this.__initialized) { return; }
    if (oldValue !== newValue) {
      if (name === 'no-headers') {
        this.noHeaders = newValue;
      } else {
        this[name] = newValue;
      }
    }
  }

  get users () { return this.getAttribute('users'); }
  set users (value) {
    this.setAttribute('users', value);
    this.render();
  }

  get value () { return this.__data; }
  set value (value) {
    this.setValue(value);
  }

  

  constructor () {
    super();

  }

  async connectedCallback () {
  

    this.__initialized = true;
  }




  setValue (value) {
    this.__data = JSON.parse(value);
    this.render();
  }



  render () {
    if (this.users === "undefined") return;
    if (!this.__table)  {
      this.__table = document.createElement('table');
      this.__table.id ="userTable";
    }
    const div = document.createElement('h2');
    div.innerHTML = "USERS DATA";
    div.id ="user_div";
    this.__headers = ["Id","Name","Profile","Capacity","Context","UserData"];
    this.__table.innerHTML = "";
    if (this.__headers) {

      const thead = document.createElement('thead');
      const tr = document.createElement('tr');
      this.__headers.forEach(header => {
        const th = document.createElement('th');
        th.innerText = header;
        tr.appendChild(th);
      });
      thead.append(tr);
      this.__table.appendChild(thead);
    }

    const tbody = document.createElement('tbody');
    JSON.parse(this.users).forEach(row => {
      const tr = document.createElement('tr');
      for (let n in row[1])
       {
        
        const td = document.createElement('td');
     
        if (n=="capacities" || n=="userData" || n=="context") td.innerHTML = "<div>"+JSON.stringify(row[1][n])+"</div>";
        else td.innerText = row[1][n];
        tr.appendChild(td);
 
      }
      tbody.appendChild(tr);
    });
    this.__table.appendChild(tbody);

  //  this.removeChild(document.querySelector("#table"));
    //this.__table = table;

  //  console.log("HERE",this.querySelector("#user_div"));
    if (!this.querySelector("#user_div")) this.appendChild(div);
    if (!this.querySelector("#table")) this.appendChild(this.__table);



  }
}

customElements.define('user-table', WCUserTable);

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
class WCAppTable extends HTMLElement {
  static get observedAttributes () {
    return ['datos'];
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (!this.__initialized) { return; }
    if (oldValue !== newValue) {
      if (name === 'no-headers') {
        this.noHeaders = newValue;
      } else {
        this[name] = newValue;
      }
    }
  }

  get datos () { return this.getAttribute('datos'); }
  set datos (value) {
    this.setAttribute('datos', value);
    this.render();
  }

  get value () { return this.__data; }
  set value (value) {
    this.setValue(value);
  }

  

  constructor () {
    super();

  }

  async connectedCallback () {
   

    this.__initialized = true;
  }




  setValue (value) {
    this.__data = parse(value);
    this.render();
  }



  render () {
    if (this.datos === "undefined") return;
    if (!this.__table)  this.__table = document.createElement('table');
    const div = document.createElement('h2');
    div.innerHTML = "APP DATA";
    div.id ="app_div";
    this.__headers = ["Key","Value"];
    this.__table.innerHTML="";
    if (this.__headers) {
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');
      this.__headers.forEach(header => {
        const th = document.createElement('th');
        th.innerText = header;
        tr.appendChild(th);
      });
      thead.append(tr);
      this.__table.appendChild(thead);
    }

    const tbody = document.createElement('tbody');
    var d = JSON.parse(this.datos);
    Object.keys(d).forEach(row => {
      const tr = document.createElement('tr');

        const td = document.createElement('td');
        td.innerText = row;
        tr.appendChild(td);
        const td1 = document.createElement('td');
        td1.innerHTML = "<div>"+JSON.stringify(d[row])+"</div>";
        tr.appendChild(td1);

      tbody.appendChild(tr);
    });
    this.__table.id = "table";
    this.__table.appendChild(tbody);




    if (!this.querySelector("#app_div")) this.appendChild(div);
    if (!this.querySelector("#table")) this.appendChild(this.__table);

  }
}

customElements.define('app-table', WCAppTable);

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
class WCTimer extends HTMLElement {
  static get observedAttributes () {
    return ['datos'];
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (!this.__initialized) { return; }
    if (oldValue !== newValue) {
      if (name === 'no-headers') {
        this.noHeaders = newValue;
      } else {
        this[name] = newValue;
      }
    }
  }

  get datos () { return this.getAttribute('datos'); }
  set datos (value) {
    this.setAttribute('datos', value);
    this.render();
  }

  get value () { return this.__data; }
  set value (value) {
    this.setValue(value);
  }


  constructor () {
    super();

  }

  async connectedCallback () {
   

    this.__initialized = true;
  }




  setValue (value) {
    this.__data = parse(value);
    this.render();
  }

 

  render () {
    if (this.datos === "undefined") return;
    if (!this.__table)  this.__table = document.createElement('table');
    const div = document.createElement('h2');
    div.innerHTML = "TIMER DATA";
    div.id ="app_div";
    this.__headers = ["Key","Value"];
    this.__table.innerHTML="";
    if (this.__headers) {
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');
      this.__headers.forEach(header => {
        const th = document.createElement('th');
        th.innerText = header;
        tr.appendChild(th);
      });
      thead.append(tr);
      this.__table.appendChild(thead);
    }

    const tbody = document.createElement('tbody');
    var d = JSON.parse(this.datos);
    Object.keys(d).forEach(row => {
      const tr = document.createElement('tr');

        const td = document.createElement('td');
        td.innerText = row;
        tr.appendChild(td);
        const td1 = document.createElement('td');
        td1.innerText = JSON.stringify(d[row]);
        tr.appendChild(td1);

      tbody.appendChild(tr);
    });
    this.__table.id = "table";
    this.__table.appendChild(tbody);




    if (!this.querySelector("#app_div")) this.appendChild(div);
    if (!this.querySelector("#table")) this.appendChild(this.__table);

  }
}

customElements.define('app-timer', WCTimer);

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
var log$2 =  Logger.getLogger('UI Plugin Divided');

function Divided (){

  var render = function(ev,cmp,app){
    var currentTime = app.sequencer ? app.sequencer.currentTime:-1;
     var setClasses = function(_cmp,N){
         document.querySelector('orkestra-ui').className="container";
         log$2.info("N=>",N);
         if (N>6){
           _cmp.className = "item79";
         }
         else if (N==5 || N==6){
          _cmp.className = "item456";
         }
         else if (N==3 || N==4){
          _cmp.className = "item34";
         }
         else if (N==2){
           _cmp.className = "item24";
         }
        
         else if (N==1){
            _cmp.className = "item21";
         }

     };
     var visible = Array.from(cmp).filter( (x,i,len) =>
       {

         return x.style.display!="none"
       });
       
        visible.forEach((cmp,o,len)=>{
            if (typeof cmp.order==="undefined") cmp.style.order = 0;
            else cmp.style.order = cmp.order[currentTime];
            setClasses(cmp,len.length);
        });


  };
  var unload = function (cmps){
     Array.from(cmps).forEach((c)=>{
      c.style ="";
      c.className ="";
   });

  };
  var plugin ={
     render:render,
     unload:unload
  };
  return plugin;

}

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */

function PipGrid() {
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
          _cmp.style.height= '100%';
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

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
var log$1 =  Logger.getLogger('UI Plugin Custom Layout');

function CustomLayout (){

  var render = function(ev,cmp){
     var setClasses = function(parameters,_cmp,N){
         document.querySelector('orkestra-ui').className="grid";
         log$1.info("parameters=>",parameters);
         let cmp_p = parameters.find((x)=>{ if (x.id == _cmp.id) return true});   
         if (cmp_p){
             _cmp.style.top = cmp_p.top;
             _cmp.style.left = cmp_p.left;
             _cmp.style.width = cmp_p.width;
             _cmp.style.height = cmp_p.height;
             _cmp.style.zIndex = cmp_p.zindex;
             _cmp.style.position = "absolute";
         }
     };
     var visible = Array.from(cmp).filter( (x,i,len) =>
       {

         return x.style.display!="none"
       });
        visible.forEach((cmp,o,len)=>{
            setClasses(JSON.parse(localStorage.getItem("parameters")),cmp,len.length);
        });


  };
  var unload = function (cmps){
     Array.from(cmps).forEach((c)=>{
      c.style ="";
      c.className ="";
   });

  };
  var plugin ={
     render:render,
     unload:unload
  };
  return plugin;

}

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
Logger.getLogger('UI Plugin Edit Layout');

function EditLayout (){

  var render = function(ev,cmp){
    document.querySelector('orkestra-ui').className="grid";
     var setClasses = function(_cmp,N){
         
         _cmp.className +=_cmp.className.indexOf('resizable')==-1?"resizable":"";
         _cmp.style.width = "400px";
         _cmp.style.height = "auto";
         _cmp.style.position = "absolute";
         _cmp.style.top = Math.floor(Math.random() * 500) + 100+"px";
         _cmp.style.left = Math.floor(Math.random() * 1000) + 1+"px";
         _cmp.style.zIndex = 9999;
     };
     var visible = Array.from(cmp).filter( (x,i,len) =>
       {
         if (!x.shadowRoot.querySelector('#'+x.id+"header")){
             x.shadowRoot.innerHTML+= "<div id='"+x.id+"header' style='width:100%;height:25px;background:red;position:absolute;top:0px;'> Move <span style='padding-left:68%;cursor:pointer;' id="+x.id+"_backzindex> Back</span><span style='cursor:pointer;' id="+x.id+"_frontzindex>/Front</span></div>";
             x.shadowRoot.querySelector('#'+x.id+'_backzindex').addEventListener('click',(e)=>{
                  console.log(e);
                  let el = e.path[0].id;
                  let elid = el.split('_')[0];
                  document.querySelector("#"+elid).style.zIndex -=1; 
             });
             x.shadowRoot.querySelector('#'+x.id+'_frontzindex').addEventListener('click',(e)=>{
                console.log(e);
                let el = e.path[0].id;
                  let elid = el.split('_')[0];
                  document.querySelector("#"+elid).style.zIndex +=1; 

            });
         }
         Obj.dragElement(x);         
         return x.style.display!="none"
       });
        visible.forEach((cmp,o,len)=>{
            setClasses(cmp,len.length);
        });

     let saveParams = document.createElement('button');
     saveParams.innerHTML="Save";
     saveParams.id ="saveparams";
     saveParams.addEventListener('click',(e)=>{
        let parameters =[]; 
        Array.from(cmp).forEach((c)=>{
            let params = {};
            params.width = (parseInt(c.style.width)*100)/document.body.clientWidth+"%";
            params.height = (parseInt(c.style.height)*100)/document.body.clientHeight+"%";
            params.top =(parseInt( c.style.top || 0)*100)/document.body.clientHeight+"%";
            params.left = (parseInt( c.style.left || 0)*100)/document.body.clientWidth+"%";
            params.zindex = c.style.zIndex;
            params.id = c.id;
            parameters.push(params);
         });
         console.log(parameters);
         localStorage.setItem('parameters', JSON.stringify(parameters));
    });   
     if (!document.querySelector('#saveparams'))
         document.body.appendChild(saveParams);
  };
  var unload = function (cmps){
     Array.from(cmps).forEach((c)=>{
      let header  = c.shadowRoot.querySelector("#"+c.id+"header");
      if (header) c.shadowRoot.removeChild(header);
    
      c.style ="";
      c.className ="";
   });
   if (document.querySelector('#saveparams'))document.body.removeChild(document.querySelector('#saveparams'));
  };
  var plugin ={
     render:render,
     unload:unload
  };
  return plugin;

}

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
Logger.getLogger('Transtiion Plugin Simple');

function Simple (options){
    var render = function(time){
        if (options && options.background) document.body.style.background = options.background; 
        document.body.className = "ork_opacity_0"; 
        if (!time) 
            if (options && options.time) var time = options.time;
        setTimeout(()=>{
            document.body.className ="ork_opacity_1";
        },(time || 1500));
    
    };
    var plugin ={
        render:render,
        name:"Simple"
     };
     return plugin;
}

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */

function Tabs() {

    var render = function (ev, cmp) {
    
        var changeTab = function(evt){
            console.log(evt);
            visible.forEach((c)=>{
                c.className="tabcontentNone";
               
            });
            evt.currentTarget.id.split('_')[1];
            document.querySelector("#"+evt.currentTarget.data).className="tabcontentDisplay";
            let tablinks = document.getElementsByClassName("tablinks");
            for (let i = 0; i < tablinks.length; i++) {
              tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            evt.currentTarget.className +=" active";
           
        };
        var createTabs = function (cmps) {
            let div = document.createElement('div');
            visible.forEach((c)=>{
                c.className="tabcontentNone";

            });
            div.className = "tab";
            cmps.forEach((c,i)=>{
                let but = document.createElement('button');
                but.className="tablinks";
                but.innerHTML = c.nodeName;
                but.data = c.id;
                but.addEventListener("click",changeTab.bind(this));
                div.appendChild(but);
            });

             document.body.prepend(div);
           
        };
       
        var visible = Array.from(cmp).filter((x, i, len) => {

            return x.style.display != "none"
        });

        if (!document.querySelector(".tablinks")) createTabs(visible);


    };

    var unload = function (cmps){
        Array.from(cmps).forEach((c)=>{
          c.style ="";
          c.className ="";
    
       });
       if (document.querySelector(".tab")) document.body.removeChild(document.querySelector(".tab"));

      };
      var plugin = {
         render:render,
         unload:unload
      };
      return plugin;

}

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
function Mosaic (){
  var render = function(ev,cmp,app){
     var container = document.createElement('div');
     container.class="mosaic";
     var currentTime = app.sequencer ? app.sequencer.currentTime:-1;
     var setClasses = function(_cmp,N,ind){
        document.querySelector('orkestra-ui').className="container";
         //REVIEW
         //document.querySelector('orkestra-ui').style.width='100%';
         //document.querySelector('orkestra-ui').style.height='100%';
         //document.querySelector('orkestra-ui').style.position='absolute';
         document.querySelector('body').style.overflow='hidden';
         if(N==1){
           _cmp.style.width='99%';
           _cmp.style.height='99%';
           _cmp.style.left='0%';
           _cmp.style.top='0%';
           _cmp.style.position='absolute';
           _cmp.style.backgroundColor='black';
           _cmp.style.transition='width 1s, height 1s';
           //_cmp.style.transitionProperty= 'display, border-radius';
           //_cmp.style.transitionDuration= '5s 3s';
           //_cmp.style.borderRadius= '25px';
         }
         else if(N<=5){
           if(ind==0){
             _cmp.style.width='99%';
             _cmp.style.height='69%';
             _cmp.style.left='0%';
             _cmp.style.top='30%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';

           }
           else {
             _cmp.style.width=((100-N+1)/(N-1))+'%';
             _cmp.style.height='29%';
             _cmp.style.left= ((ind-1)*((100)/(N-1)))+'%';
             _cmp.style.top='0%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';

           }
         }
         else if(N>5){
           if(ind==0){
             _cmp.style.width='49%';
             _cmp.style.height='49%';
             _cmp.style.left='25%';
             _cmp.style.top='25%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';
           }
           else if(ind==1){
             _cmp.style.width='49%';
             _cmp.style.height='24%';
             _cmp.style.left='0%';
             _cmp.style.top='0%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';
           }
           else if(ind==2){
             _cmp.style.width='49%';
             _cmp.style.height='24%';
             _cmp.style.left='50%';
             _cmp.style.top='0%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';
           }
           else if(ind==3){
             _cmp.style.width='49%';
             _cmp.style.height='24%';
             _cmp.style.left='0%';
             _cmp.style.top='75%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';
           }
           else if(ind==4){
             _cmp.style.width='49%';
             _cmp.style.height='24%';
             _cmp.style.left='50%';
             _cmp.style.top='75%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';
           }
           else if(ind==5){
             _cmp.style.width='24%';
             _cmp.style.height='24%';
             _cmp.style.left='0%';
             _cmp.style.top='25%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';
           }
           else if(ind==6){
             _cmp.style.width='24%';
             _cmp.style.height='24%';
             _cmp.style.left='0%';
             _cmp.style.top='50%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';
           }
           else if(ind==7){
             _cmp.style.width='24%';
             _cmp.style.height='24%';
             _cmp.style.left='75%';
             _cmp.style.top='25%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';
           }
           else if(ind==8){
             _cmp.style.width='24%';
             _cmp.style.height='24%';
             _cmp.style.left='75%';
             _cmp.style.top='50%';
             _cmp.style.position='absolute';
             _cmp.style.backgroundColor='black';
             _cmp.style.transition='width 1s, height 1s';
           }
         }
         /*if (N===9 || N==6){
           _cmp.className = "item69";
         }
         else if (N==4 || N==2 || N===3){
           _cmp.className = "item24";
         }
         else if (N==1){
            _cmp.className = "item21";
         }*/


     };
     var visible = Array.from(cmp).filter( (x,i,len) =>
       {
        if (typeof x.order==="undefined") x.style.order = 0;
         return x.style.display!="none"
       });
       if (typeof cmp[0].order!=="undefined")
          // sort by parameter.
          visible = visible.sort((a,b)=>{
              if (a.order[currentTime] < b.order[currentTime]) return -1;
              else if (a.order[currentTime] > b.order[currentTime]) return 1;
              else return 0;
          });
        visible.forEach((cmp,o,len)=>{
            if (typeof cmp.order!=="undefined") cmp.style.order = cmp.order[currentTime];
            setClasses(cmp,len.length,o);
        });
  };
  var unload = function (cmps){
    Array.from(cmps).forEach((c)=>{
      c.style ="";
      c.className ="";
   });
  };
  var plugin ={
     render:render,
     unload:unload
  };
  return plugin;
}

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
function Byname (){
  var deploy = function (evt,cmp,users,options){
      let decision = [];
    //  cmp[0].style.display="none";
      for (let n in cmp){
        let c = cmp[n];
        if (!c.style) return;
        if ('master' === users.get('me').profile && c.nodeName==="USER-TABLE") c.style.display = 'block';
        else if ( c.nodeName==="APP-TABLE") c.style.display = 'block';
              else c.style.display = 'none';
        decision.push({cmp:c.id,show:c.style.display=="block"});
        }
        return decision;
  };
  return deploy;

}

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */

function Bytimeline() {
  var self = {};
  self.name = "bytimeline";
  self.data = [];
  var deploy = function (evt, cmp, users, options) {
    let decision = [];
    if (typeof evt.key === "undefined") evt.key = "";
    let key = evt.key.split('_');
    if (key[0] == "timeline" && key[1] != "change") {
      if (evt.type === "appAttrChange" || typeof evt.type === "undefined") {
        let data = evt.data ? evt.data.value : evt.value;
        if (data.applyTo === users.get("me").agentid || data.applyTo === "all")
          self.data = data.componentStatus;
        evt.applyTo = data.applyTo;
      }
      else
        if (key[1] === users.get("me").agentid) self.data = evt.componentStatus;
    }

    /* TODO :rewrite evt info is not clean */
   // if (self.data && typeof self.data != "string") evt.data = self.data;

    if (evt.type === "timeline_change" || evt.key.indexOf("timeline") > -1) {
      const isChangeScene = evt.time!=undefined && evt.time!=self.time;
      Array.from(cmp).forEach((c) => {
        c.unload(isChangeScene);
      });
      
      if (evt.type === "timeline_change") self.time = evt.time;
      if (evt.key.indexOf("timeline") > -1) evt.time = self.time || 0;
      let cmps = getTimeEvent(evt);
      for (let n = 0; n < cmp.length; n++) {
        let c = cmp[n];
        if (!c.style) continue;
        let index = cmps.map((x) => { return x.id }).indexOf(c.id);
       
        if (index > -1) {
          c.order = cmps[index].order;
          c.input = cmps[index].source;
          if(!isChangeScene && c.style.display=="none"){
            c.load();
          }
          else {
            c.load(isChangeScene);
          }
          if (cmps[index].mutedScene == 'true') {
            c.muteScene();
          }
          else {
            c.unmuteScene();
          }
          let fileName = cmps[index].source.substring(cmps[index].source.lastIndexOf('/') + 1, cmps[index].source.length);
          let ext = fileName.substring(fileName.lastIndexOf('.'), cmps[index].source.length);
          let videoExt = ['.mp4','.ogv','.vp9','.vp8','.mpeg','.mpg','.mpd'];
          if(videoExt.indexOf(ext) != -1){
            if (cmps[index].loopVideo == 'true') {
              c.changeLoop(true);
            }
            else {
              c.changeLoop(false);
            }
          }
        }
        else
          c.unload(isChangeScene);
        decision.push({ cmp: c.id, show: index > -1 });
      }
    }
    return decision;
  };
  function getTimeEvent(evt) {
    loglevel.debug(evt);
    let data = typeof self.data !== "string" ? self.data : [];
    if (typeof data === "undefined") data = [];
    let time = Math.round(evt.time);
    let inIntervalCmps = data.filter((d) => {
      if (d.slots[time] === 1) return true;
      return false;
    });
    if (inIntervalCmps.length > 0) {
      inIntervalCmps = inIntervalCmps.map((c) => {
        return { id: "v"+c.id, source: c.source, mutedScene: c.mutedScenes[time],order:c.order, loopVideo: c.loopVideo[time]};
      });
    }
    return inIntervalCmps;
  }
  return deploy;

}

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
function Explicit() {
  var deploy = function (evt, cmp, users, options) {
    const reload = options ? !!options.reload : true;
    let decision = [];
    loglevel.debug(options);
    let context = getNearContext(evt,users,options);
    loglevel.debug("RULE",context);
    if (context){
      context.then.forEach((c)=>{
        if (c.show) {
          reload && document.querySelector("#"+c.comp).load();
        }
        else  {
          reload && document.querySelector("#"+c.comp).unload();
        }
        if (users.get("me").agentid === c.agentid)
        decision.push({ cmp: c.comp, show: c.show });
      });
    }
    else { // whether is not context show all hide
      Array.from(cmp).forEach((c)=>{
        decision.push({ cmp: c.id, show: false });
      });
    }

    return decision;
  };
  function getNearContext(evt,users,options){
    loglevel.debug(evt,options,users);
    if (!users) return undefined;
    if (!options.contexts) {
      loglevel.warn ("NO explicit found, add config file to app.use");
      return;
    }
    let myContext = options.contexts.find((x)=> {if (x.session==options.channel) return true});
    let usersMaps = Array.from(users).map((usr)=>{
      return usr[1].agentid;
    });
    let rule = myContext.rules.find((r)=>{
      usersMaps.sort();
      r.condition.sort();
      if (usersMaps.length === r.condition.length && usersMaps.every((value, index) => value === r.condition[index])){
        return true;
      }

    });
    return rule || undefined;
  }
  return deploy;

}

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
function FullScreen (){
  var log =  Logger.getLogger('UI Plugin Fullscreen');
  var render = function(ev,cmp,app,options){
       let layout = app.getAppAttribute("layout");
       log.debug("Rendering");
       if (ev && ev.type=="appAttrChange" || layout.status == "on") { // Session oriented fullscreen
        let Config = options;
        let applyToComp = Config.componentId;
        applyToComp = layout.cmp;
        if (ev && ev.data.value.cmp) applyToComp = ev.data.value.cmp;
        let comp =  Array.from(cmp).find((x)=>{
            return x.id == applyToComp;
        });
        Array.from(cmp).forEach((x)=>{
            if (x.id != applyToComp) x.style.display="none";
        });

        let props = Config.agents.find((ag)=>{
            return ag.agentid == app.getMyAgentId()
        });
        if (!props) log.debug("Not agent's properties found");
        comp.style="position:absolute;z-index:999";
        comp.style.width = props.screensize.width*Config.cols;
        comp.style.height = props.screensize.height*Config.rows;
        comp.style.left = -((props.col * props.screensize.width)+props.offsetx);
        comp.style.top = -((props.row * props.screensize.height)+props.offsety);
        document.body.style="overflow:hidden";
      }
      else if (ev.data && ev.data.key=="userData" && ev.data.value) { // Agent oriented fullscreen
        if (ev.data && ev.data.agentid=== app.getMyAgentId()){
        let Config = options;
        let applyToComp = Config.componentId;
        if (ev && ev.cmp) applyToComp = ev.cmp;
        let comp =  Array.from(cmp).find((x)=>{
            return x.id == applyToComp;
        });
        Array.from(cmp).find((x)=>{
            if (x.id != applyToComp) x.style.display="none";
        });
        comp.style="position:absolute;z-index:999";
        comp.style.width = "100%";
        comp.style.height = "100%";
        comp.style.left = "0px";
        comp.style.top = "0px";
        document.body.style="overflow:hidden";
      }
    }
  };
  var unload = function (cmps){
    log.debug("Unloading");
     Array.from(cmps).forEach((c)=>{
      c.style ="";
      c.className ="";
   });

  };
  var plugin ={
     render:render,
     unload:unload
  };
  return plugin;

}

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */

function UserPref() {
    var deploy = function (evt, cmp, users, options) {
      const reload = options ? !!options.reload : true;
      let decision = [];
      if (evt.data && evt.data.key==="componentsStatus"){
        loglevel.debug("COMPONENTSSTATUS",evt);
        let cmps = evt.data.value;
        if (cmps!="undefined")
         cmps.componentsStatus.forEach((c)=>{
           if (typeof c.usrCmd !=="undefined"){
            let cmdShow = c.usrCmd.find((x)=>{
              if (x.cmd =="show") {
                reload && document.querySelector("#"+c.cmp).load();
                return true;
              }
            });
            if (cmdShow) decision.push({ cmp: c.cmp, show: cmdShow.value, usrCmd:c.usrCmd});
           }
        });
      }
      else {
        if (users.get("me").capacities.componentsStatus && users.get("me").capacities.componentsStatus.componentsStatus){
         loglevel.debug("COMPONENTSSTATUS",users.get("me").capacities.componentsStatus.componentsStatus,evt);
          let cmps = users.get("me").capacities.componentsStatus;
          if (cmps!="undefined")
           cmps.componentsStatus.forEach((c)=>{
             if (typeof c.usrCmd !=="undefined"){
              let cmdShow = c.usrCmd.find((x)=>{
                  if (x.cmd =="show") {
                    reload && document.querySelector("#"+c.cmp).load();
                    return true;
                  }
                });
              if (cmdShow) decision.push({ cmp: c.cmp, show: cmdShow.value, usrCmd:c.usrCmd});
             }
          });
        }
      }
      loglevel.debug(decision);
      return decision;
    };

    return deploy;

  }

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

let logDisabled_ = true;
let deprecationWarnings_ = true;

/**
 * Extract browser version out of the provided user agent string.
 *
 * @param {!string} uastring userAgent string.
 * @param {!string} expr Regular expression used as match criteria.
 * @param {!number} pos position in the version string to be returned.
 * @return {!number} browser version.
 */
function extractVersion(uastring, expr, pos) {
  const match = uastring.match(expr);
  return match && match.length >= pos && parseInt(match[pos], 10);
}

// Wraps the peerconnection event eventNameToWrap in a function
// which returns the modified event object (or false to prevent
// the event).
function wrapPeerConnectionEvent(window, eventNameToWrap, wrapper) {
  if (!window.RTCPeerConnection) {
    return;
  }
  const proto = window.RTCPeerConnection.prototype;
  const nativeAddEventListener = proto.addEventListener;
  proto.addEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap) {
      return nativeAddEventListener.apply(this, arguments);
    }
    const wrappedCallback = (e) => {
      const modifiedEvent = wrapper(e);
      if (modifiedEvent) {
        if (cb.handleEvent) {
          cb.handleEvent(modifiedEvent);
        } else {
          cb(modifiedEvent);
        }
      }
    };
    this._eventMap = this._eventMap || {};
    if (!this._eventMap[eventNameToWrap]) {
      this._eventMap[eventNameToWrap] = new Map();
    }
    this._eventMap[eventNameToWrap].set(cb, wrappedCallback);
    return nativeAddEventListener.apply(this, [nativeEventName,
      wrappedCallback]);
  };

  const nativeRemoveEventListener = proto.removeEventListener;
  proto.removeEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap || !this._eventMap
        || !this._eventMap[eventNameToWrap]) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    if (!this._eventMap[eventNameToWrap].has(cb)) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    const unwrappedCb = this._eventMap[eventNameToWrap].get(cb);
    this._eventMap[eventNameToWrap].delete(cb);
    if (this._eventMap[eventNameToWrap].size === 0) {
      delete this._eventMap[eventNameToWrap];
    }
    if (Object.keys(this._eventMap).length === 0) {
      delete this._eventMap;
    }
    return nativeRemoveEventListener.apply(this, [nativeEventName,
      unwrappedCb]);
  };

  Object.defineProperty(proto, 'on' + eventNameToWrap, {
    get() {
      return this['_on' + eventNameToWrap];
    },
    set(cb) {
      if (this['_on' + eventNameToWrap]) {
        this.removeEventListener(eventNameToWrap,
            this['_on' + eventNameToWrap]);
        delete this['_on' + eventNameToWrap];
      }
      if (cb) {
        this.addEventListener(eventNameToWrap,
            this['_on' + eventNameToWrap] = cb);
      }
    },
    enumerable: true,
    configurable: true
  });
}

function disableLog(bool) {
  if (typeof bool !== 'boolean') {
    return new Error('Argument type: ' + typeof bool +
        '. Please use a boolean.');
  }
  logDisabled_ = bool;
  return (bool) ? 'adapter.js logging disabled' :
      'adapter.js logging enabled';
}

/**
 * Disable or enable deprecation warnings
 * @param {!boolean} bool set to true to disable warnings.
 */
function disableWarnings(bool) {
  if (typeof bool !== 'boolean') {
    return new Error('Argument type: ' + typeof bool +
        '. Please use a boolean.');
  }
  deprecationWarnings_ = !bool;
  return 'adapter.js deprecation warnings ' + (bool ? 'disabled' : 'enabled');
}

function log() {
  if (typeof window === 'object') {
    if (logDisabled_) {
      return;
    }
    if (typeof console !== 'undefined' && typeof console.log === 'function') {
      console.log.apply(console, arguments);
    }
  }
}

/**
 * Shows a deprecation warning suggesting the modern and spec-compatible API.
 */
function deprecated(oldMethod, newMethod) {
  if (!deprecationWarnings_) {
    return;
  }
  console.warn(oldMethod + ' is deprecated, please use ' + newMethod +
      ' instead.');
}

/**
 * Browser detector.
 *
 * @return {object} result containing browser and version
 *     properties.
 */
function detectBrowser(window) {
  // Returned result object.
  const result = {browser: null, version: null};

  // Fail early if it's not a browser
  if (typeof window === 'undefined' || !window.navigator) {
    result.browser = 'Not a browser.';
    return result;
  }

  const {navigator} = window;

  if (navigator.mozGetUserMedia) { // Firefox.
    result.browser = 'firefox';
    result.version = extractVersion(navigator.userAgent,
        /Firefox\/(\d+)\./, 1);
  } else if (navigator.webkitGetUserMedia ||
      (window.isSecureContext === false && window.webkitRTCPeerConnection)) {
    // Chrome, Chromium, Webview, Opera.
    // Version matches Chrome/WebRTC version.
    // Chrome 74 removed webkitGetUserMedia on http as well so we need the
    // more complicated fallback to webkitRTCPeerConnection.
    result.browser = 'chrome';
    result.version = extractVersion(navigator.userAgent,
        /Chrom(e|ium)\/(\d+)\./, 2);
  } else if (window.RTCPeerConnection &&
      navigator.userAgent.match(/AppleWebKit\/(\d+)\./)) { // Safari.
    result.browser = 'safari';
    result.version = extractVersion(navigator.userAgent,
        /AppleWebKit\/(\d+)\./, 1);
    result.supportsUnifiedPlan = window.RTCRtpTransceiver &&
        'currentDirection' in window.RTCRtpTransceiver.prototype;
  } else { // Default fallthrough: not supported.
    result.browser = 'Not a supported browser.';
    return result;
  }

  return result;
}

/**
 * Checks if something is an object.
 *
 * @param {*} val The something you want to check.
 * @return true if val is an object, false otherwise.
 */
function isObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]';
}

/**
 * Remove all empty objects and undefined values
 * from a nested object -- an enhanced and vanilla version
 * of Lodash's `compact`.
 */
function compactObject(data) {
  if (!isObject(data)) {
    return data;
  }

  return Object.keys(data).reduce(function(accumulator, key) {
    const isObj = isObject(data[key]);
    const value = isObj ? compactObject(data[key]) : data[key];
    const isEmptyObject = isObj && !Object.keys(value).length;
    if (value === undefined || isEmptyObject) {
      return accumulator;
    }
    return Object.assign(accumulator, {[key]: value});
  }, {});
}

/* iterates the stats graph recursively. */
function walkStats(stats, base, resultSet) {
  if (!base || resultSet.has(base.id)) {
    return;
  }
  resultSet.set(base.id, base);
  Object.keys(base).forEach(name => {
    if (name.endsWith('Id')) {
      walkStats(stats, stats.get(base[name]), resultSet);
    } else if (name.endsWith('Ids')) {
      base[name].forEach(id => {
        walkStats(stats, stats.get(id), resultSet);
      });
    }
  });
}

/* filter getStats for a sender/receiver track. */
function filterStats(result, track, outbound) {
  const streamStatsType = outbound ? 'outbound-rtp' : 'inbound-rtp';
  const filteredResult = new Map();
  if (track === null) {
    return filteredResult;
  }
  const trackStats = [];
  result.forEach(value => {
    if (value.type === 'track' &&
        value.trackIdentifier === track.id) {
      trackStats.push(value);
    }
  });
  trackStats.forEach(trackStat => {
    result.forEach(stats => {
      if (stats.type === streamStatsType && stats.trackId === trackStat.id) {
        walkStats(result, stats, filteredResult);
      }
    });
  });
  return filteredResult;
}

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
const logging = log;

function shimGetUserMedia$2(window, browserDetails) {
  const navigator = window && window.navigator;

  if (!navigator.mediaDevices) {
    return;
  }

  const constraintsToChrome_ = function(c) {
    if (typeof c !== 'object' || c.mandatory || c.optional) {
      return c;
    }
    const cc = {};
    Object.keys(c).forEach(key => {
      if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
        return;
      }
      const r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
      if (r.exact !== undefined && typeof r.exact === 'number') {
        r.min = r.max = r.exact;
      }
      const oldname_ = function(prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return (name === 'deviceId') ? 'sourceId' : name;
      };
      if (r.ideal !== undefined) {
        cc.optional = cc.optional || [];
        let oc = {};
        if (typeof r.ideal === 'number') {
          oc[oldname_('min', key)] = r.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_('max', key)] = r.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_('', key)] = r.ideal;
          cc.optional.push(oc);
        }
      }
      if (r.exact !== undefined && typeof r.exact !== 'number') {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_('', key)] = r.exact;
      } else {
        ['min', 'max'].forEach(mix => {
          if (r[mix] !== undefined) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
  };

  const shimConstraints_ = function(constraints, func) {
    if (browserDetails.version >= 61) {
      return func(constraints);
    }
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints && typeof constraints.audio === 'object') {
      const remap = function(obj, a, b) {
        if (a in obj && !(b in obj)) {
          obj[b] = obj[a];
          delete obj[a];
        }
      };
      constraints = JSON.parse(JSON.stringify(constraints));
      remap(constraints.audio, 'autoGainControl', 'googAutoGainControl');
      remap(constraints.audio, 'noiseSuppression', 'googNoiseSuppression');
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints && typeof constraints.video === 'object') {
      // Shim facingMode for mobile & surface pro.
      let face = constraints.video.facingMode;
      face = face && ((typeof face === 'object') ? face : {ideal: face});
      const getSupportedFacingModeLies = browserDetails.version < 66;

      if ((face && (face.exact === 'user' || face.exact === 'environment' ||
                    face.ideal === 'user' || face.ideal === 'environment')) &&
          !(navigator.mediaDevices.getSupportedConstraints &&
            navigator.mediaDevices.getSupportedConstraints().facingMode &&
            !getSupportedFacingModeLies)) {
        delete constraints.video.facingMode;
        let matches;
        if (face.exact === 'environment' || face.ideal === 'environment') {
          matches = ['back', 'rear'];
        } else if (face.exact === 'user' || face.ideal === 'user') {
          matches = ['front'];
        }
        if (matches) {
          // Look for matches in label, or use last cam for back (typical).
          return navigator.mediaDevices.enumerateDevices()
          .then(devices => {
            devices = devices.filter(d => d.kind === 'videoinput');
            let dev = devices.find(d => matches.some(match =>
              d.label.toLowerCase().includes(match)));
            if (!dev && devices.length && matches.includes('back')) {
              dev = devices[devices.length - 1]; // more likely the back cam
            }
            if (dev) {
              constraints.video.deviceId = face.exact ? {exact: dev.deviceId} :
                                                        {ideal: dev.deviceId};
            }
            constraints.video = constraintsToChrome_(constraints.video);
            logging('chrome: ' + JSON.stringify(constraints));
            return func(constraints);
          });
        }
      }
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging('chrome: ' + JSON.stringify(constraints));
    return func(constraints);
  };

  const shimError_ = function(e) {
    if (browserDetails.version >= 64) {
      return e;
    }
    return {
      name: {
        PermissionDeniedError: 'NotAllowedError',
        PermissionDismissedError: 'NotAllowedError',
        InvalidStateError: 'NotAllowedError',
        DevicesNotFoundError: 'NotFoundError',
        ConstraintNotSatisfiedError: 'OverconstrainedError',
        TrackStartError: 'NotReadableError',
        MediaDeviceFailedDueToShutdown: 'NotAllowedError',
        MediaDeviceKillSwitchOn: 'NotAllowedError',
        TabCaptureError: 'AbortError',
        ScreenCaptureError: 'AbortError',
        DeviceCaptureError: 'AbortError'
      }[e.name] || e.name,
      message: e.message,
      constraint: e.constraint || e.constraintName,
      toString() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  const getUserMedia_ = function(constraints, onSuccess, onError) {
    shimConstraints_(constraints, c => {
      navigator.webkitGetUserMedia(c, onSuccess, e => {
        if (onError) {
          onError(shimError_(e));
        }
      });
    });
  };
  navigator.getUserMedia = getUserMedia_.bind(navigator);

  // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
  // function which returns a Promise, it does not accept spec-style
  // constraints.
  if (navigator.mediaDevices.getUserMedia) {
    const origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(cs) {
      return shimConstraints_(cs, c => origGetUserMedia(c).then(stream => {
        if (c.audio && !stream.getAudioTracks().length ||
            c.video && !stream.getVideoTracks().length) {
          stream.getTracks().forEach(track => {
            track.stop();
          });
          throw new DOMException('', 'NotFoundError');
        }
        return stream;
      }, e => Promise.reject(shimError_(e))));
    };
  }
}

/*
 *  Copyright (c) 2018 The adapter.js project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
function shimGetDisplayMedia$1(window, getSourceId) {
  if (window.navigator.mediaDevices &&
    'getDisplayMedia' in window.navigator.mediaDevices) {
    return;
  }
  if (!(window.navigator.mediaDevices)) {
    return;
  }
  // getSourceId is a function that returns a promise resolving with
  // the sourceId of the screen/window/tab to be shared.
  if (typeof getSourceId !== 'function') {
    console.error('shimGetDisplayMedia: getSourceId argument is not ' +
        'a function');
    return;
  }
  window.navigator.mediaDevices.getDisplayMedia =
    function getDisplayMedia(constraints) {
      return getSourceId(constraints)
        .then(sourceId => {
          const widthSpecified = constraints.video && constraints.video.width;
          const heightSpecified = constraints.video &&
            constraints.video.height;
          const frameRateSpecified = constraints.video &&
            constraints.video.frameRate;
          constraints.video = {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sourceId,
              maxFrameRate: frameRateSpecified || 3
            }
          };
          if (widthSpecified) {
            constraints.video.mandatory.maxWidth = widthSpecified;
          }
          if (heightSpecified) {
            constraints.video.mandatory.maxHeight = heightSpecified;
          }
          return window.navigator.mediaDevices.getUserMedia(constraints);
        });
    };
}

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimMediaStream(window) {
  window.MediaStream = window.MediaStream || window.webkitMediaStream;
}

function shimOnTrack$1(window) {
  if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
      window.RTCPeerConnection.prototype)) {
    Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
      get() {
        return this._ontrack;
      },
      set(f) {
        if (this._ontrack) {
          this.removeEventListener('track', this._ontrack);
        }
        this.addEventListener('track', this._ontrack = f);
      },
      enumerable: true,
      configurable: true
    });
    const origSetRemoteDescription =
        window.RTCPeerConnection.prototype.setRemoteDescription;
    window.RTCPeerConnection.prototype.setRemoteDescription =
      function setRemoteDescription() {
        if (!this._ontrackpoly) {
          this._ontrackpoly = (e) => {
            // onaddstream does not fire when a track is added to an existing
            // stream. But stream.onaddtrack is implemented so we use that.
            e.stream.addEventListener('addtrack', te => {
              let receiver;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = this.getReceivers()
                  .find(r => r.track && r.track.id === te.track.id);
              } else {
                receiver = {track: te.track};
              }

              const event = new Event('track');
              event.track = te.track;
              event.receiver = receiver;
              event.transceiver = {receiver};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            });
            e.stream.getTracks().forEach(track => {
              let receiver;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = this.getReceivers()
                  .find(r => r.track && r.track.id === track.id);
              } else {
                receiver = {track};
              }
              const event = new Event('track');
              event.track = track;
              event.receiver = receiver;
              event.transceiver = {receiver};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            });
          };
          this.addEventListener('addstream', this._ontrackpoly);
        }
        return origSetRemoteDescription.apply(this, arguments);
      };
  } else {
    // even if RTCRtpTransceiver is in window, it is only used and
    // emitted in unified-plan. Unfortunately this means we need
    // to unconditionally wrap the event.
    wrapPeerConnectionEvent(window, 'track', e => {
      if (!e.transceiver) {
        Object.defineProperty(e, 'transceiver',
          {value: {receiver: e.receiver}});
      }
      return e;
    });
  }
}

function shimGetSendersWithDtmf(window) {
  // Overrides addTrack/removeTrack, depends on shimAddTrackRemoveTrack.
  if (typeof window === 'object' && window.RTCPeerConnection &&
      !('getSenders' in window.RTCPeerConnection.prototype) &&
      'createDTMFSender' in window.RTCPeerConnection.prototype) {
    const shimSenderWithDtmf = function(pc, track) {
      return {
        track,
        get dtmf() {
          if (this._dtmf === undefined) {
            if (track.kind === 'audio') {
              this._dtmf = pc.createDTMFSender(track);
            } else {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        },
        _pc: pc
      };
    };

    // augment addTrack when getSenders is not available.
    if (!window.RTCPeerConnection.prototype.getSenders) {
      window.RTCPeerConnection.prototype.getSenders = function getSenders() {
        this._senders = this._senders || [];
        return this._senders.slice(); // return a copy of the internal state.
      };
      const origAddTrack = window.RTCPeerConnection.prototype.addTrack;
      window.RTCPeerConnection.prototype.addTrack =
        function addTrack(track, stream) {
          let sender = origAddTrack.apply(this, arguments);
          if (!sender) {
            sender = shimSenderWithDtmf(this, track);
            this._senders.push(sender);
          }
          return sender;
        };

      const origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
      window.RTCPeerConnection.prototype.removeTrack =
        function removeTrack(sender) {
          origRemoveTrack.apply(this, arguments);
          const idx = this._senders.indexOf(sender);
          if (idx !== -1) {
            this._senders.splice(idx, 1);
          }
        };
    }
    const origAddStream = window.RTCPeerConnection.prototype.addStream;
    window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      this._senders = this._senders || [];
      origAddStream.apply(this, [stream]);
      stream.getTracks().forEach(track => {
        this._senders.push(shimSenderWithDtmf(this, track));
      });
    };

    const origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
    window.RTCPeerConnection.prototype.removeStream =
      function removeStream(stream) {
        this._senders = this._senders || [];
        origRemoveStream.apply(this, [stream]);

        stream.getTracks().forEach(track => {
          const sender = this._senders.find(s => s.track === track);
          if (sender) { // remove sender
            this._senders.splice(this._senders.indexOf(sender), 1);
          }
        });
      };
  } else if (typeof window === 'object' && window.RTCPeerConnection &&
             'getSenders' in window.RTCPeerConnection.prototype &&
             'createDTMFSender' in window.RTCPeerConnection.prototype &&
             window.RTCRtpSender &&
             !('dtmf' in window.RTCRtpSender.prototype)) {
    const origGetSenders = window.RTCPeerConnection.prototype.getSenders;
    window.RTCPeerConnection.prototype.getSenders = function getSenders() {
      const senders = origGetSenders.apply(this, []);
      senders.forEach(sender => sender._pc = this);
      return senders;
    };

    Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
      get() {
        if (this._dtmf === undefined) {
          if (this.track.kind === 'audio') {
            this._dtmf = this._pc.createDTMFSender(this.track);
          } else {
            this._dtmf = null;
          }
        }
        return this._dtmf;
      }
    });
  }
}

function shimGetStats(window) {
  if (!window.RTCPeerConnection) {
    return;
  }

  const origGetStats = window.RTCPeerConnection.prototype.getStats;
  window.RTCPeerConnection.prototype.getStats = function getStats() {
    const [selector, onSucc, onErr] = arguments;

    // If selector is a function then we are in the old style stats so just
    // pass back the original getStats format to avoid breaking old users.
    if (arguments.length > 0 && typeof selector === 'function') {
      return origGetStats.apply(this, arguments);
    }

    // When spec-style getStats is supported, return those when called with
    // either no arguments or the selector argument is null.
    if (origGetStats.length === 0 && (arguments.length === 0 ||
        typeof selector !== 'function')) {
      return origGetStats.apply(this, []);
    }

    const fixChromeStats_ = function(response) {
      const standardReport = {};
      const reports = response.result();
      reports.forEach(report => {
        const standardStats = {
          id: report.id,
          timestamp: report.timestamp,
          type: {
            localcandidate: 'local-candidate',
            remotecandidate: 'remote-candidate'
          }[report.type] || report.type
        };
        report.names().forEach(name => {
          standardStats[name] = report.stat(name);
        });
        standardReport[standardStats.id] = standardStats;
      });

      return standardReport;
    };

    // shim getStats with maplike support
    const makeMapStats = function(stats) {
      return new Map(Object.keys(stats).map(key => [key, stats[key]]));
    };

    if (arguments.length >= 2) {
      const successCallbackWrapper_ = function(response) {
        onSucc(makeMapStats(fixChromeStats_(response)));
      };

      return origGetStats.apply(this, [successCallbackWrapper_,
        selector]);
    }

    // promise-support
    return new Promise((resolve, reject) => {
      origGetStats.apply(this, [
        function(response) {
          resolve(makeMapStats(fixChromeStats_(response)));
        }, reject]);
    }).then(onSucc, onErr);
  };
}

function shimSenderReceiverGetStats(window) {
  if (!(typeof window === 'object' && window.RTCPeerConnection &&
      window.RTCRtpSender && window.RTCRtpReceiver)) {
    return;
  }

  // shim sender stats.
  if (!('getStats' in window.RTCRtpSender.prototype)) {
    const origGetSenders = window.RTCPeerConnection.prototype.getSenders;
    if (origGetSenders) {
      window.RTCPeerConnection.prototype.getSenders = function getSenders() {
        const senders = origGetSenders.apply(this, []);
        senders.forEach(sender => sender._pc = this);
        return senders;
      };
    }

    const origAddTrack = window.RTCPeerConnection.prototype.addTrack;
    if (origAddTrack) {
      window.RTCPeerConnection.prototype.addTrack = function addTrack() {
        const sender = origAddTrack.apply(this, arguments);
        sender._pc = this;
        return sender;
      };
    }
    window.RTCRtpSender.prototype.getStats = function getStats() {
      const sender = this;
      return this._pc.getStats().then(result =>
        /* Note: this will include stats of all senders that
         *   send a track with the same id as sender.track as
         *   it is not possible to identify the RTCRtpSender.
         */
        filterStats(result, sender.track, true));
    };
  }

  // shim receiver stats.
  if (!('getStats' in window.RTCRtpReceiver.prototype)) {
    const origGetReceivers = window.RTCPeerConnection.prototype.getReceivers;
    if (origGetReceivers) {
      window.RTCPeerConnection.prototype.getReceivers =
        function getReceivers() {
          const receivers = origGetReceivers.apply(this, []);
          receivers.forEach(receiver => receiver._pc = this);
          return receivers;
        };
    }
    wrapPeerConnectionEvent(window, 'track', e => {
      e.receiver._pc = e.srcElement;
      return e;
    });
    window.RTCRtpReceiver.prototype.getStats = function getStats() {
      const receiver = this;
      return this._pc.getStats().then(result =>
        filterStats(result, receiver.track, false));
    };
  }

  if (!('getStats' in window.RTCRtpSender.prototype &&
      'getStats' in window.RTCRtpReceiver.prototype)) {
    return;
  }

  // shim RTCPeerConnection.getStats(track).
  const origGetStats = window.RTCPeerConnection.prototype.getStats;
  window.RTCPeerConnection.prototype.getStats = function getStats() {
    if (arguments.length > 0 &&
        arguments[0] instanceof window.MediaStreamTrack) {
      const track = arguments[0];
      let sender;
      let receiver;
      let err;
      this.getSenders().forEach(s => {
        if (s.track === track) {
          if (sender) {
            err = true;
          } else {
            sender = s;
          }
        }
      });
      this.getReceivers().forEach(r => {
        if (r.track === track) {
          if (receiver) {
            err = true;
          } else {
            receiver = r;
          }
        }
        return r.track === track;
      });
      if (err || (sender && receiver)) {
        return Promise.reject(new DOMException(
          'There are more than one sender or receiver for the track.',
          'InvalidAccessError'));
      } else if (sender) {
        return sender.getStats();
      } else if (receiver) {
        return receiver.getStats();
      }
      return Promise.reject(new DOMException(
        'There is no sender or receiver for the track.',
        'InvalidAccessError'));
    }
    return origGetStats.apply(this, arguments);
  };
}

function shimAddTrackRemoveTrackWithNative(window) {
  // shim addTrack/removeTrack with native variants in order to make
  // the interactions with legacy getLocalStreams behave as in other browsers.
  // Keeps a mapping stream.id => [stream, rtpsenders...]
  window.RTCPeerConnection.prototype.getLocalStreams =
    function getLocalStreams() {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      return Object.keys(this._shimmedLocalStreams)
        .map(streamId => this._shimmedLocalStreams[streamId][0]);
    };

  const origAddTrack = window.RTCPeerConnection.prototype.addTrack;
  window.RTCPeerConnection.prototype.addTrack =
    function addTrack(track, stream) {
      if (!stream) {
        return origAddTrack.apply(this, arguments);
      }
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};

      const sender = origAddTrack.apply(this, arguments);
      if (!this._shimmedLocalStreams[stream.id]) {
        this._shimmedLocalStreams[stream.id] = [stream, sender];
      } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
        this._shimmedLocalStreams[stream.id].push(sender);
      }
      return sender;
    };

  const origAddStream = window.RTCPeerConnection.prototype.addStream;
  window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};

    stream.getTracks().forEach(track => {
      const alreadyExists = this.getSenders().find(s => s.track === track);
      if (alreadyExists) {
        throw new DOMException('Track already exists.',
            'InvalidAccessError');
      }
    });
    const existingSenders = this.getSenders();
    origAddStream.apply(this, arguments);
    const newSenders = this.getSenders()
      .filter(newSender => existingSenders.indexOf(newSender) === -1);
    this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
  };

  const origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
  window.RTCPeerConnection.prototype.removeStream =
    function removeStream(stream) {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      delete this._shimmedLocalStreams[stream.id];
      return origRemoveStream.apply(this, arguments);
    };

  const origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
  window.RTCPeerConnection.prototype.removeTrack =
    function removeTrack(sender) {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      if (sender) {
        Object.keys(this._shimmedLocalStreams).forEach(streamId => {
          const idx = this._shimmedLocalStreams[streamId].indexOf(sender);
          if (idx !== -1) {
            this._shimmedLocalStreams[streamId].splice(idx, 1);
          }
          if (this._shimmedLocalStreams[streamId].length === 1) {
            delete this._shimmedLocalStreams[streamId];
          }
        });
      }
      return origRemoveTrack.apply(this, arguments);
    };
}

function shimAddTrackRemoveTrack(window, browserDetails) {
  if (!window.RTCPeerConnection) {
    return;
  }
  // shim addTrack and removeTrack.
  if (window.RTCPeerConnection.prototype.addTrack &&
      browserDetails.version >= 65) {
    return shimAddTrackRemoveTrackWithNative(window);
  }

  // also shim pc.getLocalStreams when addTrack is shimmed
  // to return the original streams.
  const origGetLocalStreams = window.RTCPeerConnection.prototype
      .getLocalStreams;
  window.RTCPeerConnection.prototype.getLocalStreams =
    function getLocalStreams() {
      const nativeStreams = origGetLocalStreams.apply(this);
      this._reverseStreams = this._reverseStreams || {};
      return nativeStreams.map(stream => this._reverseStreams[stream.id]);
    };

  const origAddStream = window.RTCPeerConnection.prototype.addStream;
  window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};

    stream.getTracks().forEach(track => {
      const alreadyExists = this.getSenders().find(s => s.track === track);
      if (alreadyExists) {
        throw new DOMException('Track already exists.',
            'InvalidAccessError');
      }
    });
    // Add identity mapping for consistency with addTrack.
    // Unless this is being used with a stream from addTrack.
    if (!this._reverseStreams[stream.id]) {
      const newStream = new window.MediaStream(stream.getTracks());
      this._streams[stream.id] = newStream;
      this._reverseStreams[newStream.id] = stream;
      stream = newStream;
    }
    origAddStream.apply(this, [stream]);
  };

  const origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
  window.RTCPeerConnection.prototype.removeStream =
    function removeStream(stream) {
      this._streams = this._streams || {};
      this._reverseStreams = this._reverseStreams || {};

      origRemoveStream.apply(this, [(this._streams[stream.id] || stream)]);
      delete this._reverseStreams[(this._streams[stream.id] ?
          this._streams[stream.id].id : stream.id)];
      delete this._streams[stream.id];
    };

  window.RTCPeerConnection.prototype.addTrack =
    function addTrack(track, stream) {
      if (this.signalingState === 'closed') {
        throw new DOMException(
          'The RTCPeerConnection\'s signalingState is \'closed\'.',
          'InvalidStateError');
      }
      const streams = [].slice.call(arguments, 1);
      if (streams.length !== 1 ||
          !streams[0].getTracks().find(t => t === track)) {
        // this is not fully correct but all we can manage without
        // [[associated MediaStreams]] internal slot.
        throw new DOMException(
          'The adapter.js addTrack polyfill only supports a single ' +
          ' stream which is associated with the specified track.',
          'NotSupportedError');
      }

      const alreadyExists = this.getSenders().find(s => s.track === track);
      if (alreadyExists) {
        throw new DOMException('Track already exists.',
            'InvalidAccessError');
      }

      this._streams = this._streams || {};
      this._reverseStreams = this._reverseStreams || {};
      const oldStream = this._streams[stream.id];
      if (oldStream) {
        // this is using odd Chrome behaviour, use with caution:
        // https://bugs.chromium.org/p/webrtc/issues/detail?id=7815
        // Note: we rely on the high-level addTrack/dtmf shim to
        // create the sender with a dtmf sender.
        oldStream.addTrack(track);

        // Trigger ONN async.
        Promise.resolve().then(() => {
          this.dispatchEvent(new Event('negotiationneeded'));
        });
      } else {
        const newStream = new window.MediaStream([track]);
        this._streams[stream.id] = newStream;
        this._reverseStreams[newStream.id] = stream;
        this.addStream(newStream);
      }
      return this.getSenders().find(s => s.track === track);
    };

  // replace the internal stream id with the external one and
  // vice versa.
  function replaceInternalStreamId(pc, description) {
    let sdp = description.sdp;
    Object.keys(pc._reverseStreams || []).forEach(internalId => {
      const externalStream = pc._reverseStreams[internalId];
      const internalStream = pc._streams[externalStream.id];
      sdp = sdp.replace(new RegExp(internalStream.id, 'g'),
          externalStream.id);
    });
    return new RTCSessionDescription({
      type: description.type,
      sdp
    });
  }
  function replaceExternalStreamId(pc, description) {
    let sdp = description.sdp;
    Object.keys(pc._reverseStreams || []).forEach(internalId => {
      const externalStream = pc._reverseStreams[internalId];
      const internalStream = pc._streams[externalStream.id];
      sdp = sdp.replace(new RegExp(externalStream.id, 'g'),
          internalStream.id);
    });
    return new RTCSessionDescription({
      type: description.type,
      sdp
    });
  }
  ['createOffer', 'createAnswer'].forEach(function(method) {
    const nativeMethod = window.RTCPeerConnection.prototype[method];
    const methodObj = {[method]() {
      const args = arguments;
      const isLegacyCall = arguments.length &&
          typeof arguments[0] === 'function';
      if (isLegacyCall) {
        return nativeMethod.apply(this, [
          (description) => {
            const desc = replaceInternalStreamId(this, description);
            args[0].apply(null, [desc]);
          },
          (err) => {
            if (args[1]) {
              args[1].apply(null, err);
            }
          }, arguments[2]
        ]);
      }
      return nativeMethod.apply(this, arguments)
      .then(description => replaceInternalStreamId(this, description));
    }};
    window.RTCPeerConnection.prototype[method] = methodObj[method];
  });

  const origSetLocalDescription =
      window.RTCPeerConnection.prototype.setLocalDescription;
  window.RTCPeerConnection.prototype.setLocalDescription =
    function setLocalDescription() {
      if (!arguments.length || !arguments[0].type) {
        return origSetLocalDescription.apply(this, arguments);
      }
      arguments[0] = replaceExternalStreamId(this, arguments[0]);
      return origSetLocalDescription.apply(this, arguments);
    };

  // TODO: mangle getStats: https://w3c.github.io/webrtc-stats/#dom-rtcmediastreamstats-streamidentifier

  const origLocalDescription = Object.getOwnPropertyDescriptor(
      window.RTCPeerConnection.prototype, 'localDescription');
  Object.defineProperty(window.RTCPeerConnection.prototype,
      'localDescription', {
        get() {
          const description = origLocalDescription.get.apply(this);
          if (description.type === '') {
            return description;
          }
          return replaceInternalStreamId(this, description);
        }
      });

  window.RTCPeerConnection.prototype.removeTrack =
    function removeTrack(sender) {
      if (this.signalingState === 'closed') {
        throw new DOMException(
          'The RTCPeerConnection\'s signalingState is \'closed\'.',
          'InvalidStateError');
      }
      // We can not yet check for sender instanceof RTCRtpSender
      // since we shim RTPSender. So we check if sender._pc is set.
      if (!sender._pc) {
        throw new DOMException('Argument 1 of RTCPeerConnection.removeTrack ' +
            'does not implement interface RTCRtpSender.', 'TypeError');
      }
      const isLocal = sender._pc === this;
      if (!isLocal) {
        throw new DOMException('Sender was not created by this connection.',
            'InvalidAccessError');
      }

      // Search for the native stream the senders track belongs to.
      this._streams = this._streams || {};
      let stream;
      Object.keys(this._streams).forEach(streamid => {
        const hasTrack = this._streams[streamid].getTracks()
          .find(track => sender.track === track);
        if (hasTrack) {
          stream = this._streams[streamid];
        }
      });

      if (stream) {
        if (stream.getTracks().length === 1) {
          // if this is the last track of the stream, remove the stream. This
          // takes care of any shimmed _senders.
          this.removeStream(this._reverseStreams[stream.id]);
        } else {
          // relying on the same odd chrome behaviour as above.
          stream.removeTrack(sender.track);
        }
        this.dispatchEvent(new Event('negotiationneeded'));
      }
    };
}

function shimPeerConnection$1(window, browserDetails) {
  if (!window.RTCPeerConnection && window.webkitRTCPeerConnection) {
    // very basic support for old versions.
    window.RTCPeerConnection = window.webkitRTCPeerConnection;
  }
  if (!window.RTCPeerConnection) {
    return;
  }

  // shim implicit creation of RTCSessionDescription/RTCIceCandidate
  if (browserDetails.version < 53) {
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          const nativeMethod = window.RTCPeerConnection.prototype[method];
          const methodObj = {[method]() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                window.RTCIceCandidate :
                window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          }};
          window.RTCPeerConnection.prototype[method] = methodObj[method];
        });
  }
}

// Attempt to fix ONN in plan-b mode.
function fixNegotiationNeeded(window, browserDetails) {
  wrapPeerConnectionEvent(window, 'negotiationneeded', e => {
    const pc = e.target;
    if (browserDetails.version < 72 || (pc.getConfiguration &&
        pc.getConfiguration().sdpSemantics === 'plan-b')) {
      if (pc.signalingState !== 'stable') {
        return;
      }
    }
    return e;
  });
}

var chromeShim = /*#__PURE__*/Object.freeze({
    __proto__: null,
    shimMediaStream: shimMediaStream,
    shimOnTrack: shimOnTrack$1,
    shimGetSendersWithDtmf: shimGetSendersWithDtmf,
    shimGetStats: shimGetStats,
    shimSenderReceiverGetStats: shimSenderReceiverGetStats,
    shimAddTrackRemoveTrackWithNative: shimAddTrackRemoveTrackWithNative,
    shimAddTrackRemoveTrack: shimAddTrackRemoveTrack,
    shimPeerConnection: shimPeerConnection$1,
    fixNegotiationNeeded: fixNegotiationNeeded,
    shimGetUserMedia: shimGetUserMedia$2,
    shimGetDisplayMedia: shimGetDisplayMedia$1
});

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimGetUserMedia$1(window, browserDetails) {
  const navigator = window && window.navigator;
  const MediaStreamTrack = window && window.MediaStreamTrack;

  navigator.getUserMedia = function(constraints, onSuccess, onError) {
    // Replace Firefox 44+'s deprecation warning with unprefixed version.
    deprecated('navigator.getUserMedia',
        'navigator.mediaDevices.getUserMedia');
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };

  if (!(browserDetails.version > 55 &&
      'autoGainControl' in navigator.mediaDevices.getSupportedConstraints())) {
    const remap = function(obj, a, b) {
      if (a in obj && !(b in obj)) {
        obj[b] = obj[a];
        delete obj[a];
      }
    };

    const nativeGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      if (typeof c === 'object' && typeof c.audio === 'object') {
        c = JSON.parse(JSON.stringify(c));
        remap(c.audio, 'autoGainControl', 'mozAutoGainControl');
        remap(c.audio, 'noiseSuppression', 'mozNoiseSuppression');
      }
      return nativeGetUserMedia(c);
    };

    if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
      const nativeGetSettings = MediaStreamTrack.prototype.getSettings;
      MediaStreamTrack.prototype.getSettings = function() {
        const obj = nativeGetSettings.apply(this, arguments);
        remap(obj, 'mozAutoGainControl', 'autoGainControl');
        remap(obj, 'mozNoiseSuppression', 'noiseSuppression');
        return obj;
      };
    }

    if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
      const nativeApplyConstraints =
        MediaStreamTrack.prototype.applyConstraints;
      MediaStreamTrack.prototype.applyConstraints = function(c) {
        if (this.kind === 'audio' && typeof c === 'object') {
          c = JSON.parse(JSON.stringify(c));
          remap(c, 'autoGainControl', 'mozAutoGainControl');
          remap(c, 'noiseSuppression', 'mozNoiseSuppression');
        }
        return nativeApplyConstraints.apply(this, [c]);
      };
    }
  }
}

/*
 *  Copyright (c) 2018 The adapter.js project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimGetDisplayMedia(window, preferredMediaSource) {
  if (window.navigator.mediaDevices &&
    'getDisplayMedia' in window.navigator.mediaDevices) {
    return;
  }
  if (!(window.navigator.mediaDevices)) {
    return;
  }
  window.navigator.mediaDevices.getDisplayMedia =
    function getDisplayMedia(constraints) {
      if (!(constraints && constraints.video)) {
        const err = new DOMException('getDisplayMedia without video ' +
            'constraints is undefined');
        err.name = 'NotFoundError';
        // from https://heycam.github.io/webidl/#idl-DOMException-error-names
        err.code = 8;
        return Promise.reject(err);
      }
      if (constraints.video === true) {
        constraints.video = {mediaSource: preferredMediaSource};
      } else {
        constraints.video.mediaSource = preferredMediaSource;
      }
      return window.navigator.mediaDevices.getUserMedia(constraints);
    };
}

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimOnTrack(window) {
  if (typeof window === 'object' && window.RTCTrackEvent &&
      ('receiver' in window.RTCTrackEvent.prototype) &&
      !('transceiver' in window.RTCTrackEvent.prototype)) {
    Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
      get() {
        return {receiver: this.receiver};
      }
    });
  }
}

function shimPeerConnection(window, browserDetails) {
  if (typeof window !== 'object' ||
      !(window.RTCPeerConnection || window.mozRTCPeerConnection)) {
    return; // probably media.peerconnection.enabled=false in about:config
  }
  if (!window.RTCPeerConnection && window.mozRTCPeerConnection) {
    // very basic support for old versions.
    window.RTCPeerConnection = window.mozRTCPeerConnection;
  }

  if (browserDetails.version < 53) {
    // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          const nativeMethod = window.RTCPeerConnection.prototype[method];
          const methodObj = {[method]() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                window.RTCIceCandidate :
                window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          }};
          window.RTCPeerConnection.prototype[method] = methodObj[method];
        });
  }

  const modernStatsTypes = {
    inboundrtp: 'inbound-rtp',
    outboundrtp: 'outbound-rtp',
    candidatepair: 'candidate-pair',
    localcandidate: 'local-candidate',
    remotecandidate: 'remote-candidate'
  };

  const nativeGetStats = window.RTCPeerConnection.prototype.getStats;
  window.RTCPeerConnection.prototype.getStats = function getStats() {
    const [selector, onSucc, onErr] = arguments;
    return nativeGetStats.apply(this, [selector || null])
      .then(stats => {
        if (browserDetails.version < 53 && !onSucc) {
          // Shim only promise getStats with spec-hyphens in type names
          // Leave callback version alone; misc old uses of forEach before Map
          try {
            stats.forEach(stat => {
              stat.type = modernStatsTypes[stat.type] || stat.type;
            });
          } catch (e) {
            if (e.name !== 'TypeError') {
              throw e;
            }
            // Avoid TypeError: "type" is read-only, in old versions. 34-43ish
            stats.forEach((stat, i) => {
              stats.set(i, Object.assign({}, stat, {
                type: modernStatsTypes[stat.type] || stat.type
              }));
            });
          }
        }
        return stats;
      })
      .then(onSucc, onErr);
  };
}

function shimSenderGetStats(window) {
  if (!(typeof window === 'object' && window.RTCPeerConnection &&
      window.RTCRtpSender)) {
    return;
  }
  if (window.RTCRtpSender && 'getStats' in window.RTCRtpSender.prototype) {
    return;
  }
  const origGetSenders = window.RTCPeerConnection.prototype.getSenders;
  if (origGetSenders) {
    window.RTCPeerConnection.prototype.getSenders = function getSenders() {
      const senders = origGetSenders.apply(this, []);
      senders.forEach(sender => sender._pc = this);
      return senders;
    };
  }

  const origAddTrack = window.RTCPeerConnection.prototype.addTrack;
  if (origAddTrack) {
    window.RTCPeerConnection.prototype.addTrack = function addTrack() {
      const sender = origAddTrack.apply(this, arguments);
      sender._pc = this;
      return sender;
    };
  }
  window.RTCRtpSender.prototype.getStats = function getStats() {
    return this.track ? this._pc.getStats(this.track) :
        Promise.resolve(new Map());
  };
}

function shimReceiverGetStats(window) {
  if (!(typeof window === 'object' && window.RTCPeerConnection &&
      window.RTCRtpSender)) {
    return;
  }
  if (window.RTCRtpSender && 'getStats' in window.RTCRtpReceiver.prototype) {
    return;
  }
  const origGetReceivers = window.RTCPeerConnection.prototype.getReceivers;
  if (origGetReceivers) {
    window.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
      const receivers = origGetReceivers.apply(this, []);
      receivers.forEach(receiver => receiver._pc = this);
      return receivers;
    };
  }
  wrapPeerConnectionEvent(window, 'track', e => {
    e.receiver._pc = e.srcElement;
    return e;
  });
  window.RTCRtpReceiver.prototype.getStats = function getStats() {
    return this._pc.getStats(this.track);
  };
}

function shimRemoveStream(window) {
  if (!window.RTCPeerConnection ||
      'removeStream' in window.RTCPeerConnection.prototype) {
    return;
  }
  window.RTCPeerConnection.prototype.removeStream =
    function removeStream(stream) {
      deprecated('removeStream', 'removeTrack');
      this.getSenders().forEach(sender => {
        if (sender.track && stream.getTracks().includes(sender.track)) {
          this.removeTrack(sender);
        }
      });
    };
}

function shimRTCDataChannel(window) {
  // rename DataChannel to RTCDataChannel (native fix in FF60):
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1173851
  if (window.DataChannel && !window.RTCDataChannel) {
    window.RTCDataChannel = window.DataChannel;
  }
}

function shimAddTransceiver(window) {
  // https://github.com/webrtcHacks/adapter/issues/998#issuecomment-516921647
  // Firefox ignores the init sendEncodings options passed to addTransceiver
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1396918
  if (!(typeof window === 'object' && window.RTCPeerConnection)) {
    return;
  }
  const origAddTransceiver = window.RTCPeerConnection.prototype.addTransceiver;
  if (origAddTransceiver) {
    window.RTCPeerConnection.prototype.addTransceiver =
      function addTransceiver() {
        this.setParametersPromises = [];
        // WebIDL input coercion and validation
        let sendEncodings = arguments[1] && arguments[1].sendEncodings;
        if (sendEncodings === undefined) {
          sendEncodings = [];
        }
        sendEncodings = [...sendEncodings];
        const shouldPerformCheck = sendEncodings.length > 0;
        if (shouldPerformCheck) {
          // If sendEncodings params are provided, validate grammar
          sendEncodings.forEach((encodingParam) => {
            if ('rid' in encodingParam) {
              const ridRegex = /^[a-z0-9]{0,16}$/i;
              if (!ridRegex.test(encodingParam.rid)) {
                throw new TypeError('Invalid RID value provided.');
              }
            }
            if ('scaleResolutionDownBy' in encodingParam) {
              if (!(parseFloat(encodingParam.scaleResolutionDownBy) >= 1.0)) {
                throw new RangeError('scale_resolution_down_by must be >= 1.0');
              }
            }
            if ('maxFramerate' in encodingParam) {
              if (!(parseFloat(encodingParam.maxFramerate) >= 0)) {
                throw new RangeError('max_framerate must be >= 0.0');
              }
            }
          });
        }
        const transceiver = origAddTransceiver.apply(this, arguments);
        if (shouldPerformCheck) {
          // Check if the init options were applied. If not we do this in an
          // asynchronous way and save the promise reference in a global object.
          // This is an ugly hack, but at the same time is way more robust than
          // checking the sender parameters before and after the createOffer
          // Also note that after the createoffer we are not 100% sure that
          // the params were asynchronously applied so we might miss the
          // opportunity to recreate offer.
          const {sender} = transceiver;
          const params = sender.getParameters();
          if (!('encodings' in params) ||
              // Avoid being fooled by patched getParameters() below.
              (params.encodings.length === 1 &&
               Object.keys(params.encodings[0]).length === 0)) {
            params.encodings = sendEncodings;
            sender.sendEncodings = sendEncodings;
            this.setParametersPromises.push(sender.setParameters(params)
              .then(() => {
                delete sender.sendEncodings;
              }).catch(() => {
                delete sender.sendEncodings;
              })
            );
          }
        }
        return transceiver;
      };
  }
}

function shimGetParameters(window) {
  if (!(typeof window === 'object' && window.RTCRtpSender)) {
    return;
  }
  const origGetParameters = window.RTCRtpSender.prototype.getParameters;
  if (origGetParameters) {
    window.RTCRtpSender.prototype.getParameters =
      function getParameters() {
        const params = origGetParameters.apply(this, arguments);
        if (!('encodings' in params)) {
          params.encodings = [].concat(this.sendEncodings || [{}]);
        }
        return params;
      };
  }
}

function shimCreateOffer(window) {
  // https://github.com/webrtcHacks/adapter/issues/998#issuecomment-516921647
  // Firefox ignores the init sendEncodings options passed to addTransceiver
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1396918
  if (!(typeof window === 'object' && window.RTCPeerConnection)) {
    return;
  }
  const origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
  window.RTCPeerConnection.prototype.createOffer = function createOffer() {
    if (this.setParametersPromises && this.setParametersPromises.length) {
      return Promise.all(this.setParametersPromises)
      .then(() => {
        return origCreateOffer.apply(this, arguments);
      })
      .finally(() => {
        this.setParametersPromises = [];
      });
    }
    return origCreateOffer.apply(this, arguments);
  };
}

function shimCreateAnswer(window) {
  // https://github.com/webrtcHacks/adapter/issues/998#issuecomment-516921647
  // Firefox ignores the init sendEncodings options passed to addTransceiver
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1396918
  if (!(typeof window === 'object' && window.RTCPeerConnection)) {
    return;
  }
  const origCreateAnswer = window.RTCPeerConnection.prototype.createAnswer;
  window.RTCPeerConnection.prototype.createAnswer = function createAnswer() {
    if (this.setParametersPromises && this.setParametersPromises.length) {
      return Promise.all(this.setParametersPromises)
      .then(() => {
        return origCreateAnswer.apply(this, arguments);
      })
      .finally(() => {
        this.setParametersPromises = [];
      });
    }
    return origCreateAnswer.apply(this, arguments);
  };
}

var firefoxShim = /*#__PURE__*/Object.freeze({
    __proto__: null,
    shimOnTrack: shimOnTrack,
    shimPeerConnection: shimPeerConnection,
    shimSenderGetStats: shimSenderGetStats,
    shimReceiverGetStats: shimReceiverGetStats,
    shimRemoveStream: shimRemoveStream,
    shimRTCDataChannel: shimRTCDataChannel,
    shimAddTransceiver: shimAddTransceiver,
    shimGetParameters: shimGetParameters,
    shimCreateOffer: shimCreateOffer,
    shimCreateAnswer: shimCreateAnswer,
    shimGetUserMedia: shimGetUserMedia$1,
    shimGetDisplayMedia: shimGetDisplayMedia
});

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimLocalStreamsAPI(window) {
  if (typeof window !== 'object' || !window.RTCPeerConnection) {
    return;
  }
  if (!('getLocalStreams' in window.RTCPeerConnection.prototype)) {
    window.RTCPeerConnection.prototype.getLocalStreams =
      function getLocalStreams() {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        return this._localStreams;
      };
  }
  if (!('addStream' in window.RTCPeerConnection.prototype)) {
    const _addTrack = window.RTCPeerConnection.prototype.addTrack;
    window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      if (!this._localStreams.includes(stream)) {
        this._localStreams.push(stream);
      }
      // Try to emulate Chrome's behaviour of adding in audio-video order.
      // Safari orders by track id.
      stream.getAudioTracks().forEach(track => _addTrack.call(this, track,
        stream));
      stream.getVideoTracks().forEach(track => _addTrack.call(this, track,
        stream));
    };

    window.RTCPeerConnection.prototype.addTrack =
      function addTrack(track, ...streams) {
        if (streams) {
          streams.forEach((stream) => {
            if (!this._localStreams) {
              this._localStreams = [stream];
            } else if (!this._localStreams.includes(stream)) {
              this._localStreams.push(stream);
            }
          });
        }
        return _addTrack.apply(this, arguments);
      };
  }
  if (!('removeStream' in window.RTCPeerConnection.prototype)) {
    window.RTCPeerConnection.prototype.removeStream =
      function removeStream(stream) {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        const index = this._localStreams.indexOf(stream);
        if (index === -1) {
          return;
        }
        this._localStreams.splice(index, 1);
        const tracks = stream.getTracks();
        this.getSenders().forEach(sender => {
          if (tracks.includes(sender.track)) {
            this.removeTrack(sender);
          }
        });
      };
  }
}

function shimRemoteStreamsAPI(window) {
  if (typeof window !== 'object' || !window.RTCPeerConnection) {
    return;
  }
  if (!('getRemoteStreams' in window.RTCPeerConnection.prototype)) {
    window.RTCPeerConnection.prototype.getRemoteStreams =
      function getRemoteStreams() {
        return this._remoteStreams ? this._remoteStreams : [];
      };
  }
  if (!('onaddstream' in window.RTCPeerConnection.prototype)) {
    Object.defineProperty(window.RTCPeerConnection.prototype, 'onaddstream', {
      get() {
        return this._onaddstream;
      },
      set(f) {
        if (this._onaddstream) {
          this.removeEventListener('addstream', this._onaddstream);
          this.removeEventListener('track', this._onaddstreampoly);
        }
        this.addEventListener('addstream', this._onaddstream = f);
        this.addEventListener('track', this._onaddstreampoly = (e) => {
          e.streams.forEach(stream => {
            if (!this._remoteStreams) {
              this._remoteStreams = [];
            }
            if (this._remoteStreams.includes(stream)) {
              return;
            }
            this._remoteStreams.push(stream);
            const event = new Event('addstream');
            event.stream = stream;
            this.dispatchEvent(event);
          });
        });
      }
    });
    const origSetRemoteDescription =
      window.RTCPeerConnection.prototype.setRemoteDescription;
    window.RTCPeerConnection.prototype.setRemoteDescription =
      function setRemoteDescription() {
        const pc = this;
        if (!this._onaddstreampoly) {
          this.addEventListener('track', this._onaddstreampoly = function(e) {
            e.streams.forEach(stream => {
              if (!pc._remoteStreams) {
                pc._remoteStreams = [];
              }
              if (pc._remoteStreams.indexOf(stream) >= 0) {
                return;
              }
              pc._remoteStreams.push(stream);
              const event = new Event('addstream');
              event.stream = stream;
              pc.dispatchEvent(event);
            });
          });
        }
        return origSetRemoteDescription.apply(pc, arguments);
      };
  }
}

function shimCallbacksAPI(window) {
  if (typeof window !== 'object' || !window.RTCPeerConnection) {
    return;
  }
  const prototype = window.RTCPeerConnection.prototype;
  const origCreateOffer = prototype.createOffer;
  const origCreateAnswer = prototype.createAnswer;
  const setLocalDescription = prototype.setLocalDescription;
  const setRemoteDescription = prototype.setRemoteDescription;
  const addIceCandidate = prototype.addIceCandidate;

  prototype.createOffer =
    function createOffer(successCallback, failureCallback) {
      const options = (arguments.length >= 2) ? arguments[2] : arguments[0];
      const promise = origCreateOffer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

  prototype.createAnswer =
    function createAnswer(successCallback, failureCallback) {
      const options = (arguments.length >= 2) ? arguments[2] : arguments[0];
      const promise = origCreateAnswer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

  let withCallback = function(description, successCallback, failureCallback) {
    const promise = setLocalDescription.apply(this, [description]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.setLocalDescription = withCallback;

  withCallback = function(description, successCallback, failureCallback) {
    const promise = setRemoteDescription.apply(this, [description]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.setRemoteDescription = withCallback;

  withCallback = function(candidate, successCallback, failureCallback) {
    const promise = addIceCandidate.apply(this, [candidate]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.addIceCandidate = withCallback;
}

function shimGetUserMedia(window) {
  const navigator = window && window.navigator;

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // shim not needed in Safari 12.1
    const mediaDevices = navigator.mediaDevices;
    const _getUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
    navigator.mediaDevices.getUserMedia = (constraints) => {
      return _getUserMedia(shimConstraints(constraints));
    };
  }

  if (!navigator.getUserMedia && navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia) {
    navigator.getUserMedia = function getUserMedia(constraints, cb, errcb) {
      navigator.mediaDevices.getUserMedia(constraints)
      .then(cb, errcb);
    }.bind(navigator);
  }
}

function shimConstraints(constraints) {
  if (constraints && constraints.video !== undefined) {
    return Object.assign({},
      constraints,
      {video: compactObject(constraints.video)}
    );
  }

  return constraints;
}

function shimRTCIceServerUrls(window) {
  if (!window.RTCPeerConnection) {
    return;
  }
  // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
  const OrigPeerConnection = window.RTCPeerConnection;
  window.RTCPeerConnection =
    function RTCPeerConnection(pcConfig, pcConstraints) {
      if (pcConfig && pcConfig.iceServers) {
        const newIceServers = [];
        for (let i = 0; i < pcConfig.iceServers.length; i++) {
          let server = pcConfig.iceServers[i];
          if (!server.hasOwnProperty('urls') &&
              server.hasOwnProperty('url')) {
            deprecated('RTCIceServer.url', 'RTCIceServer.urls');
            server = JSON.parse(JSON.stringify(server));
            server.urls = server.url;
            delete server.url;
            newIceServers.push(server);
          } else {
            newIceServers.push(pcConfig.iceServers[i]);
          }
        }
        pcConfig.iceServers = newIceServers;
      }
      return new OrigPeerConnection(pcConfig, pcConstraints);
    };
  window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
  // wrap static methods. Currently just generateCertificate.
  if ('generateCertificate' in OrigPeerConnection) {
    Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
      get() {
        return OrigPeerConnection.generateCertificate;
      }
    });
  }
}

function shimTrackEventTransceiver(window) {
  // Add event.transceiver member over deprecated event.receiver
  if (typeof window === 'object' && window.RTCTrackEvent &&
      'receiver' in window.RTCTrackEvent.prototype &&
      !('transceiver' in window.RTCTrackEvent.prototype)) {
    Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
      get() {
        return {receiver: this.receiver};
      }
    });
  }
}

function shimCreateOfferLegacy(window) {
  const origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
  window.RTCPeerConnection.prototype.createOffer =
    function createOffer(offerOptions) {
      if (offerOptions) {
        if (typeof offerOptions.offerToReceiveAudio !== 'undefined') {
          // support bit values
          offerOptions.offerToReceiveAudio =
            !!offerOptions.offerToReceiveAudio;
        }
        const audioTransceiver = this.getTransceivers().find(transceiver =>
          transceiver.receiver.track.kind === 'audio');
        if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
          if (audioTransceiver.direction === 'sendrecv') {
            if (audioTransceiver.setDirection) {
              audioTransceiver.setDirection('sendonly');
            } else {
              audioTransceiver.direction = 'sendonly';
            }
          } else if (audioTransceiver.direction === 'recvonly') {
            if (audioTransceiver.setDirection) {
              audioTransceiver.setDirection('inactive');
            } else {
              audioTransceiver.direction = 'inactive';
            }
          }
        } else if (offerOptions.offerToReceiveAudio === true &&
            !audioTransceiver) {
          this.addTransceiver('audio', {direction: 'recvonly'});
        }

        if (typeof offerOptions.offerToReceiveVideo !== 'undefined') {
          // support bit values
          offerOptions.offerToReceiveVideo =
            !!offerOptions.offerToReceiveVideo;
        }
        const videoTransceiver = this.getTransceivers().find(transceiver =>
          transceiver.receiver.track.kind === 'video');
        if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
          if (videoTransceiver.direction === 'sendrecv') {
            if (videoTransceiver.setDirection) {
              videoTransceiver.setDirection('sendonly');
            } else {
              videoTransceiver.direction = 'sendonly';
            }
          } else if (videoTransceiver.direction === 'recvonly') {
            if (videoTransceiver.setDirection) {
              videoTransceiver.setDirection('inactive');
            } else {
              videoTransceiver.direction = 'inactive';
            }
          }
        } else if (offerOptions.offerToReceiveVideo === true &&
            !videoTransceiver) {
          this.addTransceiver('video', {direction: 'recvonly'});
        }
      }
      return origCreateOffer.apply(this, arguments);
    };
}

function shimAudioContext(window) {
  if (typeof window !== 'object' || window.AudioContext) {
    return;
  }
  window.AudioContext = window.webkitAudioContext;
}

var safariShim = /*#__PURE__*/Object.freeze({
    __proto__: null,
    shimLocalStreamsAPI: shimLocalStreamsAPI,
    shimRemoteStreamsAPI: shimRemoteStreamsAPI,
    shimCallbacksAPI: shimCallbacksAPI,
    shimGetUserMedia: shimGetUserMedia,
    shimConstraints: shimConstraints,
    shimRTCIceServerUrls: shimRTCIceServerUrls,
    shimTrackEventTransceiver: shimTrackEventTransceiver,
    shimCreateOfferLegacy: shimCreateOfferLegacy,
    shimAudioContext: shimAudioContext
});

var sdp = createCommonjsModule(function (module) {

// SDP helpers.
const SDPUtils = {};

// Generate an alphanumeric identifier for cname or mids.
// TODO: use UUIDs instead? https://gist.github.com/jed/982883
SDPUtils.generateIdentifier = function() {
  return Math.random().toString(36).substr(2, 10);
};

// The RTCP CNAME used by all peerconnections from the same JS.
SDPUtils.localCName = SDPUtils.generateIdentifier();

// Splits SDP into lines, dealing with both CRLF and LF.
SDPUtils.splitLines = function(blob) {
  return blob.trim().split('\n').map(line => line.trim());
};
// Splits SDP into sessionpart and mediasections. Ensures CRLF.
SDPUtils.splitSections = function(blob) {
  const parts = blob.split('\nm=');
  return parts.map((part, index) => (index > 0 ?
    'm=' + part : part).trim() + '\r\n');
};

// Returns the session description.
SDPUtils.getDescription = function(blob) {
  const sections = SDPUtils.splitSections(blob);
  return sections && sections[0];
};

// Returns the individual media sections.
SDPUtils.getMediaSections = function(blob) {
  const sections = SDPUtils.splitSections(blob);
  sections.shift();
  return sections;
};

// Returns lines that start with a certain prefix.
SDPUtils.matchPrefix = function(blob, prefix) {
  return SDPUtils.splitLines(blob).filter(line => line.indexOf(prefix) === 0);
};

// Parses an ICE candidate line. Sample input:
// candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
// rport 55996"
// Input can be prefixed with a=.
SDPUtils.parseCandidate = function(line) {
  let parts;
  // Parse both variants.
  if (line.indexOf('a=candidate:') === 0) {
    parts = line.substring(12).split(' ');
  } else {
    parts = line.substring(10).split(' ');
  }

  const candidate = {
    foundation: parts[0],
    component: {1: 'rtp', 2: 'rtcp'}[parts[1]] || parts[1],
    protocol: parts[2].toLowerCase(),
    priority: parseInt(parts[3], 10),
    ip: parts[4],
    address: parts[4], // address is an alias for ip.
    port: parseInt(parts[5], 10),
    // skip parts[6] == 'typ'
    type: parts[7],
  };

  for (let i = 8; i < parts.length; i += 2) {
    switch (parts[i]) {
      case 'raddr':
        candidate.relatedAddress = parts[i + 1];
        break;
      case 'rport':
        candidate.relatedPort = parseInt(parts[i + 1], 10);
        break;
      case 'tcptype':
        candidate.tcpType = parts[i + 1];
        break;
      case 'ufrag':
        candidate.ufrag = parts[i + 1]; // for backward compatibility.
        candidate.usernameFragment = parts[i + 1];
        break;
      default: // extension handling, in particular ufrag. Don't overwrite.
        if (candidate[parts[i]] === undefined) {
          candidate[parts[i]] = parts[i + 1];
        }
        break;
    }
  }
  return candidate;
};

// Translates a candidate object into SDP candidate attribute.
// This does not include the a= prefix!
SDPUtils.writeCandidate = function(candidate) {
  const sdp = [];
  sdp.push(candidate.foundation);

  const component = candidate.component;
  if (component === 'rtp') {
    sdp.push(1);
  } else if (component === 'rtcp') {
    sdp.push(2);
  } else {
    sdp.push(component);
  }
  sdp.push(candidate.protocol.toUpperCase());
  sdp.push(candidate.priority);
  sdp.push(candidate.address || candidate.ip);
  sdp.push(candidate.port);

  const type = candidate.type;
  sdp.push('typ');
  sdp.push(type);
  if (type !== 'host' && candidate.relatedAddress &&
      candidate.relatedPort) {
    sdp.push('raddr');
    sdp.push(candidate.relatedAddress);
    sdp.push('rport');
    sdp.push(candidate.relatedPort);
  }
  if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
    sdp.push('tcptype');
    sdp.push(candidate.tcpType);
  }
  if (candidate.usernameFragment || candidate.ufrag) {
    sdp.push('ufrag');
    sdp.push(candidate.usernameFragment || candidate.ufrag);
  }
  return 'candidate:' + sdp.join(' ');
};

// Parses an ice-options line, returns an array of option tags.
// Sample input:
// a=ice-options:foo bar
SDPUtils.parseIceOptions = function(line) {
  return line.substr(14).split(' ');
};

// Parses a rtpmap line, returns RTCRtpCoddecParameters. Sample input:
// a=rtpmap:111 opus/48000/2
SDPUtils.parseRtpMap = function(line) {
  let parts = line.substr(9).split(' ');
  const parsed = {
    payloadType: parseInt(parts.shift(), 10), // was: id
  };

  parts = parts[0].split('/');

  parsed.name = parts[0];
  parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
  parsed.channels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
  // legacy alias, got renamed back to channels in ORTC.
  parsed.numChannels = parsed.channels;
  return parsed;
};

// Generates a rtpmap line from RTCRtpCodecCapability or
// RTCRtpCodecParameters.
SDPUtils.writeRtpMap = function(codec) {
  let pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  const channels = codec.channels || codec.numChannels || 1;
  return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
      (channels !== 1 ? '/' + channels : '') + '\r\n';
};

// Parses a extmap line (headerextension from RFC 5285). Sample input:
// a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
// a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset
SDPUtils.parseExtmap = function(line) {
  const parts = line.substr(9).split(' ');
  return {
    id: parseInt(parts[0], 10),
    direction: parts[0].indexOf('/') > 0 ? parts[0].split('/')[1] : 'sendrecv',
    uri: parts[1],
  };
};

// Generates an extmap line from RTCRtpHeaderExtensionParameters or
// RTCRtpHeaderExtension.
SDPUtils.writeExtmap = function(headerExtension) {
  return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
      (headerExtension.direction && headerExtension.direction !== 'sendrecv'
        ? '/' + headerExtension.direction
        : '') +
      ' ' + headerExtension.uri + '\r\n';
};

// Parses a fmtp line, returns dictionary. Sample input:
// a=fmtp:96 vbr=on;cng=on
// Also deals with vbr=on; cng=on
SDPUtils.parseFmtp = function(line) {
  const parsed = {};
  let kv;
  const parts = line.substr(line.indexOf(' ') + 1).split(';');
  for (let j = 0; j < parts.length; j++) {
    kv = parts[j].trim().split('=');
    parsed[kv[0].trim()] = kv[1];
  }
  return parsed;
};

// Generates a fmtp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeFmtp = function(codec) {
  let line = '';
  let pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.parameters && Object.keys(codec.parameters).length) {
    const params = [];
    Object.keys(codec.parameters).forEach(param => {
      if (codec.parameters[param] !== undefined) {
        params.push(param + '=' + codec.parameters[param]);
      } else {
        params.push(param);
      }
    });
    line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
  }
  return line;
};

// Parses a rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
// a=rtcp-fb:98 nack rpsi
SDPUtils.parseRtcpFb = function(line) {
  const parts = line.substr(line.indexOf(' ') + 1).split(' ');
  return {
    type: parts.shift(),
    parameter: parts.join(' '),
  };
};

// Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeRtcpFb = function(codec) {
  let lines = '';
  let pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
    // FIXME: special handling for trr-int?
    codec.rtcpFeedback.forEach(fb => {
      lines += 'a=rtcp-fb:' + pt + ' ' + fb.type +
      (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') +
          '\r\n';
    });
  }
  return lines;
};

// Parses a RFC 5576 ssrc media attribute. Sample input:
// a=ssrc:3735928559 cname:something
SDPUtils.parseSsrcMedia = function(line) {
  const sp = line.indexOf(' ');
  const parts = {
    ssrc: parseInt(line.substr(7, sp - 7), 10),
  };
  const colon = line.indexOf(':', sp);
  if (colon > -1) {
    parts.attribute = line.substr(sp + 1, colon - sp - 1);
    parts.value = line.substr(colon + 1);
  } else {
    parts.attribute = line.substr(sp + 1);
  }
  return parts;
};

// Parse a ssrc-group line (see RFC 5576). Sample input:
// a=ssrc-group:semantics 12 34
SDPUtils.parseSsrcGroup = function(line) {
  const parts = line.substr(13).split(' ');
  return {
    semantics: parts.shift(),
    ssrcs: parts.map(ssrc => parseInt(ssrc, 10)),
  };
};

// Extracts the MID (RFC 5888) from a media section.
// Returns the MID or undefined if no mid line was found.
SDPUtils.getMid = function(mediaSection) {
  const mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];
  if (mid) {
    return mid.substr(6);
  }
};

// Parses a fingerprint line for DTLS-SRTP.
SDPUtils.parseFingerprint = function(line) {
  const parts = line.substr(14).split(' ');
  return {
    algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
    value: parts[1].toUpperCase(), // the definition is upper-case in RFC 4572.
  };
};

// Extracts DTLS parameters from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the fingerprint line as input. See also getIceParameters.
SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
  const lines = SDPUtils.matchPrefix(mediaSection + sessionpart,
    'a=fingerprint:');
  // Note: a=setup line is ignored since we use the 'auto' role in Edge.
  return {
    role: 'auto',
    fingerprints: lines.map(SDPUtils.parseFingerprint),
  };
};

// Serializes DTLS parameters to SDP.
SDPUtils.writeDtlsParameters = function(params, setupType) {
  let sdp = 'a=setup:' + setupType + '\r\n';
  params.fingerprints.forEach(fp => {
    sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
  });
  return sdp;
};

// Parses a=crypto lines into
//   https://rawgit.com/aboba/edgertc/master/msortc-rs4.html#dictionary-rtcsrtpsdesparameters-members
SDPUtils.parseCryptoLine = function(line) {
  const parts = line.substr(9).split(' ');
  return {
    tag: parseInt(parts[0], 10),
    cryptoSuite: parts[1],
    keyParams: parts[2],
    sessionParams: parts.slice(3),
  };
};

SDPUtils.writeCryptoLine = function(parameters) {
  return 'a=crypto:' + parameters.tag + ' ' +
    parameters.cryptoSuite + ' ' +
    (typeof parameters.keyParams === 'object'
      ? SDPUtils.writeCryptoKeyParams(parameters.keyParams)
      : parameters.keyParams) +
    (parameters.sessionParams ? ' ' + parameters.sessionParams.join(' ') : '') +
    '\r\n';
};

// Parses the crypto key parameters into
//   https://rawgit.com/aboba/edgertc/master/msortc-rs4.html#rtcsrtpkeyparam*
SDPUtils.parseCryptoKeyParams = function(keyParams) {
  if (keyParams.indexOf('inline:') !== 0) {
    return null;
  }
  const parts = keyParams.substr(7).split('|');
  return {
    keyMethod: 'inline',
    keySalt: parts[0],
    lifeTime: parts[1],
    mkiValue: parts[2] ? parts[2].split(':')[0] : undefined,
    mkiLength: parts[2] ? parts[2].split(':')[1] : undefined,
  };
};

SDPUtils.writeCryptoKeyParams = function(keyParams) {
  return keyParams.keyMethod + ':'
    + keyParams.keySalt +
    (keyParams.lifeTime ? '|' + keyParams.lifeTime : '') +
    (keyParams.mkiValue && keyParams.mkiLength
      ? '|' + keyParams.mkiValue + ':' + keyParams.mkiLength
      : '');
};

// Extracts all SDES parameters.
SDPUtils.getCryptoParameters = function(mediaSection, sessionpart) {
  const lines = SDPUtils.matchPrefix(mediaSection + sessionpart,
    'a=crypto:');
  return lines.map(SDPUtils.parseCryptoLine);
};

// Parses ICE information from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the ice-ufrag and ice-pwd lines as input.
SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
  const ufrag = SDPUtils.matchPrefix(mediaSection + sessionpart,
    'a=ice-ufrag:')[0];
  const pwd = SDPUtils.matchPrefix(mediaSection + sessionpart,
    'a=ice-pwd:')[0];
  if (!(ufrag && pwd)) {
    return null;
  }
  return {
    usernameFragment: ufrag.substr(12),
    password: pwd.substr(10),
  };
};

// Serializes ICE parameters to SDP.
SDPUtils.writeIceParameters = function(params) {
  let sdp = 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
      'a=ice-pwd:' + params.password + '\r\n';
  if (params.iceLite) {
    sdp += 'a=ice-lite\r\n';
  }
  return sdp;
};

// Parses the SDP media section and returns RTCRtpParameters.
SDPUtils.parseRtpParameters = function(mediaSection) {
  const description = {
    codecs: [],
    headerExtensions: [],
    fecMechanisms: [],
    rtcp: [],
  };
  const lines = SDPUtils.splitLines(mediaSection);
  const mline = lines[0].split(' ');
  for (let i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
    const pt = mline[i];
    const rtpmapline = SDPUtils.matchPrefix(
      mediaSection, 'a=rtpmap:' + pt + ' ')[0];
    if (rtpmapline) {
      const codec = SDPUtils.parseRtpMap(rtpmapline);
      const fmtps = SDPUtils.matchPrefix(
        mediaSection, 'a=fmtp:' + pt + ' ');
      // Only the first a=fmtp:<pt> is considered.
      codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
      codec.rtcpFeedback = SDPUtils.matchPrefix(
        mediaSection, 'a=rtcp-fb:' + pt + ' ')
        .map(SDPUtils.parseRtcpFb);
      description.codecs.push(codec);
      // parse FEC mechanisms from rtpmap lines.
      switch (codec.name.toUpperCase()) {
        case 'RED':
        case 'ULPFEC':
          description.fecMechanisms.push(codec.name.toUpperCase());
          break;
      }
    }
  }
  SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(line => {
    description.headerExtensions.push(SDPUtils.parseExtmap(line));
  });
  // FIXME: parse rtcp.
  return description;
};

// Generates parts of the SDP media section describing the capabilities /
// parameters.
SDPUtils.writeRtpDescription = function(kind, caps) {
  let sdp = '';

  // Build the mline.
  sdp += 'm=' + kind + ' ';
  sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
  sdp += ' UDP/TLS/RTP/SAVPF ';
  sdp += caps.codecs.map(codec => {
    if (codec.preferredPayloadType !== undefined) {
      return codec.preferredPayloadType;
    }
    return codec.payloadType;
  }).join(' ') + '\r\n';

  sdp += 'c=IN IP4 0.0.0.0\r\n';
  sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

  // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
  caps.codecs.forEach(codec => {
    sdp += SDPUtils.writeRtpMap(codec);
    sdp += SDPUtils.writeFmtp(codec);
    sdp += SDPUtils.writeRtcpFb(codec);
  });
  let maxptime = 0;
  caps.codecs.forEach(codec => {
    if (codec.maxptime > maxptime) {
      maxptime = codec.maxptime;
    }
  });
  if (maxptime > 0) {
    sdp += 'a=maxptime:' + maxptime + '\r\n';
  }

  if (caps.headerExtensions) {
    caps.headerExtensions.forEach(extension => {
      sdp += SDPUtils.writeExtmap(extension);
    });
  }
  // FIXME: write fecMechanisms.
  return sdp;
};

// Parses the SDP media section and returns an array of
// RTCRtpEncodingParameters.
SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
  const encodingParameters = [];
  const description = SDPUtils.parseRtpParameters(mediaSection);
  const hasRed = description.fecMechanisms.indexOf('RED') !== -1;
  const hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

  // filter a=ssrc:... cname:, ignore PlanB-msid
  const ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
    .map(line => SDPUtils.parseSsrcMedia(line))
    .filter(parts => parts.attribute === 'cname');
  const primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
  let secondarySsrc;

  const flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
    .map(line => {
      const parts = line.substr(17).split(' ');
      return parts.map(part => parseInt(part, 10));
    });
  if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
    secondarySsrc = flows[0][1];
  }

  description.codecs.forEach(codec => {
    if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
      let encParam = {
        ssrc: primarySsrc,
        codecPayloadType: parseInt(codec.parameters.apt, 10),
      };
      if (primarySsrc && secondarySsrc) {
        encParam.rtx = {ssrc: secondarySsrc};
      }
      encodingParameters.push(encParam);
      if (hasRed) {
        encParam = JSON.parse(JSON.stringify(encParam));
        encParam.fec = {
          ssrc: primarySsrc,
          mechanism: hasUlpfec ? 'red+ulpfec' : 'red',
        };
        encodingParameters.push(encParam);
      }
    }
  });
  if (encodingParameters.length === 0 && primarySsrc) {
    encodingParameters.push({
      ssrc: primarySsrc,
    });
  }

  // we support both b=AS and b=TIAS but interpret AS as TIAS.
  let bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
  if (bandwidth.length) {
    if (bandwidth[0].indexOf('b=TIAS:') === 0) {
      bandwidth = parseInt(bandwidth[0].substr(7), 10);
    } else if (bandwidth[0].indexOf('b=AS:') === 0) {
      // use formula from JSEP to convert b=AS to TIAS value.
      bandwidth = parseInt(bandwidth[0].substr(5), 10) * 1000 * 0.95
          - (50 * 40 * 8);
    } else {
      bandwidth = undefined;
    }
    encodingParameters.forEach(params => {
      params.maxBitrate = bandwidth;
    });
  }
  return encodingParameters;
};

// parses http://draft.ortc.org/#rtcrtcpparameters*
SDPUtils.parseRtcpParameters = function(mediaSection) {
  const rtcpParameters = {};

  // Gets the first SSRC. Note that with RTX there might be multiple
  // SSRCs.
  const remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
    .map(line => SDPUtils.parseSsrcMedia(line))
    .filter(obj => obj.attribute === 'cname')[0];
  if (remoteSsrc) {
    rtcpParameters.cname = remoteSsrc.value;
    rtcpParameters.ssrc = remoteSsrc.ssrc;
  }

  // Edge uses the compound attribute instead of reducedSize
  // compound is !reducedSize
  const rsize = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-rsize');
  rtcpParameters.reducedSize = rsize.length > 0;
  rtcpParameters.compound = rsize.length === 0;

  // parses the rtcp-mux attrіbute.
  // Note that Edge does not support unmuxed RTCP.
  const mux = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-mux');
  rtcpParameters.mux = mux.length > 0;

  return rtcpParameters;
};

SDPUtils.writeRtcpParameters = function(rtcpParameters) {
  let sdp = '';
  if (rtcpParameters.reducedSize) {
    sdp += 'a=rtcp-rsize\r\n';
  }
  if (rtcpParameters.mux) {
    sdp += 'a=rtcp-mux\r\n';
  }
  if (rtcpParameters.ssrc !== undefined && rtcpParameters.cname) {
    sdp += 'a=ssrc:' + rtcpParameters.ssrc +
      ' cname:' + rtcpParameters.cname + '\r\n';
  }
  return sdp;
};


// parses either a=msid: or a=ssrc:... msid lines and returns
// the id of the MediaStream and MediaStreamTrack.
SDPUtils.parseMsid = function(mediaSection) {
  let parts;
  const spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');
  if (spec.length === 1) {
    parts = spec[0].substr(7).split(' ');
    return {stream: parts[0], track: parts[1]};
  }
  const planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
    .map(line => SDPUtils.parseSsrcMedia(line))
    .filter(msidParts => msidParts.attribute === 'msid');
  if (planB.length > 0) {
    parts = planB[0].value.split(' ');
    return {stream: parts[0], track: parts[1]};
  }
};

// SCTP
// parses draft-ietf-mmusic-sctp-sdp-26 first and falls back
// to draft-ietf-mmusic-sctp-sdp-05
SDPUtils.parseSctpDescription = function(mediaSection) {
  const mline = SDPUtils.parseMLine(mediaSection);
  const maxSizeLine = SDPUtils.matchPrefix(mediaSection, 'a=max-message-size:');
  let maxMessageSize;
  if (maxSizeLine.length > 0) {
    maxMessageSize = parseInt(maxSizeLine[0].substr(19), 10);
  }
  if (isNaN(maxMessageSize)) {
    maxMessageSize = 65536;
  }
  const sctpPort = SDPUtils.matchPrefix(mediaSection, 'a=sctp-port:');
  if (sctpPort.length > 0) {
    return {
      port: parseInt(sctpPort[0].substr(12), 10),
      protocol: mline.fmt,
      maxMessageSize,
    };
  }
  const sctpMapLines = SDPUtils.matchPrefix(mediaSection, 'a=sctpmap:');
  if (sctpMapLines.length > 0) {
    const parts = sctpMapLines[0]
      .substr(10)
      .split(' ');
    return {
      port: parseInt(parts[0], 10),
      protocol: parts[1],
      maxMessageSize,
    };
  }
};

// SCTP
// outputs the draft-ietf-mmusic-sctp-sdp-26 version that all browsers
// support by now receiving in this format, unless we originally parsed
// as the draft-ietf-mmusic-sctp-sdp-05 format (indicated by the m-line
// protocol of DTLS/SCTP -- without UDP/ or TCP/)
SDPUtils.writeSctpDescription = function(media, sctp) {
  let output = [];
  if (media.protocol !== 'DTLS/SCTP') {
    output = [
      'm=' + media.kind + ' 9 ' + media.protocol + ' ' + sctp.protocol + '\r\n',
      'c=IN IP4 0.0.0.0\r\n',
      'a=sctp-port:' + sctp.port + '\r\n',
    ];
  } else {
    output = [
      'm=' + media.kind + ' 9 ' + media.protocol + ' ' + sctp.port + '\r\n',
      'c=IN IP4 0.0.0.0\r\n',
      'a=sctpmap:' + sctp.port + ' ' + sctp.protocol + ' 65535\r\n',
    ];
  }
  if (sctp.maxMessageSize !== undefined) {
    output.push('a=max-message-size:' + sctp.maxMessageSize + '\r\n');
  }
  return output.join('');
};

// Generate a session ID for SDP.
// https://tools.ietf.org/html/draft-ietf-rtcweb-jsep-20#section-5.2.1
// recommends using a cryptographically random +ve 64-bit value
// but right now this should be acceptable and within the right range
SDPUtils.generateSessionId = function() {
  return Math.random().toString().substr(2, 21);
};

// Write boiler plate for start of SDP
// sessId argument is optional - if not supplied it will
// be generated randomly
// sessVersion is optional and defaults to 2
// sessUser is optional and defaults to 'thisisadapterortc'
SDPUtils.writeSessionBoilerplate = function(sessId, sessVer, sessUser) {
  let sessionId;
  const version = sessVer !== undefined ? sessVer : 2;
  if (sessId) {
    sessionId = sessId;
  } else {
    sessionId = SDPUtils.generateSessionId();
  }
  const user = sessUser || 'thisisadapterortc';
  // FIXME: sess-id should be an NTP timestamp.
  return 'v=0\r\n' +
      'o=' + user + ' ' + sessionId + ' ' + version +
        ' IN IP4 127.0.0.1\r\n' +
      's=-\r\n' +
      't=0 0\r\n';
};

// Gets the direction from the mediaSection or the sessionpart.
SDPUtils.getDirection = function(mediaSection, sessionpart) {
  // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
  const lines = SDPUtils.splitLines(mediaSection);
  for (let i = 0; i < lines.length; i++) {
    switch (lines[i]) {
      case 'a=sendrecv':
      case 'a=sendonly':
      case 'a=recvonly':
      case 'a=inactive':
        return lines[i].substr(2);
        // FIXME: What should happen here?
    }
  }
  if (sessionpart) {
    return SDPUtils.getDirection(sessionpart);
  }
  return 'sendrecv';
};

SDPUtils.getKind = function(mediaSection) {
  const lines = SDPUtils.splitLines(mediaSection);
  const mline = lines[0].split(' ');
  return mline[0].substr(2);
};

SDPUtils.isRejected = function(mediaSection) {
  return mediaSection.split(' ', 2)[1] === '0';
};

SDPUtils.parseMLine = function(mediaSection) {
  const lines = SDPUtils.splitLines(mediaSection);
  const parts = lines[0].substr(2).split(' ');
  return {
    kind: parts[0],
    port: parseInt(parts[1], 10),
    protocol: parts[2],
    fmt: parts.slice(3).join(' '),
  };
};

SDPUtils.parseOLine = function(mediaSection) {
  const line = SDPUtils.matchPrefix(mediaSection, 'o=')[0];
  const parts = line.substr(2).split(' ');
  return {
    username: parts[0],
    sessionId: parts[1],
    sessionVersion: parseInt(parts[2], 10),
    netType: parts[3],
    addressType: parts[4],
    address: parts[5],
  };
};

// a very naive interpretation of a valid SDP.
SDPUtils.isValidSDP = function(blob) {
  if (typeof blob !== 'string' || blob.length === 0) {
    return false;
  }
  const lines = SDPUtils.splitLines(blob);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length < 2 || lines[i].charAt(1) !== '=') {
      return false;
    }
    // TODO: check the modifier a bit more.
  }
  return true;
};

// Expose public methods.
{
  module.exports = SDPUtils;
}
});

var sdp$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': sdp,
    __moduleExports: sdp
});

/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimRTCIceCandidate(window) {
  // foundation is arbitrarily chosen as an indicator for full support for
  // https://w3c.github.io/webrtc-pc/#rtcicecandidate-interface
  if (!window.RTCIceCandidate || (window.RTCIceCandidate && 'foundation' in
      window.RTCIceCandidate.prototype)) {
    return;
  }

  const NativeRTCIceCandidate = window.RTCIceCandidate;
  window.RTCIceCandidate = function RTCIceCandidate(args) {
    // Remove the a= which shouldn't be part of the candidate string.
    if (typeof args === 'object' && args.candidate &&
        args.candidate.indexOf('a=') === 0) {
      args = JSON.parse(JSON.stringify(args));
      args.candidate = args.candidate.substr(2);
    }

    if (args.candidate && args.candidate.length) {
      // Augment the native candidate with the parsed fields.
      const nativeCandidate = new NativeRTCIceCandidate(args);
      const parsedCandidate = sdp.parseCandidate(args.candidate);
      const augmentedCandidate = Object.assign(nativeCandidate,
          parsedCandidate);

      // Add a serializer that does not serialize the extra attributes.
      augmentedCandidate.toJSON = function toJSON() {
        return {
          candidate: augmentedCandidate.candidate,
          sdpMid: augmentedCandidate.sdpMid,
          sdpMLineIndex: augmentedCandidate.sdpMLineIndex,
          usernameFragment: augmentedCandidate.usernameFragment,
        };
      };
      return augmentedCandidate;
    }
    return new NativeRTCIceCandidate(args);
  };
  window.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;

  // Hook up the augmented candidate in onicecandidate and
  // addEventListener('icecandidate', ...)
  wrapPeerConnectionEvent(window, 'icecandidate', e => {
    if (e.candidate) {
      Object.defineProperty(e, 'candidate', {
        value: new window.RTCIceCandidate(e.candidate),
        writable: 'false'
      });
    }
    return e;
  });
}

function shimMaxMessageSize(window, browserDetails) {
  if (!window.RTCPeerConnection) {
    return;
  }

  if (!('sctp' in window.RTCPeerConnection.prototype)) {
    Object.defineProperty(window.RTCPeerConnection.prototype, 'sctp', {
      get() {
        return typeof this._sctp === 'undefined' ? null : this._sctp;
      }
    });
  }

  const sctpInDescription = function(description) {
    if (!description || !description.sdp) {
      return false;
    }
    const sections = sdp.splitSections(description.sdp);
    sections.shift();
    return sections.some(mediaSection => {
      const mLine = sdp.parseMLine(mediaSection);
      return mLine && mLine.kind === 'application'
          && mLine.protocol.indexOf('SCTP') !== -1;
    });
  };

  const getRemoteFirefoxVersion = function(description) {
    // TODO: Is there a better solution for detecting Firefox?
    const match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
    if (match === null || match.length < 2) {
      return -1;
    }
    const version = parseInt(match[1], 10);
    // Test for NaN (yes, this is ugly)
    return version !== version ? -1 : version;
  };

  const getCanSendMaxMessageSize = function(remoteIsFirefox) {
    // Every implementation we know can send at least 64 KiB.
    // Note: Although Chrome is technically able to send up to 256 KiB, the
    //       data does not reach the other peer reliably.
    //       See: https://bugs.chromium.org/p/webrtc/issues/detail?id=8419
    let canSendMaxMessageSize = 65536;
    if (browserDetails.browser === 'firefox') {
      if (browserDetails.version < 57) {
        if (remoteIsFirefox === -1) {
          // FF < 57 will send in 16 KiB chunks using the deprecated PPID
          // fragmentation.
          canSendMaxMessageSize = 16384;
        } else {
          // However, other FF (and RAWRTC) can reassemble PPID-fragmented
          // messages. Thus, supporting ~2 GiB when sending.
          canSendMaxMessageSize = 2147483637;
        }
      } else if (browserDetails.version < 60) {
        // Currently, all FF >= 57 will reset the remote maximum message size
        // to the default value when a data channel is created at a later
        // stage. :(
        // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831
        canSendMaxMessageSize =
          browserDetails.version === 57 ? 65535 : 65536;
      } else {
        // FF >= 60 supports sending ~2 GiB
        canSendMaxMessageSize = 2147483637;
      }
    }
    return canSendMaxMessageSize;
  };

  const getMaxMessageSize = function(description, remoteIsFirefox) {
    // Note: 65536 bytes is the default value from the SDP spec. Also,
    //       every implementation we know supports receiving 65536 bytes.
    let maxMessageSize = 65536;

    // FF 57 has a slightly incorrect default remote max message size, so
    // we need to adjust it here to avoid a failure when sending.
    // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1425697
    if (browserDetails.browser === 'firefox'
         && browserDetails.version === 57) {
      maxMessageSize = 65535;
    }

    const match = sdp.matchPrefix(description.sdp,
      'a=max-message-size:');
    if (match.length > 0) {
      maxMessageSize = parseInt(match[0].substr(19), 10);
    } else if (browserDetails.browser === 'firefox' &&
                remoteIsFirefox !== -1) {
      // If the maximum message size is not present in the remote SDP and
      // both local and remote are Firefox, the remote peer can receive
      // ~2 GiB.
      maxMessageSize = 2147483637;
    }
    return maxMessageSize;
  };

  const origSetRemoteDescription =
      window.RTCPeerConnection.prototype.setRemoteDescription;
  window.RTCPeerConnection.prototype.setRemoteDescription =
    function setRemoteDescription() {
      this._sctp = null;
      // Chrome decided to not expose .sctp in plan-b mode.
      // As usual, adapter.js has to do an 'ugly worakaround'
      // to cover up the mess.
      if (browserDetails.browser === 'chrome' && browserDetails.version >= 76) {
        const {sdpSemantics} = this.getConfiguration();
        if (sdpSemantics === 'plan-b') {
          Object.defineProperty(this, 'sctp', {
            get() {
              return typeof this._sctp === 'undefined' ? null : this._sctp;
            },
            enumerable: true,
            configurable: true,
          });
        }
      }

      if (sctpInDescription(arguments[0])) {
        // Check if the remote is FF.
        const isFirefox = getRemoteFirefoxVersion(arguments[0]);

        // Get the maximum message size the local peer is capable of sending
        const canSendMMS = getCanSendMaxMessageSize(isFirefox);

        // Get the maximum message size of the remote peer.
        const remoteMMS = getMaxMessageSize(arguments[0], isFirefox);

        // Determine final maximum message size
        let maxMessageSize;
        if (canSendMMS === 0 && remoteMMS === 0) {
          maxMessageSize = Number.POSITIVE_INFINITY;
        } else if (canSendMMS === 0 || remoteMMS === 0) {
          maxMessageSize = Math.max(canSendMMS, remoteMMS);
        } else {
          maxMessageSize = Math.min(canSendMMS, remoteMMS);
        }

        // Create a dummy RTCSctpTransport object and the 'maxMessageSize'
        // attribute.
        const sctp = {};
        Object.defineProperty(sctp, 'maxMessageSize', {
          get() {
            return maxMessageSize;
          }
        });
        this._sctp = sctp;
      }

      return origSetRemoteDescription.apply(this, arguments);
    };
}

function shimSendThrowTypeError(window) {
  if (!(window.RTCPeerConnection &&
      'createDataChannel' in window.RTCPeerConnection.prototype)) {
    return;
  }

  // Note: Although Firefox >= 57 has a native implementation, the maximum
  //       message size can be reset for all data channels at a later stage.
  //       See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831

  function wrapDcSend(dc, pc) {
    const origDataChannelSend = dc.send;
    dc.send = function send() {
      const data = arguments[0];
      const length = data.length || data.size || data.byteLength;
      if (dc.readyState === 'open' &&
          pc.sctp && length > pc.sctp.maxMessageSize) {
        throw new TypeError('Message too large (can send a maximum of ' +
          pc.sctp.maxMessageSize + ' bytes)');
      }
      return origDataChannelSend.apply(dc, arguments);
    };
  }
  const origCreateDataChannel =
    window.RTCPeerConnection.prototype.createDataChannel;
  window.RTCPeerConnection.prototype.createDataChannel =
    function createDataChannel() {
      const dataChannel = origCreateDataChannel.apply(this, arguments);
      wrapDcSend(dataChannel, this);
      return dataChannel;
    };
  wrapPeerConnectionEvent(window, 'datachannel', e => {
    wrapDcSend(e.channel, e.target);
    return e;
  });
}


/* shims RTCConnectionState by pretending it is the same as iceConnectionState.
 * See https://bugs.chromium.org/p/webrtc/issues/detail?id=6145#c12
 * for why this is a valid hack in Chrome. In Firefox it is slightly incorrect
 * since DTLS failures would be hidden. See
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1265827
 * for the Firefox tracking bug.
 */
function shimConnectionState(window) {
  if (!window.RTCPeerConnection ||
      'connectionState' in window.RTCPeerConnection.prototype) {
    return;
  }
  const proto = window.RTCPeerConnection.prototype;
  Object.defineProperty(proto, 'connectionState', {
    get() {
      return {
        completed: 'connected',
        checking: 'connecting'
      }[this.iceConnectionState] || this.iceConnectionState;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(proto, 'onconnectionstatechange', {
    get() {
      return this._onconnectionstatechange || null;
    },
    set(cb) {
      if (this._onconnectionstatechange) {
        this.removeEventListener('connectionstatechange',
            this._onconnectionstatechange);
        delete this._onconnectionstatechange;
      }
      if (cb) {
        this.addEventListener('connectionstatechange',
            this._onconnectionstatechange = cb);
      }
    },
    enumerable: true,
    configurable: true
  });

  ['setLocalDescription', 'setRemoteDescription'].forEach((method) => {
    const origMethod = proto[method];
    proto[method] = function() {
      if (!this._connectionstatechangepoly) {
        this._connectionstatechangepoly = e => {
          const pc = e.target;
          if (pc._lastConnectionState !== pc.connectionState) {
            pc._lastConnectionState = pc.connectionState;
            const newEvent = new Event('connectionstatechange', e);
            pc.dispatchEvent(newEvent);
          }
          return e;
        };
        this.addEventListener('iceconnectionstatechange',
          this._connectionstatechangepoly);
      }
      return origMethod.apply(this, arguments);
    };
  });
}

function removeExtmapAllowMixed(window, browserDetails) {
  /* remove a=extmap-allow-mixed for webrtc.org < M71 */
  if (!window.RTCPeerConnection) {
    return;
  }
  if (browserDetails.browser === 'chrome' && browserDetails.version >= 71) {
    return;
  }
  if (browserDetails.browser === 'safari' && browserDetails.version >= 605) {
    return;
  }
  const nativeSRD = window.RTCPeerConnection.prototype.setRemoteDescription;
  window.RTCPeerConnection.prototype.setRemoteDescription =
  function setRemoteDescription(desc) {
    if (desc && desc.sdp && desc.sdp.indexOf('\na=extmap-allow-mixed') !== -1) {
      const sdp = desc.sdp.split('\n').filter((line) => {
        return line.trim() !== 'a=extmap-allow-mixed';
      }).join('\n');
      // Safari enforces read-only-ness of RTCSessionDescription fields.
      if (window.RTCSessionDescription &&
          desc instanceof window.RTCSessionDescription) {
        arguments[0] = new window.RTCSessionDescription({
          type: desc.type,
          sdp,
        });
      } else {
        desc.sdp = sdp;
      }
    }
    return nativeSRD.apply(this, arguments);
  };
}

function shimAddIceCandidateNullOrEmpty(window, browserDetails) {
  // Support for addIceCandidate(null or undefined)
  // as well as addIceCandidate({candidate: "", ...})
  // https://bugs.chromium.org/p/chromium/issues/detail?id=978582
  // Note: must be called before other polyfills which change the signature.
  if (!(window.RTCPeerConnection && window.RTCPeerConnection.prototype)) {
    return;
  }
  const nativeAddIceCandidate =
      window.RTCPeerConnection.prototype.addIceCandidate;
  if (!nativeAddIceCandidate || nativeAddIceCandidate.length === 0) {
    return;
  }
  window.RTCPeerConnection.prototype.addIceCandidate =
    function addIceCandidate() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      // Firefox 68+ emits and processes {candidate: "", ...}, ignore
      // in older versions.
      // Native support for ignoring exists for Chrome M77+.
      // Safari ignores as well, exact version unknown but works in the same
      // version that also ignores addIceCandidate(null).
      if (((browserDetails.browser === 'chrome' && browserDetails.version < 78)
           || (browserDetails.browser === 'firefox'
               && browserDetails.version < 68)
           || (browserDetails.browser === 'safari'))
          && arguments[0] && arguments[0].candidate === '') {
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };
}

// Note: Make sure to call this ahead of APIs that modify
// setLocalDescription.length
function shimParameterlessSetLocalDescription(window, browserDetails) {
  if (!(window.RTCPeerConnection && window.RTCPeerConnection.prototype)) {
    return;
  }
  const nativeSetLocalDescription =
      window.RTCPeerConnection.prototype.setLocalDescription;
  if (!nativeSetLocalDescription || nativeSetLocalDescription.length === 0) {
    return;
  }
  window.RTCPeerConnection.prototype.setLocalDescription =
    function setLocalDescription() {
      let desc = arguments[0] || {};
      if (typeof desc !== 'object' || (desc.type && desc.sdp)) {
        return nativeSetLocalDescription.apply(this, arguments);
      }
      // The remaining steps should technically happen when SLD comes off the
      // RTCPeerConnection's operations chain (not ahead of going on it), but
      // this is too difficult to shim. Instead, this shim only covers the
      // common case where the operations chain is empty. This is imperfect, but
      // should cover many cases. Rationale: Even if we can't reduce the glare
      // window to zero on imperfect implementations, there's value in tapping
      // into the perfect negotiation pattern that several browsers support.
      desc = {type: desc.type, sdp: desc.sdp};
      if (!desc.type) {
        switch (this.signalingState) {
          case 'stable':
          case 'have-local-offer':
          case 'have-remote-pranswer':
            desc.type = 'offer';
            break;
          default:
            desc.type = 'answer';
            break;
        }
      }
      if (desc.sdp || (desc.type !== 'offer' && desc.type !== 'answer')) {
        return nativeSetLocalDescription.apply(this, [desc]);
      }
      const func = desc.type === 'offer' ? this.createOffer : this.createAnswer;
      return func.apply(this)
        .then(d => nativeSetLocalDescription.apply(this, [d]));
    };
}

var commonShim = /*#__PURE__*/Object.freeze({
    __proto__: null,
    shimRTCIceCandidate: shimRTCIceCandidate,
    shimMaxMessageSize: shimMaxMessageSize,
    shimSendThrowTypeError: shimSendThrowTypeError,
    shimConnectionState: shimConnectionState,
    removeExtmapAllowMixed: removeExtmapAllowMixed,
    shimAddIceCandidateNullOrEmpty: shimAddIceCandidateNullOrEmpty,
    shimParameterlessSetLocalDescription: shimParameterlessSetLocalDescription
});

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

// Shimming starts here.
function adapterFactory({window} = {}, options = {
  shimChrome: true,
  shimFirefox: true,
  shimSafari: true,
}) {
  // Utils.
  const logging = log;
  const browserDetails = detectBrowser(window);

  const adapter = {
    browserDetails,
    commonShim,
    extractVersion: extractVersion,
    disableLog: disableLog,
    disableWarnings: disableWarnings,
    // Expose sdp as a convenience. For production apps include directly.
    sdp: sdp$1,
  };

  // Shim browser if found.
  switch (browserDetails.browser) {
    case 'chrome':
      if (!chromeShim || !shimPeerConnection$1 ||
          !options.shimChrome) {
        logging('Chrome shim is not included in this adapter release.');
        return adapter;
      }
      if (browserDetails.version === null) {
        logging('Chrome shim can not determine version, not shimming.');
        return adapter;
      }
      logging('adapter.js shimming chrome.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = chromeShim;

      // Must be called before shimPeerConnection.
      shimAddIceCandidateNullOrEmpty(window, browserDetails);
      shimParameterlessSetLocalDescription(window);

      shimGetUserMedia$2(window, browserDetails);
      shimMediaStream(window);
      shimPeerConnection$1(window, browserDetails);
      shimOnTrack$1(window);
      shimAddTrackRemoveTrack(window, browserDetails);
      shimGetSendersWithDtmf(window);
      shimGetStats(window);
      shimSenderReceiverGetStats(window);
      fixNegotiationNeeded(window, browserDetails);

      shimRTCIceCandidate(window);
      shimConnectionState(window);
      shimMaxMessageSize(window, browserDetails);
      shimSendThrowTypeError(window);
      removeExtmapAllowMixed(window, browserDetails);
      break;
    case 'firefox':
      if (!firefoxShim || !shimPeerConnection ||
          !options.shimFirefox) {
        logging('Firefox shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming firefox.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = firefoxShim;

      // Must be called before shimPeerConnection.
      shimAddIceCandidateNullOrEmpty(window, browserDetails);
      shimParameterlessSetLocalDescription(window);

      shimGetUserMedia$1(window, browserDetails);
      shimPeerConnection(window, browserDetails);
      shimOnTrack(window);
      shimRemoveStream(window);
      shimSenderGetStats(window);
      shimReceiverGetStats(window);
      shimRTCDataChannel(window);
      shimAddTransceiver(window);
      shimGetParameters(window);
      shimCreateOffer(window);
      shimCreateAnswer(window);

      shimRTCIceCandidate(window);
      shimConnectionState(window);
      shimMaxMessageSize(window, browserDetails);
      shimSendThrowTypeError(window);
      break;
    case 'safari':
      if (!safariShim || !options.shimSafari) {
        logging('Safari shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming safari.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = safariShim;

      // Must be called before shimCallbackAPI.
      shimAddIceCandidateNullOrEmpty(window, browserDetails);
      shimParameterlessSetLocalDescription(window);

      shimRTCIceServerUrls(window);
      shimCreateOfferLegacy(window);
      shimCallbacksAPI(window);
      shimLocalStreamsAPI(window);
      shimRemoteStreamsAPI(window);
      shimTrackEventTransceiver(window);
      shimGetUserMedia(window);
      shimAudioContext(window);

      shimRTCIceCandidate(window);
      shimMaxMessageSize(window, browserDetails);
      shimSendThrowTypeError(window);
      removeExtmapAllowMixed(window, browserDetails);
      break;
    default:
      logging('Unsupported browser!');
      break;
  }

  return adapter;
}

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

const adapter =
  adapterFactory({window: typeof window === 'undefined' ? undefined : window});

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
function addStereo(sdp) {
    var sdpLines = sdp.split('\r\n');

    // Find opus payload.
    var opusIndex = findLine(sdpLines, 'a=rtpmap', 'opus/48000/2');
    var opusPayload;
    if (opusIndex) {
        opusPayload = getCodecPayloadType(sdpLines[opusIndex]);
    }
	if (opusPayload){
		// Find the payload in fmtp line.
		var fmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + opusPayload.toString());
		if (fmtpLineIndex === null) {
			return sdp;
		}

		// Append stereo=1 to fmtp line.
		// added maxaveragebitrate here; about 128 kbits/s
		// added stereo=1 here for stereo audio
		sdpLines[fmtpLineIndex] = sdpLines[fmtpLineIndex].concat('; stereo=1; sprop-stereo=1; maxaveragebitrate=' + (128 * 1024) + '; x-google-min-bitrate=6; x-google-max-bitrate=128; cbr=1;');
		sdp = sdpLines.join('\r\n');
	}
    //console.error(sdp);
    return sdp;
}
function addStereo2(sdp) {
    // Find the payload in fmtp line.
   // var x =  'a=fmtp:' + opusPayload.toString();
    //x = x.concat('; stereo=1; sprop-stereo=1; maxaveragebitrate=' + (256 * 1024) + '; x-google-min-bitrate=256; x-google-max-bitrate=256; cbr=1;');
//    sdp =sdp.replace("opus/48000/2", "multiopus/48000/6").replace("useinbandfec=1","useinbandfec=1;channel_mapping=0,4,1,2,3,5;num_streams=4;coupled_streams=2");
    sdp =sdp.replace("opus/48000/2", "opus/48000/2\r\na=rtcp-fb:111 transport-cc\r\na=fmtp:111 minptime=10;useinbandfec=1; stereo=1; sprop-stereo=1; maxaveragebitrate=131072; x-google-min-bitrate=6; x-google-max-bitrate=128; cbr=1;");
    //console.error(sdp);
    return sdp;
}

// Find the line in sdpLines that starts with |prefix|, and, if specified,
// contains |substr| (case-insensitive search).
function findLine(sdpLines, prefix, substr) {
    return findLineInRange(sdpLines, 0, -1, prefix, substr);
}

// Find the line in sdpLines[startLine...endLine - 1] that starts with |prefix|
// and, if specified, contains |substr| (case-insensitive search).
function findLineInRange(sdpLines, startLine, endLine, prefix, substr) {
    var realEndLine = endLine !== -1 ? endLine : sdpLines.length;
    for (var i = startLine; i < realEndLine; ++i) {
        if (sdpLines[i].indexOf(prefix) === 0) {
            if (!substr ||
                sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
                return i;
            }
        }
    }
    return null;
}

// Gets the codec payload type from an a=rtpmap:X line.
function getCodecPayloadType(sdpLine) {
    var pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
    var result = sdpLine.match(pattern);
    return (result && result.length === 2) ? result[1] : null;
}
function getSizeFromRes (res){
	const resolutions = [
		{
			"label": "UHD",
			"width": 3840,
			"height": 2160,
			"ratio": "16:9"
		},
		{
			"label": "FHD",
			"width": 1920,
			"height": 1080,
			"ratio": "16:9"
		},
		{
			"label": "UXGA",
			"width": 1600,
			"height": 1200,
			"ratio": "4:3"
		},
		{
			"label": "HD",
			"width": 1280,
			"height": 720,
			"ratio": "16:9"
		},
		{
			"label": "SVGA",
			"width": 800,
			"height": 600,
			"ratio": "4:3"
		},
		{
			"label": "VGA",
			"width": 640,
			"height": 480,
			"ratio": "4:3"
		},
		{
			"label": "VGAHD",
			"width": 960,
			"height": 720,
			"ratio": "4:3"
		},
		{
			"label": "VGAHD-P",
			"width": 720,
			"height": 960,
			"ratio": "4:3"
		},
		{
			"label": "VGAFHD",
			"width": 1440,
			"height": 1080,
			"ratio": "4:3"
		},
		{
			"label": "VGAFHD-P",
			"width": 1080,
			"height": 1440,
			"ratio": "4:3"
		},
		{
			"label": "360p",
			"width": 640,
			"height": 360,
			"ratio": "16:9"
		},
		{
			"label": "CIF",
			"width": 352,
			"height": 288,
			"ratio": "4:3"
		},
		{
			"label": "QVGA",
			"width": 320,
			"height": 240,
			"ratio": "4:3"
		},
	
	];
	return resolutions.find((r) => r.label === res)
}
// List of sessions
Janus.sessions = {};
Janus.getSizeFromRes = getSizeFromRes;
Janus.isExtensionEnabled = function() {
	if(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
		// No need for the extension, getDisplayMedia is supported
		return true;
	}
	if(window.navigator.userAgent.match('Chrome')) {
		var chromever = parseInt(window.navigator.userAgent.match(/Chrome\/(.*) /)[1], 10);
		var maxver = 33;
		if(window.navigator.userAgent.match('Linux'))
			maxver = 35;	// "known" crash in chrome 34 and 35 on linux
		if(chromever >= 26 && chromever <= maxver) {
			// Older versions of Chrome don't support this extension-based approach, so lie
			return true;
		}
		return Janus.extension.isInstalled();
	} else {
		// Firefox of others, no need for the extension (but this doesn't mean it will work)
		return true;
	}
};

var defaultExtension = {
	// Screensharing Chrome Extension ID
	extensionId: 'hapfgfdkleiggjjpfpenajgdnfckjpaj',
	isInstalled: function() { return document.querySelector('#janus-extension-installed') !== null; },
	getScreen: function (callback) {
		var pending = window.setTimeout(function () {
			var error = new Error('NavigatorUserMediaError');
			error.name = 'The required Chrome extension is not installed: click <a href="#">here</a> to install it. (NOTE: this will need you to refresh the page)';
			return callback(error);
		}, 1000);
		this.cache[pending] = callback;
		window.postMessage({ type: 'janusGetScreen', id: pending }, '*');
	},
	init: function () {
		var cache = {};
		this.cache = cache;
		// Wait for events from the Chrome Extension
		window.addEventListener('message', function (event) {
			if(event.origin != window.location.origin)
				return;
			if(event.data.type == 'janusGotScreen' && cache[event.data.id]) {
				var callback = cache[event.data.id];
				delete cache[event.data.id];

				if (event.data.sourceId === '') {
					// user canceled
					var error = new Error('NavigatorUserMediaError');
					error.name = 'You cancelled the request for permission, giving up...';
					callback(error);
				} else {
					callback(null, event.data.sourceId);
				}
			} else if (event.data.type == 'janusGetScreenPending') {
				window.clearTimeout(event.data.id);
			}
		});
	}
};

Janus.useDefaultDependencies = function (deps) {
	var f = (deps && deps.fetch) || fetch;
	var p = (deps && deps.Promise) || Promise;
	var socketCls = (deps && deps.WebSocket) || WebSocket;

	return {
		newWebSocket: function(server, proto) { return new socketCls(server, proto); },
		extension: (deps && deps.extension) || defaultExtension,
		isArray: function(arr) { return Array.isArray(arr); },
		webRTCAdapter: (deps && deps.adapter) || adapter,
		httpAPICall: function(url, options) {
			var fetchOptions = {
				method: options.verb,
				headers: {
					'Accept': 'application/json, text/plain, */*'
				},
				cache: 'no-cache'
			};
			if(options.verb === "POST") {
				fetchOptions.headers['Content-Type'] = 'application/json';
			}
			if(options.withCredentials !== undefined) {
				fetchOptions.credentials = options.withCredentials === true ? 'include' : (options.withCredentials ? options.withCredentials : 'omit');
			}
			if(options.body) {
				fetchOptions.body = JSON.stringify(options.body);
			}

			var fetching = f(url, fetchOptions).catch(function(error) {
				return p.reject({message: 'Probably a network error, is the server down?', error: error});
			});

			/*
			 * fetch() does not natively support timeouts.
			 * Work around this by starting a timeout manually, and racing it agains the fetch() to see which thing resolves first.
			 */

			if(options.timeout) {
				var timeout = new p(function(resolve, reject) {
					var timerId = setTimeout(function() {
						clearTimeout(timerId);
						return reject({message: 'Request timed out', timeout: options.timeout});
					}, options.timeout);
				});
				fetching = p.race([fetching,timeout]);
			}

			fetching.then(function(response) {
				if(response.ok) {
					if(typeof(options.success) === typeof(Janus.noop)) {
						return response.json().then(function(parsed) {
							options.success(parsed);
						}).catch(function(error) {
							return p.reject({message: 'Failed to parse response body', error: error, response: response});
						});
					}
				}
				else {
					return p.reject({message: 'API call failed', response: response});
				}
			}).catch(function(error) {
				if(typeof(options.error) === typeof(Janus.noop)) {
					options.error(error.message || '<< internal error >>', error);
				}
			});

			return fetching;
		}
	}
};

Janus.useOldDependencies = function (deps) {
	var jq = (deps && deps.jQuery) || jQuery;
	var socketCls = (deps && deps.WebSocket) || WebSocket;
	return {
		newWebSocket: function(server, proto) { return new socketCls(server, proto); },
		isArray: function(arr) { return jq.isArray(arr); },
		extension: (deps && deps.extension) || defaultExtension,
		webRTCAdapter: (deps && deps.adapter) || adapter,
		httpAPICall: function(url, options) {
			var payload = options.body !== undefined ? {
				contentType: 'application/json',
				data: JSON.stringify(options.body)
			} : {};
			var credentials = options.withCredentials !== undefined ? {xhrFields: {withCredentials: options.withCredentials}} : {};

			return jq.ajax(jq.extend(payload, credentials, {
				url: url,
				type: options.verb,
				cache: false,
				dataType: 'json',
				async: options.async,
				timeout: options.timeout,
				success: function(result) {
					if(typeof(options.success) === typeof(Janus.noop)) {
						options.success(result);
					}
				},
				error: function(xhr, status, err) {
					if(typeof(options.error) === typeof(Janus.noop)) {
						options.error(status, err);
					}
				}
			}));
		},
	};
};

Janus.noop = function() {};

Janus.dataChanDefaultLabel = "JanusDataChannel";

// Note: in the future we may want to change this, e.g., as was
// attempted in https://github.com/meetecho/janus-gateway/issues/1670
Janus.endOfCandidates = null;

// Initialization
Janus.init = function(options) {
	options = options || {};
	options.callback = (typeof options.callback == "function") ? options.callback : Janus.noop;
	if(Janus.initDone === true) {
		// Already initialized
		options.callback();
	} else {
		if(typeof console == "undefined" || typeof console.log == "undefined")
			console = { log: function() {} };
		// Console logging (all debugging disabled by default)
		Janus.trace = Janus.noop;
		Janus.debug = Janus.noop;
		Janus.vdebug = Janus.noop;
		Janus.log = Janus.noop;
		Janus.warn = Janus.noop;
		Janus.error = Janus.noop;
		if(options.debug === true || options.debug === "all") {
			// Enable all debugging levels
			Janus.trace = console.trace.bind(console);
			Janus.debug = console.debug.bind(console);
			Janus.vdebug = console.debug.bind(console);
			Janus.log = console.log.bind(console);
			Janus.warn = console.warn.bind(console);
			Janus.error = console.error.bind(console);
		} else if(Array.isArray(options.debug)) {
			for(var i in options.debug) {
				var d = options.debug[i];
				switch(d) {
					case "trace":
						Janus.trace = console.trace.bind(console);
						break;
					case "debug":
						Janus.debug = console.debug.bind(console);
						break;
					case "vdebug":
						Janus.vdebug = console.debug.bind(console);
						break;
					case "log":
						Janus.log = console.log.bind(console);
						break;
					case "warn":
						Janus.warn = console.warn.bind(console);
						break;
					case "error":
						Janus.error = console.error.bind(console);
						break;
					default:
						console.error("Unknown debugging option '" + d + "' (supported: 'trace', 'debug', 'vdebug', 'log', warn', 'error')");
						break;
				}
			}
		}
		Janus.log("Initializing library");

		var usedDependencies = options.dependencies || Janus.useDefaultDependencies();
		Janus.isArray = usedDependencies.isArray;
		Janus.webRTCAdapter = usedDependencies.webRTCAdapter;
		Janus.httpAPICall = usedDependencies.httpAPICall;
		Janus.newWebSocket = usedDependencies.newWebSocket;
		Janus.extension = usedDependencies.extension;
		Janus.extension.init();

		// Helper method to enumerate devices
		Janus.listDevices = function (callback,options){
                	return new Promise((resolve,reject)=>{
                	let constrain = { audio: options.audio, video: options.video };
               		 constrain.echoCancellation = options.echoC;
	                constrain.autoGainControl = options.gainC;
        	        constrain.noiseSuppression = options.noiseS;
                	navigator.mediaDevices.getUserMedia(constrain)
                	.then(stream=> {
                        	navigator.mediaDevices.enumerateDevices().then(function(devices) {

                                resolve(devices);
                                // Get rid of the now useless stream
                                try {
                                        var tracks = stream.getTracks();
                                        for(var i in tracks) {
                                                var mst = tracks[i];
                                                if(mst !== null && mst !== undefined)
                                                        mst.stop();
                                        }
                                } catch(e) {

                                }
                        });
                }).catch(ex=>{
                        reject(ex);
                });
        	});
		};

		// Helper methods to attach/reattach a stream to a video element (previously part of adapter.js)
		Janus.attachMediaStream = function(element, stream) {
			if(Janus.webRTCAdapter.browserDetails.browser === 'chrome') {
				var chromever = Janus.webRTCAdapter.browserDetails.version;
				if(chromever >= 52) {
					element.srcObject = stream;
				} else if(typeof element.src !== 'undefined') {
					element.src = URL.createObjectURL(stream);
				} else {
					Janus.error("Error attaching stream to element");
				}
			} else {
				element.srcObject = stream;
			}
		};
		Janus.reattachMediaStream = function(to, from) {
			if(Janus.webRTCAdapter.browserDetails.browser === 'chrome') {
				var chromever = Janus.webRTCAdapter.browserDetails.version;
				if(chromever >= 52) {
					to.srcObject = from.srcObject;
				} else if(typeof to.src !== 'undefined') {
					to.src = from.src;
				} else {
					Janus.error("Error reattaching stream to element");
				}
			} else {
				to.srcObject = from.srcObject;
			}
		};
		// Detect tab close: make sure we don't loose existing onbeforeunload handlers
		// (note: for iOS we need to subscribe to a different event, 'pagehide', see
		// https://gist.github.com/thehunmonkgroup/6bee8941a49b86be31a787fe8f4b8cfe)
		var iOS = ['iPad', 'iPhone', 'iPod'].indexOf(navigator.platform) >= 0;
		var eventName = iOS ? 'pagehide' : 'beforeunload';
		var oldOBF = window["on" + eventName];
		window.addEventListener(eventName, function(event) {
			Janus.log("Closing window");
			for(var s in Janus.sessions) {
				if(Janus.sessions[s] !== null && Janus.sessions[s] !== undefined &&
						Janus.sessions[s].destroyOnUnload) {
					Janus.log("Destroying session " + s);
					Janus.sessions[s].destroy({asyncRequest: false, notifyDestroyed: false});
				}
			}
			if(oldOBF && typeof oldOBF == "function")
				oldOBF();
		});
		// If this is a Safari Technology Preview, check if VP8 is supported
		Janus.safariVp8 = false;
		if(Janus.webRTCAdapter.browserDetails.browser === 'safari' &&
				Janus.webRTCAdapter.browserDetails.version >= 605) {
			// We do it in a very ugly way, as there's no alternative...
			// We create a PeerConnection to see if VP8 is in an offer
			var testpc = new RTCPeerConnection({}, {});
			testpc.createOffer({offerToReceiveVideo: true}).then(function(offer) {
				Janus.safariVp8 = offer.sdp.indexOf("VP8") !== -1;
				if(Janus.safariVp8) {
					Janus.log("This version of Safari supports VP8");
				} else {
					Janus.warn("This version of Safari does NOT support VP8: if you're using a Technology Preview, " +
						"try enabling the 'WebRTC VP8 codec' setting in the 'Experimental Features' Develop menu");
				}
				testpc.close();
				testpc = null;
			});
		}
		Janus.initDone = true;
		options.callback();
	}
};

// Helper method to check whether WebRTC is supported by this browser
Janus.isWebrtcSupported = function() {
	return window.RTCPeerConnection ? true : false;
};
// Helper method to check whether devices can be accessed by this browser (e.g., not possible via plain HTTP)
Janus.isGetUserMediaAvailable = function() {
    return (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ? true : false;
};
// Helper method to create random identifiers (e.g., transaction)
Janus.randomString = function(len) {
	var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var randomString = '';
	for (var i = 0; i < len; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(randomPoz,randomPoz+1);
	}
	return randomString;
};


function Janus(gatewayCallbacks) {
	if(Janus.initDone === undefined) {
		gatewayCallbacks.error("Library not initialized");
		return {};
	}
	if(!Janus.isWebrtcSupported()) {
		gatewayCallbacks.error("WebRTC not supported by this browser");
		return {};
	}
	Janus.log("Library initialized: " + Janus.initDone);
	gatewayCallbacks = gatewayCallbacks || {};
	gatewayCallbacks.success = (typeof gatewayCallbacks.success == "function") ? gatewayCallbacks.success : Janus.noop;
	gatewayCallbacks.error = (typeof gatewayCallbacks.error == "function") ? gatewayCallbacks.error : Janus.noop;
	gatewayCallbacks.destroyed = (typeof gatewayCallbacks.destroyed == "function") ? gatewayCallbacks.destroyed : Janus.noop;
	if(gatewayCallbacks.server === null || gatewayCallbacks.server === undefined) {
		gatewayCallbacks.error("Invalid server url");
		return {};
	}
	var websockets = false;
	var ws = null;
	var wsHandlers = {};
	var wsKeepaliveTimeoutId = null;

	var servers = null, serversIndex = 0;
	var server = gatewayCallbacks.server;
	if(Janus.isArray(server)) {
		Janus.log("Multiple servers provided (" + server.length + "), will use the first that works");
		server = null;
		servers = gatewayCallbacks.server;
		Janus.debug(servers);
	} else {
		if(server.indexOf("ws") === 0) {
			websockets = true;
			Janus.log("Using WebSockets to contact Janus: " + server);
		} else {
			websockets = false;
			Janus.log("Using REST API to contact Janus: " + server);
		}
	}
	var iceServers = gatewayCallbacks.iceServers;
	if(iceServers === undefined || iceServers === null)
		iceServers = [{urls: "stun:stun.l.google.com:19302"}];
	var iceTransportPolicy = gatewayCallbacks.iceTransportPolicy;
	var bundlePolicy = gatewayCallbacks.bundlePolicy;
	// Whether IPv6 candidates should be gathered
	var ipv6Support = gatewayCallbacks.ipv6;
	if(ipv6Support === undefined || ipv6Support === null)
		ipv6Support = false;
	// Whether we should enable the withCredentials flag for XHR requests
	var withCredentials = false;
	if(gatewayCallbacks.withCredentials !== undefined && gatewayCallbacks.withCredentials !== null)
		withCredentials = gatewayCallbacks.withCredentials === true;
	// Optional max events
	var maxev = null;
	if(gatewayCallbacks.max_poll_events !== undefined && gatewayCallbacks.max_poll_events !== null)
		maxev = gatewayCallbacks.max_poll_events;
	if(maxev < 1)
		maxev = 1;
	// Token to use (only if the token based authentication mechanism is enabled)
	var token = null;
	if(gatewayCallbacks.token !== undefined && gatewayCallbacks.token !== null)
		token = gatewayCallbacks.token;
	// API secret to use (only if the shared API secret is enabled)
	var apisecret = null;
	if(gatewayCallbacks.apisecret !== undefined && gatewayCallbacks.apisecret !== null)
		apisecret = gatewayCallbacks.apisecret;
	// Whether we should destroy this session when onbeforeunload is called
	this.destroyOnUnload = true;
	if(gatewayCallbacks.destroyOnUnload !== undefined && gatewayCallbacks.destroyOnUnload !== null)
		this.destroyOnUnload = (gatewayCallbacks.destroyOnUnload === true);
	// Some timeout-related values
	var keepAlivePeriod = 25000;
	if(gatewayCallbacks.keepAlivePeriod !== undefined && gatewayCallbacks.keepAlivePeriod !== null)
		keepAlivePeriod = gatewayCallbacks.keepAlivePeriod;
	if(isNaN(keepAlivePeriod))
		keepAlivePeriod = 25000;
	var longPollTimeout = 60000;
	if(gatewayCallbacks.longPollTimeout !== undefined && gatewayCallbacks.longPollTimeout !== null)
		longPollTimeout = gatewayCallbacks.longPollTimeout;
	if(isNaN(longPollTimeout))
		longPollTimeout = 60000;

	// overrides for default maxBitrate values for simulcasting
	function getMaxBitrates(simulcastMaxBitrates) {
		var maxBitrates = {
			high: 2000000,
			medium: 400000,
			low: 128000,
		};

		if (simulcastMaxBitrates !== undefined && simulcastMaxBitrates !== null) {
			if (simulcastMaxBitrates.high)
				maxBitrates.high = simulcastMaxBitrates.high;
			if (simulcastMaxBitrates.medium)
				maxBitrates.medium = simulcastMaxBitrates.medium;
			if (simulcastMaxBitrates.low)
				maxBitrates.low = simulcastMaxBitrates.low;
		}

		return maxBitrates;
	}

	var connected = false;
	var sessionId = null;
	var pluginHandles = {};
	var that = this;
	var retries = 0;
	var transactions = {};
	createSession(gatewayCallbacks);

	// Public methods
	this.getServer = function() { return server; };
	this.isConnected = function() { return connected; };
	this.reconnect = function(callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
		callbacks["reconnect"] = true;
		createSession(callbacks);
	};
	this.getSessionId = function() { return sessionId; };
	this.destroy = function(callbacks) { destroySession(callbacks); };
	this.attach = function(callbacks) { createHandle(callbacks); };

	function eventHandler() {
		if(sessionId == null)
			return;
		Janus.debug('Long poll...');
		if(!connected) {
			Janus.warn("Is the server down? (connected=false)");
			return;
		}
		var longpoll = server + "/" + sessionId + "?rid=" + new Date().getTime();
		if(maxev !== undefined && maxev !== null)
			longpoll = longpoll + "&maxev=" + maxev;
		if(token !== null && token !== undefined)
			longpoll = longpoll + "&token=" + encodeURIComponent(token);
		if(apisecret !== null && apisecret !== undefined)
			longpoll = longpoll + "&apisecret=" + encodeURIComponent(apisecret);
		Janus.httpAPICall(longpoll, {
			verb: 'GET',
			withCredentials: withCredentials,
			success: handleEvent,
			timeout: longPollTimeout,
			error: function(textStatus, errorThrown) {
				Janus.error(textStatus + ":", errorThrown);
				retries++;
				if(retries > 3) {
					// Did we just lose the server? :-(
					connected = false;
					gatewayCallbacks.error("Lost connection to the server (is it down?)");
					return;
				}
				eventHandler();
			}
		});
	}

	// Private event handler: this will trigger plugin callbacks, if set
	function handleEvent(json, skipTimeout) {
		retries = 0;
		if(!websockets && sessionId !== undefined && sessionId !== null && skipTimeout !== true)
			setTimeout(eventHandler, 200);
		if(!websockets && Janus.isArray(json)) {
			// We got an array: it means we passed a maxev > 1, iterate on all objects
			for(var i=0; i<json.length; i++) {
				handleEvent(json[i], true);
			}
			return;
		}
		if(json["janus"] === "keepalive") {
			// Nothing happened
			Janus.vdebug("Got a keepalive on session " + sessionId);
			return;
		} else if(json["janus"] === "ack") {
			// Just an ack, we can probably ignore
			Janus.debug("Got an ack on session " + sessionId);
			Janus.debug(json);
			var transaction = json["transaction"];
			if(transaction !== null && transaction !== undefined) {
				var reportSuccess = transactions[transaction];
				if(reportSuccess !== null && reportSuccess !== undefined) {
					reportSuccess(json);
				}
				delete transactions[transaction];
			}
			return;
		} else if(json["janus"] === "success") {
			// Success!
			Janus.debug("Got a success on session " + sessionId);
			Janus.debug(json);
			var transaction = json["transaction"];
			if(transaction !== null && transaction !== undefined) {
				var reportSuccess = transactions[transaction];
				if(reportSuccess !== null && reportSuccess !== undefined) {
					reportSuccess(json);
				}
				delete transactions[transaction];
			}
			return;
		} else if(json["janus"] === "trickle") {
			// We got a trickle candidate from Janus
			var sender = json["sender"];
			if(sender === undefined || sender === null) {
				Janus.warn("Missing sender...");
				return;
			}
			var pluginHandle = pluginHandles[sender];
			if(pluginHandle === undefined || pluginHandle === null) {
				Janus.debug("This handle is not attached to this session");
				return;
			}
			var candidate = json["candidate"];
			Janus.debug("Got a trickled candidate on session " + sessionId);
			Janus.debug(candidate);
			var config = pluginHandle.webrtcStuff;
			if(config.pc && config.remoteSdp) {
				// Add candidate right now
				Janus.debug("Adding remote candidate:", candidate);
				if(!candidate || candidate.completed === true) {
					// end-of-candidates
					config.pc.addIceCandidate();
				} else {
					// New candidate
					config.pc.addIceCandidate(candidate);
				}
			} else {
				// We didn't do setRemoteDescription (trickle got here before the offer?)
				Janus.debug("We didn't do setRemoteDescription (trickle got here before the offer?), caching candidate");
				if(!config.candidates)
					config.candidates = [];
				config.candidates.push(candidate);
				Janus.debug(config.candidates);
			}
		} else if(json["janus"] === "webrtcup") {
			// The PeerConnection with the server is up! Notify this
			Janus.debug("Got a webrtcup event on session " + sessionId);
			Janus.debug(json);
			var sender = json["sender"];
			if(sender === undefined || sender === null) {
				Janus.warn("Missing sender...");
				return;
			}
			var pluginHandle = pluginHandles[sender];
			if(pluginHandle === undefined || pluginHandle === null) {
				Janus.debug("This handle is not attached to this session");
				return;
			}
			pluginHandle.webrtcState(true);
			return;
		} else if(json["janus"] === "hangup") {
			// A plugin asked the core to hangup a PeerConnection on one of our handles
			Janus.debug("Got a hangup event on session " + sessionId);
			Janus.debug(json);
			var sender = json["sender"];
			if(sender === undefined || sender === null) {
				Janus.warn("Missing sender...");
				return;
			}
			var pluginHandle = pluginHandles[sender];
			if(pluginHandle === undefined || pluginHandle === null) {
				Janus.debug("This handle is not attached to this session");
				return;
			}
			pluginHandle.webrtcState(false, json["reason"]);
			pluginHandle.hangup();
		} else if(json["janus"] === "detached") {
			// A plugin asked the core to detach one of our handles
			Janus.debug("Got a detached event on session " + sessionId);
			Janus.debug(json);
			var sender = json["sender"];
			if(sender === undefined || sender === null) {
				Janus.warn("Missing sender...");
				return;
			}
			var pluginHandle = pluginHandles[sender];
			if(pluginHandle === undefined || pluginHandle === null) {
				// Don't warn here because destroyHandle causes this situation.
				return;
			}
			pluginHandle.detached = true;
			pluginHandle.ondetached();
			pluginHandle.detach();
		} else if(json["janus"] === "media") {
			// Media started/stopped flowing
			Janus.debug("Got a media event on session " + sessionId);
			Janus.debug(json);
			var sender = json["sender"];
			if(sender === undefined || sender === null) {
				Janus.warn("Missing sender...");
				return;
			}
			var pluginHandle = pluginHandles[sender];
			if(pluginHandle === undefined || pluginHandle === null) {
				Janus.debug("This handle is not attached to this session");
				return;
			}
			pluginHandle.mediaState(json["type"], json["receiving"]);
		} else if(json["janus"] === "slowlink") {
			Janus.debug("Got a slowlink event on session " + sessionId);
			Janus.debug(json);
			// Trouble uplink or downlink
			var sender = json["sender"];
			if(sender === undefined || sender === null) {
				Janus.warn("Missing sender...");
				return;
			}
			var pluginHandle = pluginHandles[sender];
			if(pluginHandle === undefined || pluginHandle === null) {
				Janus.debug("This handle is not attached to this session");
				return;
			}
			pluginHandle.slowLink(json["uplink"], json["nacks"]);
		} else if(json["janus"] === "error") {
			// Oops, something wrong happened
			Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
			Janus.debug(json);
			var transaction = json["transaction"];
			if(transaction !== null && transaction !== undefined) {
				var reportSuccess = transactions[transaction];
				if(reportSuccess !== null && reportSuccess !== undefined) {
					reportSuccess(json);
				}
				delete transactions[transaction];
			}
			return;
		} else if(json["janus"] === "event") {
			Janus.debug("Got a plugin event on session " + sessionId);
			Janus.debug(json);
			var sender = json["sender"];
			if(sender === undefined || sender === null) {
				Janus.warn("Missing sender...");
				return;
			}
			var plugindata = json["plugindata"];
			if(plugindata === undefined || plugindata === null) {
				Janus.warn("Missing plugindata...");
				return;
			}
			Janus.debug("  -- Event is coming from " + sender + " (" + plugindata["plugin"] + ")");
			var data = plugindata["data"];
			Janus.debug(data);
			var pluginHandle = pluginHandles[sender];
			if(pluginHandle === undefined || pluginHandle === null) {
				Janus.warn("This handle is not attached to this session");
				return;
			}
			var jsep = json["jsep"];
			if(jsep !== undefined && jsep !== null) {
				Janus.debug("Handling SDP as well...");
				Janus.debug(jsep);
			}
			var callback = pluginHandle.onmessage;
			if(callback !== null && callback !== undefined) {
				Janus.debug("Notifying application...");
				// Send to callback specified when attaching plugin handle
				callback(data, jsep);
			} else {
				// Send to generic callback (?)
				Janus.debug("No provided notification callback");
			}
		} else if(json["janus"] === "timeout") {
			Janus.error("Timeout on session " + sessionId);
			Janus.debug(json);
			if (websockets) {
				ws.close(3504, "Gateway timeout");
			}
			return;
		} else {
			Janus.warn("Unknown message/event  '" + json["janus"] + "' on session " + sessionId);
			Janus.debug(json);
		}
	}

	// Private helper to send keep-alive messages on WebSockets
	function keepAlive() {
		if(server === null || !websockets || !connected)
			return;
		wsKeepaliveTimeoutId = setTimeout(keepAlive, keepAlivePeriod);
		var request = { "janus": "keepalive", "session_id": sessionId, "transaction": Janus.randomString(12) };
		if(token !== null && token !== undefined)
			request["token"] = token;
		if(apisecret !== null && apisecret !== undefined)
			request["apisecret"] = apisecret;
		ws.send(JSON.stringify(request));
	}

	// Private method to create a session
	function createSession(callbacks) {
		var transaction = Janus.randomString(12);
		var request = { "janus": "create", "transaction": transaction };
		if(callbacks["reconnect"]) {
			// We're reconnecting, claim the session
			connected = false;
			request["janus"] = "claim";
			request["session_id"] = sessionId;
			// If we were using websockets, ignore the old connection
			if(ws) {
				ws.onopen = null;
				ws.onerror = null;
				ws.onclose = null;
				if(wsKeepaliveTimeoutId) {
					clearTimeout(wsKeepaliveTimeoutId);
					wsKeepaliveTimeoutId = null;
				}
			}
		}
		if(token !== null && token !== undefined)
			request["token"] = token;
		if(apisecret !== null && apisecret !== undefined)
			request["apisecret"] = apisecret;
		if(server === null && Janus.isArray(servers)) {
			// We still need to find a working server from the list we were given
			server = servers[serversIndex];
			if(server.indexOf("ws") === 0) {
				websockets = true;
				Janus.log("Server #" + (serversIndex+1) + ": trying WebSockets to contact Janus (" + server + ")");
			} else {
				websockets = false;
				Janus.log("Server #" + (serversIndex+1) + ": trying REST API to contact Janus (" + server + ")");
			}
		}
		if(websockets) {
			ws = Janus.newWebSocket(server, 'janus-protocol');
			wsHandlers = {
				'error': function() {
					Janus.error("Error connecting to the Janus WebSockets server... " + server);
					if (Janus.isArray(servers) && !callbacks["reconnect"]) {
						serversIndex++;
						if (serversIndex == servers.length) {
							// We tried all the servers the user gave us and they all failed
							callbacks.error("Error connecting to any of the provided Janus servers: Is the server down?");
							return;
						}
						// Let's try the next server
						server = null;
						setTimeout(function() {
							createSession(callbacks);
						}, 200);
						return;
					}
					callbacks.error("Error connecting to the Janus WebSockets server: Is the server down?");
				},

				'open': function() {
					// We need to be notified about the success
					transactions[transaction] = function(json) {
						Janus.debug(json);
						if (json["janus"] !== "success") {
							Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
							callbacks.error(json["error"].reason);
							return;
						}
						wsKeepaliveTimeoutId = setTimeout(keepAlive, keepAlivePeriod);
						connected = true;
						sessionId = json["session_id"] ? json["session_id"] : json.data["id"];
						if(callbacks["reconnect"]) {
							Janus.log("Claimed session: " + sessionId);
						} else {
							Janus.log("Created session: " + sessionId);
						}
						Janus.sessions[sessionId] = that;
						callbacks.success();
					};
					ws.send(JSON.stringify(request));
				},

				'message': function(event) {
					handleEvent(JSON.parse(event.data));
				},

				'close': function() {
					if (server === null || !connected) {
						return;
					}
					connected = false;
					// FIXME What if this is called when the page is closed?
					gatewayCallbacks.error("Lost connection to the server (is it down?)");
				}
			};

			for(var eventName in wsHandlers) {
				ws.addEventListener(eventName, wsHandlers[eventName]);
			}

			return;
		}
		Janus.httpAPICall(server, {
			verb: 'POST',
			withCredentials: withCredentials,
			body: request,
			success: function(json) {
				Janus.debug(json);
				if(json["janus"] !== "success") {
					Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
					callbacks.error(json["error"].reason);
					return;
				}
				connected = true;
				sessionId = json["session_id"] ? json["session_id"] : json.data["id"];
				if(callbacks["reconnect"]) {
					Janus.log("Claimed session: " + sessionId);
				} else {
					Janus.log("Created session: " + sessionId);
				}
				Janus.sessions[sessionId] = that;
				eventHandler();
				callbacks.success();
			},
			error: function(textStatus, errorThrown) {
				Janus.error(textStatus + ":", errorThrown);	// FIXME
				if(Janus.isArray(servers) && !callbacks["reconnect"]) {
					serversIndex++;
					if(serversIndex == servers.length) {
						// We tried all the servers the user gave us and they all failed
						callbacks.error("Error connecting to any of the provided Janus servers: Is the server down?");
						return;
					}
					// Let's try the next server
					server = null;
					setTimeout(function() { createSession(callbacks); }, 200);
					return;
				}
				if(errorThrown === "")
					callbacks.error(textStatus + ": Is the server down?");
				else
					callbacks.error(textStatus + ": " + errorThrown);
			}
		});
	}

	// Private method to destroy a session
	function destroySession(callbacks) {
		callbacks = callbacks || {};
		// FIXME This method triggers a success even when we fail
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		var asyncRequest = true;
		if(callbacks.asyncRequest !== undefined && callbacks.asyncRequest !== null)
			asyncRequest = (callbacks.asyncRequest === true);
		var notifyDestroyed = true;
		if(callbacks.notifyDestroyed !== undefined && callbacks.notifyDestroyed !== null)
			notifyDestroyed = (callbacks.notifyDestroyed === true);
		var cleanupHandles = false;
		if(callbacks.cleanupHandles !== undefined && callbacks.cleanupHandles !== null)
			cleanupHandles = (callbacks.cleanupHandles === true);
		Janus.log("Destroying session " + sessionId + " (async=" + asyncRequest + ")");
		if(!connected) {
			Janus.warn("Is the server down? (connected=false)");
			callbacks.success();
			return;
		}
		if(sessionId === undefined || sessionId === null) {
			Janus.warn("No session to destroy");
			callbacks.success();
			if(notifyDestroyed)
				gatewayCallbacks.destroyed();
			return;
		}
		if(cleanupHandles) {
			for(var handleId in pluginHandles)
				destroyHandle(handleId, { noRequest: true });
		}
		if(!connected) {
			Janus.warn("Is the server down? (connected=false)");
			callbacks.success();
			return;
		}
		// No need to destroy all handles first, Janus will do that itself
		var request = { "janus": "destroy", "transaction": Janus.randomString(12) };
		if(token !== null && token !== undefined)
			request["token"] = token;
		if(apisecret !== null && apisecret !== undefined)
			request["apisecret"] = apisecret;
		if(websockets) {
			request["session_id"] = sessionId;

			var unbindWebSocket = function() {
				for(var eventName in wsHandlers) {
					ws.removeEventListener(eventName, wsHandlers[eventName]);
				}
				ws.removeEventListener('message', onUnbindMessage);
				ws.removeEventListener('error', onUnbindError);
				if(wsKeepaliveTimeoutId) {
					clearTimeout(wsKeepaliveTimeoutId);
				}
				ws.close();
			};

			var onUnbindMessage = function(event){
				var data = JSON.parse(event.data);
				if(data.session_id == request.session_id && data.transaction == request.transaction) {
					unbindWebSocket();
					callbacks.success();
					if(notifyDestroyed)
						gatewayCallbacks.destroyed();
				}
			};
			var onUnbindError = function(event) {
				unbindWebSocket();
				callbacks.error("Failed to destroy the server: Is the server down?");
				if(notifyDestroyed)
					gatewayCallbacks.destroyed();
			};

			ws.addEventListener('message', onUnbindMessage);
			ws.addEventListener('error', onUnbindError);

			ws.send(JSON.stringify(request));
			return;
		}
		Janus.httpAPICall(server + "/" + sessionId, {
			verb: 'POST',
			async: asyncRequest,	// Sometimes we need false here, or destroying in onbeforeunload won't work
			withCredentials: withCredentials,
			body: request,
			success: function(json) {
				Janus.log("Destroyed session:");
				Janus.debug(json);
				sessionId = null;
				connected = false;
				if(json["janus"] !== "success") {
					Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
				}
				callbacks.success();
				if(notifyDestroyed)
					gatewayCallbacks.destroyed();
			},
			error: function(textStatus, errorThrown) {
				Janus.error(textStatus + ":", errorThrown);	// FIXME
				// Reset everything anyway
				sessionId = null;
				connected = false;
				callbacks.success();
				if(notifyDestroyed)
					gatewayCallbacks.destroyed();
			}
		});
	}

	// Private method to create a plugin handle
	function createHandle(callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
		callbacks.consentDialog = (typeof callbacks.consentDialog == "function") ? callbacks.consentDialog : Janus.noop;
		callbacks.iceState = (typeof callbacks.iceState == "function") ? callbacks.iceState : Janus.noop;
		callbacks.mediaState = (typeof callbacks.mediaState == "function") ? callbacks.mediaState : Janus.noop;
		callbacks.webrtcState = (typeof callbacks.webrtcState == "function") ? callbacks.webrtcState : Janus.noop;
		callbacks.slowLink = (typeof callbacks.slowLink == "function") ? callbacks.slowLink : Janus.noop;
		callbacks.onmessage = (typeof callbacks.onmessage == "function") ? callbacks.onmessage : Janus.noop;
		callbacks.onlocalstream = (typeof callbacks.onlocalstream == "function") ? callbacks.onlocalstream : Janus.noop;
		callbacks.onremotestream = (typeof callbacks.onremotestream == "function") ? callbacks.onremotestream : Janus.noop;
		callbacks.ondata = (typeof callbacks.ondata == "function") ? callbacks.ondata : Janus.noop;
		callbacks.ondataopen = (typeof callbacks.ondataopen == "function") ? callbacks.ondataopen : Janus.noop;
		callbacks.oncleanup = (typeof callbacks.oncleanup == "function") ? callbacks.oncleanup : Janus.noop;
		callbacks.ondetached = (typeof callbacks.ondetached == "function") ? callbacks.ondetached : Janus.noop;
		if(!connected) {
			Janus.warn("Is the server down? (connected=false)");
			callbacks.error("Is the server down? (connected=false)");
			return;
		}
		var plugin = callbacks.plugin;
		if(plugin === undefined || plugin === null) {
			Janus.error("Invalid plugin");
			callbacks.error("Invalid plugin");
			return;
		}
		var opaqueId = callbacks.opaqueId;
		var handleToken = callbacks.token ? callbacks.token : token;
		var transaction = Janus.randomString(12);
		var request = { "janus": "attach", "plugin": plugin, "opaque_id": opaqueId, "transaction": transaction };
		if(handleToken !== null && handleToken !== undefined)
			request["token"] = handleToken;
		if(apisecret !== null && apisecret !== undefined)
			request["apisecret"] = apisecret;
		if(websockets) {
			transactions[transaction] = function(json) {
				Janus.debug(json);
				if(json["janus"] !== "success") {
					Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
					callbacks.error("Ooops: " + json["error"].code + " " + json["error"].reason);
					return;
				}
				var handleId = json.data["id"];
				Janus.log("Created handle: " + handleId);
				var pluginHandle =
					{
						session : that,
						plugin : plugin,
						id : handleId,
						token : handleToken,
						detached : false,
						webrtcStuff : {
							started : false,
							myStream : null,
							streamExternal : false,
							remoteStream : null,
							mySdp : null,
							mediaConstraints : null,
							pc : null,
							dataChannel : null,
							dtmfSender : null,
							trickle : true,
							iceDone : false,
							volume : {
								value : null,
								timer : null
							},
							bitrate : {
								value : null,
								bsnow : null,
								bsbefore : null,
								tsnow : null,
								tsbefore : null,
								timer : null
							}
						},
						getId : function() { return handleId; },
						getPlugin : function() { return plugin; },
						getVolume : function() { return getVolume(handleId, true); },
						getRemoteVolume : function() { return getVolume(handleId, true); },
						getLocalVolume : function() { return getVolume(handleId, false); },
						isAudioMuted : function() { return isMuted(handleId, false); },
						muteAudio : function() { return mute(handleId, false, true); },
						unmuteAudio : function() { return mute(handleId, false, false); },
						isVideoMuted : function() { return isMuted(handleId, true); },
						muteVideo : function() { return mute(handleId, true, true); },
						unmuteVideo : function() { return mute(handleId, true, false); },
						getBitrate : function() { return getBitrate(handleId); },
						send : function(callbacks) { sendMessage(handleId, callbacks); },
						data : function(callbacks) { sendData(handleId, callbacks); },
						dtmf : function(callbacks) { sendDtmf(handleId, callbacks); },
						consentDialog : callbacks.consentDialog,
						iceState : callbacks.iceState,
						mediaState : callbacks.mediaState,
						webrtcState : callbacks.webrtcState,
						slowLink : callbacks.slowLink,
						onmessage : callbacks.onmessage,
						createOffer : function(callbacks) { prepareWebrtc(handleId,true, callbacks); },
						createAnswer : function(callbacks) { prepareWebrtc(handleId,false,callbacks); },
						handleRemoteJsep : function(callbacks) { prepareWebrtcPeer(handleId, callbacks); },
						onlocalstream : callbacks.onlocalstream,
						onremotestream : callbacks.onremotestream,
						ondata : callbacks.ondata,
						ondataopen : callbacks.ondataopen,
						oncleanup : callbacks.oncleanup,
						ondetached : callbacks.ondetached,
						hangup : function(sendRequest) { cleanupWebrtc(handleId, sendRequest === true); },
						detach : function(callbacks) { destroyHandle(handleId, callbacks); }
					};
				pluginHandles[handleId] = pluginHandle;
				callbacks.success(pluginHandle);
			};
			request["session_id"] = sessionId;
			ws.send(JSON.stringify(request));
			return;
		}
		Janus.httpAPICall(server + "/" + sessionId, {
			verb: 'POST',
			withCredentials: withCredentials,
			body: request,
			success: function(json) {
				Janus.debug(json);
				if(json["janus"] !== "success") {
					Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
					callbacks.error("Ooops: " + json["error"].code + " " + json["error"].reason);
					return;
				}
				var handleId = json.data["id"];
				Janus.log("Created handle: " + handleId);
				var pluginHandle =
					{
						session : that,
						plugin : plugin,
						id : handleId,
						token : handleToken,
						detached : false,
						webrtcStuff : {
							started : false,
							myStream : null,
							streamExternal : false,
							remoteStream : null,
							mySdp : null,
							mediaConstraints : null,
							pc : null,
							dataChannel : null,
							dtmfSender : null,
							trickle : true,
							iceDone : false,
							volume : {
								value : null,
								timer : null
							},
							bitrate : {
								value : null,
								bsnow : null,
								bsbefore : null,
								tsnow : null,
								tsbefore : null,
								timer : null
							}
						},
						getId : function() { return handleId; },
						getPlugin : function() { return plugin; },
						getVolume : function() { return getVolume(handleId, true); },
						getRemoteVolume : function() { return getVolume(handleId, true); },
						getLocalVolume : function() { return getVolume(handleId, false); },
						isAudioMuted : function() { return isMuted(handleId, false); },
						muteAudio : function() { return mute(handleId, false, true); },
						unmuteAudio : function() { return mute(handleId, false, false); },
						isVideoMuted : function() { return isMuted(handleId, true); },
						muteVideo : function() { return mute(handleId, true, true); },
						unmuteVideo : function() { return mute(handleId, true, false); },
						getBitrate : function() { return getBitrate(handleId); },
						send : function(callbacks) { sendMessage(handleId, callbacks); },
						data : function(callbacks) { sendData(handleId, callbacks); },
						dtmf : function(callbacks) { sendDtmf(handleId, callbacks); },
						consentDialog : callbacks.consentDialog,
						iceState : callbacks.iceState,
						mediaState : callbacks.mediaState,
						webrtcState : callbacks.webrtcState,
						slowLink : callbacks.slowLink,
						onmessage : callbacks.onmessage,
						createOffer : function(callbacks) { prepareWebrtc(handleId, callbacks); },
						createAnswer : function(callbacks) { prepareWebrtc(handleId, callbacks); },
						handleRemoteJsep : function(callbacks) { prepareWebrtcPeer(handleId, callbacks); },
						onlocalstream : callbacks.onlocalstream,
						onremotestream : callbacks.onremotestream,
						ondata : callbacks.ondata,
						ondataopen : callbacks.ondataopen,
						oncleanup : callbacks.oncleanup,
						ondetached : callbacks.ondetached,
						hangup : function(sendRequest) { cleanupWebrtc(handleId, sendRequest === true); },
						detach : function(callbacks) { destroyHandle(handleId, callbacks); }
					};
				pluginHandles[handleId] = pluginHandle;
				callbacks.success(pluginHandle);
			},
			error: function(textStatus, errorThrown) {
				Janus.error(textStatus + ":", errorThrown);	// FIXME
			}
		});
	}

	// Private method to send a message
	function sendMessage(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
		if(!connected) {
			Janus.warn("Is the server down? (connected=false)");
			callbacks.error("Is the server down? (connected=false)");
			return;
		}
		var pluginHandle = pluginHandles[handleId];
		if(pluginHandle === null || pluginHandle === undefined ||
				pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var message = callbacks.message;
		var jsep = callbacks.jsep;
		var transaction = Janus.randomString(12);
		var request = { "janus": "message", "body": message, "transaction": transaction };
		if(pluginHandle.token !== null && pluginHandle.token !== undefined)
			request["token"] = pluginHandle.token;
		if(apisecret !== null && apisecret !== undefined)
			request["apisecret"] = apisecret;
		if(jsep !== null && jsep !== undefined)
			request.jsep = jsep;
		Janus.debug("Sending message to plugin (handle=" + handleId + "):");
		Janus.debug(request);
		if(websockets) {
			request["session_id"] = sessionId;
			request["handle_id"] = handleId;
			transactions[transaction] = function(json) {
				Janus.debug("Message sent!");
				Janus.debug(json);
				if(json["janus"] === "success") {
					// We got a success, must have been a synchronous transaction
					var plugindata = json["plugindata"];
					if(plugindata === undefined || plugindata === null) {
						Janus.warn("Request succeeded, but missing plugindata...");
						callbacks.success();
						return;
					}
					Janus.log("Synchronous transaction successful (" + plugindata["plugin"] + ")");
					var data = plugindata["data"];
					Janus.debug(data);
					callbacks.success(data);
					return;
				} else if(json["janus"] !== "ack") {
					// Not a success and not an ack, must be an error
					if(json["error"] !== undefined && json["error"] !== null) {
						Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
						callbacks.error(json["error"].code + " " + json["error"].reason);
					} else {
						Janus.error("Unknown error");	// FIXME
						callbacks.error("Unknown error");
					}
					return;
				}
				// If we got here, the plugin decided to handle the request asynchronously
				callbacks.success();
			};
			ws.send(JSON.stringify(request));
			return;
		}
		Janus.httpAPICall(server + "/" + sessionId + "/" + handleId, {
			verb: 'POST',
			withCredentials: withCredentials,
			body: request,
			success: function(json) {
				Janus.debug("Message sent!");
				Janus.debug(json);
				if(json["janus"] === "success") {
					// We got a success, must have been a synchronous transaction
					var plugindata = json["plugindata"];
					if(plugindata === undefined || plugindata === null) {
						Janus.warn("Request succeeded, but missing plugindata...");
						callbacks.success();
						return;
					}
					Janus.log("Synchronous transaction successful (" + plugindata["plugin"] + ")");
					var data = plugindata["data"];
					Janus.debug(data);
					callbacks.success(data);
					return;
				} else if(json["janus"] !== "ack") {
					// Not a success and not an ack, must be an error
					if(json["error"] !== undefined && json["error"] !== null) {
						Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
						callbacks.error(json["error"].code + " " + json["error"].reason);
					} else {
						Janus.error("Unknown error");	// FIXME
						callbacks.error("Unknown error");
					}
					return;
				}
				// If we got here, the plugin decided to handle the request asynchronously
				callbacks.success();
			},
			error: function(textStatus, errorThrown) {
				Janus.error(textStatus + ":", errorThrown);	// FIXME
				callbacks.error(textStatus + ": " + errorThrown);
			}
		});
	}

	// Private method to send a trickle candidate
	function sendTrickleCandidate(handleId, candidate) {
		if(!connected) {
			Janus.warn("Is the server down? (connected=false)");
			return;
		}
		var pluginHandle = pluginHandles[handleId];
		if(pluginHandle === null || pluginHandle === undefined ||
				pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			return;
		}
		var request = { "janus": "trickle", "candidate": candidate, "transaction": Janus.randomString(12) };
		if(pluginHandle.token !== null && pluginHandle.token !== undefined)
			request["token"] = pluginHandle.token;
		if(apisecret !== null && apisecret !== undefined)
			request["apisecret"] = apisecret;
		Janus.vdebug("Sending trickle candidate (handle=" + handleId + "):");
		Janus.vdebug(request);
		if(websockets) {
			request["session_id"] = sessionId;
			request["handle_id"] = handleId;
			ws.send(JSON.stringify(request));
			return;
		}
		Janus.httpAPICall(server + "/" + sessionId + "/" + handleId, {
			verb: 'POST',
			withCredentials: withCredentials,
			body: request,
			success: function(json) {
				Janus.vdebug("Candidate sent!");
				Janus.vdebug(json);
				if(json["janus"] !== "ack") {
					Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
					return;
				}
			},
			error: function(textStatus, errorThrown) {
				Janus.error(textStatus + ":", errorThrown);	// FIXME
			}
		});
	}

	// Private method to create a data channel
	function createDataChannel(handleId, dclabel, incoming, pendingText) {
		var pluginHandle = pluginHandles[handleId];
		if(!pluginHandle || !pluginHandle.webrtcStuff) {
			Janus.warn("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		var onDataChannelMessage = function(event) {
			Janus.log('Received message on data channel:', event);
			var label = event.target.label;
			pluginHandle.ondata(event.data, label);
		};
		var onDataChannelStateChange = function(event) {
			Janus.log('Received state change on data channel:', event);
			var label = event.target.label;
			var dcState = config.dataChannel[label] ? config.dataChannel[label].readyState : "null";
			Janus.log('State change on <' + label + '> data channel: ' + dcState);
			if(dcState === 'open') {
				// Any pending messages to send?
				if(config.dataChannel[label].pending && config.dataChannel[label].pending.length > 0) {
					Janus.log("Sending pending messages on <" + label + ">:", config.dataChannel[label].pending.length);
					for(var text of config.dataChannel[label].pending) {
						Janus.log("Sending string on data channel <" + label + ">: " + text);
						config.dataChannel[label].send(text);
					}
					config.dataChannel[label].pending = [];
				}
				// Notify the open data channel
				pluginHandle.ondataopen(label);
			}
		};
		var onDataChannelError = function(error) {
			Janus.error('Got error on data channel:', error);
			// TODO
		};
		if(!incoming) {
			// FIXME Add options (ordered, maxRetransmits, etc.)
			config.dataChannel[dclabel] = config.pc.createDataChannel(dclabel, {ordered:false});
		} else {
			// The channel was created by Janus
			config.dataChannel[dclabel] = incoming;
		}
		config.dataChannel[dclabel].onmessage = onDataChannelMessage;
		config.dataChannel[dclabel].onopen = onDataChannelStateChange;
		config.dataChannel[dclabel].onclose = onDataChannelStateChange;
		config.dataChannel[dclabel].onerror = onDataChannelError;
		config.dataChannel[dclabel].pending = [];
		if(pendingText)
			config.dataChannel[dclabel].pending.push(pendingText);
	}

	// Private method to send a data channel message
	function sendData(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
		var pluginHandle = pluginHandles[handleId];
		if(!pluginHandle || !pluginHandle.webrtcStuff) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		var text = callbacks.text;
		if(!text) {
			Janus.warn("Invalid text");
			callbacks.error("Invalid text");
			return;
		}
		var label = callbacks.label ? callbacks.label : Janus.dataChanDefaultLabel;
		if(!config.dataChannel[label]) {
			// Create new data channel and wait for it to open
			createDataChannel(handleId, label, false, text);
			callbacks.success();
			return;
		}
		if(config.dataChannel[label].readyState !== "open") {
			config.dataChannel[label].pending.push(text);
			callbacks.success();
			return;
		}
		Janus.log("Sending string on data channel <" + label + ">: " + text);
		config.dataChannel[label].send(text);
		callbacks.success();
	}

	// Private method to send a DTMF tone
	function sendDtmf(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
		var pluginHandle = pluginHandles[handleId];
		if(!pluginHandle || !pluginHandle.webrtcStuff) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		if(!config.dtmfSender) {
			// Create the DTMF sender the proper way, if possible
			if(config.pc) {
				var senders = config.pc.getSenders();
				var audioSender = senders.find(function(sender) {
					return sender.track && sender.track.kind === 'audio';
				});
				if(!audioSender) {
					Janus.warn("Invalid DTMF configuration (no audio track)");
					callbacks.error("Invalid DTMF configuration (no audio track)");
					return;
				}
				config.dtmfSender = audioSender.dtmf;
				if(config.dtmfSender) {
					Janus.log("Created DTMF Sender");
					config.dtmfSender.ontonechange = function(tone) { Janus.debug("Sent DTMF tone: " + tone.tone); };
				}
			}
			if(!config.dtmfSender) {
				Janus.warn("Invalid DTMF configuration");
				callbacks.error("Invalid DTMF configuration");
				return;
			}
		}
		var dtmf = callbacks.dtmf;
		if(!dtmf) {
			Janus.warn("Invalid DTMF parameters");
			callbacks.error("Invalid DTMF parameters");
			return;
		}
		var tones = dtmf.tones;
		if(!tones) {
			Janus.warn("Invalid DTMF string");
			callbacks.error("Invalid DTMF string");
			return;
		}
		var duration = (typeof dtmf.duration === 'number') ? dtmf.duration : 500; // We choose 500ms as the default duration for a tone
		var gap = (typeof dtmf.gap === 'number') ? dtmf.gap : 50; // We choose 50ms as the default gap between tones
		Janus.debug("Sending DTMF string " + tones + " (duration " + duration + "ms, gap " + gap + "ms)");
		config.dtmfSender.insertDTMF(tones, duration, gap);
		callbacks.success();
	}

	// Private method to destroy a plugin handle
	function destroyHandle(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
		var asyncRequest = true;
		if(callbacks.asyncRequest !== undefined && callbacks.asyncRequest !== null)
			asyncRequest = (callbacks.asyncRequest === true);
		var noRequest = true;
		if(callbacks.noRequest !== undefined && callbacks.noRequest !== null)
			noRequest = (callbacks.noRequest === true);
		Janus.log("Destroying handle " + handleId + " (async=" + asyncRequest + ")");
		cleanupWebrtc(handleId);
		var pluginHandle = pluginHandles[handleId];
		if(!pluginHandle || pluginHandle.detached) {
			// Plugin was already detached by Janus, calling detach again will return a handle not found error, so just exit here
			delete pluginHandles[handleId];
			callbacks.success();
			return;
		}
		if(noRequest) {
			// We're only removing the handle locally
			delete pluginHandles[handleId];
			callbacks.success();
			return;
		}
		if(!connected) {
			Janus.warn("Is the server down? (connected=false)");
			callbacks.error("Is the server down? (connected=false)");
			return;
		}
		var request = { "janus": "detach", "transaction": Janus.randomString(12) };
		if(pluginHandle.token)
			request["token"] = pluginHandle.token;
		if(apisecret)
			request["apisecret"] = apisecret;
		if(websockets) {
			request["session_id"] = sessionId;
			request["handle_id"] = handleId;
			ws.send(JSON.stringify(request));
			delete pluginHandles[handleId];
			callbacks.success();
			return;
		}
		Janus.httpAPICall(server + "/" + sessionId + "/" + handleId, {
			verb: 'POST',
			async: asyncRequest,	// Sometimes we need false here, or destroying in onbeforeunload won't work
			withCredentials: withCredentials,
			body: request,
			success: function(json) {
				Janus.log("Destroyed handle:");
				Janus.debug(json);
				if(json["janus"] !== "success") {
					Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);	// FIXME
				}
				delete pluginHandles[handleId];
				callbacks.success();
			},
			error: function(textStatus, errorThrown) {
				Janus.error(textStatus + ":", errorThrown);	// FIXME
				// We cleanup anyway
				delete pluginHandles[handleId];
				callbacks.success();
			}
		});
	}

	// WebRTC stuff
	function streamsDone(handleId, jsep, media, callbacks, stream) {
		var pluginHandle = pluginHandles[handleId];
		if(!pluginHandle || !pluginHandle.webrtcStuff) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		Janus.debug("streamsDone:", stream);
		if(stream) {
			Janus.debug("  -- Audio tracks:", stream.getAudioTracks());
			Janus.debug("  -- Video tracks:", stream.getVideoTracks());
		}
		// We're now capturing the new stream: check if we're updating or if it's a new thing
		var addTracks = false;
		if(!config.myStream || !media.update || config.streamExternal) {
			config.myStream = stream;
			addTracks = true;
		} else {
			// We only need to update the existing stream
			if(((!media.update && isAudioSendEnabled(media)) || (media.update && (media.addAudio || media.replaceAudio))) &&
					stream.getAudioTracks() && stream.getAudioTracks().length) {
				config.myStream.addTrack(stream.getAudioTracks()[0]);
				if(Janus.unifiedPlan) {
					// Use Transceivers
					Janus.log((media.replaceAudio ? "Replacing" : "Adding") + " audio track:", stream.getAudioTracks()[0]);
					var audioTransceiver = null;
					var transceivers = config.pc.getTransceivers();
					if(transceivers && transceivers.length > 0) {
						for(var t of transceivers) {
							if((t.sender && t.sender.track && t.sender.track.kind === "audio") ||
									(t.receiver && t.receiver.track && t.receiver.track.kind === "audio")) {
								audioTransceiver = t;
								break;
							}
						}
					}
					if(audioTransceiver && audioTransceiver.sender) {
						audioTransceiver.sender.replaceTrack(stream.getAudioTracks()[0]);
					} else {
						Janus.log((media.replaceAudio ? "Replacing" : "Adding") + " audio track:", stream.getAudioTracks()[0]);
						config.pc.addTrack(stream.getAudioTracks()[0], stream);
					}
				} else {
					Janus.log((media.replaceAudio ? "Replacing" : "Adding") + " audio track:", stream.getAudioTracks()[0]);
					config.pc.addTrack(stream.getAudioTracks()[0], stream);
				}
			}
			if(((!media.update && isVideoSendEnabled(media)) || (media.update && (media.addVideo || media.replaceVideo))) &&
					stream.getVideoTracks() && stream.getVideoTracks().length) {
				config.myStream.addTrack(stream.getVideoTracks()[0]);
				if(Janus.unifiedPlan) {
					// Use Transceivers
					Janus.log((media.replaceVideo ? "Replacing" : "Adding") + " video track:", stream.getVideoTracks()[0]);
					var videoTransceiver = null;
					var transceivers = config.pc.getTransceivers();
					if(transceivers && transceivers.length > 0) {
						for(var t of transceivers) {
							if((t.sender && t.sender.track && t.sender.track.kind === "video") ||
									(t.receiver && t.receiver.track && t.receiver.track.kind === "video")) {
								videoTransceiver = t;
								break;
							}
						}
					}
					if(videoTransceiver && videoTransceiver.sender) {
						videoTransceiver.sender.replaceTrack(stream.getVideoTracks()[0]);
					} else {
						config.pc.addTrack(stream.getVideoTracks()[0], stream);
					}
				} else {
					Janus.log((media.replaceVideo ? "Replacing" : "Adding") + " video track:", stream.getVideoTracks()[0]);
					config.pc.addTrack(stream.getVideoTracks()[0], stream);
				}
			}
		}
		// If we still need to create a PeerConnection, let's do that
		if(!config.pc) {
			var pc_config = {"iceServers": iceServers, "iceTransportPolicy": iceTransportPolicy, "bundlePolicy": bundlePolicy};
			if(Janus.webRTCAdapter.browserDetails.browser === "chrome") {
				// For Chrome versions before 72, we force a plan-b semantic, and unified-plan otherwise
				pc_config["sdpSemantics"] = (Janus.webRTCAdapter.browserDetails.version < 72) ? "plan-b" : "unified-plan";
			}
			var pc_constraints = {
				"optional": [{"DtlsSrtpKeyAgreement": true}]
			};
			if(ipv6Support) {
				pc_constraints.optional.push({"googIPv6":true});
			}
			// Any custom constraint to add?
			if(callbacks.rtcConstraints && typeof callbacks.rtcConstraints === 'object') {
				Janus.debug("Adding custom PeerConnection constraints:", callbacks.rtcConstraints);
				for(var i in callbacks.rtcConstraints) {
					pc_constraints.optional.push(callbacks.rtcConstraints[i]);
				}
			}
			if(Janus.webRTCAdapter.browserDetails.browser === "edge") {
				// This is Edge, enable BUNDLE explicitly
				pc_config.bundlePolicy = "max-bundle";
			}
			Janus.log("Creating PeerConnection");
			Janus.debug(pc_constraints);
			config.pc = new RTCPeerConnection(pc_config, pc_constraints);
			Janus.debug(config.pc);
			if(config.pc.getStats) {	// FIXME
				config.volume = {};
				config.bitrate.value = "0 kbits/sec";
			}
			Janus.log("Preparing local SDP and gathering candidates (trickle=" + config.trickle + ")");
			config.pc.oniceconnectionstatechange = function(e) {
				if(config.pc)
					pluginHandle.iceState(config.pc.iceConnectionState);
			};
			config.pc.onicecandidate = function(event) {
				if (!event.candidate ||
						(Janus.webRTCAdapter.browserDetails.browser === 'edge' && event.candidate.candidate.indexOf('endOfCandidates') > 0)) {
					Janus.log("End of candidates.");
					config.iceDone = true;
					if(config.trickle === true) {
						// Notify end of candidates
						sendTrickleCandidate(handleId, {"completed": true});
					} else {
						// No trickle, time to send the complete SDP (including all candidates)
						sendSDP(handleId, callbacks);
					}
				} else {
					// JSON.stringify doesn't work on some WebRTC objects anymore
					// See https://code.google.com/p/chromium/issues/detail?id=467366
					var candidate = {
						"candidate": event.candidate.candidate,
						"sdpMid": event.candidate.sdpMid,
						"sdpMLineIndex": event.candidate.sdpMLineIndex
					};
					if(config.trickle === true) {
						// Send candidate
						sendTrickleCandidate(handleId, candidate);
					}
				}
			};
			config.pc.ontrack = function(event) {
				Janus.log("Handling Remote Track");
				Janus.debug(event);
				if(!event.streams)
					return;
				config.remoteStream = event.streams[0];
				pluginHandle.onremotestream(config.remoteStream);
				if(event.track.onended)
					return;
				Janus.log("Adding onended callback to track:", event.track);
				event.track.onended = function(ev) {
					Janus.log("Remote track muted/removed:", ev);
					if(config.remoteStream) {
						config.remoteStream.removeTrack(ev.target);
						pluginHandle.onremotestream(config.remoteStream);
					}
				};
				/*event.track.onmute = event.track.onended;
				event.track.onunmute = function(ev) {
					Janus.log("Remote track flowing again:", ev);
					try {
						config.remoteStream.addTrack(ev.target);
						pluginHandle.onremotestream(config.remoteStream);
					} catch(e) {
						Janus.error(e);
					};
				};*/
			};
		}
		if(addTracks && stream) {
			Janus.log('Adding local stream');
			var simulcast2 = (callbacks.simulcast2 === true);
			stream.getTracks().forEach(function(track) {
				Janus.log('Adding local track:', track);
				if(!simulcast2) {
					config.pc.addTrack(track, stream);
				} else {
					if(track.kind === "audio") {
						config.pc.addTrack(track, stream);
					} else {
						Janus.log('Enabling rid-based simulcasting:', track);
						const maxBitrates = getMaxBitrates(callbacks.simulcastMaxBitrates);
						config.pc.addTransceiver(track, {
							direction: "sendrecv",
							streams: [stream],
							sendEncodings: [
								{ rid: "h", active: true, maxBitrate: maxBitrates.high },
								{ rid: "m", active: true, maxBitrate: maxBitrates.medium, scaleResolutionDownBy: 2 },
								{ rid: "l", active: true, maxBitrate: maxBitrates.low }
							]
						});
					}
				}
			});
		}
		// Any data channel to create?
		if(isDataEnabled(media) && !config.dataChannel[Janus.dataChanDefaultLabel]) {
			Janus.log("Creating data channel");
			createDataChannel(handleId, Janus.dataChanDefaultLabel, false);
			config.pc.ondatachannel = function(event) {
				Janus.log("Data channel created by Janus:", event);
				createDataChannel(handleId, event.channel.label, event.channel);
			};
		}
		// If there's a new local stream, let's notify the application
		if(config.myStream)
			pluginHandle.onlocalstream(config.myStream);
		// Create offer/answer now
		if(!jsep) {
			createOffer(handleId, media, callbacks);
		} else {
			config.pc.setRemoteDescription(jsep)
				.then(function() {
					Janus.log("Remote description accepted!");
					config.remoteSdp = jsep.sdp;
					// Any trickle candidate we cached?
					if(config.candidates && config.candidates.length > 0) {
						for(var i = 0; i< config.candidates.length; i++) {
							var candidate = config.candidates[i];
							Janus.debug("Adding remote candidate:", candidate);
							if(!candidate || candidate.completed === true) {
								// end-of-candidates
								config.pc.addIceCandidate(Janus.endOfCandidates);
							} else {
								// New candidate
								config.pc.addIceCandidate(candidate);
							}
						}
						config.candidates = [];
					}
					// Create the answer now
					createAnswer(handleId, media, callbacks);
				}, callbacks.error);
		}
	}

	function prepareWebrtc(handleId, offer, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : webrtcError;
		var jsep = callbacks.jsep;
		if(offer && jsep) {
			Janus.error("Provided a JSEP to a createOffer");
			callbacks.error("Provided a JSEP to a createOffer");
			return;
		} else if(!offer && (!jsep || !jsep.type || !jsep.sdp)) {
			Janus.error("A valid JSEP is required for createAnswer");
			callbacks.error("A valid JSEP is required for createAnswer");
			return;
		}
		/* Check that callbacks.media is a (not null) Object */
		callbacks.media = (typeof callbacks.media === 'object' && callbacks.media) ? callbacks.media : { audio: true, video: true };
		var media = callbacks.media;
		var pluginHandle = pluginHandles[handleId];
		if(!pluginHandle || !pluginHandle.webrtcStuff) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		config.trickle = isTrickleEnabled(callbacks.trickle);
		// Are we updating a session?
		if(!config.pc) {
			// Nope, new PeerConnection
			media.update = false;
			media.keepAudio = false;
			media.keepVideo = false;
		} else {
			Janus.log("Updating existing media session");
			media.update = true;
			// Check if there's anything to add/remove/replace, or if we
			// can go directly to preparing the new SDP offer or answer
			if(callbacks.stream) {
				// External stream: is this the same as the one we were using before?
				if(callbacks.stream !== config.myStream) {
					Janus.log("Renegotiation involves a new external stream");
				}
			} else {
				// Check if there are changes on audio
				if(media.addAudio) {
					media.keepAudio = false;
					media.replaceAudio = false;
					media.removeAudio = false;
					media.audioSend = true;
					if(config.myStream && config.myStream.getAudioTracks() && config.myStream.getAudioTracks().length) {
						Janus.error("Can't add audio stream, there already is one");
						callbacks.error("Can't add audio stream, there already is one");
						return;
					}
				} else if(media.removeAudio) {
					media.keepAudio = false;
					media.replaceAudio = false;
					media.addAudio = false;
					media.audioSend = false;
				} else if(media.replaceAudio) {
					media.keepAudio = false;
					media.addAudio = false;
					media.removeAudio = false;
					media.audioSend = true;
				}
				if(!config.myStream) {
					// No media stream: if we were asked to replace, it's actually an "add"
					if(media.replaceAudio) {
						media.keepAudio = false;
						media.replaceAudio = false;
						media.addAudio = true;
						media.audioSend = true;
					}
					if(isAudioSendEnabled(media)) {
						media.keepAudio = false;
						media.addAudio = true;
					}
				} else {
					if(!config.myStream.getAudioTracks() || config.myStream.getAudioTracks().length === 0) {
						// No audio track: if we were asked to replace, it's actually an "add"
						if(media.replaceAudio) {
							media.keepAudio = false;
							media.replaceAudio = false;
							media.addAudio = true;
							media.audioSend = true;
						}
						if(isAudioSendEnabled(media)) {
							media.keepVideo = false;
							media.addAudio = true;
						}
					} else {
						// We have an audio track: should we keep it as it is?
						if(isAudioSendEnabled(media) &&
								!media.removeAudio && !media.replaceAudio) {
							media.keepAudio = true;
						}
					}
				}
				// Check if there are changes on video
				if(media.addVideo) {
					media.keepVideo = false;
					media.replaceVideo = false;
					media.removeVideo = false;
					media.videoSend = true;
					if(config.myStream && config.myStream.getVideoTracks() && config.myStream.getVideoTracks().length) {
						Janus.error("Can't add video stream, there already is one");
						callbacks.error("Can't add video stream, there already is one");
						return;
					}
				} else if(media.removeVideo) {
					media.keepVideo = false;
					media.replaceVideo = false;
					media.addVideo = false;
					media.videoSend = false;
				} else if(media.replaceVideo) {
					media.keepVideo = false;
					media.addVideo = false;
					media.removeVideo = false;
					media.videoSend = true;
				}
				if(!config.myStream) {
					// No media stream: if we were asked to replace, it's actually an "add"
					if(media.replaceVideo) {
						media.keepVideo = false;
						media.replaceVideo = false;
						media.addVideo = true;
						media.videoSend = true;
					}
					if(isVideoSendEnabled(media)) {
						media.keepVideo = false;
						media.addVideo = true;
					}
				} else {
					if(!config.myStream.getVideoTracks() || config.myStream.getVideoTracks().length === 0) {
						// No video track: if we were asked to replace, it's actually an "add"
						if(media.replaceVideo) {
							media.keepVideo = false;
							media.replaceVideo = false;
							media.addVideo = true;
							media.videoSend = true;
						}
						if(isVideoSendEnabled(media)) {
							media.keepVideo = false;
							media.addVideo = true;
						}
					} else {
						// We have a video track: should we keep it as it is?
						if(isVideoSendEnabled(media) &&
								!media.removeVideo && !media.replaceVideo) {
							media.keepVideo = true;
						}
					}
				}
				// Data channels can only be added
				if(media.addData)
					media.data = true;
			}
			// If we're updating and keeping all tracks, let's skip the getUserMedia part
			if((isAudioSendEnabled(media) && media.keepAudio) &&
					(isVideoSendEnabled(media) && media.keepVideo)) {
				pluginHandle.consentDialog(false);
				streamsDone(handleId, jsep, media, callbacks, config.myStream);
				return;
			}
		}
		// If we're updating, check if we need to remove/replace one of the tracks
		if(media.update && !config.streamExternal) {
			if(media.removeAudio || media.replaceAudio) {
				if(config.myStream && config.myStream.getAudioTracks() && config.myStream.getAudioTracks().length) {
					var s = config.myStream.getAudioTracks()[0];
					Janus.log("Removing audio track:", s);
					config.myStream.removeTrack(s);
					try {
						s.stop();
					} catch(e) {}				}
				if(config.pc.getSenders() && config.pc.getSenders().length) {
					var ra = true;
					if(media.replaceAudio && Janus.unifiedPlan) {
						// We can use replaceTrack
						ra = false;
					}
					if(ra) {
						for(var s of config.pc.getSenders()) {
							if(s && s.track && s.track.kind === "audio") {
								Janus.log("Removing audio sender:", s);
								config.pc.removeTrack(s);
							}
						}
					}
				}
			}
			if(media.removeVideo || media.replaceVideo) {
				if(config.myStream && config.myStream.getVideoTracks() && config.myStream.getVideoTracks().length) {
					var s = config.myStream.getVideoTracks()[0];
					Janus.log("Removing video track:", s);
					config.myStream.removeTrack(s);
					try {
						s.stop();
					} catch(e) {}				}
				if(config.pc.getSenders() && config.pc.getSenders().length) {
					var rv = true;
					if(media.replaceVideo && Janus.unifiedPlan) {
						// We can use replaceTrack
						rv = false;
					}
					if(rv) {
						for(var s of config.pc.getSenders()) {
							if(s && s.track && s.track.kind === "video") {
								Janus.log("Removing video sender:", s);
								config.pc.removeTrack(s);
							}
						}
					}
				}
			}
		}
		// Was a MediaStream object passed, or do we need to take care of that?
		if(callbacks.stream) {
			var stream = callbacks.stream;
			Janus.log("MediaStream provided by the application");
			Janus.debug(stream);
			// If this is an update, let's check if we need to release the previous stream
			if(media.update) {
				if(config.myStream && config.myStream !== callbacks.stream && !config.streamExternal) {
					// We're replacing a stream we captured ourselves with an external one
					try {
						// Try a MediaStreamTrack.stop() for each track
						var tracks = config.myStream.getTracks();
						for(var mst of tracks) {
							Janus.log(mst);
							if(mst)
								mst.stop();
						}
					} catch(e) {
						// Do nothing if this fails
					}
					config.myStream = null;
				}
			}
			// Skip the getUserMedia part
			config.streamExternal = true;
			pluginHandle.consentDialog(false);
			streamsDone(handleId, jsep, media, callbacks, stream);
			return;
		}
		if(isAudioSendEnabled(media) || isVideoSendEnabled(media)) {
			if(!Janus.isGetUserMediaAvailable()) {
				callbacks.error("getUserMedia not available");
				return;
			}
			var constraints = { mandatory: {}, optional: []};
			pluginHandle.consentDialog(true);
			var audioSupport = isAudioSendEnabled(media);
			if(audioSupport && media && typeof media.audio === 'object')
				audioSupport = media.audio;
			var videoSupport = isVideoSendEnabled(media);
			if(videoSupport && media) {
				var simulcast = (callbacks.simulcast === true);
				var simulcast2 = (callbacks.simulcast2 === true);
				if((simulcast || simulcast2) && !jsep && !media.video)
					media.video = "hires";
				if(media.video && media.video != 'screen' && media.video != 'window') {
					if(typeof media.video === 'object') {
						videoSupport = media.video;
					} else {
						var width = 0;
						var height = 0;
						if(media.video === 'lowres') {
							// Small resolution, 4:3
							height = 240;
							width = 320;
						} else if(media.video === 'lowres-16:9') {
							// Small resolution, 16:9
							height = 180;
							width = 320;
						} else if(media.video === 'hires' || media.video === 'hires-16:9' || media.video === 'hdres') {
							// High(HD) resolution is only 16:9
							height = 720;
							width = 1280;
						} else if(media.video === 'fhdres') {
							// Full HD resolution is only 16:9
							height = 1080;
							width = 1920;
						} else if(media.video === '4kres') {
							// 4K resolution is only 16:9
							height = 2160;
							width = 3840;
						} else if(media.video === 'stdres') {
							// Normal resolution, 4:3
							height = 480;
							width  = 640;
						} else if(media.video === 'stdres-16:9') {
							// Normal resolution, 16:9
							height = 360;
							width = 640;
						} else {
							Janus.log("Default video setting is stdres 4:3");
							height = 480;
							width = 640;
						}
						Janus.log("Adding media constraint:", media.video);
						videoSupport = {
							'height': {'ideal': height},
							'width':  {'ideal': width}
						};
						Janus.log("Adding video constraint:", videoSupport);
					}
				} else if(media.video === 'screen' || media.video === 'window') {
					if(!media.screenshareFrameRate) {
						media.screenshareFrameRate = 3;
					}
					if(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
						// The new experimental getDisplayMedia API is available, let's use that
						// https://groups.google.com/forum/#!topic/discuss-webrtc/Uf0SrR4uxzk
						// https://webrtchacks.com/chrome-screensharing-getdisplaymedia/
						navigator.mediaDevices.getDisplayMedia({ video: true, audio: media.captureDesktopAudio })
							.then(function(stream) {
								pluginHandle.consentDialog(false);
								if(isAudioSendEnabled(media) && !media.keepAudio) {
									navigator.mediaDevices.getUserMedia({ audio: true, video: false })
									.then(function (audioStream) {
										stream.addTrack(audioStream.getAudioTracks()[0]);
										streamsDone(handleId, jsep, media, callbacks, stream);
									});
								} else {
									streamsDone(handleId, jsep, media, callbacks, stream);
								}
							}, function (error) {
								pluginHandle.consentDialog(false);
								callbacks.error(error);
							});
						return;
					}
					// We're going to try and use the extension for Chrome 34+, the old approach
					// for older versions of Chrome, or the experimental support in Firefox 33+
					function callbackUserMedia (error, stream) {
						pluginHandle.consentDialog(false);
						if(error) {
							callbacks.error(error);
						} else {
							streamsDone(handleId, jsep, media, callbacks, stream);
						}
					}					function getScreenMedia(constraints, gsmCallback, useAudio) {
						Janus.log("Adding media constraint (screen capture)");
						Janus.debug(constraints);
						navigator.mediaDevices.getUserMedia(constraints)
							.then(function(stream) {
								if(useAudio) {
									navigator.mediaDevices.getUserMedia({ audio: true, video: false })
									.then(function (audioStream) {
										stream.addTrack(audioStream.getAudioTracks()[0]);
										gsmCallback(null, stream);
									});
								} else {
									gsmCallback(null, stream);
								}
							})
							.catch(function(error) { pluginHandle.consentDialog(false); gsmCallback(error); });
					}					if(Janus.webRTCAdapter.browserDetails.browser === 'chrome') {
						var chromever = Janus.webRTCAdapter.browserDetails.version;
						var maxver = 33;
						if(window.navigator.userAgent.match('Linux'))
							maxver = 35;	// "known" crash in chrome 34 and 35 on linux
						if(chromever >= 26 && chromever <= maxver) {
							// Chrome 26->33 requires some awkward chrome://flags manipulation
							constraints = {
								video: {
									mandatory: {
										googLeakyBucket: true,
										maxWidth: window.screen.width,
										maxHeight: window.screen.height,
										minFrameRate: media.screenshareFrameRate,
										maxFrameRate: media.screenshareFrameRate,
										chromeMediaSource: 'screen'
									}
								},
								audio: isAudioSendEnabled(media) && !media.keepAudio
							};
							getScreenMedia(constraints, callbackUserMedia);
						} else {
							// Chrome 34+ requires an extension
							Janus.extension.getScreen(function (error, sourceId) {
								if (error) {
									pluginHandle.consentDialog(false);
									return callbacks.error(error);
								}
								constraints = {
									audio: false,
									video: {
										mandatory: {
											chromeMediaSource: 'desktop',
											maxWidth: window.screen.width,
											maxHeight: window.screen.height,
											minFrameRate: media.screenshareFrameRate,
											maxFrameRate: media.screenshareFrameRate,
										},
										optional: [
											{googLeakyBucket: true},
											{googTemporalLayeredScreencast: true}
										]
									}
								};
								constraints.video.mandatory.chromeMediaSourceId = sourceId;
								getScreenMedia(constraints, callbackUserMedia,
									isAudioSendEnabled(media) && !media.keepAudio);
							});
						}
					} else if(Janus.webRTCAdapter.browserDetails.browser === 'firefox') {
						if(Janus.webRTCAdapter.browserDetails.version >= 33) {
							// Firefox 33+ has experimental support for screen sharing
							constraints = {
								video: {
									mozMediaSource: media.video,
									mediaSource: media.video
								},
								audio: isAudioSendEnabled(media) && !media.keepAudio
							};
							getScreenMedia(constraints, function (err, stream) {
								callbackUserMedia(err, stream);
								// Workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1045810
								if (!err) {
									var lastTime = stream.currentTime;
									var polly = window.setInterval(function () {
										if(!stream)
											window.clearInterval(polly);
										if(stream.currentTime == lastTime) {
											window.clearInterval(polly);
											if(stream.onended) {
												stream.onended();
											}
										}
										lastTime = stream.currentTime;
									}, 500);
								}
							});
						} else {
							var error = new Error('NavigatorUserMediaError');
							error.name = 'Your version of Firefox does not support screen sharing, please install Firefox 33 (or more recent versions)';
							pluginHandle.consentDialog(false);
							callbacks.error(error);
							return;
						}
					}
					return;
				}
			}
			// If we got here, we're not screensharing
			if(!media || media.video !== 'screen') {
				// Check whether all media sources are actually available or not
				navigator.mediaDevices.enumerateDevices().then(function(devices) {
					var audioExist = devices.some(function(device) {
						return device.kind === 'audioinput';
					}),
					videoExist = isScreenSendEnabled(media) || devices.some(function(device) {
						return device.kind === 'videoinput';
					});

					// Check whether a missing device is really a problem
					var audioSend = isAudioSendEnabled(media);
					var videoSend = isVideoSendEnabled(media);
					var needAudioDevice = isAudioSendRequired(media);
					var needVideoDevice = isVideoSendRequired(media);
					if(audioSend || videoSend || needAudioDevice || needVideoDevice) {
						// We need to send either audio or video
						var haveAudioDevice = audioSend ? audioExist : false;
						var haveVideoDevice = videoSend ? videoExist : false;
						if(!haveAudioDevice && !haveVideoDevice) {
							// FIXME Should we really give up, or just assume recvonly for both?
							pluginHandle.consentDialog(false);
							callbacks.error('No capture device found');
							return false;
						} else if(!haveAudioDevice && needAudioDevice) {
							pluginHandle.consentDialog(false);
							callbacks.error('Audio capture is required, but no capture device found');
							return false;
						} else if(!haveVideoDevice && needVideoDevice) {
							pluginHandle.consentDialog(false);
							callbacks.error('Video capture is required, but no capture device found');
							return false;
						}
					}

					var gumConstraints = {
						audio: (audioExist && !media.keepAudio) ? audioSupport : false,
						video: (videoExist && !media.keepVideo) ? videoSupport : false
					};
					
				
					
					Janus.debug("getUserMedia constraints", gumConstraints);
					if (!gumConstraints.audio && !gumConstraints.video) {
						pluginHandle.consentDialog(false);
						streamsDone(handleId, jsep, media, callbacks, stream);
					} else {
						if ('res' in window){
							gumConstraints.video =  {};
							gumConstraints.video.deviceId = videoDeviceId ? {exact:videoDeviceId}:undefined;
							let _res = getSizeFromRes(res);
							gumConstraints.video.width = {ideal: _res.width};
							gumConstraints.video.height = {ideal: _res.height};
						}
						if ('audio' in gumConstraints && !!gumConstraints.audio){
							gumConstraints.audio =  {};
							gumConstraints.audio.echoCancellation =  echoC;
							gumConstraints.audio.autoGainControl = gainC ;
							gumConstraints.audio.noiseSuppression = noiseS;
							gumConstraints.audio["channelCount"] = 2;
						  }
						navigator.mediaDevices.getUserMedia(gumConstraints)
							.then(function(stream) {
									stream.contentHint= window.audioType? window.audioType: "";
									window.delay = window.delay || 0;
									if (window.delay !==0 && gumConstraints.audio){
										var audioContext = new AudioContext();
										let recvAudioSource = audioContext.createMediaStreamSource(stream);
										const destination = audioContext.createMediaStreamDestination();
										const delayNode = audioContext.createDelay(10);
										delayNode.delayTime.value = window.delay || 0; // delay by 1 second
										recvAudioSource.connect(delayNode);
										recvAudioSource.muted =true;
										delayNode.connect(destination);
										pluginHandle.consentDialog(false);
										stream.addTrack(destination.stream.getAudioTracks()[0]);
										stream.removeTrack(stream.getAudioTracks()[0]);
									}
									if (window.volIncrease >0 && gumConstraints.audio){
										var audioContext = new AudioContext();
										let recvAudioSource = audioContext.createMediaStreamSource(stream);
										const destination = audioContext.createMediaStreamDestination();
										var gainNode = audioContext.createGain();
										gainNode.gain.value = window.volIncrease;
										recvAudioSource.connect(gainNode);
										gainNode.connect(destination);
										pluginHandle.consentDialog(false);
										stream.addTrack(destination.stream.getAudioTracks()[0]);
										stream.removeTrack(stream.getAudioTracks()[0]);
									}
									streamsDone(handleId, jsep, media, callbacks, stream);
								  
								  
							}).catch(function(error) {
								alert(error);
								pluginHandle.consentDialog(false);
								callbacks.error({code: error.code, name: error.name, message: error.message});
							});
					}
				})
				.catch(function(error) {
					pluginHandle.consentDialog(false);
					callbacks.error('enumerateDevices error', error);
				});
			}
		} else {
			// No need to do a getUserMedia, create offer/answer right away
			streamsDone(handleId, jsep, media, callbacks);
		}
	}

	function prepareWebrtcPeer(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : webrtcError;
		var jsep = callbacks.jsep;
		var pluginHandle = pluginHandles[handleId];
		if(!pluginHandle || !pluginHandle.webrtcStuff) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		if(jsep) {
			if(!config.pc) {
				Janus.warn("Wait, no PeerConnection?? if this is an answer, use createAnswer and not handleRemoteJsep");
				callbacks.error("No PeerConnection: if this is an answer, use createAnswer and not handleRemoteJsep");
				return;
			}
                   //jsep.sdp = setMediaBitrate(jsep.sdp, 'audio', 128);
                   jsep.sdp = addStereo2(jsep.sdp);

			config.pc.setRemoteDescription(jsep)
				.then(function() {
					Janus.log("Remote description accepted!");
		   //jsep.sdp = setMediaBitrate(jsep.sdp, 'audio', 128);
                   jsep.sdp = addStereo(jsep.sdp);

					config.remoteSdp = jsep.sdp;
					// Any trickle candidate we cached?
					if(config.candidates && config.candidates.length > 0) {
						for(var i = 0; i< config.candidates.length; i++) {
							var candidate = config.candidates[i];
							Janus.debug("Adding remote candidate:", candidate);
							if(!candidate || candidate.completed === true) {
								// end-of-candidates
								config.pc.addIceCandidate(Janus.endOfCandidates);
							} else {
								// New candidate
								config.pc.addIceCandidate(candidate);
							}
						}
						config.candidates = [];
					}
					// Done
					callbacks.success();
				}, callbacks.error);
		} else {
			callbacks.error("Invalid JSEP");
		}
	}

	function createOffer(handleId, media, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
		callbacks.customizeSdp = (typeof callbacks.customizeSdp == "function") ? callbacks.customizeSdp : Janus.noop;
		var pluginHandle = pluginHandles[handleId];
		if(!pluginHandle || !pluginHandle.webrtcStuff) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		var simulcast = (callbacks.simulcast === true);
		if(!simulcast) {
			Janus.log("Creating offer (iceDone=" + config.iceDone + ")");
		} else {
			Janus.log("Creating offer (iceDone=" + config.iceDone + ", simulcast=" + simulcast + ")");
		}
		// https://code.google.com/p/webrtc/issues/detail?id=3508
		var mediaConstraints = {voiceActivityDetection:false};
		if(Janus.unifiedPlan) {
			// We can use Transceivers
			var audioTransceiver = null, videoTransceiver = null;
			var transceivers = config.pc.getTransceivers();
			if(transceivers && transceivers.length > 0) {
				for(var t of transceivers) {
					if((t.sender && t.sender.track && t.sender.track.kind === "audio") ||
							(t.receiver && t.receiver.track && t.receiver.track.kind === "audio")) {
						if(!audioTransceiver)
							audioTransceiver = t;
						continue;
					}
					if((t.sender && t.sender.track && t.sender.track.kind === "video") ||
							(t.receiver && t.receiver.track && t.receiver.track.kind === "video")) {
						if(!videoTransceiver)
							videoTransceiver = t;
						continue;
					}
				}
			}
			// Handle audio (and related changes, if any)
			var audioSend = isAudioSendEnabled(media);
			var audioRecv = isAudioRecvEnabled(media);
			if(!audioSend && !audioRecv) {
				// Audio disabled: have we removed it?
				if(media.removeAudio && audioTransceiver) {
					if (audioTransceiver.setDirection) {
						audioTransceiver.setDirection("inactive");
					} else {
						audioTransceiver.direction = "inactive";
					}
					Janus.log("Setting audio transceiver to inactive:", audioTransceiver);
				}
			} else {
				// Take care of audio m-line
				if(audioSend && audioRecv) {
					if(audioTransceiver) {
						if (audioTransceiver.setDirection) {
							audioTransceiver.setDirection("sendrecv");
						} else {
							audioTransceiver.direction = "sendrecv";
						}
						Janus.log("Setting audio transceiver to sendrecv:", audioTransceiver);
					}
				} else if(audioSend && !audioRecv) {
					if(audioTransceiver) {
						if (audioTransceiver.setDirection) {
							audioTransceiver.setDirection("sendonly");
						} else {
							audioTransceiver.direction = "sendonly";
						}
						Janus.log("Setting audio transceiver to sendonly:", audioTransceiver);
					}
				} else if(!audioSend && audioRecv) {
					if(audioTransceiver) {
						if (audioTransceiver.setDirection) {
							audioTransceiver.setDirection("recvonly");
						} else {
							audioTransceiver.direction = "recvonly";
						}
						Janus.log("Setting audio transceiver to recvonly:", audioTransceiver);
					} else {
						// In theory, this is the only case where we might not have a transceiver yet
						audioTransceiver = config.pc.addTransceiver("audio", { direction: "recvonly" });
						Janus.log("Adding recvonly audio transceiver:", audioTransceiver);
					}
				}
			}
			// Handle video (and related changes, if any)
			var videoSend = isVideoSendEnabled(media);
			var videoRecv = isVideoRecvEnabled(media);
			if(!videoSend && !videoRecv) {
				// Video disabled: have we removed it?
				if(media.removeVideo && videoTransceiver) {
					if (videoTransceiver.setDirection) {
						videoTransceiver.setDirection("inactive");
					} else {
						videoTransceiver.direction = "inactive";
					}
					Janus.log("Setting video transceiver to inactive:", videoTransceiver);
				}
			} else {
				// Take care of video m-line
				if(videoSend && videoRecv) {
					if(videoTransceiver) {
						if (videoTransceiver.setDirection) {
							videoTransceiver.setDirection("sendrecv");
						} else {
							videoTransceiver.direction = "sendrecv";
						}
						Janus.log("Setting video transceiver to sendrecv:", videoTransceiver);
					}
				} else if(videoSend && !videoRecv) {
					if(videoTransceiver) {
						if (videoTransceiver.setDirection) {
							videoTransceiver.setDirection("sendonly");
						} else {
							videoTransceiver.direction = "sendonly";
						}
						Janus.log("Setting video transceiver to sendonly:", videoTransceiver);
					}
				} else if(!videoSend && videoRecv) {
					if(videoTransceiver) {
						if (videoTransceiver.setDirection) {
							videoTransceiver.setDirection("recvonly");
						} else {
							videoTransceiver.direction = "recvonly";
						}
						Janus.log("Setting video transceiver to recvonly:", videoTransceiver);
					} else {
						// In theory, this is the only case where we might not have a transceiver yet
						videoTransceiver = config.pc.addTransceiver("video", { direction: "recvonly" });
						Janus.log("Adding recvonly video transceiver:", videoTransceiver);
					}
				}
			}
		} else {
			mediaConstraints["offerToReceiveAudio"] = isAudioRecvEnabled(media);
			mediaConstraints["offerToReceiveVideo"] = isVideoRecvEnabled(media);
			mediaConstraints["voiceActivityDetection"] = false;
		}
		var iceRestart = (callbacks.iceRestart === true);
		if(iceRestart) {
			mediaConstraints["iceRestart"] = true;
		}
		Janus.debug(mediaConstraints);
		// Check if this is Firefox and we've been asked to do simulcasting
		var sendVideo = isVideoSendEnabled(media);
		if(sendVideo && simulcast && Janus.webRTCAdapter.browserDetails.browser === "firefox") {
			// FIXME Based on https://gist.github.com/voluntas/088bc3cc62094730647b
			Janus.log("Enabling Simulcasting for Firefox (RID)");
			var sender = config.pc.getSenders().find(function(s) {return s.track.kind == "video"});
			if(sender) {
				var parameters = sender.getParameters();
				if(!parameters)
					parameters = {};


				const maxBitrates = getMaxBitrates(callbacks.simulcastMaxBitrates);
				parameters.encodings = [
					{ rid: "h", active: true, maxBitrate: maxBitrates.high },
					{ rid: "m", active: true, maxBitrate: maxBitrates.medium, scaleResolutionDownBy: 2 },
					{ rid: "l", active: true, maxBitrate: maxBitrates.low }
				];
				sender.setParameters(parameters);
			}
		}
		config.pc.createOffer(mediaConstraints)
			.then(function(offer) {
				Janus.debug(offer);
				// JSON.stringify doesn't work on some WebRTC objects anymore
				// See https://code.google.com/p/chromium/issues/detail?id=467366
				var jsep = {
					"type": offer.type,
					"sdp": offer.sdp
				};
				callbacks.customizeSdp(jsep);
				offer.sdp = jsep.sdp;
				Janus.log("Setting local description");
				if(sendVideo && simulcast) {
					// This SDP munging only works with Chrome (Safari STP may support it too)
					if(Janus.webRTCAdapter.browserDetails.browser === "chrome" ||
							Janus.webRTCAdapter.browserDetails.browser === "safari") {
						Janus.log("Enabling Simulcasting for Chrome (SDP munging)");
						offer.sdp = mungeSdpForSimulcasting(offer.sdp);
					} else if(Janus.webRTCAdapter.browserDetails.browser !== "firefox") {
						Janus.warn("simulcast=true, but this is not Chrome nor Firefox, ignoring");
					}
				}
				if (sendVideo) {
                    //offer.sdp = setMediaBitrate(offer.sdp, 'audio', 128);
                    offer.sdp = addStereo(offer.sdp);
                }

				config.mySdp = offer.sdp;
				config.pc.setLocalDescription(offer)
					.catch(callbacks.error);
				config.mediaConstraints = mediaConstraints;
				if(!config.iceDone && !config.trickle) {
					// Don't do anything until we have all candidates
					Janus.log("Waiting for all candidates...");
					return;
				}
				Janus.log("Offer ready");
				Janus.debug(callbacks);
				callbacks.success(offer);
			}, callbacks.error);
	}

	function createAnswer(handleId, media, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
		callbacks.customizeSdp = (typeof callbacks.customizeSdp == "function") ? callbacks.customizeSdp : Janus.noop;
		var pluginHandle = pluginHandles[handleId];
		if(!pluginHandle || !pluginHandle.webrtcStuff) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		var simulcast = (callbacks.simulcast === true);
		if(!simulcast) {
			Janus.log("Creating answer (iceDone=" + config.iceDone + ")");
		} else {
			Janus.log("Creating answer (iceDone=" + config.iceDone + ", simulcast=" + simulcast + ")");
		}
		var mediaConstraints = null;
		if(Janus.unifiedPlan) {
			// We can use Transceivers
			mediaConstraints = {voiceActivityDetection:false};
			var audioTransceiver = null, videoTransceiver = null;
			var transceivers = config.pc.getTransceivers();
			if(transceivers && transceivers.length > 0) {
				for(var t of transceivers) {
					if((t.sender && t.sender.track && t.sender.track.kind === "audio") ||
							(t.receiver && t.receiver.track && t.receiver.track.kind === "audio")) {
						if(!audioTransceiver)
							audioTransceiver = t;
						continue;
					}
					if((t.sender && t.sender.track && t.sender.track.kind === "video") ||
							(t.receiver && t.receiver.track && t.receiver.track.kind === "video")) {
						if(!videoTransceiver)
							videoTransceiver = t;
						continue;
					}
				}
			}
			// Handle audio (and related changes, if any)
			var audioSend = isAudioSendEnabled(media);
			var audioRecv = isAudioRecvEnabled(media);
			if(!audioSend && !audioRecv) {
				// Audio disabled: have we removed it?
				if(media.removeAudio && audioTransceiver) {
					try {
						if (audioTransceiver.setDirection) {
							audioTransceiver.setDirection("inactive");
						} else {
							audioTransceiver.direction = "inactive";
						}
						Janus.log("Setting audio transceiver to inactive:", audioTransceiver);
					} catch(e) {
						Janus.error(e);
					}
				}
			} else {
				// Take care of audio m-line
				if(audioSend && audioRecv) {
					if(audioTransceiver) {
						try {
							if (audioTransceiver.setDirection) {
								audioTransceiver.setDirection("sendrecv");
							} else {
								audioTransceiver.direction = "sendrecv";
							}
							Janus.log("Setting audio transceiver to sendrecv:", audioTransceiver);
						} catch(e) {
							Janus.error(e);
						}
					}
				} else if(audioSend && !audioRecv) {
					try {
						if(audioTransceiver) {
							if (audioTransceiver.setDirection) {
								audioTransceiver.setDirection("sendonly");
							} else {
								audioTransceiver.direction = "sendonly";
							}
							Janus.log("Setting audio transceiver to sendonly:", audioTransceiver);
						}
					} catch(e) {
						Janus.error(e);
					}
				} else if(!audioSend && audioRecv) {
					if(audioTransceiver) {
						try {
							if (audioTransceiver.setDirection) {
								audioTransceiver.setDirection("recvonly");
							} else {
								audioTransceiver.direction = "recvonly";
							}
							Janus.log("Setting audio transceiver to recvonly:", audioTransceiver);
						} catch(e) {
							Janus.error(e);
						}
					} else {
						// In theory, this is the only case where we might not have a transceiver yet
						audioTransceiver = config.pc.addTransceiver("audio", { direction: "recvonly" });
						Janus.log("Adding recvonly audio transceiver:", audioTransceiver);
					}
				}
			}
			// Handle video (and related changes, if any)
			var videoSend = isVideoSendEnabled(media);
			var videoRecv = isVideoRecvEnabled(media);
			if(!videoSend && !videoRecv) {
				// Video disabled: have we removed it?
				if(media.removeVideo && videoTransceiver) {
					try {
						if (videoTransceiver.setDirection) {
							videoTransceiver.setDirection("inactive");
						} else {
							videoTransceiver.direction = "inactive";
						}
						Janus.log("Setting video transceiver to inactive:", videoTransceiver);
					} catch(e) {
						Janus.error(e);
					}
				}
			} else {
				// Take care of video m-line
				if(videoSend && videoRecv) {
					if(videoTransceiver) {
						try {
							if (videoTransceiver.setDirection) {
								videoTransceiver.setDirection("sendrecv");
							} else {
								videoTransceiver.direction = "sendrecv";
							}
							Janus.log("Setting video transceiver to sendrecv:", videoTransceiver);
						} catch(e) {
							Janus.error(e);
						}
					}
				} else if(videoSend && !videoRecv) {
					if(videoTransceiver) {
						try {
							if (videoTransceiver.setDirection) {
								videoTransceiver.setDirection("sendonly");
							} else {
								videoTransceiver.direction = "sendonly";
							}
							Janus.log("Setting video transceiver to sendonly:", videoTransceiver);
						} catch(e) {
							Janus.error(e);
						}
					}
				} else if(!videoSend && videoRecv) {
					if(videoTransceiver) {
						try {
							if (videoTransceiver.setDirection) {
								videoTransceiver.setDirection("recvonly");
							} else {
								videoTransceiver.direction = "recvonly";
							}
							Janus.log("Setting video transceiver to recvonly:", videoTransceiver);
						} catch(e) {
							Janus.error(e);
						}
					} else {
						// In theory, this is the only case where we might not have a transceiver yet
						videoTransceiver = config.pc.addTransceiver("video", { direction: "recvonly" });
						Janus.log("Adding recvonly video transceiver:", videoTransceiver);
					}
				}
			}
		} else {
			if(Janus.webRTCAdapter.browserDetails.browser === "firefox" || Janus.webRTCAdapter.browserDetails.browser === "edge") {
				mediaConstraints = {
					offerToReceiveAudio: isAudioRecvEnabled(media),
					offerToReceiveVideo: isVideoRecvEnabled(media)
				};
			} else {
				mediaConstraints = {
					mandatory: {
						OfferToReceiveAudio: isAudioRecvEnabled(media),
						OfferToReceiveVideo: isVideoRecvEnabled(media)
					}
				};
			}
		}
		Janus.debug(mediaConstraints);
		// Check if this is Firefox and we've been asked to do simulcasting
		var sendVideo = isVideoSendEnabled(media);
		if(sendVideo && simulcast && Janus.webRTCAdapter.browserDetails.browser === "firefox") {
			// FIXME Based on https://gist.github.com/voluntas/088bc3cc62094730647b
			Janus.log("Enabling Simulcasting for Firefox (RID)");
			var sender = config.pc.getSenders()[1];
			Janus.log(sender);
			var parameters = sender.getParameters();
			Janus.log(parameters);

			const maxBitrates = getMaxBitrates(callbacks.simulcastMaxBitrates);
			sender.setParameters({encodings: [
				{ rid: "high", active: true, priority: "high", maxBitrate: maxBitrates.high },
				{ rid: "medium", active: true, priority: "medium", maxBitrate: maxBitrates.medium },
				{ rid: "low", active: true, priority: "low", maxBitrate: maxBitrates.low }
			]});
		}
		config.pc.createAnswer(mediaConstraints)
			.then(function(answer) {
				Janus.debug(answer);
				// JSON.stringify doesn't work on some WebRTC objects anymore
				// See https://code.google.com/p/chromium/issues/detail?id=467366
				var jsep = {
					"type": answer.type,
					"sdp": answer.sdp
				};
				callbacks.customizeSdp(jsep);
				answer.sdp = jsep.sdp;
				Janus.log("Setting local description");
				if(sendVideo && simulcast) {
					// This SDP munging only works with Chrome
					if(Janus.webRTCAdapter.browserDetails.browser === "chrome") {
						// FIXME Apparently trying to simulcast when answering breaks video in Chrome...
						//~ Janus.log("Enabling Simulcasting for Chrome (SDP munging)");
						//~ answer.sdp = mungeSdpForSimulcasting(answer.sdp);
						Janus.warn("simulcast=true, but this is an answer, and video breaks in Chrome if we enable it");
					} else if(Janus.webRTCAdapter.browserDetails.browser !== "firefox") {
						Janus.warn("simulcast=true, but this is not Chrome nor Firefox, ignoring");
					}
				}
				if(sendVideo) {
                    //answer.sdp = setMediaBitrate(answer.sdp, 'audio', 128);
                    answer.sdp = addStereo(answer.sdp);
                }

				config.mySdp = answer.sdp;
				config.pc.setLocalDescription(answer)
					.catch(callbacks.error);
				config.mediaConstraints = mediaConstraints;
				if(!config.iceDone && !config.trickle) {
					// Don't do anything until we have all candidates
					Janus.log("Waiting for all candidates...");
					return;
				}
				callbacks.success(answer);
			}, callbacks.error);
	}

	function sendSDP(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
		callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
		var pluginHandle = pluginHandles[handleId];
		if(!pluginHandle || !pluginHandle.webrtcStuff) {
			Janus.warn("Invalid handle, not sending anything");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		Janus.log("Sending offer/answer SDP...");
		if(!config.mySdp) {
			Janus.warn("Local SDP instance is invalid, not sending anything...");
			return;
		}
		config.mySdp = {
			"type": config.pc.localDescription.type,
			"sdp": config.pc.localDescription.sdp
		};
		if(config.trickle === false)
			config.mySdp["trickle"] = false;
		Janus.debug(callbacks);
		config.sdpSent = true;
		callbacks.success(config.mySdp);
	}

	function getVolume(handleId, remote) {
		var pluginHandle = pluginHandles[handleId];
		if(!pluginHandle || !pluginHandle.webrtcStuff) {
			Janus.warn("Invalid handle");
			return 0;
		}
		var stream = remote ? "remote" : "local";
		var config = pluginHandle.webrtcStuff;
		if(!config.volume[stream])
			config.volume[stream] = { value: 0 };
		// Start getting the volume, if getStats is supported
		if(config.pc.getStats && Janus.webRTCAdapter.browserDetails.browser === "chrome") {
			if(remote && !config.remoteStream) {
				Janus.warn("Remote stream unavailable");
				return 0;
			} else if(!remote && !config.myStream) {
				Janus.warn("Local stream unavailable");
				return 0;
			}
			if(!config.volume[stream].timer) {
				Janus.log("Starting " + stream + " volume monitor");
				config.volume[stream].timer = setInterval(function() {
					config.pc.getStats()
						.then(function(stats) {
							var results = stats.result();
							for(var i=0; i<results.length; i++) {
								var res = results[i];
								if(res.type == 'ssrc') {
									if(remote && res.stat('audioOutputLevel'))
										config.volume[stream].value = parseInt(res.stat('audioOutputLevel'));
									else if(!remote && res.stat('audioInputLevel'))
										config.volume[stream].value = parseInt(res.stat('audioInputLevel'));
								}
							}
						});
				}, 200);
				return 0;	// We don't have a volume to return yet
			}
			return config.volume[stream].value;
		} else {
			// audioInputLevel and audioOutputLevel seem only available in Chrome? audioLevel
			// seems to be available on Chrome and Firefox, but they don't seem to work
			Janus.warn("Getting the " + stream + " volume unsupported by browser");
			return 0;
		}
	}

	function isMuted(handleId, video) {
		var pluginHandle = pluginHandles[handleId];
		if(!pluginHandle || !pluginHandle.webrtcStuff) {
			Janus.warn("Invalid handle");
			return true;
		}
		var config = pluginHandle.webrtcStuff;
		if(!config.pc) {
			Janus.warn("Invalid PeerConnection");
			return true;
		}
		if(!config.myStream) {
			Janus.warn("Invalid local MediaStream");
			return true;
		}
		if(video) {
			// Check video track
			if(!config.myStream.getVideoTracks() || config.myStream.getVideoTracks().length === 0) {
				Janus.warn("No video track");
				return true;
			}
			return !config.myStream.getVideoTracks()[0].enabled;
		} else {
			// Check audio track
			if(!config.myStream.getAudioTracks() || config.myStream.getAudioTracks().length === 0) {
				Janus.warn("No audio track");
				return true;
			}
			return !config.myStream.getAudioTracks()[0].enabled;
		}
	}

	function mute(handleId, video, mute) {
		var pluginHandle = pluginHandles[handleId];
		if(!pluginHandle || !pluginHandle.webrtcStuff) {
			Janus.warn("Invalid handle");
			return false;
		}
		var config = pluginHandle.webrtcStuff;
		if(!config.pc) {
			Janus.warn("Invalid PeerConnection");
			return false;
		}
		if(!config.myStream) {
			Janus.warn("Invalid local MediaStream");
			return false;
		}
		if(video) {
			// Mute/unmute video track
			if(!config.myStream.getVideoTracks() || config.myStream.getVideoTracks().length === 0) {
				Janus.warn("No video track");
				return false;
			}
			config.myStream.getVideoTracks()[0].enabled = mute ? false : true;
			return true;
		} else {
			// Mute/unmute audio track
			if(!config.myStream.getAudioTracks() || config.myStream.getAudioTracks().length === 0) {
				Janus.warn("No audio track");
				return false;
			}
			config.myStream.getAudioTracks()[0].enabled = mute ? false : true;
			return true;
		}
	}

	function getBitrate(handleId) {
		var pluginHandle = pluginHandles[handleId];
		if(!pluginHandle || !pluginHandle.webrtcStuff) {
			Janus.warn("Invalid handle");
			return "Invalid handle";
		}
		var config = pluginHandle.webrtcStuff;
		if(!config.pc)
			return "Invalid PeerConnection";
		// Start getting the bitrate, if getStats is supported
		if(config.pc.getStats) {
			if(!config.bitrate.timer) {
				Janus.log("Starting bitrate timer (via getStats)");
				config.bitrate.timer = setInterval(function() {
					config.pc.getStats()
						.then(function(stats) {
							stats.forEach(function (res) {
								if(!res)
									return;
								var inStats = false;
								// Check if these are statistics on incoming media
								if((res.mediaType === "video" || res.id.toLowerCase().indexOf("video") > -1) &&
										res.type === "inbound-rtp" && res.id.indexOf("rtcp") < 0) {
									// New stats
									inStats = true;
								} else if(res.type == 'ssrc' && res.bytesReceived &&
										(res.googCodecName === "VP8" || res.googCodecName === "")) {
									// Older Chromer versions
									inStats = true;
								}
								// Parse stats now
								if(inStats) {
									config.bitrate.bsnow = res.bytesReceived;
									config.bitrate.tsnow = res.timestamp;
									if(config.bitrate.bsbefore === null || config.bitrate.tsbefore === null) {
										// Skip this round
										config.bitrate.bsbefore = config.bitrate.bsnow;
										config.bitrate.tsbefore = config.bitrate.tsnow;
									} else {
										// Calculate bitrate
										var timePassed = config.bitrate.tsnow - config.bitrate.tsbefore;
										if(Janus.webRTCAdapter.browserDetails.browser === "safari")
											timePassed = timePassed/1000;	// Apparently the timestamp is in microseconds, in Safari
										var bitRate = Math.round((config.bitrate.bsnow - config.bitrate.bsbefore) * 8 / timePassed);
										if(Janus.webRTCAdapter.browserDetails.browser === "safari")
											bitRate = parseInt(bitRate/1000);
										config.bitrate.value = bitRate + ' kbits/sec';
										//~ Janus.log("Estimated bitrate is " + config.bitrate.value);
										config.bitrate.bsbefore = config.bitrate.bsnow;
										config.bitrate.tsbefore = config.bitrate.tsnow;
									}
								}
							});
						});
				}, 1000);
				return "0 kbits/sec";	// We don't have a bitrate value yet
			}
			return config.bitrate.value;
		} else {
			Janus.warn("Getting the video bitrate unsupported by browser");
			return "Feature unsupported by browser";
		}
	}

	function webrtcError(error) {
		Janus.error("WebRTC error:", error);
	}

	function cleanupWebrtc(handleId, hangupRequest) {
		Janus.log("Cleaning WebRTC stuff");
		var pluginHandle = pluginHandles[handleId];
		if(!pluginHandle) {
			// Nothing to clean
			return;
		}
		var config = pluginHandle.webrtcStuff;
		if(config) {
			if(hangupRequest === true) {
				// Send a hangup request (we don't really care about the response)
				var request = { "janus": "hangup", "transaction": Janus.randomString(12) };
				if(pluginHandle.token)
					request["token"] = pluginHandle.token;
				if(apisecret)
					request["apisecret"] = apisecret;
				Janus.debug("Sending hangup request (handle=" + handleId + "):");
				Janus.debug(request);
				if(websockets) {
					request["session_id"] = sessionId;
					request["handle_id"] = handleId;
					ws.send(JSON.stringify(request));
				} else {
					Janus.httpAPICall(server + "/" + sessionId + "/" + handleId, {
						verb: 'POST',
						withCredentials: withCredentials,
						body: request
					});
				}
			}
			// Cleanup stack
			config.remoteStream = null;
			if(config.volume) {
				if(config.volume["local"] && config.volume["local"].timer)
					clearInterval(config.volume["local"].timer);
				if(config.volume["remote"] && config.volume["remote"].timer)
					clearInterval(config.volume["remote"].timer);
			}
			config.volume = {};
			if(config.bitrate.timer)
				clearInterval(config.bitrate.timer);
			config.bitrate.timer = null;
			config.bitrate.bsnow = null;
			config.bitrate.bsbefore = null;
			config.bitrate.tsnow = null;
			config.bitrate.tsbefore = null;
			config.bitrate.value = null;
			try {
				// Try a MediaStreamTrack.stop() for each track
				if(!config.streamExternal && config.myStream) {
					Janus.log("Stopping local stream tracks");
					var tracks = config.myStream.getTracks();
					for(var mst of tracks) {
						Janus.log(mst);
						if(mst)
							mst.stop();
					}
				}
			} catch(e) {
				// Do nothing if this fails
			}
			config.streamExternal = false;
			config.myStream = null;
			// Close PeerConnection
			try {
				config.pc.close();
			} catch(e) {
				// Do nothing
			}
			config.pc = null;
			config.candidates = null;
			config.mySdp = null;
			config.remoteSdp = null;
			config.iceDone = false;
			config.dataChannel = {};
			config.dtmfSender = null;
		}
		pluginHandle.oncleanup();
	}

	// Helper method to munge an SDP to enable simulcasting (Chrome only)
	function mungeSdpForSimulcasting(sdp) {
		// Let's munge the SDP to add the attributes for enabling simulcasting
		// (based on https://gist.github.com/ggarber/a19b4c33510028b9c657)
		var lines = sdp.split("\r\n");
		var video = false;
		var ssrc = [ -1 ], ssrc_fid = [ -1 ];
		var cname = null, msid = null, mslabel = null, label = null;
		var insertAt = -1;
		for(var i=0; i<lines.length; i++) {
			var mline = lines[i].match(/m=(\w+) */);
			if(mline) {
				var medium = mline[1];
				if(medium === "video") {
					// New video m-line: make sure it's the first one
					if(ssrc[0] < 0) {
						video = true;
					} else {
						// We're done, let's add the new attributes here
						insertAt = i;
						break;
					}
				} else {
					// New non-video m-line: do we have what we were looking for?
					if(ssrc[0] > -1) {
						// We're done, let's add the new attributes here
						insertAt = i;
						break;
					}
				}
				continue;
			}
			if(!video)
				continue;
			var fid = lines[i].match(/a=ssrc-group:FID (\d+) (\d+)/);
			if(fid) {
				ssrc[0] = fid[1];
				ssrc_fid[0] = fid[2];
				lines.splice(i, 1); i--;
				continue;
			}
			if(ssrc[0]) {
				var match = lines[i].match('a=ssrc:' + ssrc[0] + ' cname:(.+)');
				if(match) {
					cname = match[1];
				}
				match = lines[i].match('a=ssrc:' + ssrc[0] + ' msid:(.+)');
				if(match) {
					msid = match[1];
				}
				match = lines[i].match('a=ssrc:' + ssrc[0] + ' mslabel:(.+)');
				if(match) {
					mslabel = match[1];
				}
				match = lines[i].match('a=ssrc:' + ssrc[0] + ' label:(.+)');
				if(match) {
					label = match[1];
				}
				if(lines[i].indexOf('a=ssrc:' + ssrc_fid[0]) === 0) {
					lines.splice(i, 1); i--;
					continue;
				}
				if(lines[i].indexOf('a=ssrc:' + ssrc[0]) === 0) {
					lines.splice(i, 1); i--;
					continue;
				}
			}
			if(lines[i].length == 0) {
				lines.splice(i, 1); i--;
				continue;
			}
		}
		if(ssrc[0] < 0) {
			// Couldn't find a FID attribute, let's just take the first video SSRC we find
			insertAt = -1;
			video = false;
			for(var i=0; i<lines.length; i++) {
				var mline = lines[i].match(/m=(\w+) */);
				if(mline) {
					var medium = mline[1];
					if(medium === "video") {
						// New video m-line: make sure it's the first one
						if(ssrc[0] < 0) {
							video = true;
						} else {
							// We're done, let's add the new attributes here
							insertAt = i;
							break;
						}
					} else {
						// New non-video m-line: do we have what we were looking for?
						if(ssrc[0] > -1) {
							// We're done, let's add the new attributes here
							insertAt = i;
							break;
						}
					}
					continue;
				}
				if(!video)
					continue;
				if(ssrc[0] < 0) {
					var value = lines[i].match(/a=ssrc:(\d+)/);
					if(value) {
						ssrc[0] = value[1];
						lines.splice(i, 1); i--;
						continue;
					}
				} else {
					var match = lines[i].match('a=ssrc:' + ssrc[0] + ' cname:(.+)');
					if(match) {
						cname = match[1];
					}
					match = lines[i].match('a=ssrc:' + ssrc[0] + ' msid:(.+)');
					if(match) {
						msid = match[1];
					}
					match = lines[i].match('a=ssrc:' + ssrc[0] + ' mslabel:(.+)');
					if(match) {
						mslabel = match[1];
					}
					match = lines[i].match('a=ssrc:' + ssrc[0] + ' label:(.+)');
					if(match) {
						label = match[1];
					}
					if(lines[i].indexOf('a=ssrc:' + ssrc_fid[0]) === 0) {
						lines.splice(i, 1); i--;
						continue;
					}
					if(lines[i].indexOf('a=ssrc:' + ssrc[0]) === 0) {
						lines.splice(i, 1); i--;
						continue;
					}
				}
				if(lines[i].length == 0) {
					lines.splice(i, 1); i--;
					continue;
				}
			}
		}
		if(ssrc[0] < 0) {
			// Still nothing, let's just return the SDP we were asked to munge
			Janus.warn("Couldn't find the video SSRC, simulcasting NOT enabled");
			return sdp;
		}
		if(insertAt < 0) {
			// Append at the end
			insertAt = lines.length;
		}
		// Generate a couple of SSRCs (for retransmissions too)
		// Note: should we check if there are conflicts, here?
		ssrc[1] = Math.floor(Math.random()*0xFFFFFFFF);
		ssrc[2] = Math.floor(Math.random()*0xFFFFFFFF);
		ssrc_fid[1] = Math.floor(Math.random()*0xFFFFFFFF);
		ssrc_fid[2] = Math.floor(Math.random()*0xFFFFFFFF);
		// Add attributes to the SDP
		for(var i=0; i<ssrc.length; i++) {
			if(cname) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' cname:' + cname);
				insertAt++;
			}
			if(msid) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' msid:' + msid);
				insertAt++;
			}
			if(mslabel) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' mslabel:' + mslabel);
				insertAt++;
			}
			if(label) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' label:' + label);
				insertAt++;
			}
			// Add the same info for the retransmission SSRC
			if(cname) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc_fid[i] + ' cname:' + cname);
				insertAt++;
			}
			if(msid) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc_fid[i] + ' msid:' + msid);
				insertAt++;
			}
			if(mslabel) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc_fid[i] + ' mslabel:' + mslabel);
				insertAt++;
			}
			if(label) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc_fid[i] + ' label:' + label);
				insertAt++;
			}
		}
		lines.splice(insertAt, 0, 'a=ssrc-group:FID ' + ssrc[2] + ' ' + ssrc_fid[2]);
		lines.splice(insertAt, 0, 'a=ssrc-group:FID ' + ssrc[1] + ' ' + ssrc_fid[1]);
		lines.splice(insertAt, 0, 'a=ssrc-group:FID ' + ssrc[0] + ' ' + ssrc_fid[0]);
		lines.splice(insertAt, 0, 'a=ssrc-group:SIM ' + ssrc[0] + ' ' + ssrc[1] + ' ' + ssrc[2]);
		sdp = lines.join("\r\n");
		if(!sdp.endsWith("\r\n"))
			sdp += "\r\n";
		return sdp;
	}

	// Helper methods to parse a media object
	function isAudioSendEnabled(media) {
		Janus.debug("isAudioSendEnabled:", media);
		if(!media)
			return true;	// Default
		if(media.audio === false)
			return false;	// Generic audio has precedence
		if(media.audioSend === undefined || media.audioSend === null)
			return true;	// Default
		return (media.audioSend === true);
	}

	function isAudioSendRequired(media) {
		Janus.debug("isAudioSendRequired:", media);
		if(!media)
			return false;	// Default
		if(media.audio === false || media.audioSend === false)
			return false;	// If we're not asking to capture audio, it's not required
		if(media.failIfNoAudio === undefined || media.failIfNoAudio === null)
			return false;	// Default
		return (media.failIfNoAudio === true);
	}

	function isAudioRecvEnabled(media) {
		Janus.debug("isAudioRecvEnabled:", media);
		if(!media)
			return true;	// Default
		if(media.audio === false)
			return false;	// Generic audio has precedence
		if(media.audioRecv === undefined || media.audioRecv === null)
			return true;	// Default
		return (media.audioRecv === true);
	}

	function isVideoSendEnabled(media) {
		Janus.debug("isVideoSendEnabled:", media);
		if(!media)
			return true;	// Default
		if(media.video === false)
			return false;	// Generic video has precedence
		if(media.videoSend === undefined || media.videoSend === null)
			return true;	// Default
		return (media.videoSend === true);
	}

	function isVideoSendRequired(media) {
		Janus.debug("isVideoSendRequired:", media);
		if(!media)
			return false;	// Default
		if(media.video === false || media.videoSend === false)
			return false;	// If we're not asking to capture video, it's not required
		if(media.failIfNoVideo === undefined || media.failIfNoVideo === null)
			return false;	// Default
		return (media.failIfNoVideo === true);
	}

	function isVideoRecvEnabled(media) {
		Janus.debug("isVideoRecvEnabled:", media);
		if(!media)
			return true;	// Default
		if(media.video === false)
			return false;	// Generic video has precedence
		if(media.videoRecv === undefined || media.videoRecv === null)
			return true;	// Default
		return (media.videoRecv === true);
	}

	function isScreenSendEnabled(media) {
		Janus.debug("isScreenSendEnabled:", media);
		if (!media)
			return false;
		if (typeof media.video !== 'object' || typeof media.video.mandatory !== 'object')
			return false;
		var constraints = media.video.mandatory;
		if (constraints.chromeMediaSource)
			return constraints.chromeMediaSource === 'desktop' || constraints.chromeMediaSource === 'screen';
		else if (constraints.mozMediaSource)
			return constraints.mozMediaSource === 'window' || constraints.mozMediaSource === 'screen';
		else if (constraints.mediaSource)
			return constraints.mediaSource === 'window' || constraints.mediaSource === 'screen';
		return false;
	}

	function isDataEnabled(media) {
		Janus.debug("isDataEnabled:", media);
		if(Janus.webRTCAdapter.browserDetails.browser === "edge") {
			Janus.warn("Edge doesn't support data channels yet");
			return false;
		}
		if(media === undefined || media === null)
			return false;	// Default
		return (media.data === true);
	}

	function isTrickleEnabled(trickle) {
		Janus.debug("isTrickleEnabled:", trickle);
		return (trickle === false) ? false : true;
	}
}

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */

var JanusClient = function (dom, janusServer, room, buffer) {
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
	var myid = null;
	var mystream = null;
	// We use this other ID just to map our subscriptions to us
	var mypvtid = null;
	var _buffer = buffer;
	var feeds = [];
	var bitrateTimer = [];
	var nopublisher = false;
	(getQueryStringValue("simulcast") === "yes" || getQueryStringValue("simulcast") === "true");
	(getQueryStringValue("simulcast2") === "yes" || getQueryStringValue("simulcast2") === "true");
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
														document.dispatchEvent(newStream);
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
															list[f].id;
															let elem = FlexJanus.feeds.find((x)=>{ if (x.display == list[f].display) return true});
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
														document.dispatchEvent(newStream);
														msg["publishers"];
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

													FlexJanus.feeds = FlexJanus.feeds.filter((el) => { return el.id !== unpublished });

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
				setTimeout(() => { if (nopublisher === false) registerUsername(); }, 4000);

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
		let inter = setInterval(() => {
			if (sfutest) {
				sfutest.send({ "message": register });
				clearInterval(inter);
			}
		}, 1500);
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
					},2000);
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
								video = video.toUpperCase();
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
								});
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
									document.dispatchEvent(event);
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
							} else ;
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
						attachingIDs = attachingIDs.replace(id,"");
						if (!remoteFeed) return;

						Janus.debug("Remote feed #" + remoteFeed.rfindex);
						FlexJanus.feeds = FlexJanus.feeds.filter((x) => { return x != null });
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
						let found = FlexJanus.feeds.find((f)=> {if (f.id ==remoteFeed.id) return true;});
						if (!found) FlexJanus.feeds.push(remoteFeed);
						res(remoteFeed);
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
};

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */

const template$3 = document.createElement('template');
template$3.innerHTML = `
<style>
:host {
  display: inline-block;
  position: relative;
}
.title {
  position: absolute;
  background-color: rgb(63 63 63);
  color: rgb(205 202 202);
  letter-spacing: 0.05rem;
  left: 0;
  padding: 0.3rem 1.2rem;
  font-size: 65%;
}
#video {
  background-color: rgb(0, 0, 0);
}
@media (max-width: 750px){
  .title {
    padding: 0.2rem 0.8rem;
    font-size: 55%;
  }
}
</style>`;
const optionsDashProfileDefault = { // https://github.com/Dash-Industry-Forum/dash.js/blob/27f4eb3df338d1d54935af1375f5276c179e0334/src/core/Settings.js
  debug: {
    logLevel: 0,
    dispatchEvent: false
  },
  streaming: {
    stableBufferTime: 12,
    bufferTimeAtTopQuality: 20,  // seconds of buffer at top quality
    scheduleWhilePaused: false, // do not buffer before playing
    fastSwitchEnabled: true, // this changes qualities as soon as possible when going to a higher bitrate
    abr: {
      limitBitrateByPortal: true, // don't download more pixels than what you need to show
      initialBitrate: { video: 1500 },
      maxBitrate: { audio: -1, video: 5000 },
      minBitrate: { audio: -1, video: 900 }
    }
  }
};
class XMedia extends HTMLElement {

  static get observedAttributes() {
    return ['input', 'type', "style", "config","nosignalimg", 'title'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'type') {
        this.type = newValue;
      } else {
        this[name] = newValue;
        if (name=="nosignalimg"){
           this.render();
        }
      }
      const mediatype = this.identifiyMedia();
      if (mediatype === "webrtc" && name === "style" && this.profile !== "low") {
        const videoElement = this.shadowRoot.querySelector('video');
        if (videoElement && videoElement.clientWidth > 300) {
          this.changeSubStream(this.input,2);
        }
        else  {
          this.changeSubStream(this.input,2);
        }
      }
      if (mediatype === "webrtc" && name === "input") {
        document.addEventListener('substreamConfigured', this.onSubstreamConfigured.bind(this));
      }
    }
  }

  get config() { return this.getAttribute('config'); }
  set config(value) {
    let old = this.getAttribute('config');
    if (old != value) {
      this.setAttribute('config', value);

    }
    let obj = JSON.parse(value);
    
    if (!window.FlexJanus && obj.janusServer ) {
      if (!window.parent.FlexJanus){
        if (obj.iframe===true){
          window.parent.FlexJanus = JanusClient(this, obj.janusServer,obj.room,obj.buffer);
          window.parent.FlexJanus.init(this);
        }
        else {
          window.FlexJanus = JanusClient(this, obj.janusServer,obj.room,obj.buffer);
          (window.FlexJanus || window.parent.FlexJanus).init(this);
        }        
      }
    
      if (obj.publisherFeed && obj.publisherFeed!="") {
        (window.FlexJanus || window.parent.FlexJanus).registerUsernameAsSubscriber(obj.publisherFeed);
      }

    }
    if (obj.showAudioInput === "true" || obj.showAudioInput === true){
       this.enableVolumeMeter();
    }
    if(obj.showBitrate=== "true"){
       setTimeout(()=>{this.querySelector('#bitrate').style.display="block";},5000);
    }
    if (typeof obj.profile!="undefined") {
      this.profile = obj.profile;
    }
    if (obj.autoplay === "false") {
      this.autoPlay(false);
    }
    if (obj.muted === "true") {
      this.muted = true;
      this.mute();
      this.render();

    }
    else if (obj.muted === "false") {
      this.muted = false;
      this.mute();
      this.render();

    }
    if (obj.me) {
      if (this.input === obj.me) {
        if (this.shadowRoot.querySelector('video')) {
          this.muted = true;
          this.mute();
          this.render();
        }
      }
    }
  }
  get input() { return this.getAttribute('input'); }
  set input(value) {

    if (this.oldInput != value) {
      this.oldInput = value;
      this.setAttribute('input', value);
      if (!value) {
        this.cleanInput();
        return;
      }
      let mediaType = this.identifiyMedia();
      if (mediaType === 'webrtc') {
        const videoElement = this.shadowRoot.querySelector('video');
        if (videoElement) {
          videoElement.srcObject = null;
        }
      }
      this.render();
      if (mediaType == "webrtc" && this.janusReady) (window.FlexJanus || window.parent.FlexJanus).start(this.input, this);
      else if (mediaType == "webrtc" && this.janusReady == undefined) {
        setTimeout(() => { (window.FlexJanus || window.parent.FlexJanus).start(this.input, this); }, 5000);
      }

    }
    else if (this.shadowRoot.querySelector('video') && this.shadowRoot.querySelector('video').paused) {
      let mediaType = this.identifiyMedia();
      if (mediaType == "webrtc" && this.janusReady) (window.FlexJanus || window.parent.FlexJanus).start(this.input, this);
    }
    let obj = JSON.parse(this.getAttribute('config'));
    if (obj && obj.me) {
      if (this.input === obj.me) {
        if (this.shadowRoot.querySelector('video')) {
          this.shadowRoot.querySelector('video').muted = true;
        }
      }
    }

  }

  get type() { return this.getAttribute('type'); }
  set type(value) {
    let old = this.getAttribute('type');
    if (old != value) {
      this.setAttribute('type', value);
      this.render();
    }
  }

  get title() {
    return this.getAttribute('title')
  }
  set title(value) {
    this.setAttribute('title', value);
    this.createTitleElement(value);
  } 

  constructor() {
    super();
    this.substream = -1;
    this.oldInput = "";
    this.autoplay = true;
    this.loaded = false;
    this.log =  Logger.getLogger('X-media');

    this.attachShadow({mode: 'open'});
    document.addEventListener('JanusReady', this.janusReadyListener.bind(this));
    document.addEventListener('newStream', this.newStreamListener.bind(this));
    document.addEventListener('deletedStream', this.deletedStreamListener.bind(this));
    if (window.parent){
      window.parent.document.addEventListener('JanusReady', this.janusReadyListener.bind(this));
      window.parent.document.addEventListener('newStream', this.newStreamListener.bind(this));
      window.parent.document.addEventListener('deletedStream', this.deletedStreamListener.bind(this));
    }
    this.log.warn(this.input, "could not connect");
    this.shadowRoot.appendChild(template$3.content.cloneNode(true));
  }
  janusReadyListener(e) {
    this.janusReady = true;
  }
  deletedStreamListener(e){
  	if (this.input === e.detail.id) {
		  if (this.shadowRoot.querySelector('video')) this.shadowRoot.querySelector('video').srcObject = null;
	  }
  }
  setOnlyAudioPoster(){
    if (this.shadowRoot.querySelector('video').srcObject!=null){
      let videoNum = this.shadowRoot.querySelector('video').srcObject.getVideoTracks().length;
      if (videoNum===0){
        this.shadowRoot.querySelector('video').poster = "https://assets.boxcast.com/latest/static/audio-only.png";
      }
    }
  }
  newStreamListener (e) {
    if (this.input === e.detail.id) {
      (window.FlexJanus || window.parent.FlexJanus).start(this.input, this);
      document.addEventListener('substreamConfigured', this.onSubstreamConfigured.bind(this));
      this.setOnlyAudioPoster();
    }
  }

  // Callback that is called when the input is simulcast and a substream is configured
  onSubstreamConfigured ({ detail }) {
    const { substream, input } = detail;
    if (this.input === input) {
      if (this.profile ==="low") {
        // If profile is low, only change substream if the substream received is not 0
        if (substream !== 0) {
          this.changeSubStream(this.input,0);
        }
      }
      else {
        // If profile is not low, only change substream if it is not the same
        this.shadowRoot.querySelector('video').clientWidth;
        //const substreamToChange = width > 300 ? 2 : 1;
        const substreamToChange = 2;
        if (substream !== substreamToChange) {
          this.changeSubStream(this.input, substreamToChange);
        }
      }
      document.removeEventListener('substreamConfigured', this.onSubstreamConfigured.bind(this));
    }
  }
  disconnectedCallback() {
    document.removeEventListener('JanusReady', this.janusReadyListener.bind(this));
    document.removeEventListener('newStream', this.newStreamListener.bind(this));
    document.removeEventListener('deletedStream', this.deletedStreamListener.bind(this));
    this.log.info('disconnected from the DOM');
  }
  async connectedCallback() {
    if (this.hasAttribute('input')) {
      this.render();
    }
    if (this.hasAttribute('type')) {
      this.render();
    }
    if (!this.querySelector('#bitrate'))this.shadowRoot.innerHTML+="<div id='bitrate' style='position:absolute;display:none;color:yellow;'></div>";
  }
  userCmdEvents(evt){
    this.log.info("XMEDIA CMD",evt);
    if (evt.cmd =="stream"){
      (window.FlexJanus || window.parent.FlexJanus).stop(this.input);
       this.input = evt.value;
       (window.FlexJanus || window.parent.FlexJanus).start(evt.value, this);
    }
  }
  identifiyMedia() {
    if (this.input && this.input !== "undefined") {
      let isURI = this.input.indexOf('/') != -1;
      if (!isURI) {
        return "webrtc";
      }
      else {

        let fileName = this.input.substring(this.input.lastIndexOf('/') + 1, this.input.length);
        let ext = fileName.substring(fileName.lastIndexOf('.'), this.input.length);
        if (ext === "") this.log.warn("Not extension found could not know media type");
        switch (ext.toLowerCase()) {
          case '.png': return "image";
          case '.jpg': return "image";
          case '.jpeg': return "image";
          case '.gif': return "image";
          case '.webp': return "image";
          case '.svg': return "image";
          case '.mp4': return "video";
          case '.ogv': return "video";
          case '.vp9': return "video";
          case '.vp8': return "video";
          case '.mpeg': return "video";
          case '.mpg': return "video";
          case '.mpd': return "dash";
          default: return "unknown";
        }
      }
    }
    else return undefined;
  }
  cleanInput() {
    let v = this.shadowRoot.querySelector('video');
    if (v) this.shadowRoot.removeChild(v);
    let img = this.shadowRoot.querySelector('img');
    if (img) this.shadowRoot.removeChild(img);
    let d = this.shadowRoot.querySelector('dash-video');
    if(d) this.shadowRoot.removeChild(d);
  }
  mute() {
    let v = this.shadowRoot.querySelector('video');
    if (this.shadowRoot.querySelector('dash-video')) v = this.shadowRoot.querySelector('dash-video').shadowRoot.querySelector('video');
    if (v) v.muted = this.muted;
  }
  muteVideo(){
    let v = this.shadowRoot.querySelector('video');
    if (this.shadowRoot.querySelector('dash-video')) v = this.shadowRoot.querySelector('dash-video').shadowRoot.querySelector('video');
    this.muted=true;
    if (v) v.muted = this.muted;
  }
  unmuteVideo(){
    let v = this.shadowRoot.querySelector('video');
    if (this.shadowRoot.querySelector('dash-video')) v = this.shadowRoot.querySelector('dash-video').shadowRoot.querySelector('video');
    this.muted=false;
    if (v) v.muted = this.muted;
  }
  changeLoop(val){
    let v = this.shadowRoot.querySelector('video');
    if (this.shadowRoot.querySelector('dash-video')) v = this.shadowRoot.querySelector('dash-video').shadowRoot.querySelector('video');
    v.loop = val;
  }
  autoPlay(flag) {
    this.autoplay = flag;
    let v = this.shadowRoot.querySelector('video');
    if (this.shadowRoot.querySelector('dash-video')) v = this.shadowRoot.querySelector('dash-video').shadowRoot.querySelector('video');
    if (v && flag === false) v.removeAttribute("autoplay");
  }
  load(resetVideo) {
    let mediaType = this.identifiyMedia();
    let v = this.shadowRoot.querySelector('video');
    if (this.shadowRoot.querySelector('dash-video')) v= this.shadowRoot.querySelector('dash-video').shadowRoot.querySelector('video');
    if (mediaType === "webrtc") {
      if (v) v.muted = this.muted;

    }
    else {
      if (v && (resetVideo==undefined || resetVideo)) {
        v.currentTime = 0;
        v.play();
      }
    }
    this.loaded = true;
  }
  unload(resetVideo) {
    let mediaType = this.identifiyMedia();
    let v = this.shadowRoot.querySelector('video');
    if (this.shadowRoot.querySelector('dash-video')) {
      v= this.shadowRoot.querySelector('dash-video').shadowRoot.querySelector('video');
    }
    if (mediaType === "webrtc") {
      if (v) {
        v.muted = true;
      }
    }
    else {
      if (v && (resetVideo==undefined || resetVideo)) {
        v.pause();
      }
    }
    this.loaded = false;

  }
  changeSubStream(stream,subid){
    if ((window.FlexJanus || window.parent.FlexJanus)) (window.FlexJanus || window.parent.FlexJanus).changeSubStream(stream,subid);
  }
  play(){
    let v = this.shadowRoot.querySelector('video');
    if (this.shadowRoot.querySelector('dash-video')) v= this.shadowRoot.querySelector('dash-video').shadowRoot.querySelector('video');
    if (v && this.loaded === true) v.play();
  }
  pause(){
    let v = this.shadowRoot.querySelector('video');
    if (this.shadowRoot.querySelector('dash-video')) v= this.shadowRoot.querySelector('dash-video').shadowRoot.querySelector('video');
    if (v && this.loaded === true) v.pause();
  }
  muteScene() {
    this.muted = true;
    this.mute();
  }
  unmuteScene() {
    this.muted = false;
    this.mute();
  }

  /**
   * It creates a span element that has the title of the x-media
   * @param title: string
   */
  createTitleElement(title) {
    const titleElement = this.shadowRoot.querySelector('.title');
    if (!titleElement) {
      // Create title element
      const element = Object.assign(document.createElement('span'), {
        className: 'title',
        textContent: title
      });
      this.shadowRoot.appendChild(element);
    } else {
      // Update title element
      titleElement.textContent = title;
    }
  }

  /**
   * Create <video> element in x-media component
   * @param {string} source 
   */
  createVideoElement(source) {
    const v = document.createElement("video");
    v.id = "video";
    v.muted = this.muted;
    v.controls = false;
    v.autoplay = this.autoplay;
    v.loop = false;
    v.style = "width:100%;height:100%";
    if (source) {
      v.src = source;
    }
    this.shadowRoot.appendChild(v);
  }
  enableVolumeMeter(){
    if (!this.shadowRoot.querySelector('volume-meter')) {
      this.shadowRoot.innerHTML = this.shadowRoot.innerHTML + '<volume-meter width="25" height="200" color="blue" style="position:absolute;left:0;"></volume-meter>';
    }
    setTimeout(()=>{
      if(this.shadowRoot.querySelector('video'))
      this.shadowRoot.querySelector('video').showAudioInput = true;
    },2000);
  }
  disableVolumeMeter(){
    this.shadowRoot.querySelector('volume-meter').parentNode.removeChild(this.shadowRoot.querySelector('volume-meter'));
    setTimeout(()=>{
      if(this.shadowRoot.querySelector('video'))
      this.shadowRoot.querySelector('video').showAudioInput = false;
    },2000);
  }
  render() {
    let mediaType = this.identifiyMedia();
    if (mediaType && mediaType != "unknown") {
      switch (mediaType) {
        case "image": {
          if (!this.shadowRoot.querySelector('img')) {
            this.cleanInput('video');
            this.cleanInput('dash');
            let v = document.createElement("img");
            v.id = "video";
            v.src = this.input;
            v.style = "width:100%;height:100%;object-fit:contain;";
            this.shadowRoot.appendChild(v);
          }
          else {
            let i = this.shadowRoot.querySelector("img");
            i.src = this.input;
            i.style = "width:100%;height:100%;object-fit:contain;";
          }
          break;
        }
        case "video": {
          let v = this.shadowRoot.querySelector('video');
          if (!v) {
            this.cleanInput('img');
            this.cleanInput('dash');
            this.createVideoElement(this.input);
          }
          else {
            v.muted = this.muted;
            v.srcObject = null;
            v.src = this.input;
            v.autoplay = this.autoplay;
          }
          break;
        }
       case "dash": {
          let v = this.shadowRoot.querySelector('dash-video');
          if (v)  this.shadowRoot.removeChild(v);
            this.cleanInput('img');
            this.cleanInput('video');
            v = document.createElement("dash-video");
            v.id = "video";
            v.muted = this.muted;
            v.controls = false;
            v.autoplay = this.autoplay;
            v.loop = false;
	          v.setAttribute('log','false');
            v.setAttribute('options', JSON.stringify(optionsDashProfileDefault));
            v.style = "width:100%;height:100%";
            v.src = this.input;
            this.shadowRoot.appendChild(v);

          break;
        }

        case "webrtc": {
          if (!this.shadowRoot.querySelector('video')) {
            this.cleanInput('img');
            this.cleanInput('dash');
            let v = document.createElement("video");
            v.id = "video";
            v.muted = this.muted;
            if(this.nosignalimg){
              v.poster = this.nosignalimg;
            }
            else {
              v.poster = "https://f4.bcbits.com/img/a1761578860_10.jpg";
            }
            v.controls = false;
            v.autoplay = true;
            v.style = "width:100%;height:100%";
            this.shadowRoot.appendChild(v);
          }
          else {
            let v = this.shadowRoot.querySelector('video');
            if(this.nosignalimg){
              v.poster = this.nosignalimg;
            }
            else {
              v.poster = "https://f4.bcbits.com/img/a1761578860_10.jpg";
            }
          }
        }
      }
    } else {
      const v = this.shadowRoot.querySelector('video');
      if (!v) {
        this.createVideoElement();
      }
    }

  }


}


customElements.define('x-media', XMedia);

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */

var JanusPublish = function (dom,janusServer,room){
	var server = null;
	var options = {audio:true,audio:true,simulcast:true,bitrate:0,echoC:true,noiseS:true,gainC:true};
	if (window.location.protocol === 'http:') {
		server = "ws://" + (janusServer || window.location.hostname) + ":8188/janus";
	}
	else {
			server = "wss://" + (janusServer || window.location.hostname) + ":8989/janus";
	}
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
	var firstTime = true;
	var feeds = [];
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
												msg["private_id"];
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
function changeCamera (id){
	var feed_ = janus.list.find((f)=>{if(f.display===id) return true;});
	newRemoteFeed(feed_.id,feed_.display,feed_.audio,feed_.video);

}
function changeDev(){
	if(firstTime) {
		firstTime = false;
		restartCapture();
		return;
	}
	restartCapture();
}
function canvasCapture(audioDeviceId, videoDeviceId) {
	cleanPreprocess();
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
		};
	} else {
		videoCfg = {
			width: {
				ideal: 1280
			},
			height: {
				ideal: 720
			}
		};
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
		}		clearInterval(window.drawLoop);
		window.drawLoop = setInterval(loop, 1000 / 24); // 24 fps
	}).catch(e => {
		alert("Not supported format");
		console.error(e);
	});
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
		               
                        navigator.mediaDevices.enumerateDevices().then((devices)=> {

                                resolve(devices);
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
			};
		}
		if (_audio === false){
			amedia = false;
		}
		else {
			amedia = {
				deviceId: {
					exact: _audioDeviceId
				}
			};
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
						message = Object.assign(message, { bitrate: options.bitrate });
					}
					if (!!options.filename) {
						message = Object.assign(message, { filename: options.filename });
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

};

/**
 * Traverses the slots of the open shadowroots and returns all children matching the query.
 * @param {ShadowRoot | HTMLElement} root
 * @param skipNode
 * @param isMatch
 * @param {number} maxDepth
 * @param {number} depth
 * @returns {HTMLElement[]}
 */
function queryShadowRoot(root, skipNode, isMatch, maxDepth = 20, depth = 0) {
    let matches = [];
    // If the depth is above the max depth, abort the searching here.
    if (depth >= maxDepth) {
        return matches;
    }
    // Traverses a slot element
    const traverseSlot = ($slot) => {
        // Only check nodes that are of the type Node.ELEMENT_NODE
        // Read more here https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
        const assignedNodes = $slot.assignedNodes().filter(node => node.nodeType === 1);
        if (assignedNodes.length > 0) {
            return queryShadowRoot(assignedNodes[0].parentElement, skipNode, isMatch, maxDepth, depth + 1);
        }
        return [];
    };
    // Go through each child and continue the traversing if necessary
    // Even though the typing says that children can't be undefined, Edge 15 sometimes gives an undefined value.
    // Therefore we fallback to an empty array if it is undefined.
    const children = Array.from(root.children || []);
    for (const $child of children) {
        // Check if the node and its descendants should be skipped
        if (skipNode($child)) {
            continue;
        }
        // If the child matches we always add it
        if (isMatch($child)) {
            matches.push($child);
        }
        if ($child.shadowRoot != null) {
            matches.push(...queryShadowRoot($child.shadowRoot, skipNode, isMatch, maxDepth, depth + 1));
        }
        else if ($child.tagName === "SLOT") {
            matches.push(...traverseSlot($child));
        }
        else {
            matches.push(...queryShadowRoot($child, skipNode, isMatch, maxDepth, depth + 1));
        }
    }
    return matches;
}

/**
 * Returns whether the element is hidden.
 * @param $elem
 */
function isHidden($elem) {
    return $elem.hasAttribute("hidden")
        || ($elem.hasAttribute("aria-hidden") && $elem.getAttribute("aria-hidden") !== "false")
        // A quick and dirty way to check whether the element is hidden.
        // For a more fine-grained check we could use "window.getComputedStyle" but we don't because of bad performance.
        // If the element has visibility set to "hidden" or "collapse", display set to "none" or opacity set to "0" through CSS
        // we won't be able to catch it here. We accept it due to the huge performance benefits.
        || $elem.style.display === `none`
        || $elem.style.opacity === `0`
        || $elem.style.visibility === `hidden`
        || $elem.style.visibility === `collapse`;
    // If offsetParent is null we can assume that the element is hidden
    // https://stackoverflow.com/questions/306305/what-would-make-offsetparent-null
    //|| $elem.offsetParent == null;
}
/**
 * Returns whether the element is disabled.
 * @param $elem
 */
function isDisabled($elem) {
    return $elem.hasAttribute("disabled")
        || ($elem.hasAttribute("aria-disabled") && $elem.getAttribute("aria-disabled") !== "false");
}
/**
 * Determines whether an element is focusable.
 * Read more here: https://stackoverflow.com/questions/1599660/which-html-elements-can-receive-focus/1600194#1600194
 * Or here: https://stackoverflow.com/questions/18261595/how-to-check-if-a-dom-element-is-focusable
 * @param $elem
 */
function isFocusable($elem) {
    // Discard elements that are removed from the tab order.
    if ($elem.getAttribute("tabindex") === "-1" || isHidden($elem) || isDisabled($elem)) {
        return false;
    }
    return (
    // At this point we know that the element can have focus (eg. won't be -1) if the tabindex attribute exists
    $elem.hasAttribute("tabindex")
        // Anchor tags or area tags with a href set
        || ($elem instanceof HTMLAnchorElement || $elem instanceof HTMLAreaElement) && $elem.hasAttribute("href")
        // Form elements which are not disabled
        || ($elem instanceof HTMLButtonElement
            || $elem instanceof HTMLInputElement
            || $elem instanceof HTMLTextAreaElement
            || $elem instanceof HTMLSelectElement)
        // IFrames
        || $elem instanceof HTMLIFrameElement);
}

const timeouts = new Map();
/**
 * Debounces a callback.
 * @param cb
 * @param ms
 * @param id
 */
function debounce(cb, ms, id) {
    // Clear current timeout for id
    const timeout = timeouts.get(id);
    if (timeout != null) {
        window.clearTimeout(timeout);
    }
    // Set new timeout
    timeouts.set(id, window.setTimeout(() => {
        cb();
        timeouts.delete(id);
    }, ms));
}

/**
 * Template for the focus trap.
 */
const template$2 = document.createElement("template");
template$2.innerHTML = `
	<div id="start"></div>
	<div id="backup"></div>
	<slot></slot>
	<div id="end"></div>
`;
/**
 * Focus trap web component.
 * @customElement focus-trap
 * @slot - Default content.
 */
class FocusTrap extends HTMLElement {
    /**
     * Attaches the shadow root.
     */
    constructor() {
        super();
        // The debounce id is used to distinguish this focus trap from others when debouncing
        this.debounceId = Math.random().toString();
        this._focused = false;
        const shadow = this.attachShadow({ mode: "open" });
        shadow.appendChild(template$2.content.cloneNode(true));
        this.$backup = shadow.querySelector("#backup");
        this.$start = shadow.querySelector("#start");
        this.$end = shadow.querySelector("#end");
        this.focusLastElement = this.focusLastElement.bind(this);
        this.focusFirstElement = this.focusFirstElement.bind(this);
        this.onFocusIn = this.onFocusIn.bind(this);
        this.onFocusOut = this.onFocusOut.bind(this);
    }
    // Whenever one of these attributes changes we need to render the template again.
    static get observedAttributes() {
        return [
            "inactive"
        ];
    }
    /**
     * Determines whether the focus trap is active or not.
     * @attr
     */
    get inactive() {
        return this.hasAttribute("inactive");
    }
    set inactive(value) {
        value ? this.setAttribute("inactive", "") : this.removeAttribute("inactive");
    }
    /**
     * Returns whether the element currently has focus.
     */
    get focused() {
        return this._focused;
    }
    /**
     * Hooks up the element.
     */
    connectedCallback() {
        this.$start.addEventListener("focus", this.focusLastElement);
        this.$end.addEventListener("focus", this.focusFirstElement);
        // Focus out is called every time the user tabs around inside the element
        this.addEventListener("focusin", this.onFocusIn);
        this.addEventListener("focusout", this.onFocusOut);
        this.render();
    }
    /**
     * Tears down the element.
     */
    disconnectedCallback() {
        this.$start.removeEventListener("focus", this.focusLastElement);
        this.$end.removeEventListener("focus", this.focusFirstElement);
        this.removeEventListener("focusin", this.onFocusIn);
        this.removeEventListener("focusout", this.onFocusOut);
    }
    /**
     * When the attributes changes we need to re-render the template.
     */
    attributeChangedCallback() {
        this.render();
    }
    /**
     * Focuses the first focusable element in the focus trap.
     */
    focusFirstElement() {
        this.trapFocus();
    }
    /**
     * Focuses the last focusable element in the focus trap.
     */
    focusLastElement() {
        this.trapFocus(true);
    }
    /**
     * Returns a list of the focusable children found within the element.
     */
    getFocusableElements() {
        return queryShadowRoot(this, isHidden, isFocusable);
    }
    /**
     * Focuses on either the last or first focusable element.
     * @param {boolean} trapToEnd
     */
    trapFocus(trapToEnd) {
        if (this.inactive)
            return;
        let focusableChildren = this.getFocusableElements();
        if (focusableChildren.length > 0) {
            if (trapToEnd) {
                focusableChildren[focusableChildren.length - 1].focus();
            }
            else {
                focusableChildren[0].focus();
            }
            this.$backup.setAttribute("tabindex", "-1");
        }
        else {
            // If there are no focusable children we need to focus on the backup
            // to trap the focus. This is a useful behavior if the focus trap is
            // for example used in a dialog and we don't want the user to tab
            // outside the dialog even though there are no focusable children
            // in the dialog.
            this.$backup.setAttribute("tabindex", "0");
            this.$backup.focus();
        }
    }
    /**
     * When the element gains focus this function is called.
     */
    onFocusIn() {
        this.updateFocused(true);
    }
    /**
     * When the element looses its focus this function is called.
     */
    onFocusOut() {
        this.updateFocused(false);
    }
    /**
     * Updates the focused property and updates the view.
     * The update is debounced because the focusin and focusout out
     * might fire multiple times in a row. We only want to render
     * the element once, therefore waiting until the focus is "stable".
     * @param value
     */
    updateFocused(value) {
        debounce(() => {
            if (this.focused !== value) {
                this._focused = value;
                this.render();
            }
        }, 0, this.debounceId);
    }
    /**
     * Updates the template.
     */
    render() {
        this.$start.setAttribute("tabindex", !this.focused || this.inactive ? `-1` : `0`);
        this.$end.setAttribute("tabindex", !this.focused || this.inactive ? `-1` : `0`);
        this.focused ? this.setAttribute("focused", "") : this.removeAttribute("focused");
    }
}
window.customElements.define("focus-trap", FocusTrap);

/**
 * Returns the data dialog count for an element.
 * @param $elem
 */
function getDialogCount($elem) {
    return Number($elem.getAttribute(`data-dialog-count`)) || 0;
}
/**
 * Sets the data dialog count for an element.
 * @param $elem
 * @param count
 */
function setDialogCount($elem, count) {
    $elem.setAttribute(`data-dialog-count`, count.toString());
}
/**
 * Traverses the tree of active elements down the shadow tree.
 * @param activeElement
 */
function traverseActiveElements(activeElement = document.activeElement) {
    if (activeElement != null && activeElement.shadowRoot != null && activeElement.shadowRoot.activeElement != null) {
        return traverseActiveElements(activeElement.shadowRoot.activeElement);
    }
    return activeElement;
}

var styles = `*{box-sizing:border-box}:host{padding:var(--dialog-container-padding,5vw 24px);z-index:var(--dialog-z-index,12345678);outline:none}#backdrop,:host{position:fixed;top:0;left:0;bottom:0;right:0}:host,:host([center]) #dialog{overflow-x:var(--dialog-overflow-x,hidden);overflow-y:var(--dialog-overflow-y,auto);overscroll-behavior:contain;-webkit-overflow-scrolling:touch}:host([center]){display:flex;align-items:center;justify-content:center;overflow:hidden}:host([center]) #dialog{max-height:var(--dialog-max-height,100%)}:host(:not(:defined)),:host(:not([open])){display:none}#backdrop{background:var(--dialog-backdrop-bg,rgba(0,0,0,.6));animation:fadeIn var(--dialog-animation-duration,.1s) var(--dialog-animation-easing,ease-out);z-index:-1}#dialog{animation:scaleIn var(--dialog-animation-duration,.1s) var(--dialog-animation-easing,ease-out);border-radius:var(--dialog-border-radius,12px);box-shadow:var(--dialog-box-shadow,0 2px 10px -5px rgba(0,0,0,.6));max-width:var(--dialog-max-width,700px);width:var(--dialog-width,100%);padding:var(--dialog-padding,24px);max-height:var(--dialog-max-height,unset);height:var(--dialog-height,auto);color:var(--dialog-color,currentColor);background:var(--dialog-bg,#fff);z-index:1;position:relative;display:flex;flex-direction:column;margin:0 auto;border:none}::slotted(article),article{flex-grow:1;overflow-y:auto;-webkit-overflow-scrolling:touch}::slotted(footer),::slotted(header),footer,header{flex-shrink:0}@keyframes scaleIn{0%{transform:scale(.9) translateY(30px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}@keyframes fadeIn{0%{opacity:0}to{opacity:1}}`;

const template$1 = document.createElement("template");
template$1.innerHTML = `
  <style>${styles}</style>
  <div id="backdrop" part="backdrop"></div>
  <focus-trap id="dialog" part="dialog">
    <slot></slot>
  </focus-trap>
`;
/**
 * A dialog web component that can be used to display highly interruptive messages.
 * @fires open - This event is fired when the dialog opens.
 * @fires close - This event is fired when the dialog closes.
 * @fires closing - This event is fired before the dialog is closed by clicking escape or on the backdrop. The event is cancellable which means `event.preventDefault()` can cancel the closing of the dialog.
 * @cssprop --dialog-container-padding - Padding of the host container of the dialog.
 * @cssprop --dialog-z-index - Z-index of the dialog.
 * @cssprop --dialog-overflow-x - Overflow of the x-axis.
 * @cssprop --dialog-overflow-y - Overflow of the y-axis.
 * @cssprop --dialog-max-height - Max height of the dialog.
 * @cssprop --dialog-height - Height of the dialog.
 * @cssprop --dialog-backdrop-bg - Background of the backdrop.
 * @cssprop --dialog-animation-duration - Duration of the dialog animation.
 * @cssprop --dialog-animation-easing - Easing of the dialog animation.
 * @cssprop --dialog-border-radius - Border radius of the dialog.
 * @cssprop --dialog-box-shadow - Box shadow of the dialog.
 * @cssprop --dialog-max-width - Max width of the dialog.
 * @cssprop --dialog-width - Width of the dialog.
 * @cssprop --dialog-padding - Padding of the dialog.
 * @cssprop --dialog-color - Color of the dialog.
 * @cssprop --dialog-bg - Background of the dialog.
 * @csspart backdrop - Backdrop part.
 * @csspart dialog - Dialog part.
 */
class WebDialog extends HTMLElement {
    /**
     * Attaches the shadow root.
     */
    constructor() {
        super();
        this.$scrollContainer = document.documentElement;
        this.$previousActiveElement = null;
        const shadow = this.attachShadow({ mode: "open" });
        shadow.appendChild(template$1.content.cloneNode(true));
        this.$dialog = shadow.querySelector("#dialog");
        this.$backdrop = shadow.querySelector("#backdrop");
        this.onBackdropClick = this.onBackdropClick.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        // Set aria attributes
        this.setAttribute("aria-modal", "true");
        this.$dialog.setAttribute("role", "alertdialog");
    }
    static get observedAttributes() {
        return ["open", "center"];
    }
    /**
     * Whether the dialog is opened.
     * @attr
     */
    get open() {
        return this.hasAttribute("open");
    }
    set open(value) {
        value ? this.setAttribute("open", "") : this.removeAttribute("open");
    }
    /**
     * Whether the dialog is centered on the page.
     * @attr
     */
    get center() {
        return this.hasAttribute("center");
    }
    set center(value) {
        value ? this.setAttribute("center", "") : this.removeAttribute("center");
    }
    /**
     * Attaches event listeners when connected.
     */
    connectedCallback() {
        this.$backdrop.addEventListener("click", this.onBackdropClick);
    }
    /**
     * Removes event listeners when disconnected.
     */
    disconnectedCallback() {
        this.$backdrop.removeEventListener("click", this.onBackdropClick);
        // If the dialog is open when it is removed from the DOM
        // we need to cleanup the event listeners and side effects.
        if (this.open) {
            this.didClose();
        }
    }
    /**
     * Shows the dialog.
     */
    show() {
        this.open = true;
    }
    /**
     * Closes the dialog with a result.
     * @param result
     */
    close(result) {
        this.result = result;
        this.open = false;
    }
    /**
     * Closes the dialog when the backdrop is clicked.
     */
    onBackdropClick() {
        if (this.assertClosing()) {
            this.close();
        }
    }
    /**
     * Closes the dialog when escape is pressed.
     */
    onKeyDown(e) {
        switch (e.code) {
            case "Escape":
                if (this.assertClosing()) {
                    this.close();
                    // If there are more dialogs, we don't want to close those also :-)
                    e.stopImmediatePropagation();
                }
                break;
        }
    }
    /**
     * Dispatches an event that, if asserts whether the dialog can be closed.
     * If "preventDefault()" is called on the event, assertClosing will return true
     * if the event was not cancelled. It will return false if the event was cancelled.
     */
    assertClosing() {
        return this.dispatchEvent(new CustomEvent("closing", { cancelable: true }));
    }
    /**
     * Setup the dialog after it has opened.
     */
    didOpen() {
        // Save the current active element so we have a way of restoring the focus when the dialog is closed.
        this.$previousActiveElement = traverseActiveElements(document.activeElement);
        // Focus the first element in the focus trap.
        // Wait for the dialog to show its content before we try to focus inside it.
        // We request an animation frame to make sure the content is now visible.
        requestAnimationFrame(() => {
            this.$dialog.focusFirstElement();
        });
        // Make the dialog focusable
        this.tabIndex = 0;
        // Block the scrolling on the scroll container to avoid the outside content to scroll.
        this.$scrollContainer.style.overflow = `hidden`;
        // Listen for key down events to close the dialog when escape is pressed.
        this.addEventListener("keydown", this.onKeyDown, { capture: true, passive: true });
        // Increment the dialog count with one to keep track of how many dialogs are currently nested.
        setDialogCount(this.$scrollContainer, getDialogCount(this.$scrollContainer) + 1);
        // Dispatch an event so the rest of the world knows the dialog opened.
        this.dispatchEvent(new CustomEvent("open"));
    }
    /**
     * Clean up the dialog after it has closed.
     */
    didClose() {
        // Remove the listener listening for key events
        this.removeEventListener("keydown", this.onKeyDown, { capture: true });
        // Decrement the dialog count with one to keep track of how many dialogs are currently nested.
        setDialogCount(this.$scrollContainer, Math.max(0, getDialogCount(this.$scrollContainer) - 1));
        // If there are now 0 active dialogs we unblock the scrolling from the scroll container.
        // This is because we know that no other dialogs are currently nested within the scroll container.
        if (getDialogCount(this.$scrollContainer) <= 0) {
            this.$scrollContainer.style.overflow = ``;
        }
        // Make the dialog unfocusable.
        this.tabIndex = -1;
        // Restore previous active element.
        if (this.$previousActiveElement != null) {
            this.$previousActiveElement.focus();
            this.$previousActiveElement = null;
        }
        // Dispatch an event so the rest of the world knows the dialog closed.
        // If a result has been set, the result is added to the detail property of the event.
        this.dispatchEvent(new CustomEvent("close", { detail: this.result }));
    }
    /**
     * Reacts when an observed attribute changes.
     */
    attributeChangedCallback(name, newValue, oldValue) {
        switch (name) {
            case "open":
                this.open ? this.didOpen() : this.didClose();
                break;
        }
    }
}
customElements.define("web-dialog", WebDialog);

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
let svg ='<svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><use class="ytp-svg-shadow" xlink:href="#ytp-id-18"></use><path d="m 23.94,18.78 c .03,-0.25 .05,-0.51 .05,-0.78 0,-0.27 -0.02,-0.52 -0.05,-0.78 l 1.68,-1.32 c .15,-0.12 .19,-0.33 .09,-0.51 l -1.6,-2.76 c -0.09,-0.17 -0.31,-0.24 -0.48,-0.17 l -1.99,.8 c -0.41,-0.32 -0.86,-0.58 -1.35,-0.78 l -0.30,-2.12 c -0.02,-0.19 -0.19,-0.33 -0.39,-0.33 l -3.2,0 c -0.2,0 -0.36,.14 -0.39,.33 l -0.30,2.12 c -0.48,.2 -0.93,.47 -1.35,.78 l -1.99,-0.8 c -0.18,-0.07 -0.39,0 -0.48,.17 l -1.6,2.76 c -0.10,.17 -0.05,.39 .09,.51 l 1.68,1.32 c -0.03,.25 -0.05,.52 -0.05,.78 0,.26 .02,.52 .05,.78 l -1.68,1.32 c -0.15,.12 -0.19,.33 -0.09,.51 l 1.6,2.76 c .09,.17 .31,.24 .48,.17 l 1.99,-0.8 c .41,.32 .86,.58 1.35,.78 l .30,2.12 c .02,.19 .19,.33 .39,.33 l 3.2,0 c .2,0 .36,-0.14 .39,-0.33 l .30,-2.12 c .48,-0.2 .93,-0.47 1.35,-0.78 l 1.99,.8 c .18,.07 .39,0 .48,-0.17 l 1.6,-2.76 c .09,-0.17 .05,-0.39 -0.09,-0.51 l -1.68,-1.32 0,0 z m -5.94,2.01 c -1.54,0 -2.8,-1.25 -2.8,-2.8 0,-1.54 1.25,-2.8 2.8,-2.8 1.54,0 2.8,1.25 2.8,2.8 0,1.54 -1.25,2.8 -2.8,2.8 l 0,0 z" fill="orange" id="ytp-id-18"></path></svg>';

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
// <volume-meter width="500" height="25" color="red"></volume-meter>	
class VolumeMeter extends HTMLElement {


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
        this.setAttribute('color',c);
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

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
let tmp =`
    <div id="videoWrap" style="height:100%;">
    <volume-meter width="25" height="200" color="blue" style="position:absolute;left:0;"></volume-meter>
    <video id='myvideo' muted style='position: relative;top: 0;left: 0;width:100%;height:100%;' autoplay>
    </video>

    <span id="configIcon" style="position: absolute;top: 0%;left: 0%;width:80px;height:80px;cursor:hand;visibility:visible;blakground:black;z-index:9999">`+svg+`</span>
    </div>
    <web-dialog center>
     <form id='change_dev_form' class="form-inline" >

  						              <div class="form-group" style="margin-right: 20px;">
                                   <h2> Media Choose:</h2>
                                   <div>
                                   <label for="audio-device" i18n>Audio device (input):</label>

                                   <select id="audio-device" class="form-control"  ></select>
                                    </div>
                                    <div>
  							                   <label for="video-device" i18n>Video device (input):</label>
                                   <select id="video-device" class="form-control"></select>
                                   </div>

  						              </div>

  					        
   <div id="configPanel" >
   <h2> Advanced:</h2>
   <h2>Resolution: 
    <select id="res"> 
    <option value="UHD"> 4K (3840x2160)</option>
    <option value="FHD"> FHD (1920x1080)</option>
    <option value="UXGA"> UXGA (1600x1200)</option>
    <option value="HD" selected> HD (1280x720)</option>
    <option value="SVGA"> SVGA (800x600)</option>
    <option value="VGA"> VGA (640x480)</option>
    <option value="VGAHD"> VGAHD (960x720)</option>
    <option value="VGAHD-P"> VGAHD Portrait (720x960)</option>
    <option value="VGAFHD"> VGAFHD (1440x1080)</option>
    <option value="VGAFHD-P"> VGAFHD Portrait (1080x1440)</option>
    <option value="360p"> 360p (640x360)</option>
    <option value="QVGA"> QVGA (320x240)</option></select>
    </h2>
			EchoCancelation:<input type="checkbox"	id="echo" checked style="margin-right:20px">
			NoiseSupression:<input type="checkbox"	id="noise" checked style="margin-right:20px">
      GainControl:<input type="checkbox"	id="gain" checked style="margin-right:20px">
      Video:<input type="checkbox"	id="videoc" checked style="margin-right:20px">
      Audio:<input type="checkbox"	id="audioc" checked style="margin-right:20px">
      Simulcast:<input type="checkbox"	id="simulcast" checked style="margin-right:20px">
      Portrait:<input type="checkbox"	id="portrait" style="margin-right:20px">
      <h2>Bitrate:</h2> <input type="number" id="bitrate" value=0 style="margin-right:20px"><span>kb/s</span>
      <h2>Micro Volume (force):</h2> <input type="range" id="volIncrease" value=1 min=1 max=5 style="margin-right:20px">
      <h2>Audio Delay:</h2> <input type="number" id="delay" value=0 style="margin-right:20px"><span>s</span>
      <h2>Audio Type: <select id="audiotype"> <option value=""> None</option><option value="music" selected> Music</option><option value="speech"> Speech</option><option value="speech-recognition"> Speech Recognotion</option></select></h2>
      </form>
      <span style="float:right"><span id="saveB" class="btn btn-primary"> Save </span>
      <span id="closeB" class="btn btn-primary"> Close </span></span>
      <div>
      </web-dialog>`;
  let tmpl = document.createElement('template');
  tmpl.innerHTML = tmp;

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
let buttonClass =`.btn{
display: inline-block;
    font-weight: 400;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    border: 1px solid transparent;
    padding: .5rem .75rem;
    font-size: 1rem;
    line-height: 1.25;
    border-radius: .25rem;
    transition: all .15s ease-in-out;
    cursor:pointer;
}

.btn-primary {
    color: #fff;
    background-color: #007bff;
    border-color: #007bff;
}`;

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
class WCWebrtcPublisher extends HTMLElement {
  static get observedAttributes () {
    return ['config','input','options',"style","settings"];
  }
  
  attributeChangedCallback (name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this[name] = newValue;
    }
  }
 
  constructor () {
    super();
    this.playerEventObserver = new Subject();
    this.attachShadow({mode: 'open'}).appendChild(tmpl.content.cloneNode(true));    this.shadowRoot.innerHTML+="<style>"+buttonClass+"</style>";
    this.log =  Logger.getLogger('Webrtc-publisher');
    this.playerEventObservable = new Observable((observer) => { this.playerEventObserver.subscribe(observer); });
    this.shadowRoot.querySelector('form').addEventListener('change',this.configChange.bind(this));
    this.shadowRoot.querySelector('#saveB').addEventListener('click',this.save.bind(this),true);
    this.shadowRoot.querySelector('#closeB').addEventListener('click',()=>{this.shadowRoot.querySelector('web-dialog').open =false;document.exitFullscreen();});
    this.showConfListener = this.showConfig.bind(this);
    this.showIconListener = this.showIcon.bind(this);
    this.shadowRoot.querySelector('#configIcon').addEventListener('click',this.showConfListener);
    this.shadowRoot.querySelector('#configIcon').addEventListener('touchend',this.showConfListener);
    this.shadowRoot.querySelector('#videoWrap').addEventListener('mouseover',this.showIconListener);
    this.shadowRoot.querySelector('#videoWrap').addEventListener('touchend',this.showIconListener);
  } 

  showIcon (){
    this.shadowRoot.querySelector('#configIcon').style.visibility="visible";
    if (showIconTimer) clearTimeout(showIconTimer);
    var showIconTimer = setTimeout(()=>{this.shadowRoot.querySelector('#configIcon').style.visibility="hidden";},3000);
  }

  get style() { return this.getAttribute('style'); }
  set style(value) {
    this.getAttribute('style');
    if (typeof value!="undefined") {
      this.setAttribute('style', value);
      setTimeout(()=>{this.shadowRoot.querySelector('video').style.cssText+=value;},1000);
    }
  }

  get config () { return this.getAttribute('config'); }
  set config (value) {
    this.setAttribute('config', value);
    if (value!="") {
      let configJson = JSON.parse(value);
      this.PublishJanus  = JanusPublish(this.shadowRoot,configJson.janusServer,configJson.room);
    }
    this.render();
  }

  get settings () { return this.getAttribute('settings'); }
  set settings (value) {
    this.setAttribute('settings', value);
    if(this.settings=='false')
    {
      this.shadowRoot.querySelector('#configIcon').style.visibility="hidden";
      this.shadowRoot.querySelector('#configIcon').removeEventListener('click',this.showConfListener);
      this.shadowRoot.querySelector('#configIcon').removeEventListener('touchend',this.showConfListener);
      this.shadowRoot.querySelector('#videoWrap').removeEventListener('mouseover',this.showIconListener);
      this.shadowRoot.querySelector('#videoWrap').removeEventListener('touchend',this.showIconListener);

    } 
  }

  get options () { return this.getAttribute('options'); }
  set options (value) {
    this.setAttribute('options', value);
    setTimeout(()=>{this.setConfig();},500);
  }
  async connectedCallback () {
     this.__initialized = true;
  }
 async listMedia(){
   let devices = await this.PublishJanus.listDevices();
   return devices;
 }
 playEventSubscriber(){
  return this.playerEventObservable;
 }
 publish(options){
      if (this.flags && this.flags.portrait === true && this.shadowRoot.querySelector('canvas')){
        this.shadowRoot.querySelector('canvas').removeEventListener('mouseover',this.showIconListener);
        this.shadowRoot.querySelector('canvas').removeEventListener('touchend',this.showIconListener);
        this.shadowRoot.querySelector('canvas').addEventListener('mouseover',this.showIconListener);
        this.shadowRoot.querySelector('canvas').addEventListener('touchend',this.showIconListener);
     }
     this.log.info("click publish");
     this.unpublish();
     if(options instanceof MouseEvent)
            this.PublishJanus.init(this.input,this.flags);
     else this.PublishJanus.init(this.input,options || this.flags);
     if (this.flags && this.flags.video == false) this.setOnlyAudioPoster(true);
     else this.setOnlyAudioPoster(false);
     this.playerEventObserver.next({type:"play",value:"true"});
 }
 unpublish(){
   this.PublishJanus.stop();
   this.shadowRoot.querySelector('video').srcObject= null;
   this.playerEventObserver.next({type:"pause",value:"true"});
 }
 destroy(){
   this.PublishJanus.stop();
   this.PublishJanus.destroy();
   this.shadowRoot.querySelector('video').srcObject= null;

 }
 setConfig(){
   this.log.info(this.options);
   let conf = {};
   try {
     conf = JSON.parse(this.options);
     this.flags = conf;
   }
   catch(ex){
     this.log.warn(ex);
   }
   if (typeof conf.portrait!=="undefined") this.shadowRoot.querySelector('#portrait').checked = conf.portrait || false;
   if (typeof conf.res!=="undefined") this.shadowRoot.querySelector('#res').value = conf.res || "HD";
   if (typeof conf.audio!=="undefined") this.shadowRoot.querySelector('#audioc').checked = conf.audio;
   if (typeof conf.video!=="undefined") this.shadowRoot.querySelector('#videoc').checked = conf.video;
   if (typeof conf.bitrate!=="undefined") this.shadowRoot.querySelector('#bitrate').value = conf.bitrate;
   if (typeof conf.noiseS!=="undefined") this.shadowRoot.querySelector('#noise').checked = conf.noiseS;
   if (typeof conf.echoC!=="undefined") this.shadowRoot.querySelector('#echo').checked = conf.echoC;
   if (typeof conf.gainC!=="undefined") this.shadowRoot.querySelector('#gain').checked = conf.gainC;
   if (typeof conf.gainC!=="undefined") this.shadowRoot.querySelector('#delay').value = conf.delay || 0;
   if (typeof conf.volIncrease!=="undefined") this.shadowRoot.querySelector('#volIncrease').value = conf.volIncrease || 0;
   if (typeof conf.simulcast!=="undefined") this.shadowRoot.querySelector('#simulcast').checked = conf.simulcast;
   window.echoC = this.shadowRoot.querySelector('#echo').checked;
   window.noiseS = this.shadowRoot.querySelector('#noise').checked;
   window.gainC = this.shadowRoot.querySelector('#gain').checked;
   window.volIncrease = parseInt(this.shadowRoot.querySelector('#volIncrease').value) || 0;
   window.audioType = this.shadowRoot.querySelector('#audiotype').value || "";
   if (typeof conf.showAudioInput!=="undefined") window.showAudioInput = conf.showAudioInput;


 }
 async showConfig(){
  this.requestFullscreen();
  let audioValue;
  let videoValue ;
   let medias = await this.listMedia();
   this.shadowRoot.querySelector('web-dialog').open =true;
   let audios = this.shadowRoot.querySelector('#audio-device');
   let videos = this.shadowRoot.querySelector('#video-device');
  if (audios && videos && audios.children.length>0){
     audioValue = audios.options[audios.selectedIndex].value;
     audios.options[audios.selectedIndex].text;
     videoValue = videos.options[videos.selectedIndex].value;
     videos.options[videos.selectedIndex].text;
  }
   audios.innerHTML ="";
   videos.innerHTML ="";
   medias.forEach((m)=>{
     let option = document.createElement('option');
     option.value = m.deviceId;
     option.innerHTML = m.label || m.deviceId;
     if (m.kind === "audioinput"){
        if (m.deviceId == audioValue) option.selected = true;
        audios.appendChild(option);
     }
     else if (m.kind==="videoinput"){
        if (m.deviceId == videoValue) option.selected = true;
        videos.appendChild(option);
     }
   });
 }
  configChange(ev){
    this.flags.portrait = window.portrait = this.shadowRoot.querySelector('#portrait').checked;
    this.flags.res = window.res = this.shadowRoot.querySelector('#res').value;
    this.flags.audioinput = this.shadowRoot.querySelector('#audio-device').value;
    this.flags.videoinput = this.shadowRoot.querySelector('#video-device').value;
    this.flags.video = this.shadowRoot.querySelector('#videoc').checked;
    const useAudio = this.shadowRoot.querySelector('#audioc').checked;
    if (useAudio && !this.flags.audioinput) {
      console.warn('Disabled audio since there is not audio input selected');
    }
    this.flags.audio = !!this.flags.audioinput ? useAudio : false;
    // If audio is disable, we have to disable showAudioInput
    if (window.showAudioInput && !this.flags.audio) {
      window.showAudioInput = false;
    }
    this.flags.echoC = window.echoC = this.shadowRoot.querySelector('#echo').checked;
    this.flags.noiseS = window.noiseS = this.shadowRoot.querySelector('#noise').checked;
    this.flags.gainC = window.gainC = this.shadowRoot.querySelector('#gain').checked;
    this.flags.delay = window.delay = this.shadowRoot.querySelector('#delay').value;
    this.flags.volIncrease = window.volIncrease = parseInt(this.shadowRoot.querySelector('#volIncrease').value);
    this.flags.audioType = window.audioType = this.shadowRoot.querySelector('#audiotype').value;
    this.flags.simulcast = this.shadowRoot.querySelector('#simulcast').checked;
    this.flags.bitrate = parseInt(this.shadowRoot.querySelector('#bitrate').value)*1024;
    this.log.info(this.flags);
    if (ev && ev.srcElement.id === "audio-device"){
      if (this.flags.portrait === true){
        this.PublishJanus.rotateVideo(this.flags.audioinput,this.flags.videoinput);
        this.shadowRoot.querySelector('canvas').removeEventListener('mouseover',this.showIconListener);
        this.shadowRoot.querySelector('canvas').removeEventListener('touchend',this.showIconListener);
        this.shadowRoot.querySelector('canvas').addEventListener('mouseover',this.showIconListener);
        this.shadowRoot.querySelector('canvas').addEventListener('touchend',this.showIconListener);
      }
      else this.PublishJanus.restartCapture(this.flags.audioinput,this.flags.videoinput,{video:this.flags.video,audio:this.flags.audio, portrait:this.flags.portrait});
      if (this.flags.video == false) this.setOnlyAudioPoster(true);
      else this.setOnlyAudioPoster(false);
    }
    else if (ev && ev.srcElement.id === "video-device"){
      if (this.flags.portrait === true){
        this.PublishJanus.rotateVideo(this.flags.audioinput,this.flags.videoinput);
      }
      else this.PublishJanus.restartCapture(this.flags.audioinput,this.flags.videoinput,{video:this.flags.video,audio:this.flags.audio, portrait:this.flags.portrait});
      if (this.flags.video == false) this.setOnlyAudioPoster(true);
      else this.setOnlyAudioPoster(false);

    }
  
  }
  setOnlyAudioPoster(flag){
    if (flag===true){
      this.shadowRoot.querySelector('video').poster = "https://assets.boxcast.com/latest/static/audio-only.png";
    }
    else 
    this.shadowRoot.querySelector('video').poster = "";
  }
   userCmdEvents(evt){
    if (evt.cmd =="stream"){
       FlexJanus.stop(this.input);
       this.input = evt.value;
       FlexJanus.start(evt.value, this);
       if (this.flags.video == false) this.setOnlyAudioPoster(true);
       else this.setOnlyAudioPoster(false);
    }
  }
  setOrkestraInstance(app){
    this.app = app;
    this.app.useServiceHub(app.options.channel+"_mediaServs").then (()=>{
    
       this.app.publishService('adaptiveStream_'+this.app.getMyAgentId());
       setTimeout(()=> { 
       let data= {
          io: "out",
          portrait:false,
          res:"HD",
          bitrate:0,
          volume:1,
          volIncrease:1,
          noiseS:true,
          echoC:false,
          gainC:false,
          simulcast:false,
          viewport:this.shadowRoot.querySelector('video').clientWidth+"x"+this.shadowRoot.querySelector('video').clientHeight,
          audio:true,
          video:true,
          status:1,
          timestamp:new Date().getTime()
        };
     this.sendAdaptativeStreamInfo(data);},3000);
     this.app.subscribeToService('adaptiveStream_'+this.app.getMyAgentId(),this.adaptativeStreamChange.bind(this),"in");

   }).catch(e=>{
     this.log.error(e);
   });
   
  }
  sendAdaptativeStreamInfo(data){
    this.app.sendServiceData('adaptiveStream_'+this.app.getMyAgentId(),data,"out");
  }
  adaptativeStreamChange(evt){
    this.log.info(evt);
    if (typeof evt.value.data.bitrate !="undefined"){
       let diff = Obj.getObjectDiff(evt.value.data,this.flags);
       this.log.info("diff",diff);
       this.flags.portrait = window.portrait = evt.value.data.portrait;
       this.flags.res = window.res = evt.value.data.res;
       this.flags.bitrate = evt.value.data.bitrate;
       this.flags.video = evt.value.data.video;
       this.flags.audio = evt.value.data.audio;
       this.flags.echoC = window.echoC = evt.value.data.echoC;
       this.flags.gainC = window.gainC = evt.value.data.gainC;
       this.flags.noiseS = window.noiseS = evt.value.data.noiseS;
       this.flags.simulcat = evt.value.data.simulcast;
       this.flags.delay = window.delay = evt.value.data.delay || 0;
       this.flags.volIncrease = window.volIncrease = parseInt(evt.value.data.volIncrease) || 1;
       this.flags.audioType = window.audioType = evt.value.data.audioType || "";
       this.publish(this.flags);
       if (this.flags.video == false) this.setOnlyAudioPoster(true);
       else this.setOnlyAudioPoster(false);
    } 
  }
  save(){
     
    this.configChange();
    if (this.flags.portrait === true){
      this.unpublish();
      this.PublishJanus.init(this.input,this.flags);
      if (this.flags.video == false) this.setOnlyAudioPoster(true);
      else this.setOnlyAudioPoster(false);
      this.playerEventObserver.next({type:"play",value:"true"});
      setTimeout(()=>{
        setTimeout(()=>{
          this.shadowRoot.querySelector('canvas').removeEventListener('mouseover',this.showIconListener);
          this.shadowRoot.querySelector('canvas').removeEventListener('touchend',this.showIconListener);
          this.shadowRoot.querySelector('canvas').addEventListener('mouseover',this.showIconListener);
          this.shadowRoot.querySelector('canvas').addEventListener('touchend',this.showIconListener);
        },1000);
      },1500);
    }
    else {
      this.publish(this.flags);
      this.playerEventObserver.next({type:"play",value:"true"});
    }
   }

  render () {
    if (this.config === "undefined") return; 
 

  }

}

customElements.define('webrtc-publisher', WCWebrtcPublisher);

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */

var JanusScreenShare = function (dom, janusServer, room) {
    let server = null;
    if (window.location.protocol === 'http:') {
	    server = "ws://" + (janusServer || window.location.hostname) + ":8188/janus";
	}
	else {
			server = "wss://" + (janusServer || window.location.hostname) + ":8989/janus";
	}
    var janus = null;
    var screentest = null;
    var opaqueId = "screensharing-" + Janus.randomString(12);
    var myid = null;

    var capture = null;
    var role = null;
    var room = room || 1234;


    function init(aid, _options) {
        // Initialize the library (all console debuggers enabled)
        const { debug } = _options;
        Janus.init({
            debug: debug, callback: function () {
                // Use a button to start the demo
             
                    // Make sure the browser supports WebRTC
                    if (!Janus.isWebrtcSupported()) {
                        alert("No WebRTC support... ");
                        return;
                    }
                    // Create session
                    janus = new Janus(
                        {
                            server: server,
                            success: function () {
                                // Attach to VideoRoom plugin
                                janus.attach(
                                    {
                                        plugin: "janus.plugin.videoroom",
                                        opaqueId: opaqueId,
                                        success: function (pluginHandle) {
                                           
                                            screentest = pluginHandle;
                                            debug && console.log("Plugin attached! (" + screentest.getPlugin() + ", id=" + screentest.getId() + ")");
                                        },
                                        error: function (error) {
                                            Janus.error("  -- Error attaching plugin...", error);
                                            bootbox.alert("Error attaching plugin... " + error);
                                        },
                                        consentDialog: function (on) {
                                        },
                                        iceState: function (state) {
                                            Janus.log("ICE state changed to " + state);
                                        },
                                        mediaState: function (medium, on) {
                                            Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
                                        },
                                        webrtcState: function (on) {
                                            Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");

                                        },
                                        onmessage: function (msg, jsep) {
                                            Janus.debug(" ::: Got a message (publisher) :::", msg);
                                            var event = msg["videoroom"];
                                            Janus.debug("Event: " + event);
                                            if (event) {
                                                if (event === "joined") {
                                                    myid = msg["id"];
                                                    Janus.log("Successfully joined room " + msg["room"] + " with ID " + myid);
                                                    if(role === "publisher") {
                                                        // This is our session, publish our stream
                                                        Janus.debug("Negotiating WebRTC stream for our screen (capture " + capture + ")");
                                                        screentest.createOffer(
                                                            {
                                                                media: { video: "screen", audioSend: false, videoRecv: false,audioRecv:false,recvonly:false},	// Screen sharing Publishers are sendonly
                                                                success: function(jsep) {
                                                                    Janus.debug("Got publisher SDP!");
                                                                    Janus.debug(jsep);
                                                                    let message = { 
                                                                        "request": "configure", 
                                                                        "audio": false, 
                                                                        "video": true,
                                                                        "bitrate":_options.bitrate
                                                                    };
                                                                    if (!!_options.filename) {
                                                                        message = Object.assign(message, { filename: _options.filename });
                                                                    }
                                                                    screentest.send({"message": message, "jsep": jsep});
                                                                },
                                                                error: function(error) {
                                                                    Janus.error("WebRTC error:", error);
                                                                    bootbox.alert("WebRTC error... " + JSON.stringify(error));
                                                                }
                                                            });
                                                    }
                                                } else if (event === "event") {
                                                    // Any feed to attach to?
                                                    if (role === "listener" && msg["publishers"]) ; else if (msg["leaving"]) {
                                                        // One of the publishers has gone away?
                                                        msg["leaving"];

                                                    } else if (msg["error"]) {
                                                        console.warn(msg["error"]);
                                                    }
                                                }
                                            }
                                            if(jsep) {
                                                Janus.debug("Handling SDP as well...", jsep);
                                                screentest.handleRemoteJsep({ jsep: jsep });
                                            }

                                        },
                                        onlocalstream: function (stream) {

                                        },
                                        onremotestream: function (stream) {
                                            // The publisher stream is sendonly, we don't expect anything here
                                        },
                                        oncleanup: function () {
                                            debug && console.log(" ::: Got a cleanup notification :::");
                                        }
                                    });
                            },
                            error: function (error) {
                                console.error(error);

                            },
                            destroyed: function () {}
                        });
                        setTimeout(()=>{shareScreen(aid);},1000);
                
            }
        });
    }





    function shareScreen(aid) {
        role = "publisher";
        let register = { "request": "join", "room": room, "ptype": "publisher", "display":aid };
        screentest.send({"message": register});
    }
    function stop(){
       screentest.hangup();
       janus.destroy();
    }
    

    return {
        init: init,
        stop: stop,
        start: shareScreen
    }


};

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */

class WCScreenShare extends HTMLElement {
  static get observedAttributes () {
    return ['config','input','options',"style"];
  }
  
  attributeChangedCallback (name, oldValue, newValue) {
    if (oldValue !== newValue) {
      
        this[name] = newValue;
      
    }
  }
 
  constructor () {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML+="<style>"+buttonClass+"</style>";
   
  } 
  get style() { return this.getAttribute('style'); }
  set style(value) {
    this.getAttribute('style');
    if (typeof value!="undefined") {
      this.setAttribute('style', value);
      setTimeout(()=>{this.shadowRoot.querySelector('#myvideo').style.cssText+=value;},1000);
    }
  }

  get config () { return this.getAttribute('config'); }
  set config (value) {
    this.setAttribute('config', value);
    if (value!="") {
      let configJson = JSON.parse(value);
      this.JanusScreenShare  = JanusScreenShare(this.shadowRoot,configJson.janusServer,configJson.room);
    }
    this.render();
  }
  get options () { return this.getAttribute('options'); }
  set options (value) {
    this.setAttribute('options', value);
    setTimeout(()=>{this.setConfig();},500);
  }
  async connectedCallback () {
     this.__initialized = true;
  }

 publish(options){
   //  this.unpublish();
     if(options instanceof MouseEvent)
            this.JanusScreenShare.init(this.input,this.flags);
     else this.JanusScreenShare.init(this.input,options || this.flags);
 }
 unpublish(){
   this.JanusScreenShare.stop();
 }
 setConfig(){
   let conf = {};
   try {
     conf = JSON.parse(this.options);
     this.flags = conf;
   }
   catch(ex){
     console.log(ex);
   }
  
   if (typeof conf.bitrate!=="undefined") this.shadowRoot.querySelector('#bitrate').value = conf.bitrate;
   if (typeof conf.simulcast!=="undefined") this.shadowRoot.querySelector('#simulcast').checked = conf.simulcast;

 }
 async showConfig(){
 
 }
  configChange(ev){

    this.flags.simulcast = this.shadowRoot.querySelector('#simulcast').checked;
    this.flags.bitrate = parseInt(this.shadowRoot.querySelector('#bitrate').value);
   
  }
  render () {
    if (this.config === "undefined") return; 
    if (this.shadowRoot.querySelector('#videoWrap')) return;
    this.shadowRoot.innerHTML+=`
    <div style="display:none; position: fixed;" id="videoWrap"><video id='myvideo' muted style='position: relative;top: 0;left: 0;' controls autoplay></video>
    <span id="configIcon" style="position: absolute;top: 15px;left: 88%;width:40px;height:40px;cursor:hand;visibility:hidden">`+svg+`</span></div>
    <web-dialog center>
     <form id='change_dev_form' class="form-inline" >
 					        
   <div id="configPanel" >
   <h2> Advanced:</h2>
		
      Simulcast:<input type="checkbox"	id="simulcast" checked style="margin-right:20px">
      <h2>Bitrate:</h2> <input type="number" id="bitrate" value=0 style="margin-right:20px">
      </form>
      <span style="float:right"><span id="saveB" class="btn btn-primary"> Save </span>
      <span id="closeB" class="btn btn-primary"> Close </span></span>
      <div>
      </web-dialog>
     `;
    this.shadowRoot.querySelector('form').addEventListener('change',this.configChange.bind(this));
    this.shadowRoot.querySelector('#saveB').addEventListener('click',this.publish.bind(this));
    this.shadowRoot.querySelector('#closeB').addEventListener('click',()=>this.shadowRoot.querySelector('web-dialog').open =false);
    this.shadowRoot.querySelector('#configIcon').addEventListener('click',this.showConfig.bind(this));
    this.shadowRoot.querySelector('#videoWrap').addEventListener('mouseover',()=>{
      this.shadowRoot.querySelector('#configIcon').style.visibility="visible";
      if (showIconTimer) clearTimeout(showIconTimer);
      var showIconTimer = setTimeout(()=>{this.shadowRoot.querySelector('#configIcon').style.visibility="hidden";},3000);
    });

  }
}

customElements.define('screen-share', WCScreenShare);

/**
 * Custom Video Element
 * The goal is to create an element that works just like the video element
 * but can be extended/sub-classed, because native elements cannot be
 * extended today across browsers.
 */

const template = document.createElement('template');
// Could you get styles to apply by passing a global button from global to shadow?

template.innerHTML = `
<style>
  :host {
    /* Supposed to reset styles. Need to understand the specific effects more */
    all: initial;

    /* display:inline (like the native el) makes it so you can't fill
      the container with the native el */
    display: inline-block;
    box-sizing: border-box;
    position: relative;

    /* Same default widths as the native el */
    width: 300px;
    height: 150px;
  }

  video {
    /* Fill the continer */
    width: 100%;
    height: 100%;
  }
</style>
`;

class CustomVideoElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    const nativeEl = (this.nativeEl = document.createElement('video'));

    // Initialize all the attribute properties
    Array.prototype.forEach.call(this.attributes, attrNode => {
      this.attributeChangedCallback(attrNode.name, null, attrNode.value);
    });

    // Neither Chrome or Firefox support setting the muted attribute
    // after using document.createElement.
    // One way to get around this would be to build the native tag as a string.
    // But just fixing it manually for now.
    // Apparently this may also be an issue with <input checked> for buttons
    if (nativeEl.defaultMuted) {
      nativeEl.muted = true;
    }

    this.shadowRoot.appendChild(nativeEl);
  }

  // observedAttributes is required to trigger attributeChangedCallback
  // for any attributes on the custom element.
  // Attributes need to be the lowercase word, e.g. crossorigin, not crossOrigin
  static get observedAttributes() {
    let attrs = [];

    // Instead of manually creating a list of all observed attributes,
    // observe any getter/setter prop name (lowercased)
    Object.getOwnPropertyNames(this.prototype).forEach(propName => {
      let isFunc = false;

      // Non-func properties throw errors because it's not an instance
      try {
        if (typeof this.prototype[propName] === 'function') {
          isFunc = true;
        }
      } catch (e) {}

      // Exclude functions and constants
      if (!isFunc && propName !== propName.toUpperCase()) {
        attrs.push(propName.toLowerCase());
      }
    });

    // Include any attributes from the super class (recursive)
    const supAttrs = Object.getPrototypeOf(this).observedAttributes;

    if (supAttrs) {
      attrs = attrs.concat(supAttrs);
    }

    return attrs;
  }

  // We need to handle sub-class custom attributes differently from
  // attrs meant to be passed to the internal native el.
  attributeChangedCallback(attrName, oldValue, newValue) {
    // Find the matching prop for custom attributes
    const ownProps = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
    const propName = arrayFindAnyCase(ownProps, attrName);

    // Check if this is the original custom native elemnt or a subclass
    const isBaseElement =
      Object.getPrototypeOf(this.constructor)
        .toString()
        .indexOf('function HTMLElement') === 0;

    // If this is a subclass custom attribute we want to set the
    // matching property on the subclass
    if (propName && !isBaseElement) {
      // Boolean props should never start as null
      if (typeof this[propName] == 'boolean') {
        // null is returned when attributes are removed i.e. boolean attrs
        if (newValue === null) {
          this[propName] = false;
        } else {
          // The new value might be an empty string, which is still true
          // for boolean attributes
          this[propName] = true;
        }
      } else {
        this[propName] = newValue;
      }
    } else {
      // When this is the original Custom Element, or the subclass doesn't
      // have a matching prop, pass it through.
      if (newValue === null) {
        this.nativeEl.removeAttribute(attrName);
      } else {
        // Ignore a few that don't need to be passed through just in case
        // it creates unexpected behavior.
        if (['id', 'class'].indexOf(attrName) === -1) {
          this.nativeEl.setAttribute(attrName, newValue);
        }
      }
    }
  }
}

// Map all native element properties to the custom element
// so that they're applied to the native element.
// Skipping HTMLElement because of things like "attachShadow"
// causing issues. Most of those props still need to apply to
// the custom element.
// But includign EventTarget props because most events emit from
// the native element.
let nativeElProps = [];

// Can't check typeof directly on element prototypes without
// throwing Illegal Invocation errors, so creating an element
// to check on instead.
const nativeElTest = document.createElement('video');

// Deprecated props throw warnings if used, so exclude them
const deprecatedProps = [
  'webkitDisplayingFullscreen',
  'webkitSupportsFullscreen',
];

// Walk the prototype chain up to HTMLElement.
// This will grab all super class props in between.
// i.e. VideoElement and MediaElement
for (
  let proto = Object.getPrototypeOf(nativeElTest);
  proto && proto !== HTMLElement.prototype;
  proto = Object.getPrototypeOf(proto)
) {
  Object.keys(proto).forEach(key => {
    if (deprecatedProps.indexOf(key) === -1) {
      nativeElProps.push(key);
    }
  });
}

// For the video element we also want to pass through all event listeners
// because all the important events happen there.
nativeElProps = nativeElProps.concat(Object.keys(EventTarget.prototype));

// Passthrough native el functions from the custom el to the native el
nativeElProps.forEach(prop => {
  const type = typeof nativeElTest[prop];

  if (type == 'function') {
    // Function
    CustomVideoElement.prototype[prop] = function() {
      return this.nativeEl[prop].apply(this.nativeEl, arguments);
    };
  } else {
    // Getter
    let config = {
      get() {
        return this.nativeEl[prop];
      },
    };

    if (prop !== prop.toUpperCase()) {
      // Setter (not a CONSTANT)
      config.set = function(val) {
        this.nativeEl[prop] = val;
      };
    }

    Object.defineProperty(CustomVideoElement.prototype, prop, config);
  }
});

function arrayFindAnyCase(arr, word) {
  let found = null;

  arr.forEach(item => {
    if (item.toLowerCase() == word.toLowerCase()) {
      found = item;
    }
  });

  return found;
}

if (!window.customElements.get('custom-video')) {
  window.customElements.define('custom-video', CustomVideoElement);
  window.CustomVideoElement = CustomVideoElement;
}

var dash3_2_2_all_min = createCommonjsModule(function (module) {
/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */
/*! v3.2.2-27f4eb3d, 2021-04-13T07:06:26Z */

});

unwrapExports(dash3_2_2_all_min);

/* << Copyright 2022 Iñigo Tamayo Uria, Ana Domínguez Fanlo, Mikel Joseba Zorrilla Berasategui, Héctor Rivas Pagador, Sergio Cabrero Barros, Juan Felipe Mogollón Rodríguez and Stefano Masneri. >>
This file is part of Orkestralib.
Orkestralib is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Orkestralib is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public License along with Orkestralib. If not, see <https://www.gnu.org/licenses/>. */

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
    this.load();
    if (this._log && this._log === "true") {
      this.initDebug();
    }
  }

  disconnectedCallback() {
    this.logIntervalId && clearInterval(this.logIntervalId);
  }
}

if (!window.customElements.get("dash-video")) {
  window.customElements.define("dash-video", DASHVideoElement);
  window.DASHVideoElement = DASHVideoElement;
}

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    DASHVideoElement: DASHVideoElement
});

exports.Byname = Byname;
exports.Bytimeline = Bytimeline;
exports.CustomLayout = CustomLayout;
exports.DASHVideoElement = index;
exports.Divided = Divided;
exports.EditLayout = EditLayout;
exports.Explicit = Explicit;
exports.FullScreen = FullScreen;
exports.JanusClient = JanusClient;
exports.JanusPublish = JanusPublish;
exports.KeyPress = KeyPress;
exports.Logger = Logger;
exports.Mosaic = Mosaic;
exports.Obj = Obj;
exports.ObjectSync = ObjectSync;
exports.Orkestra = Orkestra;
exports.PipGrid = PipGrid;
exports.Simple = Simple;
exports.Tabs = Tabs;
exports.TextData = TextData;
exports.UI = UI;
exports.URI = URI;
exports.UserData = UserData;
exports.UserPref = UserPref;
exports.WCAppTable = WCAppTable;
exports.WCScreenShare = WCScreenShare;
exports.WCTimer = WCTimer;
exports.WCUserTable = WCUserTable;
exports.WCWebrtcPublisher = WCWebrtcPublisher;
exports.XMedia = XMedia;