/**
 * 会员身份表相关 Mock 数据
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
 * 生成符合 MemberIdentity 类型的 Mock 数据模板
 */
function getMemberIdentityTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
        'organId': '@integer(1, 100)',
            'memberId': '@integer(1, 100)',
            'identityType|1': ['@word(3,10)', '@word(3,10)'],
            'identityValue|1': ['@word(3,10)', '@word(3,10)'],
            'verified': '@integer(1, 100)',
            'rawProfile|1': ['@word(3,10)', null],
        version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 会员身份表相关的 Mock 数据映射
 */
export const MemberIdentityMockDataMap: MockDataMap = {
  // GET /member_identity - 根据条件查询列表
  '/member_identity': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const memberId = query?.memberId;
    const identityType = query?.identityType;
    const identityValue = query?.identityValue;
    const verified = query?.verified;
    const rawProfile = query?.rawProfile;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getMemberIdentityTemplate({
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
    if (memberId) {
      filteredList = filteredList.filter((item: any) => {
                return item.memberId === memberId;
              });
    }
    if (identityType) {
      filteredList = filteredList.filter((item: any) => {
                return item.identityType && item.identityType.includes(identityType);
              });
    }
    if (identityValue) {
      filteredList = filteredList.filter((item: any) => {
                return item.identityValue && item.identityValue.includes(identityValue);
              });
    }
    if (verified) {
      filteredList = filteredList.filter((item: any) => {
                return item.verified === verified;
              });
    }
    if (rawProfile) {
      filteredList = filteredList.filter((item: any) => {
                return item.rawProfile && item.rawProfile.includes(rawProfile);
              });
    }

    return createResult(filteredList);
  },

  // GET /member_identity/list - 根据条件查询列表（兼容接口）
  '/member_identity/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const memberId = query?.memberId;
    const identityType = query?.identityType;
    const identityValue = query?.identityValue;
    const verified = query?.verified;
    const rawProfile = query?.rawProfile;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getMemberIdentityTemplate({
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
    if (memberId) {
      filteredList = filteredList.filter((item: any) => {
                return item.memberId === memberId;
              });
    }
    if (identityType) {
      filteredList = filteredList.filter((item: any) => {
                return item.identityType && item.identityType.includes(identityType);
              });
    }
    if (identityValue) {
      filteredList = filteredList.filter((item: any) => {
                return item.identityValue && item.identityValue.includes(identityValue);
              });
    }
    if (verified) {
      filteredList = filteredList.filter((item: any) => {
                return item.verified === verified;
              });
    }
    if (rawProfile) {
      filteredList = filteredList.filter((item: any) => {
                return item.rawProfile && item.rawProfile.includes(rawProfile);
              });
    }

    return createResult(filteredList);
  },

  // GET /member_identity/page - 根据条件分页查询
  '/member_identity/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const organId = query?.query?.organId || query?.organId;
    const memberId = query?.query?.memberId || query?.memberId;
    const identityType = query?.query?.identityType || query?.identityType;
    const identityValue = query?.query?.identityValue || query?.identityValue;
    const verified = query?.query?.verified || query?.verified;
    const rawProfile = query?.query?.rawProfile || query?.rawProfile;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getMemberIdentityTemplate()],
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

  // POST /member_identity/save - 保存（新增或更新）
  '/member_identity/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;
    
    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);
    
    // 生成完整的会员身份表数据
    const MemberIdentityItem = Mock.mock(
      getMemberIdentityTemplate({
        id,
        organId: payload.organId !== undefined ? payload.organId : '@integer(1, 100)',
        memberId: payload.memberId !== undefined ? payload.memberId : '@integer(1, 100)',
        identityType: payload.identityType !== undefined ? payload.identityType : '@word(3,10)',
        identityValue: payload.identityValue !== undefined ? payload.identityValue : '@word(3,10)',
        verified: payload.verified !== undefined ? payload.verified : '@integer(1, 100)',
        rawProfile: payload.rawProfile !== undefined ? payload.rawProfile : null,
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );
    
    return createResult(MemberIdentityItem);
  },

  // DELETE /member_identity/:id - 删除
  '/member_identity/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(MemberIdentityMockDataMap);

