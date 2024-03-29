const { default: mongoose } = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(
      "mongodb+srv://d4deepanshu723:Ab9uJvOiiFvwOsMF@cluster0.a51plnp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("Connected to the database");
  } catch (e) {
    console.log(e);
  }
}


module.exports = connectDB;