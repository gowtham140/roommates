import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import FeedbackOutlined from "@mui/icons-material/FeedbackOutlined";
import { submitFeedback } from "../../API/feedbackAPI";

const CATEGORIES = ["Suggestion", "Improvement", "Issue", "Other"];

const Feedback = () => {
  const [category, setCategory] = useState("Suggestion");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ open: false, message: "", severity: "success" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (trimmed.length < 10) {
      setNotice({ open: true, message: "Please enter at least 10 characters.", severity: "error" });
      return;
    }

    setSubmitting(true);
    try {
      await submitFeedback({ category, message: trimmed });
      setMessage("");
      setNotice({ open: true, message: "Thank you. Your feedback was submitted.", severity: "success" });
    } catch (err) {
      setNotice({
        open: true,
        message: err?.message || "Unable to submit feedback. Please try again.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", backgroundColor: "#F5FAFC", py: { xs: 4, md: 5 } }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ color: "#0F9D8A", fontSize: 14, fontWeight: 700, mb: 0.8 }}>
            Share your ideas
          </Typography>
          <Typography
            component="h1"
            sx={{ fontSize: { xs: 30, md: 38 }, fontWeight: 700, color: "#17233C", mb: 1 }}
          >
            Feedback & Improvements
          </Typography>
          <Typography sx={{ fontSize: 15, color: "#667085" }}>
            Tell us what is working well or what we should improve. Our admin team reads every submission.
          </Typography>
        </Box>

        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          sx={{ borderRadius: "20px", border: "1px solid #D7E5EB", p: { xs: 2.5, md: 4 } }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, mb: 3 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                backgroundColor: "#EEF4FF",
                color: "#3730E8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FeedbackOutlined />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#17233C" }}>
                We would love to hear from you
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#667085" }}>
                Your feedback is shared privately with the site admin.
              </Typography>
            </Box>
          </Box>

          <FormControl fullWidth sx={{ mb: 2.5 }}>
            <InputLabel id="feedback-category-label">Category</InputLabel>
            <Select
              labelId="feedback-category-label"
              id="feedback-category"
              label="Category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              sx={{ borderRadius: "11px" }}
            >
              {CATEGORIES.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#31516D", mb: 0.8 }}>
            Your suggestion
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={6}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Describe your suggestion or improvement..."
            inputProps={{ maxLength: 2000 }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "11px" } }}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={17} color="inherit" /> : null}
              sx={{
                height: 44,
                px: 3,
                borderRadius: "11px",
                backgroundColor: "#3730E8",
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "none",
                "&:hover": { backgroundColor: "#2F30D1", boxShadow: "none" },
              }}
            >
              Submit feedback
            </Button>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={notice.open}
        autoHideDuration={4000}
        onClose={() => setNotice((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={notice.severity}
          variant="filled"
          onClose={() => setNotice((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {notice.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Feedback;
