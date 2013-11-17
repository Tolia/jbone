jBone.fn.each = function(fn) {
    var length = this.length >>> 0,
        i = -1;

    while (++i < length) {
        if (i in this) {
            fn.call(this[i], i, this[i]);
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

jBone.fn.height = function(value) {
    if (value !== undefined) {
        this.forEach(function(el) {
            el.style.height = value;
        });

        return this;
    }

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

jBone.fn.parents = function(selector) {
    var result = [], parents, target;

    if (selector) {
        parents = jBone(selector);

        parents.forEach(function(parent) {
            this.forEach(function(el) {
                if ((target = jBone.contains(jBone(parent), el)) && target.nodeType !== 9 && !~result.indexOf(target)) {
                    result.push(target);
                }
            });
        }, this);
    } else {
        this.forEach(function(el) {
            target = el;

            while ((target = target.parentNode) && target.nodeType !== 9) {
                if (!~result.indexOf(target)) {
                    result.push(target);
                }
            }
        });
    }

    return jBone(result);
};

jBone.fn.children = function() {
    var result = [];

    this.forEach(function(el) {
        [].forEach.call(el.childNodes, function(el) {
            if (el.nodeType !== 3) {
                result.push(el);
            }
        });
    });

    return jBone(result);
};

jBone.fn.not = function(condition) {
    var result = [];

    result = this.filter(function(el) {
        return el !== condition;
    });

    return jBone(result);
};

jBone.fn.focus = function() {
    return this.trigger("focus");
};

jBone.fn.siblings = function(includeSelf) {
    var result = [], parent;

    this.forEach(function(el) {
        if (parent = el.parentNode) {
            [].forEach.call(el.parentNode.childNodes, function(node) {
                if (includeSelf === undefined && node !== el && node.nodeType !== 3) {
                    result.push(node);
                } else if (includeSelf === true && node.nodeType !== 3) {
                    result.push(node);
                }
            });
        }
    });

    return jBone(result);
};

jBone.fn.next = function() {
    var result = [],
        siblings, index;

    this.forEach(function(el) {
        siblings = jBone(el).siblings(true),
        index = [].indexOf.call(siblings, el);

        if (index !== siblings.length) {
            result.push(siblings[index + 1]);
        }
    }, this);

    return jBone(result);
};


jBone.fn.prev = function() {
    var result = [],
        siblings, index;

    this.forEach(function(el) {
        siblings = jBone(el).siblings(true),
        index = [].indexOf.call(siblings, el);

        if (index > 0) {
            result.push(siblings[index - 1]);
        }
    }, this);

    return jBone(result);
};

jBone.fn.first = function() {
    return this.eq(0);
};

jBone.fn.last = function() {
    return this.eq(this.length - 1);
};

jBone.fn.index = function(element) {
    if (element instanceof jBone) {
        element = element[0];
    }

    if (element instanceof HTMLElement) {
        return this.indexOf(element);
    }
};

jBone.fn.is = function(match) {
    match = match.split(", ");

    return this.some(function(el) {
        return match.some(function(match) {
            // check attribute
            if (match[0] === ":") {
                return el.getAttribute(match.split(":")[1]) !== null;
            }
            // check class
            else if (match[0] === ".") {
                return el.classList.contains(match.split(".")[1]);
            }
            // check tagName
            else if (el.tagName.toLowerCase() === match) {
                return true;
            }
        });
    });
};

jBone.fn.bind = jBone.fn.on;

jBone.camelCase = function(string) {
    return string.replace(/-([\da-z])/gi, function(all, letter) {
        return letter.toUpperCase();
    });
};

jBone.proxy = function(fn, context) {
    return fn.bind(context);
};

jBone.support = {};
