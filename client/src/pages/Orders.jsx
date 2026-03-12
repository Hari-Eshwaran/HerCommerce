import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Filter,
  ShoppingCart,
  Calendar
} from 'lucide-react'
import { orderService, customerService, productService } from '../services/api'

const statusOptions = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Ready', label: 'Ready' },
  { value: 'Delivered', label: 'Delivered' }
]

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editingOrder, setEditingOrder] = useState(null)
  const [formData, setFormData] = useState({
    customerId: '',
    productId: '',
    quantity: 1,
    totalPrice: 0,
    status: 'Pending',
    deliveryDate: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        orderService.getAll(),
        customerService.getAll(),
        productService.getAll()
      ])
      setOrders(ordersRes.data?.data || ordersRes.data || [])
      setCustomers(customersRes.data?.data || customersRes.data || [])
      setProducts(productsRes.data?.data || productsRes.data || [])
    } catch (error) {
      console.error('Failed to load data:', error.message)
      setOrders([])
      setCustomers([])
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const orderData = {
        customerId: formData.customerId,
        productId: formData.productId,
        quantity: parseInt(formData.quantity),
        totalPrice: parseFloat(formData.totalPrice),
        status: formData.status,
        deliveryDate: formData.deliveryDate || undefined
      }
      
      if (editingOrder) {
        await orderService.update(editingOrder._id, orderData)
      } else {
        await orderService.create(orderData)
      }
      loadData()
      closeDialog()
    } catch (error) {
      console.error('Error saving order:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await orderService.delete(id)
        loadData()
      } catch (error) {
        console.error('Error deleting order:', error)
      }
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await orderService.updateStatus(id, status)
      setOrders(orders.map(o => o._id === id ? { ...o, status } : o))
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const openDialog = (order = null) => {
    if (order) {
      setEditingOrder(order)
      setFormData({
        customerId: order.customerId?._id || '',
        productId: order.productId?._id || '',
        quantity: order.quantity || 1,
        totalPrice: order.totalPrice || 0,
        status: order.status || 'Pending',
        deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : ''
      })
    } else {
      setEditingOrder(null)
      setFormData({
        customerId: '',
        productId: '',
        quantity: 1,
        totalPrice: 0,
        status: 'Pending',
        deliveryDate: ''
      })
    }
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingOrder(null)
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const variants = {
      Pending: 'outline',
      Ready: 'secondary',
      Delivered: 'default'
    }
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Track and manage customer orders</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingOrder ? 'Edit Order' : 'Create New Order'}</DialogTitle>
                <DialogDescription>
                  {editingOrder ? 'Update order details' : 'Create a new customer order'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select 
                    value={formData.customerId} 
                    onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer._id} value={customer._id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Product</Label>
                  <Select 
                    value={formData.productId} 
                    onValueChange={(value) => {
                      const product = products.find(p => p._id === value)
                      setFormData({ 
                        ...formData, 
                        productId: value,
                        totalPrice: product ? product.price * formData.quantity : formData.totalPrice
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product._id} value={product._id}>
                          {product.name} - ₹{product.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => {
                        const qty = parseInt(e.target.value) || 1
                        const product = products.find(p => p._id === formData.productId)
                        setFormData({ 
                          ...formData, 
                          quantity: qty,
                          totalPrice: product ? product.price * qty : formData.totalPrice
                        })
                      }}
                      min="1"
                      placeholder="1"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="totalPrice">Total Price (₹)</Label>
                    <Input
                      id="totalPrice"
                      type="number"
                      value={formData.totalPrice}
                      onChange={(e) => setFormData({ ...formData, totalPrice: parseFloat(e.target.value) || 0 })}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deliveryDate">Delivery Date</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    />
                  </div>
                </div>

                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Order Total</span>
                      <span className="text-2xl font-bold">
                        ₹{(formData.totalPrice || 0).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingOrder ? 'Update Order' : 'Create Order'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>View and manage all customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">{order.customerId?.name || '—'}</TableCell>
                  <TableCell>{order.productId?.name || '—'}</TableCell>
                  <TableCell className="text-right">{order.quantity}</TableCell>
                  <TableCell className="text-right font-semibold">
                    ₹{(order.totalPrice || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={order.status} 
                      onValueChange={(value) => updateStatus(order._id, value)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue>
                          {getStatusBadge(order.status)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openDialog(order)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(order._id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders found</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => openDialog()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create your first order
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {orders.filter(o => o.status === 'Pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {orders.filter(o => o.status === 'Ready').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Delivered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {orders.filter(o => o.status === 'Delivered').length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
