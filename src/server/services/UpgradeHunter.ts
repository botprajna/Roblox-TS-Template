import { OnStart, Service } from "@flamework/core";
import { HunterUnit, UnitAttribute } from "shared/UnitTypes";
import { HunterManager } from "./HunterManager";
import { t } from "@rbxts/t";

@Service({})
export class UpgradeHunter implements OnStart {
	private UPGRADE_INTERVAL = 2; // 升级间隔
	private UPGRADE_TIMES = 4; // 升级次数

	constructor(private hunterManager: HunterManager) {}
	onStart() {}

	// 开始升级循环
	public StartAutoUpgrade(hunter: HunterUnit) {
		for (let i = 0; i < this.UPGRADE_TIMES; i++) {
			wait(this.UPGRADE_INTERVAL);
			this.upgradeAttributes(hunter, i + 1);
		}
	}

	// 升级属性
	private upgradeAttributes(hunter: HunterUnit, upgradeCount: number) {
		const attributes = this.hunterManager.GetAttributes(hunter);
		if (t.none(attributes)) return;

		// 升级逻辑
		attributes.Level++;
		attributes.Health += 10;
		attributes.HealthMax += 10;
		attributes.Attack += 3;
		attributes.Exp = (attributes.Exp ?? 0) + 3;
		attributes.ExpMax = (attributes.ExpMax ?? 0) + 3;

		// 更新存储
		this.hunterManager.UpdateAttributes(hunter, attributes);
		// // 打印增强后的属性
		this.printUpgradedInfo(attributes, upgradeCount);
	}

	// 打印猎人升级后的属性
	private printUpgradedInfo(attributes: UnitAttribute, upgradeCount: number) {
		const info = `
                    [猎人升级属性增强]
                    猎人名称: ${attributes.Name}
					升级次数：${upgradeCount}
                    当前等级: ${attributes.Level}
                    当前生命值: ${attributes.Health}
                    当前攻击力: ${attributes.Attack}
                    当前经验值上限: ${attributes.ExpMax}
                `;
		// print(info);
	}
}
