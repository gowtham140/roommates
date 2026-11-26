import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Paper,
  Snackbar,
  TextField,
  Typography,
  Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState(
    () => localStorage.getItem("rememberedEmail") || ""
  );
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(
    () => Boolean(localStorage.getItem("rememberedEmail"))
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  const performLogin = async (loginEmail, loginPassword) => {
    if (!loginEmail || !loginPassword) {
      setSnackbar({
        open: true,
        message: "Please enter both email and password.",
        severity: "error",
      });
      return;
    }

    if (!acceptedTerms) {
      setSnackbar({
        open: true,
        message: "Please accept the terms and conditions before logging in.",
        severity: "error",
      });
      return;
    }

    setSubmitting(true);

    try {
      await login(loginEmail, loginPassword);

      if (remember) {
        localStorage.setItem("rememberedEmail", loginEmail);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      navigate(location.state?.from || "/rooms", { replace: true });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.message || "Unable to log in. Please try again.",
        severity: "error",
      });
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
          maxWidth: 406,
          border: "1px solid #D7E5EB",
          borderRadius: "20px",
          backgroundColor: "#FFFFFF",
          px: 4,
          py: 3.5,
          boxShadow: "0 10px 30px rgba(30, 70, 90, 0.06)",
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            backgroundColor: "#E4F8F4",
            color: "#008A78",
            borderRadius: "18px",
            px: 1.5,
            py: 0.55,
            mb: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            Welcome back
          </Typography>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontSize: {
              xs: "28px",
              sm: "30px",
            },
            fontWeight: 700,
            color: "#142A4A",
            lineHeight: 1.15,
            mb: 1,
          }}
        >
          Login to RoomMate
          <br />
          Finder
        </Typography>

        <Typography
          sx={{
            fontSize: "15.5px",
            lineHeight: 1.55,
            color: "#49657D",
            mb: 3,
          }}
        >
          Pick up your Chennai roommate search securely.
        </Typography>

        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            performLogin(email, password);
          }}
        >
          <Box sx={{ mb: 0.6 }}>
            <Typography
              component="label"
              sx={{
                display: "block",
                fontSize: "14px",
                fontWeight: 700,
                color: "#31516D",
                mb: 0.8,
              }}
            >
              Email or mobile number
            </Typography>

            <TextField
              fullWidth
              required
              autoComplete="email"
              variant="outlined"
              size="medium"
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              sx={inputStyles}
            />
          </Box>

          <Box sx={{ mb: 1.3 }}>
            <Typography
              component="label"
              sx={{
                display: "block",
                fontSize: "14px",
                fontWeight: 700,
                color: "#31516D",
                mb: 0.8,
              }}
            >
              Password
            </Typography>

            <TextField
              fullWidth
              required
              autoComplete="current-password"
              variant="outlined"
              size="medium"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              sx={inputStyles}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.8,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  sx={{
                    p: 0.3,
                    mr: 0.4,
                    color: "#7A8794",
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
                    color: "#243858",
                  }}
                >
                  Remember me
                </Typography>
              }
              sx={{
                m: 0,
              }}
            />

            <Link
              component={RouterLink}
              to="/forgot-password"
              underline="none"
              sx={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#4218E8",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Forgot password?
            </Link>
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                sx={{
                  p: 0.3,
                  mr: 0.4,
                  color: "#7A8794",
                  "&.Mui-checked": { color: "#3730E8" },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: "12.5px", lineHeight: 1.5, color: "#52657D" }}>
                I accept the terms and understand that listings and brokers are
                third parties; the company is not responsible for any loss,
                dispute, or incident arising from them.
              </Typography>
            }
            sx={{ alignItems: "flex-start", m: 0, mb: 1.8 }}
          />

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={submitting}
            startIcon={
              submitting ? <CircularProgress size={18} color="inherit" /> : null
            }
            sx={{
              height: 49,
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
            Login
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 2.4,
          }}
        >
          <Typography
            sx={{
              fontSize: "13.5px",
              color: "#52657D",
            }}
          >
            New to RoomMate Finder?{" "}
            <Link
              component={RouterLink}
              to="/register"
              underline="none"
              sx={{
                color: "#4218E8",
                fontWeight: 700,
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Create a free account
            </Link>
          </Typography>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4500}
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

const inputStyles = {
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
};

export default Login;
