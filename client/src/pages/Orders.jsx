import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
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
    customer: '',
    items: [{ product: '', quantity: 1, price: 0 }],
    status: 'pending',
    notes: '',
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
      setOrders(ordersRes.data)
      setCustomers(customersRes.data)
      setProducts(productsRes.data)
    } catch (error) {
      // Demo data
      setOrders([
        { _id: '1', orderNumber: 'ORD-001', customer: { name: 'Priya Sharma' }, items: [{ product: { name: 'Custom Blouse' }, quantity: 1, price: 1200 }], total: 1200, status: 'completed', createdAt: '2024-01-15' },
        { _id: '2', orderNumber: 'ORD-002', customer: { name: 'Anita Kumar' }, items: [{ product: { name: 'Birthday Cake' }, quantity: 1, price: 800 }], total: 800, status: 'in-progress', createdAt: '2024-01-16' },
        { _id: '3', orderNumber: 'ORD-003', customer: { name: 'Meera Patel' }, items: [{ product: { name: 'Handmade Jewelry' }, quantity: 2, price: 225 }], total: 450, status: 'pending', createdAt: '2024-01-17' },
        { _id: '4', orderNumber: 'ORD-004', customer: { name: 'Kavita Singh' }, items: [{ product: { name: 'Mehendi Service' }, quantity: 1, price: 500 }], total: 500, status: 'pending', createdAt: '2024-01-18' },
      ])
      setCustomers([
        { _id: '1', name: 'Priya Sharma' },
        { _id: '2', name: 'Anita Kumar' },
        { _id: '3', name: 'Meera Patel' },
        { _id: '4', name: 'Kavita Singh' },
      ])
      setProducts([
        { _id: '1', name: 'Custom Blouse', price: 1200 },
        { _id: '2', name: 'Birthday Cake', price: 800 },
        { _id: '3', name: 'Handmade Jewelry', price: 225 },
        { _id: '4', name: 'Mehendi Service', price: 500 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const total = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const orderData = { ...formData, total }
      
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
      // Update locally for demo
      setOrders(orders.map(o => o._id === id ? { ...o, status } : o))
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const openDialog = (order = null) => {
    if (order) {
      setEditingOrder(order)
      setFormData({
        customer: order.customer?._id || '',
        items: order.items || [{ product: '', quantity: 1, price: 0 }],
        status: order.status,
        notes: order.notes || '',
        deliveryDate: order.deliveryDate || ''
      })
    } else {
      setEditingOrder(null)
      setFormData({
        customer: '',
        items: [{ product: '', quantity: 1, price: 0 }],
        status: 'pending',
        notes: '',
        deliveryDate: ''
      })
    }
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingOrder(null)
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: 1, price: 0 }]
    })
  }

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    })
  }

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    
    if (field === 'product') {
      const product = products.find(p => p._id === value)
      if (product) {
        newItems[index].price = product.price
      }
    }
    
    setFormData({ ...formData, items: newItems })
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'outline',
      'in-progress': 'secondary',
      completed: 'default',
      cancelled: 'destructive'
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
                    value={formData.customer} 
                    onValueChange={(value) => setFormData({ ...formData, customer: value })}
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
                  <Label>Order Items</Label>
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Select 
                        value={item.product} 
                        onValueChange={(value) => updateItem(index, 'product', value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(product => (
                            <SelectItem key={product._id} value={product._id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                        className="w-20"
                        min="1"
                        placeholder="Qty"
                      />
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', parseInt(e.target.value))}
                        className="w-24"
                        placeholder="Price"
                      />
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                    className="w-fit"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
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

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Special instructions, measurements, etc."
                  />
                </div>

                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Order Total</span>
                      <span className="text-2xl font-bold">
                        ₹{formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
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
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                  <TableCell>{order.customer?.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {order.items?.map(item => item.product?.name).join(', ')}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ₹{order.total?.toLocaleString()}
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
              {orders.filter(o => o.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {orders.filter(o => o.status === 'in-progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {orders.filter(o => o.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
