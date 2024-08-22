import { RouterError } from "../module/router";
import { router } from "./index";
import { FormDataParser } from "../module/formData";
import { FormFileToDisk } from "../module/formFile";
import { Validator } from "../module/validator";

router.defineRoute("GET", "/films", async (_req, _res) => {
	throw new RouterError("Not implemented");
});

router.defineRoute(
	"POST",
	"/films",
	async (req, res, { parser, validator }) => {
		const data = validator.validate(await parser.parse(req));
		console.log(data);
		res.send("WOKE");
	},
	{
		parser: new FormDataParser(
			new FormFileToDisk("http://localhost:8080/static/", "static"),
			{
				array: ["value"],
			},
		),
		validator: new Validator({
			type: "object",
			schema: {
				value: { type: "array", item: { type: "string" } },
			},
		}),
	},
);

router.defineRoute("GET", "/films/*", async (_req, _res) => {
	throw new RouterError("Not implemented");
});

router.defineRoute("PUT", "/films/*", async (_req, _res) => {
	throw new RouterError("Not implemented");
});

router.defineRoute("DELETE", "/films/*", async (_req, _res) => {
	throw new RouterError("Not implemented");
});
