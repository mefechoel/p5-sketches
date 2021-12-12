import p5 from "p5";
import {
	dropOut,
	dropOutRandom,
	extractEdgePoints,
	sortByDistance2d,
} from "../util";
import imgPath from "./mountain.jpg";

type PVector = p5.Vector;

const NUM_POINTS = 100;
const seed = 72;
let img: p5.Image;

function sketch(p: p5) {
	const drawPoints = (list: PVector[]) => {
		const l = list.length;
		for (let i = 0; i < l; i++) {
			const p0 = list[(l + i + 0) % l];
			p.stroke(0);
			p.strokeWeight(10);
			p.point(p0.x, p0.y);
		}
	};

	const drawCurve = (list: PVector[]) => {
		p.stroke(0);
		p.strokeWeight(3);
		p.noFill();
		p.beginShape();
		const l = list.length;
		for (let i = 0; i < l; i++) {
			const p0 = list[(l + i + 0) % l];
			p.curveVertex(p0.x, p0.y);
		}
		p.endShape();
	};

	const drawPipes = (list: PVector[]) => {
		const l = list.length;
		for (let i = 0; i < l; i++) {
			const p0 = list[(l + i + 0) % l].copy();
			const p1 = list[(l + i + 1) % l].copy();
			p.stroke(20);
			p.strokeWeight(2);
			if (p.random(1) < 0.5) {
				p.line(p0.x, p0.y, p0.x, p1.y);
				p.line(p0.x, p1.y, p1.x, p1.y);
			} else {
				p.line(p1.x, p1.y, p1.x, p0.y);
				p.line(p1.x, p0.y, p0.x, p0.y);
			}
		}
	};

	const drawLines = (list: PVector[]) => {
		const l = list.length;
		for (let i = 0; i < l; i++) {
			const p0 = list[(l + i + 0) % l].copy();
			const p1 = list[(l + i + 1) % l].copy();
			p.stroke(20);
			p.strokeWeight(2);
			p.line(p0.x, p0.y, p1.x, p1.y);
		}
	};

	const drawBezier = (list: PVector[]) => {
		// background(0, 0);
		const l = list.length;
		for (let i = 0; i < l; i++) {
			const pm1 = list[(l + i - 1) % l].copy();
			const p0 = list[(l + i + 0) % l].copy();
			const p1 = list[(l + i + 1) % l].copy();
			const p2 = list[(l + i + 2) % l].copy();

			const a0 = pm1.copy().sub(p0).rotate(Math.PI).add(p0);
			const a1 = p1.copy().sub(p0).rotate(Math.PI).add(p0);
			const a = a0
				.copy()
				.add(a1)
				.div(2)
				.sub(p0)
				.rotate(-Math.PI / 2.0)
				.add(p0);
			const b = p0.copy();
			const c = p1.copy();
			const d0 = p0.copy().sub(p1).rotate(-Math.PI).add(p1);
			const d1 = p2.copy().sub(p1).rotate(-Math.PI).add(p1);
			const d = d0
				.copy()
				.add(d1)
				.div(2)
				.sub(c)
				.rotate(Math.PI / 2.0)
				.add(c);

			const steps = 50;
			for (let j = 0; j < steps; j++) {
				p.strokeWeight(2);
				p.stroke(150);
				const t0 = j / steps;
				const t1 = (j + 1) / steps;
				const x0 = p.bezierPoint(b.x, a.x, d.x, c.x, t0);
				const y0 = p.bezierPoint(b.y, a.y, d.y, c.y, t0);
				const x1 = p.bezierPoint(b.x, a.x, d.x, c.x, t1);
				const y1 = p.bezierPoint(b.y, a.y, d.y, c.y, t1);
				// point(x0, y0);
				p.line(x0, y0, x1, y1);
			}
		}
	};

	p.preload = () => {
		// load the original image
		img = p.loadImage(imgPath);
	};

	p.setup = () => {
		p.createCanvas(900, 900);
		p.noLoop();
	};

	p.draw = () => {
		p.background(255);
		p.randomSeed(seed);

		const w = 200;
		img.resize(w, 0);
		img.loadPixels();

		const points = extractEdgePoints(img.pixels, img.width, img.height, 4);
		const wScale = p.width / img.width;
		const hScale = p.height / img.height;
		const sorted = sortByDistance2d(points).map(({ x, y }) =>
			p.createVector(x * wScale, y * hScale),
		);

		const s = dropOutRandom(sorted, 0.3);
		// drawBezier(s);
		drawPipes(s);
		// drawCurve(s);
		// drawPoints(s);
		// drawLines(s);
	};

	p.mousePressed = () => {
		// seed++;
		console.log("seed: " + seed);
		p.redraw();
	};
}

const App = new p5(sketch);

export default App;
