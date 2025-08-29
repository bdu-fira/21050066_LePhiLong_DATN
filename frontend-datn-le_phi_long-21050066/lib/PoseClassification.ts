import * as tf from '@tensorflow/tfjs'

let model: any = null

export async function init() {
  await tf.ready()
  if (tf.getBackend() !== 'webgl' && tf.findBackend('webgl')) await tf.setBackend('webgl')
  return true
}

function numel(shape: any) { return (shape || []).reduce((a: any, b: any) => a * b, 1) }

async function setWeightsFromBin(m: any, bin: any) {
  const buf = bin instanceof Blob ? await bin.arrayBuffer() : bin
  const arr = new Float32Array(buf)
  const shapes = m.getWeights().map((t: any) => t.shape)
  const total = shapes.reduce((s: any, sh: any) => s + numel(sh), 0)
  if (arr.length < total) return
  let off = 0
  const ws = shapes.map((sh: any) => {
    const n = numel(sh)
    const slice = arr.subarray(off, off + n)
    off += n
    return tf.tensor(slice, sh)
  })
  m.setWeights(ws)
}

function n(v: any) { return Number.isFinite(v) ? v : 0 }
function coerce33(lms: any[]) {
  const out: any[] = new Array(33)
  for (let i = 0; i < 33; i++) {
    const p = Array.isArray(lms) ? lms[i] : undefined
    if (Array.isArray(p)) out[i] = { x: n(p[0]), y: n(p[1]), z: n(p[2]) }
    else out[i] = { x: n(p?.x), y: n(p?.y), z: n(p?.z) }
  }
  return out
}
function angleDeg(a: any, b: any, c: any) {
  const ux = a.x - b.x, uy = a.y - b.y, uz = a.z - b.z
  const vx = c.x - b.x, vy = c.y - b.y, vz = c.z - b.z
  const du = Math.hypot(ux, uy, uz) || 1
  const dv = Math.hypot(vx, vy, vz) || 1
  const cos = Math.min(1, Math.max(-1, (ux * vx + uy * vy + uz * vz) / (du * dv)))
  return Math.acos(cos) * 180 / Math.PI
}

export const INPUT_DIM_107 = 107

export function buildFeatures107(lms: any[]) {
  const P = coerce33(lms)
  const base: number[] = []
  for (let i = 0; i < 33; i++) { base.push(P[i].x, P[i].y, P[i].z) }
  const angs = [
    angleDeg(P[13], P[11], P[23]),
    angleDeg(P[14], P[12], P[24]),
    angleDeg(P[15], P[13], P[11]),
    angleDeg(P[16], P[14], P[12]),
    angleDeg(P[11], P[23], P[25]),
    angleDeg(P[12], P[24], P[26]),
    angleDeg(P[23], P[25], P[27]),
    angleDeg(P[24], P[26], P[28]),
  ]
  return base.concat(angs)
}

export async function load(modelJson: any, weightBin: any) {
  let topo: any = modelJson
  if (modelJson instanceof Blob) topo = JSON.parse(await modelJson.text())
  else if (typeof modelJson === 'string') topo = JSON.parse(modelJson)
  if (topo && topo.modelTopology) topo = topo.modelTopology
  model = await tf.models.modelFromJSON({ modelTopology: topo } as any)
  await setWeightsFromBin(model, weightBin)
  return model
}

export function ready() { return !!model }

export function predict(x: any) {
  if (!model) return undefined
  return tf.tidy(() => {
    const t: any = tf.tensor2d([x], [1, x.length])
    const y: any = model.predict(t)
    const out: any = Array.isArray(y) ? y[0] : y
    const p: any = out.dataSync()
    let i = 0
    for (let k = 1; k < p.length; k++) if (p[k] > p[i]) i = k
    return { index: i, probs: Array.from(p) }
  })
}

export function predictFromLandmarks(lms: any) {
  if (!model) return undefined
  const v = buildFeatures107(lms)
  if (v.length !== INPUT_DIM_107) return undefined
  return predict(v)
}

export default { init, load, ready, predict, predictFromLandmarks, buildFeatures107, INPUT_DIM_107 }
