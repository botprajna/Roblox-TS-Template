import { Service, OnStart } from "@flamework/core";
import { UnitModel } from "./UnitModel";
import { HttpService, ReplicatedStorage, Workspace } from "@rbxts/services";
import { MonsterConfig, MonsterUnit, Unit, UnitAttribute } from "shared/UnitTypes";
import { t } from "@rbxts/t";
import { SceneService } from "./SceneService";
import { UnitAiMgr } from "./MonsterAi";

@Service({})
export class BornMonster implements OnStart {
	private SPAWN_INTERVAL = 15; // 生成间隔
	private Monsters = new Map<Unit, UnitAttribute>(); // 存储怪物及其属性

	constructor(
		private sceneService: SceneService,
		private unitModel: UnitModel,
		private unitAiMgr: UnitAiMgr,
	) {}

	onStart() {
		this.startSpawning();
	}

	private startSpawning() {
		// 获取所有怪物Id
		const monsterIds = MonsterConfig.getAllIds();
		const spawnLoop = () => {
			for (const id of monsterIds) {
				this.spawnMonster(id);
				task.wait(this.SPAWN_INTERVAL);
			}
		};
		task.spawn(spawnLoop);
	}

	// 获取怪物模型
	private getMonsterModel(modelName: string): Model | undefined {
		const model = ReplicatedStorage.FindFirstChild("Assets")?.FindFirstChild("Monsters")?.FindFirstChild(modelName);
		return model?.IsA("Model") ? model : undefined;
	}

	// 根据怪物 Id 进行生成
	private spawnMonster(monsterId: number) {
		const config = MonsterConfig.GetMonsterConfig(monsterId);
		if (t.none(config)) {
			warn("怪物配置未找到！");
			return;
		}

		const model = this.getMonsterModel(config.Name);
		if (t.none(model)) {
			warn(`找不到怪物模型: ${config.Name}`);
			return;
		}

		const instance = model.Clone();
		const spawnLocation = this.sceneService.GetMonsterSpawnLocation();
		instance.PivotTo(new CFrame(spawnLocation));
		instance.Parent = Workspace;

		const monsterUnit: Unit = {
			Type: "Monster",
			MonsterId: config.Id,
			Guid: HttpService.GenerateGUID(),
		};

		const monsterAttributes: UnitAttribute = {
			Name: config.Name,
			Level: config.Level,
			Health: config.Health,
			HealthMax: config.Health,
			Attack: config.Attack,
		};

		this.Monsters.set(monsterUnit, monsterAttributes);
		this.unitModel.SetModel(monsterUnit, instance);
		// // 调用怪物	AI
		// this.unitAiMgr.CreateAI(monsterUnit);

		// 监听Health属性
		const healthValue = instance.FindFirstChild("Health") as NumberValue;
		if (healthValue) {
			healthValue.Changed.Connect((newValue) => {
				if (newValue <= 0) {
					// 怪物死亡，重新生成
					instance.Destroy();
					this.spawnMonster(monsterId);
				}
			});
		}

		// 打印当前生成的怪物属性
		this.printMonsterAttributes(monsterAttributes, spawnLocation);
	}
	// 打印单个怪物属性
	private printMonsterAttributes(monsterAttributes: UnitAttribute, spawnLocation: Vector3) {
		const info = `
			[怪物 ${monsterAttributes.Name} 生成成功！位置: ${spawnLocation}]
			怪物名称: ${monsterAttributes.Name}
			等级: ${monsterAttributes.Level}
			生命值: ${monsterAttributes.Health}
			攻击力: ${monsterAttributes.Attack}  
		`;
		// print(info);
	}
}
