export type Canvas = HTMLCanvasElement;
export type Image = HTMLImageElement;

export const createCanvas = (width: number, height: number): Canvas => {
  const canvas = Object.assign(document.createElement("canvas"), {
    width,
    height,
  });

  return canvas;
};

export const createCanvas2D = (
  width: number,
  height: number
): { canvas: Canvas; ctx: CanvasRenderingContext2D } => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw "Failed to create Canvas 2D Context";
  }

  return { canvas, ctx };
};

export const loadImage = async (src: string): Promise<Image> => {
  return new Promise((resolve, reject) => {
    const image = document.createElement("img");
    image.crossOrigin = "Anonymous";

    const cleanup = (): void => {
      image.onload = null;
      image.onerror = null;
    };

    image.onload = (): void => {
      cleanup();
      resolve(image);
    };
    image.onerror = (): void => {
      cleanup();
      reject(new Error('Failed to load the image "' + src + '"'));
    };

    image.src = src;
  });
};
