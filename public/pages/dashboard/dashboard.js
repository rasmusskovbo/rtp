fetch("/dashboard/posts/")
    .then(response => response.json())
    .then(( posts ) => {
        const postsTable = document.getElementById("posts-tbody");

        posts.map((post, index) => {
            let row = postsTable.insertRow(index)
            row.insertCell(0).innerHTML = post.id
            row.insertCell(1).innerHTML = `<input id="title" type="text" placeholder="Title..." value="${escapeHTML(post.title)}" required></td>`
            row.insertCell(2).innerHTML = `<input id="content" type="text" placeholder="Content..." value="${escapeHTML(post.content)}" required></td>`
            row.insertCell(3).innerHTML = `<p id="postedBy">${escapeHTML(post.postedBy)}</p></td>`
            row.insertCell(4).innerHTML = `<p id="publishedTime">${escapeHTML(post.publishedTime)}</p></td>`
            row.insertCell(5).innerHTML = `
            <button id="delete" class="fas-btn" style="background-color: #20202000">
            <i class="fas fa-trash-alt">
            </i></button>
        `
            row.insertCell(6).innerHTML = `
            <button id="update" class="fas-btn" style="background-color: #20202000">
            <i class="fas fa-save"></i>
            </i></button>
        `

            row.cells[5].onclick = function() {
                const postId = row.cells[0].innerHTML
                deleteProject(postId, row.rowIndex)
            }

            row.cells[6].onclick = function() {
                updateProject(row)
            }

        });
    });

function createPost() {
    fetch("/dashboard/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
            title: document.getElementById("post_title").value,
            content: document.getElementById("post_content").value
        })
    }).then(res => {
        if (res.status === 200) {
            toastr.success("Post created successfully")
            setTimeout(() => location.href= "/dashboard", 1500);
        }
        else {
            console.log("Error:", res.status)
        }
    })
}

function deleteProject(postId, rowToDeleteIndex) {
    fetch("/dashboard/posts/" + postId, {
        method: "DELETE"
    }).then(res => {
        if (res.status === 200) {
            const tableRows = document.getElementsByTagName("tr")
            const rowToDelete = Array.from(tableRows).find(row => row.rowIndex === rowToDeleteIndex)
            rowToDelete.remove()
            toastr.success(`Post with ID: ${postId} deleted successfully.`)
        } else {
            toastr.error("Unable to delete post.")
        }
    })

}

function updateProject(rowToUpdate) {
    const post = {
        id: rowToUpdate.cells[0].innerHTML,
        title: rowToUpdate.cells[1].children[0].value,
        content: rowToUpdate.cells[2].children[0].value
    }

    fetch("/dashboard/posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify( post )
    }).then(res => {
        if (res.status === 200) {
            toastr.success(`Post with ID: ${post.id} updated!`)
        } else {
            toastr.error("Unable to update post.")
        }
    })
}

document.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("create-post-button").addEventListener("click", createPost)
})

