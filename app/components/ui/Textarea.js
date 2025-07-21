//components/ui/Textarea.js
import { forwardRef } from 'react'

const Textarea = forwardRef(({ 
  label,
  error,
  helpText,
  size = 'md',
  variant = 'default',
  rows = 4,
  resize = 'vertical',
  className = '',
  ...props 
}, ref) => {
  const baseClasses = 'w-full border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2'
  
  const variants = {
    default: 'border-gray-300 focus:border-gold focus:ring-gold',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  }
  
  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  }
  
  const inputVariant = error ? 'error' : variant
  const classes = `${baseClasses} ${variants[inputVariant]} ${sizes[size]} ${resizeClasses[resize]} ${className}`
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-deepBlue mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        rows={rows}
        className={classes}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'
export default Textarea