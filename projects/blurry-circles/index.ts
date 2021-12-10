import p5 from "p5";

function sketch(p: p5) {
	const x = 100;
	const y = 100;

	function drawRing(
		x: number,
		y: number,
		radius: number,
		blur: number,
		width: number,
		alpha: number,
	) {
		const blurRadius = blur * radius;
		p.noFill();
		if (width) {
			p.stroke(255, alpha);
			p.strokeWeight(width);
			p.circle(x, y, radius * 2);
		}
		for (let i = 1; i < blurRadius; i++) {
			const outer = radius - 1 + width / 2 + i;
			const inner = radius - width / 2 - i;
			const mult = (blurRadius - i) / blurRadius;
			const alphaV = mult * mult * alpha * 1;
			p.stroke(255, alphaV);
			p.strokeWeight(1);
			p.circle(x, y, outer * 2);
			p.circle(x, y, inner * 2);
		}
	}

	function drawCircle(
		x: number,
		y: number,
		size: number,
		blur: number,
		alpha: number,
	) {
		const radius = Math.floor(size / 2);
		const blurEdgeRadius = radius - Math.floor(radius * blur);
		const remainingRadius = radius - blurEdgeRadius;
		// console.log("radius         " + radius);
		// console.log("blurEdgeRadius " + blurEdgeRadius);
		for (let r = blurEdgeRadius; r > 0; r--) {
			const blurAmount = (r + 0.0) / (blurEdgeRadius + 0.0);
			const currentAlpha = alpha - blurAmount * alpha;
			p.fill(200, currentAlpha);
			p.circle(x, y, (r + remainingRadius) * 2);
		}
		p.fill(200, alpha);
		p.circle(x, y, remainingRadius * 2);
	}

	p.setup = () => {
		p.createCanvas(700, 700);
		// p.noLoop();
	};

	p.draw = () => {
		p.background(0);

		const c = p.frameCount * 0.02;
		const iterations = 10;
		const alpha = 0.2;
		for (let i = 0; i < iterations; i++) {
			for (let j = 0; j < 1; j++) {
				drawRing(
					Math.cos(c + i * 0.2) * p.width * 0.2 + p.width / 2,
					((1 + Math.sin(c + i * 0.2)) / 2) * p.height,
					// Math.cos(c) * p.height * 0.5 +
					// 	Math.sin(c) * i * (p.height / (iterations - 1)),
					((iterations - i) / iterations) ** 1.3333 * (p.width / 2),
					alpha,
					0,
					(i / iterations) ** 3 * 200 + 10,
				);
				drawRing(
					((1 + Math.sin(c + i * 0.2)) / 2) * p.width,
					Math.cos(c + i * 0.2) * p.height * 0.2 + p.height / 2,
					// Math.cos(c) * p.height * 0.5 +
					// 	Math.sin(c) * i * (p.height / (iterations - 1)),
					((iterations - i) / iterations) ** 1.3333 * (p.width / 2),
					alpha,
					0,
					(i / iterations) ** 3 * 200 + 10,
				);
				drawRing(
					-1 * Math.cos(c + i * 0.2) * p.width * 0.2 + p.width / 2,
					p.height - ((1 + Math.sin(c + i * 0.2)) / 2) * p.height,
					// Math.cos(c) * p.height * 0.5 +
					// 	Math.sin(c) * i * (p.height / (iterations - 1)),
					((iterations - i) / iterations) ** 1.3333 * (p.width / 2),
					alpha,
					0,
					(i / iterations) ** 3 * 200 + 10,
				);
				drawRing(
					p.width - ((1 + Math.sin(c + i * 0.2)) / 2) * p.width,
					-1 * Math.cos(c + i * 0.2) * p.height * 0.2 + p.height / 2,
					// Math.cos(c) * p.height * 0.5 +
					// 	Math.sin(c) * i * (p.height / (iterations - 1)),
					((iterations - i) / iterations) ** 1.3333 * (p.width / 2),
					alpha,
					0,
					(i / iterations) ** 3 * 200 + 10,
				);
			}
		}
	};
}

const App = new p5(sketch);

export default App;
