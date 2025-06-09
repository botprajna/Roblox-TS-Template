import { Service, OnStart } from "@flamework/core";
import { HunterUnit, UnitAttribute } from "shared/UnitTypes";

@Service({})
export class HunterManager implements OnStart {
	onStart() {}

	public Hunters = new Map<HunterUnit, UnitAttribute>();
	// 存储
	AddHunter(hunter: HunterUnit, attributes: UnitAttribute) {
		this.Hunters.set(hunter, attributes);
	}

	GetAttributes(hunter: HunterUnit): UnitAttribute | undefined {
		return this.Hunters.get(hunter);
	}

	UpdateAttributes(hunter: HunterUnit, attributes: UnitAttribute) {
		this.Hunters.set(hunter, attributes);
	}
}
