fetch("/dashboard/posts")
    .then(response => response.json())
    .then(( posts ) => {
        const postsWrapperDiv = document.getElementById("posts-wrapper");
        posts.map(post => {
            const postDiv = document.createElement("div");
            postDiv.classList.add("post-element")
            postDiv.innerHTML = `
            <h3>${escapeHTML(post.title)}</h3>
            <p class="sub-title">Posted by ${escapeHTML(post.postedBy)} @ ${escapeHTML(post.publishedTime)} </p>
            <p>${escapeHTML(post.content)}</p>
        `;

            postsWrapperDiv.appendChild(postDiv);

        });
    });