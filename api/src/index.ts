import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.json({ message: "Hello from the en-words API" }));

app.get("/health", (c) =>
	c.json({
		status: "ok",
		timestamp: new Date().toISOString(),
	}),
);

const port = Number(process.env.PORT) || 8787;

console.log(`🚀 Hono API is running at http://localhost:${port}`);
serve({
	fetch: app.fetch,
	port,
});
