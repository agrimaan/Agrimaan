import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tab,
  Tabs,
  Chip,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  QuestionAnswer as QuestionAnswerIcon,
  LiveHelp as LiveHelpIcon,
  VideoLibrary as VideoLibraryIcon,
  MenuBook as MenuBookIcon,
  ContactSupport as ContactSupportIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Chat as ChatIcon,
  Feedback as FeedbackIcon,
  Assignment as AssignmentIcon,
  Help as HelpIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  Send as SendIcon
} from '@mui/icons-material';

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
      id={`help-tabpanel-${index}`}
      aria-labelledby={`help-tab-${index}`}
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

// FAQ data organized by user role
const faqData = {
  general: [
    {
      question: "What is Agrimaan?",
      answer: "Agrimaan is a comprehensive agricultural platform that connects farmers, buyers, agronomists, investors, and logistics providers. It aims to streamline agricultural operations, improve market access, and promote sustainable farming practices."
    },
    {
      question: "How do I create an account?",
      answer: "To create an account, click on the 'Register' button on the login page. Fill in your details, select your role (farmer, buyer, etc.), and follow the verification process. Once verified, you can log in and start using the platform."
    },
    {
      question: "How do I reset my password?",
      answer: "If you've forgotten your password, click on the 'Forgot Password' link on the login page. Enter your registered email address, and we'll send you instructions to reset your password."
    },
    {
      question: "Is my data secure on Agrimaan?",
      answer: "Yes, we take data security very seriously. All data is encrypted, and we follow industry-standard security practices. We never share your personal information with third parties without your consent."
    },
    {
      question: "How can I contact customer support?",
      answer: "You can contact our customer support team through the 'Contact Us' section in the Help page, via email at support@agrimaan.com, or by calling our toll-free number at 1800-123-4567."
    }
  ],
  farmer: [
    {
      question: "How do I add my fields to the platform?",
      answer: "To add your fields, navigate to the 'Fields' section from your dashboard. Click on 'Add Field', enter the required details such as location, size, soil type, etc., and save the information."
    },
    {
      question: "How do I track my crop growth?",
      answer: "You can track your crop growth by regularly updating the status in the 'Crops' section. You can add details about planting date, growth stage, expected harvest date, and any issues you encounter."
    },
    {
      question: "How do I get advice from agronomists?",
      answer: "You can request advice from agronomists by navigating to the 'Consultations' section and creating a new consultation request. Describe your issue in detail, and an agronomist will respond to your query."
    },
    {
      question: "How do I sell my produce on the marketplace?",
      answer: "To sell your produce, go to the 'Marketplace' section and click on 'Add Product'. Fill in the details about your produce, including quantity, quality, price, and availability. Once approved, your products will be visible to buyers."
    },
    {
      question: "How do I connect sensors to my fields?",
      answer: "To connect sensors, go to the 'Sensors' section and click on 'Add Sensor'. Follow the instructions to set up your sensor device, connect it to the platform, and assign it to a specific field."
    }
  ],
  buyer: [
    {
      question: "How do I find products on the marketplace?",
      answer: "You can browse products on the marketplace by navigating to the 'Marketplace' section. Use filters to narrow down your search by product type, location, price range, etc."
    },
    {
      question: "How do I place an order?",
      answer: "To place an order, add products to your cart by clicking the 'Add to Cart' button on the product page. Once you've added all desired products, go to your cart, review your order, and click 'Checkout' to complete the purchase."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept various payment methods including credit/debit cards, UPI, net banking, and wallet payments. You can manage your payment methods in the 'Payments' section."
    },
    {
      question: "How do I track my orders?",
      answer: "You can track your orders by going to the 'Orders' section. Each order will show its current status, estimated delivery date, and tracking information once it's shipped."
    },
    {
      question: "How do I save products for later?",
      answer: "To save products for later, click the 'Bookmark' or 'Save' button on the product page. You can view all your saved items in the 'Saved Items' section."
    }
  ],
  agronomist: [
    {
      question: "How do I view farmer requests?",
      answer: "You can view farmer consultation requests in the 'Consultations' section. New requests will be highlighted, and you can click on them to view details and respond."
    },
    {
      question: "How do I analyze field data?",
      answer: "To analyze field data, go to the 'Fields' section and select a specific field. You'll see various data points including soil health, moisture levels, and crop performance, which you can analyze and provide recommendations for."
    },
    {
      question: "How do I submit recommendations?",
      answer: "To submit recommendations, navigate to the 'Recommendations' section, create a new recommendation, select the target farmer and field, and provide your detailed advice and suggestions."
    },
    {
      question: "How do I track crop issues?",
      answer: "You can track crop issues in the 'Crop Issues' section. Here, you can view reported issues, diagnose problems, and suggest solutions to farmers."
    },
    {
      question: "How do I access analytics tools?",
      answer: "Analytics tools are available in the 'Analytics' section. Here, you can view comprehensive data visualizations, generate reports, and analyze trends across different farms and crops."
    }
  ],
  investor: [
    {
      question: "How do I find investment opportunities?",
      answer: "You can find investment opportunities by browsing the 'Projects' section. Here, you'll see various agricultural projects seeking investment, with details about expected returns, duration, and risk assessment."
    },
    {
      question: "How do I invest in a project?",
      answer: "To invest in a project, navigate to the project details page and click on 'Invest Now'. Enter the amount you wish to invest, review the terms, and confirm your investment."
    },
    {
      question: "How do I track my investments?",
      answer: "You can track your investments in the 'Portfolio' section. Here, you'll see all your active investments, their current value, and performance metrics."
    },
    {
      question: "How do I view my returns?",
      answer: "To view your returns, go to the 'Returns' section. This shows a detailed breakdown of your investment returns, including past payouts and projected future returns."
    },
    {
      question: "What happens if a project fails?",
      answer: "In case of project failure, our risk management protocols are activated. You'll be notified immediately, and depending on the investment terms, you may receive partial recovery of your investment or compensation as specified in the project agreement."
    }
  ],
  logistics: [
    {
      question: "How do I view delivery requests?",
      answer: "You can view delivery requests in the 'Deliveries' section. New requests will be highlighted, and you can accept or decline them based on your availability."
    },
    {
      question: "How do I update delivery status?",
      answer: "To update delivery status, go to the 'Deliveries' section, select the specific delivery, and update its status (e.g., picked up, in transit, delivered) as you progress."
    },
    {
      question: "How do I optimize my delivery route?",
      answer: "Our system automatically suggests optimized routes for your deliveries. You can view and modify these routes in the 'Deliveries' section by clicking on 'View Route'."
    },
    {
      question: "How do I track my earnings?",
      answer: "You can track your earnings in the 'Earnings' section. This shows a detailed breakdown of your completed deliveries, earnings per delivery, and total earnings over time."
    },
    {
      question: "How do I view my performance metrics?",
      answer: "Your performance metrics are available in the 'Reviews' section. Here, you can see ratings from customers, on-time delivery percentage, and other performance indicators."
    }
  ]
};

// Video tutorial data
const videoTutorials = [
  {
    id: 1,
    title: "Getting Started with Agrimaan",
    description: "Learn the basics of using the Agrimaan platform",
    duration: "5:30",
    thumbnail: "https://img.youtube.com/vi/placeholder1/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=placeholder1",
    category: "general"
  },
  {
    id: 2,
    title: "Managing Your Fields",
    description: "How to add and manage fields in the system",
    duration: "7:45",
    thumbnail: "https://img.youtube.com/vi/placeholder2/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=placeholder2",
    category: "farmer"
  },
  {
    id: 3,
    title: "Placing Orders on Marketplace",
    description: "Step-by-step guide to purchasing products",
    duration: "6:20",
    thumbnail: "https://img.youtube.com/vi/placeholder3/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=placeholder3",
    category: "buyer"
  },
  {
    id: 4,
    title: "Analyzing Crop Data",
    description: "How to use analytics tools for crop analysis",
    duration: "8:15",
    thumbnail: "https://img.youtube.com/vi/placeholder4/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=placeholder4",
    category: "agronomist"
  },
  {
    id: 5,
    title: "Investing in Agricultural Projects",
    description: "Guide to finding and investing in projects",
    duration: "9:30",
    thumbnail: "https://img.youtube.com/vi/placeholder5/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=placeholder5",
    category: "investor"
  },
  {
    id: 6,
    title: "Managing Deliveries",
    description: "How to handle delivery requests efficiently",
    duration: "7:10",
    thumbnail: "https://img.youtube.com/vi/placeholder6/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=placeholder6",
    category: "logistics"
  }
];

// User guides data
const userGuides = [
  {
    id: 1,
    title: "Complete User Manual",
    description: "Comprehensive guide covering all aspects of the platform",
    format: "PDF",
    size: "2.5 MB",
    url: "/docs/agrimaan_user_manual.pdf",
    category: "general"
  },
  {
    id: 2,
    title: "Farmer's Quick Start Guide",
    description: "Essential information for farmers to get started",
    format: "PDF",
    size: "1.2 MB",
    url: "/docs/farmer_quick_start.pdf",
    category: "farmer"
  },
  {
    id: 3,
    title: "Buyer's Marketplace Guide",
    description: "How to navigate and use the marketplace effectively",
    format: "PDF",
    size: "1.5 MB",
    url: "/docs/buyer_marketplace_guide.pdf",
    category: "buyer"
  },
  {
    id: 4,
    title: "Agronomist's Analysis Tools",
    description: "Detailed guide to using analytical tools",
    format: "PDF",
    size: "1.8 MB",
    url: "/docs/agronomist_tools_guide.pdf",
    category: "agronomist"
  },
  {
    id: 5,
    title: "Investor's Project Evaluation",
    description: "How to evaluate and select investment projects",
    format: "PDF",
    size: "1.6 MB",
    url: "/docs/investor_evaluation_guide.pdf",
    category: "investor"
  },
  {
    id: 6,
    title: "Logistics Operations Manual",
    description: "Complete guide to logistics operations",
    format: "PDF",
    size: "1.7 MB",
    url: "/docs/logistics_operations_manual.pdf",
    category: "logistics"
  }
];

const Help: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [faqCategory, setFaqCategory] = useState('general');
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleFaqCategoryChange = (category: string) => {
    setFaqCategory(category);
  };
  
  // Filter videos based on search term
  const filteredVideos = videoTutorials.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    video.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter guides based on search term
  const filteredGuides = userGuides.filter(guide => 
    guide.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    guide.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter FAQs based on search term and category
  const filteredFaqs = faqData[faqCategory as keyof typeof faqData].filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Page Header */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" gutterBottom>
              Help Center
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Find answers, learn how to use the platform, and get support
          </Typography>
        </Grid>

        {/* Search Bar */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            placeholder="Search for help topics, FAQs, videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />
        </Grid>

        {/* Quick Help Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <QuestionAnswerIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    FAQs
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Find answers to commonly asked questions
                  </Typography>
                  <Button 
                    variant="text" 
                    color="primary" 
                    sx={{ mt: 2 }}
                    onClick={() => setTabValue(0)}
                  >
                    View FAQs
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <VideoLibraryIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Video Tutorials
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Learn through step-by-step video guides
                  </Typography>
                  <Button 
                    variant="text" 
                    color="primary" 
                    sx={{ mt: 2 }}
                    onClick={() => setTabValue(1)}
                  >
                    Watch Videos
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <MenuBookIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    User Guides
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Download comprehensive documentation
                  </Typography>
                  <Button 
                    variant="text" 
                    color="primary" 
                    sx={{ mt: 2 }}
                    onClick={() => setTabValue(2)}
                  >
                    View Guides
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ContactSupportIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Contact Support
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Get help from our support team
                  </Typography>
                  <Button 
                    variant="text" 
                    color="primary" 
                    sx={{ mt: 2 }}
                    onClick={() => setTabValue(3)}
                  >
                    Contact Us
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="help tabs">
                <Tab label="FAQs" icon={<QuestionAnswerIcon />} iconPosition="start" />
                <Tab label="Video Tutorials" icon={<VideoLibraryIcon />} iconPosition="start" />
                <Tab label="User Guides" icon={<MenuBookIcon />} iconPosition="start" />
                <Tab label="Contact Support" icon={<ContactSupportIcon />} iconPosition="start" />
              </Tabs>
            </Box>
            
            {/* FAQs Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Frequently Asked Questions
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Find answers to common questions about using the Agrimaan platform
                </Typography>
                
                {/* FAQ Categories */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  <Chip 
                    label="General" 
                    onClick={() => handleFaqCategoryChange('general')}
                    color={faqCategory === 'general' ? 'primary' : 'default'}
                    variant={faqCategory === 'general' ? 'filled' : 'outlined'}
                  />
                  <Chip 
                    label="Farmer" 
                    onClick={() => handleFaqCategoryChange('farmer')}
                    color={faqCategory === 'farmer' ? 'primary' : 'default'}
                    variant={faqCategory === 'farmer' ? 'filled' : 'outlined'}
                  />
                  <Chip 
                    label="Buyer" 
                    onClick={() => handleFaqCategoryChange('buyer')}
                    color={faqCategory === 'buyer' ? 'primary' : 'default'}
                    variant={faqCategory === 'buyer' ? 'filled' : 'outlined'}
                  />
                  <Chip 
                    label="Agronomist" 
                    onClick={() => handleFaqCategoryChange('agronomist')}
                    color={faqCategory === 'agronomist' ? 'primary' : 'default'}
                    variant={faqCategory === 'agronomist' ? 'filled' : 'outlined'}
                  />
                  <Chip 
                    label="Investor" 
                    onClick={() => handleFaqCategoryChange('investor')}
                    color={faqCategory === 'investor' ? 'primary' : 'default'}
                    variant={faqCategory === 'investor' ? 'filled' : 'outlined'}
                  />
                  <Chip 
                    label="Logistics" 
                    onClick={() => handleFaqCategoryChange('logistics')}
                    color={faqCategory === 'logistics' ? 'primary' : 'default'}
                    variant={faqCategory === 'logistics' ? 'filled' : 'outlined'}
                  />
                </Box>
              </Box>
              
              {/* FAQ Accordions */}
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => (
                  <Accordion key={index}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`faq-content-${index}`}
                      id={`faq-header-${index}`}
                    >
                      <Typography fontWeight="medium">{faq.question}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>{faq.answer}</Typography>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Box textAlign="center" py={4}>
                  <HelpIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No FAQs found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search term or selecting a different category
                  </Typography>
                </Box>
              )}
              
              {/* Didn't find answer */}
              <Box mt={4} textAlign="center">
                <Typography variant="body1" gutterBottom>
                  Didn't find what you're looking for?
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => setTabValue(3)}
                >
                  Contact Support
                </Button>
              </Box>
            </TabPanel>
            
            {/* Video Tutorials Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Video Tutorials
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Learn how to use the platform with our step-by-step video guides
                </Typography>
              </Box>
              
              {/* Video Grid */}
              {filteredVideos.length > 0 ? (
                <Grid container spacing={3}>
                  {filteredVideos.map((video) => (
                    <Grid item xs={12} sm={6} md={4} key={video.id}>
                      <Card>
                        <Box sx={{ position: 'relative' }}>
                          <Box 
                            component="img" 
                            src={video.thumbnail} 
                            alt={video.title}
                            sx={{ 
                              width: '100%', 
                              height: 160, 
                              objectFit: 'cover',
                              filter: 'brightness(0.8)'
                            }}
                          />
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              top: 0, 
                              left: 0, 
                              width: '100%', 
                              height: '100%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center' 
                            }}
                          >
                            <PlayCircleOutlineIcon sx={{ fontSize: 60, color: 'white' }} />
                          </Box>
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              bottom: 8, 
                              right: 8, 
                              bgcolor: 'rgba(0,0,0,0.7)', 
                              color: 'white', 
                              px: 1, 
                              borderRadius: 1 
                            }}
                          >
                            {video.duration}
                          </Box>
                          <Chip 
                            label={video.category.charAt(0).toUpperCase() + video.category.slice(1)} 
                            size="small"
                            sx={{ 
                              position: 'absolute', 
                              top: 8, 
                              left: 8,
                            }}
                          />
                        </Box>
                        <CardContent>
                          <Typography variant="h6" gutterBottom noWrap>
                            {video.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {video.description}
                          </Typography>
                          <Button 
                            variant="outlined" 
                            fullWidth
                            startIcon={<PlayCircleOutlineIcon />}
                            href={video.url}
                            target="_blank"
                          >
                            Watch Video
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={4}>
                  <VideoLibraryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No videos found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search term
                  </Typography>
                </Box>
              )}
            </TabPanel>
            
            {/* User Guides Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  User Guides & Documentation
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Download comprehensive guides and documentation for the platform
                </Typography>
              </Box>
              
              {/* Guides List */}
              {filteredGuides.length > 0 ? (
                <List>
                  {filteredGuides.map((guide) => (
                    <React.Fragment key={guide.id}>
                      <ListItem>
                        <ListItemIcon>
                          <AssignmentIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={guide.title}
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                {guide.description}
                              </Typography>
                              <Box mt={1} display="flex" alignItems="center">
                                <Chip 
                                  label={guide.category.charAt(0).toUpperCase() + guide.category.slice(1)} 
                                  size="small" 
                                  sx={{ mr: 1 }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                  {guide.format} • {guide.size}
                                </Typography>
                              </Box>
                            </>
                          }
                        />
                        <Button 
                          variant="outlined" 
                          href={guide.url}
                          download
                        >
                          Download
                        </Button>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <MenuBookIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No guides found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search term
                  </Typography>
                </Box>
              )}
            </TabPanel>
            
            {/* Contact Support Tab */}
            <TabPanel value={tabValue} index={3}>
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Contact Support
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Get help from our dedicated support team
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                {/* Contact Methods */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Contact Methods
                      </Typography>
                      
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <EmailIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Email Support"
                            secondary="support@agrimaan.com"
                          />
                          <Button variant="text">
                            Email Us
                          </Button>
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>
                            <PhoneIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Phone Support"
                            secondary="1800-123-4567 (Toll Free)"
                          />
                          <Button variant="text">
                            Call Us
                          </Button>
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>
                            <WhatsAppIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="WhatsApp Support"
                            secondary="+91 98765 43210"
                          />
                          <Button variant="text">
                            WhatsApp
                          </Button>
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>
                            <ChatIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Live Chat"
                            secondary="Available 9 AM to 6 PM (IST)"
                          />
                          <Button variant="text">
                            Start Chat
                          </Button>
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Support Hours
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Monday to Friday"
                            secondary="9:00 AM - 6:00 PM (IST)"
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemText
                            primary="Saturday"
                            secondary="10:00 AM - 4:00 PM (IST)"
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemText
                            primary="Sunday"
                            secondary="Closed"
                          />
                        </ListItem>
                      </List>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        * Emergency support is available 24/7 for critical issues
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Contact Form */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Send us a Message
                      </Typography>
                      
                      <Box component="form" sx={{ mt: 2 }}>
                        <TextField
                          fullWidth
                          label="Name"
                          margin="normal"
                          required
                        />
                        
                        <TextField
                          fullWidth
                          label="Email"
                          margin="normal"
                          required
                          type="email"
                        />
                        
                        <TextField
                          select
                          fullWidth
                          label="Subject"
                          margin="normal"
                          required
                          defaultValue=""
                        >
                          <MenuItem value="">Select a subject</MenuItem>
                          <MenuItem value="account">Account Issues</MenuItem>
                          <MenuItem value="technical">Technical Support</MenuItem>
                          <MenuItem value="billing">Billing & Payments</MenuItem>
                          <MenuItem value="feature">Feature Request</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </TextField>
                        
                        <TextField
                          fullWidth
                          label="Message"
                          margin="normal"
                          required
                          multiline
                          rows={4}
                        />
                        
                        <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
                          <FormControlLabel
                            control={<Checkbox />}
                            label="Send me a copy of this message"
                          />
                          
                          <Button 
                            variant="contained" 
                            color="primary"
                            startIcon={<SendIcon />}
                          >
                            Send Message
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Feedback Section */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <FeedbackIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          Provide Feedback
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" paragraph>
                        We're constantly working to improve our platform. Your feedback helps us make Agrimaan better for everyone.
                      </Typography>
                      
                      <Button 
                        variant="outlined" 
                        startIcon={<FeedbackIcon />}
                      >
                        Share Feedback
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Help;