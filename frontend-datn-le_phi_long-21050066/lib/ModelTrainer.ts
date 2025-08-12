import * as tf from "@tensorflow/tfjs";

export async function trainPoseClassifier(poseData: Record<string, number[][][]>) {
  // Chuẩn hóa đầu vào
  const allData: number[][] = [];
  const allLabels: number[] = [];
  const labelNames: string[] = Object.keys(poseData);

  // Flatten keypoints
  Object.entries(poseData).forEach(([label, arr], idx) => {
    for (const kp of arr) {
      allData.push(kp.flat()); // [99]
      allLabels.push(idx);
    }
  });

  if (allData.length === 0) throw new Error('Không có dữ liệu keypoints hợp lệ');

  const X = tf.tensor2d(allData); // [num_samples, 99]
  const y = tf.oneHot(tf.tensor1d(allLabels, "int32"), labelNames.length); // [num_samples, num_labels]

  // Mô hình đơn giản multi-class classification
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [99], units: 64, activation: "relu" }));
  model.add(tf.layers.dense({ units: 32, activation: "relu" }));
  model.add(tf.layers.dense({ units: labelNames.length, activation: "softmax" }));

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"]
  });

  let valAcc = 0;

  await model.fit(X, y, {
    epochs: 50,
    batchSize: 8,
    validationSplit: 0.3,
    callbacks: {
      onEpochEnd: (_epoch, logs) => {
        if (logs?.val_acc !== undefined) valAcc = logs.val_acc as number;
      }
    }
  });


  const byLabel = Object.fromEntries(Object.entries(poseData).map(([k, arr]) => [k, arr.map(kp => kp.flat())]));
  (() => { const b=new Blob([JSON.stringify(byLabel,null,2)],{type:"application/json"}); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download="poseData_byLabel.json"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(u); })();
  
  return { model, labelNames, valAcc };
}
