import { Service, OnStart } from "@flamework/core";
import { BornMonster } from "./BornMonster";
import { UnitModel } from "./UnitModel";

@Service({})
export class Hunter {
	constructor(
		private monsters: BornMonster,
		private unitModel: UnitModel,
	) {}

	GetNearbyMonsterPosition(): Vector3 {
		for (const [Monster] of this.monsters.Monsters) {
			const model = this.unitModel.GetModel(Monster);
			if (model && model.PrimaryPart) {
				return model.PrimaryPart.Position;
			}
		}
		// 没有怪物时返回默认坐标
		return new Vector3(1, 3, 1);
	}
}
