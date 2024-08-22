import { createServer } from "http";
import { router } from "./route/index";
import "./route/film";
import "./route/user";
import "./route/admin";
import { dataSource } from "./entity/config";

async function main() {
	await dataSource.initialize();
	const server = createServer({}, (req, res) => {
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Methods", "*");
		res.setHeader("Access-Control-Allow-Headers", "*");
		res.setHeader("Access-Control-Allow-Credentials", "true");

		if (req.method === "OPTIONS") {
			res.setHeader("Allow", "*");
			res.end();
			return;
		}

		router.run(req.method ?? "GET", req.url ?? "/", req, res);
	});
	server.listen(8080);
}
main();
