import { HunterAttribute, HunterConfigType } from "shared/UnitTypes";

// 猎人属性组件
export class HunterAttributes {
	private static ATTRIBUTE_NAMES = [
		"health",
		"maxHealth",
		"attack",
		"level",
		"experience",
		"experienceMax",
		"Gold",
		"inventory",
	] as const;

	// 初始化模型属性
	static initModelAttributes(instance: Model, config: HunterConfigType) {
		// 设置基础属性
		this.setBaseAttributes(instance, config);
	}

	// 设置基础属性
	private static setBaseAttributes(instance: Model, config: HunterConfigType) {
		const attributes: Partial<HunterAttribute> = {
			health: config.Health,
			maxHealth: config.Health, // 初始最大生命=配置生命值
			attack: config.Attack,
			level: config.Level,
			experience: 0,
			experienceMax: config.Exp,
			Gold: 0,
			inventory: [],
		};
	}
	private static getAttributes(instance: Model) {}
}
