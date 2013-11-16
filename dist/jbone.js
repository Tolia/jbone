/*!
 * jBone v0.0.12 - 2013-11-16 - Library for DOM manipulation
 *
 * https://github.com/kupriyanenko/jbone
 *
 * Copyright 2013 Alexey Kupriyanenko
 * Released under the MIT license.
 */

(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        root.jBone = root.$ = factory();
    }
}(this, function () {
var
// Match a standalone tag
rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

// A simple way to check for HTML strings
// Prioritize #id over <tag> to avoid XSS via location.hash
rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

jBone = function(element, data) {
    if (this instanceof jBone) {
        return init.call(this, element, data);
    } else {
        return new jBone(element, data);
    }
},

init = function(element, data) {
    var elements;

    if (typeof element === "function") {
        element();
    } else if (element instanceof jBone) {
        return element;
    } else if (Array.isArray(element)) {
        elements = element.map(function(el) {
            return getElement(el, data);
        });
    } else if (element) {
        elements = getElement(element, data);
    }

    if (elements instanceof jBone) {
        return elements;
    }

    if (!elements) {
        return this;
    }

    elements = Array.isArray(elements) ? elements : [elements];
    jBone.merge(this, elements);

    if (data instanceof Object && !jBone.isElement(data)) {
        this.attr(data);
    }

    return this;
},

getElement = function(element, context) {
    var tag, wraper;

    if (typeof element === "string" && (tag = rsingleTag.exec(element))) {
        return document.createElement(tag[1]);
    } else if (typeof element === "string" && (tag = rquickExpr.exec(element)) && tag[1]) {
        wraper = document.createElement("div");
        wraper.innerHTML = element;
        return [].slice.call(wraper.childNodes);
    } else if (typeof element === "string") {
        if (jBone.isElement(context)) {
            return jBone(context).find(element);
        }

        try {
            return [].slice.call(document.querySelectorAll(element));
        } catch (e) {
            return [];
        }
    }

    return element;
};

jBone.setId = function(el) {
    var jid = el.jid || undefined;

    if (el === window) {
        jid = "window";
    } else if (!el.jid) {
        jid = ++jBone._cache.jid;
        el.jid = jid;
    }

    if (!jBone._cache.events[jid]) {
        jBone._cache.events[jid] = {};
    }
};

jBone.getData = function(el) {
    el = el instanceof jBone ? el[0] : el;

    var jid = el === window ? "window" : el.jid;

    return {
        jid: jid,
        events: jBone._cache.events[jid]
    };
};

jBone.isElement = function(el) {
    return el instanceof jBone || el instanceof HTMLElement || typeof el === "string";
};

jBone.merge = function(first, second) {
    var l = second.length,
        i = first.length,
        j = 0;

    if (typeof l === "number") {
        while (j < l) {
            first[i++] = second[j];
            j++;
        }
    } else {
        while (second[j] !== undefined) {
            first[i++] = second[j++];
        }
    }

    first.length = i;

    return first;
};

jBone.contains = function(container, contained) {
    var search, result;

    search = function(el, element) {
        if (el === element) {
            return result = el;
        }
        if (!el.parentNode) {
            return;
        }

        search(el.parentNode, element);
    };

    container.forEach(function(element) {
        search(contained.parentNode, element);
    });

    return result;
};

jBone._cache = {
    events: {},
    jid: 0
};

jBone.fn = jBone.prototype = [];

jBone.Event = function(event) {
    var namespace, eventType;

    namespace = event.split(".").splice(1).join(".");
    eventType = event.split(".")[0];

    event = document.createEvent("Event");
    event.initEvent(eventType, true, true);

    event.namespace = namespace;
    event.isDefaultPrevented = function() {
        return event.defaultPrevented;
    };

    return event;
};

jBone.fn.on = function(event) {
    var callback, target, namespace, fn, events, expectedTarget, eventType;

    if (arguments.length === 2) {
        callback = arguments[1];
    } else {
        target = arguments[1], callback = arguments[2];
    }

    this.forEach(function(el) {
        jBone.setId(el);
        events = jBone.getData(el).events;
        event.split(" ").forEach(function(event) {
            eventType = event.split(".")[0];
            namespace = event.split(".").splice(1).join(".");
            events[eventType] = events[eventType] ? events[eventType] : [];

            fn = function(e) {
                if (e.namespace && e.namespace !== namespace) {
                    return;
                }

                if (!target) {
                    callback.call(el, e);
                } else {
                    if (~jBone(el).find(target).indexOf(e.target)) {
                        callback.call(e.target, e);
                    } else if (expectedTarget = jBone.contains(jBone(el).find(target), e.target)) {
                        callback.call(e.target, e);
                    }
                }
            };

            events[eventType].push({
                namespace: namespace,
                fn: fn,
                originfn: callback
            });

            if (el.addEventListener) {
                el.addEventListener(eventType, fn, false);
            }
        });
    });

    return this;
};

jBone.fn.one = function() {
    var event = arguments[0], callback, target;

    if (arguments.length === 2) {
        callback = arguments[1];
    } else {
        target = arguments[1], callback = arguments[2];
    }

    this.forEach(function(el) {
        event.split(" ").forEach(function(event) {
            var fn = function(e) {
                callback.call(el, e);
                jBone(el).off(event, fn);
            };

            if (arguments.length === 2) {
                jBone(el).on(event, fn);
            } else {
                jBone(el).on(event, target, fn);
            }
        });
    });

    return this;
};

jBone.fn.trigger = function(event) {
    var events = [];

    if (!event) {
        return this;
    }

    if (typeof event === "string") {
        events = event.split(" ").map(function(event) {
            return $.Event(event);
        });
    } else {
        events = [event];
    }

    this.forEach(function(el) {
        events.forEach(function(event) {
            if (!event.type) {
                return;
            }

            if (el.dispatchEvent) {
                el.dispatchEvent(event);
            }
        });
    });

    return this;
};

jBone.fn.off = function(event, fn) {
    var events, callback, namespace, eventType,
        getCallback = function(e) {
            if (fn && e.originfn === fn) {
                return e.fn;
            } else if (!fn) {
                return e.fn;
            }
        };

    this.forEach(function(el) {
        events = jBone.getData(el).events;

        if (!events) {
            return;
        }

        event.split(" ").forEach(function(event) {
            eventType = event.split(".")[0];
            namespace = event.split(".").splice(1).join(".");

            // remove named events
            if (events[eventType]) {
                events[eventType].forEach(function(e) {
                    callback = getCallback(e);
                    if (namespace) {
                        if (e.namespace === namespace) {
                            el.removeEventListener(eventType, callback);
                        }
                    } else if (!namespace) {
                        el.removeEventListener(eventType, callback);
                    }
                });
            }
            // remove namespaced events
            else if (namespace) {
                Object.keys(events).forEach(function(key) {
                    events[key].forEach(function(e) {
                        callback = getCallback(e);
                        if (e.namespace === namespace) {
                            el.removeEventListener(key, callback);
                        }
                    });
                });
            }
        });
    });

    return this;
};

jBone.fn.find = function(selector) {
    var results = [];

    this.forEach(function(el) {
        [].forEach.call(el.querySelectorAll(selector), function(finded) {
            results.push(finded);
        });
    });

    return jBone(results);
};

jBone.fn.get = function(index) {
    return this[index];
};

jBone.fn.eq = function(index) {
    return jBone(this[index]);
};

jBone.fn.parent = function() {
    var results = [];

    this.forEach(function(el) {
        if (!~results.indexOf(el.parentNode)) {
            results.push(el.parentNode);
        }
    });

    return jBone(results);
};

jBone.fn.toArray = function() {
    return [].slice.call(this);
};

jBone.fn.is = function() {
    var args = arguments;

    return this.some(function(el) {
        return el.tagName.toLowerCase() === args[0];
    });
};

jBone.fn.has = function() {
    var args = arguments;

    return this.some(function(el) {
        return el.querySelectorAll(args[0]).length;
    });
};

jBone.fn.attr = function() {
    var args = arguments;

    if (typeof args[0] === "string" && args.length === 1) {
        return this[0].getAttribute(args[0]);
    } else if (typeof args[0] === "string" && args.length > 1) {
        this.forEach(function(el) {
            el.setAttribute(args[0], args[1]);
        });
    } else if (args[0] instanceof Object) {
        this.forEach(function(el) {
            Object.keys(args[0]).forEach(function(key) {
                el.setAttribute(key, args[0][key]);
            });
        });
    }

    return this;
};

jBone.fn.val = function(value) {
    if (arguments.length === 0) {
        return this[0].value;
    }

    this.forEach(function(el) {
        el.value = value;
    });

    return this;
};

jBone.fn.css = function() {
    var args = arguments;

    if (typeof args[0] === "string" && args.length === 2) {
        this.forEach(function(el) {
            el.style[args[0]] = args[1];
        });
    } else if (args[0] instanceof Object) {
        this.forEach(function(el) {
            Object.keys(args[0]).forEach(function(key) {
                el.style[key] = args[0][key];
            });
        });
    }

    return this;
};

jBone.fn.html = function() {
    var value = arguments[0], result;

    // add HTML into elements
    if (value !== undefined) {
        this.empty.call(this);

        if (!(value instanceof Object) && !rquickExpr.exec(value)) {
            this.forEach(function(el) {
                if (el instanceof HTMLElement) {
                    el.innerHTML = value;
                }
            });
        } else {
            this.append.call(this, value);
        }

        return this;
    }
    // get HTML from element
    else {
        result = [];

        this.forEach(function(el) {
            if (el instanceof HTMLElement) {
                result.push(el.innerHTML);
            }
        });

        return result.length ? result.join("") : null;
    }
};

jBone.fn.append = function(appended) {
    if (typeof appended === "string") {
        appended = jBone(appended);
    }

    if (appended instanceof jBone) {
        this.forEach(function(el, i) {
            appended.forEach(function(jel) {
                if (!i) {
                    el.appendChild(jel);
                } else {
                    el.appendChild(jel.cloneNode());
                }
            });
        });
    } else if (appended instanceof HTMLElement || appended instanceof DocumentFragment) {
        this.forEach(function(el) {
            el.appendChild(appended);
        });
    }

    return this;
};

jBone.fn.appendTo = function(to) {
    jBone(to).append(this);

    return this;
};

jBone.fn.empty = function() {
    this.forEach(function(el) {
        while (el.hasChildNodes()) {
            el.removeChild(el.lastChild);
        }
    });

    return this;
};

jBone.fn.remove = function() {
    this.forEach(function(el) {
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    });

    return this;
};

jBone.support = {};

jBone.extend = function(target) {
    var objects;

    objects = [].splice.call(arguments, 1);

    objects.forEach(function(object) {
      for (var prop in object) {
        target[prop] = object[prop];
      }
    });

    return target;
};

jBone.fn.each = function(fn) {
    var length, i;

    length = this.length >>> 0;
    i = -1;

    while (++i < length) {
        if (i in this) {
            fn.call(this, i, this[i]);
        }
    }

    return this;
};

jBone.fn.data = function(key, value) {
    if (arguments.length === 0) {
        return jBone.extend({}, this[0].dataset, this[0].datajbone);
    }

    if (value instanceof Object) {
        this.forEach(function(el) {
            el.datajbone = el.datajbone || {};
            el.datajbone[key] = value;
        });
    } else if (value !== undefined) {
        this.forEach(function(el) {
            el.dataset[key] = value;
        });
    } else {
        return this[0].dataset[key] || this[0].datajbone && this[0].datajbone[key];
    }

    return this;
};

jBone.fn.prop = function(name, value) {
    var result;

    if (arguments.length === 1) {
        this.some(function(el) {
            if (name === "checked") {
                return result = el.checked;
            }

            return result = el.getAttribute(name);
        });

        return result;
    } else if (arguments.length === 2) {
        this.forEach(function(el) {
            el.setAttribute(name, value);
        });
    }

    return this;
};

jBone.fn.hasClass = function(className) {
    return this.some(function(el) {
        return el.classList.contains(className);
    });
};

jBone.fn.removeClass = function(className) {
    this.forEach(function(el) {
        el.classList.remove(className);
    });

    return this;
};

jBone.fn.addClass = function(className) {
    this.forEach(function(el) {
        el.classList.add(className);
    });

    return this;
};

jBone.fn.toggleClass = function(className) {
    this.forEach(function(el) {
        el.classList.toggle(className);
    });

    return this;
};

jBone.fn.click = function() {
    return this.trigger("click");
};

jBone.fn.height = function() {
    return this[0].clientHeight;
};

jBone.fn.removeAttr = function(name) {
    this.forEach(function(el) {
        el.removeAttribute(name);
    });
};

jBone.fn.closest = function(selector) {
    var parents, target, result;

    parents = jBone(selector);
    target = this[0];

    parents.some(function(parent) {
        return result = jBone.contains(jBone(parent), target);
    });

    return jBone(result);
};

jBone.fn.children = function() {
    var result = [];

    this.forEach(function(el) {
        if (el.childNodes) {
            result = result.concat([].slice.call(el.childNodes));
        }
    });

    return result;
};

jBone.fn.not = function(condition) {
    var result = [];

    result = this.filter(function(el) {
        return el !== condition;
    });

    return jBone(result);
};

window.jBone = window.$ = jBone;

return jBone;
}));
