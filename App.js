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
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// ─── ICONS (SVG-based, no external icon library needed) ──────────────────────
const IconBluetooth = ({ size = 22, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Svg.Path
      d="M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5M12 3L12 21M12 3L17.5 8.5L12 14M12 14L6.5 19.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ─── THEME ────────────────────────────────────────────────────────────────────
const COLORS = {
  navy:       '#0f1f4b',
  navyMid:    '#1e3a8a',
  navyLight:  '#2563eb',
  cyan:       '#06b6d4',
  cyanLight:  '#67e8f9',
  white:      '#ffffff',
  offWhite:   '#f0f4ff',
  cardBg:     '#ffffff',
  textPrimary:'#0f172a',
  textSecond: '#64748b',
  green:      '#10b981',
  red:        '#ef4444',
  orange:     '#f97316',
  yellow:     '#eab308',
  border:     '#e2e8f0',
  navBg:      '#ffffff',
  danger:     '#dc2626',
};

// ─── ANIMATED CIRCULAR PROGRESS ──────────────────────────────────────────────
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function CircularProgress({ value = 84, size = 160 }) {
  const animVal = useRef(new Animated.Value(0)).current;
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: value,
      duration: 1800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  const strokeDashoffset = animVal.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.cyan} />
            <Stop offset="100%" stopColor={COLORS.navyLight} />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={cx} cy={cy} r={radius}
          fill="transparent"
          stroke={COLORS.offWhite}
          strokeWidth={10}
        />
        {/* Progress */}
        <AnimatedCircle
          cx={cx} cy={cy} r={radius}
          fill="transparent"
          stroke="url(#arcGrad)"
          strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      {/* Center text */}
      <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.progressPct}>{value}%</Text>
        <Text style={styles.progressLabel}>ممتاز</Text>
      </View>
    </View>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // State
  const [activeTab, setActiveTab]           = useState('home');
  const [isConnected, setIsConnected]       = useState(false);
  const [tensLevel, setTensLevel]           = useState(3);
  const [heatLevel, setHeatLevel]           = useState(38);
  const [selectedMode, setSelectedMode]     = useState('مكتب نشط');
  const [isTherapyRunning, setIsTherapyRunning] = useState(false);
  const [sessionTime, setSessionTime]       = useState(0);
  const [battery, setBattery]               = useState(85);
  const [modalVisible, setModalVisible]     = useState(false);
  const [modalData, setModalData]           = useState({ title: '', desc: '', type: 'success' });

  // Animations
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(30)).current;
  const btAnim     = useRef(new Animated.Value(1)).current;

  // Session timer
  const timerRef = useRef(null);

  useEffect(() => {
    // Page appear animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [activeTab]);

  useEffect(() => {
    if (isTherapyRunning) {
      // Pulse animation loop
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
        ])
      );
      loop.start();
      // Timer
      timerRef.current = setInterval(() => {
        setSessionTime(t => t + 1);
        setBattery(b => Math.max(0, b - 0.01));
      }, 1000);
      return () => {
        loop.stop();
        clearInterval(timerRef.current);
      };
    } else {
      pulseAnim.setValue(1);
      clearInterval(timerRef.current);
      setSessionTime(0);
    }
  }, [isTherapyRunning]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Bluetooth toggle with spin animation
  const toggleBluetooth = () => {
    Animated.sequence([
      Animated.timing(btAnim, { toValue: 0.8, duration: 150, useNativeDriver: true }),
      Animated.timing(btAnim, { toValue: 1,   duration: 150, useNativeDriver: true }),
    ]).start();

    if (!isConnected) {
      setIsConnected(true);
      showModal('تم الاتصال بنجاح! 🦷', 'جهازك متصل بـ Bone Core Pro وهو جاهز للعمل.', 'success');
    } else {
      setIsConnected(false);
      setIsTherapyRunning(false);
      showModal('تم فصل الجهاز', 'تم قطع الاتصال بـ Bone Core Pro.', 'info');
    }
  };

  const handleStartTherapy = () => {
    if (!isConnected) {
      showModal('تنبيه ⚠️', 'الرجاء الاتصال بالجهاز عبر البلوتوث أولاً.', 'warn');
      return;
    }
    if (!isTherapyRunning) {
      setIsTherapyRunning(true);
      showModal('بدء الجلسة الذكية 🚀', `تم تفعيل نبضات TENS على المستوى ${tensLevel} والحرارة ${heatLevel}°C.`, 'success');
    } else {
      setIsTherapyRunning(false);
      showModal('انتهت الجلسة', `مدة الجلسة: ${formatTime(sessionTime)}. أحسنت!`, 'info');
    }
  };

  const showModal = (title, desc, type = 'success') => {
    setModalData({ title, desc, type });
    setModalVisible(true);
  };

  const resetTabAnim = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
  };

  const switchTab = (tab) => {
    resetTabAnim();
    setActiveTab(tab);
  };

  const therapyModes = [
    { id: 'مكتب نشط',       icon: '💼', desc: 'وقاية أثناء الجلوس الطويل' },
    { id: 'استشفاء رياضي',  icon: '🏋️', desc: 'تعافٍ بعد التمرين' },
    { id: 'راحة المفاصل',   icon: '🌿', desc: 'تهدئة للمفاصل والعظام' },
  ];

  const hubSections = [
    {
      emoji: '🌅',
      title: 'الصباح: تشغيل المصنع',
      items: [
        'تعرض لشمس الصباح 15 دقيقة لتصنيع فيتامين D',
        'إفطار: بيضة + طحينة + حليب (بناء العظام)',
        'قاعدة الـ 45 دقيقة: قف وتحرك لتخفيف ضغط الفقرات',
      ],
    },
    {
      emoji: '🏋️',
      title: 'العصر: الضغط الميكانيكي',
      items: [
        'سكوات وضغط وزن الجسم 20 دقيقة (قانون وولف)',
        'قفز خفيف 5 دقائق: يحفز خلايا بناء العظام',
        'شرب 3 لتر ماء يومياً على رشفات',
      ],
    },
    {
      emoji: '💤',
      title: 'الليل: الاستشفاء العميق',
      items: [
        '7-8 ساعات نوم: وقت إفراز هرمون النمو',
        'عشاء: سمك أو دجاج مع مرق العظام أسبوعياً',
        'تجنب المشروبات الغازية: حمض فوسفوريك يسرق الكالسيوم',
      ],
    },
  ];

  // ── HOME TAB ───────────────────────────────────────────────────────────────
  const renderHome = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* Welcome */}
      <View style={styles.welcomeBlock}>
        <Text style={styles.welcomeHi}>مرحباً 👋</Text>
        <Text style={styles.welcomeSub}>جاهز لبناء عظام حديدية اليوم؟</Text>
      </View>

      {/* Status banner */}
      <View style={[styles.statusBanner, isConnected ? styles.bannerConnected : styles.bannerDisconnected]}>
        <View style={[styles.statusDot, { backgroundColor: isConnected ? COLORS.green : COLORS.red }]} />
        <Text style={styles.statusBannerText}>
          {isConnected ? '🦷 متصل بـ Bone Core Pro' : 'الجهاز غير متصل'}
        </Text>
      </View>

      {/* Circular progress card */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>مؤشر الاستقامة اليومي</Text>
        <View style={styles.circleRow}>
          <CircularProgress value={84} size={160} />
          <View style={styles.statsCol}>
            <StatItem icon="🔋" label="البطارية" value={`${Math.round(battery)}%`} color={COLORS.navyLight} />
            <StatItem icon="⏱️" label="جلسات اليوم" value="2" color={COLORS.cyan} />
            <StatItem icon="🌡️" label="آخر حرارة" value={`${heatLevel}°C`} color={COLORS.orange} />
          </View>
        </View>
      </View>

      {/* Quick action */}
      <TouchableOpacity
        style={styles.quickBtn}
        onPress={() => switchTab('control')}
        activeOpacity={0.85}
      >
        <Text style={styles.quickBtnText}>ابدأ جلسة علاجية جديدة ←</Text>
      </TouchableOpacity>

      {/* Tip card */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 نصيحة اليوم</Text>
        <Text style={styles.tipText}>
          قاعدة الـ 45 دقيقة: قف وامشِ دقيقتين كل 45 دقيقة لتخفيف الضغط على
          الغضاريف القطنية وزيادة الدورة الدموية.
        </Text>
      </View>
    </Animated.View>
  );

  // ── SESSIONS TAB ──────────────────────────────────────────────────────────
  const renderSessions = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.sectionTitle}>الجلسات العلاجية</Text>

      {/* Mode selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {therapyModes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[styles.modeChip, selectedMode === mode.id && styles.modeChipActive]}
            onPress={() => setSelectedMode(mode.id)}
          >
            <Text style={styles.modeEmoji}>{mode.icon}</Text>
            <Text style={[styles.modeChipText, selectedMode === mode.id && { color: COLORS.white }]}>
              {mode.id}
            </Text>
            <Text style={[styles.modeDesc, selectedMode === mode.id && { color: '#c7d2fe' }]}>
              {mode.desc}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Control card */}
      <View style={styles.card}>
        {/* TENS Slider */}
        <View style={styles.sliderBlock}>
          <View style={styles.sliderLabelRow}>
            <Text style={styles.sliderTitle}>⚡ نبضات TENS</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>المستوى {tensLevel}</Text>
            </View>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={tensLevel}
            onValueChange={setTensLevel}
            minimumTrackTintColor={COLORS.yellow}
            maximumTrackTintColor={COLORS.border}
            thumbTintColor={COLORS.yellow}
          />
          <View style={styles.sliderRange}>
            <Text style={styles.rangeText}>1 (خفيف)</Text>
            <Text style={styles.rangeText}>10 (قوي)</Text>
          </View>
        </View>

        {/* Heat Slider */}
        <View style={styles.sliderBlock}>
          <View style={styles.sliderLabelRow}>
            <Text style={styles.sliderTitle}>🌡️ الحرارة العلاجية</Text>
            <View style={[styles.badge, { backgroundColor: '#fee2e2' }]}>
              <Text style={[styles.badgeText, { color: COLORS.danger }]}>{heatLevel}°C</Text>
            </View>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={30}
            maximumValue={45}
            step={1}
            value={heatLevel}
            onValueChange={setHeatLevel}
            minimumTrackTintColor={COLORS.orange}
            maximumTrackTintColor={COLORS.border}
            thumbTintColor={COLORS.orange}
          />
          <View style={styles.sliderRange}>
            <Text style={styles.rangeText}>30°C</Text>
            <Text style={styles.rangeText}>45°C</Text>
          </View>
        </View>

        {/* Session timer (shown when running) */}
        {isTherapyRunning && (
          <View style={styles.timerRow}>
            <ActivityIndicator size="small" color={COLORS.navyLight} />
            <Text style={styles.timerText}>جلسة نشطة: {formatTime(sessionTime)}</Text>
          </View>
        )}

        {/* Start button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.primaryBtn, isTherapyRunning && styles.dangerBtn]}
            onPress={handleStartTherapy}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>
              {isTherapyRunning ? '⏹ إيقاف الجلسة' : '▶ ابدأ الجلسة الذكية'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🦴 كيف تعمل تقنية TENS؟</Text>
        <Text style={styles.infoText}>
          تُرسل نبضات كهربائية منخفضة الطاقة عبر الجلد لتحفيز الأعصاب وتخفيف الألم
          وارتخاء العضلات دون أي آثار جانبية.
        </Text>
      </View>
    </Animated.View>
  );

  // ── HUB TAB ───────────────────────────────────────────────────────────────
  const renderHub = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.sectionTitle}>المرجع الشامل للعظام 🦴</Text>

      {hubSections.map((sec, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.hubHeader}>
            <Text style={styles.hubEmoji}>{sec.emoji}</Text>
            <Text style={styles.hubTitle}>{sec.title}</Text>
          </View>
          {sec.items.map((item, j) => (
            <View key={j} style={styles.hubItem}>
              <View style={styles.hubDot} />
              <Text style={styles.hubItemText}>{item}</Text>
            </View>
          ))}
        </View>
      ))}

      {/* Nutrition table */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>🥩 دليل التغذية</Text>
        <View style={styles.nutritionRow}>
          <View style={[styles.nutritionCol, { borderColor: COLORS.green }]}>
            <Text style={styles.nutritionHeader}>✅ أصدقاء العظام</Text>
            {['🥚 بيض + فيتامين K2', '🥦 بروكلي وسبانخ', '🐟 سمك وأوميجا 3', '🌰 لوز وبذور سمسم'].map((item, i) => (
              <Text key={i} style={styles.nutritionItem}>{item}</Text>
            ))}
          </View>
          <View style={[styles.nutritionCol, { borderColor: COLORS.red }]}>
            <Text style={[styles.nutritionHeader, { color: COLORS.red }]}>❌ لصوص الكالسيوم</Text>
            {['🥤 مشروبات غازية', '🍬 سكر أبيض', '🌭 لحوم مصنعة', '🍟 وجبات سريعة'].map((item, i) => (
              <Text key={i} style={styles.nutritionItem}>{item}</Text>
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>🦴</Text>
          </View>
          <View>
            <Text style={styles.appTitle}>The Bone Core</Text>
            <Text style={styles.appSlogan}>ذكاء اصطناعي · استقامة الجسد</Text>
          </View>
        </View>
        <Animated.View style={{ transform: [{ scale: btAnim }] }}>
          <TouchableOpacity
            style={[styles.btBtn, isConnected && styles.btBtnConnected]}
            onPress={toggleBluetooth}
          >
            <Text style={styles.btIcon}>{isConnected ? '📶' : '📵'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* ── CONTENT ── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'home'    && renderHome()}
        {activeTab === 'control' && renderSessions()}
        {activeTab === 'hub'     && renderHub()}
      </ScrollView>

      {/* ── BOTTOM NAV ── */}
      <View style={styles.navBar}>
        {[
          { id: 'home',    label: 'الرئيسية', emoji: '🏠' },
          { id: 'control', label: 'الجلسات',  emoji: '⚡' },
          { id: 'hub',     label: 'المرجع',   emoji: '📚' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.navItem}
            onPress={() => switchTab(tab.id)}
            activeOpacity={0.75}
          >
            <Text style={[styles.navEmoji, activeTab === tab.id && styles.navEmojiActive]}>
              {tab.emoji}
            </Text>
            <Text style={[styles.navLabel, activeTab === tab.id && styles.navLabelActive]}>
              {tab.label}
            </Text>
            {activeTab === tab.id && <View style={styles.navIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── MODAL ── */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalEmoji}>
              {modalData.type === 'success' ? '✅' : modalData.type === 'warn' ? '⚠️' : 'ℹ️'}
            </Text>
            <Text style={styles.modalTitle}>{modalData.title}</Text>
            <Text style={styles.modalDesc}>{modalData.desc}</Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>حسناً</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── STAT ITEM HELPER ─────────────────────────────────────────────────────────
function StatItem({ icon, label, value, color }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View style={{ alignItems: 'flex-start' }}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  header: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadi
