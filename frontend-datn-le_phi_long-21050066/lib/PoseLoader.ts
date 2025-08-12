import * as fs from "fs";

function loadPoseData(path: any) {
  return JSON.parse(fs.readFileSync(path, "utf-8"));
}

export function transformPose(path: any) {
  const data = loadPoseData(path);
  const result: any = {};
  for (const label in data) {
    result[label] = data[label].map((frame: any) => {
      const landmarks = [];
      for (let i = 0; i < frame.length; i += 3) {
        landmarks.push([frame[i], frame[i + 1], frame[i + 2]]);
      }
      return landmarks;
    });
  }
  return result;
}
