import React, { useState, useEffect } from "react";
import "./Dashboard.css";


import { FiMoreHorizontal, FiSettings } from "react-icons/fi";


import { BsBookmarkFill, BsBookmark } from "react-icons/bs";
import moment from "moment";

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaSquarePlus } from "react-icons/fa6";
import { AiFillHome, AiOutlineClose } from "react-icons/ai";
import { FaImages } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import {
  createPost,
  getAllPost,

  followUser,
  addLikes,

} from "../../Reducers/createpost.js";
import Navbar from "../Navbar/Navbar.js";

const Dashboard = () => {
  const [searchText, setSearchText] = useState("");
  const [isopen, setIsOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [imagesave, setImageSave] = useState(false);
  const [closemodal, setCloseModal] = useState(false);
  const [commentModal, setCommentModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [allPost, setAllPost] = useState([]);
  const [commentopensection, setCommentOpenSection] = useState(false);
  const [loadingstate, setLoadingState] = useState(false);
  const [showpostupdate, setShowPostUpdate] = useState(false);


  const handleCommentChange = (event) => {
    setLoadingState((prev) => !prev);
    setCommentText(event.target.value);
  };



  const [postData, setPostData] = useState({
    caption: "",
    fileType: "", // Add fileType to the state
    media: null, // Rename image to media to handle both images and videos
  });

  const posts = useSelector((state) => state.post.posts);

  const searchpost = useSelector((state) => state.post.searchpost);
  // const searchpostmsg = useSelector((state) => state.post.searchpostmsg);
  const searchpostloading = useSelector(
    (state) => state.post.searchpostloading
  );

  const userDetails = useSelector((state) => state.post.userDetails);

  const savedmsg = useSelector((state) => state.post.savedmsg);
  const savedsuccess = useSelector((state) => state.post.savedsuccess);

  const { commentmsg, commentsuceess, likesuccess, likemsg } = useSelector(
    (state) => state.post
  );
  useEffect(() => {
    if (commentsuceess && commentmsg.trim() !== "") {
      toast.success(commentmsg);
    }
  }, [commentsuceess]);

  useEffect(() => {
    setTimeout(() => {
      if (searchpostloading) setAllPost(searchpost);
      else setAllPost(posts);

      if (showpostupdate) {
        window.location.reload();
      }
    }, 2000);
  }, [posts, showpostupdate, searchpost, searchpostloading]);

  const dispatch = useDispatch();

  const handleImageUpload = (event) => {
    const file = event.target.files[0]; // Get the selected file

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        // Set the previewMedia to the data URL of the selected file
        setPreviewMedia(e.target.result);
      };

      reader.readAsDataURL(file); // Read the selected file as a data URL

      // Determine file type (image or video)
      const fileType = getFileType(file);

      // Update state based on file type
      setPostData({
        ...postData,
        fileType,
        media: file, // Rename image to media to handle both images and videos
      });
    }
  };

  const getFileType = (file) => {
    const fileType = file.type.split("/")[0]; // Extract the file type (image or video)
    return fileType === "image" ? "image" : "video";
  };

  const openComment = (postId) => {
    setCommentOpenSection((prevId) => (prevId === postId ? null : postId));
  };

  const openSaved = () => {
    navigate("/setting");
  };


 

  const ImageSave = () => {
    setImageSave(true);
    if (postData.caption.trim() === "") {
      return;
    }
    if (postData.image === null) {
      return;
    }

    dispatch(createPost(postData));
    setShowPostUpdate(true);
  };
  const { error, success, createmg, createsuccess } = useSelector(
    (state) => state.post
  );
  const { errorsignin, successsignin } = useSelector((state) => state.user);

  const { followsuccess, followmsg } = useSelector((state) => state.post);

  useEffect(() => {
    if (createsuccess == true) {
      setCloseModal(true);
      toast.success(createmg);
    }
  }, [createmg]);

  useEffect(() => {
    dispatch(getAllPost());

    if (showpostupdate) {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [loadingstate, showpostupdate]);

  const dashboard = useSelector((state) => state.post.dashboard);

  const handleFollow = (userId) => {
    dispatch(followUser(userId));
  };

  useEffect(() => {
    if (!dashboard) {
      if (successsignin === false && errorsignin !== "") {
        toast.error(errorsignin);
      } else if (successsignin === true) {
        toast.success(errorsignin);
      }
    }
  }, [successsignin, errorsignin]);

  const ImageBack = () => {
    setImageSave(false);
  };

  const openUpload = () => {
    setIsOpen(true);
  };

  const closeUpload = () => {
    setIsOpen(false);
  };


  const navigate = useNavigate();

  const handleCaptionChange = (event) => {
    setPostData({
      ...postData,
      caption: event.target.value,
    });
  };

  const handleprofile = (username) => {
    navigate(`/setting`);
  };

  return (
    <div className="dashboard_wrapper">
      <div className="dashboard_wrapper_00">
        <Navbar />
        <span className="dashboard_outline"></span>
        <div className="dashboard_all_main">
          <div className="dashboard_story_wrapper_left">
            <section>
              <span onClick={openUpload}>
                <FaSquarePlus /> Create{" "}
              </span>
            </section>
          </div>

          <div className="dashboard_story_wrapper_mid">
            {allPost.map((post) => (
              <div className="post_wrapper_00" key={post._id}>
                <div className="post_wrapper_01">
                  <div className="post_wrapper_011">
                    <section>
                      <span>{post?.postedBy?.username}</span>
                      <span style={{ fontWeight: "400" }}>
                        {moment(post?.createdAt).fromNow()}
                      </span>
                    </section>
                    {!(post?.postedBy?._id === userDetails._id) && (
                      <span onClick={() => handleFollow(post?.postedBy?._id)}>
                        {post?.postedBy?.followers?.includes(userDetails?._id)
                          ? "Unfollow"
                          : "Follow"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="post_wrapper_02">
                  {post?.image?.resource_type === "image" ? (
                    <img src={post?.image?.url} alt="Post Image" />
                  ) : post?.image?.resource_type === "video" ? (
                    <video controls width="400">
                      <source src={post?.image?.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <p>Unsupported media type</p>
                  )}
                </div>

                <div className="post_wrapper_03">
                  <p style={{color:"gray"}}>
                    <strong style={{ fontWeight: "bold", color:"white" }}>
                      { "Your Message : "}
                    </strong>
                    {post.caption}
                  </p>

                

                </div>
              </div>
            ))}
          </div>

          <div className="dashboard_story_wrapper_right">
            <section>
              <div className="post_wrapper_01">
                <div className="post_wrapper_011">
                  <section>
                    <span>{userDetails?.username}</span>
                  </section>
                </div>
                <FiSettings
                  style={{ color: "white", cursor: "pointer" }}
                  onClick={() => handleprofile(userDetails?.username)}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
      {isopen && !closemodal && (
        <div className="modal_wrapper">
          <div className="upload_modal">
            <span onClick={closeUpload}>
              <AiOutlineClose />
            </span>
            <div className="upload_wrapper_01">Upload a post</div>
            <p></p>

            {/* File input for image selection */}

            {!previewMedia && (
              <label htmlFor="fileInput">
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*, video/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                <FaImages style={{ color: "white", fontSize: "90px" }} />
                <h2>Drag your photos / Video here</h2>
              </label>
            )}

            {/* Display the image preview */}
            {previewMedia && !imagesave && (
              <div className="upload_image_00">
                <div className="upload_image-preview">
                  <img src={previewMedia} alt="Preview" />
                </div>
                <button
                  className="upload_image-preview_button"
                  onClick={ImageSave}
                >
                  Save & Next
                </button>
              </div>
            )}

            {imagesave && (
              <div className="caption_image_00">
                <textarea
                  style={{
                    background: "transparent",
                    color: "white",
                    minHeight: "200px",
                    marginBottom: "30px",
                    outline: "none",
                    border: "1px solid white",
                    padding: "5px",
                    width: "100%",
                  }}
                  placeholder="Write your message here...."
                  value={postData.caption}
                  onChange={handleCaptionChange}
                />
                <button
                  className="upload_image-preview_button"
                  onClick={ImageBack}
                >
                  Back
                </button>
                <button
                  className="upload_image-preview_button"
                  onClick={ImageSave}
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default Dashboard;
