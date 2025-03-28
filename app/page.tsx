"use client";
import { EventDirection, WidgetEventCapability } from '@beeper/matrix-widget-api';
import { useWidgetApi } from '@beeper/matrix-widget-toolkit-react';
import Option from "@/app/components/option";
import { MuiCapabilitiesGuard } from "@beeper/matrix-widget-toolkit-mui";
import { useState, useEffect } from 'react';
import { RoomEvent } from "@beeper/matrix-widget-toolkit-api";
 
export default function Home() {
    const widgetApi = useWidgetApi();
 
    return (
        <>
            <MuiCapabilitiesGuard
                capabilities={[
                    WidgetEventCapability.forStateEvent(
                        EventDirection.Receive,
                        'm.room.member'
                    ),
                    WidgetEventCapability.forStateEvent(
                        EventDirection.Receive,
                        'm.room.name'
                    ),
                    WidgetEventCapability.forRoomEvent(
                        EventDirection.Receive,
                        'm.room.message'
                    ),
                    WidgetEventCapability.forRoomEvent(
                        EventDirection.Receive,
                        'm.reaction'
                    ),
                    WidgetEventCapability.forRoomEvent(
                        EventDirection.Send,
                        'm.room.message'
                    ),
                    WidgetEventCapability.forRoomEvent(
                        EventDirection.Send,
                        'm.room.redaction'
                    ),
                    WidgetEventCapability.forStateEvent(
                        EventDirection.Send,
                        'm.room.name'
                    ),
                ]}
            >
                <p className="text-lg font-bold">Welcome to Beeper Widgets!</p>
                <p>Explore any of the following examples.</p>
                <Option path="/examples/members" text="View Members"/>
                <Option path="/examples/messages" text="Read Messages"/>
                <Option path="/examples/send" text="Send Message" />
                <Option path="/examples/reactions" text="Read Reactions"/>
                <Option path="/examples/redaction" text="Delete Message" />
                <Option path="/examples/name" text="Room Name" />
                <Option path="/examples/storage" text="Store Data" />
                <MessageListener />
            </MuiCapabilitiesGuard>
        </>
    );
};
 
function MessageListener() {
    const widgetApi = useWidgetApi();
    const [items, setItems] = useState<string[]>(() => {
        const stored = localStorage.getItem("messages");
        return stored ? JSON.parse(stored) : [];
    });
    const [input, setInput] = useState('');

    function addMessage(message: string) {
        setItems(prev => {
            // Only add the message if it doesn't already exist.
            if (prev.includes(message)) return prev;
            const newMessages = [...prev, message];
            localStorage.setItem("messages", JSON.stringify(newMessages));
            return newMessages;
        });
    }

    function sendStartMessage() {
        addMessage("Start To listen Room ...");
    }

    useEffect(() => {
        let timer: ReturnType<typeof setInterval> | undefined;
        let lastEventId: string | undefined;

        sendStartMessage();

        async function pollUpdates() {
            const events = await widgetApi.receiveRoomEvents('m.room.message', {
                since: lastEventId,
            });

            events.forEach(event => {
                const { sender, room_id, content } = event as RoomEvent & { content: { body: string } };
                const { body } = content;
                const message = `${sender} - ${room_id} : ${body}`;
                addMessage(message);
            });

            if (events.length) {
                lastEventId = events[events.length - 1].event_id;
            }
        }

        pollUpdates();
        timer = setInterval(pollUpdates, 3000);
        return () => clearInterval(timer);
    }, [widgetApi]);

    return (
        <>
            <h1>Message Listener</h1>
            <ul>
                {items.map((msg, index) => (
                    <li key={index}>{msg}</li>
                ))}
            </ul>
        </>
    );
}
