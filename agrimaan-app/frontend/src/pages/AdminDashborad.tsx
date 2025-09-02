import React from "react";
import { Box, Typography, Grid, Paper, Button } from "@mui/material";

const AdminDashboard: React.FC = () => {
    return (
        <Box sx={{ padding: "20px" }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>
            <Grid container spacing={3}>
                {/* Example Card 1 */}
                <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={3} sx={{ padding: "20px" }}>
                        <Typography variant="h6">Users</Typography>
                        <Typography variant="body1">Manage all users</Typography>
                        <Button variant="contained" color="primary" sx={{ marginTop: "10px" }}>
                            View Users
                        </Button>
                    </Paper>
                </Grid>

                {/* Example Card 2 */}
                <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={3} sx={{ padding: "20px" }}>
                        <Typography variant="h6">Reports</Typography>
                        <Typography variant="body1">View system reports</Typography>
                        <Button variant="contained" color="primary" sx={{ marginTop: "10px" }}>
                            View Reports
                        </Button>
                    </Paper>
                </Grid>

                {/* Example Card 3 */}
                <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={3} sx={{ padding: "20px" }}>
                        <Typography variant="h6">Settings</Typography>
                        <Typography variant="body1">Configure system settings</Typography>
                        <Button variant="contained" color="primary" sx={{ marginTop: "10px" }}>
                            Go to Settings
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;