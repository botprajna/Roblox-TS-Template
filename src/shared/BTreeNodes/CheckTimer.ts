import { TREE_OUTCOME } from "@rbxts/behavior-tree-5";
import { CTBB, CTData } from "./CheckTimerType";

const SUCCESS = 1;
const FAIL = 2;
const RUNNING = 3;
type Blackboard = CTBB;
type BTData = { Blackboard: Blackboard } & CTData;

export function start(obj: BTData) {
	// --[[
	//  (optional) this function is called directly before the run method
	//  is called. It allows you to setup things before starting to run
	//  Beware: if task is resumed after calling running(), start is not called.
	// --]]

	const blackboard = obj.Blackboard;
}

export function finish(obj: BTData, status: TREE_OUTCOME) {
	// --[[
	//  (optional) this function is called directly after the run method
	//  is completed with either success() or fail(). It allows you to clean up
	//  things, after you run the task.
	// --]]

	const blackboard = obj.Blackboard;
}

export function run(obj: BTData, dt: number | undefined) {
	// --[[
	//  This is the meat of your task. The run method does everything you want it to do.

	//  Finish it by returning one of the following:
	//    SUCCESS - The task did run successfully
	//    FAIL    - The task did fail
	//    RUNNING - The task is still running and will be called directly from parent node
	// --]]

	const blackboard = obj.Blackboard;

	if (blackboard.timer > 1) return SUCCESS;
	return FAIL;
}
