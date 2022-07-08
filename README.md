gkcoi  
[![npm](https://img.shields.io/npm/v/gkcoi)](https://www.npmjs.com/package/gkcoi)
[![License](https://img.shields.io/npm/l/express.svg)](https://github.com/Nishisonic/gkcoi/blob/master/LICENSE)
[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Q5Q11RO52)
====

パラメータから艦これ編成画像を Canvas 形式で出力します

![](https://i.imgur.com/1edg6hX.png)

## Description

[七四式電子観測儀(ElectronicObserver)](https://github.com/andanteyk/ElectronicObserver)で作られた編成画像を Web 上でも再現可能にするライブラリです  
また、オリジナル版(Dark ver. 上図参照)・公式版(Official ver.)も提供します

※多言語対応(日本語・English・한국어・中文(簡体字)・中文(繁体字))

## Requirement

- [Chart.js](https://github.com/chartjs/Chart.js)
- [chartjs-plugin-datalabels](https://github.com/chartjs/chartjs-plugin-datalabels)
- [lzjs](https://github.com/polygonplanet/lzjs)
- [steganography.ts](https://github.com/Nishisonic/steganography.ts)

## Usage

```JS
import { generate } from "gkcoi";

// DeckBuilder
const deck = {
  lang: "en",
  theme: "dark",
  hqlv: 120,
  f1: {
    s1: {
      id: 548,
      lv: 133,
      hp: 38,
      fp: 64,
      tp: 90,
      aa: 65,
      ar: 53,
      asw: 129,
      ev: 106,
      los: 55,
      luck: 21,
      items: {
        i1: { id: 262, rf: 0, mas: 0 },
        i2: { id: 261, rf: 0, mas: 0 },
        i3: { id: 288, rf: 0, mas: 0 },
        i4: { id: 173, rf: 0, mas: 0 },
      },
    },
  },
};

generate(deck); // Promise<Canvas>
```

![](https://i.imgur.com/Sgj2SVz.png)

## Format

```TS
generate(DeckBuilder, options)
```

?は無くても動く部分

### Deckbuilder

```
{
  /**
   * 言語
   * jp=日本語(default)
   * en=英語
   * kr=韓国語
   * scn=中国語(簡体字)
   * tcn=中国語(繁体字)
   */
  lang?: "jp" | "en" | "kr" | "scn" | "tcn";
  /**
   * テーマ
   * dark=オリジナル(default)
   * dark-ex=オリジナル(遠征パラメータ表示版/第一艦隊のみ表示)
   * light=オリジナル
   * light-ex=オリジナル(遠征パラメータ表示版/第一艦隊のみ表示)
   * white=オリジナル
   * 74lc=七四式(大型)
   * 74mc=七四式(中型)
   * 74sb=七四式(小型)
   * official=公式
   */
  theme?: "dark" | "dark-ex" | "light" | "light-ex" | "white" | "74lc" | "74mc" | "74sb" | "official";
  /** 司令部Lv(default=120) */
  hqlv?: number;
  /** 艦隊 */
  f1~f4?: {
    /** 艦隊名(七四式のときのみ表示) */
    name?: string;
    /** 艦娘 */
    s1~s7?: {
        /** 艦ID */
        id: number;
        /** レベル */
        lv: number;
        /** 装備 */
        items: {
          i1~ix?: {
              /** 装備ID*/
              id: number;
              /** 改修 */
              rf: number;
              /** 熟練度 */
              mas: number;
          };
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
  }
  /** 基地航空隊 */
  a1~a3?: {
    /** 基地状態(使わない) */
    mode?: number;
    /** 装備 */
    items: {
      i1~i4?: {
          /** 装備ID*/
          id: number;
          /** 改修 */
          rf: number;
          /** 熟練度 */
          mas: number;
      };
    }
  }
  /**
   * チャート表示
   * オリジナル(dark)&基地航空隊使用&複数艦隊表示時のみ
   * as+ = 制空権確保(default)
   * as  = 航空優勢
   * ap  = 航空劣勢
   */
  as?: AirState;
  /**
   * コメント表示
   * オリジナル(dark)&基地航空隊使用&複数艦隊表示時のみ
   * 改行は\n
   */
  cmt?: string;
}
```

### options

```
{
  start2URL?: string;
  shipURL?: string;
}
```

この引数を指定すると、画像・マスターデータ取得先をデフォルトから変えることができます  
これにより、ライブラリの更新が遅れたとしても独自で更新することが可能になります

- start2URL(マスターデータ)
  - デフォルト:https://raw.githubusercontent.com/Nishisonic/gkcoi/master/static/START2.json

設定する場合はファイルを直指定してください

- shipURL(艦娘画像)
  - デフォルト:https://raw.githubusercontent.com/Nishisonic/gkcoi/master/static/ship

設定する場合は途中まで指定  
その先はライブラリが`` `${shipURL}/card/1.png` ``等といった形で取得します

## Extension

v1.1.1 より、新たな関数として`decode()`が追加されました  
これを使うと、生成した画像から`DeckBuilder`インターフェースのフォーマットを取り出すことが出来るようになります  
※v1.1.1 以降に生成された画像のみ対応しています

### Extension Format

```TS
decode(url)
```

url の部分は、`canvas.toDataURL()`で変換する等してください

## Install

```shell
$ npm install gkcoi
```

## Tips

### 対空カットインの確率について

TsunDBの統計結果を元にした確率を採用しています。  
艦これ改では定数を101で割った結果を使用していますが、このライブラリでは100で割った結果を使用しています。

| Kind | 固定 | 割合 | 確率 | 発動艦                            |
| :--: | :--: | :--: | :--: | :-------------------------------- |
|  1   |  7   | 1.7  |  65  | 秋月型                            |
|  2   |  6   | 1.7  |  58  | 秋月型                            |
|  3   |  4   | 1.6  |  50  | 秋月型                            |
|  4   |  6   | 1.5  |  52  |                                   |
|  5   |  4   | 1.5  |  55  |                                   |
|  6   |  4   | 1.45 |  40  |                                   |
|  7   |  3   | 1.35 |  45  |                                   |
|  8   |  4   | 1.4  |  50  |                                   |
|  9   |  2   | 1.3  |  40  |                                   |
|  10  |  8   | 1.65 |  60  | 摩耶改二                          |
|  11  |  6   | 1.5  |  55  | 摩耶改二                          |
|  12  |  3   | 1.25 |  45  |                                   |
|  13  |  4   | 1.35 |  35  | 発動不可                          |
|  14  |  4   | 1.45 |  63  | 五十鈴改二                        |
|  15  |  3   | 1.3  |  56  | 五十鈴改二                        |
|  16  |  4   | 1.4  |  62  | 霞改二乙,夕張改二                 |
|  17  |  2   | 1.25 |  55  | 霞改二乙                          |
|  18  |  2   | 1.2  |  60  | 皐月改二                          |
|  19  |  5   | 1.45 |  58  | 鬼怒改二                          |
|  20  |  3   | 1.25 |  65  | 鬼怒改二                          |
|  21  |  5   | 1.45 |  60  | 由良改二                          |
|  22  |  2   | 1.2  |  59  | 文月改二                          |
|  23  |  1   | 1.05 |  80  | UIT-25,伊 504                     |
|  24  |  3   | 1.25 |  54  | 龍田改二                          |
|  25  |  7   | 1.55 |  61  | 伊勢型改(二)                      |
|  26  |  6   | 1.4  |  60  | 大和型改二(重)                    |
|  27  |      |      |      | 不明                              |
|  28  |  4   | 1.4  |  55  | 伊勢型改(二),武蔵改(二)           |
|  29  |  5   | 1.55 |  60  | 浜風乙改,磯風乙改                 |
|  30  |  3   | 1.3  |  44  | 天龍改二,Gotland改,Gotland andra  |
|  31  |  2   | 1.25 |  53  | 天龍改二                          |
|  32  |  3   | 1.2  |  37  | 英国艦,金剛型改二(丙)             |
|  33  |  3   | 1.35 |  44  | Gotland 改,Gotland andra          |
|  34  |  7   | 1.6  |  60  | Fletcher級                        |
|  35  |  6   | 1.55 |  55  | Fletcher級                        |
|  36  |  6   | 1.55 |  55  | Fletcher級                        |
|  37  |  4   | 1.45 |  40  | Fletcher級                        |
|  38  |  10  | 1.85 |  62  | Atlanta級                         |
|  39  |  10  | 1.7  |  60  | Atlanta級                         |
|  40  |  10  | 1.7  |  56  | Atlanta級                         |
|  41  |  9   | 1.65 |  55  | Atlanta級                         |
|  42  |  10  | 1.65 |  65  | 大和型改二(重)                    |
|  43  |  8   | 1.6  |  65  | 大和型改二(重)                    |
|  44  |  6   | 1.6  |  65  | 大和型改二(重)                    |
|  45  |  5   | 1.55 |  65  | 大和型改二(重)                    |

## License

[MIT License](https://github.com/Nishisonic/gkcoi/blob/master/LICENSE)  
※コードのみ

- Chart.js

  - ドーナツ円グラフの表示に使用
  - [MIT License](https://github.com/chartjs/Chart.js/blob/master/LICENSE.md)

- chartjs-plugin-labels

  - ドーナツ円グラフの表示に使用
  - [MIT License](https://github.com/emn178/chartjs-plugin-labels/blob/master/LICENSE.txt)

- chartjs-plugin-colorschemes

  - ドーナツ円グラフの表示に使用
  - [MIT License](https://github.com/nagix/chartjs-plugin-colorschemes/blob/master/LICENSE.md)

- chartjs-plugin-datalabels

  - 棒グラフの表示に使用
  - [MIT License](https://github.com/chartjs/chartjs-plugin-datalabels/blob/master/LICENSE.md)

- ElectronicObserver

  - 七四式 ver.のアイコンで使用
  - [MIT License](https://github.com/andanteyk/ElectronicObserver/blob/develop/LICENSE)

- kc3-translations

  - 翻訳で使用
  - [MIT License](https://github.com/KC3Kai/kc3-translations/blob/master/LICENSE)

- steganography.ts

  - 画像に情報を埋め込む際に使用
  - [MIT License](https://github.com/Nishisonic/steganography.ts/blob/master/README.md)

- lzjs

  - 情報を圧縮する際に使用
  - [MIT License](https://github.com/polygonplanet/lzjs/blob/master/LICENSE)

## Author

[にしくま(Nishisonic)](https://github.com/Nishisonic)
