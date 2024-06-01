A page displaying only a search input (without a submit button).  
Using the search input, a search for videos will be performed via the YouTube API.  
All found videos will be displayed as a list.

Perform a search query at the moment when the user stops typing. *(debounce)*

If the previous query hasn't finished and the user starts a new query, the previous query will be aborted *(Abort Controller)*.
