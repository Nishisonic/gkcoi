import { Ship, Item, AirState, AirPower, Apidata } from "./type";
import { Lang } from "./lang";
import getAACIRate from "aaci-prop";

const RECON_PLANE = [9, 10, 41, 49, 94];

export async function fetchLangData(lang: Lang): Promise<{
  ships: {
    [key: string]:
    | string
    | {
      [key: string]: string;
    };
    suffixes: {
      [key: string]: string;
    };
  };
  items: {
    [key: string]: string;
  };
}> {
  const URL = "https://cdn.jsdelivr.net/gh/KC3Kai/kc3-translations/data";
  const shipsUrl = `${URL}/${lang}/ships.json`;
  const shipAffixUrl = `${URL}/${lang}/ship_affix.json`;
  const itemsUrl = `${URL}/${lang}/items.json`;
  const ships = await fetch(shipsUrl).then((res) => res.json());
  const shipAffix = await fetch(shipAffixUrl).then((res) => res.json());
  const items = await fetch(itemsUrl).then((res) => res.json());
  return { ships: Object.assign(ships, shipAffix), items };
}

export function toTranslateShipName(
  name: string,
  langData: {
    suffixes: { [key: string]: string };
    [key: string]: string | { [key: string]: string };
  } | null
): string {
  if (langData && langData.suffixes) {
    const suffix = Object.keys(langData.suffixes)
      .sort((a, b) => b.length - a.length)
      .reduce((p, suffix) => {
        if (name.includes(suffix)) {
          name = name.replace(suffix, "");
          p += langData.suffixes[suffix];
        }
        return p;
      }, "");
    if (langData[name]) {
      return langData[name] + suffix;
    }
  }
  return name;
}

export function toTranslateEquipmentName(
  name: string,
  langData: {
    [key: string]: string;
  } | null
): string {
  if (langData && langData[name]) {
    return langData[name];
  }
  return name;
}

export function getLoSValue(ships: Ship[], hqLv: number, cn: number): number {
  const itemBonus = (ship: Ship): number => {
    const items = ship.items.filter((item) => item.id > 0);
    const itemLoS = items.map((item) => item.los).reduce((p, v) => p + v, 0);

    return itemLoS;
  };

  return (
    ships
      .filter((ship) => ship.id > 0)
      .map((ship) => {
        return (
          ship.items
            .filter(({ id }) => id > 0)
            .map(({ type, los, lv }) => {
              switch (type[2]) {
                case 8: // 艦上攻撃機
                  return 0.8 * los;
                case 9: // 艦上偵察機
                case 94: // 艦上偵察機(II)
                  return 1.0 * (los + 1.2 * Math.sqrt(lv));
                case 10: // 水上偵察機
                  return 1.2 * (los + 1.2 * Math.sqrt(lv));
                case 11: // 水上爆撃機
                  return 1.1 * (los + 1.15 * Math.sqrt(lv));
                case 12: // 小型電探
                  return 0.6 * (los + 1.25 * Math.sqrt(lv));
                case 13: // 大型電探
                case 93: // 大型電探(II)
                  return 0.6 * (los + 1.4 * Math.sqrt(lv));
                default:
                  // その他
                  return 0.6 * los;
              }
            })
            .reduce((p, v) => p + v, 0) *
          cn + Math.sqrt(ship.los - itemBonus(ship))
        );
      })
      .reduce((p, v) => p + v, 0) -
    Math.ceil(0.4 * hqLv) +
    2 * (6 - ships.filter((ship) => ship.id > 0).length)
  );
}

const SKILLED_BONUS_LIST: {
  [key: number]: number[];
} = {
  /** その他 */
  9999: [0, 0, 0, 0, 0, 0, 0, 0],
  /** 艦上戦闘機/夜間戦闘機 */
  6: [0, 0, 2, 5, 9, 14, 14, 22],
  /** 艦上爆撃機/夜間爆撃機 */
  7: [0, 0, 0, 0, 0, 0, 0, 0],
  /** 艦上攻撃機/夜間攻撃機 */
  8: [0, 0, 0, 0, 0, 0, 0, 0],
  /** 水上爆撃機 */
  11: [0, 0, 1, 1, 1, 3, 3, 6],
  // /** オートジャイロ */  st1に参加するが制空計算寄与なし
  // 25: [0, 0, 0, 0, 0, 0, 0, 0],
  // /** 対潜哨戒機 */      st1に参加するが制空計算寄与なし
  // 26: [0, 0, 0, 0, 0, 0, 0, 0],
  /** 水上戦闘機 */
  45: [0, 0, 2, 5, 9, 14, 14, 22],
  /** 局地戦闘機 */
  48: [0, 0, 2, 5, 9, 14, 14, 22],
  /** 噴式戦闘機 */
  56: [0, 0, 2, 5, 9, 14, 14, 22],
  /** 噴式戦闘爆撃機 */
  57: [0, 0, 0, 0, 0, 0, 0, 0],
  /** 噴式攻撃機 */
  58: [0, 0, 0, 0, 0, 0, 0, 0],
};

const SPECIAL_SKILLED_BONUS_LIST: {
  [key: number]: number[];
} = {
  /** 一式戦 隼II型改(20戦隊) */
  489: [0, 0, 2, 5, 9, 14, 14, 22],
  /** 一式戦 隼III型改(熟練/20戦隊) */
  491: [0, 0, 2, 5, 9, 14, 14, 22],
};

const SKILLED_BONUS = {
  MIN: [0, 10, 25, 40, 55, 70, 85, 100],
  MAX: [9, 24, 39, 54, 69, 84, 99, 120],
};

function getImprovementBonus(item: Item): number {
  const fighterBomber = [
    60, // 零式艦戦62型(爆戦)
    154, // 零戦62型(爆戦/岩井隊)
    219, // 零式艦戦63型(爆戦)
    447, // 零式艦戦64型(複座KMX搭載機)
  ];

  if (item.lv > 0) {
    switch (item.type[2]) {
      case 6: // 艦上戦闘機
      case 45: // 夜間戦闘機
        return 0.2 * item.lv;
      case 7: // 艦上爆撃機
      case 57: // 噴式戦闘爆撃機
        return fighterBomber.includes(item.id) ? 0.25 * item.lv : 0;
      case 47: // 陸上攻撃機
        return 0.5 * Math.sqrt(item.lv);
      case 49: // 陸上偵察機
        return 1; // 暫定
    }
  }
  return 0;
}

export function getAirPower(items: Item[], slots: number[]): AirPower {
  return items
    .map((item, i) => {
      if (slots[i] > 0 && item) {
        const appliedSKilledBonus: number[] | undefined =
          SPECIAL_SKILLED_BONUS_LIST[item.id] ||
          SKILLED_BONUS_LIST[item.type[2]];
        if (appliedSKilledBonus !== undefined) {
          const bonus =
            appliedSKilledBonus[7] +
            Math.sqrt(slots[i]) * (item.aa + getImprovementBonus(item));
          return {
            min: Math.floor(bonus + Math.sqrt(SKILLED_BONUS.MIN[7] / 10)),
            max: Math.floor(bonus + Math.sqrt(SKILLED_BONUS.MAX[7] / 10)),
          };
        }
      }
      return { min: 0, max: 0 };
    })
    .map(({ min, max }) => ({
      min: Math.floor(min),
      max: Math.floor(max),
    }))
    .reduce(
      (p, v) => {
        p.min += v.min;
        p.max += v.max;
        return p;
      },
      {
        min: 0,
        max: 0,
      }
    );
}

export function getAirbaseAirPower(
  items: Item[],
  airDefense = false,
  highAltitude = false,
  rocket = 0
): AirPower {
  const slot = (item: Item): 4 | 9 | 18 =>
    RECON_PLANE.includes(item.type[2]) ? 4 : item.type[2] === 53 ? 9 : 18;

  const { min, max } = items
    .map((item) => {
      if (item && item.type[4] > 0) {
        const bonus =
          (SPECIAL_SKILLED_BONUS_LIST[item.id] ||
            SKILLED_BONUS_LIST[item.type[2]] ||
            SKILLED_BONUS_LIST[9999])[7] +
          Math.sqrt(slot(item)) *
          (item.aa +
            (item.type[2] === 48
              ? airDefense
                ? item.evasion + 2 * item.accuracy
                : 1.5 * item.evasion
              : 0) +
            getImprovementBonus(item));
        return {
          // 311: 二式陸上偵察機
          // 312: 二式陸上偵察機(熟練)
          min: Math.floor(
            bonus +
            Math.sqrt(
              SKILLED_BONUS.MIN[
              item.id === 311 ? 0 : item.id === 312 ? 2 : 7
              ] / 10
            )
          ),
          max: Math.floor(
            bonus +
            Math.sqrt(
              SKILLED_BONUS.MIN[
              item.id === 311 ? 0 : item.id === 312 ? 2 : 7
              ] / 10
            )
          ),
        };
      }
      return { min: 0, max: 0 };
    })
    .map(({ min, max }) => ({
      min: Math.floor(min),
      max: Math.floor(max),
    }))
    .reduce(
      (p, v) => {
        p.min += v.min;
        p.max += v.max;
        return p;
      },
      {
        min: 0,
        max: 0,
      }
    );

  const reconBonus = Math.max(
    ...items.map((item) => {
      switch (item.type[2]) {
        case 9: // 艦上偵察機
          if (item.los >= 9) return 1.3;
          if (item.los >= 8) return 1.25; // 仮
          if (item.los <= 7) return 1.2;
        case 10: // 水上偵察機
        case 41: // 大型飛行艇
          if (item.los >= 9) return 1.16;
          if (item.los >= 8) return 1.13;
          if (item.los <= 7) return 1.1;
        case 49: // 陸上偵察機
          if (item.los >= 9) return 1.23;
          if (item.los >= 8) return 1.18;
          if (item.los <= 7) return 1.13; // 仮
      }
      return 1;
    })
  );

  const rocketBonus = [0.5, 0.8, 1.1, 1.2][rocket] || 1.2;

  if (airDefense) {
    if (highAltitude) {
      return {
        min: min * reconBonus * rocketBonus,
        max: max * reconBonus * rocketBonus,
      };
    }
    return {
      min: Math.floor(min * reconBonus),
      max: Math.floor(max * reconBonus),
    };
  }

  const landBasedReconBonus = Math.max(
    ...items.map((item) => {
      switch (item.id) {
        case 311: // 二式陸上偵察機
          return 1.15;
        case 312: // 二式陸上偵察機(熟練)
          return 1.18;
      }
      return 1;
    })
  );
  return {
    min: Math.floor(min * landBasedReconBonus),
    max: Math.floor(max * landBasedReconBonus),
  };
}

export function toAirPowerString(power: AirPower): string {
  return power.min === power.max
    ? `${power.min}`
    : `${power.min} ~ ${power.max}`;
}

export function getDistance(items: Item[]): number {
  const planes = items.filter(({ type }) => type[4] > 0);
  if (planes.length === 0) return 0; // Infinity対策
  const min = Math.min(...planes.map(({ distance }) => distance));
  const reconMax = Math.max(
    ...planes
      .filter(({ type }) => RECON_PLANE.includes(type[2]))
      .map(({ distance }) => distance)
  );
  if (reconMax > 0) {
    return (
      min + Math.min(Math.round(Math.sqrt(Math.max(reconMax - min, 0))), 3)
    );
  }
  return min;
}

export function getContactValue(
  ships: Ship[],
  airState: AirState
): { bonus: number; rate: number }[] {
  const planes = [8, ...RECON_PLANE];
  const AIR_STATE = {
    "AS+": 3,
    AS: 2,
    AP: 1,
  };
  const airStateValue: number = AIR_STATE[airState];
  const touchStart = Math.min(
    1,
    ships
      .map(({ slots, items }) =>
        items
          .map((item, i) => {
            if (
              slots.length > i &&
              slots[i] > 0 &&
              planes.includes(item.type[2])
            ) {
              return Math.floor(item.los * Math.sqrt(slots[i]));
            }
            return 0;
          })
          .reduce((p, v) => p + v, 0)
      )
      .reduce((p, v) => p + v, 1) /
    (70 - 15 * airStateValue)
  );

  const touchSelect = (mag: number): number => {
    return (
      1 -
      ships
        .map(({ slots, items }) =>
          items.map((item, i) => {
            const lvBonus = (item: Item): number => {
              switch (item.id) {
                case 25: // 零式水上偵察機
                  return 0.14;
                case 59: // 零式水上観測機
                  return 0.2;
                case 102: // 九八式水上偵察機(夜偵)
                  return 0.1;
                case 163: // Ro.43水偵
                  return 0.14;
                case 304: // S9 Osprey
                  return 0.14;
                case 61: // 二式艦上偵察機
                  return 0.3;
                case 151: // 試製景雲(艦偵型)
                  return 0.4;
              }
              return 0;
            };

            if (
              slots.length > i &&
              slots[i] > 0 &&
              planes.includes(item.type[2]) &&
              ((mag === 1.2 && item.accuracy >= 3) ||
                (mag === 1.17 && item.accuracy === 2) ||
                (mag === 1.12 && item.accuracy <= 1))
            ) {
              return (
                Math.ceil(item.los + item.lv * lvBonus(item)) /
                (20 - 2 * airStateValue)
              );
            }
            return 0;
          })
        )
        .flat()
        .map((v) => 1 - v)
        .reduce((p, v) => p * v, 1)
    );
  };

  return [
    { bonus: 1.2, rate: touchStart * touchSelect(1.2) },
    {
      bonus: 1.17,
      rate:
        (1 - touchStart * touchSelect(1.2)) * touchStart * touchSelect(1.17),
    },
    {
      bonus: 1.12,
      rate:
        (1 - touchStart * touchSelect(1.2)) *
        (1 - touchStart * touchSelect(1.17)) *
        touchStart *
        touchSelect(1.12),
    },
    {
      bonus: 1,
      rate:
        (1 - touchStart * touchSelect(1.2)) *
        (1 - touchStart * touchSelect(1.17)) *
        (1 - touchStart * touchSelect(1.12)),
    },
  ];
}

export function calcCanAACIList(
  apidata: Apidata,
  ships: Ship[]
): { kind: number; rate: number }[] {
  const result = getAACIRate(
    ships.map(({ id, items }) => ({
      shipId: id,
      equipmentIds: items.map(({ id }) => id),
    })),
    apidata
  );

  return [
    ...result,
    { kind: 0, rate: 1 - result.reduce((p, { rate }) => p + rate, 0) },
  ];
}
