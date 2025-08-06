// components/ui/DashboardCard.js
export default function DashboardCard({ title, value, change, icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-deepBlue">{value}</p>
          {change && (
            <p className={`text-sm ${change.positive ? 'text-green-600' : 'text-red-600'}`}>
              {change.positive ? '↗' : '↘'} {change.value}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
