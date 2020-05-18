import { Canvas, createCanvas2D } from "./canvas";

/**
 * 画像をくっつけます
 * ※同じ画像サイズにすること
 * @param images 画像リスト
 * @param rowNum 横幅
 * @param backgroundColor 背景
 * @return くっつけた画像
 */
export function stick(
  images: Canvas[],
  rowNum: number,
  backgroundColor: string | CanvasGradient | CanvasPattern
): Canvas {
  const { canvas, ctx } = createCanvas2D(
    images[0].width * Math.min(images.length, rowNum),
    images[0].height * Math.ceil(images.length / rowNum)
  );
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  images.forEach((image, i) => {
    ctx.drawImage(
      image,
      (i % rowNum) * image.width,
      Math.floor(i / rowNum) * image.height
    );
  });

  return canvas;
}
