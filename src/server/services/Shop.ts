import { Service, OnStart } from "@flamework/core";
import { HunterManager } from "./HunterManager";
import { Workspace } from "@rbxts/services";
import { HunterUnit, UnitAttribute, UnitItem } from "shared/UnitTypes";
import { t } from "@rbxts/t";
import { UnitModel } from "./UnitModel";

@Service({})
export class Shop implements OnStart {
	// 建筑物数据存储
	private constructionData = {
		exchangeCount: 0, // 总交换次数计数器
		gold: 0, // 建筑物获得的总金币数
		oranges: 0, // 建筑物获得的总橘子数
	};

	private DETECTION_RANGE = 6; // 检测范围
	private EXCHANGE_INTERVAL = 5; // 交换间隔时间
	private CHECK_INTERVAL = 5; // 检测循环间隔
	private MAX_LEVEL = 5; // 最大猎人等级

	private constructionModel: Model | undefined; // 建筑物模型
	private activeExchanges = new Map<HunterUnit, boolean>(); // 正在交换的猎人标记

	constructor(
		private hunterManager: HunterManager,
		private unitModel: UnitModel,
	) {}

	onStart() {
		this.initializeConstruction();
		this.checkHuntersNearby();
	}

	// 初始化建筑物模型
	private initializeConstruction() {
		this.constructionModel = this.getConstructionModel();
		if (this.constructionModel) {
			// print("建筑物模型初始化成功");
		} else {
			// warn("建筑物模型初始化失败");
		}
	}

	// 从Workspace获取建筑物模型
	private getConstructionModel(): Model | undefined {
		const model = Workspace.FindFirstChild("ConstructionModel");
		if (model?.IsA("Model")) {
			// 设置建筑物位置
			model.PivotTo(new CFrame(new Vector3(0, 5, 5)));
			model.Parent = Workspace;
			return model;
		}
		return undefined;
	}

	// 检测附近的猎人
	private checkHuntersNearby() {
		// 建筑物模型不存在时直接返回
		if (t.none(this.constructionModel)) return;

		const constructionPos = this.constructionModel.GetPivot().Position;

		// 遍历所有猎人
		for (const [hunterUnit] of this.hunterManager.Hunters) {
			// 跳过已在交换中的猎人
			if (this.activeExchanges.get(hunterUnit)) continue;

			const hunterModel = this.unitModel.GetModel(hunterUnit);
			if (t.none(hunterModel)) continue;

			// 计算距离
			const distance = hunterModel.GetPivot().Position.sub(constructionPos).Magnitude;

			// 距离检测
			if (distance <= this.DETECTION_RANGE) {
				this.initiateExchange(hunterUnit);
			}
		}
	}

	// 初始化与猎人的交换流程
	private initiateExchange(hunterUnit: HunterUnit) {
		// 标记为正在交换
		this.activeExchanges.set(hunterUnit, true);

		// 在新协程中执行交换
		spawn(() => {
			wait(this.EXCHANGE_INTERVAL); // 等待交换间隔

			// 执行单次交换
			this.executeExchange(hunterUnit);

			// 交换完成后清除标记
			this.activeExchanges.delete(hunterUnit);
		});
	}

	// 执行交换逻辑
	private executeExchange(hunterUnit: HunterUnit) {
		const attributes = this.hunterManager.GetAttributes(hunterUnit);
		if (t.none(attributes)) return;

		// 获取当前资源数量
		const orangeItem = (attributes.ItemBag ?? []).find((item) => item.Name === "橘子");
		const orangeCount = orangeItem?.Count ?? 0;
		const hunterGold = attributes.Gold ?? 0;

		// 资源不足检查
		if (hunterGold < 5 || orangeCount < 1) {
			print(`${attributes.Name} 资源不足 (金币: ${hunterGold}, 橘子: ${orangeCount})`);
			return;
		}

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
		this.printExchangeDetails(hunterUnit, attributes);
	}

	// 从物品栏移除指定物品
	private removeItemFromBag(bag: UnitItem[], itemName: string, count: number) {
		const itemIndex = bag.findIndex((item) => item.Name === itemName);
		if (itemIndex >= 0) {
			const item = bag[itemIndex];
			if (item.Count > count) {
				item.Count -= count; // 减少数量
			} else {
				bag.remove(itemIndex); // 完全移除
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

		print(hunterInfo);
		print(shopInfo);
	}

	// 获取指定物品的数量
	private getItemCount(bag: UnitItem[] | undefined, itemName: string): string {
		if (!bag || bag.size() === 0) return "0";
		const item = bag.find((i) => i.Name === itemName);
		return item ? tostring(item.Count) : "0";
	}
}
