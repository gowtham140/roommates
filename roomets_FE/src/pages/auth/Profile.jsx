import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import PersonOutlineRounded from "@mui/icons-material/PersonOutlineRounded";
import { getMe, updateMe } from "../../API/authAPI";
import { useAuth } from "../../context/authContext";

const Profile = () => {
  const { user, loading, updateUser } = useAuth();
  const userId = user?.id;
  const [profile, setProfile] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const loadProfile = useCallback(() => {
    if (!userId) return undefined;

    let active = true;

    getMe()
      .then((data) => {
        if (active) setProfile(data || null);
      })
      .catch((err) => {
        if (active) {
          setError(err?.message || "Unable to load your profile.");
        }
      })
      .finally(() => {
        if (active) setFetching(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => loadProfile(), [loadProfile]);

  if (!loading && !user) {
    return <Navigate to="/login" replace state={{ from: "/profile" }} />;
  }

  const displayed = profile || user;

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        backgroundColor: "#F5FAFC",
        py: { xs: 4, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              color: "#0F9D8A",
              fontSize: "14px",
              fontWeight: 700,
              mb: 0.8,
            }}
          >
            Your account
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: "30px", md: "38px" },
              fontWeight: 700,
              color: "#17233C",
              mb: 1,
            }}
          >
            My profile
          </Typography>
          <Typography sx={{ fontSize: "15px", color: "#667085" }}>
            Keep your details up to date so roommates can recognise you.
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ borderRadius: "12px", mb: 2.5 }}
            action={
              <Button color="inherit" size="small" onClick={loadProfile}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {!displayed ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#3730E8" }} />
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: "20px",
                  border: "1px solid #D7E5EB",
                  backgroundColor: "#FFFFFF",
                  p: 3,
                  boxShadow: "0 10px 28px rgba(40, 80, 100, 0.05)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 96,
                      height: 96,
                      mb: 2,
                      fontSize: "34px",
                      fontWeight: 700,
                      backgroundColor: "#E4F8F4",
                      color: "#0F9D8A",
                    }}
                  >
                    {displayed.name
                      ? displayed.name
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : <PersonOutlineRounded />}
                  </Avatar>

                  <Typography
                    sx={{
                      fontSize: "21px",
                      fontWeight: 700,
                      color: "#17233C",
                      mb: 0.5,
                    }}
                  >
                    {displayed.name || "RoomMate member"}
                  </Typography>

                  <Typography sx={{ fontSize: "14px", color: "#667085", mb: 1.5 }}>
                    {displayed.email}
                  </Typography>

                  <Chip
                    label={displayed.userType || "MEMBER"}
                    size="small"
                    sx={{
                      backgroundColor: "#EEF0FF",
                      color: "#3730E8",
                      fontWeight: 700,
                    }}
                  />
                </Box>

                <Box sx={{ mt: 3, display: "grid", gap: 1.6 }}>
                  <DetailRow label="Phone" value={displayed.phone || "Not added"} />
                  <DetailRow label="Gender" value={displayed.gender || "Not added"} />
                  <DetailRow
                    label="Age"
                    value={displayed.age != null ? displayed.age : "Not added"}
                  />
                </Box>

                {fetching && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5 }}>
                    <CircularProgress size={20} sx={{ color: "#3730E8" }} />
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  border: "1px solid #D7E5EB",
                  backgroundColor: "#FFFFFF",
                  p: { xs: 2.5, sm: 3.5 },
                  boxShadow: "0 10px 28px rgba(40, 80, 100, 0.05)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "21px",
                    fontWeight: 700,
                    color: "#17233C",
                    mb: 0.6,
                  }}
                >
                  Edit profile
                </Typography>
                <Typography sx={{ fontSize: "14px", color: "#667085", mb: 3 }}>
                  Only your name, phone, gender and age can be changed.
                </Typography>

                <ProfileForm
                  key={`${displayed.id || "me"}-${displayed.name || ""}`}
                  profile={displayed}
                  updateUser={updateUser}
                  onSaved={(updated) => {
                    setProfile(updated);
                    setSnackbar({
                      open: true,
                      message: "Profile updated successfully.",
                      severity: "success",
                    });
                  }}
                  onError={(message) =>
                    setSnackbar({ open: true, message, severity: "error" })
                  }
                />
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const DetailRow = ({ label, value }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      gap: 2,
      borderBottom: "1px solid #EDF1F4",
      pb: 1.2,
    }}
  >
    <Typography sx={{ fontSize: "13px", color: "#667085" }}>{label}</Typography>
    <Typography
      sx={{ fontSize: "13px", fontWeight: 700, color: "#17233C", textAlign: "right" }}
    >
      {value}
    </Typography>
  </Box>
);

const ProfileForm = ({ profile, updateUser, onSaved, onError }) => {
  const [form, setForm] = useState({
    name: profile.name || "",
    phone: profile.phone || "",
    gender: profile.gender || "",
    age: profile.age != null ? String(profile.age) : "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      onError("Name and phone are required.");
      return;
    }

    setSaving(true);

    try {
      const updated = await updateMe({
        name: form.name.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        age: form.age === "" ? null : Number(form.age),
      });

      if (typeof updateUser === "function") {
        updateUser(updated);
      }

      onSaved(updated || profile);
    } catch (err) {
      onError(err?.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography sx={labelStyles}>Name</Typography>
          <TextField
            fullWidth
            name="name"
            value={form.name}
            onChange={handleChange}
            sx={fieldStyles}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography sx={labelStyles}>Phone</Typography>
          <TextField
            fullWidth
            name="phone"
            value={form.phone}
            onChange={handleChange}
            sx={fieldStyles}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography sx={labelStyles}>Gender</Typography>
          <FormControl fullWidth sx={fieldStyles}>
            <Select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              displayEmpty
              inputProps={{ "aria-label": "Gender" }}
            >
              <MenuItem value="">Not specified</MenuItem>
              <MenuItem value="MALE">Male</MenuItem>
              <MenuItem value="FEMALE">Female</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography sx={labelStyles}>Age</Typography>
          <TextField
            fullWidth
            name="age"
            type="number"
            inputProps={{ min: 18, max: 100 }}
            value={form.age}
            onChange={handleChange}
            sx={fieldStyles}
          />
        </Grid>

        <Grid size={12}>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={
              saving ? <CircularProgress size={18} color="inherit" /> : null
            }
            sx={{
              height: 48,
              px: 3,
              borderRadius: "11px",
              backgroundColor: "#3730E8",
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              "&:hover": { backgroundColor: "#2F30D1", boxShadow: "none" },
            }}
          >
            Save changes
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

const labelStyles = {
  display: "block",
  fontSize: "14px",
  fontWeight: 700,
  color: "#31516D",
  mb: 0.8,
};

const fieldStyles = {
  "& .MuiOutlinedInput-root": {
    height: 47,
    borderRadius: "11px",
    backgroundColor: "#FFFFFF",
    "& fieldset": { borderColor: "#BDD3DF" },
    "&:hover fieldset": { borderColor: "#91B3C3" },
    "&.Mui-focused fieldset": {
      borderColor: "#3730E8",
      borderWidth: "1.5px",
    },
  },
  "& .MuiOutlinedInput-input": {
    fontSize: "14px",
    color: "#17233C",
  },
};

export default Profile;
