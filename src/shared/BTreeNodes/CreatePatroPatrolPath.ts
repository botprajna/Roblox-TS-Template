import { FAIL, RUNNING, SUCCESS, TREE_OUTCOME } from "@rbxts/behavior-tree-5";
import { PathfindingService } from "@rbxts/services";
import { t } from "@rbxts/t";
import { MonsterBTreeBlackboard, MonsterBTreeObj } from "server/services/MonsterAi";

type Blackboard = MonsterBTreeBlackboard;
type Obj = { Blackboard: Blackboard } & MonsterBTreeObj;
// -- Any arguments passed into Tree:run(obj) can be received after the first parameter, obj
// -- Example: Tree:run(obj,deltaTime) - > task.start(obj, deltaTime), task.run(obj, deltaTime), task.finish(obj, status, deltaTime)

// -- Blackboards
//  -- objects attached to the tree have tables injected into them called Blackboards.
//  -- these can be read from and written to by the tree using the Blackboard node, and can be accessed in tasks via object.Blackboard
// --

export function start(obj: Obj) {
	// --[[
	//  (optional) this function is called directly before the run method
	//  is called. It allows you to setup things before starting to run
	//  Beware: if task is resumed after calling running(), start is not called.
	// --]]

	obj.Blackboard.patrolPath = undefined;
	task.spawn(() => {
		const path = PathfindingService.FindPathAsync(Vector3.zAxis, Vector3.zero);
		obj.Blackboard.patrolPath = path;
	});
}

export function finish(obj: Obj, status: TREE_OUTCOME) {
	// --[[
	//  (optional) this function is called directly after the run method
	//  is completed with either success() or fail(). It allows you to clean up
	//  things, after you run the task.
	// --]]

	const blackboard = obj.Blackboard;
}

export function run(obj: Obj, ...args: unknown[]) {
	// --[[
	//  This is the meat of your task. The run method does everything you want it to do.

	//  Finish it by returning one of the following:
	//    SUCCESS - The task did run successfully
	//    FAIL    - The task did fail
	//    RUNNING - The task is still running and will be called directly from parent node
	// --]]
	return SUCCESS;
}
