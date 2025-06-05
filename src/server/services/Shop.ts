import { Service, OnStart } from "@flamework/core";
import { HunterManager } from "./HunterManager";
import { ReplicatedFirst, ReplicatedStorage, Workspace } from "@rbxts/services";
import { HunterUnit, UnitAttribute, UnitItem } from "shared/UnitTypes";
import { t } from "@rbxts/t";
import { UnitModel } from "./UnitModel";

@Service({})
export class Shop implements OnStart {
	// 建筑物数据存储
	private constructionData = {
		exchangeCount: 0, // 总交换次数
		gold: 0, // 建筑物获得的总金币数
		oranges: 0, // 建筑物获得的总橘子数
	};

	private DETECTION_RANGE = 6; // 检测范围
	private EXCHANGE_INTERVAL = 4; // 交换间隔时间
	private CHECK_INTERVAL = 4; // 检测间隔

	private constructionModel: Model | undefined; // 建筑物模型
	private activeHunters = new Map<HunterUnit, boolean>(); // 正在交换的猎人标记

	constructor(
		private hunterManager: HunterManager,
		private unitModel: UnitModel,
	) {}

	onStart() {
		this.initializeConstruction();
		this.startExchangeLoop();
	}

	// 初始化建筑物模型
	private initializeConstruction() {
		this.constructionModel = ReplicatedStorage.FindFirstChild("Assets")
			?.FindFirstChild("Shop")
			?.FindFirstChild("ShopModel")
			?.Clone() as Model;
		if (this.constructionModel) {
			// 设置建筑物初始位置和父级
			this.constructionModel.PivotTo(new CFrame(new Vector3(0, 5, 5)));
			this.constructionModel.Parent = Workspace;
			// print("建筑物模型初始化成功");
		} else {
			warn("建筑物模型初始化失败");
		}
	}

	// 启动交换循环
	private startExchangeLoop() {
		spawn(() => {
			const running = true;
			while (running) {
				wait(this.CHECK_INTERVAL);
				this.checkAndProcessHunters();
			}
		});
	}

	// 检测附近的猎人
	private checkAndProcessHunters() {
		if (t.none(this.constructionModel)) return;

		const constructionPos = this.constructionModel.GetPivot().Position;
		const allHunters = this.getAllHunters();

		for (const hunterUnit of allHunters) {
			// 跳过已在交换中的猎人
			if (this.activeHunters.get(hunterUnit)) continue;

			const hunterModel = this.unitModel.GetModel(hunterUnit);
			if (t.none(hunterModel) || t.none(hunterModel.PrimaryPart)) continue;

			// 计算距离
			const distance = hunterModel.PrimaryPart.Position.sub(constructionPos).Magnitude;

			// 距离检测
			if (distance <= this.DETECTION_RANGE) {
				this.startExchangeWithHunter(hunterUnit);
			}
		}
	}

	// 获取所有猎人
	private getAllHunters(): HunterUnit[] {
		const hunters: HunterUnit[] = [];
		for (const [hunterUnit] of this.hunterManager.Hunters) {
			hunters.push(hunterUnit);
		}
		return hunters;
	}

	// 开始与猎人的交换流程
	private startExchangeWithHunter(hunterUnit: HunterUnit) {
		// 标记为正在交换
		this.activeHunters.set(hunterUnit, true);

		spawn(() => {
			const active = true;
			while (active) {
				const attributes = this.hunterManager.GetAttributes(hunterUnit);
				if (t.none(attributes)) break;

				// 检查资源是否足够
				const orangeCount = this.getItemCount(attributes.ItemBag, "橘子");
				const hunterGold = attributes.Gold ?? 0;

				if (hunterGold < 5 || orangeCount < 1) {
					// print(`${attributes.Name} 资源不足，停止交换 (金币: ${hunterGold}, 橘子: ${orangeCount})`);
					return;
				}

				// 执行交换
				this.executeExchange(hunterUnit, attributes);

				// 等待交换间隔
				wait(this.EXCHANGE_INTERVAL);
			}

			// 交换完成后清除标记
			this.activeHunters.delete(hunterUnit);
		});
	}

	// 执行交换逻辑
	private executeExchange(hunterUnit: HunterUnit, attributes: UnitAttribute) {
		// 获取当前资源数量
		const orangeCount = this.getItemCount(attributes.ItemBag, "橘子");
		const hunterGold = attributes.Gold ?? 0;

		// 扣除猎人资源
		attributes.Gold = hunterGold - 5;
		this.removeItemFromBag(attributes.ItemBag ?? [], "橘子", 1);

		// 增加商店资源
		this.constructionData.exchangeCount++;
		this.constructionData.gold += 5;
		this.constructionData.oranges += 1;

		// 更新猎人属性
		this.hunterManager.UpdateAttributes(hunterUnit, attributes);

		// 打印交换信息
		// this.printExchangeDetails(hunterUnit, attributes);
	}

	// 从物品栏移除指定物品
	private removeItemFromBag(bag: UnitItem[], itemName: string, count: number) {
		const itemIndex = bag.findIndex((item) => item.Name === itemName);
		if (itemIndex >= 0) {
			const item = bag[itemIndex];
			if (item.Count > count) {
				item.Count -= count;
			} else {
				bag.remove(itemIndex);
			}
		}
	}

	private printExchangeDetails(hunterUnit: HunterUnit, attributes: UnitAttribute) {
		// 猎人交换信息
		const hunterInfo = `
            [猎人交换信息]
            名称: ${attributes.Name}
            剩余金币: ${attributes.Gold}
            剩余橘子: ${this.getItemCount(attributes.ItemBag, "橘子")}
        `;

		// 商店交换信息
		const shopInfo = `
            [商店交换信息]
            总交换次数: ${this.constructionData.exchangeCount}
            总获得金币: ${this.constructionData.gold}
            总获得橘子: ${this.constructionData.oranges}
        `;

		// print(hunterInfo);
		// print(shopInfo);
	}

	// 获取指定物品的数量
	private getItemCount(bag: UnitItem[] | undefined, itemName: string): number {
		if (!bag || bag.size() === 0) return 0;
		const item = bag.find((i) => i.Name === itemName);
		return item ? item.Count : 0;
	}
}
