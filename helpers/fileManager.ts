import { InteractionContextType } from 'discord-api-types/v10';
import type { Command } from '../types.ts';
import { readdirSync } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

let commands = new Map<string, Command>();

export function getCommand(name: string): Command {
    const cmd = commands.get(name);
    if (!cmd) {
        throw new Error(`command ${name} not properly registered or doesn't exist!`);
    }
    return cmd;
}

export function getAllCommands(): Map<string, Command> {
    return commands;
}

export async function registerCommands(basePath: string) {
    const commandPath = path.join(basePath, 'commands');
    const commandFiles = readdirSync(commandPath).filter(file => file.endsWith('.ts'));

    for (const file of commandFiles) {
        const fullPath = path.join(commandPath, file);
        const fileUrl = pathToFileURL(fullPath).href;
        const commandModule = await import(fileUrl)

        let command: Command = commandModule.commandData;

        // allow all contexts, since most (if not all) responses will be ephemeral
        command.data.setContexts(
            InteractionContextType.BotDM,
            InteractionContextType.Guild,
            InteractionContextType.PrivateChannel
        );

        commands.set(command.name, command);
    }
}