import { Service, OnStart } from "@flamework/core";
import { HttpService, ReplicatedStorage, Workspace } from "@rbxts/services";
import { HunterConfig, HunterConfigType } from "shared/UnitTypes";

@Service({})
export class BornUnit implements OnStart {
	private static SPAWN_INTERVAL = 5; // 生成间隔（秒）
	private static _spawnLocation = new Vector3(0, 5, 0); // 生成坐标
	private static currentLevel = 1; // 当前生成等级

	onStart() {
		BornUnit.startSpawning();
	}

	// 启动生成循环
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

	// 生成单个猎人
	private static spawnHunter() {
		// 获取当前等级的配置
		const config = HunterConfig.GetHunterConfig(this.currentLevel);

		try {
			// 定位模型路径
			const modelName = `Hunter_L${this.currentLevel}`;
			const modelPath = this.getModelPath(modelName);

			// 克隆并放置模型
			const instance = modelPath.Clone();
			instance.PivotTo(new CFrame(this._spawnLocation));
			instance.Parent = Workspace;

			// 打印生成信息
			this.printHunterInfo(config, modelName);
		} catch (e) {
			warn(`猎人L${this.currentLevel}生成失败: ${e}`);
		}
	}

	// 获取模型路径
	private static getModelPath(modelName: string): Model {
		const assets = ReplicatedStorage.WaitForChild("Assets");
		const monsters = assets.WaitForChild("Monsters");
		const model = monsters.FindFirstChild(modelName);

		if (!model || !model.IsA("Model")) {
			throw `模型${modelName}不存在或不是有效Model`;
		}
		return model;
	}
	// 打印猎人信息
	private static printHunterInfo(config: HunterConfigType, modelName: string) {
		const info = `
        [猎人生成] ${config.Name}
        ID: ${config.Id}
        等级: ${config.Level}
        生命值: ${config.Health}
        攻击力: ${config.Attack}
        经验值: ${config.Exp}
        `;
		print(info);
	}
}
