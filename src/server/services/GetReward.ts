import { OnStart, Service } from "@flamework/core";
import { HunterUnit, UnitAttribute, UnitItem } from "shared/UnitTypes";
import { HunterManager } from "./HunterManager";
import { t } from "@rbxts/t";

@Service({})
export class GetReward implements OnStart {
	private REWARD_INTERVAL = 2; //奖励间隔
	private REWARD_TIMES = 4; //奖励次数

	constructor(private hunterManager: HunterManager) {}
	onStart() {}

	// 将物品添加到物品栏
	AddItemToItemBag(ItemBag: UnitItem[] | undefined, orangeItem: UnitItem) {
		if (t.none(ItemBag)) {
			ItemBag = [];
		}

		// 检查物品是否已存在
		const existingItem = ItemBag.find((item) => item.Name === orangeItem.Name);
		// 如果存在，增加数量；否则添加新物品
		if (existingItem) {
			existingItem.Count += orangeItem.Count; // 增加数量
		} else {
			ItemBag.push(orangeItem); // 添加新物品
		}
	}

	// 获得奖励循环
	public StartAutoReward(hunter: HunterUnit) {
		for (let i = 0; i < this.REWARD_TIMES; i++) {
			wait(this.REWARD_INTERVAL);
			this.addRewards(hunter, i + 1);
		}
	}

	// 奖励获取逻辑
	private addRewards(hunter: HunterUnit, rewardCount: number) {
		const attributes = this.hunterManager.GetAttributes(hunter);
		if (t.none(attributes)) return;

		// 增加金币（空值检查）
		attributes.Gold = (attributes.Gold ?? 0) + 5;
		// 添加物品到物品栏
		this.AddItemToItemBag(attributes.ItemBag ?? [], {
			Name: "橘子",
			Count: 1,
		});

		// 更新存储
		this.hunterManager.UpdateAttributes(hunter, attributes);
		// 打印奖励信息
		this.printRewardInfo(attributes, rewardCount);
	}

	// 打印猎人奖励信息
	private printRewardInfo(attributes: UnitAttribute, rewardCount: number) {
		const info = `
						[猎人获取奖励]
						猎人名称：${attributes.Name}
						获取次数：${rewardCount}
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
