import { collectionModeUpdateInputSchema } from "@wantkit/contracts";
import { Hono } from "hono";
import { jsonContractValidator } from "./contract-validation";
import {
	readCollectionMode,
	updateCollectionMode,
} from "./collection-mode-service";
import { requireTrustedOrigin } from "./origin-middleware";
import { requiredIdentifier } from "./request-validation";
import { requireSession, type WorkerAppEnv } from "./session-middleware";

export const collectionModeRoutes = new Hono<WorkerAppEnv>()
	.use("*", async (context, next) => {
		context.header("cache-control", "no-store");
		await next();
	})
	.get("/collections/:collectionId/mode", requireSession, async (context) =>
		context.json(
			await readCollectionMode({
				database: context.env.DB,
				userId: context.get("session").user.id,
				collectionId: requiredIdentifier(
					context.req.param("collectionId"),
					"collectionId",
				),
			}),
		),
	)
	.patch(
		"/collections/:collectionId/mode",
		requireTrustedOrigin,
		requireSession,
		jsonContractValidator(collectionModeUpdateInputSchema),
		async (context) =>
			context.json(
				await updateCollectionMode({
					database: context.env.DB,
					userId: context.get("session").user.id,
					collectionId: requiredIdentifier(
						context.req.param("collectionId"),
						"collectionId",
					),
					value: context.req.valid("json"),
				}),
			),
	);
