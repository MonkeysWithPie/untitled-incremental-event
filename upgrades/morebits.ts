import type { Upgrade } from "../types.ts";

export const upgradeData: Upgrade = {
    name: "More Bits!",
    id: "morebits",
    description: "Gain more Bits per click.",
    effectString: (context, level) => {
        return `+${level} Bits`
    },
    effect: (context, level) => {
        return {
            bits: level,
        }
    },
    price: (level) => {
        return 10 * (level + 1) * (level/10 + 1) * (level/30 + 1);
    },
    visibility: (context) => {
        return "show"
    },
    type: "upgrade",
    sort: 0,
}