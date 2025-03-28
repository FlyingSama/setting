import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// 一小时的缓存时间（秒）
const CACHE_MAX_AGE = 3600

// 获取单个游戏
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 在Next.js 15.2.3中，params是异步的，需要先await
    const _params = await params
    const id = _params.id
    
    // 只通过ID查找游戏
    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        settingFiles: true,
        tags: true
      }
    })
    
    if (!game) {
      return NextResponse.json({ error: '游戏未找到' }, { status: 404 })
    }
    
    // 异步更新使用次数，但不等待完成
    prisma.game.update({
      where: { id },
      data: { usageCount: { increment: 1 } }
    }).catch(err => console.error('Error updating usage count:', err))
    
    // 设置响应头，支持缓存
    const response = NextResponse.json(game)
    response.headers.set('Cache-Control', `max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate`)
    return response
  } catch (error) {
    console.error('Error fetching game:', error)
    return NextResponse.json({ error: '获取游戏详情失败' }, { status: 500 })
  }
}

// 更新游戏
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 在Next.js 15.2.3中，params是异步的，需要先await
    const _params = await params
    const id = _params.id
    const body = await request.json()
    const { name, iconUrl, tags = [] } = body
    
    // 处理标签
    const tagData = tags.map((tag: string) => ({
      where: { name: tag },
      create: { name: tag }
    }))
    
    // 先断开所有标签连接
    await prisma.game.update({
      where: { id },
      data: {
        tags: {
          set: []
        }
      }
    })
    
    // 再更新游戏和重新连接标签
    const game = await prisma.game.update({
      where: { id },
      data: {
        name,
        iconUrl,
        tags: {
          connectOrCreate: tagData
        }
      },
      include: {
        tags: true,
        settingFiles: true
      }
    })
    
    return NextResponse.json(game)
  } catch (error) {
    console.error('Error updating game:', error)
    return NextResponse.json({ error: '更新游戏详情失败' }, { status: 500 })
  }
}

// 删除游戏
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 在Next.js 15.2.3中，params是异步的，需要先await
    const _params = await params
    const id = _params.id
    
    await prisma.game.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting game:', error)
    return NextResponse.json({ error: '删除游戏失败' }, { status: 500 })
  }
} 