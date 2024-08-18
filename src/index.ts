import { createServer } from "node:http";
import { router } from "./route/index";
import "./route/film";
import "./route/user";

async function main() {
	const server = createServer({}, (req, res) => {
		router.run(req.method ?? "GET", req.url ?? "/", req, res);
	});
	server.listen(8080);
}
main();
