import { dataSource } from "./entity/config";
import { Film } from "./entity/film";

async function main() {
	await dataSource.initialize();

	const filmRepository = dataSource.getRepository(Film);
	const film = new Film({
		release_year: 2020,
		director: "test",
		description: "test",
		title: "test",
		genre: ["a"],
		price: 100,
		duration: 10,
		video_url: "test",
		cover_image_url: "",
	});
	filmRepository.save(film);
}
main();
