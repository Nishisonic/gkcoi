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

export function changeScale(image: HTMLImageElement, scaleX: number, scaleY: number) {
  const { canvas, ctx } = createCanvas2D(image.width * scaleX, image.height * scaleY);
  ctx.scale(scaleX, scaleY);
  ctx.drawImage(image, 0, 0);
  return canvas;
}

export function gradiationText(
  text: string,
  font: string,
  colorStops: { offset: number; color: string }[]
) {
  const { ctx: tmp } = createCanvas2D(0, 0);
  tmp.font = font;
  tmp.textBaseline = "top";
  const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } =
    tmp.measureText(text);
  const { canvas, ctx } = createCanvas2D(
    width,
    actualBoundingBoxAscent + actualBoundingBoxDescent + 10 // はみ出すため+10
  );
  const gradiation = ctx.createLinearGradient(0, 0, canvas.width, 0);
  colorStops.forEach(({ offset, color }) => {
    gradiation.addColorStop(offset, color);
  });
  ctx.fillStyle = gradiation;
  ctx.font = font;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(text, 0, 0);
  // ctx.fillRect(0, 0, 1000, 100)
  return canvas;
}
