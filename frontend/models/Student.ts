import mongoose, { Schema, models } from "mongoose";

const studentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
  },
  branch: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  imageUrls: {
    type: [String], //  store image paths (e.g., for UI or debugging)
    default: [],
  },

  embeddings: {
    type: [[Number]], // Array of 512D ArcFace vectors
    default: [],
  },

  attendance: [
    {
      presenty: {
        type: Number,
        default: 0,
      },
      date: {
        type: Date,
      },
      status: {
        type: String,
        enum: ["Present", "Absent"],
        default: "Absent",
      },
      verifiedBy: {
        type: String,
        default: "face",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const Student = models.Student || mongoose.model("Student", studentSchema);
export default Student;
