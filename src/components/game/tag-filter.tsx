import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FilterIcon, X } from 'lucide-react'

interface Tag {
  id: string
  name: string
  _count: {
    games: number
  }
}

interface TagFilterProps {
  onSelectTag: (tag: string | null) => void
  selectedTag: string | null
}

export function TagFilter({ onSelectTag, selectedTag }: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags')
        const data = await response.json()
        setTags(data)
      } catch (error) {
        console.error('获取标签失败:', error)
      }
    }
    
    fetchTags()
  }, [])
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
          isOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
        }`}
        aria-expanded={isOpen}
        aria-label="筛选游戏类型"
      >
        <FilterIcon size={18} />
        <span>筛选</span>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-60 bg-white shadow-lg rounded-lg z-10 overflow-hidden"
          >
            <div className="p-3 border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">游戏类型</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="关闭"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="p-2 max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  onSelectTag(null)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  selectedTag === null
                    ? 'bg-blue-100 text-blue-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                全部游戏
              </button>
              
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    onSelectTag(tag.name)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md flex justify-between items-center ${
                    selectedTag === tag.name
                      ? 'bg-blue-100 text-blue-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span>{tag.name}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {tag._count.games}
                  </span>
                </button>
              ))}
              
              {tags.length === 0 && (
                <div className="text-gray-500 text-center py-3">
                  暂无标签
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 