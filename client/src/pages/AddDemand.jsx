import React, { useState } from "react";
import {
  TextField,
  MenuItem,
  Button,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Paper,
  Typography,
  Divider,
  Box,
  FormHelperText,
  InputAdornment,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const languageOptions = ["JavaScript", "TypeScript", "Python", "Java", "PHP", "C#", "Flutter", "React", "Vue", "Angular"];
const databaseOptions = ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Firebase", "Supabase"];

const projectTypes = [
  { value: "web", label: "Website" },
  { value: "mobile", label: "Mobile Application" },
  { value: "design", label: "Design (Logo, UI/UX)" },
  { value: "desktop", label: "Desktop Application" },
  { value: "other", label: "Other" },
];

const stackOptions = [
  { value: "frontend", label: "Frontend Only" },
  { value: "backend", label: "Backend Only" },
  { value: "fullstack", label: "Full Stack" },
];

export default function AddDemand() {
  const [formData, setFormData] = useState({
    projectType: "",
    stack: "",
    languages: [],
    databases: [],
    budget: "",
    deadline: null,
    description: "",
  });

  const [errors, setErrors] = useState({
    projectType: false,
    stack: false,
    languages: false,
    databases: false,
    budget: false,
    deadline: false,
    description: false,
  });

  const validateField = (name, value) => {
    let isValid = true;
    
    if (name === "budget") {
      isValid = !isNaN(value) && value > 0;
    } else if (name === "deadline") {
      isValid = value !== null && new Date(value) > new Date();
    } else {
      isValid = value !== "" && value !== null && (Array.isArray(value) ? value.length > 0 : true);
    }
    
    setErrors(prev => ({ ...prev, [name]: !isValid }));
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: typeof value === "string" ? value.split(",") : value,
    }));
    validateField(name, value);
  };

  const handleSimpleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, deadline: date }));
    validateField("deadline", date);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      const valid = validateField(key, formData[key]);
      if (!valid) isValid = false;
    });

    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log("Form Data:", formData);
      alert("Project demand submitted successfully!");
      setFormData({
        projectType: "",
        stack: "",
        languages: [],
        databases: [],
        budget: "",
        deadline: null,
        description: "",
      });
    } else {
      alert("Please fill out all required fields correctly.");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: "primary.main" }}>
            New Project Demand
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Please fill out all required fields to submit your project requirements.
          </Typography>
          <Divider sx={{ mb: 4 }} />

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <FormControl fullWidth error={errors.projectType}>
              <InputLabel id="project-type-label">Project Type *</InputLabel>
              <Select
                labelId="project-type-label"
                label="Project Type *"
                name="projectType"
                value={formData.projectType}
                onChange={handleSimpleChange}
                required
              >
                {projectTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.projectType && <FormHelperText>Please select a project type</FormHelperText>}
            </FormControl>

            <FormControl fullWidth error={errors.stack}>
              <InputLabel id="stack-label">Stack *</InputLabel>
              <Select
                labelId="stack-label"
                label="Stack *"
                name="stack"
                value={formData.stack}
                onChange={handleSimpleChange}
                required
              >
                {stackOptions.map((stack) => (
                  <MenuItem key={stack.value} value={stack.value}>
                    {stack.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.stack && <FormHelperText>Please select a stack</FormHelperText>}
            </FormControl>

            <FormControl fullWidth error={errors.languages}>
              <InputLabel id="languages-label">Languages/Frameworks *</InputLabel>
              <Select
                labelId="languages-label"
                multiple
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                input={<OutlinedInput label="Languages/Frameworks *" />}
                renderValue={(selected) => selected.join(", ")}
                required
              >
                {languageOptions.map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    <Checkbox checked={formData.languages.indexOf(lang) > -1} />
                    <ListItemText primary={lang} />
                  </MenuItem>
                ))}
              </Select>
              {errors.languages && <FormHelperText>Please select at least one language/framework</FormHelperText>}
            </FormControl>

            <FormControl fullWidth error={errors.databases}>
              <InputLabel id="databases-label">Databases</InputLabel>
              <Select
                labelId="databases-label"
                multiple
                name="databases"
                value={formData.databases}
                onChange={handleChange}
                input={<OutlinedInput label="Databases" />}
                renderValue={(selected) => selected.join(", ")}
              >
                {databaseOptions.map((db) => (
                  <MenuItem key={db} value={db}>
                    <Checkbox checked={formData.databases.indexOf(db) > -1} />
                    <ListItemText primary={db} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="number"
              label="Budget ($) *"
              name="budget"
              value={formData.budget}
              onChange={handleSimpleChange}
              error={errors.budget}
              helperText={errors.budget ? "Please enter a valid budget" : ""}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />

            <FormControl fullWidth error={errors.deadline}>
              <DatePicker
                label="Deadline *"
                value={formData.deadline}
                onChange={handleDateChange}
                minDate={new Date()}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    error={errors.deadline}
                    helperText={errors.deadline ? "Please select a future date" : ""}
                    required
                  />
                )}
              />
            </FormControl>

            <TextField
              fullWidth
              label="Project Description *"
              name="description"
              multiline
              rows={5}
              value={formData.description}
              onChange={handleSimpleChange}
              error={errors.description}
              helperText={errors.description ? "Please provide a project description" : ""}
              required
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{ py: 1.5, mt: 2 }}
            >
              Submit Project Demand
            </Button>
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}