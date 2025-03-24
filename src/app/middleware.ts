import { NextRequest, NextResponse } from 'next/server'

// 现在不需要中间件，因为API路由已经支持通过名称查询
// 而页面组件会自动处理URL规范化
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: []
} 