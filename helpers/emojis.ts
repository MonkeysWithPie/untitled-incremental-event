import type { Client } from "discord.js";

let emojiCache: Map<string, string> | null = null;

export async function initEmojis(client: Client) {
    if (!client.application?.name) {
        await client.application!.fetch();
    }

    const emojis = await client.application!.emojis.fetch();
    emojiCache = new Map();
    emojis.forEach(emoji => {
        emojiCache!.set(emoji.name, `<:${emoji.name}:${emoji.id}>`);
    });
}

export function getEmoji(name: string, alternate: string | null = null): string {
    if (!emojiCache) {
        return `🟥`; // if emojis aren't initialized yet somehow
    }
    return emojiCache.get(name) || alternate || `:${name}:`;
}