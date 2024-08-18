import { basename, resolve } from "node:path";
import { Router, RouterError } from "../module/router";
import { createReadStream, existsSync } from "node:fs";
export const router = new Router();

router.defineRoute("GET", "/static/*", async (req, res) => {
	const filename = basename(req.url);
	const path = resolve("static", filename);

	if (!existsSync(path)) throw new RouterError("File not found", 404);
	const stream = createReadStream(path);
	stream.pipe(res);
});
