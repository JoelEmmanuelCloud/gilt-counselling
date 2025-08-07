// components/ui/Loading.js
export default function Loading({ message = "Loading...", size = "large" }) {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-8 w-8", 
    large: "h-12 w-12"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-gold mx-auto mb-4 ${sizeClasses[size]}`}></div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  )
}

// Usage in your booking page or other protected pages
// import Loading from '@/components/ui/Loading'
// 
// if (isLoading) {
//   return <Loading message="Setting up your account..." />
// }