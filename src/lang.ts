export type Lang = "jp" | "en" | "kr" | "scn";

/**
 * 言語
 */
export class Language {
  /** 日本語 */
  jp: string;
  /** 英語 */
  en: string;
  /** 韓国語 */
  kr: string;
  /** 中国語(簡体字) */
  scn: string;

  constructor(jp: string, en: string, kr: string, scn: string) {
    this.jp = jp;
    this.en = en;
    this.kr = kr;
    this.scn = scn;
  }
}

export const NONE = new Language("なし", "None", "없음", "没有");

export const FLEET = new Language("艦隊", "", "함대", "舰队");

export const SPEED: {
  [key: number]: Language;
} = {
  0: new Language("陸上", "Land", "육상", "土地"),
  5: new Language("低速", "Slow", "저속", "低速"),
  10: new Language("高速", "Fast", "고속", "高速"),
  15: new Language("高速+", "Fast+", "고속+", "高速+"),
  20: new Language("最速", "Fastest", "초고속", "最速"),
};

export const RANGE: {
  [key: number]: Language;
} = {
  0: new Language("無", "N", "무", "无"),
  1: new Language("短", "S", "단", "短"),
  2: new Language("中", "M", "중", "中"),
  3: new Language("長", "L", "장", "长"),
  4: new Language("超長", "VL", "초장", "超长"),
};

export const LABEL: {
  [key: string]: Language;
} = {
  HP: new Language("耐久", "HP", "내구", "耐力"),
  FIREPOWER: new Language("火力", "FP", "화력", "火力"),
  TORPEDO: new Language("雷装", "TP", "뇌장", "雷装"),
  AA: new Language("対空", "AA", "대공", "对空"),
  ARMOR: new Language("装甲", "AR", "장갑", "装甲"),
  ASW: new Language("対潜", "ASW", "대잠", "对潜"),
  EVASION: new Language("回避", "EVA", "회피", "回避"),
  LOS: new Language("索敵", "LOS", "색적", "索敌"),
  ACCURACY: new Language("命中", "HIT", "명중", "命中"),
  BOMB: new Language("爆装", "BOM", "폭장", "爆装"),
  RANGE: new Language("射程", "RNG", "사거리", "射程"),
  LUCK: new Language("運", "LK", "운", "运气"),
  SPEED: new Language("速力", "SP", "속력", "速度"),
  AIRPOWER: new Language("制空", "AIR", "제공", "制空"),
};

export const AIR_POWER = new Language(
  "制空戦力",
  "Air Power",
  "제공전력",
  "制空戦力"
);

export const AIR_DEFENSE_POWER = new Language(
  "防空戦力",
  "Air Defense Power",
  "방공전력",
  "防空戦力"
);

export const HIGH_ALTITUDE = new Language("高高度", "HA", "고도", "高海拔");

export const DISTANCE = new Language(
  "航続距離",
  "Distance",
  "항속거리",
  "巡航距离"
);

export const LOS = new Language("索敵能力", "LoS(1)", "색적능력", "索敵容量");

export const CONTACT = {
  LABEL: new Language("触接率", "Contact", "접촉률", "触接率"),
  "AS+": new Language("確保", "AS+", "확보", "确保"),
  AS: new Language("優勢", "AS", "우세", "优势"),
  AP: new Language("劣勢", "AP", "열세", "劣势"),
};

export const AA_CI = new Language("対空CI", "AA CI ", "대공CI", "对空CI");
