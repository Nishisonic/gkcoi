import { generate, decode } from "../src/index";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
(async () => {
  const deck = await decode('test.png');
  const canvas = await generate(deck);
  document.body.appendChild(canvas);
})();
