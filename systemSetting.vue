<template>
    <div v-loading="loading">
        <el-form>
            <el-form-item>
                <el-button type="primary" @click="addSettings">
                    添加
                </el-button>
            </el-form-item>
        </el-form>
        <el-table :data="settings" border style="width: 100%">
            <el-table-column prop="id" label="id" width="50" header-align="center" align="right" />
            <el-table-column prop="config_name" label="配置项" width="180" header-align="center" align="left" />
            <el-table-column prop="config_value" label="配置值" show-overflow-tooltip width="680" header-align="center"
                align="left" />
            <el-table-column prop="note" label="备注" header-align="center" align="left">
                <template #default="scope">
                    {{ scope.row.note || '无' }}
                </template>
            </el-table-column>
            <el-table-column prop="create_time" width="180" label="创建时间" header-align="center" align="center" />
            <el-table-column prop="update_time" width="180" label="更新时间" header-align="center" align="center" />
            <el-table-column label="操作" width="150" header-align="center" align="center">
                <template #default="scope">
                    <el-button type="primary" @click="edit(scope.row)">
                        编辑
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog v-model="editDialog" title="编辑" :style="{ minWidth: '400px', maxWidth: '700px' }" draggable>
            <el-form label-width="auto" ref="editFormRef" :model="form" :rules="rules">
                <el-form-item label="id">
                    <el-input v-model="form.id" disabled />
                </el-form-item>
                <el-form-item label="配置名" prop="config_name" required>
                    <el-input v-model="form.config_name" />
                </el-form-item>
                <el-form-item label="配置值" prop="config_value" required>
                    <!-- 对象数组时渲染 -->
                    <template v-if="isArrayAndObject">
                        <div style="width: 100%;">
                            <div v-for="(item, index) in form.config_value" :key="index" style="margin: 10px;">
                                <span style="margin: 10px 20px 10px 10px">第{{ index + 1 }}项</span>
                                <el-button size="small" type="danger" @click="removeItem(index)">删除</el-button>
                                <div v-for="(value, key) in item" :key="key">
                                    <el-form-item :label="key" :inline="false">
                                        <el-input type="textarea" autosize v-model="form.config_value[index][key]"
                                            placeholder="请输入内容" style="width: 90%; margin: 5px;"></el-input>
                                    </el-form-item>
                                </div>
                            </div>
                        </div>
                        <el-button type="primary" @click="addItem(form.config_value[0])"
                            style="display: block; margin-top: 20px;">新增</el-button>
                    </template>
                    <!-- 非数组 -->
                    <template v-else>
                        <el-input v-model="form.config_value" type="textarea" autosize placeholder="请输入配置值"
                            style="width: 100%;"></el-input>
                    </template>
                </el-form-item>
                <el-form-item label="备注" prop="note">
                    <el-input v-model="form.note" />
                </el-form-item>
                <el-form-item label="创建时间">
                    <el-input v-model="form.create_time" disabled />
                </el-form-item>
                <el-form-item label="更新时间">
                    <el-input v-model="form.update_time" disabled />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitEdit">
                        提交
                    </el-button>

                </el-form-item>
            </el-form>

        </el-dialog>


        <el-dialog v-model="addDialog" title="添加" :style="{ minWidth: '400px', maxWidth: '700px' }" draggable>
            <el-form ref="addFormRef" :model="form" label-width="80px" :rules="rules" :size="formSize">
                <el-form-item label="配置名" prop="config_name" required>
                    <el-input v-model="form.config_name" />
                </el-form-item>
                <el-form-item label="配置值" prop="config_value" required>
                    <el-input v-model="form.config_value" type="textarea" autosize />
                </el-form-item>
                <el-form-item label="备注" prop="note">
                    <el-input v-model="form.note" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitAdd">
                        提交
                    </el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script lang="js" setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { getSetting, editSetting, addSetting } from '@/api/systemSetting'
import { ElMessage } from 'element-plus';

const editDialog = ref(false) // 编辑弹窗
const addDialog = ref(false) // 添加弹窗
const loading = ref(true)
const addFormRef = ref(null) // 添加表单
const editFormRef = ref(null)// 编辑表单

const form = reactive({
    config_name: '',
    note: '',
    config_value: [],
    id: '',
    create_time: '',
    update_time: ''
})
const isArrayAndObject = computed(() => {
    return Array.isArray(form.config_value) && typeof form.config_value[0] === 'object';
});

const addItem = (obj) => {
    let keys = Object.keys(obj);
    let newItem = {};
    keys.forEach(k => {
        newItem[k] = '';
    })
    form.config_value.push(newItem);
};

const removeItem = (index) => {
    if (Array.isArray(form.config_value)) {
        form.config_value.splice(index, 1);
    }
};

const rules = reactive({
    config_name: [
        { required: true, message: '配置名为必填项', trigger: 'blur' },
    ],
    config_value: [
        { required: true, message: '配置值为必填项', trigger: 'blur' },
    ],
})
const settings = ref([]) // 系统设置

const getSettings = () => {
    return new Promise((resolve, reject) => {
        getSetting().then(res => {
            resolve(res.data.data)
        }).catch(err => {
            reject(err)
        })
    })
}

onMounted(async () => {
    try {
        settings.value = await getSettings();
    } catch {
        ElMessage.error("获取错误")
    } finally {
        loading.value = false;
    }
})


const addSettings = () => {
    //将form的每一项置空
    Object.keys(form).forEach(key => {
        form[key] = ''
    })
    addDialog.value = true
}

// 编辑配置
const edit = (row) => {
    editDialog.value = true
    Object.assign(form, row)
    // 检查 config_value 的类型
    try {
        if (typeof form.config_value === 'string') {
            const parsedValue = JSON.parse(form.config_value);
            console.log(typeof parsedValue);
            if (Array.isArray(parsedValue)) {
                form.config_value = parsedValue;
            }
        }
    } catch (error) {
        console.error('config_value 非数组类型');
    }
}
const submitEdit = async () => {
    if (!editFormRef.value) return
    try {
        await editFormRef.value.validate();
    } catch (error) {
        throw new Error('表单验证不通过');
    }
    editDialog.value = false
    loading.value = true
    try {
        const res = await editSetting({
            id: form.id,
            config_name: form.config_name,
            config_value: form.config_value,
            note: form.note
        })
        if (res.data.code === 0) {
            settings.value = await getSettings()
            ElMessage.success('修改成功')
        } else if (res.data.code === 1) {
            ElMessage.error(res.data.msg)
        }
    } catch {
        ElMessage.error('修改失败')
    } finally {
        loading.value = false
    }
}
const submitAdd = async () => {
    if (!addFormRef.value) return
    try {
        await addFormRef.value.validate();
    } catch (error) {
        throw new Error('表单验证不通过');
    }
    loading.value = true
    addDialog.value = false
    try {
        const res = await addSetting({
            id: form.id,
            config_name: form.config_name,
            config_value: form.config_value,
            note: form.note
        })
        if (res.data.code === 0) {
            settings.value = await getSettings()
            editDialog.value = false
            ElMessage.success('添加成功')
        } else if (res.data.code === 1) {
            ElMessage.error(res.data.msg)
        }
    } catch {
        ElMessage.error('添加失败')
    } finally {
        loading.value = false
    }
}
</script>
