"use client"

import { EventDirection, WidgetEventCapability } from '@beeper/matrix-widget-api';
import { useWidgetApi } from '@beeper/matrix-widget-toolkit-react';
import Option from "@/app/components/option";
import { MuiCapabilitiesGuard } from "@beeper/matrix-widget-toolkit-mui";
import { useState, useEffect } from 'react';


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
            </MuiCapabilitiesGuard>
        </>
    );
};
export function CombinedExample() {
    const [items, setItems] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const api = useWidgetApi();

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim()) return;
        await api.sendRoomEvent('m.room.message', {
            msgtype: 'm.text',
            body: input,
        });
        setInput('');
    }

    useEffect(() => {
        let timer: ReturnType<typeof setInterval> | undefined;
        let lastEventId: string | undefined;

        async function pollUpdates() {
            const events = await api.receiveRoomEvents('m.room.message', {
                since: lastEventId,
            });
            if (events.length) {
                lastEventId = events[events.length - 1].event_id;
                setItems(prev => [...prev, ...events]);
            }
        }

        pollUpdates();
        timer = setInterval(pollUpdates, 3000);
        return () => clearInterval(timer);
    }, [api]);

    return (
        <div>
            <form onSubmit={handleSend}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                />
                <button type="submit">Send</button>
            </form>
            <ul>
                {items.map(evt => (
                    <li key={evt.event_id}>{evt.content.body}</li>
                ))}
            </ul>
        </div>
    );
}