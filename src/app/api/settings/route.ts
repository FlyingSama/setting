import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// 获取所有设置文件
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')
    
    if (!gameId) {
      return NextResponse.json({ error: '需要提供gameId参数' }, { status: 400 })
    }
    
    const settings = await prisma.setting.findMany({
      where: { gameId },
      orderBy: { updatedAt: 'desc' }
    })
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: '获取设置列表失败' }, { status: 500 })
  }
}

// 创建新设置文件
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, content, gameId } = body
    
    if (!name || !gameId) {
      return NextResponse.json({ error: '设置名称和游戏ID不能为空' }, { status: 400 })
    }
    
    const setting = await prisma.setting.create({
      data: {
        name,
        content: content || '',
        gameId
      }
    })
    
    return NextResponse.json(setting, { status: 201 })
  } catch (error) {
    console.error('Error creating setting:', error)
    return NextResponse.json({ error: '创建设置文件失败' }, { status: 500 })
  }
} 