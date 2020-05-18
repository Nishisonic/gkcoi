import { generate } from "../src/index";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
(async () => {
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
  const canvas = await generate(deck);
  document.body.appendChild(canvas, canvas.width, canvas.height);
})();
