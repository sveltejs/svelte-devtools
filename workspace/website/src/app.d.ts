declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			meta: {
				title: string;
				description?: string;
			};
		}
	}
}

export {};
