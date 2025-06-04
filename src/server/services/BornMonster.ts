import { Service, OnStart } from "@flamework/core";
import { UnitModel } from "./UnitModel";
import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { MonsterConfig, MonsterUnit } from "shared/UnitTypes";
import { t } from "@rbxts/t";
import { SceneService } from "./SceneService";

@Service({})
export class BornMonster implements OnStart {
	private SPAWN_INTERVAL = 15; // 生成间隔
	private currentLevel = 1; // 当前等级
	private MAX_LEVEL = 5; // 最大等级

	constructor(
		private sceneService: SceneService,
		private unitModel: UnitModel,
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
				Guid: instance.GetAttribute("Guid") as string,
			};

			this.unitModel.SetModel(monsterUnit, instance);

			print(`怪物 ${config.Name} 生成成功！位置: ${spawnLocation}`);
		} catch (e) {
			warn(`怪物 L${level} 生成失败: ${e}`);
		}
	}
}
