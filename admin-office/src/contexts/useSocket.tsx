import { useEffect, useState } from 'react';

function useSocket() {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        if (process.browser) {
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'wss:';
            const _socket = new WebSocket(`${wsProtocol}//go.myru.online/socket.io/`);

            _socket.onmessage = (received) => {
                if (!received.data.includes(',')) {
                    // Update your state here
                    console.log("Socket message: ", received.data);
                }
            };

            const intervalId = setInterval(() => {
                if (_socket.readyState === WebSocket.OPEN) {
                    const pingData = JSON.stringify({
                        messageType: 'ping',
                        data: [] // Can be an empty object or contain the desired data
                    });
                    _socket.send(pingData); // Send ping to keep connection alive
                }
            }, 50000);

            setSocket(_socket);

            return () => {
                clearInterval(intervalId); // Clean interval on unmount
                _socket.close(); // Close WebSocket on unmount
            };
        }
    }, []);

    return socket;
}

export default useSocket;