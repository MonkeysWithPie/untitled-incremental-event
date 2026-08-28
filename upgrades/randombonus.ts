import type { Upgrade } from "../types.ts";

export const upgradeData: Upgrade = {
    name: "RandBits",
    id: "randombonus",
    description: "Gain 0 to 1 Bits per click.",
    effectString: (context, level) => {
        return `0 to ${level} Bits`
    },
    effect: (context, level) => {
        return {
            bits: Math.random() * level
        }
    },
    price: (level) => {
        return 8 * (level + 1) * (level/12 + 1)
    },
    visibility: (context) => {
        const morebitsLevel = context.upgrades.morebits || 0;
        if (morebitsLevel < 1) return "hide";
        if (morebitsLevel < 3) return `${morebitsLevel}/3 "More Bits!"`;
        return "show"
    },
    type: "upgrade",
}