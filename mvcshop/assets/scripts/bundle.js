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
      var $form = $('.js-autorization');
      var $submitBtn = $form.find('button[type="submit"]');
      $submitBtn.off('click.registration').on('click.registration', function (event) {
        event.preventDefault();

        var data = stringify$1($form.serializeArray()); // $.ajax({
        //   method: 'POST',
        //   url: `http://mvcshop.com/${API}`,
        //   data,
        // });

      });
    });

    var registration = (function () {
      return console.log('henlo');
    });

    objectFitImages();
    autorization();
    registration();

})));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9zdmd4dXNlL3N2Z3h1c2UuanMiLCJub2RlX21vZHVsZXMvb2JqZWN0LWZpdC1pbWFnZXMvZGlzdC9vZmkuY29tbW9uLWpzLmpzIiwic3JjL2Fzc2V0cy9zY3JpcHRzL3BvbHlmaWxscy9vYmplY3RGaXRJbWFnZXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NvcmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL2pzb24vc3RyaW5naWZ5LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lLWNvcmVqczIvY29yZS1qcy9qc29uL3N0cmluZ2lmeS5qcyIsInNyYy9hc3NldHMvc2NyaXB0cy9tb2R1bGVzL2F1dG9yaXphdGlvbi5qcyIsInNyYy9hc3NldHMvc2NyaXB0cy9tb2R1bGVzL3JlZ2lzdHJhdGlvbi5qcyIsInNyYy9hc3NldHMvc2NyaXB0cy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE3IEljb01vb24uaW9cbiAqIEBsaWNlbnNlICAgTGljZW5zZWQgdW5kZXIgTUlUIGxpY2Vuc2VcbiAqICAgICAgICAgICAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9LZXlhbW9vbi9zdmd4dXNlXG4gKiBAdmVyc2lvbiAgIDEuMi42XG4gKi9cbi8qanNsaW50IGJyb3dzZXI6IHRydWUgKi9cbi8qZ2xvYmFsIFhEb21haW5SZXF1ZXN0LCBNdXRhdGlvbk9ic2VydmVyLCB3aW5kb3cgKi9cbihmdW5jdGlvbiAoKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgdmFyIGNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTsgLy8gaG9sZHMgeGhyIG9iamVjdHMgdG8gcHJldmVudCBtdWx0aXBsZSByZXF1ZXN0c1xuICAgICAgICB2YXIgY2hlY2tVc2VFbGVtcztcbiAgICAgICAgdmFyIHRpZDsgLy8gdGltZW91dCBpZFxuICAgICAgICB2YXIgZGVib3VuY2VkQ2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGlkKTtcbiAgICAgICAgICAgIHRpZCA9IHNldFRpbWVvdXQoY2hlY2tVc2VFbGVtcywgMTAwKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHVub2JzZXJ2ZUNoYW5nZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH07XG4gICAgICAgIHZhciBvYnNlcnZlQ2hhbmdlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlcjtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIGRlYm91bmNlZENoZWNrLCBmYWxzZSk7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm9yaWVudGF0aW9uY2hhbmdlXCIsIGRlYm91bmNlZENoZWNrLCBmYWxzZSk7XG4gICAgICAgICAgICBpZiAod2luZG93Lk11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGRlYm91bmNlZENoZWNrKTtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB1bm9ic2VydmVDaGFuZ2VzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZGVib3VuY2VkQ2hlY2ssIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwib3JpZW50YXRpb25jaGFuZ2VcIiwgZGVib3VuY2VkQ2hlY2ssIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoaWdub3JlKSB7fVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NU3VidHJlZU1vZGlmaWVkXCIsIGRlYm91bmNlZENoZWNrLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgdW5vYnNlcnZlQ2hhbmdlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJET01TdWJ0cmVlTW9kaWZpZWRcIiwgZGVib3VuY2VkQ2hlY2ssIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZGVib3VuY2VkQ2hlY2ssIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJvcmllbnRhdGlvbmNoYW5nZVwiLCBkZWJvdW5jZWRDaGVjaywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZhciBjcmVhdGVSZXF1ZXN0ID0gZnVuY3Rpb24gKHVybCkge1xuICAgICAgICAgICAgLy8gSW4gSUUgOSwgY3Jvc3Mgb3JpZ2luIHJlcXVlc3RzIGNhbiBvbmx5IGJlIHNlbnQgdXNpbmcgWERvbWFpblJlcXVlc3QuXG4gICAgICAgICAgICAvLyBYRG9tYWluUmVxdWVzdCB3b3VsZCBmYWlsIGlmIENPUlMgaGVhZGVycyBhcmUgbm90IHNldC5cbiAgICAgICAgICAgIC8vIFRoZXJlZm9yZSwgWERvbWFpblJlcXVlc3Qgc2hvdWxkIG9ubHkgYmUgdXNlZCB3aXRoIGNyb3NzIG9yaWdpbiByZXF1ZXN0cy5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldE9yaWdpbihsb2MpIHtcbiAgICAgICAgICAgICAgICB2YXIgYTtcbiAgICAgICAgICAgICAgICBpZiAobG9jLnByb3RvY29sICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgYSA9IGxvYztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgICAgICAgICAgICAgICAgIGEuaHJlZiA9IGxvYztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEucHJvdG9jb2wucmVwbGFjZSgvOi9nLCBcIlwiKSArIGEuaG9zdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBSZXF1ZXN0O1xuICAgICAgICAgICAgdmFyIG9yaWdpbjtcbiAgICAgICAgICAgIHZhciBvcmlnaW4yO1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5YTUxIdHRwUmVxdWVzdCkge1xuICAgICAgICAgICAgICAgIFJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICBvcmlnaW4gPSBnZXRPcmlnaW4obG9jYXRpb24pO1xuICAgICAgICAgICAgICAgIG9yaWdpbjIgPSBnZXRPcmlnaW4odXJsKTtcbiAgICAgICAgICAgICAgICBpZiAoUmVxdWVzdC53aXRoQ3JlZGVudGlhbHMgPT09IHVuZGVmaW5lZCAmJiBvcmlnaW4yICE9PSBcIlwiICYmIG9yaWdpbjIgIT09IG9yaWdpbikge1xuICAgICAgICAgICAgICAgICAgICBSZXF1ZXN0ID0gWERvbWFpblJlcXVlc3QgfHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIFJlcXVlc3QgPSBYTUxIdHRwUmVxdWVzdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUmVxdWVzdDtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHhsaW5rTlMgPSBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIjtcbiAgICAgICAgY2hlY2tVc2VFbGVtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlO1xuICAgICAgICAgICAgdmFyIGJjcjtcbiAgICAgICAgICAgIHZhciBmYWxsYmFjayA9IFwiXCI7IC8vIG9wdGlvbmFsIGZhbGxiYWNrIFVSTCBpbiBjYXNlIG5vIGJhc2UgcGF0aCB0byBTVkcgZmlsZSB3YXMgZ2l2ZW4gYW5kIG5vIHN5bWJvbCBkZWZpbml0aW9uIHdhcyBmb3VuZC5cbiAgICAgICAgICAgIHZhciBoYXNoO1xuICAgICAgICAgICAgdmFyIGhyZWY7XG4gICAgICAgICAgICB2YXIgaTtcbiAgICAgICAgICAgIHZhciBpblByb2dyZXNzQ291bnQgPSAwO1xuICAgICAgICAgICAgdmFyIGlzSGlkZGVuO1xuICAgICAgICAgICAgdmFyIFJlcXVlc3Q7XG4gICAgICAgICAgICB2YXIgdXJsO1xuICAgICAgICAgICAgdmFyIHVzZXM7XG4gICAgICAgICAgICB2YXIgeGhyO1xuICAgICAgICAgICAgZnVuY3Rpb24gb2JzZXJ2ZUlmRG9uZSgpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBkb25lIHdpdGggbWFraW5nIGNoYW5nZXMsIHN0YXJ0IHdhdGNoaW5nIGZvciBjaGFnbmVzIGluIERPTSBhZ2FpblxuICAgICAgICAgICAgICAgIGluUHJvZ3Jlc3NDb3VudCAtPSAxO1xuICAgICAgICAgICAgICAgIGlmIChpblByb2dyZXNzQ291bnQgPT09IDApIHsgLy8gaWYgYWxsIHhocnMgd2VyZSByZXNvbHZlZFxuICAgICAgICAgICAgICAgICAgICB1bm9ic2VydmVDaGFuZ2VzKCk7IC8vIG1ha2Ugc3VyZSB0byByZW1vdmUgb2xkIGhhbmRsZXJzXG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVDaGFuZ2VzKCk7IC8vIHdhdGNoIGZvciBjaGFuZ2VzIHRvIERPTVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIGF0dHJVcGRhdGVGdW5jKHNwZWMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2FjaGVbc3BlYy5iYXNlXSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3BlYy51c2VFbC5zZXRBdHRyaWJ1dGVOUyh4bGlua05TLCBcInhsaW5rOmhyZWZcIiwgXCIjXCIgKyBzcGVjLmhhc2gpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNwZWMudXNlRWwuaGFzQXR0cmlidXRlKFwiaHJlZlwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWMudXNlRWwuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBcIiNcIiArIHNwZWMuaGFzaCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gb25sb2FkRnVuYyh4aHIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYm9keSA9IGRvY3VtZW50LmJvZHk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB4ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInhcIik7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdmc7XG4gICAgICAgICAgICAgICAgICAgIHhoci5vbmxvYWQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB4LmlubmVySFRNTCA9IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICAgICAgICAgIHN2ZyA9IHguZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzdmdcIilbMF07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWhpZGRlblwiLCBcInRydWVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdmcuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdmcuc3R5bGUud2lkdGggPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLnN0eWxlLmhlaWdodCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdmcuc3R5bGUub3ZlcmZsb3cgPSBcImhpZGRlblwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgYm9keS5pbnNlcnRCZWZvcmUoc3ZnLCBib2R5LmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVJZkRvbmUoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gb25FcnJvclRpbWVvdXQoeGhyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgeGhyLm9uZXJyb3IgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB4aHIub250aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZUlmRG9uZSgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1bm9ic2VydmVDaGFuZ2VzKCk7IC8vIHN0b3Agd2F0Y2hpbmcgZm9yIGNoYW5nZXMgdG8gRE9NXG4gICAgICAgICAgICAvLyBmaW5kIGFsbCB1c2UgZWxlbWVudHNcbiAgICAgICAgICAgIHVzZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInVzZVwiKTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB1c2VzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYmNyID0gdXNlc1tpXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChpZ25vcmUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZmFpbGVkIHRvIGdldCBib3VuZGluZyByZWN0YW5nbGUgb2YgdGhlIHVzZSBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIGJjciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBocmVmID0gdXNlc1tpXS5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCB1c2VzW2ldLmdldEF0dHJpYnV0ZU5TKHhsaW5rTlMsIFwiaHJlZlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgdXNlc1tpXS5nZXRBdHRyaWJ1dGUoXCJ4bGluazpocmVmXCIpO1xuICAgICAgICAgICAgICAgIGlmIChocmVmICYmIGhyZWYuc3BsaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdXJsID0gaHJlZi5zcGxpdChcIiNcIik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXJsID0gW1wiXCIsIFwiXCJdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBiYXNlID0gdXJsWzBdO1xuICAgICAgICAgICAgICAgIGhhc2ggPSB1cmxbMV07XG4gICAgICAgICAgICAgICAgaXNIaWRkZW4gPSBiY3IgJiYgYmNyLmxlZnQgPT09IDAgJiYgYmNyLnJpZ2h0ID09PSAwICYmIGJjci50b3AgPT09IDAgJiYgYmNyLmJvdHRvbSA9PT0gMDtcbiAgICAgICAgICAgICAgICBpZiAoYmNyICYmIGJjci53aWR0aCA9PT0gMCAmJiBiY3IuaGVpZ2h0ID09PSAwICYmICFpc0hpZGRlbikge1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgdXNlIGVsZW1lbnQgaXMgZW1wdHlcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYSByZWZlcmVuY2UgdG8gYW4gZXh0ZXJuYWwgU1ZHLCB0cnkgdG8gZmV0Y2ggaXRcbiAgICAgICAgICAgICAgICAgICAgLy8gdXNlIHRoZSBvcHRpb25hbCBmYWxsYmFjayBVUkwgaWYgdGhlcmUgaXMgbm8gcmVmZXJlbmNlIHRvIGFuIGV4dGVybmFsIFNWR1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmFsbGJhY2sgJiYgIWJhc2UubGVuZ3RoICYmIGhhc2ggJiYgIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGhhc2gpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlID0gZmFsbGJhY2s7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHVzZXNbaV0uaGFzQXR0cmlidXRlKFwiaHJlZlwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlc1tpXS5zZXRBdHRyaWJ1dGVOUyh4bGlua05TLCBcInhsaW5rOmhyZWZcIiwgaHJlZik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzY2hlZHVsZSB1cGRhdGluZyB4bGluazpocmVmXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIgPSBjYWNoZVtiYXNlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh4aHIgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0cnVlIHNpZ25pZmllcyB0aGF0IHByZXBlbmRpbmcgdGhlIFNWRyB3YXMgbm90IHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChhdHRyVXBkYXRlRnVuYyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZUVsOiB1c2VzW2ldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlOiBiYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNoOiBoYXNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHhociA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVxdWVzdCA9IGNyZWF0ZVJlcXVlc3QoYmFzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFJlcXVlc3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHIgPSBuZXcgUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZVtiYXNlXSA9IHhocjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeGhyLm9ubG9hZCA9IG9ubG9hZEZ1bmMoeGhyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeGhyLm9uZXJyb3IgPSBvbkVycm9yVGltZW91dCh4aHIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHIub250aW1lb3V0ID0gb25FcnJvclRpbWVvdXQoeGhyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeGhyLm9wZW4oXCJHRVRcIiwgYmFzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhoci5zZW5kKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUHJvZ3Jlc3NDb3VudCArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNIaWRkZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWNoZVtiYXNlXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVtZW1iZXIgdGhpcyBVUkwgaWYgdGhlIHVzZSBlbGVtZW50IHdhcyBub3QgZW1wdHkgYW5kIG5vIHJlcXVlc3Qgd2FzIHNlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZVtiYXNlXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNhY2hlW2Jhc2VdLm9ubG9hZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGl0IHR1cm5zIG91dCB0aGF0IHByZXBlbmRpbmcgdGhlIFNWRyBpcyBub3QgbmVjZXNzYXJ5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFib3J0IHRoZSBpbi1wcm9ncmVzcyB4aHIuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGVbYmFzZV0uYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgY2FjaGVbYmFzZV0ub25sb2FkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlW2Jhc2VdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChiYXNlLmxlbmd0aCAmJiBjYWNoZVtiYXNlXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChhdHRyVXBkYXRlRnVuYyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlRWw6IHVzZXNbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZTogYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNoOiBoYXNoXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSwgMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1c2VzID0gXCJcIjtcbiAgICAgICAgICAgIGluUHJvZ3Jlc3NDb3VudCArPSAxO1xuICAgICAgICAgICAgb2JzZXJ2ZUlmRG9uZSgpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgd2luTG9hZDtcbiAgICAgICAgd2luTG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLCB3aW5Mb2FkLCBmYWxzZSk7IC8vIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzXG4gICAgICAgICAgICB0aWQgPSBzZXRUaW1lb3V0KGNoZWNrVXNlRWxlbXMsIDApO1xuICAgICAgICB9O1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gXCJjb21wbGV0ZVwiKSB7XG4gICAgICAgICAgICAvLyBUaGUgbG9hZCBldmVudCBmaXJlcyB3aGVuIGFsbCByZXNvdXJjZXMgaGF2ZSBmaW5pc2hlZCBsb2FkaW5nLCB3aGljaCBhbGxvd3MgZGV0ZWN0aW5nIHdoZXRoZXIgU1ZHIHVzZSBlbGVtZW50cyBhcmUgZW1wdHkuXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgd2luTG9hZCwgZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gTm8gbmVlZCB0byBhZGQgYSBsaXN0ZW5lciBpZiB0aGUgZG9jdW1lbnQgaXMgYWxyZWFkeSBsb2FkZWQsIGluaXRpYWxpemUgaW1tZWRpYXRlbHkuXG4gICAgICAgICAgICB3aW5Mb2FkKCk7XG4gICAgICAgIH1cbiAgICB9XG59KCkpO1xuIiwiLyohIG5wbS5pbS9vYmplY3QtZml0LWltYWdlcyAzLjIuNCAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgT0ZJID0gJ2JmcmVkLWl0Om9iamVjdC1maXQtaW1hZ2VzJztcbnZhciBwcm9wUmVnZXggPSAvKG9iamVjdC1maXR8b2JqZWN0LXBvc2l0aW9uKVxccyo6XFxzKihbLS5cXHdcXHMlXSspL2c7XG52YXIgdGVzdEltZyA9IHR5cGVvZiBJbWFnZSA9PT0gJ3VuZGVmaW5lZCcgPyB7c3R5bGU6IHsnb2JqZWN0LXBvc2l0aW9uJzogMX19IDogbmV3IEltYWdlKCk7XG52YXIgc3VwcG9ydHNPYmplY3RGaXQgPSAnb2JqZWN0LWZpdCcgaW4gdGVzdEltZy5zdHlsZTtcbnZhciBzdXBwb3J0c09iamVjdFBvc2l0aW9uID0gJ29iamVjdC1wb3NpdGlvbicgaW4gdGVzdEltZy5zdHlsZTtcbnZhciBzdXBwb3J0c09GSSA9ICdiYWNrZ3JvdW5kLXNpemUnIGluIHRlc3RJbWcuc3R5bGU7XG52YXIgc3VwcG9ydHNDdXJyZW50U3JjID0gdHlwZW9mIHRlc3RJbWcuY3VycmVudFNyYyA9PT0gJ3N0cmluZyc7XG52YXIgbmF0aXZlR2V0QXR0cmlidXRlID0gdGVzdEltZy5nZXRBdHRyaWJ1dGU7XG52YXIgbmF0aXZlU2V0QXR0cmlidXRlID0gdGVzdEltZy5zZXRBdHRyaWJ1dGU7XG52YXIgYXV0b01vZGVFbmFibGVkID0gZmFsc2U7XG5cbmZ1bmN0aW9uIGNyZWF0ZVBsYWNlaG9sZGVyKHcsIGgpIHtcblx0cmV0dXJuIChcImRhdGE6aW1hZ2Uvc3ZnK3htbCwlM0NzdmcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB3aWR0aD0nXCIgKyB3ICsgXCInIGhlaWdodD0nXCIgKyBoICsgXCInJTNFJTNDL3N2ZyUzRVwiKTtcbn1cblxuZnVuY3Rpb24gcG9seWZpbGxDdXJyZW50U3JjKGVsKSB7XG5cdGlmIChlbC5zcmNzZXQgJiYgIXN1cHBvcnRzQ3VycmVudFNyYyAmJiB3aW5kb3cucGljdHVyZWZpbGwpIHtcblx0XHR2YXIgcGYgPSB3aW5kb3cucGljdHVyZWZpbGwuXztcblx0XHQvLyBwYXJzZSBzcmNzZXQgd2l0aCBwaWN0dXJlZmlsbCB3aGVyZSBjdXJyZW50U3JjIGlzbid0IGF2YWlsYWJsZVxuXHRcdGlmICghZWxbcGYubnNdIHx8ICFlbFtwZi5uc10uZXZhbGVkKSB7XG5cdFx0XHQvLyBmb3JjZSBzeW5jaHJvbm91cyBzcmNzZXQgcGFyc2luZ1xuXHRcdFx0cGYuZmlsbEltZyhlbCwge3Jlc2VsZWN0OiB0cnVlfSk7XG5cdFx0fVxuXG5cdFx0aWYgKCFlbFtwZi5uc10uY3VyU3JjKSB7XG5cdFx0XHQvLyBmb3JjZSBwaWN0dXJlZmlsbCB0byBwYXJzZSBzcmNzZXRcblx0XHRcdGVsW3BmLm5zXS5zdXBwb3J0ZWQgPSBmYWxzZTtcblx0XHRcdHBmLmZpbGxJbWcoZWwsIHtyZXNlbGVjdDogdHJ1ZX0pO1xuXHRcdH1cblxuXHRcdC8vIHJldHJpZXZlIHBhcnNlZCBjdXJyZW50U3JjLCBpZiBhbnlcblx0XHRlbC5jdXJyZW50U3JjID0gZWxbcGYubnNdLmN1clNyYyB8fCBlbC5zcmM7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0U3R5bGUoZWwpIHtcblx0dmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbCkuZm9udEZhbWlseTtcblx0dmFyIHBhcnNlZDtcblx0dmFyIHByb3BzID0ge307XG5cdHdoaWxlICgocGFyc2VkID0gcHJvcFJlZ2V4LmV4ZWMoc3R5bGUpKSAhPT0gbnVsbCkge1xuXHRcdHByb3BzW3BhcnNlZFsxXV0gPSBwYXJzZWRbMl07XG5cdH1cblx0cmV0dXJuIHByb3BzO1xufVxuXG5mdW5jdGlvbiBzZXRQbGFjZWhvbGRlcihpbWcsIHdpZHRoLCBoZWlnaHQpIHtcblx0Ly8gRGVmYXVsdDogZmlsbCB3aWR0aCwgbm8gaGVpZ2h0XG5cdHZhciBwbGFjZWhvbGRlciA9IGNyZWF0ZVBsYWNlaG9sZGVyKHdpZHRoIHx8IDEsIGhlaWdodCB8fCAwKTtcblxuXHQvLyBPbmx5IHNldCBwbGFjZWhvbGRlciBpZiBpdCdzIGRpZmZlcmVudFxuXHRpZiAobmF0aXZlR2V0QXR0cmlidXRlLmNhbGwoaW1nLCAnc3JjJykgIT09IHBsYWNlaG9sZGVyKSB7XG5cdFx0bmF0aXZlU2V0QXR0cmlidXRlLmNhbGwoaW1nLCAnc3JjJywgcGxhY2Vob2xkZXIpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIG9uSW1hZ2VSZWFkeShpbWcsIGNhbGxiYWNrKSB7XG5cdC8vIG5hdHVyYWxXaWR0aCBpcyBvbmx5IGF2YWlsYWJsZSB3aGVuIHRoZSBpbWFnZSBoZWFkZXJzIGFyZSBsb2FkZWQsXG5cdC8vIHRoaXMgbG9vcCB3aWxsIHBvbGwgaXQgZXZlcnkgMTAwbXMuXG5cdGlmIChpbWcubmF0dXJhbFdpZHRoKSB7XG5cdFx0Y2FsbGJhY2soaW1nKTtcblx0fSBlbHNlIHtcblx0XHRzZXRUaW1lb3V0KG9uSW1hZ2VSZWFkeSwgMTAwLCBpbWcsIGNhbGxiYWNrKTtcblx0fVxufVxuXG5mdW5jdGlvbiBmaXhPbmUoZWwpIHtcblx0dmFyIHN0eWxlID0gZ2V0U3R5bGUoZWwpO1xuXHR2YXIgb2ZpID0gZWxbT0ZJXTtcblx0c3R5bGVbJ29iamVjdC1maXQnXSA9IHN0eWxlWydvYmplY3QtZml0J10gfHwgJ2ZpbGwnOyAvLyBkZWZhdWx0IHZhbHVlXG5cblx0Ly8gQXZvaWQgcnVubmluZyB3aGVyZSB1bm5lY2Vzc2FyeSwgdW5sZXNzIE9GSSBoYWQgYWxyZWFkeSBkb25lIGl0cyBkZWVkXG5cdGlmICghb2ZpLmltZykge1xuXHRcdC8vIGZpbGwgaXMgdGhlIGRlZmF1bHQgYmVoYXZpb3Igc28gbm8gYWN0aW9uIGlzIG5lY2Vzc2FyeVxuXHRcdGlmIChzdHlsZVsnb2JqZWN0LWZpdCddID09PSAnZmlsbCcpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBXaGVyZSBvYmplY3QtZml0IGlzIHN1cHBvcnRlZCBhbmQgb2JqZWN0LXBvc2l0aW9uIGlzbid0IChTYWZhcmkgPCAxMClcblx0XHRpZiAoXG5cdFx0XHQhb2ZpLnNraXBUZXN0ICYmIC8vIHVubGVzcyB1c2VyIHdhbnRzIHRvIGFwcGx5IHJlZ2FyZGxlc3Mgb2YgYnJvd3NlciBzdXBwb3J0XG5cdFx0XHRzdXBwb3J0c09iamVjdEZpdCAmJiAvLyBpZiBicm93c2VyIGFscmVhZHkgc3VwcG9ydHMgb2JqZWN0LWZpdFxuXHRcdFx0IXN0eWxlWydvYmplY3QtcG9zaXRpb24nXSAvLyB1bmxlc3Mgb2JqZWN0LXBvc2l0aW9uIGlzIHVzZWRcblx0XHQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdH1cblxuXHQvLyBrZWVwIGEgY2xvbmUgaW4gbWVtb3J5IHdoaWxlIHJlc2V0dGluZyB0aGUgb3JpZ2luYWwgdG8gYSBibGFua1xuXHRpZiAoIW9maS5pbWcpIHtcblx0XHRvZmkuaW1nID0gbmV3IEltYWdlKGVsLndpZHRoLCBlbC5oZWlnaHQpO1xuXHRcdG9maS5pbWcuc3Jjc2V0ID0gbmF0aXZlR2V0QXR0cmlidXRlLmNhbGwoZWwsIFwiZGF0YS1vZmktc3Jjc2V0XCIpIHx8IGVsLnNyY3NldDtcblx0XHRvZmkuaW1nLnNyYyA9IG5hdGl2ZUdldEF0dHJpYnV0ZS5jYWxsKGVsLCBcImRhdGEtb2ZpLXNyY1wiKSB8fCBlbC5zcmM7XG5cblx0XHQvLyBwcmVzZXJ2ZSBmb3IgYW55IGZ1dHVyZSBjbG9uZU5vZGUgY2FsbHNcblx0XHQvLyBodHRwczovL2dpdGh1Yi5jb20vYmZyZWQtaXQvb2JqZWN0LWZpdC1pbWFnZXMvaXNzdWVzLzUzXG5cdFx0bmF0aXZlU2V0QXR0cmlidXRlLmNhbGwoZWwsIFwiZGF0YS1vZmktc3JjXCIsIGVsLnNyYyk7XG5cdFx0aWYgKGVsLnNyY3NldCkge1xuXHRcdFx0bmF0aXZlU2V0QXR0cmlidXRlLmNhbGwoZWwsIFwiZGF0YS1vZmktc3Jjc2V0XCIsIGVsLnNyY3NldCk7XG5cdFx0fVxuXG5cdFx0c2V0UGxhY2Vob2xkZXIoZWwsIGVsLm5hdHVyYWxXaWR0aCB8fCBlbC53aWR0aCwgZWwubmF0dXJhbEhlaWdodCB8fCBlbC5oZWlnaHQpO1xuXG5cdFx0Ly8gcmVtb3ZlIHNyY3NldCBiZWNhdXNlIGl0IG92ZXJyaWRlcyBzcmNcblx0XHRpZiAoZWwuc3Jjc2V0KSB7XG5cdFx0XHRlbC5zcmNzZXQgPSAnJztcblx0XHR9XG5cdFx0dHJ5IHtcblx0XHRcdGtlZXBTcmNVc2FibGUoZWwpO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0aWYgKHdpbmRvdy5jb25zb2xlKSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybignaHR0cHM6Ly9iaXQubHkvb2ZpLW9sZC1icm93c2VyJyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cG9seWZpbGxDdXJyZW50U3JjKG9maS5pbWcpO1xuXG5cdGVsLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKFxcXCJcIiArICgob2ZpLmltZy5jdXJyZW50U3JjIHx8IG9maS5pbWcuc3JjKS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJykpICsgXCJcXFwiKVwiO1xuXHRlbC5zdHlsZS5iYWNrZ3JvdW5kUG9zaXRpb24gPSBzdHlsZVsnb2JqZWN0LXBvc2l0aW9uJ10gfHwgJ2NlbnRlcic7XG5cdGVsLnN0eWxlLmJhY2tncm91bmRSZXBlYXQgPSAnbm8tcmVwZWF0Jztcblx0ZWwuc3R5bGUuYmFja2dyb3VuZE9yaWdpbiA9ICdjb250ZW50LWJveCc7XG5cblx0aWYgKC9zY2FsZS1kb3duLy50ZXN0KHN0eWxlWydvYmplY3QtZml0J10pKSB7XG5cdFx0b25JbWFnZVJlYWR5KG9maS5pbWcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChvZmkuaW1nLm5hdHVyYWxXaWR0aCA+IGVsLndpZHRoIHx8IG9maS5pbWcubmF0dXJhbEhlaWdodCA+IGVsLmhlaWdodCkge1xuXHRcdFx0XHRlbC5zdHlsZS5iYWNrZ3JvdW5kU2l6ZSA9ICdjb250YWluJztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGVsLnN0eWxlLmJhY2tncm91bmRTaXplID0gJ2F1dG8nO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdGVsLnN0eWxlLmJhY2tncm91bmRTaXplID0gc3R5bGVbJ29iamVjdC1maXQnXS5yZXBsYWNlKCdub25lJywgJ2F1dG8nKS5yZXBsYWNlKCdmaWxsJywgJzEwMCUgMTAwJScpO1xuXHR9XG5cblx0b25JbWFnZVJlYWR5KG9maS5pbWcsIGZ1bmN0aW9uIChpbWcpIHtcblx0XHRzZXRQbGFjZWhvbGRlcihlbCwgaW1nLm5hdHVyYWxXaWR0aCwgaW1nLm5hdHVyYWxIZWlnaHQpO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24ga2VlcFNyY1VzYWJsZShlbCkge1xuXHR2YXIgZGVzY3JpcHRvcnMgPSB7XG5cdFx0Z2V0OiBmdW5jdGlvbiBnZXQocHJvcCkge1xuXHRcdFx0cmV0dXJuIGVsW09GSV0uaW1nW3Byb3AgPyBwcm9wIDogJ3NyYyddO1xuXHRcdH0sXG5cdFx0c2V0OiBmdW5jdGlvbiBzZXQodmFsdWUsIHByb3ApIHtcblx0XHRcdGVsW09GSV0uaW1nW3Byb3AgPyBwcm9wIDogJ3NyYyddID0gdmFsdWU7XG5cdFx0XHRuYXRpdmVTZXRBdHRyaWJ1dGUuY2FsbChlbCwgKFwiZGF0YS1vZmktXCIgKyBwcm9wKSwgdmFsdWUpOyAvLyBwcmVzZXJ2ZSBmb3IgYW55IGZ1dHVyZSBjbG9uZU5vZGVcblx0XHRcdGZpeE9uZShlbCk7XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fVxuXHR9O1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZWwsICdzcmMnLCBkZXNjcmlwdG9ycyk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbCwgJ2N1cnJlbnRTcmMnLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBkZXNjcmlwdG9ycy5nZXQoJ2N1cnJlbnRTcmMnKTsgfVxuXHR9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGVsLCAnc3Jjc2V0Jywge1xuXHRcdGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gZGVzY3JpcHRvcnMuZ2V0KCdzcmNzZXQnKTsgfSxcblx0XHRzZXQ6IGZ1bmN0aW9uIChzcykgeyByZXR1cm4gZGVzY3JpcHRvcnMuc2V0KHNzLCAnc3Jjc2V0Jyk7IH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGhpamFja0F0dHJpYnV0ZXMoKSB7XG5cdGZ1bmN0aW9uIGdldE9maUltYWdlTWF5YmUoZWwsIG5hbWUpIHtcblx0XHRyZXR1cm4gZWxbT0ZJXSAmJiBlbFtPRkldLmltZyAmJiAobmFtZSA9PT0gJ3NyYycgfHwgbmFtZSA9PT0gJ3NyY3NldCcpID8gZWxbT0ZJXS5pbWcgOiBlbDtcblx0fVxuXHRpZiAoIXN1cHBvcnRzT2JqZWN0UG9zaXRpb24pIHtcblx0XHRIVE1MSW1hZ2VFbGVtZW50LnByb3RvdHlwZS5nZXRBdHRyaWJ1dGUgPSBmdW5jdGlvbiAobmFtZSkge1xuXHRcdFx0cmV0dXJuIG5hdGl2ZUdldEF0dHJpYnV0ZS5jYWxsKGdldE9maUltYWdlTWF5YmUodGhpcywgbmFtZSksIG5hbWUpO1xuXHRcdH07XG5cblx0XHRIVE1MSW1hZ2VFbGVtZW50LnByb3RvdHlwZS5zZXRBdHRyaWJ1dGUgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcblx0XHRcdHJldHVybiBuYXRpdmVTZXRBdHRyaWJ1dGUuY2FsbChnZXRPZmlJbWFnZU1heWJlKHRoaXMsIG5hbWUpLCBuYW1lLCBTdHJpbmcodmFsdWUpKTtcblx0XHR9O1xuXHR9XG59XG5cbmZ1bmN0aW9uIGZpeChpbWdzLCBvcHRzKSB7XG5cdHZhciBzdGFydEF1dG9Nb2RlID0gIWF1dG9Nb2RlRW5hYmxlZCAmJiAhaW1ncztcblx0b3B0cyA9IG9wdHMgfHwge307XG5cdGltZ3MgPSBpbWdzIHx8ICdpbWcnO1xuXG5cdGlmICgoc3VwcG9ydHNPYmplY3RQb3NpdGlvbiAmJiAhb3B0cy5za2lwVGVzdCkgfHwgIXN1cHBvcnRzT0ZJKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gdXNlIGltZ3MgYXMgYSBzZWxlY3RvciBvciBqdXN0IHNlbGVjdCBhbGwgaW1hZ2VzXG5cdGlmIChpbWdzID09PSAnaW1nJykge1xuXHRcdGltZ3MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1nJyk7XG5cdH0gZWxzZSBpZiAodHlwZW9mIGltZ3MgPT09ICdzdHJpbmcnKSB7XG5cdFx0aW1ncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoaW1ncyk7XG5cdH0gZWxzZSBpZiAoISgnbGVuZ3RoJyBpbiBpbWdzKSkge1xuXHRcdGltZ3MgPSBbaW1nc107XG5cdH1cblxuXHQvLyBhcHBseSBmaXggdG8gYWxsXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgaW1ncy5sZW5ndGg7IGkrKykge1xuXHRcdGltZ3NbaV1bT0ZJXSA9IGltZ3NbaV1bT0ZJXSB8fCB7XG5cdFx0XHRza2lwVGVzdDogb3B0cy5za2lwVGVzdFxuXHRcdH07XG5cdFx0Zml4T25lKGltZ3NbaV0pO1xuXHR9XG5cblx0aWYgKHN0YXJ0QXV0b01vZGUpIHtcblx0XHRkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0aWYgKGUudGFyZ2V0LnRhZ05hbWUgPT09ICdJTUcnKSB7XG5cdFx0XHRcdGZpeChlLnRhcmdldCwge1xuXHRcdFx0XHRcdHNraXBUZXN0OiBvcHRzLnNraXBUZXN0XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sIHRydWUpO1xuXHRcdGF1dG9Nb2RlRW5hYmxlZCA9IHRydWU7XG5cdFx0aW1ncyA9ICdpbWcnOyAvLyByZXNldCB0byBhIGdlbmVyaWMgc2VsZWN0b3IgZm9yIHdhdGNoTVFcblx0fVxuXG5cdC8vIGlmIHJlcXVlc3RlZCwgd2F0Y2ggbWVkaWEgcXVlcmllcyBmb3Igb2JqZWN0LWZpdCBjaGFuZ2Vcblx0aWYgKG9wdHMud2F0Y2hNUSkge1xuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmaXguYmluZChudWxsLCBpbWdzLCB7XG5cdFx0XHRza2lwVGVzdDogb3B0cy5za2lwVGVzdFxuXHRcdH0pKTtcblx0fVxufVxuXG5maXguc3VwcG9ydHNPYmplY3RGaXQgPSBzdXBwb3J0c09iamVjdEZpdDtcbmZpeC5zdXBwb3J0c09iamVjdFBvc2l0aW9uID0gc3VwcG9ydHNPYmplY3RQb3NpdGlvbjtcblxuaGlqYWNrQXR0cmlidXRlcygpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZpeDtcbiIsImltcG9ydCBvYmplY3RGaXRJbWFnZXMgZnJvbSAnb2JqZWN0LWZpdC1pbWFnZXMnO1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7XG4gIG9iamVjdEZpdEltYWdlcygnaW1nLm9iamVjdC1maXQnKTtcbn07XG4iLCJ2YXIgY29yZSA9IG1vZHVsZS5leHBvcnRzID0geyB2ZXJzaW9uOiAnMi42LjExJyB9O1xuaWYgKHR5cGVvZiBfX2UgPT0gJ251bWJlcicpIF9fZSA9IGNvcmU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcbiIsInZhciBjb3JlID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpO1xudmFyICRKU09OID0gY29yZS5KU09OIHx8IChjb3JlLkpTT04gPSB7IHN0cmluZ2lmeTogSlNPTi5zdHJpbmdpZnkgfSk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHN0cmluZ2lmeShpdCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIHJldHVybiAkSlNPTi5zdHJpbmdpZnkuYXBwbHkoJEpTT04sIGFyZ3VtZW50cyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL2pzb24vc3RyaW5naWZ5XCIpOyIsImV4cG9ydCBkZWZhdWx0ICgpID0+IHtcbiAgY29uc3QgQVBJID0gJ2F1dGhvcml6YXRpb24nO1xuXG4gIGxldCAkZm9ybSA9ICQoJy5qcy1hdXRvcml6YXRpb24nKTtcbiAgbGV0ICRzdWJtaXRCdG4gPSAkZm9ybS5maW5kKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpO1xuXG4gICRzdWJtaXRCdG4ub2ZmKCdjbGljay5yZWdpc3RyYXRpb24nKS5vbignY2xpY2sucmVnaXN0cmF0aW9uJywgZXZlbnQgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgbGV0IGRhdGEgPSBKU09OLnN0cmluZ2lmeSgkZm9ybS5zZXJpYWxpemVBcnJheSgpKTtcblxuICAgIC8vICQuYWpheCh7XG4gICAgLy8gICBtZXRob2Q6ICdQT1NUJyxcbiAgICAvLyAgIHVybDogYGh0dHA6Ly9tdmNzaG9wLmNvbS8ke0FQSX1gLFxuICAgIC8vICAgZGF0YSxcbiAgICAvLyB9KTtcbiAgfSk7XG59O1xuIiwiZXhwb3J0IGRlZmF1bHQgKCkgPT4gY29uc29sZS5sb2coJ2hlbmxvJyk7XG4iLCJpbXBvcnQgJ3N2Z3h1c2UnO1xuaW1wb3J0IG9iamVjdEZpdEltYWdlcyBmcm9tICcuL3BvbHlmaWxscy9vYmplY3RGaXRJbWFnZXMnO1xuXG5pbXBvcnQgYXV0b3JpemF0aW9uIGZyb20gJy4vbW9kdWxlcy9hdXRvcml6YXRpb24nO1xuaW1wb3J0IHJlZ2lzdHJhdGlvbiBmcm9tICcuL21vZHVsZXMvcmVnaXN0cmF0aW9uJztcblxub2JqZWN0Rml0SW1hZ2VzKCk7XG5hdXRvcml6YXRpb24oKTtcbnJlZ2lzdHJhdGlvbigpO1xuIl0sIm5hbWVzIjpbIm9iamVjdEZpdEltYWdlcyIsImNvcmUiLCJyZXF1aXJlJCQwIiwiJGZvcm0iLCIkIiwiJHN1Ym1pdEJ0biIsImZpbmQiLCJvZmYiLCJvbiIsImV2ZW50IiwicHJldmVudERlZmF1bHQiLCJkYXRhIiwiX0pTT04kc3RyaW5naWZ5Iiwic2VyaWFsaXplQXJyYXkiLCJjb25zb2xlIiwibG9nIiwiYXV0b3JpemF0aW9uIiwi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
