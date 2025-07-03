import { Service, OnStart } from "@flamework/core";
import { UnitModel } from "./UnitModel";
import { HttpService, ReplicatedStorage, Workspace } from "@rbxts/services";
import { MonsterConfig, Unit, UnitAttribute } from "shared/UnitTypes";
import { t } from "@rbxts/t";
import { SceneService } from "./SceneService";
import { UnitAiMgr } from "./MonsterAi";
import { UnitAnimation } from "./UnitAnimation";
import { Events } from "server/network";

@Service({})
export class BornMonster implements OnStart {
	private SPAWN_INTERVAL = 15; // 生成间隔
	public Monsters = new Map<Unit, UnitAttribute>(); // 存储怪物及其属性

	constructor(
		private sceneService: SceneService,
		private unitModel: UnitModel,
		private unitAiMgr: UnitAiMgr,
		private unitAnimation: UnitAnimation,
	) {}

	onStart() {
		Events.fire.connect(() => {
			this.startSpawning();
			print("开始生成怪物");
		});
	}

	private startSpawning() {
		// 获取所有怪物Id
		const monsterIds = MonsterConfig.getAllIds();
		const spawnLoop = () => {
			for (const id of monsterIds) {
				this.spawnMonster(id);
				task.wait(this.SPAWN_INTERVAL);
			}
		};
		task.spawn(spawnLoop);
	}

	// 获取怪物模型
	private getMonsterModel(modelName: string): Model | undefined {
		const model = ReplicatedStorage.FindFirstChild("Assets")?.FindFirstChild("Monsters")?.FindFirstChild(modelName);
		return model?.IsA("Model") ? model : undefined;
	}

	// 根据怪物 Id 进行生成
	private spawnMonster(monsterId: number) {
		const config = MonsterConfig.GetMonsterConfig(monsterId);
		if (t.none(config)) {
			warn("怪物配置未找到！");
			return;
		}

		const model = this.getMonsterModel(config.Name);
		if (t.none(model)) {
			warn(`找不到怪物模型: ${config.Name}`);
			return;
		}

		const instance = model.Clone();
		const stick = new Instance("Part");
		stick.Name = "Stick";

		const humanoid = instance.FindFirstChildOfClass("Humanoid") as Humanoid | undefined;
		if (humanoid) {
			// 确保有Animator
			if (!instance.FindFirstChildOfClass("Animator")) {
				const animator = new Instance("Animator");
				animator.Parent = humanoid;
			}
		}

		stick.Size = new Vector3(5, 0.5, 0.5);
		stick.CanCollide = false;
		stick.Color = Color3.fromRGB(255, 0, 0);
		stick.Anchored = false;

		const leftHand = instance.FindFirstChild("LeftHand") as BasePart;
		stick.CFrame = leftHand.CFrame;
		stick.Parent = instance;

		const weld = new Instance("WeldConstraint") as WeldConstraint;
		weld.Part0 = leftHand;
		weld.Part1 = stick;
		weld.Parent = stick;
		// 克隆模型后，设置 PrimaryPart
		const rootPart = instance.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
		if (rootPart) {
			instance.PrimaryPart = rootPart;
		}
		const spawnLocation = this.sceneService.GetMonsterSpawnLocation();
		instance.PivotTo(new CFrame(spawnLocation));
		instance.Parent = Workspace;

		const monsterUnit: Unit = {
			Type: "Monster",
			MonsterId: config.Id,
			Guid: HttpService.GenerateGUID(),
		};

		const monsterAttributes: UnitAttribute = {
			Name: config.Name,
			Level: config.Level,
			Health: config.Health,
			HealthMax: config.Health,
			Attack: config.Attack,
		};

		this.Monsters.set(monsterUnit, monsterAttributes);
		this.unitModel.SetModel(monsterUnit, instance);

		// 调用怪物	AI
		this.unitAiMgr.CreateAI(monsterUnit);
		instance.SetAttribute("UnitType", "MonsterUnit");

		// const humanoid = instance.FindFirstChildOfClass("Humanoid") as Humanoid | undefined;
		if (t.none(humanoid)) {
			warn(`怪物 ${config.Name} 未找到 Humanoid`);
		} else {
			// 监听生命值变化
			humanoid.HealthChanged.Connect(() => {
				if (humanoid.Health <= 0) {
					print(`怪物的健康值 ${humanoid.Health}`);
					// 怪物死亡，重新生成
					instance.Destroy();

					// 创建掉落物品
					const dropPart = new Instance("Part");
					dropPart.Parent = Workspace;
					dropPart.Position = spawnLocation;
					dropPart.Anchored = true;
					dropPart.Transparency = 1;
					const dropBill = new Instance("BillboardGui");
					dropBill.Size = new UDim2(3, 0, 1, 0);
					dropBill.StudsOffset = new Vector3(0, 3, 0);
					dropBill.AlwaysOnTop = true;
					dropBill.MaxDistance = 100;
					dropBill.Parent = dropPart;

					const frame = new Instance("Frame");
					frame.Size = new UDim2(1, 0, 1, 0);
					frame.BackgroundColor3 = Color3.fromRGB(255, 115, 0);
					frame.BackgroundTransparency = 0.3;
					frame.Parent = dropBill;

					const stroke = new Instance("UIStroke");
					stroke.Thickness = 4;
					stroke.Color = Color3.fromRGB(0, 255, 64);
					stroke.Parent = frame;

					this.spawnMonster(monsterId);
					print(`重新生成怪物 ${monsterAttributes.Name}`);
				}
			});
		}

		// 打印当前生成的怪物属性
		this.printMonsterAttributes(monsterAttributes, spawnLocation);
	}

	// 打印单个怪物属性
	private printMonsterAttributes(monsterAttributes: UnitAttribute, spawnLocation: Vector3) {
		const info = `
			[怪物 ${monsterAttributes.Name} 生成成功！位置: ${spawnLocation}]
			怪物名称: ${monsterAttributes.Name}
			等级: ${monsterAttributes.Level}
			生命值: ${monsterAttributes.Health}
			攻击力: ${monsterAttributes.Attack}  
		`;
		// print(info);
	}
}
