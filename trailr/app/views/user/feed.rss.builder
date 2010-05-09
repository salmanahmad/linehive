xml.instruct! :xml, :version => "1.0"
xml.rss :version => "2.0" do
  xml.channel do
    xml.title "LineHive.com: #{@user.username}"
    xml.description "#{@user.username}'s timelines"
    xml.link url_for :controller => "user", :action => "profile", :username => "#{@user.username}", :only_path =>false

    for trail in @trails
      xml.item do
        xml.title trail.caption
        
        d = ""
        for a in trail.articles do
          d += "<p>#{link_to a.headline, a.url}</p>"
        end
        
        xml.description d
        xml.pubDate trail.created_at.to_s(:rfc822)
        xml.link url_for :controller => "trails", :action => "show", :id => trail.id, :only_path =>false
      end
    end
  end
end
