import { useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import {
  SearchRounded,
  LocationOnOutlined,
  FavoriteBorderRounded,
  FavoriteRounded,
  VerifiedRounded,
  HomeWorkOutlined,
  BathtubOutlined,
  WifiOutlined,
  DirectionsCarOutlined,
  RestaurantOutlined,
  ArrowForwardRounded,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";


/* =========================================================
   DUMMY ROOM DATA
========================================================= */

const rooms = [
  {
    id: 1,

    title: "Private Room in 2BHK",

    location: "Anna Nagar West",

    distance: "1.8 km",

    rent: 8500,

    deposit: 20000,

    roomType: "Private Room",

    sharing: "2BHK",

    availableFrom: "1 October 2026",

    gender: "Male",

    food: "Both",

    verified: true,

    image: "/images/rooms/room-1.jpg",

    amenities: [
      "Wi-Fi",
      "Parking",
      "AC",
    ],
  },

  {
    id: 2,

    title: "Furnished Room near Metro",

    location: "Shenoy Nagar",

    distance: "2.4 km",

    rent: 7500,

    deposit: 15000,

    roomType: "Private Room",

    sharing: "2BHK",

    availableFrom: "5 October 2026",

    gender: "Female",

    food: "Vegetarian",

    verified: true,

    image: "/images/rooms/room-2.jpg",

    amenities: [
      "Wi-Fi",
      "AC",
      "Food",
    ],
  },

  {
    id: 3,

    title: "Affordable Shared Room",

    location: "Aminjikarai",

    distance: "3.1 km",

    rent: 5500,

    deposit: 10000,

    roomType: "Shared Room",

    sharing: "3BHK",

    availableFrom: "10 October 2026",

    gender: "Any",

    food: "Both",

    verified: true,

    image: "/images/rooms/room-3.jpg",

    amenities: [
      "Wi-Fi",
      "Parking",
    ],
  },

  {
    id: 4,

    title: "Modern Room near OMR",

    location: "Perungudi",

    distance: "5.7 km",

    rent: 9500,

    deposit: 25000,

    roomType: "Private Room",

    sharing: "3BHK",

    availableFrom: "1 November 2026",

    gender: "Male",

    food: "Both",

    verified: true,

    image: "/images/rooms/room-4.jpg",

    amenities: [
      "Wi-Fi",
      "AC",
      "Parking",
    ],
  },

  {
    id: 5,

    title: "Comfortable Room in Flat",

    location: "T Nagar",

    distance: "4.3 km",

    rent: 8000,

    deposit: 18000,

    roomType: "Private Room",

    sharing: "2BHK",

    availableFrom: "15 October 2026",

    gender: "Female",

    food: "Vegetarian",

    verified: true,

    image: "/images/rooms/room-5.jpg",

    amenities: [
      "Wi-Fi",
      "Food",
      "AC",
    ],
  },

  {
    id: 6,

    title: "Budget Friendly Shared Space",

    location: "Guindy",

    distance: "4.9 km",

    rent: 6000,

    deposit: 12000,

    roomType: "Shared Room",

    sharing: "3BHK",

    availableFrom: "20 October 2026",

    gender: "Any",

    food: "Both",

    verified: true,

    image: "/images/rooms/room-6.jpg",

    amenities: [
      "Wi-Fi",
      "Parking",
    ],
  },
];


/* =========================================================
   PAGE
========================================================= */

const FindRooms = () => {
  const navigate = useNavigate();

  const [savedRooms, setSavedRooms] = useState([]);

  const [filters, setFilters] = useState({
    location: "Any Chennai area",
    budget: "Any budget",
    roomType: "Any room type",
    gender: "Any",
  });


  const toggleSave = (roomId) => {
    setSavedRooms((current) =>
      current.includes(roomId)
        ? current.filter((id) => id !== roomId)
        : [...current, roomId]
    );
  };


  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",

        backgroundColor: "#F5FAFC",

        py: {
          xs: 4,
          md: 5,
        },
      }}
    >
      <Container maxWidth="lg">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <Box
          sx={{
            mb: 3,
          }}
        >
          <Typography
            sx={{
              color: "#008A78",

              fontSize: "14px",

              fontWeight: 700,

              mb: 0.8,
            }}
          >
            Chennai rooms
          </Typography>

          <Typography
            component="h1"
            sx={{
              fontSize: {
                xs: "30px",
                md: "38px",
              },

              fontWeight: 700,

              color: "#142A4A",

              mb: 1,
            }}
          >
            Find your next room
          </Typography>

          <Typography
            sx={{
              color: "#667A90",

              fontSize: "15px",

              maxWidth: 650,
            }}
          >
            Browse vacant rooms and beds directly from room
            providers. No broker listings.
          </Typography>
        </Box>


        {/* =================================================
            FILTER BAR
        ================================================= */}

        <Box
          component="form"
          onSubmit={(event) => event.preventDefault()}
          sx={{
            backgroundColor: "#FFFFFF",

            border: "1px solid #D7E5EB",

            borderRadius: "18px",

            p: 2,

            mb: 4,

            boxShadow:
              "0 10px 25px rgba(40, 80, 100, 0.04)",
          }}
        >
          <Grid
            container
            spacing={1.5}
            alignItems="center"
          >

            {/* Location */}

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FilterSelect
                label="Location"
                value={filters.location}
                onChange={(value) =>
                  setFilters({
                    ...filters,
                    location: value,
                  })
                }
                options={[
                  "Any Chennai area",
                  "Anna Nagar",
                  "Shenoy Nagar",
                  "Aminjikarai",
                  "T Nagar",
                  "Guindy",
                  "Perungudi",
                  "Velachery",
                ]}
              />
            </Grid>


            {/* Budget */}

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FilterSelect
                label="Budget"
                value={filters.budget}
                onChange={(value) =>
                  setFilters({
                    ...filters,
                    budget: value,
                  })
                }
                options={[
                  "Any budget",
                  "Below ₹5K",
                  "₹5K - ₹8K",
                  "₹8K - ₹12K",
                  "Above ₹12K",
                ]}
              />
            </Grid>


            {/* Room type */}

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FilterSelect
                label="Room type"
                value={filters.roomType}
                onChange={(value) =>
                  setFilters({
                    ...filters,
                    roomType: value,
                  })
                }
                options={[
                  "Any room type",
                  "Private Room",
                  "Shared Room",
                ]}
              />
            </Grid>


            {/* Gender */}

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FilterSelect
                label="Gender"
                value={filters.gender}
                onChange={(value) =>
                  setFilters({
                    ...filters,
                    gender: value,
                  })
                }
                options={[
                  "Any",
                  "Male",
                  "Female",
                ]}
              />
            </Grid>


            {/* Search */}

            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SearchRounded />}
                sx={{
                  height: 47,

                  mt: {
                    xs: 0,
                    md: 2.9,
                  },

                  borderRadius: "11px",

                  backgroundColor: "#3737E8",

                  textTransform: "none",

                  fontWeight: 700,

                  boxShadow: "none",

                  "&:hover": {
                    backgroundColor: "#2F30D1",

                    boxShadow: "none",
                  },
                }}
              >
                Search Rooms
              </Button>
            </Grid>

          </Grid>
        </Box>


        {/* =================================================
            RESULT HEADER
        ================================================= */}

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
            <Typography
              sx={{
                fontSize: "20px",

                fontWeight: 700,

                color: "#142A4A",
              }}
            >
              Available rooms
            </Typography>

            <Typography
              sx={{
                fontSize: "13px",

                color: "#667A90",

                mt: 0.3,
              }}
            >
              {rooms.length} rooms found
            </Typography>
          </Box>

          <FormControl
            size="small"
            sx={{
              minWidth: 150,

              display: {
                xs: "none",
                sm: "block",
              },
            }}
          >
            <InputLabel>Sort by</InputLabel>

            <Select
              label="Sort by"
              defaultValue="recommended"
              sx={{
                borderRadius: "10px",

                backgroundColor: "#FFFFFF",

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#D7E5EB",
                },
              }}
            >
              <MenuItem value="recommended">
                Recommended
              </MenuItem>

              <MenuItem value="rent-low">
                Rent: Low to High
              </MenuItem>

              <MenuItem value="rent-high">
                Rent: High to Low
              </MenuItem>

              <MenuItem value="distance">
                Nearest
              </MenuItem>
            </Select>
          </FormControl>
        </Box>


        {/* =================================================
            ROOM GRID
        ================================================= */}

        <Grid
          container
          spacing={2.5}
        >
          {rooms.map((room) => (
            <Grid
              key={room.id}
              size={{
                xs: 12,
                sm: 6,
                lg: 4,
              }}
            >
              <RoomCard
                room={room}
                saved={savedRooms.includes(room.id)}
                onSave={() => toggleSave(room.id)}
                onView={() =>
                  navigate(`/rooms/${room.id}`)
                }
              />
            </Grid>
          ))}
        </Grid>

      </Container>
    </Box>
  );
};


/* =========================================================
   ROOM CARD
========================================================= */

const RoomCard = ({
  room,
  saved,
  onSave,
  onView,
}) => {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",

        borderRadius: "18px",

        overflow: "hidden",

        border: "1px solid #D7E5EB",

        backgroundColor: "#FFFFFF",

        transition:
          "transform 0.2s ease, box-shadow 0.2s ease",

        "&:hover": {
          transform: "translateY(-4px)",

          boxShadow:
            "0 14px 32px rgba(40, 80, 100, 0.10)",
        },
      }}
    >

      {/* =================================================
          IMAGE
      ================================================= */}

      <Box
        sx={{
          position: "relative",

          height: 220,

          backgroundColor: "#E8EEF2",

          overflow: "hidden",
        }}
      >

        <Box
          component="img"
          src={room.image}
          alt={room.title}
          sx={{
            width: "100%",

            height: "100%",

            objectFit: "cover",

            display: "block",

            transition: "transform 0.3s ease",

            ".MuiCard-root:hover &": {
              transform: "scale(1.03)",
            },
          }}
        />


        {/* Verified */}

        {room.verified && (
          <Chip
            icon={
              <VerifiedRounded
                sx={{
                  fontSize:
                    "16px !important",
                }}
              />
            }
            label="Verified"
            size="small"
            sx={{
              position: "absolute",

              top: 12,

              left: 12,

              backgroundColor:
                "rgba(255,255,255,0.95)",

              color: "#008A78",

              fontWeight: 700,

              backdropFilter: "blur(5px)",
            }}
          />
        )}


        {/* Save */}

        <IconButton
          onClick={onSave}
          sx={{
            position: "absolute",

            top: 9,

            right: 9,

            width: 38,

            height: 38,

            backgroundColor:
              "rgba(255,255,255,0.95)",

            "&:hover": {
              backgroundColor: "#FFFFFF",
            },
          }}
        >
          {saved ? (
            <FavoriteRounded
              sx={{
                color: "#E53935",
              }}
            />
          ) : (
            <FavoriteBorderRounded
              sx={{
                color: "#314A66",
              }}
            />
          )}
        </IconButton>


        {/* Distance */}

        <Chip
          icon={
            <LocationOnOutlined
              sx={{
                fontSize:
                  "16px !important",
              }}
            />
          }
          label={`${room.distance} away`}
          size="small"
          sx={{
            position: "absolute",

            bottom: 12,

            left: 12,

            backgroundColor:
              "rgba(20,42,74,0.88)",

            color: "#FFFFFF",

            fontWeight: 600,

            backdropFilter: "blur(5px)",

            "& .MuiChip-icon": {
              color: "#FFFFFF",
            },
          }}
        />
      </Box>


      {/* =================================================
          CONTENT
      ================================================= */}

      <CardContent
        sx={{
          p: 2,

          "&:last-child": {
            pb: 2,
          },
        }}
      >

        {/* Title */}

        <Typography
          sx={{
            fontSize: "18px",

            fontWeight: 700,

            color: "#142A4A",

            mb: 0.6,

            lineHeight: 1.3,
          }}
        >
          {room.title}
        </Typography>


        {/* Location */}

        <Box
          sx={{
            display: "flex",

            alignItems: "center",

            gap: 0.5,

            mb: 1.5,
          }}
        >
          <LocationOnOutlined
            sx={{
              fontSize: 17,

              color: "#008A78",
            }}
          />

          <Typography
            sx={{
              fontSize: "13px",

              color: "#667A90",
            }}
          >
            {room.location}
          </Typography>
        </Box>


        {/* Rent */}

        <Box
          sx={{
            display: "flex",

            alignItems: "baseline",

            gap: 0.5,

            mb: 1.5,
          }}
        >
          <Typography
            sx={{
              fontSize: "23px",

              fontWeight: 800,

              color: "#142A4A",
            }}
          >
            ₹{room.rent.toLocaleString("en-IN")}
          </Typography>

          <Typography
            sx={{
              fontSize: "13px",

              color: "#667A90",
            }}
          >
            / month
          </Typography>
        </Box>


        {/* Room information */}

        <Box
          sx={{
            display: "flex",

            gap: 0.8,

            flexWrap: "wrap",

            mb: 1.5,
          }}
        >
          <InfoChip
            icon={<HomeWorkOutlined />}
            label={room.roomType}
          />

          <InfoChip
            label={room.sharing}
          />

          <InfoChip
            label={room.gender}
          />
        </Box>


        {/* Amenities */}

        <Box
          sx={{
            display: "flex",

            gap: 1.2,

            mb: 1.5,
          }}
        >
          {room.amenities
            .slice(0, 3)
            .map((amenity) => (
              <Amenity
                key={amenity}
                name={amenity}
              />
            ))}
        </Box>


        {/* Bottom information */}

        <Box
          sx={{
            borderTop:
              "1px solid #EDF1F4",

            pt: 1.4,

            mb: 1.5,
          }}
        >
          <Typography
            sx={{
              fontSize: "12px",

              color: "#667A90",
            }}
          >
            Available from
          </Typography>

          <Typography
            sx={{
              fontSize: "13px",

              fontWeight: 700,

              color: "#314A66",
            }}
          >
            {room.availableFrom}
          </Typography>
        </Box>


        {/* View button */}

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
              borderColor: "#3737E8",

              color: "#3737E8",

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


/* =========================================================
   FILTER SELECT
========================================================= */

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
}) => {
  return (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>

      <Select
        label={label}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        sx={{
          height: 47,

          borderRadius: "11px",

          backgroundColor: "#FFFFFF",

          fontSize: "14px",

          color: "#294765",

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#BDD3DF",
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#91B3C3",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#3737E8",

            borderWidth: "1.5px",
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            value={option}
          >
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};


/* =========================================================
   INFO CHIP
========================================================= */

const InfoChip = ({
  icon,
  label,
}) => {
  return (
    <Chip
      icon={
        icon
          ? icon
          : undefined
      }
      label={label}
      size="small"
      sx={{
        height: 28,

        borderRadius: "8px",

        backgroundColor: "#F3F7FA",

        color: "#49657D",

        fontSize: "11px",

        fontWeight: 600,

        "& .MuiChip-icon": {
          fontSize: 15,

          color: "#008A78",
        },
      }}
    />
  );
};


/* =========================================================
   AMENITY
========================================================= */

const Amenity = ({ name }) => {
  let icon = null;

  if (name === "Wi-Fi") {
    icon = <WifiOutlined />;
  }

  if (name === "Parking") {
    icon = <DirectionsCarOutlined />;
  }

  if (name === "AC") {
    icon = <HomeWorkOutlined />;
  }

  if (name === "Food") {
    icon = <RestaurantOutlined />;
  }

  return (
    <Box
      sx={{
        display: "flex",

        alignItems: "center",

        gap: 0.4,
      }}
    >
      {icon && (
        <Box
          sx={{
            display: "flex",

            color: "#008A78",

            "& svg": {
              fontSize: 16,
            },
          }}
        >
          {icon}
        </Box>
      )}

      <Typography
        sx={{
          fontSize: "11px",

          color: "#667A90",
        }}
      >
        {name}
      </Typography>
    </Box>
  );
};


export default FindRooms;