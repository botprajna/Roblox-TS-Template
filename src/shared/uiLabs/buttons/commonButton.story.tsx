import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	story: () => {
		const component = <frame Size={new UDim2(0, 300, 0, 100)} />;
		return component;
	},
};

export = story;
