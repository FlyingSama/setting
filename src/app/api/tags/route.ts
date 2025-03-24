import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// 获取所有标签
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { games: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    return NextResponse.json(tags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: '获取标签列表失败' }, { status: 500 })
  }
} 