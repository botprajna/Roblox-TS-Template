import { Service, OnStart } from "@flamework/core";
import { HttpService, Players, ReplicatedStorage, Workspace } from "@rbxts/services";
import { t } from "@rbxts/t";
import { HunterAttribute, HunterConfig } from "shared/UnitTypes";

@Service({})
export class BornUnit implements OnStart {
	private SPAWN_INTERVAL = 10;
	private _spawnLocation = new Vector3(0, 5, 0);
	private currentLevel = 1;
	private MAX_LEVEL = 5;

	// 存储所有猎人实例及其属性
	private hunters: Map<Model, HunterAttribute> = new Map();

	onStart() {
		this.startSpawning();
	}

	private startSpawning() {
		// 使用延迟循环生成猎人
		while (this.currentLevel <= this.MAX_LEVEL) {
			this.spawnHunter(this.currentLevel);

			// 等待指定间隔时间
			wait(this.SPAWN_INTERVAL);

			// 下一个等级
			this.currentLevel++;
		}

		print("所有等级猎人已生成完毕！");
	}

	private spawnHunter(level: number) {
		// 获取猎人配置
		const config = HunterConfig.GetHunterConfig(level);

		try {
			// 获取模型路径
			const model = this.getHunterModel(config.Name);
			if (t.none(model)) {
				warn(`找不到猎人模型: ${config.Name}`);
				return;
			}

			// 克隆模型并放置到生成位置
			const instance = model.Clone();
			instance.PivotTo(new CFrame(this._spawnLocation));
			instance.Parent = Workspace;

			// 创建猎人属性
			const attributes: HunterAttribute = {
				health: config.Health,
				maxHealth: config.Health,
				attack: config.Attack,
				level: config.Level,
				experience: 0,
				experienceMax: config.Exp,
				Gold: 0,
				inventory: [],
			};

			// 存储猎人实例和属性
			this.hunters.set(instance, attributes);

			// 打印生成信息
			this.printHunterInfo(attributes);
		} catch (e) {
			warn(`猎人 L${level} 生成失败: ${e}`);
		}
	}

	private getHunterModel(modelName: string): Model | undefined {
		// 从ReplicatedStorage中获取猎人模型
		const assets = ReplicatedStorage.FindFirstChild("Assets");
		if (!assets) return undefined;

		const monsters = assets.FindFirstChild("Monsters");
		if (!monsters) return undefined;

		const model = monsters.FindFirstChild(modelName);
		return model?.IsA("Model") ? model : undefined;
	}

	// 打印单个猎人信息
	private printHunterInfo(attributes: HunterAttribute) {
		const info = `
	        [猎人生成成功]
	        等级: ${attributes.level}
	        生命值: ${attributes.health}
	        攻击力: ${attributes.attack}
	        经验值: ${attributes.experienceMax}
	    `;
		print(info);
	}
}
