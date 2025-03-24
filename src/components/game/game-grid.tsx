import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameCard } from './game-card'
import { Gamepad } from 'lucide-react'

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
            <motion.div 
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-blue-500"
            ></motion.div>
          </div>
        ) : games.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`grid gap-6 ${
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
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-10 text-center"
          >
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gamepad size={30} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              {searchQuery || selectedTag
                ? '未找到符合条件的游戏'
                : '开始添加您的第一个游戏'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery || selectedTag
                ? '尝试更改搜索词或筛选条件，或添加一个新游戏'
                : '点击上方的"添加游戏"按钮开始创建您的游戏配置库'}
            </p>
            {(searchQuery || selectedTag) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/'}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                查看所有游戏
              </motion.button>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
} 