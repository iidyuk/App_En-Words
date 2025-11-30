import "dotenv/config";
import { serve } from "@hono/node-server";
import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";

if (!process.env.DATABASE_URL) {
	console.error(
		"Missing DATABASE_URL. Please set it in .env or the environment.",
	);
	process.exit(1);
}

const prisma = new PrismaClient();
type WordWithRelations = Prisma.WordGetPayload<{
	include: {
		wordGroup: true;
		jpTranslations: true;
		posLinks: {
			include: { partOfSpeech: true };
		};
	};
}>;
const app = new Hono();

app.get("/", (c) => c.json({ message: "Hello from the en-words API" }));

app.get("/health", (c) =>
	c.json({
		status: "ok",
		timestamp: new Date().toISOString(),
	}),
);

app.get("/words", async (c) => {
	const words = (await prisma.word.findMany({
		orderBy: { createdAt: "desc" },
		include: {
			wordGroup: true,
			jpTranslations: true,
			posLinks: {
				include: { partOfSpeech: true },
			},
		},
	})) as WordWithRelations[];

	const serialized = words.map((word: WordWithRelations) => ({
		id: word.id.toString(),
		wordEn: word.wordEn,
		wordGroup: word.wordGroup
			? {
					id: word.wordGroup.id.toString(),
					name: word.wordGroup.name,
					sortOrder: word.wordGroup.sortOrder,
				}
			: null,
		jpTranslations: word.jpTranslations.map(
			(jp: WordWithRelations["jpTranslations"][number]) => ({
				id: jp.id.toString(),
				wordJp: jp.wordJp,
			}),
		),
		posLinks: word.posLinks.map(
			(link: WordWithRelations["posLinks"][number]) => ({
				id: link.id.toString(),
				wordId: link.wordId.toString(),
				posId: link.posId.toString(),
				partOfSpeech: link.partOfSpeech
					? {
							id: link.partOfSpeech.id.toString(),
							code: link.partOfSpeech.code,
							label: link.partOfSpeech.label,
							sortOrder: link.partOfSpeech.sortOrder,
						}
					: null,
			}),
		),
		createdAt: word.createdAt.toISOString(),
		updatedAt: word.updatedAt.toISOString(),
	}));

	return c.json({ words: serialized });
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
