import { SharedSlashCommand } from '@discordjs/builders';
import { AutocompleteInteraction, ButtonInteraction, ChatInputCommandInteraction, ModalSubmitInteraction, StringSelectMenuInteraction, type Interaction } from 'discord.js';

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

export interface UpgradeContext {
    clicks: number;
    bits: number;
}

export interface UpgradeShopContext extends UpgradeContext {
    upgrades: { [name: string]: number };
}

export interface UpgradeEffect {
    clicks?: number;
    clickMult?: number;
    globalClicks?: number;

    bits?: number;
    bitMult?: number;
    
    specials?: { [name: string]: any };
}

export interface Upgrade {
    name: string;
    id: string;
    description: string;
    effectString: (context: UpgradeContext, level: number) => string;
    effect: (context: UpgradeContext, level: number) => UpgradeEffect;
    price: (level: number) => number | null;
    visibility: (context: UpgradeShopContext) => "show" | "hide" | string;
    type: "upgrade" | "perk" | "focus";
}