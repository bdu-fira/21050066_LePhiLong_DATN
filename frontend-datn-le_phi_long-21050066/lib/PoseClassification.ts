import * as tf from '@tensorflow/tfjs'

let model: any = null

export const INPUT_DIM_99 = 99

export async function init() {
  await tf.ready()
  if (tf.getBackend() !== 'webgl' && tf.findBackend('webgl')) await tf.setBackend('webgl')
  return true
}

const n = (v: any) => Number.isFinite(v) ? v : 0
function flatten33x3(lms: any[]) {
  const out: number[] = []
  for (let i = 0; i < 33; i++) {
    const p = Array.isArray(lms) ? lms[i] : undefined
    const x = Array.isArray(p) ? n(p[0]) : n(p?.x)
    const y = Array.isArray(p) ? n(p[1]) : n(p?.y)
    const z = Array.isArray(p) ? n(p[2]) : n(p?.z)
    out.push(x, y, z)
  }
  return out
}

export async function load(modelJson: any, weightBin: any) {
  const jf = modelJson instanceof Blob
    ? new File([modelJson], 'model.json', { type: 'application/json' })
    : new File([typeof modelJson === 'string' ? modelJson : JSON.stringify(modelJson)], 'model.json', { type: 'application/json' })

  const wf = weightBin instanceof Blob
    ? new File([weightBin], 'model.weights.bin', { type: 'application/octet-stream' })
    : new File([weightBin], 'model.weights.bin', { type: 'application/octet-stream' })

  model = await tf.loadLayersModel(tf.io.browserFiles([jf, wf]))
  return model
}

export function ready() { return !!model }

export function predict(x: any) {
  if (!model) return undefined
  const v = Array.isArray(x) ? x : []
  return tf.tidy(() => {
    const t: any = tf.tensor2d([v], [1, v.length])
    const y: any = model.predict(t)
    const o: any = Array.isArray(y) ? y[0] : y
    const p: any = o.dataSync()
    let i = 0; for (let k = 1; k < p.length; k++) if (p[k] > p[i]) i = k
    return { index: i, probs: Array.from(p) }
  })
}

export function predictFromLandmarks(lms: any) {
  if (!model) return undefined
  const v = flatten33x3(lms)
  if (v.length !== INPUT_DIM_99) return undefined
  return predict(v)
}

export default { init, load, ready, predict, predictFromLandmarks, INPUT_DIM_99 }
