import "reflect-metadata";
import { DataSource } from "typeorm";
import { Film } from "./film";
import { User } from "./user";
import { Admin } from "./admin";

// Need to explicitly define datatypes for each column
// See: https://github.com/evanw/esbuild/issues/257
export const dataSource = new DataSource({
	type: "sqlite",
	database: "tmp.sqlite",
	synchronize: true,
	entities: [Film, Admin, User],
});
