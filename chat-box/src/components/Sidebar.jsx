import React from "react";
import { Navbar } from "./Navbar";
import { Chats} from "./Chats"
export const Sidebar = () => {
    return (
        <div className="sidebar">
            <Navbar/>
            <Chats/>
        </div>
    )
}