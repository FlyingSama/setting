import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// 获取所有游戏
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get('search')
    const tagFilter = searchParams.get('tag')
    
    let whereClause = {}
    
    if (searchQuery) {
      whereClause = {
        ...whereClause,
        name: {
          contains: searchQuery
        }
      }
    }
    
    if (tagFilter) {
      whereClause = {
        ...whereClause,
        tags: {
          some: {
            name: tagFilter
          }
        }
      }
    }
    
    const games = await prisma.game.findMany({
      where: whereClause,
      include: {
        settingFiles: true,
        tags: true
      },
      orderBy: {
        usageCount: 'desc'
      }
    })
    
    return NextResponse.json(games)
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json({ error: '获取游戏列表失败' }, { status: 500 })
  }
}

// 创建新游戏
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, iconUrl, tags = [] } = body
    
    if (!name) {
      return NextResponse.json({ error: '游戏名称不能为空' }, { status: 400 })
    }
    
    // 处理标签
    const tagData = tags.map((tag: string) => ({
      where: { name: tag },
      create: { name: tag }
    }))
    
    const game = await prisma.game.create({
      data: {
        name,
        iconUrl,
        tags: {
          connectOrCreate: tagData
        }
      },
      include: {
        tags: true
      }
    })
    
    return NextResponse.json(game, { status: 201 })
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json({ error: '创建游戏失败' }, { status: 500 })
  }
} 