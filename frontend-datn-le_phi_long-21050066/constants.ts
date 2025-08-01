export const JOINT_ANGLE_OPTIONS = [
  // ----- BÊN PHẢI -----
  {
    label: 'Góc vai phải',
    value: ['RIGHT_SHOULDER', 'RIGHT_ELBOW', 'RIGHT_HIP'],
    display: 'Cổ - Vai phải - Cùi chỏ phải',
  },
  {
    label: 'Góc cùi chỏ phải',
    value: ['RIGHT_SHOULDER', 'RIGHT_ELBOW', 'RIGHT_WRIST'],
    display: 'Vai phải - Cùi chỏ phải - Cổ tay phải',
  },
  {
    label: 'Góc cổ tay phải',
    value: ['RIGHT_ELBOW', 'RIGHT_WRIST', 'RIGHT_INDEX'],
    display: 'Cùi chỏ phải - Cổ tay phải - Ngón trỏ phải',
  },
  {
    label: 'Góc hông phải',
    value: ['RIGHT_SHOULDER', 'RIGHT_HIP', 'RIGHT_KNEE'],
    display: 'Vai phải - Hông phải - Gối phải',
  },
  {
    label: 'Góc gối phải',
    value: ['RIGHT_HIP', 'RIGHT_KNEE', 'RIGHT_ANKLE'],
    display: 'Hông phải - Gối phải - Cổ chân phải',
  },
  {
    label: 'Góc cổ chân phải',
    value: ['RIGHT_KNEE', 'RIGHT_ANKLE', 'RIGHT_FOOT_INDEX'],
    display: 'Gối phải - Cổ chân phải - Ngón chân cái phải',
  },
  // ----- BÊN TRÁI -----
  {
    label: 'Góc vai trái',
    value: ['LEFT_SHOULDER', 'LEFT_ELBOW', 'LEFT_HIP'],
    display: 'Cổ - Vai trái - Cùi chỏ trái',
  },
  {
    label: 'Góc cùi chỏ trái',
    value: ['LEFT_SHOULDER', 'LEFT_ELBOW', 'LEFT_WRIST'],
    display: 'Vai trái - Cùi chỏ trái - Cổ tay trái',
  },
  {
    label: 'Góc cổ tay trái',
    value: ['LEFT_ELBOW', 'LEFT_WRIST', 'LEFT_INDEX'],
    display: 'Cùi chỏ trái - Cổ tay trái - Ngón trỏ trái',
  },
  {
    label: 'Góc hông trái',
    value: ['LEFT_SHOULDER', 'LEFT_HIP', 'LEFT_KNEE'],
    display: 'Vai trái - Hông trái - Gối trái',
  },
  {
    label: 'Góc gối trái',
    value: ['LEFT_HIP', 'LEFT_KNEE', 'LEFT_ANKLE'],
    display: 'Hông trái - Gối trái - Cổ chân trái',
  },
  {
    label: 'Góc cổ chân trái',
    value: ['LEFT_KNEE', 'LEFT_ANKLE', 'LEFT_FOOT_INDEX'],
    display: 'Gối trái - Cổ chân trái - Ngón chân cái trái',
  },
];

export const LOOKING_ANGLE = [
  {
    "value": -1,
    "display": 'Xéo, nhìn qua trái',
  },
  {
    "value": 0,
    "display": 'Trước mặt',
  },
  {
    "value": 1,
    "display": 'Xéo, nhìn qua phải',
  },
]