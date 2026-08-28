import type { Upgrade } from "../types.ts";

export const upgradeData: Upgrade = {
    name: "MultiBits",
    id: "multiply",
    description: "Multiplies the amount of bits you gain.",
    effectString: (context, level) => {
        return `x${(level + 10 / 10).toFixed(1)} Bits`
    },
    effect: (context, level) => {
        return {
            bitMult: level + 10 / 10,
        }
    },
    price: (level) => {
        return level+1 ** 1.5 * 20;
    },
    visibility: (context) => {
        const moreBitsLevel = context.upgrades.morebits || 0;
        if (moreBitsLevel < 1) return "hide";
        if (moreBitsLevel < 5) return `${moreBitsLevel}/5 "More Bits!"`;
        return "show";
    },
    type: "upgrade",
}