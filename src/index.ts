import { createServer } from "http";
import { router } from "./route/index";
import "./route/film";
import "./route/user";
import "./route/admin";
import { dataSource } from "./entity/config";

async function main() {
	await dataSource.initialize();
	const server = createServer({}, (req, res) => {
		router.run(req.method ?? "GET", req.url ?? "/", req, res);
	});
	server.listen(8080);
}
main();
