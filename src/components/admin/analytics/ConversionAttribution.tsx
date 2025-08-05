'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUpIcon,
  DollarSignIcon,
  TargetIcon,
  CalculatorIcon,
  InfoIcon,
  ArrowRightIcon,
  SearchIcon,
  ShareIcon,
  MailIcon,
  ExternalLinkIcon,
  BrainIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TouchPoint {
  source: {
    id: string;
    category: 'organic' | 'direct' | 'social' | 'ai_assistant' | 'referral' | 'email' | 'paid';
    source: string;
    medium: string;
  };
  timestamp: Date;
  page: string;
  weight: number;
  conversionContribution: number;
}

interface ConversionData {
  conversionId: string;
  conversionType: string;
  conversionValue: number;
  currency: string;
  attributionModel: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based';
  touchpoints: TouchPoint[];
  primaryAttribution: TouchPoint['source'];
  assistingChannels: TouchPoint['source'][];
}

interface ChannelPerformance {
  channel: string;
  category: string;
  conversions: number;
  value: number;
  cost: number;
  roi: number;
  firstTouch: number;
  lastTouch: number;
  assisted: number;
}

interface ConversionAttributionProps {
  dateRange: { from: Date; to: Date };
  filters?: {
    conversionType?: string;
    minValue?: number;
  };
}

const ATTRIBUTION_MODELS = [
  { value: 'first_touch', label: 'First Touch', description: 'Full credit to first interaction' },
  { value: 'last_touch', label: 'Last Touch', description: 'Full credit to last interaction' },
  { value: 'linear', label: 'Linear', description: 'Equal credit across all touchpoints' },
  { value: 'time_decay', label: 'Time Decay', description: 'More credit to recent interactions' },
  { value: 'position_based', label: 'Position Based', description: '40% first, 40% last, 20% middle' }
];

const CATEGORY_ICONS = {
  organic: SearchIcon,
  direct: ExternalLinkIcon,
  social: ShareIcon,
  ai_assistant: BrainIcon,
  referral: ExternalLinkIcon,
  email: MailIcon,
  paid: DollarSignIcon
};

export default function ConversionAttribution({ dateRange, filters }: ConversionAttributionProps) {
  const [conversions, setConversions] = useState<ConversionData[]>([]);
  const [channelPerformance, setChannelPerformance] = useState<ChannelPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>('last_touch');
  const [selectedView, setSelectedView] = useState<'overview' | 'channels' | 'journeys'>('overview');

  useEffect(() => {
    fetchAttributionData();
  }, [dateRange, filters, selectedModel]);

  const fetchAttributionData = async () => {
    try {
      setLoading(true);
      
      // Fetch attribution data
      const response = await fetch('/api/analytics/advanced?' + new URLSearchParams({
        type: 'attribution',
        start: dateRange.from.toISOString(),
        end: dateRange.to.toISOString(),
        model: selectedModel,
        ...filters
      }));
      
      if (response.ok) {
        const data = await response.json();
        
        // Process conversion data with mock data for demonstration
        const mockConversions: ConversionData[] = [
          {
            conversionId: 'conv_001',
            conversionType: 'contact_form',
            conversionValue: 150,
            currency: 'USD',
            attributionModel: selectedModel as any,
            touchpoints: [
              {
                source: { id: 'google', category: 'organic', source: 'Google', medium: 'organic' },
                timestamp: new Date(),
                page: '/',
                weight: 0.4,
                conversionContribution: 60
              },
              {
                source: { id: 'chatgpt', category: 'ai_assistant', source: 'ChatGPT', medium: 'ai_assistant' },
                timestamp: new Date(),
                page: '/courses',
                weight: 0.6,
                conversionContribution: 90
              }
            ],
            primaryAttribution: { id: 'chatgpt', category: 'ai_assistant', source: 'ChatGPT', medium: 'ai_assistant' },
            assistingChannels: [{ id: 'google', category: 'organic', source: 'Google', medium: 'organic' }]
          }
        ];
        
        setConversions(mockConversions);
        
        // Calculate channel performance
        const mockChannelPerformance: ChannelPerformance[] = [
          {
            channel: 'Google',
            category: 'organic',
            conversions: 25,
            value: 3750,
            cost: 0,
            roi: 100,
            firstTouch: 15,
            lastTouch: 8,
            assisted: 12
          },
          {
            channel: 'ChatGPT',
            category: 'ai_assistant',
            conversions: 18,
            value: 2700,
            cost: 0,
            roi: 100,
            firstTouch: 5,
            lastTouch: 12,
            assisted: 8
          },
          {
            channel: 'Facebook',
            category: 'social',
            conversions: 12,
            value: 1800,
            cost: 500,
            roi: 260,
            firstTouch: 8,
            lastTouch: 3,
            assisted: 6
          }
        ];
        
        setChannelPerformance(mockChannelPerformance);
      }
    } catch (error) {
      console.error('Error fetching attribution data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalConversions = () => channelPerformance.reduce((sum, ch) => sum + ch.conversions, 0);
  const getTotalValue = () => channelPerformance.reduce((sum, ch) => sum + ch.value, 0);
  const getAverageValue = () => getTotalConversions() > 0 ? getTotalValue() / getTotalConversions() : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Conversion Attribution</h2>
          <p className="text-muted-foreground">
            Multi-touch attribution analysis with ROI calculation
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ATTRIBUTION_MODELS.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
            <TargetIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalConversions().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Tracked conversions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalValue().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Conversion value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Value</CardTitle>
            <CalculatorIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getAverageValue().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per conversion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attribution Model</CardTitle>
            <InfoIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ATTRIBUTION_MODELS.find(m => m.value === selectedModel)?.label}
            </div>
            <p className="text-xs text-muted-foreground">Current model</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channel Performance</TabsTrigger>
          <TabsTrigger value="journeys">Conversion Journeys</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Attribution Model Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Attribution Model</CardTitle>
              <CardDescription>Choose how conversion credit is distributed across touchpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ATTRIBUTION_MODELS.map((model) => (
                  <div
                    key={model.value}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-colors",
                      selectedModel === model.value 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setSelectedModel(model.value)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{model.label}</h3>
                      {selectedModel === model.value && (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{model.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Converting Channels */}
          <Card>
            <CardHeader>
              <CardTitle>Top Converting Channels</CardTitle>
              <CardDescription>Channels ranked by conversion value</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={channelPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channel" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Channel Performance Analysis</CardTitle>
              <CardDescription>Detailed breakdown of each channel's contribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channelPerformance.map((channel, index) => {
                  const IconComponent = CATEGORY_ICONS[channel.category as keyof typeof CATEGORY_ICONS];
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4" />
                          <span className="font-medium">{channel.channel}</span>
                        </div>
                        <Badge variant="outline">{channel.category}</Badge>
                      </div>

                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{channel.conversions}</div>
                          <div className="text-muted-foreground">Conversions</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="font-medium">${channel.value.toFixed(2)}</div>
                          <div className="text-muted-foreground">Value</div>
                        </div>
                        
                        <div className="text-center">
                          <div className={cn(
                            "font-medium",
                            channel.roi > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {channel.roi.toFixed(1)}%
                          </div>
                          <div className="text-muted-foreground">ROI</div>
                        </div>

                        <div className="text-center">
                          <div className="font-medium">{channel.firstTouch}</div>
                          <div className="text-muted-foreground">First Touch</div>
                        </div>

                        <div className="text-center">
                          <div className="font-medium">{channel.lastTouch}</div>
                          <div className="text-muted-foreground">Last Touch</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journeys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Journeys</CardTitle>
              <CardDescription>Individual conversion paths and touchpoint analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {conversions.map((conversion, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">
                          {conversion.conversionType.replace('_', ' ').toUpperCase()}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Value: ${conversion.conversionValue} • {conversion.touchpoints.length} touchpoints
                        </p>
                      </div>
                      <Badge variant="outline">
                        {conversion.attributionModel.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Customer Journey:</h4>
                      <div className="flex items-center space-x-2">
                        {conversion.touchpoints.map((touchpoint, tIndex) => {
                          const IconComponent = CATEGORY_ICONS[touchpoint.source.category as keyof typeof CATEGORY_ICONS];
                          return (
                            <React.Fragment key={tIndex}>
                              <div className="flex flex-col items-center space-y-1">
                                <div className="flex items-center space-x-1 px-2 py-1 bg-muted rounded text-xs">
                                  <IconComponent className="h-3 w-3" />
                                  <span>{touchpoint.source.source}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {(touchpoint.weight * 100).toFixed(0)}% credit
                                </div>
                                <div className="text-xs font-medium">
                                  ${touchpoint.conversionContribution.toFixed(2)}
                                </div>
                              </div>
                              {tIndex < conversion.touchpoints.length - 1 && (
                                <ArrowRightIcon className="h-3 w-3 text-muted-foreground" />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}