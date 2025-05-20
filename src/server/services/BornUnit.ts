import { Service, OnStart } from "@flamework/core";
import { HunterUnit } from "shared/UnitTypes";

@Service({})
export class BornUnit implements OnStart {
	private spawnLocation = new Vector3(0, 5, 0); // 生成位置，可以根据需要修改
	onStart() {
		task.spawn(() => {});
	}
}
