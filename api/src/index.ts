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

app.get("/quiz-stats", async (c) => {
	const logs = await prisma.quizAnswerLog.findMany({
		select: { wordId: true, isCorrect: true },
	});

	const counts = new Map<
		string,
		{ wordId: string; correct: number; incorrect: number }
	>();

	for (const log of logs) {
		const key = log.wordId.toString();
		if (!counts.has(key)) {
			counts.set(key, { wordId: key, correct: 0, incorrect: 0 });
		}
		const entry = counts.get(key)!;
		if (log.isCorrect) {
			entry.correct += 1;
		} else {
			entry.incorrect += 1;
		}
	}

	return c.json({ stats: Array.from(counts.values()) });
});

app.post("/quiz-logs", async (c) => {
	const body = await c.req.json().catch(() => null);
	if (!body || !Array.isArray(body.results)) {
		return c.json({ message: "Invalid payload" }, 400);
	}

	const entries = body.results
		.map((item: { wordId?: string | number; isCorrect?: boolean }) => {
			if (item.wordId === undefined || typeof item.isCorrect !== "boolean") {
				return null;
			}

			try {
				const wordIdBigInt = BigInt(item.wordId);
				return { wordId: wordIdBigInt, isCorrect: item.isCorrect };
			} catch {
				return null;
			}
		})
		.filter(Boolean) as { wordId: bigint; isCorrect: boolean }[];

	if (!entries.length) {
		return c.json({ message: "No valid quiz results to record." }, 400);
	}

	await prisma.quizAnswerLog.createMany({
		data: entries.map((entry) => ({
			wordId: entry.wordId,
			// ユーザー未実装のため仮ユーザーID: 1 として記録
			userId: BigInt(1),
			isCorrect: entry.isCorrect,
		})),
	});

	return c.json({ recorded: entries.length }, 201);
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
