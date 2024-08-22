import { createServer } from "http";
import { router } from "./route/index";
import "./route/film";
import "./route/user";
import "./route/user-view";
import "./route/admin";
import { dataSource } from "./entity/config";
import { parse } from "url";

async function main() {
	await dataSource.initialize();
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
