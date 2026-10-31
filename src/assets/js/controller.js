const socket = io();

const TOTAL_POSTERS = (window.GALLERY_IMAGES || []).length || 1;

let currentImage = 0;

const statusElement =
    document.getElementById("status");

const imageInfo =
    document.getElementById("imageInfo");

socket.on(
    "connect",
    () => {

        statusElement.textContent =
            "🟢 Connected";

        statusElement.classList.add(
            "connected"
        );
    }
);

socket.on(
    "disconnect",
    () => {

        statusElement.textContent =
            "🔴 Disconnected";

        statusElement.classList.remove(
            "connected"
        );
    }
);

function openCurtain() {

    socket.emit(
        "open-curtain"
    );
}

function closeCurtain() {

    socket.emit(
        "close-curtain"
    );
}

function nextImage() {

    currentImage = (currentImage + 1) % TOTAL_POSTERS;

    updateImageInfo();

    socket.emit(
        "next-image"
    );
}

function previousImage() {

    currentImage = (currentImage - 1 + TOTAL_POSTERS) % TOTAL_POSTERS;

    updateImageInfo();

    socket.emit(
        "prev-image"
    );
}

function celebrate(type) {

    socket.emit(
        "celebrate",
        type
    );
}

function updateImageInfo() {

    imageInfo.textContent =
        `Current Poster: ${currentImage + 1} / ${TOTAL_POSTERS}`;
}

socket.on(
    "show-image",
    (index) => {

        currentImage =
            ((Number(index) % TOTAL_POSTERS) + TOTAL_POSTERS) % TOTAL_POSTERS;

        updateImageInfo();
    }
);
