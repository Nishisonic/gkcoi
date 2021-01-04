import { Ship, Item, AirState, AirPower, MasterData } from "./type";
import { Lang } from "./lang";

export const MASTER_URL = "https://cdn.jsdelivr.net/gh/Nishisonic/gkcoi/static";

const US_SHIPS = [65, 69, 83, 87, 84, 91, 93, 95, 99, 102, 105, 106, 107];
const UK_SHIPS = [67, 78, 82, 88, 108];
const RECON_PLANE = [9, 10, 41, 49, 94];

export async function fetchStart2(url: string): Promise<MasterData> {
  const res = await fetch(url);
  return res.json();
}

export async function fetchLangData(
  lang: Lang
): Promise<{
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
    const count = (id: number, minLv = 0): number =>
      items.filter((item) => item.id === id && item.lv >= minLv).length;
    const itemLoS = items.map((item) => item.los).reduce((p, v) => p + v, 0);
    let bonus = 0;

    if (US_SHIPS.includes(ship.ctype)) {
      // bonus += count(278) && 1;
      // bonus += count(279) && 2;
      bonus += count(315) * 4;
    }
    // if (UK_SHIPS.includes(ship.ctype)) {
    // bonus += count(279) && 1;
    // }

    return itemLoS + bonus;
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

const SKILLED_BONUS = {
  MIN: [0, 10, 25, 40, 55, 70, 85, 100],
  MAX: [9, 24, 39, 54, 69, 84, 99, 120],
};

function getImprovementBonus(item: Item): number {
  if (item.lv > 0) {
    switch (item.type[2]) {
      case 6: // 艦上戦闘機
      case 45: // 夜間戦闘機
        return 0.2 * item.lv;
      case 7: // 艦上爆撃機
      case 57: // 噴式戦闘爆撃機
        return item.aa > 3 ? 0.25 * item.lv : 0;
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
      if (slots[i] > 0 && item && SKILLED_BONUS_LIST[item.type[2]]) {
        const bonus =
          SKILLED_BONUS_LIST[item.type[2]][7] +
          Math.sqrt(slots[i]) * (item.aa + getImprovementBonus(item));
        return {
          min: Math.floor(bonus + Math.sqrt(SKILLED_BONUS.MIN[7] / 10)),
          max: Math.floor(bonus + Math.sqrt(SKILLED_BONUS.MAX[7] / 10)),
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
}

export function getAirbaseAirPower(
  items: Item[],
  airDefense = false,
  highAltitude = false,
  rocket = 0
): AirPower {
  const slot = (item: Item): 4 | 18 =>
    RECON_PLANE.includes(item.type[2]) ? 4 : 18;

  const { min, max } = items
    .map((item) => {
      if (item && item.type[4] > 0) {
        const bonus =
          (SKILLED_BONUS_LIST[item.type[2]] || SKILLED_BONUS_LIST[9999])[7] +
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
  [key: number]: { kind: number; fixed: number; prop: number; value: number };
} = {
  1: { kind: 1, fixed: 7, prop: 1.7, value: 65 },
  2: { kind: 2, fixed: 6, prop: 1.7, value: 58 },
  3: { kind: 3, fixed: 4, prop: 1.6, value: 50 },
  4: { kind: 4, fixed: 6, prop: 1.5, value: 52 },
  5: { kind: 5, fixed: 4, prop: 1.5, value: 55 },
  6: { kind: 6, fixed: 4, prop: 1.45, value: 40 },
  7: { kind: 7, fixed: 3, prop: 1.35, value: 45 },
  8: { kind: 8, fixed: 4, prop: 1.4, value: 50 },
  9: { kind: 9, fixed: 2, prop: 1.3, value: 40 },
  10: { kind: 10, fixed: 8, prop: 1.65, value: 60 },
  11: { kind: 11, fixed: 6, prop: 1.5, value: 55 },
  12: { kind: 12, fixed: 3, prop: 1.25, value: 45 },
  13: { kind: 13, fixed: 4, prop: 1.35, value: 35 },
  14: { kind: 14, fixed: 4, prop: 1.45, value: 64 },
  15: { kind: 15, fixed: 3, prop: 1.3, value: 55 },
  16: { kind: 16, fixed: 4, prop: 1.4, value: 63 },
  17: { kind: 17, fixed: 2, prop: 1.25, value: 57 },
  18: { kind: 18, fixed: 2, prop: 1.2, value: 60 },
  19: { kind: 19, fixed: 5, prop: 1.45, value: 58 },
  20: { kind: 20, fixed: 3, prop: 1.25, value: 66 },
  21: { kind: 21, fixed: 5, prop: 1.45, value: 60 },
  22: { kind: 22, fixed: 2, prop: 1.2, value: 59 },
  23: { kind: 23, fixed: 1, prop: 1.05, value: 81 },
  24: { kind: 24, fixed: 3, prop: 1.25, value: 56 },
  25: { kind: 25, fixed: 7, prop: 1.55, value: 62 },
  26: { kind: 26, fixed: 6, prop: 1.4, value: 61 },
  // 27:
  28: { kind: 28, fixed: 4, prop: 1.4, value: 55 },
  29: { kind: 29, fixed: 5, prop: 1.55, value: 61 },
  30: { kind: 30, fixed: 3, prop: 1.3, value: 67 },
  31: { kind: 31, fixed: 2, prop: 1.25, value: 54 },
  32: { kind: 32, fixed: 3, prop: 1.2, value: 33 },
  33: { kind: 33, fixed: 3, prop: 1.35, value: 45 },
  34: { kind: 34, fixed: 7, prop: 1.6, value: 60 },
  35: { kind: 35, fixed: 6, prop: 1.55, value: 55 },
  36: { kind: 36, fixed: 6, prop: 1.55, value: 34 },
  37: { kind: 37, fixed: 4, prop: 1.45, value: 40 },
  // 38:
  39: { kind: 39, fixed: 10, prop: 1.7, value: 70 },
  40: { kind: 40, fixed: 10, prop: 1.7, value: 57 },
  41: { kind: 41, fixed: 9, prop: 1.65, value: 56 },
};

export function getCanAACIList(
  ships: Ship[]
): { kind: number; rate: number }[] {
  const aalists = ships
    .map((ship: Ship) => {
      const aalist: number[] = [];
      const HAGun = ship.items.filter(({ type }) => type[3] === 16).length;
      const Radar = ship.items.filter(({ type }) => type[3] === 11).length;
      if (ship.ctype === 54 && HAGun) {
        if (HAGun >= 2 && Radar) {
          aalist.push(1);
        } else if (Radar) {
          aalist.push(2);
        } else if (HAGun >= 2) {
          aalist.push(3);
        }
      } else {
        const FiveInch = ship.items.filter(({ id }) => [284, 313].includes(id))
          .length;
        const FiveInchKai = ship.items.filter(({ id }) => id === 313).length;
        const FiveInchGFCS = ship.items.filter(({ id }) => id === 308).length;
        const GFCS = ship.items.filter(({ id }) => id === 307).length;
        const GFCSFiveInchM = ship.items.filter(({ id }) => id === 363).length;
        const FiveInchM = ship.items.filter(({ id }) => id === 362).length;
        const RocketLauncherK2 = ship.items.filter(({ id }) => id === 274)
          .length;
        const TenHAGunKai = ship.items.filter(({ id }) => id === 275).length;
        const Type3Shell = ship.items.filter(({ type }) => type[2] === 18)
          .length;
        const AAGun = ship.items.filter(({ type }) => type[2] === 21).length;
        const AAFD = ship.items.filter(({ type }) => type[2] === 36).length;
        const LMainGun = ship.items.filter(({ type }) => type[2] === 3).length;
        const HAGunFD = ship.items.filter(
          ({ type, aa }) => type[3] === 16 && aa >= 8
        ).length;
        const AAGunNormal = ship.items.filter(
          ({ type, aa }) => type[2] === 21 && aa >= 3 && aa <= 8
        ).length;
        const AAGunCD = ship.items.filter(
          ({ type, aa }) => type[2] === 21 && aa >= 9
        ).length;
        const AARadar = ship.items.filter(
          ({ type, aa }) => type[3] === 11 && aa >= 2
        ).length;
        if (ship.ctype === 91) {
          if (FiveInchGFCS >= 2) {
            aalist.push(34);
          }
          if (FiveInchGFCS && FiveInch) {
            aalist.push(35);
          }
          if (FiveInch >= 2 && GFCS) {
            aalist.push(36);
          }
          if (FiveInchKai >= 2) {
            aalist.push(37);
          }
          aalist.push(0);
        }
        if (ship.ctype === 99) {
          if (GFCSFiveInchM && FiveInchM) {
            aalist.push(39);
          }
          aalist.push(0);
          if (GFCSFiveInchM + FiveInchM >= 2 && GFCS) {
            aalist.push(40);
          }
          aalist.push(0);
          if (GFCSFiveInchM + FiveInchM >= 2) {
            aalist.push(41);
          }
          aalist.push(0);
        }
        if (ship.id === 428 && HAGun && AAGunCD) {
          if (AARadar) {
            aalist.push(10);
          }
          aalist.push(11);
        }
        if (ship.id === 141 && HAGun && AAGun) {
          if (AARadar) {
            aalist.push(14);
          }
          aalist.push(15);
        }
        if ([470, 622].includes(ship.id) && HAGun && AAGun) {
          if (AARadar) {
            aalist.push(16);
          }
          aalist.push(17);
        }
        if (
          ship.id === 487 &&
          AAGunCD &&
          ship.items.some(({ type, aa }) => type[3] === 16 && aa <= 7)
        ) {
          aalist.push(19);
        }
        if (ship.id === 488 && HAGun && AARadar) {
          aalist.push(21);
        }
        if (
          [82, 88, 553, 554].includes(ship.id) &&
          RocketLauncherK2 &&
          Type3Shell &&
          AARadar
        ) {
          aalist.push(25);
        }
        if (AAFD && LMainGun && Type3Shell && AARadar) {
          aalist.push(4);
        }
        if (HAGunFD >= 2 && AARadar) {
          aalist.push(5);
        }
        if (AAFD && LMainGun && Type3Shell) {
          aalist.push(6);
        }
        if (HAGunFD && AARadar) {
          aalist.push(8);
        }
        if (AAFD && HAGun && AARadar) {
          aalist.push(7);
        }
        if (ship.id === 546 && TenHAGunKai && AARadar) {
          aalist.push(26);
        }
        if (
          [82, 88, 553, 554, 148, 546].includes(ship.id) &&
          RocketLauncherK2 &&
          AARadar
        ) {
          aalist.push(28);
        }
        if ([557, 558].includes(ship.id) && HAGun && AARadar) {
          aalist.push(29);
        }
        if (AAFD && HAGun) {
          aalist.push(9);
        }
        if ([579, 630].includes(ship.id) && HAGun && AAGun) {
          aalist.push(33);
        }
        if (AAGunCD && AAGun >= 2 && AARadar) {
          aalist.push(12);
        }
        if (ship.id === 418 && AAGunCD) {
          aalist.push(18);
        }
        if (ship.id === 487 && AAGunCD) {
          aalist.push(20);
        }
        if (ship.id === 548 && AAGunCD) {
          aalist.push(22);
        }
        if ([539, 530].includes(ship.id) && AAGunNormal) {
          aalist.push(23);
        }
        if (ship.id === 478 && HAGun && AAGunNormal) {
          aalist.push(24);
        }
        if ([477, 579, 630].includes(ship.id) && HAGun >= 3) {
          aalist.push(30);
        }
        if (ship.id === 477 && HAGun >= 2) {
          aalist.push(31);
        }
        if (
          (UK_SHIPS.includes(ship.ctype) ||
            [149, 150, 151, 152, 591, 592].includes(ship.id)) &&
          (ship.items.filter(({ id }) => id === 301).length >= 2 ||
            (ship.items.some(({ id }) => id === 300) &&
              ship.items.some(({ id }) => [191, 301].includes(id))))
        ) {
          aalist.push(32);
        }
      }
      return aalist;
    })
    .filter((aalist) => aalist.length > 0);

  const orderByAAlist = ((
    aalists: number[][]
  ): { index: number; kind: number }[] => {
    const count = aalists.flat().length;
    const result = [];

    while (count > result.length) {
      let index = 0;
      for (let i = 0; i < aalists.length; i++) {
        if (aalists[i][0] === 0) {
          index = i;
          continue;
        }
        if (aalists[index].length === 0 || aalists[index][0] < aalists[i][0]) {
          index = i;
        }
      }
      const kind = aalists[index].shift() || 0;
      result.push({ index, kind });
    }
    return result;
  })(aalists);
  const aaRates = orderByAAlist.reduce<{
    rate: number;
    rates: { kind: number; rate: number }[];
    rateByShips: { [key: number]: number };
  }>(
    (p, v) => {
      if (v.kind > 0) {
        if (p.rateByShips[v.index] < AA_CI_LIST[v.kind].value) {
          const rate = p.rate;
          p.rate +=
            ((1 - p.rate) *
              (AA_CI_LIST[v.kind].value - p.rateByShips[v.index])) /
            101;
          p.rates.push({ kind: v.kind, rate: p.rate - rate });
          p.rateByShips[v.index] = AA_CI_LIST[v.kind].value;
        }
      } else {
        p.rateByShips[v.index] = 0;
      }
      return p;
    },
    {
      rate: 0,
      rates: [],
      rateByShips: [...new Set(orderByAAlist.map(({ index }) => index))].reduce(
        (p, v) => Object.assign(p, { [v]: 0 }),
        {}
      ),
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
