import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Logout() {
    const navigate = useNavigate()
    const { clearAuthData } = useAuth();

    const handleLogout = (e) => {
        clearAuthData();
        navigate('/login')
    }

    return (
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
    )
}