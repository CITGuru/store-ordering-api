module.exports = {
    mongoURI:
      process.env.MONGODB_URI || "mongodb://localhost:27017/foodorder",
    secret: process.env.JWT_KEY
  };
  