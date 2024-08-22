import { Admin } from "../entity/admin";
import { dataSource } from "../entity/config";
import { auth } from "../module/auth";
import { FormDataParser } from "../module/formData";
import { FormFileIgnore } from "../module/formFile";
import { RouterError } from "../module/router";
import { Validator } from "../module/validator";
import { router } from "./index";
import bcyrpt from "bcryptjs";

const adminRepository = dataSource.getRepository(Admin);
const parser = new FormDataParser({
	formFile: new FormFileIgnore(),
});

router.defineRoute(
	"POST",
	"/login",
	async (req, res, { validator }) => {
		const { username, password } = validator.validate(await parser.parse(req));
		const admin = await adminRepository.findOneBy({
			username,
		});
		if (!admin) throw new RouterError("Invalid credentials", 400);

		const result = await bcyrpt.compare(password, admin.password);
		if (!result) throw new RouterError("Invalid credentials", 400);

		const token = auth.sign({ name: admin.username, type: "admin" });
		res.send({
			status: "success",
			data: {
				username: admin.username,
				token,
			},
		});
	},
	{
		validator: new Validator({
			type: "object",
			schema: {
				username: { type: "string" },
				password: { type: "string" },
			},
		}),
	},
);

router.defineRoute("GET", "/self", async (req, res) => {
	const { username } = await auth.getAdmin(req);
	res.send({
		status: "success",
		data: {
			username,
			token: auth.sign({ name: username, type: "admin" }),
		},
	});
});
