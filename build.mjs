import { context } from "esbuild";

const watchMode = process.argv.includes("-w");

const build = await context({
	entryPoints: ["src/index.ts"],
	bundle: true,
	outfile: "dist.js",
	platform: "node",
	// minify: true,
	plugins: [
		{
			name: "log",
			setup(build) {
				build.onEnd((_) => {
					console.log(
						`${watchMode ? "Rebuild" : "Build"} finish at ${new Date().toLocaleTimeString()}`,
					);
				});
			},
		},
	],
});

if (watchMode) await build.watch();
else {
	await build.rebuild();
	await build.dispose();
}
