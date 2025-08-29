import * as tf from "@tensorflow/tfjs";

function shuffleWithSeed<T>(arr: T[], seed = 1234): T[] {
  let s = seed;
  const rand = () => { s = Math.sin(s) * 10000; return s - Math.floor(s); };
  return arr.map(v => ({ v, r: rand() })).sort((a, b) => a.r - b.r).map(o => o.v);
}

/* ===== Tiền xử lý: 33*3 -> 99 + 8 góc = 107 ===== */
export const INPUT_DIM_107 = 107;

const _n = (v: any) => Number.isFinite(v) ? v : 0;
const _gp = (arr: any[], i: number) => {
  const p = Array.isArray(arr) ? arr[i] : undefined;
  if (Array.isArray(p)) return { x: _n(p[0]), y: _n(p[1]), z: _n(p[2]) };
  return { x: _n(p?.x), y: _n(p?.y), z: _n(p?.z) };
};
const _ang = (a: any, b: any, c: any) => {
  const ux = a.x - b.x, uy = a.y - b.y, uz = a.z - b.z;
  const vx = c.x - b.x, vy = c.y - b.y, vz = c.z - b.z;
  const du = Math.hypot(ux, uy, uz) || 1;
  const dv = Math.hypot(vx, vy, vz) || 1;
  const cos = Math.min(1, Math.max(-1, (ux*vx + uy*vy + uz*vz) / (du*dv)));
  return Math.acos(cos) * 180 / Math.PI;
};
export function buildFeatures107(lms: any[]) {
  const base: any[] = [];
  for (let i = 0; i < 33; i++) { const p = _gp(lms, i); base.push(p.x, p.y, p.z); }
  const L11 = _gp(lms, 11), L12 = _gp(lms, 12), L13 = _gp(lms, 13), L14 = _gp(lms, 14);
  const L15 = _gp(lms, 15), L16 = _gp(lms, 16), L23 = _gp(lms, 23), L24 = _gp(lms, 24);
  const L25 = _gp(lms, 25), L26 = _gp(lms, 26), L27 = _gp(lms, 27), L28 = _gp(lms, 28);
  const angs = [
    _ang(L13, L11, L23), _ang(L14, L12, L24),
    _ang(L15, L13, L11), _ang(L16, L14, L12),
    _ang(L11, L23, L25), _ang(L12, L24, L26),
    _ang(L23, L25, L27), _ang(L24, L26, L28),
  ];
  return base.concat(angs);
}

/* ===== Chuẩn hoá theo mean/std trên tập train ===== */
function standardize2d(X: number[][]) {
  const dx = tf.tensor2d(X, [X.length, X[0].length]);
  const { mean, variance } = tf.moments(dx, 0);
  const std = tf.sqrt(variance).add(1e-6);
  const norm = dx.sub(mean).div(std);
  return { norm, mean, std };
}
function applyStandardize2d(X: number[][], mean: tf.Tensor, std: tf.Tensor) {
  const dx = tf.tensor2d(X, [X.length, X[0].length]);
  const norm = dx.sub(mean).div(std);
  return norm;
}

/* ===== Huấn luyện ===== */
export async function trainPoseClassifier(poseData: any) {
  console.log(poseData);

  const seed = 42;
  const labelNames = Object.keys(poseData);
  const samples: any[] = [];

  // Build samples -> 107 đặc trưng
  labelNames.forEach((label, idx) => {
    const arr = poseData[label] || [];
    for (const kp of arr) {
      const lms = Array.isArray(kp) ? kp.map((p: any) => Array.isArray(p) ? ({ x: p[0], y: p[1], z: p[2] }) : p) : (kp || []);
      const x = buildFeatures107(lms);
      if (x.length === INPUT_DIM_107) samples.push({ x, y: idx, label });
    }
  });
  if (!samples.length) throw new Error("Không có dữ liệu");

  const shuffled = shuffleWithSeed(samples, seed);
  const valRatio = 0.33;
  const train: any[] = [];
  const val: any[] = [];

  for (const name of labelNames) {
    const per = shuffled.filter(s => s.label === name);
    const cut = Math.max(1, Math.floor(per.length * valRatio));
    const perShuf = shuffleWithSeed(per, seed ^ name.length);
    val.push(...perShuf.slice(0, cut));
    train.push(...perShuf.slice(cut));
  }

  const Xtr_ = train.map(s => s.x);
  const ytrIdx = train.map(s => s.y);
  const Xva_ = val.map(s => s.x);
  const yvaIdx = val.map(s => s.y);

  const { norm: Xtr, mean, std } = standardize2d(Xtr_);
  const Xva = applyStandardize2d(Xva_, mean, std);
  const ytr = tf.oneHot(tf.tensor1d(ytrIdx, "int32"), labelNames.length);
  const yva = tf.oneHot(tf.tensor1d(yvaIdx, "int32"), labelNames.length);

  const ki = tf.initializers.glorotUniform({ seed });
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [INPUT_DIM_107], units: 64, activation: "relu", kernelInitializer: ki }));
  model.add(tf.layers.dense({ units: 32, activation: "relu", kernelInitializer: ki }));
  model.add(tf.layers.dense({ units: labelNames.length, activation: "softmax", kernelInitializer: ki }));
  model.compile({ optimizer: tf.train.adam(1e-3), loss: "categoricalCrossentropy", metrics: ["accuracy"] });

  const weightL2 = () => tf.tidy(() =>
    tf.addN(model.getWeights().map(w => w.square().sum())).dataSync()[0]
  );
  let prev = weightL2();

  let valAcc = 0;
  const history = await model.fit(Xtr, ytr, {
    epochs: 200,
    batchSize: 32,
    shuffle: true,
    validationData: [Xva, yva],
    callbacks: {
      onEpochEnd: (e, logs) => {
        const now = weightL2();
        valAcc = (logs as any)?.val_acc ?? valAcc;
        console.log(
          'acc=', (logs as any)?.acc, 'val_acc=', (logs as any)?.val_acc,
          'loss=', logs?.loss, 'val_loss=', (logs as any)?.val_loss,
        );
        prev = now;
      }
    }
  });

  let modelJson: File = null as any;
  let weightsFile: File = null as any;

  await model.save(tf.io.withSaveHandler((saveArtifacts: any): any => {
    const modelJsonBlob = new Blob([JSON.stringify(saveArtifacts.modelTopology)], { type: "application/json" });
    modelJson = new File([modelJsonBlob], "model.json", { type: "application/json" });

    let weightDataBuffer: ArrayBuffer;
    if (Array.isArray(saveArtifacts.weightData)) {
      const totalLength = saveArtifacts.weightData.reduce((sum: any, buffer: any) => sum + buffer.byteLength, 0);
      const mergedArray = new Uint8Array(totalLength);
      let offset = 0;
      for (const buffer of saveArtifacts.weightData) {
        mergedArray.set(new Uint8Array(buffer), offset);
        offset += buffer.byteLength;
      }
      weightDataBuffer = mergedArray.buffer;
    } else {
      weightDataBuffer = saveArtifacts.weightData;
    }
    weightsFile = new File([weightDataBuffer], "model.weights.bin", { type: "application/octet-stream" });

    return { modelJson, weightsFile };
  }));

  Xtr.dispose(); Xva.dispose(); ytr.dispose(); yva.dispose();
  mean.dispose(); std.dispose();

  return { model, labelNames, valAcc, modelJson, weightsFile, history };
}
