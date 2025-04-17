import { writeFile, existsSync, mkdirSync, accessSync } from "fs";

const SERVER_LIST = [{
  ip: "w01y.kancolle-server.com",
  name: "横須賀鎮守府",
},
{
  ip: "w02k.kancolle-server.com",
  name: "呉鎮守府",
},
{
  ip: "w03s.kancolle-server.com",
  name: "佐世保鎮守府",
},
{
  ip: "w04m.kancolle-server.com",
  name: "舞鶴鎮守府",
},
{
  ip: "w05o.kancolle-server.com",
  name: "大湊警備府",
},
{
  ip: "w06t.kancolle-server.com",
  name: "トラック泊地",
},
{
  ip: "w07l.kancolle-server.com",
  name: "リンガ泊地",
},
{
  ip: "w08r.kancolle-server.com",
  name: "ラバウル基地",
},
{
  ip: "w09s.kancolle-server.com",
  name: "ショートランド泊地",
},
{
  ip: "w10b.kancolle-server.com",
  name: "ブイン基地",
},
{
  ip: "w11t.kancolle-server.com",
  name: "タウイタウイ泊地",
},
{
  ip: "w12p.kancolle-server.com",
  name: "パラオ泊地",
},
{
  ip: "w13b.kancolle-server.com",
  name: "ブルネイ泊地",
},
{
  ip: "w14h.kancolle-server.com",
  name: "単冠湾泊地",
},
{
  ip: "w15p.kancolle-server.com",
  name: "幌筵泊地",
},
{
  ip: "w16s.kancolle-server.com",
  name: "宿毛湾泊地",
},
{
  ip: "w17k.kancolle-server.com",
  name: "鹿屋基地",
},
{
  ip: "w18i.kancolle-server.com",
  name: "岩川基地",
},
{
  ip: "w19s.kancolle-server.com",
  name: "佐伯湾泊地",
},
{
  ip: "w20h.kancolle-server.com",
  name: "柱島泊地",
},
];

const KC_ASSETS = ["banner", "album_status", "remodel", "card"];

const start2 = await fetch("https://raw.githubusercontent.com/Tibowl/api_start2/master/start2.json")

const masterData = await start2.json()
writeFile("static/START2.json", JSON.stringify(masterData), (err) => {
  if (err) {
    console.error(`START2 Failed.`);
  } else {
    console.log(`START2 Complete.`);
  }
});

const ships = masterData.api_mst_ship;
Promise.all(
  KC_ASSETS.map((assets) => {
    if (!existsSync(`static/ship/${assets}`)) {
      mkdirSync(`static/ship/${assets}`);
    }
    return ships
      .filter(({ api_getmes }) => api_getmes)
      .map((ship) => ship.api_id)
      .map((id) => `static/ship/${assets}/${id}.png`)
      .filter((file) => {
        try {
          accessSync(file);
          return false;
        } catch (e) {
          return true;
        }
      });
  })
)
  .then((files) => files.flat())
  .then((files) => {
    files.forEach(async (file) => {
      const server =
        SERVER_LIST[Math.floor(Math.random() * SERVER_LIST.length)];
      const response = await fetch(
        `http://${server.ip}/kcs2/${getShip(
          file.replace(/.*\/.*\/(.*).png/, "$1"),
          file.includes("_dmg"),
          file.replace(/.*\/(.*?)(_dmg)?\/.*/, "$1")
        )}`
      );
      writeFile(file, Buffer.from(await response.arrayBuffer()), (err) => {
        if (err) {
          console.error(`${file} Failed.`);
        } else {
          console.log(`${file} Complete.`);
        }
      });
    });
  });

// Kancolle main.js
// https://gist.github.com/sanaehirotaka/c177c39c37ba09b3642705a0be5e2465

function createKey(t) {
  var e = 0;
  if (null != t && "" != t)
    for (var i = 0; i < t.length; i++) {
      e += t.charCodeAt(i);
    }
  return e;
}

function create(e, i) {
  var n = {
    resource: [
      6657,
      5699,
      3371,
      8909,
      7719,
      6229,
      5449,
      8561,
      2987,
      5501,
      3127,
      9319,
      4365,
      9811,
      9927,
      2423,
      3439,
      1865,
      5925,
      4409,
      5509,
      1517,
      9695,
      9255,
      5325,
      3691,
      5519,
      6949,
      5607,
      9539,
      4133,
      7795,
      5465,
      2659,
      6381,
      6875,
      4019,
      9195,
      5645,
      2887,
      1213,
      1815,
      8671,
      3015,
      3147,
      2991,
      7977,
      7045,
      1619,
      7909,
      4451,
      6573,
      4545,
      8251,
      5983,
      2849,
      7249,
      7449,
      9477,
      5963,
      2711,
      9019,
      7375,
      2201,
      5631,
      4893,
      7653,
      3719,
      8819,
      5839,
      1853,
      9843,
      9119,
      7023,
      5681,
      2345,
      9873,
      6349,
      9315,
      3795,
      9737,
      4633,
      4173,
      7549,
      7171,
      6147,
      4723,
      5039,
      2723,
      7815,
      6201,
      5999,
      5339,
      4431,
      2911,
      4435,
      3611,
      4423,
      9517,
      3243,
    ],
    voice: [
      2475,
      6547,
      1471,
      8691,
      7847,
      3595,
      1767,
      3311,
      2507,
      9651,
      5321,
      4473,
      7117,
      5947,
      9489,
      2669,
      8741,
      6149,
      1301,
      7297,
      2975,
      6413,
      8391,
      9705,
      2243,
      2091,
      4231,
      3107,
      9499,
      4205,
      6013,
      3393,
      6401,
      6985,
      3683,
      9447,
      3287,
      5181,
      7587,
      9353,
      2135,
      4947,
      5405,
      5223,
      9457,
      5767,
      9265,
      8191,
      3927,
      3061,
      2805,
      3273,
      7331,
    ],
  };

  var o = e.toString().match(/\d+/);
  if (null == o || 0 == o.length) return "";
  var r = parseInt(o[0]);
  var s = createKey(i);
  var a = null == i || 0 == i.length ? 1 : i.length;
  return (
    ((17 * (r + 7) * n.resource[(s + r * a) % 100]) % 8973) +
    1e3
  ).toString();
}

function zeroPadding(t, e) {
  var i = t >= 0 ? "" : "-";
  t = Math.abs(t);
  for (
    var n = t > 0 ? Math.floor(Math.log(t) * Math.LOG10E + 1) : 1,
    o = "",
    r = 0,
    s = e - n; r < s; r++
  ) {
    o += "0";
  }
  return i + o + t;
}

function getShip(t, e, i) {
  // "album_status" == i ? e = !1 : 1 == o.ShipUtil.isEnemy(t) && (e = !1);
  var _ = i + (e ? "_dmg" : "");
  var u = "ship_" + _;
  var l = create(t, u);
  var c = zeroPadding(t, 4);
  return "resources/ship/" + _ + "/" + c + "_" + l + ".png"; // + a.VersionUtil.getResourceVersion(0, parseInt(c));
}
