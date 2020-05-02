import {
  fetchLangData,
  load74eoParameterIcons,
  load74eoEquipmentIcons,
  toTranslateEquipmentName,
  NONE,
  AIR_POWER,
  LOS,
  resize,
} from "../utils";
import { createCanvas2D, loadImage, Canvas } from "../canvas";
import { Ship } from "../type";

async function generate74eoSmallBannerShipCanvasAsync(
  ship: Ship,
  has5slot: boolean,
  lang: "jp" | "en" | "ko" | "tcn" | "scn" = "jp"
): Promise<Canvas> {
  const items = lang === "jp" ? null : (await fetchLangData(lang)).items;
  const parameterIcons = await load74eoParameterIcons();
  const equipmentIcons = await load74eoEquipmentIcons();
  const offset = has5slot ? 0 : 18;
  const { canvas, ctx } = createCanvas2D(213, 151 - offset);
  ctx.fillStyle = "#FFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (ship.id > 0) {
    const shipImage = resize(
      await loadImage(
        `https://raw.githubusercontent.com/Nishisonic/gkcoi/master/static/ship/banner/${ship.id}.png`
      ),
      160,
      40
    );
    ctx.drawImage(shipImage, 1, 1);
  }

  ctx.strokeStyle = ctx.fillStyle = "#008888";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(5, 149.5 - offset);
  ctx.lineTo(209, 149.5 - offset);
  ctx.stroke();
  ctx.font = "12px Meiryo";
  ctx.fillText("L", 163, 14);
  ctx.fillText("v", 170, 14);
  ctx.fillText(".", 177, 14);
  ctx.drawImage(parameterIcons["Luck"], 161, 18);
  ctx.fillStyle = "#0f0f0f";
  ctx.textAlign = "right";
  ctx.fillText(String(ship.lv), 208, 14);
  ctx.fillText(String(ship.luck), 208, 31);
  for (let i = 0; i < ship.slotNum + 1; i++) {
    const itemIdx = i < ship.slotNum ? i : 5 + (offset > 0 ? -1 : 0);
    ctx.textAlign = "left";
    if (ship.items[i].id > 0) {
      const name = toTranslateEquipmentName(ship.items[i].name, items);
      const nameWidth = ctx.measureText(name).width;
      ctx.fillText(name, 40, 55 + 18 * itemIdx);
      ctx.drawImage(
        equipmentIcons[ship.items[i].type[3]],
        22,
        42 + 18 * itemIdx
      );
      if (nameWidth > 170) {
        const grd = ctx.createLinearGradient(205, 0, 215, 0);
        grd.addColorStop(0, "rgba(255,255,255,0)");
        grd.addColorStop(0.6, "rgba(255,255,255,1)");
        grd.addColorStop(1, "rgba(255,255,255,1)");
        ctx.fillStyle = grd;
        ctx.fillRect(205, 42 + 18 * itemIdx, 10, 17);
      }
      if (ship.items[i].lv > 0) {
        if (nameWidth > 145) {
          // オーバーレイ
          const grd = ctx.createLinearGradient(180, 0, 215, 0);
          grd.addColorStop(0, "rgba(255,255,255,0)");
          grd.addColorStop(0.3, "rgba(255,255,255,1)");
          grd.addColorStop(1, "rgba(255,255,255,1)");
          ctx.fillStyle = grd;
          ctx.fillRect(180, 42 + 18 * itemIdx, 35, 17);
        }
        // 改修値
        ctx.font = "12px Meiryo";
        ctx.fillStyle = "#007F7F";
        ctx.textAlign = "right";
        ctx.fillText(
          `+${ship.items[i].lv}`,
          Math.min(nameWidth + 72, 210),
          55 + 18 * itemIdx
        );
      }
    } else {
      ctx.fillText(`(${NONE[lang]})`, 40, 55 + 18 * itemIdx);
      ctx.fillText("-", 28, 54 + 18 * itemIdx);
    }
    if (ship.slots[i] > 0) {
      if (ship.items[i] && ship.items[i].type[4] > 0) {
        ctx.fillStyle = "#0f0f0f";
      } else {
        ctx.fillStyle = "#aaaaaa";
      }
      ctx.textAlign = "right";
      ctx.font = "12px Meiryo";
      ctx.fillText(String(ship.slots[i]), 20, 55 + 18 * i);
    }
    ctx.fillStyle = "#0f0f0f";
  }
  ctx.textAlign = "left";
  ctx.font = "12px Meiryo";
  ctx.fillStyle = "#008888";
  ctx.fillText("----------------------------------------", 6, 135 - offset);
  return canvas;
}

/**
 * 【七四式】バナー(小型)バージョンを出力する
 * @param fleetName 艦隊名
 * @param ships 艦
 * @param los 索敵
 * @param airPower 制空値
 * @param lang 言語
 * @pram has5slot 5スロット目は存在するか
 * @return 画像
 */
export async function generate74eoSmallBannerFleetCanvasAsync(
  fleetName: string,
  ships: Ship[],
  los: { 1: number; 2: number; 3: number; 4: number; 5: number },
  airPower: { min: number; max: number },
  lang: "jp" | "en" | "ko" | "tcn" | "scn" = "jp",
  has5slot = false
): Promise<Canvas> {
  const { canvas, ctx } = createCanvas2D(
    434,
    ships.filter((ship) => ship.id > 0).length > 6
      ? 785 - (has5slot ? 0 : 72)
      : 533 - (has5slot ? 0 : 54)
  );
  ctx.fillStyle = "#FFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  (
    await Promise.all(
      ships
        .map((ship, index) => ({ index, ship }))
        .filter((data) => data.ship.id > 0)
        .map(async (data) => {
          return {
            ...data,
            image: await generate74eoSmallBannerShipCanvasAsync(
              data.ship,
              has5slot,
              lang
            ),
          };
        })
    )
  ).forEach((data) =>
    ctx.drawImage(
      data.image,
      (data.index % 2) * 213 + 5,
      Math.floor(data.index / 2) * (152 - (has5slot ? 0 : 18)) + 64
    )
  );
  const equipmentIcons = await load74eoEquipmentIcons();

  ctx.fillStyle = "#0f0f0f";
  ctx.font = "24px Meiryo";
  ctx.fillText(fleetName, 8, 29);
  ctx.font = "12px Meiryo";
  const airPowerStringWidth = ctx.measureText(AIR_POWER[lang]).width;
  const losValueStringWidth = ctx.measureText(LOS[lang]).width;
  ctx.font = "16px Meiryo";
  const { min, max } = airPower || { min: 0, max: 0 };
  const airPowerString = min === max ? String(min) : `${min}~${max}`;
  ctx.fillText(airPowerString, 30 + airPowerStringWidth + 6, 54); // fixed
  ctx.fillText(
    (Math.floor(los[1] * 100) / 100).toFixed(2),
    30 +
      ctx.measureText(airPowerString).width +
      airPowerStringWidth +
      losValueStringWidth +
      49,
    54
  );
  ctx.strokeStyle = ctx.fillStyle = "#008888";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(8, 59.5);
  ctx.lineTo(canvas.width - 7, 59.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(4, canvas.height - 9.5);
  ctx.lineTo(canvas.width - 7, canvas.height - 9.5);
  ctx.stroke();
  ctx.font = "12px Meiryo";
  ctx.drawImage(equipmentIcons[6], 12, 40);
  ctx.fillText(AIR_POWER[lang], 30, 52);
  ctx.drawImage(
    equipmentIcons[9],
    25 + ctx.measureText(airPowerString).width + airPowerStringWidth + 33,
    40
  );
  ctx.fillText(
    LOS[lang],
    25 + ctx.measureText(airPowerString).width + airPowerStringWidth + 51,
    52
  );
  return canvas;
}
