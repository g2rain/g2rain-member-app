/**
 * 会员身份表相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 会员身份表接口
 */
export interface MemberIdentity extends BaseVo {
  organId: number;
  memberId: number;
  identityType: string;
  identityValue: string;
  verified: number;
  rawProfile: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface MemberIdentityPayload {
  id?: number; // 更新时传入 ID，新增时不传
  organId?: number;
  memberId?: number;
  identityType?: string;
  identityValue?: string;
  verified?: number;
  rawProfile?: string;
}

/**
 * 会员身份表查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface MemberIdentityQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  memberId?: number;
  identityType?: string;
  identityValue?: string;
  verified?: number;
  rawProfile?: string;
}

