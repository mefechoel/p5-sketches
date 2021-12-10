export function extractEdgePoints(
	pixels: number[],
	width: number,
	height: number,
	bitDepth = 3,
) {
	const colors: number[] = [];
	const edgePoints: { x: number; y: number }[] = [];
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
