import { Service } from "@flamework/core";
import { HunterUnit, UnitAttribute } from "shared/UnitTypes";

@Service({})
export class HunterManager {
	// 猎人数据存储
	public Hunters = new Map<HunterUnit, UnitAttribute>();

	// 添加猎人
	AddHunter(hunter: HunterUnit, attributes: UnitAttribute) {
		this.Hunters.set(hunter, attributes);
	}

	// 获取属性
	GetAttributes(hunter: HunterUnit): UnitAttribute | undefined {
		return this.Hunters.get(hunter);
	}

	// 更新属性
	UpdateAttributes(hunter: HunterUnit, attributes: UnitAttribute) {
		this.Hunters.set(hunter, attributes);
	}
}
