import {
  fetchLangData,
  toTranslateShipName,
  toTranslateEquipmentName,
  resize,
  toAirPowerString,
} from "../utils";
import { createCanvas2D, Canvas } from "../canvas";
import { Ship, LoS, AirPower, ShipImageKind } from "../type";
import { Lang, NONE, AIR_POWER, LOS } from "../lang";
import { load74eoParameterIcons, load74eoEquipmentIcons } from "../icon";

async function generate74eoMediumCutinShipCanvasAsync(
  shipIdx: number,
  ship: Ship,
  has5slot: boolean,
  lang: Lang = "jp"
): Promise<Canvas> {
  const { ships, items } =
    lang === "jp" ? { ships: null, items: null } : await fetchLangData(lang);
  const albumStatusImage = resize(
    await ship.fetchImage(ShipImageKind.ALBUM_STATUS),
    436,
    63
  );
  const parameterIcons = await load74eoParameterIcons();
  const equipmentIcons = await load74eoEquipmentIcons();
  const { canvas, ctx } = createCanvas2D(677, 172);
  ctx.fillStyle = "#FFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 5スロ位置基準
  const offset = has5slot ? 0 : 25;
  const itemOffset = has5slot ? 0 : 23;
  if (ship.id > 0) {
    const shipImage = resize(
      await ship.fetchImage(ShipImageKind.REMODEL),
      665,
      121
    );
    ctx.drawImage(shipImage, 4, 46);
  }
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
  ctx.drawImage(parameterIcons.HP, 432, 3 + offset);
  ctx.drawImage(parameterIcons.ASW, 500, 3 + offset);
  ctx.drawImage(parameterIcons.Luck, 568, 3 + offset);
  ctx.font = "16px Meiryo";
  ctx.fillStyle = "#0f0f0f";
  ctx.textAlign = "right";
  ctx.fillText(String(ship.lv), 414, 17 + offset);
  ctx.fillText(String(ship.hp), 482, 17 + offset);
  ctx.fillText(String(ship.asw), 549, 17 + offset);
  ctx.fillText(String(ship.luck), 617, 17 + offset);
  for (let i = 0; i < ship.slotNum + 1; i++) {
    ctx.font = "16px Meiryo";
    ctx.textAlign = "left";
    const itemIdx = i < ship.slotNum ? i : 5 + (offset > 0 ? -1 : 0);
    if (ship.items[i].id > 0) {
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
      if (ship.items[i].lv > 0) {
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
          `+${ship.items[i].lv}`,
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

/**
 * 【七四式】カットイン(中型)バージョンを出力する
 * @param fleetName 艦隊名
 * @param ships 艦
 * @param los 索敵
 * @param airPower 制空値
 * @param lang 言語
 * @pram has5slot 5スロット目は存在するか
 * @return 画像
 */
export async function generate74eoMediumCutinFleetCanvasAsync(
  fleetName: string,
  ships: Ship[],
  los: LoS,
  airPower: AirPower,
  lang: Lang = "jp",
  has5slot = false
): Promise<Canvas> {
  const { canvas, ctx } = createCanvas2D(
    1346,
    ships.filter((ship) => ship.id > 0).length < 7 ? 567 : 734
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
            image: await generate74eoMediumCutinShipCanvasAsync(
              data.index,
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
      (data.index % 2) * 669,
      Math.floor(data.index / 2) * 172 + 43
    )
  );
  const equipmentIcons = await load74eoEquipmentIcons();

  ctx.fillStyle = "#0f0f0f";
  ctx.font = "24px Meiryo";
  ctx.fillText(fleetName, 8, 28);
  ctx.font = "12px Meiryo";
  const airPowerStringWidth = ctx.measureText(AIR_POWER[lang]).width;
  const losValueStringWidth = ctx.measureText(LOS[lang]).width;
  ctx.font = "16px Meiryo";
  const airPowerString = toAirPowerString(airPower);
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
  ctx.fillText(AIR_POWER[lang], 335, 30);
  ctx.drawImage(
    equipmentIcons[9],
    335 + ctx.measureText(airPowerString).width + airPowerStringWidth + 33,
    18
  );
  ctx.fillText(
    LOS[lang],
    335 + ctx.measureText(airPowerString).width + airPowerStringWidth + 51,
    30
  );
  return canvas;
}
