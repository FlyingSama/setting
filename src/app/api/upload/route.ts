import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { IncomingForm } from 'formidable'
import { mkdir } from 'fs/promises'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('fileType') as string || 'image'

    if (!file) {
      return NextResponse.json({ error: '没有上传文件' }, { status: 400 })
    }

    // 检查文件类型
    if (fileType === 'image') {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        return NextResponse.json({ error: '不支持的文件类型，仅支持JPEG、PNG、GIF和WEBP' }, { status: 400 })
      }

      // 限制文件大小为2MB
      const maxSize = 2 * 1024 * 1024
      if (file.size > maxSize) {
        return NextResponse.json({ error: '文件大小超过限制，最大2MB' }, { status: 400 })
      }

      try {
        // 确保uploads目录存在
        const uploadsDir = path.join(process.cwd(), 'public/uploads')
        await mkdir(uploadsDir, { recursive: true })

        // 生成唯一文件名
        const fileExtension = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`
        const filePath = path.join(uploadsDir, fileName)

        // 保存文件
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await fs.writeFile(filePath, buffer)

        // 返回可访问的URL路径
        const fileUrl = `/uploads/${fileName}`
        return NextResponse.json({ url: fileUrl })
      } catch (error) {
        console.error('文件保存失败:', error)
        return NextResponse.json({ error: '文件上传失败' }, { status: 500 })
      }
    } else if (fileType === 'config') {
      // 配置文件处理
      const validExtensions = ['.cfg', '.vcfg', '.txt', '.ini', '.conf', '.config', '.json']
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`
      
      if (!validExtensions.includes(fileExtension)) {
        return NextResponse.json({ 
          error: '不支持的配置文件类型，仅支持cfg、vcfg、txt、ini、conf、config、json等格式' 
        }, { status: 400 })
      }
      
      // 限制文件大小为1MB
      const maxSize = 1 * 1024 * 1024
      if (file.size > maxSize) {
        return NextResponse.json({ error: '文件大小超过限制，最大1MB' }, { status: 400 })
      }
      
      try {
        // 读取文件内容
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const content = buffer.toString('utf-8')
        
        // 返回文件内容
        return NextResponse.json({ content, fileName: file.name })
      } catch (error) {
        console.error('配置文件读取失败:', error)
        return NextResponse.json({ error: '配置文件读取失败' }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: '不支持的文件类型' }, { status: 400 })
    }
  } catch (error) {
    console.error('处理上传请求失败:', error)
    return NextResponse.json({ error: '处理上传请求失败' }, { status: 500 })
  }
} 