import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// 获取单个设置文件
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const _params = await params
    const id = _params.id
    
    const setting = await prisma.setting.findUnique({
      where: { id },
      include: {
        game: true
      }
    })
    
    if (!setting) {
      return NextResponse.json({ error: '设置文件未找到' }, { status: 404 })
    }
    
    return NextResponse.json(setting)
  } catch (error) {
    console.error('Error fetching setting:', error)
    return NextResponse.json({ error: '获取设置文件详情失败' }, { status: 500 })
  }
}

// 更新设置文件
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const _params = await params
    const id = _params.id
    const body = await request.json()
    const { name, content } = body
    
    const setting = await prisma.setting.update({
      where: { id },
      data: {
        name,
        content
      }
    })
    
    return NextResponse.json(setting)
  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json({ error: '更新设置文件失败' }, { status: 500 })
  }
}

// 删除设置文件
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const _params = await params
    const id = _params.id
    
    await prisma.setting.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting setting:', error)
    return NextResponse.json({ error: '删除设置文件失败' }, { status: 500 })
  }
} 