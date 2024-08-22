import { dataSource } from "./config";
import { Film } from "./film";
import { Admin } from "./admin";
import { User } from "./user";

export const filmRepository = dataSource.getRepository(Film);
export const adminRepository = dataSource.getRepository(Admin);
export const userRepository = dataSource.getRepository(User);
