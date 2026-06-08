import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Easing,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

const COLORS = {
  navy:        '#060c1f', 
  navyMid:     '#0f1e40', 
  navyLight:   '#3b82f6', 
  cyan:        '#06b6d4', 
  cyanLight:   '#083344',
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

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function CircularProgress({ value = 91, size = 160 }) {
  const animVal = useRef(new Animated.Value(0)).current;
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: value,
      duration: 2200,
      easing: Easing.out(Easing.back(1)),
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
            <Stop offset="0%" stopColor={COLORS.cyan} />
            <Stop offset="50%" stopColor={COLORS.navyLight} />
            <Stop offset="100%" stopColor={COLORS.purple} />
          </LinearGradient>
        </Defs>
        <Circle cx={cx} cy={cy} r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth={12} />
        <AnimatedCircle
          cx={cx} cy={cy} r={radius}
          fill="transparent"
          stroke="url(#premiumGrad)"
          strokeWidth={12}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.progressPct}>{value}%</Text>
        <Text style={styles.progressLabel}>تطابق المحور</Text>
      </View>
    </View>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isConnected, setIsConnected] = useState(false);
  
  // الحساسات والتقييم الذكي
  const [cervicalAngle, setCervicalAngle] = useState(11);
  const [lumbarPressure, setLumbarPressure] = useState(410);
  const [emgStrain, setEmgStrain] = useState(14);
  const [spineScore, setSpineScore] = useState(100); // التلعيب ونقاط العمود الفقري
  const [headLoad, setHeadLoad] = useState(5.4); // حاسبة الحمل الميكانيكي

  // إعدادات العلاج
  const [tensLevel, setTensLevel] = useState(5);
  const [frequency, setFrequency] = useState(85); 
  const [heatLevel, setHeatLevel] = useState(39); 
  
  // حالة الجلسة
  const [isTherapyRunning, setIsTherapyRunning] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(20); 
  
  // لوحة الطبيب المشرف
  const [isDoctorUnlocked, setIsDoctorUnlocked] = useState(false);
  const [doctorPin, setDoctorPin] = useState('');
  const [maxTensAllowed, setMaxTensAllowed] = useState(12);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ title: '', desc: '', type: 'success' });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(35)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const badPostureTimer = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(25);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: true })
    ]).start();
  }, [activeTab]);

  useEffect(() => {
    if (isTherapyRunning && isConnected) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
        ])
      );
      loop.start();

      timerRef.current = setInterval(() => {
        setSessionTime(t => t + 1);

        // محاكاة حية للحساسات
        const newAngle = Math.floor(Math.random() * (18 - 8 + 1)) + 8;
        setCervicalAngle(newAngle);
        setLumbarPressure(Math.floor(Math.random() * (440 - 390 + 1)) + 390);
        setEmgStrain(Math.floor(Math.random() * (22 - 11 + 1)) + 11);

        // 1. حاسبة الحمل الميكانيكي (كلما زاد الميل، زاد الوزن الافتراضي للرأس)
        let currentLoad = 5.4; // الوزن الطبيعي
        if (newAngle >= 15) currentLoad = 12.2;
        if (newAngle >= 18) currentLoad = 18.5;
        setHeadLoad(currentLoad);

        // 2. نظام التنبيهات الحركية الصامتة والتلعيب (Spine Score)
        if (newAngle >= 15) {
          badPostureTimer.current += 1;
          setSpineScore(s => Math.max(0, s - 1)); // خصم نقاط
          if (badPostureTimer.current === 5) {
            showModal('⚠️ تنبيه حركي ذكي', `تم رصد انحناء حاد في العنق (وزن الرأس الفعلي على فقراتك الآن ${currentLoad} كجم!). يرجى استعادة الاستقامة فوراً.`, 'warn');
          }
        } else {
          badPostureTimer.current = 0;
          setSpineScore(s => Math.min(100, s + 1)); // زيادة نقاط للمكافأة
        }

      }, 1000);

      return () => {
        loop.stop();
        clearInterval(timerRef.current);
      };
    } else {
      pulseAnim.setValue(1);
      clearInterval(timerRef.current);
    }
  }, [isTherapyRunning, isConnected]);

  const toggleBluetooth = () => {
    if (!isConnected) {
      setIsConnected(true);
      showModal('📡 تم الاقتران السريري', 'تم تفعيل الاتصال بوحدة المستشعرات. ระบบ التتبع الحركي جاهز الآن.', 'success');
    } else {
      setIsConnected(false);
      setIsTherapyRunning(false);
      setCervicalAngle(11); setHeadLoad(5.4);
    }
  };

  const showModal = (title, desc, type) => {
    setModalData({ title, desc, type });
    setModalVisible(true);
  };

  const handleDoctorLogin = () => {
    if (doctorPin === '1234') {
      setIsDoctorUnlocked(true);
      setDoctorPin('');
    } else {
      showModal('❌ وصول مرفوض', 'الرمز السري للطبيب غير صحيح.', 'warn');
    }
  };

  // --- 1. الشاشة الرئيسية (المرصد والتلعيب) ---
  const renderHome = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.scoreBoard}>
        <View style={{flexDirection: 'row-reverse', alignItems: 'center'}}>
          <Text style={{fontSize: 32, marginLeft: 10}}>🏆</Text>
          <View>
            <Text style={styles.scoreLabel}>نقاط الاستقامة اليومية</Text>
            <Text style={[styles.scoreValue, { color: spineScore > 80 ? COLORS.green : COLORS.amber }]}>{spineScore} / 100</Text>
          </View>
        </View>
        <Text style={styles.scoreRank}>{spineScore > 80 ? 'بطل حركي 🥇' : 'يحتاج انتباه ⚠️'}</Text>
      </View>

      <View style={styles.liveGrid}>
        <View style={styles.miniReadout}>
          <Text style={styles.readoutIcon}>📐</Text>
          <Text style={styles.readoutLabel}>ميل العنق</Text>
          <Text style={[styles.readoutValue, { color: cervicalAngle >= 15 ? COLORS.red : COLORS.green }]}>{cervicalAngle}°</Text>
        </View>
        <View style={styles.miniReadout}>
          <Text style={styles.readoutIcon}>🏋️</Text>
          <Text style={styles.readoutLabel}>حِمل الرأس الفعلي</Text>
          <Text style={[styles.readoutValue, { color: headLoad > 6 ? COLORS.amber : COLORS.navyLight }]}>{headLoad} كجم</Text>
        </View>
      </View>

      <View style={styles.card}>
         <Text style={styles.cardLabel}>🎯 الحالة الميكانيكية اللحظية</Text>
         <View style={styles.circleRow}>
           <CircularProgress value={isConnected ? (100 - cervicalAngle*2) : 91} size={145} />
           <View style={styles.statsCol}>
             <StatItem icon="🔋" label="بطارية الجهاز" value="98%" color={COLORS.green} />
             <StatItem icon="🧠" label="إجهاد عضلي" value={`${emgStrain}%`} color={emgStrain > 18 ? COLORS.red : COLORS.green} />
             <StatItem icon="⚖️" label="الضغط القطني" value={`${lumbarPressure} N`} color={COLORS.orange} />
           </View>
         </View>
      </View>
    </Animated.View>
  );

  // --- 2. غرفة العلاج (التحكم) ---
  const renderControl = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.sectionTitle}>التحفيز الكهربائي والحراري ⚡</Text>
      <View style={styles.card}>
        <Text style={styles.sliderTitle}>⚡ شدة النبضة (TENS) - أقصى حد مسموح: {maxTensAllowed}</Text>
        <Slider style={styles.slider} minimumValue={1} maximumValue={maxTensAllowed} step={1} value={tensLevel} onValueChange={setTensLevel} minimumTrackTintColor={COLORS.cyan} />
        <Text style={styles.badgeText}>المستوى: {tensLevel}</Text>

        <Text style={[styles.sliderTitle, {marginTop: 20}]}>🌡️ المعالجة الحرارية</Text>
        <Slider style={styles.slider} minimumValue={32} maximumValue={45} step={1} value={heatLevel} onValueChange={setHeatLevel} minimumTrackTintColor={COLORS.orange} />
        <Text style={[styles.badgeText, {color: COLORS.orange}]}>الحرارة: {heatLevel}°C</Text>

        <TouchableOpacity style={[styles.primaryBtn, isTherapyRunning && {backgroundColor: COLORS.red}]} onPress={() => {
            if(!isConnected) return showModal('تنبيه', 'يجب تفعيل البلوتوث أولاً', 'warn');
            setIsTherapyRunning(!isTherapyRunning);
        }}>
          <Text style={styles.primaryBtnText}>{isTherapyRunning ? '⏹ إيقاف الجلسة' : '▶ تشغيل البروتوكول'}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // --- 3. النظام الغذائي والتدريبي (جديد) ---
  const renderHealth = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.sectionTitle}>النظام الغذائي والرياضي للعظام 🥗💪</Text>
      
      <View style={styles.card}>
        <Text style={[styles.subSectionTitle, {color: COLORS.green}]}>🥗 التغذية العظمية الدقيقة (Nutrition)</Text>
        <Text style={styles.textBullet}>• <Text style={{fontWeight: 'bold'}}>الإفطار:</Text> بيض مسلوق (غني بالبروتين و D3) + سبانخ (مصدر للكالسيوم النباتي K1).</Text>
        <Text style={styles.textBullet}>• <Text style={{fontWeight: 'bold'}}>الغداء:</Text> سمك السلمون أو السردين (أوميجا 3 كمضاد للالتهاب الغضروفي) + بروكلي.</Text>
        <Text style={styles.textBullet}>• <Text style={{fontWeight: 'bold'}}>العشاء:</Text> زبادي يوناني مع بذور الشيا والكتان (لتأمين الكولاجين والمغنيسيوم للتعافي الليلي).</Text>
        <Text style={styles.textBullet}>• <Text style={{fontWeight: 'bold'}}>المكملات الضرورية:</Text> فيتامين D3 مع K2 (لتوجيه الكالسيوم للعظام ومنع ترسبه في الشرايين).</Text>
      </View>

      <View style={styles.card}>
        <Text style={[styles.subSectionTitle, {color: COLORS.cyan}]}>🏋️ البرنامج الحركي والتدريبي (Rehab)</Text>
        <Text style={styles.textBullet}>1. <Text style={{fontWeight: 'bold'}}>تمرين (Chin Tucks) للرقبة:</Text> إرجاع الذقن للخلف لتقوية العضلات العميقة وتقليل الحمل على C4-C5 (10 تكرارات 3 مرات يومياً).</Text>
        <Text style={styles.textBullet}>2. <Text style={{fontWeight: 'bold'}}>امتداد ماكنزي (McKenzie Extension):</Text> النوم على البطن والارتفاع بالجذع لدفع الفتق الغضروفي القطني للداخل وتقليل ألم عرق النسا.</Text>
        <Text style={styles.textBullet}>3. <Text style={{fontWeight: 'bold'}}>تمرين (Bird-Dog):</Text> لتقوية العضلات الموازية للعمود الفقري (Core) بدون تشكيل ضغط انضغاطي على الأقراص.</Text>
      </View>
    </Animated.View>
  );

  // --- 4. لوحة الطبيب المشرف (جديد) ---
  const renderDoctor = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.sectionTitle}>بوابة الطبيب المشرف 👨‍⚕️</Text>
      {!isDoctorUnlocked ? (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>الرجاء إدخال رمز الوصول الطبي (PIN: 1234)</Text>
          <TextInput 
            style={styles.input} secureTextEntry keyboardType="numeric" 
            value={doctorPin} onChangeText={setDoctorPin} placeholder="****" 
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={handleDoctorLogin}>
            <Text style={styles.primaryBtnText}>تسجيل الدخول الآمن</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={[styles.subSectionTitle, {color: COLORS.purple}]}>ملف المريض السريري</Text>
          <StatItem icon="👤" label="اسم المريض" value="سيف الدين" color={COLORS.textPrimary} />
          <StatItem icon="⏱️" label="إجمالي ساعات الاستخدام" value="14 ساعة و 20 دقيقة" color={COLORS.textPrimary} />
          <StatItem icon="📉" label="متوسط الاستقامة الأسبوعي" value="88% (تحسن ملحوظ)" color={COLORS.green} />
          
          <View style={{height: 1, backgroundColor: COLORS.border, marginVertical: 15}} />
          
          <Text style={styles.subSectionTitle}>قفل حدود الترددات (روشتة رقمية)</Text>
          <Text style={styles.sliderTitle}>الحد الأقصى لشدة TENS المسموحة للمريض: {maxTensAllowed}</Text>
          <Slider style={styles.slider} minimumValue={5} maximumValue={12} step={1} value={maxTensAllowed} onValueChange={setMaxTensAllowed} minimumTrackTintColor={COLORS.purple} />
          
          <TouchableOpacity style={[styles.primaryBtn, {backgroundColor: COLORS.navy}]} onPress={() => setIsDoctorUnlocked(false)}>
            <Text style={styles.primaryBtnText}>حفظ وتسجيل الخروج</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoCircle}><Text style={styles.logoText}>🦴</Text></View>
          <View style={{ alignItems: 'flex-start' }}>
            <Text style={styles.appTitle}>The Bone Core Pro</Text>
            <Text style={styles.appSlogan}>التحكم الحركي، التغذية، والنبضات السريرية</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.btBtn, isConnected && {backgroundColor: COLORS.green}]} onPress={toggleBluetooth}>
          <Text style={styles.btIcon}>{isConnected ? '📶 متصل' : '📵 اقتران'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'home'    && renderHome()}
        {activeTab === 'control' && renderControl()}
        {activeTab === 'health'  && renderHealth()}
        {activeTab === 'doctor'  && renderDoctor()}
      </ScrollView>

      <View style={styles.navBar}>
        {[
          { id: 'home',    label: 'المرصد', emoji: '🏠' },
          { id: 'control', label: 'العلاج', emoji: '⚡' },
          { id: 'health',  label: 'خطة التعافي', emoji: '🥗' },
          { id: 'doctor',  label: 'الطبيب', emoji: '👨‍⚕️' },
        ].map((tab) => (
          <TouchableOpacity key={tab.id} style={styles.navItem} onPress={() => setActiveTab(tab.id)}>
            <Text style={[styles.navEmoji, activeTab === tab.id && styles.navEmojiActive]}>{tab.emoji}</Text>
            <Text style={[styles.navLabel, activeTab === tab.id && styles.navLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal animationType="fade" transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalEmoji}>{modalData.type === 'warn' ? '⚠️' : '🚀'}</Text>
            <Text style={styles.modalTitle}>{modalData.title}</Text>
            <Text style={styles.modalDesc}>{modalData.desc}</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalBtnText}>تأكيد</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatItem({ icon, label, value, color }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View style={{ alignItems: 'flex-start' }}>
        <Text style={styles.statLabel}>{label}</Text>
        {value && <Text style={[styles.statValue, { color }]}>{value}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.offWhite },
  header: { backgroundColor: COLORS.navy, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerLeft: { flexDirection: 'row-reverse', alignItems: 'center' },
  logoCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.navyMid, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  logoText: { fontSize: 20 },
  appTitle: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  appSlogan: { color: COLORS.cyan, fontSize: 10, marginTop: 1, textAlign: 'right' },
  btBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: COLORS.navyMid },
  btIcon: { fontSize: 12, color: COLORS.white, fontWeight: 'bold' },
  scrollContent: { paddingBottom: 110, padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.navy, marginBottom: 16, textAlign: 'right' },
  subSectionTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.navy, marginBottom: 10, textAlign: 'right' },
  card: { backgroundColor: COLORS.white, borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardLabel: { fontSize: 13, fontWeight: 'bold', color: COLORS.navy, marginBottom: 14, textAlign: 'right' },
  scoreBoard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 20, marginBottom: 16, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', borderWidth: 2, borderColor: COLORS.navyLight },
  scoreLabel: { fontSize: 12, color: COLORS.textSecond, textAlign: 'right' },
  scoreValue: { fontSize: 22, fontWeight: 'bold', textAlign: 'right', marginTop: 4 },
  scoreRank: { fontSize: 14, fontWeight: 'bold', color: COLORS.purple, backgroundColor: '#f3e8ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  liveGrid: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 16 },
  miniReadout: { width: '48%', backgroundColor: COLORS.white, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  readoutIcon: { fontSize: 28, marginBottom: 8 },
  readoutLabel: { fontSize: 12, color: COLORS.textSecond, marginBottom: 4 },
  readoutValue: { fontSize: 18, fontWeight: 'bold' },
  circleRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  statsCol: { flex: 1, marginRight: 20, alignItems: 'flex-end' },
  progressPct: { fontSize: 32, fontWeight: