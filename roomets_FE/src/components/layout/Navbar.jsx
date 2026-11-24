import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  HomeOutlined,
  LocationOnOutlined,
  Menu as MenuIcon,
  AddHomeWorkOutlined,
} from "@mui/icons-material";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Find Rooms", path: "/rooms" },
  { label: "How It Works", path: "/how-it-works" },
  { label: "Safety", path: "/safety" },
];

const linkStyle = {
  textTransform: "none",
  fontSize: "15px",
  fontWeight: 600,
  color: "#43516A",
  borderRadius: "10px",
  px: 1.6,
  py: 1,
  "&.active": { backgroundColor: "#EEF4FF", color: "#304A73" },
  "&:hover": { backgroundColor: "#F5F7FA" },
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate("/");
  };

  const accountItems = [
    { label: "My Profile", path: "/profile" },
    { label: "My Rooms", path: "/my-rooms" },
    { label: "My Enquiries", path: "/enquiries" },
    { label: "Post a Room", path: "/post-room" },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ backgroundColor: "#ffffff", color: "#17233C", borderBottom: "1px solid #E8ECF2" }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{ minHeight: "64px", display: "flex", justifyContent: "space-between", gap: 1 }}
        >
          <Box
            component={NavLink}
            to="/"
            sx={{ display: "flex", alignItems: "center", gap: 1.2, textDecoration: "none", color: "inherit" }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "11px",
                backgroundColor: "#3730E8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HomeOutlined sx={{ color: "#ffffff", fontSize: 21 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "16px", fontWeight: 700, lineHeight: 1.1 }}>
                RoomMate Finder
              </Typography>
              <Typography sx={{ fontSize: "9px", color: "#667085", mt: 0.3 }}>
                Direct. Verified. Chennai.
              </Typography>
            </Box>
          </Box>

          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: "center", display: { xs: "none", md: "flex" }, ml: "auto", mr: 2 }}
          >
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={NavLink}
                to={item.path}
                end={item.path === "/"}
                sx={linkStyle}
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: "none", sm: "flex" } }}>
            <Chip
              icon={<LocationOnOutlined sx={{ fontSize: "16px !important" }} />}
              label="Chennai"
              size="small"
              sx={{
                backgroundColor: "#EFFAF7",
                color: "#008A78",
                fontWeight: 600,
                borderRadius: "18px",
                px: 0.5,
              }}
            />

            {user ? (
              <>
                <Button
                  component={NavLink}
                  to="/post-room"
                  variant="contained"
                  startIcon={<AddHomeWorkOutlined />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    backgroundColor: "#3730E8",
                    borderRadius: "11px",
                    px: 2,
                    boxShadow: "none",
                    "&:hover": { backgroundColor: "#2E27C9", boxShadow: "none" },
                  }}
                >
                  Post a room
                </Button>
                <IconButton onClick={(event) => setAnchorEl(event.currentTarget)} aria-label="Account menu">
                  <Avatar sx={{ bgcolor: "#0F9D8A", width: 34, height: 34, fontSize: 14 }}>
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem disabled sx={{ opacity: 1 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{user.name}</Typography>
                      <Typography sx={{ fontSize: 12, color: "#667085" }}>{user.email}</Typography>
                    </Box>
                  </MenuItem>
                  <Divider />
                  {accountItems.map((item) => (
                    <MenuItem
                      key={item.path}
                      component={NavLink}
                      to={item.path}
                      onClick={() => setAnchorEl(null)}
                      sx={{ fontSize: 14 }}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ fontSize: 14, color: "#B42318" }}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  component={NavLink}
                  to="/login"
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    color: "#17233C",
                    borderColor: "#C9D2E1",
                    borderRadius: "11px",
                    px: 2,
                    "&:hover": { borderColor: "#3730E8", backgroundColor: "#F8F9FF" },
                  }}
                >
                  Login
                </Button>
                <Button
                  component={NavLink}
                  to="/register"
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    backgroundColor: "#3730E8",
                    borderRadius: "11px",
                    px: 2,
                    boxShadow: "none",
                    "&:hover": { backgroundColor: "#2E27C9", boxShadow: "none" },
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Stack>

          <IconButton
            sx={{ display: { xs: "flex", sm: "none" }, ml: "auto" }}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, p: 2 }} role="presentation">
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
            {user ? (
              [...accountItems, { label: "Logout", path: null }].map((item) => (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setDrawerOpen(false);
                      if (item.path) navigate(item.path);
                      else handleLogout();
                    }}
                  >
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              ["Login", "Register"].map((label) => (
                <ListItem key={label} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate(label === "Login" ? "/login" : "/register");
                    }}
                  >
                    <ListItemText primary={label} />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
