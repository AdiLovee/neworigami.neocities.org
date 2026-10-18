const HEAD = document.getElementById("header");
HEAD.innerHTML = `
    <header>
      <div  class="content-box">
        <div class="home-boxes">
        <section class="home-box">
          <h2>Welcome to the new Origami.com</h2>
          A website by Adinah Rose
          <div id="darkMode">
        </section>
        <section class="home-box">
          <p><b>Link me!</b></p>
          <p>
            <a href="/index.html">
              <img class="badge" src="./assets/button.gif" alt="NewOrigami Button">
            </a>
          </p>
          <p>
            If you like my site, feel free to save my button and share it on your site!
          </p>
          <br>
          <p>
            <textarea readonly onclick="this.select();">
              <a href="https://neworigami.neocities.org/"> <img src="https://neworigami.neocities.org/assets/button.gif" alt="NewOrigami Button"> </a>
            </textarea>
          </p>
        </section>
        </div>
      </div>
    </header>
`;