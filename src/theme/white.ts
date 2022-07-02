import { Canvas, createCanvas2D } from "../canvas";
import { Ship, ShipImageKind } from "../type";
import { Lang, NONE } from "../lang";
import {
  fetchLangData,
  toTranslateEquipmentName,
  toTranslateShipName,
} from "../utils";
import { loadOfficialEquipmentIcons } from "../icon";
import { changeScale, gradiationText } from "../iutils";

export async function generateWhiteFleetCanvasAsync(
  fleetIdx: number,
  ships: Ship[],
  lang: Lang = "jp"
): Promise<Canvas> {
  const { canvas, ctx } = createCanvas2D(
    1494,
    ships.filter((ship) => ship.id > 0).length < 7 ? 652 : 856
  );

  const shipCanvases = await Promise.all(
    ships
      .map((ship, shipIdx) => ({ ship: ship, idx: shipIdx }))
      .filter(({ ship }) => ship.id > 0)
      .map(async ({ ship, idx }) => {
        const shipCanvas = await generateWhiteShipCanvasAsync(ship, lang);
        return { id: idx, canvas: shipCanvas };
      })
  );
  
  ctx.fillStyle = "#434343";
  ctx.font = "bold 32px 'Yu Gothic'";
  ctx.textAlign = "center";
  shipCanvases.forEach(({ id, canvas }) => {
    ctx.fillText(`${(["1st", "2nd", "3rd", "4th"])[fleetIdx]} Fleet`, canvas.width, 32);
    ctx.drawImage(
      canvas,
      (Number(id) % 2) * 747,
      Math.floor(Number(id) / 2) * 204 + 40
    );
  });

  return canvas;
}

export async function generateWhiteShipCanvasAsync(ship: Ship, lang: Lang) {
  const { ships, items } =
    lang === "jp" ? { ships: null, items: null } : await fetchLangData(lang);
  const equipmentIcons = await loadOfficialEquipmentIcons();
  const { canvas, ctx } = createCanvas2D(650 * 1.15, 178 * 1.15);
  ctx.lineWidth = 2;
  if (ship.id > 0) {
    const image = await ship.fetchImage(ShipImageKind.REMODEL);
    ctx.globalAlpha = 0.3;
    ctx.drawImage(
      changeScale(image, 1.5, 1.5),
      0,
      3,
      image.width * 1.15,
      image.height * 1.15,
      50,
      0,
      image.width * 1.15,
      image.height * 1.15
    );
    ctx.scale(1, 1);
    ctx.globalAlpha = 1;
    ctx.drawImage(
      changeScale(image, 1.15, 1.15),
      0,
      3,
      image.width * 1.15,
      image.height * 1.15,
      -100,
      0,
      image.width * 1.15,
      image.height * 1.15
    );
  }
  ctx.strokeStyle = "#434343";
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
  drawsq(ctx, 360, 12, 376, canvas.height - 24, 3, "rgba(255, 255, 255, 0.95)");

  // ship
  const sname = toTranslateShipName(ship.name, ships);
  ctx.font = "bold 28px 'Yu Gothic'";
  ctx.drawImage(
    gradiationText(
      sname,
      "bold 28px 'Yu Gothic'",
      calcColorStops(
        ctx.measureText(sname).width,
        255,
        270,
        "#434343",
        // transparentは他範囲も薄くなるのでダメ
        "rgba(103,103,103,0)"
      )
    ),
    374,
    20
  );

  // lv
  ctx.fillStyle = "#434343";
  ctx.font = "bold 14px 'Yu Gothic'";
  ctx.fillText("Lv.", 655, 45);
  ctx.textAlign = "right";
  ctx.font = "bold 24px 'Yu Gothic'";
  ctx.fillText(String(ship.lv), 722, 45);

  // item
  ctx.font = "bold 14px 'Yu Gothic'";
  ctx.textAlign = "left";
  const itemX = 366;
  const itemY = 50;
  const LV_STRING = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "m"];
  for (let i = 0; i < 6; i++) {
    if (ship.items[i].id > 0) {
      ctx.textAlign = "left";
      if (equipmentIcons[String(ship.items[i].type[3])]) {
        ctx.drawImage(
          equipmentIcons[String(ship.items[i].type[3])],
          itemX,
          itemY + 23 * i
        );
      }
      ctx.fillStyle = "#434343";

      const ename = toTranslateEquipmentName(ship.items[i].name, items);
      ctx.drawImage(
        gradiationText(
          ename,
          "bold 14px 'Yu Gothic'",
          calcColorStops(
            ctx.measureText(ename).width,
            ship.items[i].lv > 0 ? 280 : 335,
            335,
            "#434343",
            // transparentは他範囲も薄くなるのでダメ
            "rgba(103,103,103,0)"
          )
        ),
        itemX + 31,
        itemY + 7 + 23 * i
      );
      if (ship.items[i].lv > 0) {
        // overlay
        ctx.fillStyle = "#49A7A2";
        ctx.textAlign = "left";
        ctx.fillText("★", itemX + 331, itemY + 19 + 23 * i);
        ctx.textAlign = "center";
        ctx.fillText(
          LV_STRING[ship.items[i].lv],
          itemX + 353,
          itemY + 19 + 23 * i
        );
      }
    } else {
      ctx.fillText("-", itemX + 13, itemY + 20 + 23 * i);
      const none = NONE[lang];
      ctx.fillText(`(${none})`, itemX + 31, itemY + 19 + 23 * i);
    }
    if (ship.slotNum > i) {
      // if (ship.items[i] && ship.items[i].type[4] !== 0) {
      //   ctx.textAlign = "right";
      //   ctx.fillStyle = "#c3c3c3";
      //   ctx.fillText(String(ship.slots[i]), itemX, itemY + 19 + 23 * i);
      // }
    } else {
      break;
    }
  }

  return canvas;
}

function drawsq(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string
) {
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.moveTo(x, y + r);
  ctx.arc(x + r, y + h - r, r, Math.PI, Math.PI * 0.5, true);
  ctx.arc(x + w - r, y + h - r, r, Math.PI * 0.5, 0, true);
  ctx.arc(x + w - r, y + r, r, 0, Math.PI * 1.5, true);
  ctx.arc(x + r, y + r, r, Math.PI * 1.5, Math.PI, true);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}

function calcColorStops(
  textWidth: number,
  cx: number,
  width: number,
  color1: string,
  color2: string
) {
  if (textWidth <= cx) {
    return [
      {
        offset: 0,
        color: color1,
      },
    ];
  }

  return [
    {
      offset: 0,
      color: color1,
    },
    {
      offset: cx / textWidth,
      color: color1,
    },
    {
      offset: Math.min((cx + 20) / textWidth, 1),
      color: color2,
    },
    {
      // period
      offset: Math.min(width / textWidth, 1),
      color: color2,
    },
  ];
}
