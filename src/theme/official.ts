import {
  fetchLangData,
  toTranslateEquipmentName,
  toTranslateShipName,
} from "../utils";
import { createCanvas2D, Canvas } from "../canvas";
import { Ship, ShipImageKind } from "../type";
import { Lang } from "../lang";
import {
  loadOfficialEquipmentIcons,
  loadOfficialCommonMainIcons,
  loadOfficialCommonMiscIcons,
  loadOfficialHpGaugeIcons,
  resize,
} from "../icon";
import { stick } from "../stick";

function getOffset(type: number): { x: number; y: number } {
  switch (type) {
    case 0:
      return { x: 0, y: 0 };
    case 1:
      return { x: -6, y: -6 };
    case 2:
      return { x: 0, y: -2 };
    case 3:
      return { x: -5, y: -6 };
    case 5:
      return { x: -4, y: -5 };
    case 6:
    case 7:
    case 8:
      return { x: -3, y: 0 };
    case 9:
      return { x: -8, y: -5 };
    case 10:
      return { x: 2, y: 0 };
    case 11:
      return { x: 0, y: 0 };
    case 12:
      return { x: -5, y: -3 };
    case 13:
      return { x: -6, y: -6 };
    case 14:
      return { x: -5, y: -6 };
    case 15:
    case 19:
      return { x: 0, y: 0 };
    case 21:
      return { x: -3, y: -3 };
    case 22:
    case 23:
      return { x: -5, y: -3 };
    case 29:
      return { x: -6, y: -5 };
    default:
      return { x: -5, y: -5 };
  }
}

async function generateOfficialShipCanvasAsync(
  ship: Ship,
  lang: Lang = "jp"
): Promise<Canvas> {
  const { ships, items } =
    lang === "jp" ? { ships: null, items: null } : await fetchLangData(lang);
  const commonMain = await loadOfficialCommonMainIcons();
  const commonMisc = await loadOfficialCommonMiscIcons();
  const hpGauge = await loadOfficialHpGaugeIcons();
  const equipmentIcons = await loadOfficialEquipmentIcons(true);
  const { canvas, ctx } = createCanvas2D(684, 546);
  ctx.drawImage(commonMain[12], -17, -12);
  if (ship.id > 0) {
    const shipImage = await ship.fetchImage(ShipImageKind.CARD);
    ctx.drawImage(shipImage, 352, 12);
  }
  ctx.fillStyle = `#54483c`;
  ctx.font = "26px Meiryo";
  ctx.fillText(toTranslateShipName(ship.name, ships), 26, 35);
  ctx.drawImage(commonMisc[180], 212, 17);
  ctx.drawImage(commonMain[26], 305, 6);
  for (let i = 211; i <= 283; i += 18) {
    ctx.drawImage(commonMain[48], i, 59);
  }
  ctx.drawImage(commonMain[14], 34, 338);
  ctx.drawImage(commonMain[61], 347, 465);
  ctx.drawImage(commonMain[18], 434, 468);
  ctx.drawImage(commonMain[19], 437, 471);
  ctx.drawImage(commonMain[62], 514, 486);
  ctx.drawImage(commonMain[41], 388, 503);
  ctx.drawImage(hpGauge.hp_gauge_mask, 26, 59);
  ctx.fillStyle = "#0f0";
  ctx.fillRect(28, 60, 92, 8);
  ctx.drawImage(hpGauge.hp_s_bg2, 26, 59);
  ctx.fillStyle = `#54483c`;
  ctx.font = "17px Meiryo";
  ctx.fillText("0", 437, 496);
  ctx.font = "16px Meiryo";
  ctx.fillText(`${ship.hp}/${ship.hp}`, 135, 70);
  ctx.font = "30px Meiryo";
  ctx.textAlign = "right";
  ctx.fillText(`${ship.lv}`, 304, 40);
  ctx.textAlign = "left";
  for (let i = 0; i < 4; i++) {
    ctx.drawImage(commonMain[42], 34, 87 + 47 * i);
  }
  for (let i = 0; i < ship.slotNum; i++) {
    ctx.drawImage(commonMain[41], 34, 87 + 47 * i);
    const item = ship.items[i];
    if (item.id > 0) {
      const offset = getOffset(item.type[3]);
      ctx.drawImage(
        equipmentIcons[ship.items[i].type[3]],
        34 + offset.x,
        87 + offset.y + 47 * i
      );
      const grd = ctx.createLinearGradient(84, 0, 324, 0);
      grd.addColorStop(0, "#54483c");
      grd.addColorStop(0.6, "#54483c");
      grd.addColorStop(0.95, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grd;
      ctx.font = "23px Meiryo";
      ctx.textAlign = "right";
      if (item.type[4] > 0) {
        ctx.fillText(`${ship.slots[i]}`, 31, 119 + 47 * i);
      }
      ctx.font = "19px Meiryo";
      ctx.textAlign = "left";
      const itemName = toTranslateEquipmentName(item.name, items);
      ctx.fillText(itemName, 84, 116 + 47 * i);
      if (item.lv === 10) {
        ctx.drawImage(commonMain[29], 289, 95 + 47 * i);
      } else if (item.lv > 0) {
        ctx.drawImage(resize(commonMain[28], 18, 18), 281, 101 + 47 * i);
        ctx.drawImage(commonMain[27], 298, 104 + 47 * i);
        ctx.fillStyle = "#44a8a4";
        ctx.font = "21px Meiryo";
        ctx.fillText(`${item.lv}`, 311, 118 + 47 * i);
      }
      if (item.alv > 0) {
        ctx.drawImage(
          commonMisc[[, 169, 170, 171, 172, 173, 174, 175][item.alv] || 175],
          253,
          90 + 47 * i
        );
      }
    }
  }
  const exItem = ship.items[ship.slotNum];
  if (exItem && exItem.id > 0) {
    ctx.font = "19px Meiryo";
    const grd = ctx.createLinearGradient(438, 0, 678, 0);
    grd.addColorStop(0, "#54483c");
    grd.addColorStop(0.6, "#54483c");
    grd.addColorStop(0.95, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grd;
    const offset = getOffset(exItem.type[3]);
    ctx.drawImage(
      equipmentIcons[exItem.type[3]],
      388 + offset.x,
      503 + offset.y
    );
    const itemName = toTranslateEquipmentName(exItem.name, items);
    ctx.fillText(itemName, 438, 532);
  }

  ctx.font = "22px Meiryo";
  ctx.textAlign = "right";
  [
    [ship.hp, ship.firepower],
    [ship.armor, ship.torpedo],
    [ship.evasion, ship.aa],
    [ship.slots.reduce((p, v) => p + v, 0), ship.asw],
    [, ship.los],
    [, ship.luck],
  ].forEach((v, i) => {
    if (v[0] !== undefined) {
      ctx.fillText(`${v[0]}`, 170, 361 + 34.5 * i);
    }
    if (v[1] != undefined) {
      ctx.fillText(`${v[1]}`, 319, 361 + 34.5 * i);
    }
  });
  const speedImage = {
    20: commonMain[55],
    15: commonMain[50],
    10: commonMain[49],
    5: commonMain[52],
    0: commonMain[56],
  };
  ctx.drawImage(speedImage[ship.speed], 126, 481);
  const rangeImage = {
    4: { image: commonMain[58], x: 126, y: 515 },
    3: { image: commonMain[51], x: 136, y: 515 },
    2: { image: commonMain[53], x: 136, y: 515 },
    1: { image: commonMain[57], x: 136, y: 515 },
    0: { image: commonMain[54], x: 136, y: 515 },
  };
  const { image, x, y } = rangeImage[ship.range];
  ctx.drawImage(image, x, y);

  return canvas;
}

/**
 * 公式バージョンを出力する
 * @param ships 艦
 * @param lang 言語
 * @return 画像
 */
export async function generateOfficialFleetCanvasAsync(
  ships: Ship[],
  lang: Lang = "jp"
): Promise<Canvas> {
  const { canvas, ctx } = createCanvas2D(
    1368,
    ships.filter((ship) => ship.id > 0).length > 6 ? 2184 : 1638
  );
  ctx.fillStyle = "#ece3d7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const fimage = stick(
    await Promise.all(
      ships
        .map((ship, index) => ({ index, ship }))
        .filter((data) => data.ship.id > 0)
        .map(async (data) => {
          return await generateOfficialShipCanvasAsync(data.ship, lang);
        })
    ),
    2,
    "#ece3d7"
  );
  ctx.drawImage(fimage, 0, 0);
  return canvas;
}
