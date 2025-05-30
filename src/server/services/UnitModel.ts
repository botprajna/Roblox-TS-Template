import { Service, OnStart } from "@flamework/core";
import { t } from "@rbxts/t";
import { Unit } from "shared/UnitTypes";

@Service({})
export class UnitModel {
	private _unitModel = new Map<Unit, Model>();
	SetModel(unit: Unit, model: Model) {
		this._unitModel.set(unit, model);
	}
	GetModel(unit: Unit) {
		const model = this._unitModel.get(unit);
		assert(t.any(model), "UnitModelMgr:GetModel() Model not found");
		return model;
	}
}
