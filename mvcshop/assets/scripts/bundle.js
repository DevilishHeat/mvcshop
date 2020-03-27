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

    var autorization = (function () {
      var API = 'authorization';
      var $form = $('.js-authorization');
      var $submitBtn = $form.find('button[type="submit"]');
      $submitBtn.off('click.registration').on('click.registration', function (event) {
        event.preventDefault();
        var data = $form.serializeArray();
        $.ajax({
          type: 'POST',
          url: "http://mvcshop.com/".concat(API),
          data: data,
          dataType: 'json'
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9zdmd4dXNlL3N2Z3h1c2UuanMiLCJub2RlX21vZHVsZXMvb2JqZWN0LWZpdC1pbWFnZXMvZGlzdC9vZmkuY29tbW9uLWpzLmpzIiwic3JjL2Fzc2V0cy9zY3JpcHRzL3BvbHlmaWxscy9vYmplY3RGaXRJbWFnZXMuanMiLCJzcmMvYXNzZXRzL3NjcmlwdHMvbW9kdWxlcy9hdXRob3JpemF0aW9uLmpzIiwic3JjL2Fzc2V0cy9zY3JpcHRzL21vZHVsZXMvcmVnaXN0cmF0aW9uLmpzIiwic3JjL2Fzc2V0cy9zY3JpcHRzL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTcgSWNvTW9vbi5pb1xuICogQGxpY2Vuc2UgICBMaWNlbnNlZCB1bmRlciBNSVQgbGljZW5zZVxuICogICAgICAgICAgICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL0tleWFtb29uL3N2Z3h1c2VcbiAqIEB2ZXJzaW9uICAgMS4yLjZcbiAqL1xuLypqc2xpbnQgYnJvd3NlcjogdHJ1ZSAqL1xuLypnbG9iYWwgWERvbWFpblJlcXVlc3QsIE11dGF0aW9uT2JzZXJ2ZXIsIHdpbmRvdyAqL1xuKGZ1bmN0aW9uICgpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICB2YXIgY2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpOyAvLyBob2xkcyB4aHIgb2JqZWN0cyB0byBwcmV2ZW50IG11bHRpcGxlIHJlcXVlc3RzXG4gICAgICAgIHZhciBjaGVja1VzZUVsZW1zO1xuICAgICAgICB2YXIgdGlkOyAvLyB0aW1lb3V0IGlkXG4gICAgICAgIHZhciBkZWJvdW5jZWRDaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aWQpO1xuICAgICAgICAgICAgdGlkID0gc2V0VGltZW91dChjaGVja1VzZUVsZW1zLCAxMDApO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgdW5vYnNlcnZlQ2hhbmdlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG9ic2VydmVDaGFuZ2VzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG9ic2VydmVyO1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZGVib3VuY2VkQ2hlY2ssIGZhbHNlKTtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwib3JpZW50YXRpb25jaGFuZ2VcIiwgZGVib3VuY2VkQ2hlY2ssIGZhbHNlKTtcbiAgICAgICAgICAgIGlmICh3aW5kb3cuTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZGVib3VuY2VkQ2hlY2spO1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHVub2JzZXJ2ZUNoYW5nZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBkZWJvdW5jZWRDaGVjaywgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJvcmllbnRhdGlvbmNoYW5nZVwiLCBkZWJvdW5jZWRDaGVjaywgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChpZ25vcmUpIHt9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01TdWJ0cmVlTW9kaWZpZWRcIiwgZGVib3VuY2VkQ2hlY2ssIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB1bm9ic2VydmVDaGFuZ2VzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIkRPTVN1YnRyZWVNb2RpZmllZFwiLCBkZWJvdW5jZWRDaGVjaywgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBkZWJvdW5jZWRDaGVjaywgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm9yaWVudGF0aW9uY2hhbmdlXCIsIGRlYm91bmNlZENoZWNrLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGNyZWF0ZVJlcXVlc3QgPSBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgICAgICAvLyBJbiBJRSA5LCBjcm9zcyBvcmlnaW4gcmVxdWVzdHMgY2FuIG9ubHkgYmUgc2VudCB1c2luZyBYRG9tYWluUmVxdWVzdC5cbiAgICAgICAgICAgIC8vIFhEb21haW5SZXF1ZXN0IHdvdWxkIGZhaWwgaWYgQ09SUyBoZWFkZXJzIGFyZSBub3Qgc2V0LlxuICAgICAgICAgICAgLy8gVGhlcmVmb3JlLCBYRG9tYWluUmVxdWVzdCBzaG91bGQgb25seSBiZSB1c2VkIHdpdGggY3Jvc3Mgb3JpZ2luIHJlcXVlc3RzLlxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0T3JpZ2luKGxvYykge1xuICAgICAgICAgICAgICAgIHZhciBhO1xuICAgICAgICAgICAgICAgIGlmIChsb2MucHJvdG9jb2wgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBhID0gbG9jO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICAgICAgICAgICAgICAgICAgYS5ocmVmID0gbG9jO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYS5wcm90b2NvbC5yZXBsYWNlKC86L2csIFwiXCIpICsgYS5ob3N0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIFJlcXVlc3Q7XG4gICAgICAgICAgICB2YXIgb3JpZ2luO1xuICAgICAgICAgICAgdmFyIG9yaWdpbjI7XG4gICAgICAgICAgICBpZiAod2luZG93LlhNTEh0dHBSZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgUmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgIG9yaWdpbiA9IGdldE9yaWdpbihsb2NhdGlvbik7XG4gICAgICAgICAgICAgICAgb3JpZ2luMiA9IGdldE9yaWdpbih1cmwpO1xuICAgICAgICAgICAgICAgIGlmIChSZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9PT0gdW5kZWZpbmVkICYmIG9yaWdpbjIgIT09IFwiXCIgJiYgb3JpZ2luMiAhPT0gb3JpZ2luKSB7XG4gICAgICAgICAgICAgICAgICAgIFJlcXVlc3QgPSBYRG9tYWluUmVxdWVzdCB8fCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgUmVxdWVzdCA9IFhNTEh0dHBSZXF1ZXN0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBSZXF1ZXN0O1xuICAgICAgICB9O1xuICAgICAgICB2YXIgeGxpbmtOUyA9IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiO1xuICAgICAgICBjaGVja1VzZUVsZW1zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2U7XG4gICAgICAgICAgICB2YXIgYmNyO1xuICAgICAgICAgICAgdmFyIGZhbGxiYWNrID0gXCJcIjsgLy8gb3B0aW9uYWwgZmFsbGJhY2sgVVJMIGluIGNhc2Ugbm8gYmFzZSBwYXRoIHRvIFNWRyBmaWxlIHdhcyBnaXZlbiBhbmQgbm8gc3ltYm9sIGRlZmluaXRpb24gd2FzIGZvdW5kLlxuICAgICAgICAgICAgdmFyIGhhc2g7XG4gICAgICAgICAgICB2YXIgaHJlZjtcbiAgICAgICAgICAgIHZhciBpO1xuICAgICAgICAgICAgdmFyIGluUHJvZ3Jlc3NDb3VudCA9IDA7XG4gICAgICAgICAgICB2YXIgaXNIaWRkZW47XG4gICAgICAgICAgICB2YXIgUmVxdWVzdDtcbiAgICAgICAgICAgIHZhciB1cmw7XG4gICAgICAgICAgICB2YXIgdXNlcztcbiAgICAgICAgICAgIHZhciB4aHI7XG4gICAgICAgICAgICBmdW5jdGlvbiBvYnNlcnZlSWZEb25lKCkge1xuICAgICAgICAgICAgICAgIC8vIElmIGRvbmUgd2l0aCBtYWtpbmcgY2hhbmdlcywgc3RhcnQgd2F0Y2hpbmcgZm9yIGNoYWduZXMgaW4gRE9NIGFnYWluXG4gICAgICAgICAgICAgICAgaW5Qcm9ncmVzc0NvdW50IC09IDE7XG4gICAgICAgICAgICAgICAgaWYgKGluUHJvZ3Jlc3NDb3VudCA9PT0gMCkgeyAvLyBpZiBhbGwgeGhycyB3ZXJlIHJlc29sdmVkXG4gICAgICAgICAgICAgICAgICAgIHVub2JzZXJ2ZUNoYW5nZXMoKTsgLy8gbWFrZSBzdXJlIHRvIHJlbW92ZSBvbGQgaGFuZGxlcnNcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZUNoYW5nZXMoKTsgLy8gd2F0Y2ggZm9yIGNoYW5nZXMgdG8gRE9NXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gYXR0clVwZGF0ZUZ1bmMoc3BlYykge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWNoZVtzcGVjLmJhc2VdICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcGVjLnVzZUVsLnNldEF0dHJpYnV0ZU5TKHhsaW5rTlMsIFwieGxpbms6aHJlZlwiLCBcIiNcIiArIHNwZWMuaGFzaCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3BlYy51c2VFbC5oYXNBdHRyaWJ1dGUoXCJocmVmXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlYy51c2VFbC5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIFwiI1wiICsgc3BlYy5oYXNoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBvbmxvYWRGdW5jKHhocikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBib2R5ID0gZG9jdW1lbnQuYm9keTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwieFwiKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN2ZztcbiAgICAgICAgICAgICAgICAgICAgeGhyLm9ubG9hZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHguaW5uZXJIVE1MID0geGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgICAgICAgICAgICAgc3ZnID0geC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInN2Z1wiKVswXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN2Zykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLnNldEF0dHJpYnV0ZShcImFyaWEtaGlkZGVuXCIsIFwidHJ1ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Zy5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Zy5zdHlsZS53aWR0aCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdmcuc3R5bGUuaGVpZ2h0ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Zy5zdHlsZS5vdmVyZmxvdyA9IFwiaGlkZGVuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5Lmluc2VydEJlZm9yZShzdmcsIGJvZHkuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZUlmRG9uZSgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBvbkVycm9yVGltZW91dCh4aHIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB4aHIub25lcnJvciA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHhoci5vbnRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlSWZEb25lKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVub2JzZXJ2ZUNoYW5nZXMoKTsgLy8gc3RvcCB3YXRjaGluZyBmb3IgY2hhbmdlcyB0byBET01cbiAgICAgICAgICAgIC8vIGZpbmQgYWxsIHVzZSBlbGVtZW50c1xuICAgICAgICAgICAgdXNlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidXNlXCIpO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHVzZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBiY3IgPSB1c2VzW2ldLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGlnbm9yZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBmYWlsZWQgdG8gZ2V0IGJvdW5kaW5nIHJlY3RhbmdsZSBvZiB0aGUgdXNlIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgYmNyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGhyZWYgPSB1c2VzW2ldLmdldEF0dHJpYnV0ZShcImhyZWZcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IHVzZXNbaV0uZ2V0QXR0cmlidXRlTlMoeGxpbmtOUywgXCJocmVmXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCB1c2VzW2ldLmdldEF0dHJpYnV0ZShcInhsaW5rOmhyZWZcIik7XG4gICAgICAgICAgICAgICAgaWYgKGhyZWYgJiYgaHJlZi5zcGxpdCkge1xuICAgICAgICAgICAgICAgICAgICB1cmwgPSBocmVmLnNwbGl0KFwiI1wiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1cmwgPSBbXCJcIiwgXCJcIl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJhc2UgPSB1cmxbMF07XG4gICAgICAgICAgICAgICAgaGFzaCA9IHVybFsxXTtcbiAgICAgICAgICAgICAgICBpc0hpZGRlbiA9IGJjciAmJiBiY3IubGVmdCA9PT0gMCAmJiBiY3IucmlnaHQgPT09IDAgJiYgYmNyLnRvcCA9PT0gMCAmJiBiY3IuYm90dG9tID09PSAwO1xuICAgICAgICAgICAgICAgIGlmIChiY3IgJiYgYmNyLndpZHRoID09PSAwICYmIGJjci5oZWlnaHQgPT09IDAgJiYgIWlzSGlkZGVuKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZSB1c2UgZWxlbWVudCBpcyBlbXB0eVxuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBhIHJlZmVyZW5jZSB0byBhbiBleHRlcm5hbCBTVkcsIHRyeSB0byBmZXRjaCBpdFxuICAgICAgICAgICAgICAgICAgICAvLyB1c2UgdGhlIG9wdGlvbmFsIGZhbGxiYWNrIFVSTCBpZiB0aGVyZSBpcyBubyByZWZlcmVuY2UgdG8gYW4gZXh0ZXJuYWwgU1ZHXG4gICAgICAgICAgICAgICAgICAgIGlmIChmYWxsYmFjayAmJiAhYmFzZS5sZW5ndGggJiYgaGFzaCAmJiAhZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaGFzaCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UgPSBmYWxsYmFjaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodXNlc1tpXS5oYXNBdHRyaWJ1dGUoXCJocmVmXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VzW2ldLnNldEF0dHJpYnV0ZU5TKHhsaW5rTlMsIFwieGxpbms6aHJlZlwiLCBocmVmKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNjaGVkdWxlIHVwZGF0aW5nIHhsaW5rOmhyZWZcbiAgICAgICAgICAgICAgICAgICAgICAgIHhociA9IGNhY2hlW2Jhc2VdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHhociAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRydWUgc2lnbmlmaWVzIHRoYXQgcHJlcGVuZGluZyB0aGUgU1ZHIHdhcyBub3QgcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGF0dHJVcGRhdGVGdW5jKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlRWw6IHVzZXNbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2U6IGJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc2g6IGhhc2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoeGhyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZXF1ZXN0ID0gY3JlYXRlUmVxdWVzdChiYXNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoUmVxdWVzdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhociA9IG5ldyBSZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlW2Jhc2VdID0geGhyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHIub25sb2FkID0gb25sb2FkRnVuYyh4aHIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHIub25lcnJvciA9IG9uRXJyb3JUaW1lb3V0KHhocik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhoci5vbnRpbWVvdXQgPSBvbkVycm9yVGltZW91dCh4aHIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHIub3BlbihcIkdFVFwiLCBiYXNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeGhyLnNlbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5Qcm9ncmVzc0NvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0hpZGRlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhY2hlW2Jhc2VdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZW1lbWJlciB0aGlzIFVSTCBpZiB0aGUgdXNlIGVsZW1lbnQgd2FzIG5vdCBlbXB0eSBhbmQgbm8gcmVxdWVzdCB3YXMgc2VudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlW2Jhc2VdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2FjaGVbYmFzZV0ub25sb2FkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgaXQgdHVybnMgb3V0IHRoYXQgcHJlcGVuZGluZyB0aGUgU1ZHIGlzIG5vdCBuZWNlc3NhcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWJvcnQgdGhlIGluLXByb2dyZXNzIHhoci5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZVtiYXNlXS5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBjYWNoZVtiYXNlXS5vbmxvYWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGVbYmFzZV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJhc2UubGVuZ3RoICYmIGNhY2hlW2Jhc2VdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGF0dHJVcGRhdGVGdW5jKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VFbDogdXNlc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlOiBiYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc2g6IGhhc2hcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVzZXMgPSBcIlwiO1xuICAgICAgICAgICAgaW5Qcm9ncmVzc0NvdW50ICs9IDE7XG4gICAgICAgICAgICBvYnNlcnZlSWZEb25lKCk7XG4gICAgICAgIH07XG4gICAgICAgIHZhciB3aW5Mb2FkO1xuICAgICAgICB3aW5Mb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIHdpbkxvYWQsIGZhbHNlKTsgLy8gdG8gcHJldmVudCBtZW1vcnkgbGVha3NcbiAgICAgICAgICAgIHRpZCA9IHNldFRpbWVvdXQoY2hlY2tVc2VFbGVtcywgMCk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSBcImNvbXBsZXRlXCIpIHtcbiAgICAgICAgICAgIC8vIFRoZSBsb2FkIGV2ZW50IGZpcmVzIHdoZW4gYWxsIHJlc291cmNlcyBoYXZlIGZpbmlzaGVkIGxvYWRpbmcsIHdoaWNoIGFsbG93cyBkZXRlY3Rpbmcgd2hldGhlciBTVkcgdXNlIGVsZW1lbnRzIGFyZSBlbXB0eS5cbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCB3aW5Mb2FkLCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBObyBuZWVkIHRvIGFkZCBhIGxpc3RlbmVyIGlmIHRoZSBkb2N1bWVudCBpcyBhbHJlYWR5IGxvYWRlZCwgaW5pdGlhbGl6ZSBpbW1lZGlhdGVseS5cbiAgICAgICAgICAgIHdpbkxvYWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn0oKSk7XG4iLCIvKiEgbnBtLmltL29iamVjdC1maXQtaW1hZ2VzIDMuMi40ICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBPRkkgPSAnYmZyZWQtaXQ6b2JqZWN0LWZpdC1pbWFnZXMnO1xudmFyIHByb3BSZWdleCA9IC8ob2JqZWN0LWZpdHxvYmplY3QtcG9zaXRpb24pXFxzKjpcXHMqKFstLlxcd1xccyVdKykvZztcbnZhciB0ZXN0SW1nID0gdHlwZW9mIEltYWdlID09PSAndW5kZWZpbmVkJyA/IHtzdHlsZTogeydvYmplY3QtcG9zaXRpb24nOiAxfX0gOiBuZXcgSW1hZ2UoKTtcbnZhciBzdXBwb3J0c09iamVjdEZpdCA9ICdvYmplY3QtZml0JyBpbiB0ZXN0SW1nLnN0eWxlO1xudmFyIHN1cHBvcnRzT2JqZWN0UG9zaXRpb24gPSAnb2JqZWN0LXBvc2l0aW9uJyBpbiB0ZXN0SW1nLnN0eWxlO1xudmFyIHN1cHBvcnRzT0ZJID0gJ2JhY2tncm91bmQtc2l6ZScgaW4gdGVzdEltZy5zdHlsZTtcbnZhciBzdXBwb3J0c0N1cnJlbnRTcmMgPSB0eXBlb2YgdGVzdEltZy5jdXJyZW50U3JjID09PSAnc3RyaW5nJztcbnZhciBuYXRpdmVHZXRBdHRyaWJ1dGUgPSB0ZXN0SW1nLmdldEF0dHJpYnV0ZTtcbnZhciBuYXRpdmVTZXRBdHRyaWJ1dGUgPSB0ZXN0SW1nLnNldEF0dHJpYnV0ZTtcbnZhciBhdXRvTW9kZUVuYWJsZWQgPSBmYWxzZTtcblxuZnVuY3Rpb24gY3JlYXRlUGxhY2Vob2xkZXIodywgaCkge1xuXHRyZXR1cm4gKFwiZGF0YTppbWFnZS9zdmcreG1sLCUzQ3N2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSdcIiArIHcgKyBcIicgaGVpZ2h0PSdcIiArIGggKyBcIiclM0UlM0Mvc3ZnJTNFXCIpO1xufVxuXG5mdW5jdGlvbiBwb2x5ZmlsbEN1cnJlbnRTcmMoZWwpIHtcblx0aWYgKGVsLnNyY3NldCAmJiAhc3VwcG9ydHNDdXJyZW50U3JjICYmIHdpbmRvdy5waWN0dXJlZmlsbCkge1xuXHRcdHZhciBwZiA9IHdpbmRvdy5waWN0dXJlZmlsbC5fO1xuXHRcdC8vIHBhcnNlIHNyY3NldCB3aXRoIHBpY3R1cmVmaWxsIHdoZXJlIGN1cnJlbnRTcmMgaXNuJ3QgYXZhaWxhYmxlXG5cdFx0aWYgKCFlbFtwZi5uc10gfHwgIWVsW3BmLm5zXS5ldmFsZWQpIHtcblx0XHRcdC8vIGZvcmNlIHN5bmNocm9ub3VzIHNyY3NldCBwYXJzaW5nXG5cdFx0XHRwZi5maWxsSW1nKGVsLCB7cmVzZWxlY3Q6IHRydWV9KTtcblx0XHR9XG5cblx0XHRpZiAoIWVsW3BmLm5zXS5jdXJTcmMpIHtcblx0XHRcdC8vIGZvcmNlIHBpY3R1cmVmaWxsIHRvIHBhcnNlIHNyY3NldFxuXHRcdFx0ZWxbcGYubnNdLnN1cHBvcnRlZCA9IGZhbHNlO1xuXHRcdFx0cGYuZmlsbEltZyhlbCwge3Jlc2VsZWN0OiB0cnVlfSk7XG5cdFx0fVxuXG5cdFx0Ly8gcmV0cmlldmUgcGFyc2VkIGN1cnJlbnRTcmMsIGlmIGFueVxuXHRcdGVsLmN1cnJlbnRTcmMgPSBlbFtwZi5uc10uY3VyU3JjIHx8IGVsLnNyYztcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRTdHlsZShlbCkge1xuXHR2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsKS5mb250RmFtaWx5O1xuXHR2YXIgcGFyc2VkO1xuXHR2YXIgcHJvcHMgPSB7fTtcblx0d2hpbGUgKChwYXJzZWQgPSBwcm9wUmVnZXguZXhlYyhzdHlsZSkpICE9PSBudWxsKSB7XG5cdFx0cHJvcHNbcGFyc2VkWzFdXSA9IHBhcnNlZFsyXTtcblx0fVxuXHRyZXR1cm4gcHJvcHM7XG59XG5cbmZ1bmN0aW9uIHNldFBsYWNlaG9sZGVyKGltZywgd2lkdGgsIGhlaWdodCkge1xuXHQvLyBEZWZhdWx0OiBmaWxsIHdpZHRoLCBubyBoZWlnaHRcblx0dmFyIHBsYWNlaG9sZGVyID0gY3JlYXRlUGxhY2Vob2xkZXIod2lkdGggfHwgMSwgaGVpZ2h0IHx8IDApO1xuXG5cdC8vIE9ubHkgc2V0IHBsYWNlaG9sZGVyIGlmIGl0J3MgZGlmZmVyZW50XG5cdGlmIChuYXRpdmVHZXRBdHRyaWJ1dGUuY2FsbChpbWcsICdzcmMnKSAhPT0gcGxhY2Vob2xkZXIpIHtcblx0XHRuYXRpdmVTZXRBdHRyaWJ1dGUuY2FsbChpbWcsICdzcmMnLCBwbGFjZWhvbGRlcik7XG5cdH1cbn1cblxuZnVuY3Rpb24gb25JbWFnZVJlYWR5KGltZywgY2FsbGJhY2spIHtcblx0Ly8gbmF0dXJhbFdpZHRoIGlzIG9ubHkgYXZhaWxhYmxlIHdoZW4gdGhlIGltYWdlIGhlYWRlcnMgYXJlIGxvYWRlZCxcblx0Ly8gdGhpcyBsb29wIHdpbGwgcG9sbCBpdCBldmVyeSAxMDBtcy5cblx0aWYgKGltZy5uYXR1cmFsV2lkdGgpIHtcblx0XHRjYWxsYmFjayhpbWcpO1xuXHR9IGVsc2Uge1xuXHRcdHNldFRpbWVvdXQob25JbWFnZVJlYWR5LCAxMDAsIGltZywgY2FsbGJhY2spO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGZpeE9uZShlbCkge1xuXHR2YXIgc3R5bGUgPSBnZXRTdHlsZShlbCk7XG5cdHZhciBvZmkgPSBlbFtPRkldO1xuXHRzdHlsZVsnb2JqZWN0LWZpdCddID0gc3R5bGVbJ29iamVjdC1maXQnXSB8fCAnZmlsbCc7IC8vIGRlZmF1bHQgdmFsdWVcblxuXHQvLyBBdm9pZCBydW5uaW5nIHdoZXJlIHVubmVjZXNzYXJ5LCB1bmxlc3MgT0ZJIGhhZCBhbHJlYWR5IGRvbmUgaXRzIGRlZWRcblx0aWYgKCFvZmkuaW1nKSB7XG5cdFx0Ly8gZmlsbCBpcyB0aGUgZGVmYXVsdCBiZWhhdmlvciBzbyBubyBhY3Rpb24gaXMgbmVjZXNzYXJ5XG5cdFx0aWYgKHN0eWxlWydvYmplY3QtZml0J10gPT09ICdmaWxsJykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFdoZXJlIG9iamVjdC1maXQgaXMgc3VwcG9ydGVkIGFuZCBvYmplY3QtcG9zaXRpb24gaXNuJ3QgKFNhZmFyaSA8IDEwKVxuXHRcdGlmIChcblx0XHRcdCFvZmkuc2tpcFRlc3QgJiYgLy8gdW5sZXNzIHVzZXIgd2FudHMgdG8gYXBwbHkgcmVnYXJkbGVzcyBvZiBicm93c2VyIHN1cHBvcnRcblx0XHRcdHN1cHBvcnRzT2JqZWN0Rml0ICYmIC8vIGlmIGJyb3dzZXIgYWxyZWFkeSBzdXBwb3J0cyBvYmplY3QtZml0XG5cdFx0XHQhc3R5bGVbJ29iamVjdC1wb3NpdGlvbiddIC8vIHVubGVzcyBvYmplY3QtcG9zaXRpb24gaXMgdXNlZFxuXHRcdCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0fVxuXG5cdC8vIGtlZXAgYSBjbG9uZSBpbiBtZW1vcnkgd2hpbGUgcmVzZXR0aW5nIHRoZSBvcmlnaW5hbCB0byBhIGJsYW5rXG5cdGlmICghb2ZpLmltZykge1xuXHRcdG9maS5pbWcgPSBuZXcgSW1hZ2UoZWwud2lkdGgsIGVsLmhlaWdodCk7XG5cdFx0b2ZpLmltZy5zcmNzZXQgPSBuYXRpdmVHZXRBdHRyaWJ1dGUuY2FsbChlbCwgXCJkYXRhLW9maS1zcmNzZXRcIikgfHwgZWwuc3Jjc2V0O1xuXHRcdG9maS5pbWcuc3JjID0gbmF0aXZlR2V0QXR0cmlidXRlLmNhbGwoZWwsIFwiZGF0YS1vZmktc3JjXCIpIHx8IGVsLnNyYztcblxuXHRcdC8vIHByZXNlcnZlIGZvciBhbnkgZnV0dXJlIGNsb25lTm9kZSBjYWxsc1xuXHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9iZnJlZC1pdC9vYmplY3QtZml0LWltYWdlcy9pc3N1ZXMvNTNcblx0XHRuYXRpdmVTZXRBdHRyaWJ1dGUuY2FsbChlbCwgXCJkYXRhLW9maS1zcmNcIiwgZWwuc3JjKTtcblx0XHRpZiAoZWwuc3Jjc2V0KSB7XG5cdFx0XHRuYXRpdmVTZXRBdHRyaWJ1dGUuY2FsbChlbCwgXCJkYXRhLW9maS1zcmNzZXRcIiwgZWwuc3Jjc2V0KTtcblx0XHR9XG5cblx0XHRzZXRQbGFjZWhvbGRlcihlbCwgZWwubmF0dXJhbFdpZHRoIHx8IGVsLndpZHRoLCBlbC5uYXR1cmFsSGVpZ2h0IHx8IGVsLmhlaWdodCk7XG5cblx0XHQvLyByZW1vdmUgc3Jjc2V0IGJlY2F1c2UgaXQgb3ZlcnJpZGVzIHNyY1xuXHRcdGlmIChlbC5zcmNzZXQpIHtcblx0XHRcdGVsLnNyY3NldCA9ICcnO1xuXHRcdH1cblx0XHR0cnkge1xuXHRcdFx0a2VlcFNyY1VzYWJsZShlbCk7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRpZiAod2luZG93LmNvbnNvbGUpIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKCdodHRwczovL2JpdC5seS9vZmktb2xkLWJyb3dzZXInKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRwb2x5ZmlsbEN1cnJlbnRTcmMob2ZpLmltZyk7XG5cblx0ZWwuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoXFxcIlwiICsgKChvZmkuaW1nLmN1cnJlbnRTcmMgfHwgb2ZpLmltZy5zcmMpLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKSkgKyBcIlxcXCIpXCI7XG5cdGVsLnN0eWxlLmJhY2tncm91bmRQb3NpdGlvbiA9IHN0eWxlWydvYmplY3QtcG9zaXRpb24nXSB8fCAnY2VudGVyJztcblx0ZWwuc3R5bGUuYmFja2dyb3VuZFJlcGVhdCA9ICduby1yZXBlYXQnO1xuXHRlbC5zdHlsZS5iYWNrZ3JvdW5kT3JpZ2luID0gJ2NvbnRlbnQtYm94JztcblxuXHRpZiAoL3NjYWxlLWRvd24vLnRlc3Qoc3R5bGVbJ29iamVjdC1maXQnXSkpIHtcblx0XHRvbkltYWdlUmVhZHkob2ZpLmltZywgZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKG9maS5pbWcubmF0dXJhbFdpZHRoID4gZWwud2lkdGggfHwgb2ZpLmltZy5uYXR1cmFsSGVpZ2h0ID4gZWwuaGVpZ2h0KSB7XG5cdFx0XHRcdGVsLnN0eWxlLmJhY2tncm91bmRTaXplID0gJ2NvbnRhaW4nO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZWwuc3R5bGUuYmFja2dyb3VuZFNpemUgPSAnYXV0byc7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0ZWwuc3R5bGUuYmFja2dyb3VuZFNpemUgPSBzdHlsZVsnb2JqZWN0LWZpdCddLnJlcGxhY2UoJ25vbmUnLCAnYXV0bycpLnJlcGxhY2UoJ2ZpbGwnLCAnMTAwJSAxMDAlJyk7XG5cdH1cblxuXHRvbkltYWdlUmVhZHkob2ZpLmltZywgZnVuY3Rpb24gKGltZykge1xuXHRcdHNldFBsYWNlaG9sZGVyKGVsLCBpbWcubmF0dXJhbFdpZHRoLCBpbWcubmF0dXJhbEhlaWdodCk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBrZWVwU3JjVXNhYmxlKGVsKSB7XG5cdHZhciBkZXNjcmlwdG9ycyA9IHtcblx0XHRnZXQ6IGZ1bmN0aW9uIGdldChwcm9wKSB7XG5cdFx0XHRyZXR1cm4gZWxbT0ZJXS5pbWdbcHJvcCA/IHByb3AgOiAnc3JjJ107XG5cdFx0fSxcblx0XHRzZXQ6IGZ1bmN0aW9uIHNldCh2YWx1ZSwgcHJvcCkge1xuXHRcdFx0ZWxbT0ZJXS5pbWdbcHJvcCA/IHByb3AgOiAnc3JjJ10gPSB2YWx1ZTtcblx0XHRcdG5hdGl2ZVNldEF0dHJpYnV0ZS5jYWxsKGVsLCAoXCJkYXRhLW9maS1cIiArIHByb3ApLCB2YWx1ZSk7IC8vIHByZXNlcnZlIGZvciBhbnkgZnV0dXJlIGNsb25lTm9kZVxuXHRcdFx0Zml4T25lKGVsKTtcblx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9XG5cdH07XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbCwgJ3NyYycsIGRlc2NyaXB0b3JzKTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGVsLCAnY3VycmVudFNyYycsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGRlc2NyaXB0b3JzLmdldCgnY3VycmVudFNyYycpOyB9XG5cdH0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZWwsICdzcmNzZXQnLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBkZXNjcmlwdG9ycy5nZXQoJ3NyY3NldCcpOyB9LFxuXHRcdHNldDogZnVuY3Rpb24gKHNzKSB7IHJldHVybiBkZXNjcmlwdG9ycy5zZXQoc3MsICdzcmNzZXQnKTsgfVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gaGlqYWNrQXR0cmlidXRlcygpIHtcblx0ZnVuY3Rpb24gZ2V0T2ZpSW1hZ2VNYXliZShlbCwgbmFtZSkge1xuXHRcdHJldHVybiBlbFtPRkldICYmIGVsW09GSV0uaW1nICYmIChuYW1lID09PSAnc3JjJyB8fCBuYW1lID09PSAnc3Jjc2V0JykgPyBlbFtPRkldLmltZyA6IGVsO1xuXHR9XG5cdGlmICghc3VwcG9ydHNPYmplY3RQb3NpdGlvbikge1xuXHRcdEhUTUxJbWFnZUVsZW1lbnQucHJvdG90eXBlLmdldEF0dHJpYnV0ZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG5cdFx0XHRyZXR1cm4gbmF0aXZlR2V0QXR0cmlidXRlLmNhbGwoZ2V0T2ZpSW1hZ2VNYXliZSh0aGlzLCBuYW1lKSwgbmFtZSk7XG5cdFx0fTtcblxuXHRcdEhUTUxJbWFnZUVsZW1lbnQucHJvdG90eXBlLnNldEF0dHJpYnV0ZSA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuXHRcdFx0cmV0dXJuIG5hdGl2ZVNldEF0dHJpYnV0ZS5jYWxsKGdldE9maUltYWdlTWF5YmUodGhpcywgbmFtZSksIG5hbWUsIFN0cmluZyh2YWx1ZSkpO1xuXHRcdH07XG5cdH1cbn1cblxuZnVuY3Rpb24gZml4KGltZ3MsIG9wdHMpIHtcblx0dmFyIHN0YXJ0QXV0b01vZGUgPSAhYXV0b01vZGVFbmFibGVkICYmICFpbWdzO1xuXHRvcHRzID0gb3B0cyB8fCB7fTtcblx0aW1ncyA9IGltZ3MgfHwgJ2ltZyc7XG5cblx0aWYgKChzdXBwb3J0c09iamVjdFBvc2l0aW9uICYmICFvcHRzLnNraXBUZXN0KSB8fCAhc3VwcG9ydHNPRkkpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyB1c2UgaW1ncyBhcyBhIHNlbGVjdG9yIG9yIGp1c3Qgc2VsZWN0IGFsbCBpbWFnZXNcblx0aWYgKGltZ3MgPT09ICdpbWcnKSB7XG5cdFx0aW1ncyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWcnKTtcblx0fSBlbHNlIGlmICh0eXBlb2YgaW1ncyA9PT0gJ3N0cmluZycpIHtcblx0XHRpbWdzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChpbWdzKTtcblx0fSBlbHNlIGlmICghKCdsZW5ndGgnIGluIGltZ3MpKSB7XG5cdFx0aW1ncyA9IFtpbWdzXTtcblx0fVxuXG5cdC8vIGFwcGx5IGZpeCB0byBhbGxcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBpbWdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0aW1nc1tpXVtPRkldID0gaW1nc1tpXVtPRkldIHx8IHtcblx0XHRcdHNraXBUZXN0OiBvcHRzLnNraXBUZXN0XG5cdFx0fTtcblx0XHRmaXhPbmUoaW1nc1tpXSk7XG5cdH1cblxuXHRpZiAoc3RhcnRBdXRvTW9kZSkge1xuXHRcdGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRpZiAoZS50YXJnZXQudGFnTmFtZSA9PT0gJ0lNRycpIHtcblx0XHRcdFx0Zml4KGUudGFyZ2V0LCB7XG5cdFx0XHRcdFx0c2tpcFRlc3Q6IG9wdHMuc2tpcFRlc3Rcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSwgdHJ1ZSk7XG5cdFx0YXV0b01vZGVFbmFibGVkID0gdHJ1ZTtcblx0XHRpbWdzID0gJ2ltZyc7IC8vIHJlc2V0IHRvIGEgZ2VuZXJpYyBzZWxlY3RvciBmb3Igd2F0Y2hNUVxuXHR9XG5cblx0Ly8gaWYgcmVxdWVzdGVkLCB3YXRjaCBtZWRpYSBxdWVyaWVzIGZvciBvYmplY3QtZml0IGNoYW5nZVxuXHRpZiAob3B0cy53YXRjaE1RKSB7XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGZpeC5iaW5kKG51bGwsIGltZ3MsIHtcblx0XHRcdHNraXBUZXN0OiBvcHRzLnNraXBUZXN0XG5cdFx0fSkpO1xuXHR9XG59XG5cbmZpeC5zdXBwb3J0c09iamVjdEZpdCA9IHN1cHBvcnRzT2JqZWN0Rml0O1xuZml4LnN1cHBvcnRzT2JqZWN0UG9zaXRpb24gPSBzdXBwb3J0c09iamVjdFBvc2l0aW9uO1xuXG5oaWphY2tBdHRyaWJ1dGVzKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZml4O1xuIiwiaW1wb3J0IG9iamVjdEZpdEltYWdlcyBmcm9tICdvYmplY3QtZml0LWltYWdlcyc7XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHtcbiAgb2JqZWN0Rml0SW1hZ2VzKCdpbWcub2JqZWN0LWZpdCcpO1xufTtcbiIsImV4cG9ydCBkZWZhdWx0ICgpID0+IHtcbiAgY29uc3QgQVBJID0gJ2F1dGhvcml6YXRpb24nO1xuXG4gIGxldCAkZm9ybSA9ICQoJy5qcy1hdXRob3JpemF0aW9uJyk7XG4gIGxldCAkc3VibWl0QnRuID0gJGZvcm0uZmluZCgnYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKTtcblxuICAkc3VibWl0QnRuLm9mZignY2xpY2sucmVnaXN0cmF0aW9uJykub24oJ2NsaWNrLnJlZ2lzdHJhdGlvbicsIGV2ZW50ID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGxldCBkYXRhID0gJGZvcm0uc2VyaWFsaXplQXJyYXkoKTtcblxuICAgICQuYWpheCh7XG4gICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICB1cmw6IGBodHRwOi8vbXZjc2hvcC5jb20vJHtBUEl9YCxcbiAgICAgIGRhdGEsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgIH0pO1xuICB9KTtcbn07XG4iLCJleHBvcnQgZGVmYXVsdCAoKSA9PiBjb25zb2xlLmxvZygnaGVubG8nKTtcbiIsImltcG9ydCAnc3ZneHVzZSc7XG5pbXBvcnQgb2JqZWN0Rml0SW1hZ2VzIGZyb20gJy4vcG9seWZpbGxzL29iamVjdEZpdEltYWdlcyc7XG5cbmltcG9ydCBhdXRvcml6YXRpb24gZnJvbSAnLi9tb2R1bGVzL2F1dGhvcml6YXRpb24nO1xuaW1wb3J0IHJlZ2lzdHJhdGlvbiBmcm9tICcuL21vZHVsZXMvcmVnaXN0cmF0aW9uJztcblxub2JqZWN0Rml0SW1hZ2VzKCk7XG5hdXRvcml6YXRpb24oKTtcbnJlZ2lzdHJhdGlvbigpO1xuIl0sIm5hbWVzIjpbIm9iamVjdEZpdEltYWdlcyIsIkFQSSIsIiRmb3JtIiwiJCIsIiRzdWJtaXRCdG4iLCJmaW5kIiwib2ZmIiwib24iLCJldmVudCIsInByZXZlbnREZWZhdWx0IiwiZGF0YSIsInNlcmlhbGl6ZUFycmF5IiwiYWpheCIsInR5cGUiLCJ1cmwiLCJkYXRhVHlwZSIsImNvbnNvbGUiLCJsb2ciLCJhdXRvcml6YXRpb24iLCJyZWdpc3RyYXRpb24iXSwibWFwcGluZ3MiOiI7Ozs7O0lBQUE7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBLENBQUMsWUFBWTtJQUViLElBQUksSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXLElBQUksTUFBTSxDQUFDLGdCQUFnQixFQUFFO0lBQ2xFLFFBQVEsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QyxRQUFRLElBQUksYUFBYSxDQUFDO0lBQzFCLFFBQVEsSUFBSSxHQUFHLENBQUM7SUFDaEIsUUFBUSxJQUFJLGNBQWMsR0FBRyxZQUFZO0lBQ3pDLFlBQVksWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzlCLFlBQVksR0FBRyxHQUFHLFVBQVUsQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakQsU0FBUyxDQUFDO0lBQ1YsUUFBUSxJQUFJLGdCQUFnQixHQUFHLFlBQVk7SUFDM0MsWUFBWSxPQUFPO0lBQ25CLFNBQVMsQ0FBQztJQUNWLFFBQVEsSUFBSSxjQUFjLEdBQUcsWUFBWTtJQUN6QyxZQUFZLElBQUksUUFBUSxDQUFDO0lBQ3pCLFlBQVksTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDckUsWUFBWSxNQUFNLENBQUMsZ0JBQWdCLENB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
