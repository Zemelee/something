import { createApp } from 'vue/dist/vue.esm-bundler';
import SystemSetting from "@/components/system/SystemSetting.vue";
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';


const SystemSettingApp = createApp({
    components: {
        'v-system-setting': SystemSetting
    }
});
SystemSettingApp.use(ElementPlus);
SystemSettingApp.mount("#systemSetting");


