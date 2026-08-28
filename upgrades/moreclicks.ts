import type { Upgrade } from "../types.ts";

export const upgradeData: Upgrade = {
    name: "A Smidge More",
    id: "moreclicks",
    description: "Gain 0.02 more Clicks per click.",
    effectString: (context, level) => {
        return `${(level * 0.02).toFixed(2)} Clicks`
    },
    effect: (context, level) => {
        return {
            clicks: level * 0.02
        }
    },
    price: (level) => {
        return 10 * Math.pow(1.5, level)
    },
    visibility: (context) => {
        return "show"
    },
    type: "upgrade",
    sort: 0,
}