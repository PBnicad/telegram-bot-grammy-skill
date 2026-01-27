# Telegram Bot grammY Skill

A comprehensive skill for building Telegram Bots using the [grammY](https://grammy.dev) framework, deployed on Cloudflare Workers with D1 database.

## Features

- **grammY Framework** - Modern Telegram Bot framework for TypeScript
- **Cloudflare Workers** - Edge deployment with low latency
- **Prisma ORM** - Type-safe database access with D1 adapter
- **Vitest** - Fast unit testing
- **Biome** - Linting and formatting
- **Git Hooks** - Enforced code quality with Husky + lint-staged
- **Multi-Environment CI/CD** - Separate dev and production deployments

## Installation

```bash
npx skills add PBnicad/telegram-bot-grammy-skill
```

Or in Claude Code:
```
/install-skill https://github.com/PBnicad/telegram-bot-grammy-skill
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | grammY |
| Language | TypeScript |
| Runtime | Cloudflare Workers |
| ORM | Prisma + @prisma/adapter-d1 |
| Database | Cloudflare D1 (SQLite) |
| Testing | Vitest |
| Linting | Biome |
| Package Manager | pnpm |
| CI/CD | GitHub Actions |

## Environment Configuration

| Branch | Environment | Worker Name |
|--------|-------------|-------------|
| `dev` | development | my-telegram-bot-dev |
| `main` | production | my-telegram-bot |

## Quick Start

1. Create a new Cloudflare Workers project
2. Install dependencies with pnpm
3. Set up Prisma with D1 adapter
4. Configure wrangler.toml with your database IDs
5. Deploy!

See [SKILL.md](./SKILL.md) for detailed instructions.

## License

MIT
