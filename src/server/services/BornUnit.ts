import { Service, OnStart, Dependency } from "@flamework/core";
import { HttpService, ReplicatedStorage, Workspace } from "@rbxts/services";
import { HunterConfig, HunterUnit, UnitAttribute } from "shared/UnitTypes";
import { HunterManager } from "./HunterManager";
import { UpgradeHunter } from "./UpgradeHunter";
import { GetReward } from "./GetReward";
import { t } from "@rbxts/t";
import { UnitModel } from "./UnitModel";

@Service({})
export class BornUnit implements OnStart {
	private SPAWN_INTERVAL = 10; // 生成间隔
	private _spawnLocation = new Vector3(0, 5, 0); // 生成位置
	private currentLevel = 1; // 当前等级
	private MAX_LEVEL = 5; // 最大等级

	constructor(
		private hunterManager: HunterManager,
		private upgradeService: UpgradeHunter,
		private rewardService: GetReward,
		private unitModel: UnitModel,
	) {}

	onStart() {
		this.startSpawning();
	}

	// 猎人生成循环
	private startSpawning() {
		while (this.currentLevel <= this.MAX_LEVEL) {
			// 生成猎人并获取实例和数据
			const { instance, hunterUnit } = this.spawnHunter(this.currentLevel) ?? {};
			if (instance && hunterUnit) {
				// 启动升级和奖励循环
				spawn(() => this.upgradeService.StartAutoUpgrade(hunterUnit));
				spawn(() => this.rewardService.StartAutoReward(hunterUnit));
			}
			wait(this.SPAWN_INTERVAL);
			this.currentLevel++;
		}
		// print("猎人全部生成完毕！");
	}

	private getHunterModel(modelName: string): Model | undefined {
		// 从ReplicatedStorage中获取猎人模型
		const model = ReplicatedStorage.FindFirstChild("Assets")?.FindFirstChild("Monsters")?.FindFirstChild(modelName);
		return model?.IsA("Model") ? model : undefined;
	}

	private spawnHunter(level: number): { instance: Model; hunterUnit: HunterUnit } | undefined {
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

			const hunterUnit: HunterUnit = {
				Type: "Hunter", // 固定值为 "Hunter"
				HunterId: config.Id, // 使用配置中的Id
				Guid: HttpService.GenerateGUID(), // 全局唯一标识符
			};

			// 创建猎人属性
			const hunterAttributes: UnitAttribute = {
				Name: config.Name,
				Health: config.Health,
				HealthMax: config.Health,
				Attack: config.Attack,
				Level: config.Level,
				Exp: 0,
				ExpMax: config.Exp,
				Gold: 0,
				ItemBag: [],
			};

			this.unitModel.SetModel(hunterUnit, instance);
			// 存储猎人实例和属性
			this.hunterManager.AddHunter(hunterUnit, hunterAttributes);

			// 打印生成信息
			// this.printHunterInfo(hunterAttributes);

			return { instance, hunterUnit }; // 返回生成的猎人实例和HunterUnit
		} catch (e) {
			warn(`猎人 L${level} 生成失败: ${e}`);
		}
	}

	// 打印单个猎人信息
	private printHunterInfo(hunterAttributes: UnitAttribute) {
		const info = `
	        [猎人生成成功]
			猎人名称: ${hunterAttributes.Name}
	        等级: ${hunterAttributes.Level}
	        生命值: ${hunterAttributes.Health}
	        攻击力: ${hunterAttributes.Attack}
			经验值上限: ${hunterAttributes.ExpMax}   
	    `;
		// print(info);
	}
}
