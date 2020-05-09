import {
  fetchLangData,
  MyCanvas,
  loadOriginalParameterIcons,
  loadOriginalEquipmentIcons,
  toTranslateShipName,
  toTranslateEquipmentName,
  FLEET,
  SPEED,
  NONE,
  toAirPowerString,
  getDistance,
  getAirbaseAirPower,
  AIR_DEFENSE_POWER,
  HIGH_ALTITUDE,
  AIR_POWER,
  DISTANCE,
  CONTACT_ASPLUS,
  CONTACT_AS,
} from "../utils";
import { createCanvas2D, loadImage, Canvas } from "../canvas";
import { Ship, Airbase } from "../type";
import Chart from "chart.js";
import "chartjs-plugin-labels";
import "chartjs-plugin-datalabels";
import "chartjs-plugin-colorschemes";
import { Context } from "chartjs-plugin-datalabels";

async function generateDarkShipInfoCanvasAsync(
  shipIdx: number,
  ship: Ship,
  lang: "jp" | "en" | "ko" | "tcn" | "scn" = "jp"
): Promise<Canvas> {
  const { ships, items } =
    lang === "jp" ? { ships: null, items: null } : await fetchLangData(lang);
  const parameterIcons = await loadOriginalParameterIcons();
  const equipmentIcons = await loadOriginalEquipmentIcons();
  const { canvas, ctx } = createCanvas2D(650, 176);
  // overlay
  ctx.fillStyle = "#1A1A1A";
  ctx.fillRect(0, 0, 650, 176);
  if (ship.id > 0) {
    const image = await loadImage(
      `https://raw.githubusercontent.com/Nishisonic/gkcoi/master/static/ship/remodel/${ship.id}.png`
    );
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
  }
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
  ctx.fillText(String(ship.asw), 585, 28);
  ctx.fillText(String(ship.luck), 638, 28);
  // equipment
  ctx.font = "14px Meiryo";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  for (let i = 0; i < 6; i++) {
    if (ship.items[i].id > 0) {
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
    if (ship.items[i] && ship.items[i].lv > 0) {
      ctx.textAlign = "left";
      ctx.fillText("★", 611, 53 + 23 * i);
      ctx.textAlign = "center";
      ctx.fillText(LV_STRING[ship.items[i].lv], 635, 53 + 23 * i);
    }
  }
  return canvas;
}

async function generateDarkShipCanvasAsync(
  shipIdx: number,
  ship: Ship,
  lang: "jp" | "en" | "ko" | "tcn" | "scn" = "jp"
): Promise<Canvas> {
  const { canvas, ctx } = createCanvas2D(654, 180);
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
export async function generateDarkFleetCanvasAsync(
  fleetIdx: number,
  ships: Ship[],
  los: { 1: number; 2: number; 3: number; 4: number; 5: number },
  airPower: { min: number; max: number },
  speed: 0 | 5 | 10 | 15 | 20,
  lang: "jp" | "en" | "ko" | "tcn" | "scn" = "jp"
): Promise<Canvas> {
  const parameterIcons = await loadOriginalParameterIcons();
  const { canvas, ctx } = createCanvas2D(
    1310,
    ships.filter((ship) => ship.id > 0).length < 7 ? 586 : 768
  );
  ctx.fillStyle = "#212121";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const shipCanvases = await Promise.all(
    ships
      .map((ship, shipIdx) => ({ ship: ship, idx: shipIdx }))
      .filter(({ ship }) => ship.id > 0)
      .map(async ({ ship, idx }) => {
        const shipCanvas = await generateDarkShipCanvasAsync(idx, ship, lang);
        return new MyCanvas(String(idx), shipCanvas);
      })
  );

  shipCanvases.forEach((shipCanvas) => {
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
  ctx.fillText(toAirPowerString(airPower), 200, 30);
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
  const tp = ships.reduce((p, { tp }) => p + tp, 90);
  ctx.drawImage(parameterIcons["drum"], 1156, 11);
  ctx.fillText(`${tp}`, 1205, 30);
  ctx.font = "11px Meiryo";
  ctx.fillText("1", 365, 32);
  ctx.fillText("2", 495, 32);
  ctx.fillText("3", 625, 32);
  ctx.fillText("4", 755, 32);
  ctx.fillText("5", 885, 32);
  ctx.fillText("TP", 1170, 32);
  // 速力
  ctx.drawImage(parameterIcons["soku"], 1000, 13);
  ctx.font = "bold 18px Meiryo";
  ctx.fillText(`${SPEED[speed][lang]}${FLEET[lang]}`, 1033, 29);
  return canvas;
}

export async function generateDarkAirbaseCanvasAsync(
  airbases: Airbase[],
  largeSize: boolean,
  lang: "jp" | "en" | "ko" | "tcn" | "scn" = "jp"
): Promise<Canvas> {
  const langs = lang === "jp" ? null : (await fetchLangData(lang)).items;
  const parameterIcons = await loadOriginalParameterIcons();
  const equipmentIcons = await loadOriginalEquipmentIcons();
  const { canvas, ctx } = createCanvas2D(265, 586);
  ctx.fillStyle = "#212121";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.drawImage(parameterIcons.aird, 12, 12);
  ctx.drawImage(parameterIcons.airdh, 137, 12);
  ctx.font = "8px Meiryo";
  ctx.fillText(`${AIR_DEFENSE_POWER[lang]}`, 32, 15);
  ctx.fillText(`${AIR_DEFENSE_POWER[lang]}(${HIGH_ALTITUDE[lang]})`, 157, 15);
  ctx.font = "14px Meiryo";
  ctx.textAlign = "center";
  const rocket = airbases
    .map(({ items }) => items)
    .map(
      (items) => items.filter(({ id }) => [350, 351, 352].includes(id)).length
    )
    .reduce((p, v) => p + v, 0);

  const totalAirPower = toAirPowerString(
    airbases
      .map(({ items }) => getAirbaseAirPower(items, true))
      .reduce(
        (p, { min, max }) => {
          p.min += min;
          p.max += max;
          return p;
        },
        { min: 0, max: 0 }
      )
  );
  ctx.font = "bold 14px Meiryo";
  ctx.fillText(totalAirPower, 84, 34);
  const floor = (power: {
    min: number;
    max: number;
  }): { min: number; max: number } => {
    return { min: Math.floor(power.min), max: Math.floor(power.max) };
  };
  const totalHighAltitudeAirPower = toAirPowerString(
    floor(
      airbases
        .map(({ items }) => getAirbaseAirPower(items, true, true, rocket))
        .reduce(
          (p, { min, max }) => {
            p.min += min;
            p.max += max;
            return p;
          },
          { min: 0, max: 0 }
        )
    )
  );
  ctx.fillText(totalHighAltitudeAirPower, 209, 34);

  airbases.forEach((airbase, i) => {
    const items = airbase.items;
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(1, 41 + i * 182, 263, 178);
    // equipment
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.font = "bold 18px Meiryo";
    ctx.fillText(`Airbase #${i + 1}`, 12, 66 + i * 182);
    ctx.font = "14px Meiryo";
    items.forEach(({ id, name, type }, j) => {
      if (id > 0) {
        ctx.fillText(
          toTranslateEquipmentName(name, langs),
          35,
          90 + i * 182 + 23 * j
        );
        ctx.drawImage(
          equipmentIcons[String(type[3])],
          4,
          71 + i * 182 + 23 * j
        );
      } else {
        const none = NONE[lang];
        ctx.fillText(`(${none})`, 35, 90 + i * 182 + 23 * j);
        ctx.fillText("-", 17, 91 + i * 182 + 23 * j);
      }
    });
    // overlay
    const grd2 = ctx.createLinearGradient(0, 0, 263, 0);
    grd2.addColorStop(0, "rgba(26,26,26,0)");
    grd2.addColorStop(0.8, "rgba(26,26,26,0)");
    grd2.addColorStop(0.9, "rgba(26,26,26,1)");
    ctx.fillStyle = grd2;
    ctx.fillRect(0, 73 + i * 182, 263, 95);
    // star
    ctx.font = "16px Meiryo";
    ctx.fillStyle = "#49A7A2";
    const LV_STRING = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "m"];
    items.forEach(({ id, lv }, j) => {
      if (id > 0 && lv > 0) {
        // overlay
        ctx.textAlign = "left";
        ctx.fillText("★", 225, 91 + i * 182 + 23 * j);
        ctx.textAlign = "center";
        ctx.fillText(LV_STRING[lv], 249, 91 + i * 182 + 23 * j);
      }
    });
    // param
    ctx.font = "14px Meiryo";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.drawImage(parameterIcons.air, 12, 172 + i * 182);
    ctx.drawImage(parameterIcons.distance, 137, 172 + i * 182);
    ctx.drawImage(parameterIcons.aird, 12, 197 + i * 182);
    ctx.drawImage(parameterIcons.airdh, 137, 197 + i * 182);
    ctx.font = "8px Meiryo";
    ctx.fillText(`${AIR_POWER[lang]}`, 32, 175 + i * 182);
    ctx.fillText(`${DISTANCE[lang]}`, 157, 175 + i * 182);
    ctx.fillText(`${AIR_DEFENSE_POWER[lang]}`, 32, 200 + i * 182);
    ctx.fillText(
      `${AIR_DEFENSE_POWER[lang]}(${HIGH_ALTITUDE[lang]})`,
      157,
      200 + i * 182
    );
    ctx.font = "14px Meiryo";
    const distance = getDistance(items);
    ctx.textAlign = "center";
    ctx.fillText(
      toAirPowerString(getAirbaseAirPower(items)),
      80,
      189 + i * 182
    );
    ctx.fillText(`${distance}`, 205, 189 + i * 182);
    ctx.fillText(
      toAirPowerString(getAirbaseAirPower(items, true)),
      80,
      214 + i * 182
    );
    ctx.fillText(
      toAirPowerString(floor(getAirbaseAirPower(items, true, true, rocket))),
      205,
      214 + i * 182
    );

    ctx.strokeStyle = "#434343";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 41 + i * 182, 263, 178);
  });
  return canvas;
}

function drawsq(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string | CanvasGradient | CanvasPattern
): void {
  const strokeStyle = context.strokeStyle;
  const fillStyle = context.fillStyle;
  context.beginPath();
  context.lineWidth = 1;
  context.strokeStyle = color;
  context.fillStyle = color;
  context.moveTo(x, y + r);
  context.arc(x + r, y + h - r, r, Math.PI, Math.PI * 0.5, true);
  context.arc(x + w - r, y + h - r, r, Math.PI * 0.5, 0, true);
  context.arc(x + w - r, y + r, r, 0, Math.PI * 1.5, true);
  context.arc(x + r, y + r, r, Math.PI * 1.5, Math.PI, true);
  context.closePath();
  context.stroke();
  context.fill();
  context.strokeStyle = strokeStyle;
  context.fillStyle = fillStyle;
}

export async function generateDarkParameterCanvasAsync(
  ships1: Ship[],
  ships2: Ship[],
  lang: "jp" | "en" | "ko" | "tcn" | "scn" = "jp"
): Promise<Canvas> {
  const parameterIcons = await loadOriginalParameterIcons();
  const { canvas, ctx } = createCanvas2D(265, 586);
  ctx.fillStyle = "#212121";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  // ctx.font = "bold 16px Meiryo";
  // ctx.textAlign = "center";
  // ctx.fillText("Details(Combined Fleet)", 128, 24);
  ctx.fillStyle = "#1A1A1A";
  ctx.strokeStyle = "#434343";
  ctx.lineWidth = 2;
  ctx.font = "16px Meiryo";
  ctx.textAlign = "right";
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(1, 41 + i * 182, 263, 178);
    ctx.strokeRect(1, 41 + i * 182, 263, 178);
    if (i < 2) {
      ctx.fillStyle = "#fff";
      ctx.fillText(
        [CONTACT_ASPLUS[lang], CONTACT_AS[lang]][i],
        252,
        70 + i * 182
      );
    }
  }
  ctx.font = "bold 32px Meiryo";
  ctx.fillStyle = "#2A2a2a";
  ctx.fillText("Comment", 250, 435);
  ctx.strokeRect(1, 1, 263, 36);
  ctx.drawImage(parameterIcons.aa2, 3, 0);
  ctx.textAlign = "left";
  ctx.fillStyle = "#fff";
  ctx.font = "8px Meiryo";
  ctx.fillText("CI (%)", 5, 33);

  const canvases = createCanvas2D(265, 150);
  const chart = new Chart(canvases.ctx, {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [9000, 20, 30, 40],
          backgroundColor: ["#ff6384", "#ffbf00", "#36a2eb", "gray"],
        },
      ],
      labels: ["x1.2", "x1.17", "x1.12", "none"],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      animation: {
        duration: 0,
      },
      legend: {
        position: "right",
        labels: {
          fontColor: "white",
        },
      },
      plugins: {
        labels: {
          render: "percentage",
          fontSize: 14,
          fontColor: "black",
          fontStyle: "bold",
        },
        datalabels: {
          formatter: (): string => "",
        },
      },
    },
  });
  ctx.drawImage(canvases.canvas, 0, 55);
  ctx.drawImage(canvases.canvas, 0, 237);
  const canvases2 = createCanvas2D(243, 33);
  const stackedBar = new Chart(canvases2.ctx, {
    type: "horizontalBar",
    data: {
      datasets: [
        {
          label: "34",
          data: [60],
        },
        {
          label: "35",
          data: [25],
        },
        {
          label: "37",
          data: [5],
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      animation: {
        duration: 0,
      },
      plugins: {
        colorschemes: {
          scheme: "brewer.Greens5",
        },
        datalabels: {
          labels: {
            value: {
              color: "black",
              font: {
                weight: "bold",
              },
            },
          },
          formatter: (value, context): string => String(context.dataset.label),
        },
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            gridLines: {
              color: "#fff",
            },
            scaleLabel: {
              display: false,
            },
            stacked: true,
            ticks: {
              min: 0,
              max: 100,
              stepSize: 20,
              fontColor: "white",
              fontSize: 7,
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              color: "#fff",
            },
            stacked: true,
          },
        ],
      },
    },
  });
  ctx.drawImage(canvases2.canvas, 22, 2);
  return canvas;
}
