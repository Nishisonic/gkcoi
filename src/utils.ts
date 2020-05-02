import { createCanvas2D, loadImage, Canvas, Image } from "./canvas";
import { Ship } from "./type";

export class Language {
  /** 日本語 */
  jp: string;
  /** 英語 */
  en: string;
  /** 韓国語 */
  ko: string;
  /** 中国語(簡体字) */
  scn: string;
  /** 中国語(繁体字) */
  tcn: string;

  constructor(jp: string, en: string, ko: string, scn: string, tcn: string) {
    this.jp = jp;
    this.en = en;
    this.ko = ko;
    this.scn = scn;
    this.tcn = tcn;
  }
}

export const NONE = new Language("なし", "None", "없음", "没有", "沒有");

export const FLEET = new Language("艦隊", "", "함대", "舰队", "艦隊");

export const SPEED: {
  [key: number]: Language;
} = {
  0: new Language("陸上", "Land", "육상", "土地", "土地"),
  5: new Language("低速", "Slow", "저속", "低速", "低速"),
  10: new Language("高速", "Fast", "고속", "高速", "高速"),
  15: new Language("高速+", "Fast+", "고속+", "高速+", "高速+"),
  20: new Language("最速", "Fastest", "초고속", "最速", "最速")
};

export const RANGE: {
  [key: number]: Language;
} = {
  0: new Language("無", "N", "무", "无", "無"),
  1: new Language("短", "S", "단", "短", "短"),
  2: new Language("中", "M", "중", "中", "中"),
  3: new Language("長", "L", "장", "长", "長"),
  4: new Language("超長", "VL", "초장", "超长", "超長")
};

export const LABEL: {
  [key: string]: Language;
} = {
  HP: new Language("耐久", "HP", "내구", "耐力", "耐力"),
  FIREPOWER: new Language("火力", "FP", "화력", "火力", "火力"),
  TORPEDO: new Language("雷装", "TP", "뇌장", "雷装", "雷裝"),
  AA: new Language("対空", "AA", "대공", "对空", "對空"),
  ARMOR: new Language("装甲", "AR", "장갑", "装甲", "裝甲"),
  ASW: new Language("対潜", "ASW", "대잠", "对潜", "對潛"),
  EVASION: new Language("回避", "EVS", "회피", "回避", "迴避"),
  LOS: new Language("索敵", "LOS", "색적", "索敌", "索敵"),
  ACCURACY: new Language("命中", "ACC", "명중", "命中", "命中"),
  BOMB: new Language("爆装", "BOM", "폭장", "爆装", "爆裝"),
  RANGE: new Language("射程", "RNG", "사거리", "射程", "射程"),
  LUCK: new Language("運", "LK", "운", "运气", "運氣"),
  SPEED: new Language("速力", "SP", "속력", "速度", "速度"),
  AIRPOWER: new Language("制空", "AIR", "제공", "制空", "制空")
};

export const AIR_POWER = new Language(
  "制空戦力",
  "Air Power",
  "제공전력",
  "制空戦力",
  "制空戦力"
);

export const LOS = new Language(
  "索敵能力",
  "LoS(1)",
  "색적능력",
  "索敵容量",
  "索敵容量"
);

class Img {
  id: string;
  img: Image;

  constructor(id: string, img: Image) {
    this.id = id;
    this.img = img;
  }
}

export class MyCanvas {
  id: string;
  canvas: Canvas;

  constructor(id: string, canvas: Canvas) {
    this.id = id;
    this.canvas = canvas;
  }
}

const EQUIPMENT_ICON_SOURCE = {
  1: "MainGunS",
  2: "MainGunM",
  3: "MainGunL",
  4: "SecondaryGun",
  5: "Torpedo",
  6: "CarrierBasedFighter",
  7: "CarrierBasedBomber",
  8: "CarrierBasedTorpedo",
  9: "CarrierBasedRecon",
  10: "Seaplane",
  11: "RADAR",
  12: "AAShell",
  13: "APShell",
  14: "DamageControl",
  15: "AAGun",
  16: "HighAngleGun",
  17: "DepthCharge",
  18: "SONAR",
  19: "Engine",
  20: "LandingCraft",
  21: "Autogyro",
  22: "ASPatrol",
  23: "Bulge",
  24: "Searchlight",
  25: "DrumCanister",
  26: "RepairFacility",
  27: "Flare",
  28: "CommandFacility",
  29: "MaintenanceTeam",
  30: "AADirector",
  31: "RocketArtillery",
  32: "PicketCrew",
  33: "FlyingBoat",
  34: "Ration",
  35: "Supplies",
  36: "AmphibiousVehicle",
  37: "LandAttacker",
  38: "Interceptor",
  39: "JetFightingBomberKeiun",
  40: "JetFightingBomberKikka",
  41: "TransportMaterials",
  42: "SubmarineEquipment",
  43: "SeaplaneFighter",
  44: "ArmyInterceptor",
  45: "NightFighter",
  46: "NightTorpedo",
  47: "LandASPatrol"
};

export async function loadOriginalParameterIcons(): Promise<{
  [key: string]: Image;
}> {
  const results = await Promise.all(
    ["as.png", "los.png", "luck.png", "hp.png", "air.png", "soku.png"].map(
      async (fileName: string) => {
        const src = `https://raw.githubusercontent.com/Nishisonic/gkcoi/master/static/dark/${fileName}`;
        const img = await loadImage(src);
        return new Img(fileName.replace(/(.*).png/g, "$1"), img);
      }
    )
  );

  return results.reduce((p, c) => {
    if (c instanceof Img) {
      return Object.assign(p, { [c.id]: c.img });
    }
    return p;
  }, {});
}

export async function load74eoAircraftLevelIcons(): Promise<{
  [key: string]: Image;
}> {
  const results = await Promise.all(
    [0, 1, 2, 3, 4, 5, 6, 7].map(async (level: number) => {
      const src = `https://raw.githubusercontent.com/Nishisonic/gkcoi/master/static/74eo/AircraftLevel/AircraftLevel${level}.png`;
      const img = await loadImage(src);
      return new Img(String(level), img);
    })
  );

  return results.reduce((p, c) => {
    if (c instanceof Img) {
      return Object.assign(p, { [c.id]: c.img });
    }
    return p;
  }, {});
}

export async function load74eoParameterIcons(): Promise<{
  [key: string]: Image;
}> {
  const results = await Promise.all(
    [
      "AA",
      "Accuracy",
      "Aircraft",
      "AircraftCost",
      "AircraftDistance",
      "AntiBomber",
      "Armor",
      "ASW",
      "Bomber",
      "Evasion",
      "Firepower",
      "HP",
      "Interception",
      "LOS",
      "Luck",
      "Range",
      "Speed",
      "Torpedo"
    ].map(async (fileName: string) => {
      const src = `https://raw.githubusercontent.com/Nishisonic/gkcoi/master/static/74eo/${fileName}.png`;
      const img = await loadImage(src);
      return new Img(fileName.replace(/(.*).png/g, "$1"), img);
    })
  );

  return results.reduce((p, c) => {
    if (c instanceof Img) {
      return Object.assign(p, { [c.id]: c.img });
    }
    return p;
  }, {});
}

export async function loadOriginalEquipmentIcons(
  imgSize = 30
): Promise<{ [key: string]: Image }> {
  const results = await Promise.all(
    Object.keys(EQUIPMENT_ICON_SOURCE).map(async (id: string) => {
      const src = `https://raw.githubusercontent.com/Nishisonic/gkcoi/master/static/common_icon_weapon/common_icon_weapon_id_${id}.png`;
      const img = await loadImage(src);
      const { canvas, ctx } = createCanvas2D(imgSize, imgSize);
      // offset
      const { canvas: oc, ctx: octx } = createCanvas2D(54, 54);
      octx.drawImage(img, img.width === 54 ? 0 : 3, img.height === 54 ? 0 : 3);
      // resize
      // step 1
      const { canvas: rc, ctx: rctx } = createCanvas2D(imgSize, imgSize);
      rctx.drawImage(oc, 0, 0, rc.width, rc.height);
      // step 2
      rctx.drawImage(rc, 0, 0, imgSize, imgSize);
      /// step 3
      ctx.drawImage(
        rc,
        0,
        0,
        imgSize,
        imgSize,
        0,
        0,
        canvas.width,
        canvas.height
      );
      return new Img(id, await loadImage(canvas.toDataURL()));
    })
  );

  return results.reduce((p, c) => {
    if (c instanceof Img) {
      return Object.assign(p, { [c.id]: c.img });
    }
    return p;
  }, {});
}

export async function load74eoEquipmentIcons(
  imgSize = 54
): Promise<{ [key: string]: Image }> {
  const results = await Promise.all(
    Object.values(EQUIPMENT_ICON_SOURCE).map(
      async (id: string, idx: number) => {
        const src = `https://raw.githubusercontent.com/Nishisonic/gkcoi/master/static/74eo/Equipment/${id}.png`;
        const img = await loadImage(src);
        const { canvas, ctx } = createCanvas2D(imgSize, imgSize);
        // offset
        const { canvas: oc, ctx: octx } = createCanvas2D(54, 54);
        octx.drawImage(img, 0, 0);
        // resize
        // step 1
        const { canvas: rc, ctx: rctx } = createCanvas2D(imgSize, imgSize);
        rctx.drawImage(oc, 0, 0, rc.width, rc.height);
        // step 2
        rctx.drawImage(rc, 0, 0, imgSize, imgSize);
        /// step 3
        ctx.drawImage(
          rc,
          0,
          0,
          imgSize,
          imgSize,
          0,
          0,
          canvas.width,
          canvas.height
        );
        return new Img(String(idx + 1), await loadImage(canvas.toDataURL()));
      }
    )
  );

  return results.reduce((p, c) => {
    if (c instanceof Img) {
      return Object.assign(p, { [c.id]: c.img });
    }
    return p;
  }, {});
}

export async function fetchLangData(
  lang: "en" | "ko" | "tcn" | "scn"
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
  const shipsUrl = `https://raw.githubusercontent.com/antest1/kcanotify/master/app/src/main/assets/ships-${lang}.json`;
  const itemsUrl = `https://raw.githubusercontent.com/antest1/kcanotify/master/app/src/main/assets/items-${lang}.json`;
  const ships = await fetch(shipsUrl).then(res => res.json());
  const items = await fetch(itemsUrl).then(res => res.json());
  return { ships, items };
}

export function toTranslateShipName(
  name: string,
  langData: {
    suffixes: { [key: string]: string };
    [key: string]: string | { [key: string]: string };
  } | null
): string {
  let shipName = name;
  let shipSuffix = null;
  if (langData && langData.suffixes) {
    Object.keys(langData.suffixes)
      .sort((a, b) => b.length - a.length)
      .some(suffix => {
        if (name.includes(suffix)) {
          shipName = name.replace(suffix, "");
          shipSuffix = suffix;
          return true;
        }
        return false;
      });
    if (langData[shipName]) {
      return (
        langData[shipName] + (shipSuffix ? langData.suffixes[shipSuffix] : "")
      );
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

export function resize(image: Image, width: number, height: number): Canvas {
  const { canvas, ctx } = createCanvas2D(width, height);
  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
}

export function getLoSValue(ships: Ship[], hqLv: number, cn: number): number {
  const itemBonus = (ship: Ship): number => {
    return ship.items
      .filter(item => item.id > 0)
      .map(item => {
        // SG レーダー(初期型)
        if ([65, 69, 83, 87, 84, 91, 93, 95, 99].includes(ship.ctype)) {
          if (item.id === 315) {
            return item.los + 4;
          }
        }
        return item.los;
      })
      .reduce((previous, current) => {
        return previous + current;
      }, 0);
  };

  return (
    ships
      .filter(ship => ship.id > 0)
      .map(ship => {
        return (
          ship.items
            .filter(item => item.id > 0)
            .map(item => {
              switch (item.type[2]) {
                case 8: // 艦上攻撃機
                  return 0.8 * item.los; // 改修不可
                case 9: // 艦上偵察機
                case 94: // 艦上偵察機(II)
                  return 1.0 * (item.los + 1.2 * Math.sqrt(item.lv));
                case 10: // 水上偵察機
                  return 1.2 * (item.los + 1.2 * Math.sqrt(item.lv));
                case 11: // 水上爆撃機
                  return 1.1 * (item.los + 1.15 * Math.sqrt(item.lv));
                case 12: // 小型電探
                  return 0.6 * (item.los + 1.25 * Math.sqrt(item.lv));
                case 13: // 大型電探
                case 93: // 大型電探(II)
                  return 0.6 * (item.los + 1.4 * Math.sqrt(item.lv));
                default:
                  // その他
                  return 0.6 * item.los;
              }
            })
            .reduce((p, v) => p + v, 0) *
            cn +
          Math.sqrt(ship.los - itemBonus(ship))
        );
      })
      .reduce((p, v) => p + v, 0) -
    Math.ceil(0.4 * hqLv) +
    2 * (6 - ships.filter(ship => ship.id > 0).length)
  );
}
