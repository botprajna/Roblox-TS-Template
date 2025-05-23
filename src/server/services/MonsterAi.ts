import { Service, OnStart } from "@flamework/core";
import { BehaviorTree3, BehaviorTreeCreator } from "@rbxts/behavior-tree-5";
import Signal from "@rbxts/signal";
import { HunterConfigType, MonsterUnit } from "shared/UnitTypes";
import { UnitModel } from "server/services/UnitModel";
import { $assert, $warn } from "rbxts-transform-debug";
import { ReplicatedStorage } from "@rbxts/services";

export type MonsterBTreeBlackboard = {
	curNearbyEnemies: Model[];
	patrolPath: Path | undefined;
};

export type MonsterBTreeObj = {
	readonly CheckEnemyRadius: number;
	readonly AttackRadius: number;
	readonly LostTargetRadius: number;
	// Unit: MonsterUnit;
	UnitActionHandler: UnitActionHandler;
	UnitModelMgr: UnitModel;
};

type CanMove = { MoveTo(position: Vector3, timeout?: number): { OnFinished: Signal<() => void> } };
type CanAttack = { Attack(): void };
type UnitActionHandler = CanMove & CanAttack;

@Service({})
export class MonsterAi {
	private _MonsterTrees = new Map<HunterConfigType, [MonsterBTreeObj, BehaviorTree3<MonsterBTreeObj>]>();
	constructor(private _unitModelMgr: UnitModel) {}
	Update(dt: number) {
		for (const [unit, [obj, tree]] of this._MonsterTrees) {
			tree.run(obj, dt);
		}
	}
	// createAi(MonsterAi: MonsterUnit) {
	// 	if (MonsterUnit(MonsterAi)) {
	// 		// 怪物AI
	// 		$warn("CreateAI-Monster", MonsterAi);
	// 		const unitModel = this._unitModelMgr.GetModel(MonsterAi);
	// 		const humanoid = unitModel!.FindFirstChildWhichIsA("Humanoid");
	// 		$assert(unitModel, "UnitModel not found");
	// 		$assert(humanoid, "Humanoid not found");
	// 		const runObj: MonsterBTreeObj = {
	// 			// Unit: MonsterAi,
	// 			CheckEnemyRadius: 20,
	// 			LostTargetRadius: 40,
	// 			AttackRadius: 8,
	// 			UnitModelMgr: this._unitModelMgr,
	// 			UnitActionHandler: {
	// 				Attack() {},
	// 				MoveTo(position, timeout) {
	// 					const OnFinished = new Signal<() => void>();
	// 					humanoid.MoveTo(position);
	// 					humanoid.MoveToFinished.Connect(() => {
	// 						OnFinished.Fire();
	// 					});
	// 					return { OnFinished };
	// 				},
	// 			},
	// 		};
	// 		const tree = BehaviorTreeCreator.Create(
	// 			ReplicatedStorage.FindFirstChild("BTree")
	// 				?.FindFirstChild("Monster")
	// 				?.FindFirstChild("MonsterAI") as Folder,
	// 		);
	// 		this._MonsterTrees.set(MonsterAi, [runObj, tree as BehaviorTree3<MonsterBTreeObj>]);
	// 		return;
	// 	}
	// }
}
