import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "../assets/js/api";

export default function Message({ onMessageSent }) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    const user = useSelector((state) => state.chat.user);

    async function handleSend(e) {
        e.preventDefault();

        const text = message.trim();

        if (!text || !user?._id || sending) return;

        try {
            setSending(true);

            const response = await api.post("/api/messages", {
                receiver: user._id,
                message: text
            });

            const savedMessage = response.data.data;

            onMessageSent(savedMessage);

            setMessage("");

            if (!savedMessage?._id) {
                toast.error("Invalid message response");
                return;
            }

        } catch (err) {
            console.error("Message error:", err);
            toast.error(
                err.response?.data?.message || "Message sending failed"
            );
        } finally {
            setSending(false);
        }
    }

    return (
        <form className="chat-input-bar" onSubmit={handleSend}>
            <div className="chat-input-actions">
                <button type="button" className="icon-btn" title="Choose emoji">
                    <i className="fa-regular fa-face-smile"></i>
                </button>

                <button type="button" className="icon-btn" title="Attach file">
                    <i className="fa-solid fa-paperclip"></i>
                </button>
            </div>

            <div className="chat-input-wrapper">
                <textarea
                    id="chatMessageInput"
                    className="chat-textarea"
                    rows="1"
                    placeholder="Type a message"
                    autoComplete="off"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            e.currentTarget.form.requestSubmit();
                        }
                    }}
                />
            </div>

            <button
                type="submit"
                className="send-action-btn"
                disabled={!message.trim() || sending}
                title="Send Message"
            >
                <i className="fa-solid fa-paper-plane"></i>
            </button>
        </form>
    );
}