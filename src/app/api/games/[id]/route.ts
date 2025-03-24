import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// 获取单个游戏
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const _params = await params
    const identifier = _params.id
    
    let game = null
    
    // 首先尝试通过ID查找游戏
    if (/^[a-z0-9]+$/i.test(identifier) && identifier.length > 10) {
      game = await prisma.game.findUnique({
        where: { id: identifier },
        include: {
          settingFiles: true,
          tags: true
        }
      })
    }
    
    // 如果通过ID没找到，尝试通过名称查找
    if (!game) {
      // 将URL友好格式的游戏名转换回原始格式（将连字符替换为空格）
      const searchName = identifier.replace(/-/g, ' ')
      
      game = await prisma.game.findFirst({
        where: {
          name: {
            contains: searchName
          }
        },
        include: {
          settingFiles: true,
          tags: true
        }
      })
    }
    
    if (!game) {
      return NextResponse.json({ error: '游戏未找到' }, { status: 404 })
    }
    
    // 更新使用次数
    await prisma.game.update({
      where: { id: game.id },
      data: { usageCount: { increment: 1 } }
    })
    
    return NextResponse.json(game)
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