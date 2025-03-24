import { Search } from 'lucide-react'
import { useState, useEffect, useRef, FormEvent } from 'react'

interface SearchInputProps {
  onSearch: (query: string) => void
  placeholder?: string
  autoSearch?: boolean
  initialValue?: string
  className?: string
}

export function SearchInput({
  onSearch,
  placeholder = '搜索游戏...',
  autoSearch = false,
  initialValue = '',
  className = ''
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  
  useEffect(() => {
    if (autoSearch) {
      const timer = setTimeout(() => {
        onSearch(value)
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [value, autoSearch, onSearch])
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(value)
  }
  
  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        aria-label="搜索"
      >
        <Search size={20} />
      </button>
    </form>
  )
} 