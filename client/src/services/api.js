import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // Only redirect if a login page exists; for now just clear the token
      // window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Customer Service
export const customerService = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`)
}

// Product Service
export const productService = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
}

// Order Service
export const orderService = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status })
}

// Dashboard Service
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getSalesData: (period) => api.get(`/dashboard/sales?period=${period}`),
  getRecentOrders: () => api.get('/dashboard/recent-orders')
}

// AI Service
export const aiService = {
  getPricingSuggestion: (data) => api.post('/ai/pricing', data),
  generateDescription: (data) => api.post('/ai/description', data),
  getMarketingIdeas: (data) => api.post('/ai/marketing', data),
  getDemandForecast: (data) => api.post('/ai/demand', data),
  chat: (message) => api.post('/ai/chat', { message }),
  chatbot: (message, history = [], context = null) => api.post('/ai/chatbot', { message, conversationHistory: history, businessContext: context }),
  voiceOrder: (text) => api.post('/ai/voice-order', { text }),
  productVision: (image, imageType = 'base64') => api.post('/ai/product-vision', { image, imageType })
}

export default api
