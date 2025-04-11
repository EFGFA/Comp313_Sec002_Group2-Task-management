import React from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
    const navigate = useNavigate()

    const handleLogout = (e) => {
        localStorage.clear()
        navigate('/login')
    }

    return (
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
    )
}