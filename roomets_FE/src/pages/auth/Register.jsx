import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  TextField,
  Typography,
  Link,
} from "@mui/material";

import { Link as RouterLink } from "react-router-dom";

const Register = () => {
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
          px: 4,
          py: 3.5,
          boxShadow: "0 10px 30px rgba(30, 70, 90, 0.06)",
        }}
      >
        {/* Heading */}
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

        {/* Form */}
        <Grid container spacing={2}>
          {/* Name */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="Name"
              placeholder=""
            />
          </Grid>

          {/* Email */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="Email"
              type="email"
            />
          </Grid>

          {/* Mobile */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="Mobile number"
              type="tel"
            />
          </Grid>

          {/* Password */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="Password"
              type="password"
            />
          </Grid>

          {/* Confirm Password */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="Confirm password"
              type="password"
            />
          </Grid>

          {/* Agreement */}
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

          {/* Create Account */}
          <Grid size={12}>
            <Button
              fullWidth
              variant="contained"
              type="submit"
              sx={{
                height: 49,
                mt: 0.5,
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
              Create account
            </Button>
          </Grid>
        </Grid>

        {/* Login */}
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
    </Box>
  );
};


/*
 * Reusable form field
 */
const FormField = ({
  label,
  type = "text",
  placeholder = "",
}) => {
  return (
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
        placeholder={placeholder}
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
              borderColor: "#3737E8",
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