import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // 1. Try to connect
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected Successfully!");
  } catch (error) {
    // 2. Catch initial connection errors
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1); // Kills the server if the database fails to connect
  }
};

// 3. Listen for connection drops AFTER the initial connection
mongoose.connection.on("error", (err) => {
  console.error("⚠️ MongoDB Runtime Error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB Disconnected!");
});

// Execute the connection
await connectDB();

export default mongoose.connection;