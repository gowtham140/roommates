import { useCallback, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import useLoadEffect from "../../hooks/useLoadEffect";

const ADMIN_BLOCKED = ["BLOCKED", "BLOCKED_BY_USER"];

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [notice, setNotice] = useState({ message: "", severity: "success" });

  const load = useCallback(() => {
    let active = true;
    setError("");
    setLoading(true);

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

  useLoadEffect(load);

  const handleUserBlock = async (row, blocked) => {
    const key = `user-${row.id}`;
    setBusyKey(key);
    try {
      const updated = await setUserBlocked(row.id, blocked);
      setUsers((rows) => rows.map((item) => (item.id === row.id ? updated : item)));
      const refreshedRooms = await getAdminRooms();
      setRooms(Array.isArray(refreshedRooms) ? refreshedRooms : []);
      setNotice({
        message: blocked ? `${row.name} blocked. Their rooms were blocked too.` : `${row.name} unblocked.`,
        severity: "success",
      });
    } catch (err) {
      setNotice({
        message: err?.message || "Unable to update user status.",
        severity: "error",
      });
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
      setNotice({
        message: blocked ? `${row.title} blocked.` : `${row.title} unblocked.`,
        severity: "success",
      });
    } catch (err) {
      setNotice({
        message: err?.message || "Unable to update room status.",
        severity: "error",
      });
    } finally {
      setBusyKey("");
    }
  };

  const confirmBlock = async () => {
    if (!confirmTarget) return;
    const { row, blocked, kind } = confirmTarget;
    setConfirmTarget(null);
    if (kind === "user") {
      await handleUserBlock(row, blocked);
    } else {
      await handleRoomBlock(row, blocked);
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
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={load}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : tab === 0 ? (
          <>
          <Box sx={{ display: { xs: "grid", md: "none" }, gap: 1.5, p: 2 }}>
            {users.map((row) => (
              <AdminUserCard
                key={row.id}
                row={row}
                currentUserId={currentUser?.id}
                busy={busyKey === `user-${row.id}`}
                onConfirm={(blocked) => setConfirmTarget({ row, blocked, kind: "user" })}
              />
            ))}
          </Box>
          <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
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
                          onClick={() =>
                            setConfirmTarget({ row, blocked: !row.blocked, kind: "user" })
                          }
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
          </>
        ) : (
          <>
          <Box sx={{ display: { xs: "grid", md: "none" }, gap: 1.5, p: 2 }}>
            {rooms.map((row) => (
              <AdminRoomCard
                key={row.id}
                row={row}
                blocked={ADMIN_BLOCKED.includes(row.status)}
                busy={busyKey === `room-${row.id}`}
                onConfirm={(blocked) => setConfirmTarget({ row, blocked, kind: "room" })}
              />
            ))}
          </Box>
          <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
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
                          onClick={() =>
                            setConfirmTarget({ row, blocked: !blocked, kind: "room" })
                          }
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
          </>
        )}
      </Paper>

      <Dialog
        open={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "18px" } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#17233C" }}>
          {confirmTarget?.blocked ? "Block" : "Unblock"}{" "}
          {confirmTarget?.kind === "user" ? "this user?" : "this room?"}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "14px", color: "#667085" }}>
            {confirmTarget?.kind === "user"
              ? `${confirmTarget?.row?.name || "This user"} will ${
                  confirmTarget?.blocked ? "be blocked, along with their rooms" : "be unblocked"
                }.`
              : `${confirmTarget?.row?.title || "This room"} will ${
                  confirmTarget?.blocked ? "no longer be visible to seekers" : "be visible again"
                }.`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setConfirmTarget(null)}
            sx={{ color: "#667085", textTransform: "none", fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmBlock}
            variant="contained"
            color={confirmTarget?.blocked ? "error" : "primary"}
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, boxShadow: "none" }}
          >
            {confirmTarget?.blocked ? "Block" : "Unblock"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(notice.message)}
        autoHideDuration={3500}
        onClose={() => setNotice({ message: "", severity: "success" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={notice.severity}
          variant="filled"
          onClose={() => setNotice({ message: "", severity: "success" })}
          sx={{ width: "100%" }}
        >
          {notice.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

const cardSx = {
  borderRadius: "14px",
  border: "1px solid #E3EBF0",
  p: 2,
  backgroundColor: "#FFFFFF",
};

const AdminUserCard = ({ row, currentUserId, busy, onConfirm }) => {
  const isAdmin = row.userType === "1";
  const disabled = isAdmin || row.id === currentUserId || busy;

  return (
    <Paper elevation={0} sx={cardSx}>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "flex-start" }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#17233C" }}>{row.name}</Typography>
          <Typography sx={{ fontSize: 12, color: "#667085", overflowWrap: "anywhere" }}>{row.email}</Typography>
        </Box>
        <Chip
          size="small"
          label={row.blocked ? "Blocked" : "Active"}
          sx={{
            fontWeight: 700,
            backgroundColor: row.blocked ? "#FEE4E2" : "#E4F8F4",
            color: row.blocked ? "#B42318" : "#0F9D8A",
          }}
        />
      </Box>
      <Typography sx={{ fontSize: 12, color: "#667085", mt: 1.5 }}>
        {isAdmin ? "Admin" : "User"} · {row.activeRoomCount} active / {row.blockedRoomCount} blocked
      </Typography>
      <Button
        fullWidth
        size="small"
        variant="outlined"
        disabled={disabled}
        startIcon={row.blocked ? <CheckCircleRounded /> : <BlockRounded />}
        onClick={() => onConfirm(!row.blocked)}
        sx={{ mt: 1.5, textTransform: "none", fontWeight: 700 }}
      >
        {busy ? "Working..." : row.blocked ? "Unblock" : "Block"}
      </Button>
    </Paper>
  );
};

const AdminRoomCard = ({ row, blocked, busy, onConfirm }) => (
  <Paper elevation={0} sx={cardSx}>
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "flex-start" }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#17233C" }}>{row.title}</Typography>
        <Typography sx={{ fontSize: 12, color: "#667085" }}>
          ₹{Number(row.rent || 0).toLocaleString("en-IN")} / month
        </Typography>
      </Box>
      <Chip
        size="small"
        label={row.status || "ACTIVE"}
        sx={{
          fontWeight: 700,
          backgroundColor: blocked ? "#FEE4E2" : "#E4F8F4",
          color: blocked ? "#B42318" : "#0F9D8A",
        }}
      />
    </Box>
    <Typography sx={{ fontSize: 12, color: "#667085", mt: 1.5 }}>
      {row.ownerName || "-"} · {row.location || "-"}
    </Typography>
    <Button
      fullWidth
      size="small"
      variant="outlined"
      disabled={busy}
      startIcon={blocked ? <CheckCircleRounded /> : <BlockRounded />}
      onClick={() => onConfirm(!blocked)}
      sx={{ mt: 1.5, textTransform: "none", fontWeight: 700 }}
    >
      {busy ? "Working..." : blocked ? "Unblock" : "Block"}
    </Button>
  </Paper>
);

export default AdminDashboard;
