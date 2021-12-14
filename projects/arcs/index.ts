import p5 from "p5";
import {
	dropOut,
	dropOutRandom,
	extractEdgePoints,
	sortByDistance2d,
} from "../util";
import type { Point } from "../util/types";
import imgPath from "./mountain.jpg";
import { createDrawingFunctions } from "./drawFns";

const RANDOM_DROPOUT = true;
const MAX_SIZE = window.innerHeight;
const EDGE_DETECTION_WIDTH = 500;
const EDGE_DETECTION_BIT_DEPTH = 4;
const MAX_DISTANCE = 70;
const DROPOUT_PERCENTAGE = 0.8;
let seed = 72;
let img: p5.Image;

function sketch(p: p5) {
	const drawingFns = createDrawingFunctions(p, MAX_DISTANCE);

	const dropOutP5Random = <T>(l: T[], percentage: number) =>
		dropOutRandom(l, percentage, () => p.random(1));
	const dropOutFn = RANDOM_DROPOUT ? dropOutP5Random : dropOut;

	p.preload = () => {
		// load the original image
		img = p.loadImage(imgPath);
	};

	p.setup = () => {
		const maxDim = Math.max(img.width, img.height);
		const scale = MAX_SIZE / maxDim;
		p.createCanvas(img.width * scale, img.height * scale);
		p.randomSeed(seed);
		p.noLoop();
		// p.frameRate(2);
	};

	p.draw = () => {
		p.background(255);

		img.resize(EDGE_DETECTION_WIDTH, 0);
		img.loadPixels();

		const wScale = p.width / img.width;
		const hScale = p.height / img.height;
		const edgePoints = extractEdgePoints(
			(x, y) => {
				const i = (x + y * img.width) * 4;
				return (img.pixels[i] + img.pixels[i + 1] + img.pixels[i + 2]) / 3;
			},
			img.width,
			img.height,
			EDGE_DETECTION_BIT_DEPTH,
		);
		const toVectors = (list: Point[]) =>
			list.map(({ x, y }) => p.createVector(x * wScale, y * hScale));
		const points = dropOutFn(edgePoints, DROPOUT_PERCENTAGE);
		const sortedPoints = sortByDistance2d(points, p.width, p.height);
		const sorted = toVectors(sortedPoints);

		function createPointsFromColorChannel(
			img: p5.Image,
			channel: number,
			bitDepth: number,
			dropOutPercentage: number,
		) {
			const channelPoints = extractEdgePoints(
				(x, y) => img.pixels[(x + y * img.width) * 4 + channel],
				img.width,
				img.height,
				bitDepth,
			);
			const sortedPoints = sortByDistance2d(
				dropOutFn(channelPoints, dropOutPercentage),
				p.width,
				p.height,
			);
			return toVectors(sortedPoints);
		}
		const rsorted = createPointsFromColorChannel(img, 0, 3, 0.1);
		const gsorted = createPointsFromColorChannel(img, 1, 3, 0.1);
		const bsorted = createPointsFromColorChannel(img, 2, 3, 0.1);

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

		const drawFn = drawingFns.drawPipes;

		p.stroke(60, 70);
		p.strokeWeight(1);
		drawFn(sorted);
		drawingFns.drawLines(sorted);

		p.stroke(255, 0, 0, 70);
		drawFn(rsorted);
		drawingFns.drawLines(rsorted);
		p.stroke(0, 255, 0, 70);
		drawFn(gsorted);
		drawingFns.drawLines(gsorted);
		p.stroke(0, 0, 255, 70);
		drawFn(bsorted);
		drawingFns.drawLines(bsorted);
	};

	p.mousePressed = () => {
		seed++;
		console.log("seed: " + seed);
		p.randomSeed(seed);
		p.redraw();
	};
}

const App = new p5(sketch);

export default App;
