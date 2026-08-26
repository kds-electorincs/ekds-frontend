import { useState } from 'react';
import { Box, Typography, Paper, Card, CardContent, useTheme, Button, Select, MenuItem, FormControl } from '@mui/material';
import {
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ComposedChart, Area, AreaChart, Legend, Cell
} from 'recharts';
import { Download as DownloadIcon } from '@mui/icons-material';

const monthlyData = [
  { name: 'Jan', sales: 4000, visitors: 2400, orders: 150 },
  { name: 'Feb', sales: 3000, visitors: 1398, orders: 120 },
  { name: 'Mar', sales: 2000, visitors: 9800, orders: 300 },
  { name: 'Apr', sales: 2780, visitors: 3908, orders: 200 },
  { name: 'May', sales: 1890, visitors: 4800, orders: 180 },
  { name: 'Jun', sales: 2390, visitors: 3800, orders: 190 },
  { name: 'Jul', sales: 3490, visitors: 4300, orders: 250 },
];

const trafficSources = [
  { name: 'Organic', value: 45 },
  { name: 'Direct', value: 25 },
  { name: 'Social', value: 20 },
  { name: 'Referral', value: 10 },
];

const COLORS = ['#243A5E', '#5F86A6', '#8FB6D8', '#CFE3F1'];
  
const topSellingProducts = [
  { name: 'Wireless Headphones', category: 'Electronics', sales: 1240, revenue: '$148,800' },
  { name: 'Ergonomic Office Chair', category: 'Furniture', sales: 850, revenue: '$296,650' },
  { name: 'Minimalist Leather Watch', category: 'Accessories', sales: 620, revenue: '$80,290' },
  { name: 'Smart Home Hub', category: 'Electronics', sales: 540, revenue: '$80,460' },
];

const DashboardAnalytics = () => {
  const theme = useTheme();
  const [dateRange, setDateRange] = useState('7months');

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
            Analytics & Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Deep dive into your store's performance metrics.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small">
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              displayEmpty
              sx={{ borderRadius: 2, bgcolor: 'background.paper', minWidth: 150 }}
            >
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="1month">Last Month</MenuItem>
              <MenuItem value="7months">Last 7 Months</MenuItem>
              <MenuItem value="1year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Mini Metric Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4, width: '100%', justifyContent: 'center' }}>
        {[
          { title: 'Conversion Rate', value: '3.24%', trend: '+0.5%' },
          { title: 'Avg. Order Value', value: '₹124.50', trend: '+$12.00' },
          { title: 'Total Customers', value: '1,845', trend: '+45' },
          { title: 'Bounce Rate', value: '42.3%', trend: '-2.1%' }
        ].map((metric, idx) => (
          <Box key={idx} sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Card sx={{ height: '100%', width: '100%', maxWidth: 320, borderLeft: `4px solid ${theme.palette.primary.main}` }}>
              <CardContent>
                <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                  {metric.title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
                  {metric.value}
                </Typography>
                <Typography variant="body2" color={metric.trend.startsWith('+') && metric.title !== 'Bounce Rate' ? 'success.main' : 'text.secondary'} sx={{ fontWeight: 500 }}>
                  {metric.trend} from last period
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', alignItems: 'center' }}>
        {/* Sales & Orders Overview */}
        <Box sx={{ width: '100%', maxWidth: '1200px' }}>
          <Paper sx={{ p: 4, height: '100%', borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Sales vs Orders
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} tick={{ fill: theme.palette.text.secondary }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary }} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value, name) => [name === 'Sales' ? `$${value}` : value, name]}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar yAxisId="left" dataKey="sales" name="Sales" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} maxBarSize={60} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke={theme.palette.secondary.main} strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        {/* Traffic Sources & Store Traffic */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' }, gap: 4, width: '100%', maxWidth: '1200px' }}>
          {/* Traffic Sources */}
          <Paper sx={{ p: 4, height: '100%', borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Traffic Sources
            </Typography>
            <Box sx={{ height: 350, display: 'auto', flexDirection: 'column' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficSources} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e0e0e0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fill: theme.palette.text.secondary, fontWeight: 500 }} />
                  <RechartsTooltip
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" name="Visitors" radius={[0, 4, 4, 0]} barSize={32}>
                    {trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* Visitor Traffic (Area) */}
          <Paper sx={{ p: 4, height: '100%', borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Store Traffic (Visitors)
            </Typography>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary }} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="visitors" name="Visitors" stroke={theme.palette.secondary.main} fillOpacity={1} fill="url(#colorVisitors)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>
        
        {/* Top Selling Products */}
        <Box sx={{ width: '100%', maxWidth: '1200px' }}>
          <Paper sx={{ p: 4, height: '100%', borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Top Selling Products
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <th style={{ padding: '12px 0', fontWeight: 600, color: theme.palette.text.secondary }}>Product Name</th>
                    <th style={{ padding: '12px 0', fontWeight: 600, color: theme.palette.text.secondary }}>Category</th>
                    <th style={{ padding: '12px 0', fontWeight: 600, color: theme.palette.text.secondary }}>Units Sold</th>
                    <th style={{ padding: '12px 0', fontWeight: 600, color: theme.palette.text.secondary }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topSellingProducts.map((product, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '16px 0', fontWeight: 600 }}>{product.name}</td>
                      <td style={{ padding: '16px 0', color: theme.palette.text.secondary }}>{product.category}</td>
                      <td style={{ padding: '16px 0' }}>{product.sales}</td>
                      <td style={{ padding: '16px 0', fontWeight: 600, color: theme.palette.primary.main }}>{product.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardAnalytics;
