//app/dashboard/bookings/page.js
'use client'
import AdminLayout from '@/components/dashboard/AdminLayout'
import DashboardAuthWrapper from '@/components/dashboard/DashboardAuthWrapper'
import EnhancedBookingsTable from '@/components/dashboard/BookingsTable'

export default function BookingsPage() {
  return (
    <DashboardAuthWrapper>
      <AdminLayout pageTitle="TidyCal Bookings Management">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-playfair text-3xl font-bold text-deepBlue">
                Booking Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track all TidyCal appointment bookings
              </p>
            </div>
            
            {/* TidyCal Integration Status */}
            <div className="mt-4 sm:mt-0">
              <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm font-medium text-green-800">
                    TidyCal Integration Active
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Auto-sync every 5 minutes
                </p>
              </div>
            </div>
          </div>

          {/* Integration Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="font-playfair text-lg font-semibold text-blue-800 mb-3">
              📊 TidyCal Integration Dashboard
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-blue-700">
                <span>🔄</span>
                <span>Real-time sync with TidyCal bookings</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-700">
                <span>📧</span>
                <span>Send urgent messages to clients</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-700">
                <span>📹</span>
                <span>Direct access to meeting links</span>
              </div>
            </div>
          </div>

          {/* Enhanced Bookings Table */}
          <EnhancedBookingsTable />

          {/* Additional Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* TidyCal Features */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-playfair text-xl font-semibold text-deepBlue mb-4">
                TidyCal Features Available
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <span className="text-green-600">✅</span>
                  <div>
                    <p className="font-medium text-gray-900">Automatic Reminders</p>
                    <p className="text-gray-600">24-hour and 1-hour email reminders handled by TidyCal</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-600">✅</span>
                  <div>
                    <p className="font-medium text-gray-900">Meeting Links</p>
                    <p className="text-gray-600">Automatic Google Meet integration and links</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-600">✅</span>
                  <div>
                    <p className="font-medium text-gray-900">Calendar Sync</p>
                    <p className="text-gray-600">Syncs with your Google Calendar automatically</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-600">✅</span>
                  <div>
                    <p className="font-medium text-gray-900">Client Management</p>
                    <p className="text-gray-600">Client details and booking history tracked</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-playfair text-xl font-semibold text-deepBlue mb-4">
                Admin Actions
              </h3>
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded-lg hover:border-gold hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Manual Sync</h4>
                      <p className="text-sm text-gray-600">Force sync with TidyCal API</p>
                    </div>
                    <span className="text-blue-600">🔄</span>
                  </div>
                </div>
                
                <div className="p-3 border border-gray-200 rounded-lg hover:border-gold hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Urgent Messages</h4>
                      <p className="text-sm text-gray-600">Send important updates to clients</p>
                    </div>
                    <span className="text-orange-600">📧</span>
                  </div>
                </div>
                
                <div className="p-3 border border-gray-200 rounded-lg hover:border-gold hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Meeting Access</h4>
                      <p className="text-sm text-gray-600">Quick access to all meeting rooms</p>
                    </div>
                    <span className="text-green-600">📹</span>
                  </div>
                </div>
                
                <div className="p-3 border border-gray-200 rounded-lg hover:border-gold hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Export Data</h4>
                      <p className="text-sm text-gray-600">Download booking reports</p>
                    </div>
                    <span className="text-purple-600">📊</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-playfair text-lg font-semibold text-yellow-800 mb-3">
              💡 Integration Help
            </h3>
            <div className="text-sm text-yellow-700 space-y-2">
              <p>
                <strong>Sync Issues?</strong> The system automatically syncs every 5 minutes. 
                Use the manual sync button if you need immediate updates.
              </p>
              <p>
                <strong>Missing Bookings?</strong> Check the TidyCal dashboard directly. 
                New bookings may take a few minutes to appear here.
              </p>
              <p>
                <strong>Emergency Contact:</strong> For urgent issues during sessions, 
                use the "Send Message" feature to reach clients immediately.
              </p>
            </div>
          </div>
        </div>
      </AdminLayout>
    </DashboardAuthWrapper>
  )
}