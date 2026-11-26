import { Component } from "react";
import { Alert, Button, Container, Paper } from "@mui/material";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={0} sx={{ borderRadius: "20px", border: "1px solid #D7E5EB", p: 4, textAlign: "center" }}>
          <Alert severity="error" sx={{ borderRadius: "12px", textAlign: "left", mb: 2 }}>
            Something went wrong while rendering this page.
          </Alert>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ borderRadius: "11px", textTransform: "none", fontWeight: 700, backgroundColor: "#3730E8" }}
          >
            Reload page
          </Button>
        </Paper>
      </Container>
    );
  }
}

export default ErrorBoundary;
