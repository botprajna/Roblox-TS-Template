import { Service, OnStart } from "@flamework/core";
import { HunterAttribute } from "shared/UnitTypes";

@Service({})
export class BornUnit implements OnStart {
	private _spawnLocation = new Vector3(0, 5, 0); // 生成位置，可以根据需要修改

	onStart() {}
}
