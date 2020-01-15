import { Canvas, Image, loadImage } from "canvas";
import axios from "axios";
import { rejects } from "assert";

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

export const SPEED = {
  NONE: new Language("陸上", "Land", "육상", "土地", "土地"),
  SLOW: new Language("低速", "Slow", "저속", "低速", "低速"),
  FAST: new Language("高速", "Fast", "고속", "高速", "高速"),
  FASTER: new Language("高速+", "Fast+", "고속+", "高速+", "高速+"),
  FASTEST: new Language("最速", "Fastest", "초고속", "最速", "最速")
};

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
        const src = `https://raw.githubusercontent.com/Nishisonic/gkcoi/master/static/${fileName}`;
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

export async function load74eoParameterIcons(): Promise<{
  [key: string]: Image;
}> {
  const results = await Promise.all(
    ["ASW.png", "HP.png", "Luck.png"].map(async (fileName: string) => {
      const src = `https://raw.githubusercontent.com/Nishisonic/gkcoi/master/static/74eo/${fileName}`;
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
      const canvas = new Canvas(imgSize, imgSize);
      const ctx = canvas.getContext("2d");
      // offset
      const oc = new Canvas(54, 54);
      const octx = oc.getContext("2d");
      octx.drawImage(img, img.width === 54 ? 0 : 3, img.height === 54 ? 0 : 3);
      // resize
      // step 1
      const rc = new Canvas(imgSize, imgSize);
      const rctx = rc.getContext("2d");
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
  imgSize = 30
): Promise<{ [key: string]: Image }> {
  const results = await Promise.all(
    Object.values(EQUIPMENT_ICON_SOURCE).map(
      async (id: string, idx: number) => {
        const src = `https://raw.githubusercontent.com/Nishisonic/gkcoi/master/static/74eo/Equipment/${id}.png`;
        const img = await loadImage(src);
        const canvas = new Canvas(imgSize, imgSize);
        const ctx = canvas.getContext("2d");
        // offset
        const oc = new Canvas(54, 54);
        const octx = oc.getContext("2d");
        octx.drawImage(
          img,
          img.width === 54 ? 0 : 3,
          img.height === 54 ? 0 : 3
        );
        // resize
        // step 1
        const rc = new Canvas(imgSize, imgSize);
        const rctx = rc.getContext("2d");
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ships: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any;
}> {
  const shipsUrl = `https://raw.githubusercontent.com/antest1/kcanotify/master/app/src/main/assets/ships-${lang}.json`;
  const itemsUrl = `https://raw.githubusercontent.com/antest1/kcanotify/master/app/src/main/assets/items-${lang}.json`;
  const ships = (await axios.get(shipsUrl)).data;
  const items = (await axios.get(itemsUrl)).data;
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
  if (langData) {
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

export function resize(
  image: Image,
  width: number,
  height: number
): Promise<Image> {
  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, width, height);
  return new Promise((resolve, rejects) => {
    const img = new Image();
    img.src = canvas.toDataURL();
    img.onload = (): void => resolve(img);
    img.onerror = (err: Error): void => rejects(err);
  });
}
