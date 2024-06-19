import React, { useEffect, useState } from "react";
import Add from "../img/add.png";
import { Link } from "react-router-dom";

export const Register = (props) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const validatePassword = () => {
    // Check password length
    if (password.length < 8) {
      setErrorMessage("Password must have at least 8 characters");
      return false;
    }

    // Check if password has at least an uppercase
    if (!/[A-Z]/.test(password)) {
      setErrorMessage("Password must have at least an uppercase");
      return false;
    }

    // Check if password has at least a special character
    if (!/[!@#$%^&*]/.test(password)) {
      setErrorMessage("Password must have at least a special character");
      return false;
    }

    return true;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (!validatePassword()) {
      return;
    }

    const data = {
      name: name,
      password: password,
    };
    if(data.name === '' || data.password ===''){
      setErrorMessage("Please fill username and password")
    }else{

    fetch("http://localhost:5000/register", {
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
        if (data) {
          setIsRegistered(true);
          const interval = setInterval(() => {
            setCountdown((prevCountdown) => prevCountdown - 1);
          }, 1000);
          return () => clearInterval(interval); // cleanup interval on unmount
        } else {
          setIsRegistered(false);
        }
      })
      .catch((error) => {
        setErrorMessage("Failed to register user.");
        console.error(error);
      });
    }
  };

  useEffect(() => {
    if (countdown === 0) {
      // navigate to login page
      window.location.href = "/"; // or use a router, e.g. React Router
    }
  }, [countdown]);

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">Smart Chat</span>
        <span className="title">Register</span>
        {!isRegistered && (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="user name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <input
              type="password"
              placeholder="confirm password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <input style={{ display: "none" }} type="file" id="file" />
            <button type="submit">Sign up</button>
            {errorMessage && <div className="error">{errorMessage}</div>}
          </form>
        )}
        {isRegistered && (
          <div>
            <div className="success">Registered successfully!</div>
            <div className="countdown">{`Redirecting to login page in ${countdown} seconds...`}</div>
          </div>
        )}
        <Link to="/" className="link-btn">
          Already a member? Sign in
        </Link>
      </div>
    </div>
  );
};
