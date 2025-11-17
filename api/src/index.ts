import "dotenv/config";
import { serve } from "@hono/node-server";
import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";

if (!process.env.DATABASE_URL) {
	console.error(
		"Missing DATABASE_URL. Please set it in .env or the environment.",
	);
	process.exit(1);
}

const prisma = new PrismaClient();
const app = new Hono();

app.get("/", (c) => c.json({ message: "Hello from the en-words API" }));

app.get("/health", (c) =>
	c.json({
		status: "ok",
		timestamp: new Date().toISOString(),
	}),
);

app.get("/words", async (c) => {
	const words = await prisma.word.findMany({
		orderBy: { createdAt: "desc" },
	});

	return c.json({ words });
});

const port = Number(process.env.PORT) || 8787;

console.log(`🚀 Hono API is running at http://localhost:${port}`);
serve({
	fetch: app.fetch,
	port,
});

const gracefulShutdown = async () => {
	await prisma.$disconnect();
	process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
