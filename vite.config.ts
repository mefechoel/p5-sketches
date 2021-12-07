import { defineConfig } from "vite";

const root = process.env.VITE_PROJ_ROOT;

// https://vitejs.dev/config/
export default defineConfig({
	root,
	build: {
		target: "modules",
		assetsInlineLimit: 0,
	},
});
