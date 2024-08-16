import { Router } from "./invoker";
import path from "path";
export const router = new Router();

router.defineRoute("GET", "/", async (_, res) => {
	res.write("Hello, world");
	res.end();
});

router.defineRoute("POST", "/*", async (req, res) => {
	res.send({ id: path.basename(req.url ?? "") });
});
