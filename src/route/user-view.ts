import { basename } from "path";
import { router } from ".";
import { Film } from "../entity/film";
import { filmRepository } from "../entity/repository";

function createHTML(body: string) {
	return `
<!DOCTYPE html>
<html>
	<head></head>
		<body style="width: 100vw; height: 100vh; margin: 0px; font-family: Arial; position: relative;"> 
			${body}
		</body>
</html>
	`
}

router.defineRoute("GET", "/register", async (req, res) => {
	res.send(createHTML(`
<main style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; width: 100%;">
	<h1>Register</h1>
	<form method="POST" style="display: flex; flex-direction: column; gap: 0.5rem;">
		<input type="text" name="username" placeholder="username" value="test"/>
		<input type="text" name="email" placeholder="email" value="test"/>
		<input type="text" name="password" placeholder="password" value="test"/>
		<button type="submit">Register</button>
	</form>
</main>
											`))
})

router.defineRoute("GET", "/login", async (req, res) => {
	res.send(createHTML(`
<main style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; width: 100%;">
	<h1>Register</h1>
	<form method="POST" style="display: flex; flex-direction: column; gap: 0.5rem;">
		<input type="text" name="email" placeholder="email" value="test"/>
		<input type="text" name="password" placeholder="password" value="test"/>
		<button type="submit">Register</button>
	</form>
</main>
											`))
})

router.defineRoute("GET", "/browse", async (req, res) => {
	const [film] = await filmRepository.find()
	const films = Array(100).fill(film) as Film[]
	res.send(createHTML(`
<main style="width: 100vw; display: flex; justify-content: center; align-items: center; flex-direction: column; gap: 2rem;">
	<form>
		<input type="text" placeholder="Keyword" name="keyword" />
		<button>Search</button>
	</form>
	<ul style="display:flex; flex-direction: row; gap: 1rem; flex-wrap: wrap; justify-content: center; align-items: center; position: relative; list-style-type: none; max-width: calc(100% - 4rem);">
	${films.map(film => `
		<li style="background-color: lightblue; padding: 2rem; aspect-ratio: 2/3; width: clamp(15rem, 10%, 30rem); position: relative; display: flex; flex-direction: column; overflow: hidden; text-align: center;">
			<div style="margin-bottom: 0.5rem;">
				<a href="/film-detail/${film.id}" style="text-decoration: none;">
					<button>Detail</button>
				</a>
				<form style="display: inline-block;">
					<input name="id" value="${film.id}" style="display:none;" />
					<button type="submit">Beli (${film.price}$)</button>
				</form>
			</div>
			<div style="flex-grow: 1; overflow: hidden; display: flex; justify-content: center;">
				<img src="${film.cover_image_url}" style="height: 100%; aspect-ratio: 2/3; object-fit: cover;" />
			</div>
			<h2 style="margin-top: 0.5rem;">${film.title}</h2>
			<h3 style="margin: 0px;">${film.director}</h3>
		</li>`).join("")}
	</ul>
</main>
											`))
})

router.defineRoute("GET", "/film-detail/*", async (req, res) => {
	const id = basename(req.url);
	const film = await filmRepository.findOneBy({ id });
	console.log(film)
	res.send(createHTML(`
<main style="width: 100%; height: 100%; position: relative; position: relative; display: flex; justify-content: center; align-items: center;">
	<div style="overflow: hidden; display: flex; flex-direction: column; width: calc(100% - 5rem); height: calc(100% - 5rem); position: relative; background-color: lightgray">
		<div style="display: flex; flex-direction: row;; margin: 0.5rem; padding: 0.4rem;">
			<h1 style="margin: 0;">${film.title}</h1>
			<h2 style="margin: 0; margin-left: auto;">${film.director}</h2>
		</div>
		<div style="overflow: hidden; width: 100%; flex-grow: 1; background-color: black; display: flex; align-items: center; justify-content: center;">
			<video style="height: calc(100% - 3rem); width: calc(100% - 3rem)" controls>
				<source src="${film.video_url}"/>
			</video>
		</div>
		<div style="display: flex; flex-direction: row; position: relative;">
			<div style="display: flex; flex-direction: row; gap: 0.5rem; font-size: 0.7rem; padding: 0.5rem;">
				${film.genre.map(genre => `<div style="background-color: gray; padding: 0.5rem; border-radius: 0.3rem;">${genre}</div>`).join("")}
			</div>

			<p style="margin: auto 1rem auto auto;">
				Duration ${Math.ceil(film.duration / 60)}min, Release year: ${film.release_year}, Price ${film.price}
			</p>
		</div>
	</div>

	<div style="display:none">
	${film.cover_image_url}
	</div>

</main>
											`))
})




