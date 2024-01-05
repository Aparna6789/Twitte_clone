import React, { useState } from "react";
import "../Dashboard/Dashboard.css";


import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSearchPost } from "../../Reducers/createpost.js";
const Navbar = () => {
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const handleInputChange = (event) => {
    setSearchText(event.target.value);
  };

  const dispatch = useDispatch();
  const handleSearch = () => {
    dispatch(getSearchPost(searchText));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  return (
    <div>
      <div className="dashboard_navbar_00">
        <section>
          <div className="search-input">
            <input
              type="text"
              value={searchText}
              placeholder="Search username"
              onChange={handleInputChange}
              style={{ textAlign: "center", border: "none", outline: "none" }}
            />
            <button className="search_navbar_button" onClick={handleSearch}>
              {" "}
              Search{" "}
            </button>
          </div>
          <span style={{ cursor: "pointer" }} onClick={handleLogout}>
            {" "}
            Logout
          </span>
        </section>
      </div>
    </div>
  );
};

export default Navbar;
