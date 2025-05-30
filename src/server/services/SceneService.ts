import { Service, OnStart } from "@flamework/core";
import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { t } from "@rbxts/t";
import Log from "@rbxts/log";

@Service({})
export class SceneService implements OnStart {
	private _ground!: Model;
	private _spawnRegions: Part[] = [];

	constructor() {}

	onStart() {
		this._ground = this.LoadScene();
		this._initializeSpawnRegions();
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

	// 初始化三个固定生成区域
	private _initializeSpawnRegions() {
		const regionPositions = [
			new Vector3(25, 0, 20), // 区域1坐标
			new Vector3(-35, 0, 30), // 区域2坐标
			new Vector3(-35, 0, -15), // 区域3坐标
		];

		regionPositions.forEach((pos) => {
			const region = new Instance("Part");
			region.Name = "MonsterSpawnRegion";
			region.Size = new Vector3(5, 1, 5); // 区域大小
			region.Position = pos;
			region.Anchored = true;
			region.Transparency = 1; // 调试
			region.Parent = this._ground;
			this._spawnRegions.push(region);
		});
	}

	private LoadScene() {
		const ground = ReplicatedStorage.FindFirstChild("ground", true)?.Clone() as Model;
		if (t.none(ground)) {
			Log.Error("SceneService:LoadScene() - Ground not found");
		}
		ground.Parent = game.Workspace;
		return ground;
	}
}
