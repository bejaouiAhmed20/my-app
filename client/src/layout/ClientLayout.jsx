import React, { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Tooltip,
  Badge,
  styled,
  Stack
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  ListAlt as DemandsIcon,
  AddCircle as AddDemandIcon,
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from "@mui/icons-material";

const drawerWidth = 260;
const collapsedDrawerWidth = 80;

const navItems = [
  { label: "Dashboard", path: "/client", icon: <HomeIcon />, notification: 0 },
  { label: "Demands", path: "/client/demands", icon: <DemandsIcon />, notification: 3 },
  { label: "Add Demand", path: "/client/demands/add", icon: <AddDemandIcon />, notification: 0 },
  { label: "Notifications", path: "/client/notifications", icon: <NotificationsIcon />, notification: 5 },
  { label: "Messages", path: "/client/chat/1", icon: <ChatIcon />, notification: 2 },
];

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: 'none',
  color: 'inherit',
  width: '100%',
  '&.active': {
    '& .MuiListItemButton-root': {
      backgroundColor: theme.palette.primary.lighter,
      color: theme.palette.primary.main,
      '& .MuiListItemIcon-root': {
        color: theme.palette.primary.main,
      },
    },
  },
}));

export default function ClientLayout() {
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const toggleCollapse = () => setCollapsed(!collapsed);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const drawer = (
    <Box 
      sx={{ 
        height: "100%", 
        display: "flex", 
        flexDirection: "column",
        background: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`
      }}
    >
      {/* Header */}
      <Toolbar sx={{ 
        px: 2, 
        py: 3, 
        gap: 2, 
        alignItems: "center",
        minHeight: '80px',
        display: collapsed ? 'none' : 'flex'
      }}>
        <Avatar 
          sx={{ 
            bgcolor: "primary.main", 
            fontWeight: "bold",
            width: 40,
            height: 40
          }}
        >
          C
        </Avatar>
        <Typography variant="h6" fontWeight={700} noWrap>
          Client Portal
        </Typography>
      </Toolbar>

      <Divider />

      {/* Navigation Items */}
      <Box flex={1} py={1} sx={{ overflowY: 'auto' }}>
        <List>
          {navItems.map(({ path, label, icon, notification }) => (
            <ListItem key={path} disablePadding sx={{ px: 1, py: 0.5 }}>
              <StyledNavLink to={path}>
                <ListItemButton
                  selected={location.pathname.startsWith(path)}
                  sx={{
                    px: collapsed ? 2.5 : 3,
                    py: 1.5,
                    borderRadius: 2,
                    mx: 0.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : '56px' }}>
                    <Badge 
                      badgeContent={notification} 
                      color="error" 
                      invisible={!notification || collapsed}
                    >
                      {icon}
                    </Badge>
                  </ListItemIcon>
                  {!collapsed && <ListItemText 
                    primary={label} 
                    primaryTypographyProps={{ fontWeight: 500 }} 
                  />}
                </ListItemButton>
              </StyledNavLink>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, pt: 1 }}>
        <Divider sx={{ mb: 2 }} />
        <Tooltip title={collapsed ? "Logout" : ""} placement="right">
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              color: "error.main",
              px: collapsed ? 2.5 : 3,
              '&:hover': { 
                backgroundColor: theme.palette.error.lighter,
                color: theme.palette.error.main
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : '56px' }}>
              <LogoutIcon />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Logout" />}
          </ListItemButton>
        </Tooltip>
        
        {!isMobile && !collapsed && (
          <IconButton
            onClick={toggleCollapse}
            sx={{
              mt: 2,
              ml: 1,
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.text.primary
              }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
        {!isMobile && collapsed && (
          <IconButton
            onClick={toggleCollapse}
            sx={{
              mt: 2,
              ml: 1,
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.text.primary
              }
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      display: "flex", 
      backgroundColor: theme.palette.background.default, 
      minHeight: "100vh" 
    }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${collapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          ml: { sm: `${collapsed ? collapsedDrawerWidth : drawerWidth}px` },
          zIndex: theme.zIndex.drawer + 1,
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar sx={{ px: 3 }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
            <Typography variant="h6" fontWeight={600}>
              {location.pathname === '/client' ? 'Dashboard' : 
               location.pathname.includes('demands') ? 'Demands' :
               location.pathname.includes('notifications') ? 'Notifications' :
               location.pathname.includes('chat') ? 'Messages' : 'Client Portal'}
            </Typography>
            
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton size="small">
                <Badge badgeContent={5} color="error">
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>
              <Avatar sx={{ width: 32, height: 32 }}>U</Avatar>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box 
        component="nav" 
        sx={{ 
          width: { sm: collapsed ? collapsedDrawerWidth : drawerWidth }, 
          flexShrink: { sm: 0 } 
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box"
            }
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: collapsed ? collapsedDrawerWidth : drawerWidth,
              boxSizing: "border-box",
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden'
            }
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${collapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          p: 4,
          pt: 10,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}