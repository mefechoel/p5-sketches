import p5 from "p5";
import imgPath from "./mountain.jpg";

const kernel = [
	[-1, -1, -1],
	[-1, 9, -1],
	[-1, -1, -1],
];
let img: p5.Image;
let edgeImg: p5.Image;

const points: p5.Vector[] = [];
const colors: number[] = [];

function sketch(p: p5) {
	p.preload = () => {
		// load the original image
		img = p.loadImage(imgPath);
	};

	p.setup = () => {
		p.createCanvas(710, 400);
		p.noLoop();

		const w = 100;
		img.resize(w, 0);
		const c: number[] = [];
		const v: p5.Vector[] = [];
		img.loadPixels();
		for (let y = 0; y < img.height; y++) {
			for (let x = 0; x < img.width; x++) {
				const i = (x + y * img.width) * 4;
				const grayscale =
					(img.pixels[i] + img.pixels[i + 1] + img.pixels[i + 2]) / 3;
				const precision = 4;
				const squashedGrayscale =
					(Math.floor((grayscale / 256) * precision) / precision) * 256;
				c.push(squashedGrayscale);
			}
		}
		for (let y = 1; y < img.height; y++) {
			for (let x = 1; x < img.width; x++) {
				const g0 = c[x + y * img.width];
				const gt = c[x + (y - 1) * img.width];
				const gl = c[x - 1 + y * img.width];
				const gtl = c[x - 1 + (y - 1) * img.width];
				if (g0 !== gt || g0 !== gl || g0 !== gtl) {
					v.push(p.createVector(x, y));
				}
			}
		}

		for (const pv of v) {
			p.stroke(0);
			p.strokeWeight(2);
			p.point(pv.x * 6, pv.y * 6);
		}

		return;

		// };

		// p.draw = () => {
		img.resize(p.width, 0);
		img.filter(p.POSTERIZE, 2);
		p.image(img, 0, 0, p.width, p.height);

		// create a new image, same dimensions as img
		edgeImg = p.createImage(img.width, img.height);

		// load its pixels
		img.loadPixels();
		edgeImg.loadPixels();

		console.log(img.width, img.height, img.pixels.length);
		for (let y = 1; y < img.height - 1; y++) {
			for (let x = 1; x < img.width - 1; x++) {
				// kernel sum for the current pixel starts as 0
				let sum = 0;

				// kx, ky variables for iterating over the kernel
				// kx, ky have three different values: -1, 0, 1
				for (let kx = -1; kx <= 1; kx++) {
					for (let ky = -1; ky <= 1; ky++) {
						const xpos = x + kx;
						const ypos = y + ky;
						const pos = (y + ky) * img.width + (x + kx);
						// since our image is grayscale,
						// RGB values are identical
						// we retrieve the red value for this example
						const val =
							(img.pixels[pos * 4] +
								img.pixels[pos * 4 + 1] +
								img.pixels[pos * 4 + 2]) /
							3;

						// accumulate the  kernel sum
						// kernel is a 3x3 matrix
						// kx and ky have values -1, 0, 1
						// if we add 1 to kx and ky, we get 0, 1, 2
						// with that we can use it to iterate over kernel
						// and calculate the accumulated sum
						sum += kernel[ky + 1][kx + 1] * val;
					}
				}
				sum = Math.floor(Math.max(0, Math.min(255, sum)));
				colors.push(sum);
				const ratio = sum / 256;
				if (p.random(1) * ratio < 0.001) {
					points.push(p.createVector(x, y));
				}

				// set the pixel value of the edgeImg
				edgeImg.pixels[(x + y * img.width) * 4 + 0] = sum;
				edgeImg.pixels[(x + y * img.width) * 4 + 1] = sum;
				edgeImg.pixels[(x + y * img.width) * 4 + 2] = sum;
				edgeImg.pixels[(x + y * img.width) * 4 + 3] = 255;
			}
		}

		// updatePixels() to write the changes on edgeImg
		edgeImg.updatePixels();

		// draw edgeImg at the right of the original image
		p.image(edgeImg, 0, 0, p.width, p.height);
		console.log(points);
	};
}

const App = new p5(sketch);

export default App;
