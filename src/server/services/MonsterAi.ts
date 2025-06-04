import { Service, OnStart } from "@flamework/core";
import { MonsterUnit, HunterUnit, Unit } from "shared/UnitTypes";
import { UnitModel } from "./UnitModel";
import { SceneService } from "./SceneService";
import { BehaviorTree3, BehaviorTreeCreator } from "@rbxts/behavior-tree-5";
import Signal from "@rbxts/signal";
import { ReplicatedStorage } from "@rbxts/services";
import { UnitSkill } from "./UnitSkill";
import { $assert, $warn } from "rbxts-transform-debug";

// 定义怪物行为树的黑板数据结构 关键的数据共享
export type MonsterBTreeBlackboard = {
	curNearbyEnemies: Model[];
	patrolPath: Path | undefined; //巡逻路径
};

export type HunterBlackboard = {
	nearbyMonsters: Model[];
	targetMonster?: Model;
	curnearbyShop: Model[];
};

export type MonsterBTreeObj = {
	readonly CheckEnemyRadius: number; // 检测敌人范围
	readonly AttackRadius: number; //攻击范围
	readonly LostTargetRadius: number; //目标丢失范围
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
	// 存储怪物及其对应的行为树和运行时对象
	private _trees = new Map<Unit, [MonsterBTreeObj, BehaviorTree3<MonsterBTreeObj>]>();
	// 存储猎人及其对应的行为树和运行时对象
	private _hunterTrees = new Map<Unit, [HunterBTreeObj, BehaviorTree3<HunterBTreeObj>]>();
	constructor(
		private _unitModelMgr: UnitModel,
		private _unitSkillMgr: UnitSkill,
		private _sceneService: SceneService,
	) {}
	// 更新所有AI行为树
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
			warn("CreateAI-Monster", unit);
			const unitModel = this._unitModelMgr.GetModel(unit); //获取怪兽模型和属性
			const humanoid = unitModel.FindFirstChildWhichIsA("Humanoid");
			assert(unitModel, "UnitModel not found");
			assert(humanoid, "Humanoid not found");
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
					// 移动
					MoveTo(position, timeout) {
						// 创建移动完成信号
						const OnFinished = new Signal<() => void>();
						humanoid.MoveTo(position); // 将humanoid移动到指定位置
						// 监听移动完成事件
						humanoid.MoveToFinished.Connect(() => {
							OnFinished.Fire();
						});
						return { OnFinished };
					},
				},
			};

			// 从ReplicatedStorage中获取行为树
			const tree = BehaviorTreeCreator.Create(
				ReplicatedStorage.FindFirstChild("Assets")
					?.FindFirstChild("Monsters")
					?.FindFirstChild("MonsterAI") as Folder,
			);
			this._trees.set(unit, [runObj, tree as BehaviorTree3<MonsterBTreeObj>]);
			return;
		}
	}
	DestroyAI(unit: Unit) {}
}
