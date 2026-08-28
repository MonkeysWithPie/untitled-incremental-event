import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, SlashCommandBuilder, TextDisplayBuilder, type BaseMessageOptionsWithPoll, type Interaction, type InteractionReplyOptions } from "discord.js";
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
    const resp = await getResponse(interaction);
    await interaction.update(resp);
})

async function getResponse(interaction: Interaction, clicked = true): Promise<BaseMessageOptionsWithPoll> {
    const [player, ] = await database.Player.findOrCreate({ where: { userId: interaction.user.id }});

    // add a random number to prevent customId being the same
    // (note this solution isn't perfect, but we can maybe catch the error and reward the 1 in 1m later?)
    const clickButton = () => new ButtonBuilder()
        .setCustomId(`click:click:${Math.floor(Math.random() * 1000000)}`)
        .setLabel("Click!")
        .setStyle(ButtonStyle.Primary)
    const fillerButton = () => new ButtonBuilder()
        .setCustomId(`click:filler:${Math.floor(Math.random() * 1000000)}`)
        .setLabel("XXX")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    
    if (!clicked) {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(clickButton())
        return { components: [row] }
    }

    let context: UpgradeContext = {
        clicks: player.clicks,
        bits: player.bits,
    }
    let effects = {
        specials: {},
        bits: 1,
        clicks: 1,
        bitMult: 1,
        clickMult: 1,
        globalClicks: 0,
    }
    let specials: { [key: string]: any } = {}

    for (const [name, level] of Object.entries(player.upgrades)) {
        const upgrade = getUpgrade(name);

        const effect = upgrade.effect(context, level);

        if (effect.bits) {
            effects.bits += effect.bits;
        }
        if (effect.clicks) {
            effects.clicks += effect.clicks;
        }
        if (effect.bitMult) {
            effects.bitMult *= effect.bitMult;
        }
        if (effect.clickMult) {
            effects.clickMult *= effect.clickMult;
        }
        if (effect.globalClicks) {
            effects.globalClicks += effect.globalClicks;
        }

        if (effect.specials) {
            for (const [key, value] of Object.entries(effect.specials)) {
                specials[key] = value;
            }
        }
    }

    const bitsAdded = effects.bits * effects.bitMult;
    const clicksAdded = effects.clicks * effects.clickMult;
    
    player.bits += bitsAdded;
    player.clicks += clicksAdded;
    await player.save();

    if (effects.globalClicks > 0) {
        const [global, ] = await database.Player.findOrCreate({ where: { userId: "global" }});
        global.clicks += effects.globalClicks;
        await global.save();
    }

    const row = new ActionRowBuilder<ButtonBuilder>();
    const rowWidth = specials.rowWidth || 1;
    const buttonSpot = Math.floor(Math.random() * rowWidth);
    for (let i = 0; i < rowWidth; i++) {
        if (i === buttonSpot) {
            row.addComponents(clickButton());
        } else {
            row.addComponents(fillerButton());
        }
    }

    const container = new ContainerBuilder()
        .setAccentColor(0x5c97f7)
    
    const globalClicks = await database.Player.sum("clicks");

    container.addTextDisplayComponents(new TextDisplayBuilder()
        .setContent(`### ${globalClicks.toFixed(2)} CLICKS (+${(clicksAdded + effects.globalClicks).toFixed(2)})\nNext reward: TODO write the code for this`)
    ).addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

    const text = new TextDisplayBuilder()
        .setContent(`You have ${player.clicks.toFixed(2)} Clicks. (+${clicksAdded.toFixed(2)})\nYou have ${player.bits.toFixed(2)} Bits. (+${bitsAdded.toFixed(2)})`)

    container.addTextDisplayComponents(text);

    const components: any[] = [container];

    if (Object.keys(player.upgrades).length <= 0 && player.clicks > 10) {
        const upgradeTipContainer = new ContainerBuilder()
            .setAccentColor(0x82edda)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`### Tip\nYou are able to afford upgrades! Use /upgrade to view and purchase them.`)
            )
        components.push(upgradeTipContainer);
    }

    components.push(row);

    return { components }
}