import { RouterError } from "../module/router";
import { router } from "./index";

router.defineRoute("GET", "/users", async (_req, _res) => {
	throw new RouterError("Not implemented");
});

router.defineRoute("GET", "/user/*", async (_req, _res) => {
	throw new RouterError("Not implemented");
});

router.defineRoute("POST", "/users/*/balance", async (_req, _res) => {
	throw new RouterError("Not implemented");
});

router.defineRoute("DELETE", "/users/*", async (_req, _res) => {
	throw new RouterError("Not implemented");
});
