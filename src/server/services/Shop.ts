import { Service, OnStart } from "@flamework/core";
import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { HunterUnit, UnitAttribute, UnitItem } from "shared/UnitTypes";
import { t } from "@rbxts/t";
import { UnitModel } from "./UnitModel";
import { HunterManager } from "./HunterManager";

@Service({})
export class Shop implements OnStart {
	// 建筑物数据存储
	private shopData = {
		exchangeCount: 0, // 总交换次数
		gold: 0, // 建筑物获得的总金币数
		oranges: 0, // 建筑物获得的总橘子数
	};
	// private shopDada = new Map<string, number>([
	// 	["exchangeCount", 0],
	// 	["gold", 0],
	// 	["oranges", 0]
	// ]);

	private DETECTION_RANGE = 6; // 检测范围
	private EXCHANGE_INTERVAL = 2; // 交换间隔时间
	private CHECK_INTERVAL = 1; // 缩短检测间隔为1秒

	private shopModel?: Model; // 建筑物模型
	private activeExchanges = new Map<HunterUnit, boolean>(); // 正在交换的猎人标记

	constructor(
		private unitModel: UnitModel,
		private hunterManager: HunterManager,
	) {}

	onStart() {
		this.initializeConstruction();
		this.StartDetectionLoop();
	}

	// 初始化建筑物模型
	private initializeConstruction() {
		const shopModel = ReplicatedStorage.FindFirstChild("Assets")
			?.FindFirstChild("Shop")
			?.FindFirstChild("ShopModel");

		if (shopModel?.IsA("Model")) {
			this.shopModel = shopModel.Clone();
			this.shopModel.PivotTo(new CFrame(new Vector3(0, 5, 5)));
			this.shopModel.Parent = Workspace;
			// print("商店模型初始化成功");
		} else {
			warn("商店模型初始化失败 - 找不到模型");
		}
	}

	// 启动检测循环
	StartDetectionLoop() {
		task.spawn(() => {
			const running = true;
			while (running) {
				this.checkNearbyHunters();
				task.wait(this.CHECK_INTERVAL);
			}
		});
	}

	// 获取所有猎人
	private getAllHunters(): HunterUnit[] {
		const hunters: HunterUnit[] = [];
		for (const [hunter] of this.hunterManager.Hunters) {
			if (hunter.Type === "Hunter") {
				hunters.push(hunter);
			}
		}
		return hunters;
	}

	// 检测附近的猎人
	private checkNearbyHunters() {
		if (t.none(this.shopModel)) {
			warn("找不到商店模型");
			return;
		}

		const constructionPos = this.shopModel.GetPivot().Position;
		const allHunters = this.getAllHunters();

		for (const hunter of allHunters) {
			// 跳过已在交换中的猎人
			if (this.activeExchanges.get(hunter)) continue;

			const model = this.unitModel.GetModel(hunter);
			if (!model?.PrimaryPart) continue;

			const distance = model.PrimaryPart.Position.sub(constructionPos).Magnitude;

			if (distance <= this.DETECTION_RANGE) {
				this.startExchangeProcess(hunter);
			}
		}
	}

	// 开始交换流程
	private startExchangeProcess(hunter: HunterUnit) {
		// 标记为正在交换
		this.activeExchanges.set(hunter, true);

		task.spawn(() => {
			const continueExchange = true;
			while (continueExchange) {
				const attributes = this.hunterManager.GetAttributes(hunter);
				if (!attributes) break;

				// 检查资源是否足够
				const hasEnoughGold = (attributes.Gold ?? 0) >= 5;
				const hasEnoughOranges = this.getItemCount(attributes.ItemBag, "橘子") >= 1;

				if (!hasEnoughGold || !hasEnoughOranges) {
					// print(
					// 	`${attributes.Name} 资源不足，停止交换 (金币: ${attributes.Gold}, 橘子: ${this.getItemCount(attributes.ItemBag, "橘子")})`,
					// );
					break;
				}

				// 执行交换
				this.executeExchange(hunter, attributes);

				// 等待交换间隔
				task.wait(this.EXCHANGE_INTERVAL);
			}

			// 交换完成后清除标记
			this.activeExchanges.delete(hunter);
		});
	}

	// 执行交换逻辑
	private executeExchange(hunter: HunterUnit, attributes: UnitAttribute) {
		// 扣除猎人资源
		attributes.Gold = (attributes.Gold ?? 0) - 5;
		this.removeItemFromBag(attributes.ItemBag ?? [], "橘子", 1);

		// 增加商店资源
		this.shopData.exchangeCount++;
		this.shopData.gold += 5;
		this.shopData.oranges += 1;

		// 更新猎人属性
		this.hunterManager.UpdateAttributes(hunter, attributes);

		// 打印交换信息
		this.printExchangeDetails(hunter, attributes);
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

	// 获取指定物品的数量
	private getItemCount(bag: UnitItem[] | undefined, itemName: string): number {
		if (!bag || bag.size() === 0) return 0;
		const item = bag.find((i) => i.Name === itemName);
		return item ? item.Count : 0;
	}

	private printExchangeDetails(hunter: HunterUnit, attributes: UnitAttribute) {
		const hunterInfo = `
            [猎人交换信息]
            名称: ${attributes.Name}
            剩余金币: ${attributes.Gold}
            剩余橘子: ${this.getItemCount(attributes.ItemBag, "橘子")}
        `;

		const shopInfo = `
            [商店交换信息]
            总交换次数: ${this.shopData.exchangeCount}
            总获得金币: ${this.shopData.gold}
            总获得橘子: ${this.shopData.oranges}
        `;

		// print(hunterInfo);
		// print(shopInfo);
	}
}
