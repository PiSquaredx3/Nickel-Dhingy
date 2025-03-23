<head>
    <title>Nickel-Dhingy</title>

    <style>
       body {
            background: url("https://web.archive.org/web/20111231220126im_/http://wwwimages.adobe.com/www.adobe.com/ubi/template/identity/adobe/screen/theme/windowfrost.png"); 
            background-color: #B9B9B9;
            font-family: Arial, Helvetica, sans-serif;
            color: #000000;
            margin: 0px;
            padding: 0px;
        }

        #container {
            font-family: sans-serif;
            margin-left: 10%;
            width: 80%;
            background: linear-gradient(to bottom, #ffffff, #b3b3b3 115%);
            border-left: solid #616368;
            border-right: solid #616368;
            border-bottom: solid #616368;
            border-width: 1px;
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 85%; 
            border-bottom-right-radius: 2px;
            border-bottom-left-radius: 2px;
            
        }

        .row {
            display: flex;
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
        }

        .column {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 45%; /* Adjust width for each column */
            max-width: 560px; /* Fixed width for each column on larger screens */
            margin-top: 60px;
            padding: 0 10px; /* Add some padding for better spacing */
            box-sizing: border-box; 
        }

        .full-width {
            width: 90%; /* Full width for the second row */
            max-width: 1120px; /* Double the max-width of a single column */
        }

        .column div {
            width: 90%; /* Makes sure all child divs fill the column */
            box-sizing: border-box; /* Ensures padding doesn’t affect width */
        }

        #header {
        margin: 40px;
        margin-left: 10%;
        width: 80%;
        background: linear-gradient(#505050, #343434);
        border-top: solid #2b2b2b;
        border-left: solid #2b2b2b;
        border-right: solid #2b2b2b;
        border-width: 1px;
        color: white;
        padding: 0px;
        height: 50px;
        font-size: 32px;
        font-weight: bold;
        text-align: left;
        position: relative;
        text-indent: 10px;
        z-index: 1;
        line-height: 50px;
        border-top-left-radius: 2px;
        border-top-right-radius: 2px;
        display: flex;
        align-items: center;
        }   

        #navbar {
            margin-left: 45%;
        }

        #navbar, #navbar2, #navbar3 {
            background: linear-gradient(to bottom, #505050, #343434);
            text-align: left;
            text-indent: 0px;
            font-size: 32px;
            border: solid #2b2b2b;
            border-width: 1px;
            z-index: 10;
            color: #ffffff;
            line-height: 50px;
            min-width: 100px;
            display: inline-block;
            position: relative;
            
        }

        #navbar a, #navbar2 a, #navbar3 a {
            color: rgb(255, 255, 255);
            text-decoration: none;
            margin: 0 10px;
            font-weight: bold;
            display: inline-block;
            transition: transform .1s ease-out, opacity .1s ease-out;
        }


        #navbar:hover, #navbar2:hover, #navbar3:hover {
            background: linear-gradient(to bottom, #666666, #343434);
        }

        #motn {
            margin-top: -40px;
            margin-left: 10%;
            width: 80%;
            font-family: "Comic Sans MS", "Comic Sans";
            background-color: #cacaca;
            text-align: center;
            font-size: 15px;
            position: relative;
            z-index: 5;
            color: #3a3a3a;
            line-height: 0px;
            height: 25px;
            border: solid #616368;
            border-width: 1px;
        }

        #newstitle, #sutitle, #thingofthenowheader {
            width: 100%;
            background: linear-gradient(to top, #9e9e9e, #e2e2e2 100%);
            text-indent: 15px;
            border: solid #616368 1px;
            text-align: left;
            font-size: 24px;
            border-top-left-radius: 2px;
            border-top-right-radius: 2px;
        }

        #newscontent, #sucontent, #thingofthenow {
            margin-top: -1px;
            width: 100%;
            background: #cacaca;
            padding: 2px;
            border: solid #616368 1px;
            text-align: left;
            font-size: 16px;
            text-indent: 15px;
            border-bottom-left-radius: 2px;
            border-bottom-right-radius: 2px;
        }

        #thingofthenow {
            text-indent: 0px;
            padding: 12px;
        }

        #footer {
            width: 60%;
            margin-left: 20%;
            text-align: center;
            font-size: 12px;
            color: transparent;
            
            border-width: 3px;
            position: relative;
        }

        @media (max-width: 600px) {
            #header {
                font-size: 24px;
                height: 36px;
                padding-left: 10px;
            }

            #navbar, #navbar2, #navbar3 {
                font-size: 16px;
                margin-left: 0;
                margin-top: 0;
                line-height: 40px;
                width: 80px;
                left: 50%;
                transform: translateX(-50%);
            }

            #motn {
                font-size: 16px;
                margin-left: 0;
                padding-left: 10px;
            }

            #newstitle, #sutitle, #thingofthenowheader {
                font-size: 24px;
            }

            #newscontent, #sucontent, #thingofthenow {
                font-size: 14px;
            }

            iframe {
                height: 200px;
            }

            .column {
                width: 100%; /* Full width on smaller screens */
            }

            .full-width {
                width: 100%; /* Full width on smaller screens */
            }
        }

    </style>
</head>
<body>

    

    <div id="header">Nickel-Dhingy <div id="navbar">
        <a href="index.html">Home</a> 
    </div>
    <div id="navbar2">
        <a href="Blog.html">Blog</a>
    </div>
    <div id="navbar3"><a href="About.html">About</a></div></div> 
    
    <div id="motn"> <p></p> </div>
    <script src="MotN.js"></script>

    <div id="container">
        <div class="row">
            <div class="column">
                <div id="newstitle">News</div>
                <div id="newscontent">
                    <p>• We have literally done nothing yet</p>
                </div>
            </div>
        
            <div class="column">
                <div id="thingofthenowheader">Thing of the Now</div>
                <div id="thingofthenow">
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/ucS8KPwMJiw" title="YouTube video player" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="column full-width">
                <div id="sutitle">Minor Updates </div>
                <div id="sucontent">
                    
                    <p>• This website is actively updated when I feel like it. </p>
                    <p>• I like changing it up often so expect major changes sometimes</p>
                    <p>• I have no professional or any actually lessons on HTML in general. Graphic design is my passion. </p>
                </div>
            </div>
        </div>
    </div>
    
    <div id="footer"> Hi, you probably found me by accident, well, did you know I don't actually know how to program and this was all done by my cat. </div>
</body>
</html>
