import { Events } from "discord.js";
import type { Interaction, InteractionReplyOptions } from "discord.js";
import type { ClientEvent } from "../types.ts";
import { MessageFlags } from "discord-api-types/v10";
import { DiscordAPIError } from "@discordjs/rest";
import { getCommand } from "../helpers/fileManager.ts";

async function execute(interaction: Interaction) {
    try {
        if (interaction.isChatInputCommand()) {
            const command = getCommand(interaction.commandName);

            await command.execute(interaction);
            return
        }
        if (interaction.isAutocomplete()) {
            const command = getCommand(interaction.commandName);
            
            if (!command.autocomplete) {
                throw new Error(`command ${interaction.commandName} has no autocomplete handler`);
            }

            await command.autocomplete(interaction);
            return
        }

        // appease the typescript gods (these will never happen)
        if (interaction.isContextMenuCommand() || interaction.isPrimaryEntryPointCommand()) { return; }

        if (interaction.message && interaction.message.interactionMetadata) {
            if (interaction.message.interactionMetadata.user.id !== interaction.user.id) {
                await interaction.reply({ content: "Not for you!", flags: MessageFlags.Ephemeral });
                return;
            }
        }

        // custom ids are formatted like this: `commandName:actionId:param1,param2,param3`
        const commandName = interaction.customId.split(':')[0];
        const actionId = interaction.customId.split(':')[1];
        let params = interaction.customId.split(':')[2]?.split(",");
        if (!params) params = [];

        const command = getCommand(commandName);

        if (interaction.isButton()) {
            const button = command.buttons?.get(actionId);
            if (!button) {
                throw new Error(`button ${actionId} not found in command ${commandName}`);
            }

            await button(interaction, ...params);
        }
        else if (interaction.isModalSubmit()) {
            const modal = command.modals?.get(actionId);
            if (!modal) {
                throw new Error(`modal ${actionId} not found in command ${commandName}`);
            }
            
            await modal(interaction);
        }
        else if (interaction.isStringSelectMenu()) {
            const menu = command.dropdowns?.get(actionId);
            if (!menu) {
                throw new Error(`dropdown ${actionId} not found in command ${commandName}`);
            }

            await menu(interaction);
        }
        else if (interaction.isAutocomplete()) {
        }
        else {
            console.log(`unknown interaction type: ${interaction.type}`);
        }
    } catch (error: any) {
        if (error instanceof DiscordAPIError && (error.code === 10062 || error.code === 10008)) {
            console.log(`hit an unknown interaction/message error`)
            return;
        }

        console.error(
`interaction failed! ${error}
interaction data: ${interaction.toJSON()}
stack trace: ${error instanceof Error ? error.stack : 'N/A'}`);

        if (interaction.isRepliable()) {
            const reply: InteractionReplyOptions = { content: 'something went wrong while trying to do this!', flags: MessageFlags.Ephemeral }
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    }
}

export const eventData: ClientEvent = {
    name: Events.InteractionCreate,
    execute,
    once: false,
}