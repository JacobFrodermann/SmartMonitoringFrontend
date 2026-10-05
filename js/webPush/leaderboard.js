document.addEventListener("swac_components_complete", () => {
    loadGroups();
})

async function loadGroups() {
    const group_info = await getGroupInfo();
    const group_id = localStorage.getItem("user_group_id")
    const rows = document.querySelectorAll("tr");
    if (rows[1]) {
        const firstRank = rows[1].querySelector(".lb-rank");
        if (firstRank) firstRank.style.setProperty("--rank-bg", 'url("/SmartMonitoringAirquality/files/icons/leaderboard/first.png")');
    }
    if (rows[2]) {
        const secondRank = rows[2].querySelector(".lb-rank");
        if (secondRank) secondRank.style.setProperty("--rank-bg", 'url("/SmartMonitoringAirquality/files/icons/leaderboard/second.png")');
    }
    if (rows[3]) {
        const thirdRank = rows[3].querySelector(".lb-rank");
        if (thirdRank) thirdRank.style.setProperty("--rank-bg", 'url("/SmartMonitoringAirquality/files/icons/leaderboard/third.png")');
    }
    for (const row of rows) {
        const current_id = row.dataset.g_id;
        const img = row.querySelector("img");
        const record = group_info.find(r => r.group_id == current_id);
        const path = record ? `../../files/icons/profile/${record.picture}` : "";
        img.src = path;
        img.onerror = () => {
            img.src = `../../files/icons/profile/placeholder.png`;
        };

        if (row.dataset.g_id == group_id) {
            row.classList.add("highlight");
        }
    }

}
async function getGroupInfo() {
    try {
        const response = await fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/view_groups?storage=gamification`);

        if (!response.ok) {
            throw new Error('Error getting group info: ' + response.status);
        }

        return await response.json().then(data => data.records);

    } catch (error) {
        console.error(error);
    }
}