import Image from 'next/image'
import Link from 'next/link'
import { useState, memo } from 'react'
import { motion } from 'framer-motion'
import { Gamepad, Trash2, Loader2, Settings } from 'lucide-react'

interface GameCardProps {
  id: string
  name: string
  iconUrl?: string | null
  settingsCount: number
  onDelete?: (id: string) => Promise<void>
}

// 检查URL是否安全
function isSafeImageUrl(url: string | null): boolean {
  if (!url) return false;
  
  // 如果是本地上传的图片（以/uploads/开头）则是安全的
  if (url.startsWith('/uploads/')) return true;
  
  // 其他URL，特别是外部URL，不安全
  return false;
}

// 使用React.memo优化渲染性能
export const GameCard = memo(function GameCard({ id, name, iconUrl, settingsCount, onDelete }: GameCardProps) {
  // 检查URL是否安全
  const safeIconUrl = iconUrl && isSafeImageUrl(iconUrl) ? iconUrl : null;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onDelete) return;
    
    if (!window.confirm(`确定要删除"${name}"吗？此操作将删除所有相关配置文件，且不可恢复。`)) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await onDelete(id);
    } catch (error) {
      console.error('删除游戏失败:', error);
      setIsDeleting(false);
    }
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden relative shadow-sm hover:shadow-md transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {onDelete && isHovered && !isDeleting && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleDelete}
          className="absolute top-2 right-2 p-2 bg-red-100 rounded-full hover:bg-red-200 z-10 shadow-sm"
        >
          <Trash2 size={16} className="text-red-600" />
        </motion.button>
      )}
      
      {isDeleting && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-20">
          <Loader2 size={30} className="animate-spin text-blue-500" />
        </div>
      )}
      
      <Link href={`/games/${id}`} className="block h-full">
        <div className="p-5 flex flex-col h-full">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 relative mr-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden flex items-center justify-center shadow-inner">
              {safeIconUrl && !imageError ? (
                <div className="relative w-full h-full">
                  <Image
                    src={safeIconUrl}
                    alt={name}
                    fill
                    loading="lazy" 
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <Gamepad className="text-indigo-400 w-9 h-9" />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="text-xl font-bold truncate text-gray-800">{name}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Settings size={14} className="mr-1 text-blue-500" />
                {settingsCount > 0 
                  ? `${settingsCount} 个配置文件` 
                  : '暂无配置文件'}
              </div>
            </div>
          </div>
          
          <div className={`mt-2 rounded-lg py-2 px-3 text-sm ${isHovered ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'} transition-colors duration-300`}>
            <div className="flex items-center justify-center">
              <span>点击查看详情</span>
              {isHovered && (
                <motion.div
                  initial={{ x: -5, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="ml-1"
                >
                  →
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}); 