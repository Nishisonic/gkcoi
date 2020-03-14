# gkcoi

Generate KanColle Organization Image

パラメータから編成画像を出力します。

## Installing

Using npm:

```shell
$ npm install gkcoi
```

## Example

```ts
import { generate, DeckBuilder } from "gkcoi";

// パラメータは表示値の値を入れること
const deck: DeckBuilder = {
  lang: "jp",
  theme: "74lc",
  hqlv: 120,
  f1: {
    s1: {
      id: 464,
      lv: 168,
      hp: 100,
      fp: 100,
      tp: 100,
      aa: 100,
      ar: 100,
      asw: 100,
      ev: 50,
      los: 20,
      luck: 53,
      items: {
        i1: { id: 262, rf: 0, mas: 0 },
        i2: { id: 261, rf: 0, mas: 0 },
        i3: { id: 288, rf: 0, mas: 0 }
      }
    },
    s2: {
      id: 542,
      lv: 152,
      hp: 100,
      fp: 100,
      tp: 100,
      aa: 100,
      ar: 100,
      asw: 100,
      ev: 50,
      los: 20,
      luck: 22,
      items: {
        i1: { id: 149, rf: 6, mas: 0 },
        i2: { id: 149, rf: 6, mas: 0 },
        i3: { id: 45, rf: 10, mas: 0 },
        i4: { id: 42, rf: 0, mas: 0 }
      }
    },
    s3: {
      id: 578,
      lv: 143,
      hp: 100,
      fp: 100,
      tp: 100,
      aa: 100,
      ar: 100,
      asw: 100,
      ev: 50,
      los: 20,
      luck: 31,
      items: {
        i1: { id: 149, rf: 6, mas: 0 },
        i2: { id: 149, rf: 6, mas: 0 },
        i3: { id: 45, rf: 10, mas: 0 },
        i4: { id: 42, rf: 0, mas: 0 }
      }
    },
    s4: {
      id: 623,
      lv: 168,
      hp: 100,
      fp: 100,
      tp: 100,
      aa: 100,
      ar: 100,
      asw: 100,
      ev: 50,
      los: 20,
      luck: 33,
      items: {
        i1: { id: 364, rf: 0, mas: 0 },
        i2: { id: 47, rf: 10, mas: 0 },
        i3: { id: 47, rf: 10, mas: 0 },
        i4: { id: 45, rf: 10, mas: 0 },
        i5: { id: 39, rf: 10, mas: 0 },
        ix: { id: 42, rf: 0, mas: 0 }
      }
    },
    s5: {
      id: 566,
      lv: 171,
      hp: 100,
      fp: 100,
      tp: 100,
      aa: 100,
      ar: 100,
      asw: 100,
      ev: 50,
      los: 20,
      luck: 24,
      items: {
        i1: { id: 149, rf: 7, mas: 0 },
        i2: { id: 149, rf: 6, mas: 0 },
        i3: { id: 45, rf: 10, mas: 0 },
        i4: { id: 42, rf: 0, mas: 0 }
      }
    }
  }
};

generate(deck); // return Canvas
```

## Licence

[MIT Licence](https://github.com/Nishisonic/gkcoi/blob/master/LICENCE)
