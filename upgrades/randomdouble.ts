import type { Upgrade } from "../types.ts";

export const upgradeData: Upgrade = {
    name: "BitBit",
    id: "doublechance",
    description: "Chance to gain double bits per click.",
    effectString: (context, level) => {
        return `${(level * 5).toFixed(0)}% chance`
    },
    effect: (context, level) => {
        return {
            
        }
    },
    price: (level) => {
        if (level >= 19) return null;

        return level+1 ** 1.5 * 20;
    },
    visibility: (context) => {
        const multiBitsLevel = context.upgrades.multiply || 0;
        const moreBitsLevel = context.upgrades.morebits || 0;
        if (moreBitsLevel < 5) return "hide";
        if (multiBitsLevel < 2) return `${multiBitsLevel}/2 "MultiBits"`;
        return "show";
    },
    type: "upgrade",
    sort: 3,
}