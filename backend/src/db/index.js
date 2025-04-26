import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
    console.log(
      `MongoDb connected! DB host : ${connectionInstance.connection.host} `
    );
  } catch (error) {
    console.log("MongoDb connection Error : ", error);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
  }
};

export { connectDB, disconnectDB };
