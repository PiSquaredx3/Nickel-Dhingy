---
layout: default
title: Nickel-Dhingy
---


<audio id="easteregg">
        <source src="assets/let-me-know.mp3" type="audio/mpeg">
    </audio>

    <script>
        function PlaySound() {
            document.getElementById("easteregg").play();
            let dog = document.getElementById("dog");
        dog.style.transition = "opacity 10s ease-out";
        dog.style.opacity = "0";
        setTimeout(() => {
            dog.style.display = "none";
        }, 10000); // Wait for the fade-out to complete before hiding
    }
    </script>

<div id="container">
    
        <div class="row">
            <div class="column">
                <div id="blogheader">Blog</div>
                <div id="blog">
                    <p>uh </p>
                </div>
            </div>
        </div>
        <img src="https://pngimg.com/d/dog_PNG50348.png" height="75px" id="dog" onclick="PlaySound()">  <!--Haha get it, dog in the blog, its funny right, Jonah thought so.--> 
    </div>
