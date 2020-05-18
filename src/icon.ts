import { fetchImage, Image, createCanvas2D } from "./canvas";
import { MASTER_URL } from "./utils";

const EQUIPMENT_ICON_SOURCE = {
  1: "MainGunS",
  2: "MainGunM",
  3: "MainGunL",
  4: "SecondaryGun",
  5: "Torpedo",
  6: "CarrierBasedFighter",
  7: "CarrierBasedBomber",
  8: "CarrierBasedTorpedo",
  9: "CarrierBasedRecon",
  10: "Seaplane",
  11: "RADAR",
  12: "AAShell",
  13: "APShell",
  14: "DamageControl",
  15: "AAGun",
  16: "HighAngleGun",
  17: "DepthCharge",
  18: "SONAR",
  19: "Engine",
  20: "LandingCraft",
  21: "Autogyro",
  22: "ASPatrol",
  23: "Bulge",
  24: "Searchlight",
  25: "DrumCanister",
  26: "RepairFacility",
  27: "Flare",
  28: "CommandFacility",
  29: "MaintenanceTeam",
  30: "AADirector",
  31: "RocketArtillery",
  32: "PicketCrew",
  33: "FlyingBoat",
  34: "Ration",
  35: "Supplies",
  36: "AmphibiousVehicle",
  37: "LandAttacker",
  38: "Interceptor",
  39: "JetFightingBomberKeiun",
  40: "JetFightingBomberKikka",
  41: "TransportMaterials",
  42: "SubmarineEquipment",
  43: "SeaplaneFighter",
  44: "ArmyInterceptor",
  45: "NightFighter",
  46: "NightTorpedo",
  47: "LandASPatrol",
};

export async function loadOriginalParameterIcons(): Promise<{
  [key: string]: Image;
}> {
  return (
    await Promise.all(
      [
        "as",
        "los",
        "luck",
        "hp",
        "air",
        "soku",
        "distance",
        "aird",
        "airdh",
        "drum",
      ].map(async (name) => {
        const src = `${MASTER_URL}/dark/${name}.png`;
        const image = await fetchImage(src);
        return { name, image };
      })
    )
  ).reduce((p, c) => Object.assign(p, { [c.name]: c.image }), {});
}

export async function load74eoAircraftLevelIcons(): Promise<{
  [key: string]: Image;
}> {
  return (
    await Promise.all(
      [0, 1, 2, 3, 4, 5, 6, 7].map(async (level: number) => {
        const src = `${MASTER_URL}/74eo/AircraftLevel/AircraftLevel${level}.png`;
        const image = await fetchImage(src);
        return { id: level, image };
      })
    )
  ).reduce((p, { id, image }) => Object.assign(p, { [id]: image }), {});
}

export async function load74eoParameterIcons(): Promise<{
  [key: string]: Image;
}> {
  return (
    await Promise.all(
      [
        "AA",
        "Accuracy",
        "Aircraft",
        "AircraftCost",
        "AircraftDistance",
        "AntiBomber",
        "Armor",
        "ASW",
        "Bomber",
        "Evasion",
        "Firepower",
        "HP",
        "Interception",
        "LOS",
        "Luck",
        "Range",
        "Speed",
        "Torpedo",
      ].map(async (id: string) => {
        const src = `${MASTER_URL}/74eo/${id}.png`;
        const image = await fetchImage(src);
        return { id, image };
      })
    )
  ).reduce((p, { id, image }) => Object.assign(p, { [id]: image }), {});
}

export async function loadOriginalEquipmentIcons(
  imgSize = 30
): Promise<{ [key: string]: Image }> {
  return (
    await Promise.all(
      Object.keys(EQUIPMENT_ICON_SOURCE).map(async (id: string) => {
        const src = `${MASTER_URL}/common_icon_weapon/common_icon_weapon_id_${id}.png`;
        const img = await fetchImage(src);
        const { canvas, ctx } = createCanvas2D(imgSize, imgSize);
        // offset
        const { canvas: oc, ctx: octx } = createCanvas2D(54, 54);
        octx.drawImage(
          img,
          img.width === 54 ? 0 : 3,
          img.height === 54 ? 0 : 3
        );
        // resize
        // step 1
        const { canvas: rc, ctx: rctx } = createCanvas2D(imgSize, imgSize);
        rctx.drawImage(oc, 0, 0, rc.width, rc.height);
        // step 2
        rctx.drawImage(rc, 0, 0, imgSize, imgSize);
        /// step 3
        ctx.drawImage(
          rc,
          0,
          0,
          imgSize,
          imgSize,
          0,
          0,
          canvas.width,
          canvas.height
        );
        const image = await fetchImage(canvas.toDataURL());
        return { id, image };
      })
    )
  ).reduce((p, { id, image }) => Object.assign(p, { [id]: image }), {});
}

export async function load74eoEquipmentIcons(
  imgSize = 54
): Promise<{ [key: string]: Image }> {
  return (
    await Promise.all(
      Object.values(EQUIPMENT_ICON_SOURCE).map(
        async (id: string, idx: number) => {
          const src = `${MASTER_URL}/74eo/Equipment/${id}.png`;
          const img = await fetchImage(src);
          const { canvas, ctx } = createCanvas2D(imgSize, imgSize);
          // offset
          const { canvas: oc, ctx: octx } = createCanvas2D(54, 54);
          octx.drawImage(img, 0, 0);
          // resize
          // step 1
          const { canvas: rc, ctx: rctx } = createCanvas2D(imgSize, imgSize);
          rctx.drawImage(oc, 0, 0, rc.width, rc.height);
          // step 2
          rctx.drawImage(rc, 0, 0, imgSize, imgSize);
          /// step 3
          ctx.drawImage(
            rc,
            0,
            0,
            imgSize,
            imgSize,
            0,
            0,
            canvas.width,
            canvas.height
          );
          const image = await fetchImage(canvas.toDataURL());
          return { id: idx + 1, image };
        }
      )
    )
  ).reduce((p, { id, image }) => Object.assign(p, { [id]: image }), {});
}
