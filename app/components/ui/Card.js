//components/ui/Card.js
import { forwardRef } from 'react'

const Card = forwardRef(({ 
  children, 
  className = '', 
  hover = false,
  padding = 'md',
  ...props 
}, ref) => {
  const baseClasses = 'bg-white rounded-xl border border-gray-200 transition-all duration-200'
  
  const hoverClasses = hover 
    ? 'hover:shadow-lg hover:border-gray-300 cursor-pointer' 
    : 'shadow-sm'
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  }
  
  const classes = `${baseClasses} ${hoverClasses} ${paddingClasses[padding]} ${className}`
  
  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  )
})

Card.displayName = 'Card'

// Card sub-components
const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
)

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`font-playfair text-xl font-semibold text-deepBlue ${className}`}>
    {children}
  </h3>
)

const CardContent = ({ children, className = '' }) => (
  <div className={`${className}`}>
    {children}
  </div>
)

const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>
    {children}
  </div>
)

Card.Header = CardHeader
Card.Title = CardTitle
Card.Content = CardContent
Card.Footer = CardFooter

export default Card