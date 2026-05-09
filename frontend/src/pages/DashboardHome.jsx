
import { 
  Typography, Grid, Paper, Box, Card, CardContent, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
  Avatar, IconButton, useTheme
} from '@mui/material';
import { 
  TrendingUp, TrendingDown, ShoppingCart, 
  Inventory, AttachMoney, PeopleAlt,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const revenueData = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 4500 },
  { name: 'May', revenue: 6000 },
  { name: 'Jun', revenue: 5500 },
  { name: 'Jul', revenue: 7000 },
];

const orderCategoryData = [
  { name: 'Electronics', value: 400 },
  { name: 'Clothing', value: 300 },
  { name: 'Home & Garden', value: 300 },
  { name: 'Accessories', value: 200 },
];

const COLORS = ['#243A5E', '#5F86A6', '#8FB6D8', '#CFE3F1'];

const recentOrders = [
  { id: 'ORD-001', customer: 'Acme Corp', date: '2026-05-06', total: '$1,250.00', status: 'Completed' },
  { id: 'ORD-002', customer: 'Global Tech', date: '2026-05-05', total: '$850.00', status: 'Processing' },
  { id: 'ORD-003', customer: 'Stark Industries', date: '2026-05-04', total: '$3,400.00', status: 'Pending' },
  { id: 'ORD-004', customer: 'Wayne Enterprises', date: '2026-05-03', total: '$450.00', status: 'Completed' },
  { id: 'ORD-005', customer: 'Initech', date: '2026-05-02', total: '$1,100.00', status: 'Cancelled' },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'success';
    case 'Processing': return 'info';
    case 'Pending': return 'warning';
    case 'Cancelled': return 'error';
    default: return 'default';
  }
};

const DashboardHome = () => {
  const theme = useTheme();

  const kpis = [
    { title: 'Total Revenue', value: '$84,500', trend: '+12.5%', isUp: true, icon: <AttachMoney sx={{ color: '#fff' }} />, color: theme.palette.primary.main },
    { title: 'Active Orders', value: '142', trend: '+5.2%', isUp: true, icon: <ShoppingCart sx={{ color: '#fff' }} />, color: theme.palette.secondary.main },
    { title: 'Total Users', value: '1,250', trend: '-2.4%', isUp: false, icon: <PeopleAlt sx={{ color: '#fff' }} />, color: '#4caf50' },
    { title: 'Low Stock Items', value: '28', trend: '+14%', isUp: false, icon: <Inventory sx={{ color: '#fff' }} />, color: '#f44336' },
  ];

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, Admin. Here's what's happening with your store today.
          </Typography>
        </Box>
      </Box>
      
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography color="text.secondary" variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }} gutterBottom>
                      {kpi.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {kpi.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: kpi.color, width: 48, height: 48, boxShadow: `0 4px 12px ${kpi.color}40` }}>
                    {kpi.icon}
                  </Avatar>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {kpi.isUp ? 
                    <TrendingUp sx={{ color: 'success.main', fontSize: 20, mr: 0.5 }} /> : 
                    <TrendingDown sx={{ color: 'error.main', fontSize: 20, mr: 0.5 }} />
                  }
                  <Typography variant="body2" sx={{ color: kpi.isUp ? 'success.main' : 'error.main', fontWeight: 600 }}>
                    {kpi.trend}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    vs last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Revenue Overview
              </Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: theme.palette.primary.main, fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke={theme.palette.primary.main} strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Category Chart */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Sales by Category
            </Typography>
            <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={orderCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {orderCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mt: 1 }}>
                {orderCategoryData.map((entry, index) => (
                  <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[index % COLORS.length], mr: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                      {entry.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Orders Table */}
      <Paper sx={{ borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Orders
          </Typography>
          <Typography variant="button" color="primary" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
            View All
          </Typography>
        </Box>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentOrders.map((row) => (
                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                    {row.id}
                  </TableCell>
                  <TableCell>{row.customer}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.total}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      color={getStatusColor(row.status)}
                      size="small"
                      sx={{ fontWeight: 600, borderRadius: 1.5, px: 1 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small">
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default DashboardHome;
