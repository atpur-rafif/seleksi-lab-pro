import { RouterError } from "../module/router";
import { router } from "../module/route";

router.defineRoute("GET", "/films", async (_req, _res) => {
	throw new RouterError("Not implemented");
});

router.defineRoute("POST", "/films", async (_req, _res) => {
	throw new RouterError("Not implemented");
});

router.defineRoute("GET", "/films/*", async (_req, _res) => {
	throw new RouterError("Not implemented");
});

router.defineRoute("PUT", "/films/*", async (_req, _res) => {
	throw new RouterError("Not implemented");
});

router.defineRoute("DELETE", "/films/*", async (_req, _res) => {
	throw new RouterError("Not implemented");
});
