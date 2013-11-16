jBone.support = {};

jBone.extend = function(target) {
    [].splice.call(arguments, 1).forEach(function(object) {
      for (var prop in object) {
        target[prop] = object[prop];
      }
    });

    return target;
};

jBone.fn.data = function(key, value) {
    if (arguments.length === 0) {
        return jBone.extend({}, this[0].dataset, this[0].jdata);
    }

    if (arguments.length === 2) {
        return this[0].dataset[key] || this[0].jdata && this[0].jdata[key];
    }

    if (value instanceof Object) {
        this.forEach(function(el) {
            el.jdata = el.jdata || {};
            el.jdata[key] = value;
        });
    } else {
        this.forEach(function(el) {
            el.dataset[key] = value;
        });
    }

    return this;
};

jBone.fn.each = function(fn) {
    var length = this.length >>> 0,
        i = -1;

    while (++i < length) {
        if (i in this) {
            fn.call(this, i, this[i]);
        }
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
