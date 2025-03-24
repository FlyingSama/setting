import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanExternalUrls() {
  try {
    console.log('开始清理数据库中的外部URL...')
    
    // 清理游戏表中的外部URL
    const games = await prisma.game.findMany({
      where: {
        NOT: {
          OR: [
            { iconUrl: null },
            { iconUrl: { startsWith: '/uploads/' } }
          ]
        }
      }
    })
    
    console.log(`找到 ${games.length} 个包含外部URL的游戏记录`)
    
    for (const game of games) {
      console.log(`清理游戏记录: ${game.id} - ${game.name}, 旧的URL: ${game.iconUrl}`)
      await prisma.game.update({
        where: { id: game.id },
        data: { iconUrl: null }
      })
    }
    
    console.log('清理完成!')
    
  } catch (error) {
    console.error('清理过程中发生错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanExternalUrls()
  .then(() => console.log('脚本执行完成'))
  .catch(e => console.error('脚本执行失败:', e)) 