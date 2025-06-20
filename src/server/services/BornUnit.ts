import { Service, OnStart } from "@flamework/core";
import { HttpService, ReplicatedStorage, Workspace } from "@rbxts/services";
import { HunterConfig, HunterUnit, Unit, UnitAttribute } from "shared/UnitTypes";
import { t } from "@rbxts/t";
import { UnitModel } from "./UnitModel";
import { UpgradeHunter } from "./UpgradeHunter";
import { GetReward } from "./GetReward";
import { HunterManager } from "./HunterManager";
import { Attributes } from "@rbxts/react";
import { UnitAiMgr } from "./HunterAi";

@Service({})
export class BornUnit implements OnStart {
	private SPAWN_INTERVAL = 10; // 生成间隔
	private _spawnLocation = new Vector3(0, 5, 0); // 生成位置

	constructor(
		private unitModel: UnitModel,
		private upgradeHunter: UpgradeHunter,
		private getReward: GetReward,
		private hunterManager: HunterManager,
		private unitAiMgr: UnitAiMgr,
	) {}

	onStart() {
		this.startSpawning();
	}

	SpawnHunter(hunterId: number): { instance: Model; hunterUnit: HunterUnit } | undefined {
		const config = HunterConfig.GetHunterConfig(hunterId);
		if (t.none(config)) {
			warn("猎人配置未找到！");
			return;
		}

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

		// 存储猎人实例和属性
		this.hunterManager.AddHunter(hunterUnit, hunterAttributes);
		this.unitModel.SetModel(hunterUnit, instance);
		//
		instance.SetAttribute("UnitType", "HunterUnit");
		this.unitAiMgr.CreateAI(hunterUnit);

		// 打印生成信息
		this.printHunterInfo(hunterAttributes);
		// this.upgradeHunter.StartAutoUpgrade(hunterUnit);
		this.getReward.StartAutoReward(hunterUnit);

		return { instance, hunterUnit }; // 返回生成的猎人实例和HunterUnit
	}

	// 猎人生成循环
	private startSpawning() {
		// 获取所有猎人 Id
		const hunterIds = HunterConfig.getAllIds();
		const spawnLoop = () => {
			for (const id of hunterIds) {
				this.SpawnHunter(id);
				task.wait(this.SPAWN_INTERVAL);
			}
		};
		task.spawn(spawnLoop);
	}

	private getHunterModel(modelName: string): Model | undefined {
		// 从ReplicatedStorage中获取猎人模型
		const model = ReplicatedStorage.FindFirstChild("Assets")?.FindFirstChild("Monsters")?.FindFirstChild(modelName);
		return model?.IsA("Model") ? model : undefined;
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
		print(info);
	}
}
