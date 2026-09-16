# KII Web Creations

We are gonna create a working website here are all the codes. : 

<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>SyntaxScene by KII</title>



    <link rel="stylesheet" href="style.css">

</head>



<body>



    <header>

        <nav>

            <h2>SyntaxScene <span>by KII</span></h2>



            <ul>

                <li><a href="#home">Home</a></li>

                <li><a href="#about">About</a></li>

            </ul>

        </nav>

    </header>



    <section class="hero" id="home">



        <h1>SyntaxScene</h1>



        <h3>by KII</h3>



        <p>

            Modern websites, built with purpose.

        </p>



        <a href="#about" class="button">

            Learn More

        </a>



    </section>



    <section class="about" id="about">



        <h2>About KII</h2>



        <p>

            <strong>KII</strong> stands for

            <strong>Kunene Intelligence Industries.</strong>

        </p>



        <p>

            Founded by a young prospective software engineer,

            KII is focused on creating modern, reliable,

            and user-friendly websites.



            Every project is built with creativity,

            attention to detail,

            and a passion for technology.

        </p>



    </section>



    <footer>



        <p>

            © 2026 SyntaxScene by KII. All rights reserved.

        </p>



    </footer>



    <script src="script.js"></script>



</body>

</html>

/* Google Font */

@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');



*{

    margin:0;

    padding:0;

    box-sizing:border-box;

    scroll-behavior:smooth;

    font-family:'Poppins',sans-serif;

}



body{

    background:#0b1120;

    color:white;

}



/* Navigation */



nav{

    width:100%;

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:20px 8%;

    position:fixed;

    top:0;

    background:rgba(11,17,32,.85);

    backdrop-filter:blur(10px);

    z-index:1000;

}



nav h2{

    font-size:28px;

    font-weight:700;

}



nav span{

    color:#4ea8ff;

    font-size:16px;

    font-weight:400;

}



nav ul{

    display:flex;

    list-style:none;

    gap:25px;

}



nav a{

    color:white;

    text-decoration:none;

    transition:.3s;

}



nav a:hover{

    color:#4ea8ff;

}



/* Hero */



.hero{

    min-height:100vh;

    display:flex;

    flex-direction:column;

    justify-content:center;

    align-items:center;

    text-align:center;

    padding:20px;

}



.hero h1{

    font-size:72px;

    margin-bottom:10px;

}



.hero h3{

    color:#4ea8ff;

    margin-bottom:20px;

    font-weight:500;

}



.hero p{

    max-width:600px;

    color:#d7d7d7;

    font-size:18px;

    margin-bottom:35px;

}



.button{

    background:#4ea8ff;

    color:white;

    text-decoration:none;

    padding:15px 35px;

    border-radius:10px;

    transition:.3s;

}



.button:hover{

    background:#2c8cff;

    transform:translateY(-3px);

}



/* About */



.about{

    max-width:900px;

    margin:auto;

    padding:100px 30px;

}



.about h2{

    text-align:center;

    margin-bottom:30px;

    font-size:40px;

}



.about p{

    line-height:1.8;

    margin-bottom:20px;

    color:#d8d8d8;

}



/* Footer */



footer{

    background:#08101d;

    text-align:center;

    padding:30px;

    color:#bfbfbf;

}



/* Mobile */



@media(max-width:768px){



nav{

    flex-direction:column;

    gap:15px;

}



.hero h1{

    font-size:50px;

}



.about{

    padding:70px 20px;

}



}

// SyntaxScene by KII

// Fade-in animation when scrolling

const observer = new IntersectionObserver((entries) => {

    entries.forEach((entry) => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

});

document.querySelectorAll(".hero, .about").forEach((section) => {

    observer.observe(section);

});

// Smooth button animation

const button = document.querySelector(".button");

button.addEventListener("mouseenter", () => {

    button.style.transform = "scale(1.05)";

});

button.addEventListener("mouseleave", () => {

    button.style.transform = "scale(1)";

});

// Display current year automatically

const footer = document.querySelector("footer p");

const year = new Date().getFullYear();

footer.innerHTML = `&copy; ${year} SyntaxScene by KII. All rights reserved.`;

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5a625ff4-adb8-4ca0-97fe-d5154366048a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
