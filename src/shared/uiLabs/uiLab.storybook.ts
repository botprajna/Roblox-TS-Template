import { ReplicatedStorage } from "@rbxts/services";
import { Storybook } from "@rbxts/ui-labs";
import { paths } from "shared/utilities/paths";

const storybook: Storybook = {
	name: "components",
	storyRoots: [paths(["ts", "shared", "uiLabs"])],
};

export = storybook;
