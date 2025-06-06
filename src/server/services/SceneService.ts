import { Service, OnStart } from "@flamework/core";
import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { t } from "@rbxts/t";
import Log from "@rbxts/log";
import { HunterUnit } from "shared/UnitTypes";

@Service({})
export class SceneService implements OnStart {
	private _ground!: Model;
	private _spawnRegions = new Map<number, Part>(); // 按等级存储生成区域

	constructor(private _HunterUnit: HunterUnit[]) {}

	onStart() {
		this._ground = this.LoadScene();
		this._initializeSpawnRegions();
	}

	GetNearbyHuntersPosition(): Vector3[] {
		const positions: Vector3[] = [];
		const hunters = this._ground
			.GetChildren()
			.filter(
				(instance): instance is Model => t.Instance(instance, "Model") && instance.Name.lower() === "hunter",
			);
		return positions;
	}

	// 获取指定等级怪物的生成位置
	GetMonsterSpawnLocation(level: number): Vector3 {
		const region = this._spawnRegions.get(math.clamp(level, 1, 3));

		if (!region) {
			Log.Error(`SceneService:GetMonsterSpawnLocation() - SpawnRegion for level ${level} not found`);
			return new Vector3(0, 0, 0);
		}

		// 计算区域内的随机位置
		const minX = region.Position.X - region.Size.X / 2;
		const maxX = region.Position.X + region.Size.X / 2;
		const minZ = region.Position.Z - region.Size.Z / 2;
		const maxZ = region.Position.Z + region.Size.Z / 2;

		const x = math.random(minX, maxX);
		const z = math.random(minZ, maxZ);

		return new Vector3(x, region.Position.Y, z);
	}

	// 初始化生成区域
	private _initializeSpawnRegions() {
		for (let level = 1; level <= 3; level++) {
			const regionName = `spawnlevel${level}`;
			const region = this._ground.FindFirstChild(regionName);

			if (region?.IsA("Part")) {
				this._spawnRegions.set(level, region);
				region.Anchored = true;
				// region.CanCollide = false;
			} else {
				Log.Warn(`SceneService: 找不到生成区域 ${regionName}`);
			}
		}
	}

	private LoadScene() {
		const ground = ReplicatedStorage.FindFirstChild("ground", true)?.Clone() as Model;
		if (t.none(ground)) {
			Log.Error("SceneService:LoadScene() - Ground not found");
		}
		ground.Parent = Workspace;
		return ground;
	}
}
