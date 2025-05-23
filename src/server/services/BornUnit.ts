import { Service, OnStart } from "@flamework/core";
import { HttpService, Players, ReplicatedStorage, Workspace } from "@rbxts/services";
import { t } from "@rbxts/t";
import { HunterAttribute, HunterConfig } from "shared/UnitTypes";

@Service({})
export class BornUnit implements OnStart {
	private static SPAWN_INTERVAL = 10;
	private static _spawnLocation = new Vector3(0, 5, 0);
	private static currentLevel = 1;

	// 存储猎人实例与属性的映射
	private static hunterInstances: Map<Model, HunterAttribute> = new Map();

	// 存储所有猎人的配置和属性
	private static allHunters: Array<{
		config: (typeof HunterConfigs)[0];
		instance?: Model;
		attributes: HunterAttribute;
	}> = [];

	onStart() {
		BornUnit.initializeHunters();
		BornUnit.startSpawning();
	}

	// 初始化所有猎人配置和默认属性
	private static initializeHunters() {
		const configs = HunterConfig.GetAllConfigs();
		this.allHunters = configs.map((config) => ({
			config,
			instance: undefined,
			attributes: this.createInitialAttributes(config),
		}));
	}

	// 创建初始属性
	private static createInitialAttributes(config: (typeof HunterConfigs)[0]): HunterAttribute {
		return {
			health: config.Health,
			maxHealth: config.Health,
			attack: config.Attack,
			level: config.Level,
			experience: 0,
			experienceMax: config.Exp,
			Gold: 0,
			inventory: [],
		};
	}

	private static startSpawning() {
		spawn(() => {
			while (this.currentLevel <= 5) {
				this.spawnHunter(this.currentLevel);
				wait(this.SPAWN_INTERVAL);
				this.currentLevel++;
			}
			print("所有等级猎人已生成完毕！");
		});
	}

	private static spawnHunter(level: number) {
		const hunterData = this.allHunters.find((h) => h.config.Level === level);
		if (!hunterData) {
			warn(`找不到等级 ${level} 的猎人配置`);
			return;
		}

		try {
			const modelPath = this.getModelPath(hunterData.config.ModelName);
			const instance = modelPath.Clone();
			instance.PivotTo(new CFrame(this._spawnLocation));
			instance.Parent = Workspace;

			// 保存实例和属性的关联
			hunterData.instance = instance;
			this.hunterInstances.set(instance, hunterData.attributes);

			this.printHunterInfo(hunterData.config, hunterData.attributes);
		} catch (e) {
			warn(`猎人L${level}生成失败: ${e}`);
		}
	}

	private static getModelPath(modelName: string): Model {
		const model = ReplicatedStorage.WaitForChild("Assets")?.WaitForChild("Monsters")?.FindFirstChild("modelName");

		if (t.none(model)) {
			warn(`模型 ${modelName} 不存在`);
		}
		return model as Model;
	}

	// 打印单个猎人信息
	private static printHunterInfo(config: (typeof HunterConfigs)[0], attributes: HunterAttribute) {
		const info = `
            [猎人生成成功]
            名称: ${config.Name}
            等级: ${config.Level}
            模型: ${config.ModelName}
            生命值: ${attributes.health}
            攻击力: ${attributes.attack}
            经验值: ${attributes.experience}
            金币: ${attributes.Gold}
        `;
		print(info);
	}
}
