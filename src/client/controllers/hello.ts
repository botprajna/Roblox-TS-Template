import { Controller, OnStart } from "@flamework/core";

@Controller({})
export class Hello implements OnStart {
	onStart() {
		// print("hello from controllers");
	}
}
