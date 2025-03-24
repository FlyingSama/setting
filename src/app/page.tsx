'use client'

import { useState, useEffect } from 'react'
import { Plus, Gamepad, Sparkles } from 'lucide-react'
import { SearchInput } from '@/components/ui/search-input'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

// 动态导入组件，减小初始加载体积
const AddGameDialog = dynamic(() => import('@/components/game/add-game-dialog').then(mod => mod.AddGameDialog), {
  ssr: false,
  loading: () => null
})
const TagFilter = dynamic(() => import('@/components/game/tag-filter').then(mod => mod.TagFilter), {
  ssr: false,
  loading: () => <div className="h-10 w-44 bg-gray-100 animate-pulse rounded-lg"></div>
})
const GameGrid = dynamic(() => import('@/components/game/game-grid').then(mod => mod.GameGrid), {
  ssr: true,
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-44 bg-gray-100 animate-pulse rounded-xl"></div>
      ))}
    </div>
  )
})

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [refreshFlag, setRefreshFlag] = useState(0)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const handleGameAdded = () => {
    setRefreshFlag(prev => prev + 1)
  }
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 flex flex-col">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>
      
      <div className="container mx-auto px-4 py-10 relative z-10 flex-1">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Gamepad size={36} className="text-blue-500 mr-3" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              浮影の游戏设置
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            便捷管理您的游戏配置文件，一站式游戏设置管理工具
          </p>
        </motion.div>
        
        <div className="max-w-6xl mx-auto mb-8 px-3">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="backdrop-blur-sm bg-white/80 rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 mb-3">
              <SearchInput
                onSearch={setSearchQuery}
                placeholder="搜索游戏..."
                className="flex-1"
              />
              
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsDialogOpen(true)}
                  className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-md transition-all duration-200"
                >
                  <Plus size={20} className="mr-2" />
                  添加游戏
                </motion.button>
                
                <TagFilter 
                  onSelectTag={setSelectedTag} 
                  selectedTag={selectedTag} 
                />
              </div>
            </div>
          </motion.div>
          
          {mounted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <GameGrid 
                searchQuery={searchQuery} 
                selectedTag={selectedTag}
                isFilterOpen={isFilterOpen} 
                key={refreshFlag} 
              />
            </motion.div>
          )}
        </div>
      </div>
      
      <footer className="w-full py-6 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-inner relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center text-gray-600"
          >
            <p className="mb-1">浮影の游戏设置 · 轻松管理您的游戏配置文件</p>
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} 保留所有权利</p>
          </motion.div>
        </div>
      </footer>
      
      <AddGameDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onGameAdded={handleGameAdded} 
      />
    </main>
  )
}
