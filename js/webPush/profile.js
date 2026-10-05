window["present_pictures_options"] = {
    attributeRenames: new Map([["id", "p_id"]])
}

document.addEventListener("swac_components_complete", async () => {
    initProfilePictureSelection();
    await loadAchievements();
    initPopups();
    addLogoutEventListener();
});

window.addEventListener("group_reload", () => {
    setXPProgress();
    loadProfileInfos();
    loadAchievements();
    loadAchievementData();
});

function setXPProgress() {
    const groupData = JSON.parse(localStorage.getItem("groupData"));
    const progressValue = groupData.progress;

    const circle = document.querySelector('.progress_ring_progress');
    const radius = parseFloat(circle.getAttribute('r'));
    const circumference = 2 * Math.PI * radius;

    circle.style.strokeDasharray = `${circumference}`;

    const offset = circumference - (progressValue / 100) * circumference;
    circle.style.strokeDashoffset = offset;

}

function initProfilePictureSelection() {
    const pictures = document.querySelectorAll(".selectable_profile_picture");
    pictures.forEach(img => {
        if (img.dataset.picture !== "{picture}") {
            img.src = `../../files/icons/profile/${img.dataset.picture}`
            img.addEventListener("click", () => { selectProfilePicture(img.dataset.p_id) })
        }
    });
}

async function selectProfilePicture(id) {
    try {
        const group_id = localStorage.getItem("user_group_id");
        const res = await fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/group/${group_id}?storage=gamification`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ picture_id: id })
        });
        if (!res.ok) {
            throw new Error(`PUT /group: ${res.status} ${res.statusText}`);
        }
        window.dispatchEvent(new Event("group_changed"));
    }
    catch {
        console.error(error);
    }
    closePopup();
}

function loadProfileInfos() {
    const groupData = JSON.parse(localStorage.getItem("groupData"));
    const profileImage = document.getElementById("profile_image");

    const imgPath = `../../files/icons/profile/${groupData.picture}`;
    profileImage.src = imgPath;
    profileImage.onerror = () => {
        profileImage.src = `../../files/icons/profile/placeholder.png`;
    };

    document.getElementById("group_name").textContent = groupData.group_name;
    document.getElementById("streak").textContent = groupData.streak;
    document.getElementById("level").textContent = groupData.level;
}

function addLogoutEventListener() {
    document.getElementById("logout_btn")?.addEventListener("click", () => logoutUser());
}

async function logoutUser() {
    const userId = localStorage.getItem("user_member_id", null);
    if (!userId) {
        console.warn("logout failed: no user id found");
        return;
    }
    const btn = document.getElementById("logout_btn");
    btn?.setAttribute("disabled", "true");
    try {
        await fetch(
            `${window.location.origin}/SmartDataAirquality/smartdata/records/member/${userId}?storage=gamification`,
            { method: "DELETE" }
        );
    } catch (err) {
        console.warn("Logout cleanup failed:", err);
    } finally {
        localStorage.clear();
        btn?.setAttribute("disabled", "false");
        window.location.assign(`../../index.html`);
    }
}

function setAchievementIcons() {
    let iconImgs = document.querySelectorAll('.achv-icon-img');
    iconImgs.forEach(img => {
        if (img.dataset.image !== "{img_url}") {
            let imgPath = img.dataset.image;
            if (imgPath === "") {
                imgPath = "../../files/icons/achievements/placeholder.png";
            }
            img.src = imgPath;
        }
    });
}

async function loadAchievements() {
    const swacElem = document.getElementById('present_achievements');
    const achievementComp = swacElem.swac_comp;
    if (!swacElem || !achievementComp) return;
    try {
        const group_id = localStorage.getItem("user_group_id");
        const response = await fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/view_group_achievement_progress?storage=gamification&filter=group_id,eq,${group_id}`);
        if (!response.ok) {
            throw new Error('Error getting group info: ' + response.status);
        }
        achievementComp.removeAllData();
        const data = await response.json().then(data => data.records);
        achievementComp.addData('view_group_achievements', data);
        setAchievementIcons();

    } catch (error) {
        console.error(error);
    }
}

function initPopups() {
    const achievementCards = document.querySelectorAll('.achievement-card');
    achievementCards.forEach(card => {
        card.addEventListener('click', async () => {
            loadAchievementPopup(card.dataset.a_id)
        });
    });

    document.getElementById("profile_image").addEventListener("click", () => {
        document.getElementById("profile_popup").style.display = 'block'
    })
    document.getElementById("profile_overlay").addEventListener("click", closePopup)
    document.getElementById("achievement_overlay").addEventListener("click", closePopup)
}

async function loadAchievementPopup(a_id) {
    const imgBoxes = document.querySelectorAll('.img_box');
    const data = achievementTierData.find(a => a.achievement_set_id == a_id);
    console.log(data)
    let progressDisplayed = false;
    for (let i = 0; i < imgBoxes.length; i++) {
        const currentBox = imgBoxes[i];
        const currentXP = currentBox.querySelector('span');
        const currentImg = currentBox.querySelector('img');
        if (!data.tiers[i].achieved) {
            currentImg.src = `../../files/icons/achievements/placeholder.png`
            currentXP.textContent = '';
            if (!progressDisplayed) {
                console.log(data.tiers[i].trigger_id)
                await loadAchievementProgress(data.tiers[i].trigger_id);
                progressDisplayed = true;
            }
            continue;
        }
        currentImg.src = data.tiers[i].img_url;
        currentXP.textContent = `${data.tiers[i].reward_xp} XP`
    }
    if (!progressDisplayed) {
        const highestTier = data.tiers[data.tiers.length - 1];
        loadAchievementProgress(highestTier.trigger_id);
    }
    document.getElementById('achievement_popup_title').textContent = data.achievement_title;
    document.getElementById('achievement_popup_description').textContent = data.achievement_description;
    document.getElementById("achievement_popup").style.display = 'block';
}

async function loadAchievementProgress(trigger_id) {
    try {
        const group_id = localStorage.getItem("user_group_id");
        const response = await fetch(`${window.location.origin}/WebPush/webpush/condition/progress/${trigger_id}?smartdataurl=/SmartDataAirquality&groupId=${group_id}`);
        if (!response.ok) {
            throw new Error('Error getting achievement progress: ' + response.status);
        }
        const conditions = await response.json().then(data => data.progress);

        document.getElementById('achievement_progress_section').innerHTML = '';
        conditions.forEach(cond => {
            const progressWrapper = document.createElement('div');
            progressWrapper.classList.add('progress_wrapper', 'uk-flex', 'uk-flex-column', 'uk-flex-start');

            let progress = 0;
            let style = '';
            let value = '';
            if (cond.value == null) {
                style = 'progress_null';
            } else if (checkComplete(cond.value, cond.threshold, cond.operator)) {
                progress = 100;
                style = 'progress_done';
            } else {
                progress = calculateProgress(cond.value, cond.threshold, cond.operator);
                value = `${cond.value}`;
                style = 'progress_striped';
            }
            const progressDisplay = `              
                <span class="uk-text-meta uk-text-left uk-width-1-1 uk-margin-small-top"> 
                    ${cond.type}
                </span>
                <div class="progress_row">
                    <div class="progress ${style}" >
                        <div class="progress_bar" style="width: ${progress}%;"> ${value} </div>
                    </div >
                    <span class="progress_target">${cond.threshold}</span>
                </div>
            `;
            progressWrapper.innerHTML = progressDisplay;
            document.getElementById('achievement_progress_section').appendChild(progressWrapper);
        });
    } catch (error) {
        console.error(error);
    }
}

let achievementTierData = [];
async function loadAchievementData() {
    try {
        const group_id = localStorage.getItem("user_group_id");
        const response = await fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/view_group_achievement_tiers?storage=gamification&filter=group_id,eq,${group_id}`);
        if (!response.ok) {
            throw new Error('Error getting group info: ' + response.status);
        }
        achievementTierData = await response.json().then(data => data.records);


    } catch (error) {
        console.error(error);
    }
}

function closePopup() {
    document.getElementById("profile_popup").style.display = 'none'
    document.getElementById("achievement_popup").style.display = 'none'
}

function calculateProgress(value, threshold, operator) {
    value = Number(value);
    threshold = Number(threshold);

    if (isNaN(value) || isNaN(threshold)) return 0;

    let progress = 0;

    switch (operator) {
        case '>':
        case '>=':
            if (value >= threshold) return 100;
            progress = (value / threshold) * 100;
            break;

        case '<':
        case '<=':
            if (value <= threshold) return 100;
            progress = (threshold / value) * 100;
            break;

        case '==':
            if (value === threshold) return 100;
            progress = 100 - (Math.abs(value - threshold) / Math.abs(threshold)) * 100;
            break;

        case '!=':
            if (value !== threshold) return 100;
            return 0;

        default:
            return 0;
    }
    return Math.max(0, Math.min(100, progress));;
}

function checkComplete(val1, val2, operator) {
    switch (operator) {
        case '>':
            return val1 > val2;
        case '<':
            return val1 < val2;
        case '>=':
            return val1 >= val2;
        case '<=':
            return val1 <= val2;
        case '==':
            return val1 == val2;
        case '!=':
            return val1 != val2;
        default:
            return false;
    }

}