import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Package
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line as ChartLine, Bar as ChartBar } from 'react-chartjs-2'
import api from '../services/api'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
)

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0
  })
  const [overview, setOverview] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const statsResponse = await api.get('/dashboard/stats')
      if (statsResponse.data) {
        setStats(statsResponse.data)
      }
    } catch (error) {
      setStats({
        totalCustomers: 156,
        totalOrders: 342,
        totalProducts: 48,
        totalRevenue: 28500
      })
    }

    try {
      const overviewResponse = await api.get('/dashboard/overview')
      if (overviewResponse.data.success) {
        setOverview(overviewResponse.data.data)
      }
    } catch (error) {
      console.log('Overview not available')
    }

    try {
      const predictionResponse = await api.get('/dashboard/prediction')
      if (predictionResponse.data.success) {
        setPrediction(predictionResponse.data.data)
      }
    } catch (error) {
      console.log('Prediction not available')
    }

    setLoading(false)
  }

  // Chart.js data for prediction
  const predictionChartData = prediction?.chartData ? {
    labels: prediction.chartData.labels,
    datasets: [
      {
        label: 'Orders',
        data: prediction.chartData.orders,
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsl(var(--primary) / 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  } : {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Orders',
        data: [40, 30, 50, 45, 60, 55],
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsl(var(--primary) / 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const revenueChartData = prediction?.chartData ? {
    labels: prediction.chartData.labels,
    datasets: [
      {
        label: 'Revenue (₹)',
        data: prediction.chartData.revenue,
        backgroundColor: 'hsl(var(--primary) / 0.8)',
        borderRadius: 4
      }
    ]
  } : {
    labels: ['Tailoring', 'Baking', 'Handicrafts', 'Food', 'Beauty'],
    datasets: [
      {
        label: 'Revenue',
        data: [35000, 25000, 20000, 15000, 5000],
        backgroundColor: 'hsl(var(--primary) / 0.8)',
        borderRadius: 4
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  const statCards = [
    { 
      title: 'Monthly Orders', 
      value: overview?.monthlyOrders || stats.totalOrders, 
      icon: ShoppingBag, 
      change: prediction?.prediction?.trendPercentage ? `${prediction.prediction.trendPercentage > 0 ? '+' : ''}${prediction.prediction.trendPercentage}%` : '+8%',
      positive: prediction?.prediction?.trendPercentage >= 0,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500'
    },
    { 
      title: 'Monthly Revenue', 
      value: `₹${(overview?.monthlyRevenue || stats.totalRevenue).toLocaleString()}`, 
      icon: DollarSign, 
      change: '+15%',
      positive: true,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500'
    },
    { 
      title: 'Pending Deliveries', 
      value: overview?.pendingDeliveries || 12, 
      icon: Clock, 
      change: 'Active',
      positive: true,
      iconBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-500'
    },
    { 
      title: 'Total Customers', 
      value: stats.totalCustomers, 
      icon: Users, 
      change: '+12%',
      positive: true,
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500'
    },
  ]

  const demoProducts = [
    { name: 'Custom Blouse', sold: 45, revenue: 54000 },
    { name: 'Birthday Cake', sold: 32, revenue: 25600 },
    { name: 'Handmade Jewelry', sold: 28, revenue: 12600 },
    { name: 'Saree Stitching', sold: 22, revenue: 33000 },
    { name: 'Homemade Pickles', sold: 18, revenue: 5400 }
  ]

  const demoOrders = [
    { customer: 'Priya Sharma', product: 'Custom Blouse', amount: 1200, status: 'Delivered' },
    { customer: 'Anita Kumar', product: 'Birthday Cake', amount: 800, status: 'Ready' },
    { customer: 'Meera Patel', product: 'Handmade Jewelry', amount: 450, status: 'Pending' }
  ]

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Delivered': return 'default'
      case 'Ready': return 'secondary'
      case 'Pending': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.iconBg}`}>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.positive ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-xs ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Orders Trend</CardTitle>
            <CardDescription>Order history over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartLine data={predictionChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
            <CardDescription>Revenue distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartBar data={revenueChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Sales Prediction */}
      {prediction && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle>AI Sales Prediction</CardTitle>
            </div>
            <CardDescription>Intelligent forecasting based on your sales data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Predicted Orders (Next Week)</p>
                  <p className="text-3xl font-bold text-primary mt-1">
                    {prediction.prediction.predictedOrdersNextWeek}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Confidence: {prediction.prediction.confidence}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Expected Revenue</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    ₹{prediction.prediction.expectedRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on avg order value
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Sales Trend</p>
                  <div className="flex items-center gap-2 mt-1">
                    {prediction.prediction.trend === 'increasing' ? (
                      <TrendingUp className="text-green-500 h-8 w-8" />
                    ) : prediction.prediction.trend === 'decreasing' ? (
                      <TrendingDown className="text-red-500 h-8 w-8" />
                    ) : (
                      <span className="text-2xl">→</span>
                    )}
                    <span className={`text-2xl font-bold ${
                      prediction.prediction.trend === 'increasing' ? 'text-green-600 dark:text-green-400' :
                      prediction.prediction.trend === 'decreasing' ? 'text-red-600 dark:text-red-400' : 'text-foreground'
                    }`}>
                      {prediction.prediction.trend.charAt(0).toUpperCase() + prediction.prediction.trend.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {prediction.prediction.trendPercentage > 0 ? '+' : ''}{prediction.prediction.trendPercentage}% vs last period
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Products & Recent Orders */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Your best performing products this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(overview?.topProducts?.length > 0 ? overview.topProducts : demoProducts).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{product.name || 'Unknown Product'}</p>
                      <p className="text-sm text-muted-foreground">{product.totalQuantity || product.sold} sold</p>
                    </div>
                  </div>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    ₹{(product.totalRevenue || product.revenue)?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(overview?.recentOrders?.length > 0 ? overview.recentOrders : demoOrders).map((order, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {order.customerId?.name || order.customer}
                    </TableCell>
                    <TableCell>{order.productId?.name || order.product}</TableCell>
                    <TableCell>₹{(order.totalPrice || order.amount)?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
