import { RouterError } from "../module/router";
import { router } from "./index";
import { FormDataParser } from "../module/formData";
import { FormFileToDisk } from "../module/formFile";
import { Validator } from "../module/validator";

router.defineRoute("GET", "/films", async (_req, _res) => {
	throw new RouterError("Not implemented");
});

const filmsPostValidator = new Validator({
	type: "object",
	schema: {
		value: { type: "string" },
	},
});
router.defineRoute("POST", "/films", async (req, res) => {
	const parser = new FormDataParser(
		req,
		new FormFileToDisk("http://localhost:8080/static/", "static"),
	);
	const validatedData = filmsPostValidator.validate(await parser.parse());
	console.log(validatedData);
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
