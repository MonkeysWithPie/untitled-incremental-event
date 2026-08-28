import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, SlashCommandBuilder, TextDisplayBuilder, type BaseMessageOptionsWithPoll, type Interaction, type InteractionReplyOptions } from "discord.js";
import type { Command, UpgradeContext } from "../types.ts";
import { MessageFlags } from 'discord-api-types/v10';
import { database } from "../helpers/database.ts";
import { getUpgrade } from "../helpers/fileManager.ts";

export const commandData: Command = {
    name: "click",
    data: new SlashCommandBuilder()
        .setName("click")
        .setDescription("Click the button to earn Clicks and Bits."),
    async execute(interaction) {
        let resp: InteractionReplyOptions = await getResponse(interaction, false);
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

async function getResponse(interaction: Interaction, clicked = true): Promise<BaseMessageOptionsWithPoll> {
    const [player, ] = await database.Player.findOrCreate({ where: { userId: interaction.user.id }});

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("click:click")
                .setLabel("Click!")
                .setStyle(ButtonStyle.Primary)
        )
    
    if (!clicked) {
        return { components: [row] }
    }

    let context: UpgradeContext = {
        clicks: player.clicks,
        bits: player.bits,
    }
    let specials: { [name: string]: any } = {};
    let bitsToAdd = 1;
    let bitMult = 1;
    let clicksToAdd = 1;
    let clickMult = 1;

    for (const [name, level] of Object.entries(player.upgrades)) {
        const upgrade = getUpgrade(name);

        const effect = upgrade.effect(context, level);

        if (effect.bits) {
            bitsToAdd += effect.bits;
        }
        if (effect.clicks) {
            clicksToAdd += effect.clicks;
        }
        if (effect.bitMult) {
            bitMult *= effect.bitMult;
        }
        if (effect.clickMult) {
            clickMult *= effect.clickMult;
        }

        if (effect.specials) {
            for (const [key, value] of Object.entries(effect.specials)) {
                specials[key] = value;
            }
        }
    }

    const bitsAdded = bitsToAdd * bitMult;
    const clicksAdded = clicksToAdd * clickMult;
    
    player.bits += bitsAdded;
    player.clicks += clicksAdded;
    await player.save();

    const container = new ContainerBuilder()
        .setAccentColor(0x5c97f7)
    
    const text = new TextDisplayBuilder()
        .setContent(`You have ${player.clicks.toFixed(2)} Clicks. (+${clicksAdded.toFixed(2)})\nYou have ${player.bits.toFixed(2)} Bits. (+${bitsAdded.toFixed(2)})`)
    

    container.addTextDisplayComponents(text);

    return { components: [container, row] }
}