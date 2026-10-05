window.addEventListener('group_reload', () => {
    setGroupInfo();
});

async function setGroupInfo() {
    const groupDisplay = document.getElementById("header_logo");
    const groupData = JSON.parse(localStorage.getItem("groupData"));

    const imgPath = `../../files/icons/profile/${groupData.picture}`;
    groupDisplay.src = imgPath
    groupDisplay.onerror = () => {
        groupDisplay.src = `../../files/icons/profile/placeholder.png`;
    };

    const streakDisplay = document.getElementById("header_streak")
    streakDisplay.textContent = groupData.streak
}
