import { Service, OnStart } from "@flamework/core";
import { t } from "@rbxts/t";
import { UnitModel } from "./UnitModel";
import Log from "@rbxts/log";
import { Unit } from "shared/UnitTypes";
import { ReplicatedStorage } from "@rbxts/services";

type AnimationType = "OnAttack";

@Service({})
export class UnitAnimation implements OnStart {
	private animations?: {
		OnAttack: Animation;
	};

	constructor(private unitModel: UnitModel) {}

	onStart() {
		this.getAnimations();
	}

	PlayAnimation(unit: Unit, animationType: AnimationType): AnimationTrack | undefined {
		const animator = this.unitModel.GetModel(unit)?.FindFirstChildOfClass("Animator");
		if (!this.animations || !animator) {
			Log.Warn("UnitAnimation:PlayAnimation() - Animations or Animator not found");
			return;
		}

		const animation = this.animations[animationType];
		if (!animation) {
			Log.Warn(`Animation ${animationType} not found`);
			return;
		}

		const animTrack = animator.LoadAnimation(animation);

		animTrack.Play();
		return animTrack;
	}

	private getAnimations() {
		const animationsFolder = ReplicatedStorage.FindFirstChild("Assets")?.FindFirstChild("Animation", true);
		if (!animationsFolder) {
			Log.Warn("Animations folder not found");
			return;
		}

		this.animations = {
			OnAttack: animationsFolder.FindFirstChild("OnAttack") as Animation,
		};
	}
}
