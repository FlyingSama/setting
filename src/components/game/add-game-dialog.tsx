import { useState, useEffect, useRef } from 'react'
import { X, Plus, Search, Loader2, Upload, Image as ImageIcon, Gamepad } from 'lucide-react'
import { SearchInput } from '../ui/search-input'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

// 这里你可以导入一个游戏列表，或者从API获取
const POPULAR_GAMES = [
  { id: '1', name: 'Minecraft', iconUrl: null },
  { id: '2', name: 'World of Warcraft', iconUrl: null },
  { id: '3', name: 'League of Legends', iconUrl: null },
  { id: '4', name: 'DOTA 2', iconUrl: null },
  { id: '5', name: 'Counter-Strike', iconUrl: null },
  { id: '6', name: 'Apex Legends', iconUrl: null },
  { id: '7', name: 'Fortnite', iconUrl: null },
  { id: '8', name: 'Valorant', iconUrl: null },
  { id: '9', name: 'Overwatch', iconUrl: null },
  { id: '10', name: 'PUBG', iconUrl: null },
]

// 检查URL是否安全
function isSafeImageUrl(url: string | null): boolean {
  if (!url) return false;
  
  // 如果是本地上传的图片（以/uploads/开头）则是安全的
  if (url.startsWith('/uploads/')) return true;
  
  // 如果是数据URL（data:开头），用于临时预览，也是安全的
  if (url.startsWith('blob:') || url.startsWith('data:')) return true;
  
  // 其他URL，特别是外部URL，不安全
  return false;
}

interface AddGameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGameAdded: () => void
}

export function AddGameDialog({ open, onOpenChange, onGameAdded }: AddGameDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredGames, setFilteredGames] = useState(POPULAR_GAMES)
  const [customGame, setCustomGame] = useState({ name: '', iconUrl: '' })
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customTags, setCustomTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 当搜索词变化时，筛选游戏
  useEffect(() => {
    if (!searchQuery) {
      setFilteredGames(POPULAR_GAMES)
      return
    }
    
    const filtered = POPULAR_GAMES.filter(game =>
      game.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredGames(filtered)
  }, [searchQuery])
  
  // 重置表单
  const resetForm = () => {
    setSearchQuery('')
    setCustomGame({ name: '', iconUrl: '' })
    setShowCustomForm(false)
    setIsSubmitting(false)
    setCustomTags([])
    setTagInput('')
    setPreviewImage(null)
    setUploadError(null)
  }
  
  // 处理关闭
  const handleCloseDialog = () => {
    resetForm()
    onOpenChange(false)
  }
  
  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)
    
    try {
      // 创建预览URL
      const previewUrl = URL.createObjectURL(file)
      setPreviewImage(previewUrl)
      
      // 创建FormData对象
      const formData = new FormData()
      formData.append('file', file)
      
      // 发送上传请求
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '上传失败')
      }
      
      const data = await response.json()
      setCustomGame({ ...customGame, iconUrl: data.url })
    } catch (error) {
      console.error('图片上传失败:', error)
      setUploadError(error instanceof Error ? error.message : '图片上传失败')
      setPreviewImage(null)
    } finally {
      setIsUploading(false)
    }
  }
  
  // 移除已上传图片
  const handleRemoveImage = () => {
    setCustomGame({ ...customGame, iconUrl: '' })
    setPreviewImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  // 触发文件选择
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }
  
  // 选择游戏
  const handleSelectGame = async (game: typeof POPULAR_GAMES[0]) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: game.name,
          iconUrl: game.iconUrl,
          tags: []
        }),
      })
      
      if (!response.ok) {
        throw new Error('添加游戏失败')
      }
      
      onGameAdded()
      handleCloseDialog()
    } catch (error) {
      console.error('添加游戏失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // 处理自定义游戏提交
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customGame.name) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: customGame.name,
          iconUrl: customGame.iconUrl || null,
          tags: customTags
        }),
      })
      
      if (!response.ok) {
        throw new Error('添加游戏失败')
      }
      
      onGameAdded()
      handleCloseDialog()
    } catch (error) {
      console.error('添加游戏失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // 添加标签
  const handleAddTag = () => {
    if (tagInput && !customTags.includes(tagInput)) {
      setCustomTags([...customTags, tagInput])
      setTagInput('')
    }
  }
  
  // 删除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setCustomTags(customTags.filter(tag => tag !== tagToRemove))
  }
  
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg z-50 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold">
              {showCustomForm ? '添加自定义游戏' : '添加游戏'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-400 hover:text-gray-600"
                aria-label="关闭"
              >
                <X size={24} />
              </button>
            </Dialog.Close>
          </div>
          
          <AnimatePresence mode="wait">
            {showCustomForm ? (
              <motion.div
                key="custom-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <form onSubmit={handleCustomSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="game-name" className="block text-sm font-medium mb-1">
                      游戏名称 *
                    </label>
                    <input
                      id="game-name"
                      type="text"
                      value={customGame.name}
                      onChange={e => setCustomGame({...customGame, name: e.target.value})}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      游戏图标
                    </label>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    {!customGame.iconUrl ? (
                      <div 
                        onClick={triggerFileInput}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center">
                            <Loader2 size={24} className="text-blue-500 animate-spin mb-2" />
                            <p className="text-sm text-gray-500">上传中...</p>
                          </div>
                        ) : (
                          <>
                            <Upload size={24} className="text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500 mb-1">点击上传图片</p>
                            <p className="text-xs text-gray-400">支持JPG、PNG、GIF、WEBP格式，最大2MB</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="relative border rounded-lg overflow-hidden">
                        <div className="w-full h-32 relative">
                          {previewImage && isSafeImageUrl(previewImage) && (
                            <Image 
                              src={previewImage} 
                              alt="游戏图标预览"
                              fill
                              className="object-contain"
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-gray-600 hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    
                    {uploadError && (
                      <p className="mt-1 text-sm text-red-500">{uploadError}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      标签 (可选)
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        placeholder="输入标签"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddTag()
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
                      >
                        添加
                      </button>
                    </div>
                    
                    {customTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {customTags.map(tag => (
                          <div
                            key={tag}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCustomForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      返回
                    </button>
                    <button
                      type="submit"
                      disabled={!customGame.name || isSubmitting}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin mr-2" />
                          提交中...
                        </>
                      ) : (
                        '添加游戏'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="game-list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-4 flex justify-between">
                  <SearchInput
                    onSearch={setSearchQuery}
                    autoSearch={true}
                    placeholder="搜索游戏..."
                    initialValue={searchQuery}
                    className="flex-1 mr-2"
                  />
                  <button
                    onClick={() => setShowCustomForm(true)}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Plus size={18} className="mr-1" />
                    自定义添加
                  </button>
                </div>
                
                <div className="h-[300px] overflow-y-auto border rounded-lg">
                  {filteredGames.length > 0 ? (
                    <ul className="divide-y">
                      {filteredGames.map(game => (
                        <li key={game.id} className="hover:bg-gray-50">
                          <button
                            onClick={() => handleSelectGame(game)}
                            disabled={isSubmitting}
                            className="w-full p-3 flex items-center"
                          >
                            <div className="w-10 h-10 relative mr-3 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                              {game.iconUrl && isSafeImageUrl(game.iconUrl) ? (
                                <img 
                                  src={game.iconUrl} 
                                  alt={game.name} 
                                  className="object-cover w-full h-full"
                                  onError={(e) => {
                                    // 当图片加载失败时隐藏
                                    const imgElement = e.currentTarget as HTMLImageElement;
                                    imgElement.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Gamepad className="text-gray-400 w-6 h-6" />
                              )}
                            </div>
                            <span className="text-left">{game.name}</span>
                            {isSubmitting && (
                              <Loader2 size={18} className="animate-spin ml-auto" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-500">
                      <Search size={32} className="text-gray-300 mb-2" />
                      <p>未找到匹配的游戏</p>
                      <button
                        onClick={() => setShowCustomForm(true)}
                        className="mt-2 text-blue-500 hover:underline"
                      >
                        添加自定义游戏
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
} 