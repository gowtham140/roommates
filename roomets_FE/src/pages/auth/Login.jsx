import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Paper,
  TextField,
  Typography,
  Link,
} from "@mui/material";

import { Link as RouterLink } from "react-router-dom";

const Login = () => {
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
        {/* Welcome Badge */}
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

        {/* Heading */}
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

        {/* Subtitle */}
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

        {/* Email / Mobile */}
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
            variant="outlined"
            size="medium"
            type="text"
            sx={inputStyles}
          />
        </Box>

        {/* Password */}
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
            variant="outlined"
            size="medium"
            type="password"
            sx={inputStyles}
          />
        </Box>

        {/* Remember / Forgot */}
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
                sx={{
                  p: 0.3,
                  mr: 0.4,
                  color: "#7A8794",

                  "&.Mui-checked": {
                    color: "#3737E8",
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

        {/* Login Button */}
        <Button
          fullWidth
          variant="contained"
          type="submit"
          sx={{
            height: 49,
            borderRadius: "11px",
            backgroundColor: "#3737E8",
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

        {/* Divider */}
        <Divider
          sx={{
            my: 2.3,
            borderColor: "#E0E7EC",
          }}
        />

        {/* Demo button */}
        <Button
          fullWidth
          variant="contained"
          sx={{
            height: 48,
            borderRadius: "11px",
            backgroundColor: "#E5F1FF",
            color: "#293DD6",
            textTransform: "none",
            fontSize: "14px",
            fontWeight: 700,
            boxShadow: "none",

            "&:hover": {
              backgroundColor: "#D8E9FF",
              boxShadow: "none",
            },
          }}
        >
          Continue as verified user (demo)
        </Button>

        {/* Register */}
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
      borderColor: "#3737E8",
      borderWidth: "1.5px",
    },
  },

  "& .MuiOutlinedInput-input": {
    fontSize: "14px",
    color: "#172A43",
  },
};

export default Login;