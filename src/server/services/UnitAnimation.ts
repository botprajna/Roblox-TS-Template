import { Service, OnStart } from "@flamework/core";
import { t } from "@rbxts/t";
import { UnitModel } from "./UnitModel";
import Log from "@rbxts/log";
import { Unit } from "shared/UnitTypes";
import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { $warn } from "rbxts-transform-debug";

type AnimationType = "OnAtt";

@Service({})
export class UnitAnimation {
	private _animations: { [key in AnimationType]: Animation } | undefined;
	constructor(private unitModel: UnitModel) {}

	// print("UnitAnimation:OnStart() - Starting animation service");
	// // const Humanoid = Workspace.FindFirstChild("prajnaqwq")?.FindFirstChild("Humanoid");
	// const Humanoid = await (async () => {
	// 	let result: Humanoid | undefined;
	// 	while (result === undefined) {
	// 		result = Workspace.FindFirstChild("prajnaqwq")?.FindFirstChild("Humanoid") as Humanoid | undefined;
	// 		await Promise.delay(0);
	// 	}
	// 	return result;
	// })();
	// if (t.none(Humanoid)) {
	// 	$warn("UnitAnimation:OnStart() - Humanoid not found");
	// 	return;
	// }
	// const Animator = Humanoid.WaitForChild("Animator") as Animator;
	// const Animation = new Instance("Animation", Humanoid);
	// Animation.AnimationId = "rbxassetid://95614406988487";
	// print(`Playing animation `);
	// const AnimationTrack = Animator.LoadAnimation(Animation);
	// if (t.none(AnimationTrack)) {
	// 	$warn("UnitAnimation:OnStart() - AnimationTrack not found");
	// 	return;
	// }
	// AnimationTrack.Play();

	PlayAnimation(unit: Unit, animationType: AnimationType, loopTag?: "Looped") {
		const animations = this.GetAnimations();
		const animator = this.unitModel.GetModel(unit)?.FindFirstChildOfClass("Animator") as Animator;
		if (t.none(animations) || t.none(animator)) {
			Log.Warn("UnitAnimation:PlayAnimation() - Animations or Animator not found");
			return;
		}

		const animation = animations[animationType];
		const animTrack = animator.LoadAnimation(animation);
		if (t.none(animTrack)) {
			Log.Warn(`UnitAnimation:PlayAnimation() - Animation '${animationType}' not found`);
			return;
		}

		if (t.literal("Looped")(loopTag)) {
			animator.GetPlayingAnimationTracks().forEach((track) => track.Stop());
			animTrack.Looped = true;
		}

		animTrack.Play();
	}

	private GetAnimations() {
		const animationsFolder = ReplicatedStorage.FindFirstChild("Assets")?.FindFirstChild("Animation", true);
		const onAtt = animationsFolder?.FindFirstChild("OnAtt") as Animation;
		if (t.none(animationsFolder)) {
			Log.Warn("Animations folder not found");
			return;
		}

		this._animations = {
			OnAtt: onAtt,
		};
		return this._animations;
	}
}
