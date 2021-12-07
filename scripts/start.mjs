import fs from "fs";
import path from "path";
import cp from "child_process";

const projectName = process.argv[2];
const baseDir = "projects";
const dir = path.join(path.resolve(), baseDir, projectName);
const indexPath = path.join(dir, "index.html");

if (!fs.existsSync(indexPath)) {
	throw new Error(
		`No index.html file was found in "${dir}". Please create one to run the sketch.`,
	);
}

cp.spawn(`npm run vite`, {
	stdio: "inherit",
	shell: true,
	env: { ...process.env, VITE_PROJ_ROOT: dir },
});
