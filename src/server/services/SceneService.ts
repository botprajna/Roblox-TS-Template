import { Service, OnStart } from "@flamework/core";

@Service({})
export class SceneService implements OnStart {
	onStart() {}
	GetMonsterSpawnLocation(): Vector3 {
		//获得怪物出生点

		const location = new Vector3(1, 3, 1);

		// const minX = location.Position.X - location.Size.X / 2;
		// const maxX = location.Position.X + location.Size.X / 2;
		// const minZ = location.Position.Z - location.Size.Z / 2;
		// const maxZ = location.Position.Z + location.Size.Z / 2;

		// const x = math.random(minX, maxX); //随机取一点x
		// const z = math.random(minZ, maxZ); //随机取一点y

		return location; //返回坐标
	}
}
