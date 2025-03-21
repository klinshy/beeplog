"use client"
 
import { EventDirection, WidgetEventCapability } from '@beeper/matrix-widget-api';
import { useWidgetApi } from '@beeper/matrix-widget-toolkit-react';
import Option from "@/app/components/option";
import { MuiCapabilitiesGuard } from "@beeper/matrix-widget-toolkit-mui";
import { useState, useEffect } from 'react';
import { RoomEvent } from "@beeper/matrix-widget-toolkit-api";

 
export default function Home() {
    const widgetApi = useWidgetApi();
    const [items, setItems] = useState<any[]>([]);
    const [input, setInput] = useState('');
 
    const historyRoomID = "!rxaVPzpiKkuORgvUUm:beeper.com";
    const sendMessage = async (message: string) => {
        await widgetApi.sendRoomEvent('m.room.message', {
            msgtype: 'm.text',
            body: message,
        } , {
            roomId: historyRoomID,
        } );
    }
 
    const sendStartMessage = async () => {
 
        await widgetApi.sendRoomEvent('m.room.message', {
            msgtype: 'm.text',
            body: "Start To listen Room ...",
        } , {
            roomId: historyRoomID,
        } );
    }
    
 
    useEffect(() => {
        let timer: ReturnType<typeof setInterval> | undefined;
        let lastEventId: string | undefined;
 
        sendStartMessage();
 
        async function pollUpdates() {
            const events = await widgetApi.receiveRoomEvents('m.room.message', {
                since: lastEventId,
            });
 
            events.forEach((event: RoomEvent) => {
                const { body, sender, room_id } = event.content as { body: string; sender: string; room_id: string; };
                sendMessage(` ${sender} - ${room_id} : ${body}`);
            });
            if (events.length) {
                lastEventId = events[events.length - 1].event_id;
                setItems(prev => [...prev, ...events]);
            }
        }
 
        pollUpdates();
        timer = setInterval(pollUpdates, 3000);
        return () => clearInterval(timer);
    }, [widgetApi]);
 
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
 
 