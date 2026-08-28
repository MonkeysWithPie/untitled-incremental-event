import type { Upgrade } from "../types.ts";

export const upgradeData: Upgrade = {
    name: "Charity",
    id: "globalclicks",
    description: "15% chance to add 1 Click to the global counter (not yours) per click.",
    effectString: (context, level) => {
        return `${(level * 15).toFixed(0)}% chance`
    },
    effect: (context, level) => {
        if (Math.random() < level * 0.15) {
            return {
                globalClicks: 1
            }
        }
        return {}
    },
    price: (level) => {
        if (level > 2) return null;
        return 100 * Math.pow(2, level)
    },
    visibility: (context) => {
        const moreclicksLevel = context.upgrades.moreclicks || 0;
        if (moreclicksLevel < 1) return "hide";
        if (moreclicksLevel < 3) return `${moreclicksLevel}/3 "A Smidge More"`;
        return "show"
    },
    type: "perk",
}