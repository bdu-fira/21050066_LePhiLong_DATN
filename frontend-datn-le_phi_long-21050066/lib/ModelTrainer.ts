import * as tf from "@tensorflow/tfjs";

function shuffleWithSeed<T>(arr: T[], seed = 1234): T[] {
  let s = seed;
  const rand = () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
  return arr
    .map(v => ({ v, r: rand() }))
    .sort((a, b) => a.r - b.r)
    .map(o => o.v);
}

// hàm thêm để export weights thành File
async function exportModelWeights(model: any) {
  let weightsFile: File | null = null;
  const handler: any = {
    save: async (artifacts: any) => {
      const blob = new Blob([artifacts.weightData], { type: "application/octet-stream" });
      weightsFile = new File([blob], "model.weights", { type: "application/octet-stream" });
      return {
        modelArtifactsInfo: {
          dateSaved: new Date(),
          modelTopologyType: "JSON",
          modelTopologyBytes: 0,
          weightDataBytes: artifacts.weightData.byteLength,
          weightSpecsBytes: 0,
        },
      };
    },
  };
  await model.save(handler);
  return weightsFile;
}

export async function trainPoseClassifier(poseData: any) {
  const seed = 42;
  const labelNames = Object.keys(poseData);
  const samples: any[] = [];
  labelNames.forEach((label, idx) => {
    for (const kp of poseData[label] || []) samples.push({ x: kp.flat(), y: idx, label });
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

  const Xtr = tf.tensor2d(train.map(s => s.x));
  const ytr = tf.oneHot(tf.tensor1d(train.map(s => s.y), "int32"), labelNames.length);
  const Xva = tf.tensor2d(val.map(s => s.x));
  const yva = tf.oneHot(tf.tensor1d(val.map(s => s.y), "int32"), labelNames.length);

  const ki = tf.initializers.glorotUniform({ seed });
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [99], units: 64, activation: "relu", kernelInitializer: ki }));
  model.add(tf.layers.dense({ units: 32, activation: "relu", kernelInitializer: ki }));
  model.add(tf.layers.dense({ units: labelNames.length, activation: "softmax", kernelInitializer: ki }));

  model.compile({ optimizer: tf.train.adam(0.001), loss: "categoricalCrossentropy", metrics: ["accuracy"] });

  let valAcc = 0;
  const history = await model.fit(Xtr, ytr, {
    epochs: 200,
    batchSize: 9,
    shuffle: false,
    validationData: [Xva, yva],
    callbacks: { 
      onEpochEnd: (_e, logs) => { 
        if (logs?.val_acc != null) valAcc = logs.val_acc as number; 
        console.log(logs!.loss);
      } 
    }
  });

  // gọi export và trả thêm weightsFile
  const weightsFile = await exportModelWeights(model);

  return { model, labelNames, valAcc, history, weightsFile };
}
