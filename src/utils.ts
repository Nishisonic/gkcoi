import { Ship, Item, AirState, AirPower } from "./type";
import { Lang } from "./lang";

export const MASTER_URL = "https://gkcoi.vercel.app";

const UK_SHIPS = [67, 78, 82, 88, 108, 112];
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
            cn +
          Math.sqrt(ship.los - itemBonus(ship))
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

const AA_CI_LIST: {
  [key: number]: {
    kind: number;
    priority: number;
    fixed: number;
    prop: number;
    value: number;
  };
} = {
  1: { kind: 1, priority: 11, fixed: 7, prop: 1.7, value: 65 },
  2: { kind: 2, priority: 16, fixed: 6, prop: 1.7, value: 58 },
  3: { kind: 3, priority: 26, fixed: 4, prop: 1.6, value: 50 },
  4: { kind: 4, priority: 15, fixed: 6, prop: 1.5, value: 52 },
  5: { kind: 5, priority: 27, fixed: 4, prop: 1.5, value: 55 },
  6: { kind: 6, priority: 28, fixed: 4, prop: 1.45, value: 40 },
  7: { kind: 7, priority: 36, fixed: 3, prop: 1.35, value: 45 },
  8: { kind: 8, priority: 33, fixed: 4, prop: 1.4, value: 50 },
  9: { kind: 9, priority: 45, fixed: 2, prop: 1.3, value: 40 },
  10: { kind: 10, priority: 6, fixed: 8, prop: 1.65, value: 60 },
  11: { kind: 11, priority: 9, fixed: 6, prop: 1.5, value: 55 },
  12: { kind: 12, priority: 40, fixed: 3, prop: 1.25, value: 45 },
  13: { kind: 13, priority: 34, fixed: 4, prop: 1.35, value: 35 },
  14: { kind: 14, priority: 25, fixed: 4, prop: 1.45, value: 63 },
  15: { kind: 15, priority: 35, fixed: 3, prop: 1.3, value: 56 },
  16: { kind: 16, priority: 24, fixed: 4, prop: 1.4, value: 62 },
  17: { kind: 17, priority: 42, fixed: 2, prop: 1.25, value: 55 },
  18: { kind: 18, priority: 43, fixed: 2, prop: 1.2, value: 60 },
  19: { kind: 19, priority: 21, fixed: 5, prop: 1.45, value: 58 },
  20: { kind: 20, priority: 37, fixed: 3, prop: 1.25, value: 65 },
  21: { kind: 21, priority: 22, fixed: 5, prop: 1.45, value: 60 },
  22: { kind: 22, priority: 44, fixed: 2, prop: 1.2, value: 59 },
  23: { kind: 23, priority: 46, fixed: 1, prop: 1.05, value: 80 },
  24: { kind: 24, priority: 38, fixed: 3, prop: 1.25, value: 54 },
  25: { kind: 25, priority: 10, fixed: 7, prop: 1.55, value: 61 },
  26: { kind: 26, priority: 14, fixed: 6, prop: 1.4, value: 60 },
  27: { kind: 27, priority: 19, fixed: 5, prop: 1.55, value: 55 },
  28: { kind: 28, priority: 29, fixed: 4, prop: 1.4, value: 55 },
  29: { kind: 29, priority: 23, fixed: 5, prop: 1.55, value: 60 },
  30: { kind: 30, priority: 32, fixed: 3, prop: 1.3, value: 44 },
  31: { kind: 31, priority: 41, fixed: 2, prop: 1.25, value: 53 },
  32: { kind: 32, priority: 39, fixed: 3, prop: 1.2, value: 37 },
  33: { kind: 33, priority: 31, fixed: 3, prop: 1.35, value: 44 },
  34: { kind: 34, priority: 12, fixed: 7, prop: 1.6, value: 60 },
  35: { kind: 35, priority: 17, fixed: 6, prop: 1.55, value: 55 },
  36: { kind: 36, priority: 18, fixed: 6, prop: 1.55, value: 55 },
  37: { kind: 37, priority: 30, fixed: 4, prop: 1.45, value: 40 },
  38: { kind: 38, priority: 1, fixed: 10, prop: 1.85, value: 59 },
  39: { kind: 39, priority: 2, fixed: 10, prop: 1.7, value: 55 },
  40: { kind: 40, priority: 3, fixed: 10, prop: 1.7, value: 55 },
  41: { kind: 41, priority: 5, fixed: 9, prop: 1.65, value: 59 },
  42: { kind: 42, priority: 4, fixed: 10, prop: 1.65, value: 64 },
  43: { kind: 43, priority: 7, fixed: 8, prop: 1.6, value: 59 },
  44: { kind: 44, priority: 13, fixed: 6, prop: 1.6, value: 54 },
  45: { kind: 45, priority: 20, fixed: 5, prop: 1.55, value: 50 },
  46: { kind: 46, priority: 8, fixed: 8, prop: 1.55, value: 50 },
};

export function calcCanAACIList(
  ships: Ship[]
): { kind: number; rate: number }[] {
  const aalists = ships
    .map((ship: Ship) => {
      const aalist: number[] = [];
      const haGun = ship.items.filter(({ type }) => type[3] === 16).length;
      const radar = ship.items.filter(({ type }) => type[3] === 11).length;
      const FiveInch = ship.items.filter(({ id }) =>
        [284, 313].includes(id)
      ).length;
      const fiveInchKai = ship.items.filter(({ id }) => id === 313).length;
      const fiveInchGFCS = ship.items.filter(({ id }) => id === 308).length;
      const gfcs = ship.items.filter(({ id }) => id === 307).length;
      const gfcsFiveInchM = ship.items.filter(({ id }) => id === 363).length;
      const fiveInchM = ship.items.filter(({ id }) => id === 362).length;
      const rocketLauncherK2 = ship.items.filter(({ id }) => id === 274).length;
      const tenHAGunKai = ship.items.filter(({ id }) => id === 275).length;
      const tenHAGunCD = ship.items.filter(({ id }) => id === 464).length;
      const yamatoClassRadar = ship.items.filter(({ id }) =>
        [142, 460].includes(id)
      ).length;
      const type3Shell = ship.items.filter(({ type }) => type[2] === 18).length;
      const aaGun = ship.items.filter(({ type }) => type[2] === 21).length;
      const aaGun4 = ship.items.filter(
        ({ type, aa }) => type[2] === 21 && aa >= 4
      ).length;
      const aaGun6 = ship.items.filter(
        ({ type, aa }) => type[2] === 21 && aa >= 6
      ).length;
      const aaFD = ship.items.filter(({ type }) => type[2] === 36).length;
      const lMainGun = ship.items.filter(({ type }) => type[2] === 3).length;
      const haGunFD = ship.items.filter(
        ({ type, aa }) => type[3] === 16 && aa >= 8
      ).length;
      const aaGunNormal = ship.items.filter(
        ({ type, aa }) => type[2] === 21 && aa >= 3 && aa <= 8
      ).length;
      const aaGunCD = ship.items.filter(
        ({ type, aa }) => type[2] === 21 && aa >= 9
      ).length;
      const aaRadar = ship.items.filter(
        ({ type, aa }) => type[3] === 11 && aa >= 2
      ).length;

      // 秋月型は5, 7, 8種が出ない
      if (ship.ctype === 54) {
        if (haGun >= 2 && radar) {
          aalist.push(1);
        }
        if (haGun && radar) {
          aalist.push(2);
        }
        if (haGun >= 2) {
          aalist.push(3);
        }
      } else {
        if (haGunFD >= 2 && aaRadar) {
          aalist.push(5);
        }
        if (aaFD && haGun && aaRadar) {
          aalist.push(7);
        }
        if (haGunFD && aaRadar) {
          aalist.push(8);
        }
      }
      if (aaFD && lMainGun && type3Shell && aaRadar) {
        aalist.push(4);
      }
      if (aaFD && lMainGun && type3Shell) {
        aalist.push(6);
      }
      if (aaFD && haGun) {
        aalist.push(9);
      }
      // 摩耶改二は13種が出ない
      if (ship.id === 428) {
        if (haGun && aaGunCD && aaRadar) {
          aalist.push(10);
        }
        if (haGun && aaGunCD) {
          aalist.push(11);
        }
      } else {
        if (haGunFD && aaGunCD && aaRadar) {
          aalist.push(13);
        }
      }
      if (aaGunCD && aaGun >= 2 && aaRadar) {
        aalist.push(12);
      }
      if (ship.id === 141 && haGun && aaGun) {
        if (aaRadar) {
          aalist.push(14);
        }
        aalist.push(15);
      }
      if ([470, 622].includes(ship.id) && haGun && aaGun) {
        if (aaRadar) {
          aalist.push(16);
        }
        aalist.push(17);
      }
      if (ship.id === 418 && aaGunCD) {
        aalist.push(18);
      }
      if (
        ship.id === 487 &&
        aaGunCD &&
        ship.items.some(({ type, aa }) => type[3] === 16 && aa <= 7)
      ) {
        aalist.push(19);
      }
      if (ship.id === 487 && aaGunCD) {
        aalist.push(20);
      }
      if (ship.id === 488 && haGun && aaRadar) {
        aalist.push(21);
      }
      if (ship.id === 548 && aaGunCD) {
        aalist.push(22);
      }
      if ([539, 530].includes(ship.id) && aaGunNormal) {
        aalist.push(23);
      }
      if ([477, 478].includes(ship.id) && haGun && aaGunNormal) {
        aalist.push(24);
      }
      if (
        [82, 88, 553, 554].includes(ship.id) &&
        rocketLauncherK2 &&
        type3Shell &&
        aaRadar
      ) {
        aalist.push(25);
      }
      if ([546, 911, 916].includes(ship.id) && tenHAGunKai && aaRadar) {
        aalist.push(26);
      }
      if (ship.id === 321 && tenHAGunKai && rocketLauncherK2 && aaRadar) {
        aalist.push(27);
      }
      if (
        [82, 88, 553, 554, 148, 546].includes(ship.id) &&
        rocketLauncherK2 &&
        aaRadar
      ) {
        aalist.push(28);
      }
      if ([557, 558].includes(ship.id) && haGun && aaRadar) {
        aalist.push(29);
      }
      if ([477, 579, 630].includes(ship.id) && haGun >= 3) {
        aalist.push(30);
      }
      if (ship.id === 477 && haGun >= 2) {
        aalist.push(31);
      }
      if (
        (UK_SHIPS.includes(ship.ctype) ||
          [149, 150, 151, 152, 591, 592, 593, 954].includes(ship.id)) &&
        (ship.items.filter(({ id }) => id === 301).length >= 2 ||
          (ship.items.some(({ id }) => id === 300) &&
            ship.items.some(({ id }) => [191, 301].includes(id))))
      ) {
        aalist.push(32);
      }
      if ([579, 630].includes(ship.id) && haGun && aaGun4) {
        aalist.push(33);
      }
      if (ship.ctype === 91) {
        if (fiveInchGFCS >= 2) {
          aalist.push(34);
        }
        if (fiveInchGFCS && FiveInch) {
          aalist.push(35);
        }
        if (FiveInch >= 2 && gfcs) {
          aalist.push(36);
        }
        if (fiveInchKai >= 2) {
          aalist.push(37);
        }
      }
      if (ship.ctype === 99) {
        if (gfcsFiveInchM >= 2) {
          aalist.push(38);
        }
        if (gfcsFiveInchM && fiveInchM) {
          aalist.push(39);
        }
        if (gfcsFiveInchM + fiveInchM >= 2 && gfcs) {
          aalist.push(40);
        }
        if (gfcsFiveInchM + fiveInchM >= 2) {
          aalist.push(41);
        }
      }
      if (
        [546, 911, 916].includes(ship.id) &&
        tenHAGunCD >= 2 &&
        aaGun6 &&
        yamatoClassRadar
      ) {
        aalist.push(42);
      }
      if (
        [546, 911, 916].includes(ship.id) &&
        tenHAGunCD >= 2 &&
        yamatoClassRadar
      ) {
        aalist.push(43);
      }
      if (
        [546, 911, 916].includes(ship.id) &&
        tenHAGunCD &&
        aaGun6 &&
        yamatoClassRadar
      ) {
        aalist.push(44);
      }
      if ([546, 911, 916].includes(ship.id) && tenHAGunCD && yamatoClassRadar) {
        aalist.push(45);
      }
      if (
        ship.id === 593 &&
        ship.items.some(({ id }) => [502, 503].includes(id)) &&
        aaGunCD &&
        aaRadar
      ) {
        aalist.push(46);
      }
      return aalist;
    })
    .filter((aalist) => aalist.length > 0);

  const orderByAAlist = aalists
    .flat()
    .sort((a, b) => Math.sign(AA_CI_LIST[a].priority - AA_CI_LIST[b].priority))
    .map((id) => AA_CI_LIST[id]);
  const aaRates = orderByAAlist.reduce<{
    rate: number;
    rates: { kind: number; rate: number }[];
  }>(
    (p, { kind }) => {
      const rate = (1 - p.rate) * AA_CI_LIST[kind].value / 100;
      p.rate += rate;
      p.rates.push({ kind: kind, rate });
      return p;
    },
    {
      rate: 0,
      rates: [],
    }
  ).rates;

  const result = Object.entries(
    aaRates.reduce<{ [key: number]: number }>((p, v) => {
      p[v.kind] = (isNaN(p[v.kind]) ? 0 : p[v.kind]) + v.rate;
      return p;
    }, {})
  )
    .sort((a, b) => {
      return b[1] - a[1];
    })
    .map(([key, value]) => ({ kind: Number(key), rate: value }));

  return [
    ...result,
    { kind: 0, rate: 1 - result.reduce((p, { rate }) => p + rate, 0) },
  ];
}
