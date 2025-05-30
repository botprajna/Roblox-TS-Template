import { Service, OnStart } from "@flamework/core";
import { MonsterUnit, HunterUnit, Unit } from "shared/UnitTypes";
import { UnitModel } from "./UnitModel";
import { SceneService } from "./SceneService";
import { BehaviorTree3, BehaviorTreeCreator } from "@rbxts/behavior-tree-5";
import Signal from "@rbxts/signal";
import { ReplicatedStorage } from "@rbxts/services";
import { UnitSkill } from "./UnitSkill";
import { $assert, $warn } from "rbxts-transform-debug";

export type MonsterBTreeBlackboard = {
	curNearbyEnemies: Model[];
	patrolPath: Path | undefined;
};
export type HunterBlackboard = {
	nearbyMonsters: Model[];
	targetMonster?: Model;
	curnearbyShop: Model[];
};
export type MonsterBTreeObj = {
	readonly CheckEnemyRadius: number;
	readonly AttackRadius: number;
	readonly LostTargetRadius: number;
	Unit: MonsterUnit;
	UnitActionHandler: UnitActionHandler;
	UnitModelMgr: UnitModel;
	UnitSkillMgr: UnitSkill;
	SceneService: SceneService;
};
export type HunterBTreeObj = {
	readonly CheckEnemyRadius: number;
	readonly AttackRadius: number;
	readonly LostTargetRadius: number;
	Unit: HunterUnit;
	UnitActionHandler: UnitActionHandler;
	UnitModelMgr: UnitModel;
	UnitSkillMgr: UnitSkill;
	SceneService: SceneService;
};

type CanMove = { MoveTo(position: Vector3, timeout?: number): { OnFinished: Signal<() => void> } };
type CanAttack = { Attack(): void };
type UnitActionHandler = CanMove & CanAttack;
@Service({})
export class UnitAiMgr {
	private _trees = new Map<Unit, [MonsterBTreeObj, BehaviorTree3<MonsterBTreeObj>]>();
	private _hunterTrees = new Map<Unit, [HunterBTreeObj, BehaviorTree3<HunterBTreeObj>]>();
	constructor(
		private _unitModelMgr: UnitModel,
		private _unitSkillMgr: UnitSkill,
		private _sceneService: SceneService,
	) {}
	Update(dt: number) {
		for (const [unit, [obj, tree]] of this._trees) {
			tree.run(obj, dt);
		}
		for (const [unit, [obj, tree]] of this._hunterTrees) {
			tree.run(obj, dt);
		}
	}

	CreateAI(unit: Unit) {
		if (MonsterUnit(unit)) {
			// 怪物AI
			$warn("CreateAI-Monster", unit);
			const unitModel = this._unitModelMgr.GetModel(unit);
			const humanoid = unitModel.FindFirstChildWhichIsA("Humanoid");
			$assert(unitModel, "UnitModel not found");
			$assert(humanoid, "Humanoid not found");
			const runObj: MonsterBTreeObj = {
				Unit: unit as MonsterUnit,
				CheckEnemyRadius: 20,
				LostTargetRadius: 40,
				AttackRadius: 8,
				UnitModelMgr: this._unitModelMgr,
				UnitSkillMgr: this._unitSkillMgr,
				SceneService: this._sceneService,
				UnitActionHandler: {
					Attack() {},
					MoveTo(position, timeout) {
						const OnFinished = new Signal<() => void>();
						humanoid.MoveTo(position);
						humanoid.MoveToFinished.Connect(() => {
							OnFinished.Fire();
						});
						return { OnFinished };
					},
				},
			};
			const tree = BehaviorTreeCreator.Create(
				ReplicatedStorage.FindFirstChild("BTree")
					?.FindFirstChild("Monster")
					?.FindFirstChild("MonsterAI") as Folder,
			);
			this._trees.set(unit, [runObj, tree as BehaviorTree3<MonsterBTreeObj>]);
			return;
		}
	}
	DestroyAI(unit: Unit) {}
}
