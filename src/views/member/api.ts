/**
 * 会员表相关 API 服务
 * 提供会员表数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import type { Member, MemberPayload, MemberQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

/**
 * 会员表 API 服务类
 */
export class MemberApi {
  /**
   * 获取会员表列表
   * @param params 查询参数（可选）
   * @returns 会员表列表
   */
  static async list(params?: MemberQuery): Promise<Member[]> {
    const http = getHttpClient('default');
    const res = await http.get<Member[]>('/member/member/list', params);
    return res.data || [];
  }

  /**
   * 分页查询会员表列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: MemberQuery & PageSelectListDto): Promise<PageData<Member>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<Member>>('/member/member/page', params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 会员表 ID
   * @returns 会员表详情
   */
  static async getById(id: number): Promise<Member> {
    const http = getHttpClient('default');
    const res = await http.get<Member>(`/member/member/${id}`);
    return res.data;
  }

  /**
   * 保存会员表（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 会员表数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的会员表
   */
  static async save(payload: MemberPayload): Promise<Member> {
    const http = getHttpClient('default');
    const res = await http.post<Member>('/member/member/save', payload);
    return res.data;
  }

  /**
   * 删除会员表
   * @param id 会员表 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/member/member/${id}`);
  }
}

