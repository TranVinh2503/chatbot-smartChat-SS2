import React from "react";

export const BotMessage = ({text}) => {
    return (
        <div className="botmessage botowner">
            <div className="botmessageInfor">
                <img src="https://cdn-icons-png.flaticon.com/512/4712/4712126.png" alt="" />
            </div>
            <div className="botmessageContent">
                <p>{text}</p>
            </div>
        </div>
    )
}