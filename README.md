# COMPUTER GRAPHICS - ASSIGNMENT 2

## By - Gokul Vamsi Thota
## Roll number - 2019111009


### Brief Description

This is the second assignment, which involves creation of a game (simplified version of Sky Force). I have titled it "Sky Force - The Alienation". Refer to the trailer to understand why.



### Execution

It is assumed that the required library (threeJS) is pre-installed and present in a 'libraries' folder. If not, follow the below instructions to install the same. 


* Create a folder named `libraries` at some location in your system, using the command: `mkdir libraries`.

* Enter this folder with the command: `cd libraries`.

* After entering this folder, obtain the directory `three.js` into this folder, by running the command: `git clone --depth=1 https://github.com/mrdoob/three.js.git`

* Now, use this libraries folder as explained below.



The 'src' folder included here can be executed in the following way.


* After extracting the folder into some location on your system, enter the directory 2019111009, with the command: `cd 2019111009`

* Move the 'libraries' folder (with installation of threeJS) to this directory.

* Enter the source directory, with the command: `cd src`

* Open the file `index.html` with live server using Visual Studio Code (Right click at some point in the file and select `Open with live server`).

* The game must be visible now. Follow below instructions to play it.

* The trailer can be viewed by accessing the link mentioned in the file 'Trailer_link.txt' in the directory '2019111009'



### Instructions

The following instructions are to be kept in mind while playing the game



#### Moving the player

* Press 'UP' arrow key to move the plane upwards.

* Press 'DOWN' arrow key to move the plane downwards.

* Press 'LEFT' arrow key to move the plane to the left.

* Press 'RIGHT' arrow key to move the plane to the right.

* Press the 'F' key to fire missiles from the plane.



#### Rules to remember

* Watch the trailer first to get the gist of the game.

* The scene moves at a constant speed upwards, and the plane moves along with it.

* At any instant the plane cannot go past the 4 borders of the screen.

* The player is considered to lose the game, when an enemy comes in contact with the plane, or when the enemy missiles deal enough damage to the plane such that health drops to 0 at some point.

* The player is considered to win the game if a score of 400 is attained by the player.

* Score (initially 0), increases by 5 units on destroying an enemy with missile from the plane, and increases by 10 units on collecting a star successfully.

* Health is initially 7 units. It increases by 3 units on collecting a star and decreases by 3 units on getting hit by an enemy UFO missile.

* Refresh the screen to play game again.

* Rest of the instructions are adhered to as in the pdf.




#### Points to note

* All the features mentioned in the assignment pdf have been implemented (the game and it's trailer with the story).

* All the bonus features mentioned have also been implemented (moving enemies, enemy missiles, aesthetics).

* All the models have been created from scratch with 'Blender', nothing was taken from the net.

* The game is aesthetically done; and has sound effects, and game over screens, to enhance game play. 