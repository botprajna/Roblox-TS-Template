import { t } from "@rbxts/t";

export type HunterAttribute = {
	health: number;
	maxHealth: number;
	attack: number;
	level: number;
	experience: number;
	experienceMax: number;
	Gold: number;
	inventory: Item[];
};
export type Item = {
	Name: string;
	Count: number;
};

export type MonsterUnit = {
	health: number;
	maxHealth: number;
	attack: number;
};

export const HunterUnit = t.interface({
	Type: t.literal("Hunter"), // 固定值为 "Hunter"
	HunterId: t.number, // 必须是数字类型
	Guid: t.string, // 必须是字符串类型
});

const monsterConfigs = [
	{ Id: 1, Name: "Monster_L1", Level: 1, Health: 100, Attack: 10 },
	{ Id: 2, Name: "Monster_L2", Level: 2, Health: 200, Attack: 20 },
	{ Id: 3, Name: "Monster_L3", Level: 3, Health: 300, Attack: 30 },
	{ Id: 4, Name: "Monster_L4", Level: 4, Health: 400, Attack: 40 },
	{ Id: 5, Name: "Monster_L5", Level: 5, Health: 500, Attack: 50 },
];
export class MonsterConfig {
	static GetMonsterConfig(id: number) {
		const config = monsterConfigs.find((config) => config.Id === id);
		assert(config, `MonsterConfig:GetMonsterConfig() - Invalid monster id: ${id}`);

		return config;
	}
}
const HunterConfigs = [
	{ Id: 1, Name: "Hunter_L1", Level: 1, Health: 100, Attack: 10, Exp: 10 },
	{ Id: 2, Name: "Hunter_L2", Level: 2, Health: 200, Attack: 20, Exp: 20 },
	{ Id: 3, Name: "Hunter_L3", Level: 3, Health: 300, Attack: 30, Exp: 30 },
	{ Id: 4, Name: "Hunter_L4", Level: 4, Health: 400, Attack: 40, Exp: 40 },
	{ Id: 5, Name: "Hunter_L5", Level: 5, Health: 500, Attack: 50, Exp: 50 },
];
export class HunterConfig {
	static GetHunterConfig(id: number) {
		const config = HunterConfigs.find((config) => config.Id === id);
		assert(config, `HunterConfig:GetHunterConfig() - Invalid Hunter id: ${id}`);

		return config;
	}
	static GetAllConfigs() {
		return HunterConfigs;
	}
}
