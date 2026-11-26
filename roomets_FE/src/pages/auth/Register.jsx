import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
  Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { register, sendOtp } from "../../API/authAPI";
import { USER_TYPES } from "../../utils/userTypes";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    gender: "",
    userType: "",
    workingDetails: "",
    hobbyPreferences: "",
    agreed: false,
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "email" && otpSent) {
      setOtpSent(false);
      setOtp("");
    }

    setError("");
  };

  const requestOtp = async (email, resend = false) => {
    setSendingOtp(true);
    setError("");
    try {
      await sendOtp({ email: email.trim(), purpose: "REGISTER" });
      setOtpSent(true);
      setSnackbar({
        open: true,
        message: resend
          ? "A new verification code has been sent."
          : "Verification code sent to your email.",
        severity: "success",
      });
    } catch (err) {
      const message = err?.message || "Unable to send the verification code.";
      setError(message);
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const {
      name,
      email,
      mobile,
      password,
      confirmPassword,
      gender,
      userType,
      agreed,
    } = formData;

    if (!name || !email || !mobile || !password || !confirmPassword || !gender || !userType) {
      setError("Please fill all values.");
      return;
    }

    if (!/^\d{10}$/.test(mobile.trim())) {
      setError("Mobile number must be 10 digits.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirm password must be the same.");
      return;
    }

    if (!agreed) {
      setError("Please accept the community guidelines.");
      return;
    }

    if (!otpSent) {
      await requestOtp(email);
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter the 6-digit code sent to your email.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await register({
        name,
        email,
        phone: mobile,
        password,
        otp: otp.trim(),
        gender,
        userType,
        workingDetails: formData.workingDetails.trim(),
        hobbyPreferences: formData.hobbyPreferences.trim(),
      });

      setSnackbar({
        open: true,
        message: "Email verified. Account created. Please log in.",
        severity: "success",
      });

      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      const message = err?.message || "Registration failed. Please try again.";
      setError(message);
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        backgroundColor: "#F5FAFC",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        pt: 4,
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 532,
          border: "1px solid #D7E5EB",
          borderRadius: "20px",
          backgroundColor: "#FFFFFF",
          px: { xs: 2, sm: 4 },
          py: 3.5,
          boxShadow: "0 10px 30px rgba(30, 70, 90, 0.06)",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: {
              xs: "28px",
              sm: "32px",
            },
            fontWeight: 700,
            color: "#142A4A",
            lineHeight: 1.2,
            mb: 0.8,
          }}
        >
          Create your free account
        </Typography>

        <Typography
          sx={{
            fontSize: "15.5px",
            lineHeight: 1.55,
            color: "#49657D",
            maxWidth: 440,
            mb: 3,
          }}
        >
          Join a privacy-first community for finding a shared home in
          Chennai.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <FormControl fullWidth size="medium">
                <Typography
                  component="span"
                  id="register-user-type-label"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#31516D",
                    mb: 0.8,
                  }}
                >
                  Account type
                </Typography>
                <Select
                  id="register-user-type"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  displayEmpty
                  labelId="register-user-type-label"
                  SelectDisplayProps={{ "aria-labelledby": "register-user-type-label" }}
                  sx={{
                    height: 47,
                    borderRadius: "11px",
                    backgroundColor: "#FFFFFF",
                    fontSize: "14px",
                    color: "#172A43",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#BDD3DF",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#91B3C3",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#3737E8",
                      borderWidth: "1.5px",
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Select how you will use RoomMate Finder
                  </MenuItem>
                  <MenuItem value={USER_TYPES.SEEKER}>Room seeker</MenuItem>
                  <MenuItem value={USER_TYPES.OWNER}>Room owner / uploader</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                label="Mobile number"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 10 }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                label="Confirm password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="medium">
                <Typography
                  component="span"
                  id="register-gender-label"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#31516D",
                    mb: 0.8,
                  }}
                >
                  Gender
                </Typography>
                <Select
                  id="register-gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  displayEmpty
                  labelId="register-gender-label"
                  SelectDisplayProps={{ "aria-labelledby": "register-gender-label" }}
                  sx={{
                    height: 47,
                    borderRadius: "11px",
                    backgroundColor: "#FFFFFF",
                    fontSize: "14px",
                    color: "#172A43",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#BDD3DF",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#91B3C3",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#3737E8",
                      borderWidth: "1.5px",
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Select gender
                  </MenuItem>
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.userType === USER_TYPES.SEEKER && (
              <>
                <Grid size={12}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F766E", mb: 0.5 }}>
                    Seeker profile (shared with room owners when you enquire)
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    label="Working details"
                    name="workingDetails"
                    value={formData.workingDetails}
                    onChange={handleChange}
                    placeholder="e.g. Software engineer at TCS"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    label="Hobby / preferences"
                    name="hobbyPreferences"
                    value={formData.hobbyPreferences}
                    onChange={handleChange}
                    placeholder="e.g. Reading, early riser, non-smoker"
                  />
                </Grid>
              </>
            )}

            <Grid
              size={{ xs: 12, sm: 6 }}
              sx={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    name="agreed"
                    checked={formData.agreed}
                    onChange={handleChange}
                    size="small"
                    sx={{
                      color: "#7A8794",
                      p: 0.5,
                      mt: 0.2,
                      "&.Mui-checked": {
                        color: "#3730E8",
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontSize: "13.5px",
                      lineHeight: 1.45,
                      color: "#243858",
                    }}
                  >
                    I agree to the community guidelines and privacy-first
                    matching.
                  </Typography>
                }
                sx={{
                  alignItems: "flex-start",
                  m: 0,
                }}
              />
            </Grid>

            {otpSent && (
              <Grid size={12}>
                <Alert severity="info" sx={{ borderRadius: "10px", fontSize: "13px", mb: 1.5 }}>
                  Enter the 6-digit code sent to {formData.email.trim()}.
                </Alert>
                <FormField
                  label="Email verification code"
                  name="otp"
                  value={otp}
                  onChange={(event) => {
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  placeholder="123456"
                  inputProps={{ inputMode: "numeric", maxLength: 6 }}
                />
                <Button
                  type="button"
                  size="small"
                  disabled={sendingOtp}
                  onClick={() => requestOtp(formData.email, true)}
                  sx={{ mt: 1, textTransform: "none", fontWeight: 700, color: "#3730E8" }}
                >
                  Resend code
                </Button>
              </Grid>
            )}

            {error && (
              <Grid size={12}>
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: "10px",
                    fontSize: "13px",
                  }}
                >
                  {error}
                </Alert>
              </Grid>
            )}

            <Grid size={12}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={submitting || sendingOtp}
                startIcon={
                  submitting || sendingOtp ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : null
                }
                sx={{
                  height: 49,
                  mt: 0.5,
                  borderRadius: "11px",
                  backgroundColor: "#3730E8",
                  textTransform: "none",
                  fontSize: "15px",
                  fontWeight: 700,
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#2F30D1",
                    boxShadow: "none",
                  },
                }}
              >
                {otpSent ? "Verify & create account" : "Send verification code"}
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 2.5,
          }}
        >
          <Typography
            sx={{
              fontSize: "13.5px",
              color: "#52657D",
            }}
          >
            Already have an account?{" "}
            <Link
              component={RouterLink}
              to="/login"
              underline="none"
              sx={{
                color: "#4218E8",
                fontWeight: 700,
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Login
            </Link>
          </Typography>
        </Box>
      </Paper>

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

const FormField = ({ label, name, type = "text", value, onChange, placeholder, inputProps }) => {
  const inputId = `register-${name}`;

  return (
    <Box>
      <Typography
        component="label"
        htmlFor={inputId}
        sx={{
          display: "block",
          fontSize: "14px",
          fontWeight: 700,
          color: "#31516D",
          mb: 0.8,
        }}
      >
        {label}
      </Typography>

      <TextField
        id={inputId}
        fullWidth
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputProps={inputProps}
        variant="outlined"
        size="medium"
        sx={{
          "& .MuiOutlinedInput-root": {
            height: 47,
            borderRadius: "11px",
            backgroundColor: "#FFFFFF",
            "& fieldset": {
              borderColor: "#BDD3DF",
            },
            "&:hover fieldset": {
              borderColor: "#91B3C3",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#3730E8",
              borderWidth: "1.5px",
            },
          },
          "& .MuiOutlinedInput-input": {
            fontSize: "14px",
            color: "#172A43",
          },
        }}
      />
    </Box>
  );
};

export default Register;
