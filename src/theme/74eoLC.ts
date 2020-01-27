import {
  fetchLangData,
  load74eoParameterIcons,
  load74eoEquipmentIcons,
  toTranslateShipName,
  toTranslateEquipmentName,
  NONE,
  resize,
  LABEL,
  load74eoAircraftLevelIcons,
  RANGE,
  SPEED
} from "../utils";
import { Canvas, loadImage } from "canvas";
import { Ship } from "../type";

const AirPower = {
  jp: "制空戦力",
  en: "Air Power",
  ko: "제공전력",
  scn: "制空戦力",
  tcn: "制空戦力"
};

const LoS = {
  jp: "索敵能力",
  en: "LoS(1)",
  ko: "색적능력",
  scn: "索敵容量",
  tcn: "索敵容量"
};

async function generate74eoLargeCardShipCanvasAsync(
  shipIdx: number,
  ship: Ship,
  lang: "jp" | "en" | "ko" | "tcn" | "scn" = "jp"
): Promise<Canvas> {
  const { ships, items } =
    lang === "jp" ? { ships: null, items: null } : await fetchLangData(lang);
  const shipImage = resize(
    await loadImage(
      `https://raw.githubusercontent.com/Nishisonic/gkcoi/master/static/ship/card/${ship.id}.png`
    ),
    218,
    300
  );
  const parameterIcons = await load74eoParameterIcons();
  const equipmentIcons = await load74eoEquipmentIcons(54);
  const aircraftLevelIcons = await load74eoAircraftLevelIcons();
  const canvas = new Canvas(470, 305);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = `#0f0f0f`;
  ctx.font = "24px Meiryo";
  ctx.fillText(toTranslateShipName(ship.name, ships), 39, 26);
  ctx.fillStyle = "#FFF";
  ctx.fillRect(188, 3, 55, 30);
  ctx.strokeStyle = ctx.fillStyle = "#008888";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(3, 168.5);
  ctx.lineTo(246, 168.5);
  ctx.stroke();
  ctx.moveTo(3, 34.5);
  ctx.lineTo(246, 34.5);
  ctx.stroke();
  ctx.moveTo(3, 302.5);
  ctx.lineTo(246, 302.5);
  ctx.stroke();
  ctx.font = "16px Meiryo";
  ctx.fillText(`#${shipIdx + 1}:`, 2, 23);
  ctx.font = "12px Meiryo";
  ctx.fillText("L", 193, 30);
  ctx.fillText("v", 200, 30);
  ctx.fillText(".", 207, 30);
  ctx.drawImage(parameterIcons["HP"], 19, 173);
  ctx.drawImage(parameterIcons["Armor"], 19, 195);
  ctx.drawImage(parameterIcons["Evasion"], 19, 217);
  ctx.drawImage(parameterIcons["Aircraft"], 19, 239);
  ctx.drawImage(parameterIcons["Speed"], 19, 261);
  ctx.drawImage(parameterIcons["Range"], 19, 283);
  ctx.drawImage(parameterIcons["Firepower"], 132, 173);
  ctx.drawImage(parameterIcons["Torpedo"], 132, 195);
  ctx.drawImage(parameterIcons["AA"], 132, 217);
  ctx.drawImage(parameterIcons["ASW"], 132, 239);
  ctx.drawImage(parameterIcons["LOS"], 132, 261);
  ctx.drawImage(parameterIcons["Luck"], 132, 283);
  ctx.textAlign = "center";
  ctx.fillText(LABEL.HP[lang], 49, 185);
  ctx.fillText(LABEL.ARMOR[lang], 49, 207);
  ctx.fillText(LABEL.EVASION[lang], 49, 229);
  ctx.fillText(LABEL.AIRPOWER[lang], 49, 251);
  ctx.fillText(LABEL.SPEED[lang], 49, 273);
  ctx.fillText(LABEL.RANGE[lang], 49, 295);
  ctx.fillText(LABEL.FIREPOWER[lang], 162, 185);
  ctx.fillText(LABEL.TORPEDO[lang], 162, 207);
  ctx.fillText(LABEL.AA[lang], 162, 229);
  ctx.fillText(LABEL.ASW[lang], 162, 251);
  ctx.fillText(LABEL.LOS[lang], 162, 273);
  ctx.fillText(LABEL.LUCK[lang], 162, 295);
  ctx.font = "16px Meiryo";
  ctx.fillStyle = "#0f0f0f";
  ctx.textAlign = "right";
  ctx.fillText(String(ship.lv), 247, 29);
  ctx.fillText(String(ship.hp), 113, 187);
  ctx.fillText(String(ship.ar), 113, 209);
  ctx.fillText(String(ship.ev), 113, 231);
  ctx.fillText(String(ship.airpower), 113, 253);
  ctx.fillText(SPEED[ship.sp][lang], 113, 275);
  ctx.fillText(RANGE[ship.rn][lang], 113, 297);
  ctx.fillText(String(ship.fp), 226, 187);
  ctx.fillText(String(ship.tp), 226, 209);
  ctx.fillText(String(ship.aa), 226, 231);
  ctx.fillText(String(ship.as), 226, 253);
  ctx.fillText(String(ship.ls), 226, 275);
  ctx.fillText(String(ship.lk), 226, 297);
  for (let i = 0; i < ship.slotNum + 1; i++) {
    ctx.font = "16px Meiryo";
    ctx.textAlign = "left";
    const itemIdx = i;
    if (ship.items[i]) {
      const name = toTranslateEquipmentName(ship.items[i].name, items);
      ctx.fillText(name, 46, 53 + 23 * itemIdx);
      ctx.drawImage(
        equipmentIcons[ship.items[i].type[3]],
        23,
        36 + 23 * itemIdx
      );
      if (ctx.measureText(name).width > 200) {
        const grd = ctx.createLinearGradient(222, 0, 247, 0);
        grd.addColorStop(0, "rgba(255,255,255,0)");
        grd.addColorStop(0.65, "rgba(255,255,255,1)");
        grd.addColorStop(1, "rgba(255,255,255,1)");
        ctx.fillStyle = grd;
        ctx.fillRect(222, 36 + 23 * itemIdx, 27, 21);
      }
      if (ship.items[i].mas > 0) {
        if (ctx.measureText(name).width > 150) {
          // オーバーレイ
          const grd = ctx.createLinearGradient(148, 0, 247, 0);
          grd.addColorStop(0, "rgba(255,255,255,0)");
          grd.addColorStop(0.55, "rgba(255,255,255,1)");
          grd.addColorStop(1, "rgba(255,255,255,1)");
          ctx.fillStyle = grd;
          ctx.fillRect(148, 36 + 23 * itemIdx, 100, 21);
        }
        // 熟練度
        ctx.drawImage(
          aircraftLevelIcons[ship.items[i].mas],
          204,
          39 + 23 * itemIdx
        );
      }
      if (ship.items[i].rf > 0) {
        if (ship.items[i].mas === 0 && ctx.measureText(name).width > 185) {
          // オーバーレイ
          const grd = ctx.createLinearGradient(188, 0, 247, 0);
          grd.addColorStop(0, "rgba(255,255,255,0)");
          grd.addColorStop(0.6, "rgba(255,255,255,1)");
          grd.addColorStop(1, "rgba(255,255,255,1)");
          ctx.fillStyle = grd;
          ctx.fillRect(188, 36 + 23 * itemIdx, 52, 21);
        }
        // 改修値
        ctx.font = "12px Meiryo";
        ctx.fillStyle = "#007F7F";
        ctx.textAlign = "right";
        ctx.fillText(`+${ship.items[i].rf}`, 247, 51 + 23 * itemIdx);
      }
    } else {
      ctx.fillText(`(${NONE[lang]})`, 46, 53 + 22.5 * itemIdx);
      ctx.fillText("-", 30, 53 + 22.5 * itemIdx);
    }
    if (ship.slots[i] > 0) {
      if (ship.items[i] && ship.items[i].type[4] > 0) {
        ctx.fillStyle = "#0f0f0f";
      } else {
        ctx.fillStyle = "#aaaaaa";
      }
      ctx.textAlign = "right";
      ctx.font = "12px Meiryo";
      ctx.fillText(String(ship.slots[i]), 25, 51 + 23 * itemIdx);
      ctx.font = "16px Meiryo";
      ctx.textAlign = "left";
    }
    ctx.fillStyle = "#0f0f0f";
  }
  ctx.drawImage(shipImage, 249, 1);
  return canvas;
}

/**
 * 【七四式】カード(大型)バージョンを出力する
 * @param fleetName 艦隊名
 * @param ships 艦
 * @param los 索敵
 * @param airPower 制空値
 * @param lang 言語
 * @return 画像
 */
export async function generate74eoLargeCardFleetCanvasAsync(
  fleetName: string,
  ships: Ship[],
  los: { 1: number; 2: number; 3: number; 4: number; 5: number },
  airPower: { min: number; max: number },
  lang: "jp" | "en" | "ko" | "tcn" | "scn" = "jp"
): Promise<Canvas> {
  const canvas = new Canvas(952, ships.length < 7 ? 972 : 1279);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  (
    await Promise.all(
      ships
        .map((ship, index) => ({ index, ship }))
        .filter(data => data.ship)
        .map(async data => {
          return {
            ...data,
            image: await generate74eoLargeCardShipCanvasAsync(
              data.index,
              data.ship,
              lang
            )
          };
        })
    )
  ).forEach(data =>
    ctx.drawImage(
      data.image,
      8 + (data.index % 2) * 472,
      Math.floor(data.index / 2) * 307 + 41
    )
  );
  const equipmentIcons = await load74eoEquipmentIcons(54);

  ctx.fillStyle = "#0f0f0f";
  ctx.font = "24px Meiryo";
  ctx.fillText(fleetName, 8, 28);
  ctx.font = "12px Meiryo";
  const airPowerStringWidth = ctx.measureText(AirPower[lang]).width;
  const losValueStringWidth = ctx.measureText(LoS[lang]).width;
  ctx.font = "16px Meiryo";
  const { min, max } = airPower ? airPower : { min: 0, max: 0 };
  const airPowerString = min === max ? String(min) : `${min}~${max}`;
  ctx.fillText(airPowerString, 336 + airPowerStringWidth + 6, 31); // fixed
  ctx.fillText(
    (Math.floor(los[1] * 100) / 100).toFixed(2),
    336 +
      ctx.measureText(airPowerString).width +
      airPowerStringWidth +
      losValueStringWidth +
      49,
    31
  );
  ctx.strokeStyle = ctx.fillStyle = "#008888";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(9, 36.5);
  ctx.lineTo(canvas.width - 6, 36.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(5, canvas.height - 10.5);
  ctx.lineTo(canvas.width - 4.5, canvas.height - 10.5);
  ctx.stroke();
  ctx.font = "12px Meiryo";
  ctx.drawImage(equipmentIcons[6], 315, 14); // fixed
  ctx.fillText(AirPower[lang], 336, 29);
  ctx.drawImage(
    equipmentIcons[9],
    334 + ctx.measureText(airPowerString).width + airPowerStringWidth + 33,
    14
  );
  ctx.fillText(
    LoS[lang],
    337 + ctx.measureText(airPowerString).width + airPowerStringWidth + 51,
    29
  );
  return canvas;
}
