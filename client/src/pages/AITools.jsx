import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Bot,
  Send,
  Mic,
  MicOff,
  Camera,
  Upload,
  Sparkles,
  DollarSign,
  TrendingUp,
  FileText,
  Target,
  MessageSquare,
  Loader2,
  Image as ImageIcon
} from 'lucide-react'
import { aiService } from '../services/api'

const aiTools = [
  {
    id: 'chat',
    name: 'Business Assistant',
    description: 'Chat with AI for business advice',
    icon: MessageSquare,
  },
  {
    id: 'photo',
    name: 'Photo → Product',
    description: 'Generate product from photo',
    icon: Camera,
  },
  {
    id: 'voice',
    name: 'Voice Order',
    description: 'Create orders by voice',
    icon: Mic,
  },
  {
    id: 'pricing',
    name: 'Smart Pricing',
    description: 'AI pricing suggestions',
    icon: DollarSign,
  },
  {
    id: 'demand',
    name: 'Demand Forecast',
    description: 'Predict future demand',
    icon: TrendingUp,
  },
  {
    id: 'description',
    name: 'Product Descriptions',
    description: 'Generate compelling copy',
    icon: FileText,
  },
  {
    id: 'marketing',
    name: 'Marketing Ideas',
    description: 'Personalized marketing tips',
    icon: Target,
  }
]

export default function AITools() {
  const [selectedTool, setSelectedTool] = useState('chat')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  
  // Voice state
  const [isRecording, setIsRecording] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  
  // Photo state
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef(null)

  // Tool inputs
  const [pricingInput, setPricingInput] = useState({ productName: '', cost: '', targetMargin: '30' })
  const [descriptionInput, setDescriptionInput] = useState({ productName: '', category: '', keywords: '' })
  const [marketingInput, setMarketingInput] = useState({ businessType: '', targetAudience: '', platform: 'whatsapp' })

  // Chat handler
  const handleChat = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage = chatInput
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setChatInput('')
    setLoading(true)

    try {
      const response = await aiService.chat(userMessage)
      setChatMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }])
    } catch (error) {
      const demoReplies = [
        "Great question! Based on your business type, I'd recommend focusing on building a strong local presence first. Consider joining local women's business groups and collaborating with complementary businesses.",
        "To increase your profit margins, try these strategies: 1) Bundle products together, 2) Offer premium customization options, 3) Create loyalty programs for repeat customers.",
        "For managing orders better, I suggest: maintaining a simple order tracker, setting clear delivery timelines with customers, and batch-processing similar orders to save time.",
      ]
      setChatMessages(prev => [...prev, { role: 'assistant', content: demoReplies[Math.floor(Math.random() * demoReplies.length)] }])
    } finally {
      setLoading(false)
    }
  }

  // Voice handler
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false)
      // Demo transcript
      setVoiceTranscript("Create order for Priya Sharma, one custom blouse, price 1200 rupees, delivery next Friday")
    } else {
      setIsRecording(true)
      setVoiceTranscript('')
    }
  }

  // Photo handler
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoAnalyze = async () => {
    setLoading(true)
    // Demo result
    setTimeout(() => {
      setResult(`## Product Analysis

**Detected Items:**
- Custom embroidered blouse
- Traditional design pattern
- Premium fabric quality

**Suggested Product Details:**
- Category: Tailoring
- Estimated Cost: ₹400-500
- Suggested Price: ₹1,200-1,500

**Auto-generated Description:**
Beautiful hand-embroidered blouse with traditional motifs. Perfect for festive occasions and celebrations.

**Recommended Tags:**
#handmade #embroidery #traditional #festive`)
      setLoading(false)
    }, 2000)
  }

  // Tool action handler
  const handleToolAction = async () => {
    setLoading(true)
    setResult('')

    setTimeout(() => {
      switch (selectedTool) {
        case 'pricing':
          setResult(generatePricingResult(pricingInput))
          break
        case 'description':
          setResult(generateDescriptionResult(descriptionInput))
          break
        case 'marketing':
          setResult(generateMarketingResult(marketingInput))
          break
        case 'demand':
          setResult(generateDemandResult())
          break
      }
      setLoading(false)
    }, 1500)
  }

  // Result generators
  const generatePricingResult = (input) => {
    const cost = parseFloat(input.cost) || 100
    const margin = parseFloat(input.targetMargin) || 30
    const suggestedPrice = Math.round(cost / (1 - margin / 100))
    
    return `## Pricing Analysis for ${input.productName || 'Your Product'}

**Cost:** ₹${cost}  |  **Target Margin:** ${margin}%

### Recommended Prices:

| Strategy | Price | Profit | Margin |
|----------|-------|--------|--------|
| Budget | ₹${Math.round(cost * 1.3)} | ₹${Math.round(cost * 0.3)} | 23% |
| **Standard** | **₹${suggestedPrice}** | **₹${suggestedPrice - cost}** | **${margin}%** |
| Premium | ₹${Math.round(suggestedPrice * 1.2)} | ₹${Math.round(suggestedPrice * 1.2 - cost)} | ${Math.round((1 - cost/(suggestedPrice * 1.2)) * 100)}% |

**Tips:** Start with standard pricing, offer premium for rush orders.`
  }

  const generateDescriptionResult = (input) => {
    return `## Generated Descriptions for ${input.productName || 'Your Product'}

### English:
Discover the perfect ${input.productName || 'handcrafted item'} made with love. Each piece is unique, created to bring joy to your home!

### WhatsApp Message:
🌟 *New Arrival!* 🌟
${input.productName || 'Beautiful Product'}
✨ Handcrafted with love
💝 Perfect for gifting
📦 Home delivery available
💬 DM to order!

### Instagram Caption:
✨ Introducing our latest creation! ✨
${input.productName || 'This beautiful piece'} is handcrafted with attention to every detail.
#handmade #homemade #supportlocal`
  }

  const generateMarketingResult = (input) => {
    return `## Marketing Ideas for ${input.businessType || 'Your Business'}

### ${input.platform === 'whatsapp' ? 'WhatsApp' : input.platform === 'instagram' ? 'Instagram' : 'Local'} Strategy

**Quick Wins:**
1. Post 3-4 status updates daily showing your work
2. Share customer testimonials
3. Behind-the-scenes content

**Promotion Ideas:**
- 🎁 "Refer a friend" - 10% off for both
- 🎂 Birthday month specials
- 🎊 Festival season bundles`
  }

  const generateDemandResult = () => {
    return `## Demand Forecast

### Next 3 Months:

| Month | Orders | Trend |
|-------|--------|-------|
| This Month | 35-40 | 📈 +15% |
| Next Month | 45-55 | 📈 +30% |
| Month After | 30-35 | 📉 -10% |

### Recommendations:
1. Stock up on materials for top items
2. Consider temporary help for peak season
3. Promote advance bookings`
  }

  const renderToolContent = () => {
    switch (selectedTool) {
      case 'chat':
        return (
          <Card className="h-[500px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Business Assistant
              </CardTitle>
              <CardDescription>Ask anything about running your home business</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4 mb-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">Start a conversation!</p>
                    <div className="mt-4 space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setChatInput("How can I increase my profit margins?")}
                        className="w-full max-w-xs"
                      >
                        How can I increase my profit margins?
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setChatInput("Best way to manage customer orders?")}
                        className="w-full max-w-xs"
                      >
                        Best way to manage customer orders?
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-2 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-muted px-4 py-2 rounded-lg">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
              <form onSubmit={handleChat} className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your question..."
                  disabled={loading}
                />
                <Button type="submit" disabled={loading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )

      case 'photo':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Photo → Product Generator
              </CardTitle>
              <CardDescription>Upload a photo to auto-generate product details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Click to upload or drag & drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handlePhotoAnalyze}
                disabled={!selectedImage || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze & Generate Product
                  </>
                )}
              </Button>
              {result && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 'voice':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary" />
                Voice Order Entry
              </CardTitle>
              <CardDescription>Create orders by speaking naturally</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <Button
                  size="lg"
                  variant={isRecording ? "destructive" : "default"}
                  className="h-24 w-24 rounded-full"
                  onClick={toggleRecording}
                >
                  {isRecording ? (
                    <MicOff className="h-10 w-10" />
                  ) : (
                    <Mic className="h-10 w-10" />
                  )}
                </Button>
                <p className="mt-4 text-muted-foreground">
                  {isRecording ? "Recording... Click to stop" : "Click to start recording"}
                </p>
                {isRecording && (
                  <div className="flex justify-center gap-1 mt-4">
                    <div className="w-2 h-8 bg-primary rounded animate-pulse" />
                    <div className="w-2 h-12 bg-primary rounded animate-pulse" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-6 bg-primary rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-10 bg-primary rounded animate-pulse" style={{ animationDelay: '0.3s' }} />
                    <div className="w-2 h-4 bg-primary rounded animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                )}
              </div>
              {voiceTranscript && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Transcript</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{voiceTranscript}</p>
                    <div className="mt-4 p-3 bg-background rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-2">Extracted Order:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>Customer:</strong> Priya Sharma</div>
                        <div><strong>Product:</strong> Custom Blouse</div>
                        <div><strong>Price:</strong> ₹1,200</div>
                        <div><strong>Delivery:</strong> Next Friday</div>
                      </div>
                    </div>
                    <Button className="w-full mt-4">
                      Create Order
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )

      case 'pricing':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Smart Pricing
              </CardTitle>
              <CardDescription>Get AI-powered pricing suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Product Name</Label>
                <Input
                  value={pricingInput.productName}
                  onChange={(e) => setPricingInput({ ...pricingInput, productName: e.target.value })}
                  placeholder="e.g., Custom Blouse"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Cost Price (₹)</Label>
                  <Input
                    type="number"
                    value={pricingInput.cost}
                    onChange={(e) => setPricingInput({ ...pricingInput, cost: e.target.value })}
                    placeholder="500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Target Margin (%)</Label>
                  <Input
                    type="number"
                    value={pricingInput.targetMargin}
                    onChange={(e) => setPricingInput({ ...pricingInput, targetMargin: e.target.value })}
                    placeholder="30"
                  />
                </div>
              </div>
              <Button className="w-full" onClick={handleToolAction} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate Pricing
              </Button>
              {result && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 'description':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Product Descriptions
              </CardTitle>
              <CardDescription>Generate compelling product copy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Product Name</Label>
                <Input
                  value={descriptionInput.productName}
                  onChange={(e) => setDescriptionInput({ ...descriptionInput, productName: e.target.value })}
                  placeholder="e.g., Handmade Jewelry Set"
                />
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={descriptionInput.category}
                  onValueChange={(value) => setDescriptionInput({ ...descriptionInput, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tailoring">Tailoring</SelectItem>
                    <SelectItem value="baking">Baking</SelectItem>
                    <SelectItem value="handicrafts">Handicrafts</SelectItem>
                    <SelectItem value="food">Homemade Food</SelectItem>
                    <SelectItem value="beauty">Beauty Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Keywords</Label>
                <Input
                  value={descriptionInput.keywords}
                  onChange={(e) => setDescriptionInput({ ...descriptionInput, keywords: e.target.value })}
                  placeholder="traditional, handcrafted, elegant"
                />
              </div>
              <Button className="w-full" onClick={handleToolAction} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate Descriptions
              </Button>
              {result && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 'marketing':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Marketing Ideas
              </CardTitle>
              <CardDescription>Personalized marketing suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Business Type</Label>
                <Input
                  value={marketingInput.businessType}
                  onChange={(e) => setMarketingInput({ ...marketingInput, businessType: e.target.value })}
                  placeholder="e.g., Home Bakery"
                />
              </div>
              <div className="grid gap-2">
                <Label>Target Audience</Label>
                <Input
                  value={marketingInput.targetAudience}
                  onChange={(e) => setMarketingInput({ ...marketingInput, targetAudience: e.target.value })}
                  placeholder="e.g., Working women, Families"
                />
              </div>
              <div className="grid gap-2">
                <Label>Platform</Label>
                <Select
                  value={marketingInput.platform}
                  onValueChange={(value) => setMarketingInput({ ...marketingInput, platform: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="local">Local/Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleToolAction} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate Ideas
              </Button>
              {result && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 'demand':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Demand Forecast
              </CardTitle>
              <CardDescription>Predict future demand using AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Generate demand forecast based on your historical data and market trends
                </p>
              </div>
              <Button className="w-full" onClick={handleToolAction} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate Forecast
              </Button>
              {result && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Tools</h1>
        <p className="text-muted-foreground">Smart tools to help grow your business</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tools Sidebar */}
        <div className="space-y-2">
          {aiTools.map((tool) => (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? "default" : "ghost"}
              className="w-full justify-start h-auto py-3"
              onClick={() => {
                setSelectedTool(tool.id)
                setResult('')
              }}
            >
              <tool.icon className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">{tool.name}</div>
                <div className="text-xs opacity-70">{tool.description}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Tool Content */}
        <div className="lg:col-span-3">
          {renderToolContent()}
        </div>
      </div>
    </div>
  )
}
