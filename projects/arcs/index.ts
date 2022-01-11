/* eslint-disable @typescript-eslint/no-explicit-any */
import p5 from "p5";
import {
	dropOut,
	dropOutRandom,
	extractEdgePoints,
	sortByDistance2d,
} from "../util";
import imgPath from "./a.jpg";
import { createDrawingFunctions } from "./drawFns";
import { bench, matchToSize } from "./util";
import type { Point } from "../util/types";

const MAX_SIZE = window.innerHeight;
let seed = 72;
let isLooping = false;
let img: p5.Image;
let drawingFnSelect: p5.Element;
let randomDropoutSelect: p5.Element;
let colSelect: p5.Element;
let edgeDetectionSlider: p5.Element;
let bitDepthSlider: p5.Element;
let maxDistSlider: p5.Element;
let dropOutSlider: p5.Element;
let bgAlphaSlider: p5.Element;
let colAlphaSlider: p5.Element;
let strokeSlider: p5.Element;
let seedButton: p5.Element;
let snapButton: p5.Element;
let loopButton: p5.Element;
let capture: p5.Element;

function sketch(p: p5) {
	const dropOutP5Random = <T>(l: T[], percentage: number) =>
		dropOutRandom(l, percentage, () => p.random(1));

	p.preload = () => {
		// load the original image
		img = p.loadImage(imgPath);
	};

	p.setup = () => {
		const maxDim = Math.max(img.width, img.height);
		const scale = MAX_SIZE / maxDim;
		p.createCanvas(img.width * scale, img.height * scale);

		// Create controls
		drawingFnSelect = p.createSelect();
		// P5s typings aren't great...
		(drawingFnSelect as any).option("points");
		(drawingFnSelect as any).option("curve");
		(drawingFnSelect as any).option("pipes");
		(drawingFnSelect as any).option("lines");
		(drawingFnSelect as any).selected("pipes");
		randomDropoutSelect = p.createSelect();
		(randomDropoutSelect as any).option("random");
		(randomDropoutSelect as any).option("sequential");
		(randomDropoutSelect as any).selected("random");
		colSelect = p.createSelect();
		(colSelect as any).option("black and white");
		(colSelect as any).option("white and black");
		(colSelect as any).selected("black and white");
		edgeDetectionSlider = p.createSlider(20, 500, 200, 10);
		bitDepthSlider = p.createSlider(1, 7, 2, 1);
		dropOutSlider = p.createSlider(0.001, 1, 0.6, 0.01);
		maxDistSlider = p.createSlider(0, 600, 80, 5);
		bgAlphaSlider = p.createSlider(0, 255, 255, 5);
		colAlphaSlider = p.createSlider(0, 255, 255, 5);
		strokeSlider = p.createSlider(0, 20, 1, 0.5);

		// Redraw when control value changes
		const elems = [
			drawingFnSelect,
			randomDropoutSelect,
			colSelect,
			edgeDetectionSlider,
			bitDepthSlider,
			dropOutSlider,
			maxDistSlider,
			bgAlphaSlider,
			colAlphaSlider,
			strokeSlider,
		];
		elems.forEach((elem) => (elem as any).changed(() => p.redraw()));

		// Re-seed the random number generator
		seedButton = p.createButton("shuffle");
		seedButton.mouseClicked(() => {
			seed++;
			// eslint-disable-next-line no-console
			console.log("seed: " + seed);
			p.randomSeed(seed);
			p.redraw();
		});

		// Take a picture of the current cam input
		snapButton = p.createButton("snap");
		snapButton.mouseClicked(() => {
			img = (capture as any).get();
		});

		// Do a live transform of the camera input
		loopButton = p.createButton("loop");
		loopButton.mouseClicked(() => {
			isLooping = !isLooping;
			if (isLooping) {
				p.loop();
			} else {
				p.noLoop();
			}
		});

		// Init cam
		capture = p.createCapture(p.VIDEO);
		capture.hide();
		capture.size(img.width * scale, img.height * scale);

		p.randomSeed(seed);
		p.noLoop();
		p.background(0);
	};

	p.draw = () => {
		// When cam is ready and we're looping, set the current camera input
		// as the input to the drawing algorithm
		const isCamReady = Boolean((capture as any).loadedmetadata);
		if (isCamReady && isLooping) {
			img = (capture as any).get();
		}

		// TODO...
		// p.resizeCanvas()

		// Read the current state
		const drawingFnName = drawingFnSelect.value();
		const randomDropout = randomDropoutSelect.value() === "random";
		const colorName = colSelect.value();
		const edgeDetectionWidth = Number(edgeDetectionSlider.value());
		const edgeDetectionBitDepth = Number(bitDepthSlider.value());
		const maxDist = Number(maxDistSlider.value());
		const dropOutPercentage = Number(dropOutSlider.value());
		const bgAlpha = Number(bgAlphaSlider.value());
		const colAlpha = Number(colAlphaSlider.value());
		const strokeWeight = Number(strokeSlider.value());
		const colors = {
			"black and white": { bg: 0, stroke: 255 },
			"white and black": { bg: 255, stroke: 0 },
		}[colorName] || { bg: 0, stroke: 255 };

		if (!randomDropout) {
			p.randomSeed(seed);
		}
		const dropOutFn = randomDropout ? dropOutP5Random : dropOut;
		const drawingFns = createDrawingFunctions(p, maxDist);
		const drawingFn = {
			points: drawingFns.drawPoints,
			curve: drawingFns.drawCurve,
			pipes: drawingFns.drawPipes,
			lines: drawingFns.drawLines,
		}[drawingFnName];

		img.resize(edgeDetectionWidth, 0);
		img.loadPixels();

		let edgePoints: Point[];
		bench(() => {
			edgePoints = extractEdgePoints(
				(x, y) => {
					const i = (x + y * img.width) * 4;
					return (img.pixels[i] + img.pixels[i + 1] + img.pixels[i + 2]) / 3;
				},
				img.width,
				img.height,
				edgeDetectionBitDepth,
			);
		}, "EDGE DETECTION");
		let points: Point[];
		bench(() => {
			points = dropOutFn(edgePoints, dropOutPercentage);
		}, "DROP OUT");
		let sortedPoints: Point[];
		bench(() => {
			sortedPoints = sortByDistance2d(points, p.width, p.height);
		}, "SORTING");
		let sorted: Point[];
		bench(() => {
			sorted = matchToSize(sortedPoints, {
				sourceWidth: img.width,
				sourceHeight: img.height,
				targetWidth: p.width,
				targetHeight: p.height,
			});
		}, "MATCHING");

		bench(() => {
			p.background(colors.bg, bgAlpha);
			p.stroke(colors.stroke, colAlpha);
			p.strokeWeight(strokeWeight);
			drawingFn?.(sorted);
		}, "DRAW");
	};

	p.keyPressed = () => {
		if (p.key === "s") {
			p.saveCanvas("edge-detection.png");
		}
	};
}

const App = new p5(sketch);

export default App;

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
