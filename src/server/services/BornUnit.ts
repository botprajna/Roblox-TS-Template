import { Service, OnStart } from "@flamework/core";
import { HttpService, Players, ReplicatedStorage, Workspace } from "@rbxts/services";
import { t } from "@rbxts/t";
import { HunterAttribute, HunterConfig } from "shared/UnitTypes";

@Service({})
export class BornUnit implements OnStart {
	private static SPAWN_INTERVAL = 10;
	private static _spawnLocation = new Vector3(0, 5, 0);
	private static currentLevel = 1;

	// 使用Map存储对应的猎人属性
	private playerHunterAttributes: Map<HunterConfig, HunterAttribute> = new Map();

	onStart() {
		BornUnit.startSpawning();
	}

	private static startSpawning() {
		spawn(() => {
			while (this.currentLevel <= 5) {
				this.spawnHunter();
				wait(this.SPAWN_INTERVAL);
				this.currentLevel++;
			}
			print("所有等级猎人已生成完毕！");
		});
	}

	private static spawnHunter() {
		const config = HunterConfig.GetHunterConfig(this.currentLevel);

		try {
			const modelName = `Hunter_L${this.currentLevel}`;
			const modelPath = this.getModelPath(modelName);

			const instance = modelPath.Clone();
			instance.PivotTo(new CFrame(this._spawnLocation));
			instance.Parent = Workspace;

			this.printHunterInfo(config, modelName);

			// 为每个生成的猎人创建初始属性并存储
			const initialAttributes: HunterAttribute = {
				health: config.Health,
				maxHealth: config.Health,
				attack: config.Attack,
				level: config.Level,
				experience: 0,
				experienceMax: config.Exp,
				Gold: 0,
				inventory: [],
			};
		} catch (e) {
			warn(`猎人L${this.currentLevel}生成失败: ${e}`);
		}
	}

	private static getModelPath(modelName: string): Model {
		const assets = ReplicatedStorage.WaitForChild("Assets");
		const monsters = assets.WaitForChild("Monsters");
		const model = monsters.FindFirstChild(modelName);

		if (t.none(model)) {
			warn(`模型 ${modelName} 不存在`);
		}
		return model as Model;
	}

	private static printHunterInfo(config: HunterConfig, modelName: string) {
		const info = `
			猎人生成：${modelName}
			名称: ${config.Name}
			等级: ${config.Level}
			生命值: ${config.Health}
			攻击力: ${config.Attack}
			经验值: ${config.Exp}
		`;
		print(info);
	}
}
