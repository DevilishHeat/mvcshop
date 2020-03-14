(function (factory) {
    typeof define === 'function' && define.amd ? define('index', factory) :
    factory();
}((function () { 'use strict';

    /*!
     * @copyright Copyright (c) 2017 IcoMoon.io
     * @license   Licensed under MIT license
     *            See https://github.com/Keyamoon/svgxuse
     * @version   1.2.6
     */
    /*jslint browser: true */
    /*global XDomainRequest, MutationObserver, window */
    (function () {
        if (typeof window !== "undefined" && window.addEventListener) {
            var cache = Object.create(null); // holds xhr objects to prevent multiple requests
            var checkUseElems;
            var tid; // timeout id
            var debouncedCheck = function () {
                clearTimeout(tid);
                tid = setTimeout(checkUseElems, 100);
            };
            var unobserveChanges = function () {
                return;
            };
            var observeChanges = function () {
                var observer;
                window.addEventListener("resize", debouncedCheck, false);
                window.addEventListener("orientationchange", debouncedCheck, false);
                if (window.MutationObserver) {
                    observer = new MutationObserver(debouncedCheck);
                    observer.observe(document.documentElement, {
                        childList: true,
                        subtree: true,
                        attributes: true
                    });
                    unobserveChanges = function () {
                        try {
                            observer.disconnect();
                            window.removeEventListener("resize", debouncedCheck, false);
                            window.removeEventListener("orientationchange", debouncedCheck, false);
                        } catch (ignore) {}
                    };
                } else {
                    document.documentElement.addEventListener("DOMSubtreeModified", debouncedCheck, false);
                    unobserveChanges = function () {
                        document.documentElement.removeEventListener("DOMSubtreeModified", debouncedCheck, false);
                        window.removeEventListener("resize", debouncedCheck, false);
                        window.removeEventListener("orientationchange", debouncedCheck, false);
                    };
                }
            };
            var createRequest = function (url) {
                // In IE 9, cross origin requests can only be sent using XDomainRequest.
                // XDomainRequest would fail if CORS headers are not set.
                // Therefore, XDomainRequest should only be used with cross origin requests.
                function getOrigin(loc) {
                    var a;
                    if (loc.protocol !== undefined) {
                        a = loc;
                    } else {
                        a = document.createElement("a");
                        a.href = loc;
                    }
                    return a.protocol.replace(/:/g, "") + a.host;
                }
                var Request;
                var origin;
                var origin2;
                if (window.XMLHttpRequest) {
                    Request = new XMLHttpRequest();
                    origin = getOrigin(location);
                    origin2 = getOrigin(url);
                    if (Request.withCredentials === undefined && origin2 !== "" && origin2 !== origin) {
                        Request = XDomainRequest || undefined;
                    } else {
                        Request = XMLHttpRequest;
                    }
                }
                return Request;
            };
            var xlinkNS = "http://www.w3.org/1999/xlink";
            checkUseElems = function () {
                var base;
                var bcr;
                var hash;
                var href;
                var i;
                var inProgressCount = 0;
                var isHidden;
                var Request;
                var url;
                var uses;
                var xhr;
                function observeIfDone() {
                    // If done with making changes, start watching for chagnes in DOM again
                    inProgressCount -= 1;
                    if (inProgressCount === 0) { // if all xhrs were resolved
                        unobserveChanges(); // make sure to remove old handlers
                        observeChanges(); // watch for changes to DOM
                    }
                }
                function attrUpdateFunc(spec) {
                    return function () {
                        if (cache[spec.base] !== true) {
                            spec.useEl.setAttributeNS(xlinkNS, "xlink:href", "#" + spec.hash);
                            if (spec.useEl.hasAttribute("href")) {
                                spec.useEl.setAttribute("href", "#" + spec.hash);
                            }
                        }
                    };
                }
                function onloadFunc(xhr) {
                    return function () {
                        var body = document.body;
                        var x = document.createElement("x");
                        var svg;
                        xhr.onload = null;
                        x.innerHTML = xhr.responseText;
                        svg = x.getElementsByTagName("svg")[0];
                        if (svg) {
                            svg.setAttribute("aria-hidden", "true");
                            svg.style.position = "absolute";
                            svg.style.width = 0;
                            svg.style.height = 0;
                            svg.style.overflow = "hidden";
                            body.insertBefore(svg, body.firstChild);
                        }
                        observeIfDone();
                    };
                }
                function onErrorTimeout(xhr) {
                    return function () {
                        xhr.onerror = null;
                        xhr.ontimeout = null;
                        observeIfDone();
                    };
                }
                unobserveChanges(); // stop watching for changes to DOM
                // find all use elements
                uses = document.getElementsByTagName("use");
                for (i = 0; i < uses.length; i += 1) {
                    try {
                        bcr = uses[i].getBoundingClientRect();
                    } catch (ignore) {
                        // failed to get bounding rectangle of the use element
                        bcr = false;
                    }
                    href = uses[i].getAttribute("href")
                            || uses[i].getAttributeNS(xlinkNS, "href")
                            || uses[i].getAttribute("xlink:href");
                    if (href && href.split) {
                        url = href.split("#");
                    } else {
                        url = ["", ""];
                    }
                    base = url[0];
                    hash = url[1];
                    isHidden = bcr && bcr.left === 0 && bcr.right === 0 && bcr.top === 0 && bcr.bottom === 0;
                    if (bcr && bcr.width === 0 && bcr.height === 0 && !isHidden) {
                        if (uses[i].hasAttribute("href")) {
                            uses[i].setAttributeNS(xlinkNS, "xlink:href", href);
                        }
                        if (base.length) {
                            // schedule updating xlink:href
                            xhr = cache[base];
                            if (xhr !== true) {
                                // true signifies that prepending the SVG was not required
                                setTimeout(attrUpdateFunc({
                                    useEl: uses[i],
                                    base: base,
                                    hash: hash
                                }), 0);
                            }
                            if (xhr === undefined) {
                                Request = createRequest(base);
                                if (Request !== undefined) {
                                    xhr = new Request();
                                    cache[base] = xhr;
                                    xhr.onload = onloadFunc(xhr);
                                    xhr.onerror = onErrorTimeout(xhr);
                                    xhr.ontimeout = onErrorTimeout(xhr);
                                    xhr.open("GET", base);
                                    xhr.send();
                                    inProgressCount += 1;
                                }
                            }
                        }
                    } else {
                        if (!isHidden) {
                            if (cache[base] === undefined) {
                                // remember this URL if the use element was not empty and no request was sent
                                cache[base] = true;
                            } else if (cache[base].onload) {
                                // if it turns out that prepending the SVG is not necessary,
                                // abort the in-progress xhr.
                                cache[base].abort();
                                delete cache[base].onload;
                                cache[base] = true;
                            }
                        } else if (base.length && cache[base]) {
                            setTimeout(attrUpdateFunc({
                                useEl: uses[i],
                                base: base,
                                hash: hash
                            }), 0);
                        }
                    }
                }
                uses = "";
                inProgressCount += 1;
                observeIfDone();
            };
            var winLoad;
            winLoad = function () {
                window.removeEventListener("load", winLoad, false); // to prevent memory leaks
                tid = setTimeout(checkUseElems, 0);
            };
            if (document.readyState !== "complete") {
                // The load event fires when all resources have finished loading, which allows detecting whether SVG use elements are empty.
                window.addEventListener("load", winLoad, false);
            } else {
                // No need to add a listener if the document is already loaded, initialize immediately.
                winLoad();
            }
        }
    }());

    /*! npm.im/object-fit-images 3.2.4 */

    var OFI = 'bfred-it:object-fit-images';
    var propRegex = /(object-fit|object-position)\s*:\s*([-.\w\s%]+)/g;
    var testImg = typeof Image === 'undefined' ? {style: {'object-position': 1}} : new Image();
    var supportsObjectFit = 'object-fit' in testImg.style;
    var supportsObjectPosition = 'object-position' in testImg.style;
    var supportsOFI = 'background-size' in testImg.style;
    var supportsCurrentSrc = typeof testImg.currentSrc === 'string';
    var nativeGetAttribute = testImg.getAttribute;
    var nativeSetAttribute = testImg.setAttribute;
    var autoModeEnabled = false;

    function createPlaceholder(w, h) {
    	return ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + h + "'%3E%3C/svg%3E");
    }

    function polyfillCurrentSrc(el) {
    	if (el.srcset && !supportsCurrentSrc && window.picturefill) {
    		var pf = window.picturefill._;
    		// parse srcset with picturefill where currentSrc isn't available
    		if (!el[pf.ns] || !el[pf.ns].evaled) {
    			// force synchronous srcset parsing
    			pf.fillImg(el, {reselect: true});
    		}

    		if (!el[pf.ns].curSrc) {
    			// force picturefill to parse srcset
    			el[pf.ns].supported = false;
    			pf.fillImg(el, {reselect: true});
    		}

    		// retrieve parsed currentSrc, if any
    		el.currentSrc = el[pf.ns].curSrc || el.src;
    	}
    }

    function getStyle(el) {
    	var style = getComputedStyle(el).fontFamily;
    	var parsed;
    	var props = {};
    	while ((parsed = propRegex.exec(style)) !== null) {
    		props[parsed[1]] = parsed[2];
    	}
    	return props;
    }

    function setPlaceholder(img, width, height) {
    	// Default: fill width, no height
    	var placeholder = createPlaceholder(width || 1, height || 0);

    	// Only set placeholder if it's different
    	if (nativeGetAttribute.call(img, 'src') !== placeholder) {
    		nativeSetAttribute.call(img, 'src', placeholder);
    	}
    }

    function onImageReady(img, callback) {
    	// naturalWidth is only available when the image headers are loaded,
    	// this loop will poll it every 100ms.
    	if (img.naturalWidth) {
    		callback(img);
    	} else {
    		setTimeout(onImageReady, 100, img, callback);
    	}
    }

    function fixOne(el) {
    	var style = getStyle(el);
    	var ofi = el[OFI];
    	style['object-fit'] = style['object-fit'] || 'fill'; // default value

    	// Avoid running where unnecessary, unless OFI had already done its deed
    	if (!ofi.img) {
    		// fill is the default behavior so no action is necessary
    		if (style['object-fit'] === 'fill') {
    			return;
    		}

    		// Where object-fit is supported and object-position isn't (Safari < 10)
    		if (
    			!ofi.skipTest && // unless user wants to apply regardless of browser support
    			supportsObjectFit && // if browser already supports object-fit
    			!style['object-position'] // unless object-position is used
    		) {
    			return;
    		}
    	}

    	// keep a clone in memory while resetting the original to a blank
    	if (!ofi.img) {
    		ofi.img = new Image(el.width, el.height);
    		ofi.img.srcset = nativeGetAttribute.call(el, "data-ofi-srcset") || el.srcset;
    		ofi.img.src = nativeGetAttribute.call(el, "data-ofi-src") || el.src;

    		// preserve for any future cloneNode calls
    		// https://github.com/bfred-it/object-fit-images/issues/53
    		nativeSetAttribute.call(el, "data-ofi-src", el.src);
    		if (el.srcset) {
    			nativeSetAttribute.call(el, "data-ofi-srcset", el.srcset);
    		}

    		setPlaceholder(el, el.naturalWidth || el.width, el.naturalHeight || el.height);

    		// remove srcset because it overrides src
    		if (el.srcset) {
    			el.srcset = '';
    		}
    		try {
    			keepSrcUsable(el);
    		} catch (err) {
    			if (window.console) {
    				console.warn('https://bit.ly/ofi-old-browser');
    			}
    		}
    	}

    	polyfillCurrentSrc(ofi.img);

    	el.style.backgroundImage = "url(\"" + ((ofi.img.currentSrc || ofi.img.src).replace(/"/g, '\\"')) + "\")";
    	el.style.backgroundPosition = style['object-position'] || 'center';
    	el.style.backgroundRepeat = 'no-repeat';
    	el.style.backgroundOrigin = 'content-box';

    	if (/scale-down/.test(style['object-fit'])) {
    		onImageReady(ofi.img, function () {
    			if (ofi.img.naturalWidth > el.width || ofi.img.naturalHeight > el.height) {
    				el.style.backgroundSize = 'contain';
    			} else {
    				el.style.backgroundSize = 'auto';
    			}
    		});
    	} else {
    		el.style.backgroundSize = style['object-fit'].replace('none', 'auto').replace('fill', '100% 100%');
    	}

    	onImageReady(ofi.img, function (img) {
    		setPlaceholder(el, img.naturalWidth, img.naturalHeight);
    	});
    }

    function keepSrcUsable(el) {
    	var descriptors = {
    		get: function get(prop) {
    			return el[OFI].img[prop ? prop : 'src'];
    		},
    		set: function set(value, prop) {
    			el[OFI].img[prop ? prop : 'src'] = value;
    			nativeSetAttribute.call(el, ("data-ofi-" + prop), value); // preserve for any future cloneNode
    			fixOne(el);
    			return value;
    		}
    	};
    	Object.defineProperty(el, 'src', descriptors);
    	Object.defineProperty(el, 'currentSrc', {
    		get: function () { return descriptors.get('currentSrc'); }
    	});
    	Object.defineProperty(el, 'srcset', {
    		get: function () { return descriptors.get('srcset'); },
    		set: function (ss) { return descriptors.set(ss, 'srcset'); }
    	});
    }

    function hijackAttributes() {
    	function getOfiImageMaybe(el, name) {
    		return el[OFI] && el[OFI].img && (name === 'src' || name === 'srcset') ? el[OFI].img : el;
    	}
    	if (!supportsObjectPosition) {
    		HTMLImageElement.prototype.getAttribute = function (name) {
    			return nativeGetAttribute.call(getOfiImageMaybe(this, name), name);
    		};

    		HTMLImageElement.prototype.setAttribute = function (name, value) {
    			return nativeSetAttribute.call(getOfiImageMaybe(this, name), name, String(value));
    		};
    	}
    }

    function fix(imgs, opts) {
    	var startAutoMode = !autoModeEnabled && !imgs;
    	opts = opts || {};
    	imgs = imgs || 'img';

    	if ((supportsObjectPosition && !opts.skipTest) || !supportsOFI) {
    		return false;
    	}

    	// use imgs as a selector or just select all images
    	if (imgs === 'img') {
    		imgs = document.getElementsByTagName('img');
    	} else if (typeof imgs === 'string') {
    		imgs = document.querySelectorAll(imgs);
    	} else if (!('length' in imgs)) {
    		imgs = [imgs];
    	}

    	// apply fix to all
    	for (var i = 0; i < imgs.length; i++) {
    		imgs[i][OFI] = imgs[i][OFI] || {
    			skipTest: opts.skipTest
    		};
    		fixOne(imgs[i]);
    	}

    	if (startAutoMode) {
    		document.body.addEventListener('load', function (e) {
    			if (e.target.tagName === 'IMG') {
    				fix(e.target, {
    					skipTest: opts.skipTest
    				});
    			}
    		}, true);
    		autoModeEnabled = true;
    		imgs = 'img'; // reset to a generic selector for watchMQ
    	}

    	// if requested, watch media queries for object-fit change
    	if (opts.watchMQ) {
    		window.addEventListener('resize', fix.bind(null, imgs, {
    			skipTest: opts.skipTest
    		}));
    	}
    }

    fix.supportsObjectFit = supportsObjectFit;
    fix.supportsObjectPosition = supportsObjectPosition;

    hijackAttributes();

    var ofi_commonJs = fix;

    var objectFitImages = (function () {
      ofi_commonJs('img.object-fit');
    });

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var _core = createCommonjsModule(function (module) {
    var core = module.exports = { version: '2.6.11' };
    if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
    });
    var _core_1 = _core.version;

    var $JSON = _core.JSON || (_core.JSON = { stringify: JSON.stringify });
    var stringify = function stringify(it) { // eslint-disable-line no-unused-vars
      return $JSON.stringify.apply($JSON, arguments);
    };

    var stringify$1 = stringify;

    var autorization = (function () {
      var API = 'authorization';
      var $form = $('.js-autorization');
      var $submitBtn = $form.find('button[type="submit"]');
      $submitBtn.off('click.registration').on('click.registration', function (event) {
        event.preventDefault();

        var data = stringify$1($form.serializeArray());

        $.ajax({
          method: 'POST',
          url: "http://mvcshop.com/".concat(API),
          data: data
        });
      });
    });

    var registration = (function () {
      return console.log('henlo');
    });

    objectFitImages();
    autorization();
    registration();

})));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9zdmd4dXNlL3N2Z3h1c2UuanMiLCJub2RlX21vZHVsZXMvb2JqZWN0LWZpdC1pbWFnZXMvZGlzdC9vZmkuY29tbW9uLWpzLmpzIiwic3JjL2Fzc2V0cy9zY3JpcHRzL3BvbHlmaWxscy9vYmplY3RGaXRJbWFnZXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NvcmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL2pzb24vc3RyaW5naWZ5LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lLWNvcmVqczIvY29yZS1qcy9qc29uL3N0cmluZ2lmeS5qcyIsInNyYy9hc3NldHMvc2NyaXB0cy9tb2R1bGVzL2F1dG9yaXphdGlvbi5qcyIsInNyYy9hc3NldHMvc2NyaXB0cy9tb2R1bGVzL3JlZ2lzdHJhdGlvbi5qcyIsInNyYy9hc3NldHMvc2NyaXB0cy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE3IEljb01vb24uaW9cbiAqIEBsaWNlbnNlICAgTGljZW5zZWQgdW5kZXIgTUlUIGxpY2Vuc2VcbiAqICAgICAgICAgICAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9LZXlhbW9vbi9zdmd4dXNlXG4gKiBAdmVyc2lvbiAgIDEuMi42XG4gKi9cbi8qanNsaW50IGJyb3dzZXI6IHRydWUgKi9cbi8qZ2xvYmFsIFhEb21haW5SZXF1ZXN0LCBNdXRhdGlvbk9ic2VydmVyLCB3aW5kb3cgKi9cbihmdW5jdGlvbiAoKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgdmFyIGNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTsgLy8gaG9sZHMgeGhyIG9iamVjdHMgdG8gcHJldmVudCBtdWx0aXBsZSByZXF1ZXN0c1xuICAgICAgICB2YXIgY2hlY2tVc2VFbGVtcztcbiAgICAgICAgdmFyIHRpZDsgLy8gdGltZW91dCBpZFxuICAgICAgICB2YXIgZGVib3VuY2VkQ2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGlkKTtcbiAgICAgICAgICAgIHRpZCA9IHNldFRpbWVvdXQoY2hlY2tVc2VFbGVtcywgMTAwKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHVub2JzZXJ2ZUNoYW5nZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH07XG4gICAgICAgIHZhciBvYnNlcnZlQ2hhbmdlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlcjtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIGRlYm91bmNlZENoZWNrLCBmYWxzZSk7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm9yaWVudGF0aW9uY2hhbmdlXCIsIGRlYm91bmNlZENoZWNrLCBmYWxzZSk7XG4gICAgICAgICAgICBpZiAod2luZG93Lk11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGRlYm91bmNlZENoZWNrKTtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB1bm9ic2VydmVDaGFuZ2VzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZGVib3VuY2VkQ2hlY2ssIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwib3JpZW50YXRpb25jaGFuZ2VcIiwgZGVib3VuY2VkQ2hlY2ssIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoaWdub3JlKSB7fVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NU3VidHJlZU1vZGlmaWVkXCIsIGRlYm91bmNlZENoZWNrLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgdW5vYnNlcnZlQ2hhbmdlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJET01TdWJ0cmVlTW9kaWZpZWRcIiwgZGVib3VuY2VkQ2hlY2ssIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZGVib3VuY2VkQ2hlY2ssIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJvcmllbnRhdGlvbmNoYW5nZVwiLCBkZWJvdW5jZWRDaGVjaywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZhciBjcmVhdGVSZXF1ZXN0ID0gZnVuY3Rpb24gKHVybCkge1xuICAgICAgICAgICAgLy8gSW4gSUUgOSwgY3Jvc3Mgb3JpZ2luIHJlcXVlc3RzIGNhbiBvbmx5IGJlIHNlbnQgdXNpbmcgWERvbWFpblJlcXVlc3QuXG4gICAgICAgICAgICAvLyBYRG9tYWluUmVxdWVzdCB3b3VsZCBmYWlsIGlmIENPUlMgaGVhZGVycyBhcmUgbm90IHNldC5cbiAgICAgICAgICAgIC8vIFRoZXJlZm9yZSwgWERvbWFpblJlcXVlc3Qgc2hvdWxkIG9ubHkgYmUgdXNlZCB3aXRoIGNyb3NzIG9yaWdpbiByZXF1ZXN0cy5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldE9yaWdpbihsb2MpIHtcbiAgICAgICAgICAgICAgICB2YXIgYTtcbiAgICAgICAgICAgICAgICBpZiAobG9jLnByb3RvY29sICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgYSA9IGxvYztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgICAgICAgICAgICAgICAgIGEuaHJlZiA9IGxvYztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEucHJvdG9jb2wucmVwbGFjZSgvOi9nLCBcIlwiKSArIGEuaG9zdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBSZXF1ZXN0O1xuICAgICAgICAgICAgdmFyIG9yaWdpbjtcbiAgICAgICAgICAgIHZhciBvcmlnaW4yO1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5YTUxIdHRwUmVxdWVzdCkge1xuICAgICAgICAgICAgICAgIFJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICBvcmlnaW4gPSBnZXRPcmlnaW4obG9jYXRpb24pO1xuICAgICAgICAgICAgICAgIG9yaWdpbjIgPSBnZXRPcmlnaW4odXJsKTtcbiAgICAgICAgICAgICAgICBpZiAoUmVxdWVzdC53aXRoQ3JlZGVudGlhbHMgPT09IHVuZGVmaW5lZCAmJiBvcmlnaW4yICE9PSBcIlwiICYmIG9yaWdpbjIgIT09IG9yaWdpbikge1xuICAgICAgICAgICAgICAgICAgICBSZXF1ZXN0ID0gWERvbWFpblJlcXVlc3QgfHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIFJlcXVlc3QgPSBYTUxIdHRwUmVxdWVzdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUmVxdWVzdDtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHhsaW5rTlMgPSBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIjtcbiAgICAgICAgY2hlY2tVc2VFbGVtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlO1xuICAgICAgICAgICAgdmFyIGJjcjtcbiAgICAgICAgICAgIHZhciBmYWxsYmFjayA9IFwiXCI7IC8vIG9wdGlvbmFsIGZhbGxiYWNrIFVSTCBpbiBjYXNlIG5vIGJhc2UgcGF0aCB0byBTVkcgZmlsZSB3YXMgZ2l2ZW4gYW5kIG5vIHN5bWJvbCBkZWZpbml0aW9uIHdhcyBmb3VuZC5cbiAgICAgICAgICAgIHZhciBoYXNoO1xuICAgICAgICAgICAgdmFyIGhyZWY7XG4gICAgICAgICAgICB2YXIgaTtcbiAgICAgICAgICAgIHZhciBpblByb2dyZXNzQ291bnQgPSAwO1xuICAgICAgICAgICAgdmFyIGlzSGlkZGVuO1xuICAgICAgICAgICAgdmFyIFJlcXVlc3Q7XG4gICAgICAgICAgICB2YXIgdXJsO1xuICAgICAgICAgICAgdmFyIHVzZXM7XG4gICAgICAgICAgICB2YXIgeGhyO1xuICAgICAgICAgICAgZnVuY3Rpb24gb2JzZXJ2ZUlmRG9uZSgpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBkb25lIHdpdGggbWFraW5nIGNoYW5nZXMsIHN0YXJ0IHdhdGNoaW5nIGZvciBjaGFnbmVzIGluIERPTSBhZ2FpblxuICAgICAgICAgICAgICAgIGluUHJvZ3Jlc3NDb3VudCAtPSAxO1xuICAgICAgICAgICAgICAgIGlmIChpblByb2dyZXNzQ291bnQgPT09IDApIHsgLy8gaWYgYWxsIHhocnMgd2VyZSByZXNvbHZlZFxuICAgICAgICAgICAgICAgICAgICB1bm9ic2VydmVDaGFuZ2VzKCk7IC8vIG1ha2Ugc3VyZSB0byByZW1vdmUgb2xkIGhhbmRsZXJzXG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVDaGFuZ2VzKCk7IC8vIHdhdGNoIGZvciBjaGFuZ2VzIHRvIERPTVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIGF0dHJVcGRhdGVGdW5jKHNwZWMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2FjaGVbc3BlYy5iYXNlXSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3BlYy51c2VFbC5zZXRBdHRyaWJ1dGVOUyh4bGlua05TLCBcInhsaW5rOmhyZWZcIiwgXCIjXCIgKyBzcGVjLmhhc2gpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNwZWMudXNlRWwuaGFzQXR0cmlidXRlKFwiaHJlZlwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWMudXNlRWwuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBcIiNcIiArIHNwZWMuaGFzaCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gb25sb2FkRnVuYyh4aHIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYm9keSA9IGRvY3VtZW50LmJvZHk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB4ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInhcIik7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdmc7XG4gICAgICAgICAgICAgICAgICAgIHhoci5vbmxvYWQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB4LmlubmVySFRNTCA9IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICAgICAgICAgIHN2ZyA9IHguZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzdmdcIilbMF07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWhpZGRlblwiLCBcInRydWVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdmcuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdmcuc3R5bGUud2lkdGggPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLnN0eWxlLmhlaWdodCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdmcuc3R5bGUub3ZlcmZsb3cgPSBcImhpZGRlblwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgYm9keS5pbnNlcnRCZWZvcmUoc3ZnLCBib2R5LmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVJZkRvbmUoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gb25FcnJvclRpbWVvdXQoeGhyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgeGhyLm9uZXJyb3IgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB4aHIub250aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZUlmRG9uZSgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1bm9ic2VydmVDaGFuZ2VzKCk7IC8vIHN0b3Agd2F0Y2hpbmcgZm9yIGNoYW5nZXMgdG8gRE9NXG4gICAgICAgICAgICAvLyBmaW5kIGFsbCB1c2UgZWxlbWVudHNcbiAgICAgICAgICAgIHVzZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInVzZVwiKTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB1c2VzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYmNyID0gdXNlc1tpXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChpZ25vcmUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZmFpbGVkIHRvIGdldCBib3VuZGluZyByZWN0YW5nbGUgb2YgdGhlIHVzZSBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIGJjciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBocmVmID0gdXNlc1tpXS5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCB1c2VzW2ldLmdldEF0dHJpYnV0ZU5TKHhsaW5rTlMsIFwiaHJlZlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgdXNlc1tpXS5nZXRBdHRyaWJ1dGUoXCJ4bGluazpocmVmXCIpO1xuICAgICAgICAgICAgICAgIGlmIChocmVmICYmIGhyZWYuc3BsaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdXJsID0gaHJlZi5zcGxpdChcIiNcIik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXJsID0gW1wiXCIsIFwiXCJdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBiYXNlID0gdXJsWzBdO1xuICAgICAgICAgICAgICAgIGhhc2ggPSB1cmxbMV07XG4gICAgICAgICAgICAgICAgaXNIaWRkZW4gPSBiY3IgJiYgYmNyLmxlZnQgPT09IDAgJiYgYmNyLnJpZ2h0ID09PSAwICYmIGJjci50b3AgPT09IDAgJiYgYmNyLmJvdHRvbSA9PT0gMDtcbiAgICAgICAgICAgICAgICBpZiAoYmNyICYmIGJjci53aWR0aCA9PT0gMCAmJiBiY3IuaGVpZ2h0ID09PSAwICYmICFpc0hpZGRlbikge1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgdXNlIGVsZW1lbnQgaXMgZW1wdHlcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYSByZWZlcmVuY2UgdG8gYW4gZXh0ZXJuYWwgU1ZHLCB0cnkgdG8gZmV0Y2ggaXRcbiAgICAgICAgICAgICAgICAgICAgLy8gdXNlIHRoZSBvcHRpb25hbCBmYWxsYmFjayBVUkwgaWYgdGhlcmUgaXMgbm8gcmVmZXJlbmNlIHRvIGFuIGV4dGVybmFsIFNWR1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmFsbGJhY2sgJiYgIWJhc2UubGVuZ3RoICYmIGhhc2ggJiYgIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGhhc2gpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlID0gZmFsbGJhY2s7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHVzZXNbaV0uaGFzQXR0cmlidXRlKFwiaHJlZlwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlc1tpXS5zZXRBdHRyaWJ1dGVOUyh4bGlua05TLCBcInhsaW5rOmhyZWZcIiwgaHJlZik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzY2hlZHVsZSB1cGRhdGluZyB4bGluazpocmVmXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIgPSBjYWNoZVtiYXNlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh4aHIgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0cnVlIHNpZ25pZmllcyB0aGF0IHByZXBlbmRpbmcgdGhlIFNWRyB3YXMgbm90IHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChhdHRyVXBkYXRlRnVuYyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZUVsOiB1c2VzW2ldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlOiBiYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNoOiBoYXNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHhociA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVxdWVzdCA9IGNyZWF0ZVJlcXVlc3QoYmFzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFJlcXVlc3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHIgPSBuZXcgUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZVtiYXNlXSA9IHhocjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeGhyLm9ubG9hZCA9IG9ubG9hZEZ1bmMoeGhyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeGhyLm9uZXJyb3IgPSBvbkVycm9yVGltZW91dCh4aHIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHIub250aW1lb3V0ID0gb25FcnJvclRpbWVvdXQoeGhyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeGhyLm9wZW4oXCJHRVRcIiwgYmFzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhoci5zZW5kKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUHJvZ3Jlc3NDb3VudCArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNIaWRkZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWNoZVtiYXNlXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVtZW1iZXIgdGhpcyBVUkwgaWYgdGhlIHVzZSBlbGVtZW50IHdhcyBub3QgZW1wdHkgYW5kIG5vIHJlcXVlc3Qgd2FzIHNlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZVtiYXNlXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNhY2hlW2Jhc2VdLm9ubG9hZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGl0IHR1cm5zIG91dCB0aGF0IHByZXBlbmRpbmcgdGhlIFNWRyBpcyBub3QgbmVjZXNzYXJ5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFib3J0IHRoZSBpbi1wcm9ncmVzcyB4aHIuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGVbYmFzZV0uYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgY2FjaGVbYmFzZV0ub25sb2FkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlW2Jhc2VdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChiYXNlLmxlbmd0aCAmJiBjYWNoZVtiYXNlXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChhdHRyVXBkYXRlRnVuYyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlRWw6IHVzZXNbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZTogYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNoOiBoYXNoXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSwgMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1c2VzID0gXCJcIjtcbiAgICAgICAgICAgIGluUHJvZ3Jlc3NDb3VudCArPSAxO1xuICAgICAgICAgICAgb2JzZXJ2ZUlmRG9uZSgpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgd2luTG9hZDtcbiAgICAgICAgd2luTG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLCB3aW5Mb2FkLCBmYWxzZSk7IC8vIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzXG4gICAgICAgICAgICB0aWQgPSBzZXRUaW1lb3V0KGNoZWNrVXNlRWxlbXMsIDApO1xuICAgICAgICB9O1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gXCJjb21wbGV0ZVwiKSB7XG4gICAgICAgICAgICAvLyBUaGUgbG9hZCBldmVudCBmaXJlcyB3aGVuIGFsbCByZXNvdXJjZXMgaGF2ZSBmaW5pc2hlZCBsb2FkaW5nLCB3aGljaCBhbGxvd3MgZGV0ZWN0aW5nIHdoZXRoZXIgU1ZHIHVzZSBlbGVtZW50cyBhcmUgZW1wdHkuXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgd2luTG9hZCwgZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gTm8gbmVlZCB0byBhZGQgYSBsaXN0ZW5lciBpZiB0aGUgZG9jdW1lbnQgaXMgYWxyZWFkeSBsb2FkZWQsIGluaXRpYWxpemUgaW1tZWRpYXRlbHkuXG4gICAgICAgICAgICB3aW5Mb2FkKCk7XG4gICAgICAgIH1cbiAgICB9XG59KCkpO1xuIiwiLyohIG5wbS5pbS9vYmplY3QtZml0LWltYWdlcyAzLjIuNCAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgT0ZJID0gJ2JmcmVkLWl0Om9iamVjdC1maXQtaW1hZ2VzJztcbnZhciBwcm9wUmVnZXggPSAvKG9iamVjdC1maXR8b2JqZWN0LXBvc2l0aW9uKVxccyo6XFxzKihbLS5cXHdcXHMlXSspL2c7XG52YXIgdGVzdEltZyA9IHR5cGVvZiBJbWFnZSA9PT0gJ3VuZGVmaW5lZCcgPyB7c3R5bGU6IHsnb2JqZWN0LXBvc2l0aW9uJzogMX19IDogbmV3IEltYWdlKCk7XG52YXIgc3VwcG9ydHNPYmplY3RGaXQgPSAnb2JqZWN0LWZpdCcgaW4gdGVzdEltZy5zdHlsZTtcbnZhciBzdXBwb3J0c09iamVjdFBvc2l0aW9uID0gJ29iamVjdC1wb3NpdGlvbicgaW4gdGVzdEltZy5zdHlsZTtcbnZhciBzdXBwb3J0c09GSSA9ICdiYWNrZ3JvdW5kLXNpemUnIGluIHRlc3RJbWcuc3R5bGU7XG52YXIgc3VwcG9ydHNDdXJyZW50U3JjID0gdHlwZW9mIHRlc3RJbWcuY3VycmVudFNyYyA9PT0gJ3N0cmluZyc7XG52YXIgbmF0aXZlR2V0QXR0cmlidXRlID0gdGVzdEltZy5nZXRBdHRyaWJ1dGU7XG52YXIgbmF0aXZlU2V0QXR0cmlidXRlID0gdGVzdEltZy5zZXRBdHRyaWJ1dGU7XG52YXIgYXV0b01vZGVFbmFibGVkID0gZmFsc2U7XG5cbmZ1bmN0aW9uIGNyZWF0ZVBsYWNlaG9sZGVyKHcsIGgpIHtcblx0cmV0dXJuIChcImRhdGE6aW1hZ2Uvc3ZnK3htbCwlM0NzdmcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB3aWR0aD0nXCIgKyB3ICsgXCInIGhlaWdodD0nXCIgKyBoICsgXCInJTNFJTNDL3N2ZyUzRVwiKTtcbn1cblxuZnVuY3Rpb24gcG9seWZpbGxDdXJyZW50U3JjKGVsKSB7XG5cdGlmIChlbC5zcmNzZXQgJiYgIXN1cHBvcnRzQ3VycmVudFNyYyAmJiB3aW5kb3cucGljdHVyZWZpbGwpIHtcblx0XHR2YXIgcGYgPSB3aW5kb3cucGljdHVyZWZpbGwuXztcblx0XHQvLyBwYXJzZSBzcmNzZXQgd2l0aCBwaWN0dXJlZmlsbCB3aGVyZSBjdXJyZW50U3JjIGlzbid0IGF2YWlsYWJsZVxuXHRcdGlmICghZWxbcGYubnNdIHx8ICFlbFtwZi5uc10uZXZhbGVkKSB7XG5cdFx0XHQvLyBmb3JjZSBzeW5jaHJvbm91cyBzcmNzZXQgcGFyc2luZ1xuXHRcdFx0cGYuZmlsbEltZyhlbCwge3Jlc2VsZWN0OiB0cnVlfSk7XG5cdFx0fVxuXG5cdFx0aWYgKCFlbFtwZi5uc10uY3VyU3JjKSB7XG5cdFx0XHQvLyBmb3JjZSBwaWN0dXJlZmlsbCB0byBwYXJzZSBzcmNzZXRcblx0XHRcdGVsW3BmLm5zXS5zdXBwb3J0ZWQgPSBmYWxzZTtcblx0XHRcdHBmLmZpbGxJbWcoZWwsIHtyZXNlbGVjdDogdHJ1ZX0pO1xuXHRcdH1cblxuXHRcdC8vIHJldHJpZXZlIHBhcnNlZCBjdXJyZW50U3JjLCBpZiBhbnlcblx0XHRlbC5jdXJyZW50U3JjID0gZWxbcGYubnNdLmN1clNyYyB8fCBlbC5zcmM7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0U3R5bGUoZWwpIHtcblx0dmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbCkuZm9udEZhbWlseTtcblx0dmFyIHBhcnNlZDtcblx0dmFyIHByb3BzID0ge307XG5cdHdoaWxlICgocGFyc2VkID0gcHJvcFJlZ2V4LmV4ZWMoc3R5bGUpKSAhPT0gbnVsbCkge1xuXHRcdHByb3BzW3BhcnNlZFsxXV0gPSBwYXJzZWRbMl07XG5cdH1cblx0cmV0dXJuIHByb3BzO1xufVxuXG5mdW5jdGlvbiBzZXRQbGFjZWhvbGRlcihpbWcsIHdpZHRoLCBoZWlnaHQpIHtcblx0Ly8gRGVmYXVsdDogZmlsbCB3aWR0aCwgbm8gaGVpZ2h0XG5cdHZhciBwbGFjZWhvbGRlciA9IGNyZWF0ZVBsYWNlaG9sZGVyKHdpZHRoIHx8IDEsIGhlaWdodCB8fCAwKTtcblxuXHQvLyBPbmx5IHNldCBwbGFjZWhvbGRlciBpZiBpdCdzIGRpZmZlcmVudFxuXHRpZiAobmF0aXZlR2V0QXR0cmlidXRlLmNhbGwoaW1nLCAnc3JjJykgIT09IHBsYWNlaG9sZGVyKSB7XG5cdFx0bmF0aXZlU2V0QXR0cmlidXRlLmNhbGwoaW1nLCAnc3JjJywgcGxhY2Vob2xkZXIpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIG9uSW1hZ2VSZWFkeShpbWcsIGNhbGxiYWNrKSB7XG5cdC8vIG5hdHVyYWxXaWR0aCBpcyBvbmx5IGF2YWlsYWJsZSB3aGVuIHRoZSBpbWFnZSBoZWFkZXJzIGFyZSBsb2FkZWQsXG5cdC8vIHRoaXMgbG9vcCB3aWxsIHBvbGwgaXQgZXZlcnkgMTAwbXMuXG5cdGlmIChpbWcubmF0dXJhbFdpZHRoKSB7XG5cdFx0Y2FsbGJhY2soaW1nKTtcblx0fSBlbHNlIHtcblx0XHRzZXRUaW1lb3V0KG9uSW1hZ2VSZWFkeSwgMTAwLCBpbWcsIGNhbGxiYWNrKTtcblx0fVxufVxuXG5mdW5jdGlvbiBmaXhPbmUoZWwpIHtcblx0dmFyIHN0eWxlID0gZ2V0U3R5bGUoZWwpO1xuXHR2YXIgb2ZpID0gZWxbT0ZJXTtcblx0c3R5bGVbJ29iamVjdC1maXQnXSA9IHN0eWxlWydvYmplY3QtZml0J10gfHwgJ2ZpbGwnOyAvLyBkZWZhdWx0IHZhbHVlXG5cblx0Ly8gQXZvaWQgcnVubmluZyB3aGVyZSB1bm5lY2Vzc2FyeSwgdW5sZXNzIE9GSSBoYWQgYWxyZWFkeSBkb25lIGl0cyBkZWVkXG5cdGlmICghb2ZpLmltZykge1xuXHRcdC8vIGZpbGwgaXMgdGhlIGRlZmF1bHQgYmVoYXZpb3Igc28gbm8gYWN0aW9uIGlzIG5lY2Vzc2FyeVxuXHRcdGlmIChzdHlsZVsnb2JqZWN0LWZpdCddID09PSAnZmlsbCcpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBXaGVyZSBvYmplY3QtZml0IGlzIHN1cHBvcnRlZCBhbmQgb2JqZWN0LXBvc2l0aW9uIGlzbid0IChTYWZhcmkgPCAxMClcblx0XHRpZiAoXG5cdFx0XHQhb2ZpLnNraXBUZXN0ICYmIC8vIHVubGVzcyB1c2VyIHdhbnRzIHRvIGFwcGx5IHJlZ2FyZGxlc3Mgb2YgYnJvd3NlciBzdXBwb3J0XG5cdFx0XHRzdXBwb3J0c09iamVjdEZpdCAmJiAvLyBpZiBicm93c2VyIGFscmVhZHkgc3VwcG9ydHMgb2JqZWN0LWZpdFxuXHRcdFx0IXN0eWxlWydvYmplY3QtcG9zaXRpb24nXSAvLyB1bmxlc3Mgb2JqZWN0LXBvc2l0aW9uIGlzIHVzZWRcblx0XHQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdH1cblxuXHQvLyBrZWVwIGEgY2xvbmUgaW4gbWVtb3J5IHdoaWxlIHJlc2V0dGluZyB0aGUgb3JpZ2luYWwgdG8gYSBibGFua1xuXHRpZiAoIW9maS5pbWcpIHtcblx0XHRvZmkuaW1nID0gbmV3IEltYWdlKGVsLndpZHRoLCBlbC5oZWlnaHQpO1xuXHRcdG9maS5pbWcuc3Jjc2V0ID0gbmF0aXZlR2V0QXR0cmlidXRlLmNhbGwoZWwsIFwiZGF0YS1vZmktc3Jjc2V0XCIpIHx8IGVsLnNyY3NldDtcblx0XHRvZmkuaW1nLnNyYyA9IG5hdGl2ZUdldEF0dHJpYnV0ZS5jYWxsKGVsLCBcImRhdGEtb2ZpLXNyY1wiKSB8fCBlbC5zcmM7XG5cblx0XHQvLyBwcmVzZXJ2ZSBmb3IgYW55IGZ1dHVyZSBjbG9uZU5vZGUgY2FsbHNcblx0XHQvLyBodHRwczovL2dpdGh1Yi5jb20vYmZyZWQtaXQvb2JqZWN0LWZpdC1pbWFnZXMvaXNzdWVzLzUzXG5cdFx0bmF0aXZlU2V0QXR0cmlidXRlLmNhbGwoZWwsIFwiZGF0YS1vZmktc3JjXCIsIGVsLnNyYyk7XG5cdFx0aWYgKGVsLnNyY3NldCkge1xuXHRcdFx0bmF0aXZlU2V0QXR0cmlidXRlLmNhbGwoZWwsIFwiZGF0YS1vZmktc3Jjc2V0XCIsIGVsLnNyY3NldCk7XG5cdFx0fVxuXG5cdFx0c2V0UGxhY2Vob2xkZXIoZWwsIGVsLm5hdHVyYWxXaWR0aCB8fCBlbC53aWR0aCwgZWwubmF0dXJhbEhlaWdodCB8fCBlbC5oZWlnaHQpO1xuXG5cdFx0Ly8gcmVtb3ZlIHNyY3NldCBiZWNhdXNlIGl0IG92ZXJyaWRlcyBzcmNcblx0XHRpZiAoZWwuc3Jjc2V0KSB7XG5cdFx0XHRlbC5zcmNzZXQgPSAnJztcblx0XHR9XG5cdFx0dHJ5IHtcblx0XHRcdGtlZXBTcmNVc2FibGUoZWwpO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0aWYgKHdpbmRvdy5jb25zb2xlKSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybignaHR0cHM6Ly9iaXQubHkvb2ZpLW9sZC1icm93c2VyJyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cG9seWZpbGxDdXJyZW50U3JjKG9maS5pbWcpO1xuXG5cdGVsLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKFxcXCJcIiArICgob2ZpLmltZy5jdXJyZW50U3JjIHx8IG9maS5pbWcuc3JjKS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJykpICsgXCJcXFwiKVwiO1xuXHRlbC5zdHlsZS5iYWNrZ3JvdW5kUG9zaXRpb24gPSBzdHlsZVsnb2JqZWN0LXBvc2l0aW9uJ10gfHwgJ2NlbnRlcic7XG5cdGVsLnN0eWxlLmJhY2tncm91bmRSZXBlYXQgPSAnbm8tcmVwZWF0Jztcblx0ZWwuc3R5bGUuYmFja2dyb3VuZE9yaWdpbiA9ICdjb250ZW50LWJveCc7XG5cblx0aWYgKC9zY2FsZS1kb3duLy50ZXN0KHN0eWxlWydvYmplY3QtZml0J10pKSB7XG5cdFx0b25JbWFnZVJlYWR5KG9maS5pbWcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChvZmkuaW1nLm5hdHVyYWxXaWR0aCA+IGVsLndpZHRoIHx8IG9maS5pbWcubmF0dXJhbEhlaWdodCA+IGVsLmhlaWdodCkge1xuXHRcdFx0XHRlbC5zdHlsZS5iYWNrZ3JvdW5kU2l6ZSA9ICdjb250YWluJztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGVsLnN0eWxlLmJhY2tncm91bmRTaXplID0gJ2F1dG8nO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdGVsLnN0eWxlLmJhY2tncm91bmRTaXplID0gc3R5bGVbJ29iamVjdC1maXQnXS5yZXBsYWNlKCdub25lJywgJ2F1dG8nKS5yZXBsYWNlKCdmaWxsJywgJzEwMCUgMTAwJScpO1xuXHR9XG5cblx0b25JbWFnZVJlYWR5KG9maS5pbWcsIGZ1bmN0aW9uIChpbWcpIHtcblx0XHRzZXRQbGFjZWhvbGRlcihlbCwgaW1nLm5hdHVyYWxXaWR0aCwgaW1nLm5hdHVyYWxIZWlnaHQpO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24ga2VlcFNyY1VzYWJsZShlbCkge1xuXHR2YXIgZGVzY3JpcHRvcnMgPSB7XG5cdFx0Z2V0OiBmdW5jdGlvbiBnZXQocHJvcCkge1xuXHRcdFx0cmV0dXJuIGVsW09GSV0uaW1nW3Byb3AgPyBwcm9wIDogJ3NyYyddO1xuXHRcdH0sXG5cdFx0c2V0OiBmdW5jdGlvbiBzZXQodmFsdWUsIHByb3ApIHtcblx0XHRcdGVsW09GSV0uaW1nW3Byb3AgPyBwcm9wIDogJ3NyYyddID0gdmFsdWU7XG5cdFx0XHRuYXRpdmVTZXRBdHRyaWJ1dGUuY2FsbChlbCwgKFwiZGF0YS1vZmktXCIgKyBwcm9wKSwgdmFsdWUpOyAvLyBwcmVzZXJ2ZSBmb3IgYW55IGZ1dHVyZSBjbG9uZU5vZGVcblx0XHRcdGZpeE9uZShlbCk7XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fVxuXHR9O1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZWwsICdzcmMnLCBkZXNjcmlwdG9ycyk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbCwgJ2N1cnJlbnRTcmMnLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBkZXNjcmlwdG9ycy5nZXQoJ2N1cnJlbnRTcmMnKTsgfVxuXHR9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGVsLCAnc3Jjc2V0Jywge1xuXHRcdGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gZGVzY3JpcHRvcnMuZ2V0KCdzcmNzZXQnKTsgfSxcblx0XHRzZXQ6IGZ1bmN0aW9uIChzcykgeyByZXR1cm4gZGVzY3JpcHRvcnMuc2V0KHNzLCAnc3Jjc2V0Jyk7IH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGhpamFja0F0dHJpYnV0ZXMoKSB7XG5cdGZ1bmN0aW9uIGdldE9maUltYWdlTWF5YmUoZWwsIG5hbWUpIHtcblx0XHRyZXR1cm4gZWxbT0ZJXSAmJiBlbFtPRkldLmltZyAmJiAobmFtZSA9PT0gJ3NyYycgfHwgbmFtZSA9PT0gJ3NyY3NldCcpID8gZWxbT0ZJXS5pbWcgOiBlbDtcblx0fVxuXHRpZiAoIXN1cHBvcnRzT2JqZWN0UG9zaXRpb24pIHtcblx0XHRIVE1MSW1hZ2VFbGVtZW50LnByb3RvdHlwZS5nZXRBdHRyaWJ1dGUgPSBmdW5jdGlvbiAobmFtZSkge1xuXHRcdFx0cmV0dXJuIG5hdGl2ZUdldEF0dHJpYnV0ZS5jYWxsKGdldE9maUltYWdlTWF5YmUodGhpcywgbmFtZSksIG5hbWUpO1xuXHRcdH07XG5cblx0XHRIVE1MSW1hZ2VFbGVtZW50LnByb3RvdHlwZS5zZXRBdHRyaWJ1dGUgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcblx0XHRcdHJldHVybiBuYXRpdmVTZXRBdHRyaWJ1dGUuY2FsbChnZXRPZmlJbWFnZU1heWJlKHRoaXMsIG5hbWUpLCBuYW1lLCBTdHJpbmcodmFsdWUpKTtcblx0XHR9O1xuXHR9XG59XG5cbmZ1bmN0aW9uIGZpeChpbWdzLCBvcHRzKSB7XG5cdHZhciBzdGFydEF1dG9Nb2RlID0gIWF1dG9Nb2RlRW5hYmxlZCAmJiAhaW1ncztcblx0b3B0cyA9IG9wdHMgfHwge307XG5cdGltZ3MgPSBpbWdzIHx8ICdpbWcnO1xuXG5cdGlmICgoc3VwcG9ydHNPYmplY3RQb3NpdGlvbiAmJiAhb3B0cy5za2lwVGVzdCkgfHwgIXN1cHBvcnRzT0ZJKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gdXNlIGltZ3MgYXMgYSBzZWxlY3RvciBvciBqdXN0IHNlbGVjdCBhbGwgaW1hZ2VzXG5cdGlmIChpbWdzID09PSAnaW1nJykge1xuXHRcdGltZ3MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1nJyk7XG5cdH0gZWxzZSBpZiAodHlwZW9mIGltZ3MgPT09ICdzdHJpbmcnKSB7XG5cdFx0aW1ncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoaW1ncyk7XG5cdH0gZWxzZSBpZiAoISgnbGVuZ3RoJyBpbiBpbWdzKSkge1xuXHRcdGltZ3MgPSBbaW1nc107XG5cdH1cblxuXHQvLyBhcHBseSBmaXggdG8gYWxsXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgaW1ncy5sZW5ndGg7IGkrKykge1xuXHRcdGltZ3NbaV1bT0ZJXSA9IGltZ3NbaV1bT0ZJXSB8fCB7XG5cdFx0XHRza2lwVGVzdDogb3B0cy5za2lwVGVzdFxuXHRcdH07XG5cdFx0Zml4T25lKGltZ3NbaV0pO1xuXHR9XG5cblx0aWYgKHN0YXJ0QXV0b01vZGUpIHtcblx0XHRkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0aWYgKGUudGFyZ2V0LnRhZ05hbWUgPT09ICdJTUcnKSB7XG5cdFx0XHRcdGZpeChlLnRhcmdldCwge1xuXHRcdFx0XHRcdHNraXBUZXN0OiBvcHRzLnNraXBUZXN0XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sIHRydWUpO1xuXHRcdGF1dG9Nb2RlRW5hYmxlZCA9IHRydWU7XG5cdFx0aW1ncyA9ICdpbWcnOyAvLyByZXNldCB0byBhIGdlbmVyaWMgc2VsZWN0b3IgZm9yIHdhdGNoTVFcblx0fVxuXG5cdC8vIGlmIHJlcXVlc3RlZCwgd2F0Y2ggbWVkaWEgcXVlcmllcyBmb3Igb2JqZWN0LWZpdCBjaGFuZ2Vcblx0aWYgKG9wdHMud2F0Y2hNUSkge1xuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmaXguYmluZChudWxsLCBpbWdzLCB7XG5cdFx0XHRza2lwVGVzdDogb3B0cy5za2lwVGVzdFxuXHRcdH0pKTtcblx0fVxufVxuXG5maXguc3VwcG9ydHNPYmplY3RGaXQgPSBzdXBwb3J0c09iamVjdEZpdDtcbmZpeC5zdXBwb3J0c09iamVjdFBvc2l0aW9uID0gc3VwcG9ydHNPYmplY3RQb3NpdGlvbjtcblxuaGlqYWNrQXR0cmlidXRlcygpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZpeDtcbiIsImltcG9ydCBvYmplY3RGaXRJbWFnZXMgZnJvbSAnb2JqZWN0LWZpdC1pbWFnZXMnO1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7XG4gIG9iamVjdEZpdEltYWdlcygnaW1nLm9iamVjdC1maXQnKTtcbn07XG4iLCJ2YXIgY29yZSA9IG1vZHVsZS5leHBvcnRzID0geyB2ZXJzaW9uOiAnMi42LjExJyB9O1xuaWYgKHR5cGVvZiBfX2UgPT0gJ251bWJlcicpIF9fZSA9IGNvcmU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcbiIsInZhciBjb3JlID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpO1xudmFyICRKU09OID0gY29yZS5KU09OIHx8IChjb3JlLkpTT04gPSB7IHN0cmluZ2lmeTogSlNPTi5zdHJpbmdpZnkgfSk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHN0cmluZ2lmeShpdCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIHJldHVybiAkSlNPTi5zdHJpbmdpZnkuYXBwbHkoJEpTT04sIGFyZ3VtZW50cyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL2pzb24vc3RyaW5naWZ5XCIpOyIsImV4cG9ydCBkZWZhdWx0ICgpID0+IHtcbiAgY29uc3QgQVBJID0gJ2F1dGhvcml6YXRpb24nO1xuXG4gIGxldCAkZm9ybSA9ICQoJy5qcy1hdXRvcml6YXRpb24nKTtcbiAgbGV0ICRzdWJtaXRCdG4gPSAkZm9ybS5maW5kKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpO1xuXG4gICRzdWJtaXRCdG4ub2ZmKCdjbGljay5yZWdpc3RyYXRpb24nKS5vbignY2xpY2sucmVnaXN0cmF0aW9uJywgZXZlbnQgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgbGV0IGRhdGEgPSBKU09OLnN0cmluZ2lmeSgkZm9ybS5zZXJpYWxpemVBcnJheSgpKTtcblxuICAgICQuYWpheCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHVybDogYGh0dHA6Ly9tdmNzaG9wLmNvbS8ke0FQSX1gLFxuICAgICAgZGF0YSxcbiAgICB9KTtcbiAgfSk7XG59O1xuIiwiZXhwb3J0IGRlZmF1bHQgKCkgPT4gY29uc29sZS5sb2coJ2hlbmxvJyk7XG4iLCJpbXBvcnQgJ3N2Z3h1c2UnO1xuaW1wb3J0IG9iamVjdEZpdEltYWdlcyBmcm9tICcuL3BvbHlmaWxscy9vYmplY3RGaXRJbWFnZXMnO1xuXG5pbXBvcnQgYXV0b3JpemF0aW9uIGZyb20gJy4vbW9kdWxlcy9hdXRvcml6YXRpb24nO1xuaW1wb3J0IHJlZ2lzdHJhdGlvbiBmcm9tICcuL21vZHVsZXMvcmVnaXN0cmF0aW9uJztcblxub2JqZWN0Rml0SW1hZ2VzKCk7XG5hdXRvcml6YXRpb24oKTtcbnJlZ2lzdHJhdGlvbigpO1xuIl0sIm5hbWVzIjpbIm9iamVjdEZpdEltYWdlcyIsImNvcmUiLCJyZXF1aXJlJCQwIiwiQVBJIiwiJGZvcm0iLCIkIiwiJHN1Ym1pdEJ0biIsImZpbmQiLCJvZmYiLCJvbiIsImV2ZW50IiwicHJldmVudERlZmF1bHQiLCJkYXRhIiwiX0pTT04kc3RyaW5naWZ5Iiwic2VyaWFsaXplQXJyYXkiLCJhamF4IiwibWV0aG9kIiwidXJsIiwiY29uc29sZSIsImxvZyIsImF1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
