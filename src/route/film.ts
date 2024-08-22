import { RouterError } from "../module/router";
import { router } from "./index";
import { FormDataParser } from "../module/formData";
import { Validator } from "../module/validator";
import { FormFileToDisk } from "../module/formFileToDisk";
import mime from "mime";
import { filmRepository } from "../entity/repository";
import { Film } from "../entity/film";
import { basename } from "node:path";

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
const parser = new FormDataParser({
	formFile: formFileToDisk,
	forceField: {
		array: ["genre"],
		file: ["video", "cover_image"],
	},
});

router.defineRoute("GET", "/films", async (_, res) => {
	res.send({
		status: "success",
		data: (await filmRepository.find()).map((v) => v.serialize()),
	});
});

router.defineRoute("GET", "/films/*", async (req, res) => {
	const id = basename(req.url || "");
	const film = await filmRepository.findOneBy({ id });
	if (!film) throw new RouterError("Film not found", 404);
	res.send(film.serialize());
});

router.defineRoute(
	"POST",
	"/films",
	async (req, res, { validator }) => {
		const data = validator.validate(await parser.parse(req));
		const newFilm = new Film(
			Object.assign(data, {
				video_url: data.video,
				cover_image_url: data.cover_image,
			}),
		);
		await filmRepository.save(newFilm);
		res.send({
			status: "success",
			data: newFilm.serialize(),
		});
	},
	{
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

router.defineRoute(
	"PUT",
	"/films/*",
	async (req, res, { validator }) => {
		const id = basename(req.url || "");
		const data = validator.validate(await parser.parse(req));
		const film = await filmRepository.findOneBy({ id });
		if (!film) throw new RouterError("Film not found", 404);
		Object.assign(film, data);
		filmRepository.save(film);
		res.send({
			status: "success",
			data: film.serialize(),
		});
	},
	{
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
				video: { type: "string", optional: true },
				cover_image: { type: "string", optional: true },
			},
		}),
	},
);

router.defineRoute("DELETE", "/films/*", async (req, res) => {
	const id = basename(req.url || "");
	const film = await filmRepository.findOneBy({ id });
	if (!film) throw new RouterError("Film not found", 404);
	filmRepository.remove(film);
	res.send(film.serialize());
});
