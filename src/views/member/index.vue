
<template>
  <div class="member-page">
    <!-- 查询表单 -->
    <el-card class="member-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item label="机构标识，关联 g2rain_basis.organ.id，会员归属租户">
          <el-input v-model="queryForm.organId" placeholder="请输入机构标识，关联 g2rain_basis.organ.id，会员归属租户" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="会员编号，机构内唯一，由系统生成">
          <el-input v-model="queryForm.memberNo" placeholder="请输入会员编号，机构内唯一，由系统生成" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="会员名称">
          <el-input v-model="queryForm.name" placeholder="请输入会员名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="会员头像地址">
          <el-input v-model="queryForm.avatar" placeholder="请输入会员头像地址" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="会员手机号，仅作为资料字段，登录身份以 member_identity 为准">
          <el-input v-model="queryForm.mobile" placeholder="请输入会员手机号，仅作为资料字段，登录身份以 member_identity 为准" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="会员状态">
          <el-input v-model="queryForm.status" placeholder="请输入会员状态" clearable style="width: 200px" />
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
    <div class="member-page__header">
      <div class="member-page__title-group">
        <h2>管理会员表数据</h2>
      </div>
      <el-button type="primary" v-permission="'member:add'" @click="handleCreate">新增会员表</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="120" />
      <el-table-column prop="organId" label="机构标识，关联 g2rain_basis.organ.id，会员归属租户" width="140" />
      <el-table-column prop="memberNo" label="会员编号，机构内唯一，由系统生成" width="180" />
      <el-table-column prop="name" label="会员名称" width="180" />
      <el-table-column prop="avatar" label="会员头像地址" width="180" />
      <el-table-column prop="mobile" label="会员手机号，仅作为资料字段，登录身份以 member_identity 为准" width="180" />
      <el-table-column prop="status" label="会员状态" width="180" />
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" sortable="custom" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" sortable="custom" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '明细') }}</el-button>
          <el-button type="primary" v-permission="'member:edit'" link size="small" @click="handleEdit(row)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
          <el-button type="danger" v-permission="'member:delete'" link size="small" @click="handleDelete(row)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
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
    <div class="member-page__pagination">
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
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑会员表' : '新增会员表'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="机构标识，关联 g2rain_basis.organ.id，会员归属租户" prop="organId">
          <el-input v-model="editForm.organId" placeholder="请输入机构标识，关联 g2rain_basis.organ.id，会员归属租户" />
        </el-form-item>
        <el-form-item label="会员编号，机构内唯一，由系统生成" prop="memberNo">
          <el-input v-model="editForm.memberNo" placeholder="请输入会员编号，机构内唯一，由系统生成" />
        </el-form-item>
        <el-form-item label="会员名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入会员名称" />
        </el-form-item>
        <el-form-item label="会员头像地址" prop="avatar">
          <el-input v-model="editForm.avatar" placeholder="请输入会员头像地址" />
        </el-form-item>
        <el-form-item label="会员手机号，仅作为资料字段，登录身份以 member_identity 为准" prop="mobile">
          <el-input v-model="editForm.mobile" placeholder="请输入会员手机号，仅作为资料字段，登录身份以 member_identity 为准" />
        </el-form-item>
        <el-form-item label="会员状态" prop="status">
          <el-input v-model="editForm.status" placeholder="请输入会员状态" />
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
    <el-dialog v-model="detailDialogVisible" title="会员表明细" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('G2_FIELD_ID', 'ID')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="机构标识，关联 g2rain_basis.organ.id，会员归属租户">{{ currentRow?.organId }}</el-descriptions-item>
        <el-descriptions-item label="会员编号，机构内唯一，由系统生成">{{ currentRow?.memberNo }}</el-descriptions-item>
        <el-descriptions-item label="会员名称">{{ currentRow?.name }}</el-descriptions-item>
        <el-descriptions-item label="会员头像地址">{{ currentRow?.avatar }}</el-descriptions-item>
        <el-descriptions-item label="会员手机号，仅作为资料字段，登录身份以 member_identity 为准">{{ currentRow?.mobile }}</el-descriptions-item>
        <el-descriptions-item label="会员状态">{{ currentRow?.status }}</el-descriptions-item>
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
import { MemberApi } from './api';
import type { Member, MemberPayload, MemberQuery } from './type';
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
  memberNo: '',
  name: '',
  avatar: '',
  mobile: '',
  status: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<Member[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as MemberQuery;

    // 请求分页数据
    const pageData = await MemberApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & MemberQuery);

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
  queryForm.memberNo = '';
  queryForm.name = '';
  queryForm.avatar = '';
  queryForm.mobile = '';
  queryForm.status = '';

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
const currentRow = ref<Member | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细
const handleView = (row: Member) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: Member) => {
  ElMessageBox.confirm(`确认删除会员表「${row.id}」吗？`, t('G2_LBL_TIP', '提示'), {
    type: 'warning',
  })
    .then(async () => {
      try {
        await MemberApi.remove(row.id);
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
  memberNo: '',
  name: '',
  avatar: '',
  mobile: '',
  status: '',
});

// 表单校验规则
const editRules: FormRules = {
  organId: [{ required: true, message: '请输入机构标识，关联 g2rain_basis.organ.id，会员归属租户', trigger: 'blur' }],
  memberNo: [{ required: true, message: '请输入会员编号，机构内唯一，由系统生成', trigger: 'blur' }],
  status: [{ required: true, message: '请输入会员状态[NORMAL:正常, FROZEN:冻结]', trigger: 'blur' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.organId = undefined;
  editForm.memberNo = '';
  editForm.name = '';
  editForm.avatar = '';
  editForm.mobile = '';
  editForm.status = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: Member) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.organId = row.organId;
  editForm.memberNo = row.memberNo;
  editForm.name = row.name;
  editForm.avatar = row.avatar;
  editForm.mobile = row.mobile;
  editForm.status = row.status;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: MemberPayload = {
    organId: editForm.organId,
    memberNo: editForm.memberNo,
    name: editForm.name,
    avatar: editForm.avatar,
    mobile: editForm.mobile,
    status: editForm.status,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await MemberApi.save(payload);
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
.member-page {
  padding: 20px;
  background-color: var(--g2-bg-page);
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.member-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: var(--g2-bg-container);
  border-radius: 4px;
}

.member-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-page__header h2 {
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

.member-page__search {
  margin-bottom: 12px;
  background-color: var(--g2-bg-container);
}

.member-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
