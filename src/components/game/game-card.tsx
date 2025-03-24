import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Gamepad, Trash2, Loader2 } from 'lucide-react'

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

export function GameCard({ id, name, iconUrl, settingsCount, onDelete }: GameCardProps) {
  // 检查URL是否安全
  const safeIconUrl = iconUrl && isSafeImageUrl(iconUrl) ? iconUrl : null;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
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
      whileHover={{ scale: 1.03 }}
      className="bg-white rounded-lg shadow-md overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {onDelete && isHovered && !isDeleting && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 p-2 bg-red-100 rounded-full hover:bg-red-200 z-10"
        >
          <Trash2 size={16} className="text-red-600" />
        </button>
      )}
      
      {isDeleting && (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-20">
          <Loader2 size={24} className="animate-spin text-blue-500" />
        </div>
      )}
      
      <Link href={`/games/${id}`} className="block h-full">
        <div className="p-4">
          <div className="flex items-center mb-2">
            <div className="w-12 h-12 relative mr-3 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
              {safeIconUrl ? (
                <div className="relative w-full h-full">
                  <Image
                    src={safeIconUrl}
                    alt={name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // 当图片加载失败时，将替换为图标
                      const imgElement = e.currentTarget;
                      if (imgElement.parentElement) {
                        imgElement.style.display = 'none';
                        const gamepadIcon = document.createElement('div');
                        gamepadIcon.className = 'flex items-center justify-center w-full h-full';
                        gamepadIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M6 12h4"/><path d="M8 10v4"/><path d="M15 13h.01"/><path d="M18 11h.01"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>`;
                        imgElement.parentElement.appendChild(gamepadIcon);
                      }
                    }}
                  />
                </div>
              ) : (
                <Gamepad className="text-gray-400 w-8 h-8" />
              )}
            </div>
            <h3 className="text-lg font-medium truncate">{name}</h3>
          </div>
          <div className="text-sm text-gray-500">
            {settingsCount > 0 
              ? `${settingsCount} 个配置文件` 
              : '暂无配置文件'}
          </div>
        </div>
      </Link>
    </motion.div>
  )
} 