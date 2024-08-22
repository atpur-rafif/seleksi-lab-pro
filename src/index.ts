import { createServer } from "http";
import { router } from "./route/index";
import "./route/film";
import "./route/user";
import "./route/user-view";
import "./route/admin";
import { dataSource } from "./entity/config";
import { parse } from "url";
import { adminRepository } from "./entity/repository";
import { Admin } from "./entity/admin";
import bcrypt from "bcryptjs";

async function main() {
	await dataSource.initialize();

	const admin = await adminRepository.existsBy({ username: "admin" });
	if (!admin) {
		const newAdmin = new Admin({
			username: "admin",
			password: await bcrypt.hash("adminadmin", 10),
			email: "admin@example.com",
		});
		await adminRepository.save(newAdmin);
	}

	const server = createServer({}, (req, res) => {
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Methods", "*");
		res.setHeader("Access-Control-Allow-Headers", "Authorization,*");

		if (req.method === "OPTIONS") {
			res.setHeader("Allow", "*");
			res.end();
			return;
		}

		const pathname = parse(req.url).pathname;
		router.run(req.method ?? "GET", pathname ?? "/", req, res);
	});
	server.listen(8080);
}
main();
