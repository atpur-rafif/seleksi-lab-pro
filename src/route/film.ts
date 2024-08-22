import { RouterError } from "../module/router";
import { router } from "./index";
import { FormDataParser } from "../module/formData";
import { Validator } from "../module/validator";
import { FormFileToDisk } from "../module/formFileToDisk";
import mime from "mime";

const formFileToDisk = new FormFileToDisk(
	"http://localhost:8080/static/",
	"static",
	(name, { filename }) => {
		const mimeType = mime.getType(filename) || "/";
		const [type, _] = mimeType.split("/");

		switch (name) {
			case "video":
				if (type !== "video")
					throw new RouterError("Expected video file for field 'video'", 400);
				break;
			case "cover_image":
				if (type !== "image")
					throw new RouterError(
						"Expected image file for field 'cover_image'",
						400,
					);
				break;
		}
	},
);

const formDataParser = new FormDataParser({
	formFile: formFileToDisk,
	forceField: {
		array: ["genre"],
		file: ["video", "cover_image"],
	},
});

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
		parser: formDataParser,
		validator: new Validator({
			type: "object",
			schema: {
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
