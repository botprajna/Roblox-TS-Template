import { OnTick, Service } from "@flamework/core";
import { MonsterUnit, HunterUnit, Unit } from "shared/UnitTypes";
import { UnitModel } from "./UnitModel";
import { SceneService } from "./SceneService";
import { BehaviorTree3, BehaviorTreeCreator } from "@rbxts/behavior-tree-5";
import Signal from "@rbxts/signal";
import { ReplicatedStorage, RunService } from "@rbxts/services";
import { UnitSkill } from "./UnitSkill";
import { $assert, $warn } from "rbxts-transform-debug";
import { t } from "@rbxts/t";
import { HunterBTreeObj, MonsterBTreeObj } from "./MonsterAi";

@Service({})
export class UnitAiMgr implements OnTick {
	// 存储猎人及其对应的行为树和运行时对象
	private _hunterTrees = new Map<Unit, [HunterBTreeObj, BehaviorTree3<HunterBTreeObj>]>();

	constructor(
		private _unitModelMgr: UnitModel,
		private _unitSkillMgr: UnitSkill,
		private _sceneService: SceneService,
	) {}
	onTick(dt: number): void {
		for (const [unit, [obj, tree]] of this._hunterTrees) {
			tree.run(obj, dt);
		}
	}

	CreateAI(unit: Unit) {
		if (HunterUnit(unit)) {
			const unitModel = this._unitModelMgr.GetModel(unit);
			const humanoid = unitModel.FindFirstChildWhichIsA("Humanoid");
			$assert(unitModel, "UnitModel not found");
			$assert(humanoid, "Humanoid not found");
			const runObj: HunterBTreeObj = {
				Unit: unit as HunterUnit,
				CheckEnemyRadius: 20,
				LostTargetRadius: 40,
				AttackRadius: 8,
				UnitModelMgr: this._unitModelMgr,
				UnitSkillMgr: this._unitSkillMgr,
				SceneService: this._sceneService,
				UnitActionHandler: {
					Attack() {},
					MoveTo(position, timeout) {
						//timeout 用于实现超时反馈
						const OnFinished = new Signal<() => void>();
						humanoid.MoveTo(position);
						humanoid.MoveToFinished.Connect(() => {
							OnFinished.Fire();
						});
						return { OnFinished };
					},
				},
			};

			// 从ReplicatedStorage中获取行为树
			const tree = BehaviorTreeCreator.Create(
				ReplicatedStorage.FindFirstChild("Assets")?.FindFirstChild("HunterAi") as Folder,
			);

			this._hunterTrees.set(unit, [runObj, tree as BehaviorTree3<HunterBTreeObj>]);
			return;
		}
	}
	DestroyAI(unit: Unit) {}
}
