import { ReplicatedStorage } from "@rbxts/services";

export function paths(root: Instance, paths: string[]): Instance;
export function paths(paths: string[]): Instance;
export function paths(arg1: Instance | string[], arg2?: string[]): Instance {
	const root = arg2 === undefined ? ReplicatedStorage : (arg1 as Instance);
	const paths = arg2 === undefined ? (arg1 as string[]) : arg2;

	let cur = root;
	for (const path of paths) {
		const nextNode = cur.FindFirstChild(path);
		if (nextNode !== undefined) {
			cur = nextNode;
		} else {
			return root;
		}
	}
	return cur;
}
