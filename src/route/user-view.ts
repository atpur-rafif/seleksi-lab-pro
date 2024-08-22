import { basename } from "path";
import { router } from ".";
import { Film } from "../entity/film";
import { filmRepository, userRepository } from "../entity/repository";
import { FormDataParser } from "../module/formData";
import { FormFileIgnore } from "../module/formFile";
import { Validator } from "../module/validator";
import { RouterError } from "../module/router";
import { User } from "../entity/user";
import bcrypt from "bcryptjs"
import { auth } from "../module/auth";

const parser = new FormDataParser({ formFile: new FormFileIgnore() })
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
	const user = await auth.getUser(req);
	if (user) {
		res.statusCode = 303
		res.setHeader("Location", "/browse")
		res.end();
		return;
	}

	res.send(createHTML(`
<main style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; width: 100%;">
	<h1>Register</h1>
	<form method="POST" style="display: flex; flex-direction: column; gap: 0.5rem;">
		<input type="text" name="username" placeholder="username" />
		<input type="text" name="email" placeholder="email" />
		<input type="text" name="password" placeholder="password" />
		<button type="submit">Register</button>
	</form>
</main>
											`))
})

router.defineRoute("POST", "/register", async (req, res, { validator, emailPattern }) => {
	try {
		const data = validator.validate(await parser.parse(req))
		if (!emailPattern.test(data.email))
			throw new RouterError("Invalid email", 400)

		const result = await userRepository.existsBy({ email: data.email })
		if (result)
			throw new RouterError("Email already registered", 400)

		const user = new User({
			...data,
			balance: 0,
			password: await bcrypt.hash(data.password, 10)
		})
		userRepository.save(user);
		res.send(createHTML(`
<main style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; width: 100%; gap: 0.5rem;">
	User ${data.username} registered
	<a href="/login" style="text-decoration: none;">
		<button>Login</button>
	</a>
</main>
												`))
	} catch (e) {
		if (!(e instanceof RouterError)) e = new RouterError("Unknown error")
		res.send(createHTML(`
<main style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; width: 100%;">
	<h1>Register</h1>
	<form method="POST" style="display: flex; flex-direction: column; gap: 0.5rem;">
		<input type="text" name="username" placeholder="username" />
		<input type="text" name="email" placeholder="email" />
		<input type="text" name="password" placeholder="password" />
		<p style="margin: 0; text-align: center;">${e ? e.message : ""}</p>
		<button type="submit">Register</button>
	</form>
</main>
											`))
	}
}, {
	emailPattern: /^\S+@\S+\.\S+$/,
	validator: new Validator({
		type: "object",
		schema: {
			username: { type: "string" },
			email: { type: "string" },
			password: { type: "string" }
		}
	})
})

router.defineRoute("GET", "/login", async (req, res) => {
	const user = await auth.getUser(req);
	if (user) {
		res.statusCode = 303
		res.setHeader("Location", "/browse")
		res.end();
		return;
	}

	res.send(createHTML(`
<main style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; width: 100%;">
	<h1>Login</h1>
	<form method="POST" style="display: flex; flex-direction: column; gap: 0.5rem;">
		<input type="text" name="email" placeholder="email" value="test"/>
		<input type="text" name="password" placeholder="password" value="test"/>
		<button type="submit">Login</button>
	</form>
</main>
											`))
})

router.defineRoute("POST", "/login", async (req, res, { validator }) => {
	try {
		const data = validator.validate(await parser.parse(req))

		const user = await userRepository.findOneBy({ email: data.email })
		const result = await bcrypt.compare(data.password, user?.password ?? "")
		if (!user || !result)
			throw new RouterError("Invalid credentials", 400)

		res.statusCode = 303
		res.setHeader("Location", "/browse")
		res.setHeader("Set-Cookie", `jwt-token=${auth.sign({ identifier: user.email, type: "user" })}`)
		res.end();
	} catch (e) {
		if (!(e instanceof RouterError)) e = new RouterError("Unknown error")
		res.send(createHTML(`
<main style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; width: 100%;">
	<h1>Login</h1>
	<form method="POST" style="display: flex; flex-direction: column; gap: 0.5rem;">
		<input type="text" name="email" placeholder="email" value="a@a.a"/>
		<input type="text" name="password" placeholder="password" value="a"/>
		<p style="margin: 0; text-align: center;">${e ? e.message : ""}</p>
		<button type="submit">Login</button>
	</form>
</main>
											`))
	}
}, {
	validator: new Validator({
		type: "object",
		schema: {
			email: { type: "string" },
			password: { type: "string" }
		}
	})
})

// I know this not the most eficient way to do query. Unfortunately, time not on my side (2 hour left).
const pageSize = 10
router.defineRoute("GET", "/browse", async (req, res) => {
	let films = await filmRepository.find()
	const user = await auth.getUser(req)

	const { page: rawPage, keyword, boughtOnly } = req.param
	if (boughtOnly) {
		const boughtFilm = new Set((await userRepository.findOne({
			where: { id: user.id },
			relations: { films: true }
		})).films.map(v => v.id))
		films = films.filter(({ id }) => boughtFilm.has(id))
	}

	if (typeof keyword === "string") {
		const lowercaseKeywrod = keyword.toLowerCase()
		films = films.filter(({ title, director }) => title.toLowerCase().includes(lowercaseKeywrod) || director.toLowerCase().includes(lowercaseKeywrod))
	}

	const maxPage = Math.ceil(films.length / pageSize)
	let page = typeof rawPage === "string" ? parseInt(rawPage) : 1
	if (page > maxPage) page = maxPage
	if (Number.isNaN(page) || page < 1) page = 1
	films = films.slice((page - 1) * pageSize, page * pageSize)

	res.send(createHTML(`
<main style="width: 100vw; display: flex; justify-content: center; align-items: center; flex-direction: column; gap: 2rem;">
	<form style="padding-top: 3rem; display: flex; flex-direction: column">
		<div>
			(Page: <input type="number" name="page" value="${page}"/>)
			(Bought Only: <input type="checkbox" name="boughtOnly" ${boughtOnly ? "checked" : ""}/>)
			(<input type="text" placeholder="Keyword" name="keyword" />)
		</div>
		<button>Apply Filter</button>
	</form>
	<ul style="display:flex; flex-direction: row; gap: 1rem; flex-wrap: wrap; justify-content: center; align-items: center; position: relative; list-style-type: none; max-width: calc(100% - 4rem);">
	${films.length > 0 ? films.map(film => `
		<li style="background-color: lightblue; padding: 2rem; aspect-ratio: 2/3; width: clamp(15rem, 10%, 30rem); position: relative; display: flex; flex-direction: column; overflow: hidden; text-align: center;">
			<div style="margin-bottom: 0.5rem;">
				<a href="/film-detail/${film.id}" style="text-decoration: none;">
					<button>Detail</button>
				</a>
			</div>
			<div style="flex-grow: 1; overflow: hidden; display: flex; justify-content: center;">
				<img src="${film.cover_image_url}" style="height: 100%; aspect-ratio: 2/3; object-fit: cover;" />
			</div>
			<h2 style="margin-top: 0.5rem;">${film.title}</h2>
			<h3 style="margin: 0px;">${film.director}</h3>
		</li>`).join("") : "<p>Film not found, try to reset filter</p>"}
	</ul>
</main>
											`))
})

router.defineRoute("GET", "/film-detail/*", async (req, res) => {
	const id = basename(req.pathname);
	const film = await filmRepository.findOneBy({ id });

	const user = await auth.getUser(req);
	const boughtFilm = new Set((await userRepository.findOne({
		where: { id: user.id },
		relations: { films: true }
	})).films.map(v => v.id))

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
			${(user && !boughtFilm.has(id)) ?
			`<form style="margin: auto 1rem auto 0;" action="/buy/${film.id}" method="POST">
					<button>Buy</button>
				</form>` : ""
		}
		</div>
	</div>

	<div style="display:none">
	${film.cover_image_url}
	</div>

</main>
											`))
})

router.defineRoute("POST", "/buy/*", async (req, res) => {
	try {
		const id = basename(req.pathname)
		const { id: userId } = await auth.getUser(req)
		const user = await userRepository.findOne({ where: { id: userId }, relations: { films: true } })

		if (user.films.some(({ id: filmId }) => id === filmId))
			throw new RouterError("Film alrealdy bought")

		if (!user) {
			res.statusCode = 303
			res.setHeader("Location", "/login")
			res.end();
			return;
		}

		const film = await filmRepository.findOneBy({ id })
		if (!film)
			throw new RouterError("Film not found")

		if (user.balance < film.price)
			throw new RouterError("Insufficiet balance")

		user.balance -= film.price
		user.films.push(film)
		await userRepository.save(user);

		res.statusCode = 303
		res.setHeader("Location", `/film-detail/${film.id}`)
		res.end();
	} catch (e) {
		if (!(e instanceof RouterError)) e = new RouterError("Unknown error")
		res.send(createHTML(`
<main style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; width: 100%; gap: 0.5rem;">
	${e.message}
	<a href="/browse" style="text-decoration: none;">
		<button>Browse</button>
	</a>
</main>
											`))
	}
})

