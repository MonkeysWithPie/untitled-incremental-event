import { InteractionContextType } from 'discord-api-types/v10';
import type { Command, Upgrade } from '../types.ts';
import { readdirSync } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

let commands = new Map<string, Command>();
let upgrades = new Map<string, Upgrade>();

export function getCommand(name: string): Command {
    const cmd = commands.get(name);
    if (!cmd) {
        throw new Error(`command ${name} not properly registered or doesn't exist!`);
    }
    return cmd;
}

export function getUpgrade(name: string): Upgrade {
    const upgrade = upgrades.get(name);
    if (!upgrade) {
        throw new Error(`upgrade ${name} not properly registered or doesn't exist!`);
    }
    return upgrade;
}

export function getAllCommands() {
    return commands;
}

export function getAllUpgrades() {
    const arr = upgrades.values().toArray();
    arr.sort((a, b) => a.sort - b.sort);
    return arr;
}

export async function registerFiles(basePath: string) {
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

    const upgradePath = path.join(basePath, 'upgrades');
    const upgradeFiles = readdirSync(upgradePath).filter(file => file.endsWith('.ts'));

    for (const file of upgradeFiles) {
        const fullPath = path.join(upgradePath, file);
        const fileUrl = pathToFileURL(fullPath).href;
        const upgradeModule = await import(fileUrl);
        
        const upgrade: Upgrade = upgradeModule.upgradeData;

        upgrades.set(upgrade.id, upgrade);
    }
}