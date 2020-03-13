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

    objectFitImages();

})));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9zdmd4dXNlL3N2Z3h1c2UuanMiLCJub2RlX21vZHVsZXMvb2JqZWN0LWZpdC1pbWFnZXMvZGlzdC9vZmkuY29tbW9uLWpzLmpzIiwic3JjL2Fzc2V0cy9zY3JpcHRzL3BvbHlmaWxscy9vYmplY3RGaXRJbWFnZXMuanMiLCJzcmMvYXNzZXRzL3NjcmlwdHMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNyBJY29Nb29uLmlvXG4gKiBAbGljZW5zZSAgIExpY2Vuc2VkIHVuZGVyIE1JVCBsaWNlbnNlXG4gKiAgICAgICAgICAgIFNlZSBodHRwczovL2dpdGh1Yi5jb20vS2V5YW1vb24vc3ZneHVzZVxuICogQHZlcnNpb24gICAxLjIuNlxuICovXG4vKmpzbGludCBicm93c2VyOiB0cnVlICovXG4vKmdsb2JhbCBYRG9tYWluUmVxdWVzdCwgTXV0YXRpb25PYnNlcnZlciwgd2luZG93ICovXG4oZnVuY3Rpb24gKCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgIHZhciBjYWNoZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7IC8vIGhvbGRzIHhociBvYmplY3RzIHRvIHByZXZlbnQgbXVsdGlwbGUgcmVxdWVzdHNcbiAgICAgICAgdmFyIGNoZWNrVXNlRWxlbXM7XG4gICAgICAgIHZhciB0aWQ7IC8vIHRpbWVvdXQgaWRcbiAgICAgICAgdmFyIGRlYm91bmNlZENoZWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpZCk7XG4gICAgICAgICAgICB0aWQgPSBzZXRUaW1lb3V0KGNoZWNrVXNlRWxlbXMsIDEwMCk7XG4gICAgICAgIH07XG4gICAgICAgIHZhciB1bm9ic2VydmVDaGFuZ2VzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgb2JzZXJ2ZUNoYW5nZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXI7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBkZWJvdW5jZWRDaGVjaywgZmFsc2UpO1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJvcmllbnRhdGlvbmNoYW5nZVwiLCBkZWJvdW5jZWRDaGVjaywgZmFsc2UpO1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihkZWJvdW5jZWRDaGVjayk7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdW5vYnNlcnZlQ2hhbmdlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIGRlYm91bmNlZENoZWNrLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm9yaWVudGF0aW9uY2hhbmdlXCIsIGRlYm91bmNlZENoZWNrLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGlnbm9yZSkge31cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTVN1YnRyZWVNb2RpZmllZFwiLCBkZWJvdW5jZWRDaGVjaywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIHVub2JzZXJ2ZUNoYW5nZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiRE9NU3VidHJlZU1vZGlmaWVkXCIsIGRlYm91bmNlZENoZWNrLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIGRlYm91bmNlZENoZWNrLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwib3JpZW50YXRpb25jaGFuZ2VcIiwgZGVib3VuY2VkQ2hlY2ssIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB2YXIgY3JlYXRlUmVxdWVzdCA9IGZ1bmN0aW9uICh1cmwpIHtcbiAgICAgICAgICAgIC8vIEluIElFIDksIGNyb3NzIG9yaWdpbiByZXF1ZXN0cyBjYW4gb25seSBiZSBzZW50IHVzaW5nIFhEb21haW5SZXF1ZXN0LlxuICAgICAgICAgICAgLy8gWERvbWFpblJlcXVlc3Qgd291bGQgZmFpbCBpZiBDT1JTIGhlYWRlcnMgYXJlIG5vdCBzZXQuXG4gICAgICAgICAgICAvLyBUaGVyZWZvcmUsIFhEb21haW5SZXF1ZXN0IHNob3VsZCBvbmx5IGJlIHVzZWQgd2l0aCBjcm9zcyBvcmlnaW4gcmVxdWVzdHMuXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRPcmlnaW4obG9jKSB7XG4gICAgICAgICAgICAgICAgdmFyIGE7XG4gICAgICAgICAgICAgICAgaWYgKGxvYy5wcm90b2NvbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGEgPSBsb2M7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgICAgICAgICAgICAgICAgICBhLmhyZWYgPSBsb2M7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBhLnByb3RvY29sLnJlcGxhY2UoLzovZywgXCJcIikgKyBhLmhvc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgUmVxdWVzdDtcbiAgICAgICAgICAgIHZhciBvcmlnaW47XG4gICAgICAgICAgICB2YXIgb3JpZ2luMjtcbiAgICAgICAgICAgIGlmICh3aW5kb3cuWE1MSHR0cFJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICBSZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgb3JpZ2luID0gZ2V0T3JpZ2luKGxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICBvcmlnaW4yID0gZ2V0T3JpZ2luKHVybCk7XG4gICAgICAgICAgICAgICAgaWYgKFJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID09PSB1bmRlZmluZWQgJiYgb3JpZ2luMiAhPT0gXCJcIiAmJiBvcmlnaW4yICE9PSBvcmlnaW4pIHtcbiAgICAgICAgICAgICAgICAgICAgUmVxdWVzdCA9IFhEb21haW5SZXF1ZXN0IHx8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBSZXF1ZXN0ID0gWE1MSHR0cFJlcXVlc3Q7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFJlcXVlc3Q7XG4gICAgICAgIH07XG4gICAgICAgIHZhciB4bGlua05TID0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCI7XG4gICAgICAgIGNoZWNrVXNlRWxlbXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZTtcbiAgICAgICAgICAgIHZhciBiY3I7XG4gICAgICAgICAgICB2YXIgZmFsbGJhY2sgPSBcIlwiOyAvLyBvcHRpb25hbCBmYWxsYmFjayBVUkwgaW4gY2FzZSBubyBiYXNlIHBhdGggdG8gU1ZHIGZpbGUgd2FzIGdpdmVuIGFuZCBubyBzeW1ib2wgZGVmaW5pdGlvbiB3YXMgZm91bmQuXG4gICAgICAgICAgICB2YXIgaGFzaDtcbiAgICAgICAgICAgIHZhciBocmVmO1xuICAgICAgICAgICAgdmFyIGk7XG4gICAgICAgICAgICB2YXIgaW5Qcm9ncmVzc0NvdW50ID0gMDtcbiAgICAgICAgICAgIHZhciBpc0hpZGRlbjtcbiAgICAgICAgICAgIHZhciBSZXF1ZXN0O1xuICAgICAgICAgICAgdmFyIHVybDtcbiAgICAgICAgICAgIHZhciB1c2VzO1xuICAgICAgICAgICAgdmFyIHhocjtcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9ic2VydmVJZkRvbmUoKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgZG9uZSB3aXRoIG1ha2luZyBjaGFuZ2VzLCBzdGFydCB3YXRjaGluZyBmb3IgY2hhZ25lcyBpbiBET00gYWdhaW5cbiAgICAgICAgICAgICAgICBpblByb2dyZXNzQ291bnQgLT0gMTtcbiAgICAgICAgICAgICAgICBpZiAoaW5Qcm9ncmVzc0NvdW50ID09PSAwKSB7IC8vIGlmIGFsbCB4aHJzIHdlcmUgcmVzb2x2ZWRcbiAgICAgICAgICAgICAgICAgICAgdW5vYnNlcnZlQ2hhbmdlcygpOyAvLyBtYWtlIHN1cmUgdG8gcmVtb3ZlIG9sZCBoYW5kbGVyc1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlQ2hhbmdlcygpOyAvLyB3YXRjaCBmb3IgY2hhbmdlcyB0byBET01cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBhdHRyVXBkYXRlRnVuYyhzcGVjKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhY2hlW3NwZWMuYmFzZV0gIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwZWMudXNlRWwuc2V0QXR0cmlidXRlTlMoeGxpbmtOUywgXCJ4bGluazpocmVmXCIsIFwiI1wiICsgc3BlYy5oYXNoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzcGVjLnVzZUVsLmhhc0F0dHJpYnV0ZShcImhyZWZcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVjLnVzZUVsLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgXCIjXCIgKyBzcGVjLmhhc2gpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIG9ubG9hZEZ1bmMoeGhyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJvZHkgPSBkb2N1bWVudC5ib2R5O1xuICAgICAgICAgICAgICAgICAgICB2YXIgeCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ4XCIpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3ZnO1xuICAgICAgICAgICAgICAgICAgICB4aHIub25sb2FkID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgeC5pbm5lckhUTUwgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgICAgICAgICBzdmcgPSB4LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic3ZnXCIpWzBdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3ZnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdmcuc2V0QXR0cmlidXRlKFwiYXJpYS1oaWRkZW5cIiwgXCJ0cnVlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLnN0eWxlLndpZHRoID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Zy5zdHlsZS5oZWlnaHQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLnN0eWxlLm92ZXJmbG93ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHkuaW5zZXJ0QmVmb3JlKHN2ZywgYm9keS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlSWZEb25lKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uRXJyb3JUaW1lb3V0KHhocikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHhoci5vbmVycm9yID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgeGhyLm9udGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVJZkRvbmUoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdW5vYnNlcnZlQ2hhbmdlcygpOyAvLyBzdG9wIHdhdGNoaW5nIGZvciBjaGFuZ2VzIHRvIERPTVxuICAgICAgICAgICAgLy8gZmluZCBhbGwgdXNlIGVsZW1lbnRzXG4gICAgICAgICAgICB1c2VzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ1c2VcIik7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdXNlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGJjciA9IHVzZXNbaV0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoaWdub3JlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGZhaWxlZCB0byBnZXQgYm91bmRpbmcgcmVjdGFuZ2xlIG9mIHRoZSB1c2UgZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICBiY3IgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaHJlZiA9IHVzZXNbaV0uZ2V0QXR0cmlidXRlKFwiaHJlZlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgdXNlc1tpXS5nZXRBdHRyaWJ1dGVOUyh4bGlua05TLCBcImhyZWZcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IHVzZXNbaV0uZ2V0QXR0cmlidXRlKFwieGxpbms6aHJlZlwiKTtcbiAgICAgICAgICAgICAgICBpZiAoaHJlZiAmJiBocmVmLnNwbGl0KSB7XG4gICAgICAgICAgICAgICAgICAgIHVybCA9IGhyZWYuc3BsaXQoXCIjXCIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHVybCA9IFtcIlwiLCBcIlwiXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYmFzZSA9IHVybFswXTtcbiAgICAgICAgICAgICAgICBoYXNoID0gdXJsWzFdO1xuICAgICAgICAgICAgICAgIGlzSGlkZGVuID0gYmNyICYmIGJjci5sZWZ0ID09PSAwICYmIGJjci5yaWdodCA9PT0gMCAmJiBiY3IudG9wID09PSAwICYmIGJjci5ib3R0b20gPT09IDA7XG4gICAgICAgICAgICAgICAgaWYgKGJjciAmJiBiY3Iud2lkdGggPT09IDAgJiYgYmNyLmhlaWdodCA9PT0gMCAmJiAhaXNIaWRkZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHVzZSBlbGVtZW50IGlzIGVtcHR5XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIGEgcmVmZXJlbmNlIHRvIGFuIGV4dGVybmFsIFNWRywgdHJ5IHRvIGZldGNoIGl0XG4gICAgICAgICAgICAgICAgICAgIC8vIHVzZSB0aGUgb3B0aW9uYWwgZmFsbGJhY2sgVVJMIGlmIHRoZXJlIGlzIG5vIHJlZmVyZW5jZSB0byBhbiBleHRlcm5hbCBTVkdcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZhbGxiYWNrICYmICFiYXNlLmxlbmd0aCAmJiBoYXNoICYmICFkb2N1bWVudC5nZXRFbGVtZW50QnlJZChoYXNoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZSA9IGZhbGxiYWNrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh1c2VzW2ldLmhhc0F0dHJpYnV0ZShcImhyZWZcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXNbaV0uc2V0QXR0cmlidXRlTlMoeGxpbmtOUywgXCJ4bGluazpocmVmXCIsIGhyZWYpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChiYXNlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2NoZWR1bGUgdXBkYXRpbmcgeGxpbms6aHJlZlxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyID0gY2FjaGVbYmFzZV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoeGhyICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdHJ1ZSBzaWduaWZpZXMgdGhhdCBwcmVwZW5kaW5nIHRoZSBTVkcgd2FzIG5vdCByZXF1aXJlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoYXR0clVwZGF0ZUZ1bmMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VFbDogdXNlc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZTogYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzaDogaGFzaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh4aHIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlcXVlc3QgPSBjcmVhdGVSZXF1ZXN0KGJhc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChSZXF1ZXN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeGhyID0gbmV3IFJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGVbYmFzZV0gPSB4aHI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhoci5vbmxvYWQgPSBvbmxvYWRGdW5jKHhocik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhoci5vbmVycm9yID0gb25FcnJvclRpbWVvdXQoeGhyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeGhyLm9udGltZW91dCA9IG9uRXJyb3JUaW1lb3V0KHhocik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhoci5vcGVuKFwiR0VUXCIsIGJhc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHIuc2VuZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblByb2dyZXNzQ291bnQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzSGlkZGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FjaGVbYmFzZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbWVtYmVyIHRoaXMgVVJMIGlmIHRoZSB1c2UgZWxlbWVudCB3YXMgbm90IGVtcHR5IGFuZCBubyByZXF1ZXN0IHdhcyBzZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGVbYmFzZV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjYWNoZVtiYXNlXS5vbmxvYWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBpdCB0dXJucyBvdXQgdGhhdCBwcmVwZW5kaW5nIHRoZSBTVkcgaXMgbm90IG5lY2Vzc2FyeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhYm9ydCB0aGUgaW4tcHJvZ3Jlc3MgeGhyLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlW2Jhc2VdLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNhY2hlW2Jhc2VdLm9ubG9hZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZVtiYXNlXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYmFzZS5sZW5ndGggJiYgY2FjaGVbYmFzZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoYXR0clVwZGF0ZUZ1bmMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZUVsOiB1c2VzW2ldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2U6IGJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzaDogaGFzaFxuICAgICAgICAgICAgICAgICAgICAgICAgfSksIDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXNlcyA9IFwiXCI7XG4gICAgICAgICAgICBpblByb2dyZXNzQ291bnQgKz0gMTtcbiAgICAgICAgICAgIG9ic2VydmVJZkRvbmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHdpbkxvYWQ7XG4gICAgICAgIHdpbkxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgd2luTG9hZCwgZmFsc2UpOyAvLyB0byBwcmV2ZW50IG1lbW9yeSBsZWFrc1xuICAgICAgICAgICAgdGlkID0gc2V0VGltZW91dChjaGVja1VzZUVsZW1zLCAwKTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09IFwiY29tcGxldGVcIikge1xuICAgICAgICAgICAgLy8gVGhlIGxvYWQgZXZlbnQgZmlyZXMgd2hlbiBhbGwgcmVzb3VyY2VzIGhhdmUgZmluaXNoZWQgbG9hZGluZywgd2hpY2ggYWxsb3dzIGRldGVjdGluZyB3aGV0aGVyIFNWRyB1c2UgZWxlbWVudHMgYXJlIGVtcHR5LlxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIHdpbkxvYWQsIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE5vIG5lZWQgdG8gYWRkIGEgbGlzdGVuZXIgaWYgdGhlIGRvY3VtZW50IGlzIGFscmVhZHkgbG9hZGVkLCBpbml0aWFsaXplIGltbWVkaWF0ZWx5LlxuICAgICAgICAgICAgd2luTG9hZCgpO1xuICAgICAgICB9XG4gICAgfVxufSgpKTtcbiIsIi8qISBucG0uaW0vb2JqZWN0LWZpdC1pbWFnZXMgMy4yLjQgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIE9GSSA9ICdiZnJlZC1pdDpvYmplY3QtZml0LWltYWdlcyc7XG52YXIgcHJvcFJlZ2V4ID0gLyhvYmplY3QtZml0fG9iamVjdC1wb3NpdGlvbilcXHMqOlxccyooWy0uXFx3XFxzJV0rKS9nO1xudmFyIHRlc3RJbWcgPSB0eXBlb2YgSW1hZ2UgPT09ICd1bmRlZmluZWQnID8ge3N0eWxlOiB7J29iamVjdC1wb3NpdGlvbic6IDF9fSA6IG5ldyBJbWFnZSgpO1xudmFyIHN1cHBvcnRzT2JqZWN0Rml0ID0gJ29iamVjdC1maXQnIGluIHRlc3RJbWcuc3R5bGU7XG52YXIgc3VwcG9ydHNPYmplY3RQb3NpdGlvbiA9ICdvYmplY3QtcG9zaXRpb24nIGluIHRlc3RJbWcuc3R5bGU7XG52YXIgc3VwcG9ydHNPRkkgPSAnYmFja2dyb3VuZC1zaXplJyBpbiB0ZXN0SW1nLnN0eWxlO1xudmFyIHN1cHBvcnRzQ3VycmVudFNyYyA9IHR5cGVvZiB0ZXN0SW1nLmN1cnJlbnRTcmMgPT09ICdzdHJpbmcnO1xudmFyIG5hdGl2ZUdldEF0dHJpYnV0ZSA9IHRlc3RJbWcuZ2V0QXR0cmlidXRlO1xudmFyIG5hdGl2ZVNldEF0dHJpYnV0ZSA9IHRlc3RJbWcuc2V0QXR0cmlidXRlO1xudmFyIGF1dG9Nb2RlRW5hYmxlZCA9IGZhbHNlO1xuXG5mdW5jdGlvbiBjcmVhdGVQbGFjZWhvbGRlcih3LCBoKSB7XG5cdHJldHVybiAoXCJkYXRhOmltYWdlL3N2Zyt4bWwsJTNDc3ZnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zycgd2lkdGg9J1wiICsgdyArIFwiJyBoZWlnaHQ9J1wiICsgaCArIFwiJyUzRSUzQy9zdmclM0VcIik7XG59XG5cbmZ1bmN0aW9uIHBvbHlmaWxsQ3VycmVudFNyYyhlbCkge1xuXHRpZiAoZWwuc3Jjc2V0ICYmICFzdXBwb3J0c0N1cnJlbnRTcmMgJiYgd2luZG93LnBpY3R1cmVmaWxsKSB7XG5cdFx0dmFyIHBmID0gd2luZG93LnBpY3R1cmVmaWxsLl87XG5cdFx0Ly8gcGFyc2Ugc3Jjc2V0IHdpdGggcGljdHVyZWZpbGwgd2hlcmUgY3VycmVudFNyYyBpc24ndCBhdmFpbGFibGVcblx0XHRpZiAoIWVsW3BmLm5zXSB8fCAhZWxbcGYubnNdLmV2YWxlZCkge1xuXHRcdFx0Ly8gZm9yY2Ugc3luY2hyb25vdXMgc3Jjc2V0IHBhcnNpbmdcblx0XHRcdHBmLmZpbGxJbWcoZWwsIHtyZXNlbGVjdDogdHJ1ZX0pO1xuXHRcdH1cblxuXHRcdGlmICghZWxbcGYubnNdLmN1clNyYykge1xuXHRcdFx0Ly8gZm9yY2UgcGljdHVyZWZpbGwgdG8gcGFyc2Ugc3Jjc2V0XG5cdFx0XHRlbFtwZi5uc10uc3VwcG9ydGVkID0gZmFsc2U7XG5cdFx0XHRwZi5maWxsSW1nKGVsLCB7cmVzZWxlY3Q6IHRydWV9KTtcblx0XHR9XG5cblx0XHQvLyByZXRyaWV2ZSBwYXJzZWQgY3VycmVudFNyYywgaWYgYW55XG5cdFx0ZWwuY3VycmVudFNyYyA9IGVsW3BmLm5zXS5jdXJTcmMgfHwgZWwuc3JjO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldFN0eWxlKGVsKSB7XG5cdHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWwpLmZvbnRGYW1pbHk7XG5cdHZhciBwYXJzZWQ7XG5cdHZhciBwcm9wcyA9IHt9O1xuXHR3aGlsZSAoKHBhcnNlZCA9IHByb3BSZWdleC5leGVjKHN0eWxlKSkgIT09IG51bGwpIHtcblx0XHRwcm9wc1twYXJzZWRbMV1dID0gcGFyc2VkWzJdO1xuXHR9XG5cdHJldHVybiBwcm9wcztcbn1cblxuZnVuY3Rpb24gc2V0UGxhY2Vob2xkZXIoaW1nLCB3aWR0aCwgaGVpZ2h0KSB7XG5cdC8vIERlZmF1bHQ6IGZpbGwgd2lkdGgsIG5vIGhlaWdodFxuXHR2YXIgcGxhY2Vob2xkZXIgPSBjcmVhdGVQbGFjZWhvbGRlcih3aWR0aCB8fCAxLCBoZWlnaHQgfHwgMCk7XG5cblx0Ly8gT25seSBzZXQgcGxhY2Vob2xkZXIgaWYgaXQncyBkaWZmZXJlbnRcblx0aWYgKG5hdGl2ZUdldEF0dHJpYnV0ZS5jYWxsKGltZywgJ3NyYycpICE9PSBwbGFjZWhvbGRlcikge1xuXHRcdG5hdGl2ZVNldEF0dHJpYnV0ZS5jYWxsKGltZywgJ3NyYycsIHBsYWNlaG9sZGVyKTtcblx0fVxufVxuXG5mdW5jdGlvbiBvbkltYWdlUmVhZHkoaW1nLCBjYWxsYmFjaykge1xuXHQvLyBuYXR1cmFsV2lkdGggaXMgb25seSBhdmFpbGFibGUgd2hlbiB0aGUgaW1hZ2UgaGVhZGVycyBhcmUgbG9hZGVkLFxuXHQvLyB0aGlzIGxvb3Agd2lsbCBwb2xsIGl0IGV2ZXJ5IDEwMG1zLlxuXHRpZiAoaW1nLm5hdHVyYWxXaWR0aCkge1xuXHRcdGNhbGxiYWNrKGltZyk7XG5cdH0gZWxzZSB7XG5cdFx0c2V0VGltZW91dChvbkltYWdlUmVhZHksIDEwMCwgaW1nLCBjYWxsYmFjayk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZml4T25lKGVsKSB7XG5cdHZhciBzdHlsZSA9IGdldFN0eWxlKGVsKTtcblx0dmFyIG9maSA9IGVsW09GSV07XG5cdHN0eWxlWydvYmplY3QtZml0J10gPSBzdHlsZVsnb2JqZWN0LWZpdCddIHx8ICdmaWxsJzsgLy8gZGVmYXVsdCB2YWx1ZVxuXG5cdC8vIEF2b2lkIHJ1bm5pbmcgd2hlcmUgdW5uZWNlc3NhcnksIHVubGVzcyBPRkkgaGFkIGFscmVhZHkgZG9uZSBpdHMgZGVlZFxuXHRpZiAoIW9maS5pbWcpIHtcblx0XHQvLyBmaWxsIGlzIHRoZSBkZWZhdWx0IGJlaGF2aW9yIHNvIG5vIGFjdGlvbiBpcyBuZWNlc3Nhcnlcblx0XHRpZiAoc3R5bGVbJ29iamVjdC1maXQnXSA9PT0gJ2ZpbGwnKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gV2hlcmUgb2JqZWN0LWZpdCBpcyBzdXBwb3J0ZWQgYW5kIG9iamVjdC1wb3NpdGlvbiBpc24ndCAoU2FmYXJpIDwgMTApXG5cdFx0aWYgKFxuXHRcdFx0IW9maS5za2lwVGVzdCAmJiAvLyB1bmxlc3MgdXNlciB3YW50cyB0byBhcHBseSByZWdhcmRsZXNzIG9mIGJyb3dzZXIgc3VwcG9ydFxuXHRcdFx0c3VwcG9ydHNPYmplY3RGaXQgJiYgLy8gaWYgYnJvd3NlciBhbHJlYWR5IHN1cHBvcnRzIG9iamVjdC1maXRcblx0XHRcdCFzdHlsZVsnb2JqZWN0LXBvc2l0aW9uJ10gLy8gdW5sZXNzIG9iamVjdC1wb3NpdGlvbiBpcyB1c2VkXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHR9XG5cblx0Ly8ga2VlcCBhIGNsb25lIGluIG1lbW9yeSB3aGlsZSByZXNldHRpbmcgdGhlIG9yaWdpbmFsIHRvIGEgYmxhbmtcblx0aWYgKCFvZmkuaW1nKSB7XG5cdFx0b2ZpLmltZyA9IG5ldyBJbWFnZShlbC53aWR0aCwgZWwuaGVpZ2h0KTtcblx0XHRvZmkuaW1nLnNyY3NldCA9IG5hdGl2ZUdldEF0dHJpYnV0ZS5jYWxsKGVsLCBcImRhdGEtb2ZpLXNyY3NldFwiKSB8fCBlbC5zcmNzZXQ7XG5cdFx0b2ZpLmltZy5zcmMgPSBuYXRpdmVHZXRBdHRyaWJ1dGUuY2FsbChlbCwgXCJkYXRhLW9maS1zcmNcIikgfHwgZWwuc3JjO1xuXG5cdFx0Ly8gcHJlc2VydmUgZm9yIGFueSBmdXR1cmUgY2xvbmVOb2RlIGNhbGxzXG5cdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL2JmcmVkLWl0L29iamVjdC1maXQtaW1hZ2VzL2lzc3Vlcy81M1xuXHRcdG5hdGl2ZVNldEF0dHJpYnV0ZS5jYWxsKGVsLCBcImRhdGEtb2ZpLXNyY1wiLCBlbC5zcmMpO1xuXHRcdGlmIChlbC5zcmNzZXQpIHtcblx0XHRcdG5hdGl2ZVNldEF0dHJpYnV0ZS5jYWxsKGVsLCBcImRhdGEtb2ZpLXNyY3NldFwiLCBlbC5zcmNzZXQpO1xuXHRcdH1cblxuXHRcdHNldFBsYWNlaG9sZGVyKGVsLCBlbC5uYXR1cmFsV2lkdGggfHwgZWwud2lkdGgsIGVsLm5hdHVyYWxIZWlnaHQgfHwgZWwuaGVpZ2h0KTtcblxuXHRcdC8vIHJlbW92ZSBzcmNzZXQgYmVjYXVzZSBpdCBvdmVycmlkZXMgc3JjXG5cdFx0aWYgKGVsLnNyY3NldCkge1xuXHRcdFx0ZWwuc3Jjc2V0ID0gJyc7XG5cdFx0fVxuXHRcdHRyeSB7XG5cdFx0XHRrZWVwU3JjVXNhYmxlKGVsKTtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdGlmICh3aW5kb3cuY29uc29sZSkge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oJ2h0dHBzOi8vYml0Lmx5L29maS1vbGQtYnJvd3NlcicpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHBvbHlmaWxsQ3VycmVudFNyYyhvZmkuaW1nKTtcblxuXHRlbC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybChcXFwiXCIgKyAoKG9maS5pbWcuY3VycmVudFNyYyB8fCBvZmkuaW1nLnNyYykucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpKSArIFwiXFxcIilcIjtcblx0ZWwuc3R5bGUuYmFja2dyb3VuZFBvc2l0aW9uID0gc3R5bGVbJ29iamVjdC1wb3NpdGlvbiddIHx8ICdjZW50ZXInO1xuXHRlbC5zdHlsZS5iYWNrZ3JvdW5kUmVwZWF0ID0gJ25vLXJlcGVhdCc7XG5cdGVsLnN0eWxlLmJhY2tncm91bmRPcmlnaW4gPSAnY29udGVudC1ib3gnO1xuXG5cdGlmICgvc2NhbGUtZG93bi8udGVzdChzdHlsZVsnb2JqZWN0LWZpdCddKSkge1xuXHRcdG9uSW1hZ2VSZWFkeShvZmkuaW1nLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAob2ZpLmltZy5uYXR1cmFsV2lkdGggPiBlbC53aWR0aCB8fCBvZmkuaW1nLm5hdHVyYWxIZWlnaHQgPiBlbC5oZWlnaHQpIHtcblx0XHRcdFx0ZWwuc3R5bGUuYmFja2dyb3VuZFNpemUgPSAnY29udGFpbic7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRlbC5zdHlsZS5iYWNrZ3JvdW5kU2l6ZSA9ICdhdXRvJztcblx0XHRcdH1cblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRlbC5zdHlsZS5iYWNrZ3JvdW5kU2l6ZSA9IHN0eWxlWydvYmplY3QtZml0J10ucmVwbGFjZSgnbm9uZScsICdhdXRvJykucmVwbGFjZSgnZmlsbCcsICcxMDAlIDEwMCUnKTtcblx0fVxuXG5cdG9uSW1hZ2VSZWFkeShvZmkuaW1nLCBmdW5jdGlvbiAoaW1nKSB7XG5cdFx0c2V0UGxhY2Vob2xkZXIoZWwsIGltZy5uYXR1cmFsV2lkdGgsIGltZy5uYXR1cmFsSGVpZ2h0KTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGtlZXBTcmNVc2FibGUoZWwpIHtcblx0dmFyIGRlc2NyaXB0b3JzID0ge1xuXHRcdGdldDogZnVuY3Rpb24gZ2V0KHByb3ApIHtcblx0XHRcdHJldHVybiBlbFtPRkldLmltZ1twcm9wID8gcHJvcCA6ICdzcmMnXTtcblx0XHR9LFxuXHRcdHNldDogZnVuY3Rpb24gc2V0KHZhbHVlLCBwcm9wKSB7XG5cdFx0XHRlbFtPRkldLmltZ1twcm9wID8gcHJvcCA6ICdzcmMnXSA9IHZhbHVlO1xuXHRcdFx0bmF0aXZlU2V0QXR0cmlidXRlLmNhbGwoZWwsIChcImRhdGEtb2ZpLVwiICsgcHJvcCksIHZhbHVlKTsgLy8gcHJlc2VydmUgZm9yIGFueSBmdXR1cmUgY2xvbmVOb2RlXG5cdFx0XHRmaXhPbmUoZWwpO1xuXHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdH1cblx0fTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGVsLCAnc3JjJywgZGVzY3JpcHRvcnMpO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZWwsICdjdXJyZW50U3JjJywge1xuXHRcdGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gZGVzY3JpcHRvcnMuZ2V0KCdjdXJyZW50U3JjJyk7IH1cblx0fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbCwgJ3NyY3NldCcsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGRlc2NyaXB0b3JzLmdldCgnc3Jjc2V0Jyk7IH0sXG5cdFx0c2V0OiBmdW5jdGlvbiAoc3MpIHsgcmV0dXJuIGRlc2NyaXB0b3JzLnNldChzcywgJ3NyY3NldCcpOyB9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBoaWphY2tBdHRyaWJ1dGVzKCkge1xuXHRmdW5jdGlvbiBnZXRPZmlJbWFnZU1heWJlKGVsLCBuYW1lKSB7XG5cdFx0cmV0dXJuIGVsW09GSV0gJiYgZWxbT0ZJXS5pbWcgJiYgKG5hbWUgPT09ICdzcmMnIHx8IG5hbWUgPT09ICdzcmNzZXQnKSA/IGVsW09GSV0uaW1nIDogZWw7XG5cdH1cblx0aWYgKCFzdXBwb3J0c09iamVjdFBvc2l0aW9uKSB7XG5cdFx0SFRNTEltYWdlRWxlbWVudC5wcm90b3R5cGUuZ2V0QXR0cmlidXRlID0gZnVuY3Rpb24gKG5hbWUpIHtcblx0XHRcdHJldHVybiBuYXRpdmVHZXRBdHRyaWJ1dGUuY2FsbChnZXRPZmlJbWFnZU1heWJlKHRoaXMsIG5hbWUpLCBuYW1lKTtcblx0XHR9O1xuXG5cdFx0SFRNTEltYWdlRWxlbWVudC5wcm90b3R5cGUuc2V0QXR0cmlidXRlID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gbmF0aXZlU2V0QXR0cmlidXRlLmNhbGwoZ2V0T2ZpSW1hZ2VNYXliZSh0aGlzLCBuYW1lKSwgbmFtZSwgU3RyaW5nKHZhbHVlKSk7XG5cdFx0fTtcblx0fVxufVxuXG5mdW5jdGlvbiBmaXgoaW1ncywgb3B0cykge1xuXHR2YXIgc3RhcnRBdXRvTW9kZSA9ICFhdXRvTW9kZUVuYWJsZWQgJiYgIWltZ3M7XG5cdG9wdHMgPSBvcHRzIHx8IHt9O1xuXHRpbWdzID0gaW1ncyB8fCAnaW1nJztcblxuXHRpZiAoKHN1cHBvcnRzT2JqZWN0UG9zaXRpb24gJiYgIW9wdHMuc2tpcFRlc3QpIHx8ICFzdXBwb3J0c09GSSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8vIHVzZSBpbWdzIGFzIGEgc2VsZWN0b3Igb3IganVzdCBzZWxlY3QgYWxsIGltYWdlc1xuXHRpZiAoaW1ncyA9PT0gJ2ltZycpIHtcblx0XHRpbWdzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltZycpO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBpbWdzID09PSAnc3RyaW5nJykge1xuXHRcdGltZ3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGltZ3MpO1xuXHR9IGVsc2UgaWYgKCEoJ2xlbmd0aCcgaW4gaW1ncykpIHtcblx0XHRpbWdzID0gW2ltZ3NdO1xuXHR9XG5cblx0Ly8gYXBwbHkgZml4IHRvIGFsbFxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGltZ3MubGVuZ3RoOyBpKyspIHtcblx0XHRpbWdzW2ldW09GSV0gPSBpbWdzW2ldW09GSV0gfHwge1xuXHRcdFx0c2tpcFRlc3Q6IG9wdHMuc2tpcFRlc3Rcblx0XHR9O1xuXHRcdGZpeE9uZShpbWdzW2ldKTtcblx0fVxuXG5cdGlmIChzdGFydEF1dG9Nb2RlKSB7XG5cdFx0ZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdGlmIChlLnRhcmdldC50YWdOYW1lID09PSAnSU1HJykge1xuXHRcdFx0XHRmaXgoZS50YXJnZXQsIHtcblx0XHRcdFx0XHRza2lwVGVzdDogb3B0cy5za2lwVGVzdFxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LCB0cnVlKTtcblx0XHRhdXRvTW9kZUVuYWJsZWQgPSB0cnVlO1xuXHRcdGltZ3MgPSAnaW1nJzsgLy8gcmVzZXQgdG8gYSBnZW5lcmljIHNlbGVjdG9yIGZvciB3YXRjaE1RXG5cdH1cblxuXHQvLyBpZiByZXF1ZXN0ZWQsIHdhdGNoIG1lZGlhIHF1ZXJpZXMgZm9yIG9iamVjdC1maXQgY2hhbmdlXG5cdGlmIChvcHRzLndhdGNoTVEpIHtcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZml4LmJpbmQobnVsbCwgaW1ncywge1xuXHRcdFx0c2tpcFRlc3Q6IG9wdHMuc2tpcFRlc3Rcblx0XHR9KSk7XG5cdH1cbn1cblxuZml4LnN1cHBvcnRzT2JqZWN0Rml0ID0gc3VwcG9ydHNPYmplY3RGaXQ7XG5maXguc3VwcG9ydHNPYmplY3RQb3NpdGlvbiA9IHN1cHBvcnRzT2JqZWN0UG9zaXRpb247XG5cbmhpamFja0F0dHJpYnV0ZXMoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmaXg7XG4iLCJpbXBvcnQgb2JqZWN0Rml0SW1hZ2VzIGZyb20gJ29iamVjdC1maXQtaW1hZ2VzJztcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge1xuICBvYmplY3RGaXRJbWFnZXMoJ2ltZy5vYmplY3QtZml0Jyk7XG59O1xuIiwiaW1wb3J0ICdzdmd4dXNlJztcbmltcG9ydCBvYmplY3RGaXRJbWFnZXMgZnJvbSAnLi9wb2x5ZmlsbHMvb2JqZWN0Rml0SW1hZ2VzJztcblxub2JqZWN0Rml0SW1hZ2VzKCk7XG4iXSwibmFtZXMiOlsib2JqZWN0Rml0SW1hZ2VzIl0sIm1hcHBpbmdzIjoiOzs7OztJQUFBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQSxDQUFDLFlBQVk7SUFFYixJQUFJLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRTtJQUNsRSxRQUFRLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEMsUUFBUSxJQUFJLGFBQWEsQ0FBQztJQUMxQixRQUFRLElBQUksR0FBRyxDQUFDO0lBQ2hCLFFBQVEsSUFBSSxjQUFjLEdBQUcsWUFBWTtJQUN6QyxZQUFZLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM5QixZQUFZLEdBQUcsR0FBRyxVQUFVLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2pELFNBQVMsQ0FBQztJQUNWLFFBQVEsSUFBSSxnQkFBZ0IsR0FBRyxZQUFZO0lBQzNDLFlBQVksT0FBTztJQUNuQixTQUFTLENBQUM7SUFDVixRQUFRLElBQUksY0FBYyxHQUFHLFlBQVk7SUFDekMsWUFBWSxJQUFJLFFBQVEsQ0FBQztJQUN6QixZQUFZLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3JFLFlBQVksTUFBTSxDQUFDLGdCQUFn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
