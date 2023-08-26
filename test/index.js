import { generate, decode } from "../src/index";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
(async () => {
  const deck = await decode('test.png');
  deck.f1.s1.id = 940;
  deck.f1.s1.lv = 1;
  deck.f1.s1.items = {
    i1: {
      id: 513,
    },
    i2: {
      id: 514,
    },
    i3: {
      id: 515,
    }
  };
  deck.f1.s2.id = 906;
  deck.f1.s2.lv = 1;
  deck.f1.s2.items = {
    i1: {
      id: 516,
    },
  };
  deck.f1.s3.id = 936;
  deck.f1.s3.lv = 1;
  deck.f1.s3.items = {
    i1: {
      id: 1640,
    },
    i2: {
      id: 1641,
    },
    i3: {
      id: 1642,
    },
    i4: {
      id: 1643,
    },
  };
  deck.f1.s4 = null;
  deck.f1.s5 = null;
  deck.f1.s6 = null;
  deck.f2 = null;
  deck.a1 = null;
  deck.a2 = null;
  deck.a3 = null;
  const canvas = await generate(deck);
  document.body.appendChild(canvas);
})();
