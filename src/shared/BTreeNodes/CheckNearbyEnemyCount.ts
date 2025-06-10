import { SUCCESS, TREE_OUTCOME } from "@rbxts/behavior-tree-5";
import { $print } from "rbxts-transform-debug";
import { MonsterBTreeBlackboard, MonsterBTreeObj } from "server/services/MonsterAi";

type Blackboard = MonsterBTreeBlackboard;
type Obj = { Blackboard: Blackboard } & MonsterBTreeObj;

export function start(obj: Obj) {
	// --[[
	//  (optional) this function is called directly before the run method
	//  is called. It allows you to setup things before starting to run
	//  Beware: if task is resumed after calling running(), start is not called.
	// --]]

	obj.Blackboard.curNearbyEnemies = obj.Blackboard.curNearbyEnemies ?? [];
	obj.Blackboard.curNearbyEnemies.clear();
}

export function finish(obj: Obj, status: TREE_OUTCOME) {
	// --[[
	//  (optional) this function is called directly after the run method
	//  is completed with either success() or fail(). It allows you to clean up
	//  things, after you run the task.
	// --]]
}

export function run(obj: Obj, ...args: unknown[]) {
	// --[[
	//  This is the meat of your task. The run method does everything you want it to do.

	//  Finish it by returning one of the following:
	//    SUCCESS - The task did run successfully
	//    FAIL    - The task did fail
	//    RUNNING - The task is still running and will be called directly from parent node
	// --]]
	const unit = obj.Unit;
	const unitModelMgr = obj.UnitModelMgr;
	const CheckEnemyRadius = obj.CheckEnemyRadius;

	obj.Blackboard.curNearbyEnemies = unitModelMgr
		.GetNearbyModels(obj.Unit, obj.CheckEnemyRadius)
		.filter((model) => model.GetAttribute("UnitType") === "HunterUnit");
	// $print("checkNearbyEnemyCount");
	return SUCCESS;
}
