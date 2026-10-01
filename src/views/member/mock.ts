/**
 * 会员表相关 Mock 数据
 */

import type { AxiosRequestConfig } from 'axios';
import type { Result } from '@g2rain/http';
import { mockManager, type MockDataMap } from '@runtime/http';
import Mock from 'mockjs';

/**
 * 生成符合 Result 格式的响应
 */
function createResult<T>(data: T, status: number = 200): Result<T> {
  // 先使用 Mock.mock 生成元数据，然后直接设置 data，避免 data 被 mock 处理
  const result = Mock.mock({
    requestId: '@guid',
    requestTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    status,
    errorCode: status === 200 ? '' : '@word(5,10)',
    errorMessage: status === 200 ? '' : '@cword(5,15)',
  }) as Result<T>;
  
  // 直接设置 data，不经过 Mock.mock 处理
  result.data = data;
  
  return result;
}

/**
 * 生成符合 Member 类型的 Mock 数据模板
 */
function getMemberTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
        'organId': '@integer(1, 100)',
            'memberNo|1': ['@word(3,10)', '@word(3,10)'],
            'name|1': ['@word(3,10)', null],
            'avatar|1': ['@word(3,10)', null],
            'mobile|1': ['@word(3,10)', null],
            'status|1': ['@word(3,10)', '@word(3,10)'],
        version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 会员表相关的 Mock 数据映射
 */
export const MemberMockDataMap: MockDataMap = {
  // GET /member - 根据条件查询列表
  '/member': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const memberNo = query?.memberNo;
    const name = query?.name;
    const avatar = query?.avatar;
    const mobile = query?.mobile;
    const status = query?.status;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getMemberTemplate({
          id: i + 1,
        }),
      );
      list.push(item);
    }

    let filteredList = list;
    if (organId) {
      filteredList = filteredList.filter((item: any) => {
                return item.organId === organId;
              });
    }
    if (memberNo) {
      filteredList = filteredList.filter((item: any) => {
                return item.memberNo && item.memberNo.includes(memberNo);
              });
    }
    if (name) {
      filteredList = filteredList.filter((item: any) => {
                return item.name && item.name.includes(name);
              });
    }
    if (avatar) {
      filteredList = filteredList.filter((item: any) => {
                return item.avatar && item.avatar.includes(avatar);
              });
    }
    if (mobile) {
      filteredList = filteredList.filter((item: any) => {
                return item.mobile && item.mobile.includes(mobile);
              });
    }
    if (status) {
      filteredList = filteredList.filter((item: any) => {
                return item.status && item.status.includes(status);
              });
    }

    return createResult(filteredList);
  },

  // GET /member/list - 根据条件查询列表（兼容接口）
  '/member/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const memberNo = query?.memberNo;
    const name = query?.name;
    const avatar = query?.avatar;
    const mobile = query?.mobile;
    const status = query?.status;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getMemberTemplate({
          id: i + 1,
        }),
      );
      list.push(item);
    }

    let filteredList = list;
    if (organId) {
      filteredList = filteredList.filter((item: any) => {
                return item.organId === organId;
              });
    }
    if (memberNo) {
      filteredList = filteredList.filter((item: any) => {
                return item.memberNo && item.memberNo.includes(memberNo);
              });
    }
    if (name) {
      filteredList = filteredList.filter((item: any) => {
                return item.name && item.name.includes(name);
              });
    }
    if (avatar) {
      filteredList = filteredList.filter((item: any) => {
                return item.avatar && item.avatar.includes(avatar);
              });
    }
    if (mobile) {
      filteredList = filteredList.filter((item: any) => {
                return item.mobile && item.mobile.includes(mobile);
              });
    }
    if (status) {
      filteredList = filteredList.filter((item: any) => {
                return item.status && item.status.includes(status);
              });
    }

    return createResult(filteredList);
  },

  // GET /member/page - 根据条件分页查询
  '/member/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const organId = query?.query?.organId || query?.organId;
    const memberNo = query?.query?.memberNo || query?.memberNo;
    const name = query?.query?.name || query?.name;
    const avatar = query?.query?.avatar || query?.avatar;
    const mobile = query?.query?.mobile || query?.mobile;
    const status = query?.query?.status || query?.status;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getMemberTemplate()],
    };

    const result = Mock.mock(template);

    // 计算总页数
    const totalPages = Math.ceil(total / pageSize);

    const pageData = {
      pageNum,
      pageSize,
      total,
      totalPages,
      records: result.records,
    };

    return createResult(pageData);
  },

  // POST /member/save - 保存（新增或更新）
  '/member/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;
    
    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);
    
    // 生成完整的会员表数据
    const MemberItem = Mock.mock(
      getMemberTemplate({
        id,
        organId: payload.organId !== undefined ? payload.organId : '@integer(1, 100)',
        memberNo: payload.memberNo !== undefined ? payload.memberNo : '@word(3,10)',
        name: payload.name !== undefined ? payload.name : null,
        avatar: payload.avatar !== undefined ? payload.avatar : null,
        mobile: payload.mobile !== undefined ? payload.mobile : null,
        status: payload.status !== undefined ? payload.status : '@word(3,10)',
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );
    
    return createResult(MemberItem);
  },

  // DELETE /member/:id - 删除
  '/member/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(MemberMockDataMap);

