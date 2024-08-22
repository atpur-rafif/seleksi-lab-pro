import { RouterError } from "../module/router";
import { router } from "./index";
import { FormDataParser } from "../module/formData";
import { Validator } from "../module/validator";
import { FormFileToDisk } from "../module/formFileToDisk";

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
		parser: new FormDataParser({
			formFile: new FormFileToDisk("http://localhost:8080/static/", "static"),
			forceField: {
				array: ["genre"],
				file: ["video", "cover_image"],
			},
		}),
		validator: new Validator({
			type: "object",
			schema: {
				id: { type: "string" },
				title: { type: "string" },
				description: { type: "string" },
				director: { type: "string" },
				release_year: { type: "number" },
				genre: { type: "array", item: { type: "string" } },
				price: { type: "number" },
				duration: { type: "number" },
				video: { type: "string" },
				cover_image: { type: "string", optional: true },
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
