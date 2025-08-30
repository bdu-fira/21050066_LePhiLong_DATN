import * as tf from "@tensorflow/tfjs";

function shuffleWithSeed<T>(arr: T[], seed = 1234): T[] {
  let s = seed; const rand = () => { s = Math.sin(s) * 10000; return s - Math.floor(s) }
  return arr.map(v => ({ v, r: rand() })).sort((a, b) => a.r - b.r).map(o => o.v)
}

export const INPUT_DIM_99 = 99

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

export async function trainPoseClassifier(poseData: any) {
  const seed = 42
  const labelNames = Object.keys(poseData || {})
  const samples: any[] = []

  // Lọc pose từ poseData -> flatten 33x3 = 99
  for (const [label, arr] of Object.entries(poseData || {})) {
    const idx = labelNames.indexOf(String(label))
    const list: any[] = Array.isArray(arr) ? arr : []
    for (const lms of list) {
      const x = flatten33x3(lms)
      if (x.length === INPUT_DIM_99) samples.push({ x, y: idx, label })
    }
  }
  if (!samples.length) throw new Error("Không có dữ liệu")

  // Tách train/val đơn giản, giữ phân bố theo nhãn
  const shuffled = shuffleWithSeed(samples, seed)
  const valRatio = 0.33
  const train: any[] = [], val: any[] = []
  for (const name of labelNames) {
    const per = shuffled.filter(s => s.label === name)
    const cut = Math.max(1, Math.floor(per.length * valRatio))
    const perShuf = shuffleWithSeed(per, seed ^ name.length)
    val.push(...perShuf.slice(0, cut))
    train.push(...perShuf.slice(cut))
  }

  const Xtr = tf.tensor2d(train.map(s => s.x), [train.length, INPUT_DIM_99])
  const ytr = tf.oneHot(tf.tensor1d(train.map(s => s.y), "int32"), labelNames.length)
  const Xva = tf.tensor2d(val.map(s => s.x), [val.length, INPUT_DIM_99])
  const yva = tf.oneHot(tf.tensor1d(val.map(s => s.y), "int32"), labelNames.length)

  // Model 3 lớp + activation
  const ki = tf.initializers.glorotUniform({ seed })
  const model = tf.sequential()
  model.add(tf.layers.dense({ inputShape: [INPUT_DIM_99], units: 64, activation: "relu" }))
  model.add(tf.layers.dense({ units: 32, activation: "relu" }))
  model.add(tf.layers.dense({ units: labelNames.length, activation: "softmax"}))
  model.compile({ optimizer: tf.train.adam(0.001), loss: "categoricalCrossentropy", metrics: ["accuracy"] })

  let valAcc = 0
  await model.fit(Xtr, ytr, {
    epochs: 500,
    batchSize: 32,
    shuffle: true,
    validationData: [Xva, yva],
    callbacks: { onEpochEnd: (_e, logs) => { if (logs?.val_acc != null) valAcc = logs.val_acc as number; console.log(logs!.val_loss) } }
  })

  let modelJson: File = null as any
  let weightsFile: File = null as any

  await model.save(tf.io.withSaveHandler(async (artifacts: any): Promise<any> => {
    const jsonContent = {
      modelTopology: artifacts.modelTopology,
      weightsManifest: [{ paths: ['model.weights.bin'], weights: artifacts.weightSpecs }]
    }

    const jsonBlob = new Blob([JSON.stringify(jsonContent)], { type: 'application/json' })
    modelJson = new File([jsonBlob], 'model.json', { type: 'application/json' })

    const weightData: ArrayBuffer = Array.isArray(artifacts.weightData)
      ? (() => {
          const total = artifacts.weightData.reduce((s: number, b: ArrayBuffer) => s + b.byteLength, 0)
          const merged = new Uint8Array(total)
          let off = 0
          for (const buf of artifacts.weightData) { merged.set(new Uint8Array(buf), off); off += buf.byteLength }
          return merged.buffer
        })()
      : artifacts.weightData

    const weightsBlob = new Blob([weightData], { type: 'application/octet-stream' })
    weightsFile = new File([weightsBlob], 'model.weights.bin', { type: 'application/octet-stream' })

    return {
      modelArtifactsInfo: {
        dateSaved: new Date(),
        modelTopologyBytes: jsonBlob.size,
        weightSpecsBytes: new Blob([JSON.stringify(artifacts.weightSpecs)]).size,
        weightDataBytes: weightsBlob.size
      }
    }
  }))

  Xtr.dispose(); Xva.dispose(); ytr.dispose(); yva.dispose()

  return { model, labelNames, modelJson, weightsFile, valAcc }
}
