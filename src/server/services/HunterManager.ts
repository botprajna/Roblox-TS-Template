import { Service } from "@flamework/core";
import { HunterUnit, UnitAttribute } from "shared/UnitTypes";

@Service({})
export class HunterManager {
	// 共享的猎人数据存储
	public hunters = new Map<HunterUnit, UnitAttribute>();

	// 添加猎人
	addHunter(hunter: HunterUnit, attributes: UnitAttribute) {
		this.hunters.set(hunter, attributes);
	}

	// 获取属性
	getAttributes(hunter: HunterUnit): UnitAttribute | undefined {
		return this.hunters.get(hunter);
	}

	// 更新属性
	updateAttributes(hunter: HunterUnit, attributes: UnitAttribute) {
		this.hunters.set(hunter, attributes);
	}
}
