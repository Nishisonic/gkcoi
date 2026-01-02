import {
  generateDarkFleetCanvasAsync,
  generateDarkParameterCanvasAsync,
  generateDarkExpeditionStatsCanvasAsync,
  generateDarkAirbaseCanvasAsync,
} from "./theme/dark";
import {
  parse,
  Ship,
  DeckBuilder,
  Speed,
  LoS,
  GenerateOptions,
  Theme,
} from "./type";
import { getLoSValue } from "./utils";
import { generate74eoLargeCardFleetCanvasAsync } from "./theme/74eoLC";
import { generate74eoMediumCutinFleetCanvasAsync } from "./theme/74eoMC";
import { generate74eoSmallBannerFleetCanvasAsync } from "./theme/74eoSB";
import { Canvas, createCanvas2D, fetchImage } from "./canvas";
import { stick } from "./iutils";
import { generateOfficialFleetCanvasAsync } from "./theme/official";
import steg from "ts-steganography";
import { generateWhiteFleetCanvasAsync } from "./theme/white";
import {
  generateLightAirbaseCanvasAsync,
  generateLightExpeditionStatsCanvasAsync,
  generateLightFleetCanvasAsync,
  generateLightParameterCanvasAsync,
} from "./theme/light";
import { config } from "./config";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import LZString from "lz-string";
import {
  generateFlatAirbaseCanvasAsync,
  generateFlatFleetCanvasAsync,
} from "./theme/flat";

export {
  DeckBuilder,
  DeckBuilderFleet,
  DeckBuilderShip,
  DeckBuilderItem,
  DeckBuilderAirbase,
} from "./type";

async function createAsync(
  deckbuilder: DeckBuilder,
  options: Required<Pick<GenerateOptions, "start2URL" | "shipURL">>,
  los?: LoS,
  speed?: Speed,
): Promise<Canvas> {
  const apidata = await (await fetch(options.start2URL)).json();
  const { lang, theme, hqlv, fleets, airbases, airState, comment } = parse(
    deckbuilder,
    apidata,
    options.shipURL,
  );
  const has5slot = fleets.some(({ ships }) =>
    ships.some((ship) => ship.slotNum === 5),
  );
  const fimage = stick(
    await Promise.all(
      fleets
        .filter((v, i) =>
          ["dark-ex", "light-ex"].includes(theme) ? i === 0 : true,
        )
        .map(async ({ ships, name }: { ships: Ship[]; name: string }, i) => {
          if (!los)
            los = {
              1: getLoSValue(ships, hqlv, 1),
              2: getLoSValue(ships, hqlv, 2),
              3: getLoSValue(ships, hqlv, 3),
              4: getLoSValue(ships, hqlv, 4),
              5: getLoSValue(ships, hqlv, 5),
            };
          const airPower = ships
            .filter((ship) => ship.id > 0)
            .map((ship) => ship.airPower)
            .reduce(
              (previous, airpower) => {
                previous.min += airpower.min;
                previous.max += airpower.max;
                return previous;
              },
              {
                min: 0,
                max: 0,
              },
            );
          if (!speed)
            speed = ships
              .filter((ship) => ship.id > 0)
              .map((ship) => ship.speed)
              .reduce(
                (previous, speed) => (previous > speed ? speed : previous),
                20,
              );

          switch (theme) {
            case "white":
              return await generateWhiteFleetCanvasAsync(i, ships, lang);
            case "light":
            case "light-ex":
              return await generateLightFleetCanvasAsync(
                i,
                ships,
                los,
                airPower,
                speed,
                lang,
              );
            case "dark":
            case "dark-ex":
              return await generateDarkFleetCanvasAsync(
                i,
                ships,
                los,
                airPower,
                speed,
                lang,
                deckbuilder?.options,
              );
            case "74lc":
              return await generate74eoLargeCardFleetCanvasAsync(
                name,
                ships,
                los,
                airPower,
                lang,
              );
            case "74mc":
              return await generate74eoMediumCutinFleetCanvasAsync(
                name,
                ships,
                los,
                airPower,
                lang,
                has5slot,
              );
            case "74sb":
              return await generate74eoSmallBannerFleetCanvasAsync(
                name,
                ships,
                los,
                airPower,
                lang,
                has5slot,
              );
            case "official":
              return await generateOfficialFleetCanvasAsync(ships, lang);
            case "flat":
              return await generateFlatFleetCanvasAsync(
                i,
                ships,
                los,
                airPower,
                speed,
                lang,
                deckbuilder?.options,
              );
          }
        }),
    ),
    ["74lc", "74sb", "official"].includes(theme) ||
      fleets.filter(({ ships }) => ships.length > 0).length > 2
      ? 2
      : 1,
    theme === "dark"
      ? "#212121"
      : theme === "official"
        ? "#ece3d7"
        : theme === "light"
          ? "#FAFAFA"
          : "white",
  );
  if (theme === "dark-ex") {
    const eimage = await generateDarkExpeditionStatsCanvasAsync(
      fleets[0].ships,
      lang,
    );
    const { canvas, ctx } = createCanvas2D(
      fimage.width + eimage.width + 2,
      fimage.height,
    );
    ctx.fillStyle = "#212121";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(fimage, 0, 0);
    ctx.drawImage(eimage, fimage.width + 2, 0);
    return canvas;
  } else if (theme === "light-ex") {
    const eimage = await generateLightExpeditionStatsCanvasAsync(
      fleets[0].ships,
      lang,
    );
    const { canvas, ctx } = createCanvas2D(
      fimage.width + eimage.width + 2,
      fimage.height,
    );
    ctx.fillStyle = "#FAFAFA";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(fimage, 0, 0);
    ctx.drawImage(eimage, fimage.width + 2, 0);
    return canvas;
  }
  const useAirbase = airbases
    .map(({ items }) => items)
    .some((items) => items.some(({ id }) => id > 0));
  if (useAirbase) {
    if (theme === "dark") {
      const aimage = await generateDarkAirbaseCanvasAsync(airbases, lang);
      const { canvas, ctx } = createCanvas2D(
        fimage.width + aimage.width + 2,
        fimage.height,
      );
      ctx.fillStyle = "#212121";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(fimage, 0, 0);
      ctx.drawImage(aimage, fimage.width + 2, 0);
      if (fleets.length > 1) {
        const pimage = await generateDarkParameterCanvasAsync(
          apidata,
          [fleets[0].ships, fleets[1].ships].flat(),
          airState,
          comment,
          lang,
        );
        ctx.drawImage(pimage, fimage.width + 2, aimage.height);
      }
      return canvas;
    } else if (theme === "light") {
      const aimage = await generateLightAirbaseCanvasAsync(airbases, lang);
      const { canvas, ctx } = createCanvas2D(
        fimage.width + aimage.width + 2,
        fimage.height,
      );
      ctx.fillStyle = "#FAFAFA";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(fimage, 0, 0);
      ctx.drawImage(aimage, fimage.width + 2, 0);
      if (fleets.length > 1) {
        const pimage = await generateLightParameterCanvasAsync(
          apidata,
          [fleets[0].ships, fleets[1].ships].flat(),
          airState,
          comment,
          lang,
        );
        ctx.drawImage(pimage, fimage.width + 2, aimage.height);
      }
      return canvas;
    } else if (theme === "flat") {
      const aimage = await generateFlatAirbaseCanvasAsync(
        airbases,
        lang,
        comment,
        fleets[0].ships.filter((ship) => ship.id > 0).length > 6 &&
          fleets.length === 1,
      );
      const { canvas, ctx } = createCanvas2D(
        fimage.width + aimage.width,
        fimage.height,
      );

      ctx.drawImage(fimage, 0, 0);
      ctx.drawImage(aimage, fimage.width, 0);
      return canvas;
    }
  }
  return fimage;
}

/**
 * 画像を生成する
 * @param deckbuilder フォーマット
 * @param options 画像取得オプション
 * @return 編成画像
 */
export async function generate(
  deckbuilder: DeckBuilder,
  options?: GenerateOptions,
  los?: LoS,
  speed?: Speed,
): Promise<Canvas> {
  if (options?.masterUrl) {
    config.masterUrl = options?.masterUrl;
  }

  const original = await createAsync(
    deckbuilder,
    Object.assign(
      {
        start2URL: `${config.masterUrl}/START2.json`,
        shipURL: `${config.masterUrl}/ship`,
      },
      options,
    ),
    los,
    speed,
  );
  const src = await steg.encode(
    LZString.compressToBase64(JSON.stringify(deckbuilder)),
    original.toDataURL(),
  );
  const { canvas, ctx } = createCanvas2D(original.width, original.height);
  ctx.drawImage(await fetchImage(src), 0, 0);
  return canvas;
}

/**
 * 画像をデコードして情報を取り出す
 * @param src ソース
 * @return フォーマット
 */
export async function decode(src: string) {
  return JSON.parse(LZString.decompressFromBase64(await steg.decode(src)));
}
