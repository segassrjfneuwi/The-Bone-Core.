import { registerRootComponent } from 'expo';
import App from './App';

// تسجيل المكون الجذري يضمن تشغيل التطبيق بنجاح سواء على Expo Go أو البناء الأصلي المحاكي (Native Build)
registerRootComponent(App);
