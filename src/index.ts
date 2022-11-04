import rough from 'roughjs/bin/rough';

type Rect = {
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
};

const MAX_FRAMES_PER_SECOND = 5;
const ROUGHNESS = 5;
const STROKE_WIDTH = 2;
// max dom nodes before we disable animation for perf reasons
const MAX_NODES_FOR_ANIMATION = 1000;

const dpr = window.devicePixelRatio;
const root = document.body
const { scrollWidth, scrollHeight } = root;
const canvas = document.createElement('canvas');

canvas.setAttribute('width', `${scrollWidth * dpr}`);
canvas.setAttribute('height', `${scrollHeight * dpr}`);
canvas.setAttribute('style', `
    position: absolute;
    width: ${scrollWidth}px;
    height: ${scrollHeight}px;
    top: 0;
    left: 0;
    z-index: 10000;
    pointer-events: none;
`);

const rc = rough.canvas(canvas);
const ctx = canvas.getContext('2d');
root.append(canvas);

const rects: Rect[] = [];

processDom();

const shouldAnimate = rects.length <= MAX_NODES_FOR_ANIMATION;
render();

let lastRenderTime = 0;
function render(time = 0) {
    if (shouldAnimate) {
        requestAnimationFrame(render);
    }

    // cap framerate at 5fps
    if (time - lastRenderTime < 1000 / MAX_FRAMES_PER_SECOND) {
        return;
    }
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    rects.forEach(r => {
        rc.rectangle(r.x, r.y, r.width, r.height, {
            fill: r.fill,
            roughness: ROUGHNESS,
            strokeWidth: STROKE_WIDTH,
        });
    });
    lastRenderTime = time;
}

function processDom(element: HTMLElement = root) {
    if (element === canvas) {
        return;
    }
    if (element !== root) {
        // TODO: avoid inline styles so this process can
        // be undone easily to restore original page
        element.setAttribute('style', 'opacity: 0;');
    }
    const { backgroundColor } = getComputedStyle(element);
    const bbox = element.getBoundingClientRect();
    rects.push({
        x: bbox.x * dpr,
        y: bbox.y * dpr,
        width: bbox.width * dpr,
        height: bbox.height * dpr,
        fill: backgroundColor,
    });

    for (let i = 0; i < element.children.length; i++) {
        processDom(element.children[i] as HTMLElement);
    }
}
