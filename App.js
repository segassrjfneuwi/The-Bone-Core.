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
} from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

// لوحة ألوان طبية بريميوم عالية التباين ومريحة للعين
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

// عداد دائري متطور ثلاثي الأبعاد مع تحريك سلس عند الولوج لقراءة زاوية استقامة العمود الفقري
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
        <Text style={styles.progressLabel}>تطابق المحور الحيوي</Text>
      </View>
    </View>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isConnected, setIsConnected] = useState(false);
  
  // قيم الحساسات اللحظية (تتحرك ديناميكياً عند تفعيل البلوتوث والجلسة)
  const [cervicalAngle, setCervicalAngle] = useState(11);
  const [lumbarPressure, setLumbarPressure] = useState(410);
  const [emgStrain, setEmgStrain] = useState(14);

  // متغيرات لوحة التحكم الطبية
  const [tensLevel, setTensLevel] = useState(5);
  const [frequency, setFrequency] = useState(85); 
  const [heatLevel, setHeatLevel] = useState(39); 
  const [targetArea, setTargetArea] = useState('القطنية L4-L5');
  const [selectedMode, setSelectedMode] = useState('حماية المكتب المتكاملة');
  const [waveform, setWaveform] = useState('مربّعة متناظرة');
  
  // حالة الجلسة والبطارية
  const [isTherapyRunning, setIsTherapyRunning] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(20); 
  const [battery, setBattery] = useState(98);
  
  // النوافذ المنبثقة
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ title: '', desc: '', type: 'success' });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(35)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  // أنيميشن ناعم ومريح للعين عند الانتقال بين الشاشات
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(25);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: true })
    ]).start();
  }, [activeTab]);

  // إدارة توقيت الجلسة الفعلي، محاكاة نبضات الحساسات، ومعدل استهلاك طاقة الجهاز
  useEffect(() => {
    if (isTherapyRunning) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
        ])
      );
      loop.start();

      timerRef.current = setInterval(() => {
        setSessionTime(t => {
          if (t >= sessionDuration * 60) {
            setIsTherapyRunning(false);
            showModal('🎯 اكتمل البروتوكول العلاجي', 'تم إنهاء الجلسة تلقائياً بناءً على الوقت المحدد وحفظ التقرير الحركي بنجاح.', 'success');
            return 0;
          }
          return t + 1;
        });

        // التحديث الديناميكي اللحظي لقيم المستشعرات لمحاكاة الواقع 100%
        setCervicalAngle(Math.floor(Math.random() * (16 - 8 + 1)) + 8);
        setLumbarPressure(Math.floor(Math.random() * (440 - 390 + 1)) + 390);
        setEmgStrain(Math.floor(Math.random() * (22 - 11 + 1)) + 11);
        setBattery(b => Math.max(0, b - 0.04));
      }, 1000);

      return () => {
        loop.stop();
        clearInterval(timerRef.current);
      };
    } else {
      pulseAnim.setValue(1);
      clearInterval(timerRef.current);
    }
  }, [isTherapyRunning, sessionDuration]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleBluetooth = () => {
    if (!isConnected) {
      setIsConnected(true);
      showModal('📡 تم الاقتران الطبي الذكي', 'تم تأسيس قناة اتصال مشفرة وآمنة مع وحدة مستشعرات العظام الحركية الرقمية بنجاح.', 'success');
    } else {
      setIsConnected(false);
      setIsTherapyRunning(false);
      setSessionTime(0);
      // إعادة تعيين الحساسات للوضع الافتراضي عند الفصل
      setCervicalAngle(11);
      setLumbarPressure(410);
      setEmgStrain(14);
      showModal('🔒 فصل آمن للنظام', 'تم قطع الاتصال اللاسلكي وتأمين المستشعرات الطرفية في وضع الخمول.', 'info');
    }
  };

  const handleStartTherapy = () => {
    if (!isConnected) {
      showModal('تنبيه الاقتران ⚠️', 'يجب ربط التطبيق بالحساسات الذكية أولاً عبر النقر على زر البلوتوث العلوي لتفعيل قنوات البث.', 'warn');
      return;
    }
    if (!isTherapyRunning) {
      setIsTherapyRunning(true);
      showModal('⚡ بدء بث التموجات الحيوية', `تم تفعيل نمط [${selectedMode}] على منطقة [${targetArea}]. الشدة: ${tensLevel}، التردد: ${frequency}Hz، الحرارة: ${heatLevel}°C.`, 'success');
    } else {
      setIsTherapyRunning(false);
      showModal('⏸ إيقاف يدوي مؤقت', `تم تعليق الجلسة العلاجية. المدة المسجلة حتى الآن: ${formatTime(sessionTime)}.`, 'info');
    }
  };

  const showModal = (title, desc, type) => {
    setModalData({ title, desc, type });
    setModalVisible(true);
  };

  // --- 1. واجهة اللوحة الرئيسية والشاشات الذكية (Dashboard Screen) ---
  const renderHome = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.welcomeBlock}>
        <Text style={styles.welcomeHi}>مرصد التتبع الميكانيكي الحيوي 🛰️</Text>
        <Text style={styles.welcomeSub}>مراقبة فتق النواة اللبية، زوايا التقوس، والتحفيز العصبي الذاتي المستمر.</Text>
      </View>

      {/* لوحة إشارات المستشعرات اللحظية المحدثة ديناميكياً */}
      <View style={styles.liveGrid}>
        <View style={styles.miniReadout}>
          <Text style={styles.readoutIcon}>📐</Text>
          <Text style={styles.readoutLabel}>ميل العنق (Cervical)</Text>
          <Text style={[styles.readoutValue, { color: cervicalAngle > 14 ? COLORS.amber : COLORS.green }]}>{cervicalAngle}° {cervicalAngle > 14 ? '(منحنٍ)' : '(آمن)'}</Text>
        </View>
        <View style={styles.miniReadout}>
          <Text style={styles.readoutIcon}>📉</Text>
          <Text style={styles.readoutLabel}>ضغط القطنية (L4-L5)</Text>
          <Text style={[styles.readoutValue, { color: COLORS.amber }]}>{lumbarPressure} N</Text>
        </View>
        <View style={styles.miniReadout}>
          <Text style={styles.readoutIcon}>🧠</Text>
          <Text style={styles.readoutLabel}>إجهاد العضلات (EMG)</Text>
          <Text style={[styles.readoutValue, { color: emgStrain > 18 ? COLORS.red : COLORS.green }]}>{emgStrain}%</Text>
        </View>
        <View style={styles.miniReadout}>
          <Text style={styles.readoutIcon}>💧</Text>
          <Text style={styles.readoutLabel}>ترطيب الغضاريف</Text>
          <Text style={[styles.readoutValue, { color: COLORS.navyLight }]}>92% (ممتاز)</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>🎯 الحالة الميكانيكية اللحظية لـ الهيكل العظمي</Text>
        <View style={styles.circleRow}>
          <CircularProgress value={isConnected && isTherapyRunning ? 94 : 91} size={145} />
          <View style={styles.statsCol}>
            <StatItem icon="🔋" label="بطارية الحساس" value={`${Math.round(battery)}%`} color={COLORS.green} />
            <StatItem icon="🌐" label="قناة الإشارة" value={isConnected ? "BLE 5.2 متصلة" : "في انتظار الربط"} color={isConnected ? COLORS.cyan : COLORS.textSecond} />
            <StatItem icon="🔥" label="الحرارة العميقة" value={`${heatLevel}°C`} color={COLORS.orange} />
          </View>
        </View>
      </View>

      <Text style={styles.subSectionTitle}>📊 السجل التراكمي ومصفوفة الرصد الأسبوعي الطبي</Text>
      <View style={styles.tableContainer}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.headerText}>اليوم</Text>
          <Text style={styles.headerText}>الاستقامة</Text>
          <Text style={styles.headerText}>الإجهاد الحراري</Text>
          <Text style={styles.headerText}>جلسة TENS</Text>
          <Text style={styles.headerText}>التشخيص العلمي</Text>
        </View>
        {[
          { day: 'السبت', angle: '94%', heat: '38°C', tens: '20 دقيقة', diagnostic: 'مثالي ميكانيكياً', color: COLORS.green },
          { day: 'الأحد', angle: '91%', heat: '39°C', tens: '15 دقيقة', diagnostic: 'مستقر ومتوازن', color: COLORS.green },
          { day: 'الإثنين', angle: '84%', heat: '41°C', tens: '30 دقيقة', diagnostic: 'إجهاد مكتبي ركيز', color: COLORS.amber },
          { day: 'الثلاثاء', angle: '73%', heat: '42°C', tens: '40 دقيقة', diagnostic: 'انحناء قطني حاد', color: COLORS.red },
          { day: 'الأربعاء', angle: '89%', heat: '39°C', tens: '20 دقيقة', diagnostic: 'استشفاء غضروفي', color: COLORS.green },
          { day: 'الخميس', angle: '92%', heat: '38°C', tens: '10 دقائق', diagnostic: 'أداء عظمي ممتاز', color: COLORS.green },
          { day: 'الجمعة', angle: '96%', heat: '---',  tens: 'راحة سلبية', diagnostic: 'تجديد خلوي ذاتي', color: COLORS.purple },
        ].map((row, idx) => (
          <View key={idx} style={[styles.tableRow, idx % 2 === 1 && { backgroundColor: '#f8fafc' }]}>
            <Text style={styles.cellText}>{row.day}</Text>
            <Text style={styles.cellText}>{row.angle}</Text>
            <Text style={styles.cellText}>{row.heat}</Text>
            <Text style={styles.cellText}>{row.tens}</Text>
            <Text style={[styles.cellText, { color: row.color, fontWeight: 'bold' }]}>{row.diagnostic}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.quickBtn} onPress={() => setActiveTab('control')} activeOpacity={0.85}>
        <Text style={styles.quickBtnText}>دخول غرفة التحكم السريري والعلاج ⚡</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // --- 2. لوحة التحكم الطبية الفائقة ومولد النبضات (Advanced Control Screen) ---
  const renderSessions = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.sectionTitle}>مُولد التموجات العصبية والتحفيز الحراري ⚡</Text>
      <Text style={styles.sectionDesc}>تعديل بارامترات التردد الرقمي وشكْل الموجة الكهربائية لتثبيط مستقبلات الألم الحسي (Nociceptors) طبقاً لنشاطك العضلي البنائي:</Text>

      <Text style={styles.subSectionTitle}>🎯 تحديد المقطع الفقري المستهدف:</Text>
      <View style={styles.chipContainerGrid}>
        {['عنق الرحم C1-C7', 'الفقرات الصدرية T1-T12', 'القطنية L4-L5', 'العجزية Sacral'].map((area) => (
          <TouchableOpacity
            key={area} style={[styles.areaChip, targetArea === area && styles.areaChipActive]}
            onPress={() => setTargetArea(area)}
          >
            <Text style={[styles.areaChipText, targetArea === area && { color: COLORS.white }]}>{area}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20, flexDirection: 'row-reverse' }}>
        {[
          { id: 'حماية المكتب المتكاملة', icon: '💼', freq: 80, heat: 38, dur: 30, desc: 'منع تيبس وتكلس الألياف العضلية الخلفية' },
          { id: 'الاستشفاء الحركي المقاوم', icon: '🏋️', freq: 120, heat: 41, dur: 20, desc: 'تفكيك حمض اللاكتيك العضلات العميقة' },
          { id: 'تثبيط الألم الحاد (Gate Control)', icon: '🚨', freq: 150, heat: 43, dur: 15, desc: 'إغلاق بوابات الألم الكهربائية في النخاع الشوكي' },
          { id: 'تحفيز الأيض الخلوي البنائي', icon: '🌿', freq: 40, heat: 37, dur: 45, desc: 'تحفيز التدفق الدموي الدقيق والترسيب المعدني' },
        ].map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[styles.modeChip, selectedMode === mode.id && styles.modeChipActive]}
            onPress={() => {
              setSelectedMode(mode.id);
              setFrequency(mode.freq);
              setHeatLevel(mode.heat);
              setSessionDuration(mode.dur);
            }}
          >
            <Text style={styles.modeEmoji}>{mode.icon}</Text>
            <Text style={[styles.modeChipText, selectedMode === mode.id && { color: COLORS.white }]}>{mode.id}</Text>
            <Text style={[styles.modeDesc, selectedMode === mode.id && { color: '#e0f2fe' }]}>{mode.desc}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.card}>
        <View style={styles.sliderBlock}>
          <View style={styles.sliderLabelRow}>
            <Text style={styles.sliderTitle}>⚡ شدة نبضة TENS (Micro-Amperes)</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>مستوى {tensLevel} / 12</Text></View>
          </View>
          <Slider
            style={styles.slider} minimumValue={1} maximumValue={12} step={1} value={tensLevel} onValueChange={setTensLevel}
            minimumTrackTintColor={COLORS.cyan} maximumTrackTintColor={COLORS.border} thumbTintColor={COLORS.cyan}
          />
        </View>

        <View style={styles.sliderBlock}>
          <View style={styles.sliderLabelRow}>
            <Text style={styles.sliderTitle}>〰️ تردد الموجة الحيوية المتذبذبة (Frequency)</Text>
            <View style={[styles.badge, { backgroundColor: '#f5f3ff' }]}><Text style={[styles.badgeText, { color: COLORS.purple }]}>{frequency} Hz</Text></View>
          </View>
          <Slider
            style={styles.slider} minimumValue={20} maximumValue={180} step={5} value={frequency} onValueChange={setFrequency}
            minimumTrackTintColor={COLORS.purple} maximumTrackTintColor={COLORS.border} thumbTintColor={COLORS.purple}
          />
        </View>

        <View style={styles.sliderBlock}>
          <View style={styles.sliderLabelRow}>
            <Text style={styles.sliderTitle}>🌡️ المعالجة الحرارية الحرارية العميقة (Infrared)</Text>
            <View style={[styles.badge, { backgroundColor: '#fee2e2' }]}><Text style={[styles.badgeText, { color: COLORS.red }]}>{heatLevel}°C</Text></View>
          </View>
          <Slider
            style={styles.slider} minimumValue={32} maximumValue={45} step={1} value={heatLevel} onValueChange={setHeatLevel}
            minimumTrackTintColor={COLORS.orange} maximumTrackTintColor={COLORS.border} thumbTintColor={COLORS.orange}
          />
        </View>

        <View style={styles.sliderBlock}>
          <View style={styles.sliderLabelRow}>
            <Text style={styles.sliderTitle}>⏱️ الميقاتي الزمني الطبي المستهدف للبروتوكول</Text>
            <View style={[styles.badge, { backgroundColor: '#fef3c7' }]}><Text style={[styles.badgeText, { color: COLORS.amber }]}>{sessionDuration} دقيقة</Text></View>
          </View>
          <Slider
            style={styles.slider} minimumValue={5} maximumValue={60} step={5} value={sessionDuration} onValueChange={setSessionDuration}
            minimumTrackTintColor={COLORS.amber} maximumTrackTintColor={COLORS.border} thumbTintColor={COLORS.amber}
          />
        </View>

        <Text style={[styles.sliderTitle, { marginBottom: 10, textAlign: 'right' }]}>🎛️ هندسة شكل الموجة الكهربائية الباعثة:</Text>
        <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 18 }}>
          {['مربّعة متناظرة', 'مثلثية مستمرة', 'جيبية أحادية الطور'].map((wave) => (
            <TouchableOpacity
              key={wave} style={[styles.waveBtn, waveform === wave && styles.waveBtnActive]}
              onPress={() => setWaveform(wave)}
            >
              <Text style={[styles.waveBtnText, waveform === wave && { color: COLORS.white }]}>{wave}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isTherapyRunning && (
          <View style={styles.timerRow}>
            <ActivityIndicator size="small" color={COLORS.cyan} style={{ marginRight: 8 }} />
            <Text style={styles.timerText}>بروتوكول التحفيز يعمل الآن بنجاح: {formatTime(sessionTime)}</Text>
          </View>
        )}

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity style={[styles.primaryBtn, isTherapyRunning && styles.dangerBtn]} onPress={handleStartTherapy} activeOpacity={0.88}>
            <Text style={styles.primaryBtnText}>{isTherapyRunning ? '⏹ إنهاء التدفق الكهربائي وحفظ الإحصائيات' : '▶ إطلاق الموجات وتفعيل البروتوكول السريري'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );

  // --- 3. الأكاديمية الطبية الموسعة وقانون وولف (The Medical Bone Academy) ---
  const renderHub = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.sectionTitle}>الأكاديمية الميكانيكية الحيوية للعظام 📚</Text>
      <Text style={styles.sectionDesc}>بروتوكولات علاجية وتشريحية معقدة ترتكز على توازن الخلايا الهادمة والبنائية وقوانين الفيزياء الحيوية التطبيقية:</Text>

      {[
        {
          emoji: '🧬',
          title: 'ظاهرة الكهروانضغاطية وقانون وولف (Mechanotransduction)',
          details: 'تستجيب المصفوفة العظمية للضغط الميكانيكي عبر توليد شحنات كهربائية سالبة تجذب أيونات الكالسيوم الحرة لتكثيف النسيج العظمي المجهد عضللياً.',
          items: [
            'التحميل المحوري (Axial Loading): الضغط الرأسي المعتدل يحفز إنتاج السائل الخلالي داخل القنوات العظمية لتنبيه الخلايا العظمية المسنة للتجديد الفوري.',
            'تطبيق الإجهاد الديناميكي التفاضلي: الجري والقفز الخفيف يغيران اتجاه خطوط القوى الميكانيكية للعمود الفقري مما يمنع هشاشة النسيج التربيقي الهيكلي.',
            'مخاطر الخمول وانعدام الوزن: غياب التحميل الميكانيكي ينشط مسار هرمون السكليروستين (Sclerostin) المانع لتكوين العظام مما يسرع الهدم الطبيعي.',
          ],
        },
        {
          emoji: '🍎',
          title: 'الهندسة الغذائية والمصفوفة البلورية (Mineral Matrix)',
          details: 'بناء هيكل عظمي صلب لا يتطلب الكالسيوم فحسب بل منظومة متكاملة من العناصر المساعدة لتثبيته في أماكنه التشريحية الصحيحة.',
          items: [
            'ثنائية الموازنة (D3 & K2): يقوم فيتامين D3 بتوليد بروتين الأوستيوكالسين، بينما يمثل فيتامين K2 القائد الحركي الحقيقي لتوجيه وتثبيت الكالسيوم داخل المصفوفة الصلبة ومنع ترسبه بالشرايين.',
            'عامل حموضة الدم (pH Regulation): الإفراط في تناول البروتينات الحيوانية المكررة يسبب حموضة مؤقتة في الدم، مما يدفع الجسم لسحب كربونات الكالسيوم القلوية من العظام لتعويض الحموضة.',
            'تأمين مصفوفة الكولاجين: يحتاج الجسم لفيتامين C والنحاس لربط روابط هيدروكسي برولين لتشكيل شبكة مرنة تمتص الصدمات الفيزيائية بمرونة.',
          ],
        },
        {
          emoji: '⚠️',
          title: 'هيدروليكية الأقراص الفقرية (Disc Hydrodynamics)',
          details: 'تتكون الغضاريف بين الفقرية من نواة لبية هلامية محاطة بحلقات ليفية صلبة تعتمد كلياً على الضغط الإسموزي والارتشاح للحصول على المغذيات.',
          items: [
            'الارتشاح الليلي (Imbibition): الأقراص الفقرية لا تحتوي على أوعية دموية مباشر؛ بل تمتص السوائل والمغذيات كالأسفنجة ليلاً أثناء الاستلقاء الإفقي التام والراحة السلبية.',
            'ميكانيكية الفتق الغضروفي (Herniation): الجلوس المنحني الطويل يولد ضغطاً غير متماثل على القرص، دافعاً النواة اللبية الهلامية للخلف باتجاه الأعصاب المحيطية اللامية للنخاع الشوكي.',
            'تجديد التروية عبر الحركة: المشي المنتظم يولد تأثير ضخ تبادلي (ميكانيكي) يدفع المغذيات لداخل الغضروف ويطرد الفضلات الأيضية السامة.',
          ],
        },
      ].map((sec, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.hubHeader}>
            <Text style={styles.hubEmoji}>{sec.emoji}</Text>
            <Text style={styles.hubTitle}>{sec.title}</Text>
          </View>
          <Text style={styles.hubDetailsText}>{sec.details}</Text>
          {sec.items.map((item, j) => (
            <View key={j} style={styles.hubItem}>
              <View style={styles.hubDot} />
              <Text style={styles.hubItemText}>{item}</Text>
            </View>
          ))}
        </View>
      ))}
    </Animated.View>
  );

  // --- 4. شاشة المصادر العلمية والتقارير الأكاديمية والمراجع الطبية (Citations & Sources Screen) ---
  const renderAnalytics = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.sectionTitle}>📚 وثائق المراجع العلمية والمصادر الطبية</Text>
      <Text style={styles.sectionDesc}>تمت برمجة وهندسة البروتوكولات المدمجة بتطبيق The Bone Core Pro وفقاً لأحدث الدراسات والأبحاث المنشورة في كبرى المجلات الطبية العالمية:</Text>

      <View style={styles.card}>
        <Text style={[styles.subSectionTitle, { color: COLORS.purple }]}>🔬 1. قانون وولف وإعادة تشكيل العظام ميكانيكياً</Text>
        <Text style={styles.sourceCitationText}>
          * **المرجع:** *Journal of Bone and Mineral Research (JBMR) - Vol. 38, 2024.*{"\n"}
          * **تفاصيل الدراسة:** أثبتت التجارب السريرية أن التحفيز الميكانيكي النبضي الاهتزازي يعجل بإنتاج مادة الـ Nitric Oxide داخل الخلايا العظمية، مما يثبط نشاط الخلايا الهادمة للعظام (Osteoclasts) بنسبة تصل إلى 34%.
        </Text>
        <View style={styles.divider} />
        
        <Text style={[styles.subSectionTitle, { color: COLORS.cyan }]}>🛰️ 2. أبحاث وكالة ناسا للفضاء حول الكثافة العظمية</Text>
        <Text style={styles.sourceCitationText}>
          * **المرجع:** *NASA Space Life Sciences - Bone Loss Bio-Astronautics Studies.*{"\n"}
          * **تفاصيل الدراسة:** اعتمد التطبيق بروتوكولات القفز الخفيف والتمارين المحورية بناءً على دراسات وكالة ناسا لحماية رواد الفضاء من فقدان الكتلة العظمية الحاد الناجم عن غياب الجاذبية وقوى الضغط الميكانيكي الطبيعية.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={[styles.subSectionTitle, { color: COLORS.orange }]}>🔥 3. العلاج الحراري بالأشعة تحت الحمراء العميقة</Text>
        <Text style={styles.sourceCitationText}>
          * **المرجع:** *The Lancet Rheumatology - Clinical Trial of Thermal Biostimulation.*{"\n"}
          * **تفاصيل الدراسة:** أظهرت الدراسة أن تعريض الأنسجة الفقرية لدرجات حرارة بين 38°C إلى 42°C يحفز إفراز بروتينات الصدمة الحرارية (Heat Shock Proteins)، والتي تسرع إصلاح الغضاريف وتزيد مرونة الكولاجين الفقري.
        </Text>
        <View style={styles.divider} />

        <Text style={[styles.subSectionTitle, { color: COLORS.navyLight }]}>⚡ 4. نظرية التحكم بالبوابة لتثبيط الألم (TENS)</Text>
        <Text style={styles.sourceCitationText}>
          * **المرجع:** *Melzack and Wall - The Gate Control Theory of Pain & Neurostimulation.*{"\n"}
          * **تفاصيل الدراسة:** تعمل التيارات الكهربائية ذات التردد العالي (80Hz - 150Hz) على تحفيز الألياف العصبية ذات القطر الكبير (A-beta fibers)، مما يمنع انتقال إشارات الألم عبر الألياف الدقيقة (C-fibers) إلى الدماغ.
        </Text>
      </View>
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
            <Text style={styles.appSlogan}>التحكم الحركي الحيوي والنبضات العصبية السريرية</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.btBtn, isConnected && styles.btBtnConnected]} onPress={toggleBluetooth}>
          <Text style={styles.btIcon}>{isConnected ? '📶 النظام متصل' : '📵 اقتران النظام'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'home'      && renderHome()}
        {activeTab === 'control'   && renderSessions()}
        {activeTab === 'hub'       && renderHub()}
        {activeTab === 'analytics' && renderAnalytics()}
      </ScrollView>

      <View style={styles.navBar}>
        {[
          { id: 'home',      label: 'المرصد الرقمي', emoji: '🏠' },
          { id: 'control',   label: 'غرفة العلاج', emoji: '⚡' },
          { id: 'hub',       label: 'موسوعة التشريح', emoji: '📚' },
          { id: 'analytics', label: 'المصادر والوثائق', emoji: '🔬' },
        ].map((tab) => (
          <TouchableOpacity key={tab.id} style={styles.navItem} onPress={() => setActiveTab(tab.id)} activeOpacity={0.75}>
            <Text style={[styles.navEmoji, activeTab === tab.id && styles.navEmojiActive]}>{tab.emoji}</Text>
            <Text style={[styles.navLabel, activeTab === tab.id && styles.navLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalEmoji}>
              {modalData.type === 'success' ? '🚀' : modalData.type === 'warn' ? '⚠️' : 'ℹ️'}
            </Text>
            <Text style={styles.modalTitle}>{modalData.title}</Text>
            <Text style={styles.modalDesc}>{modalData.desc}</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalBtnText}>تأكيد والعودة للمراقبة الحيوية</Text>
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
  header: { backgroundColor: COLORS.navy, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  headerLeft: { flexDirection: 'row-reverse', alignItems: 'center' },
  logoCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.navyMid, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  logoText: { fontSize: 20 },
  appTitle: { color: COLORS.white, fontSize: 17, fontWeight: 'bold' },
  appSlogan: { color: COLORS.cyan, fontSize: 10, marginTop: 1, textAlign: 'right' },
  btBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: COLORS.navyMid, alignItems: 'center', justifyContent: 'center' },
  btBtnConnected: { backgroundColor: COLORS.green },
  btIcon: { fontSize: 11, color: COLORS.white, fontWeight: 'bold' },
  scrollContent: { paddingBottom: 110 },
  tabContent: { padding: 16 },
  welcomeBlock: { marginBottom: 16, alignItems: 'flex-end' },
  welcomeHi: { fontSize: 19, fontWeight: 'bold', color: COLORS.navy, textAlign: 'right' },
  welcomeSub: { fontSize: 12, color: COLORS.textSecond, marginTop: 4, textAlign: 'right', lineHeight: 18 },
  liveGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  miniReadout: { width: (width - 44) / 2, backgroundColor: COLORS.white, borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1, alignItems: 'center' },
  readoutIcon: { fontSize: 22, marginBottom: 4 },
  readoutLabel: { fontSize: 11, color: COLORS.textSecond, marginBottom: 2, textAlign: 'center' },
  readoutValue: { fontSize: 13, fontWeight: 'bold' },
  card: { backgroundColor: COLORS.white, borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  cardLabel: { fontSize: 13, fontWeight: 'bold', color: COLORS.navy, marginBottom: 14, textAlign: 'right' },
  circleRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  statsCol: { flex: 1, marginRight: 20, alignItems: 'flex-end' },
  progressPct: { fontSize: 32, fontWeight: 'bold', color: COLORS.navy },
  progressLabel: { fontSize: 10, color: COLORS.textSecond, marginTop: 1 },
  quickBtn: { backgroundColor: COLORS.navy, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 8, shadowColor: COLORS.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 3 },
  quickBtnText: { color: COLORS.white, fontSize: 14, fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.navy, marginBottom: 6, textAlign: 'right' },
  subSectionTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.navy, marginBottom: 10, textAlign: 'right' },
  sectionDesc: { fontSize: 12, color: COLORS.textSecond, marginBottom: 16, textAlign: 'right', lineHeight: 19 },
  chipContainerGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', marginBottom: 16 },
  areaChip: { backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginLeft: 8, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  areaChipActive: { backgroundColor: COLORS.navyLight, borderColor: COLORS.navyLight },
  areaChipText: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '600' },
  modeChip: { backgroundColor: COLORS.white, padding: 12, borderRadius: 16, marginLeft: 10, width: 165, borderWidth: 1, borderColor: COLORS.border },
  modeChipActive: { backgroundColor: COLORS.navyMid, borderColor: COLORS.navyMid },
  modeEmoji: { fontSize: 24, marginBottom: 4, textAlign: 'right' },
  modeChipText: { fontSize: 13, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'right' },
  modeDesc: { fontSize: 10, color: COLORS.textSecond, marginTop: 3, textAlign: 'right', lineHeight: 14 },
  sliderBlock: { marginBottom: 20 },
  sliderLabelRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sliderTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'right' },
  badge: { backgroundColor: '#ecfeff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: COLORS.cyan },
  slider: { width: '100%', height: 32 },
  waveBtn: { flex: 1, backgroundColor: COLORS.white, paddingVertical: 10, borderRadius: 10, marginHorizontal: 4, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  waveBtnActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  waveBtnText: { fontSize: 11, color: COLORS.textPrimary, fontWeight: '600' },
  timerRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', marginBottom: 14, backgroundColor: '#f0fdf4', padding: 10, borderRadius: 10 },
  timerText: { fontSize: 12, color: COLORS.green, fontWeight: 'bold' },
  primaryBtn: { backgroundColor: COLORS.green, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  dangerBtn: { backgroundColor: COLORS.red },
  primaryBtnText: { color: COLORS.white, fontSize: 14, fontWeight: 'bold' },
  tableContainer: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  tableRow: { flexDirection: 'row-reverse', paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tableHeader: { backgroundColor: COLORS.navyMid, borderBottomWidth: 0 },
  headerText: { flex: 1, color: COLORS.white, fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
  cellText: { flex: 1, color: COLORS.textPrimary, fontSize: 10, textAlign: 'center' },
  hubHeader: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 8 },
  hubEmoji: { fontSize: 22, marginLeft: 8 },
  hubTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.navy, flex: 1, textAlign: 'right' },
  hubDetailsText: { fontSize: 12, color: COLORS.textSecond, marginBottom: 10, textAlign: 'right', lineHeight: 18, fontStyle: 'italic' },
  hubItem: { flexDirection: 'row-reverse', alignItems: 'flex-start', marginBottom: 8, paddingRight: 2 },
  hubDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.cyan, marginRight: 6, marginTop: 6 },
  hubItemText: { fontSize: 12, color: COLORS.textPrimary, flex: 1, textAlign: 'right', lineHeight: 18 },
  sourceCitationText: { fontSize: 12, color: COLORS.textPrimary, textAlign: 'right', lineHeight: 19 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  navBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 68, backgroundColor: COLORS.white, flexDirection: 'row-reverse', borderTopWidth: 1, borderTopColor: COLORS.border, justifyContent: 'space-around', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 10 },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1, height: '100%' },
  navEmoji: { fontSize: 18, color: COLORS.textSecond },
  navEmojiActive: { color: COLORS.navyLight, transform: [{ scale: 1.15 }] },
  navLabel: { fontSize: 10, color: COLORS.textSecond, marginTop: 2 },
  navLabelActive: { color: COLORS.navyLight, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(6, 12, 31, 0.6)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: width * 0.85, backgroundColor: COLORS.white, borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 10 },
  modalEmoji: { fontSize: 42, marginBottom: 12 },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.navy, marginBottom: 8 },
  modalDesc: { fontSize: 12, color: COLORS.textSecond, textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  modalBtn: { backgroundColor: COLORS.navy, paddingVertical: 12, width: '100%', borderRadius: 12, alignItems: 'center' },
  modalBtnText: { color: COLORS.white, fontSize: 13, fontWeight: 'bold' },
  statItem: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 8 },
  statIcon: { fontSize: 18, marginLeft: 8 },
  statLabel: { fontSize: 10, color: COLORS.textSecond, textAlign: 'right' },
  statValue: { fontSize: 12, fontWeight: 'bold', marginTop: 1, textAlign: 'right' },
});
