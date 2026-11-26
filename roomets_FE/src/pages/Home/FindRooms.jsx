import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Pagination,
  Paper,
  Skeleton,
  Snackbar,
  Typography,
} from "@mui/material";
import {
  ArrowForwardRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  FavoriteBorderRounded,
  FavoriteRounded,
  LocationOnOutlined,
  NearMeRounded,
  SearchOffRounded,
} from "@mui/icons-material";
import RoomFilters from "../../components/rooms/RoomFilters";
import RoomImage from "../../components/rooms/RoomImage";
import {
  ROOM_FILTER_KEYS,
  createRoomFilterValues,
  toRoomFilterQuery,
} from "../../components/rooms/roomFilterUtils";
import { getRooms } from "../../API/roomsAPI";
import { useAuth } from "../../context/authContext";
import useUserLocation from "../../hooks/useUserLocation";
import { distanceKm, formatDistance } from "../../utils/geo";
import { getSavedRoomIds, toggleSavedRoom } from "../../utils/savedRooms";

const PAGE_SIZE = 6;

const FindRooms = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { position: userPosition, error: locationError, refresh: refreshLocation } = useUserLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const appliedFilters = useMemo(
    () => createRoomFilterValues(Object.fromEntries(searchParams)),
    [searchParams]
  );
  const { sort } = appliedFilters;
  const [draftFilters, setDraftFilters] = useState(
    () => createRoomFilterValues(Object.fromEntries(searchParams))
  );
  const [page, setPage] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [rooms, setRooms] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedRooms, setSavedRooms] = useState(() => getSavedRoomIds(user?.id));
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
  });

  useEffect(() => {
    const userId = user?.id;
    queueMicrotask(() => setSavedRooms(getSavedRoomIds(userId)));
  }, [user?.id]);

  useEffect(() => {
    const nextFilters = createRoomFilterValues(Object.fromEntries(searchParams));
    queueMicrotask(() => setDraftFilters(nextFilters));
  }, [searchParams]);

  const loadSequence = useRef(0);

  const loadRooms = useCallback(() => {
    const sequence = loadSequence.current + 1;
    loadSequence.current = sequence;

    const params = { page, size: PAGE_SIZE };

    ROOM_FILTER_KEYS.forEach((key) => {
      const value = appliedFilters[key];
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

    setLoading(true);
    setError("");

    getRooms(params)
      .then((result) => {
        if (sequence !== loadSequence.current) return;
        setRooms(Array.isArray(result?.content) ? result.content : []);
        setTotalElements(result?.totalElements ?? 0);
        setTotalPages(result?.totalPages ?? 0);
      })
      .catch((err) => {
        if (sequence !== loadSequence.current) return;
        setRooms([]);
        setError(err?.message || "Unable to load rooms. Please try again.");
      })
      .finally(() => {
        if (sequence === loadSequence.current) setLoading(false);
      });
  }, [appliedFilters, sort, page]);

  useEffect(() => {
    queueMicrotask(loadRooms);
  }, [loadRooms, reloadKey]);

  const updateFilter = (name, value) => {
    setDraftFilters((current) => ({ ...current, [name]: value }));
  };

  const submitFilters = () => {
    const nextQuery = toRoomFilterQuery(draftFilters);
    const changed = nextQuery.toString() !== searchParams.toString();

    setPage(0);
    if (changed) {
      setSearchParams(nextQuery, { replace: true });
    } else {
      setReloadKey((key) => key + 1);
    }
  };

  const clearDraftFilters = () => {
    setDraftFilters(createRoomFilterValues());
  };

  const resetAppliedFilters = () => {
    setDraftFilters(createRoomFilterValues());
    setPage(0);
    setRooms([]);
    setTotalElements(0);
    setTotalPages(0);
    setError("");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const toggleSave = (roomId) => {
    const { saved, ids } = toggleSavedRoom(user?.id, roomId);
    setSavedRooms(ids);
    setSnackbar({
      open: true,
      message: saved ? "Room saved." : "Removed from saved rooms.",
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
          <RoomFilters
            values={draftFilters}
            onChange={updateFilter}
            onClear={clearDraftFilters}
            onSubmit={submitFilters}
          />
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
            {locationError && (
              <Typography sx={{ fontSize: 12, color: "#B42318", mt: 0.4 }}>
                Location unavailable — {locationError}
              </Typography>
            )}
          </Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<NearMeRounded />}
            onClick={refreshLocation}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "10px",
              borderColor: "#B8E5DE",
              color: "#0F9D8A",
              whiteSpace: "nowrap",
            }}
          >
            {userPosition ? "Refresh location" : "Use my location"}
          </Button>
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
              onClick={resetAppliedFilters}
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
                    userPosition={userPosition}
                    saved={savedRooms.includes(String(room.id))}
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

const RoomCard = ({ room, userPosition, saved, onSave, onView }) => {
  const amenities = room.amenities || [];
  const distanceLabel = formatDistance(distanceKm(userPosition, room));

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
        <RoomImageCarousel images={room.imageUrls} alt={room.title} height={210} />

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

        {distanceLabel && (
          <Chip
            icon={<NearMeRounded sx={{ fontSize: "16px !important" }} />}
            label={distanceLabel}
            title="Straight-line distance from your current location"
            size="small"
            sx={{
              position: "absolute",
              bottom: 12,
              right: 12,
              backgroundColor: "rgba(255,255,255,0.95)",
              color: "#0F9D8A",
              fontWeight: 700,
              "& .MuiChip-icon": { color: "#0F9D8A" },
            }}
          />
        )}
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
          <InfoChip
            label={
              room.food
                ? `Food: ${room.foodPreference || "Provided"}`
                : "No food"
            }
          />
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

const RoomImageCarousel = ({ images, alt, height = 210 }) => {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const slides = Array.isArray(images) && images.length > 0 ? images : [null];

  const goTo = (nextIndex) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.min(Math.max(nextIndex, 0), slides.length - 1);
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    setIndex(clamped);
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  if (slides.length === 1) {
    return <RoomImage src={slides[0]} alt={alt} height={height} />;
  }

  return (
    <Box sx={{ position: "relative", height, overflow: "hidden" }}>
      <Box
        ref={trackRef}
        onScroll={handleScroll}
        sx={{
          display: "flex",
          height: "100%",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {slides.map((src, slideIndex) => (
          <Box
            key={`${src || "placeholder"}-${slideIndex}`}
            sx={{ flex: "0 0 100%", height: "100%", scrollSnapAlign: "start" }}
          >
            <RoomImage src={src} alt={`${alt || "Room"} ${slideIndex + 1}`} height="100%" />
          </Box>
        ))}
      </Box>

      <IconButton
        aria-label="Previous image"
        onClick={(event) => {
          event.stopPropagation();
          goTo(index - 1);
        }}
        disabled={index === 0}
        sx={arrowStyles({ left: 8 })}
      >
        <ChevronLeftRounded />
      </IconButton>
      <IconButton
        aria-label="Next image"
        onClick={(event) => {
          event.stopPropagation();
          goTo(index + 1);
        }}
        disabled={index === slides.length - 1}
        sx={arrowStyles({ right: 8 })}
      >
        <ChevronRightRounded />
      </IconButton>

      <Box
        sx={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 0.6,
          px: 1.1,
          py: 0.45,
          borderRadius: "999px",
          backgroundColor: "rgba(20,42,74,0.72)",
        }}
      >
        {slides.map((_, dotIndex) => (
          <Box
            key={dotIndex}
            component="button"
            type="button"
            aria-label={`Show image ${dotIndex + 1}`}
            onClick={(event) => {
              event.stopPropagation();
              goTo(dotIndex);
            }}
            sx={{
              p: 0,
              border: 0,
              cursor: "pointer",
              width: dotIndex === index ? 16 : 6,
              height: 6,
              borderRadius: "999px",
              backgroundColor: dotIndex === index ? "#FFFFFF" : "rgba(255,255,255,0.55)",
              transition: "width 0.2s ease, background-color 0.2s ease",
            }}
          />
        ))}
        <Typography sx={{ color: "#FFFFFF", fontSize: 11, fontWeight: 700, ml: 0.3 }}>
          {index + 1}/{slides.length}
        </Typography>
      </Box>
    </Box>
  );
};

const arrowStyles = ({ left, right }) => ({
  position: "absolute",
  top: "50%",
  left,
  right,
  transform: "translateY(-50%)",
  width: 34,
  height: 34,
  backgroundColor: "rgba(255,255,255,0.94)",
  color: "#17233C",
  "&:hover": { backgroundColor: "#FFFFFF" },
  "&.Mui-disabled": { opacity: 0.35, backgroundColor: "rgba(255,255,255,0.8)" },
});

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

export default FindRooms;
