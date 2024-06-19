import React, { useState } from "react";
import { Link } from "react-router-dom";

export const Login = (props) => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = {
      name: userName,
      password: password,
    };
    if(data.name === '' || data.password ===''){
      setErrorMessage("Please fill username and password")
    }else{
    fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        if (data.message === "true") {
          // store the token in local storage
          localStorage.setItem("token", data.token);
          // redirect the user to the chat page
          window.location.href = "/homepage";
        }else{
          setErrorMessage("Invalid username or password.");
        }
      })
      .catch((error) => {
        setErrorMessage("Invalid username or password.");
        console.error(error);
      });
    }
  };
  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">Smart Chat</span>
        <span className="title">Login</span>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="username"
            value={userName}
            onChange={(event) => setUserName(event.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button type="submit">Sign in</button>
          {errorMessage && <div className="error">{errorMessage}</div>}
        </form>
        <Link to="/register" className="link-btn">
          Not a member? Sign up
        </Link>
      </div>
    </div>
  );
};
