import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from "typeorm";
import { Pretify } from "../module/type";
import { Film } from "./film";

@Entity()
export class User {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column("varchar")
	username: string;

	@Column("varchar")
	email: string;

	@Column("integer")
	balance: number;

	@Column("varchar")
	password: string;

	@ManyToMany(() => Film)
	@JoinTable()
	films: Film[]

	constructor(value: Omit<Pretify<User>, "id" | "created_at" | "updated_at" | "serialize" | "films">) {
		Object.assign(this, value);
	}

	serialize() {
		const serialized = { ...this };
		delete serialized.password;
		delete serialized.films;
		return serialized;
	}
}
