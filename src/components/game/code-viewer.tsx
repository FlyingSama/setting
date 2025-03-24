import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Save, Settings, Trash2 } from 'lucide-react'

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
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b">
        <div className="flex items-center">
          <Settings size={18} className="text-gray-500 mr-2" />
          <h3 className="font-medium">{name}</h3>
        </div>
        
        <div className="flex space-x-2">
          {!readOnly && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <Settings size={16} className="mr-1" />
              {isEditing ? '取消' : '编辑'}
            </button>
          )}
          
          {isEditing && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="text-green-600 hover:text-green-800 text-sm flex items-center disabled:opacity-50"
            >
              <Save size={16} className="mr-1" />
              {isSaving ? '保存中...' : '保存'}
            </button>
          )}
          
          {!readOnly && onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-800 text-sm flex items-center disabled:opacity-50"
            >
              <Trash2 size={16} className="mr-1" />
              {isDeleting ? '删除中...' : '删除'}
            </button>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full min-h-[300px] p-4 font-mono text-sm focus:outline-none border-0"
        />
      ) : (
        <div className="max-h-[500px] overflow-y-auto">
          <SyntaxHighlighter
            language="plaintext"
            style={vscDarkPlus}
            customStyle={{ margin: 0, borderRadius: 0 }}
            wrapLongLines
          >
            {code}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  )
} 