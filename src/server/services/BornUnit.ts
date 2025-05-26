import { Service, OnStart } from "@flamework/core";
import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { t } from "@rbxts/t";
import { HunterConfig, UnitAttribute, UnitItem } from "shared/UnitTypes";

@Service({})
export class BornUnit implements OnStart {
	private SPAWN_INTERVAL = 15; // 生成间隔
	private UPGRADE_INTERVAL = 2; // 升级间隔
	private UPGRADE_TIMES = 4; // 升级4次
	private _spawnLocation = new Vector3(0, 5, 0); // 生成位置
	private currentLevel = 1; // 当前等级
	private MAX_LEVEL = 5; // 最大等级

	private REWARD_INTERVAL = 2; // 获取奖励时间间隔
	private REWARD_TIMES = 4; // 奖励次数

	// 存储所有猎人实例及其属性
	private hunters: Map<Model, UnitAttribute> = new Map();

	onStart() {
		this.startSpawning();
	}

	private startSpawning() {
		// 使用延迟循环生成猎人
		while (this.currentLevel <= this.MAX_LEVEL) {
			// 生成猎人
			const hunterInstance = this.spawnHunter(this.currentLevel);

			// 如果生成成功，进行升级和奖励
			if (hunterInstance) {
				// 升级属性
				spawn(() => this.upgradeHunter(hunterInstance, this.UPGRADE_TIMES));
				// 获取奖励
				spawn(() => this.getRewards(hunterInstance, this.REWARD_TIMES));
			}

			// 等待指定间隔时间
			wait(this.SPAWN_INTERVAL);
			// 等级增加
			this.currentLevel++;
		}

		print("所有等级猎人已生成完毕！");
	}

	private getHunterModel(modelName: string): Model | undefined {
		// 从ReplicatedStorage中获取猎人模型
		const model = ReplicatedStorage.FindFirstChild("Assets")?.FindFirstChild("Monsters")?.FindFirstChild(modelName);
		return model?.IsA("Model") ? model : undefined;
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
			const attributes: UnitAttribute = {
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
			this.hunters.set(instance, attributes);

			// 打印生成信息
			this.printHunterInfo(attributes);

			return instance; // 返回生成的猎人实例
		} catch (e) {
			warn(`猎人 L${level} 生成失败: ${e}`);
		}
	}

	// 升级猎人属性
	private upgradeHunter(hunterInstance: Model, times: number) {
		for (let i = 0; i < times; i++) {
			wait(this.UPGRADE_INTERVAL); // 每次升级前等待2秒

			const attributes = this.hunters.get(hunterInstance);
			if (t.none(attributes)) {
				warn(`猎人实例 ${hunterInstance.Name} 的属性不存在`);
				return;
			}

			// 增强属性
			attributes.Level += 1;
			attributes.Health += 10;
			attributes.HealthMax += 10;
			attributes.Attack += 3;
			attributes.Exp = (attributes.Exp ?? 0) + 3;
			attributes.ExpMax = (attributes.ExpMax ?? 0) + 3;

			// 更新存储的属性
			this.hunters.set(hunterInstance, attributes);

			// // 打印增强后的属性
			this.printUpgradedInfo(attributes, i + 1);
		}
	}

	// 获取奖励
	private getRewards(hunterInstance: Model, times: number) {
		for (let i = 0; i < times; i++) {
			wait(this.REWARD_INTERVAL); // 每次奖励前等待2秒

			const attributes = this.hunters.get(hunterInstance);
			if (t.none(attributes)) {
				warn(`猎人实例 ${hunterInstance.Name} 的属性不存在`);
				return;
			}
			// 增加金币
			if (t.none(attributes.Gold)) {
				attributes.Gold = 0;
			}
			// 每次奖励增加5金币
			attributes.Gold += 5;

			// 添加物品"橘子"
			const orangeItem: UnitItem = { Name: "橘子", Count: 1 };
			this.addItemToItemBag(attributes.ItemBag, orangeItem);
			//添加物品"苹果"
			const appleItem: UnitItem = { Name: "苹果", Count: 1 };
			this.addItemToItemBag(attributes.ItemBag, appleItem);

			// 更新存储的属性
			this.hunters.set(hunterInstance, attributes);
			// 打印奖励信息
			this.printRewardInfo(attributes, i + 1);
		}

		for (let i = 0; i < times; i++) {
			wait(this.REWARD_INTERVAL);
		}
	}

	private addItemToItemBag(ItemBag: UnitItem[] | undefined, orangeItem: UnitItem) {
		if (t.none(ItemBag)) {
			ItemBag = [];
		}

		// 检查物品是否已存在
		const existingItem = ItemBag.find((item) => item.Name === orangeItem.Name);
		if (existingItem) {
			existingItem.Count += orangeItem.Count; // 增加数量
		} else {
			ItemBag.push(orangeItem); // 添加新物品
		}
	}
	// 打印单个猎人信息
	private printHunterInfo(attributes: UnitAttribute) {
		const info = `
	        [猎人生成成功]
			猎人名称: ${attributes.Name}
	        等级: ${attributes.Level}
	        生命值: ${attributes.Health}
	        攻击力: ${attributes.Attack}
			经验值上限: ${attributes.ExpMax}   
	    `;
		print(info);
	}

	// 打印猎人升级后的属性
	private printUpgradedInfo(attributes: UnitAttribute, upgradeCount: number) {
		const info = `
				[猎人升级属性增强]
				猎人名称: ${attributes.Name}
				升级次数: ${upgradeCount}
				当前等级: ${attributes.Level}
				当前生命值: ${attributes.Health}
				当前攻击力: ${attributes.Attack}
				当前经验值上限: ${attributes.ExpMax}
			`;
		print(info);
	}

	// 打印猎人奖励信息
	private printRewardInfo(attributes: UnitAttribute, rewardCount: number) {
		const info = `
					[猎人获取奖励]
					猎人名称：${attributes.Name}
					获取奖励次数：${rewardCount}
					当前金币：${attributes.Gold}
					物品栏：${this.formatItemBag(attributes.ItemBag)}
		`;
		print(info);
	}

	// 格式化物品栏信息
	private formatItemBag(ItemBag: UnitItem[] | undefined) {
		if (t.none(ItemBag) || ItemBag.size() === 0) {
			return "空";
		}
		// 将物品栏格式化为字符串
		return ItemBag.map((item) => `${item.Name} x${item.Count}`).join(", ");
	}
}
