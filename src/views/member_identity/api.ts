/**
 * 会员身份表相关 API 服务
 * 提供会员身份表数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import type { MemberIdentity, MemberIdentityPayload, MemberIdentityQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

/**
 * 会员身份表 API 服务类
 */
export class MemberIdentityApi {
  /**
   * 获取会员身份表列表
   * @param params 查询参数（可选）
   * @returns 会员身份表列表
   */
  static async list(params?: MemberIdentityQuery): Promise<MemberIdentity[]> {
    const http = getHttpClient('default');
    const res = await http.get<MemberIdentity[]>('/member/member_identity/list', params);
    return res.data || [];
  }

  /**
   * 分页查询会员身份表列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: MemberIdentityQuery & PageSelectListDto): Promise<PageData<MemberIdentity>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<MemberIdentity>>('/member/member_identity/page', params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 会员身份表 ID
   * @returns 会员身份表详情
   */
  static async getById(id: number): Promise<MemberIdentity> {
    const http = getHttpClient('default');
    const res = await http.get<MemberIdentity>(`/member/member_identity/${id}`);
    return res.data;
  }

  /**
   * 保存会员身份表（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 会员身份表数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的会员身份表
   */
  static async save(payload: MemberIdentityPayload): Promise<MemberIdentity> {
    const http = getHttpClient('default');
    const res = await http.post<MemberIdentity>('/member/member_identity/save', payload);
    return res.data;
  }

  /**
   * 删除会员身份表
   * @param id 会员身份表 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/member/member_identity/${id}`);
  }
}

