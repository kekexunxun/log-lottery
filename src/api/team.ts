import request from './request'

export interface TeamMemberQueryParams {
  code: string
}

export interface TeamMember {
  avatar: string
  nickname: string
  realname: string
}

export interface TeamMemberResponse {
  team_name: string
  member_list: TeamMember[]
}

/**
 * 通过抽奖码查询战队成员列表
 */
export const getTeamMemberByLotteryCode = (params: TeamMemberQueryParams) => {
  return request<TeamMemberResponse>({
    url: 'http://chou.ba.com/openapi/team/lottery/member/list',
    method: 'GET',
    params
  })
}
