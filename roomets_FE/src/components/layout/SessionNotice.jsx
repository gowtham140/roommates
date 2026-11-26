import { Alert, Button, Snackbar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const SessionNotice = () => {
  const navigate = useNavigate();
  const { sessionExpired, clearSessionExpired } = useAuth();

  const handleSignIn = () => {
    clearSessionExpired();
    navigate("/login");
  };

  return (
    <Snackbar
      open={sessionExpired}
      autoHideDuration={12000}
      onClose={clearSessionExpired}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        severity="warning"
        variant="filled"
        onClose={clearSessionExpired}
        action={
          <Button color="inherit" size="small" onClick={handleSignIn}>
            Sign in
          </Button>
        }
        sx={{ width: "100%" }}
      >
        Your session has expired. Please sign in again.
      </Alert>
    </Snackbar>
  );
};

export default SessionNotice;
