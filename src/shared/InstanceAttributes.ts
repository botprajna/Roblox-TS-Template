import { Item } from "./UnitTypes";

export type InstanceAttributes = {
	health: number;
	maxHealth: number;
	attack: number;
	level: number;
	experience: number;
	experienceMax: number;
	Gold: number;
	inventory: Item[];
};
