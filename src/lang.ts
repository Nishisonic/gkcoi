export type Lang = "jp" | "en" | "kr" | "scn" | "tcn";

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
  /** 中国語(繁体字) */
  tcn: string;

  constructor(jp: string, en: string, kr: string, scn: string, tcn: string) {
    this.jp = jp;
    this.en = en;
    this.kr = kr;
    this.scn = scn;
    this.tcn = tcn;
  }
}

export const NONE = new Language("なし", "None", "없음", "没有", "沒有");

export const FLEET = new Language("艦隊", "", "함대", "舰队", "艦隊");

export const SPEED: {
  [key: number]: Language;
} = {
  0: new Language("陸上", "Land", "육상", "陆基", "陸基"),
  5: new Language("低速", "Slow", "저속", "低速", "低速"),
  10: new Language("高速", "Fast", "고속", "高速", "高速"),
  15: new Language("高速+", "Fast+", "고속+", "高速+", "高速+"),
  20: new Language("最速", "Fastest", "초고속", "最速", "超高速"),
};

export const RANGE: {
  [key: number]: Language;
} = {
  0: new Language("無", "N", "무", "无", "無"),
  1: new Language("短", "S", "단", "短", "短"),
  2: new Language("中", "M", "중", "中", "中"),
  3: new Language("長", "L", "장", "长", "長"),
  4: new Language("超長", "VL", "초장", "超长", "超長"),
};

export const LABEL: {
  [key: string]: Language;
} = {
  HP: new Language("耐久", "HP", "체력", "耐久", "血量"),
  FIREPOWER: new Language("火力", "FP", "화력", "火力", "火力"),
  TORPEDO: new Language("雷装", "TP", "뇌장", "雷装", "雷装"),
  AA: new Language("対空", "AA", "대공", "对空", "對空"),
  ARMOR: new Language("装甲", "AR", "장갑", "装甲", "裝甲"),
  ASW: new Language("対潜", "ASW", "대잠", "对潜", "對潛"),
  EVASION: new Language("回避", "EVA", "회피", "回避", "迴避"),
  LOS: new Language("索敵", "LOS", "색적", "索敌", "索敵"),
  ACCURACY: new Language("命中", "HIT", "명중", "命中", "命中"),
  BOMB: new Language("爆装", "BOM", "폭장", "爆装", "爆裝"),
  RANGE: new Language("射程", "RNG", "사거리", "射程", "射程"),
  LUCK: new Language("運", "LK", "운", "运", "運"),
  SPEED: new Language("速力", "SP", "속도", "航速", "航程"),
  AIRPOWER: new Language("制空", "AIR", "제공", "制空", "制空"),
};

export const AIR_POWER = new Language(
  "制空戦力",
  "Air Power",
  "일반 제공치",
  "制空战力",
  "對空戰力",
);

export const AIR_DEFENSE_POWER = new Language(
  "防空戦力",
  "Air Defense Power",
  "기지 방공치",
  "防空战力",
  "防空戰力",
);

export const HIGH_ALTITUDE = new Language(
  "高高度",
  "HA",
  "고고도",
  "高空",
  "高空",
);

export const DISTANCE = new Language(
  "航続距離",
  "Distance",
  "항속거리",
  "巡航距离",
  "巡航距離",
);

export const LOS = new Language(
  "索敵能力",
  "LoS(1)",
  "색적능력",
  "索敌容量",
  "索敵能力",
);

export const CONTACT = {
  LABEL: new Language("触接率", "Contact", "촉접율", "接触率", "觸接率"),
  "AS+": new Language("確保", "AS+", "확보", "确保", "確保"),
  AS: new Language("優勢", "AS", "우세", "优势", "空優"),
  AP: new Language("劣勢", "AP", "열세", "劣势", "空劣"),
};

export const AA_CI = new Language(
  "対空CI",
  "AA CI ",
  "대공 CI",
  "对空CI",
  "對空CI",
);

export const STYPE = [
  "",
  "DE",
  "DD",
  "CL",
  "CLT",
  "CA",
  "CAV",
  "CVL",
  "FBB",
  "BB",
  "BBV",
  "CV",
  "BB",
  "SS",
  "SSV",
  "AO",
  "AV",
  "LHA",
  "CVB",
  "AR",
  "AS",
  "CT",
  "AO",
];
