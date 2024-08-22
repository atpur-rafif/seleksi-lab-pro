import { basename, dirname } from "path";
import { userRepository } from "../entity/repository";
import { RouterError } from "../module/router";
import { router } from "./index";
import { Validator } from "../module/validator";
import { FormDataParser } from "../module/formData";
import { FormFileIgnore } from "../module/formFile";

const parser = new FormDataParser({
	formFile: new FormFileIgnore(),
});

router.defineRoute("GET", "/users", async (_, res) => {
	const users = await userRepository.find();
	res.send({
		status: "success",
		data: users,
	});
});

router.defineRoute("GET", "/user/*", async (req, res) => {
	const id = basename(req.url);
	const user = await userRepository.findOneBy({ id });
	if (!user) throw new RouterError("User not found", 400);
	res.send({
		status: "success",
		data: user,
	});
});

router.defineRoute(
	"POST",
	"/users/*/balance",
	async (req, res, { validator }) => {
		const id = basename(dirname(req.url));
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
	const id = basename(req.url);
	const user = await userRepository.findOneBy({ id });
	if (!user) throw new RouterError("User not found", 400);

	userRepository.remove(user);
	res.send({
		status: "success",
		data: user.serialize(),
	});
});
