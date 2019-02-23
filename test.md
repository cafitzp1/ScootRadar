# Tempe Scoot Radar #

Hey guys... So basically I spent way too long on a little project for my CIS capstone and thought it would be cool to share it here. I created a sort of visualization tool for E-Scooters around ASU (Bird) which I like to call "Tempe Scoot Radar". You can see data live similar to how it looks while using the Bird app or you can access hourly point in time snapshots of data. Additionally, you can choose from a number of different visualization and map background themes.

![homepage](https://s3-us-west-2.amazonaws.com/tempescootradar/assets/home-1.png)
So by default, you're gonna see the heatmap display with a dark background, showing live scooter locations. You can refresh locations without reloading the page by simply clicking "Live View" again, and you can access stored data from the `MM/DD/YYYY` input to the right.

![day select](https://s3-us-west-2.amazonaws.com/tempescootradar/assets/home-3.png)
Data will be stored 30 days until expiration, so you can select any day to a month back. Note that data only currently goes back until the 17th at 12:00pm since this is when I actually got the database and code setup to begin storing data.

![day select](https://s3-us-west-2.amazonaws.com/tempescootradar/assets/home-4.png)
Similar to how the regular app functions, you can click markers to see battery level. I might add some more functionality to this in the future (show the scooter ID, lat/long, last ride time, date created, etc.) since there's way more data available for each individual scooter, but for now I'm just leaving it as is.

## Demo ##

![demonstration](https://s3-us-west-2.amazonaws.com/tempescootradar/assets/rec-1.gif)
All the elements in the navigation bar along the left have a little tooltip when you hover over to help out a little, but the only thing really worth mentioning is that you can switch hours much faster by using right/left arrow keys when you're focused on that input (on some devices left/right keys may skip over 2 hours at a time, in which case using up/down should work instead). Focusing on the input is what happens after you click or tab over to it (a little blue rectangle appears on most browsers when elements are focused).  

That's it! Hope you guys enjoy messing around with it (and that it doesn't break for anybody). I welcome any suggestions for improvements. I'm not sure what the policy is with URLs on reddit but it's just tempescootradar.com