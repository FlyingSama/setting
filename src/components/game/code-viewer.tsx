import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Save, Settings, Trash2, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface CodeViewerProps {
  content: string
  name: string
  id: string
  onSave?: (id: string, content: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  readOnly?: boolean
}

export function CodeViewer({
  content,
  name,
  id,
  onSave,
  onDelete,
  readOnly = false
}: CodeViewerProps) {
  const [code, setCode] = useState(content)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const handleSave = async () => {
    if (!onSave) return
    
    setIsSaving(true)
    try {
      await onSave(id, code)
      setIsEditing(false)
    } catch (error) {
      console.error('保存设置文件失败:', error)
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleDelete = async () => {
    if (!onDelete) return
    
    if (!window.confirm(`确定要删除"${name}"吗？此操作不可恢复。`)) {
      return
    }
    
    setIsDeleting(true)
    try {
      await onDelete(id)
    } catch (error) {
      console.error('删除设置文件失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }
  
  return (
    <div className="rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-blue-100">
        <div className="flex items-center">
          <Settings size={18} className="text-blue-500 mr-2" />
          <h3 className="font-medium text-gray-800">{name}</h3>
        </div>
        
        <div className="flex space-x-2">
          {!readOnly && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center px-2 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              <Settings size={16} className="mr-1" />
              {isEditing ? '取消' : '编辑'}
            </motion.button>
          )}
          
          {isEditing && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={isSaving}
              className="text-green-600 hover:text-green-800 text-sm flex items-center px-2 py-1 rounded hover:bg-green-50 disabled:opacity-50 transition-colors"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : (
                <Save size={16} className="mr-1" />
              )}
              {isSaving ? '保存中...' : '保存'}
            </motion.button>
          )}
          
          {!readOnly && onDelete && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-800 text-sm flex items-center px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {isDeleting ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : (
                <Trash2 size={16} className="mr-1" />
              )}
              {isDeleting ? '删除中...' : '删除'}
            </motion.button>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full min-h-[300px] p-4 font-mono text-sm focus:outline-none border-0 bg-gray-50"
        />
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-h-[500px] overflow-y-auto bg-gray-900"
        >
          <SyntaxHighlighter
            language="plaintext"
            style={vscDarkPlus}
            customStyle={{ margin: 0, borderRadius: 0 }}
            wrapLongLines
          >
            {code}
          </SyntaxHighlighter>
        </motion.div>
      )}
    </div>
  )
} 