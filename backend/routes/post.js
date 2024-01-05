const express = require("express");
const app = express.Router();
const homeController = require("../controllers/post.js");
const authMiddleware = require("../controllers/authMiddleware.js");
const singleUpload = require("../controllers/multer.js");

app.post(
  "/createpost",
  authMiddleware,
  singleUpload,
  homeController.createPost
);

app.get("/allpost", authMiddleware, homeController.allPost);
app.get("/mypost", authMiddleware, homeController.myPost);
app.post("/searchpost", authMiddleware, homeController.searchPost);

app.get("/userpost", authMiddleware, homeController.userPost);

app.post("/deletePost", authMiddleware, homeController.deletePost);
app.post("/editPost", authMiddleware, homeController.editPost);
app.post("/profileimg", authMiddleware, singleUpload, homeController.profile);
app.post("/getAllDetails", authMiddleware, homeController.UserAllDetails);
app.post("/follow", authMiddleware, homeController.followuser);

module.exports = app;
