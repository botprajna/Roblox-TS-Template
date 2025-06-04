import { Service, OnStart } from "@flamework/core";
import { UnitModel } from "./UnitModel";
import { HttpService, ReplicatedStorage, Workspace } from "@rbxts/services";
import { MonsterConfig, MonsterUnit, UnitAttribute } from "shared/UnitTypes";
import { t } from "@rbxts/t";
import { SceneService } from "./SceneService";
import { UnitAiMgr } from "./MonsterAi";

@Service({})
export class BornMonster implements OnStart {
	private SPAWN_INTERVAL = 15; // 生成间隔
	private currentLevel = 1; // 当前等级
	private MAX_LEVEL = 5; // 最大等级
	private Monsters = new Map<MonsterUnit, UnitAttribute>(); // 存储怪物及其属性

	constructor(
		private sceneService: SceneService,
		private unitModel: UnitModel,
		private unitAiMgr: UnitAiMgr,
	) {}

	onStart() {
		this.startSpawning();
	}

	private startSpawning() {
		while (this.currentLevel <= this.MAX_LEVEL) {
			this.spawnMonster(this.currentLevel);
			wait(this.SPAWN_INTERVAL);
			this.currentLevel++;
		}
		print("怪物全部生成完毕！");
	}

	private getMonsterModel(modelName: string): Model | undefined {
		const model = ReplicatedStorage.FindFirstChild("Assets")?.FindFirstChild("Monsters")?.FindFirstChild(modelName);
		return model?.IsA("Model") ? model : undefined;
	}

	private spawnMonster(level: number) {
		const config = MonsterConfig.GetMonsterConfig(level);

		try {
			const model = this.getMonsterModel(config.Name);
			if (t.none(model)) {
				warn(`找不到怪物模型: ${config.Name}`);
				return;
			}

			const instance = model.Clone();
			const spawnLocation = this.sceneService.GetMonsterSpawnLocation(level);
			instance.PivotTo(new CFrame(spawnLocation));
			instance.Parent = Workspace;

			const monsterUnit: MonsterUnit = {
				Type: "Monster",
				MonsterId: config.Id,
				Guid: HttpService.GenerateGUID(false),
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
			// 调用怪兽	AI
			// this.unitAiMgr.CreateAI(unit);

			// 打印当前生成的怪物属性
			this.printMonsterAttributes(monsterAttributes, spawnLocation);
		} catch (e) {
			warn(`怪物 L${level} 生成失败: ${e}`);
		}
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
		print(info);
	}
}
