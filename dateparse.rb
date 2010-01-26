require 'open-uri'
require 'pp'

# Change this for your own URL that you want to test on
url = 'http://www.cnn.com/2010/WORLD/meast/01/25/iraq.explosions/index.html?hpt=T1'


open(url) do |f|
  # meta informatino that you may find interesting...
  pp  f.meta

  # html now contains the html string of the page. You can process it to try to extract the date.
  html = f.read
  
  # Example:
  date_regex = Regexp.new("^(?=\d)(?:(?!(?:1582(?:\.|-|\/)10(?:\.|-|\/)(?:0?[5-9]|1[0-4]))|(?:1752(?:\.|-|\/)0?9(?:\.|-|\/)(?:0?[3-9]|1[0-3])))(?=(?:(?!000[04]|(?:(?:1[^0-6]|[2468][^048]|[3579][^26])00))(?:(?:\d\d)(?:[02468][048]|[13579][26]))\D0?2\D29)|(?:\d{4}\D(?!(?:0?[2469]|11)\D31)(?!0?2(?:\.|-|\/)(?:29|30))))(\d{4})([-\/.])(0?\d|1[012])\2((?!00)[012]?\d|3[01])(?:$|(?=\x20\d)\x20))?((?:(?:0?[1-9]|1[012])(?::[0-5]\d){0,2}(?:\x20[aApP][mM]))|(?:[01]\d|2[0-3])(?::[0-5]\d){1,2})?$");
  
  date = date_regex.match(html)
  
  if(date)
    puts "Success! - #{date}"
  else
    puts "Could not find date expression."
  end
  
  

end
