export const JOINT_ANGLE_OPTIONS = [
  // ----- BÊN PHẢI -----
  {
    label: 'Góc vai phải',
    value: [12, 14, 24], // RIGHT_SHOULDER, RIGHT_ELBOW, RIGHT_HIP
    display: 'Cổ - Vai phải - Cùi chỏ phải',
  },
  {
    label: 'Góc cùi chỏ phải',
    value: [12, 14, 16], // RIGHT_SHOULDER, RIGHT_ELBOW, RIGHT_WRIST
    display: 'Vai phải - Cùi chỏ phải - Cổ tay phải',
  },
  {
    label: 'Góc cổ tay phải',
    value: [14, 16, 20], // RIGHT_ELBOW, RIGHT_WRIST, RIGHT_INDEX
    display: 'Cùi chỏ phải - Cổ tay phải - Ngón trỏ phải',
  },
  {
    label: 'Góc hông phải',
    value: [12, 24, 26], // RIGHT_SHOULDER, RIGHT_HIP, RIGHT_KNEE
    display: 'Vai phải - Hông phải - Gối phải',
  },
  {
    label: 'Góc gối phải',
    value: [24, 26, 28], // RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE
    display: 'Hông phải - Gối phải - Cổ chân phải',
  },
  {
    label: 'Góc cổ chân phải',
    value: [26, 28, 32], // RIGHT_KNEE, RIGHT_ANKLE, RIGHT_FOOT_INDEX
    display: 'Gối phải - Cổ chân phải - Ngón chân cái phải',
  },
  // ----- BÊN TRÁI -----
  {
    label: 'Góc vai trái',
    value: [11, 13, 23], // LEFT_SHOULDER, LEFT_ELBOW, LEFT_HIP
    display: 'Cổ - Vai trái - Cùi chỏ trái',
  },
  {
    label: 'Góc cùi chỏ trái',
    value: [11, 13, 15], // LEFT_SHOULDER, LEFT_ELBOW, LEFT_WRIST
    display: 'Vai trái - Cùi chỏ trái - Cổ tay trái',
  },
  {
    label: 'Góc cổ tay trái',
    value: [13, 15, 19], // LEFT_ELBOW, LEFT_WRIST, LEFT_INDEX
    display: 'Cùi chỏ trái - Cổ tay trái - Ngón trỏ trái',
  },
  {
    label: 'Góc hông trái',
    value: [11, 23, 25], // LEFT_SHOULDER, LEFT_HIP, LEFT_KNEE
    display: 'Vai trái - Hông trái - Gối trái',
  },
  {
    label: 'Góc gối trái',
    value: [23, 25, 27], // LEFT_HIP, LEFT_KNEE, LEFT_ANKLE
    display: 'Hông trái - Gối trái - Cổ chân trái',
  },
  {
    label: 'Góc cổ chân trái',
    value: [25, 27, 31], // LEFT_KNEE, LEFT_ANKLE, LEFT_FOOT_INDEX
    display: 'Gối trái - Cổ chân trái - Ngón chân cái trái',
  },
];

export const MUSCLE_GROUPS = [
  { id: 0,  name: "Ngực" },
  { id: 1,  name: "Vai" },
  { id: 2,  name: "Tay sau" },
  { id: 3,  name: "Lưng" },
  { id: 4,  name: "Cầu vai" },
  { id: 5,  name: "Tay trước" },
  { id: 6,  name: "Cẳng tay" },
  { id: 7,  name: "Bụng" },
  { id: 8,  name: "Thắt lưng" },
  { id: 9,  name: "Mông" },
  { id: 10, name: "Đùi trước" },
  { id: 11, name: "Đùi sau" },
  { id: 12, name: "Bắp chân" },
];

export const GOALS = [
  {
    id: 1,
    name: 'Giữ dáng',
  },
  {
    id: 2,
    name: 'Giảm mỡ',
  },
  {
    id: 3,
    name: 'Tăng cơ'
  }
]

const OPERATORS = ['<', '>', '=', '<=', '>='] as const;
