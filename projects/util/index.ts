export interface Point {
	x: number;
	y: number;
}

export function extractEdgePoints(
	pixels: number[],
	width: number,
	height: number,
	bitDepth = 3,
): Point[] {
	const colors: number[] = [];
	const edgePoints: Point[] = [];
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const i = (x + y * width) * 4;
			const grayscale = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
			const squashedGrayscale =
				(Math.floor((grayscale / 256) * bitDepth) / bitDepth) * 256;
			colors.push(squashedGrayscale);
		}
	}
	for (let y = 1; y < height; y++) {
		for (let x = 1; x < width; x++) {
			const g0 = colors[x + y * width];
			const gt = colors[x + (y - 1) * width];
			const gl = colors[x - 1 + y * width];
			const gtl = colors[x - 1 + (y - 1) * width];
			if (g0 !== gt || g0 !== gl || g0 !== gtl) {
				edgePoints.push({ x, y });
			}
		}
	}
	return edgePoints;
}

export function dist(a: Point, b: Point): number {
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	return Math.sqrt(dx ** 2 + dy ** 2);
}

export function sortByDistance2d(points: Point[]): Point[] {
	const visited = new Set();
	const sorted: Point[] = [];
	const i = 0;
	let point = points[i];

	while (visited.size < points.length) {
		let closestDist = Infinity;
		// let closestI = -1;
		let closest: Point | null = null;

		for (let j = 0; j < points.length; j++) {
			if (j != i && !visited.has(points[j])) {
				const d = dist(point, points[j]);
				if (d < closestDist) {
					closest = points[j];
					closestDist = d;
				}
			}
		}

		if (!visited.has(point)) {
			sorted.push(point);
		}
		visited.add(point);
		point = closest as Point;
	}

	return sorted;
}

export function dropOut<T>(list: T[], percentage: number): T[] {
	return list.filter(
		(item, i) =>
			Math.floor(i * percentage) !==
			Math.floor(Math.max(0, i + 1) * percentage),
	);
}

export function dropOutRandom<T>(list: T[], percentage: number): T[] {
	return list.filter(() => Math.random() <= percentage);
}
