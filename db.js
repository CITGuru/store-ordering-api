const mongoose = require("mongoose");
const db = require("./config/keys").mongoURI;
class LiveDB {
  static startDB() {
    mongoose
      .connect(db, { useNewUrlParser: true })
      .then(resp => console.log("MongoDB Connected..."))
      .catch(err => console.log(err));
  }

  static closeDB() {
    mongoose.connection.close(() => {
      console.log("Mongoose default connection closed...");
    });
  }
}
module.exports = {
  LiveDB
};
