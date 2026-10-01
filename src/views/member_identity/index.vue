
<template>
  <div class="member_identity-page">
    <!-- 查询表单 -->
    <el-card class="member_identity-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item label="机构标识，关联 g2rain_basis.organ.id，身份归属租户">
          <el-input v-model="queryForm.organId" placeholder="请输入机构标识，关联 g2rain_basis.organ.id，身份归属租户" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="会员标识，关联 member.id">
          <el-input v-model="queryForm.memberId" placeholder="请输入会员标识，关联 member.id" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="身份类型">
          <el-input v-model="queryForm.identityType" placeholder="请输入身份类型" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="身份值；企业微信为 external_userid，手机号为标准化后的手机号">
          <el-input v-model="queryForm.identityValue" placeholder="请输入身份值；企业微信为 external_userid，手机号为标准化后的手机号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="验证ID">
          <el-input v-model="queryForm.verified" placeholder="请输入验证ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="外部身份原始资料，JSON 格式">
          <el-input v-model="queryForm.rawProfile" placeholder="请输入外部身份原始资料，JSON 格式" clearable style="width: 200px" />
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
        <h2>管理会员身份表数据</h2>
      </div>
      <el-button type="primary" v-permission="'member_identity:add'" @click="handleCreate">新增会员身份表</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="120" />
      <el-table-column prop="organId" label="机构标识，关联 g2rain_basis.organ.id，身份归属租户" width="140" />
      <el-table-column prop="memberId" label="会员标识，关联 member.id" width="140" />
      <el-table-column prop="identityType" label="身份类型" width="180" />
      <el-table-column prop="identityValue" label="身份值；企业微信为 external_userid，手机号为标准化后的手机号" width="180" />
      <el-table-column prop="verified" label="验证ID" width="140" />
      <el-table-column prop="rawProfile" label="外部身份原始资料，JSON 格式" width="180" />
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
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑会员身份表' : '新增会员身份表'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="机构标识，关联 g2rain_basis.organ.id，身份归属租户" prop="organId">
          <el-input v-model="editForm.organId" placeholder="请输入机构标识，关联 g2rain_basis.organ.id，身份归属租户" />
        </el-form-item>
        <el-form-item label="会员标识，关联 member.id" prop="memberId">
          <el-input v-model="editForm.memberId" placeholder="请输入会员标识，关联 member.id" />
        </el-form-item>
        <el-form-item label="身份类型" prop="identityType">
          <el-input v-model="editForm.identityType" placeholder="请输入身份类型" />
        </el-form-item>
        <el-form-item label="身份值；企业微信为 external_userid，手机号为标准化后的手机号" prop="identityValue">
          <el-input v-model="editForm.identityValue" placeholder="请输入身份值；企业微信为 external_userid，手机号为标准化后的手机号" />
        </el-form-item>
        <el-form-item label="验证ID" prop="verified">
          <el-input v-model="editForm.verified" placeholder="请输入验证ID" />
        </el-form-item>
        <el-form-item label="外部身份原始资料，JSON 格式" prop="rawProfile">
          <el-input v-model="editForm.rawProfile" placeholder="请输入外部身份原始资料，JSON 格式" />
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
    <el-dialog v-model="detailDialogVisible" title="会员身份表明细" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('G2_FIELD_ID', 'ID')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="机构标识，关联 g2rain_basis.organ.id，身份归属租户">{{ currentRow?.organId }}</el-descriptions-item>
        <el-descriptions-item label="会员标识，关联 member.id">{{ currentRow?.memberId }}</el-descriptions-item>
        <el-descriptions-item label="身份类型">{{ currentRow?.identityType }}</el-descriptions-item>
        <el-descriptions-item label="身份值；企业微信为 external_userid，手机号为标准化后的手机号">{{ currentRow?.identityValue }}</el-descriptions-item>
        <el-descriptions-item label="验证ID">{{ currentRow?.verified }}</el-descriptions-item>
        <el-descriptions-item label="外部身份原始资料，JSON 格式">{{ currentRow?.rawProfile }}</el-descriptions-item>
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
import { ref, reactive, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { t } from '@platform/i18n';
import { MemberIdentityApi } from './api';
import type { MemberIdentity, MemberIdentityPayload, MemberIdentityQuery } from './type';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';

import { SortableTable, TableColumn, SortManagerButton, QueryForm } from '@g2rain/ui';
import { showErrorMessage } from '@/components';


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
  organId: undefined,
  memberId: undefined,
  identityType: '',
  identityValue: '',
  verified: undefined,
  rawProfile: '',
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
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
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
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载列表失败');
    showErrorMessage(msg);
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
  baseQueryForm.value.sorts = undefined;
  // 重置业务特定查询表单
  queryForm.organId = undefined;
  queryForm.memberId = undefined;
  queryForm.identityType = '';
  queryForm.identityValue = '';
  queryForm.verified = undefined;
  queryForm.rawProfile = '';

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
  ElMessageBox.confirm(`确认删除会员身份表「${row.id}」吗？`, t('G2_LBL_TIP', '提示'), {
    type: 'warning',
  })
    .then(async () => {
      try {
        await MemberIdentityApi.remove(row.id);
        // 如果当前页只有一条数据，删除后应该跳转到上一页
        if (tableData.value.length === 1 && pagination.pageNum > 1) {
          pagination.pageNum--;
        }
        await loadData();
        ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : t('G2_MSG_DELETE_FAIL', '删除失败');
        showErrorMessage(msg);
      }
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
  identityType: '',
  identityValue: '',
  verified: undefined as number | undefined,
  rawProfile: '',
});

// 表单校验规则
const editRules: FormRules = {
  organId: [{ required: true, message: '请输入机构标识，关联 g2rain_basis.organ.id，身份归属租户', trigger: 'blur' }],
  memberId: [{ required: true, message: '请输入会员标识，关联 member.id', trigger: 'blur' }],
  identityType: [{ required: true, message: '请输入身份类型[WECHAT_WORK:企业微信, MOBILE:手机号]', trigger: 'blur' }],
  identityValue: [{ required: true, message: '请输入身份值；企业微信为 external_userid，手机号为标准化后的手机号', trigger: 'blur' }],
  verified: [{ required: true, message: '请输入验证标识[0:未验证, 1:已验证]', trigger: 'blur' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.organId = undefined;
  editForm.memberId = undefined;
  editForm.identityType = '';
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
  editForm.verified = row.verified;
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
    verified: editForm.verified,
    rawProfile: editForm.rawProfile,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await MemberIdentityApi.save(payload);
    ElMessage.success(isEdit.value ? t('G2_MSG_UPDATE_OK', '更新成功') : t('G2_MSG_ADD_OK', '新增成功'));
    await loadData();
    editDialogVisible.value = false;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败');
    showErrorMessage(msg);
  }
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
