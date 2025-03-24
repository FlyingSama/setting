'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { SearchInput } from '@/components/ui/search-input'
import { AddGameDialog } from '@/components/game/add-game-dialog'
import { TagFilter } from '@/components/game/tag-filter'
import { GameGrid } from '@/components/game/game-grid'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [refreshFlag, setRefreshFlag] = useState(0)
  
  const handleGameAdded = () => {
    setRefreshFlag(prev => prev + 1)
  }
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">游戏设置管理器</h1>
      
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <SearchInput
            onSearch={setSearchQuery}
            placeholder="搜索游戏..."
            className="flex-1"
          />
          
          <div className="flex gap-2">
            <button
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-sm"
            >
              <Plus size={20} className="mr-1" />
              添加
            </button>
            
            <TagFilter 
              onSelectTag={setSelectedTag} 
              selectedTag={selectedTag} 
            />
          </div>
        </div>
        
        <GameGrid 
          searchQuery={searchQuery} 
          selectedTag={selectedTag}
          isFilterOpen={isFilterOpen} 
          key={refreshFlag} 
        />
      </div>
      
      <AddGameDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onGameAdded={handleGameAdded} 
      />
    </main>
  )
}
