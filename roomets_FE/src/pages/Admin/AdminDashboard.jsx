import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  CircularProgress,
  Paper,
  Snackbar,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import BlockRounded from "@mui/icons-material/BlockRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import ShieldRounded from "@mui/icons-material/ShieldRounded";
import {
  getAdminRooms,
  getAdminUsers,
  setRoomBlocked,
  setUserBlocked,
} from "../../API/adminAPI";
import { useAuth } from "../../context/authContext";

const ADMIN_BLOCKED = ["BLOCKED", "BLOCKED_BY_USER"];

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(() => {
    let active = true;

    Promise.all([getAdminUsers(), getAdminRooms()])
      .then(([userRows, roomRows]) => {
        if (!active) return;
        setError("");
        setUsers(Array.isArray(userRows) ? userRows : []);
        setRooms(Array.isArray(roomRows) ? roomRows : []);
      })
      .catch((err) => {
        if (active) setError(err?.message || "Unable to load admin data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => load(), [load]);

  const handleUserBlock = async (row, blocked) => {
    const key = `user-${row.id}`;
    setBusyKey(key);
    try {
      const updated = await setUserBlocked(row.id, blocked);
      setUsers((rows) => rows.map((item) => (item.id === row.id ? updated : item)));
      const refreshedRooms = await getAdminRooms();
      setRooms(Array.isArray(refreshedRooms) ? refreshedRooms : []);
      setNotice(blocked ? `${row.name} blocked. Their rooms were blocked too.` : `${row.name} unblocked.`);
    } catch (err) {
      setNotice(err?.message || "Unable to update user status.");
    } finally {
      setBusyKey("");
    }
  };

  const handleRoomBlock = async (row, blocked) => {
    const key = `room-${row.id}`;
    setBusyKey(key);
    try {
      const updated = await setRoomBlocked(row.id, blocked);
      setRooms((rows) => rows.map((item) => (item.id === row.id ? updated : item)));
      setNotice(blocked ? `${row.title} blocked.` : `${row.title} unblocked.`);
    } catch (err) {
      setNotice(err?.message || "Unable to update room status.");
    } finally {
      setBusyKey("");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid #E8ECF2",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: { xs: 2.5, md: 3.5 },
            background: "linear-gradient(120deg, #17233C 0%, #303FD9 100%)",
            color: "#fff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
            <ShieldRounded sx={{ fontSize: 30 }} />
            <Box>
              <Typography sx={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>
                Admin Dashboard
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#DCE5FF", mt: 0.4 }}>
                Manage users and room listings
              </Typography>
            </Box>
          </Box>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          sx={{ px: { xs: 1, md: 2 }, borderBottom: "1px solid #E8ECF2" }}
        >
          <Tab label={`Users (${users.length})`} />
          <Tab label={`Rooms (${rooms.length})`} />
        </Tabs>

        {error && (
          <Box sx={{ px: 3, pt: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : tab === 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#F8FAFC" }}>
                  <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Rooms</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((row) => {
                  const isAdmin = row.userType === "1";
                  const isSelf = row.id === currentUser?.id;
                  const disabled = isAdmin || isSelf || busyKey === `user-${row.id}`;
                  return (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{row.name}</Typography>
                        <Typography sx={{ fontSize: 12, color: "#667085" }}>{row.email}</Typography>
                      </TableCell>
                      <TableCell>{isAdmin ? "Admin" : "User"}</TableCell>
                      <TableCell>
                        {row.activeRoomCount} active / {row.blockedRoomCount} blocked
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.blocked ? "Blocked" : "Active"}
                          sx={{
                            fontWeight: 700,
                            backgroundColor: row.blocked ? "#FEE4E2" : "#E4F8F4",
                            color: row.blocked ? "#B42318" : "#0F9D8A",
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={disabled}
                          startIcon={row.blocked ? <CheckCircleRounded /> : <BlockRounded />}
                          onClick={() => handleUserBlock(row, !row.blocked)}
                          sx={{ textTransform: "none", fontWeight: 700 }}
                        >
                          {busyKey === `user-${row.id}`
                            ? "Working..."
                            : row.blocked
                            ? "Unblock"
                            : "Block"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#F8FAFC" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Owner</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rooms.map((row) => {
                  const blocked = ADMIN_BLOCKED.includes(row.status);
                  return (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{row.title}</Typography>
                        <Typography sx={{ fontSize: 12, color: "#667085" }}>
                          ₹{Number(row.rent || 0).toLocaleString("en-IN")} / month
                        </Typography>
                      </TableCell>
                      <TableCell>{row.ownerName || "-"}</TableCell>
                      <TableCell>{row.location || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.status || "ACTIVE"}
                          sx={{
                            fontWeight: 700,
                            backgroundColor: blocked ? "#FEE4E2" : "#E4F8F4",
                            color: blocked ? "#B42318" : "#0F9D8A",
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={busyKey === `room-${row.id}`}
                          startIcon={blocked ? <CheckCircleRounded /> : <BlockRounded />}
                          onClick={() => handleRoomBlock(row, !blocked)}
                          sx={{ textTransform: "none", fontWeight: 700 }}
                        >
                          {busyKey === `room-${row.id}`
                            ? "Working..."
                            : blocked
                            ? "Unblock"
                            : "Block"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={3500}
        onClose={() => setNotice("")}
        message={notice}
      />
    </Container>
  );
};

export default AdminDashboard;
