/* ==========================================
   MEETLY FRIENDS SYSTEM
   Separate PeerJS instance for friends.
   No Firebase.
========================================== */

(() => {
    "use strict";

    const FRIENDS_KEY = "meetlyFriends";
    const REQUESTS_KEY = "meetlyFriendRequests";
    const USERNAME_KEY = "meetlyFriendUsername";

    let peer = null;
    let currentPeerId = "";
    let currentUsername = "";
    let peerReady = false;

    const connectedConnections = new Set();
    const wiredConnections = new WeakSet();

    let friends = loadArray(FRIENDS_KEY);
    let requests = loadArray(REQUESTS_KEY);

    /* ==========================================
       STORAGE
    ========================================== */

    function loadArray(key) {
        try {
            const value = JSON.parse(
                localStorage.getItem(key) || "[]"
            );

            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    }

    function saveFriends() {
        localStorage.setItem(
            FRIENDS_KEY,
            JSON.stringify(friends)
        );

        renderFriends();
    }

    function saveRequests() {
        localStorage.setItem(
            REQUESTS_KEY,
            JSON.stringify(requests)
        );

        renderRequests();
    }

    function getElement(id) {
        return document.getElementById(id);
    }

    function setStatus(message) {
        const status = getElement("friendSystemStatus");

        if (status) {
            status.textContent = message;
        }
    }

    function getUsername() {
        const inputName =
            getElement("profileName")?.value?.trim();

        let profile = {};

        try {
            profile = JSON.parse(
                localStorage.getItem("meetlyProfile") || "{}"
            );
        } catch {}

        return (
            inputName ||
            profile.name ||
            localStorage.getItem(USERNAME_KEY) ||
            "MEETLY User"
        ).trim();
    }

    /* ==========================================
       NOTIFICATIONS
    ========================================== */

    function notify(title, message) {
        if (typeof window.createNotification === "function") {
            try {
                window.createNotification(title, message);
            } catch (error) {
                console.error(
                    "MEETLY notification error:",
                    error
                );
            }
        }

        if (
            "Notification" in window &&
            Notification.permission === "granted"
        ) {
            try {
                new Notification(title, {
                    body: message
                });
            } catch {}
        }
    }

    /* ==========================================
       FRIEND LOOKUPS
    ========================================== */

    function getFriend(peerId) {
        return friends.find(
            friend => friend.peerId === peerId
        );
    }

    function getRequest(peerId) {
        return requests.find(
            request => request.peerId === peerId
        );
    }

    function addFriendLocally(peerId, username) {
        if (!peerId || peerId === currentPeerId) {
            return;
        }

        const existing = getFriend(peerId);

        if (existing) {
            if (
                username &&
                username !== "MEETLY User"
            ) {
                existing.username = username;
                saveFriends();
            }

            return;
        }

        friends.push({
            peerId,
            username: username || "MEETLY User",
            addedAt: new Date().toISOString()
        });

        saveFriends();
    }

    function removeFriendLocally(peerId) {
        friends = friends.filter(
            friend => friend.peerId !== peerId
        );

        saveFriends();
    }

    /* ==========================================
       DISPLAY FRIENDS
    ========================================== */

    function renderFriends() {
        const container = getElement("friendsList");

        if (!container) return;

        container.replaceChildren();

        if (!friends.length) {
            const empty = document.createElement("p");

            empty.textContent =
                "You don't have any friends yet.";

            container.appendChild(empty);
            return;
        }

        friends.forEach(friend => {
            const item = document.createElement("div");
            item.className = "friend-item";

            const info = document.createElement("div");
            info.className = "friend-info";

            const avatar = document.createElement("div");
            avatar.className = "friend-avatar";
            avatar.textContent = "👤";
            avatar.style.display = "flex";
            avatar.style.alignItems = "center";
            avatar.style.justifyContent = "center";

            const details = document.createElement("div");

            const name = document.createElement("div");
            name.className = "friend-name";
            name.textContent =
                friend.username || "MEETLY User";

            const id = document.createElement("div");
            id.className = "friend-username";
            id.textContent = "Peer ID: " + friend.peerId;

            details.append(name, id);
            info.append(avatar, details);

            const actions = document.createElement("div");
            actions.className = "friend-actions";

            const connectButton =
                document.createElement("button");

            connectButton.className = "accept-friend";
            connectButton.textContent = "Connect";

            connectButton.addEventListener("click", () => {
                connectToFriend(friend.peerId);
            });

            const removeButton =
                document.createElement("button");

            removeButton.className = "remove-friend";
            removeButton.textContent = "Remove";

            removeButton.addEventListener("click", () => {
                removeFriend(friend.peerId);
            });

            actions.append(connectButton, removeButton);
            item.append(info, actions);
            container.appendChild(item);
        });
    }

    /* ==========================================
       DISPLAY FRIEND REQUESTS
    ========================================== */

    function renderRequests() {
        const container = getElement("friendRequestsList");

        if (!container) return;

        container.replaceChildren();

        if (!requests.length) {
            const empty = document.createElement("p");

            empty.textContent = "No friend requests.";

            container.appendChild(empty);
            return;
        }

        requests.forEach(request => {
            const item = document.createElement("div");
            item.className = "friend-request-item";

            const info = document.createElement("div");
            info.className = "friend-info";

            const details = document.createElement("div");

            const name = document.createElement("div");
            name.className = "friend-name";
            name.textContent =
                request.username || "MEETLY User";

            const id = document.createElement("div");
            id.className = "friend-username";
            id.textContent = "Peer ID: " + request.peerId;

            details.append(name, id);
            info.appendChild(details);

            const actions = document.createElement("div");
            actions.className = "friend-actions";

            const acceptButton =
                document.createElement("button");

            acceptButton.className = "accept-friend";
            acceptButton.textContent = "Accept";

            acceptButton.addEventListener("click", () => {
                acceptRequest(request.peerId);
            });

            const declineButton =
                document.createElement("button");

            declineButton.className = "decline-friend";
            declineButton.textContent = "Decline";

            declineButton.addEventListener("click", () => {
                declineRequest(request.peerId);
            });

            actions.append(acceptButton, declineButton);
            item.append(info, actions);
            container.appendChild(item);
        });
    }

    /* ==========================================
       PEERJS CONNECTIONS
    ========================================== */

    function sendMessage(connection, message) {
        if (!connection || !connection.open) {
            return false;
        }

        try {
            connection.send({
                app: "meetly-friends",
                ...message
            });

            return true;
        } catch (error) {
            console.error(
                "MEETLY could not send message:",
                error
            );

            return false;
        }
    }

    function wireConnection(connection) {
        if (
            !connection ||
            wiredConnections.has(connection)
        ) {
            return;
        }

        wiredConnections.add(connection);
        connectedConnections.add(connection);

        connection.on("open", () => {
            connectedConnections.add(connection);

            setStatus(
                "Connected to " + connection.peer
            );
        });

        connection.on("data", data => {
            if (
                !data ||
                data.app !== "meetly-friends"
            ) {
                return;
            }

            handleFriendMessage(connection, data);
        });

        connection.on("close", () => {
            connectedConnections.delete(connection);
        });

        connection.on("error", error => {
            console.error(
                "MEETLY friend connection error:",
                error
            );

            setStatus(
                "Connection problem. Check the Peer ID and try again."
            );
        });
    }

    function connectToPeer(peerId) {
        if (
            !peerReady ||
            !peer ||
            peer.destroyed
        ) {
            setStatus(
                "PeerJS is not ready yet. Please wait."
            );

            return null;
        }

        if (!peerId || peerId === currentPeerId) {
            setStatus(
                "Enter another user's valid Peer ID."
            );

            return null;
        }

        for (const connection of connectedConnections) {
            if (
                connection.peer === peerId &&
                !connection.closed
            ) {
                return connection;
            }
        }

        try {
            const connection = peer.connect(peerId, {
                reliable: true,
                metadata: {
                    app: "meetly-friends"
                }
            });

            wireConnection(connection);

            return connection;
        } catch (error) {
            console.error(
                "MEETLY connection error:",
                error
            );

            setStatus(
                "Could not connect. Check the Peer ID."
            );

            return null;
        }
    }

    function sendWhenOpen(connection, message) {
        if (!connection) return;

        if (connection.open) {
            if (!sendMessage(connection, message)) {
                setStatus("Message could not be sent.");
            }

            return;
        }

        connection.once("open", () => {
            if (!sendMessage(connection, message)) {
                setStatus("Message could not be sent.");
            }
        });

        connection.once("error", () => {
            setStatus(
                "Connection failed. Make sure the other user is online."
            );
        });
    }

    /* ==========================================
       HANDLE INCOMING MESSAGES
    ========================================== */

    function handleFriendMessage(connection, message) {
        const senderId = connection.peer;

        const senderName = String(
            message.username || "MEETLY User"
        );

        if (
            !senderId ||
            senderId === currentPeerId
        ) {
            return;
        }

        switch (message.type) {
            case "friend-request": {
                if (getFriend(senderId)) {
                    sendWhenOpen(connection, {
                        type: "already-friends",
                        username: currentUsername
                    });

                    return;
                }

                if (!getRequest(senderId)) {
                    requests.push({
                        peerId: senderId,
                        username: senderName,
                        receivedAt: new Date().toISOString()
                    });

                    saveRequests();

                    notify(
                        "Friend Request",
                        senderName +
                            " sent you a friend request."
                    );
                }

                setStatus(
                    "Friend request received from " +
                    senderName
                );

                break;
            }

            case "friend-accepted": {
                addFriendLocally(
                    senderId,
                    senderName
                );

                requests = requests.filter(
                    request => request.peerId !== senderId
                );

                saveRequests();

                notify(
                    "Friend Request Accepted",
                    senderName +
                        " accepted your friend request."
                );

                setStatus(
                    senderName + " is now your friend."
                );

                break;
            }

            case "friend-declined": {
                requests = requests.filter(
                    request => request.peerId !== senderId
                );

                saveRequests();

                setStatus(
                    senderName +
                        " declined the friend request."
                );

                break;
            }

            case "friend-removed": {
                removeFriendLocally(senderId);

                setStatus(
                    senderName +
                        " removed you from their friends."
                );

                break;
            }

            case "already-friends": {
                setStatus(
                    "You are already friends with this user."
                );

                break;
            }

            default:
                break;
        }
    }

    /* ==========================================
       SEND FRIEND REQUEST
    ========================================== */

    function sendFriendRequest() {
        const peerId =
            getElement("friendPeerId")?.value.trim();

        if (!peerReady) {
            setStatus(
                "Wait until PeerJS finishes connecting."
            );

            return;
        }

        if (!peerId) {
            setStatus(
                "Enter your friend's PeerJS ID."
            );

            return;
        }

        if (peerId === currentPeerId) {
            setStatus("You cannot add yourself.");
            return;
        }

        if (getFriend(peerId)) {
            setStatus(
                "This user is already your friend."
            );

            return;
        }

        if (getRequest(peerId)) {
            setStatus(
                "A request from this user is already pending."
            );

            return;
        }

        const connection = connectToPeer(peerId);

        if (!connection) return;

        sendWhenOpen(connection, {
            type: "friend-request",
            username: currentUsername,
            peerId: currentPeerId,
            sentAt: new Date().toISOString()
        });

        setStatus(
            "Connecting to your friend. They must be online to receive the request."
        );
    }

    /* ==========================================
       ACCEPT FRIEND REQUEST
    ========================================== */

    function acceptRequest(peerId) {
        const request = getRequest(peerId);

        if (!request) {
            setStatus(
                "This request no longer exists."
            );

            return;
        }

        const connection = connectToPeer(peerId);

        if (!connection) {
            setStatus(
                "Could not connect to the requester."
            );

            return;
        }

        addFriendLocally(
            peerId,
            request.username
        );

        requests = requests.filter(
            item => item.peerId !== peerId
        );

        saveRequests();

        sendWhenOpen(connection, {
            type: "friend-accepted",
            username: currentUsername,
            peerId: currentPeerId,
            acceptedAt: new Date().toISOString()
        });

        notify(
            "Friend Added",
            "You are now friends with " +
                request.username + "."
        );

        setStatus(
            "Friend added to your list. The other user must receive the acceptance to update theirs."
        );
    }

    /* ==========================================
       DECLINE FRIEND REQUEST
    ========================================== */

    function declineRequest(peerId) {
        const request = getRequest(peerId);

        if (!request) return;

        const connection = connectToPeer(peerId);

        if (connection) {
            sendWhenOpen(connection, {
                type: "friend-declined",
                username: currentUsername,
                peerId: currentPeerId
            });
        }

        requests = requests.filter(
            item => item.peerId !== peerId
        );

        saveRequests();

        setStatus("Friend request declined.");
    }

    /* ==========================================
       REMOVE FRIEND
    ========================================== */

    function removeFriend(peerId) {
        const friend = getFriend(peerId);

        if (!friend) return;

        if (
            !confirm(
                "Remove " +
                friend.username +
                " from your friends?"
            )
        ) {
            return;
        }

        const connection = connectToPeer(peerId);

        if (connection) {
            sendWhenOpen(connection, {
                type: "friend-removed",
                username: currentUsername,
                peerId: currentPeerId
            });
        }

        removeFriendLocally(peerId);

        setStatus(
            "Friend removed from your local list."
        );
    }

    /* ==========================================
       CONNECT TO FRIEND
    ========================================== */

    function connectToFriend(peerId) {
        const connection = connectToPeer(peerId);

        if (connection) {
            setStatus("Connecting to friend...");
        }
    }

    /* ==========================================
       COPY PEER ID
    ========================================== */

    function copyPeerId() {
        if (!currentPeerId) {
            setStatus(
                "Your PeerJS ID is not ready yet."
            );

            return;
        }

        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {
            navigator.clipboard
                .writeText(currentPeerId)
                .then(() => {
                    setStatus("PeerJS ID copied!");
                })
                .catch(() => {
                    fallbackCopy(currentPeerId);
                });
        } else {
            fallbackCopy(currentPeerId);
        }
    }

    function fallbackCopy(text) {
        const input =
            document.createElement("textarea");

        input.value = text;
        input.style.position = "fixed";
        input.style.opacity = "0";

        document.body.appendChild(input);
        input.select();

        try {
            const copied =
                document.execCommand("copy");

            setStatus(
                copied
                    ? "PeerJS ID copied!"
                    : "Copy failed. Select and copy your ID manually."
            );
        } catch {
            setStatus(
                "Copy failed. Select and copy your ID manually."
            );
        }

        input.remove();
    }

    /* ==========================================
       INITIALIZE SEPARATE FRIENDS PEER
    ========================================== */

    function initializePeer() {
        if (peer) return;

        if (typeof window.Peer !== "function") {
            setStatus(
                "PeerJS did not load. Refresh the page and try again."
            );

            return;
        }

        // Reuse the Friends peer if it was already created.
        // Otherwise, create exactly one separate Friends peer.
        peer = window.meetlyFriendsPeer || new window.Peer();

        window.meetlyFriendsPeer = peer;

        function handlePeerOpen(id) {
            currentPeerId = id;
            peerReady = true;

            const peerIdInput = getElement("myPeerId");

            if (peerIdInput) {
                peerIdInput.value = id;
            }

            setStatus("Friends connection is ready.");

            console.log("MEETLY Friends Peer ID:", id);
        }

        // Handle the unlikely case that the peer is already open.
        if (peer.id && !peer.destroyed) {
            handlePeerOpen(peer.id);
        }

        peer.on("open", handlePeerOpen);

        peer.on("connection", connection => {
            wireConnection(connection);
        });

        peer.on("disconnected", () => {
            peerReady = false;

            setStatus(
                "Friends connection lost. Reconnecting..."
            );

            if (peer && !peer.destroyed) {
                peer.reconnect();
            }
        });

        peer.on("error", error => {
            console.error(
                "MEETLY Friends PeerJS error:",
                error
            );

            setStatus(
                "Friends connection error: " +
                (error.type || "unknown error")
            );
        });

        peer.on("close", () => {
            peerReady = false;
            currentPeerId = "";

            setStatus(
                "Friends connection closed. Refresh the page to reconnect."
            );
        });
    }

    /* ==========================================
       BUTTONS AND INITIALIZATION
    ========================================== */

    function setupButton(buttonId, handler) {
        const oldButton = getElement(buttonId);

        if (!oldButton) return;

        // Replace the button to remove an old local-only
        // click handler from the previous friends system.
        const newButton = oldButton.cloneNode(true);

        oldButton.replaceWith(newButton);

        newButton.addEventListener("click", handler);
    }

    function initialize() {
        currentUsername = getUsername();

        localStorage.setItem(
            USERNAME_KEY,
            currentUsername
        );

        setupButton(
            "addFriendButton",
            sendFriendRequest
        );

        setupButton(
            "copyPeerIdButton",
            copyPeerId
        );

        const nameInput = getElement("profileName");

        if (nameInput) {
            nameInput.addEventListener("change", () => {
                currentUsername = getUsername();

                localStorage.setItem(
                    USERNAME_KEY,
                    currentUsername
                );
            });
        }

        initializePeer();
        renderFriends();
        renderRequests();
    }

    /* ==========================================
       PUBLIC FUNCTIONS
    ========================================== */

    window.MeetlyFriends = {
        sendFriendRequest,
        acceptRequest,
        declineRequest,
        removeFriend,
        connectToFriend,
        renderFriends,
        renderRequests
    };

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }
})();