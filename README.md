# gkcoi

Generate KanColle Organization Image

パラメータから編成画像を出力します。

## 使い方

**Install**

```shell
npm install gkcoi
```

**Use**

```ts
import {
  Item,
  Ship,
  generate74eoLargeCardFleetCanvasAsync,
  generate74eoMediumCutinFleetCanvasAsync,
  generate74eoSmallBannerFleetCanvasAsync,
  generateDarkFleetCanvasAsync
} from "gkcoi";
```

**Class**

- Item
  装備クラス

```ts
/**
 * @param id 装備ID
 * @param name 装備名
 * @param type 装備タイプ
 * @param rf 改修
 * @param mas 熟練度
 */
new Item(id: number, name: string, type:number[], rf: number, mas: number)
```

- Ship
  艦クラス

**Methods**
