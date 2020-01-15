import {
  fetchLangData,
  MyCanvas,
  loadOriginalParameterIcons,
  loadOriginalEquipmentIcons,
  toTranslateShipName,
  toTranslateEquipmentName,
  FLEET,
  SPEED,
  NONE
} from "../utils";
import { Canvas, loadImage } from "canvas";
import { Ship } from "../type";

async function generateDarkShipInfoCanvasAsync(
  shipIdx: number,
  ship: Ship,
  lang: "jp" | "en" | "ko" | "tcn" | "scn" = "jp"
): Promise<Canvas> {
  const { ships, items } =
    lang === "jp" ? { ships: null, items: null } : await fetchLangData(lang);
  const image = await loadImage(
    `https://raw.githubusercontent.com/Nishisonic/gkcoi/master/static/ship/remodel/${ship.id}.png`
  );
  const parameterIcons = await loadOriginalParameterIcons();
  const equipmentIcons = await loadOriginalEquipmentIcons();
  const canvas = new Canvas(650, 176);
  const ctx = canvas.getContext("2d");
  // overlay
  ctx.fillStyle = "#1A1A1A";
  ctx.fillRect(0, 0, 650, 176);
  // ship
  ctx.drawImage(
    image,
    0,
    3,
    image.width,
    image.height,
    -100,
    0,
    image.width,
    image.height
  );
  // overlay
  const grd2 = ctx.createLinearGradient(0, 65, 998, 65);
  grd2.addColorStop(0.2, "rgba(26,26,26,0)");
  grd2.addColorStop(0.45, "#1A1A1A");
  grd2.addColorStop(0.8, "#1A1A1A");
  grd2.addColorStop(1, "rgba(255,255,255,1)");
  ctx.fillStyle = grd2;
  ctx.fillRect(0, 0, 650, 176);
  // overlay
  const grd3 = ctx.createLinearGradient(499, 0, 499, 173);
  grd3.addColorStop(0, "#1A1A1A");
  grd3.addColorStop(0.3, "rgba(26,26,26,0)");
  grd3.addColorStop(0.8, "rgba(255,255,255,0)");
  grd3.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grd3;
  ctx.fillRect(0, 0, 499, 176);
  // name
  ctx.font = "20px Meiryo";
  ctx.fillStyle = "#49A7A2";
  ctx.fillText(`#${shipIdx + 1}`, 14, 26);
  ctx.font = "28px Meiryo";
  ctx.fillStyle = "#FFF";
  ctx.fillText(toTranslateShipName(ship.name, ships), 50, 30);
  // lv
  ctx.font = "12px Meiryo";
  ctx.fillStyle = "#49A7A2";
  ctx.fillText("Lv.", 405, 28);
  ctx.font = "21px Meiryo";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "right";
  ctx.fillText(String(ship.lv), 465, 28);
  // parameter
  ctx.font = "16px Meiryo";
  ctx.textAlign = "right";
  ctx.drawImage(parameterIcons["hp"], 476, 14);
  ctx.drawImage(parameterIcons["as"], 532, 13);
  ctx.drawImage(parameterIcons["luck"], 588, 13);
  ctx.fillText(String(ship.hp), 529, 28);
  ctx.fillText(String(ship.as), 585, 28);
  ctx.fillText(String(ship.lk), 638, 28);
  // equipment
  ctx.font = "14px Meiryo";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  for (let i = 0; i < 6; i++) {
    if (ship.items[i]) {
      ctx.fillText(
        toTranslateEquipmentName(ship.items[i].name, items),
        420,
        52 + 23 * i
      );
      ctx.drawImage(
        equipmentIcons[String(ship.items[i].type[3])],
        389,
        33 + 23 * i
      );
    } else {
      const none = NONE[lang];
      ctx.fillText(`(${none})`, 420, 52 + 23 * i);
      ctx.fillText("-", 402, 53 + 23 * i);
    }
    if (ship.slotNum > i) {
      if (ship.items[i] && ship.items[i].type[4] !== 0) {
        ctx.textAlign = "right";
        ctx.fillStyle = "#c3c3c3";
        ctx.fillText(String(ship.slots[i]), 388, 52 + 23 * i);
        ctx.textAlign = "left";
        ctx.fillStyle = "#fff";
      }
    } else {
      break;
    }
  }
  // overlay
  const grd4 = ctx.createLinearGradient(590, 65, 998, 65);
  grd4.addColorStop(0, "rgba(26,26,26,0)");
  grd4.addColorStop(0.08, "rgba(26,26,26,1)");
  grd4.addColorStop(1, "rgba(26,26,26,1)");
  ctx.fillStyle = grd4;
  ctx.fillRect(0, 40, 650, 130);
  // star
  ctx.font = "16px Meiryo";
  ctx.fillStyle = "#49A7A2";
  const LV_STRING = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "m"];
  for (let i = 0; i < 6; i++) {
    if (ship.items[i] && ship.items[i].rf > 0) {
      ctx.textAlign = "left";
      ctx.fillText("★", 611, 53 + 23 * i);
      ctx.textAlign = "center";
      ctx.fillText(LV_STRING[ship.items[i].rf], 635, 53 + 23 * i);
    }
  }
  return canvas;
}

async function generateDarkShipCanvasAsync(
  shipIdx: number,
  ship: Ship,
  lang: "jp" | "en" | "ko" | "tcn" | "scn" = "jp"
): Promise<Canvas> {
  const canvas = new Canvas(654, 180);
  const ctx = canvas.getContext("2d");
  const shipInfoCanvas = await generateDarkShipInfoCanvasAsync(
    shipIdx,
    ship,
    lang
  );
  ctx.drawImage(shipInfoCanvas, 2, 2);
  ctx.strokeStyle = "#434343";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 652, 178);
  return canvas;
}

export async function generateDarkFleetCanvasAsync(
  fleetIdx: number,
  ships: Ship[],
  los: { 1: number; 2: number; 3: number; 4: number; 5: number },
  airPower: { min: number; max: number },
  speed: "NONE" | "SLOW" | "FAST" | "FASTER" | "FASTEST",
  lang: "jp" | "en" | "ko" | "tcn" | "scn" = "jp"
): Promise<Canvas> {
  const parameterIcons = await loadOriginalParameterIcons();
  const canvas = new Canvas(1310, ships.length < 7 ? 586 : 768);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#212121";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const shipCanvases = await Promise.all(
    ships.map(async (ship, shipIdx) => {
      const shipCanvas = await generateDarkShipCanvasAsync(shipIdx, ship, lang);
      return new MyCanvas(String(shipIdx), shipCanvas);
    })
  );

  shipCanvases.forEach(shipCanvas => {
    ctx.drawImage(
      shipCanvas.canvas,
      (Number(shipCanvas.id) % 2) * 656,
      Math.floor(Number(shipCanvas.id) / 2) * 182 + 40
    );
  });

  ctx.font = "bold 20px Meiryo";
  ctx.fillStyle = "#fff";
  ctx.fillText(`Fleet #${Number(fleetIdx) + 1}`, 20, 30);
  ctx.drawImage(parameterIcons["air"], 172, 11);
  const { min, max } = airPower ? airPower : { min: 0, max: 0 };
  ctx.fillText(min === max ? String(min) : `${min}~${max}`, 200, 30);
  ctx.drawImage(parameterIcons["los"], 346, 12);
  ctx.fillText((Math.floor(los[1] * 100) / 100).toFixed(2), 380, 30);
  ctx.drawImage(parameterIcons["los"], 476, 12);
  ctx.fillText((Math.floor(los[2] * 100) / 100).toFixed(2), 510, 30);
  ctx.drawImage(parameterIcons["los"], 606, 12);
  ctx.fillText((Math.floor(los[3] * 100) / 100).toFixed(2), 640, 30);
  ctx.drawImage(parameterIcons["los"], 736, 12);
  ctx.fillText((Math.floor(los[4] * 100) / 100).toFixed(2), 770, 30);
  ctx.drawImage(parameterIcons["los"], 866, 12);
  ctx.fillText((Math.floor(los[5] * 100) / 100).toFixed(2), 900, 30);
  ctx.font = "11px Meiryo";
  ctx.fillText("1", 365, 32);
  ctx.fillText("2", 495, 32);
  ctx.fillText("3", 625, 32);
  ctx.fillText("4", 755, 32);
  ctx.fillText("5", 885, 32);
  // 速力
  ctx.drawImage(parameterIcons["soku"], 1000, 13);
  ctx.font = "bold 18px Meiryo";
  ctx.fillText(`${SPEED[speed][lang]}${FLEET[lang]}`, 1033, 29);
  return canvas;
}
