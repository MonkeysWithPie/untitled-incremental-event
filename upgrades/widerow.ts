import type { Upgrade } from "../types.ts";

export const upgradeData: Upgrade = {
    name: "More Buttons",
    id: "widerow",
    description: "Gain x1.1 Clicks. Adds one button.",
    effectString: (context, level) => {
        return `${(level/10 + 1).toFixed(1)}x Clicks, ${1 + level} buttons`
    },
    effect: (context, level) => {
        return {
            specials: {
                rowWidth: 1 + level
            },
            clickMultiplier: level/10 + 1
        }
    },
    price: (level) => {
        if (level > 4) return null;
        return 25 * (level + 1)
    },
    visibility: (context) => {
        return "show"
    },
    type: "perk",
}