import { Service, OnStart } from "@flamework/core";
import { Unit } from "shared/UnitTypes";
import { UnitModel } from "./UnitModel";
import { HunterManager } from "./HunterManager";
import RaycastHitbox from "@rbxts/raycast-hitbox";
import { BornUnit } from "./BornUnit";
import { t } from "@rbxts/t";
import { UnitAnimation } from "./UnitAnimation";

@Service({})
export class UnitSkill implements OnStart {
	private hitConnections = new Map<Unit, RBXScriptConnection>();

	constructor(
		private unitModel: UnitModel,
		private hunterManager: HunterManager,
		private bornUnit: BornUnit,
		private unitAnimation: UnitAnimation,
	) {}

	onStart() {}

	CastAttack(unit: Unit) {
		const model = this.unitModel.GetModel(unit);
		if (t.none(model) || t.none(model.PrimaryPart)) return;

		// 初始化碰撞盒
		this.InitHitBox(unit);
		this.unitAnimation.PlayAnimation(unit, "OnAttack");
	}

	InitHitBox(unit: Unit) {
		const model = this.unitModel.GetModel(unit);
		if (t.none(model) || t.none(model.PrimaryPart)) return;

		const stick = model.FindFirstChild("Stick", true);
		if (t.none(stick) || t.none(stick.IsA("BasePart"))) {
			warn("AttackSkill:InitHitBox() Stick not found or not a BasePart");
			return;
		}

		const hitbox = new RaycastHitbox(stick);
		hitbox.Visualizer = true;

		const hitConn = hitbox.OnHit.Connect((part, humanoid) => this.handleHit(unit, part, humanoid));
		this.hitConnections.set(unit, hitConn);

		hitbox.HitStart();
	}

	private handleHit(unit: Unit, part: BasePart, humanoid: Humanoid | undefined) {
		const attackerPart = this.unitModel.GetModel(unit)?.PrimaryPart;
		if (!humanoid || !part || !attackerPart) return;

		const targetModel = part.Parent as Model;
		if (!targetModel) return;

		const hitGuid = humanoid.GetAttribute("UnitGuid") as string | undefined;
		const unitType = targetModel.GetAttribute("UnitType");
		if (!hitGuid || unitType !== "HunterUnit") return;

		this.applyKnockback(unit, targetModel, part.Position);
		this.applyDamage(targetModel);
	}

	//94053817037854

	// 应用击退效果
	private applyKnockback(attacker: Unit, targetModel: Model, hitPosition: Vector3) {
		// 获取攻击者模型
		const attackerModel = this.unitModel.GetModel(attacker);
		if (t.none(attackerModel?.PrimaryPart) || t.none(targetModel.PrimaryPart)) return;
		// 计算击退方向
		const direction = hitPosition.sub(attackerModel.PrimaryPart.Position).Unit;

		// 创建击退效果
		const bodyVelocity = new Instance("BodyVelocity");
		bodyVelocity.Velocity = direction.mul(50);
		bodyVelocity.MaxForce = new Vector3(1e5, 0, 1e5);
		bodyVelocity.Parent = targetModel.PrimaryPart;

		// 0.1秒后移除击退效果
		task.delay(0.1, () => {
			bodyVelocity.Destroy();
		});
	}

	// 应用伤害
	private applyDamage(targetModel: Model) {
		// 获取猎人数据
		const hunterGuid = targetModel.GetAttribute("UnitGuid") as string;
		const hunter = this.findHunterByGuid(hunterGuid);
		if (t.none(hunter)) return;

		const attributes = this.hunterManager.GetAttributes(hunter);
		if (t.none(attributes)) return;
		// 当前血量
		const currentHealth = math.max(0, attributes.Health - 10);
		this.hunterManager.UpdateAttributes(hunter, {
			...attributes,
			Health: currentHealth,
		});

		// 处理死亡
		if (currentHealth <= 0) {
			const humanoid = targetModel.FindFirstChild("Humanoid") as Humanoid;
			if (humanoid) humanoid.Health = 0;
			this.bornUnit.SpawnHunter(hunter.HunterId);
		}
	}

	private findHunterByGuid(guid: string) {
		for (const [hunter] of this.hunterManager.Hunters) {
			if (hunter.Guid === guid) {
				return hunter;
			}
		}
		return undefined;
	}
}
