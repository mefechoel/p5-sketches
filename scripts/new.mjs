import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";

const projectName = process.argv[2];
const baseDir = "projects";
const dir = path.join(path.resolve(), baseDir, projectName);

if (fs.existsSync(dir)) {
	throw new Error(
		`The project "${projectName}" already exists. Please use a different project name.`,
	);
}

function capitalize(str) {
	const [first, ...rest] = str;
	return first.toUpperCase() + rest.join("");
}

const indexHtml = `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>${capitalize(projectName)}</title>
	</head>
	<body>
		<script src="./index.ts" type="module"></script>
	</body>
</html>
`;

const indexTs = `import p5 from "p5";

function sketch(p: p5) {
	const x = 100;
	const y = 100;

	p.setup = () => {
		p.createCanvas(700, 410);
	};

	p.draw = () => {
		p.background(0);
		p.fill(255);
		p.rect(x, y, 50, 50);
	};
}

const App = new p5(sketch);

export default App;
`;

mkdirp(dir)
	.then(async () => {
		fs.writeFileSync(path.join(dir, "index.html"), indexHtml, "utf-8");
		fs.writeFileSync(path.join(dir, "index.ts"), indexTs, "utf-8");
		// eslint-disable-next-line no-console
		console.log(
			`\n"${projectName}" was successfully created!\n\nRun "npm start ${projectName}" to start hacking!\n`,
		);
	})
	// eslint-disable-next-line no-console
	.catch((e) => console.error("Something went wrong...\n\n", e));
