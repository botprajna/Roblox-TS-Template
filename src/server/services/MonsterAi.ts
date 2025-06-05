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
	UnitActionHandler: UnitActionHandler; // 行为接口（攻击、移动）
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
export class UnitAiMgr implements OnTick {
	// 存储怪物及其对应的行为树和运行时对象
	private _trees = new Map<Unit, [MonsterBTreeObj, BehaviorTree3<MonsterBTreeObj>]>();
	// 存储猎人及其对应的行为树和运行时对象
	private _hunterTrees = new Map<Unit, [HunterBTreeObj, BehaviorTree3<HunterBTreeObj>]>();
	constructor(
		private _unitModelMgr: UnitModel,
		private _unitSkillMgr: UnitSkill,
		private _sceneService: SceneService,
	) {}
	onTick(dt: number): void {
		for (const [unit, [obj, tree]] of this._trees) {
			print(1);
			tree.run(obj, dt);
		}
		for (const [unit, [obj, tree]] of this._hunterTrees) {
			tree.run(obj, dt);
		}
	}

	CreateAI(unit: Unit) {
		if (MonsterUnit(unit)) {
			// $warn("CreateAI: 进入 MonsterUnit 分支", unit);
			const unitModel = this._unitModelMgr.GetModel(unit);
			// $warn("CreateAI: 获取到 unitModel", unitModel);
			const humanoid = unitModel.FindFirstChildWhichIsA("Humanoid");
			// $warn("CreateAI: 获取到 humanoid", humanoid);
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
						//timeout 用于实现超时反馈
						const OnFinished = new Signal<() => void>();
						humanoid.MoveTo(position);
						humanoid.MoveToFinished.Connect((reached) => {
							// $warn("humanoid.MoveToFinished 触发，是否到达目标：", reached);
							// $warn(
							// 	"目标位置：",
							// 	position,
							// 	"当前实际位置：",
							// 	humanoid.Parent && humanoid.Parent.IsA("Model")
							// 		? (humanoid.Parent as Model).PrimaryPart?.Position
							// 		: undefined,
							// );
							OnFinished.Fire();
						});
						return { OnFinished };
					},
				},
			};
			// $warn("CreateAI: runObj 创建完成", runObj);

			// 从ReplicatedStorage中获取行为树
			const tree = BehaviorTreeCreator.Create(
				ReplicatedStorage.FindFirstChild("Assets")?.FindFirstChild("MonsterAi") as Folder,
			);

			// $warn("CreateAI: 行为树创建结果", tree);
			this._trees.set(unit, [runObj, tree as BehaviorTree3<MonsterBTreeObj>]);
			return;
		}
	}
	DestroyAI(unit: Unit) {}
}
