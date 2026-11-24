import {
  Box,
  Button,
  Chip,
  Container,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import MailOutlineRounded from "@mui/icons-material/MailOutlineRounded";
import LockResetRounded from "@mui/icons-material/LockResetRounded";
import { Link as RouterLink } from "react-router-dom";

const ForgotPassword = () => {
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
            <LockResetRounded />
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
            Reset your password
          </Typography>

          <Typography
            sx={{
              fontSize: "15.5px",
              lineHeight: 1.6,
              color: "#667085",
              mb: 2.5,
            }}
          >
            Password resets are handled by our support team to keep your
            account secure. Email us from the address linked to your account
            and we will help you regain access.
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              backgroundColor: "#F5FAFC",
              border: "1px solid #D7E5EB",
              borderRadius: "12px",
              p: 2,
              mb: 3,
              color: "#0F9D8A",
            }}
          >
            <MailOutlineRounded sx={{ fontSize: 22 }} />
            <Link
              href="mailto:support@roommates.local"
              underline="none"
              sx={{ fontSize: "15px", fontWeight: 700 }}
            >
              support@roommates.local
            </Link>
          </Box>

          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            fullWidth
            sx={{
              height: 48,
              borderRadius: "11px",
              backgroundColor: "#3730E8",
              textTransform: "none",
              fontSize: "15px",
              fontWeight: 700,
              boxShadow: "none",
              "&:hover": { backgroundColor: "#2F30D1", boxShadow: "none" },
            }}
          >
            Back to login
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
