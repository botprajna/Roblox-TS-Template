import { Service, OnStart } from "@flamework/core";
import { t } from "@rbxts/t";
import { $assert } from "rbxts-transform-debug";
import { Unit } from "shared/UnitTypes";

@Service({})
export class UnitModel {
	private _unitModel = new Map<Unit, Model>();
	GetModel(unit: Unit) {
		const model = this._unitModel.get(unit);
		assert(t.any(model), "UnitModelMgr:GetModel() Model not found");
		return model;
	}
	GetNearbyModels(unit: Unit, radius: number) {
		const unitModel = this.GetModel(unit);
		assert(t.any(unitModel), "UnitModelMgr:GetNearbyModels() Unit model not found");
		$assert(t.any(unitModel.PrimaryPart), "UnitModelMgr:GetNearbyModels() Unit model PrimaryPart not found");
		// assert(t.any(unitModel.PrimaryPart), "UnitModelMgr:GetNearbyModels() Unit model PrimaryPart not found");
		const result = new Array<Model>();
		for (const [_, model] of this._unitModel) {
			assert(t.any(model.PrimaryPart), "UnitModelMgr:GetNearbyModels() PrimaryPart not found");
			if (model.PrimaryPart.Position.sub(unitModel.PrimaryPart.Position).Magnitude <= radius) {
				result.push(model);
			}
		}
		return result;
	}
}
