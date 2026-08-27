import { SlashCommandBuilder } from "@discordjs/builders";
import type { Command } from "../types.ts";
import { MessageFlags } from 'discord-api-types/v10';

export const commandData: Command = {
    name: "ping",
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Get the latency of the bot."),
    async execute(interaction) {
        let output = "**Pong!**";
        output += `\nWS Latency: ${interaction.client.ws.ping}ms | Roundtrip Latency: (waiting...)`;
        output += `\nUptime: ${formatTime(Math.floor(interaction.client.uptime / 1000))}`;

        const now = Date.now()
        await interaction.reply({ content: output, flags: MessageFlags.Ephemeral })
        output.replace("(waiting...)", `${Date.now() - now}ms`);
        await interaction.editReply({ content: output });
    },
}

function formatTime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hrs = Math.floor(seconds / 3600);
    seconds %= 3600;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const timeStr = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    if (days > 0) {
        return `${days}d ${timeStr}`;
    }
    return timeStr;
}