import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, SlashCommandBuilder, TextDisplayBuilder, type BaseMessageOptionsWithPoll, type Interaction, type InteractionReplyOptions } from "discord.js";
import type { Command } from "../types.ts";
import { MessageFlags } from 'discord-api-types/v10';
import { database } from "../helpers/database.ts";

export const commandData: Command = {
    name: "click",
    data: new SlashCommandBuilder()
        .setName("click")
        .setDescription("Click the button to earn Clicks and Bits."),
    async execute(interaction) {
        let resp: InteractionReplyOptions = await getResponse(interaction);
        resp.flags = MessageFlags.IsComponentsV2;
        await interaction.reply(resp);
    },
    buttons: new Map()
}

commandData.buttons!.set("click", async (interaction) => {
    const [player, ] = await database.Player.findOrCreate({ where: { userId: interaction.user.id }});
    
    player.clicks += 1;
    player.bits += 1;

    await player.save();
    await interaction.update(await getResponse(interaction));
})

async function getResponse(interaction: Interaction): Promise<BaseMessageOptionsWithPoll> {
    const [player, ] = await database.Player.findOrCreate({ where: { userId: interaction.user.id }});

    const container = new ContainerBuilder()
        .setAccentColor(0x5c97f7)
    
    const text = new TextDisplayBuilder()
        .setContent(`You have ${player.clicks} Clicks.`)
    
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("click:click")
                .setLabel("Click!")
                .setStyle(ButtonStyle.Primary)
        )

    container.addTextDisplayComponents(text);

    return { components: [container, row] }
}