import type p5 from "p5";
import { dropOut, extractEdgePoints, sortByDistance2d } from "../util";
import type { Point } from "../util/types";

export function bench(fn: () => void, label = "", log = false) {
	if (log) {
		// eslint-disable-next-line no-console
		console.log(label, "start");
	}
	const start = performance.now();
	fn();
	if (log) {
		// eslint-disable-next-line no-console
		console.log(label, "took ", performance.now() - start, "ms");
	}
}

export function matchToSize(
	list: Point[],
	{
		sourceWidth,
		sourceHeight,
		targetWidth,
		targetHeight,
	}: {
		sourceWidth: number;
		sourceHeight: number;
		targetWidth: number;
		targetHeight: number;
	},
): Point[] {
	const widthScale = targetWidth / sourceWidth;
	const heightScale = targetHeight / sourceHeight;
	return list.map(({ x, y }) => ({
		x: x * widthScale,
		y: y * heightScale,
	}));
}

export function createPointsFromColorChannel(
	img: p5.Image,
	channel: number,
	bitDepth: number,
	dropOutPercentage: number,
	targetWidth: number,
	targetHeight: number,
	dropOutFn: typeof dropOut = dropOut,
) {
	const channelPoints = extractEdgePoints(
		(x, y) => img.pixels[(x + y * img.width) * 4 + channel],
		img.width,
		img.height,
		bitDepth,
	);
	const sortedPoints = sortByDistance2d(
		dropOutFn(channelPoints, dropOutPercentage),
		targetWidth,
		targetHeight,
	);
	return matchToSize(sortedPoints, {
		sourceWidth: img.width,
		sourceHeight: img.height,
		targetWidth,
		targetHeight,
	});
}
