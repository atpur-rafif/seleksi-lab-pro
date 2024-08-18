import { RouterError } from "../module/router";
import { router } from "../module/route";

router.defineRoute("POST", "/login", async (_req, _res) => {
	throw new RouterError("Not implemented");
});

router.defineRoute("GET", "/self", async (_req, _res) => {
	throw new RouterError("Not implemented");
});

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
