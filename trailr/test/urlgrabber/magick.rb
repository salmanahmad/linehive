
require 'rubygems'
require 'mojo_magick'
require 'rio'

def resize(url, desiredWidth, desiredHeight)
	# fetch image to "temp" file.
	rio(url).binmode>rio('temp')
	#do a "glob", this step may not be needed. I included this for when we have multiple images.
	Dir::glob('temp').each do |image|
	  begin
		#resize
		MojoMagick::shrink(image, image, {:width => desiredWidth, :height => desiredHeight})
		puts "Shrunk: #{image}"
	  rescue MojoMagick::MojoFailed => e
		STDERR.puts "Unable to shrink image '#{image}' - probably an invalid image\n#{e.message}"
	  rescue MojoMagick::MojoMagickException => e
		STDERR.puts "Unknown exception on image '#{image}'\n#{e.message}"
	  end
	end
end

#puts 'hi'
#resize('http://a1.twimg.com/a/1264119427/images/logo.png', 60,60)