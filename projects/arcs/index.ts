import p5 from "p5";
import {
	createBitDepthAdjuster,
	dropOut,
	dropOutRandom,
	extractEdgePoints,
	extractEdgePointsP,
	extractEdgePointsS,
	sortByDistance2d,
} from "../util";
import imgPath from "./mountain.jpg";

type PVector = p5.Vector;

const MAX_SIZE = 1000;
const EDGE_DETECTION_WIDTH = 300;
const EDGE_DETECTION_BIT_DEPTH = 1;
const NUM_POINTS = 100;
const MAX_DISTANCE = 70;
const DROPOUT_PERCENTAGE = 0.7;
const seed = 72;
const dropOutFn = dropOutRandom;
let img: p5.Image;

function sketch(p: p5) {
	const drawPoints = (list: PVector[]) => {
		const l = list.length;
		for (let i = 0; i < l; i++) {
			const p0 = list[(l + i + 0) % l];
			// p.stroke(0);
			// p.strokeWeight(10);
			p.point(p0.x, p0.y);
		}
	};

	const drawCurve = (list: PVector[]) => {
		// p.stroke(0);
		// p.strokeWeight(3);
		p.noFill();
		p.beginShape();
		const l = list.length;
		for (let i = 0; i < l; i++) {
			const p0 = list[(l + i + 0) % l];
			p.curveVertex(p0.x, p0.y);
			if (i !== 0 && p0.dist(list[i - 1]) >= MAX_DISTANCE) {
				p.endShape();
				p.beginShape();
			}
		}
		p.endShape();
	};

	const drawPipes = (list: PVector[]) => {
		const l = list.length;
		for (let i = 0; i < l; i++) {
			const p0 = list[(l + i + 0) % l];
			const p1 = list[(l + i + 1) % l];
			// p.stroke(20);
			// p.strokeWeight(2);
			if (p0.dist(p1) < MAX_DISTANCE) {
				if (p.random(1) < 0.5) {
					p.line(p0.x, p0.y, p0.x, p1.y);
					p.line(p0.x, p1.y, p1.x, p1.y);
				} else {
					p.line(p1.x, p1.y, p1.x, p0.y);
					p.line(p1.x, p0.y, p0.x, p0.y);
				}
			}
		}
	};

	const drawLines = (list: PVector[]) => {
		const l = list.length;
		for (let i = 0; i < l; i++) {
			const p0 = list[(l + i + 0) % l];
			const p1 = list[(l + i + 1) % l];
			if (p0.dist(p1) < MAX_DISTANCE) {
				p.line(p0.x, p0.y, p1.x, p1.y);
			}
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
				// p.strokeWeight(2);
				// p.stroke(150);
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
		const maxDim = Math.max(img.width, img.height);
		const scale = MAX_SIZE / maxDim;
		p.createCanvas(img.width * scale, img.height * scale);
		p.noLoop();
	};

	p.draw = () => {
		p.background(255);
		p.randomSeed(seed);

		img.resize(EDGE_DETECTION_WIDTH, 0);
		img.loadPixels();

		const wScale = p.width / img.width;
		const hScale = p.height / img.height;
		const points = extractEdgePoints(
			(x, y) => {
				const i = (x + y * img.width) * 4;
				return (img.pixels[i] + img.pixels[i + 1] + img.pixels[i + 2]) / 3;
			},
			img.width,
			img.height,
			EDGE_DETECTION_BIT_DEPTH,
		);
		const sorted = sortByDistance2d(dropOutFn(points, DROPOUT_PERCENTAGE)).map(
			({ x, y }) => p.createVector(x * wScale, y * hScale),
		);
		const points2 = extractEdgePoints(
			(x, y) => {
				const i = (x + y * img.width) * 4;
				return (img.pixels[i] + img.pixels[i + 1] + img.pixels[i + 2]) / 3;
			},
			img.width,
			img.height,
			EDGE_DETECTION_BIT_DEPTH + 1,
		);
		const sorted2 = sortByDistance2d(dropOutFn(points2, 0.4)).map(({ x, y }) =>
			p.createVector(x * wScale, y * hScale),
		);

		const rpoints = extractEdgePoints(
			(x, y) => img.pixels[(x + y * img.width) * 4],
			img.width,
			img.height,
			EDGE_DETECTION_BIT_DEPTH,
		);
		const rsorted = sortByDistance2d(
			dropOutFn(rpoints, DROPOUT_PERCENTAGE),
		).map(({ x, y }) => p.createVector(x * wScale, y * hScale));
		const gpoints = extractEdgePoints(
			(x, y) => img.pixels[(x + y * img.width) * 4 + 1],
			img.width,
			img.height,
			EDGE_DETECTION_BIT_DEPTH,
		);
		const gsorted = sortByDistance2d(
			dropOutFn(gpoints, DROPOUT_PERCENTAGE),
		).map(({ x, y }) => p.createVector(x * wScale, y * hScale));
		const bpoints = extractEdgePoints(
			(x, y) => img.pixels[(x + y * img.width) * 4 + 2],
			img.width,
			img.height,
			EDGE_DETECTION_BIT_DEPTH,
		);
		const bsorted = sortByDistance2d(
			dropOutFn(bpoints, DROPOUT_PERCENTAGE),
		).map(({ x, y }) => p.createVector(x * wScale, y * hScale));

		// img.resize(p.width, 0);
		// img.loadPixels();
		// const adj = createBitDepthAdjuster(EDGE_DETECTION_BIT_DEPTH);
		// for (let y = 0; y < img.height; y++) {
		// 	for (let x = 0; x < img.width; x++) {
		// 		const i = (x + y * img.width) * 4;
		// 		const grayscale =
		// 			(img.pixels[i] + img.pixels[i + 1] + img.pixels[i + 2]) / 3;
		// 		// const i = x + y * width;
		// 		// const grayscale = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
		// 		const squashedGrayscale = adj(grayscale);
		// 		img.pixels[i] = squashedGrayscale;
		// 		img.pixels[i + 1] = squashedGrayscale;
		// 		img.pixels[i + 2] = squashedGrayscale;
		// 		img.pixels[i + 3] = 255;
		// 	}
		// }
		// img.updatePixels();
		// p.image(img, 0, 0);

		// const s = sorted;
		// p.stroke(0, 100);
		// p.strokeWeight(2);
		// // drawBezier(s);
		// // drawPipes(s);
		// // drawCurve(s);
		// // drawPoints(s);
		// drawLines(s);
		const drawFn = drawCurve;

		p.strokeWeight(4);
		p.stroke(0, 70);
		drawFn(sorted);
		drawFn(sorted2);

		p.stroke(255, 0, 0, 70);
		// drawFn = drawPipes;
		drawFn(rsorted);
		p.stroke(0, 255, 0, 70);
		// drawFn = drawLines;
		drawFn(gsorted);
		p.stroke(0, 0, 255, 70);
		// drawFn = drawCurve;
		drawFn(bsorted);
	};

	p.mousePressed = () => {
		// seed++;
		console.log("seed: " + seed);
		p.redraw();
	};
}

const App = new p5(sketch);

export default App;
