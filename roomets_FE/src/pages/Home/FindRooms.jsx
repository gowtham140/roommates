import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Skeleton,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowForwardRounded,
  FavoriteBorderRounded,
  FavoriteRounded,
  HomeRounded,
  LocationOnOutlined,
  SearchOffRounded,
  SearchRounded,
} from "@mui/icons-material";
import { getRooms } from "../../API/roomsAPI";

const PAGE_SIZE = 6;

const ROOM_TYPES = ["1RK", "1BHK", "2BHK", "3BHK"];
const GENDERS = ["ANY", "MALE", "FEMALE"];
const FOOD_OPTIONS = [
  { value: "true", label: "Food provided" },
  { value: "false", label: "No food" },
];

const FindRooms = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => ({
      location: searchParams.get("location") || "",
      minRent: searchParams.get("minRent") || "",
      maxRent: searchParams.get("maxRent") || "",
      roomType: searchParams.get("roomType") || "",
      gender: searchParams.get("gender") || "",
      food: searchParams.get("food") || "",
    }),
    [searchParams]
  );
  const [sort, setSort] = useState("recommended");
  const [page, setPage] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [rooms, setRooms] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedRooms, setSavedRooms] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
  });

  const loadRooms = useCallback(() => {
    let active = true;

    const params = { page, size: PAGE_SIZE };

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value != null) {
        params[key] = value;
      }
    });

    params.sort =
      sort === "rent-low"
        ? "rent,asc"
        : sort === "rent-high"
        ? "rent,desc"
        : "createdAt,desc";

    const timer = setTimeout(() => {
      setLoading(true);
      setError("");

      getRooms(params)
        .then((result) => {
          if (!active) return;
          setRooms(Array.isArray(result?.content) ? result.content : []);
          setTotalElements(result?.totalElements ?? 0);
          setTotalPages(result?.totalPages ?? 0);
        })
        .catch((err) => {
          if (active) {
            setRooms([]);
            setError(err?.message || "Unable to load rooms. Please try again.");
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [filters, sort, page]);

  useEffect(() => loadRooms(), [loadRooms, reloadKey]);

  const updateFilter = (name, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === "" || value == null) {
      next.delete(name);
    } else {
      next.set(name, value);
    }
    setSearchParams(next, { replace: true });
    setPage(0);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
    setSort("recommended");
    setPage(0);
  };

  const toggleSave = (roomId) => {
    const isSaved = savedRooms.includes(roomId);
    setSavedRooms((current) =>
      isSaved
        ? current.filter((id) => id !== roomId)
        : [...current, roomId]
    );
    setSnackbar({
      open: true,
      message: isSaved ? "Removed from saved rooms." : "Room saved.",
    });
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        backgroundColor: "#F5FAFC",
        py: { xs: 4, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{ color: "#0F9D8A", fontSize: "14px", fontWeight: 700, mb: 0.8 }}
          >
            Chennai rooms
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: "30px", md: "38px" },
              fontWeight: 700,
              color: "#17233C",
              mb: 1,
            }}
          >
            Find your next room
          </Typography>
          <Typography sx={{ color: "#667085", fontSize: "15px", maxWidth: 650 }}>
            Browse vacant rooms and beds directly from room providers. No
            broker listings.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D7E5EB",
            borderRadius: "18px",
            p: 2,
            mb: 3.5,
            boxShadow: "0 10px 25px rgba(40, 80, 100, 0.04)",
          }}
        >
          <Grid container spacing={1.5} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FieldLabel label="Location" />
              <TextField
                fullWidth
                size="small"
                placeholder="Search by area"
                value={filters.location}
                onChange={(event) => updateFilter("location", event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded sx={{ fontSize: 19, color: "#0F9D8A" }} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldStyles}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FieldLabel label="Min rent" />
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder="₹0"
                inputProps={{ min: 0 }}
                value={filters.minRent}
                onChange={(event) => updateFilter("minRent", event.target.value)}
                sx={fieldStyles}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FieldLabel label="Max rent" />
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder="Any"
                inputProps={{ min: 0 }}
                value={filters.maxRent}
                onChange={(event) => updateFilter("maxRent", event.target.value)}
                sx={fieldStyles}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FieldLabel label="Room type" />
              <FilterSelect
                value={filters.roomType}
                onChange={(value) => updateFilter("roomType", value)}
                options={ROOM_TYPES.map((option) => ({
                  value: option,
                  label: option,
                }))}
                placeholder="Any type"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FieldLabel label="Gender" />
              <FilterSelect
                value={filters.gender}
                onChange={(value) => updateFilter("gender", value)}
                options={GENDERS.map((option) => ({
                  value: option,
                  label:
                    option === "ANY"
                      ? "Any gender"
                      : option.charAt(0) + option.slice(1).toLowerCase(),
                }))}
                placeholder="Any gender"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FieldLabel label="Food" />
              <FilterSelect
                value={filters.food}
                onChange={(value) => updateFilter("food", value)}
                options={FOOD_OPTIONS}
                placeholder="Any food"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FieldLabel label="Sort by" />
              <FilterSelect
                value={sort}
                onChange={(value) => {
                  setSort(value);
                  setPage(0);
                }}
                options={[
                  { value: "recommended", label: "Recommended" },
                  { value: "rent-low", label: "Rent: low to high" },
                  { value: "rent-high", label: "Rent: high to low" },
                ]}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Box sx={{ display: "flex", gap: 1.2, alignItems: "flex-end", height: "100%" }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SearchRounded />}
                  onClick={() => {
                    setPage(0);
                    setReloadKey((key) => key + 1);
                  }}
                  sx={primaryButtonStyles}
                >
                  Search rooms
                </Button>
                <Button
                  onClick={clearFilters}
                  sx={{
                    height: 47,
                    borderRadius: "11px",
                    color: "#667085",
                    textTransform: "none",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            gap: 2,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#17233C" }}>
              Available rooms
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "#667085", mt: 0.3 }}>
              {loading ? "Searching rooms..." : `${totalElements} rooms found`}
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Grid container spacing={2.5}>
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card
                  elevation={0}
                  sx={{ borderRadius: "18px", border: "1px solid #D7E5EB", p: 1 }}
                >
                  <Skeleton variant="rectangular" height={210} sx={{ borderRadius: 2 }} />
                  <Box sx={{ p: 1.5 }}>
                    <Skeleton height={28} width="70%" />
                    <Skeleton height={20} width="45%" />
                    <Skeleton height={20} width="30%" sx={{ mt: 2 }} />
                    <Skeleton height={44} sx={{ mt: 2 }} />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Paper
            elevation={0}
            sx={{
              borderRadius: "18px",
              border: "1px solid #D7E5EB",
              backgroundColor: "#FFFFFF",
              p: 4,
              textAlign: "center",
            }}
          >
            <Alert severity="error" sx={{ borderRadius: "12px", maxWidth: 560, mx: "auto" }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              onClick={() => setReloadKey((key) => key + 1)}
              sx={{ ...primaryButtonStyles, mt: 2.5, width: "auto", px: 3 }}
            >
              Retry
            </Button>
          </Paper>
        ) : rooms.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              borderRadius: "18px",
              border: "1px solid #D7E5EB",
              backgroundColor: "#FFFFFF",
              p: 5,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                mx: "auto",
                mb: 2,
                borderRadius: "18px",
                backgroundColor: "#E4F8F4",
                color: "#0F9D8A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "& svg": { fontSize: 30 },
              }}
            >
              <SearchOffRounded />
            </Box>
            <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#17233C", mb: 0.8 }}>
              No rooms match your filters
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#667085", mb: 2.5 }}>
              Try a different location, budget or room type.
            </Typography>
            <Button
              variant="outlined"
              onClick={clearFilters}
              sx={{
                borderRadius: "11px",
                borderColor: "#BDD3DF",
                color: "#1D3553",
                textTransform: "none",
                fontWeight: 700,
                px: 3,
              }}
            >
              Clear filters
            </Button>
          </Paper>
        ) : (
          <>
            <Grid container spacing={2.5}>
              {rooms.map((room) => (
                <Grid key={room.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <RoomCard
                    room={room}
                    saved={savedRooms.includes(room.id)}
                    onSave={() => toggleSave(room.id)}
                    onView={() => navigate(`/rooms/${room.id}`)}
                  />
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={(_, value) => setPage(value - 1)}
                  color="primary"
                  shape="rounded"
                />
              </Box>
            )}
          </>
        )}
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

const RoomCard = ({ room, saved, onSave, onView }) => {
  const amenities = room.amenities || [];

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "18px",
        overflow: "hidden",
        border: "1px solid #D7E5EB",
        backgroundColor: "#FFFFFF",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 14px 32px rgba(40, 80, 100, 0.10)",
        },
      }}
    >
      <Box sx={{ position: "relative", height: 210, overflow: "hidden" }}>
        <RoomImage src={room.imageUrls?.[0]} alt={room.title} height="100%" />

        {room.status && (
          <Chip
            label={room.status}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              backgroundColor: "rgba(255,255,255,0.95)",
              color: room.status === "ACTIVE" ? "#0F9D8A" : "#17233C",
              fontWeight: 700,
            }}
          />
        )}

        <IconButton
          aria-label={saved ? "Remove from saved rooms" : "Save room"}
          onClick={onSave}
          sx={{
            position: "absolute",
            top: 9,
            right: 9,
            width: 38,
            height: 38,
            backgroundColor: "rgba(255,255,255,0.95)",
            "&:hover": { backgroundColor: "#FFFFFF" },
          }}
        >
          {saved ? (
            <FavoriteRounded sx={{ color: "#E53935" }} />
          ) : (
            <FavoriteBorderRounded sx={{ color: "#314A66" }} />
          )}
        </IconButton>

        <Chip
          icon={<LocationOnOutlined sx={{ fontSize: "16px !important" }} />}
          label={room.location || "Location not specified"}
          size="small"
          sx={{
            position: "absolute",
            bottom: 12,
            left: 12,
            maxWidth: "85%",
            backgroundColor: "rgba(20,42,74,0.88)",
            color: "#FFFFFF",
            fontWeight: 600,
            "& .MuiChip-icon": { color: "#FFFFFF" },
          }}
        />
      </Box>

      <CardContent
        sx={{
          p: 2,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          "&:last-child": { pb: 2 },
        }}
      >
        <Typography
          sx={{ fontSize: "18px", fontWeight: 700, color: "#17233C", mb: 0.6, lineHeight: 1.3 }}
        >
          {room.title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mb: 1.5 }}>
          <Typography sx={{ fontSize: "23px", fontWeight: 800, color: "#17233C" }}>
            ₹{Number(room.rent || 0).toLocaleString("en-IN")}
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "#667085" }}>/ month</Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mb: 1.3 }}>
          <InfoChip label={`Rent ₹${Number(room.rent || 0).toLocaleString("en-IN")}`} />
          <InfoChip label={`Deposit ₹${Number(room.deposit || 0).toLocaleString("en-IN")}`} />
          <InfoChip label={room.roomType || "Room"} />
          <InfoChip label={room.sharing || "Shared"} />
          <InfoChip label={room.gender || "ANY"} />
          <InfoChip label={room.food ? "Food provided" : "No food"} />
        </Box>

        {amenities.length > 0 && (
          <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap", mb: 1.3 }}>
            {amenities.slice(0, 4).map((amenity) => (
              <Chip
                key={amenity}
                label={amenity}
                size="small"
                variant="outlined"
                sx={{
                  height: 25,
                  fontSize: "11px",
                  color: "#0F9D8A",
                  borderColor: "#B8E5DE",
                  backgroundColor: "#F3FCFA",
                }}
              />
            ))}
            {amenities.length > 4 && (
              <Chip
                label={`+${amenities.length - 4}`}
                size="small"
                sx={{ height: 25, fontSize: "11px", backgroundColor: "#F3F7FA", color: "#667085" }}
              />
            )}
          </Box>
        )}

        <Box sx={{ mt: "auto", borderTop: "1px solid #EDF1F4", pt: 1.4, mb: 1.5 }}>
          <Typography sx={{ fontSize: "12px", color: "#667085" }}>Available from</Typography>
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#31516D" }}>
            {room.availableFrom || "Immediate"}
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="outlined"
          endIcon={<ArrowForwardRounded />}
          onClick={onView}
          sx={{
            height: 44,
            borderRadius: "10px",
            borderColor: "#BBD1DD",
            color: "#1D3553",
            textTransform: "none",
            fontWeight: 700,
            "&:hover": {
              borderColor: "#3730E8",
              color: "#3730E8",
              backgroundColor: "#F8F9FF",
            },
          }}
        >
          View Room
        </Button>
      </CardContent>
    </Card>
  );
};

export const RoomImage = ({ src, alt, height = 220, sx }) => {
  const [brokenSrc, setBrokenSrc] = useState(null);
  const isBroken = !src || brokenSrc === src;

  if (isBroken) {
    return (
      <Box
        sx={{
          height,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #DFF7F2 0%, #DCE5FF 100%)",
          color: "#0F9D8A",
          ...sx,
        }}
      >
        <HomeRounded sx={{ fontSize: 54, opacity: 0.75 }} />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt={alt || "Room"}
      onError={() => setBrokenSrc(src)}
      sx={{
        height,
        width: "100%",
        objectFit: "cover",
        display: "block",
        ...sx,
      }}
    />
  );
};

const FilterSelect = ({ value, onChange, options, placeholder }) => (
  <TextField
    select
    fullWidth
    size="small"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    SelectProps={{ displayEmpty: true }}
    sx={fieldStyles}
  >
    {placeholder && <MenuItem value="">{placeholder}</MenuItem>}
    {options.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
  </TextField>
);

const FieldLabel = ({ label }) => (
  <Typography
    component="label"
    sx={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#31516D", mb: 0.8 }}
  >
    {label}
  </Typography>
);

const InfoChip = ({ label }) => (
  <Chip
    label={label}
    size="small"
    sx={{
      height: 28,
      borderRadius: "8px",
      backgroundColor: "#F3F7FA",
      color: "#49657D",
      fontSize: "11px",
      fontWeight: 600,
    }}
  />
);

const primaryButtonStyles = {
  height: 47,
  borderRadius: "11px",
  backgroundColor: "#3730E8",
  textTransform: "none",
  fontSize: "14px",
  fontWeight: 700,
  boxShadow: "none",
  "&:hover": { backgroundColor: "#2F30D1", boxShadow: "none" },
};

const fieldStyles = {
  "& .MuiOutlinedInput-root": {
    height: 47,
    borderRadius: "11px",
    backgroundColor: "#FFFFFF",
    fontSize: "14px",
    "& fieldset": { borderColor: "#BDD3DF" },
    "&:hover fieldset": { borderColor: "#91B3C3" },
    "&.Mui-focused fieldset": { borderColor: "#3730E8", borderWidth: "1.5px" },
  },
  "& .MuiOutlinedInput-input": { fontSize: "14px", color: "#17233C" },
};

export default FindRooms;
