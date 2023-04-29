import {
  fetchLangData,
  toTranslateShipName,
  toTranslateEquipmentName,
  toAirPowerString,
} from "../utils";
import { createCanvas2D, Canvas } from "../canvas";
import { Ship, LoS, AirPower, ShipImageKind } from "../type";
import { LABEL, RANGE, SPEED, NONE, AIR_POWER, LOS, Lang } from "../lang";
import {
  load74eoParameterIcons,
  load74eoEquipmentIcons,
  load74eoAircraftLevelIcons,
  resize,
} from "../icon";

async function generate74eoLargeCardShipCanvasAsync(
  shipIdx: number,
  ship: Ship,
  lang: Lang = "jp"
): Promise<Canvas> {
  const { ships, items } =
    lang === "jp" ? { ships: null, items: null } : await fetchLangData(lang);
  const parameterIcons = await load74eoParameterIcons();
  const equipmentIcons = await load74eoEquipmentIcons(54);
  const aircraftLevelIcons = await load74eoAircraftLevelIcons();

  const { canvas, ctx } = createCanvas2D(470, 305);

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = `#0f0f0f`;
  ctx.font = "24px Meiryo";
  ctx.fillText(toTranslateShipName(ship.name, ships), 39, 26);
  ctx.fillStyle = "white";
  ctx.fillRect(194, 3, 55, 30);
  ctx.strokeStyle = ctx.fillStyle = "#088";
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
  ctx.drawImage(parameterIcons.HP, 19, 173);
  ctx.drawImage(parameterIcons.Armor, 19, 195);
  ctx.drawImage(parameterIcons.Evasion, 19, 217);
  ctx.drawImage(parameterIcons.Aircraft, 19, 239);
  ctx.drawImage(parameterIcons.Speed, 19, 261);
  ctx.drawImage(parameterIcons.Range, 19, 283);
  ctx.drawImage(parameterIcons.Firepower, 132, 173);
  ctx.drawImage(parameterIcons.Torpedo, 132, 195);
  ctx.drawImage(parameterIcons.AA, 132, 217);
  ctx.drawImage(parameterIcons.ASW, 132, 239);
  ctx.drawImage(parameterIcons.LOS, 132, 261);
  ctx.drawImage(parameterIcons.Luck, 132, 283);
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
  ctx.fillText(String(ship.armor), 113, 209);
  ctx.fillText(String(ship.evasion), 113, 231);
  ctx.fillText(String(ship.airPower.min), 113, 253);
  ctx.fillText(SPEED[ship.speed][lang], 113, 275);
  ctx.fillText(RANGE[ship.range][lang], 113, 297);
  ctx.fillText(String(ship.firepower), 226, 187);
  ctx.fillText(String(ship.torpedo), 226, 209);
  ctx.fillText(String(ship.aa), 226, 231);
  ctx.fillText(String(ship.asw), 226, 253);
  ctx.fillText(String(ship.los), 226, 275);
  ctx.fillText(String(ship.luck), 226, 297);
  for (let i = 0; i < ship.slotNum + 1; i++) {
    ctx.fillStyle = "#0f0f0f";
    ctx.font = "16px Meiryo";
    ctx.textAlign = "left";
    const itemIdx = i === ship.slotNum ? 5 : i;
    if (ship.items[i].id > 0) {
      const name = toTranslateEquipmentName(ship.items[i].name, items);
      ctx.fillText(name, 45, 53 + 22 * itemIdx);
      ctx.drawImage(
        equipmentIcons[ship.items[i].type[3]] ?? equipmentIcons.unknown,
        26,
        39 + 22 * itemIdx
      );
      if (ctx.measureText(name).width > 200) {
        const grd = ctx.createLinearGradient(222, 0, 247, 0);
        grd.addColorStop(0, "rgba(255,255,255,0)");
        grd.addColorStop(0.65, "white");
        grd.addColorStop(1, "white");
        ctx.fillStyle = grd;
        ctx.fillRect(222, 36 + 22 * itemIdx, 27, 21);
      }
      if (ship.items[i].alv > 0) {
        if (ctx.measureText(name).width > 150) {
          // オーバーレイ
          const grd = ctx.createLinearGradient(148, 0, 247, 0);
          grd.addColorStop(0, "rgba(255,255,255,0)");
          grd.addColorStop(0.55, "white");
          grd.addColorStop(1, "white");
          ctx.fillStyle = grd;
          ctx.fillRect(148, 36 + 22 * itemIdx, 100, 21);
        }
        // 熟練度
        ctx.drawImage(
          aircraftLevelIcons[ship.items[i].alv],
          204,
          39 + 22 * itemIdx
        );
      }
      if (ship.items[i].lv > 0) {
        if (ship.items[i].alv === 0 && ctx.measureText(name).width > 185) {
          // オーバーレイ
          const grd = ctx.createLinearGradient(188, 0, 247, 0);
          grd.addColorStop(0, "rgba(255,255,255,0)");
          grd.addColorStop(0.6, "white");
          grd.addColorStop(1, "white");
          ctx.fillStyle = grd;
          ctx.fillRect(188, 36 + 22 * itemIdx, 52, 21);
        }
        // 改修値
        ctx.font = "12px Meiryo";
        ctx.fillStyle = "#007F7F";
        ctx.textAlign = "right";
        ctx.fillText(`+${ship.items[i].lv}`, 247, 51 + 22 * itemIdx);
      }
    } else {
      ctx.fillText(`(${NONE[lang]})`, 45, 53 + 22 * itemIdx);
      ctx.fillText("-", 30, 53 + 22 * itemIdx);
    }
    if (ship.slots[i] > 0) {
      if (ship.items[i] && ship.items[i].type[4] > 0) {
        ctx.fillStyle = "#0f0f0f";
      } else {
        ctx.fillStyle = "#aaa";
      }
      ctx.textAlign = "right";
      ctx.font = "12px Meiryo";
      ctx.fillText(String(ship.slots[i]), 25, 51 + 22 * itemIdx);
      ctx.font = "16px Meiryo";
      ctx.textAlign = "left";
    }
  }
  if (ship.id > 0) {
    ctx.fillStyle = "white";
    ctx.fillRect(249, 1, 221, 301);
    const shipImage = resize(
      await ship.fetchImage(ShipImageKind.CARD),
      218,
      300
    );
    ctx.drawImage(shipImage, 249, 1);
  }
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
  los: LoS,
  airPower: AirPower,
  lang: Lang = "jp"
): Promise<Canvas> {
  const { canvas, ctx } = createCanvas2D(
    952,
    ships.filter((ship) => ship.id > 0).length < 7 ? 972 : 1279
  );

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  (
    await Promise.all(
      ships
        .map((ship, index) => ({ index, ship }))
        .filter((data) => data.ship.id > 0)
        .map(async (data) => {
          return {
            ...data,
            image: await generate74eoLargeCardShipCanvasAsync(
              data.index,
              data.ship,
              lang
            ),
          };
        })
    )
  ).forEach((data) =>
    ctx.drawImage(
      data.image,
      7 + (data.index % 2) * 472,
      Math.floor(data.index / 2) * 307 + 42
    )
  );
  const equipmentIcons = await load74eoEquipmentIcons(54);

  ctx.fillStyle = "#0f0f0f";
  ctx.font = "24px Meiryo";
  ctx.fillText(fleetName, 8, 29);
  ctx.font = "12px Meiryo";
  const airPowerStringWidth = ctx.measureText(AIR_POWER[lang]).width;
  const losValueStringWidth = ctx.measureText(LOS[lang]).width;
  ctx.font = "16px Meiryo";
  const airPowerString = toAirPowerString(airPower);
  ctx.fillText(airPowerString, 336 + airPowerStringWidth + 5, 32); // fixed
  ctx.fillText(
    (Math.floor(los[1] * 100) / 100).toFixed(2),
    383 +
      ctx.measureText(airPowerString).width +
      airPowerStringWidth +
      losValueStringWidth,
    32
  );
  ctx.strokeStyle = ctx.fillStyle = "#088";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(8, 37.5);
  ctx.lineTo(canvas.width - 7, 37.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(4, canvas.height - 9.5);
  ctx.lineTo(canvas.width - 4.5, canvas.height - 9.5);
  ctx.stroke();
  ctx.font = "12px Meiryo";
  ctx.drawImage(equipmentIcons[6], 317, 18); // fixed
  ctx.fillText(AIR_POWER[lang], 335, 30);
  ctx.drawImage(
    equipmentIcons[9],
    363 + ctx.measureText(airPowerString).width + airPowerStringWidth,
    18
  );
  ctx.fillText(
    LOS[lang],
    381 + ctx.measureText(airPowerString).width + airPowerStringWidth,
    30
  );
  return canvas;
}
