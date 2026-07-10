import type { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";

export type AnimationAction = "idle" | "walk" | "run" | "aim" | "shoot" | "reload" | "dodge" | "hit" | "death";
const ALIASES: Record<AnimationAction, string[]> = {
  idle: ["idle", "stand", "breath"], walk: ["walk", "walking"], run: ["run", "running", "sprint"], aim: ["aim", "target"],
  shoot: ["shoot", "fire", "attack"], reload: ["reload", "recharge"], dodge: ["dodge", "roll", "evade"], hit: ["hit", "hurt", "damage"], death: ["death", "die", "dead"]
};

const normalise = (value: string): string => value.toLowerCase().replace(/[\s_.-]+/gu, "");

export class AnimationResolver {
  resolve(groups: readonly AnimationGroup[]): Partial<Record<AnimationAction, AnimationGroup>> {
    const result: Partial<Record<AnimationAction, AnimationGroup>> = {};
    for (const [action, aliases] of Object.entries(ALIASES) as [AnimationAction, string[]][]) {
      const found = groups.find((group) => aliases.some((alias) => normalise(group.name).includes(normalise(alias))));
      if (found) result[action] = found;
    }
    console.info("[AnimationResolver]", Object.fromEntries(Object.entries(result).map(([action, group]) => [action, group?.name])));
    return result;
  }
}
