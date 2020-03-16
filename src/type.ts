const SKILLED_BONUS_LIST: {
  [key: number]: number[];
} = {
  /** 艦上戦闘機/夜間戦闘機 */
  6: [0, 0, 2, 5, 9, 14, 14, 22],
  /** 艦上爆撃機/夜間爆撃機 */
  7: [0, 0, 0, 0, 0, 0, 0, 0],
  /** 艦上攻撃機/夜間攻撃機 */
  8: [0, 0, 0, 0, 0, 0, 0, 0],
  /** 水上爆撃機 */
  11: [0, 0, 1, 1, 1, 3, 3, 6],
  /** 水上戦闘機 */
  45: [0, 0, 2, 5, 9, 14, 14, 22],
  /** 局地戦闘機 */
  48: [0, 0, 2, 5, 9, 14, 14, 22],
  /** 噴式戦闘機 */
  56: [0, 0, 2, 5, 9, 14, 14, 22],
  /** 噴式戦闘爆撃機 */
  57: [0, 0, 0, 0, 0, 0, 0, 0],
  /** 噴式攻撃機 */
  58: [0, 0, 0, 0, 0, 0, 0, 0]
};

const SKILLED_BONUS = {
  MIN: [0, 10, 25, 40, 55, 70, 85, 100],
  MAX: [9, 24, 39, 54, 69, 84, 99, 120]
};

/**
 * 艦
 */
export class Ship {
  /** 艦ID */
  id: number;
  /** 艦名 */
  name: string;
  /** 読み */
  yomi: string;
  /** 艦種ID */
  stype: number;
  /** 艦型ID */
  ctype: number;
  /** 耐久 */
  hp: number;
  /** 火力 */
  firepower: number;
  /** 雷装 */
  torpedo: number;
  /** 対空 */
  aa: number;
  /** 装甲 */
  armor: number;
  /** 対潜 */
  asw: number;
  /** 回避 */
  evasion: number;
  /** 索敵 */
  los: number;
  /** 運 */
  luck: number;
  /** 射程 */
  range: 0 | 1 | 2 | 3 | 4;
  /** 速力 */
  sp: 0 | 5 | 10 | 15 | 20;
  /** スロット数 */
  slotNum: number;
  /** 搭載機数 */
  slots: number[];
  /** 装備 */
  items: Item[];
  /** Lv */
  lv: number;

  get airPower(): {
    min: number;
    max: number;
  } {
    function getImprovementBonus(item: Item): number {
      if (item.lv > 0) {
        switch (item.type[2]) {
          case 6:
          case 45:
            return 0.2 * item.lv;
          case 7:
          case 8:
          case 57:
            return item.id !== 320 ? 0.25 * item.lv : 0;
        }
      }
      return 0;
    }

    return Object.values(this.items)
      .map((item, i) => {
        if (this.slots[i] > 0 && item && SKILLED_BONUS_LIST[item.type[2]]) {
          const bonus =
            SKILLED_BONUS_LIST[item.type[2]][7] +
            Math.sqrt(this.slots[i]) * (item.aa + getImprovementBonus(item));
          return {
            min: bonus + Math.sqrt(SKILLED_BONUS.MIN[7] / 10),
            max: bonus + Math.sqrt(SKILLED_BONUS.MAX[7] / 10)
          };
        }
        return { min: 0, max: 0 };
      })
      .map(({ min, max }) => ({
        min: Math.floor(min),
        max: Math.floor(max)
      }))
      .reduce(
        (p, v) => {
          p.min += v.min;
          p.max += v.max;
          return p;
        },
        {
          min: 0,
          max: 0
        }
      );
  }

  /**
   * パラメータを設定する
   * ※この値が表示されるので、装備パラメータも一緒に含めること
   * @param id 艦ID
   * @param name 艦名
   * @param yomi 読み
   * @param stype 艦種ID
   * @param ctype 艦型ID
   * @param lv 艦Lv
   * @param hp HP
   * @param firepower 火力
   * @param torpedo 雷装
   * @param aa 対空
   * @param armor 装甲
   * @param asw 対潜
   * @param evasion 回避
   * @param los 索敵
   * @param luck 運
   * @param slotNum 装備スロット数
   * @param range 射程
   * @param speed 艦速
   * @param slots 装備スロット
   * @param items 装備
   */
  constructor(
    id: number,
    name: string,
    yomi: string,
    stype: number,
    ctype: number,
    lv: number,
    hp: number,
    firepower: number,
    torpedo: number,
    aa: number,
    armor: number,
    asw: number,
    evasion: number,
    los: number,
    luck: number,
    slotNum: number,
    range: 0 | 1 | 2 | 3 | 4,
    speed: 0 | 5 | 10 | 15 | 20,
    slots: number[],
    items: Item[]
  ) {
    this.id = id;
    this.name = name;
    this.yomi = yomi;
    this.stype = stype;
    this.ctype = ctype;
    this.lv = lv;
    this.hp = hp;
    this.firepower = firepower;
    this.torpedo = torpedo;
    this.aa = aa;
    this.armor = armor;
    this.asw = asw;
    this.evasion = evasion;
    this.los = los;
    this.luck = luck;
    this.items = items;
    this.range = range;
    this.sp = speed;
    this.slotNum = slotNum;
    this.slots = slots;
  }

  static get UNKNOWN(): Ship {
    return new Ship(
      0,
      "",
      "",
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      [0, 0, 0, 0, 0],
      []
    );
  }

  get speed(): 0 | 5 | 10 | 15 | 20 {
    const turbine = this.items.filter(item => item.id === 33).length;
    const boiler = this.items.filter(item => item.id === 34).length;
    const newBoiler = this.items.filter(item => item.id === 87).length;
    if (!turbine) return this.sp;
    // 高速グループ
    if (this.sp === 10) {
      // 高速A群:島風、Ташкент、大鳳、翔鶴型、利根型、最上型
      if ([22, 81, 43, 33, 31, 9].includes(this.ctype)) {
        if (newBoiler || boiler >= 2) return 20;
        if (boiler) return 15;
      }
      // 高速B1群:天津風、阿賀野型、蒼龍、飛龍、雲龍、天城、金剛型、Iowa
      if (
        [41, 17, 25, 6, 65].includes(this.ctype) ||
        ["あまつかぜ", "うんりゅう", "あまぎ"].includes(this.yomi)
      ) {
        if (newBoiler >= 2 || (newBoiler && boiler)) return 20;
        if (newBoiler || boiler) return 15;
      }
      // 高速B2群:駆逐、軽巡、雷巡、重巡、軽空母、赤城、葛城、Bismarck、Littorioなど
      if (
        [2, 3, 4, 5, 7].includes(this.stype) ||
        [14, 47, 58].includes(this.ctype) ||
        ["かつらぎ"].includes(this.yomi)
      ) {
        if (newBoiler >= 2 || newBoiler + boiler >= 3) return 20;
        if (newBoiler || boiler) return 15;
      }
      // 高速C群:加賀、夕張、水母
      if ([16].includes(this.stype) || [3, 34].includes(this.ctype)) {
        if (newBoiler || boiler) return 15;
      }
    }
    // 低速グループ
    if (this.sp === 5) {
      // 低速A群:大和型、長門型改二
      if ([37].includes(this.ctype) || [541, 573].includes(this.id)) {
        if ((newBoiler >= 2 && boiler) || (newBoiler && boiler >= 2)) return 20;
        if (newBoiler && (newBoiler >= 2 || boiler)) return 15;
        if (newBoiler || boiler) return 10;
      }
      // 低速B群:戦艦、航戦、軽空母、水母、練巡、大鯨など
      if (
        [8, 9, 10, 7, 16, 21].includes(this.stype) ||
        [50].includes(this.ctype)
      ) {
        if (newBoiler >= 2 || newBoiler + boiler >= 3) return 15;
        if (newBoiler || boiler) return 10;
      }
      // 低速C群:潜水艦、潜水空母、あきつ丸、明石、速吸
      if ([13, 14].includes(this.stype) || [45, 49, 60].includes(this.ctype)) {
        if (newBoiler || boiler) return 10;
      }
      // 低速特殊B群:Samuel B.Roberts、夕張
      if (["サミュエル・B・ロバーツ", "ゆうばり"].includes(this.yomi)) {
        if (newBoiler >= 2 || newBoiler + boiler >= 3) return 15;
        return 10;
      }
    }
    return this.sp;
  }
}

class UnknownMasterItem implements MasterItem {
  api_id = 0;
  api_sortno = 0;
  api_name = "";
  api_type = [0, 0, 0, 0, 0];
  api_taik = 0;
  api_souk = 0;
  api_houg = 0;
  api_raig = 0;
  api_soku = 0;
  api_baku = 0;
  api_tyku = 0;
  api_tais = 0;
  api_atap = 0;
  api_houm = 0;
  api_raim = 0;
  api_houk = 0;
  api_raik = 0;
  api_bakk = 0;
  api_saku = 0;
  api_sakb = 0;
  api_luck = 0;
  api_leng: 0 | 1 | 2 | 3 | 4 = 0;
  api_rare = 0;
  api_broken = [0, 0, 0, 0];
  api_usebull = "";
  api_version = 0;
  api_distance = 0;
  api_cost = 0;
}

/**
 * 装備
 */
export class Item {
  /** 装備ID */
  id = 0;
  /** 装備名 */
  name = "";
  /** 装備タイプ */
  type = [0, 0, 0, 0, 0];
  /** 火力 */
  firepower = 0;
  /** 雷装 */
  torpedo = 0;
  /** 爆装 */
  bomb = 0;
  /** 装甲 */
  armor = 0;
  /** 対空 */
  aa = 0;
  /** 回避/迎撃 */
  evasion = 0;
  /** 命中/対爆 */
  accuracy = 0;
  /** 対潜 */
  asw = 0;
  /** 索敵 */
  los = 0;
  /** 射程 */
  range = 0;
  /** 航続距離 */
  distance = 0;
  /** 配置コスト */
  cost = 0;
  /** 改修 */
  lv = 0;
  /** 熟練度 */
  alv = 0;

  /**
   * @param master マスターデータ
   * @param lv 改修
   * @param alv 熟練度
   */
  constructor(master: MasterItem, lv = 0, alv = 0) {
    this.id = master.api_id;
    this.name = master.api_name;
    this.type = master.api_type;
    this.firepower = master.api_houg;
    this.torpedo = master.api_raig;
    this.bomb = master.api_baku;
    this.armor = master.api_souk;
    this.aa = master.api_tyku;
    this.evasion = master.api_houk;
    this.accuracy = master.api_houm;
    this.asw = master.api_tais;
    this.los = master.api_saku;
    this.range = master.api_leng;
    this.distance = master.api_distance || 0;
    this.cost = master.api_cost || 0;
    this.lv = lv;
    this.alv = alv;
  }

  static get UNKNOWN(): Item {
    return new Item(new UnknownMasterItem());
  }
}

export class Airbase {
  mode = 0;
  items: Item[] = [];

  constructor(items: Item[]) {
    this.items = items;
  }
}

export class Fleet {
  name: string;
  ships: Ship[];

  constructor(ships: Ship[], name = "") {
    this.ships = ships;
    this.name = name;
  }
}

interface MasterData {
  api_result: number;
  api_result_msg: string;
  api_data: Apidata;
}

interface Apidata {
  api_mst_ship: MasterShip[];
  api_mst_slotitem: MasterItem[];
}

interface MasterShip {
  api_id: number;
  api_sortno: number;
  api_sort_id: number;
  api_name: string;
  api_yomi: string;
  api_stype: number;
  api_ctype: number;
  api_afterlv: number;
  api_aftershipid: string;
  api_taik: number[];
  api_souk: number[];
  api_houg: number[];
  api_raig: number[];
  api_tyku: number[];
  api_luck: number[];
  api_soku: 0 | 5 | 10 | 15 | 20;
  api_leng: 0 | 1 | 2 | 3 | 4;
  api_slot_num: number;
  api_maxeq: number[];
  api_buildtime: number;
  api_broken: number[];
  api_powup: number[];
  api_backs: number;
  api_getmes: string;
  api_afterfuel: number;
  api_afterbull: number;
  api_fuel_max: number;
  api_bull_max: number;
  api_voicef: number;
}

interface MasterItem {
  api_id: number;
  api_sortno: number;
  api_name: string;
  api_type: number[];
  api_taik: number;
  api_souk: number;
  api_houg: number;
  api_raig: number;
  api_soku: number;
  api_baku: number;
  api_tyku: number;
  api_tais: number;
  api_atap: number;
  api_houm: number;
  api_raim: number;
  api_houk: number;
  api_raik: number;
  api_bakk: number;
  api_saku: number;
  api_sakb: number;
  api_luck: number;
  api_leng: 0 | 1 | 2 | 3 | 4;
  api_rare: number;
  api_broken: number[];
  api_usebull: string;
  api_version: number;
  api_distance: number;
  api_cost: number;
}

export interface FormatData {
  lang: "jp" | "en" | "ko" | "tcn" | "scn";
  theme: string;
  hqlv: number;
  fleets: Fleet[];
  airbases: Airbase[];
}

/**
 * デッキビルダー型のフォーマット
 * 数値のパラメータが直接出力されるので、表示値をそのまま入れること
 */
export interface DeckBuilder {
  /** 言語 */
  lang: "jp" | "en" | "ko" | "tcn" | "scn";
  /**
   * テーマ
   * dark=オリジナル
   * 74lc=74式(大型)
   * 74mc=74式(中型)
   * 74sb=74式(小型)
   */
  theme: "dark" | "74lc" | "74mc" | "74sb";
  hqlv: number;
  f1?: DeckBuilderFleet;
  f2?: DeckBuilderFleet;
  f3?: DeckBuilderFleet;
  f4?: DeckBuilderFleet;
  a1?: DeckBuilderAirbase;
  a2?: DeckBuilderAirbase;
  a3?: DeckBuilderAirbase;
}

export interface DeckBuilderFleet {
  name?: string;
  s1?: DeckBuilderShip;
  s2?: DeckBuilderShip;
  s3?: DeckBuilderShip;
  s4?: DeckBuilderShip;
  s5?: DeckBuilderShip;
  s6?: DeckBuilderShip;
  s7?: DeckBuilderShip;
}

interface DeckBuilderShip {
  /** 艦ID */
  id: number;
  /** レベル */
  lv: number;
  /** 装備 */
  items: {
    i1?: DeckBuilderItem;
    i2?: DeckBuilderItem;
    i3?: DeckBuilderItem;
    i4?: DeckBuilderItem;
    i5?: DeckBuilderItem;
    ix?: DeckBuilderItem;
  };
  /** 耐久 */
  hp: number;
  /** 火力 */
  fp: number;
  /** 雷装 */
  tp: number;
  /** 対空 */
  aa: number;
  /** 装甲 */
  ar: number;
  /** 対潜 */
  asw: number;
  /** 回避 */
  ev: number;
  /** 索敵 */
  los: number;
  /** 運 */
  luck: number;
}

interface DeckBuilderItem {
  id: number;
  rf: number;
  mas: number;
}

interface DeckBuilderAirbase {
  /** 基地状態 */
  mode?: number;
  /** 装備 */
  items: {
    i1?: DeckBuilderItem;
    i2?: DeckBuilderItem;
    i3?: DeckBuilderItem;
    i4?: DeckBuilderItem;
  };
}

export async function loadStart2(): Promise<MasterData> {
  const url = `https://raw.githubusercontent.com/Nishisonic/gkcoi/master/static/START2.json`;
  const res = await fetch(url);
  return res.json();
}

export function parse(
  deckbuilder: DeckBuilder,
  master: MasterData
): FormatData {
  const masterShip: {
    [key: number]: MasterShip;
  } = master.api_data.api_mst_ship.reduce(
    (previous: { [key: number]: MasterShip }, current: MasterShip) => {
      previous[current.api_id] = current;
      return previous;
    },
    {}
  );
  const masterItem: {
    [key: number]: MasterItem;
  } = master.api_data.api_mst_slotitem.reduce(
    (previous: { [key: number]: MasterItem }, current: MasterItem) => {
      previous[current.api_id] = current;
      return previous;
    },
    {}
  );

  function parseItem(item?: DeckBuilderItem): Item {
    if (!item || !item.id) {
      return Item.UNKNOWN;
    }
    const itemid: number = item.id;
    const lv: number = item.rf || 0;
    const alv: number = item.mas || 0;
    return new Item(masterItem[itemid], lv, alv);
  }

  function parseShip(ship?: DeckBuilderShip): Ship {
    if (!ship || Number(ship.id) <= 0) {
      return Ship.UNKNOWN;
    }
    const id: number = ship.id;
    const lv: number = ship.lv;
    const hp: number = ship.hp;
    const firepower: number = ship.fp;
    const torpedo: number = ship.tp;
    const aa: number = ship.aa;
    const armor: number = ship.ar;
    const asw: number = ship.asw;
    const evasion: number = ship.ev;
    const los: number = ship.los;
    const luck: number = ship.luck;
    const items = [
      ship.items.i1,
      ship.items.i2,
      ship.items.i3,
      ship.items.i4,
      ship.items.i5,
      ship.items.ix
    ].map(item => parseItem(item));
    return new Ship(
      id,
      masterShip[id].api_name,
      masterShip[id].api_yomi,
      masterShip[id].api_stype,
      masterShip[id].api_ctype,
      lv,
      hp,
      firepower,
      torpedo,
      aa,
      armor,
      asw,
      evasion,
      los,
      luck,
      masterShip[id].api_slot_num,
      masterShip[id].api_leng,
      masterShip[id].api_soku,
      masterShip[id].api_maxeq,
      items
    );
  }

  const lang: "jp" | "en" | "ko" | "tcn" | "scn" = deckbuilder.lang || "ja";
  const theme: string = deckbuilder.theme || "dark";
  const hqlv: number = deckbuilder.hqlv || 120;
  return {
    lang,
    theme,
    hqlv,
    fleets: [deckbuilder.f1, deckbuilder.f2, deckbuilder.f3, deckbuilder.f4]
      .filter(fleet => fleet)
      .map(fleet => {
        // 意味ないが、こうしないとtsが誤検知する
        if (fleet) {
          return new Fleet(
            [
              fleet.s1,
              fleet.s2,
              fleet.s3,
              fleet.s4,
              fleet.s5,
              fleet.s6,
              fleet.s7
            ].map(ship => parseShip(ship)),
            fleet.name || ""
          );
        }
        return new Fleet([]);
      }),
    airbases: [deckbuilder.a1, deckbuilder.a2, deckbuilder.a3]
      .filter(airbase => airbase)
      .map(airbase => {
        // 意味ないが、こうしないとtsが誤検知する
        if (airbase) {
          const items = airbase.items;
          return new Airbase(
            [items.i1, items.i2, items.i3, items.i4].map(item =>
              parseItem(item)
            )
          );
        }
        return new Airbase([]);
      })
  };
}
