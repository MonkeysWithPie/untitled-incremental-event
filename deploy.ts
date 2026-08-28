import { config as configEnv } from 'dotenv';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { getAllCommands, registerFiles } from './helpers/fileManager.ts';
import type { SharedSlashCommand, SlashCommandBuilder } from 'discord.js';
import { database } from './helpers/database.ts';

configEnv({ quiet: true });

await registerFiles(import.meta.dirname);
const fullCommands = [...getAllCommands().values()];
const commands: Array<SlashCommandBuilder | SharedSlashCommand> = []

for (const cmd of fullCommands) {
    commands.push(cmd.data);
}

const rest = new REST().setToken(process.env.TOKEN as string);

try {
    console.log(`refreshing ${commands.length} commands...`);

    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID as string),
        { body: [...commands] },
    );

    console.log("commands deployed!");
} catch (error) {
    console.error("command error:", error);
}

database.sequelize.sync().then(() => {
    console.log("db synced!");
}).catch((err: any) => {
    console.error("db error:", err);
}).finally(() => {
    database.sequelize.close();
})