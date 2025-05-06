<?php
  if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = htmlspecialchars(trim($_POST["name"]));
    $message = htmlspecialchars(trim($_POST["message"]));
    $website = htmlspecialchars(trim($_POST["website"]));
    $date = date("Y-m-d");
    $time = date("H:i:s");

    if ($name && $message) {
      $entry = "Date: $date @ $time\nName: $name\nSite: https://$website\n$message\n----\n";
      $existing = file_exists("guestbook.txt") ? file_get_contents("guestbook.txt") : '';
      file_put_contents("guestbook.txt", $entry . $existing, LOCK_EX);
    }

    header("Location: guestbook.php");
    exit();
  }
?>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NewOrigami - Origami Archive (Guestbook)</title>
    <link href="../style.css" rel="stylesheet" type="text/css" media="all">
    <link rel="icon" href="../favicon.png">
  </head>
  <body>
    <table border="0">
      <tbody>
        <tr>
          <th>
            <h2>Welcome to the new Origami.com</h2>
          </th>
          <th>
            &nbsp; &nbsp; &nbsp; &nbsp;
          </th>
          <th align="right">
            A website by Adinah Levi
            <br>
            Dark/Light Toggle: 
            <button 
              id="theme-toggle"
              style="
                background-color: transparent; 
                border: none;
                color: inherit; 
                cursor: pointer; 
                transition: background-color 0.2s;"
              onmouseover="handleHover(this, true)"
              onmouseout="handleHover(this, false)"
              onclick="darkModeToggle()"
            >
              🌒/☀️
            </button>
          </th>
        </tr>
      </tbody>
    </table>
    <ul>
      <p>
        ← Back to <a href="../index.html">Main Page</a>.
      </p>
      <hr>
    <form action="guestbook.php" method="post">
      Name: <input type="text" name="name" required><br><br>
      Website: https://<input type="text" name="website"><br><br>
      Message:<br>
      <textarea name="message" rows="5" cols="40" required></textarea><br><br>
      <input type="submit" value="Sign Guestbook">
    </form>

    <hr>
    <h3>Previous Entries</h3>
    
    <?php
      if (file_exists("guestbook.txt")) {
        $entries = file(
          "guestbook.txt", FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES
        );
        echo "<div style='max-width: 600px;'>";
        echo "<ul style='list-style-type: none; padding: 0;'>";
        $entryBuffer = [];
        foreach ($entries as $line) {
          if (trim($line) === '----') {
            if (!empty($entryBuffer)) {
              $rawEntry = implode("\n", $entryBuffer);
              $escapedEntry = htmlspecialchars($rawEntry);
              $escapedEntry = preg_replace(
                '/(Site:\s*)(https:\/\/[^\s]+)/',
                '$1<a href="$2" target="_blank">$2</a>',
                $escapedEntry
              );
              echo "<li style='border: none; padding: 10px; margin-bottom: 10px; white-space: pre-wrap; background: none;'>";
              echo $escapedEntry;
              echo "</li>";
              $entryBuffer = [];
            }
          } else {
            $entryBuffer[] = $line;
          }
        }
        echo "</ul>";
        echo "</div>";
      } else {
        echo "No entries yet.";
      }
    ?>
    <script src="../scripts/darkMode.js"></script>
      <p></p>
      <hr>
      
    </ul>
      <pre>
                      |b
                       ||
                       ||,
                       |'\
                        |`|
                        | `|
                        '| |.
                         | `L
                         |  |,
                         `|  |.                              _,/7
                          |  `|                       __,---'' /
                          |   `|              __,---'"   ..- ./
                          ||   |      _.--=/'',--=-,,  -    ,/
                          `|   \,/'''`\,     /'   >  \     /'
                           | ,/'  `. .  `\ ,/'   / \  \   /'
                   ___,----Y-'      Y     7'   .'.' `\ \ /'
               _-/''        `\.     .   ,/'    /.'    `\\ 
           _,-''          ---  \    `  /'    ./.'   __-' "
        _/''     .--            `\    /'     /,'_--'
     ,/''  ..                     `"\_     ./ /='
 .,/'                             .--"\    / / 
&lt;------------------,_____      ,/~'  \ | ./ .'
                        `"""""""      `|_/\ /
                                        '  '
      </pre>
      <p><a target="_blank" href="https://icons8.com/icon/10371/origami">Origami Swan</a> favicon by <a target="_blank" href="https://icons8.com">Icons8</a><br>Origami Crane ASCII art from <a href="https://www.asciiart.eu/art-and-design/origamis">asciiart.eu</a><br>All rights for diagrams reserved by respective original creators.</p>
    </ul>
  </body>
</html>