import { basename, dirname } from "path";
import { userRepository } from "../entity/repository";
import { RouterError } from "../module/router";
import { router } from "./index";
import { Validator } from "../module/validator";
import { auth } from "../module/auth";
import { JsonParser } from "../module/jsonParser";

const parser = new JsonParser();

router.defineRoute("GET", "/users", async (req, res) => {
	await auth.getAdmin(req);

	const users = await userRepository.find();
	res.send({
		status: "success",
		data: users.map((v) => v.serialize()),
	});
});

router.defineRoute("GET", "/users/*", async (req, res) => {
	await auth.getAdmin(req);

	const id = basename(req.pathname);
	const user = await userRepository.findOneBy({ id });
	if (!user) throw new RouterError("User not found", 400);
	res.send({
		status: "success",
		data: user.serialize(),
	});
});

router.defineRoute(
	"POST",
	"/users/*/balance",
	async (req, res, { validator }) => {
		await auth.getAdmin(req);

		const id = basename(dirname(req.pathname));
		const user = await userRepository.findOneBy({ id });
		if (!user) throw new RouterError("User not found", 400);

		const data = validator.validate(await parser.parse(req));
		user.balance += data.increment;
		userRepository.save(user);

		res.send({
			status: "success",
			data: user.serialize(),
		});
	},
	{
		validator: new Validator({
			type: "object",
			schema: {
				increment: { type: "number" },
			},
		}),
	},
);

router.defineRoute("DELETE", "/users/*", async (req, res) => {
	await auth.getAdmin(req);

	const id = basename(req.pathname);
	const user = await userRepository.findOneBy({ id });
	if (!user) throw new RouterError("User not found", 400);

	userRepository.remove(user);
	res.send({
		status: "success",
		data: user.serialize(),
	});
});
