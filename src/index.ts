import { generateDarkFleetCanvasAsync } from "./theme/dark";
import { parse, loadStart2, Ship, DeckBuilder } from "./type";
import { getLoSValue } from "./utils";
import { generate74eoLargeCardFleetCanvasAsync } from "./theme/74eoLC";
import { generate74eoMediumCutinFleetCanvasAsync } from "./theme/74eoMC";
import { generate74eoSmallBannerFleetCanvasAsync } from "./theme/74eoSB";
import { createCanvas, Canvas } from "./canvas";
import { stick } from "./stick";

export { DeckBuilder } from "./type";

export async function generate(deckbuilder: DeckBuilder): Promise<Canvas> {
  const start2 = await loadStart2();
  const { lang, theme, hqlv, fleets, airbases } = parse(deckbuilder, start2);
  const has5slot = fleets.some(({ ships }) =>
    ships.some((ship) => ship.slotNum === 5)
  );
  return stick(
    await Promise.all(
      fleets.map(
        async ({ ships, name }: { ships: Ship[]; name: string }, i) => {
          const los = {
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
              }
            );
          const speed: 0 | 5 | 10 | 15 | 20 = ships
            .filter((ship) => ship.id > 0)
            .map((ship) => ship.speed)
            .reduce(
              (previous, speed) => (previous > speed ? speed : previous),
              20
            );

          switch (theme) {
            case "dark":
              return await generateDarkFleetCanvasAsync(
                i,
                ships,
                los,
                airPower,
                speed,
                lang
              );
            case "74lc":
              return await generate74eoLargeCardFleetCanvasAsync(
                name,
                ships,
                los,
                airPower,
                lang
              );
            case "74mc":
              return await generate74eoMediumCutinFleetCanvasAsync(
                name,
                ships,
                los,
                airPower,
                lang,
                has5slot
              );
            case "74sb":
              return await generate74eoSmallBannerFleetCanvasAsync(
                name,
                ships,
                los,
                airPower,
                lang,
                has5slot
              );
          }
          return createCanvas(0, 0);
        }
      )
    ),
    ["74lc", "74sb"].includes(theme) ||
      fleets.filter(({ ships }: { ships: Ship[] }) => ships.length > 0).length >
        2
      ? 2
      : 1
  );
}
