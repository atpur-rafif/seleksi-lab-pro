import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";
import { Pretify } from "../module/type";

@Entity()
export class Film {
	// @PrimaryGeneratedColumn("uuid")
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column("varchar")
	title: string;

	@Column("varchar")
	description: string;

	@Column("varchar")
	director: string;

	@Column("integer")
	release_year: number;

	@Column("varchar")
	private _genre: string;

	get genre() {
		return Object.freeze(JSON.parse(this._genre));
	}
	set genre(values: string[]) {
		this._genre = JSON.stringify(values);
	}

	@Column("integer")
	price: number;

	@Column("integer")
	duration: number;

	@Column("varchar")
	video_url: string;

	@Column("varchar", { nullable: true })
	cover_image_url: string | null;

	@CreateDateColumn()
	created_at: string;

	@UpdateDateColumn()
	updated_at: string;

	constructor(
		value: Pretify<
			Omit<
				Film,
				"id" | "created_at" | "updated_at" | "cover_image_url" | "serialize"
			>
		>,
	) {
		Object.assign(this, value);
	}

	serialize(): Pretify<Film> {
		const serialized = { ...this };
		delete serialized._genre;
		return {
			...serialized,
			genre: this.genre,
			id: this.id.toString(),
		};
	}
}
