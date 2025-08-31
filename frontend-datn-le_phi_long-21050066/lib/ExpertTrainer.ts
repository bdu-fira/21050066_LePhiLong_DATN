import { JOINT_ANGLE_OPTIONS } from "@/constants";

const LDMK: any = {
  NOSE: 0, LEFT_EYE_INNER: 1, LEFT_EYE: 2, LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4, RIGHT_EYE: 5, RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7, RIGHT_EAR: 8, MOUTH_LEFT: 9, MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12, LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
  LEFT_WRIST: 15, RIGHT_WRIST: 16, LEFT_PINKY: 17, RIGHT_PINKY: 18,
  LEFT_INDEX: 19, RIGHT_INDEX: 20, LEFT_THUMB: 21, RIGHT_THUMB: 22,
  LEFT_HIP: 23, RIGHT_HIP: 24, LEFT_KNEE: 25, RIGHT_KNEE: 26,
  LEFT_ANKLE: 27, RIGHT_ANKLE: 28, LEFT_HEEL: 29, RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31, RIGHT_FOOT_INDEX: 32,
};

let currentRules: any = []
let currentVoices: any = []

const correctOrder = [0, 1, 2, 1, 0];
let sequence: number[] = [];

export function resetOrder() {
  sequence = [];
}

export function feedOrder(idx: number): boolean {
  if (sequence.length && sequence[sequence.length - 1] === idx) return false;
  sequence.push(idx);
  if (sequence.length > correctOrder.length) sequence.shift();
  const ok = sequence.length === correctOrder.length && sequence.every((v, i) => v === correctOrder[i]);
  if (ok) { sequence = []; return true; }
  return false;
}

function resolveIdx(i: any): number {
  if (typeof i === "number") return i;
  if (typeof i === "string" && i in LDMK) return LDMK[i];
  return -1;
}

/** Chấp nhận landmark dạng object {x,y,z} hoặc mảng [x,y,z] */
function toXYZ(p: any): any {
  if (!p) return null as any;
  if (Array.isArray(p)) {
    return { x: p[0], y: p[1], z: p[2] };
  }
  // object Mediapipe chuẩn: {x, y, z, visibility?}
  return { x: p.x, y: p.y, z: p.z };
}

function validPoint(p: any): boolean {
  return p && typeof p.x === "number" && typeof p.y === "number" && typeof p.z === "number";
}

// v1 = p1 - p2, v2 = p3 - p2; góc = atan2(||v1×v2||, v1·v2) ∈ [0, π]
export function calculateRadian(p1: any, p2: any, p3: any): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z - p2.z };

  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;

  const cx = v1.y * v2.z - v1.z * v2.y;
  const cy = v1.z * v2.x - v1.x * v2.z;
  const cz = v1.x * v2.y - v1.y * v2.x;
  const crossLen = Math.sqrt(cx * cx + cy * cy + cz * cz);

  return Math.atan2(crossLen, dot);
}

export function radToDeg(rad: number): number {
  return rad * 180 / Math.PI;
}

export function calculateJoints(poseData: any, options: any = JOINT_ANGLE_OPTIONS): any[] {
  const angles: any[] = [];

  for (const opt of (options || [])) {
    const [a, b, c] = opt?.value || [];
    const i1 = resolveIdx(a), i2 = resolveIdx(b), i3 = resolveIdx(c);

    const p1 = toXYZ(poseData?.[i1]);
    const p2 = toXYZ(poseData?.[i2]);
    const p3 = toXYZ(poseData?.[i3]);

    if (!validPoint(p1) || !validPoint(p2) || !validPoint(p3)) {
      angles.push(undefined);
      continue;
    }

    const rad = calculateRadian(p1, p2, p3);
    const deg = radToDeg(rad); 
    angles.push(deg);
  }

  return angles;
}

const setKey = (a: any[]) => (Array.isArray(a) ? a.map(resolveIdx).sort((x: number, y: number) => x - y).join(",") : "");

const JOINT_INDEX_BY_SET: any = (() => {
  const m: any = {};
  (JOINT_ANGLE_OPTIONS || []).forEach((opt: any, idx: number) => {
    m[setKey(opt?.value || [])] = idx;
  });
  return m;
})();

export function loadData(rawRules: any, voices: any) {
  const out: any[] = [];
  for (const group of (rawRules || [])) {
    for (const k of Object.keys(group || {})) {
      const src = group[k];
      if (!src) continue;
      const joints = (src.joints || []).map((j: any) => resolveIdx(j));
      const jointIdx = JOINT_INDEX_BY_SET[setKey(joints)];
      out.push({
        id: src.id,
        positionID: src.positionID,
        operator: src.operator,
        angle: src.angle,
        errorMessage: src.errorMessage,
        joints,
        jointIdx,
      });
    }
  }
  currentRules = out;
  currentVoices = voices;
}

export function check(positionID: number, jointAngles: any[]): any | null {
  const rules = (currentRules || []).filter((r: any) => r.positionID === positionID);
  for (const r of rules) {
    const jointIdx = JOINT_INDEX_BY_SET[setKey(r.joints)];
    const angle = typeof jointIdx === "number" ? jointAngles?.[jointIdx] : undefined;
    if (typeof angle !== "number") continue;

    const t = Number(r.angle);
    const op = (r.operator || "").trim();
    let hit = false;
    if (op === ">") hit = angle > t;
    else if (op === "<") hit = angle < t;
    else if (op === ">=") hit = angle >= t;
    else if (op === "<=") hit = angle <= t;
    else if (op === "=" || op === "==") hit = Math.abs(angle - t) < 1e-3;
    else if (op === "!=" || op === "<>") hit = Math.abs(angle - t) >= 1e-3;

    if (hit){
      return { criteriaID: r.id, positionID: r.positionID, jointIdx, jointList: r.joints, actualAngle: angle, errorMessage: r.errorMessage };
    } 
  }
  return null;
}

export function speak(positionID: number, criteriaID: number){
  const voice = currentVoices.find((v: any)=> v.criteriaID === criteriaID && v.positionID === positionID)
  voice.audio.play()
}

const ExpertTrainer = { calculateJoints, loadData, speak };
export default ExpertTrainer;
