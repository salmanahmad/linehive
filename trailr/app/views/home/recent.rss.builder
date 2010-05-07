xml.instruct! :xml, :version => "1.0"
xml.rss :version => "2.0" do
  xml.channel do
    xml.title "LineHive.com / Recent Linehives"
    xml.description "Recent Linehive timelines"
    xml.link url_for :controller => "trails", :action => "recent"

    for trail in @trails
      xml.item do
        xml.title trail.caption
        
        d = ""
        for a in trail.articles do
          d += "<p>#{link_to a.headline, a.url}</p>"
        end
        
        xml.description d
        xml.pubDate trail.created_at.to_s(:rfc822)
        xml.link url_for :controller => "trails", :action => "show", :id => trail.id
      end
    end
  end
end
