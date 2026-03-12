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
  Image,
  Tag,
  Package
} from 'lucide-react'
import { productService } from '../services/api'

const categories = [
  'Tailoring',
  'Baking',
  'Handicrafts',
  'Homemade Food',
  'Beauty Services'
]

const units = [
  { value: 'piece', label: 'Piece' },
  { value: 'set', label: 'Set' },
  { value: 'kg', label: 'Kg' },
  { value: 'g', label: 'Gram' },
  { value: 'jar', label: 'Jar' },
  { value: 'box', label: 'Box' },
  { value: 'service', label: 'Service' }
]

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    cost: '',
    stock: '',
    unit: 'piece',
    image: ''
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await productService.getAll()
      setProducts(response.data)
    } catch (error) {
      // Demo data
      setProducts([
        { _id: '1', name: 'Custom Blouse', description: 'Hand-stitched custom blouse', price: 1200, cost: 400, category: 'Tailoring', stock: 5, unit: 'piece' },
        { _id: '2', name: 'Birthday Cake', description: 'Custom decorated birthday cake', price: 800, cost: 300, category: 'Baking', stock: 0, unit: 'piece' },
        { _id: '3', name: 'Handmade Jewelry Set', description: 'Traditional handmade jewelry', price: 450, cost: 150, category: 'Handicrafts', stock: 12, unit: 'set' },
        { _id: '4', name: 'Homemade Pickle (500g)', description: 'Traditional homemade pickle', price: 200, cost: 80, category: 'Homemade Food', stock: 20, unit: 'jar' },
        { _id: '5', name: 'Bridal Mehendi', description: 'Full bridal mehendi service', price: 2500, cost: 200, category: 'Beauty Services', stock: 99, unit: 'service' },
        { _id: '6', name: 'Salwar Suit', description: 'Custom stitched salwar suit', price: 2000, cost: 700, category: 'Tailoring', stock: 3, unit: 'piece' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        await productService.update(editingProduct._id, formData)
      } else {
        await productService.create(formData)
      }
      loadProducts()
      closeDialog()
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(id)
        loadProducts()
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  const openDialog = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        category: product.category,
        cost: product.cost || '',
        stock: product.stock || '',
        unit: product.unit || 'piece',
        image: product.image || ''
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        cost: '',
        stock: '',
        unit: 'piece',
        image: ''
      })
    }
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingProduct(null)
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const getProfit = (price, cost) => {
    if (!cost) return 0
    return ((price - cost) / price * 100).toFixed(0)
  }

  const getStockBadge = (stock) => {
    if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>
    if (stock <= 5) return <Badge variant="secondary">Low Stock</Badge>
    return <Badge variant="default">In Stock</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? 'Update product details' : 'Add a new product to your catalog'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Product name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Product description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Selling Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0"
                      required
                      min="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cost">Cost Price (₹)</Label>
                    <Input
                      id="cost"
                      type="number"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select 
                      value={formData.unit} 
                      onValueChange={(value) => setFormData({ ...formData, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map(unit => (
                          <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Update Product' : 'Add Product'}
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product._id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Image className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openDialog(product)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(product._id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Badge variant="secondary" className="mb-2">
                {product.category}
              </Badge>

              <h3 className="font-semibold mt-2">{product.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>

              <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-semibold text-primary">₹{product.price}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cost</p>
                  <p className="font-semibold">₹{product.cost || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Margin</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">{getProfit(product.price, product.cost)}%</p>
                </div>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Stock: {product.stock} {product.unit}s
                </span>
                {getStockBadge(product.stock)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No products found</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => openDialog()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add your first product
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table View */}
      {filteredProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Products</CardTitle>
            <CardDescription>Complete list of your products</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">₹{product.price}</TableCell>
                    <TableCell className="text-right">₹{product.cost || '-'}</TableCell>
                    <TableCell className="text-right text-green-600 dark:text-green-400">{getProfit(product.price, product.cost)}%</TableCell>
                    <TableCell className="text-right">{product.stock} {product.unit}s</TableCell>
                    <TableCell>{getStockBadge(product.stock)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openDialog(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(product._id)}
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
