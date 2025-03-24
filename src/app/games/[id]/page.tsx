'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Plus, Loader2, Gamepad, Upload, X, FileText, Trash2, Settings } from 'lucide-react'
import { CodeViewer } from '@/components/game/code-viewer'

interface Game {
  id: string
  name: string
  iconUrl: string | null
  settingFiles: Setting[]
  tags: {
    id: string
    name: string
  }[]
}

interface Setting {
  id: string
  name: string
  content: string
}

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

export default function GameDetailsPage() {
  const params = useParams()
  const id = params.id as string
  
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newSettingName, setNewSettingName] = useState('')
  const [isAddingFile, setIsAddingFile] = useState(false)
  const [isShowingUpload, setIsShowingUpload] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploadingConfig, setIsUploadingConfig] = useState(false)
  const [isEditingIcon, setIsEditingIcon] = useState(false)
  const [isUploadingIcon, setIsUploadingIcon] = useState(false)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const iconInputRef = useRef<HTMLInputElement>(null)
  const configFileInputRef = useRef<HTMLInputElement>(null)
  const [selectedSettingId, setSelectedSettingId] = useState<string | null>(null)
  const [isDeletingGame, setIsDeletingGame] = useState(false)
  
  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true)
      
      try {
        const response = await fetch(`/api/games/${id}`)
        
        if (!response.ok) {
          throw new Error('游戏不存在或无法获取')
        }
        
        const data = await response.json()
        setGame(data)
      } catch (error) {
        console.error('获取游戏详情失败:', error)
        setError('无法加载游戏详情')
      } finally {
        setLoading(false)
      }
    }
    
    fetchGame()
  }, [id])
  
  // 设置激活的设置文件
  useEffect(() => {
    if (game?.settingFiles.length && !selectedSettingId) {
      setSelectedSettingId(game.settingFiles[0].id)
    }
  }, [game, selectedSettingId])
  
  const handleAddSettingFile = async () => {
    if (!newSettingName || !game) return
    
    setIsAddingFile(true)
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newSettingName,
          content: '',
          gameId: game.id
        }),
      })
      
      if (!response.ok) {
        throw new Error('添加设置文件失败')
      }
      
      const newSetting = await response.json()
      
      setGame({
        ...game,
        settingFiles: [...game.settingFiles, newSetting]
      })
      
      setNewSettingName('')
    } catch (error) {
      console.error('添加设置文件失败:', error)
    } finally {
      setIsAddingFile(false)
    }
  }
  
  const handleSaveSettingFile = async (id: string, content: string) => {
    if (!game) return
    
    try {
      const settingToUpdate = game.settingFiles.find(s => s.id === id)
      
      if (!settingToUpdate) return
      
      const response = await fetch(`/api/settings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: settingToUpdate.name,
          content
        }),
      })
      
      if (!response.ok) {
        throw new Error('更新设置文件失败')
      }
      
      const updatedSetting = await response.json()
      
      setGame({
        ...game,
        settingFiles: game.settingFiles.map(s => 
          s.id === id ? { ...s, content } : s
        )
      })
    } catch (error) {
      console.error('更新设置文件失败:', error)
      throw error
    }
  }
  
  // 处理图标上传
  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!game) return
    
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploadingIcon(true)
    
    try {
      // 创建预览URL
      const previewUrl = URL.createObjectURL(file)
      setIconPreview(previewUrl)
      
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
      
      // 更新游戏图标
      const updateResponse = await fetch(`/api/games/${game.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: game.name,
          iconUrl: data.url,
          tags: game.tags.map(tag => tag.name)
        }),
      })
      
      if (!updateResponse.ok) {
        throw new Error('更新游戏图标失败')
      }
      
      const updatedGame = await updateResponse.json()
      setGame(updatedGame)
      setIsEditingIcon(false)
    } catch (error) {
      console.error('图标上传失败:', error)
    } finally {
      setIsUploadingIcon(false)
    }
  }
  
  // 触发图标文件选择
  const triggerIconInput = () => {
    if (iconInputRef.current) {
      iconInputRef.current.click()
    }
  }
  
  // 取消编辑图标
  const cancelIconEdit = () => {
    setIsEditingIcon(false)
    setIconPreview(null)
    if (iconInputRef.current) {
      iconInputRef.current.value = ''
    }
  }
  
  // 处理配置文件上传
  const handleConfigFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!game) return
    
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploadingConfig(true)
    setUploadError(null)
    
    try {
      // 从文件名创建设置名称（去掉扩展名）
      const fileName = file.name
      const settingName = fileName.substring(0, fileName.lastIndexOf('.'))
      
      // 创建FormData对象
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileType', 'config')
      
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
      
      // 创建新的设置文件
      const saveResponse = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: settingName || fileName,
          content: data.content,
          gameId: game.id
        }),
      })
      
      if (!saveResponse.ok) {
        throw new Error('保存设置文件失败')
      }
      
      const newSetting = await saveResponse.json()
      
      setGame({
        ...game,
        settingFiles: [...game.settingFiles, newSetting]
      })
      
      setIsShowingUpload(false)
    } catch (error) {
      console.error('配置文件上传失败:', error)
      setUploadError(error instanceof Error ? error.message : '配置文件上传失败')
    } finally {
      setIsUploadingConfig(false)
      if (configFileInputRef.current) {
        configFileInputRef.current.value = ''
      }
    }
  }
  
  // 触发配置文件选择
  const triggerConfigFileInput = () => {
    if (configFileInputRef.current) {
      configFileInputRef.current.click()
    }
  }
  
  // 处理删除设置文件
  const handleDeleteSettingFile = async (id: string) => {
    if (!game) return
    
    try {
      const response = await fetch(`/api/settings/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('删除设置文件失败')
      }
      
      // 更新游戏对象，移除被删除的设置文件
      const updatedSettingFiles = game.settingFiles.filter(s => s.id !== id)
      setGame({
        ...game,
        settingFiles: updatedSettingFiles
      })
      
      // 如果删除的是当前选中的设置文件，则选择第一个设置文件（如果存在）
      if (selectedSettingId === id) {
        setSelectedSettingId(updatedSettingFiles.length > 0 ? updatedSettingFiles[0].id : null)
      }
    } catch (error) {
      console.error('删除设置文件失败:', error)
    }
  }
  
  // 处理删除游戏
  const handleDeleteGame = async () => {
    if (!game) return
    
    if (!window.confirm(`确定要删除"${game.name}"吗？此操作将删除所有相关配置文件，且不可恢复。`)) {
      return
    }
    
    setIsDeletingGame(true)
    
    try {
      const response = await fetch(`/api/games/${game.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('删除游戏失败')
      }
      
      // 删除成功后跳转到首页
      window.location.href = '/'
    } catch (error) {
      console.error('删除游戏失败:', error)
      setIsDeletingGame(false)
    }
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
          <p className="text-lg text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }
  
  if (error || !game) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-500 mb-4">
            {error || '游戏不存在'}
          </h2>
          <Link
            href="/"
            className="inline-flex items-center text-blue-500 hover:underline"
          >
            <ArrowLeft size={16} className="mr-1" />
            返回首页
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:underline"
          >
            <ArrowLeft size={16} className="mr-1" />
            返回首页
          </Link>
          
          <button
            onClick={handleDeleteGame}
            disabled={isDeletingGame}
            className="flex items-center text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            {isDeletingGame ? (
              <Loader2 size={16} className="animate-spin mr-1" />
            ) : (
              <Trash2 size={16} className="mr-1" />
            )}
            删除游戏
          </button>
        </div>
        
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 relative mr-4 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center group">
            <input
              ref={iconInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleIconUpload}
              className="hidden"
            />
            
            {isEditingIcon && (
              <button
                onClick={cancelIconEdit}
                className="absolute -left-2 -top-2 z-10 p-1 bg-white rounded-full shadow-md text-gray-500 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            )}
            
            {isEditingIcon ? (
              isUploadingIcon ? (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
                </div>
              ) : (
                <div 
                  onClick={triggerIconInput}
                  className="flex flex-col items-center justify-center w-full h-full bg-gray-200 cursor-pointer"
                >
                  <Upload className="w-6 h-6 text-gray-500" />
                  <span className="text-xs text-gray-500 mt-1">上传</span>
                </div>
              )
            ) : (
              <>
                {game.iconUrl && isSafeImageUrl(game.iconUrl) ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={iconPreview || game.iconUrl}
                      alt={game.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        // 当图片加载失败时，将替换为图标
                        const imgElement = e.currentTarget as HTMLImageElement;
                        imgElement.style.display = 'none';
                      }}
                    />
                    <button
                      onClick={() => setIsEditingIcon(true)}
                      className="absolute inset-0 w-full h-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white p-1"
                    >
                      修改
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <Gamepad className="text-gray-400 w-8 h-8" />
                    <button
                      onClick={() => setIsEditingIcon(true)}
                      className="absolute inset-0 w-full h-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white p-1 text-xs"
                    >
                      添加图标
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div>
            <h1 className="text-3xl font-bold">{game.name}</h1>
            {game.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {game.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">配置文件</h2>
          
          <div className="flex">
            {isShowingUpload ? (
              <>
                <input
                  ref={configFileInputRef}
                  type="file"
                  accept=".cfg,.vcfg,.txt,.ini,.conf,.config,.json"
                  onChange={handleConfigFileUpload}
                  className="hidden"
                />
                <button
                  onClick={triggerConfigFileInput}
                  disabled={isUploadingConfig}
                  className="flex items-center px-4 py-2 mr-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {isUploadingConfig ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-1" />
                      上传中...
                    </>
                  ) : (
                    <>
                      <FileText size={16} className="mr-1" />
                      上传配置文件
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsShowingUpload(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsShowingUpload(true)}
                  className="flex items-center px-4 py-2 mr-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <Upload size={16} className="mr-1" />
                  导入配置
                </button>
                <input
                  type="text"
                  value={newSettingName}
                  onChange={(e) => setNewSettingName(e.target.value)}
                  placeholder="新配置文件名称"
                  className="px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddSettingFile}
                  disabled={!newSettingName || isAddingFile}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingFile ? (
                    <Loader2 size={16} className="animate-spin mr-1" />
                  ) : (
                    <Plus size={16} className="mr-1" />
                  )}
                  添加
                </button>
              </>
            )}
          </div>
        </div>
        
        {uploadError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-r-lg">
            <p>{uploadError}</p>
          </div>
        )}
        
        {game.settingFiles.length > 0 ? (
          <div>
            {/* 标签页导航 */}
            <div className="flex border-b mb-4 overflow-x-auto pb-1">
              {game.settingFiles.map(setting => (
                <button
                  key={setting.id}
                  onClick={() => setSelectedSettingId(setting.id)}
                  className={`px-4 py-2 flex items-center whitespace-nowrap mr-2 rounded-t-lg ${
                    selectedSettingId === setting.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Settings size={14} className="mr-1" />
                  {setting.name}
                </button>
              ))}
            </div>
            
            {/* 显示选中的设置文件 */}
            {selectedSettingId && (
              <div>
                {game.settingFiles
                  .filter(setting => setting.id === selectedSettingId)
                  .map(setting => (
                    <CodeViewer
                      key={setting.id}
                      id={setting.id}
                      name={setting.name}
                      content={setting.content}
                      onSave={handleSaveSettingFile}
                      onDelete={handleDeleteSettingFile}
                    />
                  ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              暂无配置文件
            </h3>
            <p className="text-gray-400">
              使用上方输入框添加新的配置文件
            </p>
          </div>
        )}
      </div>
    </main>
  )
} 