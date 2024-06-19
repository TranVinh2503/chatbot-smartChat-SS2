import React from "react";
import avatar from '../img/download.png'

export const Message = ({text}) => {
    return (
        <div className="message owner">
            <div className="messageInfor">
                <img src={avatar} alt="" />
            </div>
            <div className="messageContent">
                <p>{text}</p>
            </div>
        </div>
    )
}