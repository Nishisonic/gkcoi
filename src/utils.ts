import { Canvas, Image } from "canvas";

class Img {
  id: string;
  img: Image;

  constructor(id: string, img: Image) {
    this.id = id;
    this.img = img;
  }
}

export function loadImage(src: string): Promise<Image> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = (): void => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function loadParamIcon(): Promise<{ [key: string]: Image }> {
  const results = await Promise.all(
    ["as.png", "los.png", "luck.png", "hp.png", "air.png", "soku.png"].map(
      async (fileName: string) => {
        const src = `https://raw.githubusercontent.com/Nishisonic/gkcoi/master/static/${fileName}`;
        const img = await loadImage(src);
        return new Img(fileName.replace(/(.*).png/g, "$1"), img);
      }
    )
  );

  return results.reduce((p, c) => {
    if (c instanceof Img) {
      return Object.assign(p, { [c.id]: c.img });
    }
    return p;
  }, {});
}

export async function loadItemIcon(
  imgSize = 30
): Promise<{ [key: string]: Image }> {
  const results = await Promise.all(
    [...Array(47).keys()]
      .map((i: number) => i + 1)
      .map(async (id: number) => {
        const src = `https://raw.githubusercontent.com/Nishisonic/gkcoi/master/static/common_icon_weapon/common_icon_weapon_id_${id}.png`;
        const img = await loadImage(src);
        const canvas = new Canvas(imgSize, imgSize);
        const ctx = canvas.getContext("2d");
        // offset
        const oc = new Canvas(54, 54);
        const octx = oc.getContext("2d");
        octx.drawImage(
          img,
          img.width === 54 ? 0 : 3,
          img.height === 54 ? 0 : 3
        );
        // resize
        // step 1
        const rc = new Canvas(imgSize, imgSize);
        const rctx = rc.getContext("2d");
        rctx.drawImage(oc, 0, 0, rc.width, rc.height);
        // step 2
        rctx.drawImage(rc, 0, 0, imgSize, imgSize);
        /// step 3
        ctx.drawImage(
          rc,
          0,
          0,
          imgSize,
          imgSize,
          0,
          0,
          canvas.width,
          canvas.height
        );
        return new Img(String(id), await loadImage(canvas.toDataURL()));
      })
  );

  return results.reduce((p, c) => {
    if (c instanceof Img) {
      return Object.assign(p, { [c.id]: c.img });
    }
    return p;
  }, {});
}
