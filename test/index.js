import { generate, decode } from "../src/index";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
(async () => {
  const deck = {
    lang: "en",
    theme: "dark",
    hqlv: 120,
    f1: {
      s1: {
        id: 696,
        lv: 129,
        hp: 47,
        fp: 80,
        tp: 70,
        aa: 170,
        ar: 61,
        asw: 38,
        ev: 103,
        los: 78,
        luck: 22,
        items: {
          i1: { id: 363, rf: 2, mas: 0 },
          i2: { id: 362, rf: 2, mas: 0 },
          i3: { id: 279, rf: 0, mas: 0 },
          // i4: { id: , rf: 0, mas: 0 },
        },
      },
    },
  };
  const canvas = await generate(deck);
  document.body.appendChild(canvas);
  console.log(await decode(canvas.toDataURL()));
})();
