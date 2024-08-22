import { RouterError } from "../module/router";
import { router } from "./index";
import { FormDataParser } from "../module/formData";
import { FormFileToDisk } from "../module/formFile";
import { Validator } from "../module/validator";

router.defineRoute("GET", "/films", async (_req, _res) => {
	throw new RouterError("Not implemented");
});

const filmPostParser = new FormDataParser(
	new FormFileToDisk("http://localhost:8080/static/", "static"),
	{
		array: ["value"],
		file: ["entah"],
	},
);
const filmsPostValidator = new Validator({
	type: "object",
	schema: {
		value: { type: "array", item: { type: "string" } },
	},
});
router.defineRoute("POST", "/films", async (req, res) => {
	const validatedData = filmsPostValidator.validate(
		await filmPostParser.parse(req),
	);
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
