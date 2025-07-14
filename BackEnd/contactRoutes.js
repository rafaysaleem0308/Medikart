const express = require("express");
const router = express.Router();
const Contact = require("./models/ContactModel");
const { ObjectId } = require("mongodb");

// Submit contact form
router.post("/submit", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const subject = req.body.subject || "general"; // Default subject

    // Create new contact using Mongoose model
    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
      status: "new",
    });

    await newContact.save();

    res.status(201).json({
      success: true,
      message: "Thank you for contacting us! We will get back to you soon.",
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit contact form",
    });
  }
});

// Get all contact submissions (admin only)
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact submissions",
    });
  }
});

// Update contact status (admin only)
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedContact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact not found" });
    }

    res.status(200).json({
      success: true,
      data: updatedContact,
    });
  } catch (error) {
    console.error("Error updating contact status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update contact status",
    });
  }
});

module.exports = router;
