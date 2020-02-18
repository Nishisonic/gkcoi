/**
 * 艦
 */
export class Ship {
  /** 艦ID */
  id = 0;
  /** 艦名 */
  name = "";
  /** 艦種ID */
  stype = 0;
  /** 艦型ID */
  ctype = 0;
  /** 耐久 */
  hp = 0;
  /** 火力 */
  fp = 0;
  /** 雷装 */
  tp = 0;
  /** 爆装 */
  bp = 0;
  /** 装甲 */
  ar = 0;
  /** 対空 */
  aa = 0;
  /** 回避 */
  ev = 0;
  /** 命中 */
  ac = 0;
  /** 対潜 */
  as = 0;
  /** 索敵 */
  ls = 0;
  /** 射程 */
  rn: 0 | 1 | 2 | 3 | 4 = 0;
  /** 運 */
  lk = 0;
  /** 速力 */
  sp: 0 | 5 | 10 | 15 | 20 = 0;
  /** スロット数 */
  slotNum = 0;
  /** 搭載機数 */
  slots = [0, 0, 0, 0, 0];
  /** 装備 */
  items: Item[] = [];
  /** Lv */
  lv = 0;
  /** 制空値 */
  airpower = 0;

  /**
   * パラメータを設定する
   * ※この値が表示されるので、装備パラメータも一緒に含めること
   * @param hp HP
   * @param firepower 火力
   * @param torpedo 雷装
   * @param bomb 爆装
   * @param armor 装甲
   * @param aa 対空
   * @param evasion 回避
   * @param accuracy 命中
   * @param asw 対潜
   * @param los 索敵
   * @param range 射程
   * @param luck 運
   * @param speed 速力
   * @param airpower 制空値
   */
  public setParameter(
    hp: number,
    firepower: number,
    torpedo: number,
    bomb: number,
    armor: number,
    aa: number,
    evasion: number,
    accuracy: number,
    asw: number,
    los: number,
    range: 0 | 1 | 2 | 3 | 4,
    luck: number,
    speed: 0 | 5 | 10 | 15 | 20,
    airpower: number
  ): void {
    this.hp = hp;
    this.fp = firepower;
    this.tp = torpedo;
    this.bp = bomb;
    this.ar = armor;
    this.aa = aa;
    this.ev = evasion;
    this.ac = accuracy;
    this.as = asw;
    this.ls = los;
    this.rn = range;
    this.lk = luck;
    this.sp = speed;
    this.airpower = airpower;
  }

  /**
   * ※この値が表示されるので、装備パラメータも一緒に含めること
   * @param id 艦ID
   * @param name 艦名
   * @param lv 艦Lv
   * @param items 装備
   * @param slotNum 装備スロット数
   * @param slots 装備スロット
   * @param hp HP
   * @param asw 対潜
   * @param luck 運
   */
  constructor(
    id: number,
    name: string,
    lv: number,
    items: Item[],
    slotNum: number,
    slots: number[],
    hp?: number,
    asw?: number,
    luck?: number
  ) {
    this.id = id;
    this.name = name;
    this.lv = lv;
    this.items = items;
    this.slotNum = slotNum;
    this.slots = slots;
    this.hp = hp || 0;
    this.as = asw || 0;
    this.lk = luck || 0;
  }
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
  fp = 0;
  /** 雷装 */
  tp = 0;
  /** 爆装 */
  bp = 0;
  /** 装甲 */
  ar = 0;
  /** 対空 */
  aa = 0;
  /** 回避/迎撃 */
  ev = 0;
  /** 命中/対爆 */
  ac = 0;
  /** 対潜 */
  as = 0;
  /** 索敵 */
  ls = 0;
  /** 射程 */
  rn = 0;
  /** 航続距離 */
  rd = 0;
  /** 配置コスト */
  bc = 0;
  /** 改修 */
  rf = 0;
  /** 熟練度 */
  mas = 0;

  /**
   * マスターデータから装備データを設定する
   * @param start2 マスターデータ
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromMasterData(start2: any): void {
    this.id = start2.api_id;
    this.name = start2.api_name;
    this.type = start2.api_type;
    this.fp = start2.api_houg;
    this.tp = start2.api_raig;
    this.bp = start2.api_baku;
    this.ar = start2.api_souk;
    this.aa = start2.api_tyku;
    this.ev = start2.api_houk;
    this.ac = start2.api_houm;
    this.as = start2.api_tais;
    this.ls = start2.api_saku;
    this.rn = start2.api_distance;
    this.rd = start2.api_cost;
  }

  /**
   * パラメータを設定する
   * @param id 装備ID
   * @param name 装備名
   * @param type 装備タイプ
   * @param firepower 火力
   * @param torpedo 雷装
   * @param bomb 爆装
   * @param armor 装甲
   * @param aa 対空
   * @param evasion 回避
   * @param accuracy 命中
   * @param asw 対潜
   * @param los 索敵
   * @param range 射程
   * @param distance 航続距離
   */
  public setParameter(
    id: number,
    name: string,
    type: number[],
    firepower: number,
    torpedo: number,
    bomb: number,
    armor: number,
    aa: number,
    evasion: number,
    accuracy: number,
    asw: number,
    los: number,
    range: number,
    distance: number
  ): void {
    this.id = id;
    this.name = name;
    this.type = type;
    this.fp = firepower;
    this.tp = torpedo;
    this.bp = bomb;
    this.ar = armor;
    this.aa = aa;
    this.ev = evasion;
    this.ac = accuracy;
    this.as = asw;
    this.ls = los;
    this.rn = range;
    this.rd = distance;
  }

  /**
   * @param id 装備ID
   * @param name 装備名
   * @param type 装備タイプ
   * @param rf 改修
   * @param mas 熟練度
   */
  constructor(
    id: number,
    name: string,
    type: [number, number, number, number, number],
    rf?: number,
    mas?: number
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.rf = rf || 0;
    this.mas = mas || 0;
  }
}
