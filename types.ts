import { SharedSlashCommand } from '@discordjs/builders';
import { AutocompleteInteraction, ButtonInteraction, ChatInputCommandInteraction, ModalSubmitInteraction, StringSelectMenuInteraction } from 'discord.js';

type CommandExecute<T> = (interaction: T, ...args: string[]) => Promise<void>;

export interface ClientEvent {
    name: string;
    once?: boolean;
    execute: (...args: any[]) => Promise<void>;
}

export interface Command {
    name: string;
    data: SharedSlashCommand;
    execute: CommandExecute<ChatInputCommandInteraction>;
    buttons?: Map<string, CommandExecute<ButtonInteraction>>;
    dropdowns?: Map<string, CommandExecute<StringSelectMenuInteraction>>;
    modals?: Map<string, CommandExecute<ModalSubmitInteraction>>;
    autocomplete?: CommandExecute<AutocompleteInteraction>;
}