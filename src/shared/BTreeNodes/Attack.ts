import Path from "@rbxts/simplepath";
import { $assert } from "rbxts-transform-debug";
import { MonsterBTreeBlackboard, MonsterBTreeObj } from "server/services/MonsterAi";
import { MonsterUnit } from "shared/UnitTypes";

type Blackboard = MonsterBTreeBlackboard;
type Obj = { Blackboard: Blackboard } & MonsterBTreeObj;
// -- Any arguments passed into Tree:run(obj) can be received after the first parameter, obj
// -- Example: Tree:run(obj,deltaTime) - > task.start(obj, deltaTime), task.run(obj, deltaTime), task.finish(obj, status, deltaTime)

// -- Blackboards
//  -- objects attached to the tree have tables injected into them called Blackboards.
//  -- these can be read from and written to by the tree using the Blackboard node, and can be accessed in tasks via object.Blackboard
// --

type AttackData = {
	path: Path;
	target: Part;
	state: "Attacking" | "LostTarget";
	Destroy: () => void;
};
const attackData = new Map<MonsterUnit, AttackData>();

export function start(obj: Obj) {
	// --[[
	//  (optional) this function is called directly before the run method
	//  is called. It allows you to setup things before starting to run
	//  Beware: if task is resumed after calling running(), start is not called.
	// --]]

	const blackboard = obj.Blackboard;

	if (attackData.has(obj.Unit) === false) {
		const model = obj.UnitModelMgr.GetModel(obj.Unit);
		const target = obj.Blackboard.curNearbyEnemies.pop()?.PrimaryPart as Part;
		$assert(target, "Target not found");

		const path = new Path(model);
		const pathConns: RBXScriptConnection[] = [];
		const reRunPath = () => {
			if (attackData.get(obj.Unit)?.state === "Attacking") path.Run(target);
		};

		path.Visualize = true;
		pathConns.push(path.Blocked.Connect(() => reRunPath()));
		pathConns.push(path.WaypointReached.Connect(() => reRunPath()));
		pathConns.push(path.Error.Connect(() => reRunPath()));
		pathConns.push(path.Reached.Connect(() => reRunPath()));

		const data: AttackData = {
			path,
			target,
			state: "Attacking",
			Destroy: () => {
				pathConns.forEach((conn) => conn.Disconnect());
				if (path.Status === "Active") path.Stop();
				task.delay(1, () => data.path.Destroy());
			},
		};
		attackData.set(obj.Unit, data);

		path.Run(target);
	}
}
