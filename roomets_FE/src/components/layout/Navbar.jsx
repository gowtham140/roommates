import { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddHomeWorkOutlined,
  AdminPanelSettingsOutlined,
  FavoriteBorderRounded,
  HomeOutlined,
  InfoOutlined,
  LocationOnOutlined,
  LogoutRounded,
  MailOutlineRounded,
  Menu as MenuIcon,
  NotificationsNoneRounded,
  PersonOutlineRounded,
  SearchRounded,
  ShieldOutlined,
  SpaceDashboardOutlined,
} from "@mui/icons-material";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { getNewEnquiryCount } from "../../API/enquiriesAPI";
import { canManageRooms, isAdmin, isSeeker } from "../../utils/userTypes";

const visuallyHiddenStyles = {
  position: "absolute",
  width: 1,
  height: 1,
  p: 0,
  m: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

const primaryItems = [
  { label: "Home", path: "/", icon: <HomeOutlined fontSize="small" /> },
  { label: "Find Rooms", path: "/rooms", icon: <SearchRounded fontSize="small" /> },
  { label: "How It Works", path: "/how-it-works", icon: <InfoOutlined fontSize="small" /> },
  { label: "Safety", path: "/safety", icon: <ShieldOutlined fontSize="small" /> },
];

const navButtonSx = {
  textTransform: "none",
  fontSize: "14px",
  fontWeight: 600,
  color: "#43516A",
  borderRadius: "10px",
  px: 1.4,
  py: 0.9,
  whiteSpace: "nowrap",
  "&.active": { backgroundColor: "#EEF4FF", color: "#304A73" },
  "&:hover": { backgroundColor: "#F5F7FA" },
};

const drawerItemSx = (active) => ({
  borderRadius: "10px",
  mb: 0.25,
  color: active ? "#304A73" : "#344054",
  backgroundColor: active ? "#EEF4FF" : "transparent",
  "& .MuiListItemIcon-root": { color: active ? "#3730E8" : "#667085", minWidth: 36 },
  "&:hover": { backgroundColor: active ? "#EEF4FF" : "#F5F7FA" },
});

const Navbar = () => {
  const { user, logout } = useAuth();
  const admin = isAdmin(user);
  const owner = canManageRooms(user);
  const seeker = isSeeker(user);
  const seekingClosed = Boolean(user?.seekingClosed);
  const navigate = useNavigate();
  const location = useLocation();
  const [accountAnchor, setAccountAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [enquiryCount, setEnquiryCount] = useState(0);

  const enquiryBadgeCount = owner ? enquiryCount : 0;

  useEffect(() => {
    if (!user?.id || !owner) {
      return undefined;
    }
    let active = true;
    const loadCount = () => {
      getNewEnquiryCount()
        .then((count) => {
          if (active) setEnquiryCount(Number(count) || 0);
        })
        .catch(() => {
          if (active) setEnquiryCount(0);
        });
    };
    loadCount();
    const timer = setInterval(loadCount, 60000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [user?.id, owner, location.pathname]);

  const visiblePrimaryItems = useMemo(() => {
    if (owner) return primaryItems.filter((item) => item.path !== "/rooms");
    if (seekingClosed) return primaryItems.filter((item) => item.path !== "/rooms");
    return primaryItems;
  }, [owner, seekingClosed]);

  const accountItems = useMemo(() => {
    const items = [
      { label: "My Profile", path: "/profile", icon: <PersonOutlineRounded fontSize="small" /> },
      { label: "Liked Rooms", path: "/liked-rooms", icon: <FavoriteBorderRounded fontSize="small" /> },
    ];
    if (owner) {
      items.push(
        { label: "My Rooms", path: "/my-rooms", icon: <SpaceDashboardOutlined fontSize="small" /> },
        { label: "Enquiry Requests", path: "/enquiries", icon: <MailOutlineRounded fontSize="small" /> },
        { label: "Post a Room", path: "/post-room", icon: <AddHomeWorkOutlined fontSize="small" /> }
      );
    }
    if (seeker) {
      items.push({ label: "My Enquiries", path: "/enquiries", icon: <MailOutlineRounded fontSize="small" /> });
    }
    if (admin) items.push({ label: "Admin Dashboard", path: "/admin", icon: <AdminPanelSettingsOutlined fontSize="small" /> });
    return items.filter((item, index, arr) => arr.findIndex((i) => i.path === item.path) === index);
  }, [admin, owner, seeker]);

  const closeMenus = () => {
    setAccountAnchor(null);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    closeMenus();
    logout();
    navigate("/");
  };

  const goTo = (path) => {
    closeMenus();
    navigate(path);
  };

  const isActive = (path) => (path === "/" ? location.pathname === "/" : location.pathname.startsWith(path));

  return (
    <AppBar position="sticky" elevation={0} sx={{ backgroundColor: "#ffffff", color: "#17233C", borderBottom: "1px solid #E8ECF2" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: "64px", display: "flex", justifyContent: "space-between", gap: 1.5 }}>
          <Box component={NavLink} to="/" sx={{ display: "flex", alignItems: "center", gap: 1.2, textDecoration: "none", color: "inherit", flexShrink: 0 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "11px", backgroundColor: "#3730E8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <HomeOutlined sx={{ color: "#ffffff", fontSize: 21 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "16px", fontWeight: 700, lineHeight: 1.1 }}>RoomMate Finder</Typography>
              <Typography sx={{ fontSize: "9px", color: "#667085", mt: 0.3 }}>Direct. Verified. Chennai.</Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={0.25} sx={{ alignItems: "center", display: { xs: "none", lg: "flex" }, ml: "auto", mr: 1 }}>
            {visiblePrimaryItems.map((item) => (
              <Button key={item.path} component={NavLink} to={item.path} end={item.path === "/"} sx={navButtonSx}>
                {item.label}
              </Button>
            ))}
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: "auto" }}>
            <Chip
              icon={<LocationOnOutlined sx={{ fontSize: "16px !important" }} />}
              label="Chennai"
              size="small"
              sx={{ display: { xs: "none", sm: "inline-flex" }, backgroundColor: "#EFFAF7", color: "#008A78", fontWeight: 600, borderRadius: "18px" }}
            />

            {user ? (
              <>
                {!seekingClosed && (
                  <Button
                    component={NavLink}
                    to={owner ? "/post-room" : "/rooms"}
                    variant="contained"
                    startIcon={owner ? <AddHomeWorkOutlined /> : <SearchRounded />}
                    sx={{ display: { xs: "none", md: "inline-flex" }, textTransform: "none", fontWeight: 600, backgroundColor: "#3730E8", borderRadius: "11px", px: 2, boxShadow: "none", "&:hover": { backgroundColor: "#2E27C9", boxShadow: "none" } }}
                  >
                    {owner ? "Post a room" : "Find rooms"}
                  </Button>
                )}
                {owner && (
                  <Tooltip title="Enquiry requests">
                    <IconButton
                      onClick={() => goTo("/enquiries")}
                      aria-label={`${enquiryBadgeCount} new enquiry requests`}
                      sx={{ color: "#475467", border: "1px solid #D7DFEA", borderRadius: "11px", width: 40, height: 40 }}
                    >
                      <Badge badgeContent={enquiryBadgeCount} color="error" max={99}>
                        <NotificationsNoneRounded fontSize="small" />
                      </Badge>
                      <Box
                        component="span"
                        aria-live="polite"
                        aria-atomic="true"
                        sx={visuallyHiddenStyles}
                      >
                        {enquiryBadgeCount} new enquiry requests
                      </Box>
                    </IconButton>
                  </Tooltip>
                )}
                <Button
                  onClick={(e) => setAccountAnchor(e.currentTarget)}
                  aria-label="Open account menu"
                  aria-haspopup="menu"
                  aria-expanded={Boolean(accountAnchor)}
                  aria-controls="account-menu"
                  sx={{ display: { xs: "none", md: "inline-flex" }, textTransform: "none", color: "#17233C", border: "1px solid #D7DFEA", borderRadius: "11px", px: 1, py: 0.5, minWidth: 0 }}
                >
                  <Avatar sx={{ bgcolor: "#0F9D8A", width: 30, height: 30, fontSize: 13, mr: 1 }}>
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ textAlign: "left", mr: 0.5, maxWidth: 140 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }} noWrap>{user.name || "Account"}</Typography>
                    <Typography sx={{ fontSize: 11, color: "#667085", lineHeight: 1.2 }} noWrap>{owner ? "Owner" : seeker ? "Seeker" : "Account"}</Typography>
                  </Box>
                </Button>
                <Menu id="account-menu" anchorEl={accountAnchor} open={Boolean(accountAnchor)} onClose={() => setAccountAnchor(null)} PaperProps={{ sx: { mt: 1, borderRadius: "14px", minWidth: 240, border: "1px solid #E8ECF2" } }}>
                  <Box sx={{ px: 2, py: 1.25 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{user.name}</Typography>
                    <Typography sx={{ fontSize: 12, color: "#667085" }} noWrap>{user.email}</Typography>
                  </Box>
                  <Divider />
                  {accountItems.map((item) => (
                    <MenuItem key={item.path} onClick={() => goTo(item.path)} selected={isActive(item.path)} sx={{ fontSize: 14, gap: 1.25, py: 1 }}>
                      <Box sx={{ color: "#667085", display: "flex" }}>{item.icon}</Box>
                      {item.label}
                    </MenuItem>
                  ))}
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ fontSize: 14, color: "#B42318", gap: 1.25, py: 1 }}>
                    <LogoutRounded fontSize="small" /> Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
                <Tooltip title="Liked rooms">
                  <IconButton component={NavLink} to="/liked-rooms" aria-label="Liked rooms" color="inherit">
                    <FavoriteBorderRounded />
                  </IconButton>
                </Tooltip>
                <Button component={NavLink} to="/login" variant="outlined" sx={{ textTransform: "none", fontWeight: 600, color: "#17233C", borderColor: "#C9D2E1", borderRadius: "11px", px: 2 }}>
                  Login
                </Button>
                <Button component={NavLink} to="/register" variant="contained" sx={{ textTransform: "none", fontWeight: 600, backgroundColor: "#3730E8", borderRadius: "11px", px: 2, boxShadow: "none", "&:hover": { backgroundColor: "#2E27C9", boxShadow: "none" } }}>
                  Sign Up
                </Button>
              </Stack>
            )}

            <IconButton sx={{ display: { xs: "flex", lg: "none" } }} onClick={() => setDrawerOpen(true)} aria-label="Open navigation menu">
              <MenuIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </Container>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: { xs: 300, sm: 340 }, p: 2 }} role="presentation">
          {user && (
            <Box sx={{ p: 1.5, mb: 1.5, borderRadius: "14px", backgroundColor: "#F7FAFC", border: "1px solid #E6EDF3" }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: "#0F9D8A", width: 40, height: 40 }}>{(user.name || "U").charAt(0).toUpperCase()}</Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }} noWrap>{user.name}</Typography>
                  <Typography sx={{ fontSize: 12, color: "#667085" }} noWrap>{user.email}</Typography>
                </Box>
              </Stack>
            </Box>
          )}

          <List subheader={<ListSubheader sx={{ bgcolor: "transparent", px: 1, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: "#667085", lineHeight: 2.5 }}>EXPLORE</ListSubheader>}>
            {visiblePrimaryItems.map((item) => (
              <ListItemButton key={item.path} onClick={() => goTo(item.path)} sx={drawerItemSx(isActive(item.path))}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
              </ListItemButton>
            ))}
          </List>

          <Divider sx={{ my: 1.5 }} />

          {user ? (
            <List subheader={<ListSubheader sx={{ bgcolor: "transparent", px: 1, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: "#667085", lineHeight: 2.5 }}>MY ACCOUNT</ListSubheader>}>
              {accountItems.map((item) => (
                <ListItemButton key={item.path} onClick={() => goTo(item.path)} sx={drawerItemSx(isActive(item.path))}>
                  <ListItemIcon>
                    {item.path === "/enquiries" && owner ? (
                      <Badge badgeContent={enquiryBadgeCount} color="error" max={99}>
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                    secondary={
                      item.path === "/enquiries" && owner ? (
                        <Box
                          component="span"
                          aria-live="polite"
                          aria-atomic="true"
                          sx={visuallyHiddenStyles}
                        >
                          {enquiryBadgeCount} new enquiry requests
                        </Box>
                      ) : null
                    }
                  />
                </ListItemButton>
              ))}
              <ListItemButton onClick={handleLogout} sx={{ borderRadius: "10px", mt: 0.5, color: "#B42318", "& .MuiListItemIcon-root": { color: "#B42318", minWidth: 36 } }}>
                <ListItemIcon><LogoutRounded fontSize="small" /></ListItemIcon>
                <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
              </ListItemButton>
            </List>
          ) : (
            <List subheader={<ListSubheader sx={{ bgcolor: "transparent", px: 1, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: "#667085", lineHeight: 2.5 }}>ACCOUNT</ListSubheader>}>
              <ListItemButton onClick={() => goTo("/login")} sx={drawerItemSx(isActive("/login"))}>
                <ListItemIcon><PersonOutlineRounded fontSize="small" /></ListItemIcon>
                <ListItemText primary="Login" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
              </ListItemButton>
              <ListItemButton onClick={() => goTo("/register")} sx={drawerItemSx(isActive("/register"))}>
                <ListItemIcon><AddHomeWorkOutlined fontSize="small" /></ListItemIcon>
                <ListItemText primary="Sign Up" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
              </ListItemButton>
              <ListItemButton onClick={() => goTo("/liked-rooms")} sx={drawerItemSx(isActive("/liked-rooms"))}>
                <ListItemIcon><FavoriteBorderRounded fontSize="small" /></ListItemIcon>
                <ListItemText primary="Liked Rooms" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
              </ListItemButton>
            </List>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
