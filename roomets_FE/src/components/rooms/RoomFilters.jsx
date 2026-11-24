import { SearchRounded } from "@mui/icons-material";
import { Box, Button, MenuItem, TextField, Typography } from "@mui/material";

const ROOM_TYPES = ["1RK", "1BHK", "2BHK", "3BHK"];
const GENDERS = ["ANY", "MALE", "FEMALE"];
const FOOD_OPTIONS = [
  { value: "true", label: "Food provided" },
  { value: "false", label: "No food" },
];
const FOOD_PREFERENCES = ["Vegetarian", "Non-Vegetarian", "Both"];
const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "rent-low", label: "Rent: low to high" },
  { value: "rent-high", label: "Rent: high to low" },
];

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

const FilterField = ({ label, children }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography
      component="label"
      sx={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#31516D", mb: 0.8 }}
    >
      {label}
    </Typography>
    {children}
  </Box>
);

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

const RoomFilters = ({ values, onChange, onSubmit, onClear, submitLabel = "Search rooms" }) => {
  const update = (name) => (value) => onChange(name, value);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 1.5,
        alignItems: "end",
      }}
    >
      <FilterField label="Location">
        <TextField
          fullWidth
          size="small"
          placeholder="Search by area"
          value={values.location}
          onChange={(event) => update("location")(event.target.value)}
          InputProps={{
            startAdornment: <SearchRounded sx={{ fontSize: 19, color: "#0F9D8A" }} />,
          }}
          sx={fieldStyles}
        />
      </FilterField>

      <FilterField label="Min rent">
        <TextField
          fullWidth
          size="small"
          type="number"
          placeholder="₹0"
          inputProps={{ min: 0 }}
          value={values.minRent}
          onChange={(event) => update("minRent")(event.target.value)}
          sx={fieldStyles}
        />
      </FilterField>

      <FilterField label="Max rent">
        <TextField
          fullWidth
          size="small"
          type="number"
          placeholder="Any"
          inputProps={{ min: 0 }}
          value={values.maxRent}
          onChange={(event) => update("maxRent")(event.target.value)}
          sx={fieldStyles}
        />
      </FilterField>

      <FilterField label="Room type">
        <FilterSelect
          value={values.roomType}
          onChange={update("roomType")}
          options={ROOM_TYPES.map((option) => ({ value: option, label: option }))}
          placeholder="Any type"
        />
      </FilterField>

      <FilterField label="Gender">
        <FilterSelect
          value={values.gender}
          onChange={update("gender")}
          options={GENDERS.map((option) => ({
            value: option,
            label: option === "ANY" ? "Any gender" : option.charAt(0) + option.slice(1).toLowerCase(),
          }))}
          placeholder="Any gender"
        />
      </FilterField>

      <FilterField label="Food">
        <FilterSelect
          value={values.food}
          onChange={update("food")}
          options={FOOD_OPTIONS}
          placeholder="Any food"
        />
      </FilterField>

      <FilterField label="Food preference">
        <FilterSelect
          value={values.foodPreference}
          onChange={update("foodPreference")}
          options={FOOD_PREFERENCES.map((option) => ({ value: option, label: option }))}
          placeholder="Any preference"
        />
      </FilterField>

      <FilterField label="Sort by">
        <FilterSelect value={values.sort} onChange={update("sort")} options={SORT_OPTIONS} />
      </FilterField>

      <Box
        sx={{
          gridColumn: "1 / -1",
          display: "flex",
          gap: 1.2,
          alignItems: "center",
          flexWrap: "wrap",
          mt: 0.5,
        }}
      >
        <Button
          variant="contained"
          startIcon={<SearchRounded />}
          onClick={onSubmit}
          sx={{
            height: 47,
            minWidth: 170,
            borderRadius: "11px",
            backgroundColor: "#3730E8",
            textTransform: "none",
            fontSize: "14px",
            fontWeight: 700,
            boxShadow: "none",
            "&:hover": { backgroundColor: "#2F30D1", boxShadow: "none" },
          }}
        >
          {submitLabel}
        </Button>
        {onClear && (
          <Button
            onClick={onClear}
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
        )}
      </Box>
    </Box>
  );
};

export default RoomFilters;
