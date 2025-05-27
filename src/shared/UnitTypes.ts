import { t } from "@rbxts/t";

export type UnitType = "Hunter" | "Monster";

export type UnitAttribute = {
	Name: string; // 名称
	Level: number; // 等级
	Health: number; // 生命值
	HealthMax: number; // 最大生命值
	Attack: number; // 攻击力
	Exp?: number; // 经验值（仅猎人有）
	ExpMax?: number; // 最大经验值（仅猎人有）
	Gold?: number; // 金币（仅猎人有）
	ItemBag?: UnitItem[]; // 物品栏（仅猎人有）
};

export type UnitItem = {
	Name: string;
	Count: number;
};

export type UnitAttrKeys = keyof UnitAttribute;

export const HunterUnit = t.interface({
	Type: t.literal("Hunter"),
	HunterId: t.number,
	Guid: t.string,
});
export const MonsterUnit = t.interface({
	Type: t.literal("Monster"),
	MonsterId: t.number,
	Guid: t.string,
});
export const Unit = t.union(HunterUnit, MonsterUnit);

export type HunterUnit = t.static<typeof HunterUnit>;
export type MonsterUnit = t.static<typeof MonsterUnit>;
export type Unit = t.static<typeof Unit>;

const monsterConfigs = [
	{ Id: 1, Name: "Monster_L1", Level: 1, Health: 100, Attack: 10 },
	{ Id: 2, Name: "Monster_L2", Level: 2, Health: 200, Attack: 20 },
	{ Id: 3, Name: "Monster_L3", Level: 3, Health: 300, Attack: 30 },
	{ Id: 4, Name: "Monster_L4", Level: 4, Health: 400, Attack: 40 },
	{ Id: 5, Name: "Monster_L5", Level: 5, Health: 500, Attack: 50 },
];
//怪物配置类
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
//猎人配置类
export class HunterConfig {
	static GetHunterConfig(id: number) {
		const config = HunterConfigs.find((config) => config.Id === id);
		assert(config, `HunterConfig:GetHunterConfig() - Invalid Hunter id: ${id}`);

		return config;
	}
}
