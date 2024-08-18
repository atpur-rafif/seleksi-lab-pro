import { RouterError } from "../module/router";
import { router } from "./index";
import { FormDataParser } from "../module/form_data";

router.defineRoute("GET", "/films", async (_req, _res) => {
	throw new RouterError("Not implemented");
});

router.defineRoute("POST", "/films", async (req, res) => {
	const parser = new FormDataParser(req);
	const data = await parser.parse();
	console.log(data);
	res.send("WOKE");
});

router.defineRoute("GET", "/films/*", async (_req, _res) => {
	throw new RouterError("Not implemented");
});

router.defineRoute("PUT", "/films/*", async (_req, _res) => {
	throw new RouterError("Not implemented");
});

router.defineRoute("DELETE", "/films/*", async (_req, _res) => {
	throw new RouterError("Not implemented");
});
