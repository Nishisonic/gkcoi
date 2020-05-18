import { getAirPower, MASTER_URL } from "./utils";
import { Lang } from "./lang";
import { Image, fetchImage } from "./canvas";

export type Theme = "dark" | "74lc" | "74mc" | "74sb";
export type Range = 0 | 1 | 2 | 3 | 4;
export type Speed = 0 | 5 | 10 | 15 | 20;
export type AirState = "AS+" | "AS" | "AP";
export type AirPower = { min: number; max: number };
export type LoS = {
  [key: string]: number;
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

export enum ShipImageKind {
  ALBUM_STATUS = "album_status",
  BANNER = "banner",
  CARD = "card",
  REMODEL = "remodel",
}

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
  range: Range;
  /** 速力 */
  sp: Speed;
  /** スロット数 */
  slotNum: number;
  /** 搭載機数 */
  slots: number[];
  /** 装備 */
  items: Item[];
  /** Lv */
  lv: number;
  /** URL */
  url: string;

  get airPower(): {
    min: number;
    max: number;
  } {
    return getAirPower(this.items, this.slots);
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
   * @param url URL
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
    range: Range,
    speed: Speed,
    slots: number[],
    items: Item[],
    url: string = MASTER_URL
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
    this.url = url;
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

  get tp(): number {
    const shipTP = ((): number => {
      switch (this.stype) {
        case 2: // 駆逐艦
          return 5;
        case 3: // 軽巡洋艦
          return 2 + (this.id === 487 ? 8 : 0);
        case 6: // 航空巡洋艦
          return 4;
        case 10: // 航空戦艦
          return 7;
        case 14: // 潜水空母
          return 1;
        case 16: // 水上機母艦
          return 9;
        case 17: // 揚陸艦
          return 12;
        case 20: // 潜水母艦
          return 7;
        case 21: // 練習巡洋艦
          return 6;
        case 15:
        case 22: // 補給艦
          return 15;
      }
      return 0;
    })();

    const itemTP = this.items
      .filter(({ id }) => id > 0)
      .map(({ type }): number => {
        switch (type[2]) {
          case 30: // 簡易輸送部材
            return 5;
          case 24: // 上陸用舟艇
            return 8;
          case 46: // 特型内火艇
            return 2;
          case 43: // 戦闘糧食
            return 1;
        }
        return 0;
      })
      .reduce((p, v) => p + v, 0);

    return shipTP + itemTP;
  }

  get speed(): Speed {
    const turbine = this.items.filter((item) => item.id === 33).length;
    const boiler = this.items.filter((item) => item.id === 34).length;
    const newBoiler = this.items.filter((item) => item.id === 87).length;
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

  async fetchImage(kind: ShipImageKind): Promise<Image> {
    return await fetchImage(`${this.url}/${kind}/${this.id}.png`);
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

export interface MasterData {
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
  api_soku: Speed;
  api_leng: Range;
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
  api_leng: Range;
  api_rare: number;
  api_broken: number[];
  api_usebull: string;
  api_version: number;
  api_distance: number;
  api_cost: number;
}

interface FormatData {
  lang: Lang;
  theme: Theme;
  hqlv: number;
  fleets: Fleet[];
  airbases: Airbase[];
  airState: AirState;
  comment: string;
}

/**
 * デッキビルダー型のフォーマット
 * 数値のパラメータが直接出力されるので、表示値をそのまま入れること
 */
export interface DeckBuilder {
  /** 言語 */
  lang: Lang;
  /**
   * テーマ
   * dark=オリジナル
   * 74lc=74式(大型)
   * 74mc=74式(中型)
   * 74sb=74式(小型)
   */
  theme: Theme;
  /**
   * 司令部Lv
   */
  hqlv: number;
  /**
   * 第一艦隊
   */
  f1?: DeckBuilderFleet;
  /**
   * 第二艦隊
   */
  f2?: DeckBuilderFleet;
  /**
   * 第三艦隊
   */
  f3?: DeckBuilderFleet;
  /**
   * 第四艦隊
   */
  f4?: DeckBuilderFleet;
  /**
   * 第一基地航空隊
   */
  a1?: DeckBuilderAirbase;
  /**
   * 第二基地航空隊
   */
  a2?: DeckBuilderAirbase;
  /**
   * 第三基地航空隊
   */
  a3?: DeckBuilderAirbase;
  /**
   * 制空状態(dark ver.&複数艦隊&基地航空隊使用時のみ使用)
   * 触接率グラフ表示に使用
   *
   * AS+:制空権確保
   * AS:航空優勢
   * AP:航空劣勢
   */
  as?: AirState;
  /**
   * コメント(dark ver.&複数艦隊&基地航空隊使用時のみ使用)
   * コメント表示に使用
   */
  cmt?: string;
}

/**
 * フォーマット(艦隊)
 */
export interface DeckBuilderFleet {
  /** 艦隊名(七四式ver.使用時のみ使用) */
  name?: string;
  /** 旗艦 */
  s1?: DeckBuilderShip;
  /** 二番艦 */
  s2?: DeckBuilderShip;
  /** 三番艦 */
  s3?: DeckBuilderShip;
  /** 四番艦 */
  s4?: DeckBuilderShip;
  /** 五番艦 */
  s5?: DeckBuilderShip;
  /** 六番艦 */
  s6?: DeckBuilderShip;
  /** 七番艦(これを設定する場合、出力は一艦隊のみにすること) */
  s7?: DeckBuilderShip;
}

/**
 * フォーマット(艦)
 */
export interface DeckBuilderShip {
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

/**
 * フォーマット(装備)
 * 熟練度の値はそのまま制空に反映されるので注意
 */
export interface DeckBuilderItem {
  /** 装備ID */
  id: number;
  /** 改修 */
  rf?: number;
  /** 熟練度 */
  mas?: number;
}

/**
 * フォーマット(基地)
 */
export interface DeckBuilderAirbase {
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

export function parse(
  deckbuilder: DeckBuilder,
  master: MasterData,
  url: string
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
      ship.items.ix,
    ].map((item) => parseItem(item));
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
      items,
      url
    );
  }

  const lang: Lang = deckbuilder.lang || "ja";
  const theme = deckbuilder.theme || "dark";
  const hqlv = deckbuilder.hqlv || 120;
  const airState = deckbuilder.as || "AS+";
  const comment = deckbuilder.cmt || "";
  return {
    lang,
    theme,
    hqlv,
    fleets: [deckbuilder.f1, deckbuilder.f2, deckbuilder.f3, deckbuilder.f4]
      .filter((fleet) => fleet)
      .map((fleet) => {
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
              fleet.s7,
            ].map((ship) => parseShip(ship)),
            fleet.name || ""
          );
        }
        return new Fleet([]);
      }),
    airbases: [deckbuilder.a1, deckbuilder.a2, deckbuilder.a3]
      .filter((airbase) => airbase)
      .map((airbase) => {
        // 意味ないが、こうしないとtsが誤検知する
        if (airbase) {
          const items = airbase.items;
          return new Airbase(
            [items.i1, items.i2, items.i3, items.i4].map((item) =>
              parseItem(item)
            )
          );
        }
        return new Airbase([]);
      }),
    airState,
    comment,
  };
}
