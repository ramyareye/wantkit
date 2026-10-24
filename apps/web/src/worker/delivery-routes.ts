import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { requireSession, type WorkerAppEnv } from "./session-middleware";
import { forwardDelivery } from "./delivery-proxy";

export const deliveryRoutes = new Hono<WorkerAppEnv>();
deliveryRoutes.post(
	"/delivery/request",
	requireSession,
	bodyLimit({
		maxSize: 64 * 1024,
		onError: (c) =>
			c.json(
				{
					error: {
						code: "BODY_TOO_LARGE",
						message: "Delivery request too large.",
					},
				},
				413,
			),
	}),
	(c) => forwardDelivery(c.req.raw, c.env),
);
