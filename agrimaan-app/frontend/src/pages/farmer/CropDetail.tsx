import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  LinearProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import GrassIcon from '@mui/icons-material/Grass';
import BugReportIcon from '@mui/icons-material/BugReport';
import TimelineIcon from '@mui/icons-material/Timeline';
import WarningIcon from '@mui/icons-material/Warning';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`crop-tabpanel-${index}`}
      aria-labelledby={`crop-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Mock crop data
const mockCrop = {
  id: 1,
  name: 'Wheat',
  variety: 'Hard Red Winter',
  plantedArea: '45 acres',
  plantingDate: '2024-03-15',
  harvestDate: '2024-08-10',
  status: 'Growing',
  health: 'Good',
  growthStage: 'Heading',
  daysToHarvest: 75,
  growthProgress: 65,
  fields: [
    { id: 1, name: 'North Field', area: '25 acres', health: 'Good' },
    { id: 2, name: 'South Field', area: '20 acres', health: 'Excellent' }
  ],
  waterRequirements: {
    current: '1.2 inches/week',
    total: '18 inches/season',
    nextIrrigation: '2024-06-05'
  },
  nutrientLevels: {
    nitrogen: { value: 65, status: 'Adequate' },
    phosphorus: { value: 80, status: 'Optimal' },
    potassium: { value: 55, status: 'Low' },
    ph: { value: 6.8, status: 'Optimal' }
  },
  issues: [
    { id: 1, type: 'Pest', description: 'Aphid infestation detected', severity: 'Medium', reportedDate: '2024-05-10', status: 'In Progress' },
    { id: 2, type: 'Disease', description: 'Early signs of rust', severity: 'Low', reportedDate: '2024-05-15', status: 'Monitoring' }
  ],
  growthHistory: [
    { date: '2024-03-15', stage: 'Planting', notes: 'Planted in optimal conditions' },
    { date: '2024-04-01', stage: 'Emergence', notes: 'Good germination rate observed' },
    { date: '2024-04-20', stage: 'Tillering', notes: 'Healthy development' },
    { date: '2024-05-15', stage: 'Jointing', notes: 'Applied nitrogen fertilizer' },
    { date: '2024-06-01', stage: 'Heading', notes: 'Currently in this stage' }
  ]
};

const CropDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [crop] = useState(mockCrop);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // In a real app, you would fetch the crop data based on the ID
    console.log(`Fetching crop with ID: ${id}`);
    // For now, we're using mock data
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Growing':
        return 'success';
      case 'Harvested':
        return 'primary';
      case 'Planned':
        return 'info';
      case 'Problem':
        return 'error';
      default:
        return 'default';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Excellent':
        return 'success';
      case 'Good':
        return 'info';
      case 'Fair':
        return 'warning';
      case 'Poor':
        return 'error';
      default:
        return 'default';
    }
  };

  const getNutrientStatusColor = (status: string) => {
    switch (status) {
      case 'Optimal':
        return 'success';
      case 'Adequate':
        return 'info';
      case 'Low':
        return 'warning';
      case 'Deficient':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to="/crops"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Crops
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
        >
          Edit Crop
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>
        {crop.name} <Typography component="span" variant="h6" color="text.secondary">({crop.variety})</Typography>
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Chip 
          label={crop.status} 
          color={getStatusColor(crop.status) as any} 
        />
        <Chip 
          label={crop.health} 
          color={getHealthColor(crop.health) as any} 
        />
        <Chip 
          label={`Stage: ${crop.growthStage}`} 
          color="primary" 
          variant="outlined" 
        />
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Crop Information</Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Planted Area" secondary={crop.plantedArea} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Planting Date" secondary={crop.plantingDate} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Expected Harvest" secondary={crop.harvestDate} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Days to Harvest" secondary={`${crop.daysToHarvest} days`} />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Growth Progress</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" value={crop.growthProgress} sx={{ height: 10, borderRadius: 5 }} />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">{`${crop.growthProgress}%`}</Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Current Stage: {crop.growthStage}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="crop details tabs">
            <Tab label="Fields" icon={<GrassIcon />} iconPosition="start" />
            <Tab label="Water" icon={<WaterDropIcon />} iconPosition="start" />
            <Tab label="Nutrients" icon={<WbSunnyIcon />} iconPosition="start" />
            <Tab label="Issues" icon={<BugReportIcon />} iconPosition="start" />
            <Tab label="Growth Timeline" icon={<TimelineIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2}>
            {crop.fields.map((field) => (
              <Grid item xs={12} sm={6} md={4} key={field.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{field.name}</Typography>
                    <Typography variant="body2" color="text.secondary">Area: {field.area}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Health: 
                      <Chip 
                        label={field.health} 
                        color={getHealthColor(field.health) as any} 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      component={Link}
                      to={`/fields/${field.id}`}
                      sx={{ mt: 2 }}
                    >
                      View Field
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Current Requirement</Typography>
                  <Typography variant="h4">{crop.waterRequirements.current}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Season Total</Typography>
                  <Typography variant="h4">{crop.waterRequirements.total}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Next Irrigation</Typography>
                  <Typography variant="h4">{crop.waterRequirements.nextIrrigation}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={2}>
            {Object.entries(crop.nutrientLevels).map(([key, value]) => (
              <Grid item xs={12} sm={6} md={3} key={key}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Typography>
                    <Typography variant="h4">{typeof value === 'object' ? value.value : value}</Typography>
                    {typeof value === 'object' && (
                      <Chip 
                        label={value.status} 
                        color={getNutrientStatusColor(value.status) as any} 
                        size="small" 
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <List>
            {crop.issues.map((issue) => (
              <Paper key={issue.id} sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WarningIcon color={
                    issue.severity === 'High' ? 'error' : 
                    issue.severity === 'Medium' ? 'warning' : 'info'
                  } sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {issue.type}: {issue.description}
                  </Typography>
                </Box>
                <Typography variant="body2">Severity: {issue.severity}</Typography>
                <Typography variant="body2">Reported: {issue.reportedDate}</Typography>
                <Typography variant="body2">Status: {issue.status}</Typography>
              </Paper>
            ))}
          </List>
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <List>
            {crop.growthHistory.map((event, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText 
                    primary={`${event.date}: ${event.stage}`} 
                    secondary={event.notes} 
                  />
                </ListItem>
                {index < crop.growthHistory.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default CropDetail;