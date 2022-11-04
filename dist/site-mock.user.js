// ==UserScript==
// @name         site-mock
// @namespace    https://github.com/d-rowe/site-mock
// @version      0.1
// @description  turns pages into sketched mocks
// @author       d-rowe
// @match        https://*/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/rough.js/2.1.1/rough.min.js

// ==/UserScript==

(function () {
    'use strict';
    var MAX_FRAMES_PER_SECOND = 5;
    var ROUGHNESS = 3;
    var STROKE_WIDTH = 1;
    var MAX_NODES_FOR_ANIMATION = 500;
    var SKETCH_OPACITY = 0.7;
    var dpr = window.devicePixelRatio;
    var root = document.body;
    var { scrollWidth, scrollHeight } = root;
    var canvas = document.createElement("canvas");
    canvas.setAttribute("width", `${scrollWidth * dpr}`);
    canvas.setAttribute("height", `${scrollHeight * dpr}`);
    canvas.setAttribute("style", `position: absolute;
      width: ${scrollWidth}px;
      height: ${scrollHeight}px;
      top: 0;
      left: 0;
      z-index: 10000;
      pointer-events: none;
      opacity: ${SKETCH_OPACITY};`);
    var rc = rough.canvas(canvas);
    var ctx = canvas.getContext("2d");
    root.append(canvas);
    var rects = [];
    processDom();
    var shouldAnimate = rects.length <= MAX_NODES_FOR_ANIMATION;
    render();
    var lastRenderTime = 0;
    function render(time = 0) {
        if (shouldAnimate) {
            requestAnimationFrame(render);
        }
        if (shouldAnimate && time - lastRenderTime < 1e3 / MAX_FRAMES_PER_SECOND) {
            return;
        }
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        rects.forEach((r) => {
            rc.rectangle(r.x, r.y, r.width, r.height, {
                fill: r.fill,
                roughness: ROUGHNESS,
                strokeWidth: STROKE_WIDTH
            });
        });
        lastRenderTime = time;
    }
    function processDom(element = root) {
        if (element.offsetParent !== null && element !== canvas) {
            const { backgroundColor } = getComputedStyle(element);
            const bbox = element.getBoundingClientRect();
            rects.push({
                x: bbox.x * dpr,
                y: bbox.y * dpr,
                width: bbox.width * dpr,
                height: bbox.height * dpr,
                fill: backgroundColor
            });
        }
        for (let i = 0; i < element.children.length; i++) {
            processDom(element.children[i]);
        }
    }
})();