"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface MFAInputProps {
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  length?: number
  disabled?: boolean
  className?: string
  autoFocus?: boolean
}

export function MFAInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  className,
  autoFocus = true
}: MFAInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(autoFocus ? 0 : null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length)
  }, [length])

  // Set initial focus
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0]?.focus()
    }
  }, [autoFocus])

  // Handle value changes
  const handleInputChange = (index: number, inputValue: string) => {
    // Only allow digits
    const cleanValue = inputValue.replace(/\D/g, '')
    
    if (cleanValue.length > 1) {
      // Handle paste scenario
      handlePaste(cleanValue)
      return
    }

    const newValue = value.split('')
    newValue[index] = cleanValue
    const finalValue = newValue.join('')

    onChange(finalValue)

    // Auto-focus next input
    if (cleanValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      setFocusedIndex(index + 1)
    }

    // Call onComplete when all digits are entered
    if (finalValue.length === length && onComplete) {
      onComplete(finalValue)
    }
  }

  // Handle key events
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      
      const newValue = value.split('')
      
      if (value[index]) {
        // Clear current digit
        newValue[index] = ''
      } else if (index > 0) {
        // Clear previous digit and focus it
        newValue[index - 1] = ''
        inputRefs.current[index - 1]?.focus()
        setFocusedIndex(index - 1)
      }
      
      onChange(newValue.join(''))
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
      setFocusedIndex(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
      setFocusedIndex(index + 1)
    }
  }

  // Handle paste events
  const handlePaste = (pastedData: string) => {
    const cleanData = pastedData.replace(/\D/g, '').slice(0, length)
    
    if (cleanData.length > 0) {
      onChange(cleanData.padEnd(length, '0'))
      
      // Focus the appropriate input after paste
      const nextIndex = Math.min(cleanData.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
      setFocusedIndex(nextIndex)
      
      if (cleanData.length === length && onComplete) {
        onComplete(cleanData)
      }
    }
  }

  const handlePasteEvent = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    handlePaste(pastedData)
  }

  const handleFocus = (index: number) => {
    setFocusedIndex(index)
  }

  const handleBlur = () => {
    setFocusedIndex(null)
  }

  return (
    <div className={cn("flex gap-2", className)}>
      {Array.from({ length }, (_, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleInputChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePasteEvent}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          disabled={disabled}
          className={cn(
            "w-12 h-12 text-center text-xl font-mono",
            "transition-all duration-200",
            focusedIndex === index && "ring-2 ring-primary ring-offset-2",
            "focus:ring-2 focus:ring-primary focus:ring-offset-2"
          )}
        />
      ))}
    </div>
  )
}
