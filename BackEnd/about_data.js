// BackEnd/about_data.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Define schemas
const memberSchema = new mongoose.Schema({
  name: String,
  role: String,
  image: String,
  bio: String,
  specialties: [String],
});

const milestoneSchema = new mongoose.Schema({
  year: String,
  title: String,
  description: String,
});

const valueSchema = new mongoose.Schema({
  icon: String,
  title: String,
  description: String,
});

// Create models
const Member = mongoose.model("members_data", memberSchema);
const Milestone = mongoose.model("milestones_data", milestoneSchema);
const Value = mongoose.model("value", valueSchema);

// Get all team members
router.get("/team-members", async (req, res) => {
  try {
    console.log("Fetching team members..."); // Add logging
    const members = await Member.find();
    console.log("Found members:", members); // Log results
    res.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: "Error fetching team members" });
  }
});

// Get all milestones
router.get("/milestones", async (req, res) => {
  try {
    const milestones = await Milestone.find().sort({ year: 1 });
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ error: "Error fetching milestones" });
  }
});

// Get all values
router.get("/values", async (req, res) => {
  try {
    const values = await Value.find();
    res.json(values);
  } catch (error) {
    res.status(500).json({ error: "Error fetching values" });
  }
});
// Temporary route to insert test data - remove after testing
router.get("/insert-test-data", async (req, res) => {
  try {
    // Insert team members
    await Member.insertMany([
      {
        name: "John Doe",
        role: "Pharmacist",
        image: "john.jpg",
        bio: "Experienced pharmacist",
        specialties: ["Clinical", "Pediatrics"],
      },
    ]);

    // Insert milestones
    await Milestone.insertMany([
      {
        year: "2020",
        title: "Founded",
        description: "Our pharmacy was established",
      },
    ]);

    // Insert values
    await Value.insertMany([
      {
        icon: "heart",
        title: "Care",
        description: "We care about our patients",
      },
    ]);

    res.json({ message: "Test data inserted" });
  } catch (error) {
    console.error("Error inserting test data:", error);
    res.status(500).json({ error: "Error inserting test data" });
  }
});

module.exports = router;
