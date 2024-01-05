const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findByIdAndUpdate } = require("../models/post");
const Post = require("../models/post");
const User = require("../models/user.js");

const getDataUri = require("./dataUri.js");
const cloudinary = require("cloudinary");

exports.createPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, error: "No file provided" });
    }

    const fileUri = getDataUri(file);

    let mycloud;
    if (file.mimetype.startsWith("image")) {
      mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
    } else if (file.mimetype.startsWith("video")) {
      // Handle video upload separately
      mycloud = await cloudinary.v2.uploader.upload(fileUri.content, {
        resource_type: "video",
        // Add any video-specific options here
      });
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Unsupported file type" });
    }

    const newPost = new Post({
      caption,
      image: {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
        resource_type: mycloud.resource_type,
      },
      postedBy: req.userId,
    });

    await newPost.save();
    res
      .status(200)
      .json({ success: true, message: "Post created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "An error occurred during creating the post",
    });
  }
};

exports.allPost = async (req, res) => {
  try {
    const allpost = await Post.find()
      .populate("postedBy", "username createdAt profileimg followers following")
      .sort({ createdAt: -1 });

    const userDetails = await User.findById(req.userId);

    if (allpost.length === 0) {
      // Return an empty array if there are no posts
      return res.status(200).json({
        success: true,
        allpost: [],
        userDetails,
        message: "No posts found",
      });
    }

    // Return posts and user details
    res.status(200).json({
      success: true,
      allpost,
      userDetails,

      message: "Posts fetched successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching posts",
    });
  }
};

exports.myPost = async (req, res) => {
  try {
    const allpost = await Post.find({ postedBy: req.userId })
      .populate("postedBy", "username createdAt")
      .sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, allpost, message: "Posts fetched successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching posts",
    });
  }
};

exports.searchPost = async (req, res) => {
  try {
    const { user } = req.body;
    const UserId = await User.find({ username: user }).select("_id");

    const allpost = await Post.find({ postedBy: UserId }).populate(
      "postedBy",
      "username createdAt profileimg"
    );

    res.status(200).json({
      success: true,
      allpost,
      message: " Search Posts fetched successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching Search posts",
    });
  }
};

exports.userPost = async (req, res) => {
  try {
    const userPost = await Post.find({ postedBy: req.userId });
    res
      .status(200)
      .json({ success: true, userPost, message: "Posts fetched successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching posts",
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.body;

    const post = await Post.findByIdAndDelete(postId);

    if (!post) {
      res.status(200).json({ success: true, message: "Post Not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Post Deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Post Not Deleted successfully",
    });
  }
};

exports.editPost = async (req, res) => {
  try {
    const { postId, finalupdate } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { caption: finalupdate },
      { new: true }
    );

    if (!updatedPost) {
      res.status(500).json({ success: true, message: "Post Not found" });
    }

    res.status(200).json({
      success: true,
      updatedPost,
      message: "Post Updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Post Not Updated successfully",
    });
  }
};

exports.profile = async (req, res) => {
  try {
    const file = req.file;

    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    const userDetails = await User.findById(req.userId);

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    userDetails.profileimg = {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    };

    await userDetails.save();

    res.status(200).json({
      success: true,
      userDetails,
      message: "Profile image updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Profile image not updated successfully",
    });
  }
};

exports.UserAllDetails = async (req, res) => {
  try {
    const { usernameprofile } = req.query;

    const searachuser = await User.find({ username: usernameprofile }).select(
      "_id followers following"
    );

    const allpost = await Post.find({ postedBy: searachuser[0]._id });
    const savedpost = await Post.find({ SavedBy: searachuser[0]._id });

    const followerIds = searachuser[0].followers;
    const followingIds = searachuser[0].following;

    // Query the User collection to fetch the follower profiles
    const allFollowers = await User.find({ _id: { $in: followerIds } });
    const allFollowing = await User.find({ _id: { $in: followingIds } });
    // console.log(allFollowers,allFollowing);
    // const allfollower=await User.find({})

    res.status(200).json({
      success: true,
      allpost,
      allFollowers,
      allFollowing,
      savedpost,
      searachuser,
      message: "Search User retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve Searched details",
    });
  }
};

exports.followuser = async (req, res) => {
  try {
    const { user } = req.query;
    const userIdToFollow = req.userId;

    const userToFollow = await User.findById(user);
    const usertoFollowing = await User.findById(userIdToFollow);

    if (!userToFollow || !usertoFollowing) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isAlreadyFollowing = userToFollow.followers.includes(userIdToFollow);

    if (isAlreadyFollowing) {
      if (userToFollow.followers.length > 0) {
        userToFollow.followers.pull(userIdToFollow);
      }
      if (usertoFollowing.following.length > 0) {
        usertoFollowing.following.pull(userToFollow._id);
      }
      await userToFollow.save();
      await usertoFollowing.save();
      return res.status(200).json({
        success: false,
        message: "User Unfollowed Successfully",
      });
    } else {
      userToFollow.followers.push(userIdToFollow);
      usertoFollowing.following.push(userToFollow._id);
    }

    await userToFollow.save();
    await usertoFollowing.save();
    return res.status(200).json({
      success: true,
      message: "User Followed Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "An error occurred while Follow/Unfollow User",
    });
  }
};
