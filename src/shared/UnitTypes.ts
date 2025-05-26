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

//定义猎人类型检查器
export const HunterUnitChecker = t.interface({
	Type: t.literal("Hunter"), // 固定值为 "Hunter"
	HunterId: t.number, // 必须是数字类型
	Guid: t.string, // 必须是字符串类型
});

export const MonsterUnitChecker = t.interface({
	Type: t.literal("Monster"), // 固定值为 "Monster"
	MonsterId: t.number, // 必须是数字类型
	Guid: t.string, // 必须是字符串类型
});

export type MonsterUnit = t.static<typeof MonsterUnitChecker>;

// export type MonsterUnit = t.static<typeof MonsterUnit>;

export const UnitChecker = t.union(HunterUnitChecker, MonsterUnitChecker);

const valueIsMonster = MonsterUnitChecker({});

// 定义一个联合类型，表示猎人或怪物的单位类型
export type HunterUnit = t.static<typeof HunterUnitChecker>;
export type Unit = t.static<typeof UnitChecker>;

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
