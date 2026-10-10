/* ===============================
   MEETLY
   WEBRTC + PEERJS
================================ */


/* ===============================
   STORAGE
================================ */

let meetings =
    JSON.parse(localStorage.getItem("meetlyMeetings")) || [];

let calls =
    JSON.parse(localStorage.getItem("meetlyCalls")) || [];

let notifications =
    JSON.parse(localStorage.getItem("meetlyNotifications")) || [];

/* ===============================
   ELEMENT HELPER
================================ */

function getElement(...ids) {

    for (const id of ids) {

        const element =
            document.getElementById(id);

        if (element) {
            return element;
        }

    }

    return null;
}


/* ===============================
   ELEMENTS
================================ */

const homeSection =
    getElement("homeSection");

const meetingsSection =
    getElement("meetingsSection");

const callsSection =
    getElement("callsSection");

const calendarSection =
    getElement("calendarSection");

const profileSection =
    getElement("profileSection");

const profilePicture =
    getElement("profilePicture");

const profilePictureInput =
    getElement("profilePictureInput");

const profileName =
    getElement("profileName");

const profileEmail =
    getElement("profileEmail");

const saveProfileButton =
    getElement("saveProfileButton");

const meetingRoom =
    getElement("meetingRoomSection", "meetingRoom");

const meetingsList =
    getElement("meetingsList");

const callsList =
    getElement("callsList");

const videoGrid =
    getElement("videoGrid");

const localVideo =
    getElement("localVideo");

const activeMeetingTitle =
    getElement("activeMeetingTitle");

const meetingStatus =
    getElement("meetingStatus");

const activeRoomId =
    getElement("activeRoomId");

const friendsSection =
    getElement("friendsSection");

const friendsButton =
    getElement("friendsButton");

const addFriendButton =
    getElement("addFriendButton");

const friendUsername =
    getElement("friendUsername");

const friendRequestsList =
    getElement("friendRequestsList");

const friendsList =
    getElement("friendsList");


/* ===============================
   CALENDAR ELEMENTS
================================ */

const calendarMonth =
    getElement("calendarMonth");

const calendarDays =
    getElement("calendarDays");

const previousMonthButton =
    getElement("previousMonthButton");

const nextMonthButton =
    getElement("nextMonthButton");

const selectedDateMeetings =
    getElement("selectedDateMeetings");


let calendarDate =
    new Date();

let selectedCalendarDate =
    null;


/* ===============================
   OTHER ELEMENTS
================================ */

const createMeetingButton =
    getElement("createMeetingButton");

const viewMeetingsButton =
    getElement("viewMeetingsButton");

const manageCallsButton =
    getElement("manageCallsButton");

const backHomeButton =
    getElement("backHomeButton");

const backCallsButton =
    getElement("backCallsButton");

const addCallButton =
    getElement("addCallButton");

const homeNavButton =
    getElement("homeNavButton");

const meetingsNavButton =
    getElement("meetingsNavButton");

const callsNavButton =
    getElement("callsNavButton");

const profileNavButton =
    getElement("profileNavButton");


/* ===============================
   MEETING CONTROLS
================================ */

const leaveMeetingButton =
    getElement("leaveMeetingButton");

const endMeetingButton =
    getElement("endMeetingButton");

const micButton =
    getElement("micButton");

const cameraButton =
    getElement("cameraButton");

const screenButton =
    getElement(
        "screenShareButton",
        "screenButton"
    );

const copyRoomButton =
    getElement("copyRoomButton");

const shareRoomButton =
    getElement("shareRoomButton");


/* ===============================
   MODALS
================================ */

const meetingModal =
    getElement("meetingModal");

const callModal =
    getElement("callModal");

const closeMeetingModalButton =
    getElement("closeMeetingModal");

const closeCallModalButton =
    getElement("closeCallModal");

const meetingForm =
    getElement("meetingForm");

const callForm =
    getElement("callForm");


const meetingTitle =
    getElement("meetingTitle");

const meetingDate =
    getElement("meetingDate");

const meetingTime =
    getElement("meetingTime");

const meetingNotes =
    getElement("meetingNotes");


const callPerson =
    getElement("callPerson");

const callDate =
    getElement("callDate");

const callTime =
    getElement("callTime");

const callType =
    getElement("callType");

const callNotes =
    getElement("callNotes");


/* ===============================
   MEETING STATE
================================ */

let currentStream = null;

let screenStream = null;

let currentMeetingIndex = null;

let currentRoomId = null;

let microphoneEnabled = true;

let cameraEnabled = true;


/* ===============================
   PEERJS STATE
================================ */

let peer = null;

let isHost = false;

let hostPeerId = null;

const mediaConnections = new Map();

const dataConnections = new Map();

const participants = new Set();


/* ===============================
   ROOM ID
================================ */

function generateRoomId() {

    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let roomId = "MEETLY-";

    for (let i = 0; i < 6; i++) {

        roomId += characters.charAt(
            Math.floor(
                Math.random() * characters.length
            )
        );

    }

    return roomId;
}


function createRoomId() {

    currentRoomId =
        generateRoomId();

    return currentRoomId;
}


/* ===============================
   ROOM LINK
================================ */

function getRoomLink(roomId) {

    const url =
        new URL(window.location.href);

    url.search = "";

    url.searchParams.set(
        "room",
        roomId
    );

    return url.toString();
}


async function copyRoomLink(
    roomId = currentRoomId
) {

    if (!roomId) return;

    const link =
        getRoomLink(roomId);

    try {

        await navigator.clipboard.writeText(
            link
        );

        alert(
            "MEETLY room link copied! 🔗"
        );

    } catch (error) {

        prompt(
            "Copy this MEETLY room link:",
            link
        );

    }
}


async function shareRoom(
    roomId = currentRoomId
) {

    if (!roomId) return;

    const link =
        getRoomLink(roomId);

    if (navigator.share) {

        try {

            await navigator.share({

                title:
                    "Join my MEETLY meeting",

                text:
                    "Join my meeting on MEETLY!",

                url: link

            });

        } catch (error) {

            if (
                error.name !==
                "AbortError"
            ) {

                console.error(error);

            }

        }

    } else {

        await copyRoomLink(roomId);

    }
}


/* ===============================
   SECTIONS
================================ */

function hideAllSections() {

    if (homeSection) {
        homeSection.classList.add("hidden");
    }

    if (meetingsSection) {
        meetingsSection.classList.add("hidden");
    }

    if (callsSection) {
        callsSection.classList.add("hidden");
    }

    if (calendarSection) {
        calendarSection.classList.add("hidden");
    }

    if (profileSection) {
        profileSection.classList.add("hidden");
    }

    if (meetingRoom) {
        meetingRoom.classList.add("hidden");
    }

    if (friendsSection) {
        friendsSection.classList.add("hidden");
    }

}


function showHome() {

    cleanupPeerConnection();

    hideAllSections();

    if (homeSection) {
        homeSection.classList.remove("hidden");
    }

}


function showMeetings() {

    cleanupPeerConnection();

    hideAllSections();

    if (meetingsSection) {
        meetingsSection.classList.remove("hidden");
    }

    displayMeetings();

}


function showCalls() {

    cleanupPeerConnection();

    hideAllSections();

    if (callsSection) {
        callsSection.classList.remove("hidden");
    }

    displayCalls();

}


/* ===============================
   CALENDAR NAVIGATION
================================ */

function showCalendar() {

    cleanupPeerConnection();

    hideAllSections();

    if (calendarSection) {
        calendarSection.classList.remove("hidden");
    }

    renderCalendar();

}


function renderCalendar() {

    if (!calendarDays || !calendarMonth) {
        return;
    }


    const year =
        calendarDate.getFullYear();

    const month =
        calendarDate.getMonth();


    const monthName =
        calendarDate.toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );


    calendarMonth.textContent =
        monthName;


    calendarDays.innerHTML = "";


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const emptyDay =
            document.createElement("div");

        emptyDay.className =
            "calendar-day empty";

        calendarDays.appendChild(
            emptyDay
        );

    }


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dayElement =
            document.createElement("div");

        dayElement.className =
            "calendar-day";


        const dateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


        const today =
            new Date();


        const todayString =
            `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;


        if (
            dateString ===
            todayString
        ) {

            dayElement.classList.add(
                "today"
            );

        }


        if (
            dateString ===
            selectedCalendarDate
        ) {

            dayElement.classList.add(
                "selected"
            );

        }


        const dayMeetings =
            meetings.filter(
                function (meeting) {

                    return (
                        meeting.date ===
                        dateString
                    );

                }
            );


        if (
            dayMeetings.length > 0
        ) {

            dayElement.classList.add(
                "has-meeting"
            );

        }


        dayElement.innerHTML = `

            <div class="calendar-day-number">
                ${day}
            </div>

            ${
                dayMeetings.length > 0
                ? `
                    <div class="calendar-day-meeting-count">
                        📅 ${dayMeetings.length}
                        ${
                            dayMeetings.length === 1
                            ? "meeting"
                            : "meetings"
                        }
                    </div>
                `
                : ""
            }

        `;


        dayElement.addEventListener(
            "click",
            function () {

                selectedCalendarDate =
                    dateString;

                renderCalendar();

                showSelectedDateMeetings(
                    dateString
                );

            }
        );


        calendarDays.appendChild(
            dayElement
        );

    }

}


function showSelectedDateMeetings(
    dateString
) {

    if (!selectedDateMeetings) {
        return;
    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    const formattedDate =
        date.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );


    const dayMeetings =
        meetings.filter(
            function (meeting) {

                return (
                    meeting.date ===
                    dateString
                );

            }
        );


    selectedDateMeetings.innerHTML = `

        <h2>
            ${escapeHTML(formattedDate)}
        </h2>

        ${
            dayMeetings.length === 0
            ? `
                <p>
                    No meetings scheduled for this date.
                </p>
            `
            : ""
        }

    `;


    dayMeetings
        .sort(
            function (a, b) {

                return (
                    a.time || ""
                ).localeCompare(
                    b.time || ""
                );

            }
        )
        .forEach(
            function (meeting) {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "calendar-meeting-card";


                card.innerHTML = `

                    <h3>
                        📅 ${escapeHTML(
                            meeting.title
                        )}
                    </h3>

                    <p>
                        🕐 ${escapeHTML(
                            meeting.time
                        )}
                    </p>

                    ${
                        meeting.notes
                        ? `
                            <p>
                                📝 ${escapeHTML(
                                    meeting.notes
                                )}
                            </p>
                        `
                        : ""
                    }

                    <div class="card-buttons">

                        <button
                            class="start-button"
                            onclick="startMeetingById(${meeting.id})"
                        >
                            ▶ Start Meeting
                        </button>

                    </div>

                `;


                selectedDateMeetings.appendChild(
                    card
                );

            }
        );

}


function startMeetingById(
    meetingId
) {

    const index =
        meetings.findIndex(
            function (meeting) {

                return (
                    meeting.id ===
                    meetingId
                );

            }
        );


    if (index !== -1) {

        startMeeting(index);

    }

}


if (previousMonthButton) {

    previousMonthButton.addEventListener(
        "click",
        function () {

            calendarDate.setMonth(
                calendarDate.getMonth() - 1
            );

            renderCalendar();

        }
    );

}


if (nextMonthButton) {

    nextMonthButton.addEventListener(
        "click",
        function () {

            calendarDate.setMonth(
                calendarDate.getMonth() + 1
            );

            renderCalendar();

        }
    );

}


/* ===============================
   PROFILE
================================ */

function showProfile() {

    cleanupPeerConnection();

    hideAllSections();

    if (profileSection) {
        profileSection.classList.remove("hidden");
    }

    loadProfile();

}


/* ===============================
   FRIENDS
================================ */


/* ===============================
   FRIENDS
   Managed by meetly-friends.js
================================ */

function showFriends() {
    hideAllSections();

    if (friendsSection) {
        friendsSection.classList.remove("hidden");
    }

    displayFriends();
    displayFriendRequests();
}

if (friendsButton) {
    friendsButton.addEventListener("click", showFriends);
}

/* Display friends using the PeerJS friends system */
function displayFriends() {
    if (
        window.MeetlyFriends &&
        typeof window.MeetlyFriends.renderFriends === "function"
    ) {
        window.MeetlyFriends.renderFriends();
    }
}

/* Display actual incoming friend requests */
function displayFriendRequests() {
    if (
        window.MeetlyFriends &&
        typeof window.MeetlyFriends.renderRequests === "function"
    ) {
        window.MeetlyFriends.renderRequests();
        return;
    }

    if (friendRequestsList) {
        friendRequestsList.innerHTML = `
            <p class="card-info">
                Loading friend requests...
            </p>
        `;
    }
}

/*
   Compatibility wrapper for any older code that
   calls removeFriend with a Peer ID.
*/
function removeFriend(peerId) {
    if (
        typeof peerId === "string" &&
        window.MeetlyFriends &&
        typeof window.MeetlyFriends.removeFriend === "function"
    ) {
        window.MeetlyFriends.removeFriend(peerId);
    }
}


function removeFriend(index) {

    if (!friends[index]) {
        return;
    }


    const username =
        friends[index].username;


    const confirmed =
        confirm(
            `Remove ${username} from your friends?`
        );


    if (!confirmed) {
        return;
    }


    friends.splice(
        index,
        1
    );


    localStorage.setItem(
        "meetlyFriends",
        JSON.stringify(friends)
    );


    displayFriends();


    createNotification(
        "👥 Friend Removed",
        `${username} was removed from your MEETLY friends.`
    );

}


function loadProfile() {

    const savedProfile =
        JSON.parse(
            localStorage.getItem(
                "meetlyProfile"
            )
        ) || {};


    if (profileName) {

        profileName.value =
            savedProfile.name || "";

    }


    if (profileEmail) {

        profileEmail.value =
            savedProfile.email || "";

    }


    if (profilePicture) {

        profilePicture.src =
            savedProfile.picture ||
            "https://via.placeholder.com/150?text=Profile";

    }

}


function saveProfile() {

    const profile = {

        name:
            profileName
                ? profileName.value.trim()
                : "",

        email:
            profileEmail
                ? profileEmail.value.trim()
                : "",

        picture:
            profilePicture
                ? profilePicture.src
                : ""

    };


    localStorage.setItem(
        "meetlyProfile",
        JSON.stringify(profile)
    );


    createNotification(
        "👤 Profile Updated",
        "Your MEETLY profile was updated successfully."
    );


    alert(
        "Profile saved successfully! ✅"
    );

}


if (saveProfileButton) {

    saveProfileButton.addEventListener(
        "click",
        saveProfile
    );

}


if (profilePictureInput) {

    profilePictureInput.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];

            if (!file) {
                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    if (profilePicture) {

                        profilePicture.src =
                            event.target.result;

                    }

                };


            reader.readAsDataURL(file);

        }
    );

}


/* ===============================
   CREATE MEETING MODAL
================================ */

function openMeetingModal() {

    if (meetingModal) {
        meetingModal.classList.remove("hidden");
    }

}


function closeMeetingModal() {

    if (meetingModal) {
        meetingModal.classList.add("hidden");
    }

}


if (createMeetingButton) {

    createMeetingButton.addEventListener(
        "click",
        openMeetingModal
    );

}


if (closeMeetingModalButton) {

    closeMeetingModalButton.addEventListener(
        "click",
        closeMeetingModal
    );

}


/* ===============================
   CREATE MEETING
================================ */

if (meetingForm) {

    meetingForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const roomId =
                createRoomId();

            const meeting = {

                id: Date.now(),

                roomId: roomId,

                title:
                    meetingTitle
                        ? meetingTitle.value
                        : "",

                date:
                    meetingDate
                        ? meetingDate.value
                        : "",

                time:
                    meetingTime
                        ? meetingTime.value
                        : "",

                notes:
                    meetingNotes
                        ? meetingNotes.value
                        : ""

            };


            meetings.push(meeting);


            localStorage.setItem(
                "meetlyMeetings",
                JSON.stringify(meetings)
            );


            meetingForm.reset();


            if (meetingModal) {
                meetingModal.classList.add("hidden");
            }


            displayMeetings();

            renderCalendar();


            /* NOTIFICATION */

            createNotification(
                "📅 Meeting Created",
                `${meeting.title || "New meeting"} was created for ${formatDate(meeting.date)} at ${meeting.time || "the selected time"}.`
            );


            alert(
                `Meeting created! 🎉\n\nRoom ID: ${roomId}`
            );

        }
    );

}


/* ===============================
   DISPLAY MEETINGS
================================ */

function displayMeetings() {

    if (!meetingsList) return;

    meetingsList.innerHTML = "";


    if (meetings.length === 0) {

        meetingsList.innerHTML = `
            <p class="card-info">
                You don't have any meetings yet.
            </p>
        `;

        return;
    }


    meetings.forEach(
        function (meeting, index) {

            const card =
                document.createElement("div");


            card.className =
                "meeting-card";


            card.innerHTML = `

                <h3>
                    ${escapeHTML(
                        meeting.title
                    )}
                </h3>

                <p class="card-info">
                    📅 ${formatDate(
                        meeting.date
                    )}
                </p>

                <p class="card-info">
                    🕐 ${escapeHTML(
                        meeting.time
                    )}
                </p>

                ${
                    meeting.notes
                    ? `
                        <p class="card-info">
                            📝 ${escapeHTML(
                                meeting.notes
                            )}
                        </p>
                    `
                    : ""
                }

                <div class="room-id">
                    🆔 ${
                        escapeHTML(
                            meeting.roomId ||
                            "No Room ID"
                        )
                    }
                </div>

                <div class="card-buttons">

                    <button
                        class="start-button"
                        onclick="startMeeting(${index})"
                    >
                        ▶ Start Meeting
                    </button>

                    <button
                        class="share-button"
                        onclick="shareRoom('${meeting.roomId}')"
                    >
                        📤 Share
                    </button>

                    <button
                        class="share-button"
                        onclick="copyRoomLink('${meeting.roomId}')"
                    >
                        📋 Copy Link
                    </button>

                    <button
                        class="delete-button"
                        onclick="deleteMeeting(${index})"
                    >
                        🗑️ Delete
                    </button>

                </div>

            `;


            meetingsList.appendChild(card);

        }
    );

}


/* ===============================
   START MEETING
================================ */

async function startMeeting(index) {

    const meeting =
        meetings[index];

    if (!meeting) return;


    if (!meeting.roomId) {

        meeting.roomId =
            generateRoomId();

        localStorage.setItem(
            "meetlyMeetings",
            JSON.stringify(meetings)
        );

    }


    currentMeetingIndex =
        index;

    currentRoomId =
        meeting.roomId;


    hideAllSections();

    if (meetingRoom) {
        meetingRoom.classList.remove("hidden");
    }


    if (activeMeetingTitle) {
        activeMeetingTitle.textContent =
            meeting.title;
    }

    if (activeRoomId) {
        activeRoomId.textContent =
            meeting.roomId;
    }

    if (meetingStatus) {
        meetingStatus.textContent =
            "🟡 Starting camera...";
    }


    createNotification(
        "📹 Meeting Started",
        `You started "${meeting.title || "a MEETLY meeting"}".`
    );


    try {

        await startLocalMedia();

        await createHostPeer(
            meeting.roomId
        );

    } catch (error) {

        console.error(error);

        if (meetingStatus) {
            meetingStatus.textContent =
                "🔴 Could not start meeting";
        }

        createNotification(
            "🔴 Meeting Error",
            "MEETLY could not start your camera or microphone."
        );

        alert(
            "MEETLY needs permission to use your camera and microphone."
        );

    }

}


/* ===============================
   JOIN ROOM FROM LINK
================================ */

async function checkForRoomLink() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const roomId =
        params.get("room");

    if (!roomId) return;


    currentRoomId =
        roomId;


    const meetingIndex =
        meetings.findIndex(
            function (meeting) {

                return (
                    meeting.roomId ===
                    roomId
                );

            }
        );


    hideAllSections();

    if (meetingRoom) {
        meetingRoom.classList.remove("hidden");
    }


    if (meetingIndex !== -1) {

        currentMeetingIndex =
            meetingIndex;

        if (activeMeetingTitle) {
            activeMeetingTitle.textContent =
                meetings[meetingIndex].title;
        }

    } else {

        if (activeMeetingTitle) {
            activeMeetingTitle.textContent =
                "MEETLY Room";
        }

    }


    if (activeRoomId) {
        activeRoomId.textContent =
            roomId;
    }


    if (meetingStatus) {
        meetingStatus.textContent =
            "🟡 Joining room...";
    }


    createNotification(
        "🚪 Joining Meeting",
        `You are joining MEETLY room ${roomId}.`
    );


    try {

        await startLocalMedia();

        await joinRoom(roomId);

    } catch (error) {

        console.error(error);

        if (meetingStatus) {
            meetingStatus.textContent =
                "🔴 Could not join meeting";
        }

        createNotification(
            "🔴 Join Failed",
            `MEETLY could not join room ${roomId}.`
        );

        alert(
            "MEETLY could not access your camera or microphone."
        );

    }

}


/* ===============================
   LOCAL MEDIA
================================ */

async function startLocalMedia() {

    if (currentStream) {
        return currentStream;
    }


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        throw new Error(
            "Camera and microphone are not available."
        );

    }


    currentStream =
        await navigator.mediaDevices.getUserMedia({

            video: true,

            audio: true

        });


    if (localVideo) {
        localVideo.srcObject =
            currentStream;
    }


    microphoneEnabled = true;

    cameraEnabled = true;


    if (micButton) {
        micButton.textContent =
            "🎤 Mic";
    }

    if (cameraButton) {
        cameraButton.textContent =
            "📹 Camera";
    }


    return currentStream;

}


/* ===============================
   CREATE HOST PEER
================================ */

function createHostPeer(roomId) {

    return new Promise(
        function (resolve, reject) {

            isHost = true;

            hostPeerId = roomId;


            peer =
                new Peer(roomId);


            peer.on(
                "open",
                function (id) {

                    console.log(
                        "Host Peer ID:",
                        id
                    );


                    if (meetingStatus) {
                        meetingStatus.textContent =
                            "🟢 Meeting ready — share the link";
                    }


                    createNotification(
                        "🟢 Meeting Ready",
                        "Your MEETLY meeting is ready. Share the room link with others."
                    );


                    resolve(id);

                }
            );


            peer.on(
                "connection",
                function (connection) {

                    handleDataConnection(
                        connection
                    );

                }
            );


            peer.on(
                "call",
                function (call) {

                    /* REAL INCOMING CALL NOTIFICATION */

                    createNotification(
                        "📞 Incoming Call",
                        "Someone is calling you through your MEETLY meeting."
                    );


                    answerIncomingCall(
                        call
                    );

                }
            );


            peer.on(
                "error",
                function (error) {

                    console.error(
                        "PeerJS error:",
                        error
                    );


                    if (meetingStatus) {

                        if (
                            error.type ===
                            "unavailable-id"
                        ) {

                            meetingStatus.textContent =
                                "🔴 Room is already active";

                        } else {

                            meetingStatus.textContent =
                                "🔴 Connection error";

                        }

                    }


                    createNotification(
                        "🔴 MEETLY Connection Error",
                        error.message || "A PeerJS connection error occurred."
                    );


                    reject(error);

                }
            );


            peer.on(
                "disconnected",
                function () {

                    if (meetingStatus) {
                        meetingStatus.textContent =
                            "🟠 Connection to server lost";
                    }


                    createNotification(
                        "🟠 Connection Lost",
                        "Your connection to the MEETLY server was lost."
                    );

                }
            );

        }
    );

}


/* ===============================
   JOIN ROOM
================================ */

function joinRoom(roomId) {

    return new Promise(
        function (resolve, reject) {

            isHost = false;

            hostPeerId =
                roomId;


            peer =
                new Peer();


            peer.on(
                "open",
                function (id) {

                    console.log(
                        "Guest Peer ID:",
                        id
                    );


                    participants.add(
                        id
                    );


                    const connection =
                        peer.connect(
                            hostPeerId,
                            {
                                reliable: true,

                                metadata: {
                                    peerId: id
                                }
                            }
                        );


                    handleDataConnection(
                        connection
                    );


                    connection.on(
                        "open",
                        function () {

                            connection.send({

                                type:
                                    "join",

                                peerId:
                                    id

                            });


                            if (meetingStatus) {
                                meetingStatus.textContent =
                                    "🟢 Connected to room";
                            }


                            createNotification(
                                "🟢 Connected",
                                `You successfully connected to MEETLY room ${roomId}.`
                            );


                            resolve(id);

                        }
                    );

                }
            );


            peer.on(
                "call",
                function (call) {

                    /* REAL INCOMING CALL NOTIFICATION */

                    createNotification(
                        "📞 Incoming Call",
                        "Someone is calling you through your MEETLY meeting."
                    );


                    answerIncomingCall(
                        call
                    );

                }
            );


            peer.on(
                "error",
                function (error) {

                    console.error(
                        "PeerJS error:",
                        error
                    );


                    if (meetingStatus) {
                        meetingStatus.textContent =
                            "🔴 Could not join room";
                    }


                    createNotification(
                        "🔴 Could Not Join",
                        error.message || "MEETLY could not join the room."
                    );


                    reject(error);

                }
            );

        }
    );

}


/* ===============================
   DATA CONNECTION
================================ */

function handleDataConnection(
    connection
) {

    if (!connection) return;


    dataConnections.set(
        connection.peer,
        connection
    );


    connection.on(
        "open",
        function () {

            console.log(
                "Data connection:",
                connection.peer
            );

        }
    );


    connection.on(
        "data",
        function (message) {

            handleRoomMessage(
                connection,
                message
            );

        }
    );


    connection.on(
        "close",
        function () {

            dataConnections.delete(
                connection.peer
            );

            removeRemoteVideo(
                connection.peer
            );


            createNotification(
                "👋 Participant Left",
                "A participant left the MEETLY meeting."
            );

        }
    );


    connection.on(
        "error",
        function (error) {

            console.error(
                "Data connection error:",
                error
            );


            createNotification(
                "🔴 Data Connection Error",
                "A MEETLY participant connection encountered an error."
            );

        }
    );

}


/* ===============================
   ROOM MESSAGES
================================ */

function handleRoomMessage(
    connection,
    message
) {

    if (!message || !message.type) {
        return;
    }


    if (
        message.type ===
        "join"
    ) {

        if (!isHost) return;


        const newPeerId =
            message.peerId;


        if (!newPeerId) return;


        participants.add(
            newPeerId
        );


        const participantList =
            Array.from(
                participants
            );


        connection.send({

            type:
                "participants",

            peers:
                participantList

        });


        broadcastMessage(
            {
                type:
                    "new-participant",

                peerId:
                    newPeerId
            },
            newPeerId
        );


        callPeer(
            newPeerId
        );


        createNotification(
            "👤 Participant Joined",
            "Someone joined your MEETLY meeting."
        );


        updateMeetingStatus();

    }


    else if (
        message.type ===
        "participants"
    ) {

        const peers =
            message.peers || [];


        peers.forEach(
            function (peerId) {

                if (
                    peerId !==
                    peer.id
                ) {

                    participants.add(
                        peerId
                    );

                }

            }
        );


        peers.forEach(
            function (peerId) {

                if (
                    peerId !==
                    peer.id &&
                    peerId !==
                    hostPeerId
                ) {

                    callPeer(
                        peerId
                    );

                }

            }
        );


        updateMeetingStatus();

    }


    else if (
        message.type ===
        "new-participant"
    ) {

        const newPeerId =
            message.peerId;


        if (
            newPeerId &&
            newPeerId !== peer.id
        ) {

            participants.add(
                newPeerId
            );


            callPeer(
                newPeerId
            );


            createNotification(
                "👤 New Participant",
                "A new participant joined the MEETLY meeting."
            );

        }

    }

}


/* ===============================
   BROADCAST
================================ */

function broadcastMessage(
    message,
    excludePeerId = null
) {

    dataConnections.forEach(
        function (connection) {

            if (
                connection.open &&
                connection.peer !==
                excludePeerId
            ) {

                connection.send(
                    message
                );

            }

        }
    );

}


/* ===============================
   CALL PEER
================================ */

function callPeer(
    remotePeerId
) {

    if (!peer) return;


    if (
        !remotePeerId ||
        remotePeerId === peer.id
    ) {

        return;

    }


    if (
        mediaConnections.has(
            remotePeerId
        )
    ) {

        return;

    }


    if (!currentStream) return;


    console.log(
        "Calling:",
        remotePeerId
    );


    /* NOTIFICATION */

    createNotification(
        "📞 Calling Participant",
        "MEETLY is connecting you to another participant."
    );


    const call =
        peer.call(
            remotePeerId,
            currentStream,
            {
                metadata: {
                    roomId:
                        currentRoomId
                }
            }
        );


    setupMediaConnection(
        call
    );

}


/* ===============================
   ANSWER CALL
================================ */

function answerIncomingCall(
    call
) {

    if (!currentStream) return;


    console.log(
        "Incoming call from:",
        call.peer
    );


    createNotification(
        "📞 Call Answered",
        "MEETLY answered an incoming participant call."
    );


    call.answer(
        currentStream
    );


    setupMediaConnection(
        call
    );

}


/* ===============================
   MEDIA CONNECTION
================================ */

function setupMediaConnection(
    call
) {

    if (!call) return;


    mediaConnections.set(
        call.peer,
        call
    );


    participants.add(
        call.peer
    );


    call.on(
        "stream",
        function (remoteStream) {

            addRemoteVideo(
                call.peer,
                remoteStream
            );


            createNotification(
                "🟢 Participant Connected",
                "A participant's camera and microphone are now connected."
            );


            updateMeetingStatus();

        }
    );


    call.on(
        "close",
        function () {

            mediaConnections.delete(
                call.peer
            );


            removeRemoteVideo(
                call.peer
            );


            participants.delete(
                call.peer
            );


            updateMeetingStatus();

        }
    );


    call.on(
        "error",
        function (error) {

            console.error(
                "Media connection error:",
                error
            );


            createNotification(
                "🔴 Call Error",
                "A participant media connection encountered an error."
            );

        }
    );

}


/* ===============================
   REMOTE VIDEO
================================ */

function addRemoteVideo(
    peerId,
    stream
) {

    if (!videoGrid) return;


    let card =
        document.getElementById(
            `remote-${peerId}`
        );


    if (!card) {

        card =
            document.createElement(
                "div"
            );


        card.className =
            "video-card remote-video-card";


        card.id =
            `remote-${peerId}`;


        const video =
            document.createElement(
                "video"
            );


        video.id =
            `video-${peerId}`;


        video.autoplay = true;

        video.playsInline = true;


        const label =
            document.createElement(
                "span"
            );


        label.className =
            "video-label";


        label.textContent =
            "Participant";


        card.appendChild(
            video
        );


        card.appendChild(
            label
        );


        videoGrid.appendChild(
            card
        );

    }


    const video =
        document.getElementById(
            `video-${peerId}`
        );


    if (video) {

        video.srcObject =
            stream;

    }

}


/* ===============================
   REMOVE REMOTE VIDEO
================================ */

function removeRemoteVideo(
    peerId
) {

    const card =
        document.getElementById(
            `remote-${peerId}`
        );


    if (card) {

        card.remove();

    }

}


/* ===============================
   STATUS
================================ */

function updateMeetingStatus() {

    if (!meetingStatus) return;


    const count =
        mediaConnections.size;


    if (count === 0) {

        if (isHost) {

            meetingStatus.textContent =
                "🟢 Meeting ready — waiting for participants";

        } else {

            meetingStatus.textContent =
                "🟢 Joined — waiting for participants";

        }

        return;
    }


    meetingStatus.textContent =
        `🟢 Connected with ${count} participant${count === 1 ? "" : "s"}`;

}


/* ===============================
   MICROPHONE
================================ */

if (micButton) {

    micButton.addEventListener(
        "click",
        function () {

            if (!currentStream) return;


            const tracks =
                currentStream.getAudioTracks();


            if (tracks.length === 0) {
                return;
            }


            microphoneEnabled =
                !microphoneEnabled;


            tracks.forEach(
                function (track) {

                    track.enabled =
                        microphoneEnabled;

                }
            );


            micButton.textContent =
                microphoneEnabled
                ? "🎤 Mic"
                : "🔇 Muted";


            createNotification(
                microphoneEnabled
                    ? "🎤 Microphone On"
                    : "🔇 Microphone Muted",
                microphoneEnabled
                    ? "Your microphone is now on."
                    : "Your microphone is now muted."
            );

        }
    );

}


/* ===============================
   CAMERA
================================ */

if (cameraButton) {

    cameraButton.addEventListener(
        "click",
        function () {

            if (!currentStream) return;


            const tracks =
                currentStream.getVideoTracks();


            if (tracks.length === 0) {
                return;
            }


            cameraEnabled =
                !cameraEnabled;


            tracks.forEach(
                function (track) {

                    track.enabled =
                        cameraEnabled;

                }
            );


            cameraButton.textContent =
                cameraEnabled
                ? "📹 Camera"
                : "🚫 Camera Off";


            createNotification(
                cameraEnabled
                    ? "📹 Camera On"
                    : "🚫 Camera Off",
                cameraEnabled
                    ? "Your camera is now on."
                    : "Your camera is now off."
            );

        }
    );

}


/* ===============================
   SCREEN SHARING
================================ */

if (screenButton) {

    screenButton.addEventListener(
        "click",
        async function () {

            if (!currentStream) {
                return;
            }


            if (screenStream) {

                stopScreenSharing();

                return;

            }


            try {

                screenStream =
                    await navigator.mediaDevices
                        .getDisplayMedia({

                            video: true,

                            audio: false

                        });


                const screenTrack =
                    screenStream
                        .getVideoTracks()[0];


                mediaConnections.forEach(
                    function (call) {

                        if (
                            !call.peerConnection
                        ) {

                            return;

                        }


                        const senders =
                            call.peerConnection
                                .getSenders();


                        const videoSender =
                            senders.find(
                                function (sender) {

                                    return (
                                        sender.track &&
                                        sender.track.kind ===
                                        "video"
                                    );

                                }
                            );


                        if (videoSender) {

                            videoSender.replaceTrack(
                                screenTrack
                            );

                        }

                    }
                );


                if (localVideo) {
                    localVideo.srcObject =
                        screenStream;
                }


                screenButton.textContent =
                    "🛑 Stop Sharing";


                createNotification(
                    "🖥️ Screen Sharing",
                    "You started sharing your screen."
                );


                screenTrack.onended =
                    function () {

                        stopScreenSharing();

                    };


            } catch (error) {

                console.error(
                    "Screen sharing error:",
                    error
                );


                createNotification(
                    "🔴 Screen Share Failed",
                    "MEETLY could not start screen sharing."
                );

            }

        }
    );

}


/* ===============================
   STOP SCREEN SHARING
================================ */

async function stopScreenSharing() {

    if (!screenStream) {
        return;
    }


    screenStream
        .getTracks()
        .forEach(
            function (track) {

                track.stop();

            }
        );


    screenStream = null;


    const cameraTrack =
        currentStream &&
        currentStream.getVideoTracks()[0];


    if (cameraTrack) {

        mediaConnections.forEach(
            function (call) {

                if (
                    !call.peerConnection
                ) {

                    return;

                }


                const senders =
                    call.peerConnection
                        .getSenders();


                const videoSender =
                    senders.find(
                        function (sender) {

                            return (
                                sender.track &&
                                sender.track.kind ===
                                "video"
                            );

                        }
                    );


                if (videoSender) {

                    videoSender.replaceTrack(
                        cameraTrack
                    );

                }

            }
        );


        if (localVideo) {
            localVideo.srcObject =
                currentStream;
        }

    }


    if (screenButton) {
        screenButton.textContent =
            "🖥️ Share Screen";
    }


    createNotification(
        "🖥️ Screen Sharing Stopped",
        "You stopped sharing your screen."
    );

}


/* ===============================
   CLEANUP PEER CONNECTION
================================ */

function cleanupPeerConnection() {

    stopScreenSharing();


    mediaConnections.forEach(
        function (call) {

            try {

                call.close();

            } catch (error) {

                console.error(error);

            }

        }
    );


    mediaConnections.clear();


    dataConnections.forEach(
        function (connection) {

            try {

                connection.close();

            } catch (error) {

                console.error(error);

            }

        }
    );


    dataConnections.clear();


    participants.clear();


    if (peer) {

        try {

            peer.destroy();

        } catch (error) {

            console.error(error);

        }

    }


    peer = null;

    isHost = false;

    hostPeerId = null;


    stopCurrentStream();

}


/* ===============================
   STOP LOCAL STREAM
================================ */

function stopCurrentStream() {

    if (!currentStream) {

        if (localVideo) {
            localVideo.srcObject = null;
        }

        return;

    }


    currentStream
        .getTracks()
        .forEach(
            function (track) {

                track.stop();

            }
        );


    currentStream = null;


    if (localVideo) {
        localVideo.srcObject = null;
    }


    microphoneEnabled =
        true;

    cameraEnabled =
        true;

}


/* ===============================
   LEAVE MEETING
================================ */

if (leaveMeetingButton) {

    leaveMeetingButton.addEventListener(
        "click",
        function () {

            createNotification(
                "🚪 Left Meeting",
                "You left the MEETLY meeting."
            );


            cleanupPeerConnection();

            currentRoomId =
                null;

            currentMeetingIndex =
                null;


            const url =
                new URL(
                    window.location.href
                );

            url.search = "";


            window.history.replaceState(
                {},
                document.title,
                url.toString()
            );


            showMeetings();

        }
    );

}


/* ===============================
   END MEETING
================================ */

if (endMeetingButton) {

    endMeetingButton.addEventListener(
        "click",
        function () {

            createNotification(
                "🛑 Meeting Ended",
                "You ended the MEETLY meeting."
            );


            cleanupPeerConnection();

            currentRoomId =
                null;

            currentMeetingIndex =
                null;


            const url =
                new URL(
                    window.location.href
                );

            url.search = "";


            window.history.replaceState(
                {},
                document.title,
                url.toString()
            );


            showMeetings();

        }
    );

}


/* ===============================
   COPY / SHARE
================================ */

if (copyRoomButton) {

    copyRoomButton.addEventListener(
        "click",
        function () {

            copyRoomLink();

        }
    );

}


if (shareRoomButton) {

    shareRoomButton.addEventListener(
        "click",
        function () {

            shareRoom();

        }
    );

}


/* ===============================
   DELETE MEETING
================================ */

function deleteMeeting(index) {

    if (
        !confirm(
            "Delete this meeting?"
        )
    ) {

        return;

    }


    const deletedMeeting =
        meetings[index];


    meetings.splice(
        index,
        1
    );


    localStorage.setItem(
        "meetlyMeetings",
        JSON.stringify(meetings)
    );


    displayMeetings();

    renderCalendar();


    createNotification(
        "🗑️ Meeting Deleted",
        `${deletedMeeting?.title || "Meeting"} was deleted.`
    );

}


/* ===============================
   CALLS
================================ */

function openCallModal() {

    if (callModal) {
        callModal.classList.remove("hidden");
    }

}


function closeCallModal() {

    if (callModal) {
        callModal.classList.add("hidden");
    }

}


if (manageCallsButton) {

    manageCallsButton.addEventListener(
        "click",
        showCalls
    );

}


if (addCallButton) {

    addCallButton.addEventListener(
        "click",
        openCallModal
    );

}


if (closeCallModalButton) {

    closeCallModalButton.addEventListener(
        "click",
        closeCallModal
    );

}


if (callForm) {

    callForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const call = {

                id: Date.now(),

                person:
                    callPerson
                        ? callPerson.value
                        : "",

                date:
                    callDate
                        ? callDate.value
                        : "",

                time:
                    callTime
                        ? callTime.value
                        : "",

                type:
                    callType
                        ? callType.value
                        : "",

                notes:
                    callNotes
                        ? callNotes.value
                        : ""

            };


            calls.push(call);


            localStorage.setItem(
                "meetlyCalls",
                JSON.stringify(calls)
            );


            callForm.reset();


            if (callModal) {
                callModal.classList.add("hidden");
            }


            displayCalls();


            createNotification(
                "📞 Call Scheduled",
                `A ${call.type || "call"} with ${call.person || "someone"} was scheduled for ${formatDate(call.date)} at ${call.time || "the selected time"}.`
            );

        }
    );

}


/* ===============================
   DISPLAY CALLS
================================ */

function displayCalls() {

    if (!callsList) return;

    callsList.innerHTML = "";


    if (calls.length === 0) {

        callsList.innerHTML = `
            <p class="card-info">
                You don't have any calls yet.
            </p>
        `;

        return;
    }


    calls.forEach(
        function (call, index) {

            const card =
                document.createElement("div");


            card.className =
                "call-card";


            card.innerHTML = `

                <h3>
                    📞 ${escapeHTML(
                        call.person
                    )}
                </h3>

                <p class="card-info">
                    📅 ${formatDate(
                        call.date
                    )}
                </p>

                <p class="card-info">
                    🕐 ${escapeHTML(
                        call.time
                    )}
                </p>

                <p class="card-info">
                    📞 ${escapeHTML(
                        call.type
                    )}
                </p>

                ${
                    call.notes
                    ? `
                        <p class="card-info">
                            📝 ${escapeHTML(
                                call.notes
                            )}
                        </p>
                    `
                    : ""
                }

                <div class="card-buttons">

                    <button
                        class="start-button"
                        onclick="startCall(${index})"
                    >
                        📞 Start Call
                    </button>

                    <button
                        class="delete-button"
                        onclick="deleteCall(${index})"
                    >
                        🗑️ Delete
                    </button>

                </div>

            `;


            callsList.appendChild(
                card
            );

        }
    );

}


/* ===============================
   START CALL
================================ */

function startCall(index) {

    const call =
        calls[index];

    if (!call) return;


    createNotification(
        "📞 Call Started",
        `You started the saved ${call.type || "call"} with ${call.person || "someone"}.`
    );


    alert(
        `The saved ${call.type} is ready.\n\nFor a real person-to-person call, use a MEETLY meeting room link.`
    );

}


/* ===============================
   DELETE CALL
================================ */

function deleteCall(index) {

    if (
        !confirm(
            "Delete this call?"
        )
    ) {

        return;

    }


    const deletedCall =
        calls[index];


    calls.splice(
        index,
        1
    );


    localStorage.setItem(
        "meetlyCalls",
        JSON.stringify(calls)
    );


    displayCalls();


    createNotification(
        "🗑️ Call Deleted",
        `${deletedCall?.type || "Call"} with ${deletedCall?.person || "someone"} was deleted.`
    );

}


/* ===============================
   NAVIGATION
================================ */

if (viewMeetingsButton) {

    viewMeetingsButton.addEventListener(
        "click",
        showMeetings
    );

}


if (backHomeButton) {

    backHomeButton.addEventListener(
        "click",
        showHome
    );

}


if (backCallsButton) {

    backCallsButton.addEventListener(
        "click",
        showHome
    );

}


if (homeNavButton) {

    homeNavButton.addEventListener(
        "click",
        showHome
    );

}


if (meetingsNavButton) {

    meetingsNavButton.addEventListener(
        "click",
        showMeetings
    );

}


if (callsNavButton) {

    callsNavButton.addEventListener(
        "click",
        showCalls
    );

}


if (profileNavButton) {

    profileNavButton.addEventListener(
        "click",
        showProfile
    );

}


/* ===============================
   THEME
================================ */

const themeButton =
    getElement("themeButton");


const savedTheme =
    localStorage.getItem(
        "meetlyTheme"
    );


if (
    savedTheme ===
    "light"
) {

    document.body.classList.add(
        "light-mode"
    );


    if (themeButton) {
        themeButton.textContent =
            "☀️";
    }

}


if (themeButton) {

    themeButton.addEventListener(
        "click",
        function () {

            document.body.classList.toggle(
                "light-mode"
            );


            const lightMode =
                document.body.classList.contains(
                    "light-mode"
                );


            localStorage.setItem(
                "meetlyTheme",
                lightMode
                    ? "light"
                    : "dark"
            );


            themeButton.textContent =
                lightMode
                    ? "☀️"
                    : "🌙";


            createNotification(
                lightMode
                    ? "☀️ Light Mode"
                    : "🌙 Dark Mode",
                `MEETLY switched to ${lightMode ? "light" : "dark"} mode.`
            );

        }
    );

}


/* ===============================
   SIGN OUT
================================ */

const signOutButton =
    getElement("signOutButton");


if (signOutButton) {

    signOutButton.addEventListener(
        "click",
        function () {

            createNotification(
                "👋 Signed Out",
                "You signed out of MEETLY."
            );


            cleanupPeerConnection();

            window.location.href =
                "index.html";

        }
    );

}


/* ===============================
   DATE
================================ */

function formatDate(
    dateString
) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


/* ===============================
   SECURITY
================================ */

function escapeHTML(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* ===============================
   CLOSE MODALS
================================ */

window.addEventListener(
    "click",
    function (event) {

        if (
            meetingModal &&
            event.target ===
            meetingModal
        ) {

            meetingModal.classList.add(
                "hidden"
            );

        }


        if (
            callModal &&
            event.target ===
            callModal
        ) {

            callModal.classList.add(
                "hidden"
            );

        }

    }
);


/* ===============================
   NOTIFICATION SYSTEM
================================ */

function saveNotifications() {

    localStorage.setItem(
        "meetlyNotifications",
        JSON.stringify(notifications)
    );

}


/* ===============================
   BROWSER NOTIFICATION PERMISSION
================================ */

async function requestNotificationPermission() {

    if (
        !("Notification" in window)
    ) {

        return;

    }


    if (
        Notification.permission ===
        "default"
    ) {

        try {

            await Notification.requestPermission();

        } catch (error) {

            console.error(
                "Notification permission error:",
                error
            );

        }

    }

}


/* ===============================
   BROWSER NOTIFICATION
================================ */

function showBrowserNotification(
    title,
    message
) {

    if (
        !("Notification" in window)
    ) {

        return;

    }


    if (
        Notification.permission !==
        "granted"
    ) {

        return;

    }


    try {

        new Notification(
            `MEETLY — ${title}`,
            {
                body:
                    message,

                icon:
                    "favicon.ico"
            }
        );

    } catch (error) {

        console.error(
            "Browser notification error:",
            error
        );

    }

}


/* ===============================
   CREATE NOTIFICATION
================================ */

function createNotification(
    title,
    message,
    options = {}
) {

    const notification = {

        id:
            Date.now() +
            Math.floor(
                Math.random() * 1000
            ),

        title:
            title,

        message:
            message,

        read:
            false,

        createdAt:
            new Date().toISOString()

    };


    notifications.unshift(
        notification
    );


    /* Keep the notification list
       from becoming huge */

    if (
        notifications.length >
        100
    ) {

        notifications =
            notifications.slice(
                0,
                100
            );

    }


    saveNotifications();

    renderNotifications();


    /* Browser notification */

    if (
        options.browser !== false
    ) {

        showBrowserNotification(
            title,
            message
        );

    }

}


/* ===============================
   RENDER NOTIFICATIONS
================================ */

function renderNotifications() {

    const notificationsList =
        document.getElementById(
            "notificationsList"
        );


    const notificationBadge =
        document.getElementById(
            "notificationBadge"
        );


    if (
        !notificationsList ||
        !notificationBadge
    ) {

        return;

    }


    if (
        notifications.length ===
        0
    ) {

        notificationsList.innerHTML = `
            <p class="empty-notifications">
                No notifications yet.
            </p>
        `;


        notificationBadge.classList.add(
            "hidden"
        );


        return;

    }


    const unreadCount =
        notifications.filter(
            function (notification) {

                return !notification.read;

            }
        ).length;


    if (
        unreadCount > 0
    ) {

        notificationBadge.textContent =
            unreadCount > 99
                ? "99+"
                : unreadCount;


        notificationBadge.classList.remove(
            "hidden"
        );

    } else {

        notificationBadge.classList.add(
            "hidden"
        );

    }


    notificationsList.innerHTML =
        notifications.map(
            function (notification) {

                const date =
                    new Date(
                        notification.createdAt
                    );


                return `
                    <div
                        class="notification-item ${
                            notification.read
                                ? ""
                                : "unread"
                        }"
                        onclick="markNotificationRead(${notification.id})"
                    >

                        <p class="notification-title">
                            ${escapeHTML(
                                notification.title
                            )}
                        </p>

                        <p class="notification-message">
                            ${escapeHTML(
                                notification.message
                            )}
                        </p>

                        <span class="notification-time">
                            ${date.toLocaleString()}
                        </span>

                    </div>
                `;

            }
        ).join("");

}


/* ===============================
   MARK ONE READ
================================ */

function markNotificationRead(id) {

    const notification =
        notifications.find(
            function (notification) {

                return (
                    notification.id ===
                    id
                );

            }
        );


    if (!notification) {
        return;
    }


    notification.read =
        true;


    saveNotifications();

    renderNotifications();

}


/* ===============================
   MARK ALL READ
================================ */

function markAllNotificationsRead() {

    notifications.forEach(
        function (notification) {

            notification.read =
                true;

        }
    );


    saveNotifications();

    renderNotifications();

}


/* ===============================
   CLEAR NOTIFICATIONS
================================ */

function clearNotifications() {

    if (
        notifications.length ===
        0
    ) {

        return;

    }


    const confirmed =
        confirm(
            "Clear all MEETLY notifications?"
        );


    if (!confirmed) {
        return;
    }


    notifications = [];

    saveNotifications();

    renderNotifications();

}


/* ===============================
   TOGGLE NOTIFICATION PANEL
================================ */

function toggleNotificationPanel() {

    const panel =
        document.getElementById(
            "notificationPanel"
        );


    if (!panel) {
        return;
    }


    panel.classList.toggle(
        "hidden"
    );


    /* Opening the panel marks
       notifications as read */

    if (
        !panel.classList.contains(
            "hidden"
        )
    ) {

        /*
         * We do NOT automatically mark
         * them as read here.
         *
         * The user can click individual
         * notifications or "Mark all read".
         */

        renderNotifications();

    }

}


/* ===============================
   NOTIFICATION BUTTONS
================================ */

const notificationButton =
    getElement("notificationButton");

const markAllReadButton =
    getElement("markAllReadButton");

const clearNotificationsButton =
    getElement("clearNotificationsButton");


if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        function () {

            requestNotificationPermission();

            toggleNotificationPanel();

        }
    );

}


if (markAllReadButton) {

    markAllReadButton.addEventListener(
        "click",
        function () {

            markAllNotificationsRead();

        }
    );

}


if (clearNotificationsButton) {

    clearNotificationsButton.addEventListener(
        "click",
        function () {

            clearNotifications();

        }
    );

}


/* ===============================
   REQUEST BROWSER PERMISSION
   AFTER USER INTERACTION
================================ */

document.addEventListener(
    "click",
    function () {

        requestNotificationPermission();

    },
    {
        once: true
    }
);


/* ===============================
   INITIALIZE
================================ */

displayMeetings();

displayCalls();

renderCalendar();

renderNotifications();

loadProfile();

displayFriends();

displayFriendRequests();

checkForRoomLink();