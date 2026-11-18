import { ShipImageKind } from './type'

export interface BaseDrawParams {
  ctx: CanvasRenderingContext2D
}

export interface BaseSyncDrawParams extends BaseDrawParams {
  defaultDraw: () => void
}

export interface BaseAsyncDrawParams extends BaseDrawParams {
  defaultDraw: () => Promise<void>
}

export interface DrawShipImageParams extends BaseAsyncDrawParams {
  ship: {
    id: number
    fetchImage: (kind: ShipImageKind) => Promise<HTMLImageElement>
  }
}

export interface DrawEquipImageParams extends BaseSyncDrawParams {
  index: number
  image: HTMLImageElement
}

export interface DrawEquipTextParams extends BaseSyncDrawParams {
  index: number
  text: string
}

export interface DrawLbEquipTextParams extends BaseSyncDrawParams {
  indexes: number[]
  text: string
}

export interface DrawCommentParams extends BaseSyncDrawParams {
  text: string
}

export interface DrawHooks {
  drawShipImage?: (params: DrawShipImageParams) => Promise<void>
  drawShipHeaderOverlay?: (params: BaseSyncDrawParams) => void
  drawShipEquipOverlay?: (params: BaseSyncDrawParams) => void
  drawEquipImage?: (params: DrawEquipImageParams) => void
  drawEquipText?: (params: DrawEquipTextParams) => void
  drawEquipEmpty?: (params: DrawEquipTextParams) => void
  drawEquipSlotNum?: (params: DrawEquipTextParams) => void
  drawLbEquipText?: (params: DrawLbEquipTextParams) => void
  drawComment?: (params: DrawCommentParams) => void
}

export function callHook<P extends BaseSyncDrawParams>(
  hook: ((params: P) => void) | undefined,
  params: P,
): void {
  if (hook) hook(params)
  else params.defaultDraw()
}

export async function callHookAsync<P extends BaseAsyncDrawParams>(
  hook: ((params: P) => Promise<void>) | undefined,
  params: P,
): Promise<void> {
  if (hook) await hook(params)
  else await params.defaultDraw()
}
