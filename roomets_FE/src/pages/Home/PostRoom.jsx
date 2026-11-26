import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import PlaceRounded from "@mui/icons-material/PlaceRounded";
import { createRoom, deleteRoomImage, getRoom, updateRoom, uploadImages } from "../../API/roomsAPI";
import { resolveImageUrl } from "../../API/app-config";
import MapPicker from "../../components/maps/MapPicker";
import { useAuth } from "../../context/authContext";
import { canManageRooms } from "../../utils/userTypes";

const AMENITIES = [
  "WiFi",
  "AC",
  "Fridge",
  "Washing Machine",
  "Parking",
  "Gym",
  "TV",
  "Balcony",
];

const ROOM_TYPES = ["1RK", "1BHK", "2BHK", "3BHK"];
const SHARING_OPTIONS = ["Single", "Double", "Triple"];
const GENDERS = ["ANY", "MALE", "FEMALE"];
const FOOD_PREFERENCES = ["Vegetarian", "Non-Vegetarian", "Both"];
const MAX_ROOM_IMAGES = 8;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif)$/i;

const roomSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  location: z.string().trim().min(2, "Location is required"),
  rent: z
    .string()
    .min(1, "Rent is required")
    .refine((value) => Number(value) > 0, "Rent must be greater than zero"),
  deposit: z
    .string()
    .min(1, "Deposit is required")
    .refine((value) => Number(value) >= 0, "Deposit cannot be negative"),
  roomType: z.string().min(1, "Choose a room type"),
  sharing: z.string().min(1, "Choose a sharing type"),
  gender: z.string().min(1, "Choose a gender preference"),
  food: z.boolean(),
  foodPreference: z.string(),
  availableFrom: z.string().min(1, "Choose an availability date"),
  amenities: z.array(z.string()),
});

const defaultValues = {
  title: "",
  description: "",
  location: "",
  rent: "",
  deposit: "",
  roomType: "",
  sharing: "",
  gender: "ANY",
  food: false,
  foodPreference: "",
  availableFrom: "",
  amenities: [],
};

const PostRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const editId = searchParams.get("edit");

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(roomSchema),
    defaultValues,
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [deletingImage, setDeletingImage] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [pickedLocation, setPickedLocation] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(Boolean(editId));
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const selectedFilesRef = useRef([]);

  useEffect(() => {
    selectedFilesRef.current = selectedFiles;
  }, [selectedFiles]);

  useEffect(
    () => () => selectedFilesRef.current.forEach((item) => URL.revokeObjectURL(item.preview)),
    []
  );

  const loadRoom = useCallback(() => {
    if (!editId) return undefined;

    let active = true;

    getRoom(editId)
      .then((data) => {
        if (!active || !data) return;
        setEditingRoom(data);
        if (data.latitude != null && data.longitude != null) {
          setPickedLocation({
            location: data.location || "",
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
          });
        }
        reset({
          title: data.title || "",
          description: data.description || "",
          location: data.location || "",
          rent: data.rent != null ? String(data.rent) : "",
          deposit: data.deposit != null ? String(data.deposit) : "",
          roomType: data.roomType || "",
          sharing: data.sharing || "",
          gender: data.gender || "ANY",
          food: Boolean(data.food),
          foodPreference: data.foodPreference || "",
          availableFrom: data.availableFrom || "",
          amenities: Array.isArray(data.amenities) ? data.amenities : [],
        });
      })
      .catch((err) => {
        if (active) {
          setSnackbar({
            open: true,
            message: err?.message || "Unable to load this room.",
            severity: "error",
          });
        }
      })
      .finally(() => {
        if (active) setLoadingRoom(false);
      });

    return () => {
      active = false;
    };
  }, [editId, reset]);

  useEffect(() => loadRoom(), [loadRoom]);

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (files.length === 0) return;

    const existingCount =
      (editingRoom?.imageUrls || []).length + selectedFilesRef.current.length;

    if (files.length + existingCount > MAX_ROOM_IMAGES) {
      setSnackbar({
        open: true,
        message: `You can keep at most ${MAX_ROOM_IMAGES} photos for a room.`,
        severity: "error",
      });
      return;
    }

    if (
      files.some(
        (file) =>
          !file.type.startsWith("image/") ||
          !ALLOWED_IMAGE_EXTENSIONS.test(file.name)
      )
    ) {
      setSnackbar({
        open: true,
        message: "Only JPG, PNG, WebP or GIF images are allowed.",
        severity: "error",
      });
      return;
    }

    const oversized = files.find((file) => file.size > MAX_IMAGE_BYTES);
    if (oversized) {
      setSnackbar({
        open: true,
        message: "Each image must be 5MB or smaller.",
        severity: "error",
      });
      return;
    }

    selectedFilesRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    const next = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    selectedFilesRef.current = next;
    setSelectedFiles(next);
  };

  const handleRemoveExistingImage = async (url) => {
    if (!editId || deletingImage) return;

    setDeletingImage(url);
    try {
      const updated = await deleteRoomImage(editId, url);
      setEditingRoom((prev) => ({
        ...prev,
        imageUrls: Array.isArray(updated?.imageUrls) ? updated.imageUrls : [],
      }));
      setSnackbar({
        open: true,
        message: "Photo removed.",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.message || "Unable to remove this photo.",
        severity: "error",
      });
    } finally {
      setDeletingImage(null);
    }
  };

  const handleRemoveSelectedFile = (preview) => {
    const next = selectedFilesRef.current.filter((item) => item.preview !== preview);
    selectedFilesRef.current = next;
    setSelectedFiles(next);
    URL.revokeObjectURL(preview);
  };

  const onSubmit = async (values) => {
    setSubmitting(true);

    try {
      const existingUrls = Array.isArray(editingRoom?.imageUrls)
        ? [...editingRoom.imageUrls]
        : [];
      const uploadedUrls = selectedFiles.length > 0
        ? await uploadImages(selectedFiles.map((item) => item.file))
        : [];
      const imageUrls = [...existingUrls, ...uploadedUrls];

      const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
        location: values.location.trim(),
        rent: Number(values.rent),
        deposit: Number(values.deposit),
        roomType: values.roomType,
        sharing: values.sharing,
        gender: values.gender,
        food: values.food,
        foodPreference: values.food ? values.foodPreference : "",
        availableFrom: values.availableFrom,
        amenities: values.amenities,
        imageUrls,
        latitude: pickedLocation?.latitude ?? null,
        longitude: pickedLocation?.longitude ?? null,
      };

      const saved = editId
        ? await updateRoom(editId, payload)
        : await createRoom(payload);

      setSnackbar({
        open: true,
        message: editId ? "Room updated successfully." : "Room posted successfully.",
        severity: "success",
      });

      setTimeout(() => navigate(`/rooms/${saved?.id || editId}`), 900);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.message || "Unable to save this room.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!authLoading && (!user || !canManageRooms(user))) {
    return (
      <Navigate
        to={user ? "/rooms" : "/login"}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  const textField = (name) => ({
    ...register(name),
    id: `room-${name}`,
    error: Boolean(errors[name]),
    helperText: errors[name]?.message || "",
  });

  const handleMapSelect = (selection) => {
    setPickedLocation(selection);
    setValue("location", selection.location, { shouldValidate: true });
    setMapOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        backgroundColor: "#F5FAFC",
        py: { xs: 4, md: 5 },
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{ color: "#0F9D8A", fontSize: "14px", fontWeight: 700, mb: 0.8 }}
          >
            {editId ? "Update listing" : "List your space"}
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
            {editId ? "Edit your room" : "Post a room"}
          </Typography>
          <Typography sx={{ fontSize: "15px", color: "#667085" }}>
            Share the essentials so the right roommate can find you.
          </Typography>
        </Box>

        {loadingRoom ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#3730E8" }} />
          </Box>
        ) : (
          <Paper
            elevation={0}
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              borderRadius: "20px",
              border: "1px solid #D7E5EB",
              backgroundColor: "#FFFFFF",
              p: { xs: 2.5, sm: 3.5 },
              boxShadow: "0 10px 28px rgba(40, 80, 100, 0.05)",
            }}
          >
            <SectionTitle title="Basic details" />
            <Grid container spacing={2}>
              <Grid size={12}>
                <FieldLabel label="Title" htmlFor="room-title" />
                <TextField
                  fullWidth
                  placeholder="e.g. Furnished room near metro"
                  {...textField("title")}
                  sx={fieldStyles}
                />
              </Grid>

              <Grid size={12}>
                <FieldLabel label="Description" htmlFor="room-description" />
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Describe the room, flat and surroundings..."
                  {...textField("description")}
                  sx={fieldStyles}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel label="Location" htmlFor="room-location" />
                <TextField
                  fullWidth
                  placeholder="e.g. Anna Nagar West"
                  {...textField("location")}
                  sx={fieldStyles}
                />
                <Button
                  size="small"
                  startIcon={<PlaceRounded />}
                  onClick={() => setMapOpen(true)}
                  sx={{ mt: 0.8, textTransform: "none", fontWeight: 700, color: "#3730E8" }}
                >
                  Choose on map
                </Button>
                {pickedLocation && (
                  <Typography sx={{ fontSize: 12, color: "#0F9D8A", mt: 0.4 }}>
                    Pinned: {pickedLocation.latitude.toFixed(4)}, {pickedLocation.longitude.toFixed(4)}
                  </Typography>
                )}
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel label="Available from" htmlFor="room-availableFrom" />
                <TextField
                  fullWidth
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...textField("availableFrom")}
                  sx={fieldStyles}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel label="Rent (₹ / month)" htmlFor="room-rent" />
                <TextField
                  fullWidth
                  type="number"
                  inputProps={{ min: 0 }}
                  {...textField("rent")}
                  sx={fieldStyles}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel label="Deposit (₹)" htmlFor="room-deposit" />
                <TextField
                  fullWidth
                  type="number"
                  inputProps={{ min: 0 }}
                  {...textField("deposit")}
                  sx={fieldStyles}
                />
              </Grid>
            </Grid>

            <SectionTitle title="Room preferences" />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FieldLabel label="Room type" labelId="room-roomType-label" />
                <Controller
                  name="roomType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      id="room-roomType"
                      {...field}
                      error={Boolean(errors.roomType)}
                      helperText={errors.roomType?.message || ""}
                      slotProps={{
                        select: {
                          displayEmpty: true,
                          labelId: "room-roomType-label",
                          SelectDisplayProps: { "aria-labelledby": "room-roomType-label" },
                        },
                      }}
                      sx={fieldStyles}
                    >
                      <MenuItem value="">Select</MenuItem>
                      {ROOM_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FieldLabel label="Sharing" labelId="room-sharing-label" />
                <Controller
                  name="sharing"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      id="room-sharing"
                      {...field}
                      error={Boolean(errors.sharing)}
                      helperText={errors.sharing?.message || ""}
                      slotProps={{
                        select: {
                          displayEmpty: true,
                          labelId: "room-sharing-label",
                          SelectDisplayProps: { "aria-labelledby": "room-sharing-label" },
                        },
                      }}
                      sx={fieldStyles}
                    >
                      <MenuItem value="">Select</MenuItem>
                      {SHARING_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FieldLabel label="Gender preference" labelId="room-gender-label" />
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      id="room-gender"
                      {...field}
                      slotProps={{
                        select: {
                          labelId: "room-gender-label",
                          SelectDisplayProps: { "aria-labelledby": "room-gender-label" },
                        },
                      }}
                      sx={fieldStyles}
                    >
                      {GENDERS.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="food"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(event) => field.onChange(event.target.checked)}
                          sx={{ color: "#7A8794", "&.Mui-checked": { color: "#3730E8" } }}
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: "14px", color: "#243858" }}>
                          Food is provided
                        </Typography>
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel label="Food preference" labelId="room-foodPreference-label" />
                <Controller
                  name="foodPreference"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      id="room-foodPreference"
                      {...field}
                      slotProps={{
                        select: {
                          displayEmpty: true,
                          labelId: "room-foodPreference-label",
                          SelectDisplayProps: { "aria-labelledby": "room-foodPreference-label" },
                        },
                      }}
                      sx={fieldStyles}
                    >
                      <MenuItem value="">Any food preference</MenuItem>
                      {FOOD_PREFERENCES.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>

            <SectionTitle title="Amenities" />
            <Controller
              name="amenities"
              control={control}
              render={({ field }) => (
                <FormControl error={Boolean(errors.amenities)} sx={{ width: "100%" }}>
                  <FormGroup
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(2, minmax(0, 1fr))",
                        sm: "repeat(4, minmax(0, 1fr))",
                      },
                      gap: 0.5,
                    }}
                  >
                    {AMENITIES.map((amenity) => (
                      <FormControlLabel
                        key={amenity}
                        control={
                          <Checkbox
                            checked={field.value.includes(amenity)}
                            onChange={() =>
                              field.onChange(
                                field.value.includes(amenity)
                                  ? field.value.filter((item) => item !== amenity)
                                  : [...field.value, amenity]
                              )
                            }
                            sx={{
                              color: "#7A8794",
                              "&.Mui-checked": { color: "#0F9D8A" },
                            }}
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: "13.5px", color: "#243858" }}>
                            {amenity}
                          </Typography>
                        }
                      />
                    ))}
                  </FormGroup>
                  {errors.amenities && (
                    <FormHelperText>{errors.amenities.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            <SectionTitle title="Photos" />
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadOutlined />}
              sx={{
                height: 46,
                borderRadius: "11px",
                borderColor: "#BDD3DF",
                color: "#1D3553",
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Choose images
              <input
                hidden
                type="file"
                multiple
                accept="image/*"
                onChange={handleFiles}
              />
            </Button>
            {editId && (
              <Typography sx={{ fontSize: 12, color: "#667085", mt: 0.8 }}>
                Saved photos are kept unless you remove them. Use the X on a photo to delete it.
              </Typography>
            )}

            {(selectedFiles.length > 0 ||
              (editingRoom?.imageUrls || []).length > 0) && (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
                {(editingRoom?.imageUrls || []).map((url, index) => (
                  <Box
                    key={`${url}-${index}`}
                    sx={{ position: "relative", width: 110, height: 84 }}
                  >
                    <Box
                      component="img"
                      src={resolveImageUrl(url)}
                      alt={`Existing room ${index + 1}`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "1px solid #D7E5EB",
                      }}
                    />
                    <Tooltip title="Remove photo">
                      <IconButton
                        size="small"
                        aria-label={`Remove saved photo ${index + 1}`}
                        disabled={Boolean(deletingImage)}
                        onClick={() => handleRemoveExistingImage(url)}
                        sx={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          width: 24,
                          height: 24,
                          backgroundColor: "rgba(255,255,255,0.92)",
                          color: "#B42318",
                          "&:hover": { backgroundColor: "#FFFFFF", color: "#B42318" },
                        }}
                      >
                        {deletingImage === url ? (
                          <CircularProgress size={14} color="inherit" />
                        ) : (
                          <DeleteOutlineRounded sx={{ fontSize: 16 }} />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
                {selectedFiles.map((item) => (
                  <Box
                    key={item.preview}
                    sx={{ position: "relative", width: 110, height: 84 }}
                  >
                    <Box
                      component="img"
                      src={item.preview}
                      alt={item.file.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "1px solid #0F9D8A",
                      }}
                    />
                    <Tooltip title="Remove selected photo">
                      <IconButton
                        size="small"
                        aria-label={`Remove ${item.file.name}`}
                        onClick={() => handleRemoveSelectedFile(item.preview)}
                        sx={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          width: 24,
                          height: 24,
                          backgroundColor: "rgba(255,255,255,0.92)",
                          color: "#B42318",
                          "&:hover": { backgroundColor: "#FFFFFF", color: "#B42318" },
                        }}
                      >
                        <DeleteOutlineRounded sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            )}

            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                mt: 3.5,
                flexWrap: "wrap",
              }}
            >
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                startIcon={
                  submitting ? <CircularProgress size={18} color="inherit" /> : null
                }
                sx={{ ...primaryButtonStyles, px: 3 }}
              >
                {editId ? "Save changes" : "Post room"}
              </Button>
              <Button
                type="button"
                onClick={() => navigate(-1)}
                sx={{
                  height: 48,
                  borderRadius: "11px",
                  color: "#667085",
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Cancel
              </Button>
            </Box>
          </Paper>
        )}
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <MapPicker
        open={mapOpen}
        initial={pickedLocation}
        onClose={() => setMapOpen(false)}
        onSelect={handleMapSelect}
      />
    </Box>
  );
};

const SectionTitle = ({ title }) => (
  <Typography
    sx={{
      fontSize: "17px",
      fontWeight: 700,
      color: "#17233C",
      mt: 3.5,
      mb: 1.5,
    }}
  >
    {title}
  </Typography>
);

const FieldLabel = ({ label, htmlFor, labelId }) => (
  <Typography
    component={labelId ? "span" : "label"}
    id={labelId || `${htmlFor}-label`}
    htmlFor={labelId ? undefined : htmlFor}
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
);

const primaryButtonStyles = {
  height: 48,
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
    borderRadius: "11px",
    backgroundColor: "#FFFFFF",
    "& fieldset": { borderColor: "#BDD3DF" },
    "&:hover fieldset": { borderColor: "#91B3C3" },
    "&.Mui-focused fieldset": { borderColor: "#3730E8", borderWidth: "1.5px" },
  },
  "& .MuiOutlinedInput-input": { fontSize: "14px", color: "#17233C" },
};

export default PostRoom;
