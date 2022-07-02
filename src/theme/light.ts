import {
  fetchLangData,
  toTranslateShipName,
  toTranslateEquipmentName,
  toAirPowerString,
  getDistance,
  getAirbaseAirPower,
  getCanAACIList,
  getContactValue,
} from "../utils";
import { createCanvas2D, Canvas } from "../canvas";
import {
  Ship,
  Airbase,
  AirState,
  Speed,
  LoS,
  AirPower,
  ShipImageKind,
  Item,
} from "../type";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  NONE,
  SPEED,
  FLEET,
  AIR_DEFENSE_POWER,
  HIGH_ALTITUDE,
  DISTANCE,
  AIR_POWER,
  CONTACT,
  AA_CI,
  Lang,
  LABEL,
} from "../lang";
import {
  loadOfficialParameterIcons,
  loadOfficialEquipmentIcons,
} from "../icon";
import { Context } from "chartjs-plugin-datalabels";

Chart.register(ChartDataLabels);

const strokeColor = "#C1C1C1";
const backgroundColor = "#FAFAFA";
const lvColor = "#49A7A2";
const fontColor = "#1A1A1A";

async function generateLightShipInfoCanvasAsync(
  shipIdx: number,
  ship: Ship,
  lang: Lang = "jp"
): Promise<Canvas> {
  const { ships, items } =
    lang === "jp" ? { ships: null, items: null } : await fetchLangData(lang);
  const parameterIcons = await loadOfficialParameterIcons();
  const equipmentIcons = await loadOfficialEquipmentIcons();
  const { canvas, ctx } = createCanvas2D(650, 176);
  // overlay
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, 650, 176);
  if (ship.id > 0) {
    const image = await ship.fetchImage(ShipImageKind.REMODEL);
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
  grd2.addColorStop(0.2, "rgba(250,250,250, 0)");
  grd2.addColorStop(0.45, backgroundColor);
  grd2.addColorStop(0.8, backgroundColor);
  grd2.addColorStop(1, "rgba(250,250,250,1)");
  ctx.fillStyle = grd2;
  ctx.fillRect(0, 0, 650, 176);
  // overlay
  const grd3 = ctx.createLinearGradient(499, 0, 499, 173);
  grd3.addColorStop(0, backgroundColor);
  // grd3.addColorStop(0.05, backgroundColor);
  grd3.addColorStop(0.6, "rgba(255,255,255,0)");
  ctx.fillStyle = grd3;
  ctx.fillRect(0, 0, 499, 176);
  // name
  ctx.font = "20px Meiryo";
  ctx.strokeStyle = "rgba(57, 151, 146, 0.15)";
  ctx.strokeText(`#${shipIdx + 1}`, 14, 26);
  ctx.fillStyle = "#399792";
  ctx.fillText(`#${shipIdx + 1}`, 14, 26);
  ctx.font = "28px Meiryo";
  ctx.strokeStyle = "rgba(26, 26, 26, 0.15)";
  ctx.strokeText(toTranslateShipName(ship.name, ships), 50, 30);
  ctx.fillStyle = fontColor;
  ctx.fillText(toTranslateShipName(ship.name, ships), 50, 30);
  // lv
  ctx.font = "12px Meiryo";
  ctx.fillStyle = lvColor;
  ctx.fillText("Lv.", 405, 28);
  ctx.font = "21px Meiryo";
  ctx.fillStyle = fontColor;
  ctx.textAlign = "right";
  ctx.fillText(String(ship.lv), 465, 28);
  // parameter
  ctx.font = "16px Meiryo";
  ctx.textAlign = "right";
  ctx.drawImage(parameterIcons.hp, 476, 14);
  ctx.drawImage(parameterIcons.as, 532, 13);
  ctx.drawImage(parameterIcons.luck, 588, 13);
  ctx.fillText(String(ship.hp), 529, 28);
  ctx.fillText(String(ship.asw), 585, 28);
  ctx.fillText(String(ship.luck), 638, 28);
  // equipment
  ctx.font = "14px Meiryo";
  ctx.textAlign = "left";
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = fontColor;
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
        ctx.fillText(String(ship.slots[i]), 389, 52 + 23 * i);
        ctx.textAlign = "left";
        ctx.fillStyle = "#fff";
      }
    } else {
      break;
    }
  }
  // overlay
  const grd4 = ctx.createLinearGradient(578, 65, 986, 65);
  grd4.addColorStop(0, "rgba(250,250,250,0)");
  grd4.addColorStop(0.08, backgroundColor);
  grd4.addColorStop(1, backgroundColor);
  ctx.fillStyle = grd4;
  ctx.fillRect(0, 40, 650, 130);
  // star
  ctx.font = "16px Meiryo";
  ctx.fillStyle = lvColor;
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

async function generateLightShipCanvasAsync(
  shipIdx: number,
  ship: Ship,
  lang: Lang = "jp"
): Promise<Canvas> {
  const { canvas, ctx } = createCanvas2D(654, 180);
  const shipInfoCanvas = await generateLightShipInfoCanvasAsync(
    shipIdx,
    ship,
    lang
  );
  ctx.drawImage(shipInfoCanvas, 2, 2);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 652, 178);
  return canvas;
}

/**
 * 【オリジナル】ライトバージョンを出力する
 * @param fleetIdx 艦隊番号
 * @param ships 艦
 * @param los 索敵
 * @param airPower 制空値
 * @param speed 艦速(0=陸上、5=低速、10=高速、15=高速+、20=最速)
 * @param lang 言語
 * @return 画像
 */
export async function generateLightFleetCanvasAsync(
  fleetIdx: number,
  ships: Ship[],
  los: LoS,
  airPower: AirPower,
  speed: Speed,
  lang: Lang = "jp"
): Promise<Canvas> {
  const parameterIcons = await loadOfficialParameterIcons();
  const { canvas, ctx } = createCanvas2D(
    1310,
    ships.filter((ship) => ship.id > 0).length < 7 ? 586 : 768
  );
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const shipCanvases = await Promise.all(
    ships
      .map((ship, shipIdx) => ({ ship: ship, idx: shipIdx }))
      .filter(({ ship }) => ship.id > 0)
      .map(async ({ ship, idx }) => {
        const shipCanvas = await generateLightShipCanvasAsync(idx, ship, lang);
        return { id: idx, canvas: shipCanvas };
      })
  );

  shipCanvases.forEach(({ id, canvas }) => {
    ctx.drawImage(
      canvas,
      (Number(id) % 2) * 656,
      Math.floor(Number(id) / 2) * 182 + 40
    );
  });

  ctx.font = "bold 20px Meiryo";
  ctx.fillStyle = fontColor;
  ctx.fillText(`Fleet #${Number(fleetIdx) + 1}`, 20, 30);
  ctx.drawImage(parameterIcons.air, 172, 11);
  ctx.fillText(toAirPowerString(airPower), 200, 30);
  Object.keys(los).map((v, i) => {
    ctx.drawImage(parameterIcons.los, 346 + 130 * i, 12);
    ctx.fillText(
      (Math.floor(los[v] * 100) / 100).toFixed(2),
      380 + 130 * i,
      30
    );
  });
  const tp = ships.reduce((p, { tp }) => p + tp, 0);
  ctx.drawImage(parameterIcons.drum, 1156, 11);
  ctx.fillText(`${tp}`, 1205, 30);
  ctx.font = "11px Meiryo";
  ctx.fillText("1", 365, 32);
  ctx.fillText("2", 495, 32);
  ctx.fillText("3", 625, 32);
  ctx.fillText("4", 755, 32);
  ctx.fillText("5", 885, 32);
  ctx.fillText("TP", 1170, 32);
  // 速力
  ctx.drawImage(parameterIcons.soku, 1000, 13);
  ctx.font = "bold 18px Meiryo";
  ctx.fillText(`${SPEED[speed][lang]}${FLEET[lang]}`, 1033, 29);
  return canvas;
}

export async function generateLightAirbaseCanvasAsync(
  airbases: Airbase[],
  lang: Lang = "jp"
): Promise<Canvas> {
  const langs = lang === "jp" ? null : (await fetchLangData(lang)).items;
  const parameterIcons = await loadOfficialParameterIcons();
  const equipmentIcons = await loadOfficialEquipmentIcons();
  const { canvas, ctx } = createCanvas2D(265, 586);
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = fontColor;
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

  for (let i = 0; i < 3; i++) {
    const items = airbases[i]
      ? airbases[i].items
      : new Array(4).fill(Item.UNKNOWN);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(1, 41 + i * 182, 263, 178);
    // equipment
    ctx.fillStyle = fontColor;
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
    grd2.addColorStop(0, "rgba(250,250,250,0)");
    grd2.addColorStop(0.75, "rgba(250,250,250,0)");
    grd2.addColorStop(0.85, "rgba(250,250,250,1)");
    ctx.fillStyle = grd2;
    ctx.fillRect(0, 73 + i * 182, 263, 95);
    // star
    ctx.font = "16px Meiryo";
    ctx.fillStyle = lvColor;
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
    ctx.fillStyle = fontColor;
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

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 41 + i * 182, 263, 178);
  }
  return canvas;
}

function fillTextLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number
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

export async function generateLightParameterCanvasAsync(
  ships: Ship[],
  airState: AirState,
  comment: string,
  lang: Lang = "jp"
): Promise<Canvas> {
  const { canvas, ctx } = createCanvas2D(265, 586);
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ["Contact", "Anti-Air CI", "Comment"].forEach((label, i) => {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(1, 41 + i * 182, 263, 178);
    ctx.strokeRect(1, 41 + i * 182, 263, 178);
    ctx.textAlign = "right";
    ctx.font = "bold 32px Meiryo";
    ctx.fillStyle = "rgba(26,26,26,0.1)";
    ctx.fillText(label, 250, 71 + 182 * i);
  });
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(1, 1, 263, 36);
  ctx.font = "bold 16px Meiryo";
  ctx.textAlign = "center";
  ctx.fillStyle = fontColor;
  ctx.fillText("Details(Combined Fleet)", 132, 24);
  ctx.fillText(CONTACT.LABEL[lang], 85, 125);
  ctx.fillText(`(${CONTACT[airState][lang]})`, 85, 146);
  ctx.fillText(AA_CI[lang], 85, 318);
  ctx.strokeRect(1, 1, 263, 36);

  const touchCanvases = createCanvas2D(265, 150);
  const contacts = getContactValue(ships, airState);
  const modifierColors = ["#729ece", "#ff9e4a", "#67bf5c", strokeColor];
  new Chart(touchCanvases.ctx, {
    type: "doughnut",
    plugins: [ChartDataLabels],
    data: {
      datasets: [
        {
          backgroundColor: modifierColors,
          data: contacts.map(({ rate }) => rate),
        },
      ],
      labels: ["x1.2", "x1.17", "x1.12", NONE[lang]],
    },
    options: {
      responsive: false,
      animation: {
        duration: 0,
      },
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: fontColor,
          },
        },
        datalabels: {
          color: "black",
          font: {
            size: 14,
            weight: "bold",
          },
          formatter: function (value: number, context) {
            if (value >= 0.1) {
              return `${Math.round(value * 100)}%`;
            }
            return "";
          },
        },
      },
    },
  });
  ctx.drawImage(touchCanvases.canvas, 0, 55);
  const aaciCanvases = createCanvas2D(265, 150);
  const canAACIList = getCanAACIList(ships);
  const ciColors = [
    "#729ece",
    "#ff9e4a",
    "#67bf5c",
    "#ed665d",
    "#ad8bc9",
    "#a8786e",
    "#ed97ca",
    "#a2a2a2",
    "#cdcc5d",
    "#6dccda",
  ];
  new Chart(aaciCanvases.ctx, {
    type: "doughnut",
    data: {
      datasets: [
        {
          backgroundColor: (function () {
            const count = canAACIList.length
            return Array(count).fill(null).map(function (_, i) {
              return i + 1 < count ? ciColors[i % ciColors.length] : strokeColor;
            });
          })(),
          data: canAACIList.map(({ rate }) => rate),
        },
      ],
      labels: canAACIList.map(({ kind }) => kind || NONE[lang]),
    },
    options: {
      responsive: false,
      animation: {
        duration: 0,
      },
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: fontColor,
          },
        },
        datalabels: {
          color: "black",
          font: {
            size: 14,
            weight: "bold",
          },
          formatter: function (value: number, context) {
            if (value >= 0.1) {
              return `${Math.round(value * 100)}%`;
            }
            return "";
          },
        },
      },
    },
  });
  ctx.drawImage(aaciCanvases.canvas, 0, 237);
  fillTextLine(ctx, comment, 12, 430, 250);
  return canvas;
}

export async function generateLightExpeditionStatsCanvasAsync(
  ships: Ship[],
  lang: Lang = "jp"
): Promise<Canvas> {
  const { canvas, ctx } = createCanvas2D(265, 586);

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(1, 41, 263, 542);
  ctx.strokeRect(1, 41, 263, 542);
  ctx.textAlign = "right";
  ctx.font = "bold 32px Meiryo";
  ctx.fillStyle = fontColor;
  ctx.fillText("Expedition", 250, 31);

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(1, 1, 263, 36);
  ctx.font = "bold 16px Meiryo";
  ctx.textAlign = "center";
  ctx.fillStyle = fontColor;
  ctx.fillText("Expedition", 132, 24);
  ctx.strokeRect(1, 1, 263, 36);

  const canvas2 = createCanvas2D(265, 545);
  new Chart(canvas2.ctx, {
    type: "bar",
    plugins: [ChartDataLabels],
    data: {
      datasets: [
        {
          xAxisID: "xAxis",
          yAxisID: "yAxis",
          data: ships.reduce(
            (p, ship) => {
              p[0] += ship.firepower;
              p[1] += ship.aa;
              p[2] += ship.asw;
              p[3] += ship.los;
              return p;
            },
            [0, 0, 0, 0]
          ),
          label: "Status",
          borderWidth: 1,
          borderColor: [
            "rgb(255, 128, 114)",
            "rgb(144, 238, 144)",
            "rgb(175, 238, 238)",
            "rgb(238, 255, 204)",
          ],
          backgroundColor: [
            "rgba(250, 128, 114, 0.8)",
            "rgba(144, 238, 144, 0.8)",
            "rgba(175, 238, 238, 0.8)",
            "rgba(238, 255, 204, 0.8)",
          ],
        },
        {
          xAxisID: "xAxis",
          yAxisID: "yAxis",
          data: ships.reduce(
            (p, ship) => {
              p[0] += ship.expeditionFirepowerBonus;
              p[1] += ship.expeditionAABonus;
              p[2] += ship.expeditionASWBonus;
              p[3] += ship.expeditionLoSBonus;
              return p;
            },
            [0, 0, 0, 0]
          ),
          borderWidth: 1,
          borderColor: [
            "rgb(255, 128, 114)",
            "rgb(144, 238, 144)",
            "rgb(175, 238, 238)",
            "rgb(238, 255, 204)",
          ],
          backgroundColor: [
            "rgba(250, 128, 114, 0.25)",
            "rgba(144, 238, 144, 0.25)",
            "rgba(175, 238, 238, 0.25)",
            "rgba(238, 255, 204, 0.25)",
          ],
          label: "★",
        },
      ],
      labels: [
        LABEL.FIREPOWER[lang],
        LABEL.AA[lang],
        LABEL.ASW[lang],
        LABEL.LOS[lang],
      ],
    },
    options: {
      indexAxis: "y",
      plugins: {
        datalabels: {
          formatter: (value: any, ctx: Context): string => {
            const datasets = ctx.chart.data.datasets;
            if (datasets && ctx.datasetIndex === datasets.length - 1) {
              const data = datasets
                .map((dataset) => dataset.data)
                .map((data) => {
                  if (data) {
                    const num = data[ctx.dataIndex];
                    if (typeof num === "number") {
                      return num;
                    }
                  }
                  return 0;
                });
              return `${(Math.floor((data[0] + data[1]) * 10) / 10).toFixed(
                1
              )}\n(${data[0]}+${(Math.floor(data[1] * 10) / 10).toFixed(1)})`;
            } else {
              return "";
            }
          },
          anchor: "end",
          align: "end",
          color: fontColor,
          textAlign: "center",
          font: {
            size: 16,
          },
        },
        legend: {
          position: "top",
          labels: {
            color: fontColor,
            font: {
              size: 16,
            },
          },
        },
      },
      responsive: false,
      animation: {
        duration: 0,
      },
      scales: {
        xAxis: {
          beginAtZero: true,
          max: 1000,
          ticks: {
            font: function (context) {
              if (context.tick && context.tick.major) {
                return {
                  weight: "normal",
                  color: fontColor,
                  family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                  size: 16,
                  lineHeight: "normal",
                  style: "normal",
                };
              }
            },
          },
          stacked: true,
          grid: {
            color: strokeColor,
          },
        },
        yAxis: {
          ticks: {
            font: function (context) {
              if (context.tick && context.tick.major) {
                return {
                  weight: "normal",
                  color: fontColor,
                  family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                  size: 16,
                  lineHeight: "normal",
                  style: "normal",
                };
              }
            },
          },
          stacked: true,
          grid: {
            color: strokeColor,
          },
        },
      },
    },
  });
  ctx.drawImage(canvas2.canvas, 0, 41);
  return canvas;
}
