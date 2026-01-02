import {
  fetchLangData,
  toTranslateShipName,
  toTranslateEquipmentName,
  toAirPowerString,
  getDistance,
  getAirbaseAirPower,
  calcCanAACIList,
  getContactValue,
} from "../utils";
import { createCanvas2D, Canvas, fetchImage, loadFont } from "../canvas";
import {
  Ship,
  Airbase,
  AirState,
  Speed,
  LoS,
  AirPower,
  ShipImageKind,
  Item,
  Apidata,
  DeckBuilderOptions,
} from "../type";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { NONE, SPEED, FLEET, DISTANCE, AIR_POWER, Lang, STYPE } from "../lang";
import {
  loadOfficialParameterIcons,
  loadOfficialEquipmentIcons,
} from "../icon";

Chart.register(ChartDataLabels);

async function generateFlatShipInfoCanvasAsync(
  shipIdx: number,
  ship: Ship,
  lang: Lang = "jp",
  options?: DeckBuilderOptions,
): Promise<Canvas> {
  const { ships, items } =
    lang === "jp" ? { ships: null, items: null } : await fetchLangData(lang);
  const equipmentIcons = await loadOfficialEquipmentIcons();
  const { canvas, ctx } = createCanvas2D(650, 176);
  ctx.fillStyle = "white";
  ctx.strokeStyle = "#C2C3C5";
  drawRoundedRect(ctx, 1, 1, 648, 174, 4);
  ctx.fill();
  ctx.stroke();
  ctx.clip();
  ctx.drawImage(
    await fetchImage("/static/flat/sally_map_parts_15.png"),
    -456,
    -456,
    456 * 2,
    456 * 2,
  );

  ctx.fillStyle = ctx.strokeStyle = "#364D6F";
  drawRoundedRect(ctx, 7, 7, 20, 20, 1);
  ctx.fillStyle = "white";
  ctx.font = "bold 14px Oxanium";
  ctx.textAlign = "center";
  ctx.fillText(`${shipIdx + 1}`, 17, 22);
  ctx.textAlign = "left";
  ctx.strokeStyle = "black";

  if (ship.id > 0 && !options?.hideShipImage) {
    const { canvas: canvas2, ctx: ctx2 } = createCanvas2D(351, 132);
    const image = await ship.fetchImage(ShipImageKind.REMODEL);
    // ship
    ctx2.fillStyle = "#ABDFF5";
    ctx2.fillRect(0, 0, 351, 132);
    const menuImage = await fetchImage(`/static/flat/record_menu_0.png`);
    ctx2.drawImage(
      menuImage,
      0,
      0,
      menuImage.width,
      menuImage.height,
      0,
      0,
      351,
      (menuImage.height * 351) / menuImage.height,
    );
    ctx2.drawImage(
      image,
      0,
      3,
      image.width - 430,
      image.height,
      -75,
      0,
      (image.width - 430) * 0.75,
      image.height * 0.75,
    );
    ctx2.beginPath();
    ctx2.moveTo(0, 0); // 左上
    ctx2.lineTo(30, 0); // 右上
    ctx2.lineTo(0, 132); // 右下
    ctx2.lineTo(0, 0); // 左下
    ctx2.closePath();
    ctx2.globalCompositeOperation = "destination-out";
    ctx2.fill();
    ctx2.beginPath();
    ctx2.lineTo(351, 0); // 右上
    ctx2.lineTo(351, 132); // 右下
    ctx2.lineTo(321, 132); // 左下
    ctx2.moveTo(351, 0); // 左上
    ctx2.closePath();
    ctx2.fill();
    ctx2.globalCompositeOperation = "source-over";

    ctx2.fillStyle = "#364D6F";
    ctx2.beginPath();
    ctx2.lineTo(291, 105); // 左上
    ctx2.lineTo(324.5, 105); // 右上
    ctx2.lineTo(318.5, 129.5); // 左下
    ctx2.lineTo(284, 129.5); // 右下
    ctx2.closePath();
    ctx2.fill();
    ctx2.stroke();
    ctx2.font = "14px Oxanium";
    ctx2.fillStyle = "white";
    ctx2.textAlign = "center";
    ctx2.fillText(STYPE[ship.stype], 305, 122);

    ctx.drawImage(canvas2, 10, 7);
    ctx.beginPath();
    ctx.moveTo(30 + 10, 0 + 7); // 左上
    ctx.lineTo(351 + 10, 0 + 7); // 右上
    ctx.lineTo(321 + 10, 132 + 7); // 右下
    ctx.lineTo(0 + 10, 132 + 7); // 左下
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = "#364D6F";
    ctx.beginPath();
    ctx.moveTo(10 + 10, 141 + 7); // 左上
    ctx.lineTo(281, 141 + 7); // 右上
    ctx.lineTo(271, 162 + 7); // 右下
    ctx.lineTo(0 + 10, 162 + 7); // 左下
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(291, 141 + 7); // 左上
    ctx.lineTo(361, 141 + 7); // 右上
    ctx.lineTo(351, 162 + 7); // 右下
    ctx.lineTo(281, 162 + 7); // 左下
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.font = "10px Noto Sans JP";
    ctx.fillStyle = "white";
    ctx.fillText("Lv.", 291, 166);
    ctx.textAlign = "center";
    ctx.font = "bold 18px Noto Sans JP";
    ctx.fillText(`${ship.lv}`, 326, 166);
    ctx.fillText(ship.name, 145.5, 166);
  }

  ctx.font = "14px Noto Sans JP";
  ctx.textAlign = "left";
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = "#364D6F";
    ctx.fillRect(378, 7 + i * 28, 264, 23);
    ctx.strokeRect(378, 7 + i * 28, 264, 23);
    ctx.fillStyle = "#212121";
    ctx.beginPath();
    ctx.arc(390, 18 + i * 28, 11, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.moveTo(610, 8 + i * 28);
    ctx.lineTo(615, 8 + 21 / 2 + i * 28);
    ctx.lineTo(610, 8 + 21 + i * 28);
    ctx.lineTo(642, 8 + 21 + i * 28);
    ctx.lineTo(642, 8 + i * 28);
    ctx.lineTo(610, 8 + i * 28);
    ctx.stroke();
    ctx.fillStyle = "#3A5B86";
    ctx.fill();
    ctx.closePath();

    if (!ship.items[i]) {
      continue;
    }
    ctx.fillStyle = "white";
    if (ship.items[i].id > 0) {
      const { canvas: canvas2, ctx: ctx2 } = createCanvas2D(204, 20);
      // ctx.
      ctx2.font = "12px Noto Sans JP";
      ctx2.textAlign = "left";
      ctx2.fillStyle = "white";
      ctx2.fillText(toTranslateEquipmentName(ship.items[i].name, items), 0, 15);
      const grad = ctx.createLinearGradient(
        190,
        canvas2.height / 2,
        204,
        canvas2.height / 2,
      );
      grad.addColorStop(0, "rgba(54, 77, 111, 0)");
      grad.addColorStop(1, "rgba(54, 77, 111, 1)");
      ctx2.fillStyle = grad;
      ctx2.fillRect(0, 0, canvas2.width, canvas2.height);
      ctx.drawImage(canvas2, 405, 8 + 28 * i);
      ctx.textAlign = "left";
      const equipIcon = equipmentIcons[String(ship.items[i].type[3])];
      if (equipIcon) {
        ctx.textAlign = "center";
        ctx.drawImage(
          equipIcon,
          0,
          0,
          equipIcon.width,
          equipIcon.height,
          379,
          7 + 28 * i,
          equipIcon.width * 0.75,
          equipIcon.height * 0.75,
        );
      }

      ctx.textAlign = "center";
      ctx.font = "10px Noto Sans JP";
      ctx.fillStyle = "white";
      const LV_STRING = [
        " - ",
        " 1 ",
        " 2 ",
        " 3 ",
        " 4 ",
        " 5 ",
        " 6 ",
        " 7 ",
        " 8 ",
        " 9 ",
        "max",
      ];
      ctx.fillText("★", 629, 17 + 28 * i);
      ctx.fillText(LV_STRING[ship.items[i].lv], 629, 27 + 28 * i);
    }
  }
  return canvas;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
  ctx.fill(); // 塗りつぶし
  ctx.stroke(); // 枠線を描く
}

async function generateFlatShipCanvasAsync(
  shipIdx: number,
  ship: Ship,
  lang: Lang = "jp",
  options?: DeckBuilderOptions,
): Promise<Canvas> {
  const { canvas, ctx } = createCanvas2D(654, 180);
  const shipInfoCanvas = await generateFlatShipInfoCanvasAsync(
    shipIdx,
    ship,
    lang,
    options,
  );
  ctx.drawImage(shipInfoCanvas, 2, 2);
  return canvas;
}

/**
 * 【オリジナル】ダークバージョンを出力する
 * @param fleetIdx 艦隊番号
 * @param ships 艦
 * @param los 索敵
 * @param airPower 制空値
 * @param speed 艦速(0=陸上、5=低速、10=高速、15=高速+、20=最速)
 * @param lang 言語
 * @return 画像
 */
export async function generateFlatFleetCanvasAsync(
  fleetIdx: number,
  ships: Ship[],
  los: LoS,
  airPower: AirPower,
  speed: Speed,
  lang: Lang = "jp",
  options?: DeckBuilderOptions,
): Promise<Canvas> {
  await loadFont({
    family: "Noto Sans JP",
    source: "url(/static/fonts/NotoSansJP-VariableFont_wght.ttf)",
  });
  await loadFont({
    family: "Oxanium",
    source: "url(/static/fonts/Oxanium-VariableFont_wght.ttf)",
  });

  const parameterIcons = await loadOfficialParameterIcons();
  const { canvas, ctx } = createCanvas2D(
    1310,
    ships.filter((ship) => ship.id > 0).length < 7 ? 586 : 768,
  );
  ctx.fillStyle = "#D3D2DA";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#C8EAFF";
  ctx.fillRect(0, 0, canvas.width, 37);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 37, canvas.width, 1);
  const shipCanvases = await Promise.all(
    ships
      .map((ship, shipIdx) => ({ ship: ship, idx: shipIdx }))
      .filter(({ ship }) => ship.id > 0)
      .map(async ({ ship, idx }) => {
        const shipCanvas = await generateFlatShipCanvasAsync(
          idx,
          ship,
          lang,
          options,
        );
        return { id: idx, canvas: shipCanvas };
      }),
  );
  if (shipCanvases.length === 7) {
    const { canvas, ctx } = createCanvas2D(654, 180);

    const { canvas: shipInfoCanvas, ctx: ctx2 } = createCanvas2D(650, 176);
    ctx2.fillStyle = "white";
    ctx2.strokeStyle = "#C2C3C5";
    drawRoundedRect(ctx2, 1, 1, 648, 174, 4);
    ctx2.fill();
    ctx2.stroke();
    ctx2.clip();
    ctx2.font = "bold 24px Oxanium";
    ctx2.textAlign = "center";
    ctx2.fillStyle = "#C2C3C5";
    ctx2.fillText("Striking Force Fleet", 648 / 2, 174 / 2);

    ctx.drawImage(shipInfoCanvas, 2, 2);
    shipCanvases.push({ id: 7, canvas });
  }

  shipCanvases.forEach(({ id, canvas }, i) => {
    ctx.drawImage(
      canvas,
      (Number(id) % 2) * 656,
      Math.floor(Number(id) / 2) * 182 + 40,
    );
  });

  const fleetCanvas = (() => {
    const { canvas, ctx } = createCanvas2D(196, 27);
    ctx.fillStyle = "#183754";
    ctx.beginPath();
    ctx.moveTo(6, 0); // 左上
    ctx.lineTo(116, 0); // 右上
    ctx.lineTo(110, 27); // 右下
    ctx.lineTo(0, 27); // 左下
    ctx.closePath();
    ctx.fill();

    ctx.font = "bold 20px Oxanium";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(`Fleet #${fleetIdx + 1}`, 116 / 2, 21.5);

    return canvas;
  })();

  ctx.drawImage(fleetCanvas, 24, 6);

  const airPowerCanvas = (() => {
    const { canvas, ctx } = createCanvas2D(196, 27);
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(6, 0); // 左上
    ctx.lineTo(46, 0); // 右上
    ctx.lineTo(40, 27); // 右下
    ctx.lineTo(0, 27); // 左下
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#187854";
    ctx.beginPath();
    ctx.moveTo(46, 0); // 左上
    ctx.lineTo(196, 0); // 右上
    ctx.lineTo(190, 27); // 右下
    ctx.lineTo(40, 27); // 左下
    ctx.closePath();
    ctx.fill();
    ctx.font = "bold 20px Noto Sans JP";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(toAirPowerString(airPower), 42 + 150 / 2, 21.5);
    ctx.drawImage(parameterIcons.air, 13, 5);

    return canvas;
  })();

  ctx.drawImage(airPowerCanvas, 175, 6);

  const genLosCanvas = (scale: number, los: string) => {
    const { canvas, ctx } = createCanvas2D(146, 27);
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(6, 0); // 左上
    ctx.lineTo(46, 0); // 右上
    ctx.lineTo(40, 27); // 右下
    ctx.lineTo(0, 27); // 左下
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#BE8823";
    ctx.beginPath();
    ctx.moveTo(46, 0); // 左上
    ctx.lineTo(146, 0); // 右上
    ctx.lineTo(140, 27); // 右下
    ctx.lineTo(40, 27); // 左下
    ctx.closePath();
    ctx.fill();
    ctx.font = "bold 20px Noto Sans JP";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(`${los}`, 42 + 100 / 2, 21.5);
    ctx.drawImage(parameterIcons.los, 8, 5);
    ctx.font = "bold 11px Oxanium";
    ctx.textAlign = "left";
    ctx.fillStyle = "black";
    ctx.fillText(`${scale}`, 29, 25);

    return canvas;
  };

  Object.keys(los).forEach((v, i) => {
    ctx.drawImage(
      genLosCanvas(i + 1, (Math.floor(los[v] * 100) / 100).toFixed(2)),
      401 + 176 * i,
      6,
    );
  });

  const genSpeedCanvas = (speed: string) => {
    const { canvas, ctx } = createCanvas2D(150, 27);
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(6, 0); // 左上
    ctx.lineTo(46, 0); // 右上
    ctx.lineTo(40, 27); // 右下
    ctx.lineTo(0, 27); // 左下
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#3B699C";
    ctx.beginPath();
    ctx.moveTo(46, 0); // 左上
    ctx.lineTo(150, 0); // 右上
    ctx.lineTo(144, 27); // 右下
    ctx.lineTo(40, 27); // 左下
    ctx.closePath();
    ctx.fill();
    ctx.font = "bold 18px Noto Sans JP";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(`${speed}`, 42 + 104 / 2, 21);
    ctx.drawImage(parameterIcons.soku, 11, 5);

    return canvas;
  };

  ctx.drawImage(genSpeedCanvas(`${SPEED[speed][lang]}${FLEET[lang]}`), 1105, 6);

  return canvas;
}

export async function generateFlatAirbaseCanvasAsync(
  airbases: Airbase[],
  lang: Lang = "jp",
  comment: string,
  useStrikingForce: boolean,
): Promise<Canvas> {
  const langs = lang === "jp" ? null : (await fetchLangData(lang)).items;
  const parameterIcons = await loadOfficialParameterIcons();
  const equipmentIcons = await loadOfficialEquipmentIcons();
  const { canvas, ctx } = createCanvas2D(267, 586 * 2);

  ctx.fillStyle = "#D3D2DA";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#C8EAFF";
  ctx.fillRect(0, 0, canvas.width, 37);
  if (!useStrikingForce) {
    ctx.fillRect(0, 586, canvas.width, 37);
  }
  ctx.fillStyle = "white";
  ctx.fillRect(0, 37, canvas.width, 1);
  if (!useStrikingForce) {
    ctx.fillRect(0, 586 + 37, canvas.width, 1);
  }

  const airbaseCanvas = async function (items: Item[], airbaseIdx: number) {
    const { canvas, ctx } = createCanvas2D(267, 180);
    ctx.fillStyle = "white";
    ctx.strokeStyle = "#C2C3C5";
    drawRoundedRect(ctx, 5, 4, 259, 174, 4);
    ctx.fill();

    const image = await fetchImage(
      `/static/flat/sally_airunit_${airbaseIdx * 2}.png`,
    );
    const { canvas: canvas2, ctx: ctx2 } = createCanvas2D(
      image.width,
      image.height,
    );
    ctx2.save();
    ctx2.globalAlpha = 0.1;
    ctx2.drawImage(image, 0, 0);
    ctx2.restore();
    ctx.drawImage(canvas2, 6, 4, image.width, image.height);

    ctx.stroke();
    ctx.clip();

    ctx.fillStyle = "#364D6F";
    ctx.beginPath();
    ctx.moveTo(0, 0); // 左上
    ctx.lineTo(100, 0); // 右上
    ctx.lineTo(94, 27); // 右下
    ctx.lineTo(0, 27); // 左下
    ctx.closePath();
    ctx.fill();

    ctx.font = "bold 14px Oxanium";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(`Airbase #${airbaseIdx + 1}`, 100 / 2, 21);

    ctx.fillStyle = "#364D6F";
    ctx.beginPath();
    ctx.moveTo(111, 8);
    ctx.lineTo(177, 8);
    ctx.lineTo(171, 62);
    ctx.lineTo(105, 62);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.fill();

    ctx.fillStyle = "#364D6F";
    ctx.moveTo(113, 46);
    ctx.lineTo(169, 46);
    ctx.stroke();

    ctx.font = "bold 11px Noto Sans JP";
    ctx.textAlign = "center";
    ctx.fillText(AIR_POWER[lang], 141, 21);
    ctx.drawImage(parameterIcons.air, 133, 24);
    ctx.fillText(toAirPowerString(getAirbaseAirPower(items)), 141, 58);

    ctx.beginPath();
    ctx.moveTo(186, 8);
    ctx.lineTo(252, 8);
    ctx.lineTo(246, 62);
    ctx.lineTo(181, 62);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.fill();

    ctx.fillStyle = "#364D6F";
    ctx.moveTo(188, 46);
    ctx.lineTo(244, 46);
    ctx.stroke();

    ctx.font = "bold 11px Noto Sans JP";
    ctx.textAlign = "center";
    ctx.fillText(DISTANCE[lang], 216, 21);
    ctx.drawImage(parameterIcons.distance, 208, 24);
    const distance = getDistance(items);
    ctx.fillText(`${distance}`, 216, 58);

    ctx.font = "14px Noto Sans JP";
    ctx.textAlign = "left";
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = "#364D6F";
      ctx.strokeStyle = "black";
      ctx.fillRect(10, 66 + i * 28, 250, 23);
      ctx.strokeRect(10, 66 + i * 28, 250, 23);
      ctx.fillStyle = "#212121";
      ctx.beginPath();
      ctx.arc(23, 77 + i * 28, 11, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.closePath();
      ctx.beginPath();
      ctx.moveTo(227, 67 + i * 28);
      ctx.lineTo(227 + 5, 67 + 21 / 2 + i * 28);
      ctx.lineTo(227, 67 + 21 + i * 28);
      ctx.lineTo(227 + 32, 67 + 21 + i * 28);
      ctx.lineTo(227 + 32, 67 + i * 28);
      ctx.lineTo(227, 67 + i * 28);
      ctx.stroke();
      ctx.fillStyle = "#3A5B86";
      ctx.fill();
      ctx.closePath();

      if (!items[i]) {
        continue;
      }
      ctx.fillStyle = "white";
      if (items[i].id > 0) {
        const { canvas: canvas2, ctx: ctx2 } = createCanvas2D(184, 20);
        // ctx.
        ctx2.font = "12px Noto Sans JP";
        ctx2.textAlign = "left";
        ctx2.fillStyle = "white";
        ctx2.fillText(toTranslateEquipmentName(items[i].name, langs), 0, 15);
        const grad = ctx.createLinearGradient(
          170,
          canvas2.height / 2,
          184,
          canvas2.height / 2,
        );
        grad.addColorStop(0, "rgba(54, 77, 111, 0)");
        grad.addColorStop(1, "rgba(54, 77, 111, 1)");
        ctx2.fillStyle = grad;
        ctx2.fillRect(0, 0, canvas2.width, canvas2.height);
        ctx.drawImage(canvas2, 38, 67 + 28 * i);
        ctx.textAlign = "left";
        const equipIcon = equipmentIcons[String(items[i].type[3])];
        if (equipIcon) {
          ctx.textAlign = "center";
          ctx.drawImage(
            equipIcon,
            0,
            0,
            equipIcon.width,
            equipIcon.height,
            11,
            67 + 28 * i,
            equipIcon.width * 0.75,
            equipIcon.height * 0.75,
          );
        }

        ctx.textAlign = "center";
        ctx.font = "10px Noto Sans JP";
        ctx.fillStyle = "white";
        const LV_STRING = [
          " - ",
          " 1 ",
          " 2 ",
          " 3 ",
          " 4 ",
          " 5 ",
          " 6 ",
          " 7 ",
          " 8 ",
          " 9 ",
          "max",
        ];
        ctx.fillText("★", 246, 76 + 28 * i);
        ctx.fillText(LV_STRING[items[i].lv], 246, 86 + 28 * i);
      }
    }

    return canvas;
  };

  for (let i = 0; i < 3; i++) {
    const items: Item[] = airbases[i]
      ? airbases[i].items
      : new Array(4).fill(Item.UNKNOWN);
    ctx.drawImage(await airbaseCanvas(items, i), 0, 39 + 182 * i);
  }

  const commentCanvas = function (height: number) {
    const { canvas, ctx } = createCanvas2D(267, height);
    ctx.fillStyle = "white";
    ctx.strokeStyle = "#C2C3C5";
    drawRoundedRect(ctx, 5, 4, canvas.width - 8, canvas.height - 4, 4);
    ctx.fill();
    ctx.stroke();
    ctx.clip();
    ctx.fillStyle = "#C2C3C5";
    ctx.font = "bold 18px Oxanium";
    ctx.fillText("Comment", 10, 25);
    ctx.fillStyle = "black";
    ctx.font = "18px Noto Sans JP";
    fillTextLine(ctx, comment, 10, 48, canvas.width - 8);

    return canvas;
  };
  if (useStrikingForce) {
    ctx.drawImage(commentCanvas(178), 0, 585);
  } else {
    ctx.drawImage(commentCanvas(540), 0, 626);
  }
  return canvas;
}

function fillTextLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
): void {
  const textAlign = ctx.textAlign;
  ctx.textAlign = "left";
  const columns = [""];
  for (let i = 0, line = 0; i < text.length; i++) {
    const char = text.charAt(i);

    if (char == "\n" || ctx.measureText(columns[line] + char).width > width) {
      columns[++line] = "";
      if (char == "\n") {
        continue;
      }
    }
    columns[line] += char;
  }
  const size = ctx.measureText("■").width;
  columns.forEach((column, i) => {
    ctx.fillText(column, x, y + (size + 5) * i);
  });
  ctx.textAlign = textAlign;
}
