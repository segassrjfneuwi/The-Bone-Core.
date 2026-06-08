// دالة برمجية لمحاكاة نبضات مستشعرات العمود الفقري العشوائية في حدود الأمان الطبية
export const generateLiveSensorData = () => {
  return {
    cervicalAngle: Math.floor(Math.random() * (16 - 8 + 1)) + 8, // يحاكي زاوية ميل بين 8 و 16 درجة
    lumbarPressure: Math.floor(Math.random() * (450 - 380 + 1)) + 380, // يحاكي ضغط قطني بين 380 و 450 نيوتن
    emgMuscleStrain: Math.floor(Math.random() * (22 - 10 + 1)) + 10, // يحاكي إجهاد عضلي بين 10% و 22%
  };
};
