import { Service, OnStart } from "@flamework/core";
import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { t } from "@rbxts/t";
import Log from "@rbxts/log";
import { HunterManager } from "./HunterManager";
import { UnitModel } from "./UnitModel";

@Service({})
export class SceneService implements OnStart {
	private _ground!: Model;

	constructor(
		private hunterManager: HunterManager,
		private unitModel: UnitModel,
	) {}

	onStart() {
		this._ground = this.LoadScene();
	}

	GetNearbyHuntersPosition(): Vector3 {
		for (const [hunter] of this.hunterManager.Hunters) {
			const model = this.unitModel.GetModel(hunter);
			if (model && model.PrimaryPart) {
				return model.PrimaryPart.Position;
			}
		}
		// 没有猎人时返回默认坐标
		return new Vector3(1, 3, 1);
	}

	// 获取指定等级怪物的生成位置
	GetMonsterSpawnLocation(): Vector3 {
		//获取_ground中的“spawnlevel1、2、3”的子对象并组成数组
		const spawnNames = ["spawnlevel1", "spawnlevel2", "spawnlevel3"];
		//获得怪物出生点
		const locations = this._ground?.GetChildren().filter((c) => spawnNames.includes(c.Name));
		// 随机选择一个生成位置
		const randomIndex = math.random(0, locations.size() - 1);
		const location = locations[randomIndex] as Part;

		if (t.none(location)) {
			Log.Error("SceneService:GetMonsterSpawnLocation() - MonsterSpawnRegion not found");
			return new Vector3(1, 3, 1);
		}

		// 计算区域内的随机位置
		const minX = location.Position.X - location.Size.X / 2;
		const maxX = location.Position.X + location.Size.X / 2;
		const minZ = location.Position.Z - location.Size.Z / 2;
		const maxZ = location.Position.Z + location.Size.Z / 2;

		const x = math.random(minX, maxX);
		const z = math.random(minZ, maxZ);

		return new Vector3(x, location.Position.Y, z);
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
