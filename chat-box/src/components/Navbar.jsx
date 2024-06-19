import React, { useEffect, useState } from "react";
import jwtDecode from 'jwt-decode';
import avatar from '../img/download.png'

export const Navbar = () => {
    const [userName, setUserName] = useState("");
    const [id, setID] = useState();

    function getUserFromToken(token){
        try {
            const decodedToken = jwtDecode(token);
            return decodedToken;
        } catch (error) {
            if (error.name === 'InvalidTokenError') {
                console.log('Invalid token specified');
            } else {
                console.log('Error decoding token:', error.message);
            }
        }
    }

    useEffect(()=>{
        const token = localStorage.getItem('token');
        const result = getUserFromToken(token)
        setID(result.id)
        setUserName(result.username)
    })

    const handleLogout = ()=>{
        localStorage.removeItem('token');
        window.location.href = '/'


    }
    return (
        <div className="navbar">
            <span className="logo">Smart chat</span>
            <div className="user">
                <img src={avatar} alt="" />
                <span>{userName}</span>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </div>
    )
}