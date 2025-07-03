import { Controller, OnStart } from "@flamework/core";
import React, { useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { Connection } from "@rbxts/ui-labs/src/Libraries/Signal";
import { Events } from "client/network";

@Controller({})
export class Bornbutton implements OnStart {
	private player = Players.LocalPlayer;

	onStart() {
		const playerGui = this.player.WaitForChild("PlayerGui") as PlayerGui;
		// 创建 ScreenGui 实例并设置为 PlayerGui 的子对象
		const handle = new Instance("ScreenGui");
		handle.Parent = playerGui;
		// 创建 React 渲染根
		const root = ReactRoblox.createRoot(handle);

		// 渲染 MyTestComponent 组件
		root.render(<MyTestComponent />);
	}
}
function MyTestComponent() {
	const [clicked, setClicked] = useState(false);
	const handleClick = () => {
		setClicked(!clicked);
		print("点击了");
	};

	return (
		<frame
			Size={new UDim2(0, 200, 0, 80)}
			BackgroundColor3={Color3.fromRGB(40, 20, 60)}
			BorderColor3={Color3.fromRGB(0, 0, 255)} // 可以设置背景颜色
		>
			{/* 内部的 TextLabel，用于显示文本 */}
			<textlabel
				Text="招募猎人"
				TextColor3={Color3.fromRGB(0, 0, 0)} // 设置文本颜色
				TextSize={24} // 设置文本大小
				Size={new UDim2(1, 0, 1, 0)} // 让文本填充整个 Frame
				AnchorPoint={new Vector2(0.5, 0.5)} // 设置文本对齐方式
				Position={new UDim2(0.5, 0, 0.5, 0)} // 中心对齐
				BackgroundTransparency={1} // 透明背景
				Event={{
					InputBegan: (selfEle, input) => {
						if (input.UserInputType === Enum.UserInputType.MouseButton1) {
							handleClick();
							Events.fire();
						}
					},
				}}
			/>
		</frame>
	);
}
