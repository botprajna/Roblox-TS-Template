import { FAIL, RUNNING, SUCCESS, TREE_OUTCOME } from "@rbxts/behavior-tree-5";
import Path from "@rbxts/simplepath";
import { t } from "@rbxts/t";
import { $assert } from "rbxts-transform-debug";
import { MonsterBTreeBlackboard, MonsterBTreeObj } from "server/services/MonsterAi";
import { MonsterUnit } from "shared/UnitTypes";

type Blackboard = MonsterBTreeBlackboard;
type Obj = { Blackboard: Blackboard } & MonsterBTreeObj;
// -- Any arguments passed into Tree:run(obj) can be received after the first parameter, obj
// -- Example: Tree:run(obj,deltaTime) - > task.start(obj, deltaTime), task.run(obj, deltaTime), task.finish(obj, status, deltaTime)

// -- Blackboards
// -- objects attached to the tree have tables injected into them called Blackboards.
// -- these can be read from and written to by the tree using the Blackboard node, and can be accessed in tasks via object.Blackboard
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
	// (optional) this function is called directly before the run method
	// is called. It allows you to setup things before starting to run
	// Beware: if task is resumed after calling running(), start is not called.
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
		// print("第一步: 攻击开始");
	}
}

export function finish(obj: Obj, status: TREE_OUTCOME) {
	// --[[
	// (optional) this function is called directly after the run method
	// is completed with either success() or fail(). It allows you to clean up
	// things, after you run the task.
	// --]]

	const blackboard = obj.Blackboard;

	const data = attackData.get(obj.Unit);
	$assert(data, "Attack data not found");

	data.Destroy();
	attackData.delete(obj.Unit);
}

export function run(obj: Obj, ...args: unknown[]) {
	// --[[
	// This is the meat of your task. The run method does everything you want it to do.

	// Finish it by returning one of the following:
	// SUCCESS - The task did run successfully
	// FAIL - The task did fail
	// RUNNING - The task is still running and will be called directly from parent node
	// --]]

	const dt = args[0] as number;
	const blackboard = obj.Blackboard;

	const data = attackData.get(obj.Unit);
	$assert(data, "Attack data not found");
	const selfPP = obj.UnitModelMgr.GetModel(obj.Unit).PrimaryPart as Part;
	$assert(selfPP, "PrimaryPart not found");
	const target = data.target;

	const distance = selfPP.Position.sub(target.Position).Magnitude;

	if (t.none(data.target.Parent)) return AttackFail(obj);
	if (distance >= obj.LostTargetRadius) return AttackFail(obj);
	// print("第一步: 攻击开始");
	//攻击
	if (distance <= obj.AttackRadius) obj.UnitSkillMgr.CastAttack(obj.Unit);

	return RUNNING;
}

function AttackFail(obj: Obj) {
	const data = attackData.get(obj.Unit);
	$assert(data, "Attack data not found");
	data.state = "LostTarget";
	return FAIL;
}
