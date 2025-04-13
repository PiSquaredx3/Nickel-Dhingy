---
layout: default
title: Nickel-Dhingy
---




<div id="container">
    
        <div class="row">
            <div class="column">
                <div id="blogheader">Blog</div>
                <div id="blog">
    
                </div>
            </div>
        </div>
    </div>


<script>
        // Fetch the JSON data from the file
        fetch('assets/blogs/test.json')
            .then(response => response.json())  // Parse the JSON data
            .then(posts => {
                const blogContainer = document.getElementById("blog");  // Get the container for blog posts
                
                // Loop through each post and add it to the HTML
                posts.forEach(post => {
                    const postElement = document.createElement("div");  // Create a new div for each post
                    postElement.classList.add("post");  // Add a class for styling

                    // Add the title and content of the blog post
                    postElement.innerHTML = `<h2>${post.title}</h2><p>${post.content}</p>`;

                    // Append the post to the container
                    blogContainer.appendChild(postElement);
                });
            })
            .catch(error => console.error('Error loading the JSON file:', error));  // Handle any errors
    </script>
