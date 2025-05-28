import { TREE_OUTCOME } from "@rbxts/behavior-tree-5";
import Path from "@rbxts/simplepath";
import { t } from "@rbxts/t";
import { $assert } from "rbxts-transform-debug";
import { MonsterBTreeBlackboard, MonsterBTreeObj } from "server/services/MonsterAi";
import { MonsterUnit } from "shared/UnitTypes";

type Blackboard = MonsterBTreeBlackboard;
type Obj = { Blackboard: Blackboard } & MonsterBTreeObj;
type FindPathData = {
	path: Path;
	target: Vector3;
	state: "Moving" | "Reached" | "Error";
	Destroy: () => void;
};
const findPathData = new Map<MonsterUnit, FindPathData>();
export function start(obj: Obj) {
	const blackboard = obj.Blackboard;

	if (findPathData.has(obj.Unit) === false) {
		const model = obj.UnitModelMgr.GetModel(obj.Unit);
		const target = obj.SceneService.GetMonsterSpawnLocation();

		const path = new Path(model);
		const pathConns: RBXScriptConnection[] = [];

		path.Visualize = true;
		pathConns.push(path.Blocked.Connect(() => path.Run(target)));
		pathConns.push(path.Reached.Connect(() => (data.state = "Reached")));
		pathConns.push(path.Error.Connect(() => (data.state = "Error")));

		const data: FindPathData = {
			path,
			target,
			state: "Moving",
			Destroy: () => {
				pathConns.forEach((conn) => conn.Disconnect());
				if (path.Status === "Active") path.Stop();
				data.path.Destroy();
			},
		};
		findPathData.set(obj.Unit, data);

		path.Run(target);
	}
}
export function finish(obj: Obj, status: TREE_OUTCOME) {
	// --[[
	//  (optional) this function is called directly after the run method
	//  is completed with either success() or fail(). It allows you to clean up
	//  things, after you run the task.
	// --]]

	const blackboard = obj.Blackboard;

	const data = findPathData.get(obj.Unit);
	$assert(t.any(data), "data is not defined");

	data.Destroy();
	findPathData.delete(obj.Unit);
}
