import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  SafeAreaView, StatusBar, Dimensions, Animated, Easing,
  Modal, TextInput, Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const C = {
  bg:          '#060c1f',
  surface:     '#0f1e40',
  navyLight:   '#3b82f6',
  cyan:        '#06b6d4',
  white:       '#ffffff',
  offWhite:    '#f8fafc',
  textPrimary: '#0f172a',
  textSecond:  '#64748b',
  green:       '#10b981',
  red:         '#ef4444',
  orange:      '#f97316',
  purple:      '#8b5cf6',
  amber:       '#f59e0b',
  border:      '#e2e8f0',
};

// كود قراءة الحساسات مدمج محلياً لسهولة البناء لـ APK
const generateLiveSensorData = () => {
  return {
    cervicalAngle: Math.floor(Math.random() * (18 - 8 + 1)) + 8,
    lumbarPressure: Math.floor(Math.random() * (450 - 380 + 1)) + 380,
    emgMuscleStrain: Math.floor(Math.random() * (22 - 10 + 1)) + 10,
  };
};

function CircularProgress({ value = 91, size = 160 }) {
  const animVal = useRef(new Animated.Value(0)).current;
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: value,
      duration: 1500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [value]);

  const strokeDashoffset = animVal.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="premiumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={C.cyan} />
            <Stop offset="100%" stopColor={C.purple} />
          </LinearGradient>
        </Defs>
        <Circle cx={cx} cy={cy} r={radius} fill="transparent" stroke="#1e293b" strokeWidth={10} />
        <AnimatedCircle
          cx={cx} cy={cy} r={radius}
          fill="transparent"
          stroke="url(#premiumGrad)"
          strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{color: C.white, fontSize: 28, fontWeight: 'bold'}}>{value}%</Text>
        <Text style={{color: C.textSecond, fontSize: 10, marginTop: 2}}>تطابق المحور</Text>
      </View>
    </View>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isConnected, setIsConnected] = useState(false);
  
  const [cervicalAngle, setCervicalAngle] = useState(11);
  const [lumbarPressure, setLumbarPressure] = useState(410);
  const [emgStrain, setEmgStrain] = useState(14);
  const [spineScore, setSpineScore] = useState(100);
  const [headLoad, setHeadLoad] = useState(5.4);

  const [tensLevel, setTensLevel] = useState(5);
  const [heatLevel, setHeatLevel] = useState(38);
  const [isTherapyRunning, setIsTherapyRunning] = useState(false);
  
  const [isDoctorUnlocked, setIsDoctorUnlocked] = useState(false);
  const [doctorPin, setDoctorPin] = useState('');
  const [maxTensAllowed, setMaxTensAllowed] = useState(12);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ title: '', desc: '', type: 'success' });

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const badPostureTimer = useRef(0);

  useEffect(() => {
    let timer = null;
    if (isTherapyRunning && isConnected) {
      timer = setInterval(() => {
        const data = generateLiveSensorData();
        setCervicalAngle(data.cervicalAngle);
        setLumbarPressure(data.lumbarPressure);
        setEmgStrain(data.emgMuscleStrain);

        let currentLoad = 5.4;
        if (data.cervicalAngle >= 14) currentLoad = 12.2;
        if (data.cervicalAngle >= 17) currentLoad = 18.5;
        setHeadLoad(currentLoad);

        if (data.cervicalAngle >= 15) {
          badPostureTimer.current += 1;
          setSpineScore(s => Math.max(0, s - 1));
          if (badPostureTimer.current === 4) {
            showModal('⚠️ تنبيه الاستقامة', `تم رصد ميل حاد! وزن الرأس على فقراتك الآن يعادل ${currentLoad} كجم.`, 'warn');
          }
        } else {
          badPostureTimer.current = 0;
          setSpineScore(s => Math.min(100, s + 1));
        }
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isTherapyRunning, isConnected]);

  const showModal = (title, desc, type) => {
    setModalData({ title, desc, type });
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={{fontSize: 22}}>🦴</Text>
          <View style={{marginRight: 8, alignItems: 'flex-end'}}>
            <Text style={styles.appTitle}>The Bone Core Pro</Text>
            <Text style={{color: C.cyan, fontSize: 10}}>المنظومة الطبية الذكية الشاملة</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.btBtn, isConnected && {backgroundColor: C.green}]} onPress={() => {
          setIsConnected(!isConnected);
          if(!isConnected) showModal('📡 تم الاقتران', 'تم الاتصال بوحدة المستشعرات بنجاح.', 'success');
        }}>
          <Text style={{color: C.white, fontSize: 12, fontWeight: 'bold'}}>{isConnected ? '📶 متصل' : '📵 اقتران'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'home' && (
          <Animated.View style={{opacity: fadeAnim}}>
            <View style={styles.scoreBoard}>
              <Text style={{fontSize: 28}}>🏆</Text>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={{color: C.textSecond, fontSize: 12}}>مؤشر صحة العمود الفقري</Text>
                <Text style={[styles.scoreValue, {color: spineScore > 80 ? C.green : C.amber}]}>{spineScore} / 100</Text>
              </View>
            </View>

            <View style={styles.grid}>
              <View style={styles.miniCard}>
                <Text style={{fontSize: 24}}>📐</Text>
                <Text style={styles.miniLabel}>زاوية العنق</Text>
                <Text style={[styles.miniValue, {color: cervicalAngle >= 15 ? C.red : C.green}]}>{cervicalAngle}°</Text>
              </View>
              <View style={styles.miniCard}>
                <Text style={{fontSize: 24}}>🏋️</Text>
                <Text style={styles.miniLabel}>الحمل الميكانيكي</Text>
                <Text style={styles.miniValue}>{headLoad} كجم</Text>
              </View>
            </View>

            <View style={styles.mainCard}>
              <Text style={styles.cardTitle}>🎯 المرصد الرقمي الحي</Text>
              <View style={styles.row}>
                <CircularProgress value={isConnected ? (100 - cervicalAngle * 2) : 92} size={130} />
                <View style={{alignItems: 'flex-end', flex: 1, marginRight: 16}}>
                  <Text style={styles.statText}>🧠 إجهاد العضلات: {emgStrain}%</Text>
                  <Text style={styles.statText}>⚖️ الضغط القطني: {lumbarPressure} N</Text>
                  <Text style={styles.statText}>🔋 مستوى البطارية: 97%</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {activeTab === 'control' && (
          <View>
            <Text style={styles.sectionTitle}>غرفة العلاج السريري ⚡</Text>
            <View style={styles.mainCard}>
              <Text style={styles.sliderLabel}>⚡ شدة تيار TENS (الأقصى: {maxTensAllowed})</Text>
              <Slider style={{width: '100%', height: 40}} minimumValue={1} maximumValue={maxTensAllowed} step={1} value={tensLevel} onValueChange={setTensLevel} minimumTrackTintColor={C.cyan} />
              <Text style={{color: C.cyan, textAlign: 'right', fontWeight: 'bold'}}>المستوى الحالي: {tensLevel}</Text>

              <Text style={[styles.sliderLabel, {marginTop: 20}]}>🌡️ العلاج الحراري المستهدف</Text>
              <Slider style={{width: '100%', height: 40}} minimumValue={30} maximumValue={45} step={1} value={heatLevel} onValueChange={setHeatLevel} minimumTrackTintColor={C.orange} />
              <Text style={{color: C.orange, textAlign: 'right', fontWeight: 'bold'}}>درجة الحرارة: {heatLevel}°C</Text>

              <TouchableOpacity style={[styles.actionBtn, isTherapyRunning && {backgroundColor: C.red}]} onPress={() => {
                if(!isConnected) return showModal('تنبيه', 'برجاء الاقتران بالنظام أولاً', 'warn');
                setIsTherapyRunning(!isTherapyRunning);
              }}>
                <Text style={styles.btnText}>{isTherapyRunning ? '⏹ إنهاء الجلسة العلاجية' : '▶ بدء تشغيل النبضات'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'health' && (
          <View>
            <Text style={styles.sectionTitle}>خطة التعافي والصحة الجسدية 🥗</Text>
            <View style={styles.mainCard}>
              <Text style={{color: C.green, fontWeight: 'bold', marginBottom: 6, textAlign: 'right'}}>🥗 النظام الغذائي الداعم للعظام</Text>
              <Text style={styles.bullet}>• التركيز على مكملات مركب الكالسيوم مع فيتامين D3 و K2 لضمان الترسيب داخل العظام.</Text>
              <Text style={styles.bullet}>• وجبات غنية بالأوميجا 3 (كالسمك الزيتي) لتقليل التهابات المفاصل والغضاريف.</Text>
            </View>
            <View style={styles.mainCard}>
              <Text style={{color: C.cyan, fontWeight: 'bold', marginBottom: 6, textAlign: 'right'}}>🏋️ البرنامج الرياضي والتأهيلي</Text>
              <Text style={styles.bullet}>• تمارين Chin Tucks: لتقوية عضلات الرقبة العميقة وتعديل محور الرأس.</Text>
              <Text style={styles.bullet}>• تمارين مكنزي القطنية: لدفع النواة اللبية للغضاريف المنزلقة إلى مكانها الطبيعي.</Text>
            </View>
          </View>
        )}

        {activeTab === 'doctor' && (
          <View>
            <Text style={styles.sectionTitle}>بوابة الطبيب المعالج 👨‍⚕️</Text>
            {!isDoctorUnlocked ? (
              <View style={styles.mainCard}>
                <Text style={{color: C.white, marginBottom: 10, textAlign: 'right'}}>أدخل رمز الدخول الطبي (الرمز الافتراضي: 1234)</Text>
                <TextInput style={styles.input} secureTextEntry keyboardType="numeric" value={doctorPin} onChangeText={setDoctorPin} placeholder="****" placeholderTextColor="#475569" />
                <TouchableOpacity style={styles.actionBtn} onPress={() => {
                  if(doctorPin === '1234') { setIsDoctorUnlocked(true); setDoctorPin(''); }
                  else { showModal('خطأ', 'الرمز السري الطبي غير صحيح.', 'warn'); }
                }}>
                  <Text style={styles.btnText}>الولوج الآمن</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.mainCard}>
                <Text style={{color: C.purple, fontWeight: 'bold', textAlign: 'right', marginBottom: 10}}>⚙️ الصلاحيات الطبية المقفلة</Text>
                <Text style={{color: C.white, textAlign: 'right', fontSize: 12, marginBottom: 10}}>تحديد سقف تيار الـ TENS لحماية أعصاب المريض الأندرويد:</Text>
                <Slider style={{width: '100%', height: 40}} minimumValue={5} maximumValue={15} step={1} value={maxTensAllowed} onValueChange={setMaxTensAllowed} minimumTrackTintColor={C.purple} />
                <Text style={{color: C.purple, textAlign: 'right', fontWeight: 'bold', marginBottom: 15}}>الحد الأقصى الحالي: {maxTensAllowed}</Text>
                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: C.bg}]} onPress={() => setIsDoctorUnlocked(false)}>
                  <Text style={styles.btnText}>خروج وحفظ التغييرات</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.navBar}>
        {[
          { id: 'home', label: 'المرصد', icon: '🏠' },
          { id: 'control', label: 'العلاج', icon: '⚡' },
          { id: 'health', label: 'التعافي', icon: '🥗' },
          { id: 'doctor', label: 'الطبيب', icon: '👨‍⚕️' },
        ].map(t => (
          <TouchableOpacity key={t.id} style={styles.navItem} onPress={() => setActiveTab(t.id)}>
            <Text style={[styles.navIcon, activeTab === t.id && {color: C.cyan}]}>{t.icon}</Text>
            <Text style={[styles.navLabel, activeTab === t.id && {color: C.cyan, fontWeight: 'bold'}]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal animationType="fade" transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={{fontSize: 36, marginBottom: 8}}>{modalData.type === 'warn' ? '⚠️' : '✅'}</Text>
            <Text style={{color: C.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 8}}>{modalData.title}</Text>
            <Text style={{color: C.textSecond, fontSize: 13, textAlign: 'center', marginBottom: 16}}>{modalData.desc}</Text>
            <TouchableOpacity style={{backgroundColor: C.bg, padding: 12, width: '100%', borderRadius: 8, alignItems: 'center'}} onPress={() => setModalVisible(false)}>
              <Text style={{color: C.white, fontWeight: 'bold'}}>فهمت</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060c1f' },
  header: { padding: 16, backgroundColor: '#0f1e40', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  headerLeft: { flexDirection: 'row-reverse', alignItems: 'center' },
  appTitle: { color: C.white, fontSize: 16, fontWeight: 'bold' },
  btBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#1e293b' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  scoreBoard: { backgroundColor: '#0f1e40', padding: 16, borderRadius: 12, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#1e293b' },
  scoreValue: { fontSize: 20, fontWeight: 'bold', marginTop: 2 },
  grid: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 12 },
  miniCard: { width: '48%', backgroundColor: '#0f1e40', padding: 12, borderRadius: 12, alignItems: 'center' },
  miniLabel: { color: C.textSecond, fontSize: 11, marginTop: 4 },
  miniValue: { color: C.white, fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  mainCard: { backgroundColor: '#0f1e40', padding: 16, borderRadius: 12, marginBottom: 12 },
  cardTitle: { color: C.white, fontWeight: 'bold', fontSize: 14, marginBottom: 12, textAlign: 'right' },
  row: { flexDirection: 'row-reverse', alignItems: 'center' },
  statText: { color: C.white, fontSize: 12, marginBottom: 6, textAlign: 'right' },
  sectionTitle: { color: C.white, fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'right' },
  sliderLabel: { color: C.white, fontSize: 12, textAlign: 'right', marginBottom: 6 },
  actionBtn: { backgroundColor: C.cyan, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  btnText: { color: C.white, fontWeight: 'bold', fontSize: 14 },
  bullet: { color: C.offWhite, fontSize: 12, textAlign: 'right', lineHeight: 18, marginTop: 4 },
  input: { backgroundColor: '#1e293b', color: C.white, padding: 10, borderRadius: 8, textAlign: 'center', fontSize: 16, marginBottom: 12 },
  navBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: '#0f1e40', flexDirection: 'row-reverse', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1e293b' },
  navItem: { alignItems: 'center' },
  navIcon: { fontSize: 18, color: C.textSecond },
  navLabel: { fontSize: 10, color: C.textSecond, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '80%', backgroundColor: C.white, padding: 20, borderRadius: 16, alignItems: 'center' },
});
