import { SeparatorBuilder, SlashCommandBuilder } from "@discordjs/builders";
import type { Command, UpgradeShopContext } from "../types.ts";
import { MessageFlags, SeparatorSpacingSize } from 'discord-api-types/v10';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, SectionBuilder, TextDisplayBuilder, type BaseMessageOptionsWithPoll, type Interaction, type InteractionReplyOptions } from "discord.js";
import { database } from "../helpers/database.ts";
import { getAllUpgrades, getUpgrade } from "../helpers/fileManager.ts";

export const commandData: Command = {
    name: "upgrade",
    data: new SlashCommandBuilder()
        .setName("upgrade")
        .setDescription("Buy some sweet upgrades to make your clicking better."),
    async execute(interaction) {
        let resp: InteractionReplyOptions = await getResponse(interaction, "upgrade");
        resp.flags = MessageFlags.IsComponentsV2;
        await interaction.reply(resp);
    },
    buttons: new Map()
}

commandData.buttons!.set("category", async (interaction, category) => {
    await interaction.update(await getResponse(interaction, category));
})

commandData.buttons!.set("buy", async (interaction, upgradeId) => {
    const [player, ] = await database.Player.findOrCreate({ where: { userId: interaction.user.id }});

    const upgrade = getUpgrade(upgradeId);
    const price = upgrade.price(player.upgrades[upgrade.id] || 0);
    
    if (price === null || price > player.bits) {
        await interaction.reply({ content: "You can't afford that!", flags: MessageFlags.Ephemeral });
        return;
    }

    player.bits -= price;
    player.upgrades[upgrade.id] = (player.upgrades[upgrade.id] || 0) + 1;
    player.changed("upgrades", true);

    await player.save();
    await interaction.update(await getResponse(interaction, upgrade.type));

    await interaction.followUp({ content: `You bought ${upgrade.name} Level ${player.upgrades[upgrade.id]} for ${price.toFixed(2)} Bits!`, flags: MessageFlags.Ephemeral });
})

commandData.buttons!.set("bitcounter", async (interaction, tab) => {
    await interaction.update(await getResponse(interaction, tab));
})

async function getResponse(interaction: Interaction, tab: string): Promise<BaseMessageOptionsWithPoll> {
    const [player, ] = await database.Player.findOrCreate({ where: { userId: interaction.user.id }});
    
    const context: UpgradeShopContext = {
        clicks: player.clicks,
        bits: player.bits,
        upgrades: player.upgrades,
    }

    const container = new ContainerBuilder()
        .setAccentColor(0x00FF00)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`### Upgrades`)
        );
    
    const sections: SectionBuilder[] = [];

    for (const upgrade of getAllUpgrades()) {
        if (upgrade.type !== tab) continue;
        const vis = upgrade.visibility(context);
        if (vis === "hide") continue;

        const section = new SectionBuilder()

        if (vis !== "show") {
            section.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`🔒 Locked! ${vis}`)
            ).setButtonAccessory(
                new ButtonBuilder()
                    .setCustomId(`upgrade:buy:${upgrade.id}`)
                    .setLabel(`Buy`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true)
            )

            sections.push(section);
            continue;
        }

        const level = player.upgrades[upgrade.id] || 0;
        const price = upgrade.price(level);
        const effectString = upgrade.effectString(context, level);
        const nextEffectString = upgrade.effectString(context, level + 1);

        if (price === null) {
            section.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**${upgrade.name}** Level ${level}\n${upgrade.description}\n${effectString}`)
            ).setButtonAccessory(
                new ButtonBuilder()
                    .setCustomId(`upgrade:buy:${upgrade.id}`)
                    .setLabel(`MAX!`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true)
            )
        } else {
            section.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**${upgrade.name}** Level ${level}\n${upgrade.description}\nCurrently **${effectString}**\nUpgradeable to ${nextEffectString} for **${price.toFixed(2)} Bits**`)
            ).setButtonAccessory(
                new ButtonBuilder()
                    .setCustomId(`upgrade:buy:${upgrade.id}`)
                    .setLabel(`Buy`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(player.bits < price)
            )
        }

        sections.push(section);
    }

    for (let i = 0; i < sections.length; i++) {
        container.addSectionComponents(sections[i]);
        if (i !== sections.length - 1) container.addSeparatorComponents(
            new SeparatorBuilder()
                .setDivider(true)
                .setSpacing(SeparatorSpacingSize.Small)
        )
    }

    const categoryRow = new ActionRowBuilder<ButtonBuilder>()

    categoryRow.addComponents(
        new ButtonBuilder()
            .setCustomId(`upgrade:bitcounter:${tab}`)
            .setLabel(`${player.bits.toFixed(2)} Bits`)
            .setStyle(ButtonStyle.Secondary)
    )

    const categories = {"upgrade": "Upgrades", "perk": "Perks", "focus": "Focuses" }

    for (const [type, text] of Object.entries(categories)) {
        categoryRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`upgrade:category:${type}`)
                .setLabel(text)
                .setStyle(type === tab ? ButtonStyle.Success : ButtonStyle.Primary)
        )
    }

    return { components: [categoryRow, container] };
}