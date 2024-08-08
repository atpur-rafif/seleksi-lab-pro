import { context } from "esbuild";

const watchMode = process.argv.includes("-w");

const build = await context({
	entryPoints: ["src/index.ts"],
	bundle: true,
	outfile: "dist.js",
});

if (watchMode) await build.watch();
else {
	await build.rebuild();
	await build.dispose();
}
