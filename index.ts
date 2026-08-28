import { Client } from 'discord.js';
import { config as configEnv } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import type { ClientEvent } from './types.ts';
import { pathToFileURL } from 'node:url';
import { registerCommands } from './helpers/fileManager.ts';

configEnv({ quiet: true });

const token = process.env.TOKEN;
const client = new Client({ intents: [] });

const eventsPath = path.join(import.meta.dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = (await import(pathToFileURL(filePath).href)).eventData as ClientEvent;
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

registerCommands(import.meta.dirname)

client.login(token).then(() => {
    console.log(`logged in! ${client.user?.tag}`)
});