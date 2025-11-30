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
	const groupSeeds = [
		{
			name: "Basics",
			sortOrder: 1,
			words: [
				{ wordEn: "hello", jp: ["こんにちは"] },
				{ wordEn: "thanks", jp: ["ありがとう"] },
				{ wordEn: "goodbye", jp: ["さようなら"] },
				{ wordEn: "friend", jp: ["友達"] },
				{ wordEn: "study", jp: ["学ぶ", "勉強する"] },
			],
		},
		{
			name: "Travel",
			sortOrder: 2,
			words: [
				{ wordEn: "airport", jp: ["空港"] },
				{ wordEn: "ticket", jp: ["チケット", "切符"] },
				{ wordEn: "train", jp: ["電車"] },
				{ wordEn: "hotel", jp: ["ホテル"] },
				{ wordEn: "breakfast", jp: ["朝食"] },
				{ wordEn: "map", jp: ["地図"] },
			],
		},
	] as const;

	const groupRecords = await Promise.all(
		groupSeeds.map((group) =>
			prisma.wordGroup.upsert({
				where: { name: group.name },
				update: { sortOrder: group.sortOrder },
				create: { name: group.name, sortOrder: group.sortOrder },
			}),
		),
	);

	const groupMap = new Map<string, (typeof groupRecords)[number]>();
	groupRecords.forEach((record) => groupMap.set(record.name, record));

	const wordRecords = new Map<string, { id: bigint; wordEn: string }>();

	const upsertWordWithTranslations = async (
		wordEn: string,
		wordGroupId: bigint,
		translations: string[],
	) => {
		const word = await prisma.word.upsert({
			where: { wordEn },
			update: {
				wordGroupId,
			},
			create: {
				wordEn,
				wordGroupId,
			},
		});

		await Promise.all(
			translations.map((wordJp) =>
				prisma.wordJp.upsert({
					where: {
						wordId_wordJp: {
							wordId: word.id,
							wordJp,
						},
					},
					update: {},
					create: {
						wordId: word.id,
						wordJp,
					},
				}),
			),
		);

		wordRecords.set(wordEn, { id: word.id, wordEn: word.wordEn });
		return word;
	};

	for (const group of groupSeeds) {
		const groupRecord = groupMap.get(group.name);
		if (!groupRecord) continue;

		for (const word of group.words) {
			await upsertWordWithTranslations(word.wordEn, groupRecord.id, word.jp);
		}
	}

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

	const helloWord = wordRecords.get("hello");
	const airportWord = wordRecords.get("airport");

	if (helloWord) {
		await ensureUserWordCheck(demoUser.id, helloWord.id);
		await ensureQuizLog(demoUser.id, helloWord.id, true);
	}

	if (airportWord) {
		await ensureQuizLog(demoUser.id, airportWord.id, false);
	}

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
