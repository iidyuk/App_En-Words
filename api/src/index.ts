import "dotenv/config";
import { serve } from "@hono/node-server";
import type { Prisma, UserWordCheck } from "@prisma/client";
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
		wordChecks: true;
	};
}>;
const app = new Hono();
const DEFAULT_USER_ID = BigInt(1);

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
			wordChecks: true,
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
		checked: word.wordChecks.some(
			(check: UserWordCheck) => check.userId === DEFAULT_USER_ID,
		),
		createdAt: word.createdAt.toISOString(),
		updatedAt: word.updatedAt.toISOString(),
	}));

	return c.json({ words: serialized });
});

app.get("/quiz-stats", async (c) => {
	const rows = (await prisma.$queryRaw<
		{ wordId: bigint; correct: bigint; incorrect: bigint }[]
	>`SELECT word_id AS "wordId",
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS "correct",
        SUM(CASE WHEN NOT is_correct THEN 1 ELSE 0 END) AS "incorrect"
      FROM quiz_answer_logs
      GROUP BY word_id`) as {
		wordId: bigint;
		correct: bigint;
		incorrect: bigint;
	}[];

	const stats = rows.map((row) => ({
		wordId: row.wordId.toString(),
		correct: Number(row.correct),
		incorrect: Number(row.incorrect),
	}));

	return c.json({ stats });
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
			userId: DEFAULT_USER_ID,
			isCorrect: entry.isCorrect,
		})),
	});

	return c.json({ recorded: entries.length }, 201);
});

app.post("/word-checks", async (c) => {
	const body = await c.req.json().catch(() => null);
	if (!body || !Array.isArray(body.checkedWordIds)) {
		return c.json({ message: "Invalid payload" }, 400);
	}

	const parsedIds = body.checkedWordIds
		.map((id: string | number | null) => {
			if (id === null || id === undefined) return null;
			try {
				return BigInt(id);
			} catch {
				return null;
			}
		})
		.filter(Boolean) as bigint[];

	const uniqueIds = Array.from(new Set(parsedIds));

	const existing = await prisma.userWordCheck.findMany({
		where: { userId: DEFAULT_USER_ID },
	});

	const existingSet = new Set(existing.map((row) => row.wordId.toString()));
	const targetSet = new Set(uniqueIds.map((id) => id.toString()));

	const toAdd = uniqueIds.filter((id) => !existingSet.has(id.toString()));
	const toRemove = existing.filter((row) => !targetSet.has(row.wordId.toString()));

	if (toAdd.length > 0) {
		await prisma.userWordCheck.createMany({
			data: toAdd.map((wordId) => ({
				userId: DEFAULT_USER_ID,
				wordId,
			})),
			skipDuplicates: true,
		});
	}

	if (toRemove.length > 0) {
		await prisma.userWordCheck.deleteMany({
			where: {
				userId: DEFAULT_USER_ID,
				wordId: { in: toRemove.map((row) => row.wordId) },
			},
		});
	}

	return c.json({
		added: toAdd.length,
		removed: toRemove.length,
		total: targetSet.size,
	});
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
