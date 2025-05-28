import { Service, OnStart } from "@flamework/core";
import { ReplicatedStorage } from "@rbxts/services";
import { t } from "@rbxts/t";
import Log from "@rbxts/log";
import { BehaviorTree3 } from "@rbxts/behavior-tree-5";

@Service({})
export class Create implements OnStart {
	private _ground!: Model;

	onStart() {
		this._ground = this.LoadScene();
	}

	GetMonsterSpawnLocation(): Vector3 {
		const locations = this._ground?.GetChildren().filter((c) => c.Name === "MonsterSpawnRegion") ?? [];
		// 随机选择一个生成位置
		const randomIndex = math.random(0, locations.size() - 1);
		const location = locations[randomIndex] as Part;

		if (t.none(location)) {
			Log.Error("SceneService:GetMonsterSpawnLocation() - MonsterSpawnRegion not found");
		}

		const minX = location.Position.X - location.Size.X / 2;
		const maxX = location.Position.X + location.Size.X / 2;
		const minZ = location.Position.Z - location.Size.Z / 2;
		const maxZ = location.Position.Z + location.Size.Z / 2;

		const x = math.random(minX, maxX);
		const z = math.random(minZ, maxZ);

		return new Vector3(x, location.Position.Y, z);
	}
	private LoadScene() {
		const ground = ReplicatedStorage.FindFirstChild("Ground", true)?.Clone() as Model;
		if (t.none(ground)) {
			Log.Error("SceneService:LoadScene() - Ground not found");
		}
		ground.Parent = game.Workspace;
		return ground;
	}
}
