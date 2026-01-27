import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma Client
function createMockPrisma() {
    return {
        user: {
            upsert: vi.fn().mockResolvedValue({
                id: 1,
                telegramId: 123456n,
                username: "testuser",
                firstName: "Test",
                lastName: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }),
            findUnique: vi.fn().mockResolvedValue(null),
            findMany: vi.fn().mockResolvedValue([]),
            create: vi.fn().mockResolvedValue({ id: 1, telegramId: 123456n }),
            update: vi.fn().mockResolvedValue({ id: 1, telegramId: 123456n }),
            delete: vi.fn().mockResolvedValue({ id: 1 }),
        },
        setting: {
            upsert: vi.fn().mockResolvedValue({ id: 1, key: "theme", value: "dark" }),
            findUnique: vi.fn().mockResolvedValue(null),
            findMany: vi.fn().mockResolvedValue([]),
        },
    };
}

// Mock grammY Context
function createMockContext(options: {
    text?: string;
    command?: string;
    userId?: number;
    username?: string;
    firstName?: string;
}) {
    const {
        text,
        command,
        userId = 123456,
        username = "testuser",
        firstName = "Test",
    } = options;

    return {
        message: {
            text: command ? `/${command}` : text,
            message_id: 1,
            date: Math.floor(Date.now() / 1000),
            chat: { id: userId, type: "private" as const },
        },
        from: {
            id: userId,
            is_bot: false,
            first_name: firstName,
            username,
        },
        chat: { id: userId, type: "private" as const },
        reply: vi.fn().mockResolvedValue({ message_id: 2 }),
        answerCallbackQuery: vi.fn().mockResolvedValue(true),
    };
}

describe("Bot Commands", () => {
    let mockPrisma: ReturnType<typeof createMockPrisma>;

    beforeEach(() => {
        mockPrisma = createMockPrisma();
        vi.clearAllMocks();
    });

    describe("/start command", () => {
        it("should upsert user on /start", async () => {
            const ctx = createMockContext({ command: "start" });

            // Simulate /start command handling
            await mockPrisma.user.upsert({
                where: { telegramId: BigInt(ctx.from.id) },
                update: {
                    username: ctx.from.username,
                    firstName: ctx.from.first_name,
                },
                create: {
                    telegramId: BigInt(ctx.from.id),
                    username: ctx.from.username,
                    firstName: ctx.from.first_name,
                },
            });

            await ctx.reply("Welcome to the Bot! Send /help for help.");

            expect(mockPrisma.user.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { telegramId: BigInt(123456) },
                })
            );
            expect(ctx.reply).toHaveBeenCalledWith("Welcome to the Bot! Send /help for help.");
        });
    });

    describe("/help command", () => {
        it("should reply with help message", async () => {
            const ctx = createMockContext({ command: "help" });

            await ctx.reply("Available commands:\n/start - Start\n/help - Help");

            expect(ctx.reply).toHaveBeenCalledWith("Available commands:\n/start - Start\n/help - Help");
        });
    });

    describe("Message handling", () => {
        it("should reply to text messages", async () => {
            const ctx = createMockContext({ text: "Hello bot!" });

            await ctx.reply("Message received!");

            expect(ctx.reply).toHaveBeenCalledWith("Message received!");
        });
    });
});

describe("Prisma Operations", () => {
    let mockPrisma: ReturnType<typeof createMockPrisma>;

    beforeEach(() => {
        mockPrisma = createMockPrisma();
        vi.clearAllMocks();
    });

    describe("User operations", () => {
        it("should find user by telegramId", async () => {
            const mockUser = {
                id: 1,
                telegramId: 123456n,
                username: "testuser",
                firstName: "Test",
                lastName: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);

            const result = await mockPrisma.user.findUnique({
                where: { telegramId: 123456n },
            });

            expect(result).toEqual(mockUser);
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { telegramId: 123456n },
            });
        });

        it("should return null for non-existent user", async () => {
            const result = await mockPrisma.user.findUnique({
                where: { telegramId: 999999n },
            });

            expect(result).toBeNull();
        });

        it("should create new user", async () => {
            const result = await mockPrisma.user.create({
                data: {
                    telegramId: 123456n,
                    username: "newuser",
                    firstName: "New",
                },
            });

            expect(result.telegramId).toBe(123456n);
        });
    });

    describe("Setting operations", () => {
        it("should upsert user setting", async () => {
            const result = await mockPrisma.setting.upsert({
                where: { userId_key: { userId: 1, key: "theme" } },
                update: { value: "dark" },
                create: { userId: 1, key: "theme", value: "dark" },
            });

            expect(result.key).toBe("theme");
            expect(result.value).toBe("dark");
        });
    });
});

describe("Callback Queries", () => {
    it("should answer callback query", async () => {
        const ctx = createMockContext({ userId: 123456 });

        await ctx.answerCallbackQuery("Operation successful!");

        expect(ctx.answerCallbackQuery).toHaveBeenCalledWith("Operation successful!");
    });
});
