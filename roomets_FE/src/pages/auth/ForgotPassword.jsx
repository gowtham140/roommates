import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Link,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import LockResetRounded from "@mui/icons-material/LockResetRounded";
import MailOutlineRounded from "@mui/icons-material/MailOutlineRounded";
import { forgotPassword, resetPassword } from "../../API/authAPI";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (step === 0) {
      if (!email.trim()) {
        setError("Please enter your email address.");
        return;
      }

      setSubmitting(true);
      try {
        await forgotPassword(email.trim());
        setStep(1);
        setSnackbar({
          open: true,
          message: "Verification code sent to your email.",
          severity: "success",
        });
      } catch (err) {
        const message = err?.message || "Unable to send the verification code.";
        setError(message);
        setSnackbar({ open: true, message, severity: "error" });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter the 6-digit code sent to your email.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Password and confirm password must be the same.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setDone(true);
      setSnackbar({
        open: true,
        message: "Password reset successfully. Please log in.",
        severity: "success",
      });
    } catch (err) {
      const message = err?.message || "Unable to reset your password.";
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
        py: { xs: 5, md: 7 },
        px: 2,
      }}
    >
      <Container maxWidth="sm" disableGutters>
        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            border: "1px solid #D7E5EB",
            backgroundColor: "#FFFFFF",
            p: { xs: 3, sm: 4.5 },
            boxShadow: "0 10px 30px rgba(30, 70, 90, 0.06)",
          }}
        >
          <Chip
            label="Account help"
            size="small"
            sx={{
              backgroundColor: "#E4F8F4",
              color: "#0F9D8A",
              fontWeight: 700,
              mb: 2,
            }}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: "18px",
              backgroundColor: "#EEF0FF",
              color: "#3730E8",
              mb: 2.5,
              "& svg": { fontSize: 32 },
            }}
          >
            {step === 0 ? <MailOutlineRounded /> : <LockResetRounded />}
          </Box>

          <Typography
            component="h1"
            sx={{
              fontSize: { xs: "28px", sm: "32px" },
              fontWeight: 700,
              color: "#17233C",
              lineHeight: 1.2,
              mb: 1.2,
            }}
          >
            {done ? "Password updated" : "Reset your password"}
          </Typography>

          <Typography
            sx={{
              fontSize: "15.5px",
              lineHeight: 1.6,
              color: "#667085",
              mb: 2.5,
            }}
          >
            {done
              ? "You can now sign in with your new password."
              : step === 0
                ? "Enter the email linked to your account. We will send a 6-digit verification code to it."
                : `Enter the 6-digit code sent to ${email.trim()} and choose a new password.`}
          </Typography>

          {done ? (
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              fullWidth
              sx={primaryButtonStyles}
            >
              Back to login
            </Button>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              {step === 0 ? (
                <FormField
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              ) : (
                <>
                  <FormField
                    label="Verification code"
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="123456"
                    inputProps={{ inputMode: "numeric", maxLength: 6 }}
                  />
                  <Box sx={{ mt: 2 }}>
                    <FormField
                      label="New password"
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="At least 6 characters"
                    />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <FormField
                      label="Confirm new password"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Re-enter new password"
                    />
                  </Box>
                  <Button
                    type="button"
                    size="small"
                    disabled={submitting}
                    onClick={async () => {
                      try {
                        await forgotPassword(email.trim());
                        setSnackbar({
                          open: true,
                          message: "A new verification code has been sent.",
                          severity: "success",
                        });
                      } catch (err) {
                        setError(err?.message || "Unable to resend the code.");
                      }
                    }}
                    sx={{
                      mt: 1,
                      textTransform: "none",
                      fontWeight: 700,
                      color: "#3730E8",
                    }}
                  >
                    Resend code
                  </Button>
                </>
              )}

              {error && (
                <Alert severity="error" sx={{ borderRadius: "10px", mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={submitting}
                startIcon={
                  submitting ? <CircularProgress size={18} color="inherit" /> : null
                }
                sx={{ ...primaryButtonStyles, mt: 3 }}
              >
                {step === 0 ? "Send verification code" : "Reset password"}
              </Button>
            </Box>
          )}

          <Box sx={{ mt: 2.5 }}>
            <Link
              component={RouterLink}
              to="/login"
              underline="none"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.6,
                color: "#52657D",
                fontSize: "13.5px",
                fontWeight: 700,
              }}
            >
              <ArrowBackRounded sx={{ fontSize: 17 }} />
              Back to login
            </Link>
          </Box>
        </Paper>
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

const FormField = ({ label, type = "text", value, onChange, placeholder, inputProps }) => (
  <Box>
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
      {label}
    </Typography>
    <TextField
      fullWidth
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      inputProps={inputProps}
      variant="outlined"
      sx={fieldStyles}
    />
  </Box>
);

const primaryButtonStyles = {
  height: 48,
  borderRadius: "11px",
  backgroundColor: "#3730E8",
  textTransform: "none",
  fontSize: "15px",
  fontWeight: 700,
  boxShadow: "none",
  "&:hover": { backgroundColor: "#2F30D1", boxShadow: "none" },
};

const fieldStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "11px",
    backgroundColor: "#FFFFFF",
    "& fieldset": { borderColor: "#BDD3DF" },
    "&:hover fieldset": { borderColor: "#91B3C3" },
    "&.Mui-focused fieldset": { borderColor: "#3730E8", borderWidth: "1.5px" },
  },
  "& .MuiOutlinedInput-input": { fontSize: "14px", color: "#172A43" },
};

export default ForgotPassword;
