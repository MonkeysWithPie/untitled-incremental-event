import { Client, Events } from "discord.js";
import type { ClientEvent } from "../types.ts";
import { initEmojis } from "../helpers/emojis.ts";

async function execute(client: Client) {
    await initEmojis(client);
}

export const eventData: ClientEvent = {
    name: Events.ClientReady,
    execute,
    once: false,
}