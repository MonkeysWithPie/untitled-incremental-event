import type { Upgrade } from "../types.ts";

export const upgradeData: Upgrade = {
    name: "RepitiBits",
    id: "clickbits",
    description: "Gain extra Bits for every 200 Clicks, per click.",
    effectString: (context, level) => {
        return `+${(context.clicks * level / 200).toFixed(2)} Bits`
    },
    effect: (context, level) => {
        return {
            bits: context.clicks * level / 200,
        }
    },
    price: (level) => {
        return 2.5 ** level * 25;
    },
    visibility: (context) => {
        if (context.clicks < 20) return "hide";
        if (context.clicks < 100) return `${context.clicks.toFixed(2)}/100.00 Clicks`;
        return "show";
    },
    type: "upgrade",
    sort: 4,
}