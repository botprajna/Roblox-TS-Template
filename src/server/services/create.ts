import { Service, OnStart } from "@flamework/core";
import { ReplicatedStorage } from "@rbxts/services";

@Service({})
export class Create implements OnStart {
	onStart() {
		const ground = ReplicatedStorage.FindFirstChild("ground") as Part;
		ground.Anchored = true;
		ground.Parent = game.Workspace;
	}
}
