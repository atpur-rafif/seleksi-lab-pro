import { context } from "esbuild";

const watchMode = process.argv.includes("-w");

const build = await context({
	entryPoints: ["src/index.ts"],
	bundle: true,
	outdir: "dist",
});

if (watchMode) await build.watch();
else {
	await build.rebuild();
	await build.dispose();
}
