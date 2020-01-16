import {
  fetchLangData,
  load74eoParameterIcons,
  load74eoEquipmentIcons,
  toTranslateShipName,
  toTranslateEquipmentName,
  NONE,
  resize
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

async function generate74eoMiddleCutinShipCanvasAsync(
  shipIdx: number,
  ship: Ship,
  has5slot: boolean,
  lang: "jp" | "en" | "ko" | "tcn" | "scn" = "jp"
): Promise<Canvas> {
  const { ships, items } =
    lang === "jp" ? { ships: null, items: null } : await fetchLangData(lang);
  const shipImage = resize(
    await loadImage(
      `https://raw.githubusercontent.com/Nishisonic/gkcoi/master/static/ship/remodel/${ship.id}.png`
    ),
    665,
    121
  );
  const albumStatusImage = await resize(
    await loadImage(
      `https://raw.githubusercontent.com/Nishisonic/gkcoi/master/static/ship/album_status/${ship.id}.png`
    ),
    436,
    63
  );
  const parameterIcons = await load74eoParameterIcons();
  const equipmentIcons = await load74eoEquipmentIcons();
  const canvas = new Canvas(677, 172);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 5スロ位置基準
  const offset = has5slot ? 0 : 25;
  const itemOffset = has5slot ? 0 : 23;
  ctx.drawImage(shipImage, 4, 46);
  if (lang === "jp") {
    ctx.drawImage(albumStatusImage, -50, 0);
  } else {
    ctx.fillStyle = `#0f0f0f`;
    ctx.font = "24px Meiryo";
    ctx.fillText(toTranslateShipName(ship.name, ships), 46, 32);
  }
  let grd = ctx.createLinearGradient(370, 98, 630, 98);
  grd.addColorStop(0, "rgba(255,255,255,0)");
  grd.addColorStop(0.2, "rgba(255,255,255,0.9)");
  grd.addColorStop(1, "rgba(255,255,255,0.9)");
  ctx.fillStyle = grd;
  ctx.fillRect(370, 0, 730, 166);
  ctx.strokeStyle = ctx.fillStyle = "#008888";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(10, 168.5);
  ctx.lineTo(668, 168.5);
  ctx.stroke();
  ctx.font = "16px Meiryo";
  ctx.fillText(`#${shipIdx + 1}:`, 9, 29);
  ctx.font = "12px Meiryo";
  ctx.fillText("L", 360, 18 + offset);
  ctx.fillText("v", 367, 18 + offset);
  ctx.fillText(".", 374, 18 + offset);
  ctx.drawImage(parameterIcons["HP"], 432, 3 + offset);
  ctx.drawImage(parameterIcons["ASW"], 500, 3 + offset);
  ctx.drawImage(parameterIcons["Luck"], 568, 3 + offset);
  ctx.font = "16px Meiryo";
  ctx.fillStyle = "#0f0f0f";
  ctx.textAlign = "right";
  ctx.fillText(String(ship.lv), 414, 17 + offset);
  ctx.fillText(String(ship.hp), 482, 17 + offset);
  ctx.fillText(String(ship.as), 549, 17 + offset);
  ctx.fillText(String(ship.lk), 617, 17 + offset);
  for (let i = 0; i < ship.slotNum + 1; i++) {
    ctx.font = "16px Meiryo";
    ctx.textAlign = "left";
    const itemIdx = i < ship.slotNum ? i : 5 + (offset > 0 ? -1 : 0);
    if (ship.items[i]) {
      const name = toTranslateEquipmentName(ship.items[i].name, items);
      ctx.fillText(name, 463, 48 + 23 * itemIdx + itemOffset);
      ctx.drawImage(
        equipmentIcons[ship.items[i].type[3]],
        444,
        34 + 23 * itemIdx + itemOffset
      );
      if (ctx.measureText(name).width > 200) {
        grd = ctx.createLinearGradient(
          660,
          30 + 23 * itemIdx + itemOffset,
          677,
          30 + 23 * itemIdx + itemOffset
        );
        grd.addColorStop(0, "rgba(255,255,255,0)");
        grd.addColorStop(0.6, "rgba(255,255,255,1)");
        grd.addColorStop(1, "rgba(255,255,255,1)");
        ctx.fillStyle = grd;
        ctx.fillRect(667, 30 + 23 * itemIdx + itemOffset, 10, 21);
      }
      if (ship.items[i].rf > 0) {
        if (ctx.measureText(name).width > 185) {
          // オーバーレイ
          grd = ctx.createLinearGradient(640, 0, 685, 0);
          grd.addColorStop(0, "rgba(255,255,255,0)");
          grd.addColorStop(0.3, "rgba(255,255,255,1)");
          grd.addColorStop(1, "rgba(255,255,255,1)");
          ctx.fillStyle = grd;
          ctx.fillRect(640, 30 + 23 * itemIdx + itemOffset, 37, 21);
        }
        // 改修値
        ctx.font = "12px Meiryo";
        ctx.fillStyle = "#007F7F";
        ctx.textAlign = "right";
        ctx.fillText(
          `+${ship.items[i].rf}`,
          667,
          46 + 23 * itemIdx + itemOffset
        );
      }
    } else {
      ctx.fillText(`(${NONE[lang]})`, 463, 48 + 23 * itemIdx + itemOffset);
      ctx.fillText("-", 448, 48 + 23 * itemIdx + itemOffset);
    }
    if (ship.slots[i] > 0) {
      if (ship.items[i] && ship.items[i].type[4] > 0) {
        ctx.fillStyle = "#0f0f0f";
      } else {
        ctx.fillStyle = "#aaaaaa";
      }
      ctx.textAlign = "right";
      ctx.font = "12px Meiryo";
      ctx.fillText(String(ship.slots[i]), 443, 46 + 23 * itemIdx + itemOffset);
      ctx.font = "16px Meiryo";
      ctx.textAlign = "left";
    }
    ctx.fillStyle = "#0f0f0f";
  }
  ctx.textAlign = "left";
  ctx.font = "12px Meiryo";
  ctx.fillStyle = "#008888";
  ctx.fillText("-------------------------------------------------", 421, 149);
  return canvas;
}

export async function generate74eoMiddleCutinFleetCanvasAsync(
  fleetName = "",
  ships: Ship[],
  los: { 1: number; 2: number; 3: number; 4: number; 5: number },
  airPower: { min: number; max: number },
  lang: "jp" | "en" | "ko" | "tcn" | "scn" = "jp"
): Promise<Canvas> {
  // const canvas = new Canvas(677, ships.length < 7 ? 1083 : 1250);
  const canvas = new Canvas(1346, ships.length < 7 ? 567 : 734);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const has5slot = ships.filter(ship => ship).some(ship => ship.slotNum === 5);

  (
    await Promise.all(
      ships
        .map((ship, index) => ({ index, ship }))
        .filter(data => data.ship)
        .map(async data => {
          return {
            ...data,
            image: await generate74eoMiddleCutinShipCanvasAsync(
              data.index,
              data.ship,
              has5slot,
              lang
            )
          };
        })
    )
  ).forEach(data =>
    ctx.drawImage(
      data.image,
      (data.index % 2) * 669,
      Math.floor(data.index / 2) * 172 + 43
    )
  );
  const equipmentIcons = await load74eoEquipmentIcons();

  ctx.fillStyle = "#0f0f0f";
  ctx.font = "24px Meiryo";
  ctx.fillText(fleetName, 8, 28);
  ctx.font = "12px Meiryo";
  const airPowerStringWidth = ctx.measureText(AirPower[lang]).width;
  const losValueStringWidth = ctx.measureText(LoS[lang]).width;
  ctx.font = "16px Meiryo";
  const { min, max } = airPower ? airPower : { min: 0, max: 0 };
  const airPowerString = min === max ? String(min) : `${min}~${max}`;
  ctx.fillText(airPowerString, 335 + airPowerStringWidth + 6, 32); // fixed
  ctx.fillText(
    (Math.floor(los[1] * 100) / 100).toFixed(2),
    335 +
      ctx.measureText(airPowerString).width +
      airPowerStringWidth +
      losValueStringWidth +
      49,
    32
  );
  ctx.strokeStyle = ctx.fillStyle = "#008888";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(8, 37.5);
  ctx.lineTo(canvas.width - 7, 37.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(8, canvas.height - 9.5);
  ctx.lineTo(canvas.width - 7, canvas.height - 9.5);
  ctx.stroke();
  ctx.font = "12px Meiryo";
  ctx.drawImage(equipmentIcons[6], 317, 18); // fixed
  ctx.fillText(AirPower[lang], 335, 30);
  ctx.drawImage(
    equipmentIcons[9],
    335 + ctx.measureText(airPowerString).width + airPowerStringWidth + 33,
    18
  );
  ctx.fillText(
    LoS[lang],
    335 + ctx.measureText(airPowerString).width + airPowerStringWidth + 51,
    30
  );
  return canvas;
}
