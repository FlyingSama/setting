import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameCard } from './game-card'

interface Game {
  id: string
  name: string
  iconUrl: string | null
  settingFiles: any[]
  tags: {
    id: string
    name: string
  }[]
}

interface GameGridProps {
  searchQuery: string
  selectedTag: string | null
  isFilterOpen: boolean
}

export function GameGrid({ searchQuery, selectedTag, isFilterOpen }: GameGridProps) {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchGames()
  }, [searchQuery, selectedTag])
  
  const fetchGames = async () => {
    setLoading(true)
    
    try {
      let url = '/api/games'
      const params = new URLSearchParams()
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      
      if (selectedTag) {
        params.append('tag', selectedTag)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url)
      const data = await response.json()
      setGames(data)
    } catch (error) {
      console.error('获取游戏列表失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteGame = async (id: string) => {
    try {
      const response = await fetch(`/api/games/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('删除游戏失败')
      }
      
      // 更新游戏列表，移除被删除的游戏
      setGames(games.filter(game => game.id !== id))
    } catch (error) {
      console.error('删除游戏失败:', error)
      throw error
    }
  }
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${isFilterOpen}-${selectedTag}-${searchQuery}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : games.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`grid gap-4 ${
              isFilterOpen ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            }`}
          >
            {games.map((game) => (
              <motion.div key={game.id} variants={itemVariants}>
                <GameCard
                  id={game.id}
                  name={game.name}
                  iconUrl={game.iconUrl}
                  settingsCount={game.settingFiles.length}
                  onDelete={handleDeleteGame}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              {searchQuery || selectedTag
                ? '未找到符合条件的游戏'
                : '暂无游戏'}
            </h3>
            <p className="text-gray-400">
              {searchQuery || selectedTag
                ? '尝试更改搜索词或筛选条件'
                : '点击右上角的"添加"按钮添加游戏'}
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
} 