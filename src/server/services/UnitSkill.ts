import { Service, OnStart, Modding } from "@flamework/core";
import { MonsterConfig, MonsterUnit, Unit } from "shared/UnitTypes";
import { UnitModel } from "./UnitModel";
import { HunterManager } from "./HunterManager";

@Service({})
export class UnitSkill implements OnStart {
	private ENABLED = true;

	constructor(
		private unitModel: UnitModel,
		private hunterManager: HunterManager,
	) {}
	onStart() {}
	CastAttack(unit: Unit) {
		const model = this.unitModel.GetModel(unit);
		if (!model || !model.PrimaryPart) return;

		for (const [hunter] of this.hunterManager.Hunters) {
			const hunterModel = this.unitModel.GetModel(hunter);
			if (!hunterModel || !hunterModel.PrimaryPart) continue;

			const distance = model.PrimaryPart.Position.sub(hunterModel.PrimaryPart.Position).Magnitude;
			if (distance < 2 && this.ENABLED === true) {
				this.ENABLED = false;
				// 计算后退方向
				const direction = model.PrimaryPart.Position.sub(hunterModel.PrimaryPart.Position).Unit;
				const retreatForce = direction.mul(50); // 力的大小可调整

				// 添加矢量力
				const bodyVelocity = new Instance("BodyVelocity");
				bodyVelocity.Velocity = retreatForce;
				bodyVelocity.MaxForce = new Vector3(1e5, 0, 1e5);
				bodyVelocity.Parent = model.PrimaryPart;

				// 1秒后移除力
				task.delay(0.1, () => {
					bodyVelocity.Destroy();
				});

				// 扣血
				const humanoid = model.FindFirstChildOfClass("Humanoid") as Humanoid | undefined;
				if (humanoid) {
					humanoid.Health = math.max(0, humanoid.Health - 10);
				}
				print(`怪物 ${model.Name}被击退，添加力并扣血，当前血量：${humanoid?.Health}`);
				// 非阻塞冷却
				task.delay(5, () => {
					this.ENABLED = true;
				});
				break;
			}
		}
	}
}
