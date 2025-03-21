"use client"

import { useEffect, useState } from "react";
import { useWidgetApi } from "@beeper/matrix-widget-toolkit-react";
import Back from "@/app/components/back";
import SyntaxHighlighter from "react-syntax-highlighter";

interface RoomEvent {
    content: any;
    event_id: string;
    origin_server_ts: number;
    room_id: string;
    sender: string;
    type: string;
    unsigned?: any;
}

export default function ChatListener() {
    const [messages, setMessages] = useState<RoomEvent[]>([]);
    const widgetApi = useWidgetApi();

    // Poll for new chat messages every 3 seconds.
    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval>;
        let latestEventId: string | undefined;

        async function pollMessages() {
            // Get new messages sent after the latest one we received
            const newMessages: RoomEvent[] = await widgetApi.receiveRoomEvents("m.room.message", {
                // 'since' filters to only events after this event id.
                since: latestEventId,
            });
            if (newMessages.length > 0) {
                // Update the latest event id using the last event in the received batch
                latestEventId = newMessages[newMessages.length - 1].event_id;
                setMessages(prevMessages => [...prevMessages, ...newMessages]);
            }
        }

        // Perform an initial fetch of messages
        pollMessages();
        // Set up polling to fetch new messages periodically.
        intervalId = setInterval(pollMessages, 3000);

        return () => clearInterval(intervalId);
    }, [widgetApi]);

    return (
        <>
            <Back />
            <h1 className="mt-4">Chat Messages</h1>
            <div className="mt-2 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={msg.event_id || idx} className="p-2 border rounded">
                        <p>
                            <strong>Sender:</strong> {msg.sender}
                        </p>
                        <p>
                            <strong>Message:</strong> {msg.content.body}
                        </p>
                        <p>
                            <small>
                                <strong>Timestamp:</strong> {new Date(msg.origin_server_ts).toLocaleTimeString()}
                            </small>
                        </p>
                    </div>
                ))}
            </div>
            <h2 className="mt-8">Raw Data</h2>
            <SyntaxHighlighter language="json" className="mt-4">
                {JSON.stringify(messages, null, 4)}
            </SyntaxHighlighter>
        </>
    );
}