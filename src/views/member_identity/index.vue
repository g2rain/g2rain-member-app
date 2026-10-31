
<template>
  <div class="member_identity-page">
    <!-- 查询表单 -->
    <el-card class="member_identity-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item :label="$t('G2_FIELD_ORGAN', '所属机构')">
          <OrganSelect v-model="queryForm.organId" :api-method="OrganApi.searchOrgans" :placeholder="$t('G2_PH_ORGAN', '请选择所属机构')" width="200px" />
        </el-form-item>
        <el-form-item :label="$t('MEM_IDENTITY_FIELD_MEMBER_ID', '会员ID')">
          <el-input v-model="queryForm.memberId" :placeholder="$t('MEM_IDENTITY_PH_MEMBER_ID', '请输入会员ID')" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item :label="$t('MEM_IDENTITY_FIELD_IDENTITY_TYPE', '身份类型')">
          <DictSelect v-model="queryForm.identityType" usage-code="MEMBER_IDENTITY_TYPE" :api-method="DictItemApi.select" :placeholder="$t('MEM_IDENTITY_PH_IDENTITY_TYPE', '请选择身份类型')" />
        </el-form-item>
        <el-form-item :label="$t('MEM_IDENTITY_FIELD_IDENTITY_VALUE', '身份值')">
          <el-input v-model="queryForm.identityValue" :placeholder="$t('MEM_IDENTITY_PH_IDENTITY_VALUE', '请输入身份值')" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item :label="$t('MEM_IDENTITY_FIELD_VERIFIED', '验证状态')">
          <DictSelect v-model="queryForm.verified" usage-code="BOOLEAN_FLAG" :api-method="DictItemApi.select" :placeholder="$t('MEM_IDENTITY_PH_VERIFIED', '请选择验证状态')" />
        </el-form-item>

        <!-- 操作按钮 -->
        <template #actions>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t('G2_BTN_QUERY', '查询') }}</el-button>
            <el-button @click="handleReset">{{ $t('G2_BTN_RESET', '重置') }}</el-button>
          </el-form-item>
        </template>
      </QueryForm>
    </el-card>

    <!-- 标题和操作按钮 -->
    <div class="member_identity-page__header">
      <div class="member_identity-page__title-group">
        <h2>{{ $t('MEM_IDENTITY_TITLE', '会员身份') }}</h2>
      </div>
      <el-button type="primary" v-permission="'member_identity:add'" @click="handleCreate">{{ $t('MEM_IDENTITY_BTN_ADD', '新增会员身份') }}</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="120" />
      <el-table-column :label="$t('G2_FIELD_ORGAN', '所属机构')" width="140">
        <template #default="{ row }">
          {{ row.organName || row.organId }}
        </template>
      </el-table-column>
      <el-table-column prop="memberId" :label="$t('MEM_IDENTITY_FIELD_MEMBER_ID', '会员ID')" width="140" />
      <el-table-column prop="identityType" :label="$t('MEM_IDENTITY_FIELD_IDENTITY_TYPE', '身份类型')" width="140">
        <template #default="{ row }">
          <DictText :value="row.identityType" usage-code="MEMBER_IDENTITY_TYPE" :api-method="DictItemApi.select" />
        </template>
      </el-table-column>
      <el-table-column prop="identityValue" :label="$t('MEM_IDENTITY_FIELD_IDENTITY_VALUE', '身份值')" width="180" />
      <el-table-column prop="verified" :label="$t('MEM_IDENTITY_FIELD_VERIFIED', '验证状态')" width="160">
        <template #default="{ row }">
          <DictText :value="row.verified" usage-code="BOOLEAN_FLAG" :api-method="DictItemApi.select" />
        </template>
      </el-table-column>
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" sortable="custom" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" sortable="custom" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '明细') }}</el-button>
          <el-button type="primary" v-permission="'member_identity:edit'" link size="small" @click="handleEdit(row)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
          <el-button type="danger" v-permission="'member_identity:delete'" link size="small" @click="handleDelete(row)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
        </template>
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>{{ $t('G2_FIELD_ACTION', '操作') }}</span>
            <SortManagerButton />
          </div>
        </template>
      </el-table-column>
    </SortableTable>

    <!-- 分页组件 -->
    <div class="member_identity-page__pagination">
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="isEdit ? $t('MEM_IDENTITY_DLG_EDIT', '编辑会员身份') : $t('MEM_IDENTITY_DLG_ADD', '新增会员身份')" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="160px">
        <el-form-item :label="$t('G2_FIELD_ORGAN', '所属机构')" prop="organId">
          <OrganSelect v-model="editForm.organId" :api-method="OrganApi.searchOrgans" :placeholder="$t('G2_PH_ORGAN', '请选择所属机构')" width="100%" />
        </el-form-item>
        <el-form-item :label="$t('MEM_IDENTITY_FIELD_MEMBER_ID', '会员ID')" prop="memberId">
          <el-input v-model="editForm.memberId" :placeholder="$t('MEM_IDENTITY_PH_MEMBER_ID', '请输入会员ID')" />
        </el-form-item>
        <el-form-item :label="$t('MEM_IDENTITY_FIELD_IDENTITY_TYPE', '身份类型')" prop="identityType">
          <DictSelect v-model="editForm.identityType" usage-code="MEMBER_IDENTITY_TYPE" :api-method="DictItemApi.select" :placeholder="$t('MEM_IDENTITY_PH_IDENTITY_TYPE', '请选择身份类型')" />
        </el-form-item>
        <el-form-item :label="$t('MEM_IDENTITY_FIELD_IDENTITY_VALUE', '身份值')" prop="identityValue">
          <el-input v-model="editForm.identityValue" :placeholder="$t('MEM_IDENTITY_PH_IDENTITY_VALUE', '请输入身份值')" />
        </el-form-item>
        <el-form-item :label="$t('MEM_IDENTITY_FIELD_VERIFIED', '验证状态')" prop="verified">
          <DictSelect v-model="editForm.verified" usage-code="BOOLEAN_FLAG" :api-method="DictItemApi.select" :placeholder="$t('MEM_IDENTITY_PH_VERIFIED', '请选择验证状态')" />
        </el-form-item>
        <el-form-item :label="$t('MEM_IDENTITY_FIELD_RAW_PROFILE', '原始资料')" prop="rawProfile">
          <el-input v-model="editForm.rawProfile" type="textarea" :rows="4" :placeholder="$t('MEM_IDENTITY_PH_RAW_PROFILE', '请输入原始资料')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
          <el-button type="primary" @click="submitEdit">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 明细弹窗 -->
    <el-dialog v-model="detailDialogVisible" :title="$t('MEM_IDENTITY_DLG_DETAIL', '会员身份明细')" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('G2_FIELD_ID', 'ID')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_ORGAN', '所属机构')">{{ currentRow?.organName || currentRow?.organId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MEM_IDENTITY_FIELD_MEMBER_ID', '会员ID')">{{ currentRow?.memberId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MEM_IDENTITY_FIELD_IDENTITY_TYPE', '身份类型')">
          <DictText :value="currentRow?.identityType" usage-code="MEMBER_IDENTITY_TYPE" :api-method="DictItemApi.select" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('MEM_IDENTITY_FIELD_IDENTITY_VALUE', '身份值')">{{ currentRow?.identityValue }}</el-descriptions-item>
        <el-descriptions-item :label="$t('MEM_IDENTITY_FIELD_VERIFIED', '验证状态')">
          <DictText :value="currentRow?.verified" usage-code="BOOLEAN_FLAG" :api-method="DictItemApi.select" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('MEM_IDENTITY_FIELD_RAW_PROFILE', '原始资料')">{{ currentRow?.rawProfile }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_CREATE_TIME', '创建时间')">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')">{{ currentRow?.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="detailDialogVisible = false">{{ $t('G2_BTN_CLOSE', '关闭') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { t } from '@platform/i18n';
import { MemberIdentityApi } from './api';
import { OrganApi } from '../organ/api';
import { DictItemApi } from '../dict/api';
import type { MemberIdentity, MemberIdentityPayload, MemberIdentityQuery } from './type';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';

import { SortableTable, TableColumn, SortManagerButton, QueryForm } from '@g2rain/ui';
import { OrganSelect, DictSelect, DictText } from '@g2rain/ui/platform';


// 组件引用
const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);

// 基础查询表单（BaseSelectListDto）；用 ref 以匹配 QueryForm defineModel
const baseQueryForm = ref<BaseSelectListDto>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});

// 业务查询状态
const queryForm = reactive({
  organId: undefined as number | undefined,
  memberId: undefined as number | undefined,
  identityType: undefined as string | undefined,
  identityValue: '',
  verified: undefined as string | undefined,
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<MemberIdentity[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const merged = { ...baseQueryForm.value, ...queryForm } as Record<string, unknown>;
    if (merged.verified !== undefined && merged.verified !== null && merged.verified !== '') {
      merged.verified = Number(merged.verified);
    }
    const query = Object.fromEntries(
      Object.entries(merged).filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as MemberIdentityQuery;

    // 请求分页数据
    const pageData = await MemberIdentityApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & MemberIdentityQuery);

    // 设置响应结果
    tableData.value = pageData.records;
    pagination.total = pageData.total;
  } catch {
    // 请求失败已由 http 层统一提示
  }
};

// 处理排序变化
const handleSortChange = (params: Record<string, string>) => {
  // 更新 QueryForm 的 sorts 字段
  queryFormRef.value?.updateSorts(params);
};

// 查询
const handleSearch = () => {
  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 重置查询条件
const handleReset = () => {
  // 重置基础查询表单
  baseQueryForm.value.id = undefined;
  baseQueryForm.value.createTime = undefined;
  baseQueryForm.value.updateTime = undefined;
  // 重置业务特定查询表单
  queryForm.organId = undefined;
  queryForm.memberId = undefined;
  queryForm.identityType = undefined;
  queryForm.identityValue = '';
  queryForm.verified = undefined;

  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 页码变化
const handlePageChange = (page: number) => {
  pagination.pageNum = page;
  loadData();
};

// 当前记录引用
const currentRow = ref<MemberIdentity | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细
const handleView = (row: MemberIdentity) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: MemberIdentity) => {
  ElMessageBox.confirm(
    t('MEM_IDENTITY_DEL_CONFIRM', { id: row.id }, '确认删除会员身份「{id}」吗？'),
    t('G2_LBL_TIP', '提示'),
    {
    type: 'warning',
  })
    .then(async () => {
      await MemberIdentityApi.remove(row.id);
      // 如果当前页只有一条数据，删除后应该跳转到上一页
      if (tableData.value.length === 1 && pagination.pageNum > 1) {
        pagination.pageNum--;
      }
      await loadData();
      ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
    })
    .catch(() => {});
};

// 保存弹窗引用
const editDialogVisible = ref(false);

// 修改标记状态
const isEdit = ref(false);

// 修改组件引用
const editFormRef = ref<FormInstance | null>(null);

// 保存表单状态
const editForm = reactive({
  id: undefined as number | undefined,
  organId: undefined as number | undefined,
  memberId: undefined as number | undefined,
  identityType: undefined as string | undefined,
  identityValue: '',
  verified: undefined as string | undefined,
  rawProfile: '',
});

// 表单校验规则
const editRules = computed<FormRules>(() => ({
  organId: [{ required: true, message: t('G2_PH_ORGAN', '请选择所属机构'), trigger: 'change' }],
  memberId: [{ required: true, message: t('MEM_IDENTITY_PH_MEMBER_ID', '请输入会员ID'), trigger: 'blur' }],
  identityType: [{ required: true, message: t('MEM_IDENTITY_PH_IDENTITY_TYPE', '请选择身份类型'), trigger: 'change' }],
  identityValue: [{ required: true, message: t('MEM_IDENTITY_PH_IDENTITY_VALUE', '请输入身份值'), trigger: 'blur' }],
  verified: [{ required: true, message: t('MEM_IDENTITY_PH_VERIFIED', '请选择验证状态'), trigger: 'change' }],
}));

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.organId = undefined;
  editForm.memberId = undefined;
  editForm.identityType = undefined;
  editForm.identityValue = '';
  editForm.verified = undefined;
  editForm.rawProfile = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: MemberIdentity) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.organId = row.organId;
  editForm.memberId = row.memberId;
  editForm.identityType = row.identityType;
  editForm.identityValue = row.identityValue;
  editForm.verified = row.verified === undefined || row.verified === null ? undefined : String(row.verified);
  editForm.rawProfile = row.rawProfile;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: MemberIdentityPayload = {
    organId: editForm.organId,
    memberId: editForm.memberId,
    identityType: editForm.identityType,
    identityValue: editForm.identityValue,
    verified: editForm.verified === undefined || editForm.verified === '' ? undefined : Number(editForm.verified),
    rawProfile: editForm.rawProfile,
  };

  // 编辑模式下，将 id 添加到 payload 中
  if (isEdit.value) {
    payload.id = editForm.id;
  }
  await MemberIdentityApi.save(payload);
  ElMessage.success(isEdit.value ? t('G2_MSG_UPDATE_OK', '更新成功') : t('G2_MSG_ADD_OK', '新增成功'));
  await loadData();
  editDialogVisible.value = false;
};

// 挂载回调
onMounted(() => {
  // 查询列表
  loadData();
});
</script>

<style scoped>
.member_identity-page {
  padding: 20px;
  background-color: var(--g2-bg-page);
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.member_identity-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: var(--g2-bg-container);
  border-radius: 4px;
}

.member_identity-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member_identity-page__header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.member_identity-page__search {
  margin-bottom: 12px;
  background-color: var(--g2-bg-container);
}

.member_identity-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
