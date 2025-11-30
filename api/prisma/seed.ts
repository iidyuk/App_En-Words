import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ensureUserWordCheck = async (userId: bigint, wordId: bigint) => {
	const alreadyExists = await prisma.userWordCheck.findFirst({
		where: { userId, wordId },
	});

	if (!alreadyExists) {
		await prisma.userWordCheck.create({
			data: { userId, wordId },
		});
	}
};

const ensureQuizLog = async (
	userId: bigint,
	wordId: bigint,
	isCorrect: boolean,
) => {
	const alreadyExists = await prisma.quizAnswerLog.findFirst({
		where: { userId, wordId, isCorrect },
	});

	if (!alreadyExists) {
		await prisma.quizAnswerLog.create({
			data: { userId, wordId, isCorrect },
		});
	}
};

const main = async () => {
	const [basicGroup, travelGroup] = await Promise.all([
		prisma.wordGroup.upsert({
			where: { name: "Basics" },
			update: { sortOrder: 1 },
			create: { name: "Basics", sortOrder: 1 },
		}),
		prisma.wordGroup.upsert({
			where: { name: "Travel" },
			update: { sortOrder: 2 },
			create: { name: "Travel", sortOrder: 2 },
		}),
	]);

	const [helloWord, airportWord] = await Promise.all([
		prisma.word.upsert({
			where: { wordEn: "hello" },
			update: {
				wordGroupId: basicGroup.id,
			},
			create: {
				wordEn: "hello",
				wordGroupId: basicGroup.id,
			},
		}),
		prisma.word.upsert({
			where: { wordEn: "airport" },
			update: {
				wordGroupId: travelGroup.id,
			},
			create: {
				wordEn: "airport",
				wordGroupId: travelGroup.id,
			},
		}),
	]);

	const upsertJp = async (wordId: bigint, wordJp: string) => {
		await prisma.wordJp.upsert({
			where: {
				wordId_wordJp: {
					wordId,
					wordJp,
				},
			},
			update: {},
			create: {
				wordId,
				wordJp,
			},
		});
	};

	await upsertJp(helloWord.id, "こんにちは");
	await upsertJp(airportWord.id, "空港");

	const demoUser = await prisma.user.upsert({
		where: { email: "demo@example.com" },
		update: {
			displayName: "Demo User",
			isActive: true,
			role: "admin",
		},
		create: {
			email: "demo@example.com",
			passwordHash: "demo-password-hash",
			displayName: "Demo User",
			isActive: true,
			role: "admin",
		},
	});

	await ensureUserWordCheck(demoUser.id, helloWord.id);
	await ensureQuizLog(demoUser.id, helloWord.id, true);
	await ensureQuizLog(demoUser.id, airportWord.id, false);

	console.log("Seed data inserted.");
};

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
