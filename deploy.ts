import { config as configEnv } from 'dotenv';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { getAllCommands, registerCommands } from './helpers/fileManager.ts';
import type { SharedSlashCommand, SlashCommandBuilder } from 'discord.js';

configEnv({ quiet: true });

await registerCommands(import.meta.dirname);
const fullCommands = [...getAllCommands().values()];
const commands: Array<SlashCommandBuilder | SharedSlashCommand> = []

for (const cmd of fullCommands) {
    commands.push(cmd.data);
}

const rest = new REST().setToken(process.env.TOKEN as string);

try {
    console.log(`refreshing ${commands.length} commands...`);

    const data = await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID as string),
        { body: [...commands] },
    );

    console.log(`commands deployed!`);
} catch (error) {
    console.error(error);
}