import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  FiHome, 
  FiUsers, 
  FiShoppingBag, 
  FiPackage, 
  FiCpu,
  FiMenu,
  FiX
} from 'react-icons/fi'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: FiHome },
  { name: 'Customers', href: '/customers', icon: FiUsers },
  { name: 'Orders', href: '/orders', icon: FiShoppingBag },
  { name: 'Products', href: '/products', icon: FiPackage },
  { name: 'AI Tools', href: '/ai-tools', icon: FiCpu },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-30 h-full w-64 bg-white shadow-lg transform transition-transform duration-300
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-primary-600">HerCommerce</h1>
          <button 
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors duration-200
                  ${isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-semibold">HC</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Business Owner</p>
              <p className="text-xs text-gray-500">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <button 
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <div className="text-sm text-gray-500">
            Smart Home Business Support System
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
