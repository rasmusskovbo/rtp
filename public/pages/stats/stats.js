fetch("/stats/rtp-score/")
    .then(response => response.json())
    .then(( stats ) => {
        const table = document.getElementById("rtp-score-tbody");

        stats.map((statLine, index) => {
            let row = table.insertRow(index)
            statLine.avatarURL ?
                row.insertCell(0).innerHTML = `<img id=avatar src="${statLine.avatarURL}">`
                :
                row.insertCell(0).innerHTML = `<p></p>`
            row.insertCell(1).innerHTML = `<p id="sleeper_username">${escapeHTML(statLine.sleeper_username)}</p></td>`
            row.insertCell(2).innerHTML = `<p id="rtp_score">${statLine.rtp_score}</p></td>`
            row.insertCell(3).innerHTML = `<p id="wins">${statLine.wins}</p></td>`
            row.insertCell(4).innerHTML = `<p id="second_place">${statLine.second_place}</p></td>`
            row.insertCell(5).innerHTML = `<p id="third_place">${statLine.third_place}</p></td>`
            row.insertCell(6).innerHTML = `<p id="playoff_appearances">${statLine.playoff_appearances}</p></td>`
            row.insertCell(7).innerHTML = `<p id="toilet_wins">${statLine.toilet_wins}</p></td>`
            row.insertCell(8).innerHTML = `<p id="pinks">${statLine.pinks}</p></td>`
        });

        addEventListenersToTable('rtp-score-table', 2)

        sortTable(2, 'rtp-score-table')
        sortTable(2, 'rtp-score-table')
    });


fetch("/stats/standings/")
    .then(response => response.json())
    .then(( stats ) => {
        const postsTable = document.getElementById("standings-tbody");

        stats.map((statLine, index) => {
            let row = postsTable.insertRow(index)
            statLine.avatarURL ?
                row.insertCell(0).innerHTML = `<img id=avatar src="${statLine.avatarURL}">`
                :
                row.insertCell(0).innerHTML = `<p></p>`
            row.insertCell(1).innerHTML = `<p id="sleeper_username">${escapeHTML(statLine.sleeper_username)}</p></td>`
            row.insertCell(2).innerHTML = `<p id="record">${statLine.record}</p></td>`
            row.insertCell(3).innerHTML = `<p id="win_p">${statLine.win_p}</p></td>`
            row.insertCell(4).innerHTML = `<p id="pf">${statLine.pf}</p></td>`
            row.insertCell(5).innerHTML = `<p id="pa">${statLine.pa}</p></td>`
            row.insertCell(6).innerHTML = `<p id="diff">${statLine.diff}</p></td>`
            row.insertCell(7).innerHTML = `<p id="trans">${statLine.trans}</p></td>`
            row.insertCell(8).innerHTML = `<p id="msgs">${statLine.msgs}</p></td>`
        });

        addEventListenersToTable('standings-table', 3)

        sortTable(3, 'standings-table')
        sortTable(3, 'standings-table')
    })

fetch("/stats/weekly-high/")
    .then(response => response.json())
    .then(( stats ) => {
        const table = document.getElementById("weekly-high-tbody")

        stats.map((statLine, index) => {
            let row = table.insertRow(index)
            statLine.avatarURL ?
                row.insertCell(0).innerHTML = `<img id=avatar src="${statLine.avatarURL}">`
                :
                row.insertCell(0).innerHTML = `<p></p>`
            row.insertCell(1).innerHTML = `<p id="sleeper_username">${escapeHTML(statLine.sleeper_username)}</p></td>`
            row.insertCell(2).innerHTML = `<p id="score">${statLine.score}</p></td>`
            row.insertCell(3).innerHTML = `<p id="year">${statLine.year}</p></td>`
            row.insertCell(4).innerHTML = `<p id="week">${statLine.week}</p></td>`
        });

        addEventListenersToTable('weekly-high-table', 2)

        sortTable(2, 'weekly-high-table')
        sortTable(2, 'weekly-high-table')
    })

fetch("/stats/player-high/")
    .then(response => response.json())
    .then(( stats ) => {
        const table = document.getElementById("player-high-tbody");

        stats.map((statLine, index) => {
            let row = table.insertRow(index)
            statLine.avatarURL ?
                row.insertCell(0).innerHTML = `<img id=avatar src="${statLine.avatarURL}">`
                :
                row.insertCell(0).innerHTML = `<p></p>`
            row.insertCell(1).innerHTML = `<p id="sleeper_username">${escapeHTML(statLine.sleeper_username)}</p></td>`
            row.insertCell(2).innerHTML = `<p id="player_name">${escapeHTML(statLine.player_name)}</p></td>`
            row.insertCell(3).innerHTML = `<p id="score">${statLine.score}</p></td>`
            row.insertCell(4).innerHTML = `<p id="year">${statLine.year}</p></td>`
            row.insertCell(5).innerHTML = `<p id="week">${statLine.week}</p></td>`
        });

        addEventListenersToTable('player-high-table', 3)

        sortTable(3, 'player-high-table')
        sortTable(3, 'player-high-table')
    })

fetch("/stats/yearly-finishes/")
    .then(response => response.json())    .then(( stats ) => {
        const table = document.getElementById("yearly-finishes-tbody");

        stats.map((statLine, index) => {
            let row = table.insertRow(index)
            row.insertCell(0).innerHTML = `<p id="year">${statLine.year}</p></td>`
            row.insertCell(1).innerHTML = `<p id="winner">${escapeHTML(statLine.winner)}</p></td>`
            row.insertCell(2).innerHTML = `<p id="second">${escapeHTML(statLine.second)}</p></td>`
            row.insertCell(3).innerHTML = `<p id="third">${escapeHTML(statLine.third)}</p></td>`
            row.insertCell(4).innerHTML = `<p id="last_regular">${escapeHTML(statLine.last_regular)}</p></td>`
            row.insertCell(5).innerHTML = `<p id="last_playoffs">${escapeHTML(statLine.last_playoffs)}</p></td>`
            row.insertCell(6).innerHTML = `<p id="league_size">${statLine.league_size}</p></td>`
        });

        sortTable(0, 'yearly-finishes-table')
        sortTable(0, 'yearly-finishes-table')
        const rows = Array.from(document.getElementById('yearly-finishes-table').rows);
        rows.map(row => row.className = "")
    })



function sortTable(n, tableID) {
    let table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById(tableID);
    switching = true;
    dir = "asc";

    while (switching) {
        switching = false;
        rows = table.rows;

        // Coloring
        rows[1].className = ""
        rows[2].className = ""
        rows[3].className = ""
        rows[rows.length-3].className = ""
        rows[rows.length-2].className = ""
        rows[rows.length-1].className = ""

        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;

            x = rows[i].getElementsByTagName("TD")[n].getElementsByTagName("p")
            y = rows[i + 1].getElementsByTagName("TD")[n].getElementsByTagName("p")

            const xAsNumber = parseFloat(x[0].innerHTML)
            const yAsNumber = parseFloat(y[0].innerHTML)

            if (dir == "asc") {
                if (xAsNumber > yAsNumber) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (xAsNumber < yAsNumber) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount ++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }

    if (dir === "desc") {
        rows[1].className = "first"
        rows[2].className = "second"
        rows[3].className = "third"
        rows[rows.length-1].className = "last"
    } else {
        rows[rows.length-1].className = "first"
        rows[rows.length-2].className = "second"
        rows[rows.length-3].className = "third"
        rows[1].className = "last"
    }
}

function openTab(tabName) {
    // Declare all variables
   let tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    Array.from(tabcontent).forEach(tab => tab.style.display = "none")

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    Array.from(tablinks).forEach(link => link.className.replace(" active", ""))

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    document.getElementById(tabName).className += " active";
}

function addEventListenersToTable(table, startingIndex) {
    // Get specific table headers
    const headerRow = document.getElementById(table).getElementsByTagName("thead")[0].children[0]
    const rows = Array.from(headerRow.children)

    // For loop for custom starting point (no listeners on strings is wanted)
    for (let i = startingIndex; i < rows.length; i++) {
        rows[i].addEventListener("click", function(){
            sortTable(i, table)
        })
    }
}

