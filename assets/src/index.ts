import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { Bot, webhookCallback } from "grammy";
import type { Context } from "grammy";

export interface Env {
    BOT_TOKEN: string;
    BOT_INFO: string;
    DB: D1Database;
}

export default {
    async fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext
    ): Promise<Response> {
        // Initialize Prisma with D1 adapter
        const adapter = new PrismaD1(env.DB);
        const prisma = new PrismaClient({ adapter });

        // Initialize Bot
        const bot = new Bot(env.BOT_TOKEN, {
            botInfo: JSON.parse(env.BOT_INFO),
        });

        // /start command - save user info
        bot.command("start", async (ctx: Context) => {
            const user = ctx.from;
            if (user) {
                await prisma.user.upsert({
                    where: { telegramId: BigInt(user.id) },
                    update: {
                        username: user.username ?? null,
                        firstName: user.first_name ?? null,
                        lastName: user.last_name ?? null,
                    },
                    create: {
                        telegramId: BigInt(user.id),
                        username: user.username ?? null,
                        firstName: user.first_name ?? null,
                        lastName: user.last_name ?? null,
                    },
                });
            }
            await ctx.reply("Welcome to the Bot! Send /help for help.");
        });

        // /help command
        bot.command("help", async (ctx: Context) => {
            await ctx.reply("Available commands:\n/start - Start\n/help - Help");
        });

        // Handle other messages
        bot.on("message", async (ctx: Context) => {
            await ctx.reply("Message received!");
        });

        // Handle webhook
        return webhookCallback(bot, "cloudflare-mod")(request);
    },
};
