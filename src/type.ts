import { fetchImage, Image } from "./canvas";
import { config } from "./config";
import { Lang } from "./lang";
import { getAirPower } from "./utils";

export type Theme =
  | "dark"
  | "dark-ex"
  | "light"
  | "light-ex"
  | "white"
  | "74lc"
  | "74mc"
  | "74sb"
  | "official";
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
};
type ExpeditionParameter = "firepower" | "aa" | "asw" | "los";

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
  rn: Range;
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
    url: string = config.masterUrl
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
    this.rn = range;
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

  get range(): Range {
    const isSgRangeBonusShip =
      [87, 91].includes(this.ctype) || [651, 656].includes(this.id);
    const hasSgRadarInitialModel = this.items.some(({ id }) => id === 315);
    const hasSgRadarLateModel = this.items.some(({ id }) => id === 456);
    const hasType2ReconAircraft = this.items.some(({ id }) => id === 61);
    const isT2RangeBonusShip = [553, 554, 196, 197].includes(this.id);
    const bonus: number =
      +(isSgRangeBonusShip && hasSgRadarInitialModel) +
      +(isSgRangeBonusShip && hasSgRadarLateModel) +
      +(isT2RangeBonusShip && hasType2ReconAircraft);
    let max: Range = this.rn;
    for (const { range } of this.items) {
      if (range > max) {
        max = range;
      }
    }
    switch (max + bonus) {
      case 4:
        return 4;
      case 3:
        return 3;
      case 2:
        return 2;
      case 1:
        return 1;
      case 0:
        return 0;
    }
    return 4;
  }

  get speed(): Speed {
    const turbine = this.items.filter((item) => item.id === 33).length;
    const boiler = this.items.filter((item) => item.id === 34).length;
    const newBoiler = this.items.filter((item) => item.id === 87).length;
    // 雑
    const newBoiler7 = this.items.filter(
      (item) => item.id === 87 && item.lv >= 7
    ).length;

    // 高速グループ
    if (this.sp === 10) {
      // 高速A群:大鳳、翔鶴型、利根型、最上型、島風、天津風改二、Ташкент
      if ([43, 33, 31, 9, 22, 81].includes(this.ctype) || this.id === 951) {
        if ((turbine && (newBoiler || boiler >= 2)) || newBoiler7 >= 2)
          return 20;
        if ((turbine && boiler) || newBoiler7) return 15;
      }
      // 高速B1群:Iowa、大和改二、金剛型、蒼龍、飛龍、雲龍、天城、阿賀野型、天津風/改
      else if (
        [65, 37, 6, 17, 25, 41].includes(this.ctype) ||
        ["あまつかぜ", "うんりゅう", "あまぎ"].includes(this.yomi)
      ) {
        if (turbine && (newBoiler >= 2 || (newBoiler && boiler))) return 20;
        if (turbine && (newBoiler || boiler)) return 15;
      }
      // 高速C群:加賀、水母、夕張/夕張改
      else if ([16].includes(this.stype) || [3, 34].includes(this.ctype)) {
        if (turbine && (newBoiler || boiler)) return 15;
      }
      // 高速B2群(汎用):Bismarck、Littorio等、赤城、葛城、重巡、軽空母、軽巡、雷巡、駆逐
      else {
        if (turbine && (newBoiler >= 2 || newBoiler + boiler >= 3)) return 20;
        if (turbine && (newBoiler || boiler)) return 15;
      }
    }
    // 低速グループ
    if (this.sp === 5) {
      // 低速A群:大和型、長門型改二
      if ([37].includes(this.ctype) || [541, 573].includes(this.id)) {
        if (
          turbine &&
          ((newBoiler >= 2 && boiler) ||
            (newBoiler && boiler >= 2) ||
            newBoiler7 >= 2)
        )
          return 20;
        if (turbine && newBoiler && (newBoiler >= 2 || boiler || newBoiler7))
          return 15;
        if (turbine && (newBoiler || boiler)) return 10;
      }
      // 低速特殊B群:Samuel B.Roberts、夕張改二特
      else if (["サミュエル・B・ロバーツ", "ゆうばり"].includes(this.yomi)) {
        if (turbine && (newBoiler >= 2 || newBoiler + boiler >= 3)) return 15;
        if (turbine) return 10;
      }
      // 低速C群:潜水艦、潜水空母、あきつ丸、速吸、明石
      else if (
        [13, 14].includes(this.stype) ||
        [45, 60, 49].includes(this.ctype)
      ) {
        if (turbine && (newBoiler || boiler)) return 10;
      }
      // 低速D群:伊201、伊203
      else if (["い201", "い203"].includes(this.yomi)) {
        if (turbine && newBoiler) return 15;
        if (newBoiler || (boiler && turbine)) return 10;
      }
      // 低速E群:鳳翔改二、鳳翔改二戦
      else if ([894, 899].includes(this.id)) {
        if (turbine && (newBoiler >= 2 || (newBoiler && boiler >= 2)))
          return 20;
        if (turbine && newBoiler) return 15;
        if ((turbine && boiler) || newBoiler) return 10;
      }
      // 低速B群(汎用):戦艦、航戦、軽空母、水母、練巡、潜水母艦、神威、神州丸など
      else {
        if (turbine && (newBoiler >= 2 || newBoiler + boiler >= 3)) return 15;
        if (turbine && (newBoiler || boiler)) return 10;
      }
    }
    return this.sp;
  }

  async fetchImage(kind: ShipImageKind): Promise<Image> {
    return await fetchImage(`${this.url}/${kind}/${this.id}.png`);
  }

  private getExpditionPlaneBonus(param: ExpeditionParameter): number {
    return this.slots
      .map((slot, i) => {
        if (this.items[i] && this.items[i].type[4] > 0) {
          if (slot > 0) {
            return Math.floor(
              this.items[i][param] * (-0.35 + Math.sqrt(Math.max(0, slot - 2)))
            );
          }
          return -this.items[i][param];
        }
        return 0;
      })
      .reduce((p, v) => p + v, 0);
  }

  get expeditionFirepowerBonus(): number {
    return (
      this.getExpditionPlaneBonus("firepower") +
      this.items.reduce((p, v) => p + v.expeditionFirepowerBonus, 0)
    );
  }

  get expeditionAABonus(): number {
    return (
      this.getExpditionPlaneBonus("aa") +
      this.items.reduce((p, v) => p + v.expeditionAABonus, 0)
    );
  }

  get expeditionASWBonus(): number {
    return (
      this.getExpditionPlaneBonus("asw") +
      this.items.reduce((p, v) => p + v.expeditionASWBonus, 0)
    );
  }

  get expeditionLoSBonus(): number {
    return (
      this.getExpditionPlaneBonus("los") +
      this.items.reduce((p, v) => p + v.expeditionLoSBonus, 0)
    );
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
  range: Range = 0;
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

  get expeditionFirepowerBonus(): number {
    switch (this.type[2]) {
      case 1: // 小口径主砲
        return 0.5 * Math.sqrt(this.lv);
      case 2: // 中口径主砲
        return Math.sqrt(this.lv);
      case 3: // 大口径主砲
        return Math.sqrt(this.lv);
      case 4: // 副砲
        return 0.5 * Math.sqrt(this.lv);
      case 12: // 小型電探
        return 0.5 * Math.sqrt(this.lv);
      case 13: // 大型電探
      case 93: // 大型電探(II)
        return Math.sqrt(this.lv);
      case 19: // 徹甲弾
        return 0.5 * Math.sqrt(this.lv);
      case 21: // 機銃
        return 0.5 * Math.sqrt(this.lv);
    }
    return 0;
  }

  get expeditionAABonus(): number {
    switch (this.type[3]) {
      case 15: // 機銃
        return Math.sqrt(this.lv);
      case 16: // 高角砲
        return 0.3 * this.lv;
    }
    return 0;
  }

  get expeditionASWBonus(): number {
    switch (this.type[2]) {
      case 10: // 水上偵察機
      case 11: // 水上爆撃機
      case 7: // 艦上爆撃機
      case 8: // 艦上攻撃機
      case 25: // オートジャイロ
        if (this.asw < 5) {
          return 0;
        } else if (this.asw < 7) {
          // 6かも
          return 0.5 * Math.sqrt(this.lv);
        } else {
          return Math.sqrt(this.lv);
        }
      case 14: // ソナー
        return Math.sqrt(this.lv);
      case 15: // 爆雷
        return Math.sqrt(this.lv);
    }
    return 0;
  }

  get expeditionLoSBonus(): number {
    switch (this.type[2]) {
      case 10: // 水上偵察機
        return Math.sqrt(this.lv);
      case 12: // 小型電探
      case 13: // 大型電探
      case 93: // 大型電探(II)
        return Math.sqrt(this.lv);
    }
    return 0;
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

export interface Apidata {
  readonly api_mst_ship: MasterShip[];
  readonly api_mst_slotitem: MasterItem[];
}

interface MasterShip {
  readonly api_id: number;
  readonly api_sortno: number;
  readonly api_sort_id: number;
  readonly api_name: string;
  readonly api_yomi: string;
  readonly api_stype: number;
  readonly api_ctype: number;
  readonly api_afterlv: number;
  readonly api_aftershipid: string;
  readonly api_taik: number[];
  readonly api_souk: number[];
  readonly api_houg: number[];
  readonly api_raig: number[];
  readonly api_tyku: number[];
  readonly api_luck: number[];
  readonly api_soku: Speed;
  readonly api_leng: Range;
  readonly api_slot_num: number;
  readonly api_maxeq: number[];
  readonly api_buildtime: number;
  readonly api_broken: number[];
  readonly api_powup: number[];
  readonly api_backs: number;
  readonly api_getmes: string;
  readonly api_afterfuel: number;
  readonly api_afterbull: number;
  readonly api_fuel_max: number;
  readonly api_bull_max: number;
  readonly api_voicef: number;
}

interface MasterItem {
  readonly api_id: number;
  readonly api_sortno: number;
  readonly api_name: string;
  readonly api_type: number[];
  readonly api_taik: number;
  readonly api_souk: number;
  readonly api_houg: number;
  readonly api_raig: number;
  readonly api_soku: number;
  readonly api_baku: number;
  readonly api_tyku: number;
  readonly api_tais: number;
  readonly api_atap: number;
  readonly api_houm: number;
  readonly api_raim: number;
  readonly api_houk: number;
  readonly api_raik: number;
  readonly api_bakk: number;
  readonly api_saku: number;
  readonly api_sakb: number;
  readonly api_luck: number;
  readonly api_leng: Range;
  readonly api_rare: number;
  readonly api_broken: number[];
  readonly api_usebull: string;
  readonly api_version?: number;
  readonly api_distance?: number;
  readonly api_cost?: number;
}

interface FormatData {
  readonly lang: Lang;
  readonly theme: Theme;
  readonly hqlv: number;
  readonly fleets: Fleet[];
  readonly airbases: Airbase[];
  readonly airState: AirState;
  readonly comment: string;
}

export interface DeckBuilderOptions {
  hideShipImage?: boolean
}

/**
 * デッキビルダー型のフォーマット
 * 数値のパラメータが直接出力されるので、表示値をそのまま入れること
 */
export interface DeckBuilder {
  /** 言語 */
  readonly lang: Lang;
  /**
   * テーマ
   * dark=オリジナル
   * 74lc=74式(大型)
   * 74mc=74式(中型)
   * 74sb=74式(小型)
   */
  readonly theme: Theme;
  /**
   * 司令部Lv
   */
  readonly hqlv: number;
  /**
   * 第一艦隊
   */
  readonly f1?: DeckBuilderFleet;
  /**
   * 第二艦隊
   */
  readonly f2?: DeckBuilderFleet;
  /**
   * 第三艦隊
   */
  readonly f3?: DeckBuilderFleet;
  /**
   * 第四艦隊
   */
  readonly f4?: DeckBuilderFleet;
  /**
   * 第一基地航空隊
   */
  readonly a1?: DeckBuilderAirbase;
  /**
   * 第二基地航空隊
   */
  readonly a2?: DeckBuilderAirbase;
  /**
   * 第三基地航空隊
   */
  readonly a3?: DeckBuilderAirbase;
  /**
   * 制空状態(dark ver.&複数艦隊&基地航空隊使用時のみ使用)
   * 触接率グラフ表示に使用
   *
   * AS+:制空権確保
   * AS:航空優勢
   * AP:航空劣勢
   */
  readonly as?: AirState;
  /**
   * コメント(dark ver.&複数艦隊&基地航空隊使用時のみ使用)
   * コメント表示に使用
   */
  readonly cmt?: string;

  readonly options?: DeckBuilderOptions;
}

/**
 * フォーマット(艦隊)
 */
export interface DeckBuilderFleet {
  /** 艦隊名(七四式ver.使用時のみ使用) */
  readonly name?: string;
  /** 旗艦 */
  readonly s1?: DeckBuilderShip;
  /** 二番艦 */
  readonly s2?: DeckBuilderShip;
  /** 三番艦 */
  readonly s3?: DeckBuilderShip;
  /** 四番艦 */
  readonly s4?: DeckBuilderShip;
  /** 五番艦 */
  readonly s5?: DeckBuilderShip;
  /** 六番艦 */
  readonly s6?: DeckBuilderShip;
  /** 七番艦(これを設定する場合、出力は一艦隊のみにすること) */
  readonly s7?: DeckBuilderShip;
}

/**
 * フォーマット(艦)
 */
export interface DeckBuilderShip {
  /** 艦ID */
  readonly id: number;
  /** レベル */
  readonly lv: number;
  /** 装備 */
  readonly items: {
    readonly i1?: DeckBuilderItem;
    readonly i2?: DeckBuilderItem;
    readonly i3?: DeckBuilderItem;
    readonly i4?: DeckBuilderItem;
    readonly i5?: DeckBuilderItem;
    readonly ix?: DeckBuilderItem;
  };
  /** 耐久 */
  readonly hp: number;
  /** 火力 */
  readonly fp: number;
  /** 雷装 */
  readonly tp: number;
  /** 対空 */
  readonly aa: number;
  /** 装甲 */
  readonly ar: number;
  /** 対潜 */
  readonly asw: number;
  /** 回避 */
  readonly ev: number;
  /** 索敵 */
  readonly los: number;
  /** 運 */
  readonly luck: number;
}

/**
 * フォーマット(装備)
 * 熟練度の値はそのまま制空に反映されるので注意
 */
export interface DeckBuilderItem {
  /** 装備ID */
  readonly id: number;
  /** 改修 */
  readonly rf?: number;
  /** 熟練度 */
  readonly mas?: number;
}

/**
 * フォーマット(基地)
 */
export interface DeckBuilderAirbase {
  /** 基地状態 */
  readonly mode?: number;
  /** 装備 */
  readonly items: {
    readonly i1?: DeckBuilderItem;
    readonly i2?: DeckBuilderItem;
    readonly i3?: DeckBuilderItem;
    readonly i4?: DeckBuilderItem;
  };
}

export interface GenerateOptions {
  readonly masterUrl?: string;
  readonly start2URL?: string;
  readonly shipURL?: string;
}

export function parse(
  deckbuilder: DeckBuilder,
  apidata: Apidata,
  url: string
): FormatData {
  const masterShip: {
    [key: number]: MasterShip;
  } = apidata.api_mst_ship.reduce(
    (previous: { [key: number]: MasterShip }, current: MasterShip) => {
      previous[current.api_id] = current;
      return previous;
    },
    {}
  );
  const masterItem: {
    [key: number]: MasterItem;
  } = apidata.api_mst_slotitem.reduce(
    (previous: { [key: number]: MasterItem }, current: MasterItem) => {
      previous[current.api_id] = current;
      return previous;
    },
    {}
  );

  function parseItem(item?: DeckBuilderItem): Item {
    if (!item || Number(item.id) <= 0) {
      return Item.UNKNOWN;
    }
    const lv: number = item.rf || 0;
    const alv: number = item.mas || 0;
    return new Item(masterItem[Number(item.id)], Number(lv), Number(alv));
  }

  function parseShip(ship?: DeckBuilderShip): Ship {
    if (!ship || Number(ship.id) <= 0) {
      return Ship.UNKNOWN;
    }
    const id: number = Number(ship.id);
    const lv: number = Number(ship.lv);
    const hp: number = Number(ship.hp);
    const firepower: number = Number(ship.fp);
    const torpedo: number = Number(ship.tp);
    const aa: number = Number(ship.aa);
    const armor: number = Number(ship.ar);
    const asw: number = Number(ship.asw);
    const evasion: number = Number(ship.ev);
    const los: number = Number(ship.los);
    const luck: number = Number(ship.luck);
    const _items = [
      ship.items.i1,
      ship.items.i2,
      ship.items.i3,
      ship.items.i4,
      ship.items.i5,
      ship.items.ix,
    ];
    const slotNum = masterShip[id].api_slot_num;
    const items = [
      ..._items.filter((_, i) => i < slotNum),
      _items[slotNum] ?? _items[_items.length - 1],
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

  const lang: Lang = deckbuilder.lang || "jp";
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
